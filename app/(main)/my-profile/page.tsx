import type { Metadata } from "next";
import { Suspense } from "react";
import { getMyProjects, getUser } from "@/lib/db";

export const metadata: Metadata = { title: "My Profile" };
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDateAsDaysInPast } from "@/lib/utils";
import DifficultyBadge from "@/components/DifficultyBadge";
import EditContactEmail from "@/components/EditContactEmail";
import { Session } from "next-auth";
import PageHeading from "@/components/PageHeading";

async function ProfileContent({ session }: { session: Session }) {
    const [{ mentoring, studying }, user] = await Promise.all([
        getMyProjects(),
        getUser(BigInt(session.user.id)),
    ]);

    return (
        <div className="animate-fade-in">

            <section className="mb-10">
                <h2 className="font-serif text-xl mb-4">Personal details</h2>
                <div className="space-y-4">
                    <div>
                        <span className="block text-sm text-muted mb-1">Contact email</span>
                        <EditContactEmail currentEmail={session.user.contactEmail!} />
                        <p className="text-xs text-muted mt-1">
                            This is not publicly viewable, but is shared with mentors and students you&rsquo;re matched with.
                        </p>
                    </div>

                    <div>
                        <span className="block text-sm text-muted mb-1">Age verification</span>
                        {user?.confirmedOver18 ? (
                            <p className="text-sm">Confirmed over 18</p>
                        ) : (
                            <p className="text-sm text-amber-600 dark:text-amber-400">Not yet confirmed</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="mb-10 pt-8 border-t border-border">
                <h2 className="font-serif text-xl mb-4">
                    Projects I&rsquo;m mentoring
                    <span className="text-muted font-sans font-normal ml-2 text-sm">{mentoring.length}</span>
                </h2>

                {mentoring.length === 0 ? (
                    <p className="text-muted text-sm">
                        You haven&rsquo;t submitted any projects yet.{" "}
                        <Link href="/submit" className="text-accent hover:underline">Submit one?</Link>
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {mentoring.map((project) => (
                            <div
                                key={project.id.toString()}
                                className="bg-card border border-border rounded-lg p-4"
                            >
                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="font-medium hover:text-accent hover:underline transition-colors"
                                    >
                                        {project.title}
                                    </Link>
                                    <DifficultyBadge difficulty={project.difficulty} />
                                    <Link
                                        href={`/projects/${project.id}/edit`}
                                        className="ml-auto text-sm text-accent hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                                <div className="text-sm text-muted flex flex-wrap gap-2">
                                    <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                                    {project.student ? (
                                        <span>· Student: @{project.student.githubUsername}</span>
                                    ) : (
                                        <span>· No student yet</span>
                                    )}
                                    {project.completedAt && (
                                        <span className="text-emerald-600 dark:text-emerald-400">· Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="pt-8 border-t border-border">
                <h2 className="font-serif text-xl mb-4">
                    Projects I&rsquo;m working on
                    <span className="text-muted font-sans font-normal ml-2 text-sm">{studying.length}</span>
                </h2>

                {studying.length === 0 ? (
                    <p className="text-muted text-sm">
                        You haven&rsquo;t signed up for any projects yet.{" "}
                        <Link href="/projects" className="text-accent hover:underline">Browse projects?</Link>
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {studying.map((project) => (
                            <div
                                key={project.id.toString()}
                                className="bg-card border border-border rounded-lg p-4"
                            >
                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="font-medium hover:text-accent hover:underline transition-colors"
                                    >
                                        {project.title}
                                    </Link>
                                    <DifficultyBadge difficulty={project.difficulty} />
                                </div>
                                <div className="text-sm text-muted flex flex-wrap gap-2">
                                    <span>Mentor: @{project.mentor.githubUsername}</span>
                                    <span>· {formatDateAsDaysInPast(project.createdAt)}</span>
                                    {project.completedAt && (
                                        <span className="text-emerald-600 dark:text-emerald-400">· Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    }

    return (
        <>
            <PageHeading>My Profile</PageHeading>
            <Suspense fallback={<p role="status" className="text-muted">Loading profile...</p>}>
                <ProfileContent session={session} />
            </Suspense>
        </>
    );
}
