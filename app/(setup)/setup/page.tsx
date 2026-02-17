import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SetupForm from "@/components/SetupForm";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    }

    // If they already have a contact email, no need to be here. The presence of
    // a contact email also implies that they have confirmed that they are over
    // 18.
    if (session.user.contactEmail) {
        redirect("/");
    }

    return (
        <div className="py-12">
            <h1 className="font-serif text-3xl mb-2">One more thing</h1>
            <p className="text-muted mb-6 max-w-md leading-relaxed">
                We need a contact email so that we can put you in touch with
                people who sign up for your projects, or who host the projects you sign
                up for.
            </p>

            <p className="text-muted mb-6 max-w-md leading-relaxed">
                This won&rsquo;t be shown publicly — only to the administrators of the programme and to people you&rsquo;re matched with on a project.
            </p>

            <p className="text-muted mb-6 max-w-md leading-relaxed">
                We also need you to confirm that you are above 18 years old.
            </p>

            <SetupForm />
        </div>
    );
}
