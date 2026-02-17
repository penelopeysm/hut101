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
        githubId: BigInt(122629585),
        githubUsername: "penelopeysm",
        githubPicture: "https://avatars.githubusercontent.com/u/122629585?v=4",
    },
    // {
    //     name: "Rosie Wood",
    //     githubId: BigInt(72076688),
    //     githubUsername: "rwood-97",
    //     githubPicture: "https://avatars.githubusercontent.com/u/72076688?v=4",
    // },
];

const technologyData: Prisma.TechnologyCreateInput[] = [
    { name: "C" },
    { name: "C++" },
    { name: "CSS" },
    { name: "Docker" },
    { name: "Go" },
    { name: "Haskell" },
    { name: "HTML" },
    { name: "Java" },
    { name: "JavaScript" },
    { name: "Julia" },
    { name: "Kotlin" },
    { name: "Lua" },
    { name: "OCaml" },
    { name: "PostgreSQL" },
    { name: "Python" },
    { name: "R" },
    { name: "Ruby" },
    { name: "Rust" },
    { name: "Scala" },
    { name: "Shell" },
    { name: "SQL" },
    { name: "Swift" },
    { name: "TypeScript" },
    { name: "Zig" },
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
                connect: { githubId: BigInt(122629585) },
            },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 95,
            difficulty: "MEDIUM",

            technologies: {
                create: [
                    { technology: { connect: { name: "Julia" } } },
                ],
            },
        },
    })
}

main();
