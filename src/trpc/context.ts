import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { inferAsyncReturnType } from "@trpc/server";

export async function createContext() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        userId: null,
        user: null,
        session: null,
      };
    }

    return {
      userId: session.user.id,
      user: session.user,
      session: session.session,
    };
  } catch (error) {
    console.error("Error getting session in TRPC context:", error);
    return {
      userId: null,
      user: null,
      session: null,
    };
  }
}

export type Context = inferAsyncReturnType<typeof createContext>;
