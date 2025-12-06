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
  apiKey: process.env.OPENAI_API_KEY, // use your OpenAI key here
  // No need to set baseURL – default points to OpenAI
});

// Add at the top, after imports
interface QuizQuestion {
  question: string;
  options: string[];
  answer: "A" | "B" | "C" | "D";
}

export async function POST(req: NextRequest) {
  try {
    // Get user session using Better Auth
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    console.log("=== CREATE QUIZ API CALLED ===");
    console.log("Create quiz API called with fileId:", fileId);

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
      take: 30, // Get more content for better generation
      orderBy: { createdAt: "asc" },
    });

    console.log("Number of chunks found:", chunks.length);

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
    console.log(
      "PDF content preview (first 1000 chars):",
      pdfContent.substring(0, 1000),
    );
    console.log(
      "PDF content preview (last 500 chars):",
      pdfContent.substring(pdfContent.length - 500),
    );

    // Enhanced prompt for real content generation
    const prompt = `
You are an expert quiz creator. Based on the following PDF content, create 5 challenging multiple-choice questions that test understanding of the specific facts, details, and key information mentioned in the text.

CRITICAL REQUIREMENTS:
1. Create exactly 5 questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Questions MUST be specific to the actual content provided - use real facts, names, dates, and details from the text
5. Do NOT create generic questions - make them specific to what's actually in the PDF
6. Use exact names, facts, and details mentioned in the content
7. Return ONLY valid JSON in this exact format:

[
  {
    "question": "Specific question about actual content from the PDF",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A"
  }
]

PDF Content to analyze:
${pdfContent}

IMPORTANT: Create questions that test knowledge of the specific facts, people, events, and details mentioned in this exact content. Do not create generic questions.

Generate the quiz now:`;

    console.log("Sending prompt to OpenAI...");

    // Call OpenAI with enhanced retry logic
    let questions = null;
    let attempts = 0;
    const maxAttempts = 5; // Increased attempts

    while (!questions && attempts < maxAttempts) {
      attempts++;
      console.log(`=== ATTEMPT ${attempts} TO GENERATE QUIZ ===`);

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4", // Use GPT-4 here

          temperature: 0.1,
          max_tokens: 3000, // Increased tokens
          messages: [
            {
              role: "system",
              content:
                "You are a professional quiz creator. You must create questions that are SPECIFIC to the provided content. Use exact facts, names, dates, and details from the text. Never create generic questions. Always respond with valid JSON only. If you cannot create specific questions from the content, respond with an empty array [].",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const raw = response.choices[0]?.message?.content?.trim();
        console.log("=== LLM RAW RESPONSE ===");
        console.log("LLM raw response:", raw);

        if (!raw) {
          throw new Error("Empty response from LLM");
        }

        // Try multiple parsing strategies
        let parsedQuestions = null;

        // Strategy 1: Direct JSON parse
        try {
          parsedQuestions = JSON.parse(raw);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            questions = parsedQuestions as QuizQuestion[];
            console.log("Successfully parsed JSON directly");
            break;
          }
        } catch {
          console.log("Direct JSON parse failed, trying extraction...");
        }

        // Strategy 2: Extract JSON from markdown code blocks
        const codeBlockMatch = raw.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (codeBlockMatch) {
          try {
            parsedQuestions = JSON.parse(codeBlockMatch[1]);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              questions = parsedQuestions as QuizQuestion[];
              console.log("Successfully parsed JSON from code block");
              break;
            }
          } catch {
            console.log("Code block JSON parse failed");
          }
        }

        // Strategy 3: Extract first JSON array
        const arrayMatch = raw.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          try {
            parsedQuestions = JSON.parse(arrayMatch[0]);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              questions = parsedQuestions as QuizQuestion[];
              console.log("Successfully parsed JSON array");
              break;
            }
          } catch {
            console.log("Array extraction parse failed");
          }
        }

        // Strategy 4: Clean and try to parse
        const cleaned = raw
          .replace(/^[^{]*/, "")
          .replace(/[^}]*$/, "")
          .replace(/```/g, "")
          .trim();

        try {
          parsedQuestions = JSON.parse(cleaned);
          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            questions = parsedQuestions as QuizQuestion[];
            console.log("Successfully parsed cleaned JSON");
            break;
          }
        } catch {
          console.log("Cleaned JSON parse failed");
        }

        // If all parsing strategies failed, try again
        if (!questions) {
          console.log(`Attempt ${attempts} failed to parse JSON, retrying...`);
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased delay
          }
        }
      } catch (error: unknown) {
        console.error(`Error in attempt ${attempts}:`, error);
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    // If AI fails completely, return error instead of static content
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.log("=== AI GENERATION FAILED COMPLETELY ===");
      console.log("AI generation failed completely after all attempts");
      return NextResponse.json(
        {
          error:
            "Failed to generate quiz questions from PDF content. Please try again.",
        },
        { status: 500 },
      );
    }

    // Validate and clean questions
    questions = questions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.answer &&
        ["A", "B", "C", "D"].includes(q.answer),
    );

    if (questions.length === 0) {
      console.log("=== VALIDATION FAILED ===");
      console.log("Generated questions are not in the correct format");
      return NextResponse.json(
        {
          error:
            "Generated questions are not in the correct format. Please try again.",
        },
        { status: 500 },
      );
    }

    console.log("=== QUIZ GENERATION SUCCESSFUL ===");
    console.log(
      `Generated ${questions.length} valid quiz questions from PDF content:`,
    );
    questions.forEach((q, index) => {
      console.log(`Question ${index + 1}:`, q.question);
      console.log(`Options:`, q.options);
      console.log(`Answer:`, q.answer);
    });

    // Save quiz to DB
    try {
      const quiz = await db.quiz.create({
        data: {
          fileId,
          title: "Generated Quiz",
          questions: {
            create: questions.map((q: QuizQuestion) => ({
              question: q.question,
              options: q.options,
              answer: q.answer,
            })),
          },
        },
        include: { questions: true },
      });

      console.log("=== QUIZ SAVED TO DATABASE ===");
      console.log("Quiz saved to database successfully");
      console.log("Quiz ID:", quiz.id);
      console.log("Number of questions saved:", quiz.questions.length);
      return NextResponse.json({ quiz });
    } catch (dbError: unknown) {
      console.error("=== DATABASE ERROR ===");
      console.error("Database error:", dbError);
      // Return the generated questions even if DB save fails
      console.log("Database save failed, returning generated questions");
      const quiz = {
        id: "generated-quiz-id",
        fileId,
        title: "Generated Quiz",
        questions: questions.map((q: QuizQuestion, index: number) => ({
          id: `question-${index}`,
          quizId: "generated-quiz-id",
          question: q.question,
          options: q.options,
          answer: q.answer,
          createdAt: new Date(),
        })),
        createdAt: new Date(),
      };
      return NextResponse.json({ quiz });
    }
  } catch (error: unknown) {
    console.error("=== API ERROR ===");
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 },
    );
  }
}
