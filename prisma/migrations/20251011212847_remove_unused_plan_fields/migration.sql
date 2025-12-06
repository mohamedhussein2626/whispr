/*
  Warnings:

  - You are about to drop the column `models` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `wordLimitPerRequest` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `wordsPerMonth` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "models",
DROP COLUMN "wordLimitPerRequest",
DROP COLUMN "wordsPerMonth";
