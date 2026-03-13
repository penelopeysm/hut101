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
        } as unknown as Parameters<typeof getToken>[0]["req"],
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
            labels: (data.labels ?? []).map((l: { name: string; color: string }) => ({
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
