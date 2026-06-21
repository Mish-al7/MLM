import mongoose from 'mongoose';

const UpdateSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ['Notice', 'Reminder', 'Policy', 'Training'], default: 'Notice' },
  author: { type: String, default: 'Super Admin' }
}, {
  timestamps: true
});

export default mongoose.models.Update || mongoose.model('Update', UpdateSchema);
