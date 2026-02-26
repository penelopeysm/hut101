import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getUnverifiedProjects } from "@/lib/db";
import { notFound } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import AdminVerificationQueue from "@/components/AdminVerificationQueue";

export const metadata: Metadata = { title: "Admin" };

async function VerificationQueue() {
    const projects = await getUnverifiedProjects();

    const serialized = projects.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        repoOwner: p.repoOwner,
        repoName: p.repoName,
        issueNumber: p.issueNumber,
        createdAt: p.createdAt.toISOString(),
        mentor: { id: p.mentor.id.toString(), githubUsername: p.mentor.githubUsername },
        technologies: p.technologies.map((pt) => ({
            technology: { name: pt.technology.name },
        })),
    }));

    return <AdminVerificationQueue projects={serialized} />;
}

export default async function Page() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        notFound();
    }

    return (
        <>
            <PageHeading>Verification Queue</PageHeading>
            <Suspense fallback={<p role="status" className="text-muted">Loading queue...</p>}>
                <VerificationQueue />
            </Suspense>
        </>
    );
}
