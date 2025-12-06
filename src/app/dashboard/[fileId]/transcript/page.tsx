"use client";

import React, { useState, useEffect } from "react";
import TranscriptPageWithSidebar from "@/components/dashboard/TranscriptPageWithSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { getTranscript, getFileData } from "@/lib/actions";

interface File {
  id: string;
  name: string;
  url: string;
}

interface TranscriptPageProps {
  params: Promise<{ fileId: string }>;
}

export default function TranscriptPage({ params }: TranscriptPageProps) {
  const [fileId, setFileId] = useState<string>("");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFileId(resolvedParams.fileId);
      await fetchTranscriptAndFile(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  // Auto-refresh if transcript not found (in case it's being generated)
  useEffect(() => {
    if (!transcript && !loading && fileId && !generating) {
      console.log("Transcript not found, setting up auto-refresh...");
      const interval = setInterval(async () => {
        console.log("Auto-refreshing transcript data...");
        await fetchTranscriptAndFile(fileId);
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
  }, [transcript, loading, fileId, generating]);

  const fetchTranscriptAndFile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Server Actions to fetch data
      const [transcriptData, fileData] = await Promise.all([
        getTranscript(id),
        getFileData(id),
      ]);

      if (transcriptData.error) {
        setError(transcriptData.error);
        setTranscript(null);
      } else {
        setTranscript(transcriptData.transcript?.content || null);
      }

      if (!fileData.file) {
        setError("File not found");
        setFile(null);
      } else {
        setFile(fileData.file);
      }
    } catch (error) {
      console.error("Error fetching transcript data:", error);
      setError("Failed to load transcript data");
    } finally {
      setLoading(false);
    }
  };

  const generateTranscript = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch("/api/create-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranscript(data.transcript?.content || null);
      } else {
        const errorData = await response.json();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading transcript...</p>
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
            onClick={() => fetchTranscriptAndFile(fileId)}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">
            No transcript found for this file.
          </p>
          <Button
            onClick={generateTranscript}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Transcript...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate Transcript
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TranscriptPageWithSidebar
      file={{
        id: file.id,
        name: file.name,
      }}
    />
  );
}
