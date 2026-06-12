import Link from "next/link";
import HutScene from "@/components/HutScene";
import { buttonClass, buttonSecondaryClass } from "@/lib/styles";

const STEPS = [
    {
        title: "Pick a project",
        body: "Browse small, well-scoped tasks on real open-source repositories.",
    },
    {
        title: "Meet your mentor",
        body: "They'll help you find your feet and answer questions along the way.",
    },
    {
        title: "Ship your PR",
        body: "Open a pull request and get it merged, together.",
    },
];

export default async function Home() {
    return (
        <div className="py-14 sm:py-20">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
                <div>
                    <h1 className="animate-rise [animation-delay:90ms] font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight mb-7 max-w-2xl">
                        Open source
                        <br />
                        for researchers,
                        <br />
                        with a{" "}
                        <span className="relative inline-block italic text-accent">
                            guide
                            <svg
                                className="absolute -bottom-2 left-0 w-full"
                                viewBox="0 0 110 10"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M3 7 Q 13 2 25 6 T 50 6 T 76 6 T 106 5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </h1>
                    <p className="animate-rise [animation-delay:180ms] text-lg text-muted mb-10 max-w-xl leading-relaxed">
                        You write code for your research &mdash; analysis scripts, models,
                        pipelines. That&rsquo;s most of what it takes. We&rsquo;ll pair you
                        with a research software engineer to do the rest: a small,
                        well-scoped contribution to a real open-source project, with
                        someone to ask when you get stuck.
                    </p>
                    <div className="animate-rise [animation-delay:260ms] flex flex-wrap gap-4">
                        <Link href="/projects" className={buttonClass}>
                            Browse projects <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <Link href="/submit" className={buttonSecondaryClass}>
                            Submit a project
                        </Link>
                    </div>
                </div>
                <HutScene className="hidden md:block w-60 lg:w-72 text-foreground/75 animate-rise [animation-delay:200ms]" />
            </div>

            <div className="animate-rise [animation-delay:380ms] mt-16 sm:mt-24 border-t-2 border-dotted border-border pt-10 max-w-3xl">
                <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className="flex gap-4">
                            <span className="font-serif text-3xl text-accent leading-none" aria-hidden="true">
                                {i + 1}
                            </span>
                            <div>
                                <h2 className="font-semibold mb-1">{step.title}</h2>
                                <p className="text-smd text-muted leading-relaxed">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
                <p className="mt-10 text-lg text-muted leading-relaxed max-w-2xl">
                    hut101 is run by{" "}
                    <a
                        href="https://society-rse.org/"
                        className="font-semibold text-accent hover:underline transition-colors"
                    >
                        research software engineers
                    </a>{" "}
                    &mdash; people who turn research code into software others can use.
                    We think more scientists should know it&rsquo;s a job, and how
                    it&rsquo;s done.
                </p>
                <Link
                    href="/about"
                    className="inline-block mt-4 text-smd text-accent hover:text-accent-hover transition-colors"
                >
                    More about how it works <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}
