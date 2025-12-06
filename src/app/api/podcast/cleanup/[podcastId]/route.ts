import { NextRequest, NextResponse } from 'next/server';
import { podcastCleanupService } from '@/lib/podcast-cleanup';

/**
 * API endpoint for manual cleanup of specific podcast
 * DELETE /api/podcast/cleanup/{podcastId}
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> }
) {
  try {
    const { podcastId } = await params;
    
    if (!podcastId) {
      return NextResponse.json(
        { success: false, error: 'Podcast ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Manual cleanup requested for podcast: ${podcastId}`);
    
    const result = await podcastCleanupService.cleanupPodcast(podcastId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Manual cleanup API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Manual cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
