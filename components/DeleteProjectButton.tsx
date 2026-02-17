"use client";

import { deleteProjectAction } from "@/app/(main)/my-profile/actions";
import { useConfirmAction } from "@/lib/hooks";

export default function DeleteProjectButton({ projectId }: { projectId: bigint }) {
    const { confirming, startConfirming, cancelConfirming, confirm, error, isPending } =
        useConfirmAction(() => deleteProjectAction(projectId));

    return (
        <div aria-live="polite">
            {confirming ? (
                <div className="flex items-baseline gap-2">
                    <span className="text-sm text-muted">Are you sure?</span>
                    <button
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={confirm}
                        className="cursor-pointer text-sm text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium disabled:opacity-50"
                    >
                        {isPending ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                        onClick={cancelConfirming}
                        className="cursor-pointer text-sm text-muted hover:text-foreground"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div>
                    {error && <span role="alert" className="text-sm text-rose-600 dark:text-rose-400 mr-2">{error}</span>}
                    <button
                        onClick={startConfirming}
                        className="cursor-pointer text-sm text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
