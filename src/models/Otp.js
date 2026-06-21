import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete document after 10 minutes to save space
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
