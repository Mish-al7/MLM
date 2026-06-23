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

export async function GET() {
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

    // 2. Create Members Hierarchy
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayLocal = new Date(localTimeStr);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const birthToday = new Date(Date.UTC(1990, todayLocal.getMonth(), todayLocal.getDate()));
    const birthTomorrow = new Date(Date.UTC(1993, tomorrowLocal.getMonth(), tomorrowLocal.getDate()));

    // CEO (aravind)
    const aravind = new User({
      userId: 'ALZ-0001',
      name: 'Aravind Menon',
      email: 'aravind@allianza.team',
      dob: new Date('1988-06-15'),
      phone: '+91 9800000001',
      role: 'super_admin',
      status: 'active',
      allianzaId: 'ALZ-80001',
      managerId: null,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      leftBV: 84200,
      rightBV: 76800,
      rank: 'Diamond',
      reward: 'Bali Leadership Retreat',
      upcomingRank: 'Crown',
      upcomingReward: 'Lexus ES',
      personalNotes: 'Network founder leading international operations.'
    });
    await aravind.save();

    // Leaders reporting to Aravind
    const priya = new User({
      userId: 'ALZ-0002',
      name: 'Priya Nair',
      email: 'priya@allianza.team',
      dob: new Date('1991-04-20'),
      phone: '+91 9800000411',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80002',
      managerId: 'ALZ-0001',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      leftBV: 64500,
      rightBV: 51000,
      rank: 'Platinum',
      reward: 'Goa Trip',
      upcomingRank: 'Diamond',
      upcomingReward: 'Bali Retreat',
      personalNotes: 'Top leader of Support Leg A.'
    });
    await priya.save();

    const megha = new User({
      userId: 'ALZ-0003',
      name: 'Megha Joshi',
      email: 'megha@allianza.team',
      dob: birthTomorrow,
      phone: '+91 9800000412',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80003',
      managerId: 'ALZ-0001',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      leftBV: 173500,
      rightBV: 97300,
      rank: 'Diamond',
      reward: 'Bali Retreat',
      upcomingRank: 'Crown',
      upcomingReward: 'Lexus ES',
      personalNotes: 'Key leader of Support Leg B.'
    });
    await megha.save();

    // Sub-leaders reporting to Priya
    const anjali = new User({
      userId: 'ALZ-0004',
      name: 'Anjali Kumar',
      email: 'anjali@allianza.team',
      dob: new Date('1994-08-05'),
      phone: '+91 9800000427',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80004',
      managerId: 'ALZ-0002',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
      leftBV: 42300,
      rightBV: 31100,
      rank: 'Gold',
      reward: 'Phuket Trip',
      upcomingRank: 'Platinum',
      upcomingReward: 'Dubai Summit + ₹50k',
      personalNotes: 'Rising star in Priya\'s organization.'
    });
    await anjali.save();

    const rohit = new User({
      userId: 'ALZ-0005',
      name: 'Rohit Sharma',
      email: 'rohit@allianza.team',
      dob: birthToday,
      phone: '+91 9800000428',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80005',
      managerId: 'ALZ-0002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      leftBV: 28000,
      rightBV: 24500,
      rank: 'Silver',
      reward: 'Leadership Pin',
      upcomingRank: 'Gold',
      upcomingReward: 'Phuket Trip',
      personalNotes: 'Expanding network aggressively.'
    });
    await rohit.save();

    // Also support fallback Lovable email addresses for ease of review
    const aravindFallback = new User({
      userId: 'ALZ-0006',
      name: 'Aravind Menon (Alt)',
      email: 'aravind@apex.team',
      dob: new Date('1988-06-15'),
      phone: '+91 9800000001',
      role: 'super_admin',
      status: 'active',
      allianzaId: 'ALZ-80001',
      managerId: null,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      leftBV: 84200,
      rightBV: 76800,
      rank: 'Diamond',
      reward: 'Bali Leadership Retreat',
      upcomingRank: 'Crown',
      upcomingReward: 'Lexus ES',
      personalNotes: 'Alternative profile for Aravind Menon.'
    });
    await aravindFallback.save();

    const priyaFallback = new User({
      userId: 'ALZ-0007',
      name: 'Priya Nair (Alt)',
      email: 'priya@apex.team',
      dob: new Date('1991-04-20'),
      phone: '+91 9800000411',
      role: 'member',
      status: 'active',
      allianzaId: 'ALZ-80002',
      managerId: 'ALZ-0001',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
      leftBV: 64500,
      rightBV: 51000,
      rank: 'Platinum',
      reward: 'Goa Trip',
      upcomingRank: 'Diamond',
      upcomingReward: 'Bali Retreat',
      personalNotes: 'Alternative profile for Priya Nair.'
    });
    await priyaFallback.save();

    // 3. Create Events
    const event1 = new Event({
      name: 'Diamond Summit — Goa',
      description: 'Exclusive retreat and policy sync for Diamond and above rank leaders.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      time: '09:00 AM - 05:00 PM',
      venue: 'Cidade de Goa Resort, Goa, India',
      ticketPrice: 5000,
      maxParticipants: 100,
      registrationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      minLeftBV: 40000,
      minRightBV: 30000,
      bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
      notes: 'Please upload payment receipt for verification.'
    });
    await event1.save();

    const event2 = new Event({
      name: "Founders' Roundtable — Bengaluru",
      description: 'Strategic planning meeting with Allianza founders.',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days later
      time: '11:00 AM - 04:00 PM',
      venue: 'The Ritz-Carlton, Bengaluru, India',
      ticketPrice: 2500,
      maxParticipants: 50,
      registrationDeadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
      minLeftBV: 25000,
      minRightBV: 20000,
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      notes: 'Snacks and lunch are included.'
    });
    await event2.save();

    // 4. Create News
    const news1 = new News({
      title: 'Allianza Annual Convention 2026 Announced!',
      content: '<p>We are thrilled to announce that the Allianza Annual Convention will be held in Bangkok, Thailand this December. Get ready for three days of intense leadership training, reward ceremonies, and massive networking opportunities.</p><p>Stay tuned for details on qualification metrics.</p>',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
      pinned: true,
      author: 'Aravind Menon'
    });
    await news1.save();

    const news2 = new News({
      title: 'Rank Program Expansion: Introducing Crown Diamond Reward',
      content: '<p>As part of our commitment to reward top-tier leadership, we are introducing a new Crown Diamond reward pool. Super Admins can now configure reward metrics in the ranks portal.</p>',
      image: 'https://images.unsplash.com/photo-1533073351656-7c8f154f41d2?q=80&w=800&auto=format&fit=crop',
      pinned: false,
      author: 'Aravind Menon'
    });
    await news2.save();

    // 5. Create Updates
    const update1 = new Update({
      content: 'Policy Update: Upload receipt proofs for Goa event registration before July 10th.',
      type: 'Policy',
      author: 'Super Admin'
    });
    await update1.save();

    const update2 = new Update({
      content: 'Leadership Sync: Gold and Platinum sync tomorrow at 10:00 AM IST. Link in calendar.',
      type: 'Reminder',
      author: 'Super Admin'
    });
    await update2.save();

    // 6. Create Documents
    const doc1 = new Document({
      title: 'Allianza Compensation Structure v3.1',
      description: 'Full documentation of commission rates, rank requirements, and business metrics.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: '1.4 MB',
      uploadedBy: 'Aravind Menon'
    });
    await doc1.save();

    const doc2 = new Document({
      title: 'Product Training Handbook 2026',
      description: 'Training guidelines and benefits dictionary for distributors.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: '3.6 MB',
      uploadedBy: 'Aravind Menon'
    });
    await doc2.save();

    // 7. Create Media items
    const media1 = new Media({
      title: 'Goa Leadership Retreat 2025 Group Photo',
      description: 'All state coordinators during our workshop session.',
      mediaType: 'image',
      url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop',
      albumName: 'Goa Retreat 2025',
      uploadedBy: 'Super Admin'
    });
    await media1.save();

    const media2 = new Media({
      title: 'Phuket Summit Awards Highlight Reel',
      description: 'Highlight awards presentation to new Diamond members.',
      mediaType: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      albumName: 'Phuket Summit 2025',
      uploadedBy: 'Super Admin'
    });
    await media2.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with reporting manager hierarchy, standard ranks, events, news, updates, docs, and media!' 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
