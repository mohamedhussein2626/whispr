"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { getUserFromRequest } from "./auth";
import { createPodcastSections } from "./audio-generation";


type PlanDetails = {
  planName: string;       // instead of name
  subscriptionStatus: string;
  numberOfFiles: number;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
};

type Chunk = {
  id: string;
  fileId: string;
  createdAt: Date;
  text: string;
};

interface PodcastSectionInput {
  title: string;
  description: string;
  content: string;
  duration: string;
}

export async function getQuizData(fileId: string) {
  try {
    const quiz = await db.quiz.findFirst({
      where: { fileId },
      include: { questions: true },
    });

    return { quiz };
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return { quiz: null };
  }
}

export async function getFlashcardsData(fileId: string) {
  try {
    const flashcards = await db.flashcards.findFirst({
      where: { fileId },
      include: { cards: true },
      orderBy: { createdAt: "desc" },
    });

    return { flashcards };
  } catch (error) {
    console.error("Error fetching flashcards data:", error);
    return { flashcards: null };
  }
}

export async function getFileData(fileId: string) {
  try {
    const file = await db.file.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        name: true,
        url: true,
      },
    });

    return { file };
  } catch (error) {
    console.error("Error fetching file data:", error);
    return { file: null };
  }
}

export async function getQuiz(fileId: string) {
  try {
    console.log("Fetching quiz for fileId:", fileId);

    const quiz = await db.quiz.findFirst({
      where: { fileId },
      include: { questions: true },
    });

    if (!quiz) {
      return { error: "Quiz not found" };
    }

    return { quiz };
  } catch (error) {
    console.error("Server action error:", error);
    return { error: "Failed to fetch quiz" };
  }
}

export async function getFlashcards(fileId: string) {
  try {
    console.log("Fetching flashcards for fileId:", fileId);

    const flashcards = await db.flashcards.findFirst({
      where: { fileId },
      include: { cards: true },
    });

    if (!flashcards) {
      return { error: "Flashcards not found" };
    }

    return { flashcards };
  } catch (error) {
    console.error("Server action error:", error);
    return { error: "Failed to fetch flashcards" };
  }
}

export async function getTranscript(fileId: string) {
  try {
    console.log("Fetching transcript for fileId:", fileId);

    const transcript = await db.transcript.findFirst({
      where: { fileId },
    });

    if (!transcript) {
      return { error: "Transcript not found" };
    }

    return { transcript };
  } catch (error) {
    console.error("Server action error:", error);
    return { error: "Failed to fetch transcript" };
  }
}

export async function createAllContent(fileId: string) {
  try {
    console.log("Create all content server action called with fileId:", fileId);

    // Fetch PDF content (chunks)
    const chunks = await db.chunk.findMany({
      where: { fileId },
      take: 20, // Get more chunks for comprehensive content
    });

    if (!chunks.length) {
      return { error: "No PDF content found for this file." };
    }

    // Check if content already exists
    const existingQuiz = await db.quiz.findFirst({ where: { fileId } });
    const existingFlashcards = await db.flashcards.findFirst({
      where: { fileId },
    });
    const existingTranscript = await db.transcript.findFirst({
      where: { fileId },
    });

    if (existingQuiz && existingFlashcards && existingTranscript) {
      console.log("All content already exists, returning existing data");
      return {
        quiz: existingQuiz,
        flashcards: existingFlashcards,
        transcript: existingTranscript,
        message: "Content already exists",
      };
    }

    // For now, return a message indicating that content generation should be done via API
    // This is because server actions have limitations with external API calls
    return {
      message:
        "Content generation initiated. Please use the API endpoint for generation.",
      needsGeneration: true,
    };
  } catch (error) {
    console.error("Server action error:", error);
    return { error: "Failed to create content" };
  }
}

/**
 * Check if user can create podcasts based on their subscription plan
 */
