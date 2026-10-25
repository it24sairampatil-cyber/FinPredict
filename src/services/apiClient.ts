// FinPredict.js - Client-Side API Connector for MongoDB Backend
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export class ApiClient {
  private static getToken(): string | null {
    try {
      return localStorage.getItem('finpredict_jwt');
    } catch {
      return null;
    }
  }

  public static setToken(token: string): void {
    try {
      localStorage.setItem('finpredict_jwt', token);
    } catch {}
  }

  public static removeToken(): void {
    try {
      localStorage.removeItem('finpredict_jwt');
    } catch {}
  }

  /**
   * Check if MongoDB backend is online
   */
  public static async checkHealth(): Promise<{ online: boolean; system?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, system: data.system };
    } catch {
      return { online: false };
    }
  }

  /**
   * Generic authenticated request wrapper
   */
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {}
      throw new Error(errorJson?.error || `API Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  // --- Auth APIs ---
  public static async login(credentials: { username: string; password: string }) {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public static async register(data: any) {
    const res = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public static async getProfile() {
    return this.request<{ user: any }>('/auth/me');
  }

  // --- Transaction APIs ---
  public static async syncTransactions(transactions: any[]) {
    return this.request<{ message: string; count: number }>('/transactions/bulk', {
      method: 'POST',
      body: JSON.stringify({ transactions })
    });
  }

  public static async getTransactions(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ transactions: any[]; pagination: any }>(`/transactions?${query}`);
  }

  // --- Forecast & Simplex APIs ---
  public static async saveForecast(forecastData: any) {
    return this.request<{ message: string; forecastId: string }>('/forecast', {
      method: 'POST',
      body: JSON.stringify(forecastData)
    });
  }

  public static async saveScenario(scenarioData: any) {
    return this.request<{ message: string; scenario: any }>('/simplex/scenario', {
      method: 'POST',
      body: JSON.stringify(scenarioData)
    });
  }

  // --- Reports & Compliance APIs ---
  public static async getConsolidatedReports() {
    return this.request<any>('/reports/consolidated');
  }

  public static async getAuditLogs() {
    return this.request<{ logs: any[] }>('/reports/audit-logs');
  }

  public static async appendAuditLog(entry: any) {
    return this.request<{ message: string; logId: string }>('/reports/audit-log', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  }
}
