"use client";
import React, { useState, useEffect, useMemo } from "react";
import PDFSidebar from "@/components/layout/PDFSidebar";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import { Loader2, FileText, ChevronRight } from "lucide-react";
import type { File } from "@prisma/client";
import BannedUserProtection from "@/components/BannedUserProtection";
import { getAbsoluteFileUrl } from "@/lib/file-url-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LibraryTopic {
  id: string;
  name: string;
  description: string | null;
}

interface TopicViewPageProps {
  topic: LibraryTopic;
  files: File[];
}

export default function TopicViewPage({ topic, files }: TopicViewPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("chatbot");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [showFileList, setShowFileList] = useState(true);

  const currentFile = files[selectedFileIndex];
  const hasMultipleFiles = files.length > 1;

  // Use the currently selected file ID for content generation
  // This allows each file to have its own quiz, flashcards, etc.
  // Force recalculation on every render to ensure we have the latest file
  const selectedFileId = useMemo(() => {
    const file = files[selectedFileIndex];
    const id = file?.id || files[0]?.id || "";
    console.log("🔄 Computing selectedFileId:", {
      index: selectedFileIndex,
      fileName: file?.name,
      fileId: id,
      totalFiles: files.length,
    });
    return id;
  }, [selectedFileIndex, files]);
  
  // Log when file selection changes
  useEffect(() => {
    console.log("📋 Selected file state:", {
      index: selectedFileIndex,
      fileName: currentFile?.name,
      fileId: selectedFileId,
      allFiles: files.map(f => ({ id: f.id, name: f.name })),
    });
  }, [selectedFileIndex, selectedFileId, currentFile?.name, files]);

  return (
    <BannedUserProtection>
      <div className="flex h-screen">
        {/* PDF Sidebar - Key ensures remount when file changes */}
        {currentFile && selectedFileId && (
          <PDFSidebar
            key={`sidebar-${selectedFileId}`}
            sidebarOpen={sidebarOpen}
            activeView={activeView}
            setActiveView={setActiveView}
            fileId={selectedFileId}
            setLoading={setLoading}
            setLoadingMessage={setLoadingMessage}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Main content area */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
          {/* Topic Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
                {topic.description && (
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {files.length} file{files.length !== 1 ? 's' : ''} in this topic
                </p>
              </div>
              {hasMultipleFiles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileList(!showFileList)}
                >
                  {showFileList ? "Hide" : "Show"} File List
                </Button>
              )}
            </div>
          </div>

          {/* File List - Better UI with selectable cards */}
          {hasMultipleFiles && showFileList && (
            <div className="border-b border-gray-200 bg-white px-6 py-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Select a file to view and generate content:</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Services (Quiz, Flashcards, etc.) will be generated for the selected file
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {files.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      console.log("📄 File selection clicked:", {
                        index,
                        fileName: file.name,
                        fileId: file.id,
                        previousIndex: selectedFileIndex,
                        previousFileId: files[selectedFileIndex]?.id,
                      });
                      // Force state update and wait a tick to ensure it's applied
                      setSelectedFileIndex(index);
                      // Force a re-render to ensure fileId updates
                      setTimeout(() => {
                        console.log("✅ File selection confirmed:", {
                          index,
                          fileName: file.name,
                          fileId: file.id,
                        });
                      }, 0);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedFileIndex === index
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedFileIndex === index
                          ? "bg-blue-600"
                          : "bg-gray-100"
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          selectedFileIndex === index
                            ? "text-white"
                            : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm mb-1 truncate ${
                          selectedFileIndex === index
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}>
                          {file.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {file.fileType || "File"}
                        </p>
                        {selectedFileIndex === index && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <ChevronRight className="w-3 h-3" />
                            <span>Currently viewing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Single file indicator */}
          {!hasMultipleFiles && files.length === 1 && (
            <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-900 font-medium">
                  {files[0]?.name}
                </span>
              </div>
            </div>
          )}

          {/* Quick Navigation Tabs */}
          {currentFile && (
            <div className="w-full border-b border-gray-200">
              <QuickNavTabs 
                key={selectedFileId} 
                fileId={selectedFileId} 
                currentPage="chatbot" 
              />
            </div>
          )}
          
          {/* Generate All Services Button */}
          {currentFile && (
            <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Generating content for: <span className="text-blue-600 font-bold">{currentFile.name}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    File ID: <code className="bg-white px-1 py-0.5 rounded text-xs">{selectedFileId}</code>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Click on any service (Quiz, Flashcards, etc.) to generate content for <strong>{currentFile.name}</strong>
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    console.log("🚀 Generate All Services clicked for fileId:", selectedFileId, "fileName:", currentFile.name);
                    setLoading(true);
                    setLoadingMessage(`Generating all content for ${currentFile.name}...`);
                    try {
                      console.log("📤 Calling create-all-content API with fileId:", selectedFileId);
                      const response = await fetch("/api/create-all-content", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ fileId: selectedFileId }),
                      });
                      console.log("✅ API response status:", response.status);
                      if (response.ok) {
                        const data = await response.json();
                        console.log("✅ Content generated successfully:", data);
                        setLoadingMessage("Content generated successfully!");
                        setTimeout(() => {
                          setLoading(false);
                          setLoadingMessage("");
                        }, 2000);
                      } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error("❌ API error:", errorData);
                        throw new Error(errorData.error || "Failed to generate content");
                      }
                    } catch (error) {
                      console.error("❌ Error generating content:", error);
                      setLoading(false);
                      setLoadingMessage("");
                    }
                  }}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 ml-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate All Services
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Content area */}
          {currentFile ? (
            <div className="flex-1 flex">
              {/* PDF Viewer */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6">
                  <PdfRenderer url={getAbsoluteFileUrl(currentFile.url, currentFile.key)} />
                </div>
              </div>

              {/* Chat Interface */}
              <div className="w-96 border-l border-gray-200 flex flex-col">
                <ChatWrapper key={selectedFileId} fileId={selectedFileId} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card>
                <CardHeader>
                  <CardTitle>No Files in Topic</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This topic doesn&apos;t have any files yet. Upload files to get started.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
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

