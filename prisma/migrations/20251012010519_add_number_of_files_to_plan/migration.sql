/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptionId_key" ON "user"("subscriptionId");
