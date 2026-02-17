import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Submit a Project" };
import { redirect } from "next/navigation";
import SubmitForm from "@/components/SubmitForm";
import PageHeading from "@/components/PageHeading";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    }

    return (
        <>
            <PageHeading>Submit a new project</PageHeading>
            <SubmitForm />
        </>
    );
}
