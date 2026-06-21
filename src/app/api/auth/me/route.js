import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ userId: session.userId }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Attach reporting manager name if exists
    if (user.managerId) {
      const manager = await User.findOne({ userId: user.managerId }).select('name');
      user.managerName = manager ? manager.name : 'None';
    } else {
      user.managerName = 'None';
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        tezId: user.tezId,
        managerId: user.managerId,
        managerName: user.managerName,
        avatar: user.avatar,
        leftBV: user.leftBV,
        rightBV: user.rightBV,
        rank: user.rank,
        reward: user.reward,
        upcomingRank: user.upcomingRank,
        upcomingReward: user.upcomingReward,
        achievementDate: user.achievementDate,
        personalNotes: user.personalNotes,
        bvHistory: user.bvHistory || [],
        rankHistory: user.rankHistory || []
      }
    });
  } catch (error) {
    console.error('Error fetching current user context:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
