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
    console.log('topMenu user', user);
    return (
        <nav className="flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/" className="font-bold text-lg tracking-tight">
                    hut101
                </Link>
                <div className="flex gap-3 sm:gap-4 text-sm">
                    <Link href="/projects" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Projects
                    </Link>
                    <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        About
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-sm">
                {user ? (
                    <>
                        <Link href="/submit" className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            Submit a Project
                        </Link>
                        <Link href="/my-profile" className="hidden sm:inline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            My Profile
                        </Link>
                        <button onClick={() => signOut()} className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            Logout
                        </button>
                        <Link href="/my-profile">
                            <Image
                                src={user.githubPicture}
                                alt={`${user.githubUsername}'s avatar`}
                                width={28}
                                height={28}
                                className="rounded-full"
                            />
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={() => signIn("github")}
                        className="cursor-pointer bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                        Login with GitHub
                    </button>
                )}
            </div>
        </nav>
    );
}
