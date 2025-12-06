import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const audioDir = join(process.cwd(), "public", "uploads", "audio");

    // Check if directory exists
    if (!existsSync(audioDir)) {
      return NextResponse.json({
        error: "Audio directory does not exist",
        path: audioDir,
      });
    }

    // List all audio files
    const files = await readdir(audioDir);
    const audioFiles = files.filter(
      (file) =>
        file.endsWith(".wav") ||
        file.endsWith(".mp3") ||
        file.endsWith(".m4a") ||
        file.endsWith(".ogg"),
    );

    return NextResponse.json({
      message: "Audio directory found",
      path: audioDir,
      totalFiles: files.length,
      audioFiles: audioFiles,
      audioUrls: audioFiles.map((file) => `/api/audio/${file}`),
    });
  } catch (error) {
    console.error("Error testing audio directory:", error);
    return NextResponse.json(
      { error: "Failed to test audio directory" },
      { status: 500 },
    );
  }
}
