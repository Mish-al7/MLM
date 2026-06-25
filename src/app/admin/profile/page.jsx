import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AdminProfileClient from '@/components/admin/AdminProfileClient';

export default async function AdminProfilePage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  const user = await User.findOne({ userId: session.userId }).lean();

  if (!user) return null;

  // Serialize user recursively to prevent server/client hydration errors
  const safeUser = JSON.parse(JSON.stringify(user));

  return <AdminProfileClient currentUser={safeUser} />;
}
