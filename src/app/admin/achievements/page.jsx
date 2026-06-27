import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Rank from '@/models/Rank';
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
  
  // Fetch dynamic ranks, seed defaults if empty
  let ranks = await Rank.find({}).sort({ targetLeftBv: 1 }).lean();
  if (ranks.length === 0) {
    const defaultRanks = [
      { name: 'Associate', reward: 'None', target: 'Default onboarding level', targetLeftBv: 0, targetRightBv: 0, iconName: 'Star' },
      { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', targetLeftBv: 5000, targetRightBv: 5000, iconName: 'Award' },
      { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', targetLeftBv: 25000, targetRightBv: 25000, iconName: 'Compass' },
      { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', targetLeftBv: 50000, targetRightBv: 50000, iconName: 'MapPin' },
      { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', targetLeftBv: 80000, targetRightBv: 80000, iconName: 'Trophy' },
      { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', targetLeftBv: 150000, targetRightBv: 150000, iconName: 'Car' }
    ];
    await Rank.insertMany(defaultRanks);
    ranks = await Rank.find({}).sort({ targetLeftBv: 1 }).lean();
  }

  // Serialize objects recursively to prevent server/client hydration errors
  const serializedUsers = JSON.parse(JSON.stringify(allUsers));
  const serializedCurrentUser = currentUser ? JSON.parse(JSON.stringify(currentUser)) : null;
  const serializedRanks = JSON.parse(JSON.stringify(ranks));

  return (
    <AdminAchievementsClient 
      initialUsers={serializedUsers} 
      currentUser={serializedCurrentUser} 
      initialRanks={serializedRanks}
    />
  );
}
