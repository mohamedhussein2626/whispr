import { createHash } from "crypto";

/**
 * Generate a consistent, safe filename for audio files
 * This avoids issues with long UUIDs and ensures consistent naming
 */
export function generateAudioFilename(
  podcastId: string,
  sectionId: string,
): string {
  // Create a hash of the IDs to ensure consistent, safe filenames
  const combined = `${podcastId}-${sectionId}`;
  const hash = createHash("md5").update(combined).digest("hex");

  // Use first 8 characters of hash for shorter, consistent filenames
  return `${hash.substring(0, 8)}.wav`;
}

/**
 * Generate the audio URL for a podcast section
 * This function tries to use the new hash-based naming, but falls back to the old UUID format
 * if the new file doesn't exist
 */
export function generateAudioUrl(podcastId: string, sectionId: string): string {
  // Also generate the old UUID-based filename as fallback
  const oldFilename = `${podcastId}-${sectionId}.wav`;

  // For now, use the old format to ensure compatibility with existing files
  // TODO: Once migration is complete, switch to new format
  return `/api/audio/${oldFilename}`;
}

/**
 * Check if an audio file exists and return the correct URL
 */
export async function getAudioUrl(
  podcastId: string,
  sectionId: string,
): Promise<string> {
  const newFilename = generateAudioFilename(podcastId, sectionId);
  const oldFilename = `${podcastId}-${sectionId}.wav`;

  // Try the new format first
  try {
    const response = await fetch(`/api/audio/${newFilename}`, {
      method: "HEAD",
    });
    if (response.ok) {
      return `/api/audio/${newFilename}`;
    }
  } catch {
    // Ignore error and try old format
  }

  // Fallback to old format
  return `/api/audio/${oldFilename}`;
}

/**
 * Extract podcast and section IDs from a filename
 */
export function extractIdsFromFilename(
  filename: string,
): { podcastId: string; sectionId: string } | null {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(wav|mp3|m4a)$/, "");

  // Check if it's a hash-based filename (8 characters)
  if (nameWithoutExt.length === 8) {
    // This is a hash-based filename, we can't extract the original IDs
    return null;
  }

  // Check if it's the old format with UUIDs
  const parts = nameWithoutExt.split("-");
  if (parts.length >= 2) {
    const podcastId = parts[0];
    const sectionId = parts.slice(1).join("-");
    return { podcastId, sectionId };
  }

  return null;
}

/**
 * Check if a filename is in the new hash-based format
 */
export function isHashBasedFilename(filename: string): boolean {
  const nameWithoutExt = filename.replace(/\.(wav|mp3|m4a)$/, "");
  return nameWithoutExt.length === 8;
}
