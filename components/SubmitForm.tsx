"use client";

import { useActionState, useRef } from "react";
import { submitProject, type SubmitResult } from "@/app/(main)/submit/actions";
import ErrorMessage from "@/components/ErrorMessage";
import TechnologyPicker from "@/components/TechnologyPicker";
import { inputClass, buttonClass } from "@/lib/styles";

type Technology = { id: bigint; name: string };

export default function SubmitForm({ technologies, isMember }: { technologies: Technology[]; isMember: boolean }) {
    const [state, formAction, isPending] = useActionState<SubmitResult | null, FormData>(submitProject, null);
    const intentRef = useRef<HTMLInputElement>(null);

    // key forces React to re-mount the form when state changes,
    // ensuring all defaultValues (especially <select>) are applied
    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-lg space-y-5">
            {state?.error && <ErrorMessage message={state.error} />}
            <input type="hidden" name="intent" ref={intentRef} defaultValue="submit" />

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <p className="text-xs text-muted mb-1.5">
                    A short, descriptive name for the task. This is what students will see when browsing projects.
                </p>
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
                <p className="text-xs text-muted mb-1.5">
                    Explain what the task involves and what a student would need to do.
                    Remember that students may have less context about the project, its tooling, and its codebase than you do.
                </p>
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
                <p className="text-xs text-muted mb-1.5">
                    Link to the issue on the project&rsquo;s repository.
                </p>
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
                <p className="text-xs text-muted mb-1.5">
                    How long would this take you to do yourself?
                </p>
                <select
                    id="difficulty"
                    name="difficulty"
                    required
                    defaultValue={state?.fields?.difficulty ?? ""}
                    className={inputClass}
                >
                    <option value="">Select difficulty</option>
                    <option value="EASY">Easy — ~10 minutes for me</option>
                    <option value="MEDIUM">Medium — under an hour for me</option>
                    <option value="HARD">Hard — a couple of hours for me</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Technologies
                </label>
                <p className="text-xs text-muted mb-1.5">
                    Select the main languages or tools a student would need to use.
                </p>
                <TechnologyPicker
                    technologies={technologies}
                    defaultSelected={state?.fields?.technologies}
                />
            </div>

            {isMember && (
                <>
                    <div>
                        <label htmlFor="mentorJobRole" className="block text-sm font-medium mb-1">
                            What is your current job role?
                        </label>
                        <p className="text-xs text-muted mb-1.5">
                            This helps us verify that you have the background to mentor on this project.
                        </p>
                        <textarea
                            id="mentorJobRole"
                            name="mentorJobRole"
                            required
                            rows={3}
                            defaultValue={state?.fields?.mentorJobRole ?? ""}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="mentorTimeCommitment" className="block text-sm font-medium mb-1">
                            How much time can you commit to mentoring?
                        </label>
                        <p className="text-xs text-muted mb-1.5">
                            We recommend 2&ndash;3 contact hours total: an initial meeting, a check-in before the PR, and a wrap-up discussion.
                        </p>
                        <textarea
                            id="mentorTimeCommitment"
                            name="mentorTimeCommitment"
                            required
                            rows={3}
                            defaultValue={state?.fields?.mentorTimeCommitment ?? ""}
                            className={inputClass}
                        />
                    </div>
                </>
            )}

            {isMember ? (
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={() => { if (intentRef.current) intentRef.current.value = "draft"; }}
                        className="cursor-pointer border border-border text-foreground bg-transparent px-4 py-2 rounded-md text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Saving..." : "Save as draft"}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={() => { if (intentRef.current) intentRef.current.value = "submit"; }}
                        className={buttonClass}
                    >
                        {isPending ? "Submitting..." : "Submit for review"}
                    </button>
                </div>
            ) : (
                <button
                    type="submit"
                    disabled={isPending}
                    aria-busy={isPending}
                    className={buttonClass}
                >
                    {isPending ? "Submitting..." : "Submit project"}
                </button>
            )}
        </form>
    );
}
