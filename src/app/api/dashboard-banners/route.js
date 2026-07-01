import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DashboardBanner from '@/models/DashboardBanner';
import { getSessionUser } from '@/lib/auth';

const DEFAULT_BANNERS = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 1' },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 2' }
];

export async function GET() {
  try {
    await dbConnect();
    let doc = await DashboardBanner.findOne().lean();
    if (!doc) {
      // Create default doc if none exists
      doc = await DashboardBanner.create({ banners: DEFAULT_BANNERS });
    }
    return NextResponse.json({ success: true, data: doc.banners });
  } catch (error) {
    console.error('Banners GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { banners } = await req.json();
    if (!Array.isArray(banners) || banners.length < 1 || banners.length > 5) {
      return NextResponse.json({ error: 'Must provide between 1 and 5 banners' }, { status: 400 });
    }

    const doc = await DashboardBanner.findOneAndUpdate(
      {},
      { $set: { banners } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: doc.banners });
  } catch (error) {
    console.error('Banners PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
