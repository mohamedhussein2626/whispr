// components/Layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./sidebar";

const dashboardLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Settings", href: "/dashboard/settings" },
];

const pdfToolsLinks = [
  { name: "TurboLearn", href: "#" },
  { name: "Notes", href: "#" },
  { name: "Chat Bot", href: "#" },
  { name: "Podcast", href: "#" },
  { name: "Flashcards", href: "#" },
  { name: "Quiz", href: "#" },
  { name: "Transcript", href: "#" },
  { name: "Settings", href: "#" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isPdfPage =
    pathname.startsWith("/dashboard/") && pathname.split("/").length === 3;
  const links = isPdfPage ? pdfToolsLinks : dashboardLinks;

  return (
    <div className="flex h-screen">
      <Sidebar links={links} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
