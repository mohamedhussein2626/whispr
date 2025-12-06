"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't render navbar on dashboard pages
  const isDashboardPage = pathname?.startsWith("/dashboard");

  // Don't render navbar on auth pages (login, register)
  const isAuthPage =
    pathname?.includes("/login") || pathname?.includes("/register");

  // Don't render navbar on admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // Don't render navbar if it's a dashboard, auth, or admin page
  if (isDashboardPage || isAuthPage || isAdminPage) {
    return null;
  }

  return <Navbar />;
}
