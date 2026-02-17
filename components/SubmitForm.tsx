"use client";

import { useActionState } from "react";
import { submitProject, type SubmitResult } from "@/app/(main)/submit/actions";
import ErrorMessage from "@/components/ErrorMessage";
import TechnologyPicker from "@/components/TechnologyPicker";
import { inputClass, buttonClass } from "@/lib/styles";

type Technology = { id: bigint; name: string };

export default function SubmitForm({ technologies }: { technologies: Technology[] }) {
    const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(submitProject, null);

    // key forces React to re-mount the form when state changes,
    // ensuring all defaultValues (especially <select>) are applied
    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-lg space-y-5">
            {state?.error && <ErrorMessage message={state.error} />}

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <input
                    id="title"
                    name="title"
                    required
                    defaultValue={state?.fields?.title ?? ""}
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    defaultValue={state?.fields?.description ?? ""}
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="githubIssue" className="block text-sm font-medium mb-1">
                    GitHub issue link
                </label>
                <input
                    id="githubIssue"
                    name="githubIssue"
                    required
                    defaultValue={state?.fields?.githubIssue ?? ""}
                    placeholder="https://github.com/owner/repo/issues/123"
                    className={`${inputClass} placeholder:text-muted/50`}
                />
            </div>

            <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                    Difficulty
                </label>
                <select
                    id="difficulty"
                    name="difficulty"
                    required
                    defaultValue={state?.fields?.difficulty ?? ""}
                    className={inputClass}
                >
                    <option value="">Select difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Technologies
                </label>
                <TechnologyPicker
                    technologies={technologies}
                    defaultSelected={state?.fields?.technologies}
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className={buttonClass}
            >
                {isPending ? "Submitting..." : "Submit project"}
            </button>
        </form>
    );
}
