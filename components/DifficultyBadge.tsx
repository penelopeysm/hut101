import type { Difficulty } from "@/lib/generated/client";

const labels: Record<Difficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
};

const colors: Record<Difficulty, string> = {
    EASY: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    MEDIUM: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
    HARD: "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300",
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
    return (
        <span
            className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 -translate-y-0.5 ${colors[difficulty]}`}
        >
            {labels[difficulty]}
        </span>
    );
}
