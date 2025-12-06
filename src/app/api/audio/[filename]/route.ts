import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    console.log("🔍 Audio API called with filename:", filename);
    console.log("🔍 Request URL:", request.url);

    if (!filename) {
      console.error("❌ No filename provided");
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    // Construct the file path
    const filePath = join(
      process.cwd(),
      "public",
      "uploads",
      "audio",
      filename,
    );
    console.log("🔍 Looking for file at:", filePath);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`❌ Audio file not found: ${filePath}`);
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 },
      );
    }

    console.log("✅ Audio file found:", filePath);

    // Read the audio file
    const audioBuffer = await readFile(filePath);

    // Determine content type based on file extension
    let contentType = "audio/wav"; // default
    if (filename.endsWith(".mp3")) {
      contentType = "audio/mpeg";
    } else if (filename.endsWith(".m4a")) {
      contentType = "audio/mp4";
    } else if (filename.endsWith(".ogg")) {
      contentType = "audio/ogg";
    }

    console.log(
      "✅ Audio file read successfully, size:",
      audioBuffer.length,
      "bytes",
    );
    console.log("✅ Content-Type:", contentType);

    // Return the audio file with proper headers
    const response = new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD",
        "Access-Control-Allow-Headers": "Range",
      },
    });

    console.log("✅ Audio response created successfully");
    return response;
  } catch (error) {
    console.error("Error serving audio file:", error);
    return NextResponse.json(
      { error: "Failed to serve audio file" },
      { status: 500 },
    );
  }
}
