import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProject, getTechnologies } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import EditProjectForm from "@/components/EditProjectForm";

export const metadata: Metadata = { title: "Edit Project" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    }

    const { id } = await params;
    let projectId: bigint;
    try {
        projectId = BigInt(id);
    } catch {
        notFound();
    }

    const project = await getProject(projectId);
    if (!project) {
        notFound();
    }

    const userId = BigInt(session.user.id);
    if (userId !== project.mentorId) {
        redirect(`/projects/${id}`);
    }

    if (project.verification === "VERIFIED" && session.user.role === "STUDENT") {
        redirect(`/projects/${id}`);
    }

    const technologies = await getTechnologies();

    const projectData = {
        id: project.id,
        title: project.title,
        description: project.description,
        repoOwner: project.repoOwner,
        repoName: project.repoName,
        issueNumber: project.issueNumber,
        difficulty: project.difficulty,
        technologies: project.technologies.map((pt) => pt.technology.name),
    };

    return (
        <>
            <PageHeading>Edit project</PageHeading>
            <EditProjectForm project={projectData} technologies={technologies} hasStudent={project.studentId !== null} />
        </>
    );
}
