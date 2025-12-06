import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Refgrow API integration
const REFGROW_API_KEY = process.env.REFGROW_API_KEY;
const REFGROW_SECRET_KEY = process.env.REFGROW_SECRET_KEY;
const REFGROW_BASE_URL =
  process.env.REFGROW_BASE_URL || "https://api.refgrow.com";

interface AffiliateData {
  name: string;
  email: string;
  website?: string;
  socialMedia?: string;
  referralCode: string;
  affiliateId: string;
}

async function registerWithRefgrow(affiliateData: AffiliateData) {
  if (!REFGROW_API_KEY || !REFGROW_SECRET_KEY) {
    console.log(
      "Refgrow credentials not configured, skipping external registration",
    );
    return null;
  }

  try {
    const response = await fetch(`${REFGROW_BASE_URL}/affiliates/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REFGROW_API_KEY}`,
        "X-Secret-Key": REFGROW_SECRET_KEY,
      },
      body: JSON.stringify(affiliateData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Successfully registered with Refgrow:", result);
      return result;
    } else {
      console.error(
        "Refgrow registration failed:",
        response.status,
        await response.text(),
      );
      return null;
    }
  } catch (error) {
    console.error("Error registering with Refgrow:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please log in to join the affiliate program",
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    const { name, email, website, socialMedia } = await request.json();

    // Check if user already has an affiliate ID
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { affiliateId: true, referralCode: true },
    });

    if (existingUser?.affiliateId) {
      return NextResponse.json(
        { error: "User is already registered as an affiliate" },
        { status: 400 },
      );
    }

    // Generate unique affiliate ID and referral code
    const affiliateId = `AFF_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const referralCode = `REF_${session.user.name
      ?.replace(/\s+/g, "")
      .toUpperCase()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Update user with affiliate information
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        affiliateId,
        referralCode,
        name: name || session.user.name,
        email: email || session.user.email,
      },
    });

    // Ensure affiliateId and referralCode are not null
    if (!updatedUser.affiliateId || !updatedUser.referralCode) {
      throw new Error("Affiliate ID or referral code is missing");
    }

    // Register with Refgrow
    const refgrowResult = await registerWithRefgrow({
      name: updatedUser.name!,
      email: updatedUser.email!,
      website,
      socialMedia,
      referralCode: updatedUser.referralCode,
      affiliateId: updatedUser.affiliateId,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully registered as affiliate",
      affiliate: {
        id: updatedUser.affiliateId,
        referralCode: updatedUser.referralCode,
        name: updatedUser.name,
        email: updatedUser.email,
      },
      refgrow: refgrowResult ? { registered: true } : { registered: false },
    });
  } catch (error) {
    console.error("Affiliate registration error:", error);
    return NextResponse.json(
      { error: "Failed to register as affiliate" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        {
          isAffiliate: false,
          message: "Please log in to access the affiliate program",
          requiresAuth: true,
        },
        { status: 401 },
      );
    }

    // Get user's affiliate information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        affiliateId: true,
        referralCode: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user?.affiliateId) {
      return NextResponse.json({
        isAffiliate: false,
        message: "User is not registered as an affiliate",
      });
    }

    // Get affiliate statistics
    const stats = await prisma.affiliateCommission.aggregate({
      where: { affiliateId: session.user.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    const referredUsers = await prisma.user.count({
      where: { referredBy: session.user.id },
    });

    return NextResponse.json({
      isAffiliate: true,
      affiliate: {
        id: user.affiliateId,
        referralCode: user.referralCode,
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt,
      },
      stats: {
        totalCommissions: stats._sum.amount || 0,
        totalReferrals: referredUsers,
        totalCommissionsCount: stats._count.id,
      },
    });
  } catch (error) {
    console.error("Get affiliate info error:", error);
    return NextResponse.json(
      { error: "Failed to get affiliate information" },
      { status: 500 },
    );
  }
}