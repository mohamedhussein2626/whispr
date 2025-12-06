-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "backgroundMusicUrl" TEXT,
ADD COLUMN     "backgroundMusicVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
ADD COLUMN     "voiceSettings" JSONB;

-- AlterTable
ALTER TABLE "PodcastSection" ADD COLUMN     "speaker1AudioUrl" TEXT,
ADD COLUMN     "speaker1Text" TEXT,
ADD COLUMN     "speaker1VoiceId" TEXT,
ADD COLUMN     "speaker2AudioUrl" TEXT,
ADD COLUMN     "speaker2Text" TEXT,
ADD COLUMN     "speaker2VoiceId" TEXT;
