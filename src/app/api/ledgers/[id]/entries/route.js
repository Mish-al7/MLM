import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ledger from '@/models/Ledger';
import LedgerEntry from '@/models/LedgerEntry';
import { getSessionUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Verify parent ledger ownership
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }
    if (ledger.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch entries sorted chronologically to correctly compute running balance
    const entries = await LedgerEntry.find({ ledgerId: id }).sort({ date: 1, createdAt: 1 });
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Verify parent ledger ownership
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }
    if (ledger.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { date, description, type, amount } = body;

    if (!date || !description || !description.trim() || !type || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: 'Invalid amount value' }, { status: 400 });
    }

    const newEntry = new LedgerEntry({
      ledgerId: id,
      date: new Date(date),
      description: description.trim(),
      type,
      amount: numericAmount
    });

    await newEntry.save();
    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error creating ledger entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
