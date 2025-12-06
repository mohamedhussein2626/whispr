// src/providers/AdminAuthProvider.tsx (simplified)
"use client";

import { ReactNode } from "react";
import { AdminAuthProvider as CoreAdminAuthProvider } from "../context/AdminAuthContext";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  return <CoreAdminAuthProvider>{children}</CoreAdminAuthProvider>;
}