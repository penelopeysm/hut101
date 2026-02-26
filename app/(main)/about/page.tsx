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

            </article>

            <h2 className="font-serif text-2xl mt-10 mb-8 max-w-2xl">How it works</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-10 max-w-2xl">
                <div>
                    <h3 className="font-serif text-lg mb-4">For students</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">1</span>
                            <p className="text-sm"><strong>Browse</strong> the <a href="/projects" className="text-accent hover:underline">project list</a> and find something that matches your skills and interests.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">2</span>
                            <p className="text-sm"><strong>Sign up</strong> for a project. Your mentor will get in touch to set up an initial meeting.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">3</span>
                            <p className="text-sm"><strong>Work</strong> on the task. You&rsquo;ll have about two weeks, with your mentor available for questions.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">4</span>
                            <p className="text-sm"><strong>Submit</strong> a pull request. Your mentor will review your code and help you get it merged.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">5</span>
                            <p className="text-sm"><strong>Reflect</strong> in an optional wrap-up discussion about what you learned and what to do next.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-serif text-lg mb-4">For mentors</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">1</span>
                            <p className="text-sm"><strong>Find</strong> an issue on a project you know well. It should be self-contained and not block other work.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">2</span>
                            <p className="text-sm"><strong><a href="/submit" className="text-accent hover:underline">Submit</a></strong> it with a description, difficulty level, and a link to the GitHub issue.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">3</span>
                            <p className="text-sm"><strong>Meet</strong> your student and establish ground rules: project background, support level, timescale, and contact method.</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-serif text-2xl text-accent leading-none mt-0.5">4</span>
                            <p className="text-sm"><strong>Support</strong> them as they work, review their code, and help get the PR merged.</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted mt-6">
                        We recommend 2&ndash;3 contact hours total: an initial meeting, a check-in before the PR, and a wrap-up.
                    </p>
                </div>
            </div>

            <section className="max-w-2xl mt-10">
                <h2 className="font-serif text-2xl mb-10">Who we are</h2>

                <div className="flex justify-center mb-10">
                    <div className="relative" style={{ width: "min(100%, 480px)", height: "320px" }}>
                        <a
                            href="https://github.com/penelopeysm"
                            className="absolute left-0 top-4 z-10 block bg-card p-3 pb-14 shadow-lg hover:z-30 hover:scale-105 transition-all duration-300"
                            style={{ transform: "rotate(-6deg)", width: "220px" }}
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/122629585?v=4"
                                alt="Penelope Yong"
                                className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                            <span
                                className="absolute bottom-4 left-4 font-serif text-lg text-muted"
                                style={{ transform: "rotate(2deg)" }}
                            >
                                Penelope Yong
                            </span>
                        </a>

                        <a
                            href="https://github.com/rwood-97"
                            className="absolute right-0 top-0 z-20 block bg-card p-3 pb-14 shadow-lg hover:z-30 hover:scale-105 transition-all duration-300"
                            style={{ transform: "rotate(4deg)", width: "220px" }}
                        >
                            <img
                                src="https://avatars.githubusercontent.com/u/72076688?v=4"
                                alt="Rosie Wood"
                                className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-500"
                            />
                            <span
                                className="absolute bottom-4 left-4 font-serif text-lg text-muted"
                                style={{ transform: "rotate(-1deg)" }}
                            >
                                Rosie Wood
                            </span>
                        </a>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-2xl">
                    <p>
                        TODO: A sentence or two each about yourselves and why you care about hut101.
                    </p>
                </div>
            </section>
        </>
    );
}
