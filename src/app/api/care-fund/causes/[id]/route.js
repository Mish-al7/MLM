import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CareFundCause from '@/models/CareFundCause';
import CareFundEntry from '@/models/CareFundEntry';
import { getSessionUser } from '@/lib/auth';

// PATCH — admin edits or toggles open/closed status of a cause
export async function PATCH(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const cause = await CareFundCause.findById(id);
    if (!cause) {
      return NextResponse.json({ error: 'Cause not found' }, { status: 404 });
    }

    if (body.title !== undefined) cause.title = body.title.trim();
    if (body.description !== undefined) cause.description = body.description;
    if (body.targetAmount !== undefined) cause.targetAmount = body.targetAmount;
    if (body.isOpen !== undefined) cause.isOpen = body.isOpen;

    await cause.save();
    return NextResponse.json({ success: true, data: cause });
  } catch (error) {
    console.error('Care Fund cause PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — admin deletes a cause and all its entries (cannot delete the default one)
export async function DELETE(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const cause = await CareFundCause.findById(id);
    if (!cause) {
      return NextResponse.json({ error: 'Cause not found' }, { status: 404 });
    }

    if (cause.isDefault) {
      return NextResponse.json({ error: 'Cannot delete the default monthly contribution cause' }, { status: 400 });
    }

    // Delete all contributions under this cause
    await CareFundEntry.deleteMany({ causeId: id });
    await CareFundCause.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Cause and all its entries deleted' });
  } catch (error) {
    console.error('Care Fund cause DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
