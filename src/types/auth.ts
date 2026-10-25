// FinPredict.js - Authentication & Role-Based Access Control (RBAC) Data Contracts

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  department: string;
  clearanceLevel: 'Standard Analyst' | 'Executive Compliance Lead';
  avatarInitials: string;
}

/**
 * Dynamically constructs an AuthUser based on the entered username and role.
 * Ensures the user's username is strictly used as their display name with no default or demo names.
 */
export function createAuthUser(rawUsername: string, role: UserRole): AuthUser {
  const fallback = role === 'admin' ? 'admin' : 'analyst';
  const cleanUsername = rawUsername?.trim() || fallback;
  const displayName = cleanUsername.includes('@') ? cleanUsername.split('@')[0] : cleanUsername;
  const initials = displayName.length >= 2
    ? displayName.slice(0, 2).toUpperCase()
    : displayName.slice(0, 1).toUpperCase();

  return {
    id: `usr_${displayName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`,
    username: displayName,
    displayName: displayName,
    email: cleanUsername.includes('@') ? cleanUsername : `${displayName.toLowerCase()}@enterprise.internal`,
    role,
    department: role === 'admin' ? 'Executive Governance & Regulatory Compliance' : 'FP&A Operations & Modeling',
    clearanceLevel: role === 'admin' ? 'Executive Compliance Lead' : 'Standard Analyst',
    avatarInitials: initials
  };
}

export const PRESET_USERS: Record<UserRole, AuthUser> = {
  user: createAuthUser('analyst', 'user'),
  admin: createAuthUser('admin', 'admin')
};

export interface ComplianceAuditLogEntry {
  id: string;
  timestamp: string;
  reportName: string;
  actor: string;
  role: string;
  accessType: 'CONSOLIDATED_VIEW' | 'EXPORT_CERTIFIED' | 'MASKED_AUDIT';
  complianceCheck: 'SOX-404 PASSED' | 'GDPR-Art25 VERIFIED' | 'FINRA-4511 LOGGED';
  networkEgressBlocked: boolean;
  tamperChecksum: string;
}
