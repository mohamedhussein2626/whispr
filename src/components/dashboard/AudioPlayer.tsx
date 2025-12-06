"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
}

export default function AudioPlayer({
  audioUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title: _title, // Prefix with underscore to indicate intentionally unused
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("🎵 AudioPlayer: Loading audio URL:", audioUrl);

    // Validate audio URL before trying to load
    if (!audioUrl || audioUrl.trim() === "") {
      console.log("🎵 AudioPlayer: No audio URL provided");
      setError("No audio file available");
      setIsLoading(false);
      return;
    }

    const handleLoadedMetadata = () => {
      console.log("🎵 AudioPlayer: Audio metadata loaded successfully");
      console.log("🎵 AudioPlayer: Duration:", audio.duration);
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleError = () => {
      console.log("🎵 AudioPlayer: Audio error occurred");
      const audio = audioRef.current;

      if (audio && audio.error) {
        const errorInfo = {
          code: audio.error.code,
          message: audio.error.message,
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState,
        };
        console.log("🎵 AudioPlayer: Error details:", errorInfo);
      }

      setIsLoading(false);
      setError(
        `Audio file not found. Please try refreshing the page or contact support if the issue persists.`
      );
      onError?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    // Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // Silent timeout handling - no console logs
      }
    }, 5000); // 5 second timeout

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      clearTimeout(loadingTimeout);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, [onTimeUpdate, onPlay, onPause, onEnded, isLoading, audioUrl, onError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        // Silent error handling - no console.error calls
        setError("Failed to play audio. Please try again.");
        console.error("error play audio", error);


      });
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(currentTime + 30, duration);
  };

  const handleSkipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(currentTime - 30, 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value / 100);
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const retryLoad = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);
    audio.load();
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-medium">Audio Error</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Button
            onClick={retryLoad}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state with a timeout
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs mb-4">Loading audio...</p>
        </div>

        {/* Show basic controls even while loading */}
        <div className="flex items-center justify-center space-x-4">
          <Button variant="ghost" size="sm" disabled className="text-gray-400">
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            disabled
            className="w-12 h-12 rounded-full bg-gray-400 text-white"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>

          <Button variant="ghost" size="sm" disabled className="text-gray-400">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={retryLoad}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Progress
          value={(currentTime / duration) * 100}
          className="h-2 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            handleSeek(percentage);
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkipBack}
          className="text-gray-600 hover:text-gray-900"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          onClick={togglePlayPause}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkipForward}
          className="text-gray-600 hover:text-gray-900"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="text-gray-500 hover:text-gray-700"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        <Progress
          value={isMuted ? 0 : volume * 100}
          className="flex-1 h-1 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            handleVolumeChange(percentage);
          }}
        />
      </div>
    </div>
  );
}
