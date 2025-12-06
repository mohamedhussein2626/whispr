// components/admin/AdminSidebar.tsx
"use client";

import {
  Home,
  Users,
  DollarSign,
  Settings,
  X,
  BadgeDollarSign,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Plans", href: "/admin/plans/list", icon: BadgeDollarSign },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: DollarSign },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b lg:border-b-0">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center w-full px-2 gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              NotebookLama
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={`${href}`}
              onClick={onClose} // Close sidebar on mobile when link is clicked
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group",
                pathname === `${href}`
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  pathname === `${href}`
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-700",
                )}
              />
              <span className="font-medium">{name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};