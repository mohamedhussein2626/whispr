"use client";

import React, { useState } from "react";
import MainSidebar from "@/components/layout/MainSidebar";
import Header from "@/components/layout/Header";
import EssayWriter from "@/components/dashboard/EssayWriter";
import BannedUserProtection from "@/components/BannedUserProtection";

export default function EssayWriterPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BannedUserProtection>
      <div className="flex h-screen bg-gray-50">
        <MainSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={`flex-1 overflow-auto ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
          <Header title="AI Essay Writer" subtitle="Generate comprehensive, research-backed academic essays" />
          <EssayWriter />
        </div>
      </div>
    </BannedUserProtection>
  );
}
