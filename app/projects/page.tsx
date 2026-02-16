import { getProjects } from "@/lib/db";
import Link from "next/link";
import { formatDateAsDaysInPast } from "@/lib/utils";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

const difficultyLabel = (d: number) =>
    d <= 0 ? "Easy" : d <= 6 ? "Medium" : "Hard";

const difficultyColor = (d: number) =>
    d <= 0
        ? "bg-green-100 text-green-800"
        : d <= 6
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800";

function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <span
                    className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${difficultyColor(project.difficulty)}`}
                >
                    {difficultyLabel(project.difficulty)}
                </span>
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                <span>@{project.mentor.githubUsername}</span>
                <span className="text-gray-300">·</span>
                <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                <span className="text-gray-300">·</span>
                <Link
                    href={`https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`}
                    className="text-blue-600 hover:underline"
                >
                    {project.repoOwner}/{project.repoName}#{project.issueNumber}
                </Link>
            </div>

            {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((pt) => (
                        <span
                            key={pt.technology.name}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
                        >
                            {pt.technology.name}
                        </span>
                    ))}
                </div>
            )}

            {project.completedAt && (
                <p className="text-green-600 text-sm mt-3 font-medium">
                    ✅ Completed {project.completedAt.toLocaleDateString()}
                </p>
            )}
        </div>
    );
}

export default async function Page() {
    const projects = await getProjects();
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Projects</h1>
            <div className="grid gap-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id.toString()}
                        project={project}
                    />
                ))}
            </div>
        </>
    );
}
