"use server";

import { submitProjectAsMentor } from "@/lib/db";
import { redirect } from "next/navigation";

export type SubmitResult = {
    success: boolean;
    error?: string;
    fields?: {
        title: string;
        description: string;
        githubIssue: string;
        difficulty: string;
    };
};

export async function submitProject(_prev: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = formData.get("difficulty") as string;

    const fields = { title, description, githubIssue: githubIssueLink, difficulty };

    const match =
        githubIssueLink.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
    if (!match) {
        return { success: false, error: "That doesn't look like a GitHub issue link. It should look like https://github.com/owner/repo/issues/123", fields };
    }
    const [, repoOwner, repoName, issueNumberStr] = match;
    const issueNumber = parseInt(issueNumberStr);

    try {
        await submitProjectAsMentor(
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            parseInt(difficulty),
        );
    } catch (err) {
        console.error("Error submitting project:", err);
        return { success: false, error: "Something went wrong while submitting. Please try again.", fields };
    }

    redirect("/projects");
}
