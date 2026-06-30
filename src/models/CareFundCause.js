import mongoose from 'mongoose';

const CareFundCauseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isDefault: { type: Boolean, default: false }, // true for the standing monthly contribution
  isOpen: { type: Boolean, default: true },      // admin can close when resolved
  targetAmount: { type: Number, default: 0 },    // optional fundraising goal
  createdBy: { type: String, required: true },   // userId of admin who created it
}, {
  timestamps: true
});

export default mongoose.models.CareFundCause || mongoose.model('CareFundCause', CareFundCauseSchema);
