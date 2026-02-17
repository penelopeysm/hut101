import { useState, useTransition } from "react";

/**
 * Shared state for the two-step confirmation flow used by SignUpButton,
 * DeleteProjectButton, etc. Manages the confirming/idle toggle, the
 * pending transition, and any error returned by the action.
 */
export function useConfirmAction(action: () => Promise<{ error?: string }>) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const confirm = () => {
        startTransition(async () => {
            const result = await action();
            if (result.error) {
                setError(result.error);
                setConfirming(false);
            }
        });
    };

    return {
        confirming,
        startConfirming: () => setConfirming(true),
        cancelConfirming: () => setConfirming(false),
        confirm,
        error,
        isPending,
    };
}
