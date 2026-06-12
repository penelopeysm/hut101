"use client";

import { signIn } from "next-auth/react";
import { buttonClass } from "@/lib/styles";

export default function SignInButton() {
    return (
        <button onClick={() => signIn("github")} className={buttonClass}>
            Sign in with GitHub
        </button>
    );
}
