import { Suspense } from "react";
import { getProjects } from "@/lib/db";
import Link from "next/link";
import { formatDateAsDaysInPast, isProjectOpen } from "@/lib/utils";
import DifficultyBadge from "@/components/DifficultyBadge";
import PageHeading from "@/components/PageHeading";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

function ProjectCard({ project }: { project: Project }) {
    const isOpen = isProjectOpen(project);

    return (
        <Link
            href={`/projects/${project.id}`}
            className="group block bg-card border border-border rounded-lg p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">{project.title}</h2>
                {isOpen ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Open</span>
                ) : project.completedAt ? (
                    <span className="text-xs text-muted font-medium">Completed</span>
                ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">In progress</span>
                )}
                <DifficultyBadge difficulty={project.difficulty} />
            </div>

            <p className="text-muted mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-3">
                <span>@{project.mentor.githubUsername}</span>
                <span className="text-border">·</span>
                <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                <span className="text-border">·</span>
                <span className="text-accent break-all">
                    {project.repoOwner}/{project.repoName}#{project.issueNumber}
                </span>
            </div>

            {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((pt) => (
                        <span
                            key={pt.technology.name}
                            className="bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                        >
                            {pt.technology.name}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}

async function ProjectList() {
    const projects = await getProjects();
    return (
        <div className="grid gap-4 animate-fade-in">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id.toString()}
                    project={project}
                />
            ))}
        </div>
    );
}

export default function Page() {
    return (
        <>
            <PageHeading>Projects</PageHeading>
            <Suspense fallback={<p className="text-muted">Loading projects...</p>}>
                <ProjectList />
            </Suspense>
        </>
    );
}
