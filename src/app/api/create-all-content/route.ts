import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUserFromRequest } from "@/lib/auth";
import { processHybridPdf } from "@/lib/pdf-ocr-hybrid";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { Readable } from "stream";

// Force Node.js runtime for PDF processing
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for PDF processing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // use your OpenAI key here
  // No need to set baseURL – default points to OpenAI
});

export async function POST(req: NextRequest) {
  try {
    // Get user session using Better Auth
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, topicId } = await req.json();
    console.log("🔥 Create all content API called with fileId:", fileId, "topicId:", topicId);
    console.log("📋 Request body:", JSON.stringify({ fileId, topicId }));

    let files: Array<{ id: string; key: string; name: string; fileType: string | null }> = [];
    let pdfContent = "";

    // If topicId is provided, get all files from the topic
    if (topicId) {
      console.log("📚 Topic mode: Combining all files from topic:", topicId);

      // Verify topic ownership
      const topic = await db.libraryTopic.findFirst({
        where: { id: topicId, userId: user.id },
        include: {
          files: {
            where: {
              source: {
                notIn: ["essay_writer", "essay_grader"],
              },
            },
            select: {
              id: true,
              key: true,
              name: true,
              fileType: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!topic) {
        return NextResponse.json({ error: "Topic not found or access denied" }, { status: 404 });
      }

      files = topic.files;
      console.log(`📚 Found ${files.length} files in topic`);

      if (files.length === 0) {
        return NextResponse.json(
          { error: "No files found in this topic" },
          { status: 400 }
        );
      }

      // Combine chunks from all files in the topic
      const allChunks = await db.chunk.findMany({
        where: {
          fileId: { in: files.map(f => f.id) },
        },
        take: 100, // Get more chunks when combining multiple files
        orderBy: { createdAt: "asc" },
      });

      if (allChunks.length > 0) {
        pdfContent = allChunks.map((c) => c.text).join("\n\n");
        console.log(`✅ Combined ${allChunks.length} chunks from ${files.length} files: ${pdfContent.length} characters`);
      } else {
        // If no chunks, extract from all files
        console.log("⚠️ No chunks found, extracting from all files in topic...");
        const extractedTexts: string[] = [];
        
        for (const file of files) {
          if (!file.key) continue;
          
          try {
            const command = new GetObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: file.key,
            });
            const r2Response = await r2Client.send(command);
            if (!r2Response.Body) continue;

            const chunks_buffer: Uint8Array[] = [];
            const stream = r2Response.Body as Readable;
            for await (const chunk of stream) {
              chunks_buffer.push(chunk as Uint8Array);
            }
            const buffer = Buffer.concat(chunks_buffer);

            if (file.fileType === "application/pdf") {
              const extractedText = await processHybridPdf(buffer, {
                extractImageText: true,
                maxPages: Infinity,
              });
              if (extractedText && extractedText.trim()) {
                extractedTexts.push(`\n\n--- File: ${file.name} ---\n\n${extractedText}`);
              }
            }
          } catch (error) {
            console.error(`Error extracting from file ${file.name}:`, error);
          }
        }

        pdfContent = extractedTexts.join("\n\n");
        console.log(`✅ Extracted text from ${extractedTexts.length} files: ${pdfContent.length} characters`);
      }
    } else {
      // Single file mode (existing logic)
      console.log("📄 Single file mode - fetching file with ID:", fileId);
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
        console.error("❌ File not found:", fileId);
        return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
      }
      
      console.log("✅ File found:", file.name, "ID:", file.id);

      if (!file.key) {
        return NextResponse.json(
          { error: "File key not found. Please re-upload the file." },
          { status: 400 }
        );
      }

      files = [file];

    // Fetch PDF content (chunks)
      let chunks = await db.chunk.findMany({
      where: { fileId },
      take: 30, // Get more chunks for comprehensive content
      orderBy: { createdAt: "asc" },
    });

      // If no chunks exist, try to extract text from the PDF file directly from R2
    if (!chunks.length) {
        console.log("⚠️ No chunks found, attempting fallback text extraction from R2...");
        console.log(`📁 File key: ${file.key}`);
        console.log(`📁 File ID: ${file.id}`);
        console.log(`📁 File name: ${file.name}`);
        
        try {
        // Read directly from R2 using the file key
        console.log("🔄 Step 1: Fetching file from R2...");
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.key,
        });

        const r2Response = await r2Client.send(command);

        if (!r2Response.Body) {
          throw new Error("File not found in R2 storage");
        }

        // Convert the stream to a buffer
        console.log("🔄 Step 2: Converting stream to buffer...");
        const chunks_buffer: Uint8Array[] = [];
        const stream = r2Response.Body as Readable;
        
        for await (const chunk of stream) {
          chunks_buffer.push(chunk as Uint8Array);
        }
        
        const buffer = Buffer.concat(chunks_buffer);
        console.log(`✅ Fetched PDF from R2: ${buffer.length} bytes`);
        
        // Validate PDF buffer
        if (!buffer || buffer.length === 0) {
          throw new Error("PDF buffer is empty after fetching from R2");
        }
        
        // Check PDF header
        const pdfHeader = buffer.slice(0, 4).toString();
        if (pdfHeader !== '%PDF') {
          console.error(`❌ Invalid PDF header: "${pdfHeader}" (expected "%PDF")`);
          throw new Error(`Invalid PDF file: file does not appear to be a valid PDF (header: ${pdfHeader})`);
        }
        console.log(`✅ PDF header validated: ${pdfHeader}`);

        // Extract text using hybrid PDF processor
        console.log("🔄 Step 3: Extracting text from PDF...");
        let extractedText = "";
        
        try {
          extractedText = await processHybridPdf(buffer, {
            extractImageText: false, // Faster extraction without OCR
            maxPages: Infinity, // Process ALL pages
          });
          console.log(`✅ PDF processing completed: ${extractedText.length} characters extracted`);
        } catch (pdfError) {
          console.error("❌ PDF processing error:", pdfError);
          console.error("❌ Error details:", pdfError instanceof Error ? pdfError.stack : pdfError);
          
          // Provide more helpful error messages
          if (pdfError instanceof Error) {
            if (pdfError.message.includes("PDF has no pages")) {
              throw new Error("The PDF file appears to be empty or corrupted. Please try uploading a different PDF file.");
            }
            if (pdfError.message.includes("pdf-parse")) {
              throw new Error(`PDF processing library failed to load: ${pdfError.message}. Please check server logs.`);
            }
            if (pdfError.message.includes("Invalid PDF")) {
              throw new Error(`Invalid PDF file: ${pdfError.message}`);
            }
          }
          throw pdfError;
        }

        if (extractedText && extractedText.trim()) {
          pdfContent = extractedText;
          console.log(`✅ Fallback extraction successful: ${pdfContent.length} characters`);
          
          // Save chunks for future use (using word-based chunking for consistency)
          console.log("🔄 Step 4: Creating chunks from extracted text...");
          const words = pdfContent.split(/\s+/);
          const maxWords = 500;
          const chunkTexts: string[] = [];
          
          for (let i = 0; i < words.length; i += maxWords) {
            chunkTexts.push(words.slice(i, i + maxWords).join(" "));
          }
          
          console.log(`📦 Creating ${chunkTexts.length} chunks...`);
          const chunkPromises = chunkTexts.map((chunkText) =>
            db.chunk.create({
              data: {
                text: chunkText.trim(),
                fileId: file.id,
              },
            })
          );
          
          await Promise.all(chunkPromises);
          console.log(`✅ Created ${chunkTexts.length} chunks successfully`);
          
          // Re-fetch chunks to use them
          chunks = await db.chunk.findMany({
            where: { fileId },
            take: 30,
            orderBy: { createdAt: "asc" },
          });
          console.log(`✅ Verified: ${chunks.length} chunks now available`);
        } else {
          console.warn("⚠️ No text extracted from PDF - PDF might be image-only or corrupted");
          // Return error response instead of throwing
          return NextResponse.json(
            { 
              error: "No PDF content found for this file. Please ensure the PDF was uploaded and processed successfully. The PDF might be image-only (scanned document), corrupted, or password-protected.",
              details: "Text extraction returned empty result. Try uploading a PDF with selectable text or ensure the PDF is not corrupted.",
              suggestion: "If this is a scanned PDF, try using OCR software to convert it to a text-based PDF first."
            },
            { status: 400 }
          );
        }
      } catch (fallbackError) {
        console.error("❌ Fallback extraction failed:", fallbackError);
        console.error("❌ Error stack:", fallbackError instanceof Error ? fallbackError.stack : "No stack trace");
        
        // Double-check if chunks were created in the meantime
        const retryChunks = await db.chunk.findMany({
          where: { fileId },
          take: 30,
          orderBy: { createdAt: "asc" },
        });
        
        if (retryChunks.length > 0) {
          console.log(`✅ Found ${retryChunks.length} chunks on retry - using them`);
          pdfContent = retryChunks.map((c) => c.text).join("\n\n");
          chunks = retryChunks;
        } else {
          return NextResponse.json(
            { 
              error: "No PDF content found for this file. Please ensure the PDF was uploaded and processed successfully.",
              details: fallbackError instanceof Error ? fallbackError.message : "Unknown error",
              suggestion: "Try re-uploading the PDF file. If the issue persists, the PDF might be corrupted or password-protected."
            },
            { status: 400 },
          );
        }
      }
    } else {
      // Use existing chunks
      pdfContent = chunks.map((c) => c.text).join("\n\n");
      console.log(`✅ Using ${chunks.length} existing chunks, content length: ${pdfContent.length}`);
    }
  }
    
    // Final validation - check if we have meaningful content
    const trimmedContent = pdfContent.trim();
    if (!trimmedContent || trimmedContent.length < 50) {
      console.error(`❌ PDF content is too short: ${trimmedContent.length} characters`);
      console.error(`❌ Content preview: ${trimmedContent.substring(0, 200)}`);
      return NextResponse.json(
        { 
          error: "No PDF content available. The PDF file might be empty, corrupted, or image-only (scanned document).",
          details: `Extracted content length: ${trimmedContent.length} characters (minimum required: 50)`,
          suggestion: "Please upload a PDF with selectable text. Scanned PDFs (image-only) are not supported. If your PDF is scanned, use OCR software to convert it to text-based PDF first."
        },
        { status: 400 },
      );
    }

    // Use trimmed content for AI generation
    pdfContent = trimmedContent;
    console.log(`✅ PDF content validated: ${pdfContent.length} characters available for AI generation`);

    // For topic mode, use the first file's ID for content storage
    // Content will be generated from all files but saved to the primary file
    const primaryFileId = files[0]?.id || fileId;
    
    // Check if content already exists (check primary file)
    const existingQuiz = await db.quiz.findFirst({ where: { fileId: primaryFileId } });
    const existingFlashcards = await db.flashcards.findFirst({
      where: { fileId: primaryFileId },
    });
    const existingTranscript = await db.transcript.findFirst({
      where: { fileId: primaryFileId },
    });

    if (existingQuiz && existingFlashcards && existingTranscript) {
      console.log("All content already exists, returning existing data");
      return NextResponse.json({
        quiz: existingQuiz,
        flashcards: existingFlashcards,
        transcript: existingTranscript,
        message: "Content already exists",
      });
    }

    // Enhanced prompts for real content generation
    // Limit PDF content length to avoid token limits (keep last 8000 chars for context)
    const contentForAI = pdfContent.length > 8000 
      ? pdfContent.slice(-8000) 
      : pdfContent;
    console.log(`📊 Using ${contentForAI.length} characters for AI prompts (from ${pdfContent.length} total)`);
    
    const quizPrompt = `
You are an expert quiz creator. Based on the following PDF content, create 5 challenging multiple-choice questions that test understanding of the specific facts, details, and key information mentioned in the text.

CRITICAL REQUIREMENTS:
1. Create exactly 5 questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Only one option should be correct
4. Questions MUST be specific to the actual content provided - use real facts, names, dates, and details from the text
5. Do NOT create generic questions - make them specific to what's actually in the PDF
6. Use exact names, facts, and details mentioned in the content
7. Return ONLY valid JSON in this exact format (no markdown, no explanation, just JSON):

[
  {
    "question": "Specific question about actual content from the PDF",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A"
  }
]

PDF Content to analyze:
${contentForAI}

IMPORTANT: Create questions that test knowledge of the specific facts, people, events, and details mentioned in this exact content. Do not create generic questions. Return ONLY the JSON array, nothing else.`;

    const flashcardsPrompt = `
You are an expert flashcard creator. Based on the following PDF content, create 16 educational flashcards that cover specific facts, details, and key information mentioned in the text.

CRITICAL REQUIREMENTS:
1. Create exactly 16 flashcards
2. Each flashcard must have a clear, specific question and a concise, accurate answer
3. Questions MUST be specific to the actual content provided - use real facts, names, dates, and details from the text
4. Do NOT create generic flashcards - make them specific to what's actually in the PDF
5. Use exact names, facts, and details mentioned in the content
6. Cover different types of questions: definitions, facts, achievements, career details, statistics, etc.
7. Return ONLY valid JSON in this exact format (no markdown, no explanation, just JSON):

[
  {
    "question": "Specific question about actual content from the PDF",
    "answer": "Concise, accurate answer based on the specific content"
  }
]

PDF Content to analyze:
${contentForAI}

IMPORTANT: Create flashcards that test knowledge of the specific facts, people, events, achievements, and details mentioned in this exact content. Do not create generic flashcards. Return ONLY the JSON array, nothing else.`;

    const transcriptPrompt = `
You are an expert transcript creator. Based on the following PDF content, create a comprehensive, well-structured transcript that maintains all the important information while improving readability and organization.

CRITICAL REQUIREMENTS:
1. Preserve ALL important facts, names, dates, and details from the original content
2. Organize the content into logical sections with clear headings
3. Maintain the chronological order and flow of information
4. Use proper paragraph breaks and formatting
5. Make the text more readable while keeping all original information
6. Do NOT add any information that is not in the original content
7. Do NOT remove any important details from the original content
8. Return ONLY the formatted transcript text (no markdown code blocks, just the text)

PDF Content to transcribe:
${contentForAI}

Create a well-structured transcript now:`;

    // Generate all content in parallel with enhanced retry logic
    console.log("🔄 Starting AI content generation...");
    console.log(`📊 PDF content length: ${pdfContent.length} characters`);
    console.log(`📊 PDF content preview (first 500 chars): ${pdfContent.substring(0, 500)}...`);
    
    let quizResponse, flashcardsResponse, transcriptResponse;
    try {
      [quizResponse, flashcardsResponse, transcriptResponse] =
      await Promise.all([
        // Quiz generation
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.1,
          max_tokens: 3000,
          messages: [
            {
              role: "system",
              content:
                "You are a professional quiz creator. You must create questions that are SPECIFIC to the provided content. Use exact facts, names, dates, and details from the text. Never create generic questions. Always respond with valid JSON only. If you cannot create specific questions from the content, respond with an empty array [].",
            },
            {
              role: "user",
              content: quizPrompt,
            },
          ],
        }),
        // Flashcards generation
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.1,
          max_tokens: 3500,
          messages: [
            {
              role: "system",
              content:
                "You are a professional flashcard creator. You must create flashcards that are SPECIFIC to the provided content. Use exact facts, names, dates, and details from the text. Never create generic flashcards. Always respond with valid JSON only. If you cannot create specific flashcards from the content, respond with an empty array [].",
            },
            {
              role: "user",
              content: flashcardsPrompt,
            },
          ],
        }),
        // Transcript generation
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.1,
          max_tokens: 4000,
          messages: [
            {
              role: "system",
              content:
                "You are a professional transcript creator. You must preserve ALL information from the provided content while improving formatting and readability. Never add or remove important facts. If you cannot create a proper transcript from the content, respond with 'Unable to generate transcript from provided content.'",
            },
            {
              role: "user",
              content: transcriptPrompt,
            },
          ],
        }),
      ]);
      
      console.log("✅ AI content generation completed");
      console.log(`📊 Quiz response: ${quizResponse.choices[0]?.message?.content?.length || 0} chars`);
      console.log(`📊 Flashcards response: ${flashcardsResponse.choices[0]?.message?.content?.length || 0} chars`);
      console.log(`📊 Transcript response: ${transcriptResponse.choices[0]?.message?.content?.length || 0} chars`);
    } catch (aiError) {
      console.error("❌ Error calling OpenAI API:", aiError);
      console.error("❌ AI error details:", aiError instanceof Error ? aiError.message : String(aiError));
      if (aiError instanceof Error && aiError.stack) {
        console.error("❌ AI error stack:", aiError.stack);
      }
      return NextResponse.json(
        {
          error: "Failed to generate content using AI. Please check your API key and try again.",
          details: aiError instanceof Error ? aiError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Add types for quiz and flashcards
    type QuizQuestion = {
      question: string;
      options: string[];
      answer: "A" | "B" | "C" | "D";
    };

    type Flashcard = {
      question: string;
      answer: string;
    };

    // Parse responses with enhanced error handling
    let quizQuestions: QuizQuestion[] | undefined,
      flashcardCards: Flashcard[] | undefined;

    // Parse quiz response
    try {
      const quizRaw = quizResponse.choices[0]?.message?.content?.trim();
      if (!quizRaw) {
        throw new Error("Empty quiz response");
      }

      // Try multiple parsing strategies for quiz
      let parsedQuiz: unknown = null;

      // Strategy 1: Direct JSON parse
      try {
        parsedQuiz = JSON.parse(quizRaw);
        if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
          quizQuestions = parsedQuiz as QuizQuestion[];
        }
      } catch {
        // Strategy 2: Extract JSON from markdown code blocks
        const codeBlockMatch = quizRaw.match(
          /```(?:json)?\s*(\[[\s\S]*?\])\s*```/,
        );
        if (codeBlockMatch) {
          try {
            parsedQuiz = JSON.parse(codeBlockMatch[1]);
            if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
              quizQuestions = parsedQuiz as QuizQuestion[];
            }
          } catch {
            // Strategy 3: Extract first JSON array
            const arrayMatch = quizRaw.match(/\[[\s\S]*?\]/);
            if (arrayMatch) {
              try {
                parsedQuiz = JSON.parse(arrayMatch[0]);
                if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
                  quizQuestions = parsedQuiz as QuizQuestion[];
                }
              } catch {
                throw new Error("Failed to parse quiz JSON");
              }
            }
          }
        }
      }

      if (!quizQuestions) {
        throw new Error("No valid quiz questions found");
      }
      
      console.log(`✅ Successfully parsed ${quizQuestions.length} quiz questions`);
    } catch (quizError) {
      console.error("❌ Error parsing quiz response:", quizError);
      console.error("❌ Quiz error details:", quizError instanceof Error ? quizError.message : String(quizError));
      // Log the raw response for debugging
      try {
        const quizRaw = quizResponse?.choices?.[0]?.message?.content?.trim();
        console.error("❌ Quiz raw response (first 500 chars):", quizRaw?.substring(0, 500));
      } catch {
        console.error("❌ Could not log quiz raw response");
      }
      return NextResponse.json(
        {
          error: "Failed to generate quiz questions from PDF content. Please try again.",
          details: quizError instanceof Error ? quizError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Parse flashcards response
    try {
      const flashcardsRaw =
        flashcardsResponse.choices[0]?.message?.content?.trim();
      if (!flashcardsRaw) {
        throw new Error("Empty flashcards response");
      }

      // Try multiple parsing strategies for flashcards
      let parsedFlashcards: unknown = null;

      // Strategy 1: Direct JSON parse
      try {
        parsedFlashcards = JSON.parse(flashcardsRaw);
        if (Array.isArray(parsedFlashcards) && parsedFlashcards.length > 0) {
          flashcardCards = parsedFlashcards as Flashcard[];
        }
      } catch {
        // Strategy 2: Extract JSON from markdown code blocks
        const codeBlockMatch = flashcardsRaw.match(
          /```(?:json)?\s*(\[[\s\S]*?\])\s*```/,
        );
        if (codeBlockMatch) {
          try {
            parsedFlashcards = JSON.parse(codeBlockMatch[1]);
            if (
              Array.isArray(parsedFlashcards) &&
              parsedFlashcards.length > 0
            ) {
              flashcardCards = parsedFlashcards as Flashcard[];
            }
          } catch {
            // Strategy 3: Extract first JSON array
            const arrayMatch = flashcardsRaw.match(/\[[\s\S]*?\]/);
            if (arrayMatch) {
              try {
                parsedFlashcards = JSON.parse(arrayMatch[0]);
                if (
                  Array.isArray(parsedFlashcards) &&
                  parsedFlashcards.length > 0
                ) {
                  flashcardCards = parsedFlashcards as Flashcard[];
                }
              } catch {
                throw new Error("Failed to parse flashcards JSON");
              }
            }
          }
        }
      }

      if (!flashcardCards) {
        throw new Error("No valid flashcards found");
      }
      
      console.log(`✅ Successfully parsed ${flashcardCards.length} flashcards`);
    } catch (flashcardsError) {
      console.error("❌ Error parsing flashcards response:", flashcardsError);
      console.error("❌ Flashcards error details:", flashcardsError instanceof Error ? flashcardsError.message : String(flashcardsError));
      // Log the raw response for debugging
      try {
        const flashcardsRaw = flashcardsResponse?.choices?.[0]?.message?.content?.trim();
        console.error("❌ Flashcards raw response (first 500 chars):", flashcardsRaw?.substring(0, 500));
      } catch {
        console.error("❌ Could not log flashcards raw response");
      }
      return NextResponse.json(
        {
          error: "Failed to generate flashcards from PDF content. Please try again.",
          details: flashcardsError instanceof Error ? flashcardsError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Parse transcript response
    const transcriptContent =
      transcriptResponse.choices[0]?.message?.content?.trim();
    if (!transcriptContent) {
      return NextResponse.json(
        {
          error:
            "Failed to generate transcript from PDF content. Please try again.",
        },
        { status: 500 },
      );
    }

    // Check if transcript response indicates failure
    if (
      transcriptContent.toLowerCase().includes("unable to generate") ||
      transcriptContent.toLowerCase().includes("cannot create")
    ) {
      return NextResponse.json(
        {
          error:
            "Failed to generate transcript from PDF content. Please try again.",
        },
        { status: 500 },
      );
    }

    // Validate quiz questions
    quizQuestions = quizQuestions.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.answer &&
        ["A", "B", "C", "D"].includes(q.answer),
    );

    if (quizQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Generated quiz questions are not in the correct format. Please try again.",
        },
        { status: 500 },
      );
    }

    // Validate flashcards
    flashcardCards = flashcardCards.filter(
      (card) =>
        card.question &&
        card.answer &&
        card.question.trim().length > 10 &&
        card.answer.trim().length > 5,
    );

    if (flashcardCards.length === 0) {
      return NextResponse.json(
        {
          error:
            "Generated flashcards are not in the correct format. Please try again.",
        },
        { status: 500 },
      );
    }

    console.log(
      `✅ Generated ${quizQuestions.length} quiz questions, ${flashcardCards.length} flashcards, and transcript from PDF content`,
    );

    // Save all content to database
    console.log("💾 Saving content to database...");
    let quiz, flashcards, transcript;
    try {
      [quiz, flashcards, transcript] = await Promise.all([
      // Save quiz if it doesn't exist
      existingQuiz ||
        db.quiz.create({
          data: {
              fileId: primaryFileId,
            title: "Generated Quiz",
            questions: {
              create: quizQuestions.map((q) => ({
                question: q.question,
                options: q.options,
                answer: q.answer,
              })),
            },
          },
          include: { questions: true },
        }),
      // Save flashcards if they don't exist
      existingFlashcards ||
        db.flashcards.create({
          data: {
              fileId: primaryFileId,
            title: "Generated Flashcards",
            cards: {
              create: flashcardCards.map((card) => ({
                question: card.question,
                answer: card.answer,
              })),
            },
          },
          include: { cards: true },
        }),
      // Save transcript if it doesn't exist
      existingTranscript ||
        db.transcript.create({
          data: {
              fileId: primaryFileId,
            title: "Generated Transcript",
            content: transcriptContent,
          },
        }),
    ]);

      console.log("✅ All content saved to database successfully");
    } catch (dbError) {
      console.error("❌ Error saving to database:", dbError);
      console.error("❌ Database error details:", dbError instanceof Error ? dbError.message : String(dbError));
      if (dbError instanceof Error && dbError.stack) {
        console.error("❌ Database error stack:", dbError.stack);
      }
      return NextResponse.json(
        {
          error: "Failed to save content to database. Please try again.",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 },
      );
    }
    
    return NextResponse.json({
      quiz,
      flashcards,
      transcript,
      message: "All content generated and saved successfully",
    });
  } catch (error) {
    console.error("❌ API error in create-all-content:", error);
    console.error("❌ Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("❌ Error stack:", error.stack);
    }
    
    // Provide more helpful error message
    let errorMessage = "Failed to create content";
    if (error instanceof Error) {
      if (error.message.includes("OpenAI") || error.message.includes("API")) {
        errorMessage = "Failed to generate content using AI. Please check your API key and try again.";
      } else if (error.message.includes("database") || error.message.includes("Prisma")) {
        errorMessage = "Failed to save content to database. Please try again.";
      } else {
        errorMessage = `Failed to create content: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  }
}