export async function canUserCreatePodcast(userId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  planDetails?: PlanDetails;
}> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        planId: true,
        planName: true,
        subscriptionStatus: true,
        isBanned: true,
        banReason: true,
        plans: {
          select: {
            id: true,
            name: true,
            numberOfFiles: true,
            numberOfEssayWriter: true,
            numberOfEssayGrader: true,
          },
        },
        subscriptions: {
          where: { status: 'active' },
          select: {
            plan: {
              select: {
                id: true,
                name: true,
                numberOfFiles: true,
                numberOfEssayWriter: true,
                numberOfEssayGrader: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return { canCreate: false, reason: "User not found" };
    }

    if (user.isBanned) {
      return { 
        canCreate: false, 
        reason: `User is banned: ${user.banReason || 'No reason provided'}` 
      };
    }

    // Get active plan
    let activePlan = null;
    if (user.subscriptions.length > 0) {
      activePlan = user.subscriptions[0].plan;
    } else if (user.plans.length > 0) {
      activePlan = user.plans[0];
    } else {
      // Fetch default free plan from database
      const freePlan = await db.plan.findFirst({
        where: { name: "Free" },
        select: {
          id: true,
          name: true,
          numberOfFiles: true,
          numberOfEssayWriter: true,
          numberOfEssayGrader: true,
        },
      });
      
      if (freePlan) {
        activePlan = freePlan;
      } else {
        return { 
          canCreate: false, 
          reason: "No subscription plan found. Please contact support." 
        };
      }
    }

    // Check if user has podcast creation rights
    // For now, all users can create podcasts, but this can be enhanced
    // with specific podcast limits per plan
    const canCreate = user.subscriptionStatus === 'active' || 
                     user.subscriptionStatus === 'free' ||
                     activePlan.name === 'Free';

    return {
      canCreate,
      reason: canCreate ? undefined : "Subscription required for podcast creation",
      planDetails: {
        planName: activePlan.name,
        subscriptionStatus: user.subscriptionStatus,
        numberOfFiles: activePlan.numberOfFiles,
        numberOfEssayWriter: activePlan.numberOfEssayWriter,
        numberOfEssayGrader: activePlan.numberOfEssayGrader,
      },
    };
  } catch (error) {
    console.error("Error checking podcast creation permission:", error);
    return { 
      canCreate: false, 
      reason: "Error checking permissions" 
    };
  }
}

export async function getSubscriptionPlan() {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return {
        subscriptionPlan: null,
        error: "User not authenticated",
      };
    }

    // Fetch user with subscription details from database
    const userWithPlan = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        planId: true,
        planName: true,
        subscriptionId: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        isBanned: true,
        banReason: true,
        // Get plan details if user has a plan
        plans: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            interval: true,
            numberOfFiles: true,
            numberOfEssayWriter: true,
            numberOfEssayGrader: true,
            features: true,
          },
        },
        // Get active subscription details
        subscriptions: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            stripeSubId: true,
            status: true,
            interval: true,
            startDate: true,
            endDate: true,
            plan: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                interval: true,
                numberOfFiles: true,
                numberOfEssayWriter: true,
                numberOfEssayGrader: true,
                features: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!userWithPlan) {
      return {
        subscriptionPlan: null,
        error: "User not found",
      };
    }

    // Determine the active plan
    let activePlan = null;
    let activeSubscription = null;

    if (userWithPlan.subscriptions.length > 0) {
      // User has an active subscription
      activeSubscription = userWithPlan.subscriptions[0];
      activePlan = activeSubscription.plan;
    } else if (userWithPlan.planId && userWithPlan.plans.length > 0) {
      // User has a plan assigned but no active subscription (might be free plan)
      activePlan = userWithPlan.plans[0];
    } else {
      // Fetch default free plan from database
      const freePlan = await db.plan.findFirst({
        where: { name: "Free" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          interval: true,
          numberOfFiles: true,
          numberOfEssayWriter: true,
          numberOfEssayGrader: true,
          features: true,
        },
      });
      
      if (freePlan) {
        activePlan = freePlan;
      } else {
        // If no free plan exists in database, return error
        return {
          subscriptionPlan: null,
          error: "No subscription plan found. Please contact support.",
        };
      }
    }

    // Build subscription plan object
    const subscriptionPlan = {
      id: activePlan.id,
      name: activePlan.name,
      description: activePlan.description,
      price: activePlan.price,
      interval: activePlan.interval,
      numberOfFiles: activePlan.numberOfFiles,
      numberOfEssayWriter: activePlan.numberOfEssayWriter,
      numberOfEssayGrader: activePlan.numberOfEssayGrader,
      features: activePlan.features,
      
      // Subscription status
      isSubscribed: userWithPlan.subscriptionStatus === 'active',
      isCanceled: userWithPlan.subscriptionStatus === 'canceled',
      subscriptionStatus: userWithPlan.subscriptionStatus,
      subscriptionId: userWithPlan.subscriptionId,
      
      // Stripe details
      stripeCustomerId: userWithPlan.stripeCustomerId,
      stripeSubscriptionId: userWithPlan.stripeSubscriptionId,
      stripePriceId: userWithPlan.stripePriceId,
      stripeCurrentPeriodEnd: userWithPlan.stripeCurrentPeriodEnd,
      
      // User status
      isBanned: userWithPlan.isBanned,
      banReason: userWithPlan.banReason,
      
      // Subscription details
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        stripeSubId: activeSubscription.stripeSubId,
        status: activeSubscription.status,
        interval: activeSubscription.interval,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
      } : null,
    };

    console.log("Subscription plan fetched:", {
      userId: user.id,
      planName: subscriptionPlan.name,
      isSubscribed: subscriptionPlan.isSubscribed,
      subscriptionStatus: subscriptionPlan.subscriptionStatus,
    });

    return { subscriptionPlan };
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return {
      subscriptionPlan: null,
      error: error instanceof Error ? error.message : "Failed to fetch subscription plan",
    };
  }
}

