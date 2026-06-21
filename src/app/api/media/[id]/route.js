import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Media from '@/models/Media';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const deletedMedia = await Media.findByIdAndDelete(id);

    if (!deletedMedia) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Media item deleted successfully' });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
