// FinPredict.js - MongoDB User Schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  department: { type: String, default: 'FP&A Operations & Modeling' },
  clearanceLevel: { type: String, default: 'Standard Analyst' },
  avatarInitials: { type: String, default: 'AU' },
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
