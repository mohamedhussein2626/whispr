import { db } from '@/db';
import { deleteAudioFile } from './audio-upload';

/**
 * Auto-cleanup service for podcast audio files
 * Handles 30-day auto-deletion and maintenance tasks
 */
export class PodcastCleanupService {
  
  /**
   * Clean up expired podcast audio files (30+ days old)
   */
  async cleanupExpiredAudio(): Promise<{
    deleted: number;
    errors: number;
    totalSize: number;
  }> {
    try {
      console.log('🧹 Starting podcast audio cleanup...');
      
      const now = new Date();
      
      // Find podcasts that should be auto-deleted
      const expiredPodcasts = await db.podcast.findMany({
        where: {
          autoDeleteAt: {
            lte: now,
          },
          isProcessed: true, // Only delete processed podcasts
        },
        include: {
          sections: true,
        },
      });

      console.log(`🔍 Found ${expiredPodcasts.length} expired podcasts to clean up`);

      let deleted = 0;
      let errors = 0;
      let totalSize = 0;

      for (const podcast of expiredPodcasts) {
        try {
          console.log(`🗑️ Cleaning up podcast: ${podcast.title} (${podcast.id})`);
          
          // Delete audio files from R2
          for (const section of podcast.sections) {
            if (section.audioStorageKey) {
              try {
                await deleteAudioFile(section.audioStorageKey);
                console.log(`✅ Deleted audio file: ${section.audioStorageKey}`);
                deleted++;
                
                // Add file size to total
                if (section.audioFileSize) {
                  totalSize += section.audioFileSize;
                }
              } catch (error) {
                console.error(`❌ Failed to delete audio file ${section.audioStorageKey}:`, error);
                errors++;
              }
            }
          }

          // Delete podcast from database
          await db.podcast.delete({
            where: { id: podcast.id },
          });

          console.log(`✅ Deleted podcast from database: ${podcast.id}`);

        } catch (error) {
          console.error(`❌ Error cleaning up podcast ${podcast.id}:`, error);
          errors++;
        }
      }

      console.log(`🎉 Cleanup completed! Deleted: ${deleted}, Errors: ${errors}, Total size freed: ${totalSize} bytes`);
      
      return { deleted, errors, totalSize };

    } catch (error) {
      console.error('❌ Podcast cleanup failed:', error);
      return { deleted: 0, errors: 1, totalSize: 0 };
    }
  }

  /**
   * Clean up failed/unprocessed podcasts (older than 7 days)
   */
  async cleanupFailedPodcasts(): Promise<{
    deleted: number;
    errors: number;
  }> {
    try {
      console.log('🧹 Starting cleanup of failed podcasts...');
      
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
      
      // Find failed podcasts older than 7 days
      const failedPodcasts = await db.podcast.findMany({
        where: {
          isProcessed: false,
          createdAt: {
            lte: sevenDaysAgo,
          },
        },
        include: {
          sections: true,
        },
      });

      console.log(`🔍 Found ${failedPodcasts.length} failed podcasts to clean up`);

      let deleted = 0;
      let errors = 0;

      for (const podcast of failedPodcasts) {
        try {
          console.log(`🗑️ Cleaning up failed podcast: ${podcast.title} (${podcast.id})`);
          
          // Delete any partial audio files
          for (const section of podcast.sections) {
            if (section.audioStorageKey) {
              try {
                await deleteAudioFile(section.audioStorageKey);
                console.log(`✅ Deleted partial audio file: ${section.audioStorageKey}`);
              } catch (error) {
                console.error(`❌ Failed to delete partial audio file ${section.audioStorageKey}:`, error);
              }
            }
          }

          // Delete podcast from database
          await db.podcast.delete({
            where: { id: podcast.id },
          });

          console.log(`✅ Deleted failed podcast from database: ${podcast.id}`);
          deleted++;

        } catch (error) {
          console.error(`❌ Error cleaning up failed podcast ${podcast.id}:`, error);
          errors++;
        }
      }

      console.log(`🎉 Failed podcast cleanup completed! Deleted: ${deleted}, Errors: ${errors}`);
      
      return { deleted, errors };

    } catch (error) {
      console.error('❌ Failed podcast cleanup failed:', error);
      return { deleted: 0, errors: 1 };
    }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    totalPodcasts: number;
    processedPodcasts: number;
    failedPodcasts: number;
    expiredPodcasts: number;
    totalAudioSize: number;
    nextCleanupDate: Date | null;
  }> {
    try {
      const now = new Date();
      
      const [
        totalPodcasts,
        processedPodcasts,
        failedPodcasts,
        expiredPodcasts,
        audioStats,
        nextExpiry
      ] = await Promise.all([
        db.podcast.count(),
        db.podcast.count({ where: { isProcessed: true } }),
        db.podcast.count({ where: { isProcessed: false } }),
        db.podcast.count({ 
          where: { 
            autoDeleteAt: { lte: now },
            isProcessed: true 
          } 
        }),
        db.podcast.aggregate({
          where: { isProcessed: true },
          _sum: { audioFileSize: true },
        }),
        db.podcast.findFirst({
          where: { 
            autoDeleteAt: { gt: now },
            isProcessed: true 
          },
          orderBy: { autoDeleteAt: 'asc' },
          select: { autoDeleteAt: true },
        }),
      ]);

      return {
        totalPodcasts,
        processedPodcasts,
        failedPodcasts,
        expiredPodcasts,
        totalAudioSize: audioStats._sum.audioFileSize || 0,
        nextCleanupDate: nextExpiry?.autoDeleteAt || null,
      };

    } catch (error) {
      console.error('❌ Failed to get cleanup stats:', error);
      return {
        totalPodcasts: 0,
        processedPodcasts: 0,
        failedPodcasts: 0,
        expiredPodcasts: 0,
        totalAudioSize: 0,
        nextCleanupDate: null,
      };
    }
  }

  /**
   * Manual cleanup for specific podcast
   */
  async cleanupPodcast(podcastId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(`🗑️ Manual cleanup for podcast: ${podcastId}`);
      
      const podcast = await db.podcast.findUnique({
        where: { id: podcastId },
        include: {
          sections: true,
        },
      });

      if (!podcast) {
        return { success: false, message: 'Podcast not found' };
      }

      // Delete audio files from R2
      for (const section of podcast.sections) {
        if (section.audioStorageKey) {
          try {
            await deleteAudioFile(section.audioStorageKey);
            console.log(`✅ Deleted audio file: ${section.audioStorageKey}`);
          } catch (error) {
            console.error(`❌ Failed to delete audio file ${section.audioStorageKey}:`, error);
          }
        }
      }

      // Delete podcast from database
      await db.podcast.delete({
        where: { id: podcastId },
      });

      console.log(`✅ Manual cleanup completed for podcast: ${podcastId}`);
      
      return { success: true, message: 'Podcast cleaned up successfully' };

    } catch (error) {
      console.error(`❌ Manual cleanup failed for podcast ${podcastId}:`, error);
      return { success: false, message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

// Export singleton instance
export const podcastCleanupService = new PodcastCleanupService();
