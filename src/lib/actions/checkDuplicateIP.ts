"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";

export async function checkDuplicateIP() {
  try {
    // Get current user
    const user = await getUserFromRequest();
    if (!user) {
      return { hasDuplicate: false, duplicateAccounts: [] };
    }

    // Get current IP address
    const hdrs = headers();
    const currentIP =
      (await hdrs).get("x-forwarded-for")?.split(",")[0] ||
      (await hdrs).get("x-real-ip") ||
      "Unknown";

    if (currentIP === "Unknown") {
      return { hasDuplicate: false, duplicateAccounts: [] };
    }

    // Find sessions with the same IP address from different users
    const duplicateSessions = await db.session.findMany({
      where: {
        ipAddress: currentIP,
        userId: {
          not: user.id, // Exclude current user
        },
        expiresAt: {
          gt: new Date(), // Only active sessions
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get unique users from duplicate sessions
    const duplicateAccounts = duplicateSessions
      .map(session => session.user)
      .filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

    return {
      hasDuplicate: duplicateAccounts.length > 0,
      duplicateAccounts,
      currentIP,
    };
  } catch (error) {
    console.error("Error checking duplicate IP:", error);
    return { hasDuplicate: false, duplicateAccounts: [] };
  }
}
