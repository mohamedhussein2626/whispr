import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

// GET /api/library/notes - Get all notes for the user
export async function GET() {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const notes = await db.libraryNote.findMany({
      where: {
        topic: {
          userId: sessionUser.user.id,
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const notesWithTopic = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      topicId: note.topicId,
      topicName: note.topic.name,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.tags,
    }));

    return NextResponse.json({ 
      success: true, 
      notes: notesWithTopic 
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/library/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const body = await request.json();
    const { title, content, topicId, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Note title is required" },
        { status: 400 }
      );
    }

    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    // Verify the topic belongs to the user
    const topic = await db.libraryTopic.findFirst({
      where: {
        id: topicId,
        userId: sessionUser.user.id,
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found or access denied" },
        { status: 404 }
      );
    }

    const note = await db.libraryNote.create({
      data: {
        title: title.trim(),
        content: content?.trim() || "",
        topicId: topicId,
        tags: tags || [],
      },
    });

    return NextResponse.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        topicId: note.topicId,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        tags: note.tags,
      },
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
