-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProjectEventType" ADD VALUE 'VERIFIED';
ALTER TYPE "ProjectEventType" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "verification" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill: all existing projects were mentor-created, so mark them as VERIFIED
UPDATE "Project" SET "verification" = 'VERIFIED';
