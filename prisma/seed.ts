import { PrismaClient, Prisma } from '@/lib/generated/client';
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({
    adapter,
});

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Penelope Yong",
        email: "py@example.com",
        githubId: BigInt(122629585),
        githubUsername: "penelopeysm",
        githubPicture: "https://avatars.githubusercontent.com/u/122629585?v=4",
    },
    {
        name: "Rosie Wood",
        email: "rw@example.com",
        githubId: BigInt(72076688),
        githubUsername: "rwood-97",
        githubPicture: "https://avatars.githubusercontent.com/u/72076688?v=4",
    },
];

const technologyData: Prisma.TechnologyCreateInput[] = [
    { name: "Julia" },
    { name: "Python" },
    { name: "Rust" },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.upsert({
            where: { githubId: u.githubId }, update: u, create: u,
        });
    }
    for (const t of technologyData) {
        await prisma.technology.upsert({
            where: { name: t.name }, update: t, create: t,
        });
    }

    await prisma.project.create({
        data: {
            title: "Improve terminal output for MCMC sampling results",
            description: "I would write more here but it doesn't really make sense to do so in seed data",
            mentor: {
                connect: { githubId: BigInt(122629585) }, // that's Penny
            },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 95,
            difficulty: 6,

            technologies: {
                create: [
                    { technology: { connect: { name: "Julia" } } },
                ],
            },
        },
    })
}

main();
