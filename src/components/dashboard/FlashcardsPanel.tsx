"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlashcards } from "@/lib/actions";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Flashcards {
  id: string;
  title: string;
  cards: Flashcard[];
}

interface FlashcardsPanelProps {
  fileId: string;
}

export function FlashcardsPanel({ fileId }: FlashcardsPanelProps) {
  const [flashcards, setFlashcards] = useState<Flashcards | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching flashcards for fileId:", fileId);

        // Use server action to get existing flashcards
        const result = await getFlashcards(fileId);

        if (result.error) {
          console.log("No flashcards found, will need to generate");
          setFlashcards(null);
          setError(
            "No flashcards found. Click 'Generate Flashcards' to create them from your PDF content.",
          );
        } else {
          console.log("Flashcards loaded successfully:", result.flashcards);
          setFlashcards(result.flashcards || null);
        }
      } catch (err: unknown) {
        console.error("Error fetching flashcards:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load flashcards",
        );
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchFlashcards();
    }
  }, [fileId]);

  const generateFlashcards = async () => {
    try {
      setGenerating(true);
      setError(null);

      console.log("Generating flashcards for fileId:", fileId);

      const response = await fetch("/api/create-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      console.log("Flashcards generation response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Flashcards generated successfully:", data);
        setFlashcards(data.flashcards);
      } else {
        const errorData = await response.json();
        console.error("Failed to generate flashcards:", errorData);
        setError(
          `Failed to generate flashcards: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error: unknown) {
      console.error("Error generating flashcards:", error);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const refreshFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getFlashcards(fileId);

      if (result.error) {
        setFlashcards(null);
        setError(
          "No flashcards found. Click 'Generate Flashcards' to create them from your PDF content.",
        );
      } else {
        setFlashcards(result.flashcards || null);
      }
    } catch (err: unknown) {
      console.error("Error refreshing flashcards:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh flashcards",
      );
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (flashcards && currentCardIndex < flashcards.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <CreditCard className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Flashcards Available
          </h3>
          <p className="text-yellow-700 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={generateFlashcards}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>
            <Button
              onClick={refreshFlashcards}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!flashcards || flashcards.cards.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Flashcards
          </h3>
          <p className="text-gray-600 mb-4">
            Generate flashcards from your PDF content to start studying.
          </p>
          <Button
            onClick={generateFlashcards}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards.cards[currentCardIndex];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flashcards</h2>
            <p className="text-sm text-gray-600">
              {flashcards.cards.length} flashcards to study
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshFlashcards}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button
            onClick={generateFlashcards}
            variant="outline"
            size="sm"
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {generating ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentCard.question}
          </h3>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-base text-gray-600">{currentCard.answer}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={prevCard}
          disabled={currentCardIndex === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <span className="text-base font-medium text-gray-700">
          {currentCardIndex + 1} / {flashcards.cards.length}
        </span>

        <Button
          onClick={nextCard}
          disabled={currentCardIndex === flashcards.cards.length - 1}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
