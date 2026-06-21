import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import User from '@/models/User';
import Registration from '@/models/Registration';
import { getSessionUser } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // event ObjectId
    const body = await req.json();
    const { contactNumber, mainLeader, paymentReceipt, paidTo } = body;

    if (!contactNumber || !mainLeader || !paymentReceipt || !paidTo) {
      return NextResponse.json({ error: 'Contact number, leader, paid to, and payment receipt are required' }, { status: 400 });
    }

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
    }

    // Fetch user current BV
    const user = await User.findOne({ userId: currentUser.userId });
    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Verify Eligibility (minLeftBV & minRightBV)
    const isEligible = user.leftBV >= event.minLeftBV && user.rightBV >= event.minRightBV;
    if (!isEligible) {
      return NextResponse.json({ 
        error: `Ineligible: You do not meet the minimum Business Value requirements (Required Left: ${event.minLeftBV}, Right: ${event.minRightBV})` 
      }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ eventId: event._id, userId: user.userId });
    if (existingRegistration) {
      return NextResponse.json({ error: 'You have already nominated/registered for this event' }, { status: 400 });
    }

    const newRegistration = new Registration({
      eventId: event._id,
      userId: user.userId,
      contactNumber,
      mainLeader,
      paymentReceipt,
      paidTo,
      status: 'Pending',
      registrationDate: new Date()
    });

    await newRegistration.save();
    return NextResponse.json({ success: true, data: newRegistration });
  } catch (error) {
    console.error('Error in self nomination:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
