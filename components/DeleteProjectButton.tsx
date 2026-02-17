"use client";

import { useState, useTransition } from "react";
import { deleteProjectAction } from "@/app/(main)/my-profile/actions";

export default function DeleteProjectButton({ projectId }: { projectId: bigint }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (confirming) {
        return (
            <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted">Are you sure?</span>
                <button
                    disabled={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            const result = await deleteProjectAction(projectId);
                            if (result.error) {
                                setError(result.error);
                                setConfirming(false);
                            }
                        });
                    }}
                    className="cursor-pointer text-sm text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium disabled:opacity-50"
                >
                    {isPending ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="cursor-pointer text-sm text-muted hover:text-foreground"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div>
            {error && <span className="text-sm text-rose-600 dark:text-rose-400 mr-2">{error}</span>}
            <button
                onClick={() => setConfirming(true)}
                className="cursor-pointer text-sm text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
            >
                Delete
            </button>
        </div>
    );
}
