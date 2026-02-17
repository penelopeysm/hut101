"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isValidEmail } from "@/lib/utils";

export type SetupResult = {
    success: boolean;
    error?: string;
    fields?: {
        contactEmail: string;
        confirmedOver18: boolean;
    };
};

export async function setupAccount(_prev: SetupResult | null, formData: FormData): Promise<SetupResult> {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const contactEmail = (formData.get("contactEmail") as string).trim();
    const confirmedOver18 = formData.get("confirmedOver18") === "on";
    const fields = { contactEmail, confirmedOver18 };

    if (!contactEmail) {
        return { success: false, error: "Please enter an email address.", fields };
    }

    if (!isValidEmail(contactEmail)) {
        return { success: false, error: "That doesn't look like a valid email address.", fields };
    }

    if (!confirmedOver18) {
        return { success: false, error: "You must confirm that you are over 18 to use hut101.", fields };
    }

    try {
        await prisma.user.update({
            where: { id: BigInt(session.user.id) },
            data: { contactEmail, confirmedOver18: true },
        });
    } catch (err) {
        console.error("Error during setup:", err);
        return { success: false, error: "Something went wrong. Please try again.", fields };
    }

    redirect("/");
}
