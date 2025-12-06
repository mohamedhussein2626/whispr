import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";

/**
 * API route to fix file URLs in the database
 * Converts localhost URLs to relative API routes
 * POST /api/fix-file-urls
 */
export async function POST(_request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔧 Starting file URL fix process...");

    // Find all files with localhost URLs
    const filesWithLocalhost = await db.file.findMany({
      where: {
        url: {
          contains: "localhost",
        },
        userId: user.id, // Only fix current user's files
      },
      select: {
        id: true,
        url: true,
        key: true,
        name: true,
      },
    });

    console.log(`📁 Found ${filesWithLocalhost.length} files with localhost URLs`);

    const fixedFiles: Array<{ id: string; oldUrl: string; newUrl: string }> = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const file of filesWithLocalhost) {
      try {
        let newUrl = file.url;

        // If URL contains /api/file/, extract the path
        const apiRouteMatch = file.url.match(/\/api\/file\/(.+?)(?:\?|$)/);
        if (apiRouteMatch) {
          // Extract the path and make it relative
          newUrl = `/api/file/${apiRouteMatch[1]}`;
        } else if (file.key) {
          // If we have a key, use it to create the API route
          newUrl = `/api/file/${encodeURIComponent(file.key)}`;
        } else {
          // Can't fix without key or API route path
          errors.push({
            id: file.id,
            error: "No key or API route path found",
          });
          continue;
        }

        // Update the file in database
        await db.file.update({
          where: { id: file.id },
          data: { url: newUrl },
        });

        fixedFiles.push({
          id: file.id,
          oldUrl: file.url,
          newUrl: newUrl,
        });

        console.log(`✅ Fixed file ${file.name}: ${file.url} → ${newUrl}`);
      } catch (error) {
        console.error(`❌ Error fixing file ${file.id}:`, error);
        errors.push({
          id: file.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`✅ URL fix complete! Fixed ${fixedFiles.length} files, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedFiles.length} file URLs`,
      fixed: fixedFiles.length,
      errors: errors.length,
      details: {
        fixedFiles,
        errors,
      },
    });
  } catch (error) {
    console.error("❌ Error in fix-file-urls API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix file URLs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check how many files need fixing
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count files with localhost URLs
    const localhostCount = await db.file.count({
      where: {
        url: {
          contains: "localhost",
        },
        userId: user.id,
      },
    });

    // Count files with 127.0.0.1 URLs
    const localhostIpCount = await db.file.count({
      where: {
        url: {
          contains: "127.0.0.1",
        },
        userId: user.id,
      },
    });

    const totalNeedsFixing = localhostCount + localhostIpCount;

    return NextResponse.json({
      localhostUrls: localhostCount,
      localhostIpUrls: localhostIpCount,
      totalNeedsFixing: totalNeedsFixing,
      message: totalNeedsFixing > 0 
        ? `Found ${totalNeedsFixing} files that need URL fixing`
        : "All file URLs are correct",
    });
  } catch (error) {
    console.error("❌ Error checking file URLs:", error);
    return NextResponse.json(
      {
        error: "Failed to check file URLs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

