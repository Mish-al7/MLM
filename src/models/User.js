import mongoose from 'mongoose';

const BvHistorySchema = new mongoose.Schema({
  oldLeft: { type: Number, default: 0 },
  newLeft: { type: Number, default: 0 },
  oldRight: { type: Number, default: 0 },
  newRight: { type: Number, default: 0 },
  updatedBy: { type: String, required: true }, // userId of updater
  timestamp: { type: Date, default: Date.now }
});

const RankHistorySchema = new mongoose.Schema({
  oldRank: { type: String, default: 'Associate' },
  newRank: { type: String, required: true },
  reward: { type: String, default: '' },
  achievementDate: { type: Date, default: Date.now },
  updatedBy: { type: String, required: true }, // userId of updater
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true }, // e.g. ALZ-0001
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, default: '' },
  phone2: { type: String, default: '' },
  role: { type: String, enum: ['super_admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  joiningDate: { type: Date, default: Date.now },
  allianzaId: { type: String, default: '' }, // Custom ID from PRD
  managerId: { type: String, default: null }, // Reports directly to this userId. Root (CEO) is null.
  avatar: { type: String, default: '' },

  // Business Value Metrics (Manual entries, self-updated by members or updated by admin)
  leftBV: { type: Number, default: 0 },
  rightBV: { type: Number, default: 0 },

  // Ranks & Rewards (Admin managed)
  rank: { type: String, default: 'Associate' },
  reward: { type: String, default: '' },
  upcomingRank: { type: String, default: '' },
  upcomingReward: { type: String, default: '' },
  achievementDate: { type: Date },
  personalNotes: { type: String, default: '' },
  password: { type: String }, // Hashed password

  // Audit Trails
  bvHistory: [BvHistorySchema],
  rankHistory: [RankHistorySchema]
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
