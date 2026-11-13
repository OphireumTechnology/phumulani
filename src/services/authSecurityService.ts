/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Authentication, Session Security & Access Control Service
 * Grounded in Master Directive Phase 28 (M28.03): Production-Grade Identity and Session Security
 */

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import { EnvironmentService } from './environmentService';
import type { PermissionDomain } from '../types/masterAdmin';
import type { CanonicalRoleFamily, UserRole } from '../types';

export type StaffRole =
  | 'master_admin'
  | 'executive_director'
  | 'EXECUTIVE_DIRECTOR'
  | 'finance_director'
  | 'grants_director'
  | 'programs_director'
  | 'volunteer_coordinator'
  | 'development_director'
  | 'safeguarding_lead'
  | 'safeguarding_officer'
  | 'SAFEGUARDING_OFFICER'
  | 'board_member'
  | 'staff'
  | 'STAFF'
  | 'visitor'
  | 'volunteer'
  | 'VOLUNTEER'
  | 'constituent'
  | 'CASEWORKER'
  | 'caseworker'
  | CanonicalRoleFamily
  | UserRole;

export interface UserSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  email?: string;
  name?: string;
  role: StaffRole;
  departmentId?: string;
  department?: string;
  mfaVerified?: boolean;
  createdAt: string;
  expiresAt: string;
  lastActiveAt?: string;
  ipAddress?: string;
  userAgent?: string;
  csrfToken?: string;
  token?: string;
  isRevoked?: boolean;
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

export interface PasswordResetRecord {
  tokenHash: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

const isNodeRuntime =
  typeof window === 'undefined' && typeof process !== 'undefined' && Boolean(process.versions?.node);

export class AuthSecurityService {
  private static instance: AuthSecurityService;
  private dbAdapter: PostgresPersistenceAdapter;
  private activeSessions: Map<string, UserSession> = new Map();
  private revokedSessionIds: Set<string> = new Set();
  private failedAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private passwordResetTokens: Map<string, PasswordResetRecord> = new Map();
  private tempMfaSessions: Map<string, { userId: string; email: string; role: StaffRole; departmentId: string; expectedCode?: string; expiresAt: number }> = new Map();
  private durableStorePath: string = '';

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
    if (isNodeRuntime) {
      const runtimeDir = process.env?.PHUMULANI_RUNTIME_DATA_DIR?.trim()
        ? path.resolve(process.env.PHUMULANI_RUNTIME_DATA_DIR.trim())
        : path.resolve(os.tmpdir(), 'phumulani-runtime-data');
      this.durableStorePath = path.resolve(runtimeDir, '.auth_sessions_store.json');
    }
    const isPilot = isNodeRuntime && process.env?.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT';
    const isProdEnv = isNodeRuntime && process.env?.NODE_ENV === 'production';
    if (!EnvironmentService.isProductionOnly() && !isPilot && !isProdEnv) {
      this.initializeBootstrapSessions();
    }
    if (isNodeRuntime) {
      this.loadDurableAuthState();
    }
  }

