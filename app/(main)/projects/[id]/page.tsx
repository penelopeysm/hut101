import type { Metadata } from "next";
import { Suspense } from "react";
import { getProject, getActiveStudentProjectCount, MAX_ACTIVE_STUDENT_PROJECTS } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const project = await getProject(BigInt(id));
        return { title: project?.title ?? "Project" };
    } catch {
        return { title: "Project" };
    }
}
import { formatDateAsDaysInPast, projectStatus } from "@/lib/utils";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import SuccessBanner from "@/components/SuccessBanner";
import DifficultyBadge from "@/components/DifficultyBadge";
import SignUpButton from "@/components/SignUpButton";
import GitHubIssuePreview from "@/components/GitHubIssuePreview";

async function ProjectDetail({ projectId, isNew, isPending }: { projectId: bigint; isNew: boolean; isPending: boolean }) {
    const project = await getProject(projectId);
    if (!project) {
        notFound();
    }

    const session = await auth();
    const userId = session ? BigInt(session.user.id) : null;
    const isAdmin = session?.user.role === "ADMIN";
    const isCreator = userId !== null && userId === project.mentorId;

    // Visibility gate: unverified projects are only visible to creator and admins
    if (project.verification !== "VERIFIED" && !isCreator && !isAdmin) {
        notFound();
    }

    const status = projectStatus(project);
    const canSignUp = status === "open" && userId !== null && userId !== project.mentorId && project.verification === "VERIFIED";

    const issueUrl = `https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`;

    return (
        <div className="animate-fade-in">
            {isNew && <SuccessBanner message="Project submitted successfully!" />}
            {isPending && <SuccessBanner message="Project submitted! It will appear on the public list once an admin approves it." />}
            {project.verification === "PENDING" && isCreator && !isPending && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm rounded-md px-4 py-3 mb-6">
                    This project is pending admin verification and is not yet visible to others.
                </div>
            )}
            {project.verification === "REJECTED" && isCreator && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm rounded-md px-4 py-3 mb-6">
                    This project was not approved by an admin and is not visible to others.
                </div>
            )}
            <div className="flex items-baseline justify-between gap-4 mb-4">
                <h1 className="font-serif text-3xl">{project.title}</h1>
                {((isCreator && session?.user.role === "TRUSTED") || (isCreator && project.verification !== "VERIFIED") || isAdmin) && (
                    <Link
                        href={`/projects/${project.id}/edit`}
                        className="text-sm text-accent hover:text-accent-hover transition-colors"
                    >
                        Edit
                    </Link>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <DifficultyBadge difficulty={project.difficulty} />
                {project.technologies.map((pt) => (
                    <span
                        key={pt.technology.name}
                        className="bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                    >
                        {pt.technology.name}
                    </span>
                ))}
            </div>

            <p className="text-muted mb-6 leading-relaxed">{project.description}</p>

            <div className="bg-card border border-border rounded-lg p-5 space-y-3 mb-6">
                <div className="flex gap-2 text-sm">
                    <span className="text-muted w-20 shrink-0">Mentor</span>
                    <span>
                        <Link href={`/users/${project.mentor.id}`} className="text-accent hover:underline transition-colors">@{project.mentor.githubUsername}</Link>
                    </span>
                    {!project.mentorAvailable && (
                        <span className="text-amber-600 dark:text-amber-400 text-xs">(currently unavailable)</span>
                    )}
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-muted w-20 shrink-0">Student</span>
                    <span>
                        {project.student === null
                            ? "No one yet — this project is open!"
                            : <><Link href={`/users/${project.student.id}`} className="text-accent hover:underline transition-colors">@{project.student.githubUsername}</Link>{session && project.student.id === userId ? " (that's you!)" : ""}</>
                        }
                    </span>
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-muted w-20 shrink-0">Issue</span>
                    <Link href={issueUrl} className="text-accent hover:underline">
                        {project.repoOwner}/{project.repoName}#{project.issueNumber}
                    </Link>
                </div>

                <div className="flex gap-2 text-sm">
                    <span className="text-muted w-20 shrink-0">Created</span>
                    <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                </div>

                {project.completedAt && (
                    <div className="flex gap-2 text-sm">
                        <span className="text-muted w-20 shrink-0">Status</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Completed {project.completedAt.toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            <Suspense fallback={null}>
                <GitHubIssuePreview
                    owner={project.repoOwner}
                    repo={project.repoName}
                    issueNumber={project.issueNumber}
                />
            </Suspense>

            {canSignUp && (
                <div className="mb-8">
                    <SignUpButton
                        projectId={project.id}
                        activeCount={await getActiveStudentProjectCount(userId!)}
                        maxActive={MAX_ACTIVE_STUDENT_PROJECTS}
                    />
                </div>
            )}

            {project.events.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
                        Activity
                    </h2>
                    <div className="space-y-2">
                        {project.events.map((event) => (
                            <div key={event.id.toString()} className="flex gap-2 text-sm text-muted">
                                <span className="shrink-0">
                                    {event.time.toLocaleDateString()}
                                </span>
                                <span>
                                    <Link href={`/users/${event.actor.id}`} className="text-accent hover:underline transition-colors">@{event.actor.githubUsername}</Link> — {event.type.replace(/_/g, " ").toLowerCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string; pending?: string }> }) {
    const { id } = await params;
    let projectId: bigint;
    try {
        projectId = BigInt(id);
    } catch {
        notFound();
    }

    const { new: isNew, pending } = await searchParams;

    return (
        <div className="max-w-2xl">
            <Link href="/projects" className="text-sm text-muted hover:text-foreground transition-colors mb-4 inline-block">
                &larr; All projects
            </Link>
            <Suspense fallback={<p role="status" className="text-muted">Loading project...</p>}>
                <ProjectDetail projectId={projectId} isNew={!!isNew} isPending={!!pending} />
            </Suspense>
        </div>
    );
}
