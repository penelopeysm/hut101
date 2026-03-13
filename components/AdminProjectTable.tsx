"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { verifyProjectAction, rejectProjectAction } from "@/app/(main)/admin/actions";

export interface AdminProject {
    id: string;
    title: string;
    verification: string;
    createdAt: string;
    deletedAt: string | null;
    mentor: { id: string; githubUsername: string };
    student: { id: string; githubUsername: string } | null;
}

type Filter = "all" | "needs_verification" | "deleted";

const filterLabels: Record<Filter, string> = {
    all: "All",
    needs_verification: "Needs verification",
    deleted: "Deleted",
};

function needsVerification(p: AdminProject) {
    return (p.verification === "PENDING" || p.verification === "REJECTED") && !p.deletedAt;
}

function filterProjects(projects: AdminProject[], filter: Filter): AdminProject[] {
    switch (filter) {
        case "needs_verification":
            return projects.filter(needsVerification);
        case "deleted":
            return projects.filter((p) => p.deletedAt !== null);
        default:
            return projects;
    }
}

const badgeBase = "text-xs font-medium px-1.5 py-0.5 rounded";
const badgeColors: Record<string, string> = {
    DELETED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    VERIFIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function VerificationBadge({ status, deletedAt }: { status: string; deletedAt: string | null }) {
    const key = deletedAt ? "DELETED" : status;
    const label = deletedAt ? "Deleted" : status.charAt(0) + status.slice(1).toLowerCase();
    const colors = badgeColors[key];
    if (!colors) return <span className="text-xs text-muted">{status}</span>;
    return <span className={`${badgeBase} ${colors}`}>{label}</span>;
}

export default function AdminProjectTable({ projects }: { projects: AdminProject[] }) {
    const [filter, setFilter] = useState<Filter>("all");
    const [isPending, startTransition] = useTransition();

    const filtered = filterProjects(projects, filter);

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

    const counts: Record<Filter, number> = {
        all: projects.length,
        needs_verification: projects.filter(needsVerification).length,
        deleted: projects.filter((p) => p.deletedAt !== null).length,
    };

    return (
        <div>
            <div className="flex gap-1 mb-4">
                {(Object.keys(filterLabels) as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`cursor-pointer text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                            filter === f
                                ? "bg-accent text-white"
                                : "bg-surface text-muted hover:text-foreground"
                        }`}
                    >
                        {filterLabels[f]}
                        <span className="ml-1.5 opacity-70">{counts[f]}</span>
                    </button>
                ))}
            </div>

            <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-surface text-muted text-left">
                            <th className="px-3 py-2 font-medium">Title</th>
                            <th className="px-3 py-2 font-medium">Mentor</th>
                            <th className="px-3 py-2 font-medium">Student</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Created</th>
                            <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-6 text-center text-muted">
                                    No projects match this filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-surface/50">
                                    <td className="px-3 py-2">
                                        <Link href={`/projects/${p.id}`} className="text-accent hover:underline">
                                            {p.title}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 text-muted">
                                        <Link href={`/users/${p.mentor.id}`} className="hover:text-accent hover:underline">
                                            @{p.mentor.githubUsername}
                                        </Link>
                                    </td>
                                    <td className="px-3 py-2 text-muted">
                                        {p.student ? (
                                            <Link href={`/users/${p.student.id}`} className="hover:text-accent hover:underline">
                                                @{p.student.githubUsername}
                                            </Link>
                                        ) : (
                                            <span className="opacity-40">&mdash;</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <VerificationBadge status={p.verification} deletedAt={p.deletedAt} />
                                    </td>
                                    <td className="px-3 py-2 text-muted whitespace-nowrap">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2">
                                        {needsVerification(p) && (
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleVerify(p.id)}
                                                    disabled={isPending}
                                                    className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                {p.verification === "PENDING" && (
                                                    <button
                                                        onClick={() => handleReject(p.id)}
                                                        disabled={isPending}
                                                        className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
