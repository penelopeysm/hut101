import { getProjects } from "@/lib/db";
import Link from "next/link";
import { formatDateAsDaysInPast } from "@/lib/utils";
import DifficultyBadge from "@/components/DifficultyBadge";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.id}`}
            className="block border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors"
        >
            <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <DifficultyBadge difficulty={project.difficulty} />
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                <span>@{project.mentor.githubUsername}</span>
                <span className="text-gray-300">·</span>
                <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-blue-600">
                    {project.repoOwner}/{project.repoName}#{project.issueNumber}
                </span>
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
        </Link>
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
