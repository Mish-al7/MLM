import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import RoyalKingsClub from '@/models/RoyalKingsClub';
import { getSessionUser } from '@/lib/auth';

// GET — return the single RKC document (banner + members)
export async function GET() {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();

    // findOne or return empty shape
    let doc = await RoyalKingsClub.findOne().lean();
    if (!doc) doc = { bannerUrl: '', members: [] };

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('RKC GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — super_admin upserts the banner URL or full document
export async function PATCH(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Upsert: update the first doc, or create it if none exists
    const doc = await RoyalKingsClub.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('RKC PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
