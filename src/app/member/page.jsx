import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Rank from '@/models/Rank';
import DashboardBanner from '@/models/DashboardBanner';
import MemberDashboardClient from '@/components/member/MemberDashboardClient';
import { redirect } from 'next/navigation';

export default async function MemberDashboard() {
  const session = await getSessionUser();
  if (!session || session.role !== 'member') {
    redirect('/');
  }

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  
  // Fetch all ranks to compute milestone progress dynamically on client
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

  // Fetch banners
  let bannerDoc = await DashboardBanner.findOne().lean();
  if (!bannerDoc) {
    const defaultBanners = [
      { id: 1, imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 1' },
      { id: 2, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 2' }
    ];
    bannerDoc = await DashboardBanner.create({ banners: defaultBanners });
  }
  
  // Fetch admins for member dashboard contact details
  const admins = await User.find({ role: 'super_admin' }).select('name email phone phone2 avatar').lean();

  // Serialize user recursively to prevent server/client hydration errors
  const safeUser = JSON.parse(JSON.stringify(user));
  const safeRanks = JSON.parse(JSON.stringify(ranks));
  const safeBanners = JSON.parse(JSON.stringify(bannerDoc.banners || []));
  const safeAdmins = JSON.parse(JSON.stringify(admins));

  return (
    <MemberDashboardClient 
      initialUser={safeUser} 
      allRanks={safeRanks} 
      initialBanners={safeBanners}
      adminContacts={safeAdmins}
    />
  );
}
