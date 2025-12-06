"use server";

import { headers } from "next/headers";
import { auth } from "./auth";

export type SessionData = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
  };
};

export async function getSession(): Promise<SessionData | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  return {
    session: session.session, // assuming your auth API actually returns this
    user: session.user,
    //retuen email and id
  };
}