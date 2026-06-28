const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Helper to hash password
function hashPassword(password) {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Load MONGODB_URI from .env.local
const envPath = path.join(__dirname, '.env.local');
let mongodbUri = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI\s*=\s*(.*)$/m);
  if (match && match[1]) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error('Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

console.log(`Connecting to MongoDB...`);

// 2. Define Mongoose Schemas inline
const BvHistorySchema = new mongoose.Schema({
  oldLeft: { type: Number, default: 0 },
  newLeft: { type: Number, default: 0 },
  oldRight: { type: Number, default: 0 },
  newRight: { type: Number, default: 0 },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const RankHistorySchema = new mongoose.Schema({
  oldRank: { type: String, default: 'Associate' },
  newRank: { type: String, required: true },
  reward: { type: String, default: '' },
  achievementDate: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['super_admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  joiningDate: { type: Date, default: Date.now },
  allianzaId: { type: String, default: '' },
  managerId: { type: String, default: null },
  avatar: { type: String, default: '' },
  leftBV: { type: Number, default: 0 },
  rightBV: { type: Number, default: 0 },
  rank: { type: String, default: 'Associate' },
  reward: { type: String, default: '' },
  upcomingRank: { type: String, default: '' },
  upcomingReward: { type: String, default: '' },
  achievementDate: { type: Date },
  personalNotes: { type: String, default: '' },
  password: { type: String },
  bvHistory: [BvHistorySchema],
  rankHistory: [RankHistorySchema]
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  ticketPrice: { type: Number, default: 0 },
  maxParticipants: { type: Number, default: null },
  registrationDeadline: { type: Date, default: null },
  minLeftBV: { type: Number, default: 0 },
  minRightBV: { type: Number, default: 0 },
  bannerImage: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  author: { type: String, default: 'Super Admin' }
}, { timestamps: true });

const UpdateSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ['Notice', 'Reminder', 'Policy', 'Training'], default: 'Notice' },
  author: { type: String, default: 'Super Admin' }
}, { timestamps: true });

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'doc', 'xls', 'ppt', 'other'], default: 'pdf' },
  fileSize: { type: String, default: '' },
  uploadedBy: { type: String, default: 'Super Admin' }
}, { timestamps: true });

const MediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  albumName: { type: String, default: 'General' },
  uploadedBy: { type: String, default: 'Super Admin' }
}, { timestamps: true });

const RankSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  reward: { type: String, default: 'None' },
  target: { type: String, default: '' },
  targetLeftBv: { type: Number, default: 0 },
  targetRightBv: { type: Number, default: 0 },
  iconName: { type: String, default: 'Award' }
}, { timestamps: true });

const LedgerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

const LedgerEntrySchema = new mongoose.Schema({
  ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const News = mongoose.models.News || mongoose.model('News', NewsSchema);
const Update = mongoose.models.Update || mongoose.model('Update', UpdateSchema);
const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema);
const Rank = mongoose.models.Rank || mongoose.model('Rank', RankSchema);
const Ledger = mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);
const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);

async function runSeed() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully.');

    // 3. Clear database collections completely (including ledgers)
    console.log('Clearing ALL existing collections (Users, Events, News, Updates, Documents, Media, Ranks, Ledgers, LedgerEntries)...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      News.deleteMany({}),
      Update.deleteMany({}),
      Document.deleteMany({}),
      Media.deleteMany({}),
      Rank.deleteMany({}),
      Ledger.deleteMany({}),
      LedgerEntry.deleteMany({})
    ]);

    // Compute relative dates
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayLocal = new Date(localTimeStr);
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(todayLocal.getDate() + 1);

    const birthToday = new Date(Date.UTC(1990, todayLocal.getMonth(), todayLocal.getDate()));
    const birthTomorrow = new Date(Date.UTC(1993, tomorrowLocal.getMonth(), tomorrowLocal.getDate()));

    // 4. Seed users
    console.log('Seeding users...');
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
      personalNotes: 'Network founder leading international operations.',
      password: hashPassword('password123')
    });
    await aravind.save();

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
      personalNotes: 'Top leader of Support Leg A.',
      password: hashPassword('password123')
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
      personalNotes: 'Key leader of Support Leg B.',
      password: hashPassword('password123')
    });
    await megha.save();

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
      personalNotes: 'Rising star in Priya\'s organization.',
      password: hashPassword('password123')
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
      personalNotes: 'Expanding network aggressively.',
      password: hashPassword('password123')
    });
    await rohit.save();

    // 5. Seed events
    console.log('Seeding events...');
    const event1 = new Event({
      name: 'Diamond Summit — Goa',
      description: 'Exclusive retreat and policy sync for Diamond and above rank leaders.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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

    // 6. Seed news
    console.log('Seeding news...');
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

    // 7. Seed updates
    console.log('Seeding updates...');
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

    // 8. Seed documents
    console.log('Seeding documents...');
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

    // 9. Seed media
    console.log('Seeding media...');
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

    // 10. Seed ranks
    console.log('Seeding ranks...');
    const ranks = [
      { name: 'Associate', reward: 'None', target: 'Default onboarding level', targetLeftBv: 0, targetRightBv: 0, iconName: 'Star' },
      { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', targetLeftBv: 5000, targetRightBv: 5000, iconName: 'Award' },
      { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', targetLeftBv: 25000, targetRightBv: 25000, iconName: 'Compass' },
      { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', targetLeftBv: 50000, targetRightBv: 50000, iconName: 'MapPin' },
      { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', targetLeftBv: 80000, targetRightBv: 80000, iconName: 'Trophy' },
      { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', targetLeftBv: 150000, targetRightBv: 150000, iconName: 'Car' }
    ];
    await Rank.insertMany(ranks);

    console.log('Database cleared and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
