"use client";

import Link from "next/link";
import Image from "next/image";

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
        <nav className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-6">
                <Link href="/" className="font-bold text-lg tracking-tight">
                    hut101
                </Link>
                <div className="flex gap-4 text-sm">
                    <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Projects
                    </Link>
                    <Link href="/users" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Users
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
                {user ? (
                    <>
                        <Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Submit a Project
                        </Link>
                        <Link href="/my-profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Profile
                        </Link>
                        <Link href="/api/auth/signout" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Logout
                        </Link>
                        <Image
                            src={user.githubPicture}
                            alt={`${user.githubUsername}'s avatar`}
                            width={28}
                            height={28}
                            className="rounded-full"
                        />
                    </>
                ) : (
                    <Link
                        href="/api/auth/signin/github"
                        className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition-colors"
                    >
                        Login with GitHub
                    </Link>
                )}
            </div>
        </nav>
    );
}
