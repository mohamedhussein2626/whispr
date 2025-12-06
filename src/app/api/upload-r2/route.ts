import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-api";
import { db } from "@/db";
import { uploadToR2, generateFileKey } from "@/lib/r2-upload";
import mammoth from "mammoth";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";

// Force Node.js runtime for this route to support pdf-parse
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large PDF processing

// Helper: Chunk long text into segments
function chunkText(text: string, maxWords = 500): string[] {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks;
}

// File processors for different file types
async function processPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Use hybrid processing (extracts both embedded text AND text from images)
  // Process ALL pages - no limit
  const text = await processHybridPdf(buffer, {
    extractImageText: true, // Also extract text from images/diagrams
    maxPages: Infinity, // Process ALL pages
  });

  return text;
}

async function processDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract text from DOCX
  const result = await mammoth.extractRawText({ buffer });
  const extractedContent = result.value;

  // Note: Mammoth.js can extract text from DOCX files with images
  // The images themselves are not extracted as separate entities in the raw text
  // but any text within images (if OCR was applied) would be included in the extracted text

  return extractedContent;
}

async function processDOC(file: File): Promise<string> {
  // For .doc files, we'll use mammoth as well since it can handle both
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extract text from DOC
  const result = await mammoth.extractRawText({ buffer });
  const extractedContent = result.value;

  // Note: Mammoth.js can extract text from DOC files with images
  // The images themselves are not extracted as separate entities in the raw text
  // but any text within images (if OCR was applied) would be included in the extracted text

  return extractedContent;
}

async function processTXT(file: File): Promise<string> {
  return await file.text();
}

async function processMD(file: File): Promise<string> {
  return await file.text();
}

async function processImage(file: File): Promise<string> {
  try {
    // Extract basic information about the image
    let description = `Image: ${file.name}\n`;
    description += `File type: ${file.type}\n`;
    description += `Size: ${file.size} bytes\n`;

    // For images, we can't extract text directly without OCR
    // But we can provide metadata that might be useful for AI processing
    description += `Note: This is an image file. For text extraction from images, OCR processing would be required.`;

    return description;
  } catch (error) {
    console.error("Error processing image:", error);
    return `Image: ${file.name}\nError processing image metadata.`;
  }
}

// Get file processor based on file type
function getFileProcessor(fileType: string) {
  switch (fileType) {
    case "application/pdf":
      return processPDF;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return processDOCX;
    case "application/msword":
      return processDOC;
    case "text/plain":
      return processTXT;
    case "text/markdown":
      return processMD;
    case "image/jpeg":
    case "image/jpg":
    case "image/png":
    case "image/gif":
    case "image/webp":
    case "image/bmp":
    case "image/tiff":
      return processImage;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Validate file type
function isValidFileType(fileType: string): boolean {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "text/markdown",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
  ];
  return allowedTypes.includes(fileType);
}

export async function POST(request: NextRequest) {
  try {
    // Get user session using Better Auth
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const topicId = (formData.get("topicId") as string) || undefined;
    const source = (formData.get("source") as string) || "upload"; // "upload", "webpage", "essay_writer", "essay_grader"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only PDF, DOC, DOCX, TXT, MD, and image files (JPEG, PNG, GIF, WebP, BMP, TIFF) are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (32MB limit)
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 32MB" },
        { status: 400 }
      );
    }

    // Generate unique key for the file
    const key = generateFileKey(file.name, session.user.id);

    // Validate topic ownership if provided
    let validatedTopicId: string | undefined = undefined;
    if (topicId) {
      const topic = await db.libraryTopic.findFirst({
        where: { id: topicId, userId: session.user.id },
        select: { id: true },
      });
      if (!topic) {
        return NextResponse.json({ error: "Invalid topicId" }, { status: 400 });
      }
      validatedTopicId = topic.id;
    }

    // Save initial file entry
    const createdFile = await db.file.create({
      data: {
        name: file.name,
        key: key,
        url: "", // Will be updated after upload
        fileType: file.type,
        source: source, // Use provided source (upload, webpage, essay_writer, essay_grader)
        userId: session.user.id,
        uploadStatus: "PROCESSING",
        topicId: validatedTopicId,
      },
    });

    try {
      // Upload to R2
      const uploadResult = await uploadToR2(file, key, file.type);

      // Use API route URL instead of direct R2 URL for secure access
      const apiUrl = `/api/file/${encodeURIComponent(key)}`;
      const fullUrl = new URL(apiUrl, request.url).toString();

      // Update file with API route URL
      await db.file.update({
        where: { id: createdFile.id },
        data: { url: fullUrl },
      });

      // Process file content based on file type
      let extractedText = "";
      let chunksCreated = 0;
      
      try {
      const processor = getFileProcessor(file.type);
        extractedText = await processor(file);
        console.log("✅ Extracted text length:", extractedText.length);
      console.log("Sample content:", extractedText.substring(0, 500));
        
        // Validate extracted text
        if (!extractedText || !extractedText.trim()) {
          console.warn("⚠️ Warning: Extracted text is empty or whitespace only");
        }
      } catch (processingError) {
        console.error("❌ Error processing file content:", processingError);
        // Don't fail the upload, but log the error
        extractedText = "";
      }

      // Chunk and insert the extracted text
      if (extractedText && extractedText.trim()) {
      const chunks = chunkText(extractedText);
        console.log(`📦 Creating ${chunks.length} chunks for file ${createdFile.id}`);
        
        try {
          // Create chunks in batch for better performance
          const chunkPromises = chunks.map((chunk) =>
            db.chunk.create({
            data: {
                text: chunk.trim(), // Trim whitespace
              fileId: createdFile.id,
            },
            })
          );
          
          await Promise.all(chunkPromises);
          chunksCreated = chunks.length;
          console.log(`✅ Successfully created ${chunksCreated} chunks`);
        } catch (chunkError) {
          console.error("❌ Error creating chunks:", chunkError);
          // Don't fail the upload if chunk creation fails
        }
      } else {
        console.warn("⚠️ No text extracted, skipping chunk creation. File uploaded but content extraction failed.");
        console.warn("⚠️ User will need to re-upload the file or content-based features won't work.");
      }

      // Success - update file status
      await db.file.update({
        where: { id: createdFile.id },
        data: { 
          uploadStatus: "SUCCESS",
          // Store chunk count for debugging
        },
      });

      console.log(`✅ Upload complete (File ID: ${createdFile.id}, Chunks: ${chunksCreated})`);

      return NextResponse.json({
        success: true,
        file: {
          id: createdFile.id,
          key: uploadResult.key,
          url: fullUrl, // Return the API route URL
          name: uploadResult.name,
        },
        chunksCreated,
        message: chunksCreated > 0 
          ? "File uploaded and processed successfully" 
          : "File uploaded but text extraction failed. Content-based features may not work.",
      });
    } catch (error) {
      console.error("❌ Error processing file:", error);
      await db.file.update({
        where: { id: createdFile.id },
        data: { uploadStatus: "FAILED" },
      });

      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
