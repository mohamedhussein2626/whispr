-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_flashcardsId_fkey";

-- DropForeignKey
ALTER TABLE "Flashcards" DROP CONSTRAINT "Flashcards_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_fileId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcards" ADD CONSTRAINT "Flashcards_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcardsId_fkey" FOREIGN KEY ("flashcardsId") REFERENCES "Flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
