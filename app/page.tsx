import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Session } from "next-auth";

// async function submitProject(formData: FormData) {
//     "use server";
//
//     const session = await auth();
//     if (!session?.user?.githubId) {
//         throw new Error("Not authenticated");
//     }
//
//     const title = formData.get("title") as string;
//     const description = formData.get("description") as string;
//
//     await prisma.project.create({
//         data: {
//             title,
//             description,
//             mentor: {
//                 connect: { githubId: session.user.githubId },
//             },
//         },
//     });
// }
                {/* <form action={submitProject} className="space-y-4"> */ }
    {/*     <div> */ }
    {/*         <label className="block text-sm font-medium">Title</label> */ }
    {/*         <input */ }
    {/*             name="title" */ }
    {/*             required */ }
    {/*             className="w-full border rounded px-3 py-2" */ }
    {/*         /> */ }
    {/*     </div> */ }
    {/**/ }
    {/*     <div> */ }
    {/*         <label className="block text-sm font-medium">Description</label> */ }
    {/*         <textarea */ }
    {/*             name="description" */ }
    {/*             required */ }
    {/*             className="w-full border rounded px-3 py-2" */ }
    {/*         /> */ }
    {/*     </div> */ }
    {/**/ }
    {/*     <button */ }
    {/*         type="submit" */ }
    {/*         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" */ }
    {/*     > */ }
    {/*         Submit project */ }
    {/*     </button> */ }
    {/* </form> */ }

export default async function Home() {
    return (
        <h1 className="text-3xl font-bold mb-6">Welcome to hut101!</h1>
    );
}
