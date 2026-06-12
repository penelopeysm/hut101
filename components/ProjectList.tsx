"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Difficulty } from "@/lib/generated/enums";
import DifficultyBadge from "@/components/DifficultyBadge";
import HutIcon from "@/components/HutIcon";
import TechnologyPicker from "@/components/TechnologyPicker";
import { projectStatus, type ProjectStatus, formatDateAsDaysInPast } from "@/lib/shared-utils";
import { inputClass, sectionLabelClass } from "@/lib/styles";

type Technology = { id: string; name: string };

type SerializedProject = {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    createdAt: string;
    completedAt: string | null;
    studentId: string | null;
    mentorAvailable: boolean;
    mentor: { id: string; githubUsername: string };
    technologies: { technology: { name: string } }[];
};

type SortOption = "newest" | "oldest" | "difficulty-asc" | "difficulty-desc";

const DIFFICULTY_ORDER: Record<Difficulty, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
const DIFFICULTY_LABELS: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const STATUSES: ProjectStatus[] = ["open", "in_progress", "completed"];
const STATUS_FILTER_LABELS: Record<ProjectStatus, string> = { open: "Open", in_progress: "In progress", completed: "Completed" };

// --- Project Card ---

const STATUS_CONFIG = {
    open: { label: "Open", textClass: "text-pine", dotClass: "bg-pine animate-[pulse_2.5s_ease-in-out_infinite]" },
    in_progress: { label: "In progress", textClass: "text-amber-600 dark:text-amber-400", dotClass: "bg-amber-500" },
    completed: { label: "Completed", textClass: "text-muted", dotClass: "bg-muted" },
} as const;

function StatusChip({ status }: { status: ProjectStatus }) {
    const { label, textClass, dotClass } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${textClass}`}>
            <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
            {label}
        </span>
    );
}

// Multi-select filter chip: the checkmark signals "toggle", not "radio"
function FilterPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer ${selected
                    ? "bg-accent text-white dark:text-background border-accent"
                    : "bg-transparent text-muted border-border hover:border-accent/50"
                }`}
        >
            {/* Always rendered so the pill width doesn't change on toggle */}
            <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-opacity ${selected ? "opacity-100" : "opacity-30"}`}
            >
                <path d="M2 6.5 L4.5 9 L10 3" />
            </svg>
            {label}
        </button>
    );
}

function ProjectCard({ project }: { project: SerializedProject }) {
    const status = projectStatus(project);

    return (
        <article
            className="group bg-card border border-border rounded-xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_14px_30px_-16px_rgba(124,77,33,0.4)]"
        >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
                <h2 className="font-serif text-xl">
                    <Link href={`/projects/${project.id}`} className="group-hover:text-accent transition-colors">
                        {project.title}
                    </Link>
                </h2>
                <StatusChip status={status} />
                <DifficultyBadge difficulty={project.difficulty} />
            </div>

            <p className="text-smd text-muted leading-relaxed mb-5">{project.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dotted border-border pt-3.5 text-sm text-muted">
                <span>
                    with <Link href={`/users/${project.mentor.id}`} className="font-medium text-accent hover:underline transition-colors">@{project.mentor.githubUsername}</Link>
                </span>
                <span className="font-mono text-xs break-all">
                    {project.repoOwner}/{project.repoName}#{project.issueNumber}
                </span>
                {project.technologies.map((pt) => (
                    <span key={pt.technology.name} className="font-mono text-xs">
                        #{pt.technology.name.toLowerCase()}
                    </span>
                ))}
                <span className="ml-auto text-xs">{formatDateAsDaysInPast(new Date(project.createdAt))}</span>
            </div>
        </article>
    );
}

// --- Main ProjectList ---

export default function ProjectList({
    projects,
    technologies,
}: {
    projects: SerializedProject[];
    technologies: Technology[];
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>(["open"]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    const toggleStatus = (s: ProjectStatus) => {
        setSelectedStatuses((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
        );
    };

    const toggleDifficulty = (d: Difficulty) => {
        setSelectedDifficulties((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
        );
    };

    const filtered = useMemo(() => {
        let result = projects;

        // Status filter
        if (selectedStatuses.length > 0) {
            result = result.filter((p) => selectedStatuses.includes(projectStatus(p)));
        }

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q),
            );
        }

        // Difficulty filter
        if (selectedDifficulties.length > 0) {
            result = result.filter((p) => selectedDifficulties.includes(p.difficulty));
        }

        // Technology filter
        if (selectedTechnologies.length > 0) {
            result = result.filter((p) =>
                p.technologies.some((pt) => selectedTechnologies.includes(pt.technology.name)),
            );
        }

        // Sort
        const sorted = [...result];
        switch (sortBy) {
            case "newest":
                sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                break;
            case "oldest":
                sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                break;
            case "difficulty-asc":
                sorted.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
                break;
            case "difficulty-desc":
                sorted.sort((a, b) => DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty]);
                break;
        }

        return sorted;
    }, [projects, searchQuery, selectedStatuses, selectedDifficulties, selectedTechnologies, sortBy]);

    return (
        <div className="animate-fade-in">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] md:grid-rows-2 md:grid-flow-col gap-x-6 gap-y-3 items-center mb-4">
                {/* Status — row 1 col 1 */}
                <div className="flex items-center gap-3 ml-0.5">
                    <span className={sectionLabelClass}>Status</span>
                    <div className="flex gap-1.5">
                        {STATUSES.map((s) => (
                            <FilterPill
                                key={s}
                                label={STATUS_FILTER_LABELS[s]}
                                selected={selectedStatuses.includes(s)}
                                onClick={() => toggleStatus(s)}
                            />
                        ))}
                    </div>
                </div>

                {/* Difficulty — row 2 col 1 */}
                <div className="flex items-center gap-3 ml-0.5">
                    <span className={sectionLabelClass}>Difficulty</span>
                    <div className="flex gap-1.5">
                        {DIFFICULTIES.map((d) => (
                            <FilterPill
                                key={d}
                                label={DIFFICULTY_LABELS[d]}
                                selected={selectedDifficulties.includes(d)}
                                onClick={() => toggleDifficulty(d)}
                            />
                        ))}
                    </div>
                </div>

                {/* Technology — row 1 col 2 */}
                <div className="w-full md:col-start-2">
                    <TechnologyPicker
                        technologies={technologies}
                        selected={selectedTechnologies}
                        onChangeAction={setSelectedTechnologies}
                        placeholder="Filter by technology..."
                    />
                </div>

                {/* Bottom-right: Search */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search project (titles and descriptions)..."
                    className={inputClass}
                />
            </div>

            {/* Sort */}
            <div className="flex items-center justify-end border-t border-border pt-3 mb-8">
                <label className="flex items-center gap-2 text-sm text-muted">
                    Sort by
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="border border-border bg-card/70 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="difficulty-asc">Difficulty: Easy → Hard</option>
                        <option value="difficulty-desc">Difficulty: Hard → Easy</option>
                    </select>
                </label>
            </div>

            {/* Project cards */}
            {filtered.length > 0 ? (
                <div className="grid gap-5">
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-14 text-muted">
                    <HutIcon className="mx-auto mb-3 h-7 w-7 opacity-50" />
                    <p>Nothing out here &mdash; try loosening a filter or two.</p>
                </div>
            )}
        </div>
    );
}
