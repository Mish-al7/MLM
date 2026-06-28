import mongoose from 'mongoose';

const BannerItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  altText: { type: String, default: '' }
}, { _id: false });

const DashboardBannerSchema = new mongoose.Schema({
  banners: { type: [BannerItemSchema], default: [] }
}, {
  timestamps: true
});

export default mongoose.models.DashboardBanner || mongoose.model('DashboardBanner', DashboardBannerSchema);
