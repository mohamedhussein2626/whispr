import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";

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

    // If no chunks found, return helpful error message
    if (chunks.length === 0 || !chunks.some((c) => c.text?.trim())) {
      console.error("❌ No chunks found for file");
      console.error("❌ File info:", {
        id: file.id,
        key: file.key,
        fileType: file.fileType,
        name: file.name,
        uploadStatus: file.uploadStatus,
      });
      console.error("❌ This usually means text extraction failed during upload");
      console.error("❌ User should call /api/retry-chunks to attempt chunk creation");
      
      return new Response(
        JSON.stringify({
          error: "PDF has no extractable text",
          message: "The file was uploaded but text extraction failed during processing. Please call /api/retry-chunks to attempt chunk creation, or re-upload the file.",
          fileId: file.id,
          hasKey: !!file.key,
          canRetry: !!file.key,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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
