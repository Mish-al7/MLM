import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AdminTeamClient from '@/components/admin/AdminTeamClient';

export default async function AdminTeamPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  
  // Fetch initial members for SSR
  const members = await User.find({}).sort({ joiningDate: -1 }).lean();
  
  // Serialize ObjectIds
  const safeMembers = members.map(m => ({
    ...m,
    _id: m._id.toString(),
    managerName: m.managerId ? (members.find(x => x.userId === m.managerId)?.name || m.managerId) : 'None'
  }));
  
  const safeUser = {
    ...user,
    _id: user._id.toString()
  };

  return <AdminTeamClient initialMembers={safeMembers} currentUser={safeUser} />;
}
