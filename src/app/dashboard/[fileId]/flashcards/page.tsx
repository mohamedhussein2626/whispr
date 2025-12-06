"use client";

import React, { useState, useEffect } from "react";
import FlashcardsPageWithSidebar from "@/components/dashboard/FlashcardsPageWithSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { getFlashcards, getFileData } from "@/lib/actions";

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

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface FlashcardsPageProps {
  params: Promise<{ fileId: string }>;
}

export default function FlashcardsPage({ params }: FlashcardsPageProps) {
  const [fileId, setFileId] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcards | null>(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFileId(resolvedParams.fileId);
      await fetchFlashcardsAndFile(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  // Auto-refresh if flashcards not found (in case it's being generated)
  useEffect(() => {
    if (!flashcards && !loading && fileId && !generating) {
      console.log("Flashcards not found, setting up auto-refresh...");
      const interval = setInterval(async () => {
        console.log("Auto-refreshing flashcards data...");
        await fetchFlashcardsAndFile(fileId);
      }, 3000); // Check every 3 seconds

      // Stop polling after 60 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.log("Stopped auto-refresh after 60 seconds");
      }, 60000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [flashcards, loading, fileId, generating]);

  const fetchFlashcardsAndFile = async (id: string) => {
    try {
      setLoading(true);

      // Use Server Actions to fetch data
      const [flashcardsData, fileData] = await Promise.all([
        getFlashcards(id),
        getFileData(id),
      ]);

      if (flashcardsData.error) {
        setFlashcards(null);
      } else {
        setFlashcards(flashcardsData.flashcards || null);
      }

      if (!fileData.file) {
        setFile(null);
      } else {
        setFile(fileData.file);
      }
    } catch (error) {
      console.error("Error fetching flashcards data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    try {
      setGenerating(true);

      const response = await fetch("/api/create-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);
      } else {
        console.error("Failed to generate flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">File not found.</p>
        </div>
      </div>
    );
  }

  if (!flashcards) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            No flashcards found for this file.
          </p>
          <Button
            onClick={generateFlashcards}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate Flashcards
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return <FlashcardsPageWithSidebar file={file} />;
}
