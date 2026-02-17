"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
    return (
        <button
            onClick={() => signIn("github")}
            className="bg-accent text-white font-medium px-6 py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
        >
            Sign in with GitHub
        </button>
    );
}
