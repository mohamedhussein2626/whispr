"use client";

import React, { useState, useEffect } from "react";
import PodcastPageWithSidebar from "@/components/dashboard/PodcastPageWithSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Headphones } from "lucide-react";
import { getFileData, getPodcast } from "@/lib/actions";

interface PodcastPageProps {
  params: Promise<{ fileId: string }>;
}

// Define types for file and podcast based on expected structure
interface FileType {
  id: string;
  name: string;
  url: string;
}

interface PodcastType {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  sections: Array<{
    id: string;
    title: string;
    audioUrl: string | null;
  }>;
}

export default function PodcastPage({ params }: PodcastPageProps) {
  const [fileId, setFileId] = useState<string>("");
  const [file, setFile] = useState<FileType | null>(null);
  const [podcast, setPodcast] = useState<PodcastType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setFileId(resolvedParams.fileId);
      await fetchFileAndPodcastData(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  const fetchFileAndPodcastData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch file data
      const fileData = await getFileData(id);
      console.log("File data fetched:", fileData);
      setFile(fileData.file as FileType);

      // Check if podcast exists using server action
      const podcastData = await getPodcast(id);
      console.log("Podcast data fetched:", podcastData);

      if (podcastData.error) {
        console.log("No existing podcast found:", podcastData.error);
        setPodcast(null);
      } else {
        setPodcast(podcastData.podcast as PodcastType);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generatePodcast = async () => {
    try {
      setGenerating(true);
      setError(null);

      console.log("Generating podcast for fileId:", fileId);

      // Use API route to create podcast
      const response = await fetch("/api/create-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      console.log("Podcast generation result:", result);

      if (!response.ok) {
        console.error("Failed to generate podcast:", result.error);
        setError(`Failed to generate podcast: ${result.error}`);
      } else {
        console.log("Podcast generated successfully:", result.podcast);
        setPodcast(result.podcast as PodcastType);
      }
    } catch (error) {
      console.error("Error generating podcast:", error);
      setError("Failed to generate podcast. Please try again.");
    } finally {
      setGenerating(false);
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

  if (!file) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Headphones className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">File not found.</p>
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
          <Button
            onClick={() => fetchFileAndPodcastData(fileId)}
            className="flex items-center gap-2"
          >
            <Headphones className="w-4 h-4" />
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
            onClick={generatePodcast}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Podcast...
              </>
            ) : (
              <>
                <Headphones className="w-4 h-4" />
                Generate Podcast
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Log the data being passed to the component
  console.log(
    "Rendering PodcastPageWithSidebar with file:",
    file,
    "and podcast:",
    podcast,
  );

  // Transform podcast to match PodcastPageWithSidebar's expected Podcast type
  const transformedPodcast = podcast
    ? {
        ...podcast,
        sections: podcast.sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: "", // default value
          content: "", // default value
          duration: "", // default value
          audioUrl: section.audioUrl ?? null,
        })),
      }
    : undefined;

  return <PodcastPageWithSidebar file={file} podcast={transformedPodcast} />;
}
