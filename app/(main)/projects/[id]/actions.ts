"use server";

import { signUpForProject, submitProjectForReview } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function signUpAction(projectId: bigint): Promise<{ error?: string }> {
    try {
        await signUpForProject(projectId);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        return { error: message };
    }

    revalidatePath(`/projects/${projectId}`);
    return {};
}

export async function submitForReviewAction(projectId: bigint) {
    await submitProjectForReview(projectId);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/admin");
}
