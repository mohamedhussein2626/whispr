import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/admin/users/[userId] - Get detailed user information
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        planName: true,
        subscriptionStatus: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            File: true,
            Message: true,
            subscriptions: true,
          },
        },
        subscriptions: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                interval: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
        sessions: {
          select: {
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get the most recent session for IP and user agent
    const latestSession = user.sessions[0];
    const userWithSession = {
      ...user,
      ipAddress: latestSession?.ipAddress,
      userAgent: latestSession?.userAgent,
      lastLoginAt: latestSession?.createdAt,
      sessions: undefined, // Remove sessions from response
    };

    return NextResponse.json({ success: true, user: userWithSession });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

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

    // Cancel all active subscriptions in Stripe first
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

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
