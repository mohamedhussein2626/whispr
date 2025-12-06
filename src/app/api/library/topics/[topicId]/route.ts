import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

// DELETE /api/library/topics/[topicId] - Delete a topic and all its notes
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const { topicId } = await params;

    // First, delete all notes in this topic
    await db.libraryNote.deleteMany({
      where: {
        topicId: topicId,
        topic: {
          userId: sessionUser.user.id,
        },
      },
    });

    // Then delete the topic
    await db.libraryTopic.delete({
      where: {
        id: topicId,
        userId: sessionUser.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Topic and all its notes deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}

// PUT /api/library/topics/[topicId] - Update a topic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const { topicId } = await params;
    const body = await request.json();
    const { name, description, tags } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Topic name is required" },
        { status: 400 }
      );
    }

    const topic = await db.libraryTopic.update({
      where: {
        id: topicId,
        userId: sessionUser.user.id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        tags: tags || [],
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        createdAt: topic.createdAt.toISOString(),
        updatedAt: topic.updatedAt.toISOString(),
        tags: topic.tags,
      },
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}
