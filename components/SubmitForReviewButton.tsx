"use client";

import { useTransition } from "react";
import { submitForReviewAction } from "@/app/(main)/projects/[id]/actions";
import { buttonClass } from "@/lib/styles";

export default function SubmitForReviewButton({ projectId }: { projectId: string }) {
    const [isPending, startTransition] = useTransition();

    function handleSubmit() {
        startTransition(async () => {
            await submitForReviewAction(BigInt(projectId));
        });
    }

    return (
        <button
            onClick={handleSubmit}
            disabled={isPending}
            aria-busy={isPending}
            className={buttonClass}
        >
            {isPending ? "Submitting..." : "Submit for review"}
        </button>
    );
}
