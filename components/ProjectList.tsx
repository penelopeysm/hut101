"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Difficulty } from "@/lib/generated/enums";
import DifficultyBadge from "@/components/DifficultyBadge";

function isProjectOpen(project: { studentId: string | null; completedAt: string | null; mentorAvailable: boolean }): boolean {
    return !project.studentId && !project.completedAt && project.mentorAvailable;
}

function formatDateAsDaysInPast(date: Date) {
    const now = new Date();
    const lastSeenDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (lastSeenDay > nowDay) {
        return "in the future (timey wimey stuff going on here...)";
    } else if (lastSeenDay.getTime() === nowDay.getTime()) {
        return "today";
    } else {
        const daysAgo = Math.round((nowDay.getTime() - lastSeenDay.getTime()) / (1000 * 60 * 60 * 24));
        return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    }
}

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

// --- Technology Filter Picker (inline, adapted from TechnologyPicker) ---

function TechnologyFilter({
    technologies,
    selected,
    onAdd,
    onRemove,
}: {
    technologies: Technology[];
    selected: string[];
    onAdd: (name: string) => void;
    onRemove: (name: string) => void;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const available = technologies.filter(
        (t) =>
            !selected.includes(t.name) &&
            t.name.toLowerCase().includes(query.toLowerCase()),
    );

    const add = useCallback(
        (name: string) => {
            onAdd(name);
            setQuery("");
            setActiveIndex(-1);
            inputRef.current?.focus();
        },
        [onAdd],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Backspace" && query === "" && selected.length > 0) {
                onRemove(selected[selected.length - 1]);
                return;
            }
            if (e.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
                return;
            }
            if (!open || available.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % available.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i <= 0 ? available.length - 1 : i - 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < available.length) {
                    add(available[activeIndex].name);
                }
            }
        },
        [query, selected, open, available, activeIndex, add, onRemove],
    );

    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setActiveIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const activeId = activeIndex >= 0 ? `filter-tech-option-${activeIndex}` : undefined;

    return (
        <div ref={containerRef} className="relative">
            <div
                className="flex flex-wrap gap-1.5 w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {selected.map((name) => (
                    <span
                        key={name}
                        className="inline-flex items-center gap-1 bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                    >
                        {name}
                        <button
                            type="button"
                            onClick={() => onRemove(name)}
                            className="cursor-pointer hover:text-foreground"
                            aria-label={`Remove ${name}`}
                        >
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? "Filter by technology..." : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-0.5 placeholder:text-muted/50"
                    role="combobox"
                    aria-expanded={open && available.length > 0}
                    aria-controls="filter-tech-listbox"
                    aria-activedescendant={activeId}
                    autoComplete="off"
                />
            </div>

            {open && available.length > 0 && (
                <ul
                    ref={listRef}
                    id="filter-tech-listbox"
                    role="listbox"
                    className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-card shadow-md"
                >
                    {available.map((t, i) => (
                        <li
                            key={t.name}
                            id={`filter-tech-option-${i}`}
                            role="option"
                            aria-selected={i === activeIndex}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                add(t.name);
                            }}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={`cursor-pointer px-3 py-2 text-sm ${
                                i === activeIndex
                                    ? "bg-surface text-foreground"
                                    : "text-muted hover:bg-surface"
                            }`}
                        >
                            {t.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// --- Project Card ---

function ProjectCard({ project }: { project: SerializedProject }) {
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

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-3">
                <span>@{project.mentor.githubUsername}</span>
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
    const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    const toggleDifficulty = (d: Difficulty) => {
        setSelectedDifficulties((prev) =>
            prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
        );
    };

    const filtered = useMemo(() => {
        let result = projects;

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
    }, [projects, searchQuery, selectedDifficulties, selectedTechnologies, sortBy]);

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Filters */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="flex-1 min-w-[200px] border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent outline-none placeholder:text-muted/50"
                    />

                    {/* Difficulty toggles */}
                    <div className="flex gap-1.5">
                        {DIFFICULTIES.map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => toggleDifficulty(d)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    selectedDifficulties.includes(d)
                                        ? "bg-accent text-white border-accent"
                                        : "bg-transparent text-muted border-border hover:border-accent/50"
                                }`}
                            >
                                {DIFFICULTY_LABELS[d]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Technology filter */}
                <TechnologyFilter
                    technologies={technologies}
                    selected={selectedTechnologies}
                    onAdd={(name) => setSelectedTechnologies((prev) => [...prev, name])}
                    onRemove={(name) => setSelectedTechnologies((prev) => prev.filter((n) => n !== name))}
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
