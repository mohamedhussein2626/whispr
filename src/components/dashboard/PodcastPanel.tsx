"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  Pause,
  Headphones,
  RefreshCw,
  Rewind,
  FastForward,
} from "lucide-react";
import { getPodcast } from "@/lib/actions";
import type { Prisma } from "@prisma/client";

interface PodcastPanelProps {
  fileId: string;
  initialPodcast?: Podcast;
}

interface PodcastSection {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: string;
  audioUrl?: string | null;
  // Enhanced fields
  audioStorageKey?: string | null;
  audioFileSize?: number | null;
  audioFormat?: string | null;
  isProcessed?: boolean;
  processingError?: string | null;
  generationMethod?: string | null;
}



interface Podcast {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  sections: PodcastSection[];
  // Enhanced fields
  audioStorageKey?: string | null;
  audioFileSize?: number | null;
  audioFormat?: string | null;
  autoDeleteAt?: Date | null;
  isProcessed?: boolean;
  processingError?: string | null;
  generationMethod?: string | null;
  speakers?: Prisma.JsonValue; // JsonValue from database (can be any JSON type)
  voiceSettings?: Prisma.JsonValue; // JsonValue from database (can be any JSON type)
}

type GetPodcastResult = { podcast: Podcast } | { error: string };
type CreatePodcastResult = { podcast: Podcast } | { error: string; planDetails?: unknown };

