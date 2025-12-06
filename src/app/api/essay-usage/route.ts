import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

// Type definitions removed as they were unused

// GET /api/essay-usage - Get user's essay usage statistics
export async function GET() {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's current plan
    const user = await db.user.findUnique({
      where: { id: sessionUser.user.id },
      include: {
        plans: {
          where: { status: "ACTIVE" },
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentPlan = user.plans[0] || null;

    // Get usage counts for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [essayWriterUsage, essayGraderUsage] = await Promise.all([
      db.essayUsage.count({
        where: {
          userId: sessionUser.user.id,
          type: "essay_writer",
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      db.essayUsage.count({
        where: {
          userId: sessionUser.user.id,
          type: "essay_grader",
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ]);

    // Check if user has a free plan (plan with name containing "free" or "Free")
    // If no plan, check if there's a free plan available
    const isFreeUser = !currentPlan;
    let essayWriterLimit = 0;
    let essayGraderLimit = 0;
    
    if (currentPlan) {
      // User has a plan, use its limits
      essayWriterLimit = currentPlan.numberOfEssayWriter || 0;
      essayGraderLimit = currentPlan.numberOfEssayGrader || 0;
    } else {
      // No plan - check if there's an active free plan available
      const freePlan = await db.plan.findFirst({
        where: {
          name: { contains: "free", mode: "insensitive" },
          status: "ACTIVE"
        }
      });
      
      if (freePlan) {
        essayWriterLimit = freePlan.numberOfEssayWriter || 0;
        essayGraderLimit = freePlan.numberOfEssayGrader || 0;
      }
    }

    console.log(`📊 Essay Usage for user ${sessionUser.user.id}:`);
    console.log(`   Writer: ${essayWriterUsage} / ${essayWriterLimit}`);
    console.log(`   Grader: ${essayGraderUsage} / ${essayGraderLimit}`);
    console.log(`   Month: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

    return NextResponse.json({
      success: true,
      usage: {
        essayWriter: {
          used: essayWriterUsage,
          limit: essayWriterLimit,
          unlimited: !isFreeUser && essayWriterLimit === 0 // Only unlimited if user has a plan and limit is 0
        },
        essayGrader: {
          used: essayGraderUsage,
          limit: essayGraderLimit,
          unlimited: !isFreeUser && essayGraderLimit === 0 // Only unlimited if user has a plan and limit is 0
        }
      },
      plan: currentPlan ? {
        id: currentPlan.id,
        name: currentPlan.name,
        numberOfEssayWriter: currentPlan.numberOfEssayWriter,
        numberOfEssayGrader: currentPlan.numberOfEssayGrader
      } : {
        id: 0,
        name: "Free",
        numberOfEssayWriter: 0,
        numberOfEssayGrader: 0
      },
      isFreeUser: isFreeUser
    });
  } catch (error) {
    console.error("Error fetching essay usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch essay usage" },
      { status: 500 }
    );
  }
}

// POST /api/essay-usage - Record essay usage
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, fileId } = body;

    if (!type || !["essay_writer", "essay_grader"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    // Check if user has reached their limit
    const user = await db.user.findUnique({
      where: { id: sessionUser.user.id },
      include: {
        plans: {
          where: { status: "ACTIVE" },
          take: 1,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentPlan = user.plans[0];
    
    // If no plan, check if there's a free plan available
    let limit = 0;
    if (currentPlan) {
      limit = type === "essay_writer" ? currentPlan.numberOfEssayWriter : currentPlan.numberOfEssayGrader;
    } else {
      // Check for free plan
      const freePlan = await db.plan.findFirst({
        where: {
          name: { contains: "free", mode: "insensitive" },
          status: "ACTIVE"
        }
      });
      
      if (freePlan) {
        limit = type === "essay_writer" ? freePlan.numberOfEssayWriter : freePlan.numberOfEssayGrader;
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: "You need to upgrade your plan to use this feature",
            isFreeUser: true
          },
          { status: 403 }
        );
      }
    }
    if (limit > 0) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const currentUsage = await db.essayUsage.count({
        where: {
          userId: sessionUser.user.id,
          type: type,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      if (currentUsage >= limit) {
        return NextResponse.json(
          { 
            success: false, 
            message: `You have reached your ${type.replace('_', ' ')} limit for this month`,
            limitReached: true
          },
          { status: 403 }
        );
      }
    }

    // Record the usage
    const usage = await db.essayUsage.create({
      data: {
        userId: sessionUser.user.id,
        type: type,
        fileId: fileId || null
      }
    });

    return NextResponse.json({
      success: true,
      usage: usage
    });
  } catch (error) {
    console.error("Error recording essay usage:", error);
    return NextResponse.json(
      { error: "Failed to record essay usage" },
      { status: 500 }
    );
  }
}
