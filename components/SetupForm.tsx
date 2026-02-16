"use client";

import { useActionState } from "react";
import { setContactEmail, type SetupResult } from "@/app/setup/actions";

export default function SetupForm() {
    const [state, formAction, isPending] = useActionState<SetupResult | null, FormData>(setContactEmail, null);

    const formKey = state?.error ? JSON.stringify(state.fields) : "initial";

    return (
        <form key={formKey} action={formAction} className="max-w-md space-y-5">
            {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? "Saving..." : "Continue"}
            </button>
        </form>
    );
}
