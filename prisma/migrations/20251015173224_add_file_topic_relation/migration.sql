-- AlterTable
ALTER TABLE "File" ADD COLUMN     "topicId" TEXT;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "library_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
