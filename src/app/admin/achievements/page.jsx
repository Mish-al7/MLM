import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AdminAchievementsClient from '@/components/admin/AdminAchievementsClient';
import { redirect } from 'next/navigation';

export default async function AdminAchievementsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== 'super_admin') {
    redirect('/');
  }

  await dbConnect();
  const allUsers = await User.find({}).lean();
  const currentUser = await User.findOne({ userId: session.userId }).lean();

  // Serialize objects recursively to prevent server/client hydration errors
  const serializedUsers = JSON.parse(JSON.stringify(allUsers));
  const serializedCurrentUser = currentUser ? JSON.parse(JSON.stringify(currentUser)) : null;

  return (
    <AdminAchievementsClient 
      initialUsers={serializedUsers} 
      currentUser={serializedCurrentUser} 
    />
  );
}
