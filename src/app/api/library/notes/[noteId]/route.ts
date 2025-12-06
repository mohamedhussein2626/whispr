import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { db } from "@/db";

// DELETE /api/library/notes/[noteId] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const { noteId } = await params;

    await db.libraryNote.delete({
      where: {
        id: noteId,
        topic: {
          userId: sessionUser.user.id,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Note deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

// PUT /api/library/notes/[noteId] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

    const { noteId } = await params;
    const body = await request.json();
    const { title, content, topicId, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Note title is required" },
        { status: 400 }
      );
    }

    const note = await db.libraryNote.update({
      where: {
        id: noteId,
        topic: {
          userId: sessionUser.user.id,
        },
      },
      data: {
        title: title.trim(),
        content: content?.trim() || "",
        topicId: topicId,
        tags: tags || [],
        updatedAt: new Date(),
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
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}
