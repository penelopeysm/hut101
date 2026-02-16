"use client";

import { useState, useTransition } from "react";
import { signUpAction } from "@/app/(main)/projects/[id]/actions";

export default function SignUpButton({ projectId }: { projectId: bigint }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (confirming) {
        return (
            <div className="flex items-baseline gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ready to take this on?</span>
                <button
                    disabled={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            const result = await signUpAction(projectId);
                            if (result.error) {
                                setError(result.error);
                                setConfirming(false);
                            }
                        });
                    }}
                    className="text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {isPending ? "Signing up..." : "Yes, sign me up"}
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
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-md px-4 py-3 mb-3">
                    {error}
                </div>
            )}
            <button
                onClick={() => setConfirming(true)}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
                Sign up for this project
            </button>
        </div>
    );
}
