import mongoose from 'mongoose';

const RankSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // e.g. "Silver"
  reward: { type: String, default: 'None' },
  target: { type: String, default: '' },
  targetLeftBv: { type: Number, default: 0 },
  targetRightBv: { type: Number, default: 0 },
  iconName: { type: String, default: 'Award' } // Star, Award, Compass, MapPin, Trophy, Car, Shield
}, {
  timestamps: true
});

export default mongoose.models.Rank || mongoose.model('Rank', RankSchema);
