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

    const pen = await prisma.user.findUniqueOrThrow({ where: { githubId: BigInt(122629585) } });
    const rosie = await prisma.user.findUniqueOrThrow({ where: { githubId: BigInt(72076688) } });

    // 1. Your project, no student (open)
    await prisma.project.create({
        data: {
            title: "Improve terminal output for MCMC sampling results",
            description: "The current terminal output for MCMC sampling is hard to read. We need better formatting, progress bars, and summary statistics displayed inline.",
            mentor: { connect: { id: pen.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: pen.id },
                    { type: "VERIFIED", actorId: pen.id },
                ],
            },
        },
    });

    // 2. Your project, with a student assigned
    await prisma.project.create({
        data: {
            title: "Add type-safe configuration parser",
            description: "Write a configuration file parser that validates types at parse time and provides helpful error messages when values don't match the expected schema.",
            mentor: { connect: { id: pen.id } },
            student: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: pen.id },
                    { type: "VERIFIED", actorId: pen.id },
                    { type: "STUDENT_ASSIGNED", actorId: rosie.id },
                ],
            },
        },
    });

    // 3. Someone else's project, no student (open — you can sign up)
    await prisma.project.create({
        data: {
            title: "Build a CLI tool for database migrations",
            description: "Create a lightweight command-line tool that manages database schema migrations with up/down support, dry-run mode, and migration status tracking.",
            mentor: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: rosie.id },
                    { type: "VERIFIED", actorId: rosie.id },
                ],
            },
        },
    });

    // 4. Rosie's project, you're the student
    await prisma.project.create({
        data: {
            title: "Implement WebSocket support for real-time updates",
            description: "Add WebSocket-based real-time notification system so users see live updates without polling. Includes connection management and reconnection logic.",
            mentor: { connect: { id: rosie.id } },
            student: { connect: { id: pen.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: rosie.id },
                    { type: "VERIFIED", actorId: rosie.id },
                    { type: "STUDENT_ASSIGNED", actorId: pen.id },
                ],
            },
        },
    });

    // 5. Rosie's easy project (open)
    await prisma.project.create({
        data: {
            title: "Write unit tests for the CSV parser module",
            description: "The CSV parser has no test coverage. Write comprehensive unit tests covering edge cases like quoted fields, newlines in values, different delimiters, and malformed input.",
            mentor: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: rosie.id },
                    { type: "VERIFIED", actorId: rosie.id },
                ],
            },
        },
    });

    // 6. Your completed project
    await prisma.project.create({
        data: {
            title: "Refactor logging to use structured output",
            description: "Replace ad-hoc print statements with a structured logging library. All log entries should be JSON-formatted with consistent fields for timestamp, level, and context.",
            mentor: { connect: { id: pen.id } },
            student: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: pen.id },
                    { type: "VERIFIED", actorId: pen.id },
                    { type: "STUDENT_ASSIGNED", actorId: rosie.id },
                    { type: "COMPLETED", actorId: pen.id },
                ],
            },
        },
    });

    // 7. Pending project (submitted, awaiting verification)
    await prisma.project.create({
        data: {
            title: "Add dark mode toggle to the settings page",
            description: "Implement a user-facing toggle on the settings page that switches between light and dark themes. Should persist the preference in localStorage and respect the system default on first visit.",
            mentor: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: rosie.id },
                    { type: "SUBMITTED_FOR_REVIEW", actorId: rosie.id },
                ],
            },
        },
    });

    // 8. Pending project (submitted, awaiting verification)
    await prisma.project.create({
        data: {
            title: "Create an interactive API documentation page",
            description: "Build a Swagger-style interactive docs page that lets users try out API endpoints directly in the browser. Should auto-generate from route definitions and support auth headers.",
            mentor: { connect: { id: pen.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: pen.id },
                    { type: "SUBMITTED_FOR_REVIEW", actorId: pen.id },
                ],
            },
        },
    });

    // 9. Rejected project
    await prisma.project.create({
        data: {
            title: "Rewrite the entire backend in COBOL",
            description: "Port the full server-side codebase to COBOL for maximum enterprise readiness. This will future-proof the project for the next 60 years of mainframe computing.",
            mentor: { connect: { id: rosie.id } },
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
            events: {
                create: [
                    { type: "CREATED", actorId: rosie.id },
                    { type: "SUBMITTED_FOR_REVIEW", actorId: rosie.id },
                    { type: "REJECTED", actorId: pen.id, comment: "COBOL is not a suitable technology for this project. Please consider a more modern language." },
                ],
            },
        },
    });
    // 10. Soft-deleted project (should only be visible to admins)
    await prisma.project.create({
        data: {
            title: "Set up automated performance benchmarking",
            description: "Create a CI pipeline that runs performance benchmarks on every PR and compares against the main branch. Should flag regressions above a configurable threshold.",
            mentor: { connect: { id: pen.id } },
            repoOwner: "penelopeysm",
            repoName: "FlexiChains.jl",
            issueNumber: 88,
            difficulty: "MEDIUM",
            verification: "VERIFIED",
            deletedAt: new Date("2026-02-15"),
            technologies: {
                create: [
                    { technology: { connect: { name: "Shell" } } },
                    { technology: { connect: { name: "Docker" } } },
                ],
            },
            events: {
                create: [
                    { type: "CREATED", actorId: pen.id },
                    { type: "VERIFIED", actorId: pen.id },
                ],
            },
        },
    });
}

main();
