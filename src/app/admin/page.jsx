import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';
import Update from '@/models/Update';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getSessionUser();
  if (!session || session.role !== 'super_admin') {
    redirect('/');
  }

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  const membersCount = await User.countDocuments();
  const eventsCount = await Event.countDocuments();
  const referralsCount = await User.countDocuments({ managerId: session.userId });
  const updatesCount = await Update.countDocuments();
  const allUsers = await User.find({}).lean();
  
  // Get current date/time in India (IST, UTC+5:30) for accurate birthday checks
  const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const today = new Date(localTimeStr);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const tomorrowMonth = tomorrow.getMonth();
  const tomorrowDate = tomorrow.getDate();

  const todayBirthdays = [];
  const tomorrowBirthdays = [];

  for (const u of allUsers) {
    if (!u.dob || u.userId === session.userId) continue;
    const dob = new Date(u.dob);
    const m = dob.getUTCMonth();
    const d = dob.getUTCDate();
    
    if (m === todayMonth && d === todayDate) {
      todayBirthdays.push(u);
    } else if (m === tomorrowMonth && d === tomorrowDate) {
      tomorrowBirthdays.push(u);
    }
  }

  // Deep serialize mongo data cleanly
  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedAllUsers = JSON.parse(JSON.stringify(allUsers));
  const serializedTodayBirthdays = JSON.parse(JSON.stringify(todayBirthdays));
  const serializedTomorrowBirthdays = JSON.parse(JSON.stringify(tomorrowBirthdays));

  return (
    <AdminDashboardClient 
      user={serializedUser}
      membersCount={membersCount}
      eventsCount={eventsCount}
      referralsCount={referralsCount}
      updatesCount={updatesCount}
      todayBirthdays={serializedTodayBirthdays}
      tomorrowBirthdays={serializedTomorrowBirthdays}
      allUsers={serializedAllUsers}
    />
  );
}
