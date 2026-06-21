import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Update from '@/models/Update';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const deletedUpdate = await Update.findByIdAndDelete(id);

    if (!deletedUpdate) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error deleting update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
