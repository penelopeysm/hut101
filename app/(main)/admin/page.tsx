import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getAllProjectsForAdmin } from "@/lib/db";
import { notFound } from "next/navigation";
import PageHeading from "@/components/PageHeading";
import AdminProjectTable from "@/components/AdminProjectTable";

export const metadata: Metadata = { title: "Admin" };

async function ProjectTable() {
    const projects = await getAllProjectsForAdmin();

    const serialized = projects.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        difficulty: p.difficulty,
        verification: p.verification,
        repoOwner: p.repoOwner,
        repoName: p.repoName,
        issueNumber: p.issueNumber,
        createdAt: p.createdAt.toISOString(),
        deletedAt: p.deletedAt?.toISOString() ?? null,
        completedAt: p.completedAt?.toISOString() ?? null,
        mentor: { id: p.mentor.id.toString(), githubUsername: p.mentor.githubUsername },
        student: p.student ? { id: p.student.id.toString(), githubUsername: p.student.githubUsername } : null,
    }));

    return <AdminProjectTable projects={serialized} />;
}

export default async function Page() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        notFound();
    }

    return (
        <>
            <PageHeading>Admin</PageHeading>
            <Suspense fallback={<p role="status" className="text-muted">Loading projects...</p>}>
                <ProjectTable />
            </Suspense>
        </>
    );
}
