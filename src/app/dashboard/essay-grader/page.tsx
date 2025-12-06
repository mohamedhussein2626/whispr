"use client";

import React, { useState } from "react";
import MainSidebar from "@/components/layout/MainSidebar";
import Header from "@/components/layout/Header";
import EssayGrader from "@/components/dashboard/EssayGrader";
import BannedUserProtection from "@/components/BannedUserProtection";

export default function EssayGraderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BannedUserProtection>
      <div className="flex h-screen bg-gray-50">
        <MainSidebar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={`flex-1 overflow-auto ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
          <Header title="AI Essay Grader" subtitle="Get instant feedback and grading for your essays" />
          <EssayGrader />
        </div>
      </div>
    </BannedUserProtection>
  );
}