import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  const sessionData = await getSession();
  if (!sessionData)
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );

  try {
    const { planId, referralCode } = await req.json();
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!plan || !plan.priceId)
      return NextResponse.json(
        { success: false, message: "Invalid plan" },
        { status: 400 },
      );

    // Create checkout session — subscriptionId will be generated after completion
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/dashboard`,
      cancel_url: `${process.env.BASE_URL}/`,
      metadata: {
        userId: sessionData.user.id,
        planId: String(plan.id),
        planName: plan.name,
        referralCode: referralCode || "",
      },
      customer_email: sessionData.user.email,
    });

    return NextResponse.json({ success: true, url: stripeSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, message: "Checkout failed" },
      { status: 500 },
    );
  }
}