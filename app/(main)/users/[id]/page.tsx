import type { Metadata } from "next";
import { Suspense } from "react";
import { getUserProfile } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import DifficultyBadge from "@/components/DifficultyBadge";
import EditContactEmail from "@/components/EditContactEmail";
import { formatDateAsDaysInPast } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const [profile, session] = await Promise.all([
            getUserProfile(BigInt(id)),
            auth(),
        ]);
        if (session && BigInt(session.user.id) === BigInt(id)) {
            return { title: "My Profile" };
        }
        return { title: profile?.user.name ?? "User" };
    } catch {
        return { title: "User" };
    }
}

async function ProfileContent({ userId }: { userId: bigint }) {
    const [profile, session] = await Promise.all([
        getUserProfile(userId),
        auth(),
    ]);
    if (!profile) {
        notFound();
    }

    const { user, mentoring: allMentoring, studying } = profile;
    const isOwnProfile = session !== null && BigInt(session.user.id) === userId;
    // On someone else's profile, hide unverified projects
    const mentoring = isOwnProfile ? allMentoring : allMentoring.filter((p) => p.verification === "VERIFIED");

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <img
                    src={user.githubPicture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <span className="text-muted">@{user.githubUsername}</span>
                </div>
            </div>

            {isOwnProfile && (
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
                            {user.confirmedOver18 ? (
                                <p className="text-sm">Confirmed over 18</p>
                            ) : (
                                <p className="text-sm text-amber-600 dark:text-amber-400">Not yet confirmed</p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section className={`mb-10 ${isOwnProfile ? "pt-8 border-t border-border" : ""}`}>
                <h2 className="font-serif text-xl mb-4">
                    {isOwnProfile ? <>Projects I&rsquo;m mentoring</> : "Projects mentoring"}
                    <span className="text-muted font-sans font-normal ml-2 text-sm">{mentoring.length}</span>
                </h2>

                {mentoring.length === 0 ? (
                    <p className="text-muted text-sm">
                        {isOwnProfile ? (
                            <>You haven&rsquo;t submitted any projects yet.{" "}
                            <Link href="/submit" className="text-accent hover:underline">Submit one?</Link></>
                        ) : (
                            "No projects yet."
                        )}
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
                                    {isOwnProfile && project.verification === "PENDING" && (
                                        <span className="text-xs text-amber-600 dark:text-amber-400">(pending verification)</span>
                                    )}
                                    {isOwnProfile && project.verification === "REJECTED" && (
                                        <span className="text-xs text-red-600 dark:text-red-400">(rejected)</span>
                                    )}
                                    {isOwnProfile && (
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="ml-auto text-sm text-accent hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                </div>
                                <div className="text-sm text-muted flex flex-wrap gap-2">
                                    <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                                    {project.student ? (
                                        <span>· Student: <Link href={`/users/${project.student.id}`} className="text-accent hover:underline transition-colors">@{project.student.githubUsername}</Link></span>
                                    ) : (
                                        <span>· No student yet</span>
                                    )}
                                    {project.completedAt && (
                                        <span className="text-emerald-600 dark:text-emerald-400">· Completed</span>
                                    )}
                                </div>
                                {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {project.technologies.map((pt) => (
                                            <span
                                                key={pt.technology.name}
                                                className="bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                                            >
                                                {pt.technology.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="pt-8 border-t border-border">
                <h2 className="font-serif text-xl mb-4">
                    {isOwnProfile ? <>Projects I&rsquo;m working on</> : "Projects working on"}
                    <span className="text-muted font-sans font-normal ml-2 text-sm">{studying.length}</span>
                </h2>

                {studying.length === 0 ? (
                    <p className="text-muted text-sm">
                        {isOwnProfile ? (
                            <>You haven&rsquo;t signed up for any projects yet.{" "}
                            <Link href="/projects" className="text-accent hover:underline">Browse projects?</Link></>
                        ) : (
                            "No projects yet."
                        )}
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
                                    <span>Mentor: <Link href={`/users/${project.mentor.id}`} className="text-accent hover:underline transition-colors">@{project.mentor.githubUsername}</Link></span>
                                    <span>· {formatDateAsDaysInPast(project.createdAt)}</span>
                                    {project.completedAt && (
                                        <span className="text-emerald-600 dark:text-emerald-400">· Completed</span>
                                    )}
                                </div>
                                {project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {project.technologies.map((pt) => (
                                            <span
                                                key={pt.technology.name}
                                                className="bg-surface text-muted px-2 py-0.5 rounded text-xs font-medium"
                                            >
                                                {pt.technology.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let userId: bigint;
    try {
        userId = BigInt(id);
    } catch {
        notFound();
    }

    return (
        <div className="max-w-2xl">
            <Suspense fallback={<p role="status" className="text-muted">Loading profile...</p>}>
                <ProfileContent userId={userId} />
            </Suspense>
        </div>
    );
}
