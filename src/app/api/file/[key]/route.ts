import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-config";
import { getServerSession } from "@/lib/auth-api";
import { db } from "@/db";
import { Readable } from "stream";

// Force Node.js runtime for file serving
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute for file serving

/**
 * Serve files from R2 with authentication check
 * This ensures users can only access their own files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Get the file key from params (URL decoded)
    const { key } = await params;
    // Handle both encoded and decoded keys
    let decodedKey = key;
    try {
      decodedKey = decodeURIComponent(key);
    } catch {
      // If decode fails, use original key
      decodedKey = key;
    }

    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the file belongs to the user
    const file = await db.file.findFirst({
      where: {
        key: decodedKey,
        userId: session.user.id,
      },
      select: {
        id: true,
        fileType: true,
        key: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the file from R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: decodedKey,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 }
      );
    }

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as Readable;
    
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    
    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = file.fileType || response.ContentType || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        // CORS headers for PDF.js
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

