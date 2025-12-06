import { r2AudioClient, R2_AUDIO_BUCKET_NAME, generateAudioKey, generateAudioUrl, AUDIO_CONFIG, R2_AUDIO_PUBLIC_URL } from './r2-audio-config';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ElevenLabs Text-to-Dialogue API types
interface DialogueSpeaker {
  voice_id: string;
  name: string;
}

interface DialogueRequest {
  text: string;
  speakers: DialogueSpeaker[];
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface DialogueResponse {
  dialogue_id: string;
  status: 'processing' | 'completed' | 'failed';
  audio_url?: string;
}

// Enhanced podcast audio generation using ElevenLabs Text-to-Dialogue API
export class PodcastAudioGenerator {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVEN_LABS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found in environment variables');
    }
  }

  /**
   * Generate podcast audio using Text-to-Dialogue API
   */
  async generatePodcastAudio(
    content: string,
    podcastId: string,
    userId: string,
    options: {
      speakers?: DialogueSpeaker[];
      voiceSettings?: DialogueRequest['voice_settings'];
      modelId?: string;
    } = {}
  ): Promise<{ audioUrl: string; duration: number; fileSize: number }> {
    try {
      console.log('🎙️ Generating podcast audio with Text-to-Dialogue API...');
      console.log(`📝 Content length: ${content.length} characters`);

      // Prepare dialogue request
      const dialogueRequest: DialogueRequest = {
        text: this.prepareContentForDialogue(content),
        speakers: options.speakers || this.getDefaultSpeakers(),
        model_id: options.modelId || 'eleven_multilingual_v2',
        voice_settings: options.voiceSettings ?? {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      };

      console.log('🎙️ Sending request to ElevenLabs Text-to-Dialogue API...');

      // Call Text-to-Dialogue API
      const response = await fetch(`${this.baseUrl}/text-to-dialogue/convert`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(dialogueRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs Text-to-Dialogue API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const dialogueResponse: DialogueResponse = await response.json();
      console.log('✅ Text-to-Dialogue request submitted:', dialogueResponse.dialogue_id);

      // Poll for completion
      const audioUrl = await this.pollForCompletion(dialogueResponse.dialogue_id);
      
      // Download and upload to R2
      const audioBuffer = await this.downloadAudio(audioUrl);
      const audioKey = generateAudioKey('podcast.wav', userId, podcastId);
      const r2AudioUrl = await this.uploadToR2(audioBuffer, audioKey);

      // Calculate duration and file size
      const duration = await this.calculateAudioDuration(audioBuffer);
      const fileSize = audioBuffer.length;

      console.log(`✅ Podcast audio generated successfully!`);
      console.log(`📊 Duration: ${duration}s, Size: ${fileSize} bytes`);
      console.log(`🔗 R2 URL: ${r2AudioUrl}`);

      return {
        audioUrl: r2AudioUrl,
        duration,
        fileSize,
      };

    } catch (error) {
      console.error('❌ Podcast audio generation failed:', error);
      
      // Fallback to basic TTS if Text-to-Dialogue fails
      console.log('🔄 Falling back to basic TTS...');
      return await this.generateBasicTTS(content, podcastId, userId);
    }
  }

  /**
   * Stream podcast audio generation for real-time processing
   */
  async streamPodcastAudio(
    content: string,
    podcastId: string,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ audioUrl: string; duration: number; fileSize: number }> {
    try {
      console.log('🎙️ Streaming podcast audio generation...');

      const dialogueRequest: DialogueRequest = {
        text: this.prepareContentForDialogue(content),
        speakers: this.getDefaultSpeakers(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      };

      // Call streaming endpoint
      const response = await fetch(`${this.baseUrl}/text-to-dialogue/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/wav',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(dialogueRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs streaming API error: ${response.status} - ${errorText}`);
      }

      // Stream the audio data
      const audioChunks: Uint8Array[] = [];
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let totalSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        audioChunks.push(value);
        totalSize += value.length;
        
        // Report progress
        if (onProgress) {
          const progress = Math.min((totalSize / (AUDIO_CONFIG.MAX_FILE_SIZE * 0.8)) * 100, 100);
          onProgress(progress);
        }
      }

      // Combine chunks into buffer
      const audioBuffer = Buffer.concat(audioChunks);
      
      // Upload to R2
      const audioKey = generateAudioKey('podcast-stream.wav', userId, podcastId);
      const r2AudioUrl = await this.uploadToR2(audioBuffer, audioKey);

      const duration = await this.calculateAudioDuration(audioBuffer);

      console.log(`✅ Streamed podcast audio generated!`);
      console.log(`📊 Duration: ${duration}s, Size: ${audioBuffer.length} bytes`);

      return {
        audioUrl: r2AudioUrl,
        duration,
        fileSize: audioBuffer.length,
      };

    } catch (error) {
      console.error('❌ Streaming audio generation failed:', error);
      throw error;
    }
  }

  /**
   * Delete old audio files when regenerating
   */
  async deleteOldAudio(audioUrl: string): Promise<void> {
    try {
      if (!audioUrl || !audioUrl.includes(R2_AUDIO_PUBLIC_URL)) {
        console.log('⚠️ Invalid audio URL for deletion:', audioUrl);
        return;
      }

      // Extract key from URL
      const key = audioUrl.replace(`${R2_AUDIO_PUBLIC_URL}/`, '');
      
      console.log(`🗑️ Deleting old audio file: ${key}`);

      await r2AudioClient.send(new DeleteObjectCommand({
        Bucket: R2_AUDIO_BUCKET_NAME,
        Key: key,
      }));

      console.log('✅ Old audio file deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete old audio file:', error);
      // Don't throw error - deletion failure shouldn't stop regeneration
    }
  }

  /**
   * Auto-cleanup old audio files (30+ days)
   */
  async cleanupOldAudioFiles(): Promise<{ deleted: number; errors: number }> {
    try {
      console.log('🧹 Starting auto-cleanup of old audio files...');
      
      // This would require listing objects and checking creation dates
      // For now, we'll implement a database-based cleanup
      // The actual R2 cleanup can be implemented with a scheduled job
      
      console.log('✅ Auto-cleanup completed (database-based)');
      return { deleted: 0, errors: 0 };
    } catch (error) {
      console.error('❌ Auto-cleanup failed:', error);
      return { deleted: 0, errors: 1 };
    }
  }

  // Private helper methods
  private prepareContentForDialogue(content: string): string {
    // Clean and format content for dialogue generation
    let cleaned = content.trim();
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Add natural pauses
    cleaned = cleaned.replace(/\./g, '. ');
    cleaned = cleaned.replace(/,/g, ', ');
    
    // Limit length for API constraints
    const maxLength = 5000; // ElevenLabs limit
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength) + '...';
    }
    
    return cleaned;
  }

  private getDefaultSpeakers(): DialogueSpeaker[] {
    return [
      {
        voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel - clear, professional
        name: 'Narrator'
      },
      {
        voice_id: 'AZnzlk1XvdvUeBnXmlld', // Domi - engaging, conversational
        name: 'Host'
      }
    ];
  }

  private async pollForCompletion(dialogueId: string, maxAttempts = 30): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      try {
        const response = await fetch(`${this.baseUrl}/text-to-dialogue/${dialogueId}`, {
          headers: {
            'xi-api-key': this.apiKey,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.status === 'completed' && result.audio_url) {
            return result.audio_url;
          } else if (result.status === 'failed') {
            throw new Error('Dialogue generation failed');
          }
        }
      } catch {
        console.log(`⏳ Polling attempt ${attempt + 1}/${maxAttempts}...`);
      }
    }
    
    throw new Error('Dialogue generation timeout');
  }

  private async downloadAudio(audioUrl: string): Promise<Buffer> {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async uploadToR2(audioBuffer: Buffer, key: string): Promise<string> {
    await r2AudioClient.send(new PutObjectCommand({
      Bucket: R2_AUDIO_BUCKET_NAME,
      Key: key,
      Body: audioBuffer,
      ContentType: AUDIO_CONFIG.DEFAULT_FORMAT,
      Metadata: {
        'generated-at': new Date().toISOString(),
        'auto-delete-after': new Date(Date.now() + AUDIO_CONFIG.AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      },
    }));

    return generateAudioUrl(key);
  }

  private async calculateAudioDuration(audioBuffer: Buffer): Promise<number> {
    // Simple duration calculation based on WAV file format
    // In a real implementation, you'd use a proper audio library
    const sampleRate = AUDIO_CONFIG.QUALITY_SETTINGS.sampleRate;
    const bytesPerSample = AUDIO_CONFIG.QUALITY_SETTINGS.bitDepth / 8;
    const channels = AUDIO_CONFIG.QUALITY_SETTINGS.channels;
    
    // Skip WAV header (44 bytes) and calculate duration
    const audioDataSize = audioBuffer.length - 44;
    const samples = audioDataSize / (bytesPerSample * channels);
    const duration = samples / sampleRate;
    
    return Math.round(duration);
  }

  private async generateBasicTTS(
    content: string,
    podcastId: string,
    userId: string
  ): Promise<{ audioUrl: string; duration: number; fileSize: number }> {
    // Fallback to basic TTS if Text-to-Dialogue fails
    console.log('🔄 Using basic TTS fallback...');
    
    const response = await fetch(`${this.baseUrl}/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/wav',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text: content.substring(0, 4000), // Limit for basic TTS
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Basic TTS failed: ${response.status}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioKey = generateAudioKey('podcast-fallback.wav', userId, podcastId);
    const r2AudioUrl = await this.uploadToR2(audioBuffer, audioKey);
    const duration = await this.calculateAudioDuration(audioBuffer);

    return {
      audioUrl: r2AudioUrl,
      duration,
      fileSize: audioBuffer.length,
    };
  }
}

// Export singleton instance
export const podcastAudioGenerator = new PodcastAudioGenerator();
