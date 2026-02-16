import { getProject } from "@/lib/db";
import { formatDateAsDaysInPast } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import SuccessBanner from "@/components/SuccessBanner";
import DifficultyBadge from "@/components/DifficultyBadge";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
    const { id } = await params;
    const { new: isNew } = await searchParams;
    let projectId: bigint;
    try {
        projectId = BigInt(id);
    } catch {
        notFound();
    }

    const project = await getProject(projectId);
    if (!project) {
        notFound();
    }

    const issueUrl = `https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`;

    return (
        <div className="max-w-2xl">
            {isNew && <SuccessBanner message="Project submitted successfully!" />}
            <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 inline-block">
                &larr; All projects
            </Link>
            <div className="flex items-baseline justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <DifficultyBadge difficulty={project.difficulty} />
            </div>

            <p className="text-gray-600 mb-6">{project.description}</p>

            <div className="space-y-3 mb-6">
                <div className="flex gap-2 text-sm">
                    <span className="text-gray-500 w-20 shrink-0">Mentor</span>
                    <span>@{project.mentor.githubUsername}</span>
                    {!project.mentorAvailable && (
                        <span className="text-yellow-600 text-xs">(unavailable)</span>
                    )}
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-gray-500 w-20 shrink-0">Student</span>
                    <span>
                        {project.student
                            ? `@${project.student.githubUsername}`
                            : "No one yet — this project is open!"}
                    </span>
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-gray-500 w-20 shrink-0">Issue</span>
                    <Link href={issueUrl} className="text-blue-600 hover:underline">
                        {project.repoOwner}/{project.repoName}#{project.issueNumber}
                    </Link>
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-gray-500 w-20 shrink-0">Created</span>
                    <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                </div>

                {project.completedAt && (
                    <div className="flex gap-2 text-sm">
                        <span className="text-gray-500 w-20 shrink-0">Status</span>
                        <span className="text-green-600 font-medium">
                            Completed {project.completedAt.toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-8">
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

            {project.events.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Activity
                    </h2>
                    <div className="space-y-2">
                        {project.events.map((event) => (
                            <div key={event.id.toString()} className="flex gap-2 text-sm text-gray-600">
                                <span className="text-gray-400 shrink-0">
                                    {event.time.toLocaleDateString()}
                                </span>
                                <span>
                                    @{event.actor.githubUsername} — {event.type.replace(/_/g, " ").toLowerCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
