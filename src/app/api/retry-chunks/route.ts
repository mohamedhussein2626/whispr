import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import mammoth from "mammoth";

// Force Node.js runtime for this route
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// Helper: Chunk long text into segments
function chunkText(text: string, maxWords = 500): string[] {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks;
}

/**
 * Retry chunk creation for a file that doesn't have chunks
 * POST /api/retry-chunks
 * Body: { fileId: string }
 */
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
        { status: 400 }
      );
    }

    console.log(`🔄 Retrying chunk creation for file: ${fileId}`);

    // Get the file and verify ownership
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
      select: {
        id: true,
        key: true,
        fileType: true,
        name: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found or access denied" },
        { status: 404 }
      );
    }

    // Check if chunks already exist
    const existingChunks = await db.chunk.findMany({
      where: { fileId: file.id },
      select: { id: true },
    });

    if (existingChunks.length > 0) {
      return NextResponse.json({
        success: true,
        message: `File already has ${existingChunks.length} chunks`,
        chunksCount: existingChunks.length,
      });
    }

    if (!file.key) {
      return NextResponse.json(
        { error: "File key not found. Cannot retry chunk creation." },
        { status: 400 }
      );
    }

    console.log(`📁 Fetching file from R2: ${file.key}`);

    // Fetch file from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: file.key,
    });

    const r2Response = await r2Client.send(command);

    if (!r2Response.Body) {
      return NextResponse.json(
        { error: "File not found in R2 storage" },
        { status: 404 }
      );
    }

    // Convert stream to buffer
    const chunks_buffer: Uint8Array[] = [];
    const stream = r2Response.Body as Readable;
    
    for await (const chunk of stream) {
      chunks_buffer.push(chunk as Uint8Array);
    }
    
    const buffer = Buffer.concat(chunks_buffer);
    console.log(`✅ Fetched file from R2: ${buffer.length} bytes`);

    // Process file based on type
    let extractedText = "";

    try {
      if (file.fileType === "application/pdf" || file.name.endsWith(".pdf")) {
        console.log("🔄 Processing PDF file...");
        extractedText = await processHybridPdf(buffer, {
          extractImageText: true,
          maxPages: Infinity,
        });
      } else if (
        file.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        console.log("🔄 Processing DOCX file...");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (file.fileType === "text/plain" || file.name.endsWith(".txt")) {
        console.log("🔄 Processing text file...");
        extractedText = buffer.toString("utf-8");
      } else {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.fileType}` },
          { status: 400 }
        );
      }

      console.log(`✅ Extracted text length: ${extractedText.length}`);

      if (!extractedText || !extractedText.trim()) {
        return NextResponse.json(
          { error: "No text could be extracted from the file" },
          { status: 400 }
        );
      }

      // Create chunks
      const chunks = chunkText(extractedText);
      console.log(`📦 Creating ${chunks.length} chunks...`);

      const chunkPromises = chunks
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0)
        .map((chunk) =>
          db.chunk.create({
            data: {
              text: chunk,
              fileId: file.id,
            },
          })
        );

      await Promise.all(chunkPromises);
      console.log(`✅ Successfully created ${chunkPromises.length} chunks`);

      // Verify chunks were created
      const verifyChunks = await db.chunk.findMany({
        where: { fileId: file.id },
        select: { id: true },
      });

      console.log(`🔍 Verification: Found ${verifyChunks.length} chunks in database`);

      return NextResponse.json({
        success: true,
        message: `Successfully created ${verifyChunks.length} chunks`,
        chunksCreated: verifyChunks.length,
      });
    } catch (processingError) {
      console.error("❌ Error processing file:", processingError);
      console.error("❌ Error type:", processingError instanceof Error ? processingError.constructor.name : typeof processingError);
      console.error("❌ Error message:", processingError instanceof Error ? processingError.message : String(processingError));
      if (processingError instanceof Error && processingError.stack) {
        console.error("❌ Error stack:", processingError.stack);
      }

      return NextResponse.json(
        {
          error: "Failed to process file",
          message: processingError instanceof Error ? processingError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in retry-chunks API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

