import { S3Client } from "@aws-sdk/client-s3";

// Separate R2 configuration for audio files
export const r2AudioClient = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// Audio-specific bucket configuration
export const R2_AUDIO_BUCKET_NAME = process.env.CLOUDFLARE_R2_AUDIO_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME!;
export const R2_AUDIO_PUBLIC_URL = process.env.CLOUDFLARE_R2_AUDIO_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL!;

// Audio file configuration
export const AUDIO_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB max audio file size
  SUPPORTED_FORMATS: ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'],
  DEFAULT_FORMAT: 'audio/wav',
  AUTO_DELETE_DAYS: 30, // Auto-delete after 30 days
  QUALITY_SETTINGS: {
    sampleRate: 44100,
    bitDepth: 16,
    channels: 1, // Mono for podcast
  }
} as const;

// Generate unique audio file key
export function generateAudioKey(filename: string, userId: string, podcastId: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop() || 'wav';
  
  return `podcasts/${userId}/${podcastId}/${timestamp}-${randomId}.${extension}`;
}

// Generate audio URL from key
export function generateAudioUrl(key: string): string {
  return `${R2_AUDIO_PUBLIC_URL}/${key}`;
}
