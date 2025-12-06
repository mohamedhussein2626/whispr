import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Type definitions
interface SubscriptionWithPlan {
  id: number;
  plan: {
    price: number;
  };
}

interface PlanDistribution {
  planId: number;
  _count: {
    planId: number;
  };
}

interface Plan {
  id: number;
  name: string;
}

// GET /api/admin/analytics - Get platform analytics
export async function GET() {
  try {
    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { subscriptionStatus: "active" },
    });
    const freeUsers = await prisma.user.count({
      where: { subscriptionStatus: "free" },
    });
    const bannedUsers = await prisma.user.count({
      where: { subscriptionStatus: "banned" },
    });

    // Get subscription statistics
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptionsCount = await prisma.subscription.count({
      where: { status: "active" },
    });
    const canceledSubscriptions = await prisma.subscription.count({
      where: { status: "canceled" },
    });

    // Get revenue statistics - calculate manually since we need to join with plans
    const activeSubscriptionsWithPlans = await prisma.subscription.findMany({
      where: { status: "active" },
      include: {
        plan: {
          select: {
            price: true,
          },
        },
      },
    });

    const totalRevenue = activeSubscriptionsWithPlans.reduce(
      (sum: number, sub: SubscriptionWithPlan) => sum + sub.plan.price,
      0
    );

    // Get usage statistics
    const totalFiles = await prisma.file.count();
    const totalMessages = await prisma.message.count();
    const totalQuizzes = await prisma.quiz.count();
    const totalFlashcards = await prisma.flashcards.count();
    const totalPodcasts = await prisma.podcast.count();

    // Get recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get user activity for chargeback protection
    const recentActivities = await prisma.userActivity.findMany({
      where: {
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    // Get top users by activity
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        _count: {
          select: {
            File: true,
            Message: true,
            activities: true,
          },
        },
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Get subscription plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ["planId"],
      _count: {
        planId: true,
      },
      where: {
        status: "active",
      },
    });

    // Get plan details for distribution
    const planDetails = await prisma.plan.findMany({
      where: {
        id: {
          in: planDistribution.map((p: PlanDistribution) => p.planId),
        },
      },
    });

    const planDistributionWithNames = planDistribution.map((dist: PlanDistribution) => {
      const plan = planDetails.find((p: Plan) => p.id === dist.planId);
      return {
        planName: plan?.name || "Unknown",
        count: dist._count.planId,
      };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          free: freeUsers,
          banned: bannedUsers,
          recentRegistrations,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptionsCount,
          canceled: canceledSubscriptions,
          planDistribution: planDistributionWithNames,
          totalRevenue,
        },
        usage: {
          totalFiles,
          totalMessages,
          totalQuizzes,
          totalFlashcards,
          totalPodcasts,
        },
        recentActivities,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
