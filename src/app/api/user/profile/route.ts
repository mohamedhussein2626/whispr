

import { getSession } from "@/lib/getSession";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    // Fetch the latest user data from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        planId: true,
        planName: true,
        subscriptionId: true,
        subscriptionStatus: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    console.log("Profile API: Fetched user from DB:", user);

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}