import type { Difficulty } from "@/lib/generated/client";

const labels: Record<Difficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
};

const colors: Record<Difficulty, string> = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
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
