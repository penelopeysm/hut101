"use client";

import { useActionState } from "react";
import { submitProject, type SubmitResult } from "@/app/(main)/submit/actions";

export default function SubmitForm() {
    const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(submitProject, null);

    // key forces React to re-mount the form when state changes,
    // ensuring all defaultValues (especially <select>) are applied
    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-lg space-y-5">
            {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <input
                    id="title"
                    name="title"
                    required
                    defaultValue={state?.fields?.title ?? ""}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                    <option value="">Select difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Submitting..." : "Submit project"}
            </button>
        </form>
    );
}
