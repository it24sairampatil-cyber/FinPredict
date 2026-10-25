// FinPredict.js - MongoDB Client API Service
import type { AuthUser, UserRole } from '../types/auth';
import { createAuthUser } from '../types/auth';

export interface UserActivityPayload {
  username: string;
  role: string;
  action: string;
  category?: 'AUTH' | 'FP&A_MODELING' | 'SIMPLEX_OPTIMIZATION' | 'NEURAL_TRAIN' | 'AUDIT_EXPORT' | 'SYSTEM';
  details?: Record<string, any>;
}

/**
 * Authenticate or register a user in MongoDB.
 * Falls back safely to client-side createAuthUser if backend/MongoDB is unreachable.
 */
export async function apiLogin(username: string, role: UserRole): Promise<AuthUser> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user) return data.user;
    }
  } catch (err) {
    console.warn('API login request fell back to local generation:', err);
  }
  return createAuthUser(username, role);
}

/**
 * Persist user activity to MongoDB audit logs (non-blocking).
 */
export async function apiLogActivity(activity: UserActivityPayload): Promise<void> {
  try {
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
  } catch (err) {
    console.debug('Activity logging offline/deferred:', err);
  }
}

/**
 * Fetch latest activities from MongoDB.
 */
export async function apiGetActivities(username?: string, category?: string) {
  try {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    if (category) params.append('category', category);
    const res = await fetch(`/api/activities?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.activities || [];
    }
  } catch (err) {
    console.warn('Could not fetch MongoDB activities:', err);
  }
  return [];
}

/**
 * Fetch all registered users from MongoDB.
 */
export async function apiGetUsers() {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (err) {
    console.warn('Could not fetch MongoDB users:', err);
  }
  return [];
}
