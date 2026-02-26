"use client";

import { useState, useTransition } from "react";
import { updateContactEmail } from "@/lib/actions";
import ErrorMessage from "@/components/ErrorMessage";

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
            {error && <ErrorMessage message={error} />}
            <div className="flex items-baseline gap-2">
                <input
                    type="email"
                    aria-label="Contact email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-border bg-transparent rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
                <button
                    disabled={isPending}
                    aria-busy={isPending}
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
