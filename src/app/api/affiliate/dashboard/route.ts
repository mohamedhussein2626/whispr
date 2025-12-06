

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Refgrow API integration
const REFGROW_API_KEY = process.env.REFGROW_API_KEY;
const REFGROW_SECRET_KEY = process.env.REFGROW_SECRET_KEY;
const REFGROW_BASE_URL =
  process.env.REFGROW_BASE_URL || "https://api.refgrow.com";

async function getRefgrowStats(affiliateId: string) {
  if (!REFGROW_API_KEY || !REFGROW_SECRET_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${REFGROW_BASE_URL}/affiliates/${affiliateId}/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${REFGROW_API_KEY}`,
          "X-Secret-Key": REFGROW_SECRET_KEY,
        },
      },
    );

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.error("Failed to fetch Refgrow stats:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Refgrow stats:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an affiliate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateId: true, referralCode: true },
    });

    if (!user?.affiliateId) {
      return NextResponse.json(
        {
          error: "User is not registered as an affiliate",
        },
        { status: 400 },
      );
    }

    // Get comprehensive affiliate statistics
    const [
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalReferrals,
      recentCommissions,
      recentReferrals,
    ] = await Promise.all([
      // Total commissions earned
      prisma.affiliateCommission.aggregate({
        where: { affiliateId: session.user.id },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Pending commissions
      prisma.affiliateCommission.aggregate({
        where: {
          affiliateId: session.user.id,
          status: "PENDING",
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Paid commissions
      prisma.affiliateCommission.aggregate({
        where: {
          affiliateId: session.user.id,
          status: "PAID",
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Total referrals
      prisma.user.count({
        where: { referredBy: session.user.id },
      }),

      // Recent commissions (last 10)
      prisma.affiliateCommission.findMany({
        where: { affiliateId: session.user.id },
        include: {
          referredUser: {
            select: { name: true, email: true },
          },
          subscription: {
            include: {
              plan: {
                select: { name: true, price: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent referrals (last 10)
      prisma.user.findMany({
        where: { referredBy: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          subscriptionStatus: true,
          planName: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Calculate conversion rate
    const conversionRate =
      totalReferrals > 0
        ? (paidCommissions._count.id / totalReferrals) * 100
        : 0;

    // Get Refgrow stats
    const refgrowStats = await getRefgrowStats(user.affiliateId);

    return NextResponse.json({
      success: true,
      stats: {
        totalCommissions: totalCommissions._sum.amount || 0,
        totalCommissionsCount: totalCommissions._count.id,
        pendingCommissions: pendingCommissions._sum.amount || 0,
        pendingCommissionsCount: pendingCommissions._count.id,
        paidCommissions: paidCommissions._sum.amount || 0,
        paidCommissionsCount: paidCommissions._count.id,
        totalReferrals,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      recentCommissions,
      recentReferrals,
      referralCode: user.referralCode,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth?ref=${user.referralCode}`,
      refgrow: {
        connected: !!refgrowStats,
        stats: refgrowStats,
      },
    });
  } catch (error) {
    console.error("Get affiliate dashboard error:", error);
    return NextResponse.json(
      {
        error: "Failed to get affiliate dashboard data",
      },
      { status: 500 },
    );
  }
}