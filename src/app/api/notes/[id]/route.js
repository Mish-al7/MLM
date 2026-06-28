import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CalendarNote from '@/models/CalendarNote';
import { getSessionUser } from '@/lib/auth';

// PATCH /api/notes/[id] — Edit a note (only the author can edit)
export async function PATCH(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const note = await CalendarNote.findById(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only the author can edit
    if (note.authorId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own notes' }, { status: 403 });
    }

    const body = await req.json();
    const { content, category, isCompleted } = body;

    if (content !== undefined) note.content = content.trim();
    if (category !== undefined) note.category = category;
    if (isCompleted !== undefined) note.isCompleted = isCompleted;

    await note.save();
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating calendar note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notes/[id] — Delete a note (only the author can delete)
export async function DELETE(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const note = await CalendarNote.findById(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Only the author can delete
    if (note.authorId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own notes' }, { status: 403 });
    }

    await CalendarNote.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting calendar note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
