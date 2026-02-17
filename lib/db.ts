import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Difficulty } from "@/lib/generated/client";

export async function getUsers() {
    return await prisma.user.findMany();
}

export async function getProjects() {
    return await prisma.project.findMany({
        include: {
            mentor: true,
            technologies: {
                include: {
                    technology: true,
                },
            },
        },
    });
}

export async function getProject(id: bigint) {
    return await prisma.project.findUnique({
        where: { id },
        include: {
            mentor: true,
            student: true,
            technologies: {
                include: {
                    technology: true,
                },
            },
            events: {
                include: { actor: true },
                orderBy: { time: "desc" },
            },
        },
    });
}

export async function getUser(id: bigint) {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function getMyProjects() {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);

    const [mentoring, studying] = await Promise.all([
        prisma.project.findMany({
            where: { mentorId: userId },
            include: {
                student: true,
                technologies: {
                    include: { technology: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
            where: { studentId: userId },
            include: {
                mentor: true,
                technologies: {
                    include: { technology: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return { mentoring, studying };
}

export async function deleteProject(projectId: bigint) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error("Project not found");
    }
    if (project.mentorId !== userId) {
        throw new Error("You can only delete your own projects");
    }
    if (project.studentId !== null) {
        throw new Error("Cannot delete a project that has a student assigned");
    }

    // Delete related records first, then the project
    await prisma.$transaction([
        prisma.projectTechnology.deleteMany({ where: { projectId } }),
        prisma.projectEvent.deleteMany({ where: { projectId } }),
        prisma.project.delete({ where: { id: projectId } }),
    ]);
}

export async function signUpForProject(projectId: bigint) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error("Project not found");
    }
    if (project.mentorId === userId) {
        throw new Error("You can't sign up for your own project");
    }
    if (project.studentId !== null) {
        throw new Error("This project already has a student");
    }
    if (!project.mentorAvailable) {
        throw new Error("The mentor is currently unavailable for this project");
    }
    if (project.completedAt !== null) {
        throw new Error("This project has already been completed");
    }

    await prisma.$transaction([
        prisma.project.update({
            where: { id: projectId },
            data: { studentId: userId },
        }),
        prisma.projectEvent.create({
            data: {
                type: "STUDENT_ASSIGNED",
                projectId,
                actorId: userId,
            },
        }),
    ]);
}

export async function getTechnologies() {
    return await prisma.technology.findMany({ orderBy: { name: "asc" } });
}

export async function submitProjectAsMentor(
    title: string,
    description: string,
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    difficulty: Difficulty,
    technologyNames: string[],
) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const mentorId = BigInt(session.user.id);

    const project = await prisma.project.create({
        data: {
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty,
            mentor: {
                connect: { id: mentorId },
            },
        },
    });

    if (technologyNames.length > 0) {
        const technologies = await prisma.technology.findMany({
            where: { name: { in: technologyNames } },
        });
        await prisma.projectTechnology.createMany({
            data: technologies.map((t) => ({
                projectId: project.id,
                technologyId: t.id,
            })),
        });
    }

    await prisma.projectEvent.create({
        data: {
            type: "CREATED",
            projectId: project.id,
            actorId: mentorId,
        },
    });

    return project;
}
