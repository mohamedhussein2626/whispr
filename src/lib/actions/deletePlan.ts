"use server";

import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function deletePlan(planId: number) {
  try {
    await prisma.plan.delete({
      where: { id: planId },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete plan failed:", error);
    return { success: false, message: "Something went wrong" };
  }
}