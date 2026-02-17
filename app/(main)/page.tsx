import Link from "next/link";

export default async function Home() {
    return (
        <div className="py-16 sm:py-24">
            <h1 className="font-serif text-5xl sm:text-6xl leading-tight mb-6 max-w-2xl">
                Open source, with a guide
            </h1>
            <p className="text-lg text-muted mb-10 max-w-xl leading-relaxed">
                Take your first steps into open source with clearly scoped tasks
                and the support of a mentor. No experience required.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/projects"
                    className="bg-accent text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                    Browse projects
                </Link>
                <Link
                    href="/submit"
                    className="border border-border px-5 py-2.5 rounded-md text-sm font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                    Submit a project
                </Link>
            </div>
        </div>
    );
}
