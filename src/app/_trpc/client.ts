"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/trpc"; // 👈 adjust if needed

export const trpc = createTRPCReact<AppRouter>(); // ✅ Correct export
