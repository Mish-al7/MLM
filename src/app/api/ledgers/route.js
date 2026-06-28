import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ledger from '@/models/Ledger';
import { getSessionUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    let ledgers = await Ledger.find({ userId: currentUser.userId }).sort({ createdAt: 1 });

    // Auto-create a default ledger for new users to keep UX clean
    if (ledgers.length === 0) {
      const defaultLedger = new Ledger({
        userId: currentUser.userId,
        name: 'Main Cash Ledger'
      });
      await defaultLedger.save();
      ledgers = [defaultLedger];
    }

    return NextResponse.json({ success: true, data: ledgers });
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Ledger name is required' }, { status: 400 });
    }

    const newLedger = new Ledger({
      userId: currentUser.userId,
      name: name.trim()
    });

    await newLedger.save();
    return NextResponse.json({ success: true, data: newLedger });
  } catch (error) {
    console.error('Error creating ledger:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
