import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Difficulty, UserRole } from "@/lib/generated/client";

export async function getUsers() {
    return await prisma.user.findMany();
}

export async function getVerifiedProjects() {
    return await prisma.project.findMany({
        where: { verification: "VERIFIED" },
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

export async function getUserProfile(userId: bigint) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            githubUsername: true,
            githubPicture: true,
            name: true,
            confirmedOver18: true,
        },
    });

    if (!user) return null;

    const [mentoring, studying] = await Promise.all([
        prisma.project.findMany({
            where: { mentorId: userId },
            include: {
                student: {
                    select: { id: true, githubUsername: true },
                },
                technologies: {
                    include: { technology: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.project.findMany({
            where: { studentId: userId },
            include: {
                mentor: {
                    select: { id: true, githubUsername: true },
                },
                technologies: {
                    include: { technology: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return { user, mentoring, studying };
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
    if (project.verification !== "VERIFIED") {
        throw new Error("This project has not been verified yet");
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

export async function updateProject(
    projectId: bigint,
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
    const userId = BigInt(session.user.id);

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error("Project not found");
    }
    if (project.mentorId !== userId) {
        throw new Error("You can only edit your own projects");
    }

    const role = session.user.role as UserRole;
    if (project.verification === "VERIFIED" && role === "STUDENT") {
        throw new Error("Verified projects can only be edited by mentors or admins");
    }

    const technologies = technologyNames.length > 0
        ? await prisma.technology.findMany({ where: { name: { in: technologyNames } } })
        : [];

    await prisma.$transaction([
        prisma.project.update({
            where: { id: projectId },
            data: { title, description, repoOwner, repoName, issueNumber, difficulty },
        }),
        prisma.projectTechnology.deleteMany({ where: { projectId } }),
        ...(technologies.length > 0
            ? [prisma.projectTechnology.createMany({
                data: technologies.map((t) => ({
                    projectId,
                    technologyId: t.id,
                })),
            })]
            : []),
    ]);
}

export async function submitProject(
    title: string,
    description: string,
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    difficulty: Difficulty,
    technologyNames: string[],
    mentorJobRole: string | null,
    mentorTimeCommitment: string | null,
) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = BigInt(session.user.id);
    const role = session.user.role as UserRole;
    const autoVerify = role === "MENTOR" || role === "ADMIN";

    const project = await prisma.project.create({
        data: {
            title,
            description,
            repoOwner,
            repoName,
            issueNumber,
            difficulty,
            mentorJobRole,
            mentorTimeCommitment,
            verification: autoVerify ? "VERIFIED" : "PENDING",
            mentor: {
                connect: { id: userId },
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

    const events = [
        prisma.projectEvent.create({
            data: {
                type: "CREATED",
                projectId: project.id,
                actorId: userId,
            },
        }),
    ];
    if (autoVerify) {
        events.push(
            prisma.projectEvent.create({
                data: {
                    type: "VERIFIED",
                    projectId: project.id,
                    actorId: userId,
                },
            }),
        );
    }
    await prisma.$transaction(events);

    return { project, autoVerified: autoVerify };
}

export async function getUnreviewedProjects() {
    return await prisma.project.findMany({
        where: { verification: { in: ["PENDING", "REJECTED"] } },
        orderBy: { createdAt: "asc" },
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

export async function setProjectVerification(projectId: bigint, status: "VERIFIED" | "REJECTED") {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Not authorized");
    }
    const adminId = BigInt(session.user.id);

    await prisma.$transaction([
        prisma.project.update({
            where: { id: projectId },
            data: { verification: status },
        }),
        prisma.projectEvent.create({
            data: {
                type: status,
                projectId,
                actorId: adminId,
            },
        }),
    ]);
}
