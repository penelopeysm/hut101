import SubmitForm from "@/components/SubmitForm";
import PageHeading from "@/components/PageHeading";

export default async function Page() {
    return (
        <>
            <PageHeading>Submit a new project</PageHeading>
            <SubmitForm />
        </>
    );
}
