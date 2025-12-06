import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify user owns the file
    const file = await db.file.findFirst({
      where: { id: fileId, userId: sessionUser.user.id },
      select: { id: true },
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found or access denied" },
        { status: 404 }
      );
    }

    // Fetch chunks for the file
    const chunks = await db.chunk.findMany({
      where: { fileId },
      take: 100, // Get up to 100 chunks
      orderBy: { createdAt: "asc" },
      select: { text: true },
    });

    // Combine all chunks into one content string
    const content = chunks.map((chunk) => chunk.text).join("\n\n");

    return NextResponse.json({
      success: true,
      content: content,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    return NextResponse.json(
      { error: "Failed to fetch file content" },
      { status: 500 }
    );
  }
}

