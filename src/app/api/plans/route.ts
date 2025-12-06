import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        features: true,
        price: true,
        priceId: true,
        interval: true,
        status: true,
        isPopular: true,
        numberOfFiles:true,
      },
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 },
    );
  }
}