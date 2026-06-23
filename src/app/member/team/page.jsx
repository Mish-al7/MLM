import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import MemberTeamClient from '@/components/member/MemberTeamClient';

export default async function MemberTeamPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();

  const currentUser = await User.findOne({ userId: session.userId }).lean();
  if (!currentUser) return null;

  // Fetch all members so we can build the downline tree client-side
  const allMembers = await User.find({}).lean();

  const safeUser = {
    ...currentUser,
    _id: currentUser._id.toString()
  };

  const safeMembers = allMembers.map(m => ({
    ...m,
    _id: m._id.toString()
  }));

  return <MemberTeamClient currentUser={safeUser} allMembers={safeMembers} />;
}
