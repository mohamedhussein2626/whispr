"use client";

import React, { useState, useEffect } from "react";
import PDFSidebar from "@/components/layout/PDFSidebar";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, RefreshCw } from "lucide-react";
import { getTranscript } from "@/lib/actions";
import BannedUserProtection from "@/components/BannedUserProtection";

interface TranscriptPageWithSidebarProps {
  file: {
    id: string;
    name: string;
  };
}

export default function TranscriptPageWithSidebar({
  file,
}: TranscriptPageWithSidebarProps) {
  const [sidebarOpen, ] = useState(true);
  const [activeView, setActiveView] = useState("transcript");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading Transcript...");
        setError(null);

        console.log("Fetching transcript for fileId:", file.id);
        const transcriptData = await getTranscript(file.id);

        if (transcriptData.error) {
          console.log(
            "Transcript not found, will need to generate:",
            transcriptData.error,
          );
          setTranscript("");
          setError(
            "No transcript found. Click 'Generate Transcript' to create one from your PDF content.",
          );
        } else {
          console.log(
            "Transcript loaded successfully:",
            transcriptData.transcript,
          );
          setTranscript(transcriptData.transcript?.content || "");
        }
      } catch (err: unknown) {
        console.error("Error fetching transcript:", err);
        setError((err as Error).message || "Failed to fetch transcript");
      } finally {
        setLoading(false);
      }
    };

    if (file.id) {
      fetchTranscript();
    }
  }, [file.id]);

  const generateTranscript = async () => {
    try {
      setGenerating(true);
      setLoadingMessage("Generating Transcript from PDF Content...");
      setError(null);

      console.log("Generating transcript for fileId:", file.id);

      const response = await fetch("/api/create-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      });

      console.log("Transcript generation response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Transcript generated successfully:", data);

        // Refresh the transcript data after generation
        setTranscript(data.transcript.content);
        setLoadingMessage("Transcript Generated Successfully!");
        setTimeout(() => setLoadingMessage(""), 2000);
      } else {
        const errorData = await response.json();
        console.error("Failed to generate transcript:", errorData);
        setError(
          `Failed to generate transcript: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error generating transcript:", error);
      setError("Failed to generate transcript. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const refreshTranscript = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Refreshing Transcript...");
      setError(null);

      const transcriptData = await getTranscript(file.id);

      if (transcriptData.error) {
        setTranscript("");
        setError(
          "No transcript found. Click 'Generate Transcript' to create one from your PDF content.",
        );
      } else {
        setTranscript(transcriptData.transcript?.content || "");
      }
    } catch (err: unknown) {
      console.error("Error refreshing transcript:", err);
      setError((err as Error).message || "Failed to refresh transcript");
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
        <QuickNavTabs fileId={file.id} currentPage="transcript" />

        <div className="flex-1 px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Transcript
                  </h1>
                  <p className="text-gray-600">
                    Document content in text format
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={refreshTranscript}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>

                {!transcript && (
                  <Button
                    onClick={generateTranscript}
                    disabled={generating || loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {generating ? "Generating..." : "Generate Transcript"}
                  </Button>
                )}
              </div>
            </div>

            {/* Transcript Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {loadingMessage || "Loading transcript..."}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <FileText className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    No Transcript Available
                  </h3>
                  <p className="text-yellow-700 mb-4">{error}</p>
                  <Button
                    onClick={generateTranscript}
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
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Transcript from PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : transcript ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {transcript}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Transcript
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Generate a transcript from your PDF content to view it in
                    text format.
                  </p>
                  <Button
                    onClick={generateTranscript}
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
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Transcript
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
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
