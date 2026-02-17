"use client";

import { useActionState } from "react";
import { setupAccount, type SetupResult } from "@/app/(setup)/setup/actions";
import ErrorMessage from "@/components/ErrorMessage";

export default function SetupForm() {
    const [state, formAction, isPending] = useActionState<SetupResult | null, FormData>(setupAccount, null);

    // key forces React to re-mount the form when state changes,
    // ensuring all defaultValues (especially <select> and checkboxes) are applied
    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-md space-y-5">
            {state?.error && <ErrorMessage message={state.error} />}

            <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">
                    Email address
                </label>
                <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    defaultValue={state?.fields?.contactEmail ?? ""}
                    placeholder="you@example.com"
                    className="w-full border border-border bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent placeholder:text-muted/50"
                />
            </div>

            <div>
                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="confirmedOver18"
                        defaultChecked={state?.fields?.confirmedOver18 ?? false}
                        className="mt-0.5 rounded border-border accent-accent"
                    />
                    <span>I confirm that I am over 18 years old</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer bg-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Saving..." : "Continue"}
            </button>
        </form>
    );
}
