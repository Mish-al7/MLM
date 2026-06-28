import mongoose from 'mongoose';

const RkcMemberSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  title:       { type: String, default: 'Royal Kings Club Member', trim: true },
  portraitUrl: { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { _id: true });

const RoyalKingsClubSchema = new mongoose.Schema({
  bannerUrl: { type: String, default: '' },
  members:   { type: [RkcMemberSchema], default: [] },
}, {
  timestamps: true,
});

export default mongoose.models.RoyalKingsClub ||
  mongoose.model('RoyalKingsClub', RoyalKingsClubSchema);
