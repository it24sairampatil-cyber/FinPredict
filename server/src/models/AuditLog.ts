// FinPredict.js - MongoDB Immutable Legal Compliance Audit Log Schema (FINRA Rule 4511 & SOX 404)
import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  role: string;
  reportName: string;
  accessType: 'CONSOLIDATED_VIEW' | 'EXPORT_CERTIFIED' | 'MASKED_AUDIT' | 'PII_TOGGLE';
  complianceCheck: 'SOX-404 PASSED' | 'GDPR-Art25 VERIFIED' | 'FINRA-4511 LOGGED';
  networkEgressBlocked: boolean;
  tamperChecksum: string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String, required: true },
    role: { type: String, required: true },
    reportName: { type: String, required: true },
    accessType: {
      type: String,
      required: true,
      enum: ['CONSOLIDATED_VIEW', 'EXPORT_CERTIFIED', 'MASKED_AUDIT', 'PII_TOGGLE']
    },
    complianceCheck: {
      type: String,
      required: true,
      enum: ['SOX-404 PASSED', 'GDPR-Art25 VERIFIED', 'FINRA-4511 LOGGED']
    },
    networkEgressBlocked: { type: Boolean, default: true },
    tamperChecksum: { type: String, required: true },
    ipAddress: { type: String }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false } // Immutable: no updates allowed
  }
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
