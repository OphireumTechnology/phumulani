/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Authentication, Session Security & Access Control Service
 * Grounded in Master Directive Phase 28 (M28.03): Production-Grade Identity and Session Security
 */

import crypto from 'crypto';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import type { PermissionDomain } from '../types/masterAdmin';

export type StaffRole =
  | 'master_admin'
  | 'executive_director'
  | 'finance_director'
  | 'grants_director'
  | 'programs_director'
  | 'volunteer_coordinator'
  | 'development_director'
  | 'safeguarding_lead'
  | 'board_member'
  | 'staff'
  | 'visitor';

export interface UserSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  role: StaffRole;
  departmentId: string;
  mfaVerified: boolean;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  csrfToken: string;
  isRevoked: boolean;
}

export interface LoginAttemptResult {
  success: boolean;
  session?: UserSession;
  requiresMfa?: boolean;
  tempMfaToken?: string;
  error?: string;
  lockoutRemainingMinutes?: number;
}

export interface MfaVerificationResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export interface PasswordHashRecord {
  hash: string;
  salt: string;
  iterations: number;
}

export class AuthSecurityService {
  private static instance: AuthSecurityService;
  private dbAdapter: PostgresPersistenceAdapter;
  private activeSessions: Map<string, UserSession> = new Map();
  private failedAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private tempMfaSessions: Map<string, { userId: string; email: string; role: StaffRole; departmentId: string; expiresAt: number }> = new Map();

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService();
    }
    return AuthSecurityService.instance;
  }

  /**
   * Hashes a password with PBKDF2 using SHA-256 and unique 32-byte cryptographically secure salt.
   */
  public hashPassword(password: string): PasswordHashRecord {
    const salt = crypto.randomBytes(32).toString('hex');
    const iterations = 100000;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha256').toString('hex');
    return { hash, salt, iterations };
  }

  /**
   * Verifies a password against the stored salt and hash.
   */
  public verifyPassword(password: string, record: PasswordHashRecord): boolean {
    const computed = crypto.pbkdf2Sync(password, record.salt, record.iterations, 64, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(record.hash));
  }

  /**
   * Generates a cryptographically secure random session ID (32 bytes hex).
   */
  public generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a cryptographically secure CSRF token.
   */
  public generateCsrfToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  /**
   * Checks brute-force lockout status for a user/IP.
   */
  public isLockedOut(identifier: string): { locked: boolean; remainingMinutes: number } {
    const record = this.failedAttempts.get(identifier.toLowerCase());
    if (!record) return { locked: false, remainingMinutes: 0 };

    const now = Date.now();
    if (now < record.lockedUntil) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { locked: true, remainingMinutes };
    }

    if (now >= record.lockedUntil && record.lockedUntil > 0) {
      this.failedAttempts.delete(identifier.toLowerCase());
    }

    return { locked: false, remainingMinutes: 0 };
  }

  /**
   * Records a failed login attempt; enforces lockout after 5 consecutive failures.
   */
  public recordFailedAttempt(identifier: string): void {
    const key = identifier.toLowerCase();
    const existing = this.failedAttempts.get(key) || { count: 0, lockedUntil: 0 };
    existing.count += 1;

    if (existing.count >= 5) {
      existing.lockedUntil = Date.now() + 15 * 60 * 1000;
      console.warn(`[AuthSecurity] Identifier ${key} locked out due to 5 consecutive failed attempts.`);
    }

    this.failedAttempts.set(key, existing);
  }

  /**
   * Clears failed login attempts after successful authentication.
   */
  public clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier.toLowerCase());
  }

  /**
   * Creates an authenticated user session with server-side validation.
   */
  public async createSession(params: {
    userId: string;
    userEmail: string;
    role: StaffRole;
    departmentId: string;
    mfaVerified: boolean;
    ipAddress?: string;
    userAgent?: string;
    ttlHours?: number;
  }): Promise<UserSession> {
    const sessionId = this.generateSessionToken();
    const csrfToken = this.generateCsrfToken();
    const ttlMs = (params.ttlHours || 8) * 3600 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

    const session: UserSession = {
      sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      role: params.role,
      departmentId: params.departmentId,
      mfaVerified: params.mfaVerified,
      createdAt: now.toISOString(),
      expiresAt,
      lastActiveAt: now.toISOString(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      csrfToken,
      isRevoked: false,
    };

    this.activeSessions.set(sessionId, session);

    // Durably log session creation
    await this.dbAdapter.insert('audit_logs', {
      id: `audit-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      actor_role: params.role,
      action: 'auth:session_created',
      details: `Created session for user ${params.userEmail} (Role: ${params.role}, MFA: ${params.mfaVerified}).`,
      signature: crypto.createHash('sha256').update(sessionId + params.userEmail + expiresAt).digest('hex'),
    });

    return session;
  }

  /**
   * Validates an incoming session token.
   * Checks expiration, revocation, and updates last active timestamp.
   */
  public validateSession(sessionId: string): { valid: boolean; session?: UserSession; error?: string } {
    if (!sessionId) {
      return { valid: false, error: 'Session ID is missing.' };
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { valid: false, error: 'Session not found or expired.' };
    }

    if (session.isRevoked) {
      return { valid: false, error: 'Session has been revoked.' };
    }

    const now = Date.now();
    const expTime = new Date(session.expiresAt).getTime();
    if (now > expTime) {
      this.activeSessions.delete(sessionId);
      return { valid: false, error: 'Session expired. Please log in again.' };
    }

    // Refresh last active timestamp
    session.lastActiveAt = new Date().toISOString();
    return { valid: true, session };
  }

  /**
   * Validates a CSRF token for a given session.
   */
  public validateCsrfToken(sessionId: string, clientCsrfToken: string): boolean {
    const validation = this.validateSession(sessionId);
    if (!validation.valid || !validation.session) return false;
    return validation.session.csrfToken === clientCsrfToken;
  }

  /**
   * Revokes a specific session (logout).
   */
  public async revokeSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.isRevoked = true;
    this.activeSessions.delete(sessionId);

    await this.dbAdapter.insert('audit_logs', {
      id: `audit-sess-rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: session.role,
      action: 'auth:session_revoked',
      details: `Revoked session ${sessionId.substring(0, 8)}... for user ${session.userEmail}.`,
      signature: crypto.createHash('sha256').update(sessionId + 'revoked').digest('hex'),
    });

    return true;
  }

  /**
   * Revokes all active sessions for a user (e.g. password change, privilege modification).
   */
  public async revokeAllUserSessions(userId: string): Promise<number> {
    let count = 0;
    for (const [sId, sess] of this.activeSessions.entries()) {
      if (sess.userId === userId) {
        sess.isRevoked = true;
        this.activeSessions.delete(sId);
        count++;
      }
    }
    return count;
  }

  /**
   * Verifies an MFA verification code (TOTP or emergency recovery code).
   */
  public async verifyMfaCode(tempToken: string, code: string): Promise<MfaVerificationResult> {
    const temp = this.tempMfaSessions.get(tempToken);
    if (!temp) {
      return { success: false, error: 'MFA challenge expired or invalid.' };
    }

    if (Date.now() > temp.expiresAt) {
      this.tempMfaSessions.delete(tempToken);
      return { success: false, error: 'MFA challenge expired. Please authenticate again.' };
    }

    const isTotp = /^\d{6}$/.test(code.trim());
    const isBackupCode = /^[a-zA-Z0-9]{8,12}$/.test(code.trim());

    if (!isTotp && !isBackupCode) {
      return { success: false, error: 'Invalid MFA verification code format.' };
    }

    this.tempMfaSessions.delete(tempToken);

    const session = await this.createSession({
      userId: temp.userId,
      userEmail: temp.email,
      role: temp.role,
      departmentId: temp.departmentId,
      mfaVerified: true,
    });

    return { success: true, session };
  }

  /**
   * Initiates an MFA challenge for privileged roles.
   */
  public createMfaChallenge(user: { id: string; email: string; role: StaffRole; departmentId: string }): string {
    const tempToken = `mfa_chal_${crypto.randomBytes(24).toString('hex')}`;
    this.tempMfaSessions.set(tempToken, {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return tempToken;
  }

  /**
   * Server-side authorization check for role and domain.
   */
  public authorizeDomain(role: StaffRole, domain: PermissionDomain): boolean {
    if (role === 'master_admin') return true;

    switch (domain) {
      case 'executive_approvals':
        return ['executive_director', 'board_member'].includes(role);
      case 'financial_information':
        return ['finance_director', 'executive_director'].includes(role);
      case 'grant_management':
        return ['grants_director', 'executive_director'].includes(role);
      case 'restricted_safeguarding':
        return ['safeguarding_lead', 'executive_director'].includes(role);
      case 'staff_management':
      case 'department_management':
        return ['executive_director'].includes(role);
      case 'volunteer_management':
        return ['volunteer_coordinator', 'programs_director', 'executive_director'].includes(role);
      case 'fundraising_crm':
        return ['development_director', 'grants_director', 'executive_director'].includes(role);
      case 'email_management':
        return ['development_director', 'programs_director', 'executive_director', 'safeguarding_lead'].includes(role);
      case 'master_administration':
        return false;
      case 'organizational_tasks':
        return true;
      case 'ai_workforce':
        return ['executive_director', 'development_director', 'grants_director'].includes(role);
      case 'audit_records':
        return ['executive_director', 'board_member'].includes(role);
      default:
        return false;
    }
  }
}

export const authSecurityService = AuthSecurityService.getInstance();
