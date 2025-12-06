import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";
// Import DOM polyfills before pdf-parse
import "@/lib/dom-polyfills";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import mammoth from "mammoth";

// Force Node.js runtime for R2 and stream operations
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for chunk retry

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { fileId, message } = SendMessageValidator.parse(body);

    const user = await getUserFromRequest();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const file = await db.file.findFirst({
      where: { 
        id: fileId, 
        userId: user.id  // CRITICAL: must match current user
      },
      select: {
        id: true,
        key: true,
        fileType: true,
        name: true,
        uploadStatus: true,
      },
    });

    if (!file) {
      console.error("File not found:", { fileId, userId: user.id });
      return new Response("File not found", { status: 404 });
    }

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: user.id,
        fileId,
      },
    });

    let chunks = await db.chunk.findMany({
      where: { fileId },
      take: 10,
    });

    // Debug: Log actual chunks from DB
    console.log("🔍 Chunks query result:", {
      fileId,
      count: chunks.length,
      chunkIds: chunks.map((c) => c.id),
      textLengths: chunks.map((c) => ({
        id: c.id,
        textLength: c.text?.length || 0,
        textPreview: c.text?.substring(0, 100) || "EMPTY",
      })),
    });

    // If no chunks found, automatically try to create them
    if (chunks.length === 0 || !chunks.some((c) => c.text?.trim())) {
      console.warn("⚠️ No chunks found for file, attempting automatic chunk creation...");
      console.warn("⚠️ File info:", {
        id: file.id,
        key: file.key,
        fileType: file.fileType,
        name: file.name,
        uploadStatus: file.uploadStatus,
      });

      // Only retry if we have a file key
      if (file.key) {
        try {
          console.log(`📁 Fetching file from R2: ${file.key}`);
          
          // Fetch file from R2
          const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: file.key,
          });

          const r2Response = await r2Client.send(command);

          if (!r2Response.Body) {
            throw new Error("File not found in R2 storage");
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
          }

          if (extractedText && extractedText.trim()) {
            console.log(`✅ Extracted text length: ${extractedText.length}`);
            
            // Create chunks using the same chunking logic
            const words = extractedText.split(/\s+/);
            const maxWords = 500;
            const chunkTexts: string[] = [];
            
            for (let i = 0; i < words.length; i += maxWords) {
              chunkTexts.push(words.slice(i, i + maxWords).join(" "));
            }

            console.log(`📦 Creating ${chunkTexts.length} chunks...`);

            const chunkPromises = chunkTexts
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

            // Re-fetch chunks
            const newChunks = await db.chunk.findMany({
              where: { fileId },
              take: 10,
            });
            
            if (newChunks.length > 0) {
              console.log(`✅ Auto-retry successful! Found ${newChunks.length} chunks`);
              chunks = newChunks; // Use the newly created chunks
            } else {
              throw new Error("Chunks were created but not found in database");
            }
          } else {
            throw new Error("No text could be extracted from the file");
          }
        } catch (retryError) {
          console.error("❌ Automatic chunk creation failed:", retryError);
          console.error("❌ Error type:", retryError instanceof Error ? retryError.constructor.name : typeof retryError);
          console.error("❌ Error message:", retryError instanceof Error ? retryError.message : String(retryError));
          
          return new Response(
            JSON.stringify({
              error: "PDF has no extractable text",
              message: "The file was uploaded but text extraction failed. Please try re-uploading the file.",
              fileId: file.id,
              retryFailed: true,
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // No file key, can't retry
        return new Response(
          JSON.stringify({
            error: "PDF has no extractable text",
            message: "The file was uploaded but text extraction failed during processing. File key is missing, please re-upload the file.",
            fileId: file.id,
            hasKey: false,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Direct fetch to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Notebooklama App",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
        messages: [
          {
            role: "system",
            content: "You are an intelligent assistant. Use the provided context from a PDF document to answer questions or summarize it. Respond in markdown.",
          },
          {
            role: "user",
            content: `Here is the extracted content from the PDF:\n\n${chunks.map((c) => c.text).join("\n\n")}\n\nNow, answer the following prompt: "${message}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", response.status, error);
      return new Response("API Error", { status: response.status });
    }

    const stream = OpenAIStream(response, {
      async onCompletion(completionText) {
        await db.message.create({
          data: {
            text: completionText,
            isUserMessage: false,
            fileId,
            userId: user.id,
          },
        });
      },
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("Error handling POST request:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
