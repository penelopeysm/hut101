import { getUsers } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDateAsDaysInPast } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function Page() {
    const session = await auth();
    if (session?.user.role !== "ADMIN") {
        notFound();
    }

    const users = await getUsers();
    console.log(users);
    return (
        <>
            <h1 className="text-2xl font-bold mb-6">Users</h1>
            <div className="grid gap-3">
                {users.map((user) => (
                    <div
                        key={user.id.toString()}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                        <div>
                            <span className="font-medium">@{user.githubUsername}</span>
                            <span className="text-sm text-gray-500 ml-2">
                                last seen {formatDateAsDaysInPast(user.lastLoginAt)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
