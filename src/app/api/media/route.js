import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Media from '@/models/Media';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const albumName = searchParams.get('albumName') || '';

    let filter = {};
    if (albumName) {
      filter.albumName = albumName;
    }

    const mediaItems = await Media.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: mediaItems });
  } catch (error) {
    console.error('Error fetching media:', error);
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
    const { title, description, mediaType, url, albumName } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const newMedia = new Media({
      title,
      description: description || '',
      mediaType: mediaType || 'image',
      url,
      albumName: albumName || 'General',
      uploadedBy: currentUser.name
    });

    await newMedia.save();
    return NextResponse.json({ success: true, data: newMedia });
  } catch (error) {
    console.error('Error creating media item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
