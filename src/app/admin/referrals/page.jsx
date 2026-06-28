import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AdminReferralsClient from '@/components/admin/AdminReferralsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Referral Team — Allianza Leadership Platform',
  description: 'Manage members directly referred by you and track your downline network.',
};

export default async function AdminReferralsPage() {
  const session = await getSessionUser();
  if (!session) redirect('/');

  await dbConnect();

  // Fetch all members (need full tree to compute downline counts and build member map)
  const allMembersRaw = await User.find({}).lean();

  // Serialize for client (convert ObjectId/Date fields)
  const allMembers = allMembersRaw.map(m => ({
    userId: m.userId,
    name: m.name,
    email: m.email,
    phone: m.phone || '',
    avatar: m.avatar || '',
    role: m.role,
    status: m.status,
    rank: m.rank || 'Associate',
    reward: m.reward || '',
    upcomingRank: m.upcomingRank || '',
    upcomingReward: m.upcomingReward || '',
    managerId: m.managerId || null,
    allianzaId: m.allianzaId || '',
    leftBV: m.leftBV || 0,
    rightBV: m.rightBV || 0,
    joiningDate: m.joiningDate ? m.joiningDate.toISOString() : null,
    dob: m.dob ? m.dob.toISOString() : null,
  }));

  const currentUser = {
    userId: session.userId,
    name: session.name,
    role: session.role,
    rank: session.rank || 'Associate',
    reward: session.reward || '',
  };

  return (
    <AdminReferralsClient
      currentUser={currentUser}
      allMembers={allMembers}
    />
  );
}
