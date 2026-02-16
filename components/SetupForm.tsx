"use client";

import { useActionState } from "react";
import { setupAccount, type SetupResult } from "@/app/(setup)/setup/actions";

export default function SetupForm() {
    const [state, formAction, isPending] = useActionState<SetupResult | null, FormData>(setupAccount, null);

    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-md space-y-5">
            {state?.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-md px-4 py-3">
                    {state.error}
                </div>
            )}

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
                    className="w-full border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
            </div>

            <div>
                <label className="flex items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="confirmedOver18"
                        defaultChecked={state?.fields?.confirmedOver18 ?? false}
                        className="mt-0.5 rounded border-gray-300 dark:border-gray-700"
                    />
                    <span>I confirm that I am over 18 years old</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Saving..." : "Continue"}
            </button>
        </form>
    );
}
