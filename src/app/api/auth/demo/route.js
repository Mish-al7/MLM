import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'tez-leadership-platform-secret-12345';

export async function POST(req) {
  try {
    await dbConnect();
    const { role } = await req.json();

    if (!role || !['super_admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 });
    }

    const email = role === 'super_admin' ? 'aravind@tez.team' : 'anjali@tez.team';

    // Fetch user details
    let user = await User.findOne({ email });

    // Fallback if DB not seeded yet
    if (!user) {
      return NextResponse.json({ 
        error: 'Database not seeded yet. Please run the seed endpoint: /api/dev/seed' 
      }, { status: 404 });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

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
