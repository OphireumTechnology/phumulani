/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Client Session Token Store & Authenticated Fetch Helper
 * Stores server-issued bearer tokens (never hardcoding privileged credentials in client code).
 */

declare const __PHUMULANI_VITE_BUILD__: boolean | undefined;

export interface SessionPersonaDescriptor {
  id: string;
  email?: string;
  name?: string;
  role: string;
  department?: string;
}

class SessionTokenStore {
  private activeToken: string | null = null;
  private activeRole: string = 'visitor';
  private pendingSync: Promise<void> | null = null;

  public getAuthToken(): string | null {
    return this.activeToken;
  }

  public getActiveRole(): string {
    return this.activeRole;
  }

  public setAuthToken(token: string | null, role?: string): void {
    this.activeToken = token;
    if (role) {
      this.activeRole = role;
    }
  }

  public clearSession(): void {
    this.activeToken = null;
    this.activeRole = 'visitor';
  }

  /**
   * Synchronizes a staged-development server session for the selected UI persona.
   * Fails closed (returns false and leaves token empty) if server is running in PRODUCTION_ONLY / PILOT mode.
   */
  public syncStagedPersonaSession(user: SessionPersonaDescriptor): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      return Promise.resolve();
    }

    const roleLower = String(user.role || '').toLowerCase();
    this.activeRole = user.role;

    const isProdBundle =
      (typeof __PHUMULANI_VITE_BUILD__ !== 'undefined' && __PHUMULANI_VITE_BUILD__ === true) ||
      Boolean(
        typeof import.meta !== 'undefined' &&
          import.meta.env &&
          import.meta.env.PROD === true
      );
    if (isProdBundle || roleLower === 'visitor' || roleLower === 'public_visitor') {
      this.activeToken = null;
      this.pendingSync = Promise.resolve();
      return this.pendingSync;
    }

    this.pendingSync = (async () => {
      try {
        const res = await fetch('/api/auth/staged-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          }),
        });
        if (!res.ok) {
          this.activeToken = null;
          return;
        }
        const data = await res.json();
        if (data?.success && typeof data.token === 'string') {
          this.activeToken = data.token;
          this.activeRole = data.session?.role || user.role;
        } else {
          this.activeToken = null;
        }
      } catch {
        // Offline / server unavailable
      }
    })();

    return this.pendingSync;
  }

  public async waitForPendingSync(): Promise<void> {
    if (this.pendingSync) {
      await this.pendingSync;
    }
  }
}

export const sessionTokenStore = new SessionTokenStore();

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  await sessionTokenStore.waitForPendingSync();
  const headers = new Headers(init.headers || {});
  const token = sessionTokenStore.getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
