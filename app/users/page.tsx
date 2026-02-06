import { getUsers } from "@/lib/db";

function formatLastSeen(lastSeen: Date) {
    const now = new Date();
    // just measure by days
    const lastSeenDay = new Date(lastSeen.getFullYear(), lastSeen.getMonth(), lastSeen.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log("lastSeenDay", lastSeenDay);
    console.log("nowDay", nowDay);
    if (lastSeenDay > nowDay) {
        return "in the future (timey wimey stuff going on here...)";
    } else if (lastSeenDay.getTime() === nowDay.getTime()) {
        return "today";
    } else {
        return "in the past";
    }
}

export default async function Page() {
    const users = await getUsers();
    console.log(users);
    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <ul className="list-disc list-inside">
                {users.map((user) => (
                    <li key={user.id}>{user.githubUsername} (last seen {formatLastSeen(user.lastLoginAt)})</li>
                ))}
            </ul>
        </>
    )
}
