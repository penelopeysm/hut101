import type { Difficulty } from "@/lib/generated/client";

const labels: Record<Difficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
};

const colors: Record<Difficulty, string> = {
    EASY: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    MEDIUM: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    HARD: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
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
