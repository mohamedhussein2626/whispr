-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
