

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CommissionStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CommissionSummary = Record<
  Lowercase<CommissionStatus>,
  { amount: number; count: number }
>;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Check if user is an affiliate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateId: true },
    });

    if (!user?.affiliateId) {
      return NextResponse.json(
        { error: "User is not registered as an affiliate" },
        { status: 400 },
      );
    }

    // Build where clause
    const whereClause: {
      affiliateId: string;
      status?: CommissionStatus;
    } = {
      affiliateId: session.user.id,
    };

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase() as CommissionStatus;
    }

    // Get commissions with pagination
    const [commissions, totalCount] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where: whereClause,
        include: {
          referredUser: {
            select: { name: true, email: true, createdAt: true },
          },
          subscription: {
            include: {
              plan: { select: { name: true, price: true, interval: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.affiliateCommission.count({ where: whereClause }),
    ]);

    // Get summary statistics
    const summaryData = await prisma.affiliateCommission.groupBy({
      by: ["status"],
      where: { affiliateId: session.user.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    const summary: CommissionSummary = summaryData.reduce((acc, item) => {
      acc[item.status.toLowerCase() as Lowercase<CommissionStatus>] = {
        amount: item._sum.amount ? item._sum.amount.toNumber() : 0,
        count: item._count.id,
      };
      return acc;
    }, {} as CommissionSummary);

    return NextResponse.json({
      success: true,
      commissions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Get commissions error:", error);
    return NextResponse.json(
      { error: "Failed to get commissions" },
      { status: 500 },
    );
  }
}