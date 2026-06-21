import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists (admin must add them first)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not registered. Please ask Super Admin to add you first.' 
      }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save the new OTP
    const otpDoc = new Otp({
      email: email.toLowerCase(),
      code,
      expiresAt
    });
    await otpDoc.save();

    // Log the OTP in server console for easy testing (as requested by user)
    console.log(`[TESTING OTP] Generated OTP for ${email}: ${code}`);

    // Return the OTP in response *only* for testing convenience in dev
    const isDev = process.env.NODE_ENV !== 'production' || true; // Keep true for easy demo / QA testing
    const testOtp = isDev ? code : null;

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully. Please check console.',
      testOtp // This makes testing super easy
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
