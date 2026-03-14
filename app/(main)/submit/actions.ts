"use server";

import { submitProject as submitProjectDb } from "@/lib/db";
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
        mentorJobRole: string;
        mentorTimeCommitment: string;
    };
};

export async function submitProject(_prev: SubmitResult | null, formData: FormData): Promise<SubmitResult> {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = formData.get("difficulty") as string;
    const technologies = formData.getAll("technologies").map(String);
    const mentorJobRole = (formData.get("mentorJobRole") as string) ?? "";
    const mentorTimeCommitment = (formData.get("mentorTimeCommitment") as string) ?? "";
    const intent = formData.get("intent") as string;

    const fields = { title, description, githubIssue: githubIssueLink, difficulty, technologies, mentorJobRole, mentorTimeCommitment };

    const parsed = parseGitHubIssueLink(githubIssueLink);
    if (!parsed) {
        return { success: false, error: "That doesn't look like a GitHub issue link. It should look like https://github.com/owner/repo/issues/123", fields };
    }
    const { repoOwner, repoName, issueNumber } = parsed;

    let result;
    try {
        result = await submitProjectDb(
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty as Difficulty,
            technologies,
            mentorJobRole || null,
            mentorTimeCommitment || null,
            intent === "submit",
        );
    } catch (err) {
        console.error("Error submitting project:", err);
        return { success: false, error: "Something went wrong while submitting. Please try again.", fields };
    }

    if (result.autoVerified) {
        redirect(`/projects/${result.project.id}?new=1`);
    } else if (result.isDraft) {
        redirect(`/projects/${result.project.id}?draft=1`);
    } else {
        redirect(`/projects/${result.project.id}?pending=1`);
    }
}
