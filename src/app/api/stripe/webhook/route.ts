import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();
  const sig = req.headers.get("stripe-signature");

  const secretRaw = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretRaw) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set in environment variables"
    );
  }
  const secret = secretRaw.trim();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig!, secret);
  } catch (err) {
    const error = err as Error;
    console.error("❌ Signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId) break;

        const plan = await prisma.plan.findUnique({
          where: { id: parseInt(planId) },
        });
        if (!plan) break;

        const subscriptionId = session.subscription as string | null;

        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          session.id,
          {
            expand: ["line_items.data.price"],
          }
        );
        const priceId =
          sessionWithLineItems.line_items?.data?.[0]?.price?.id || "";

        const userUpdate = prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId,
            planId: parseInt(planId),
            planName: plan.name,
            subscriptionStatus: subscriptionId ? "active" : "free",
          },
        });

        const subscriptionUpsert = subscriptionId
          ? prisma.subscription.upsert({
              where: { stripeSubId: subscriptionId },
              create: {
                stripeSubId: subscriptionId,
                userId,
                planId: parseInt(planId),
                status: "active",
                interval: "monthly",
                startDate: new Date(),
                endDate: null,
              },
              update: { status: "active", endDate: null },
            })
          : undefined;

        const paymentCreate = prisma.payment.create({
          data: {
            amount: new Prisma.Decimal((session.amount_total || 0) / 100),
            status: session.payment_status ?? "paid",
            stripe_payment_id: session.payment_intent as string,
            price_id: priceId,
            user_email: session.customer_email || "unknown@example.com",
            userId,
          },
        });

        const tx: Prisma.PrismaPromise<unknown>[] = [
          userUpdate,
          ...(subscriptionUpsert ? [subscriptionUpsert] : []),
          paymentCreate,
        ];

        await prisma.$transaction(tx);

        // Send payment confirmation email
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
          });
          
          if (user) {
            const { sendPaymentConfirmationEmail } = await import("@/lib/email");
            await sendPaymentConfirmationEmail(
              user.email,
              user.name,
              plan.name,
              (session.amount_total || 0) / 100,
              subscriptionId || undefined
            );
          }
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
          // Don't fail the webhook if email sending fails
        }

        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;

        const subscriptionRecord = await prisma.subscription.findUnique({
          where: { stripeSubId: stripeSub.id },
          include: { user: true },
        });
        const user = subscriptionRecord?.user;
        if (!user) break;

        const stripePriceId = stripeSub.items.data[0].price.id;
        const plan = await prisma.plan.findFirst({
          where: { priceId: stripePriceId },
        });
        if (!plan) break;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionId: stripeSub.id,
              planId: plan.id,
              planName: plan.name,
              subscriptionStatus:
                stripeSub.status === "active" ? "active" : "canceled",
            },
          }),
          prisma.subscription.upsert({
            where: { stripeSubId: stripeSub.id },
            create: {
              stripeSubId: stripeSub.id,
              userId: user.id,
              planId: plan.id,
              status: stripeSub.status,
              interval:
                stripeSub.items.data[0].price.recurring?.interval || "monthly",
              startDate: new Date(stripeSub.start_date * 1000),
              endDate: stripeSub.ended_at
                ? new Date(stripeSub.ended_at * 1000)
                : null,
            },
            update: {
              status: stripeSub.status,
              endDate: stripeSub.ended_at
                ? new Date(stripeSub.ended_at * 1000)
                : null,
            },
          }),
        ]);

        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubDeleted = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { subscriptionId: stripeSubDeleted.id },
          data: {
            subscriptionId: null,
            planId: null,
            planName: "free",
            subscriptionStatus: "canceled",
          },
        });
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Webhook processing failed:", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}