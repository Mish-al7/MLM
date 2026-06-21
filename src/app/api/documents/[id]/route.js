import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Document from '@/models/Document';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const deletedDoc = await Document.findByIdAndDelete(id);

    if (!deletedDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
