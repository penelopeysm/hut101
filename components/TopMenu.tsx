"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";

interface TopMenuUser {
    id: bigint;
    githubPicture: string;
    githubUsername: string;
}

interface TopMenuProps {
    user: TopMenuUser | null;
}

export default function TopMenu({ user }: TopMenuProps) {
    return (
        <nav className="flex justify-between items-center px-4 sm:px-6 py-3 shadow-sm bg-background">
            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="font-sans text-xl tracking-tight">
                    hut101
                </Link>
                <div className="flex gap-3 sm:gap-4 text-sm">
                    <Link href="/projects" className="text-muted hover:text-foreground transition-colors">
                        Projects
                    </Link>
                    <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                        About
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-sm">
                {user ? (
                    <>
                        <Link href="/submit" className="hidden sm:inline text-muted hover:text-foreground transition-colors">
                            Submit a Project
                        </Link>
                        <Link href="/my-profile" className="hidden sm:inline text-muted hover:text-foreground transition-colors">
                            My Profile
                        </Link>
                        <button onClick={() => signOut()} className="cursor-pointer text-muted hover:text-foreground transition-colors">
                            Logout
                        </button>
                        <Link href="/my-profile">
                            <Image
                                src={user.githubPicture}
                                alt={`${user.githubUsername}'s avatar`}
                                width={28}
                                height={28}
                                className="rounded-full ring-2 ring-border"
                            />
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={() => signIn("github")}
                        className="cursor-pointer bg-accent text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                        Login with GitHub
                    </button>
                )}
            </div>
        </nav>
    );
}
