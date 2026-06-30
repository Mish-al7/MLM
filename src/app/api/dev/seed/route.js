import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Otp from '@/models/Otp';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import News from '@/models/News';
import Update from '@/models/Update';
import Document from '@/models/Document';
import Media from '@/models/Media';
import Rank from '@/models/Rank';
import RoyalKingsClub from '@/models/RoyalKingsClub';
import DashboardBanner from '@/models/DashboardBanner';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding is disabled in production' }, { status: 403 });
  }

  try {
    await dbConnect();

    // 1. Clear database collections
    await User.deleteMany({});
    await Otp.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await News.deleteMany({});
    await Update.deleteMany({});
    await Document.deleteMany({});
    await Media.deleteMany({});
    await Rank.deleteMany({});
    await RoyalKingsClub.deleteMany({});
    await DashboardBanner.deleteMany({});

    // 2. Create Members Hierarchy
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayLocal = new Date(localTimeStr);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const birthToday = new Date(Date.UTC(1990, todayLocal.getMonth(), todayLocal.getDate()));
    const birthTomorrow = new Date(Date.UTC(1993, tomorrowLocal.getMonth(), tomorrowLocal.getDate()));

    // CEO (jinil)
    const superAdmin = new User({
      userId: 'ALZ-0001',
      name: 'Jinil Joseph',
      email: 'jinil@allianza.team',
      dob: new Date('1988-06-15'),
      phone: '+91 9800000001',
      role: 'super_admin',
      status: 'active',
      allianzaId: 'ALZ-80001',
      managerId: null,
      avatar: '',
      leftBV: 0,
      rightBV: 0,
      rank: 'Associate',
      reward: 'None',
      upcomingRank: 'Silver',
      upcomingReward: 'Leadership Pin',
      personalNotes: 'Super Admin Account',
      password: hashPassword('password123')
    });
    await superAdmin.save();

    // Member (anjali)
    const memberUser = new User({
      userId: 'ALZ-0002',
      name: 'Anjali Kumar',
      email: 'anjali@allianza.team',
      dob: new Date('1992-04-10'),
      phone: '+91 9800000002',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80002',
      managerId: 'ALZ-0001',
      avatar: '',
      leftBV: 12000,
      rightBV: 8000,
      rank: 'Associate',
      reward: 'None',
      upcomingRank: 'Silver',
      upcomingReward: 'Leadership Pin',
      personalNotes: 'Member Account',
      password: hashPassword('password123')
    });
    await memberUser.save();

    // 8. Create standard Ranks
    const ranks = [
      { name: 'Associate', reward: 'None', target: 'Default onboarding level', targetLeftBv: 0, targetRightBv: 0, iconName: 'Star' },
      { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', targetLeftBv: 5000, targetRightBv: 5000, iconName: 'Award' },
      { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', targetLeftBv: 25000, targetRightBv: 25000, iconName: 'Compass' },
      { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', targetLeftBv: 50000, targetRightBv: 50000, iconName: 'MapPin' },
      { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', targetLeftBv: 80000, targetRightBv: 80000, iconName: 'Trophy' },
      { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', targetLeftBv: 150000, targetRightBv: 150000, iconName: 'Car' }
    ];
    await Rank.insertMany(ranks);

    // 10. Seed Dashboard Banners
    await DashboardBanner.create({
      banners: [
        { id: 1, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e0856d116db?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 1' },
        { id: 2, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 2' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with a single production Super Admin (Jinil), standard ranks, and banners!' 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
