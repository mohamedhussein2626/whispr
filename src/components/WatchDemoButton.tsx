"use client";

import { Play } from "lucide-react";

export default function WatchDemoButton() {
  const scrollToDemo = () => {
    const demoSection = document.querySelector("#demo-section");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={scrollToDemo}
      className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <Play className="mr-2 h-5 w-5" />
      Watch Demo
    </button>
  );
}
