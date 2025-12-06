"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  AlertCircle,
  RefreshCw,
  Volume1,
} from "lucide-react";

interface BrowserSpeechPlayerProps {
  text: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export default function BrowserSpeechPlayer({
  text,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: BrowserSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    if ("speechSynthesis" in window) {
      setSpeechSupported(true);
      console.log("✅ Browser speech synthesis supported");
    } else {
      setError("Speech synthesis not supported in this browser");
      console.log("❌ Browser speech synthesis not supported");
    }
  }, []);

  useEffect(() => {
    if (speechRef.current) {
      speechRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const startSpeech = () => {
    if (!speechSynthesis || !speechSupported) {
      setError("Speech synthesis not available");
      return;
    }

    try {
      // Cancel any existing speech
      speechSynthesis.cancel();

      // Create new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : volume;

      // Set up event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        startTimeRef.current = Date.now();
        onPlay?.();
        console.log("🎙️ Speech started");
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        startTimeRef.current = null;
        onEnded?.();
        console.log("🎙️ Speech ended");
      };

      utterance.onpause = () => {
        setIsPlaying(false);
        onPause?.();
        console.log("🎙️ Speech paused");
      };

      utterance.onresume = () => {
        setIsPlaying(true);
        onPlay?.();
        console.log("🎙️ Speech resumed");
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        setError("Speech synthesis failed. Please try again.");
        setIsPlaying(false);
        setIsLoading(false);
      };

      // Store reference
      speechRef.current = utterance;

      // Start speech
      setIsLoading(true);
      speechSynthesis.speak(utterance);

      // Start progress tracking
      startProgressTracking();
    } catch (error) {
      console.error("Error starting speech:", error);
      setError("Failed to start speech synthesis");
    }
  };

  const startProgressTracking = () => {
    // Estimate duration based on text length (rough estimate: 150 words per minute)
    const words = text.split(" ").length;
    const estimatedDuration = (words / 150) * 60; // seconds
    setDuration(estimatedDuration);

    // Update progress every 100ms
    intervalRef.current = setInterval(() => {
      if (speechRef.current && isPlaying && startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const newTime = Math.min(elapsed, estimatedDuration);
        setCurrentTime(newTime);
        onTimeUpdate?.(newTime, estimatedDuration);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const togglePlayPause = () => {
    if (!speechSynthesis || !speechSupported) return;

    if (isPlaying) {
      speechSynthesis.pause();
    } else {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      } else {
        startSpeech();
      }
    }
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
    setError(null);
    startSpeech();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
      stopProgressTracking();
    };
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-2 font-medium">Speech Error</p>
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-xs mb-4">Preparing speech...</p>
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Progress value={(currentTime / duration) * 100} className="h-2" />
        <p className="text-xs text-gray-400 mt-1 text-center">
          Note: Seeking and skipping not available in speech synthesis
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="text-gray-400"
          title="Skip back not available in speech synthesis"
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
          disabled
          className="text-gray-400"
          title="Skip forward not available in speech synthesis"
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
            <Volume1 className="w-4 h-4" />
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

      {/* Speech Info */}
      <div className="text-center text-xs text-gray-500">
        <p>Using browser speech synthesis</p>
        <p className="text-gray-400">Text length: {text.length} characters</p>
      </div>
    </div>
  );
}
