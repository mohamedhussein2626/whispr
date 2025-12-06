"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't render footer on dashboard pages
  const isDashboardPage = pathname?.startsWith("/dashboard");

  // Don't render footer on auth pages (login, register)
  const isAuthPage =
    pathname?.includes("/login") || pathname?.includes("/register");

  // Don't render footer on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Don't render footer if it's a dashboard, auth, or admin page
  if (isDashboardPage || isAuthPage || isAdminPage) {
    return null;
  }

  return <Footer />;
}