  private persistDurableAuthState(): void {
    if (!isNodeRuntime || !this.durableStorePath || typeof fs?.existsSync !== 'function') return;
    const tmpPath = `${this.durableStorePath}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
    try {
      const dir = path.dirname(this.durableStorePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      const payload = {
        savedAt: new Date().toISOString(),
        activeSessions: Array.from(this.activeSessions.entries()),
        revokedSessionIds: Array.from(this.revokedSessionIds.values()).slice(-1000),
        failedAttempts: Array.from(this.failedAttempts.entries()),
        passwordResetTokens: Array.from(this.passwordResetTokens.entries()),
      };
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
      fs.renameSync(tmpPath, this.durableStorePath);
    } catch (err: any) {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
      console.warn('[AuthSecurity] Failed to persist durable auth state:', err?.message || err);
    }
  }

  private loadDurableAuthState(): void {
    if (!isNodeRuntime || !this.durableStorePath || typeof fs?.existsSync !== 'function') return;
    try {
      if (!fs.existsSync(this.durableStorePath)) return;
      const raw = fs.readFileSync(this.durableStorePath, 'utf8');
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed.revokedSessionIds)) {
        for (const sid of parsed.revokedSessionIds) {
          this.revokedSessionIds.add(String(sid));
          this.activeSessions.delete(String(sid));
        }
      }
      if (Array.isArray(parsed.activeSessions)) {
        const now = Date.now();
        for (const [sid, sess] of parsed.activeSessions) {
          if (!sess || this.revokedSessionIds.has(sid) || sess.isRevoked) continue;
          if (new Date(sess.expiresAt).getTime() <= now) continue;
          this.activeSessions.set(sid, sess);
        }
      }
      if (Array.isArray(parsed.failedAttempts)) {
        const now = Date.now();
        for (const [key, rec] of parsed.failedAttempts) {
          if (rec && (rec.lockedUntil === 0 || rec.lockedUntil > now)) {
            this.failedAttempts.set(String(key), rec);
          }
        }
      }
      if (Array.isArray(parsed.passwordResetTokens)) {
        for (const [hash, rec] of parsed.passwordResetTokens) {
          if (rec) this.passwordResetTokens.set(String(hash), rec);
        }
      }
    } catch (err: any) {
      console.warn('[AuthSecurity] Failed to load durable auth state:', err?.message || err);
    }
  }

  public reloadDurableState(): void {
    this.activeSessions.clear();
    this.revokedSessionIds.clear();
    this.failedAttempts.clear();
    this.passwordResetTokens.clear();
    const isPilot = isNodeRuntime && process.env?.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT';
    const isProdEnv = isNodeRuntime && process.env?.NODE_ENV === 'production';
    if (!EnvironmentService.isProductionOnly() && !isPilot && !isProdEnv) {
      this.initializeBootstrapSessions();
    }
    if (isNodeRuntime) {
      this.loadDurableAuthState();
    }
  }

  public initializeBootstrapSessions(): { staffToken: string; execToken: string; adminToken: string } {
    const isPilot = isNodeRuntime && process.env?.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT';
    const isProdEnv = isNodeRuntime && process.env?.NODE_ENV === 'production';
    if (EnvironmentService.isProductionOnly() || isPilot || isProdEnv) {
      throw new Error('BOOTSTRAP_SESSIONS_DISABLED: Static bootstrap tokens cannot be initialized in production or pilot mode.');
    }
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const staffSession: UserSession = {
      sessionId: 'sess-phumulani-staff-verified',
      userId: 'usr-staff-01',
      userEmail: 'staff@phumulani.org',
      name: 'Phumulani Staff Officer',
      role: 'staff',
      departmentId: 'DEPT-PROGRAMS',
      mfaVerified: true,
      createdAt: new Date().toISOString(),
      expiresAt,
      lastActiveAt: new Date().toISOString(),
      isRevoked: false,
    };
    const execSession: UserSession = {
      sessionId: 'sess-phumulani-exec-verified',
      userId: 'usr-exec-01',
      userEmail: 'comfort.dondo@phumulani.org',
      name: 'Comfort Dondo',
      role: 'executive_director',
      departmentId: 'DEPT-EXEC',
      mfaVerified: true,
      createdAt: new Date().toISOString(),
      expiresAt,
      lastActiveAt: new Date().toISOString(),
      isRevoked: false,
    };
    const adminSession: UserSession = {
      sessionId: 'sess-phumulani-admin-verified',
      userId: 'usr-admin-01',
      userEmail: 'admin@phumulani.org',
      name: 'Platform Administrator',
      role: 'master_admin',
      departmentId: 'DEPT-GOV',
      mfaVerified: true,
      createdAt: new Date().toISOString(),
      expiresAt,
      lastActiveAt: new Date().toISOString(),
      isRevoked: false,
    };
    this.activeSessions.set(staffSession.sessionId, staffSession);
    this.activeSessions.set(execSession.sessionId, execSession);
    this.activeSessions.set(adminSession.sessionId, adminSession);
    return {
      staffToken: staffSession.sessionId,
      execToken: execSession.sessionId,
      adminToken: adminSession.sessionId,
    };
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
   * Verifies a password against the stored salt and hash using length-safe timingSafeEqual.
   */
  public verifyPassword(password: string, record: PasswordHashRecord): boolean {
    if (!password || !record?.hash || !record?.salt) return false;
    try {
      const computed = crypto.pbkdf2Sync(password, record.salt, record.iterations || 100000, 64, 'sha256').toString('hex');
      const a = Buffer.from(computed, 'utf8');
      const b = Buffer.from(String(record.hash), 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
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
      this.persistDurableAuthState();
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
    this.persistDurableAuthState();
  }

  /**
   * Clears failed login attempts after successful authentication.
   */
  public clearFailedAttempts(identifier: string): void {
    if (this.failedAttempts.delete(identifier.toLowerCase())) {
      this.persistDurableAuthState();
    }
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
    this.persistDurableAuthState();

    // Durably log session creation
    await this.dbAdapter.insert('audit_logs', {
      id: `audit-sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
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

    if (this.revokedSessionIds.has(sessionId)) {
      return { valid: false, error: 'Session has been revoked.' };
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
      this.persistDurableAuthState();
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
    if (!sessionId) return false;
    const session = this.activeSessions.get(sessionId);
    this.revokedSessionIds.add(sessionId);
    if (!session) {
      this.persistDurableAuthState();
      return false;
    }

    session.isRevoked = true;
    this.activeSessions.delete(sessionId);
    this.persistDurableAuthState();

    await this.dbAdapter.insert('audit_logs', {
      id: `audit-sess-rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
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
        this.revokedSessionIds.add(sId);
        this.activeSessions.delete(sId);
        count++;
      }
    }
    if (count > 0) {
      this.persistDurableAuthState();
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

    const trimmedCode = code.trim();
    const isTotp = /^\d{6}$/.test(trimmedCode);
    const isBackupCode = /^[a-zA-Z0-9]{8,12}$/.test(trimmedCode);

    if (!isTotp && !isBackupCode) {
      return { success: false, error: 'Invalid MFA verification code format.' };
    }

    const isStrictMfaMode =
      EnvironmentService.isProductionOnly() ||
      (typeof process !== 'undefined' &&
        (process.env?.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT' ||
          process.env?.NODE_ENV === 'production'));

    if (temp.expectedCode) {
      const a = Buffer.from(trimmedCode);
      const b = Buffer.from(temp.expectedCode);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return { success: false, error: 'MFA verification code does not match challenge.' };
      }
    } else if (isStrictMfaMode) {
      this.tempMfaSessions.delete(tempToken);
      return { success: false, error: 'MFA verification failed: server-issued TOTP challenge secret missing.' };
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
  public createMfaChallenge(user: {
    id: string;
    email: string;
    role: StaffRole;
    departmentId: string;
    expectedCode?: string;
  }): string {
    const tempToken = `mfa_chal_${crypto.randomBytes(24).toString('hex')}`;
    const isStrictMfaMode =
      EnvironmentService.isProductionOnly() ||
      (typeof process !== 'undefined' &&
        (process.env?.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT' ||
          process.env?.NODE_ENV === 'production'));
    const expectedCode = user.expectedCode || (isStrictMfaMode ? String(crypto.randomInt(100000, 999999)) : undefined);
    this.tempMfaSessions.set(tempToken, {
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      expectedCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return tempToken;
  }

  /**
   * Server-side authorization check for role and domain.
   */
  public authorizeDomain(role: StaffRole, domain: PermissionDomain): boolean {
    if (role === 'master_admin' || role === 'MASTER_ADMIN') return true;

    // Normalize canonical roles
    const normRole = role.toLowerCase();

    switch (domain) {
      case 'executive_approvals':
        return ['executive_director', 'executive', 'board_member'].includes(normRole);
      case 'financial_information':
        return ['finance_director', 'executive_director', 'executive', 'department_manager'].includes(normRole);
      case 'grant_management':
        return ['grants_director', 'executive_director', 'executive', 'department_manager'].includes(normRole);
      case 'restricted_safeguarding':
        return ['safeguarding_lead', 'executive_director'].includes(normRole);
      case 'staff_management':
      case 'department_management':
        return ['executive_director', 'executive'].includes(normRole);
      case 'volunteer_management':
        return ['volunteer_coordinator', 'programs_director', 'executive_director', 'executive', 'department_manager'].includes(normRole);
      case 'fundraising_crm':
        return ['development_director', 'grants_director', 'executive_director', 'executive', 'department_manager'].includes(normRole);
      case 'email_management':
        return ['development_director', 'programs_director', 'executive_director', 'executive', 'safeguarding_lead'].includes(normRole);
      case 'master_administration':
        return ['master_admin', 'platform_super_admin'].includes(normRole);
      case 'organizational_tasks':
        return ['master_admin', 'executive_director', 'executive', 'department_manager', 'staff', 'board_member'].includes(normRole);
      case 'ai_workforce':
        return ['executive_director', 'executive', 'development_director', 'grants_director'].includes(normRole);
      case 'audit_records':
        return ['executive_director', 'executive', 'board_member'].includes(normRole);
      default:
        return false;
    }
  }

  /**
   * Registers a new community or volunteer member account.
   */
  public async registerMemberAccount(data: {
    name: string;
    email: string;
    password?: string;
    role?: CanonicalRoleFamily;
    phone?: string;
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    if (!data.name || !data.email) {
      return { success: false, error: 'Name and email are required for member registration.' };
    }

    const emailNorm = data.email.toLowerCase().trim();
    const existing = await this.dbAdapter.select<any>('staff_members');
    if (existing.some((u: any) => u.email?.toLowerCase().trim() === emailNorm)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newId = `usr-mem-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const assignedRole = data.role || 'COMMUNITY_MEMBER';
    const pwdHash = data.password ? this.hashPassword(data.password) : null;

    const userRecord = {
      id: newId,
      name: data.name.trim(),
      email: emailNorm,
      role: assignedRole,
      phone: data.phone || '',
      passwordHash: pwdHash?.hash || null,
      passwordSalt: pwdHash?.salt || null,
      passwordIterations: pwdHash?.iterations || 100000,
      status: 'active',
      mfaEnabled: false,
      departmentId: assignedRole === 'STAFF' ? 'DEPT-OPS' : 'DEPT-COMM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.dbAdapter.insert('staff_members', userRecord);
    return { success: true, user: userRecord };
  }

  /**
   * Initiates password recovery with a cryptographically hashed durable reset token.
   */
  public async requestPasswordRecovery(email: string): Promise<{ success: boolean; recoveryToken?: string; message: string }> {
    const emailNorm = email.toLowerCase().trim();
    const token = `recov_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const users = await this.dbAdapter.select<any>('staff_members');
    const accountExists = users.some((u: any) => u.email?.toLowerCase().trim() === emailNorm);

    if (accountExists) {
      const resetRec: PasswordResetRecord = {
        tokenHash,
        email: emailNorm,
        expiresAt,
        used: false,
        createdAt: nowIso,
      };
      this.passwordResetTokens.set(tokenHash, resetRec);
      this.persistDurableAuthState();
      await this.dbAdapter.insertDurableWithRetry(
        'password_reset_tokens',
        { id: tokenHash, ...resetRec },
        { context: 'authSecurityService:requestPasswordRecovery' }
      );
    }

    await this.dbAdapter.insert('audit_logs', {
      id: `audit-recov-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      action: 'auth:password_recovery_requested',
      email: emailNorm,
      timestamp: nowIso,
      tokenHash,
    });
    return {
      success: true,
      recoveryToken: accountExists ? token : undefined,
      message: 'If the provided email is associated with an account, password reset instructions have been generated.',
    };
  }

  /**
   * Completes password reset using a single-use token, updates PBKDF2 password hash, and revokes active sessions.
   */
  public async confirmPasswordReset(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'A valid reset token is required.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    let resetRec = this.passwordResetTokens.get(tokenHash);
    if (!resetRec) {
      const persisted = await this.dbAdapter.select<PasswordResetRecord & { id: string }>(
        'password_reset_tokens',
        (r) => r.tokenHash === tokenHash || r.id === tokenHash
      );
      if (persisted[0]) resetRec = persisted[0];
    }

    if (!resetRec || resetRec.used) {
      return { success: false, error: 'Reset token is invalid or has already been used.' };
    }
    if (Date.now() > new Date(resetRec.expiresAt).getTime()) {
      return { success: false, error: 'Reset token has expired. Please request a new password reset.' };
    }

    const users = await this.dbAdapter.select<any>('staff_members');
    const matched = users.find((u: any) => u.email?.toLowerCase().trim() === resetRec!.email);
    if (!matched) {
      return { success: false, error: 'Associated account not found.' };
    }

    const pwdHash = this.hashPassword(newPassword);
    await this.dbAdapter.update('staff_members', matched.id, {
      passwordHash: pwdHash.hash,
      passwordSalt: pwdHash.salt,
      passwordIterations: pwdHash.iterations,
      updatedAt: new Date().toISOString(),
    });

    resetRec.used = true;
    this.passwordResetTokens.set(tokenHash, resetRec);
    this.persistDurableAuthState();
    await this.dbAdapter.insertDurableWithRetry(
      'password_reset_tokens',
      { id: tokenHash, ...resetRec },
      { context: 'authSecurityService:confirmPasswordReset' }
    );

    const revokedCount = await this.revokeAllUserSessions(matched.id);
    this.clearFailedAttempts(resetRec.email);

    await this.dbAdapter.insert('audit_logs', {
      id: `audit-pwreset-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      actor_role: matched.role,
      action: 'auth:password_reset_completed',
      details: `Completed password reset for ${resetRec.email}; revoked ${revokedCount} active session(s).`,
    });

    return {
      success: true,
      message: 'Password updated successfully. All prior active sessions have been revoked.',
    };
  }

  /**
   * Suspends an account for security or safeguarding reasons.
   */
  public async suspendAccount(userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    await this.dbAdapter.update('staff_members', userId, {
      status: 'suspended',
      suspensionReason: reason,
      suspendedAt: new Date().toISOString(),
    });
    await this.revokeAllUserSessions(userId);
    return { success: true, message: `Account ${userId} suspended successfully.` };
  }

  /**
   * Updates an account role and department with audit trail.
   */
  public async assignRole(userId: string, newRole: StaffRole, departmentId?: string): Promise<{ success: boolean; message: string; sessionsRevoked: number }> {
    const updatedAt = new Date().toISOString();
    await this.dbAdapter.update('staff_members', userId, {
      role: newRole,
      department_id: departmentId || 'DEPT-OPS',
      roleUpdatedAt: updatedAt,
    });
    const sessionsRevoked = await this.revokeAllUserSessions(userId);
    await this.dbAdapter.insert('audit_logs', {
      id: `audit-role-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: updatedAt,
      actor_role: newRole,
      action: 'auth:role_assigned_sessions_revoked',
      details: `Updated role to ${newRole} for user ${userId}; revoked ${sessionsRevoked} active session(s).`,
      signature: crypto.createHash('sha256').update(`${userId}:${newRole}:${updatedAt}`).digest('hex'),
    });
    return {
      success: true,
      message: `Role updated to ${newRole} for user ${userId}; ${sessionsRevoked} active session(s) revoked.`,
      sessionsRevoked,
    };
  }
}

export const authSecurityService = AuthSecurityService.getInstance();
