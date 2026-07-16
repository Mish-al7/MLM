import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import { evaluateAndUpdateRank } from '@/lib/rankEvaluator';

/**
 * POST /api/ranks/sync
 * Bulk re-evaluates all users' ranks based on current BV vs rank thresholds.
 * Admin-only endpoint. Useful when rank thresholds change or new ranks are added.
 */
export async function POST() {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({});
    let upgradedCount = 0;
    const upgrades = [];

    for (const user of users) {
      const result = await evaluateAndUpdateRank(user, currentUser.userId);
      if (result.upgraded) {
        await user.save();
        upgradedCount++;
        upgrades.push({
          userId: user.userId,
          name: user.name,
          from: result.previousRank,
          to: result.newRank
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete. ${upgradedCount} user(s) upgraded.`,
      upgradedCount,
      upgrades
    });
  } catch (error) {
    console.error('Error syncing ranks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
