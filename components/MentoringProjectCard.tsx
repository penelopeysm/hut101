import Link from "next/link";
import DifficultyBadge from "@/components/DifficultyBadge";
import { formatDateAsDaysInPast } from "@/lib/utils";
import type { Difficulty, VerificationStatus } from "@/lib/generated/enums";

interface MentoringProjectCardProps {
    project: {
        id: bigint;
        title: string;
        difficulty: Difficulty;
        verification: VerificationStatus;
        createdAt: Date;
        completedAt: Date | null;
        student: { id: bigint; githubUsername: string } | null;
        technologies: { technology: { name: string } }[];
    };
    showEditControls: boolean;
    canEdit: boolean;
}

export default function MentoringProjectCard({ project, showEditControls, canEdit }: MentoringProjectCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-4">
            {showEditControls && project.verification === "PENDING" && (
                <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium px-1 py-0.5 rounded inline-block mb-2">Pending verification</span>
            )}
            {showEditControls && project.verification === "REJECTED" && (
                <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium px-2 py-0.5 rounded inline-block mb-1">Rejected</span>
            )}
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:text-accent hover:underline transition-colors"
                >
                    {project.title}
                </Link>
                <DifficultyBadge difficulty={project.difficulty} />
                {canEdit && (
                    <Link
                        href={`/projects/${project.id}/edit`}
                        className="ml-auto text-sm text-accent hover:underline"
                    >
                        Edit
                    </Link>
                )}
            </div>
            <div className="text-sm text-muted flex flex-wrap gap-2">
                <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                {project.student ? (
                    <span>· Student: <Link href={`/users/${project.student.id}`} className="text-accent hover:underline transition-colors">@{project.student.githubUsername}</Link></span>
                ) : (
                    <span>· No student yet</span>
                )}
                {project.completedAt && (
                    <span className="text-emerald-600 dark:text-emerald-400">· Completed</span>
                )}
            </div>
            {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
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
        </div>
    );
}
