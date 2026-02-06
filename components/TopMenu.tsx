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
        <nav className="flex justify-between items-center p-4 bg-gray-200">
            <div className="flex gap-5 ml-4">
                <Link href="/">Home</Link>
                <Link href="/projects">All Projects</Link>
                <Link href="/users">All Users</Link>
            </div>

            <div className="flex gap-5 mr-4 items-center">
                {user ? (
                    <>
                        <span>Welcome, {user.githubUsername}!</span>
                        <Link href="/my-profile">My Profile</Link>
                        <Link href="/submit">Submit a Project</Link>
                        <Link href="/api/auth/signout">Logout</Link>
                        <Image src={user.githubPicture} alt="GitHub profile picture" width={32} height={32} className="rounded-full" />
                    </>
                ) : (
                    <Link href="/api/auth/signin/github">Login with GitHub</Link>
                )}
            </div>
        </nav>
    );
}
