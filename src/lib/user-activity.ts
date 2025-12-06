import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// بديل آمن لـ any
export type ActivityMetadata = Record<string, unknown>;

export async function trackUserActivity(
  userId: string,
  activity: string,
  metadata?: ActivityMetadata
) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        activity,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to track user activity:", error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getUserActivitySummary(
  userId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Group activities by type
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity.activity] = (acc[activity.activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities: activities.length,
      activityCounts,
      recentActivities: activities.slice(0, 10),
    };
  } catch (error) {
    console.error("Failed to get user activity summary:", error);
    return {
      totalActivities: 0,
      activityCounts: {},
      recentActivities: [],
    };
  }
}

export async function getChargebackRiskUsers(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Get users with active subscriptions but low activity
    const lowActivityUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        activities: {
          none: {
            timestamp: {
              gte: startDate,
            },
          },
        },
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
        },
        _count: {
          select: {
            activities: true,
            File: true,
            Message: true,
          },
        },
      },
    });

    // Get users with high activity (good users)
    const highActivityUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        activities: {
          some: {
            timestamp: {
              gte: startDate,
            },
          },
        },
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
        },
        _count: {
          select: {
            activities: true,
            File: true,
            Message: true,
          },
        },
      },
    });

    return {
      lowActivityUsers,
      highActivityUsers,
    };
  } catch (error) {
    console.error("Failed to get chargeback risk users:", error);
    return {
      lowActivityUsers: [],
      highActivityUsers: [],
    };
  }
}
