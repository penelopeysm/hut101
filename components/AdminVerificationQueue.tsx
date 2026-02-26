"use client";

import { useTransition } from "react";
import { verifyProjectAction, rejectProjectAction } from "@/app/(main)/admin/actions";
import DifficultyBadge from "@/components/DifficultyBadge";
import Link from "next/link";

function formatDaysAgo(iso: string) {
    const then = new Date(iso);
    const now = new Date();
    const days = Math.round((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

export interface QueueProject {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    verification: string;
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    createdAt: string;
    mentor: { id: string; githubUsername: string };
    technologies: { technology: { name: string } }[];
    mentorJobRole: string | null;
    mentorTimeCommitment: string | null;
}

function ProjectCard({
    project,
    isPending,
    onVerify,
    onReject,
}: {
    project: QueueProject;
    isPending: boolean;
    onVerify: (id: string) => void;
    onReject?: (id: string) => void;
}) {
    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:text-accent hover:underline transition-colors"
                >
                    {project.title}
                </Link>
                <DifficultyBadge difficulty={project.difficulty as "EASY" | "MEDIUM" | "HARD"} />
            </div>

            <p className="text-sm text-muted mb-3 line-clamp-2">{project.description}</p>

            <div className="text-sm text-muted mb-3 space-y-1">
                <div>
                    Submitted {formatDaysAgo(project.createdAt)} by{" "}
                    <Link href={`/users/${project.mentor.id}`} className="text-accent hover:underline">
                        @{project.mentor.githubUsername}
                    </Link>
                </div>
                <div>
                    Issue:{" "}
                    <Link
                        href={`https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`}
                        className="text-accent hover:underline"
                    >
                        {project.repoOwner}/{project.repoName}#{project.issueNumber}
                    </Link>
                </div>
            </div>

            {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
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

            {(project.mentorJobRole || project.mentorTimeCommitment) && (
                <div className="text-sm mb-3 space-y-2 border-t border-border pt-3">
                    {project.mentorJobRole && (
                        <div>
                            <span className="font-medium">Job role:</span>{" "}
                            <span className="text-muted">{project.mentorJobRole}</span>
                        </div>
                    )}
                    {project.mentorTimeCommitment && (
                        <div>
                            <span className="font-medium">Time commitment:</span>{" "}
                            <span className="text-muted">{project.mentorTimeCommitment}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => onVerify(project.id)}
                    disabled={isPending}
                    className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    Approve
                </button>
                {onReject && (
                    <button
                        onClick={() => onReject(project.id)}
                        disabled={isPending}
                        className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        Reject
                    </button>
                )}
            </div>
        </div>
    );
}

export default function AdminVerificationQueue({ projects }: { projects: QueueProject[] }) {
    const [isPending, startTransition] = useTransition();

    const pending = projects.filter((p) => p.verification === "PENDING");
    const rejected = projects.filter((p) => p.verification === "REJECTED");

    function handleVerify(projectId: string) {
        startTransition(async () => {
            await verifyProjectAction(BigInt(projectId));
        });
    }

    function handleReject(projectId: string) {
        startTransition(async () => {
            await rejectProjectAction(BigInt(projectId));
        });
    }

    if (pending.length === 0 && rejected.length === 0) {
        return <p className="text-muted text-sm">No projects to review.</p>;
    }

    return (
        <div className="space-y-10">
            <section>
                <h2 className="font-serif text-xl mb-4">
                    Pending
                    <span className="text-muted font-sans font-normal ml-2 text-sm">{pending.length}</span>
                </h2>
                {pending.length === 0 ? (
                    <p className="text-muted text-sm">No projects pending verification.</p>
                ) : (
                    <div className="grid gap-4">
                        {pending.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isPending={isPending}
                                onVerify={handleVerify}
                                onReject={handleReject}
                            />
                        ))}
                    </div>
                )}
            </section>

            {rejected.length > 0 && (
                <section>
                    <h2 className="font-serif text-xl mb-4">
                        Previously rejected
                        <span className="text-muted font-sans font-normal ml-2 text-sm">{rejected.length}</span>
                    </h2>
                    <div className="grid gap-4">
                        {rejected.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isPending={isPending}
                                onVerify={handleVerify}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
