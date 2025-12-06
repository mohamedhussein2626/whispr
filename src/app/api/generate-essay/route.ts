import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import OpenAI from "openai";
import { db } from "@/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import { Readable } from "stream";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract content from file
async function extractContentFromFile(fileId: string, userId: string): Promise<string> {
  // Get file from database
  const file = await db.file.findFirst({
    where: { id: fileId, userId },
    select: { id: true, key: true, fileType: true },
  });

  if (!file || !file.key) {
    throw new Error("File not found");
  }

  // Get chunks first (faster) - get more chunks to capture full document
  const chunks = await db.chunk.findMany({
    where: { fileId },
    take: 100, // Increased to get more content
    orderBy: { createdAt: "asc" },
  });

  if (chunks.length > 0) {
    return chunks.map((c) => c.text).join("\n\n");
  }

  // If no chunks, extract from R2
  if (file.fileType === "application/pdf") {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: file.key,
    });

    const r2Response = await r2Client.send(command);
    if (!r2Response.Body) {
      throw new Error("File not found in R2 storage");
    }

    const chunks_buffer: Uint8Array[] = [];
    const stream = r2Response.Body as Readable;
    for await (const chunk of stream) {
      chunks_buffer.push(chunk as Uint8Array);
    }
    const buffer = Buffer.concat(chunks_buffer);

    const extractedText = await processHybridPdf(buffer, {
      extractImageText: false,
      maxPages: Infinity,
    });

    return extractedText || "";
  }

  // For other file types, try to get from chunks or return empty
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, context, fileId } = body;

    // If fileId is provided, extract content from file
    let fileContent = "";
    if (fileId) {
      try {
        fileContent = await extractContentFromFile(fileId, sessionUser.user.id);
        console.log(`Extracted ${fileContent.length} characters from file ${fileId}`);
      } catch (error) {
        console.error("Error extracting content from file:", error);
        return NextResponse.json(
          { error: "Failed to extract content from uploaded file" },
          { status: 400 }
        );
      }
    }

    // Build the final prompt
    const finalPrompt = prompt || "";
    
    console.log("Generating essay for user:", sessionUser.user.id);
    console.log("Original prompt:", finalPrompt);
    if (fileId) {
      console.log("Using file content from fileId:", fileId);
      console.log(`File content length: ${fileContent.length} characters`);
    }

    // Create a comprehensive prompt for essay generation
    let systemPrompt = `You are an expert essay writer and academic writing assistant. Your task is to generate a well-structured, high-quality essay.`;

    let userMessage = "";

    if (fileContent && fileContent.trim()) {
      // If file content is provided, generate essay BASED ON the file content
      systemPrompt = `You are an expert essay writer and academic writing assistant. Your task is to generate a well-structured, high-quality essay BASED ON the content provided in the uploaded document.

CRITICAL INSTRUCTIONS:
1. The essay MUST be generated from and based on the actual content of the uploaded document
2. Extract key information, themes, and details from the document
3. Use the document's content as the PRIMARY source for your essay
4. Do NOT use generic or template content - use the actual data and information from the document
5. If the document contains specific data (like test results, reports, etc.), incorporate that actual data into your essay
6. Maintain the context and meaning from the original document

Guidelines for essay generation:
1. Create a clear and compelling thesis statement based on the document content
2. Use proper essay structure (introduction, body paragraphs, conclusion)
3. Include specific details and information from the document
4. Maintain academic tone and style
5. Ensure logical flow and coherence
6. Use proper transitions between paragraphs
7. Write in clear, concise language
8. Aim for 500-1000 words unless specified otherwise

${context ? `Additional context: ${context}` : ''}

Generate a comprehensive essay that is directly based on and derived from the uploaded document's content.`;

      // Limit file content to avoid token limits, but use more of it (up to 12000 chars)
      const fileContentPreview = fileContent.length > 12000 
        ? fileContent.substring(0, 12000) + "\n\n[... content truncated ...]"
        : fileContent;

      userMessage = `${finalPrompt ? `${finalPrompt}\n\n` : ''}DOCUMENT CONTENT (Generate essay based on this content):\n\n${fileContentPreview}`;
    } else {
      // No file content - use standard essay generation
      systemPrompt = `You are an expert essay writer and academic writing assistant. Your task is to generate a well-structured, high-quality essay based on the given prompt.

Guidelines for essay generation:
1. Create a clear and compelling thesis statement
2. Use proper essay structure (introduction, body paragraphs, conclusion)
3. Include relevant examples and evidence
4. Maintain academic tone and style
5. Ensure logical flow and coherence
6. Use proper transitions between paragraphs
7. Write in clear, concise language
8. Aim for 500-1000 words unless specified otherwise

${context ? `Additional context: ${context}` : ''}

Generate a comprehensive essay that addresses the prompt thoroughly and professionally.`;

      if (!finalPrompt || !finalPrompt.trim()) {
        return NextResponse.json(
          { error: "Essay prompt is required when no file is uploaded" },
          { status: 400 }
        );
      }

      userMessage = finalPrompt;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const essay = completion.choices[0]?.message?.content;

    if (!essay) {
      return NextResponse.json(
        { error: "Failed to generate essay" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      essay: essay,
    });
  } catch (error) {
    console.error("Error generating essay:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate essay. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}