import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-api";
import { db } from "@/db";
import { uploadToR2, generateFileKey } from "@/lib/r2-upload";

// Helper: Chunk long text into segments
function chunkText(text: string, maxWords = 500): string[] {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks;
}

// JINA.AI API integration
async function extractWebpageContent(url: string): Promise<string> {
  try {
    const response = await fetch('https://r.jina.ai/' + url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NotebookLama/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`JINA.AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || data.text || '';
  } catch (error) {
    console.error('Error extracting webpage content:', error);
    throw new Error('Failed to extract webpage content');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session using Better Auth
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { url, topicId } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Generate unique key for the webpage content
    const fileName = `webpage-${Date.now()}.txt`;
    const key = generateFileKey(fileName, session.user.id);

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
        name: fileName,
        key: key,
        url: url, // Store the original URL
        fileType: "text/plain",
        source: "webpage",
        userId: session.user.id,
        uploadStatus: "PROCESSING",
        topicId: validatedTopicId,
      },
    });

    try {
      // Extract webpage content using JINA.AI
      const extractedText = await extractWebpageContent(url);
      
      if (!extractedText || !extractedText.trim()) {
        throw new Error("No content extracted from webpage");
      }

      console.log("Extracted text length:", extractedText.length);
      console.log("Sample content:", extractedText.substring(0, 500));

      // Create a text file buffer for storage
      const textBuffer = Buffer.from(extractedText, 'utf-8');
      const textFile = new File([textBuffer], fileName, { type: 'text/plain' });

      // Upload to R2
      const uploadResult = await uploadToR2(textFile, key, 'text/plain');
      
      // Update file with URL
      await db.file.update({
        where: { id: createdFile.id },
        data: { url: uploadResult.url },
      });

      // Chunk and insert the extracted text
      const chunks = chunkText(extractedText);
      for (const chunk of chunks) {
        await db.chunk.create({
          data: {
            text: chunk,
            fileId: createdFile.id,
          },
        });
      }

      // Success
      await db.file.update({
        where: { id: createdFile.id },
        data: { uploadStatus: "SUCCESS" },
      });

      console.log(`✅ Webpage extraction complete (File ID: ${createdFile.id})`);

      return NextResponse.json({
        success: true,
        file: {
          id: createdFile.id,
          key: uploadResult.key,
          url: uploadResult.url,
          name: uploadResult.name,
        },
      });
    } catch (error) {
      console.error("❌ Error processing webpage:", error);
      await db.file.update({
        where: { id: createdFile.id },
        data: { uploadStatus: "FAILED" },
      });

      return NextResponse.json(
        { error: "Failed to process webpage" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Webpage extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
