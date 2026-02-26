"use server";

import { verifyProject, rejectProject } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyProjectAction(projectId: bigint) {
    await verifyProject(projectId);
    revalidatePath("/admin");
    revalidatePath("/projects");
}

export async function rejectProjectAction(projectId: bigint) {
    await rejectProject(projectId);
    revalidatePath("/admin");
}
