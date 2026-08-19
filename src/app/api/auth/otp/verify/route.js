import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';
import {
  createAuthToken,
  isAccountActive,
  setAuthCookie,
} from '@/lib/auth';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    // Find OTP
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      code: code.trim()
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Fetch user details
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    if (!isAccountActive(user)) {
      return NextResponse.json(
        { error: 'Account is not active. Ask Super Admin to restore access.' },
        { status: 403 }
      );
    }

    // Delete the verified OTP
    await Otp.deleteOne({ _id: otpRecord._id });

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
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
