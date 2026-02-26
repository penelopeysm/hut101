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
        contactEmail: "pen@example.com",
        confirmedOver18: true,
    },
    {
        name: "Rosie Wood",
        githubId: BigInt(72076688),
        githubUsername: "rwood-97",
        githubPicture: "https://avatars.githubusercontent.com/u/72076688?v=4",
        contactEmail: "rosie@example.com",
        confirmedOver18: true,
    },
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
    // Clean up existing data (order matters for foreign keys)
    await prisma.projectEvent.deleteMany();
    await prisma.projectTechnology.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.project.deleteMany();

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

    // 1. Your project, no student (open)
    await prisma.project.create({
        data: {
            title: "Improve terminal output for MCMC sampling results",
            description: "The current terminal output for MCMC sampling is hard to read. We need better formatting, progress bars, and summary statistics displayed inline.",
            mentor: { connect: { githubId: BigInt(122629585) } },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 95,
            difficulty: "MEDIUM",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Julia" } } },
                ],
            },
        },
    });

    // 2. Your project, with a student assigned
    await prisma.project.create({
        data: {
            title: "Add type-safe configuration parser",
            description: "Write a configuration file parser that validates types at parse time and provides helpful error messages when values don't match the expected schema.",
            mentor: { connect: { githubId: BigInt(122629585) } },
            student: { connect: { githubId: BigInt(72076688) } },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 102,
            difficulty: "HARD",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Rust" } } },
                    { technology: { connect: { name: "TypeScript" } } },
                ],
            },
        },
    });

    // 3. Someone else's project, no student (open — you can sign up)
    await prisma.project.create({
        data: {
            title: "Build a CLI tool for database migrations",
            description: "Create a lightweight command-line tool that manages database schema migrations with up/down support, dry-run mode, and migration status tracking.",
            mentor: { connect: { githubId: BigInt(72076688) } },
            repoOwner: "rwood-97",
            repoName: "geo-tools",
            issueNumber: 42,
            difficulty: "MEDIUM",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Python" } } },
                    { technology: { connect: { name: "PostgreSQL" } } },
                ],
            },
        },
    });

    // 4. Rosie's project, you're the student
    await prisma.project.create({
        data: {
            title: "Implement WebSocket support for real-time updates",
            description: "Add WebSocket-based real-time notification system so users see live updates without polling. Includes connection management and reconnection logic.",
            mentor: { connect: { githubId: BigInt(72076688) } },
            student: { connect: { githubId: BigInt(122629585) } },
            repoOwner: "rwood-97",
            repoName: "notify-hub",
            issueNumber: 17,
            difficulty: "HARD",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "TypeScript" } } },
                    { technology: { connect: { name: "JavaScript" } } },
                ],
            },
        },
    });

    // 5. Rosie's easy project (open)
    await prisma.project.create({
        data: {
            title: "Write unit tests for the CSV parser module",
            description: "The CSV parser has no test coverage. Write comprehensive unit tests covering edge cases like quoted fields, newlines in values, different delimiters, and malformed input.",
            mentor: { connect: { githubId: BigInt(72076688) } },
            repoOwner: "rwood-97",
            repoName: "geo-tools",
            issueNumber: 55,
            difficulty: "EASY",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Python" } } },
                ],
            },
        },
    });

    // 6. Your completed project
    await prisma.project.create({
        data: {
            title: "Refactor logging to use structured output",
            description: "Replace ad-hoc print statements with a structured logging library. All log entries should be JSON-formatted with consistent fields for timestamp, level, and context.",
            mentor: { connect: { githubId: BigInt(122629585) } },
            student: { connect: { githubId: BigInt(72076688) } },
            completedAt: new Date("2025-12-01"),
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 78,
            difficulty: "EASY",
            verification: "VERIFIED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Go" } } },
                ],
            },
        },
    });

    // 7. Pending project (student-submitted, awaiting verification)
    await prisma.project.create({
        data: {
            title: "Add dark mode toggle to the settings page",
            description: "Implement a user-facing toggle on the settings page that switches between light and dark themes. Should persist the preference in localStorage and respect the system default on first visit.",
            mentor: { connect: { githubId: BigInt(72076688) } },
            repoOwner: "rwood-97",
            repoName: "geo-tools",
            issueNumber: 63,
            difficulty: "EASY",
            verification: "PENDING",
            technologies: {
                create: [
                    { technology: { connect: { name: "TypeScript" } } },
                    { technology: { connect: { name: "CSS" } } },
                ],
            },
        },
    });

    // 8. Pending project (student-submitted, awaiting verification)
    await prisma.project.create({
        data: {
            title: "Create an interactive API documentation page",
            description: "Build a Swagger-style interactive docs page that lets users try out API endpoints directly in the browser. Should auto-generate from route definitions and support auth headers.",
            mentor: { connect: { githubId: BigInt(122629585) } },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 110,
            difficulty: "MEDIUM",
            verification: "PENDING",
            technologies: {
                create: [
                    { technology: { connect: { name: "TypeScript" } } },
                    { technology: { connect: { name: "HTML" } } },
                ],
            },
        },
    });

    // 9. Rejected project
    await prisma.project.create({
        data: {
            title: "Rewrite the entire backend in COBOL",
            description: "Port the full server-side codebase to COBOL for maximum enterprise readiness. This will future-proof the project for the next 60 years of mainframe computing.",
            mentor: { connect: { githubId: BigInt(72076688) } },
            repoOwner: "rwood-97",
            repoName: "geo-tools",
            issueNumber: 99,
            difficulty: "HARD",
            verification: "REJECTED",
            technologies: {
                create: [
                    { technology: { connect: { name: "Shell" } } },
                ],
            },
        },
    });
}

main();
