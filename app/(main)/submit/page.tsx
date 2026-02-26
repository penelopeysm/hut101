import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Submit a Project" };
import { redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import PageHeading from "@/components/PageHeading";
import { getTechnologies } from "@/lib/db";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    }

    const technologies = await getTechnologies();

    return (
        <>
            <PageHeading>Submit a new project</PageHeading>
            <SubmitForm technologies={technologies} isStudent={session.user.role === "STUDENT"} />
        </>
    );
}
