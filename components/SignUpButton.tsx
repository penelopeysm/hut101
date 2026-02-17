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
                <span className="text-sm text-muted">Ready to take this on?</span>
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
                    className="cursor-pointer text-sm bg-accent text-white px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                    {isPending ? "Signing up..." : "Yes, sign me up"}
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
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-md px-4 py-3 mb-3">
                    {error}
                </div>
            )}
            <button
                onClick={() => setConfirming(true)}
                className="cursor-pointer bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
            >
                Sign up for this project
            </button>
        </div>
    );
}
