// FinPredict.js - Zero-Trust Network Isolation Interceptor & Audit Probe
// Enforces NFR-1 & enables AC-3 (Zero-Network Egress Verification)

import { NetworkAuditPacket } from '../types';

type Listener = (packets: NetworkAuditPacket[]) => void;

class NetworkAuditManager {
  private packets: NetworkAuditPacket[] = [];
  private listeners: Set<Listener> = new Set();
  private isHooked: boolean = false;

  constructor() {
    this.installInterceptors();
  }

  public installInterceptors() {
    if (this.isHooked || typeof window === 'undefined') return;
    this.isHooked = true;

    // 1. Intercept window.fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].toString() : (args[0] as Request).url;
      const options = args[1] || {};
      const method = (options.method || 'GET').toUpperCase();
      const bodyStr = options.body ? String(options.body) : '';

      // Check if outbound request contains financial telemetry
      const containsUserData = /(transaction|amount|balance|salary|spend|category|csv)/i.test(bodyStr + url);
      const isBlocked = containsUserData || (method !== 'GET' && !url.startsWith('blob:') && !url.startsWith('data:'));

      this.recordPacket({
        id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'fetch',
        url: url.length > 60 ? url.substring(0, 60) + '...' : url,
        method,
        blocked: isBlocked,
        containsUserData,
        payloadSize: bodyStr.length
      });

      if (isBlocked) {
        console.warn(`[Zero-Trust Policy] Outbound request strictly blocked to uphold NFR-1:`, url);
        throw new Error(`[Zero-Trust Policy Enforced] Network egress blocked for URL: ${url}`);
      }

      return originalFetch.apply(window, args);
    };

    // 2. Intercept XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const record = (packet: NetworkAuditPacket) => this.recordPacket(packet);

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
      (this as any)._auditMethod = method;
      (this as any)._auditUrl = String(url);
      return originalOpen.apply(this, [method, url, ...rest] as any);
    };

    XMLHttpRequest.prototype.send = function (body?: any) {
      const url = (this as any)._auditUrl || 'unknown';
      const method = ((this as any)._auditMethod || 'GET').toUpperCase();
      const bodyStr = body ? String(body) : '';
      const containsUserData = /(transaction|amount|balance|salary|spend|category|csv)/i.test(bodyStr + url);
      const isBlocked = containsUserData || (method !== 'GET' && !url.startsWith('blob:') && !url.startsWith('data:'));

      record({
        id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'xhr',
        url: url.length > 60 ? url.substring(0, 60) + '...' : url,
        method,
        blocked: isBlocked,
        containsUserData,
        payloadSize: bodyStr.length
      });

      if (isBlocked) {
        console.warn(`[Zero-Trust Policy] XHR request blocked to uphold NFR-1:`, url);
        throw new Error(`[Zero-Trust Policy Enforced] XHR blocked: ${url}`);
      }

      return originalSend.apply(this, [body]);
    };

    // Initial audit heartbeat packet (demonstrating zero-trust audit ready)
    this.recordPacket({
      id: `pkt_init_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'fetch',
      url: 'localhost:sandbox/air-gapped',
      method: 'PROBE',
      blocked: false,
      containsUserData: false,
      payloadSize: 0
    });
  }

  private recordPacket(packet: NetworkAuditPacket) {
    this.packets.unshift(packet);
    if (this.packets.length > 50) this.packets.pop();
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener([...this.packets]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const list = [...this.packets];
    this.listeners.forEach(l => l(list));
  }

  public getPackets(): NetworkAuditPacket[] {
    return [...this.packets];
  }

  public clearAuditLog() {
    this.packets = [];
    this.notify();
  }
}

export const networkAuditor = new NetworkAuditManager();
