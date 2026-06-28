import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ledger from '@/models/Ledger';
import LedgerEntry from '@/models/LedgerEntry';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const ledger = await Ledger.findById(id);
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }

    // Secure check: verify owner
    if (ledger.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all associated entries
    await LedgerEntry.deleteMany({ ledgerId: id });

    // Delete the ledger itself
    await Ledger.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Ledger and all its entries deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
