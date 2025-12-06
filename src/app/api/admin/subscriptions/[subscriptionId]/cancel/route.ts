import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// POST /api/admin/subscriptions/[subscriptionId]/cancel - Cancel subscription
export async function POST(
  request: Request,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(subscriptionId) },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe
    if (subscription.stripeSubId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubId);
      } catch (error) {
        console.error("Failed to cancel Stripe subscription:", error);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription status in database
    await prisma.subscription.update({
      where: { id: parseInt(subscriptionId) },
      data: {
        status: "canceled",
        endDate: new Date(),
      },
    });

    // Update user's subscription status
    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        subscriptionStatus: "canceled",
        planName: "free",
      },
    });

    // Log the cancellation activity
    await prisma.userActivity.create({
      data: {
        userId: subscription.userId,
        activity: "subscription_canceled",
        metadata: JSON.stringify({
          subscriptionId: subscription.id,
          planName: subscription.plan.name,
          canceledBy: "admin",
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
