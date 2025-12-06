"use server";

import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export type UpdatePlanInput = {
  name: string;
  description: string;
  features: string;
  price: number;
  interval: "monthly" | "yearly" | "lifetime";
  numberOfFiles: number;
  numberOfEssayWriter: number;
  numberOfEssayGrader: number;
  status: "ACTIVE" | "HIDDEN" | "DISABLED";
  isPopular: boolean;
  priceId: string;
};

export async function updatePlanAction(
  planId: number,
  data: UpdatePlanInput,
) {
  try {
    await prisma.plan.update({
      where: { id: planId },
      data: {
        name: data.name,
        description: data.description,
        features: data.features,
        price: data.price,
        interval: data.interval,
        numberOfFiles: data.numberOfFiles,
        numberOfEssayWriter: data.numberOfEssayWriter,
        numberOfEssayGrader: data.numberOfEssayGrader,
        status: data.status,
        isPopular: data.isPopular,
        priceId: data.priceId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update plan failed:", error);
    return { success: false, message: "Failed to update plan" };
  }
}
