import { readdir, rename } from "fs/promises";
import { join } from "path";
import { generateAudioFilename, extractIdsFromFilename } from "./audio-utils";

/**
 * Migrate existing audio files to the new hash-based naming system
 * This function will rename existing files to use the new consistent naming
 */
export async function migrateAudioFiles(): Promise<{
  success: number;
  failed: number;
}> {
  const uploadsDir = join(process.cwd(), "public", "uploads", "audio");
  let success = 0;
  let failed = 0;

  try {
    const files = await readdir(uploadsDir);

    for (const file of files) {
      if (!file.endsWith(".wav")) continue;

      // Skip files that are already in the new format
      if (file.length === 12 && file.endsWith(".wav")) {
        // 8 chars + .wav = 12
        console.log(`✅ File ${file} is already in new format`);
        continue;
      }

      // Try to extract IDs from the old format
      const ids = extractIdsFromFilename(file);
      if (!ids) {
        console.log(`⚠️ Could not extract IDs from ${file}, skipping`);
        failed++;
        continue;
      }

      // Generate new filename
      const newFilename = generateAudioFilename(ids.podcastId, ids.sectionId);
      const oldPath = join(uploadsDir, file);
      const newPath = join(uploadsDir, newFilename);

      try {
        await rename(oldPath, newPath);
        console.log(`✅ Migrated ${file} -> ${newFilename}`);
        success++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${file}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }

  return { success, failed };
}

/**
 * Check if audio files need migration
 */
export async function checkMigrationNeeded(): Promise<boolean> {
  const uploadsDir = join(process.cwd(), "public", "uploads", "audio");

  try {
    const files = await readdir(uploadsDir);
    const oldFormatFiles = files.filter(
      (file) => file.endsWith(".wav") && file.length > 12,
    );

    return oldFormatFiles.length > 0;
  } catch (error) {
    console.error("❌ Error checking migration status:", error);
    return false;
  }
}
