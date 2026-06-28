import mongoose from 'mongoose';

const CalendarNoteSchema = new mongoose.Schema({
  authorId: { type: String, required: true },       // references User.userId
  authorName: { type: String, required: true },     // denormalized for display
  authorRole: { type: String, required: true },     // 'super_admin' | 'member'
  date: { type: String, required: true },           // 'YYYY-MM-DD' format
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['personal', 'work', 'meeting', 'urgent'],
    default: 'personal'
  },
  isCompleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index for fast lookups by date + authorId
CalendarNoteSchema.index({ date: 1, authorId: 1 });

export default mongoose.models.CalendarNote || mongoose.model('CalendarNote', CalendarNoteSchema);
