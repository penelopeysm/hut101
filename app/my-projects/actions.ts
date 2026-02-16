"use server";

import { deleteProject } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteProjectAction(projectId: bigint): Promise<{ error?: string }> {
    try {
        await deleteProject(projectId);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        return { error: message };
    }

    revalidatePath("/my-projects");
    return {};
}
