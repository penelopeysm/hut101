"use client";

import React, { useState, useTransition } from "react";
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
    return p.verification === "PENDING" && !p.deletedAt;
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
    DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
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
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectComment, setRejectComment] = useState("");

    const filtered = filterProjects(projects, filter);

    function handleVerify(projectId: string) {
        startTransition(async () => {
            await verifyProjectAction(BigInt(projectId));
        });
    }

    function handleRejectStart(projectId: string) {
        setRejectingId(projectId);
        setRejectComment("");
    }

    function handleRejectCancel() {
        setRejectingId(null);
        setRejectComment("");
    }

    function handleRejectConfirm(projectId: string) {
        if (!rejectComment.trim()) return;
        startTransition(async () => {
            await rejectProjectAction(BigInt(projectId), rejectComment);
            setRejectingId(null);
            setRejectComment("");
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
                                <React.Fragment key={p.id}>
                                    <tr className={`border-b border-border last:border-b-0 hover:bg-surface/50 ${rejectingId === p.id ? "border-b-0" : ""}`}>
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
                                            {p.verification === "PENDING" && !p.deletedAt && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleVerify(p.id)}
                                                        disabled={isPending}
                                                        className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectStart(p.id)}
                                                        disabled={isPending || rejectingId === p.id}
                                                        className="cursor-pointer text-xs font-medium px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {rejectingId === p.id && (
                                        <tr className="border-b border-border last:border-b-0">
                                            <td colSpan={6} className="px-3 py-3 bg-surface/50">
                                                <p className="text-sm font-medium mb-2">Feedback for &ldquo;{p.title}&rdquo;</p>
                                                <textarea
                                                    autoFocus
                                                    value={rejectComment}
                                                    onChange={(e) => setRejectComment(e.target.value)}
                                                    placeholder="Explain what changes are needed..."
                                                    rows={3}
                                                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent mb-2"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRejectConfirm(p.id)}
                                                        disabled={isPending || !rejectComment.trim()}
                                                        className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isPending ? "Rejecting..." : "Confirm rejection"}
                                                    </button>
                                                    <button
                                                        onClick={handleRejectCancel}
                                                        disabled={isPending}
                                                        className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded border border-border text-muted hover:text-foreground transition-colors disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
