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
    console.log('Seeding initial production Super Admin accounts...');
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

    // 5. Seed default Ranks structure
    console.log('Seeding default rank configurations...');
    const ranks = [
      { name: 'Associate', reward: 'None', target: 'Default onboarding level', targetLeftBv: 0, targetRightBv: 0, iconName: 'Star' },
      { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', targetLeftBv: 5000, targetRightBv: 5000, iconName: 'Award' },
      { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', targetLeftBv: 25000, targetRightBv: 25000, iconName: 'Compass' },
      { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', targetLeftBv: 50000, targetRightBv: 50000, iconName: 'MapPin' },
      { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', targetLeftBv: 80000, targetRightBv: 80000, iconName: 'Trophy' },
      { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', targetLeftBv: 150000, targetRightBv: 150000, iconName: 'Car' }
    ];
    await Rank.insertMany(ranks);

    // 6. Seed default Dashboard Banners
    console.log('Seeding default banner structures...');
    const defaultBanners = [
      { id: 1, imageUrl: 'https://images.unsplash.com/photo-1542744173-8e0856d116db?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 1' },
      { id: 2, imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop', altText: 'Banner Slot 2' }
    ];
    const DashboardBanner = mongoose.models.DashboardBanner || mongoose.model('DashboardBanner', new mongoose.Schema({ banners: Array }, { strict: false }));
    await DashboardBanner.create({ banners: defaultBanners });

    console.log('Database successfully cleaned and set up for production!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
