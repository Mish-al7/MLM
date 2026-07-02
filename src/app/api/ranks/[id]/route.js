import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Rank from '@/models/Rank';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const rank = await Rank.findById(id);
    if (!rank) {
      return NextResponse.json({ error: 'Rank not found' }, { status: 404 });
    }

    if (body.name) rank.name = body.name;
    if (body.reward !== undefined) rank.reward = body.reward;
    if (body.target !== undefined) rank.target = body.target;
    if (body.targetLeftBv !== undefined) rank.targetLeftBv = Number(body.targetLeftBv);
    if (body.targetRightBv !== undefined) rank.targetRightBv = Number(body.targetRightBv);
    if (body.iconName) rank.iconName = body.iconName;

    await rank.save();
    return NextResponse.json({ success: true, data: rank });
  } catch (error) {
    console.error('Error updating rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const rank = await Rank.findById(id);
    if (!rank) {
      return NextResponse.json({ error: 'Rank not found' }, { status: 404 });
    }

    await Rank.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Rank deleted successfully' });
  } catch (error) {
    console.error('Error deleting rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
