import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/admin/subscriptions
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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
    });

    // Transform the data to match the expected format
    const transformedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.userId,
      userEmail: sub.user.email,
      userName: sub.user.name,
      planName: sub.plan.name,
      planPrice: sub.plan.price,
      planInterval: sub.plan.interval,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    return NextResponse.json({ success: true, subscriptions: transformedSubscriptions });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/subscriptions (for creating subscriptions if needed)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, planId, status = "active", interval = "monthly" } = body;

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, message: "User ID and Plan ID are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status,
        interval,
        startDate: new Date(),
        stripeSubId: `admin_created_${Date.now()}`, // Temporary ID for admin-created subscriptions
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            interval: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
