-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "numberOfEssayGrader" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfEssayWriter" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "essay_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "essay_usage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "essay_usage" ADD CONSTRAINT "essay_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay_usage" ADD CONSTRAINT "essay_usage_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
