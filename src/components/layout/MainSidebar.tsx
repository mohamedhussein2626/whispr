"use client";

import React, { useState } from "react";
import { Home, Settings, Menu, X, FileText, CheckSquare, LogOut, User, ChevronDown, Crown, Library, Check } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/actions/auth-actions";
import Image from "next/image";
import BillingModal from "@/components/BillingModal";

interface MainSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const mainSidebarItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", href: "/dashboard" },
    {
      id: "library",
      icon: Library,
      label: "Library",
      href: "/dashboard/library",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const essayTools = [
    {
      id: "essay-writer",
      icon: FileText,
      label: "AI Essay Writer",
      href: "/dashboard/essay-writer",
    },
    {
      id: "essay-grader",
      icon: CheckSquare,
      label: "AI Essay Grader",
      href: "/dashboard/essay-grader",
    },
  ];

  const handleSignout = async () => {
    await signOut();
    router.push("/auth");
  };

  

  const handleNavigation = (item: (typeof mainSidebarItems)[0]) => {
    router.push(item.href);
  };

  return (
    <div
      className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 transition-all duration-300 fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col overflow-hidden z-40`}
    >
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <Image
              src="/logo.png"
              alt="NotebookLama Logo"
              width={32}
              height={24}
              className="rounded-sm flex-shrink-0"
            />
            {sidebarOpen && (
              <span className="font-bold text-lg text-gray-800 truncate">
                NotebookLama
              </span>
            )}
          </Link>
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 ml-auto"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <X className="w-4 h-4 text-gray-600" />
            ) : (
              <Menu className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <div className="py-4 space-y-1">
          {mainSidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Essay Tools Section */}
          {sidebarOpen && (
            <div className="mt-6 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Writing Tools
              </h3>
            </div>
          )}
          <div className="space-y-1">
            {essayTools.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Bottom Section - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100">
        {sidebarOpen ? (
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* User Dropdown */}
            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    onClick={() => {
                      router.push("/dashboard/settings");
                      setUserDropdownOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    onClick={() => {
                      handleSignout();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <span className="text-white text-sm font-medium">
                {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </button>
          </div>
        )}

        {/* Collapsed User Dropdown */}
        {!sidebarOpen && userDropdownOpen && (
          <div className="absolute bottom-16 left-16 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => {
                  router.push("/dashboard/settings");
                  setUserDropdownOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                onClick={() => {
                  handleSignout();
                  setUserDropdownOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {sidebarOpen ? (
          <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Get access to more features
              </h3>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-1 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>10x smarter AI</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>More customization</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Commercial use rights</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Faster generation</span>
                </div>
              </div>
              <button
                onClick={() => setShowBillingModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setShowBillingModal(true)}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors"
              title="Upgrade to Pro"
            >
              <Crown className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Billing Modal */}
      <BillingModal 
        isOpen={showBillingModal} 
        onClose={() => setShowBillingModal(false)} 
      />
    </div>
  );
};

export default MainSidebar;
