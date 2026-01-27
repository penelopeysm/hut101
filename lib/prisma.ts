// This is all lifted from the Prisma docs
//
// https://www.prisma.io/docs/guides/nextjs#26-set-up-prisma-client
//
// Except that the import path is a bit different since we set the output path
// in prisma/schema.prisma to something else

import { PrismaClient } from '@/lib/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
