// FinPredict.js - MongoDB User Schema with Role-Based Access Control
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'user' | 'admin';
  department: string;
  clearanceLevel: 'Standard Analyst' | 'Executive Compliance Lead';
  avatarInitials: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    department: { type: String, default: 'FP&A Operations' },
    clearanceLevel: {
      type: String,
      enum: ['Standard Analyst', 'Executive Compliance Lead'],
      default: 'Standard Analyst'
    },
    avatarInitials: { type: String, default: 'AU' }
  },
  { timestamps: true }
);

// Method to verify password against bcrypt hash
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
