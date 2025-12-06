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

  // Get chunks first (faster)
  const chunks = await db.chunk.findMany({
    where: { fileId },
    take: 30,
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
    const { essay, criteria, context, fileId, inputType, outputLanguage } = body;

    // If fileId is provided and inputType is "pdf", extract content from file
    let essayText = essay || "";
    if (fileId && inputType === "pdf") {
      try {
        const fileContent = await extractContentFromFile(fileId, sessionUser.user.id);
        essayText = fileContent;
        console.log(`Extracted ${fileContent.length} characters from file ${fileId} for grading`);
      } catch (error) {
        console.error("Error extracting content from file:", error);
        return NextResponse.json(
          { error: "Failed to extract content from uploaded file" },
          { status: 400 }
        );
      }
    }

    if (!essayText || !essayText.trim()) {
      return NextResponse.json(
        { error: "Essay text is required" },
        { status: 400 }
      );
    }

    console.log("Grading essay for user:", sessionUser.user.id);
    console.log("Essay length:", essayText.length);
    if (fileId) {
      console.log("Using file content from fileId:", fileId);
    }

    // Create a comprehensive prompt for essay grading
    const languageInstruction = outputLanguage && outputLanguage !== "English" 
      ? `IMPORTANT: Provide all feedback, strengths, improvements, and suggestions in ${outputLanguage}. All text must be in ${outputLanguage}.`
      : "";

    const systemPrompt = `You are an expert academic writing instructor and essay grader. Your task is to provide comprehensive feedback and grading for the submitted essay.

${languageInstruction}

Grading criteria to evaluate:
1. Content and Ideas (25 points): Thesis clarity, argument strength, evidence quality, depth of analysis
2. Organization and Structure (20 points): Logical flow, paragraph structure, transitions, introduction/conclusion
3. Language and Style (20 points): Clarity, conciseness, vocabulary, sentence variety
4. Grammar and Mechanics (15 points): Grammar, punctuation, spelling, sentence structure
5. Originality and Creativity (10 points): Unique insights, creative approach, fresh perspective
6. Adherence to Requirements (10 points): Following prompt, word count, format requirements

${criteria ? `Additional grading criteria: ${criteria}` : ''}

${context ? `Additional context: ${context}` : ''}

Provide:
1. Overall score out of 100
2. Letter grade (A+, A, B+, B, C+, C, D, F)
3. Detailed feedback explaining the score
4. At least 3 specific strengths
5. At least 3 specific areas for improvement
6. Actionable suggestions for improvement

${languageInstruction ? `REMEMBER: All output must be in ${outputLanguage}.` : ''}

Format your response as JSON with the following structure:
{
  "score": number (0-100),
  "grade": string (A+, A, B+, B, C+, C, D, F),
  "feedback": string (detailed feedback),
  "strengths": string[] (array of strengths),
  "improvements": string[] (array of improvement areas)
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please grade this essay:\n\n${essayText}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: "Failed to grade essay" },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response
      const grading = JSON.parse(response);
      
      // Validate the response structure
      if (!grading.score || !grading.grade || !grading.feedback || !grading.strengths || !grading.improvements) {
        throw new Error("Invalid grading response structure");
      }

      return NextResponse.json({
        success: true,
        grading: grading,
      });
    } catch (parseError) {
      console.error("Error parsing grading response:", parseError);
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        success: true,
        grading: {
          score: 75,
          grade: "B",
          feedback: response,
          strengths: ["Good effort", "Clear structure", "Relevant content"],
          improvements: ["Improve grammar", "Strengthen arguments", "Add more evidence"]
        }
      });
    }
  } catch (error) {
    console.error("Error grading essay:", error);
    return NextResponse.json(
      { 
        error: "Failed to grade essay. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}