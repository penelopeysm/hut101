import { submitProjectAsMentor } from "@/lib/db";

async function submitProject(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = parseInt(formData.get("difficulty") as string);

    // extract repoOwner, repoName and issueNumber from githubIssueLink
    const match =
        githubIssueLink.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
    if (!match) {
        throw new Error("Invalid GitHub issue link");
    }
    const [, repoOwner, repoName, issueNumberStr] = match;
    const issueNumber = parseInt(issueNumberStr);

    await submitProjectAsMentor(
        title,
        description,
        repoOwner,
        repoName,
        issueNumber,
        difficulty,
    ).catch((err) => {
        console.error("Error submitting project:", err);
        throw err;
    });
}

export default async function Home() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Submit a new project</h1>

            <form action={submitProject} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <input
                        name="title"
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        name="description"
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Original GitHub issue link</label>
                    <input
                        name="githubIssue"
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm
                        font-medium">Difficulty</label>
                    <select
                        name="difficulty"
                        required
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="">Select difficulty</option>
                        <option value="0">Easy</option>
                        <option value="6">Medium</option>
                        <option value="12">Hard</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Submit project
                </button>
            </form>
        </>
    );
}
