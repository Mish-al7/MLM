import User from '@/models/User';
import Otp from '@/models/Otp';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import News from '@/models/News';
import Update from '@/models/Update';
import Document from '@/models/Document';
import Media from '@/models/Media';
import Rank from '@/models/Rank';
import { hashPassword } from '@/lib/auth';

export async function seedIfNeeded() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Database already has users. Bypassing seeding.
      return;
    }

    console.log('[Auto-Seed] Database is empty. Starting bootstrap seeding...');

    // Clear any dangling entries in other collections to ensure absolute consistency
    await Promise.all([
      User.deleteMany({}),
      Otp.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      News.deleteMany({}),
      Update.deleteMany({}),
      Document.deleteMany({}),
      Media.deleteMany({}),
      Rank.deleteMany({})
    ]);

    // Compute relative dates for birthday and events
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayLocal = new Date(localTimeStr);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const birthToday = new Date(Date.UTC(1990, todayLocal.getMonth(), todayLocal.getDate()));
    const birthTomorrow = new Date(Date.UTC(1993, tomorrowLocal.getMonth(), tomorrowLocal.getDate()));

    // 1. Create Core Users
    console.log('[Auto-Seed] Seeding initial production Super Admin...');
    const superAdmin = new User({
      userId: 'ALZ-0001',
      name: 'Jinil',
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

    // 2. Create standard Ranks
    const ranks = [
      { name: 'Associate', reward: 'None', target: 'Default onboarding level', targetLeftBv: 0, targetRightBv: 0, iconName: 'Star' },
      { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', targetLeftBv: 5000, targetRightBv: 5000, iconName: 'Award' },
      { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', targetLeftBv: 25000, targetRightBv: 25000, iconName: 'Compass' },
      { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', targetLeftBv: 50000, targetRightBv: 50000, iconName: 'MapPin' },
      { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', targetLeftBv: 80000, targetRightBv: 80000, iconName: 'Trophy' },
      { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', targetLeftBv: 150000, targetRightBv: 150000, iconName: 'Car' }
    ];
    await Rank.insertMany(ranks);

    // 3. Create default Dashboard Banners
    const defaultBanners = [
      { id: 1, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e0856d116db?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 1' },
      { id: 2, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 2' }
    ];
    const DashboardBanner = mongoose.models.DashboardBanner || mongoose.model('DashboardBanner', new mongoose.Schema({ banners: Array }, { strict: false }));
    await DashboardBanner.create({ banners: defaultBanners });

    console.log('[Auto-Seed] Database seeded successfully with production configurations.');
  } catch (error) {
    console.error('[Auto-Seed] Error during auto-seeding:', error);
  }
}
