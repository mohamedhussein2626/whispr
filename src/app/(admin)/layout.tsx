"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "../providers/AdminAuthProvider";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Spinner } from "@/components/ui/spinner";
import { AdminSidebar } from "./admin/Sidebar";
import { AdminHeader } from "./admin/Header";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoading, isAdminAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}