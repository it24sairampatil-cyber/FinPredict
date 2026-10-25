// FinPredict.js - MongoDB Transaction Schema
import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // Positive = Outflow, Negative = Inflow
  category: string;
  rawAmount: number;
  balance?: number;
  isAnomaly: boolean;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Income', 'Other'],
      index: true
    },
    rawAmount: { type: Number, required: true },
    balance: { type: Number },
    isAnomaly: { type: Boolean, default: false, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for user range queries
TransactionSchema.index({ userId: 1, date: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
