import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  albumName: { type: String, default: 'General' },
  uploadedBy: { type: String, default: 'Super Admin' }
}, {
  timestamps: true
});

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
