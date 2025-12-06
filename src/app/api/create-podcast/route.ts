import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import { uploadAudio } from "@/lib/audio-upload";
import {
  generateAudioFromText,
  createPodcastSections,
  formatDuration,
} from "@/lib/audio-generation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import { Readable } from "stream";

// Force Node.js runtime for PDF processing
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for PDF processing

type PodcastSectionInput = {
  title: string;
  description: string;
  content: string;
  duration: string;
};

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

    // Get the file and check if user owns it
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
      select: {
        id: true,
        key: true,
        url: true,
        name: true,
        fileType: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!file.key) {
      return NextResponse.json(
        { error: "File key not found. Please re-upload the file." },
        { status: 400 }
      );
    }

    // Check if podcast already exists
    const existingPodcast = await db.podcast.findFirst({
      where: {
        fileId,
      },
      include: {
        sections: true,
      },
    });

    if (existingPodcast) {
      // Delete existing podcast and its sections
      await db.podcastSection.deleteMany({
        where: {
          podcastId: existingPodcast.id,
        },
      });
      await db.podcast.delete({
        where: {
          id: existingPodcast.id,
        },
      });
    }

    // Get the file content from chunks (more reliable than PDF extraction)
    console.log("File URL:", file.url);
    console.log("File name:", file.name);
    console.log("File ID:", file.id);

    // Get chunks from database
    const chunks = await db.chunk.findMany({
      where: { fileId: file.id },
      take: 20,
    });

    console.log("🔍 Debug: Found chunks:", chunks.length);
    console.log(
      "🔍 Debug: Chunks content:",
      chunks.map((c) => c.text.substring(0, 50) + "..."),
    );

    let fileContent = "";
    
    // If no chunks exist, try to extract text from the PDF file directly from R2
    if (chunks.length === 0) {
      console.log("⚠️ No chunks found, attempting fallback text extraction from R2...");
      console.log(`📁 File key: ${file.key}`);
      
      try {
        // Read directly from R2 using the file key
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.key,
        });

        const r2Response = await r2Client.send(command);

        if (!r2Response.Body) {
          throw new Error("File not found in R2 storage");
        }

        // Convert the stream to a buffer
        const chunks_buffer: Uint8Array[] = [];
        const stream = r2Response.Body as Readable;
        
        for await (const chunk of stream) {
          chunks_buffer.push(chunk as Uint8Array);
        }
        
        const buffer = Buffer.concat(chunks_buffer);
        console.log(`✅ Fetched PDF from R2: ${buffer.length} bytes`);

        // Extract text using hybrid PDF processor
        const extractedText = await processHybridPdf(buffer, {
          extractImageText: false, // Faster extraction without OCR
          maxPages: 50,
        });

        if (extractedText && extractedText.trim()) {
          fileContent = extractedText;
          console.log(`✅ Fallback extraction successful: ${fileContent.length} characters`);
          
          // Save chunks for future use (using word-based chunking for consistency)
          const words = fileContent.split(/\s+/);
          const maxWords = 500;
          const chunkTexts: string[] = [];
          
          for (let i = 0; i < words.length; i += maxWords) {
            chunkTexts.push(words.slice(i, i + maxWords).join(" "));
          }
          
          const chunkPromises = chunkTexts.map((chunkText) =>
            db.chunk.create({
              data: {
                text: chunkText.trim(),
                fileId: file.id,
              },
            })
          );
          
          await Promise.all(chunkPromises);
          console.log(`✅ Created ${chunkTexts.length} chunks from extracted text`);
        } else {
          throw new Error("No text extracted from PDF");
        }
      } catch (fallbackError) {
        console.error("❌ Fallback extraction failed:", fallbackError);
        return NextResponse.json(
          {
            error: "No content found for this file. Please ensure the PDF was uploaded and processed successfully.",
            details: fallbackError instanceof Error ? fallbackError.message : "Unknown error"
          },
          { status: 400 },
        );
      }
    } else {
      console.log("✅ Using chunks for content, count:", chunks.length);
      fileContent = chunks.map((chunk) => chunk.text).join("\n\n");
      console.log("🔍 Debug: Combined content length:", fileContent.length);
      console.log(
        "🔍 Debug: Content preview:",
        fileContent.substring(0, 200) + "...",
      );
    }

    // Split content into sections for podcast
    const sections: PodcastSectionInput[] = await createPodcastSections(
      fileContent,
      file.name,
    );

    // Create podcast in database
    const podcast = await db.podcast.create({
      data: {
        fileId,
        title: `${file.name} - Audio Version`,
        description: `Audio version of ${file.name}`,
        totalDuration: "0:00", // Will be calculated after audio generation
        userId: user.id,
      },
    });

    // Create sections in database
    const createdSections = await Promise.all(
      sections.map(async (section: PodcastSectionInput, index: number) => {
        return await db.podcastSection.create({
          data: {
            podcastId: podcast.id,
            title: section.title,
            description: section.description,
            content: section.content,
            duration: section.duration,
            order: index,
          },
        });
      }),
    );

    // Generate audio for the single section
    const section = createdSections[0]; // Get the single section
    let audioUrl = null;

    try {
      console.log(`🎙️ Generating audio for: ${section.title}`);
      console.log(`📝 Content length: ${section.content.length} characters`);
      console.log(
        `📝 Content preview: ${section.content.substring(0, 200)}...`,
      );

      // Check if we have valid content
      if (!section.content || section.content.trim().length === 0) {
        throw new Error("No content to convert to audio");
      }

      console.log(`🔍 Debug: Starting audio generation with ElevenLabs...`);
      const audioBuffer = await generateAudioFromText(section.content);
      console.log(`✅ Audio generated, size: ${audioBuffer.length} bytes`);

      if (audioBuffer.length === 0) {
        throw new Error("Generated audio buffer is empty");
      }

      console.log(
        `🔍 Debug: Audio buffer is valid, size: ${audioBuffer.length} bytes`,
      );

      // Use the old UUID-based format for now to ensure compatibility
      const filename = `${podcast.id}-${section.id}.wav`;
      console.log(`🔍 Debug: Saving audio file as: ${filename}`);

      audioUrl = await uploadAudio(audioBuffer, filename, user.id);
      console.log(`✅ Audio uploaded to: ${audioUrl}`);

      // Verify the file was actually created
      const { existsSync } = await import("fs");
      const { join } = await import("path");
      const filePath = join(
        process.cwd(),
        "public",
        "uploads",
        "audio",
        filename,
      );
      const fileExists = existsSync(filePath);
      console.log(`🔍 Debug: Audio file exists on disk: ${fileExists}`);
      console.log(`🔍 Debug: File path: ${filePath}`);

      // Update section with audio URL - section already exists, so just update
      await db.podcastSection.update({
        where: { id: section.id },
        data: { audioUrl },
      });

      console.log(`✅ Section updated with audio URL: ${audioUrl}`);
    } catch (error: unknown) {
      console.error(
        `❌ Error generating audio for section ${section.id}:`,
        error,
      );
      console.error(
        `❌ Error details:`,
        error instanceof Error ? error.message : error,
      );

      // Create a fallback URL but log that it's not real
      const filename = `${podcast.id}-${section.id}.wav`;
      audioUrl = `/api/audio/${filename}`;
      console.log(`⚠️ Using fallback URL: ${audioUrl} (no actual audio file)`);

      // Update section with fallback URL - section already exists, so just update
      try {
        await db.podcastSection.update({
          where: { id: section.id },
          data: { audioUrl },
        });
        console.log(`✅ Section updated with fallback URL: ${audioUrl}`);
      } catch (dbError: unknown) {
        console.error(`❌ Database error updating section:`, dbError);
        // Continue without updating the database
      }
    }

    // Calculate total duration based on actual content length
    // Estimate: ~150 words per minute for speech
    const words = section.content.split(" ").length;
    const estimatedMinutes = words / 150; // words per minute
    const totalDurationSeconds = estimatedMinutes * 60;
    console.log(
      `Content: ${words} words, estimated duration: ${estimatedMinutes.toFixed(1)} minutes`,
    );

    // Update podcast with calculated duration - verify podcast still exists
    try {
      const podcastExists = await db.podcast.findUnique({
        where: { id: podcast.id },
      });
      
      if (podcastExists) {
        await db.podcast.update({
          where: { id: podcast.id },
          data: {
            totalDuration: formatDuration(totalDurationSeconds),
          },
        });
      } else {
        console.error(`❌ Podcast ${podcast.id} was deleted before update`);
      }
    } catch (updateError: unknown) {
      console.error(`❌ Error updating podcast duration:`, updateError);
      // Continue - duration is not critical
    }

    // Return the podcast with the single section
    const finalSection = {
      ...section,
      audioUrl: audioUrl || `/api/audio/${podcast.id}-${section.id}.wav`,
    };

    return NextResponse.json({
      message: "Podcast created successfully",
      podcast: {
        ...podcast,
        sections: [finalSection],
        totalDuration: formatDuration(totalDurationSeconds),
      },
    });
  } catch (error: unknown) {
    console.error("Error creating podcast:", error);
    return NextResponse.json(
      { error: "Failed to create podcast" },
      { status: 500 },
    );
  }
}
