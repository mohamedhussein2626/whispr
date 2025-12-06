"use client";

import { createAuthClient } from "better-auth/react";

// Use default origin so client requests go to the current host
export const authClient = createAuthClient();

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
