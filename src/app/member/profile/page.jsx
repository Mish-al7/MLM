import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import MemberProfileClient from '@/components/member/MemberProfileClient';

export default async function MemberProfilePage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  
  // Serialize ObjectIds
  const safeUser = {
    ...user,
    _id: user._id.toString()
  };

  return <MemberProfileClient currentUser={safeUser} />;
}
