import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RoyalKingsClub from '@/models/RoyalKingsClub';
import { getSessionUser } from '@/lib/auth';

// POST — super_admin adds a new member to the members array
export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, title, portraitUrl } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Member name is required' }, { status: 400 });
    }

    const doc = await RoyalKingsClub.findOneAndUpdate(
      {},
      {
        $push: {
          members: { name, title: title || 'Royal Kings Club Member', portraitUrl: portraitUrl || '', order: Date.now() },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('RKC members POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — super_admin removes a member by _id
export async function DELETE(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId query param required' }, { status: 400 });
    }

    const doc = await RoyalKingsClub.findOneAndUpdate(
      {},
      { $pull: { members: { _id: memberId } } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('RKC members DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
