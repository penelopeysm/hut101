import Link from "next/link";

export default async function Home() {
    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold mb-3">Welcome to hut101</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Take your first steps into open source with clearly scoped tasks
                and the support of a mentor.
            </p>
            <div className="flex gap-3">
                <Link
                    href="/projects"
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Browse projects
                </Link>
                <Link
                    href="/submit"
                    className="border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:border-gray-400 transition-colors"
                >
                    Submit a project
                </Link>
            </div>
        </div>
    );
}
