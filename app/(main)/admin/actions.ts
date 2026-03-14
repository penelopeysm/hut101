"use server";

import { setProjectVerification } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyProjectAction(projectId: bigint) {
    await setProjectVerification(projectId, "VERIFIED");
    revalidatePath("/admin");
    revalidatePath("/projects");
}

export async function rejectProjectAction(projectId: bigint, comment: string) {
    if (!comment.trim()) {
        throw new Error("Rejection feedback is required");
    }
    await setProjectVerification(projectId, "REJECTED", comment.trim());
    revalidatePath("/admin");
    revalidatePath("/projects");
}
