import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/admin/chargeback-protection - Get chargeback risk analysis
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get users with active subscriptions but low activity
    const lowActivityUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        activities: {
          none: {
            timestamp: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
          include: {
            plan: {
              select: {
                name: true,
                price: true,
              },
            },
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
              gte: thirtyDaysAgo,
            },
          },
        },
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
          include: {
            plan: {
              select: {
                name: true,
                price: true,
              },
            },
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

    // Get total active users
    const totalActiveUsers = await prisma.user.count({
      where: {
        subscriptionStatus: "active",
      },
    });

    // Calculate risk score
    const riskUsersCount = lowActivityUsers.length;
    const riskScore = totalActiveUsers > 0 ? Math.round((riskUsersCount / totalActiveUsers) * 100) : 0;

    // Get detailed activity analysis for risk users
    const riskUsersWithDetails = await Promise.all(
      lowActivityUsers.map(async (user) => {
        const recentActivities = await prisma.userActivity.findMany({
          where: {
            userId: user.id,
            timestamp: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 5,
        });

        const daysSinceSubscription = user.subscriptions[0] 
          ? Math.floor(
              (new Date().getTime() - new Date(user.subscriptions[0].startDate).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        return {
          ...user,
          recentActivities,
          daysSinceSubscription,
        };
      })
    );

    // Get chargeback patterns
    const chargebackPatterns = await prisma.userActivity.groupBy({
      by: ["activity"],
      where: {
        timestamp: {
          gte: thirtyDaysAgo,
        },
        activity: {
          in: ["subscription_created", "payment_success", "file_upload", "message_sent"],
        },
      },
      _count: {
        activity: true,
      },
    });

    // Get users who might be at risk based on patterns
    const suspiciousUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        AND: [
          {
            activities: {
              some: {
                activity: "subscription_created",
                timestamp: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
          {
            activities: {
              none: {
                activity: {
                  in: ["file_upload", "message_sent"],
                },
                timestamp: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        ],
      },
      include: {
        subscriptions: {
          where: {
            status: "active",
          },
          include: {
            plan: {
              select: {
                name: true,
                price: true,
              },
            },
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

    return NextResponse.json({
      success: true,
      data: {
        lowActivityUsers: riskUsersWithDetails,
        highActivityUsers,
        totalActiveUsers,
        riskUsersCount,
        riskScore,
        chargebackPatterns,
        suspiciousUsers,
        analysis: {
          totalRiskUsers: riskUsersWithDetails.length,
          totalGoodUsers: highActivityUsers.length,
          riskPercentage: riskScore,
          averageActivityPerUser: highActivityUsers.length > 0 
            ? Math.round(highActivityUsers.reduce((sum, user) => sum + user._count.activities, 0) / highActivityUsers.length)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch chargeback protection data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chargeback protection data" },
      { status: 500 }
    );
  }
}
