import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Session } from "next-auth";

interface LoginStatusProps {
    session: Session | null;
}
async function LoginStatus({ session }: LoginStatusProps) {
    return (
        <div className="mb-4">
            {session ? (
                <div className="flex items-center space-x-4">
                    <p>Logged in as user {session.user.githubId}</p>
                    <Link href="/api/auth/signout"
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Logout
                    </Link>
                </div>
            ) : (
                <Link href="/api/auth/signin/github"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Login with GitHub
                </Link>
            )}
        </div>
    )
}

export default async function Home() {
    const session = await auth();
    const currentUserId = session?.user?.githubId;
    const users = await prisma.user.findMany();

    return (
        <main className="container mx-auto p-4">
            <LoginStatus session={session} />

            <h1 className="text-2xl font-bold mb-4">All users who have logged in ... so far!</h1>
            <ul className="list-disc pl-5">
                {users.map((user) => (
                    <li key={user.id} className="mb-2">
                        <a href={`https://github.com/${user.githubUsername}`}
                            target="_blank" rel="noopener noreferrer"
                            className={`text-blue-600 hover:underline ${user.githubId === currentUserId ? 'font-bold' : ''}`}
                        >
                            {user.githubUsername} (id: {user.githubId})
                            {user.githubId == currentUserId && (
                                <span className="ml-1 text-gray-500">&lt;- This is you :)</span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </main>
    );
}
