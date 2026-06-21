import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';
import MemberEventsClient from '@/components/member/MemberEventsClient';

export default async function MemberEventsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  const events = await Event.find({}).sort({ date: 1 }).lean();
  
  // Serialize ObjectIds
  const safeUser = {
    ...user,
    _id: user._id.toString()
  };
  
  const safeEvents = events.map(e => ({
    ...e,
    _id: e._id.toString()
  }));

  return <MemberEventsClient initialEvents={safeEvents} currentUser={safeUser} />;
}
