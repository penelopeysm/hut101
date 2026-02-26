"use server";

import prisma from "@/lib/prisma";
import { deleteProject } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidEmail } from "@/lib/utils";

export async function deleteProjectAction(projectId: bigint): Promise<{ error?: string }> {
    try {
        await deleteProject(projectId);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        return { error: message };
    }

    redirect("/projects");
}

export async function updateContactEmail(email: string): Promise<{ error?: string }> {
    const session = await auth();
    if (!session) {
        return { error: "Not authenticated" };
    }

    const trimmed = email.trim();
    if (!trimmed) {
        return { error: "Please enter an email address." };
    }
    if (!isValidEmail(trimmed)) {
        return { error: "That doesn't look like a valid email address." };
    }

    try {
        await prisma.user.update({
            where: { id: BigInt(session.user.id) },
            data: { contactEmail: trimmed },
        });
    } catch (err) {
        console.error("Error updating contact email:", err);
        return { error: "Something went wrong. Please try again." };
    }

    revalidatePath(`/users/${session.user.id}`);
    return {};
}
