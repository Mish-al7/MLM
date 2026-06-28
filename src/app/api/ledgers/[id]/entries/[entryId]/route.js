import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ledger from '@/models/Ledger';
import LedgerEntry from '@/models/LedgerEntry';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, entryId } = await params;

    // Verify parent ledger ownership
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }
    if (ledger.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const entry = await LedgerEntry.findById(entryId);
    if (!entry || String(entry.ledgerId) !== id) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const body = await req.json();
    const { date, description, type, amount } = body;

    if (date !== undefined) entry.date = new Date(date);
    if (description !== undefined) entry.description = description.trim();
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
      }
      entry.type = type;
    }
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return NextResponse.json({ error: 'Invalid amount value' }, { status: 400 });
      }
      entry.amount = numericAmount;
    }

    await entry.save();
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Error updating ledger entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, entryId } = await params;

    // Verify parent ledger ownership
    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }
    if (ledger.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const entry = await LedgerEntry.findById(entryId);
    if (!entry || String(entry.ledgerId) !== id) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await LedgerEntry.findByIdAndDelete(entryId);
    return NextResponse.json({ success: true, message: 'Ledger entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
