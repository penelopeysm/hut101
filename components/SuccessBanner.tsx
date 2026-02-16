"use client";

import { useState } from "react";

export default function SuccessBanner({ message }: { message: string }) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm rounded-md px-4 py-3 mb-6 flex justify-between items-center">
            <span>{message}</span>
            <button
                onClick={() => setVisible(false)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 ml-4 text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
