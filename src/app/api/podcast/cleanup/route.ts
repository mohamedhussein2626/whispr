import { NextResponse } from "next/server";
import { podcastCleanupService } from "@/lib/podcast-cleanup";

/**
 * API endpoint for podcast cleanup operations
 * POST /api/podcast/cleanup - Run cleanup operations
 * GET /api/podcast/cleanup/stats - Get cleanup statistics
 * DELETE /api/podcast/cleanup/{podcastId} - Manual cleanup for specific podcast
 */

export async function POST() {
  try {
    console.log("🧹 Manual podcast cleanup triggered via API");

    // Run both cleanup operations
    const [expiredResult, failedResult] = await Promise.all([
      podcastCleanupService.cleanupExpiredAudio(),
      podcastCleanupService.cleanupFailedPodcasts(),
    ]);

    const totalDeleted = expiredResult.deleted + failedResult.deleted;
    const totalErrors = expiredResult.errors + failedResult.errors;
    const totalSizeFreed = expiredResult.totalSize;

    console.log(
      `🎉 Cleanup completed! Total deleted: ${totalDeleted}, Errors: ${totalErrors}, Size freed: ${totalSizeFreed} bytes`
    );

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      results: {
        expiredAudio: expiredResult,
        failedPodcasts: failedResult,
        total: {
          deleted: totalDeleted,
          errors: totalErrors,
          sizeFreed: totalSizeFreed,
        },
      },
    });
  } catch (error) {
    console.error("❌ Cleanup API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("📊 Fetching podcast cleanup statistics");

    const stats = await podcastCleanupService.getCleanupStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ Stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
