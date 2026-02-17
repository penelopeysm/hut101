"use client";

import { useState } from "react";

export default function SuccessBanner({ message }: { message: string }) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm rounded-md px-4 py-3 mb-6 flex justify-between items-center">
            <span>{message}</span>
            <button
                onClick={() => setVisible(false)}
                className="cursor-pointer text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 ml-4 text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
