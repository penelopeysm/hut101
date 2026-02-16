"use client";

import { useState } from "react";

export default function SuccessBanner({ message }: { message: string }) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-md px-4 py-3 mb-6 flex justify-between items-center">
            <span>{message}</span>
            <button
                onClick={() => setVisible(false)}
                className="text-green-600 hover:text-green-800 ml-4 text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
