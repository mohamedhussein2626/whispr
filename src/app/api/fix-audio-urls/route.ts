import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import { readdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    console.log("=== FIXING AUDIO URLS ===");
    console.log("File ID:", fileId);

    // Get the existing podcast
    const podcast = await db.podcast.findFirst({
      where: { fileId },
      include: {
        sections: true,
      },
    });

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }

    console.log("Found podcast:", podcast.id);
    console.log("Sections to fix:", podcast.sections.length);

    // Get all audio files on the server
    const uploadsDir = join(process.cwd(), "public", "uploads", "audio");
    const files = await readdir(uploadsDir);
    console.log("Available files:", files);

    // Fix each section's audio URL
    const updatedSections = await Promise.all(
      podcast.sections.map(async (section, index) => {
        try {
          console.log(
            `[${index + 1}/${podcast.sections.length}] Fixing section: ${section.title}`,
          );

          // Find the matching file for this section
          const sectionFiles = files.filter(
            (file) =>
              file.includes(podcast.id) &&
              file.includes(section.id) &&
              (file.includes(".wav") || file.includes(".mp3")),
          );

          console.log(`Found files for section ${section.id}:`, sectionFiles);

          if (sectionFiles.length > 0) {
            // Use the first matching file
            const correctFilename = sectionFiles[0];
            const correctAudioUrl = `/api/audio/${correctFilename}`;

            console.log(
              `✅ Updating section ${section.id} to use: ${correctAudioUrl}`,
            );

            // Update section with correct audio URL
            await db.podcastSection.update({
              where: { id: section.id },
              data: { audioUrl: correctAudioUrl },
            });

            return {
              ...section,
              audioUrl: correctAudioUrl,
            };
          } else {
            console.log(`❌ No matching file found for section ${section.id}`);
            return {
              ...section,
              audioUrl: null,
            };
          }
        } catch (error) {
          console.error(`❌ Error fixing section ${section.id}:`, error);
          return {
            ...section,
            audioUrl: null,
          };
        }
      }),
    );

    const sectionsWithAudio = updatedSections.filter((s) => s.audioUrl);
    console.log(
      `✅ URL fixing complete! ${sectionsWithAudio.length}/${podcast.sections.length} sections have audio`,
    );

    return NextResponse.json({
      success: true,
      message: `Audio URLs fixed successfully! ${sectionsWithAudio.length}/${podcast.sections.length} sections have audio`,
      podcast: {
        ...podcast,
        sections: updatedSections,
      },
    });
  } catch (error) {
    console.error("URL fixing error:", error);
    return NextResponse.json(
      {
        error: "Failed to fix audio URLs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
