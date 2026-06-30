import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CareFundEntry from '@/models/CareFundEntry';
import CareFundCause from '@/models/CareFundCause';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

// GET — admin: all entries; member: own entries only
export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const causeId = searchParams.get('causeId');

    const filter = {};
    if (currentUser.role !== 'super_admin') {
      filter.userId = currentUser.userId;
    }
    if (causeId) {
      filter.causeId = causeId;
    }

    const entries = await CareFundEntry.find(filter)
      .populate('causeId', 'title isDefault')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Care Fund entries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — member submits a contribution
export async function POST(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { causeId, amount, note, screenshotUrl, month } = body;

    if (!causeId) {
      return NextResponse.json({ error: 'Cause is required' }, { status: 400 });
    }
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    // Verify cause exists and is open
    const cause = await CareFundCause.findById(causeId);
    if (!cause || !cause.isOpen) {
      return NextResponse.json({ error: 'This cause is not accepting contributions' }, { status: 400 });
    }

    // Fetch user's name for denormalization
    const user = await User.findOne({ userId: currentUser.userId });
    const userName = user ? user.name : currentUser.userId;

    const entry = await CareFundEntry.create({
      causeId,
      userId: currentUser.userId,
      userName,
      amount: Number(amount),
      note: note || '',
      screenshotUrl: screenshotUrl || '',
      month: month || new Date().toISOString().slice(0, 7), // default to current month
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Care Fund entries POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
