import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Event from '@/models/Event';
import AdminEventsClient from '@/components/admin/AdminEventsClient';

export default async function AdminEventsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const events = await Event.find({}).sort({ date: 1 }).lean();
  
  // Serialize ObjectIds
  const safeEvents = events.map(e => ({
    ...e,
    _id: e._id.toString()
  }));

  return <AdminEventsClient initialEvents={safeEvents} />;
}
