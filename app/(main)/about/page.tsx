import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "About" };

export default function Page() {
    return (
        <>
            <PageHeading>About hut101</PageHeading>
            <article className="prose dark:prose-invert max-w-2xl">

            <p>
                hut101 helps people take their first steps into open-source contribution.
                Each project is a small, self-contained task on a real open-source repository, paired with a mentor who can guide you through the process.
            </p>

            <p>
                You don&rsquo;t need prior open-source or collaborative coding experience &mdash; just some programming knowledge and a willingness to learn.
            </p>

            <h2>How it works</h2>

            <h3>For students</h3>
            <ol>
                <li>Browse the <a href="/projects">project list</a> and find something that matches your skills and interests.</li>
                <li>Sign up for a project. Your mentor will get in touch to set up an initial meeting.</li>
                <li>Work on the task. You&rsquo;ll have about two weeks to complete it, with your mentor available for questions and guidance.</li>
                <li>Submit a pull request. Your mentor will review your code and help you get it merged.</li>
                <li>Optionally, have a wrap-up discussion to reflect on what you learned and talk about next steps.</li>
            </ol>

            <h3>For mentors</h3>
            <ol>
                <li>Find a suitable issue on an open-source project you&rsquo;re familiar with. It should be self-contained, have a clear solution, and not block other work if it doesn&rsquo;t get done.</li>
                <li><a href="/submit">Submit it here</a> with a description, difficulty level, and a link to the GitHub issue.</li>
                <li>Once a student signs up, make contact and establish the ground rules: background on the project, level of support, timescale, and how to get in touch.</li>
                <li>Support the student as they work, review their code, and help them get their PR merged.</li>
            </ol>

            <p>
                We recommend 2&ndash;3 contact hours in total: an initial meeting, a check-in before the pull request, and a wrap-up discussion.
            </p>

            <h2>Who we are</h2>
            <p>
                The hut101 programme is run by <a href="https://github.com/penelopeysm">Penelope Yong</a> and <a href="https://github.com/rwood-97">Rosie Wood</a> [...]
            </p>
            </article>
        </>
    );
}
