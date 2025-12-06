-- CreateTable
CREATE TABLE "library_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "library_topics" ADD CONSTRAINT "library_topics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_notes" ADD CONSTRAINT "library_notes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "library_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
