import type { Difficulty } from "@/lib/generated/enums";

// Trail-marker difficulty, borrowed from ski runs:
// green circle = easy, blue square = medium, black diamond = hard.
const config: Record<Difficulty, { label: string; colorClass: string; shape: React.ReactNode }> = {
    EASY: {
        label: "Easy",
        colorClass: "text-pine",
        shape: <circle cx="6" cy="6" r="4.5" />,
    },
    MEDIUM: {
        label: "Medium",
        colorClass: "text-[#3a6ea5] dark:text-[#8ab4dd]",
        shape: <rect x="1.8" y="1.8" width="8.4" height="8.4" rx="1" />,
    },
    HARD: {
        label: "Hard",
        colorClass: "text-foreground",
        shape: <path d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z" />,
    },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    const { label, colorClass, shape } = config[difficulty];
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-sm font-medium text-foreground/75 shrink-0"
            title="Difficulty works like ski runs: green circle is the gentlest, black diamond the steepest"
        >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className={colorClass} aria-hidden="true">
                {shape}
            </svg>
            {label}
        </span>
    );
}
