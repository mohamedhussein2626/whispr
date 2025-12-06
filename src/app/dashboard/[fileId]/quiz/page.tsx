"use client";

import React, { useState, useEffect } from "react";
import QuizPageWithSidebar from "@/components/dashboard/QuizPageWithSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { getQuiz, getFileData } from "@/lib/actions";

interface QuizPageProps {
  params: Promise<{ fileId: string }>;
}

interface Quiz {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    answer: string;
  }>;
}

interface FileData {
  id: string;
  name: string;
  url: string;
}

export default function QuizPage({ params }: QuizPageProps) {
  const [fileId, setFileId] = useState<string>("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFileId(resolvedParams.fileId);
      await fetchQuizAndFile(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  // Auto-refresh if quiz not found (in case it's being generated)
  useEffect(() => {
    if (!quiz && !loading && fileId && !generating) {
      console.log("Quiz not found, setting up auto-refresh...");
      const interval = setInterval(async () => {
        console.log("Auto-refreshing quiz data...");
        await fetchQuizAndFile(fileId);
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
  }, [quiz, loading, fileId, generating]);

  const fetchQuizAndFile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Fetching quiz for fileId:", id);

      // Use Server Actions to fetch data
      const [quizData, fileData] = await Promise.all([
        getQuiz(id),
        getFileData(id),
      ]);

      console.log("📥 Quiz data fetched for fileId:", id, quizData);
      console.log("📥 File data fetched for fileId:", id, fileData);
      if (fileData.file) {
        console.log("📄 File name:", fileData.file.name);
      }

      if (quizData.error) {
        setError(quizData.error);
        setQuiz(null);
      } else {
        setQuiz(quizData.quiz || null);
      }

      if (!fileData.file) {
        setError("File not found");
        setFile(null);
      } else {
        setFile({
          id: fileData.file.id,
          name: fileData.file.name,
          url: fileData.file.url,
        });
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setError("Failed to load quiz data");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setGenerating(true);
      setError(null);

      console.log("Generating quiz for fileId:", fileId);

      const response = await fetch("/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      console.log("Quiz generation response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Quiz generated successfully:", data);

        // Refresh the quiz data after generation
        await fetchQuizAndFile(fileId);
      } else {
        const errorData = await response.json();
        console.error("Failed to generate quiz:", errorData);
        setError(
          `Failed to generate quiz: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading quiz...</p>
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => fetchQuizAndFile(fileId)}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">No quiz found for this file.</p>
          <Button
            onClick={generateQuiz}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Log the quiz data being passed to the component
  console.log("Rendering QuizPageWithSidebar with quiz:", quiz);

  return <QuizPageWithSidebar file={file} />;
}
