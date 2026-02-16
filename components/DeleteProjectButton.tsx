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
                <span className="text-sm text-gray-600">Are you sure?</span>
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
                    className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                    {isPending ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div>
            {error && <span className="text-sm text-red-600 mr-2">{error}</span>}
            <button
                onClick={() => setConfirming(true)}
                className="text-sm text-red-500 hover:text-red-700"
            >
                Delete
            </button>
        </div>
    );
}
