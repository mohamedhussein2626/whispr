"use client";

import React, { useState, useEffect } from "react";
import PDFSidebar from "@/components/layout/PDFSidebar";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import QuizPanel from "@/components/dashboard/QuizPanel";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, RefreshCw } from "lucide-react";
import { getQuiz } from "@/lib/actions";
import BannedUserProtection from "@/components/BannedUserProtection";

// Match the Prisma schema structure
interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer: string; // This stores the correct answer (e.g., "A", "B", "C", "D")
  createdAt: Date;
}

interface Quiz {
  id: string;
  fileId: string;
  title: string;
  createdAt: Date;
  questions: QuizQuestion[];
}

interface QuizPageWithSidebarProps {
  file: { id: string; name: string; url: string };
}

export default function QuizPageWithSidebar({
  file,
}: QuizPageWithSidebarProps) {
  const [sidebarOpen, ] = useState(true);
  const [activeView, setActiveView] = useState("quiz");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading Quiz...");
        setError(null);

        console.log("Fetching quiz for fileId:", file.id);
        const quizData = await getQuiz(file.id);

        if (quizData.error) {
          console.log("Quiz not found, will need to generate:", quizData.error);
          setQuiz(null);
          setError(
            "No quiz found. Click 'Generate Quiz' to create one from your PDF content.",
          );
        } else if (quizData.quiz) {
          console.log("Quiz loaded successfully:", quizData.quiz);
          setQuiz(quizData.quiz);
        } else {
          setQuiz(null);
          setError("Failed to load quiz data");
        }
      } catch (err: unknown) {
        console.error("Error fetching quiz:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch quiz";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (file.id) {
      fetchQuiz();
    }
  }, [file.id]);

  const generateQuiz = async () => {
    try {
      setGenerating(true);
      setLoadingMessage("Generating Quiz from PDF Content...");
      setError(null);

      console.log("Generating quiz for fileId:", file.id);

      const response = await fetch("/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      });

      console.log("Quiz generation response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Quiz generated successfully:", data);

        // Refresh the quiz data after generation
        setQuiz(data.quiz);
        setLoadingMessage("Quiz Generated Successfully!");
        setTimeout(() => setLoadingMessage(""), 2000);
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

  const refreshQuiz = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Refreshing Quiz...");
      setError(null);

      const quizData = await getQuiz(file.id);

      if (quizData.error) {
        setQuiz(null);
        setError(
          "No quiz found. Click 'Generate Quiz' to create one from your PDF content.",
        );
      } else if (quizData.quiz) {
        setQuiz(quizData.quiz);
      } else {
        setQuiz(null);
        setError("Failed to load quiz data");
      }
    } catch (err: unknown) {
      console.error("Error refreshing quiz:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh quiz";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BannedUserProtection>
      <div className="flex h-[calc(100vh-3.5rem)]">
      <PDFSidebar
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        fileId={file.id}
        setLoading={setLoading}
        setLoadingMessage={setLoadingMessage}
      />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}
      >
        {/* Quick Navigation Tabs */}
        <QuickNavTabs fileId={file.id} currentPage="quiz" />

        <div className="flex-1 px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
                  <p className="text-gray-600">
                    Test your knowledge with questions based on your PDF content
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={refreshQuiz}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>

                {!quiz && (
                  <Button
                    onClick={generateQuiz}
                    disabled={generating || loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                    {generating ? "Generating..." : "Generate Quiz"}
                  </Button>
                )}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {loadingMessage || "Loading quiz..."}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    No Quiz Available
                  </h3>
                  <p className="text-yellow-700 mb-4">{error}</p>
                  <Button
                    onClick={generateQuiz}
                    disabled={generating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Generate Quiz from PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : quiz ? (
              <div className="bg-white rounded-xl shadow-lg">
                <QuizPanel quiz={quiz} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No quiz available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <p className="text-lg font-medium text-gray-900">
              {loadingMessage || "Loading..."}
            </p>
            <p className="text-sm text-gray-600">
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}
    </div>
    </BannedUserProtection>
  );
}
