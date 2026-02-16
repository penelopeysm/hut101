import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SetupForm from "@/components/SetupForm";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/api/auth/signin/github");
    }

    // If they already have a contact email, no need to be here
    if (session.user.contactEmail) {
        redirect("/");
    }

    return (
        <div className="py-12">
            <h1 className="text-2xl font-bold mb-2">One more thing</h1>
            <p className="text-gray-600 mb-6 max-w-md">
                We need a contact email so that mentors and students can get in touch
                with each other. This won&rsquo;t be shown publicly — only to people
                you&rsquo;re matched with on a project.
            </p>
            <SetupForm />
        </div>
    );
}
