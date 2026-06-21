import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import News from '@/models/News';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, image, pinned, archived } = body;

    const newsItem = await News.findById(id);
    if (!newsItem) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    if (title !== undefined) newsItem.title = title;
    if (content !== undefined) newsItem.content = content;
    if (image !== undefined) newsItem.image = image;
    if (pinned !== undefined) newsItem.pinned = pinned;
    if (archived !== undefined) newsItem.archived = archived;

    await newsItem.save();
    return NextResponse.json({ success: true, data: newsItem });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const newsItem = await News.findByIdAndDelete(id);

    if (!newsItem) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
