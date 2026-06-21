import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Update from '@/models/Update';
import AdminUpdatesClient from '@/components/admin/AdminUpdatesClient';

export default async function AdminUpdatesPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  const updates = await Update.find({}).sort({ createdAt: -1 }).lean();
  
  // Serialize ObjectIds
  const safeUpdates = updates.map(u => ({
    ...u,
    _id: u._id.toString(),
    createdAt: u.createdAt.toISOString()
  }));

  return <AdminUpdatesClient initialUpdates={safeUpdates} />;
}
