import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BopEvent, { REGIONS } from '@/models/BopEvent';
import { getSessionUser } from '@/lib/auth';

// GET — all published events for members; all events for super_admin
export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const filter = currentUser.role === 'super_admin' ? {} : { published: true };
    const events = await BopEvent.find(filter).sort({ dateTime: 1 });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching BOP events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — super_admin creates a new BOP event
export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const body = await req.json();
    const { title, dateTime, venue, region, district, lat, lng, published } = body;

    if (!title || !dateTime || !venue || !region) {
      return NextResponse.json(
        { error: 'Title, dateTime, venue, and region are required' },
        { status: 400 }
      );
    }

    if (!REGIONS.includes(region)) {
      return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
    }

    const newEvent = new BopEvent({
      title,
      dateTime: new Date(dateTime),
      venue,
      region,
      district: region === 'Kerala' ? (district || null) : null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      published: published === true,
    });

    await newEvent.save();
    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating BOP event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
