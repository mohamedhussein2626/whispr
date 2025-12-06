import { uploadToR2, generateFileKey } from "./r2-upload";

/**
 * Upload audio file to Cloudflare R2
 */
export async function uploadAudioToR2(
  audioBuffer: Buffer,
  filename: string,
  userId: string
): Promise<string> {
  try {
    // Generate a unique key for the audio file
    const key = generateFileKey(filename, userId);
    
    // Upload to R2
    const result = await uploadToR2(
      audioBuffer,
      key,
      "audio/wav" // Default to WAV format
    );

    console.log(`Audio file uploaded to R2: ${result.url}`);
    console.log(`File size: ${audioBuffer.length} bytes`);

    return result.url;
  } catch (error) {
    console.error("Error uploading audio to R2:", error);
    throw error;
  }
}
