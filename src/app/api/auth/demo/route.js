import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { createAuthToken, setAuthCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const { role } = await req.json();

    if (!role || !['super_admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 });
    }

    const email = role === 'super_admin' ? 'jinil@allianza.team' : 'anjali@allianza.team';

    // Fetch user details
    let user = await User.findOne({ email });

    // Fallback if DB not seeded yet
    if (!user) {
      return NextResponse.json({ 
        error: 'Database not seeded yet. Please run the seed endpoint: /api/dev/seed' 
      }, { status: 404 });
    }

    const token = createAuthToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        allianzaId: user.allianzaId,
        managerId: user.managerId,
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
    console.error('Error switching demo role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
