import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AdminReportsClient from '@/components/admin/AdminReportsClient';
import { redirect } from 'next/navigation';

export default async function AdminReportsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== 'super_admin') {
    redirect('/');
  }

  await dbConnect();
  const allUsers = await User.find({}).lean();
  const currentUser = await User.findOne({ userId: session.userId }).lean();

  // Deep serialize user records safely to prevent next.js server-client hydration errors
  const serializedUsers = JSON.parse(JSON.stringify(allUsers));
  const serializedCurrentUser = currentUser ? JSON.parse(JSON.stringify(currentUser)) : null;

  return (
    <AdminReportsClient 
      users={serializedUsers} 
      currentUser={serializedCurrentUser} 
    />
  );
}
