import { getProjects } from "@/lib/db";
import Link from "next/link";
import { formatDateAsDaysInPast } from "@/lib/utils";

function formatProject(project: Awaited<ReturnType<typeof getProjects>>[number]) {
    return (
        <div
            key={project.id.toString()}
            className="border rounded p-4 shadow-sm hover:shadow-md transition mb-4"
        >
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-gray-700 mb-4">{project.description}</p>

            <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-2">
                <span>Difficulty: {project.difficulty}</span> •{" "}
                <span>Mentor: @{project.mentor.githubUsername}</span> •{" "}
                <span>Created: {formatDateAsDaysInPast(project.createdAt)}</span> •{" "}
                <span>
                    <Link
                        href={`https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`}
                        className="text-blue-600 hover:underline"
                    >
                        {project.repoOwner}/{project.repoName}#{project.issueNumber}
                    </Link>
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {project.technologies.map((pt) => (
                    <span
                        key={pt.technology.name}
                        className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs"
                    >
                        {pt.technology.name}
                    </span>
                ))}
            </div>

            {project.completedAt && (
                <p className="text-green-600 mt-2">✅ Completed at {project.completedAt.toLocaleDateString()}</p>
            )}
        </div>
    );
}

export default async function Page() {
    const projects = await getProjects();
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Projects</h1>
            <p className="mb-4">One day you&rsquo;ll be able to filter...</p>
            <ul className="list-disc list-inside">
                {projects.map(formatProject)}
            </ul>
        </>
    )
}
