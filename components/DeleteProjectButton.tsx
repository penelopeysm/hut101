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
                <span className="text-sm text-gray-600 dark:text-gray-400">Are you sure?</span>
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
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium disabled:opacity-50"
                >
                    {isPending ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div>
            {error && <span className="text-sm text-red-600 dark:text-red-400 mr-2">{error}</span>}
            <button
                onClick={() => setConfirming(true)}
                className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
                Delete
            </button>
        </div>
    );
}
