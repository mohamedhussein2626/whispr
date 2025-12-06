import { auth } from "./auth";
import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return null;
    }

    return {
      user: session.user,
      session: session.session,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
