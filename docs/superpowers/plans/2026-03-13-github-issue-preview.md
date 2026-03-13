# GitHub Issue Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a GitHub issue preview card on the project detail page, fetched from the GitHub API using the logged-in user's OAuth token.

**Architecture:** Server-side fetch in a Suspense boundary. The user's GitHub OAuth access token is persisted on the NextAuth JWT (not the session). A new server component fetches issue data from the GitHub REST API with 1-hour caching, and renders a preview card below the existing project info card. On any error, the preview silently doesn't render.

**Tech Stack:** Next.js 16 App Router, React 19, NextAuth v4, GitHub REST API, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-13-github-issue-preview-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `types/next-auth.d.ts` | Add `accessToken` to JWT type |
| Modify | `lib/auth.ts` | Persist `account.access_token` on JWT in `jwt` callback |
| Create | `components/GitHubIssuePreview.tsx` | Fetch GitHub issue data + render preview card |
| Modify | `app/(main)/projects/[id]/page.tsx` | Add `<Suspense>`-wrapped preview below info card |

---

## Chunk 1: Auth + Component + Integration

### Task 1: Add `accessToken` to the NextAuth JWT type

**Files:**
- Modify: `types/next-auth.d.ts:29-36`

- [ ] **Step 1: Add `accessToken` to the JWT interface**

In `types/next-auth.d.ts`, add `accessToken?: string` to the existing JWT interface:

```typescript
declare module "next-auth/jwt" {
    interface JWT {
        id: number,
        githubUsername: string,
        contactEmail: string | null,
        role: string,
        accessToken?: string,
    }
}
```

- [ ] **Step 2: Verify the build still passes**

Run: `pnpm build`
Expected: Build succeeds (type-only change, no runtime effect yet)

- [ ] **Step 3: Commit**

```bash
git add types/next-auth.d.ts
git commit -m "Add accessToken to NextAuth JWT type for GitHub API access"
```

---

### Task 2: Persist the GitHub OAuth access token on the JWT

**Files:**
- Modify: `lib/auth.ts:22-66`

- [ ] **Step 1: Add `account` to the `jwt` callback parameters and store the token**

In `lib/auth.ts`, change line 22 from:

```typescript
async jwt({ token, user, profile }) {
```

to:

```typescript
async jwt({ token, user, profile, account }) {
```

Then inside the `if (user && profile)` branch, after the `prisma.user.upsert` call, add `accessToken` to the new token object. Change the `newToken` construction (lines 44-50) from:

```typescript
const newToken: JWT = {
    ...token,
    id: Number(prismaUser.id),
    githubUsername: prismaUser.githubUsername,
    contactEmail: prismaUser.contactEmail,
    role: prismaUser.role,
};
```

to:

```typescript
const newToken: JWT = {
    ...token,
    id: Number(prismaUser.id),
    githubUsername: prismaUser.githubUsername,
    contactEmail: prismaUser.contactEmail,
    role: prismaUser.role,
    accessToken: account?.access_token ?? token.accessToken,
};
```

The `else` branch (lines 61-65) already uses `...token` spread, which preserves `accessToken` across refreshes. No change needed there.

- [ ] **Step 2: Verify the build still passes**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "Persist GitHub OAuth access token on JWT for API access"
```

---

### Task 3: Create the `GitHubIssuePreview` component

**Files:**
- Create: `components/GitHubIssuePreview.tsx`

- [ ] **Step 1: Create the component file with fetch function and rendering**

Create `components/GitHubIssuePreview.tsx` with the following content:

```tsx
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import Link from "next/link";

// --- Types ---

interface GitHubLabel {
    name: string;
    color: string;
}

interface GitHubIssueData {
    title: string;
    state: "open" | "closed";
    body: string;
    labels: GitHubLabel[];
    authorLogin: string;
    comments: number;
    updatedAt: string;
}

// --- Data fetching ---

