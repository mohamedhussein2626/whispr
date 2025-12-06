-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "audioFileSize" INTEGER,
ADD COLUMN     "audioFormat" TEXT DEFAULT 'wav',
ADD COLUMN     "audioStorageKey" TEXT,
ADD COLUMN     "autoDeleteAt" TIMESTAMP(3),
ADD COLUMN     "generationMethod" TEXT DEFAULT 'text-to-dialogue',
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "speakers" JSONB;

-- AlterTable
ALTER TABLE "PodcastSection" ADD COLUMN     "audioFileSize" INTEGER,
ADD COLUMN     "audioFormat" TEXT DEFAULT 'wav',
ADD COLUMN     "audioStorageKey" TEXT,
ADD COLUMN     "generationMethod" TEXT DEFAULT 'text-to-dialogue',
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processingError" TEXT;
