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
                    className="cursor-pointer text-sm text-accent hover:underline"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm rounded-md px-3 py-2">
                    {error}
                </div>
            )}
            <div className="flex items-baseline gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-border bg-transparent rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
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
                    className="cursor-pointer text-sm bg-accent text-white px-3 py-1.5 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                    {isPending ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={() => { setEditing(false); setEmail(currentEmail); setError(null); }}
                    className="cursor-pointer text-sm text-muted hover:text-foreground"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
