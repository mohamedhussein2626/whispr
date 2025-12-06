"use client";
import React, { useState } from "react";
import PDFSidebar from "@/components/layout/PDFSidebar";
import PdfRenderer from "@/components/PdfRenderer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import { Loader2 } from "lucide-react";
import type { File } from "@prisma/client";
import BannedUserProtection from "@/components/BannedUserProtection";
import { getAbsoluteFileUrl } from "@/lib/file-url-utils";

export default function PDFPageWithSidebar({ file }: { file: File }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("chatbot");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  return (
    <BannedUserProtection>
      <div className="flex h-screen">
      {/* PDF Sidebar */}
      <PDFSidebar
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        fileId={file.id}
        setLoading={setLoading}
        setLoadingMessage={setLoadingMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area - Full width */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        {/* Quick Navigation Tabs */}
        <div className="w-full border-b border-gray-200">
          <QuickNavTabs fileId={file.id} currentPage="chatbot" />
        </div>

        {/* Content area */}
        <div className="flex-1 flex">
          {/* PDF Viewer - Takes up more space */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <PdfRenderer url={getAbsoluteFileUrl(file.url, file.key)} />
            </div>
          </div>

          {/* Chat Interface - Fixed width */}
          <div className="w-96 border-l border-gray-200 flex flex-col">
            <ChatWrapper fileId={file.id} />
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
