import { auth } from "@/lib/auth";
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
