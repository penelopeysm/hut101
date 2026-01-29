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
        githubId: 122629585,
        githubUsername: "penelopeysm",
    },
    {
        name: "Rosie Wood",
        email: "rw@example.com",
        githubId: 72076688,
        githubUsername: "rwood-97",
    },
];


export async function main() {
    for (const u of userData) {
        await prisma.user.upsert({
            where: { githubId: BigInt(u.githubId) },
            update: {
                name: u.name,
                email: u.email,
                githubUsername: u.githubUsername,
            },
            create: {
                name: u.name,
                email: u.email,
                githubId: BigInt(u.githubId),
                githubUsername: u.githubUsername,
            },
        });
    }
    await prisma.project.create({
        data: {
            title: "My Title",
            description: "My Description",
            mentor: {
                connect: { githubId: userData[0].githubId },
            },
        },
    })
}

main();
