import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // The user who owns this ledger
  name: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);
