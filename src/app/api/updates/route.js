import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Update from '@/models/Update';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || ''; // Notice, Reminder, Policy, Training

    let filter = {};
    if (type) {
      filter.type = type;
    }

    const updates = await Update.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { content, type } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newUpdate = new Update({
      content,
      type: type || 'Notice',
      author: currentUser.name
    });

    await newUpdate.save();
    return NextResponse.json({ success: true, data: newUpdate });
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
