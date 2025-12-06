"use client";

import { AdminAuthProvider } from "../providers/AdminAuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}