"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Brain,
  CreditCard,
  FileAudio,
  MessageSquare,
  Headphones,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getQuiz, getFlashcards, getTranscript } from "@/lib/actions";

interface QuickNavTabsProps {
  fileId: string;
  currentPage: "chatbot" | "podcast" | "flashcards" | "quiz" | "transcript";
}

interface GenerationStatus {
  quiz: "idle" | "generating" | "ready" | "error";
  flashcards: "idle" | "generating" | "ready" | "error";
  transcript: "idle" | "generating" | "ready" | "error";
  podcast: "idle" | "generating" | "ready" | "error";
}

const QuickNavTabs: React.FC<QuickNavTabsProps> = ({ fileId, currentPage }) => {
  const router = useRouter();
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    quiz: "idle",
    flashcards: "idle",
    transcript: "idle",
    podcast: "idle",
  });
  const [isNavigating, setIsNavigating] = useState(false);

  const navItems = [
    {
      id: "chatbot",
      icon: MessageSquare,
      label: "Chat Bot",
      path: `/dashboard/${fileId}?view=chatbot`,
      description: "Ask questions about your document",
    },
    {
      id: "podcast",
      icon: Headphones,
      label: "Podcast",
      path: `/dashboard/${fileId}?view=podcast`,
      description: "Listen to your document as audio",
    },
    {
      id: "flashcards",
      icon: CreditCard,
      label: "Flashcards",
      path: `/dashboard/${fileId}/flashcards`,
      description: "Study with AI-generated flashcards",
      isGeneration: true,
    },
    {
      id: "quiz",
      icon: Brain,
      label: "Quiz",
      path: `/dashboard/${fileId}/quiz`,
      description: "Test your knowledge with quizzes",
      isGeneration: true,
    },
    {
      id: "transcript",
      icon: FileAudio,
      label: "Transcript",
      path: `/dashboard/${fileId}/transcript`,
      description: "View document in text format",
      isGeneration: true,
    },
  ];

  // Check generation status on mount
  useEffect(() => {
    const checkGenerationStatus = async () => {
      try {
        // Check if content exists for each generation type using server actions
        const [quizResult, flashcardsResult, transcriptResult] =
          await Promise.all([
            getQuiz(fileId),
            getFlashcards(fileId),
            getTranscript(fileId),
          ]);

        setGenerationStatus((prev) => ({
          ...prev,
          quiz: quizResult.error ? "idle" : "ready",
          flashcards: flashcardsResult.error ? "idle" : "ready",
          transcript: transcriptResult.error ? "idle" : "ready",
        }));
      } catch {
        // Silently handle errors when checking generation status
      }
    };

    checkGenerationStatus();
  }, [fileId]);

  const handleNavClick = async (item: (typeof navItems)[0]) => {
    if (item.id === currentPage || isNavigating) return; // Don't navigate if already on current page or navigating

    const currentFileId = fileId; // Use current fileId
    console.log("🚀 QuickNavTabs: Navigation clicked:", item.id, "fileId:", currentFileId);
    setIsNavigating(true);

    if (item.isGeneration) {
      // For generation pages, trigger generation if not ready
      const status = generationStatus[item.id as keyof GenerationStatus];
      if (status === "idle" || status === "error") {
        setGenerationStatus((prev) => ({
          ...prev,
          [item.id]: "generating",
        }));

        try {
          const endpoint =
            item.id === "quiz"
              ? "/api/create-quiz"
              : item.id === "flashcards"
                ? "/api/create-flashcards"
                : item.id === "transcript"
                  ? "/api/create-transcript"
                  : "/api/create-podcast"; // Added podcast generation

          console.log("📤 QuickNavTabs: Calling API:", endpoint, "with fileId:", currentFileId);
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: currentFileId }),
          });

          if (response.ok) {
            setGenerationStatus((prev) => ({
              ...prev,
              [item.id]: "ready",
            }));
          } else {
            setGenerationStatus((prev) => ({
              ...prev,
              [item.id]: "error",
            }));
          }
        } catch {
          setGenerationStatus((prev) => ({
            ...prev,
            [item.id]: "error",
          }));
        }
      }
    }

    // Navigate to the page
    router.push(item.path);

    // Reset navigation state after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  const getStatusIcon = (itemId: string) => {
    const status = generationStatus[itemId as keyof GenerationStatus];
    switch (status) {
      case "ready":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "generating":
        return <Clock className="w-3 h-3 text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (itemId: string) => {
    const status = generationStatus[itemId as keyof GenerationStatus];
    switch (status) {
      case "ready":
        return (
          <Badge
            variant="secondary"
            className="ml-1 text-xs bg-green-100 text-green-800"
          >
            Ready
          </Badge>
        );
      case "generating":
        return (
          <Badge
            variant="secondary"
            className="ml-1 text-xs bg-blue-100 text-blue-800"
          >
            Generating
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="secondary"
            className="ml-1 text-xs bg-red-100 text-red-800"
          >
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-2 mr-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Quick Navigation
              </span>
            </div>
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                <Button
                  variant={currentPage === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavClick(item)}
                  disabled={isNavigating}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } ${isNavigating ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={item.description}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.label}</span>
                  {getStatusIcon(item.id)}
                  {currentPage === item.id && (
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs bg-blue-100 text-blue-800"
                    >
                      Active
                    </Badge>
                  )}
                  {getStatusBadge(item.id)}
                  {isNavigating && item.id !== currentPage && (
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin ml-1"></div>
                  )}
                </Button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickNavTabs;
