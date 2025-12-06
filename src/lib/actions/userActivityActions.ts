"use server";

import { db } from "@/db";
import { getUserFromRequest } from "@/lib/auth";
export type UserActivityMetadata = Record<string, string | number | boolean | null>;

export async function logUserActivity(
  userId: string,
  activity: string,
  metadata?: UserActivityMetadata
) {
  try {
    await db.userActivity.create({
      data: {
        userId,
        activity,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}

export async function getUserActivityLog(userId: string) {
  try {
    const activities = await db.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 100, // Last 100 activities
    });

    return activities.map(activity => ({
      id: activity.id,
      activity: activity.activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      timestamp: activity.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
}

export async function exportUserActivityReport(userId: string) {
  try {
    // Check if admin is authenticated
    const admin = await getUserFromRequest();
    if (!admin) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const activities = await db.userActivity.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    // Create CSV report
    const csvHeader = "Timestamp,Activity,Details\n";
    const csvRows = activities.map(activity => {
      const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
      const details = Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ");
      
      return `"${activity.timestamp.toISOString()}","${activity.activity}","${details}"`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    return {
      success: true,
      data: csvContent,
      filename: `user-activity-${user.email}-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } catch (error) {
    console.error("Error exporting user activity:", error);
    return { success: false, message: "Failed to export user activity" };
  }
}
