"use client";

import React, { useState, useEffect } from "react";
import ChatWrapper from "@/components/chat/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import PDFSidebar from "@/components/layout/PDFSidebar";
import { getFileData } from "@/lib/actions";
import BannedUserProtection from "@/components/BannedUserProtection";

interface FileData {
  id: string;
  url: string;
  // add other properties as needed
}

interface ChatbotPageProps {
  params: Promise<{ fileId: string }>;
}

export default function ChatbotPage({ params }: ChatbotPageProps) {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      await fetchFileData(resolvedParams.fileId);
    };

    resolveParams();
  }, [params]);

  const fetchFileData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const fileData = await getFileData(id);

      if (!fileData.file) {
        setError("File not found");
        setFile(null);
      } else {
        setFile(fileData.file);
      }
    } catch (error) {
      console.error("Error fetching file data:", error);
      setError("Failed to load file data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">{error || "File not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <BannedUserProtection>
      <div className="flex h-screen">
      {/* PDF Sidebar */}
      <PDFSidebar
        sidebarOpen={true}
        activeView="chatbot"
        setActiveView={() => {}}
        fileId={file.id}
        setLoading={setLoading}
        setLoadingMessage={() => {}}
      />

      {/* Main content area - Full width */}
      <div className="flex-1 flex ml-64">
        {/* PDF Viewer - Takes up more space */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        {/* Chat Interface - Fixed width */}
        <div className="w-96 border-l border-gray-200 flex flex-col">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
    </BannedUserProtection>
  );
}