export async function getPodcast(fileId: string) {
  try {
    console.log("=== GET PODCAST SERVER ACTION ===");
    console.log("Fetching podcast for fileId:", fileId);

    const podcast = await db.podcast.findFirst({
      where: { fileId },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!podcast) {
      console.log("No podcast found for fileId:", fileId);
      return { error: "Podcast not found" };
    }

    console.log("Podcast found:", {
      id: podcast.id,
      title: podcast.title,
      sectionsCount: podcast.sections.length,
      totalDuration: podcast.totalDuration,
    });

    return { podcast };
  } catch (error) {
    console.error("=== PODCAST FETCH ERROR ===");
    console.error("Server action error:", error);
    return { error: "Failed to fetch podcast" };
  }
}

export async function createPodcast(fileId: string) {
  try {
    console.log("=== CREATE ENHANCED PODCAST SERVER ACTION ===");

    const user = await getUserFromRequest();
    if (!user) {
      console.log("User not authenticated");
      return { error: "Unauthorized" };
    }

    console.log("User authenticated:", user.id);
    console.log("FileId received:", fileId);

    // Check if user can create podcasts based on subscription
    const permissionCheck = await canUserCreatePodcast(user.id);
    if (!permissionCheck.canCreate) {
      console.log("User cannot create podcast:", permissionCheck.reason);
      return { 
        error: permissionCheck.reason || "Subscription required for podcast creation",
        planDetails: permissionCheck.planDetails,
      };
    }

    console.log("User has podcast creation permission:", permissionCheck.planDetails);

    if (!fileId) {
      console.log("No fileId provided");
      return { error: "File ID is required" };
    }

    // Get the file and check if user owns it
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id,
      },
    });

    if (!file) {
      console.log("File not found or user does not own it");
      return { error: "File not found" };
    }

    console.log("File found:", file.name);

    // Check if podcast already exists and handle regeneration
    const existingPodcast = await db.podcast.findFirst({
      where: {
        fileId,
      },
      include: {
        sections: true,
      },
    });

    let oldAudioUrl: string | null = null;
    if (existingPodcast) {
      console.log("Existing podcast found, preparing for regeneration");
      
      // Store old audio URL for deletion
      if (existingPodcast.sections.length > 0 && existingPodcast.sections[0].audioUrl) {
        oldAudioUrl = existingPodcast.sections[0].audioUrl;
        console.log("Old audio URL stored for deletion:", oldAudioUrl);
      }

      // Delete existing podcast and its sections
      await db.podcastSection.deleteMany({
        where: {
          podcastId: existingPodcast.id,
        },
      });

      await db.podcast.delete({
        where: {
          id: existingPodcast.id,
        },
      });
      console.log("Existing podcast deleted, ready for regeneration");
    }

    // Get the file content from chunks
    console.log("File URL:", file.url);
    console.log("File name:", file.name);
    console.log("File ID:", file.id);

    // Get chunks from database
    const chunks = await db.chunk.findMany({
      where: { fileId: file.id },
      take: 30, // Get more content for better generation
      orderBy: { createdAt: "asc" },
    });

    console.log("🔍 Debug: Found chunks:", chunks.length);
    if (chunks.length > 0) {
      console.log(
        "🔍 Debug: First chunk preview:",
        chunks[0].text.substring(0, 100) + "...",
      );
      console.log(
        "🔍 Debug: Last chunk preview:",
        chunks[chunks.length - 1].text.substring(0, 100) + "...",
      );
    }

    let fileContent = "";

    if (chunks.length === 0) {
      console.log(
        "⚠️ No chunks found, trying to extract content from file URL...",
      );

      // Try to get content from the file URL as fallback
      try {
        const response = await fetch(file.url);
        if (response.ok) {
          const text = await response.text();
          fileContent = text.substring(0, 5000); // Limit to first 5000 chars
          console.log(
            "🔍 Debug: Extracted content from file URL, length:",
            fileContent.length,
          );
          console.log(
            "🔍 Debug: Content preview:",
            fileContent.substring(0, 200) + "...",
          );
        } else {
          console.error("❌ Failed to fetch file content from URL");
          return {
            error:
              "No content found for this file. Please ensure the PDF was processed successfully.",
          };
        }
      } catch (error) {
        console.error("❌ Error fetching file content:", error);
        return {
          error:
            "No content found for this file. Please ensure the PDF was processed successfully.",
        };
      }
    } else {
      console.log("✅ Using chunks for content, count:", chunks.length);
      fileContent = chunks.map((chunk: Chunk) => chunk.text).join("\n\n");
      console.log("🔍 Debug: Combined content length:", fileContent.length);
      console.log(
        "🔍 Debug: Content preview:",
        fileContent.substring(0, 200) + "...",
      );
    }

    if (!fileContent || fileContent.trim().length === 0) {
      console.log("❌ No content available for podcast generation");
      return {
        error:
          "No content found for this file. Please ensure the PDF was processed successfully.",
      };
    }

    console.log("=== CREATING PODCAST SECTIONS ===");
    // Split content into sections for podcast
    const sections = await createPodcastSections(fileContent, file.name);
    console.log("Sections created:", sections.length);

    // Create podcast in database with enhanced features
    console.log("=== CREATING ENHANCED PODCAST IN DATABASE ===");
    const autoDeleteAt = new Date();
    autoDeleteAt.setDate(autoDeleteAt.getDate() + 30); // 30 days from now
    
    const podcast = await db.podcast.create({
      data: {
        fileId,
        title: `${file.name} - Enhanced Audio Version`,
        description: `AI-generated podcast version of ${file.name} using ElevenLabs Text-to-Dialogue`,
        totalDuration: "0:00", // Will be calculated after audio generation
        userId: user.id,
        // Enhanced fields
        autoDeleteAt,
        isProcessed: false,
        generationMethod: "text-to-dialogue",
        speakers: {
          narrator: {
            voice_id: "21m00Tcm4TlvDq8ikWAM",
            name: "Narrator"
          },
          host: {
            voice_id: "AZnzlk1XvdvUeBnXmlld", 
            name: "Host"
          }
        },
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      },
    });

    console.log("Podcast created with ID:", podcast.id);

    // Create sections in database
    console.log("=== CREATING SECTIONS IN DATABASE ===");
    const createdSections = await Promise.all(
      sections.map(async (section: PodcastSectionInput, index: number) => {
        console.log(`Creating section ${index + 1}:`, section.title);
        return await db.podcastSection.create({
          data: {
            podcastId: podcast.id,
            title: section.title,
            description: section.description,
            content: section.content,
            duration: section.duration,
            order: index,
          },
        });
      }),
    );

    console.log("All sections created:", createdSections.length);

    // Generate enhanced audio using Text-to-Dialogue API
    const section = createdSections[0]; // Get the single section
    let audioResult = null;

    try {
      console.log(`=== GENERATING ENHANCED AUDIO FOR SECTION ===`);
      console.log(`🎙️ Generating audio for: ${section.title}`);
      console.log(`📝 Content length: ${section.content.length} characters`);
      console.log(
        `📝 Content preview: ${section.content.substring(0, 200)}...`,
      );

      // Check if we have valid content
      if (!section.content || section.content.trim().length === 0) {
        throw new Error("No content to convert to audio");
      }

      console.log(`🔍 Debug: Starting enhanced audio generation with ElevenLabs Text-to-Dialogue...`);
      
      // Import the enhanced upload function
      const { uploadPodcastAudio } = await import('./audio-upload');
      
      // Generate audio using enhanced Text-to-Dialogue API
      audioResult = await uploadPodcastAudio(
        section.content,
        podcast.id,
        user.id,
        {
          deleteOldAudio: oldAudioUrl || undefined,
          useStreaming: false, // Use regular generation for now
          speakers: [
            {
              voice_id: "21m00Tcm4TlvDq8ikWAM",
              name: "Narrator"
            },
            {
              voice_id: "AZnzlk1XvdvUeBnXmlld", 
              name: "Host"
            }
          ],
          voiceSettings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          }
        }
      );

      console.log(`✅ Enhanced audio generated successfully!`);
      console.log(`🔗 Audio URL: ${audioResult.audioUrl}`);
      console.log(`📊 Duration: ${audioResult.duration}s`);
      console.log(`📦 File Size: ${audioResult.fileSize} bytes`);
      console.log(`🗝️ Storage Key: ${audioResult.storageKey}`);

      // Update section with enhanced audio data
      await db.podcastSection.update({
        where: { id: section.id },
        data: {
          audioUrl: audioResult.audioUrl,
          audioStorageKey: audioResult.storageKey,
          audioFileSize: audioResult.fileSize,
          audioFormat: "wav",
          isProcessed: true,
          generationMethod: "text-to-dialogue",
          duration: `${Math.floor(audioResult.duration / 60)}:${(audioResult.duration % 60).toString().padStart(2, '0')}`,
        },
      });

      // Update podcast with enhanced data
      await db.podcast.update({
        where: { id: podcast.id },
        data: {
          audioStorageKey: audioResult.storageKey,
          audioFileSize: audioResult.fileSize,
          audioFormat: "wav",
          isProcessed: true,
          totalDuration: `${Math.floor(audioResult.duration / 60)}:${(audioResult.duration % 60).toString().padStart(2, '0')}`,
        },
      });

      console.log(`✅ Section and podcast updated with enhanced audio data`);
    } catch (error) {
      console.error(
        `❌ Error generating enhanced audio for section ${section.id}:`,
        error,
      );
      console.error(
        `❌ Error details:`,
        error instanceof Error ? error.message : error,
      );

      // Update section with error status
      await db.podcastSection.update({
        where: { id: section.id },
        data: {
          isProcessed: false,
          processingError: error instanceof Error ? error.message : 'Unknown error',
          generationMethod: "failed",
        },
      });

      // Update podcast with error status
      await db.podcast.update({
        where: { id: podcast.id },
        data: {
          isProcessed: false,
          processingError: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      console.log(`⚠️ Podcast creation completed with errors - user can retry`);
    }

    // Calculate total duration based on actual audio or content length
    let totalDuration = "0:00";
    if (audioResult) {
      totalDuration = `${Math.floor(audioResult.duration / 60)}:${(audioResult.duration % 60).toString().padStart(2, '0')}`;
    } else {
      // Fallback estimation: ~150 words per minute for speech
      const words = section.content.split(" ").length;
      const estimatedMinutes = words / 150;
      const totalDurationSeconds = estimatedMinutes * 60;
      totalDuration = `${Math.floor(totalDurationSeconds / 60)}:${(totalDurationSeconds % 60).toString().padStart(2, '0')}`;
      
      console.log(
        `Content: ${words} words, estimated duration: ${estimatedMinutes.toFixed(1)} minutes`,
      );
    }

    // Update podcast with calculated duration
    await db.podcast.update({
      where: { id: podcast.id },
      data: { totalDuration },
    });

    console.log("=== ENHANCED PODCAST CREATION COMPLETE ===");

    // Fetch the final podcast with all enhanced data
    const finalPodcast = await db.podcast.findUnique({
      where: { id: podcast.id },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!finalPodcast) {
      throw new Error("Failed to fetch created podcast");
    }

    console.log("Final enhanced podcast data:", {
      id: finalPodcast.id,
      title: finalPodcast.title,
      sectionsCount: finalPodcast.sections.length,
      totalDuration: finalPodcast.totalDuration,
      isProcessed: finalPodcast.isProcessed,
      generationMethod: finalPodcast.generationMethod,
      autoDeleteAt: finalPodcast.autoDeleteAt,
      firstSectionTitle: finalPodcast.sections[0]?.title,
      firstSectionAudioUrl: finalPodcast.sections[0]?.audioUrl,
      firstSectionIsProcessed: finalPodcast.sections[0]?.isProcessed,
    });

    // Revalidate the podcast page
    revalidatePath(`/dashboard/${fileId}/podcast`);

    return { podcast: finalPodcast };
  } catch (error) {
    console.error("=== PODCAST CREATION ERROR ===");
    console.error("Error creating podcast:", error);
    return { error: "Failed to create podcast" };
  }
}
