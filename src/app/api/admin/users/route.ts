import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/admin/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users (for creating users if needed)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: password || null,
        subscriptionStatus: "free",
        planName: "free",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users (for updating user status - ban/unban, cancel subscription)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, message: "User ID and action are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: "active" },
          include: { plan: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let updatedUser;

    switch (action) {
      case "ban":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            isBanned: true,
            banReason: reason || "Banned by admin",
            subscriptionStatus: "banned",
            planName: "banned",
            // Cancel active subscriptions
            subscriptions: {
              updateMany: {
                where: { status: "active" },
                data: { status: "canceled" }
              }
            }
          }
        });
        break;

      case "unban":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            isBanned: false,
            banReason: null,
            subscriptionStatus: "free",
            planName: "free"
          }
        });
        break;

      case "cancel_subscription":
        // Cancel all active subscriptions
        await prisma.subscription.updateMany({
          where: { 
            userId: userId,
            status: "active"
          },
          data: { status: "canceled" }
        });

        // Update user status to free
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "free",
            planName: "free",
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: `User ${action} successfully${reason ? `: ${reason}` : ''}`
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}