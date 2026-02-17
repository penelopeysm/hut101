import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Re-export pure utilities so existing server-side imports keep working.
export { isProjectOpen, formatDateAsDaysInPast, isValidEmail } from "@/lib/shared-utils";

/**
 * Call this at the top of any page that requires the user to have
 * completed setup (i.e. provided a contact email). If they're logged
 * in but haven't set one, they'll be redirected to /setup.
 */
export async function requireSetup() {
    const session = await auth();
    if (session && !session.user.contactEmail) {
        redirect("/setup");
    }
    return session;
}
