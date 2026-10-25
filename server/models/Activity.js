// FinPredict.js - MongoDB User Activity & Audit Trail Schema
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  role: { type: String, required: true },
  action: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['AUTH', 'FP&A_MODELING', 'SIMPLEX_OPTIMIZATION', 'NEURAL_TRAIN', 'AUDIT_EXPORT', 'SYSTEM'],
    default: 'SYSTEM'
  },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
