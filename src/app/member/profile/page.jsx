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
  
  // Serialize user recursively to prevent server/client hydration errors
  const safeUser = JSON.parse(JSON.stringify(user));

  return <MemberProfileClient currentUser={safeUser} />;
}
