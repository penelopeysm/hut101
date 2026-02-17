"use client";

import { useEffect, useCallback } from "react";
import { deleteProjectAction } from "@/app/(main)/my-profile/actions";
import { useConfirmAction } from "@/lib/hooks";

export default function DeleteProjectButton({
    projectId,

    disabled,
    disabledReason,
}: {
    projectId: bigint;

    disabled?: boolean;
    disabledReason?: string;
}) {
    const { confirming, startConfirming, cancelConfirming, confirm, error, isPending } =
        useConfirmAction(() => deleteProjectAction(projectId));
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") cancelConfirming();
    }, [cancelConfirming]);

    useEffect(() => {
        if (!confirming) return;
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [confirming, handleEscape]);

    const baseClass =
        "cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <>
            {error && <span role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</span>}
            <button
                type="button"
                onClick={startConfirming}
                disabled={disabled}
                title={disabled ? disabledReason : undefined}
                className={`${baseClass} bg-rose-600 text-white hover:bg-rose-700`}
            >
                Delete project
            </button>

            {confirming && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={cancelConfirming}
                >
                    <div
                        className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-2">Delete this project?</h3>
                        <p className="text-sm text-muted mb-4">
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={cancelConfirming}
                                className={`${baseClass} border border-border text-muted hover:text-foreground`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                aria-busy={isPending}
                                onClick={confirm}
                                className={`${baseClass} bg-rose-600 text-white hover:bg-rose-700`}
                            >
                                {isPending ? "Deleting..." : "Delete this project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
