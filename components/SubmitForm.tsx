"use client";

import { useActionState } from "react";
import { submitProject, type SubmitResult } from "@/app/(main)/submit/actions";
import ErrorMessage from "@/components/ErrorMessage";

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
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent placeholder:text-muted/50"
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
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                >
                    <option value="">Select difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
            </div>

            <fieldset>
                <legend className="block text-sm font-medium mb-2">
                    Technologies
                </legend>
                <div className="flex flex-wrap gap-3">
                    {technologies.map((t) => (
                        <label key={t.name} className="flex items-center gap-1.5 text-sm">
                            <input
                                type="checkbox"
                                name="technologies"
                                value={t.name}
                                defaultChecked={state?.fields?.technologies?.includes(t.name)}
                                className="accent-accent"
                            />
                            {t.name}
                        </label>
                    ))}
                </div>
            </fieldset>

            <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className="cursor-pointer bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Submitting..." : "Submit project"}
            </button>
        </form>
    );
}
