import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CareFundCause from '@/models/CareFundCause';
import CareFundEntry from '@/models/CareFundEntry';
import { getSessionUser } from '@/lib/auth';

// GET — list all causes (admin sees all, members see only open ones)
export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Ensure default monthly cause exists
    const existing = await CareFundCause.findOne({ isDefault: true });
    if (!existing) {
      await CareFundCause.create({
        title: 'Monthly Standing Contribution',
        description: 'Regular monthly care fund contribution set aside by each team member for mutual support during personal emergencies.',
        isDefault: true,
        isOpen: true,
        createdBy: currentUser.userId,
      });
    }

    const filter = currentUser.role === 'super_admin' ? {} : { isOpen: true };
    const causes = await CareFundCause.find(filter).sort({ isDefault: -1, createdAt: -1 });

    // Attach aggregated totals for each cause
    const causesWithTotals = await Promise.all(causes.map(async (cause) => {
      const entries = await CareFundEntry.find({ causeId: cause._id });
      const totalRaised = entries.reduce((sum, e) => sum + e.amount, 0);
      const contributorCount = new Set(entries.map(e => e.userId)).size;
      return {
        ...cause.toObject(),
        totalRaised,
        contributorCount,
      };
    }));

    return NextResponse.json({ success: true, data: causesWithTotals });
  } catch (error) {
    console.error('Care Fund causes GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — admin creates a new cause
export async function POST(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { title, description, targetAmount } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Cause title is required' }, { status: 400 });
    }

    const cause = await CareFundCause.create({
      title: title.trim(),
      description: description || '',
      targetAmount: targetAmount || 0,
      isDefault: false,
      isOpen: true,
      createdBy: currentUser.userId,
    });

    return NextResponse.json({ success: true, data: cause });
  } catch (error) {
    console.error('Care Fund causes POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
