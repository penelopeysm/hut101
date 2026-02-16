"use client";

import { useState, useTransition } from "react";
import { updateContactEmail } from "@/app/(main)/my-profile/actions";

export default function EditContactEmail({ currentEmail }: { currentEmail: string }) {
    const [editing, setEditing] = useState(false);
    const [email, setEmail] = useState(currentEmail);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!editing) {
        return (
            <div className="flex items-baseline gap-2">
                <span className="text-sm text-foreground">{currentEmail}</span>
                <button
                    onClick={() => { setEditing(true); setError(null); }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-md px-3 py-2">
                    {error}
                </div>
            )}
            <div className="flex items-baseline gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 dark:border-gray-700 bg-transparent rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                />
                <button
                    disabled={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            const result = await updateContactEmail(email);
                            if (result.error) {
                                setError(result.error);
                            } else {
                                setEditing(false);
                                setError(null);
                            }
                        });
                    }}
                    className="text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={() => { setEditing(false); setEmail(currentEmail); setError(null); }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