const PodcastPanel: React.FC<PodcastPanelProps> = ({
  fileId,
  initialPodcast,
}) => {
  const [podcast, setPodcast] = useState<Podcast | null>(
    initialPodcast || null,
  );
  const [loading, setLoading] = useState(!initialPodcast);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSection, setCurrentSection] = useState<PodcastSection | null>(
    null,
  );

  // Use refs to maintain audio state across renders
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSectionRef = useRef<PodcastSection | null>(null);

  const fetchPodcast = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use server action instead of API route
      const result = (await getPodcast(fileId)) as GetPodcastResult;
      console.log("Podcast data fetched:", result);

      if ("error" in result) {
        setError("No podcast found");
      } else if ("podcast" in result) {
        setPodcast(result.podcast as Podcast);
        if ((result.podcast as Podcast).sections.length > 0) {
          setCurrentSection((result.podcast as Podcast).sections[0]);
          currentSectionRef.current = (result.podcast as Podcast).sections[0];
        }
      } else {
        setError("No podcast found");
      }
    } catch (err: unknown) {
      console.error("Error fetching podcast:", err);
      setError("Failed to load podcast");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  const handleRegenerate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Regenerating podcast...");
      
      // Import the createPodcast action
      const { createPodcast } = await import('@/lib/actions');
      
      // Regenerate the podcast
      const result = (await createPodcast(fileId)) as CreatePodcastResult;
      
      if ("error" in result) {
        setError(result.error);
      } else if ("podcast" in result) {
        setPodcast(result.podcast as Podcast);
        if ((result.podcast as Podcast).sections.length > 0) {
          setCurrentSection((result.podcast as Podcast).sections[0]);
          currentSectionRef.current = (result.podcast as Podcast).sections[0];
        }
        console.log("✅ Podcast regenerated successfully!");
      }
    } catch (err: unknown) {
      console.error("Error regenerating podcast:", err);
      setError("Failed to regenerate podcast");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (!initialPodcast) {
      fetchPodcast();
    } else if (initialPodcast.sections.length > 0) {
      setCurrentSection(initialPodcast.sections[0]);
      currentSectionRef.current = initialPodcast.sections[0];
    }
  }, [fileId, initialPodcast, fetchPodcast]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const setupAudio = (audioUrl: string) => {
    console.log("Setting up audio with URL:", audioUrl);

    // Validate URL before creating audio element
    if (!audioUrl || audioUrl.trim() === "") {
      throw new Error("Invalid audio URL");
    }

    // Clean up existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );
      audioRef.current.removeEventListener("ended", handleEnded);
      audioRef.current.removeEventListener("error", handleError);
      audioRef.current.src = ""; // Clear source to prevent memory leaks
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    // Set CORS attribute for cross-origin audio (needed for R2 URLs)
    audio.crossOrigin = "anonymous";
    
    // Set preload to metadata to start loading immediately
    audio.preload = "auto";

    // Add event listeners BEFORE setting source
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    
    // Add additional error listeners for better debugging
    audio.addEventListener("stalled", () => {
      console.warn("Audio stalled:", audioUrl);
    });
    
    audio.addEventListener("suspend", () => {
      console.warn("Audio suspended:", audioUrl);
    });
    
    audio.addEventListener("waiting", () => {
      console.warn("Audio waiting for data:", audioUrl);
    });

    // Add load event listener for debugging
    audio.addEventListener("loadstart", () => {
      console.log("Audio load started for:", audioUrl);
    });

    audio.addEventListener("canplay", () => {
      console.log("Audio can play for:", audioUrl);
    });

    audio.addEventListener("canplaythrough", () => {
      console.log("Audio can play through for:", audioUrl);
    });

    return audio;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log(
        "Audio metadata loaded, duration:",
        audioRef.current.duration,
      );
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (e: Event | ErrorEvent) => {
    const audioElement = e.target as HTMLAudioElement;
    
    // Try to get error details from multiple sources
    const errorDetails: Record<string, unknown> = {
      eventType: e.type,
      timestamp: new Date().toISOString(),
    };
    
    // Get error from MediaError if available
    if (audioElement?.error) {
      const mediaError = audioElement.error;
      errorDetails.mediaErrorCode = mediaError.code;
      errorDetails.mediaErrorMessage = mediaError.message;
      
      // Map error codes to names
      const errorCodeNames: Record<number, string> = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      };
      errorDetails.mediaErrorName = errorCodeNames[mediaError.code] || 'UNKNOWN';
    }
    
    // Get network and ready state
    if (audioElement) {
      errorDetails.networkState = audioElement.networkState;
      errorDetails.networkStateName = [
        'NETWORK_EMPTY',
        'NETWORK_IDLE',
        'NETWORK_LOADING',
        'NETWORK_NO_SOURCE'
      ][audioElement.networkState] || 'UNKNOWN';
      
      errorDetails.readyState = audioElement.readyState;
      errorDetails.readyStateName = [
        'HAVE_NOTHING',
        'HAVE_METADATA',
        'HAVE_CURRENT_DATA',
        'HAVE_FUTURE_DATA',
        'HAVE_ENOUGH_DATA'
      ][audioElement.readyState] || 'UNKNOWN';
      
      errorDetails.src = audioElement.src;
      errorDetails.currentSrc = audioElement.currentSrc;
    }
    
    // Get error from ErrorEvent if available
    if (e instanceof ErrorEvent) {
      errorDetails.errorEventMessage = e.message;
      errorDetails.errorEventFilename = e.filename;
      errorDetails.errorEventLineno = e.lineno;
      errorDetails.errorEventColno = e.colno;
    }
    
    console.error("Audio error details:", errorDetails);

    // Determine user-friendly error message
    let errorMessage = "Failed to load audio file";
    
    if (audioElement?.error) {
      const code = audioElement.error.code;
      switch (code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Audio playback was aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio. The file may be inaccessible or your connection may be slow.";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Audio decoding error. The file may be corrupted or in an unsupported format.";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio format not supported or file not found. Please regenerate the podcast.";
          break;
        default:
          errorMessage = `Audio error (code ${code}): ${audioElement.error.message || "Unknown error"}`;
      }
    } else if (audioElement?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      errorMessage = "No audio source found. The audio URL may be invalid. Please regenerate the podcast.";
    } else if (audioElement?.networkState === HTMLMediaElement.NETWORK_LOADING) {
      errorMessage = "Audio is still loading. Please wait a moment and try again.";
    } else {
      errorMessage = "Failed to load audio. Please check the audio URL or regenerate the podcast.";
    }

    setError(errorMessage);
    setIsPlaying(false);
    
    // Log the full error for debugging
    console.error("Audio playback failed:", {
      url: audioElement?.src,
      error: errorDetails,
    });
  };

  const handlePlayPause = async (section?: PodcastSection) => {
    const targetSection = section || currentSection;
    if (!targetSection?.audioUrl || targetSection.audioUrl === null) {
      console.error("No audio URL available for section:", targetSection);
      setError("No audio available for this section. Please regenerate the podcast.");
      return;
    }

    // Validate and normalize audio URL
    let audioUrl = targetSection.audioUrl;
    if (!audioUrl || audioUrl.trim() === "") {
      console.error("Invalid audio URL:", audioUrl);
      setError("Invalid audio URL. Please regenerate the podcast.");
      return;
    }
    
    // Convert R2 direct URLs to proxy route for proper CORS support
    if (audioUrl.includes("r2.cloudflarestorage.com")) {
      console.log("🔄 Converting R2 URL to proxy route:", audioUrl);
      // Extract the key from R2 URL
      const r2Match = audioUrl.match(/r2\.cloudflarestorage\.com\/(.+)$/);
      if (r2Match) {
        const storageKey = r2Match[1];
        // Use proxy route with proper encoding
        audioUrl = `/api/audio-proxy?key=${encodeURIComponent(storageKey)}`;
        console.log("✅ Converted to proxy URL:", audioUrl);
      } else {
        console.error("❌ Could not extract key from R2 URL:", audioUrl);
        setError("Invalid R2 audio URL format. Please regenerate the podcast.");
        return;
      }
    }
    
    // Check if it's a valid URL format
    const isValidUrl = audioUrl.startsWith("http://") || 
                       audioUrl.startsWith("https://") || 
                       audioUrl.startsWith("/api/audio/") ||
                       audioUrl.startsWith("/api/audio-proxy");
    
    if (!isValidUrl) {
      console.error("Invalid audio URL format:", audioUrl);
      setError("Invalid audio URL format. Please regenerate the podcast.");
      return;
    }

    console.log("🎵 Attempting to play audio from URL:", audioUrl);

    // If we're already playing this section, just pause/resume
    if (
      currentSectionRef.current?.id === targetSection.id &&
      audioRef.current
    ) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error resuming audio:", error);
            setError("Failed to resume audio. Please try again.");
          });
      }
      return;
    }

    // If we're playing a different section, stop current and play new
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Setup and play new section
    const audio = setupAudio(audioUrl);

    // Try to load and play the audio
    audio
      .play()
      .then(() => {
        console.log("✅ Audio started playing successfully");
        setIsPlaying(true);
        setCurrentSection(targetSection);
        currentSectionRef.current = targetSection;
        setError(null); // Clear any previous errors
      })
      .catch((playError) => {
        console.error("❌ Error playing audio:", playError);
        console.error("Audio element state:", {
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState,
          error: audio.error,
        });
        
        // Provide more specific error messages
        let errorMsg = "Failed to play audio. ";
        if (playError.name === "NotAllowedError") {
          errorMsg += "Autoplay was blocked. Please click play again.";
        } else if (playError.name === "NotSupportedError") {
          errorMsg += "Audio format not supported. Please regenerate the podcast.";
        } else if (audio.error) {
          errorMsg += `Error code: ${audio.error.code}. Please regenerate the podcast.`;
        } else {
          errorMsg += "Please check your connection or regenerate the podcast.";
        }
        
        setError(errorMsg);
        setIsPlaying(false);
      });
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(
        audioRef.current.currentTime + 30,
        audioRef.current.duration,
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 30, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const regeneratePodcast = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Regenerating podcast for fileId:", fileId);

      // Use API route to create podcast
      const response = await fetch("/api/create-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      console.log("Podcast regeneration result:", result);

      if (!response.ok) {
        console.error("Failed to regenerate podcast:", result.error);
        setError(`Failed to regenerate podcast: ${result.error}`);
      } else if (result.podcast) {
        console.log("Podcast regenerated successfully:", result.podcast);
        setPodcast(result.podcast);
        if (result.podcast.sections.length > 0) {
          setCurrentSection(result.podcast.sections[0]);
          currentSectionRef.current = result.podcast.sections[0];
        }
      } else {
        setError("Failed to regenerate podcast: No podcast data received");
      }
    } catch (error) {
      console.error("Error regenerating podcast:", error);
      setError("Failed to regenerate podcast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading podcast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Headphones className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPodcast} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Headphones className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">No podcast available</p>
          <Button
            onClick={regeneratePodcast}
            className="flex items-center gap-2"
          >
            <Headphones className="w-4 h-4" />
            Generate Podcast
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Podcast Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {podcast.title}
          </h1>
          <p className="text-gray-600 mb-4">{podcast.description}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {podcast.totalDuration || "Duration not available"}
            </Badge>
            <Badge variant="outline">
              {podcast.sections.length} section
              {podcast.sections.length !== 1 ? "s" : ""}
            </Badge>
            
            {/* Enhanced status badges */}
            {podcast.isProcessed === true && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                ✅ Processed
              </Badge>
            )}

            {podcast.isProcessed === false && podcast.processingError && (
              <Badge variant="destructive">
                ⚠️ Processing Failed
              </Badge>
            )}
            
            {podcast.generationMethod && (
              <Badge variant="secondary">
                🎙️ {podcast.generationMethod.replace('-', ' ').toUpperCase()}
              </Badge>
            )}
            
            {podcast.audioFileSize && (
              <Badge variant="outline">
                📦 {(podcast.audioFileSize / 1024 / 1024).toFixed(1)} MB
              </Badge>
            )}
            
            {podcast.autoDeleteAt && (
              <Badge variant="outline" className="text-orange-600">
                🗑️ Auto-delete: {new Date(podcast.autoDeleteAt).toLocaleDateString()}
              </Badge>
            )}
          </div>
          
          {/* Regeneration button */}
          <div className="mt-4">
            <Button
              onClick={handleRegenerate}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Regenerate Podcast
            </Button>
          </div>
        </div>

        {/* Podcast Sections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Podcast Sections
          </h2>

          {podcast.sections.map((section) => (
            <Card
              key={section.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-600 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {section.content}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="outline">
                        {section.duration || "Duration not available"}
                      </Badge>
                      
                      {/* Enhanced section status */}
                      {section.isProcessed ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ✅ Ready
                        </Badge>
                      ) : section.processingError ? (
                        <Badge variant="destructive">
                          ❌ Failed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          ⏳ Processing...
                        </Badge>
                      )}
                      
                      {section.audioFileSize && (
                        <Badge variant="outline">
                          📦 {(section.audioFileSize / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      )}
                      
                      {section.generationMethod && (
                        <Badge variant="outline">
                          🎙️ {section.generationMethod.replace('-', ' ').toUpperCase()}
                        </Badge>
                      )}
                      
                      {section.audioUrl && (
                        <Badge variant="outline" className="text-green-600">
                          🔊 Audio Available
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show processing error if any */}
                    {section.processingError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Error:</strong> {section.processingError}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => handlePlayPause(section)}
                      disabled={!section.audioUrl || section.audioUrl === null}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isPlaying && currentSection?.id === section.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isPlaying && currentSection?.id === section.id
                        ? "Pause"
                        : "Play"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Player Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="flex flex-col h-full">
          {/* Podcast Cover */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 w-full aspect-square rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center text-white">
              <Headphones className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-medium">Podcasts by</p>
              <p className="text-sm">NotebookLama</p>
            </div>
          </div>

          {/* Podcast Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {podcast.title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {podcast.totalDuration || "Duration not available"}
          </p>

          {/* Audio Player */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div
                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipBackward}
                disabled={
                  !currentSection?.audioUrl || currentSection.audioUrl === null
                }
                className="text-gray-600 hover:text-gray-900"
              >
                <Rewind className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handlePlayPause()}
                disabled={
                  !currentSection?.audioUrl || currentSection.audioUrl === null
                }
                size="lg"
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipForward}
                disabled={
                  !currentSection?.audioUrl || currentSection.audioUrl === null
                }
                className="text-gray-600 hover:text-gray-900"
              >
                <FastForward className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Regenerate Button */}
          <div className="mt-auto pt-6">
            <Button
              onClick={regeneratePodcast}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Podcast
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPanel;
