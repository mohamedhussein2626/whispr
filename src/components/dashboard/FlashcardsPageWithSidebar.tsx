"use client";
import React, { useState } from "react";
import PDFSidebar from "@/components/layout/PDFSidebar";
import { FlashcardsPanel } from "@/components/dashboard/FlashcardsPanel";
import QuickNavTabs from "@/components/dashboard/QuickNavTabs";
import { Loader2 } from "lucide-react";
import BannedUserProtection from "@/components/BannedUserProtection";

interface FileData {
  id: string;
  name: string;
  url: string;
}

interface FlashcardsPageWithSidebarProps {
  file: FileData;
}

export default function FlashcardsPageWithSidebar({
  file,
}: FlashcardsPageWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("flashcards");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  return (
    <BannedUserProtection>
      <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <PDFSidebar
        sidebarOpen={sidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        fileId={file.id}
        setLoading={setLoading}
        setLoadingMessage={setLoadingMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      {/* Main content */}
      <div
        className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}
      >
        {/* Quick Navigation Tabs */}
        <QuickNavTabs fileId={file.id} currentPage="flashcards" />

        <div className="flex-1 px-4 py-6 sm:px-6 lg:pl-8 xl:pl-6">
          <FlashcardsPanel fileId={file.id} />
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
