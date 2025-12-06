import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUserFromRequest } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import { Readable } from "stream";

// Force Node.js runtime for PDF processing
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for PDF processing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get user session using Better Auth
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    console.log("Create transcript API called with fileId:", fileId);

    // Verify user owns the file
    const file = await db.file.findFirst({
      where: { id: fileId, userId: user.id },
      select: {
        id: true,
        key: true,
        url: true,
        name: true,
        fileType: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    if (!file.key) {
      return NextResponse.json(
        { error: "File key not found. Please re-upload the file." },
        { status: 400 }
      );
    }

    // Fetch PDF content (chunks)
    const chunks = await db.chunk.findMany({
      where: { fileId },
      take: 30, // Get more chunks for comprehensive transcript
      orderBy: { createdAt: "asc" }, // Ensure we get content in order
    });

    let pdfContent = "";

    // If no chunks exist, try to extract text from the PDF file directly from R2
    if (!chunks.length) {
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
          pdfContent = extractedText;
          console.log(`✅ Fallback extraction successful: ${pdfContent.length} characters`);
          
          // Save chunks for future use (using word-based chunking for consistency)
          const words = pdfContent.split(/\s+/);
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
            error: "No PDF content found for this file. Please ensure the PDF was uploaded and processed successfully.",
            details: fallbackError instanceof Error ? fallbackError.message : "Unknown error"
          },
          { status: 400 },
        );
      }
    } else {
      // Use existing chunks
      pdfContent = chunks.map((c) => c.text).join("\n\n");
      console.log(`✅ Using ${chunks.length} existing chunks`);
    }
    console.log("PDF content length:", pdfContent.length);
    console.log("PDF content preview:", pdfContent.substring(0, 500));

    // Enhanced prompt for better transcript generation
    const prompt = `
You are an expert transcript creator. Based on the following PDF content, create a comprehensive, well-structured transcript that maintains all the important information while improving readability and organization.

CRITICAL REQUIREMENTS:
1. Preserve ALL important facts, names, dates, and details from the original content
2. Organize the content into logical sections with clear headings
3. Maintain the chronological order and flow of information
4. Use proper paragraph breaks and formatting
5. Make the text more readable while keeping all original information
6. Do NOT add any information that is not in the original content
7. Do NOT remove any important details from the original content
8. Return ONLY the formatted transcript text

PDF Content to transcribe:
${pdfContent}

Create a well-structured transcript now:`;

    // Call OpenAI with enhanced retry logic
    let transcriptText = null;
    let attempts = 0;
    const maxAttempts = 5; // Increased attempts

    while (!transcriptText && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} to generate transcript...`);

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4", // Use GPT-4 here

          temperature: 0.1, // Very low temperature for consistent output
          max_tokens: 4000, // Increased for longer transcripts
          messages: [
            {
              role: "system",
              content:
                "You are a professional transcript creator. You must preserve ALL information from the provided content while improving formatting and readability. Never add or remove important facts. If you cannot create a proper transcript from the content, respond with 'Unable to generate transcript from provided content.'",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        transcriptText = response.choices[0]?.message?.content?.trim();
        console.log("Transcript generated successfully");

        if (!transcriptText) {
          throw new Error("Empty response from LLM");
        }

        // Check if the response indicates failure
        if (
          transcriptText.toLowerCase().includes("unable to generate") ||
          transcriptText.toLowerCase().includes("cannot create")
        ) {
          throw new Error("LLM indicated it cannot generate transcript");
        }

        break;
      } catch (error) {
        console.error(`Error in attempt ${attempts}:`, error);
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased delay
        }
      }
    }

    // If AI fails completely, return error instead of static content
    if (!transcriptText) {
      console.log("AI generation failed completely after all attempts");
      return NextResponse.json(
        {
          error:
            "Failed to generate transcript from PDF content. Please try again.",
        },
        { status: 500 },
      );
    }

    // Save transcript to DB
    try {
      const transcript = await db.transcript.create({
        data: {
          fileId,
          title: "Generated Transcript",
          content: transcriptText,
        },
      });

      console.log("Transcript saved to database successfully");
      return NextResponse.json({ transcript });
    } catch (dbError: unknown) {
      console.error("Database error:", dbError);
      // Return the generated transcript even if DB save fails
      console.log("Database save failed, returning generated transcript");
      const transcript = {
        id: "generated-transcript-id",
        fileId,
        title: "Generated Transcript",
        content: transcriptText,
        createdAt: new Date(),
      };
      return NextResponse.json({ transcript });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create transcript" },
      { status: 500 },
    );
  }
}
