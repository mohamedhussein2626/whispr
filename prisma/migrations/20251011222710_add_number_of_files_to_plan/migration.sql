/*
  Warnings:

  - You are about to drop the column `plan` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "plan",
ADD COLUMN     "planId" INTEGER,
ADD COLUMN     "planName" TEXT NOT NULL DEFAULT 'free';
