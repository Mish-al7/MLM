import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import MemberDashboardClient from '@/components/member/MemberDashboardClient';

export default async function MemberDashboard() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  
  // Serialize ObjectId to string for Client Component
  const safeUser = {
    ...user,
    _id: user._id.toString()
  };

  return <MemberDashboardClient initialUser={safeUser} />;
}
