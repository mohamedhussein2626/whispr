import { podcastAudioGenerator } from './elevenlabs-podcast';
import { generateAudioKey, generateAudioUrl, AUDIO_CONFIG } from './r2-audio-config';
import { r2AudioClient, R2_AUDIO_BUCKET_NAME } from './r2-audio-config';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Enhanced audio upload function for podcast generation
 * 
 

 */

export type Speaker = {
  name: string;
  role?: string;      // e.g., 'host', 'guest'
  voice_id: string; // required to match DialogueSpeaker
  // optional voice identifier for TTS
};

// Define voice settings type to match ElevenLabs API
export type VoiceSettings = {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
};

export async function uploadPodcastAudio(
  content: string,
  podcastId: string,
  userId: string,
  options: {
    deleteOldAudio?: string; // URL of old audio to delete
    useStreaming?: boolean;
    speakers?: Speaker[];
    voiceSettings?: VoiceSettings;
  } = {}
): Promise<{
  audioUrl: string;
  duration: number;
  fileSize: number;
  storageKey: string;
}> {
  try {
    console.log('🎙️ Starting enhanced podcast audio upload...');
    console.log(`📝 Content length: ${content.length} characters`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🎧 Podcast ID: ${podcastId}`);

    // Delete old audio if provided
    if (options.deleteOldAudio) {
      console.log('🗑️ Deleting old audio file...');
      await podcastAudioGenerator.deleteOldAudio(options.deleteOldAudio);
    }

    // Generate audio using Text-to-Dialogue API
    const audioResult = options.useStreaming
      ? await podcastAudioGenerator.streamPodcastAudio(content, podcastId, userId)
      : await podcastAudioGenerator.generatePodcastAudio(content, podcastId, userId, {
          speakers: options.speakers,
          voiceSettings: options.voiceSettings,
        });

    // Extract storage key from URL
    const storageKey = audioResult.audioUrl.replace(`${generateAudioUrl('')}`, '');

    console.log('✅ Enhanced podcast audio upload completed!');
    console.log(`🔗 Audio URL: ${audioResult.audioUrl}`);
    console.log(`📊 Duration: ${audioResult.duration}s`);
    console.log(`📦 File Size: ${audioResult.fileSize} bytes`);
    console.log(`🗝️ Storage Key: ${storageKey}`);

    return {
      audioUrl: audioResult.audioUrl,
      duration: audioResult.duration,
      fileSize: audioResult.fileSize,
      storageKey,
    };

  } catch (error) {
    console.error('❌ Enhanced podcast audio upload failed:', error);
    throw new Error(`Podcast audio upload failed: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Legacy audio upload function for backward compatibility
 */
export async function uploadAudio(
  audioBuffer: Buffer,
  filename: string,
  userId: string,
): Promise<string> {
  try {
    console.log('🎙️ Using legacy audio upload...');
    
    // Generate storage key
    const storageKey = generateAudioKey(filename, userId, 'legacy');
    
    // Upload to R2
    await r2AudioClient.send(new PutObjectCommand({
      Bucket: R2_AUDIO_BUCKET_NAME,
      Key: storageKey,
      Body: audioBuffer,
      ContentType: AUDIO_CONFIG.DEFAULT_FORMAT,
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'legacy-upload': 'true',
      },
    }));

    const audioUrl = generateAudioUrl(storageKey);
    console.log(`✅ Legacy audio uploaded: ${audioUrl}`);
    
    return audioUrl;
  } catch (error) {
    console.error("❌ Legacy audio upload failed:", error);
    throw error;
  }
}

/**
 * Delete audio file from R2 storage
 */
export async function deleteAudioFile(storageKey: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting audio file: ${storageKey}`);
    
    await r2AudioClient.send(new DeleteObjectCommand({
      Bucket: R2_AUDIO_BUCKET_NAME,
      Key: storageKey,
    }));

    console.log('✅ Audio file deleted successfully');
  } catch (error) {
    console.error('❌ Failed to delete audio file:', error);
    throw error;
  }
}

/**
 * Get audio file metadata from R2
 */
export async function getAudioMetadata(storageKey: string): Promise<{
  size: number;
  lastModified: Date;
  contentType: string;
} | null> {
  try {
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
    
    const response = await r2AudioClient.send(new HeadObjectCommand({
      Bucket: R2_AUDIO_BUCKET_NAME,
      Key: storageKey,
    }));

    return {
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
      contentType: response.ContentType || AUDIO_CONFIG.DEFAULT_FORMAT,
    };
  } catch (error) {
    console.error('❌ Failed to get audio metadata:', error);
    return null;
  }
}
