import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import Stripe from "stripe";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// GET /api/plans
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// POST /api/plans
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description = "",
      features = "",
      status = "ACTIVE",
      isPopular = false,
      price = 0,
      interval = "monthly",
      numberOfFiles = 0,
      numberOfEssayWriter= 0,
    numberOfEssayGrader= 0,
      
      priceId: providedPriceId = null,
    } = body;

    let priceId: string | null = providedPriceId;

    if (!priceId && price > 0) {
      const product = await stripe.products.create({ name });

      if (interval === "lifetime") {
        // For lifetime, create a one-time price
        const stripePrice = await stripe.prices.create({
          unit_amount: Math.round(price * 100),
          currency: "usd",
          product: product.id,
        });
        priceId = stripePrice.id;
      } else {
        // For monthly/yearly, create a recurring price
        const stripePrice = await stripe.prices.create({
          unit_amount: Math.round(price * 100),
          currency: "usd",
          recurring: { interval: interval === "monthly" ? "month" : "year" },
          product: product.id,
        });
        priceId = stripePrice.id;
      }
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        features,
        status,
        isPopular,
        price,
        interval,
        priceId,
        numberOfFiles,
        numberOfEssayGrader,
        numberOfEssayWriter
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("❌ Failed to create plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create plan" },
      { status: 500 }
    );
  }
}
