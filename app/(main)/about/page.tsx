import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "About" };

export default function Page() {
    return (
        <>
            <PageHeading>About hut101</PageHeading>
            <article className="prose dark:prose-invert max-w-2xl">

            <p>
                TODO: What is hut101? A sentence or two about helping people take their
                first steps into open source with mentored, clearly scoped tasks.
            </p>

            <h2>How it works</h2>

            <h3>For students</h3>
            <p>
                TODO: Browse projects, sign up, get matched with a mentor, work on the
                issue, get your first PR merged.
            </p>

            <h3>For mentors</h3>
            <p>
                TODO: Submit a project with a GitHub issue, describe what&rsquo;s involved,
                guide a student through their first contribution.
            </p>

            <h2>Who we are</h2>
            <p>
                TODO: A bit about the people behind hut101.
            </p>
            </article>
        </>
    );
}