async function getAccessToken(): Promise<string | undefined> {
    const token = await getToken({
        req: {
            headers: await headers(),
            cookies: await cookies(),
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
    });
    return token?.accessToken ?? undefined;
}

function stripMarkdown(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, "")     // code blocks
        .replace(/`[^`]*`/g, "")             // inline code
        .replace(/!\[.*?\]\(.*?\)/g, "")     // images
        .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links → text
        .replace(/#{1,6}\s+/g, "")           // headings
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // bold/italic
        .replace(/>\s+/g, "")                // blockquotes
        .replace(/[-*+]\s+/g, "")            // list markers
        .replace(/\n{2,}/g, " ")             // collapse newlines
        .replace(/\n/g, " ")
        .trim();
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "…";
}

function formatRelativeTime(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffSeconds = Math.floor((now - then) / 1000);

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ["year", 60 * 60 * 24 * 365],
        ["month", 60 * 60 * 24 * 30],
        ["day", 60 * 60 * 24],
        ["hour", 60 * 60],
        ["minute", 60],
    ];

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    for (const [unit, seconds] of units) {
        const value = Math.floor(diffSeconds / seconds);
        if (value >= 1) return rtf.format(-value, unit);
    }

    return "just now";
}

async function fetchGitHubIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    accessToken?: string,
): Promise<GitHubIssueData | null> {
    try {
        const fetchHeaders: Record<string, string> = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "hut101",
        };
        if (accessToken) {
            fetchHeaders["Authorization"] = `Bearer ${accessToken}`;
        }

        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
            {
                headers: fetchHeaders,
                next: { revalidate: 3600 },
            },
        );

        if (!res.ok) return null;

        const data = await res.json();

        return {
            title: data.title,
            state: data.state,
            body: truncate(stripMarkdown(data.body ?? ""), 200),
            labels: (data.labels ?? []).map((l: any) => ({
                name: l.name,
                color: l.color,
            })),
            authorLogin: data.user?.login ?? "unknown",
            comments: data.comments ?? 0,
            updatedAt: data.updated_at,
        };
    } catch {
        return null;
    }
}

// --- Component ---

function StatusIcon({ state }: { state: "open" | "closed" }) {
    if (state === "open") {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" fill="none" stroke="#3fb950" strokeWidth="1.5" />
                <circle cx="8" cy="8" r="3" fill="#3fb950" />
            </svg>
        );
    }
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" fill="none" stroke="#a371f7" strokeWidth="1.5" />
            <path d="M5.5 8l2 2 3-3" stroke="#a371f7" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LabelPill({ name, color }: GitHubLabel) {
    const bg = `#${color}20`;
    const border = `#${color}40`;
    const text = `#${color}`;
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs font-medium border"
            style={{ backgroundColor: bg, borderColor: border, color: text }}
        >
            {name}
        </span>
    );
}

export default async function GitHubIssuePreview({
    owner,
    repo,
    issueNumber,
}: {
    owner: string;
    repo: string;
    issueNumber: number;
}) {
    const accessToken = await getAccessToken();
    const issue = await fetchGitHubIssue(owner, repo, issueNumber, accessToken);

    if (!issue) return null;

    const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;

    return (
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                GitHub Issue
            </h2>
            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-start gap-2 mb-2">
                    <StatusIcon state={issue.state} />
                    <Link
                        href={issueUrl}
                        className="text-sm font-semibold hover:text-accent transition-colors"
                    >
                        {issue.title}
                    </Link>
                </div>

                {issue.body && (
                    <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-3">
                        {issue.body}
                    </p>
                )}

                {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {issue.labels.map((label) => (
                            <LabelPill key={label.name} {...label} />
                        ))}
                    </div>
                )}

                <div className="flex justify-between text-xs text-muted">
                    <span>
                        Opened by {issue.authorLogin} · {issue.comments} comment{issue.comments !== 1 ? "s" : ""}
                    </span>
                    <span>Updated {formatRelativeTime(issue.updatedAt)}</span>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify the build passes**

Run: `pnpm build`
Expected: Build succeeds (component exists but isn't used yet)

- [ ] **Step 3: Commit**

```bash
git add components/GitHubIssuePreview.tsx
git commit -m "Add GitHubIssuePreview server component with GitHub API fetch"
```

---

### Task 4: Integrate the preview into the project detail page

**Files:**
- Modify: `app/(main)/projects/[id]/page.tsx:1-3,82-123`

- [ ] **Step 1: Import the component**

In `app/(main)/projects/[id]/page.tsx`, add the import after the existing component imports (after line 20):

```typescript
import GitHubIssuePreview from "@/components/GitHubIssuePreview";
```

- [ ] **Step 2: Add the Suspense-wrapped preview below the info card**

After the closing `</div>` of the info card (line 123, the `mb-6` div) and before the `{canSignUp && (` block (line 125), insert:

```tsx
            <Suspense fallback={null}>
                <GitHubIssuePreview
                    owner={project.repoOwner}
                    repo={project.repoName}
                    issueNumber={project.issueNumber}
                />
            </Suspense>
```

Note: `Suspense` is already imported on line 2.

- [ ] **Step 3: Verify the build passes**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`
Navigate to any project detail page. Verify:
1. The GitHub Issue preview card appears below the info card
2. It shows the issue title, status icon, body snippet, labels, author, comment count, and "Updated X ago"
3. The card matches the existing visual style (warm tones, same card styling)
4. If the issue doesn't exist or API fails, the card simply doesn't render

- [ ] **Step 5: Lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add app/(main)/projects/[id]/page.tsx
git commit -m "Integrate GitHub issue preview into project detail page

Closes #14"
```
