"use client";

import { useState } from "react";

export default function SuccessBanner({ message }: { message: string }) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="bg-pine/10 border border-pine/40 text-pine text-sm rounded-lg px-4 py-3 mb-6 flex justify-between items-center">
            <span>{message}</span>
            <button
                onClick={() => setVisible(false)}
                className="cursor-pointer text-pine/70 hover:text-pine ml-4 text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
