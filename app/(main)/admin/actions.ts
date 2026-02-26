"use server";

import { setProjectVerification } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function verifyProjectAction(projectId: bigint) {
    await setProjectVerification(projectId, "VERIFIED");
    revalidatePath("/admin");
    revalidatePath("/projects");
}

export async function rejectProjectAction(projectId: bigint) {
    await setProjectVerification(projectId, "REJECTED");
    revalidatePath("/admin");
}
