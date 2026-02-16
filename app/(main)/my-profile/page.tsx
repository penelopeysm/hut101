import { getMyProjects } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDateAsDaysInPast } from "@/lib/utils";
import DeleteProjectButton from "@/components/DeleteProjectButton";
import DifficultyBadge from "@/components/DifficultyBadge";
import EditContactEmail from "@/components/EditContactEmail";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/api/auth/signin/github");
    }

    const { mentoring, studying } = await getMyProjects();

    return (
        <>
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            <section className="mb-10">
                <h2 className="text-lg font-semibold mb-3">Contact email</h2>
                <p className="text-sm text-gray-500 mb-3">
                    This is shared with mentors and students you&rsquo;re matched with on a project.
                </p>
                <EditContactEmail currentEmail={session.user.contactEmail!} />
            </section>

            <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4">
                    Projects I&rsquo;m mentoring
                    <span className="text-gray-400 font-normal ml-2 text-sm">{mentoring.length}</span>
                </h2>

                {mentoring.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        You haven&rsquo;t submitted any projects yet.{" "}
                        <Link href="/submit" className="text-blue-600 hover:underline">Submit one?</Link>
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {mentoring.map((project) => (
                            <div
                                key={project.id.toString()}
                                className="border border-gray-200 rounded-lg p-4 flex items-baseline justify-between gap-4"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="font-medium hover:underline truncate"
                                        >
                                            {project.title}
                                        </Link>
                                        <DifficultyBadge difficulty={project.difficulty} />
                                    </div>
                                    <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                                        <span>{formatDateAsDaysInPast(project.createdAt)}</span>
                                        {project.student ? (
                                            <span>· Student: @{project.student.githubUsername}</span>
                                        ) : (
                                            <span>· No student yet</span>
                                        )}
                                        {project.completedAt && (
                                            <span className="text-green-600">· Completed</span>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {project.studentId === null && !project.completedAt ? (
                                        <DeleteProjectButton projectId={project.id} />
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            {project.completedAt ? "Completed" : "Has student"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-4">
                    Projects I&rsquo;m working on
                    <span className="text-gray-400 font-normal ml-2 text-sm">{studying.length}</span>
                </h2>

                {studying.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        You haven&rsquo;t signed up for any projects yet.{" "}
                        <Link href="/projects" className="text-blue-600 hover:underline">Browse projects?</Link>
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {studying.map((project) => (
                            <div
                                key={project.id.toString()}
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="font-medium hover:underline truncate"
                                    >
                                        {project.title}
                                    </Link>
                                    <DifficultyBadge difficulty={project.difficulty} />
                                </div>
                                <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                                    <span>Mentor: @{project.mentor.githubUsername}</span>
                                    <span>· {formatDateAsDaysInPast(project.createdAt)}</span>
                                    {project.completedAt && (
                                        <span className="text-green-600">· Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
