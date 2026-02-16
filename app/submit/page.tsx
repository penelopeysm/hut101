import { submitProjectAsMentor } from "@/lib/db";

async function submitProject(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const githubIssueLink = formData.get("githubIssue") as string;
    const difficulty = parseInt(formData.get("difficulty") as string);

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

export default async function Page() {
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Submit a new project</h1>

            <form action={submitProject} className="max-w-lg space-y-5">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <div>
                    <label htmlFor="githubIssue" className="block text-sm font-medium mb-1">
                        GitHub issue link
                    </label>
                    <input
                        id="githubIssue"
                        name="githubIssue"
                        required
                        placeholder="https://github.com/owner/repo/issues/123"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>

                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                        Difficulty
                    </label>
                    <select
                        id="difficulty"
                        name="difficulty"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                        <option value="">Select difficulty</option>
                        <option value="0">Easy</option>
                        <option value="6">Medium</option>
                        <option value="12">Hard</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Submit project
                </button>
            </form>
        </>
    );
}
