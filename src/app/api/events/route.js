import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // PRD: "Upcoming 3 months"
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 1); // Let's include recent events just in case, but target upcoming
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    // Fetch events where date is between today (or recent) and 3 months later
    const events = await Event.find({
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lte: threeMonthsLater }
    }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name, description, date, time, venue, ticketPrice,
      maxParticipants, registrationDeadline, minLeftBV, minRightBV,
      bannerImage, notes
    } = body;

    if (!name || !date || !time || !venue) {
      return NextResponse.json({ error: 'Name, date, time, and venue are required fields' }, { status: 400 });
    }

    const newEvent = new Event({
      name,
      description: description || '',
      date: new Date(date),
      time,
      venue,
      ticketPrice: ticketPrice !== undefined ? Number(ticketPrice) : 0,
      maxParticipants: maxParticipants !== undefined ? Number(maxParticipants) : null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      minLeftBV: minLeftBV !== undefined ? Number(minLeftBV) : 0,
      minRightBV: minRightBV !== undefined ? Number(minRightBV) : 0,
      bannerImage: bannerImage || '',
      notes: notes || ''
    });

    await newEvent.save();
    return NextResponse.json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
