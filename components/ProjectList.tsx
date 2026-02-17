"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Difficulty } from "@/lib/generated/enums";
import DifficultyBadge from "@/components/DifficultyBadge";
import TechnologyPicker from "@/components/TechnologyPicker";
import { projectStatus, type ProjectStatus, formatDateAsDaysInPast } from "@/lib/shared-utils";

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
    mentor: { githubUsername: string };
    technologies: { technology: { name: string } }[];
};

type SortOption = "newest" | "oldest" | "difficulty-asc" | "difficulty-desc";

const DIFFICULTY_ORDER: Record<Difficulty, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
const DIFFICULTY_LABELS: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const STATUSES: ProjectStatus[] = ["open", "in_progress", "completed"];
const STATUS_FILTER_LABELS: Record<ProjectStatus, string> = { open: "Open", in_progress: "In progress", completed: "Completed" };

// --- Project Card ---

const STATUS_BADGE = {
    open: "text-emerald-600 dark:text-emerald-400",
    in_progress: "text-amber-600 dark:text-amber-400",
    completed: "text-muted",
} as const;

const STATUS_LABEL = {
    open: "Open",
    in_progress: "In progress",
    completed: "Completed",
} as const;

function ProjectCard({ project }: { project: SerializedProject }) {
    const status = projectStatus(project);

    return (
        <Link
            href={`/projects/${project.id}`}
            className="group block bg-card border border-border rounded-lg p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
                <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">{project.title}</h2>
                <span className={`text-xs font-medium ${STATUS_BADGE[status]}`}>{STATUS_LABEL[status]}</span>
                <DifficultyBadge difficulty={project.difficulty} />
            </div>

            <p className="text-muted mb-4">{project.description}</p>

            <div className="flex flex-wrap items-center gap-5 text-sm text-muted mb-3">
                <span>Mentor: @{project.mentor.githubUsername}</span>
                <span>{formatDateAsDaysInPast(new Date(project.createdAt))}</span>
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
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case "oldest":
                sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
        <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] md:grid-rows-2 md:grid-flow-col gap-x-6 gap-y-3 items-center">
                {/* Status — row 1 col 1 */}
                <div className="flex items-center gap-2 ml-0.5">
                    <span className="text-xs text-muted font-semibold">Status</span>
                    <div className="flex gap-1.5">
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => toggleStatus(s)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${selectedStatuses.includes(s)
                                        ? "bg-accent text-white border-accent"
                                        : "bg-transparent text-muted border-border hover:border-accent/50"
                                    }`}
                            >
                                {STATUS_FILTER_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty — row 2 col 1 */}
                <div className="flex items-center gap-2 ml-0.5">
                    <span className="text-xs text-muted font-semibold">Difficulty</span>
                    <div className="flex gap-1.5">
                        {DIFFICULTIES.map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => toggleDifficulty(d)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${selectedDifficulties.includes(d)
                                        ? "bg-accent text-white border-accent"
                                        : "bg-transparent text-muted border-border hover:border-accent/50"
                                    }`}
                            >
                                {DIFFICULTY_LABELS[d]}
                            </button>
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
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none placeholder:text-muted/50"
                />
            </div>

            {/* Sort */}
            <div className="flex items-center justify-end border-t border-border pt-3">
                <label className="flex items-center gap-2 text-sm text-muted">
                    Sort by
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="border border-border bg-transparent rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none"
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
                <div className="grid gap-4">
                    {filtered.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <p className="text-muted text-center py-8">No projects match your filters.</p>
            )}
        </div>
    );
}
