// components/admin/AdminHeader.tsx
"use client";

import {
  Menu,
  ChevronDown,
  Globe,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAdminAuth } from "@/app/context/AdminAuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { admin, logout, isLoading } = useAdminAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have successfully logged out.");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGoToWebsite = () => {
    window.open("/", "_blank");
    setIsDropdownOpen(false);
  };

  // Show loading state or placeholder if admin data is not available
  if (isLoading) {
    return (
      <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        {/* Admin Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-colors bg-gradient-to-br from-blue-500 to-purple-600">
              <UserCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-700">{admin?.name}</p>
              <p className="text-xs text-gray-400 mt-1">{admin?.email}</p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                <p className="text-sm font-medium text-gray-700">
                  {admin?.name}
                </p>

                {admin?.email && (
                  <p className="text-xs text-gray-400 mt-1">{admin.email}</p>
                )}
              </div>

              <button
                onClick={handleGoToWebsite}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 mr-3 text-gray-500" />
                Go to Website
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3 text-red-600" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}