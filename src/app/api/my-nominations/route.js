import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import Event from '@/models/Event';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const regs = await Registration.find({ userId: currentUser.userId })
      .sort({ createdAt: -1 })
      .lean();

    const data = [];
    for (const reg of regs) {
      const event = await Event.findById(reg.eventId).select('name date venue');
      data.push({
        ...reg,
        _id: reg._id.toString(),
        eventName: event ? event.name : '',
        eventDate: event ? event.date : null,
        venue: event ? event.venue : '',
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching my nominations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
