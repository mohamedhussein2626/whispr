"use client";

import React from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showCloseButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showCloseButton = false,
}) => (
  <header className="bg-white border-b border-gray-200">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {showCloseButton && (
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close Chat</span>
          </Link>
        )}
      </div>
    </div>
  </header>
);

export default Header;
