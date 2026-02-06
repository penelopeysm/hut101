import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

export async function getProjectsWithMentor(mentorId: bigint) {
    return await prisma.project.findMany({
        where: {
            mentorId: mentorId,
        },
    });
}

export async function getProjectsWithStudent(studentId: bigint) {
    return await prisma.project.findMany({
        where: {
            studentId: studentId,
        },
    });
}

export async function submitProjectAsMentor(
    title: string,
    description: string,
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    difficulty: number,
    // TODO: technologies
) {
    // read the user's id from the session and use it as the mentorId
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const mentorId = BigInt(session.user.id);

    // todo error checking
    return await prisma.project.create({
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
}


