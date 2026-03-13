# GitHub Issue Preview — Design Spec

**Issue:** #14 — Add GitHub issue preview below the link
**Date:** 2026-03-13

## Summary

Add a preview card for the linked GitHub issue on the project detail page. The card appears as a separate section below the existing info card, showing issue metadata fetched from the GitHub API using the logged-in user's OAuth token.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth strategy | User's GitHub OAuth token | Users already authenticate via GitHub; avoids new env vars; 5k req/hr limit |
| Content level | Standard + last updated | Title, open/closed status, body snippet (~3 lines), labels, author, comment count, last updated |
| Placement | Separate card below info card | Clean separation from project metadata; more prominent |
| Caching | `next: { revalidate: 3600 }` (1 hour) | Issue data rarely changes; minimizes API calls without extra infrastructure |
| Error handling | Graceful fallback (render nothing) | The plain issue link in the info card already works; no need to surface errors |
| Implementation | Server-side fetch in Suspense boundary | Matches existing codebase pattern; simple; page streams in progressively |

## Changes

### 1. Persist OAuth access token on the JWT

**File:** `lib/auth.ts`

In the `jwt` callback, add `account` to the destructured parameters. When `account` is present (sign-in only), store `account.access_token` as `token.accessToken` on the JWT. On subsequent calls (when `account` is `undefined`), the existing token spread already preserves `accessToken` — no additional handling needed.

**Do not** expose the access token on the session object. It is only needed server-side, so keeping it on the encrypted JWT is more secure. The component will read it via `getToken()` from `next-auth/jwt`.

**File:** `types/next-auth.d.ts`

Add `accessToken?: string` to the `JWT` interface only (not to `Session`).

### 2. New component: `GitHubIssuePreview`

**File:** `components/GitHubIssuePreview.tsx`

A server component that contains both the data-fetching function and the presentation.

**`fetchGitHubIssue(owner, repo, issueNumber, accessToken)`**
- Fetches `GET https://api.github.com/repos/{owner}/{repo}/issues/{issueNumber}`
- Sends `Authorization: Bearer {accessToken}` header if token is available; falls back to unauthenticated if not
- Uses `next: { revalidate: 3600 }` for 1-hour caching
- Returns typed object `{ title, state, body, labels, authorLogin, comments, updatedAt }` or `null` on any error
- Strips markdown from body and truncates to ~200 characters for the snippet

**Note on caching:** Next.js caches `fetch` by URL. Since all projects link to public GitHub issues, the response is the same regardless of which user's token makes the request, so shared caching is safe. Private repo issues are out of scope.

**`GitHubIssuePreview` component**
- Props: `owner`, `repo`, `issueNumber`
- Reads the JWT access token internally via `getToken()` (using `cookies()` from `next/headers`)
- Calls `fetchGitHubIssue` internally
- Returns `null` if fetch fails (graceful fallback)
- Renders a card with:
  - Open/closed status icon (green circle for open, purple for closed) + issue title as a link to GitHub
  - Body snippet (plain text, ~3 lines, clamped with CSS)
  - Label pills
  - Footer: "Opened by {author} · {n} comments" on the left, "Updated {relative time}" on the right

**Relative time formatting:** Use `Intl.RelativeTimeFormat` to format `updatedAt` (e.g., "3 hours ago", "2 days ago"). Implement as a small helper within the component file — no need for a shared utility.

**Styling:** Matches existing card style (`bg-card border border-border rounded-lg p-5`). Has a "GitHub Issue" heading in the same style as the "Activity" heading (`text-sm font-semibold text-muted uppercase tracking-wide`).

### 3. Integrate into project detail page

**File:** `app/(main)/projects/[id]/page.tsx`

- Import `GitHubIssuePreview`
- After the existing info card `<div>` (and before the sign-up button), add:
  ```jsx
  <Suspense fallback={null}>
    <GitHubIssuePreview
      owner={project.repoOwner}
      repo={project.repoName}
      issueNumber={project.issueNumber}
    />
  </Suspense>
  ```
- `fallback={null}` so the page doesn't show a loading state — the preview just appears when ready
- The `Suspense` boundary streams the preview independently of the rest of the already-loaded `ProjectDetail` component

## Out of scope

- Showing the preview on the project listing page (cards)
- Rendering full markdown in the body snippet
- Caching issue data in the database
- Private repository issues
- Showing issue preview for unauthenticated users (they can't see projects anyway since setup is required)
