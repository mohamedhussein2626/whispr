import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2AudioClient, R2_AUDIO_BUCKET_NAME } from "@/lib/r2-audio-config";
import { getServerSession } from "@/lib/auth-api";
import { Readable } from "stream";

// Force Node.js runtime for file serving
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute for file serving

/**
 * Proxy audio files from R2 storage
 * This route serves audio files from R2 with proper CORS headers
 * URL format: /api/audio-proxy?key=podcasts/userId/podcastId/filename.wav
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const url = searchParams.get('url'); // For direct R2 URLs

    if (!key && !url) {
      return NextResponse.json(
        { error: "Key or URL parameter is required" },
        { status: 400 }
      );
    }

    let storageKey = key;

    // If URL is provided, extract the key from R2 URL
    if (url && !key) {
      // Extract key from R2 URL format: https://...r2.cloudflarestorage.com/podcasts/...
      const r2Match = url.match(/r2\.cloudflarestorage\.com\/(.+)$/);
      if (r2Match) {
        storageKey = r2Match[1];
      } else {
        return NextResponse.json(
          { error: "Invalid R2 URL format" },
          { status: 400 }
        );
      }
    }

    if (!storageKey) {
      return NextResponse.json(
        { error: "Storage key is required" },
        { status: 400 }
      );
    }

    // Decode the key
    let decodedKey = storageKey;
    try {
      decodedKey = decodeURIComponent(storageKey);
    } catch {
      decodedKey = storageKey;
    }

    // Optional: Check if user has access to this audio file
    // For now, we'll allow access if the user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the audio file from R2
    const command = new GetObjectCommand({
      Bucket: R2_AUDIO_BUCKET_NAME,
      Key: decodedKey,
    });

    const response = await r2AudioClient.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: "Audio file not found in storage" },
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

    // Determine content type based on file extension
    let contentType = "audio/wav"; // default
    if (decodedKey.endsWith(".mp3")) {
      contentType = "audio/mpeg";
    } else if (decodedKey.endsWith(".m4a")) {
      contentType = "audio/mp4";
    } else if (decodedKey.endsWith(".ogg")) {
      contentType = "audio/ogg";
    } else {
      contentType = response.ContentType || "audio/wav";
    }

    // Return the audio file with proper headers for audio playback
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        "Accept-Ranges": "bytes",
        // CORS headers for cross-origin audio playback
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range",
      },
    });
  } catch (error) {
    console.error("Error serving audio file from R2:", error);
    return NextResponse.json(
      { error: "Failed to serve audio file" },
      { status: 500 }
    );
  }
}

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

