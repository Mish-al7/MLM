import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CareFundEntry from '@/models/CareFundEntry';
import { getSessionUser } from '@/lib/auth';

// DELETE — admin can delete any; member can delete their own
export async function DELETE(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const entry = await CareFundEntry.findById(id);
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Members can only delete their own entries; admin can delete any
    if (currentUser.role !== 'super_admin' && entry.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await CareFundEntry.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('Care Fund entry DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
