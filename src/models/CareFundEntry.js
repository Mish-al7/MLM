import mongoose from 'mongoose';

const CareFundEntrySchema = new mongoose.Schema({
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareFundCause', required: true },
  userId: { type: String, required: true },       // contributor's userId
  userName: { type: String, required: true },     // denormalized for fast display
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, default: '' },
  screenshotUrl: { type: String, default: '' },   // S3 URL of payment screenshot
  month: { type: String, default: '' },           // e.g. "2025-06" for monthly tracking
}, {
  timestamps: true
});

export default mongoose.models.CareFundEntry || mongoose.model('CareFundEntry', CareFundEntrySchema);
