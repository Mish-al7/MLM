import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import CalendarNote from '@/models/CalendarNote';
import { getSessionUser } from '@/lib/auth';

/**
 * Walks up the managerId chain starting from the given userId,
 * returning an array of all ancestor userIds (i.e. the people above the user).
 * Max depth guard prevents infinite loops from bad data.
 */
async function getAncestorIds(startUserId, maxDepth = 20) {
  const ancestorIds = [];
  let currentId = startUserId;

  for (let i = 0; i < maxDepth; i++) {
    const user = await User.findOne({ userId: currentId }).select('managerId').lean();
    if (!user || !user.managerId) break;
    ancestorIds.push(user.managerId);
    currentId = user.managerId;
  }

  return ancestorIds;
}

// GET /api/notes — Fetch all notes visible to the current user
export async function GET() {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all ancestor IDs (the user can see notes from themselves + all ancestors)
    const ancestorIds = await getAncestorIds(currentUser.userId);
    const visibleAuthorIds = [currentUser.userId, ...ancestorIds];

    const notes = await CalendarNote.find({
      authorId: { $in: visibleAuthorIds }
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching calendar notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes — Create a new note
export async function POST(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { date, content, category } = body;

    if (!date || !content || !content.trim()) {
      return NextResponse.json({ error: 'Date and content are required' }, { status: 400 });
    }

    // Fetch full user record for name & role
    const user = await User.findOne({ userId: currentUser.userId }).select('name role').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const note = new CalendarNote({
      authorId: currentUser.userId,
      authorName: user.name,
      authorRole: user.role,
      date,
      content: content.trim(),
      category: category || 'personal',
      isCompleted: false
    });

    await note.save();
    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating calendar note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
