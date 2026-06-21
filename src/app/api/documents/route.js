import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Document from '@/models/Document';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || ''; // pdf, doc, xls, ppt

    let filter = {};
    if (type) {
      filter.fileType = type;
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
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
    const { title, description, fileUrl, fileType, fileSize } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Title and fileUrl are required' }, { status: 400 });
    }

    const newDoc = new Document({
      title,
      description: description || '',
      fileUrl,
      fileType: fileType || 'pdf',
      fileSize: fileSize || '',
      uploadedBy: currentUser.name
    });

    await newDoc.save();
    return NextResponse.json({ success: true, data: newDoc });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
