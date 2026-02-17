/**
 * Parses a GitHub issue URL into its components.
 * Returns null if the URL doesn't match the expected format.
 */
export function parseGitHubIssueLink(url: string): {
    repoOwner: string;
    repoName: string;
    issueNumber: number;
} | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
    if (!match) return null;
    const [, repoOwner, repoName, issueNumberStr] = match;
    return { repoOwner, repoName, issueNumber: parseInt(issueNumberStr) };
}
