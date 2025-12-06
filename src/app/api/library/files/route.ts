import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    // Fetch files for the user, optionally filtered by topic
    const whereClause: {
      userId: string;
      topicId?: string;
      source?: { notIn: string[] };
    } = {
      userId: session.user.id,
      // Exclude essay-only files from library
      source: {
        notIn: ["essay_writer", "essay_grader"],
      },
    };

    if (topicId) {
      whereClause.topicId = topicId;
    }

    const files = await db.file.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        fileType: true,
        createdAt: true,
        topicId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      files: files,
    });
  } catch (error) {
    console.error("Error fetching library files:", error);
    return NextResponse.json(
      { error: "Failed to fetch library files" },
      { status: 500 }
    );
  }
}

