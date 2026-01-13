import { query } from "@/lib/db";

function getUsers() {
    return query("SELECT * FROM users");
}

export default async function Home() {
    const users = await getUsers();
    return (
        <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4" >Users List</h1>
            <ul className="list-disc pl-5">
                {users.map((user) => (
                    <li key={user.id} className="mb-2">
                        <a href={`https://github.com/${user.github_username}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {user.github_username} (id: {user.github_id})
                        </a>
                    </li>
                ))}
            </ul>
        </main>
    );
}
