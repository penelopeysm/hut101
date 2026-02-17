"use client";

import { useActionState } from "react";
import { updateProjectAction, type UpdateResult } from "@/app/(main)/projects/[id]/edit/actions";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import TechnologyPicker from "@/components/TechnologyPicker";
import { inputClass, buttonClass } from "@/lib/styles";

type Technology = { id: bigint; name: string };

type ProjectData = {
    id: bigint;
    title: string;
    description: string;
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    difficulty: string;
    technologies: string[];
};

export default function EditProjectForm({
    project,
    technologies,
}: {
    project: ProjectData;
    technologies: Technology[];
}) {
    const [state, formAction, isPending] = useActionState<UpdateResult | null, FormData>(updateProjectAction, null);

    const issueUrl = `https://github.com/${project.repoOwner}/${project.repoName}/issues/${project.issueNumber}`;

    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-lg space-y-5">
            <input type="hidden" name="projectId" value={project.id.toString()} />

            {state?.error && <ErrorMessage message={state.error} />}

            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <input
                    id="title"
                    name="title"
                    required
                    defaultValue={state?.fields?.title ?? project.title}
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
                    defaultValue={state?.fields?.description ?? project.description}
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
                    defaultValue={state?.fields?.githubIssue ?? issueUrl}
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
                    defaultValue={state?.fields?.difficulty ?? project.difficulty}
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
                    defaultSelected={state?.fields?.technologies ?? project.technologies}
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isPending}
                    aria-busy={isPending}
                    className={buttonClass}
                >
                    {isPending ? "Saving..." : "Save changes"}
                </button>
                <Link
                    href={`/projects/${project.id}`}
                    className="px-4 py-2 rounded-md text-sm font-medium border border-border text-muted hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
