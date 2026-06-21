import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import News from '@/models/News';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('archived') === 'true';

    let filter = {};
    if (!includeArchived) {
      filter.archived = false;
    }

    // Pinned news first, then newest first
    const news = await News.find(filter).sort({ pinned: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
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
    const { title, content, image, pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newsItem = new News({
      title,
      content,
      image: image || '',
      pinned: !!pinned,
      author: currentUser.name
    });

    await newsItem.save();
    return NextResponse.json({ success: true, data: newsItem });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
