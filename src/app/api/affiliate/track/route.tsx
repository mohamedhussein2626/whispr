

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Refgrow API integration
const REFGROW_API_KEY = process.env.REFGROW_API_KEY;
const REFGROW_SECRET_KEY = process.env.REFGROW_SECRET_KEY;
const REFGROW_BASE_URL =
  process.env.REFGROW_BASE_URL || "https://api.refgrow.com";

interface TrackingData {
  referralCode: string;
  userId: string;
  subscriptionId?: number;
  commissionAmount?: number;
  commissionPercentage?: number;
}

async function trackWithRefgrow(trackingData: TrackingData) {
  if (!REFGROW_API_KEY || !REFGROW_SECRET_KEY) {
    console.log(
      "Refgrow credentials not configured, skipping external tracking",
    );
    return null;
  }

  try {
    const response = await fetch(`${REFGROW_BASE_URL}/tracking/referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REFGROW_API_KEY}`,
        "X-Secret-Key": REFGROW_SECRET_KEY,
      },
      body: JSON.stringify(trackingData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Successfully tracked with Refgrow:", result);
      return result;
    } else {
      console.error(
        "Refgrow tracking failed:",
        response.status,
        await response.text(),
      );
      return null;
    }
  } catch (error) {
    console.error("Error tracking with Refgrow:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { referralCode, userId, subscriptionId } = (await request.json()) as {
      referralCode: string;
      userId: string;
      subscriptionId?: number;
    };

    if (!referralCode || !userId) {
      return NextResponse.json(
        { error: "Referral code and user ID are required" },
        { status: 400 },
      );
    }

    // Find the affiliate by referral code
    const affiliate = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, affiliateId: true, name: true },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 },
      );
    }

    // Check if user is already referred
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (existingUser?.referredBy) {
      return NextResponse.json(
        { error: "User is already referred by another affiliate" },
        { status: 400 },
      );
    }

    // Update user with referral information
    await prisma.user.update({
      where: { id: userId },
      data: { referredBy: affiliate.id },
    });

    // If subscription ID is provided, create commission record
    let refgrowResult = null;
    if (subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true },
      });

      if (subscription && subscription.plan) {
        const commissionPercentage = 30; // 30% commission
        const commissionAmount =
          (subscription.plan.price * commissionPercentage) / 100;

        // Create commission record
        await prisma.affiliateCommission.create({
          data: {
            affiliateId: affiliate.id,
            referredUserId: userId,
            subscriptionId: subscription.id,
            amount: commissionAmount,
            percentage: commissionPercentage,
            status: "PENDING",
          },
        });

        // Update subscription with affiliate information
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            affiliateCommission: commissionAmount,
            referralCode: referralCode,
          },
        });

        // Track with Refgrow
        refgrowResult = await trackWithRefgrow({
          referralCode,
          userId,
          subscriptionId: subscription.id,
          commissionAmount,
          commissionPercentage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Referral tracked successfully",
      affiliate: {
        id: affiliate.affiliateId,
        name: affiliate.name,
      },
      refgrow: refgrowResult ? { tracked: true } : { tracked: false },
    });
  } catch (error) {
    console.error("Track referral error:", error);
    return NextResponse.json(
      { error: "Failed to track referral" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("code");

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 },
      );
    }

    // Validate referral code
    const affiliate = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, affiliateId: true, name: true, email: true },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      affiliate: {
        id: affiliate.affiliateId,
        name: affiliate.name,
      },
    });
  } catch (error) {
    console.error("Validate referral code error:", error);
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 },
    );
  }
}