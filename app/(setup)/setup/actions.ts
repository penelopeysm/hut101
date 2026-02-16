"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type SetupResult = {
    success: boolean;
    error?: string;
    fields?: {
        contactEmail: string;
    };
};

export async function setContactEmail(_prev: SetupResult | null, formData: FormData): Promise<SetupResult> {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const contactEmail = (formData.get("contactEmail") as string).trim();
    const fields = { contactEmail };

    if (!contactEmail) {
        return { success: false, error: "Please enter an email address.", fields };
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        return { success: false, error: "That doesn't look like a valid email address.", fields };
    }

    try {
        await prisma.user.update({
            where: { id: BigInt(session.user.id) },
            data: { contactEmail },
        });
    } catch (err) {
        console.error("Error setting contact email:", err);
        return { success: false, error: "Something went wrong. Please try again.", fields };
    }

    redirect("/");
}
