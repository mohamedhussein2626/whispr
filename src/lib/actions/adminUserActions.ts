"use server";

import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-06-30.basil",
});

export async function deleteUserAction(userId: string) {
  try {
    // Check if admin is authenticated
    const admin = await getUserFromRequest();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
        sessions: true,
        File: true,
        Message: true,
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Cancel Stripe subscription if exists
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete user and all related data (cascade delete will handle most)
    await db.user.delete({
      where: { id: userId },
    });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

export async function banUserAction(
  params: { userId: string; banReason?: string }
) {
  try {
    const { userId, banReason } = params;
    // Check if admin is authenticated
    const admin = await getUserFromRequest();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // Update user status to banned
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "banned",
        isBanned: true,
        banReason: banReason || null,
      },
    });

    // Cancel Stripe subscription if exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (user?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError);
      }
    }

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, message: "Failed to ban user" };
  }
}

export async function cancelSubscriptionAction(userId: string) {
  try {
    // Check if admin is authenticated
    const admin = await getUserFromRequest();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.stripeSubscriptionId) {
      return { success: false, message: "No active subscription found" };
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    // Update user status in database
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    return { success: true, message: "Subscription canceled successfully" };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { success: false, message: "Failed to cancel subscription" };
  }
}

export async function exportUserEmailsAction() {
  try {
    // Check if admin is authenticated
    const admin = await getUserFromRequest();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    // Get all user emails
    const users = await db.user.findMany({
      select: {
        email: true,
        name: true,
        createdAt: true,
        subscriptionStatus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert to CSV format
    const csvHeader = "Email,Name,Join Date,Status\n";
    const csvRows = users.map(user => 
      `"${user.email}","${user.name || ''}","${user.createdAt.toISOString()}","${user.subscriptionStatus || 'free'}"`
    ).join("\n");

    const csvContent = csvHeader + csvRows;

    return { 
      success: true, 
      data: csvContent,
      filename: `users-export-${new Date().toISOString().split('T')[0]}.csv`
    };
  } catch (error) {
    console.error("Error exporting user emails:", error);
    return { success: false, message: "Failed to export user emails" };
  }
}
