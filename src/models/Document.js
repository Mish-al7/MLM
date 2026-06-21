import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'doc', 'xls', 'ppt', 'other'], default: 'pdf' },
  fileSize: { type: String, default: '' },
  uploadedBy: { type: String, default: 'Super Admin' }
}, {
  timestamps: true
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
