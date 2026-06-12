"use client";

import { signUpAction } from "@/app/(main)/projects/[id]/actions";
import { useConfirmAction } from "@/lib/hooks";
import ErrorMessage from "@/components/ErrorMessage";
import { buttonClass, buttonSmallClass } from "@/lib/styles";

export default function SignUpButton({ projectId, activeCount, maxActive }: { projectId: bigint; activeCount: number; maxActive: number }) {
    const atCap = activeCount >= maxActive;
    const { confirming, startConfirming, cancelConfirming, confirm, error, isPending } =
        useConfirmAction(() => signUpAction(projectId));

    return (
        <div aria-live="polite">
            {confirming ? (
                <div className="flex items-baseline gap-3">
                    <span className="text-sm text-muted">Ready to take this on?</span>
                    <button
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={confirm}
                        className={buttonSmallClass}
                    >
                        {isPending ? "Signing up..." : "Yes, sign me up"}
                    </button>
                    <button
                        onClick={cancelConfirming}
                        className="cursor-pointer text-sm text-muted hover:text-foreground"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-start gap-3">
                    {error && <ErrorMessage message={error} />}
                    <button
                        disabled={atCap}
                        onClick={startConfirming}
                        className={atCap
                            ? "bg-muted/20 text-muted px-5 py-2.5 rounded-full text-sm font-medium cursor-not-allowed"
                            : buttonClass
                        }
                    >
                        Sign up for this project
                    </button>
                    {atCap && (
                        <p className="text-sm text-muted">
                            You can only be signed up for {maxActive} projects at a time
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
