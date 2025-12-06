import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// POST /api/admin/users/[userId]/ban - Ban user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { reason } = await request.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Cancel all active subscriptions in Stripe
    for (const subscription of user.subscriptions) {
      if (subscription.status === "active" && subscription.stripeSubId) {
        try {
          // TODO: Add Stripe cancellation logic here
          console.log(`Would cancel Stripe subscription: ${subscription.stripeSubId}`);
        } catch (error) {
          console.error("Failed to cancel Stripe subscription:", error);
        }
      }
    }

    // Update user status to banned and persist fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "banned",
        planName: "banned",
        isBanned: true,
        banReason: reason || "Banned by admin",
      },
    });

    // Log the ban activity
    await prisma.userActivity.create({
      data: {
        userId: userId,
        activity: "user_banned",
        metadata: JSON.stringify({ reason, bannedBy: "admin" }),
      },
    });

    return NextResponse.json({ success: true, message: "User banned successfully" });
  } catch (error) {
    console.error("Failed to ban user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to ban user" },
      { status: 500 }
    );
  }
}
