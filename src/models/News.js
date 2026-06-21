import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // Rich text / HTML / Plain text
  image: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  author: { type: String, default: 'Super Admin' }
}, {
  timestamps: true
});

export default mongoose.models.News || mongoose.model('News', NewsSchema);
