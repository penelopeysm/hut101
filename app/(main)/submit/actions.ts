"use server";

import { submitProjectAsMentor } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Difficulty } from "@/lib/generated/client";
import { parseGitHubIssueLink } from "@/lib/github";

export type SubmitResult = {
    success: boolean;
    error?: string;
    fields?: {
        title: string;
        description: string;
        githubIssue: string;
        difficulty: string;
        technologies: string[];
    };
};

export async function submitProject(_prev: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = formData.get("difficulty") as string;
    const technologies = formData.getAll("technologies").map(String);

    const fields = { title, description, githubIssue: githubIssueLink, difficulty, technologies };

    const parsed = parseGitHubIssueLink(githubIssueLink);
    if (!parsed) {
        return { success: false, error: "That doesn't look like a GitHub issue link. It should look like https://github.com/owner/repo/issues/123", fields };
    }
    const { repoOwner, repoName, issueNumber } = parsed;

    let project;
    try {
        project = await submitProjectAsMentor(
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty as Difficulty,
            technologies,
        );
    } catch (err) {
        console.error("Error submitting project:", err);
        return { success: false, error: "Something went wrong while submitting. Please try again.", fields };
    }

    redirect(`/projects/${project.id}?new=1`);
}
