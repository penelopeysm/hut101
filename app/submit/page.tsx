import SubmitForm from "@/components/SubmitForm";
import { requireSetup } from "@/lib/utils";

export default async function Page() {
    await requireSetup();
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Submit a new project</h1>
            <SubmitForm />
        </>
    );
}
