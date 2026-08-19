import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import {
  createAuthToken,
  isAccountActive,
  setAuthCookie,
  verifyPassword,
} from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    if (!user.password || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!isAccountActive(user)) {
      return NextResponse.json(
        { error: 'Account is not active. Ask Super Admin to restore access.' },
        { status: 403 }
      );
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
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
