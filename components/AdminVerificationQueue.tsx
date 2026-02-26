"use client";

import { useTransition } from "react";
import { verifyProjectAction, rejectProjectAction } from "@/app/(main)/admin/actions";
import DifficultyBadge from "@/components/DifficultyBadge";
import Link from "next/link";

export interface QueueProject {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    createdAt: string;
    mentor: { id: string; githubUsername: string };
    technologies: { technology: { name: string } }[];
}

export default function AdminVerificationQueue({ projects }: { projects: QueueProject[] }) {
    const [isPending, startTransition] = useTransition();

    if (projects.length === 0) {
        return <p className="text-muted text-sm">No projects pending verification.</p>;
    }

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

    return (
        <div className="grid gap-4">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-card border border-border rounded-lg p-5"
                >
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
                            Submitted by{" "}
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

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleVerify(project.id)}
                            disabled={isPending}
                            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(project.id)}
                            disabled={isPending}
                            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
