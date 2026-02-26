import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Projects" };
import { getVerifiedProjects, getTechnologies } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import ProjectList from "@/components/ProjectList";

function serializeBigInt(value: bigint | null): string | null {
    return value === null ? null : value.toString();
}

async function ProjectListLoader() {
    const [projects, technologies] = await Promise.all([
        getVerifiedProjects(),
        getTechnologies(),
    ]);

    const serializedProjects = projects.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        repoOwner: p.repoOwner,
        repoName: p.repoName,
        issueNumber: p.issueNumber,
        createdAt: p.createdAt.toISOString(),
        completedAt: p.completedAt?.toISOString() ?? null,
        studentId: serializeBigInt(p.studentId),
        mentorAvailable: p.mentorAvailable,
        mentor: { id: p.mentor.id.toString(), githubUsername: p.mentor.githubUsername },
        technologies: p.technologies.map((pt) => ({
            technology: { name: pt.technology.name },
        })),
    }));

    const serializedTechnologies = technologies.map((t) => ({
        id: t.id.toString(),
        name: t.name,
    }));

    return (
        <ProjectList
            projects={serializedProjects}
            technologies={serializedTechnologies}
        />
    );
}

export default function Page() {
    return (
        <>
            <PageHeading>Projects</PageHeading>
            <Suspense fallback={<p role="status" className="text-muted">Loading projects...</p>}>
                <ProjectListLoader />
            </Suspense>
        </>
    );
}
