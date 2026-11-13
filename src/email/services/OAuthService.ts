/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — OAuth 2.0 PKCE & Encrypted Token Vault Service (Phase 29 Hardened)
 * Manages Google Workspace and Microsoft Entra ID PKCE state, live HTTP code exchange,
 * AES-256-GCM encrypted token vaulting, and refresh token rotation.
 */

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from '../../services/environmentService';

export interface OAuthSessionState {
  stateId: string;
  provider: 'GOOGLE' | 'MICROSOFT';
  codeVerifier: string;
  codeChallenge: string;
  redirectUri: string;
  mailboxEmail?: string;
  createdAt: number;
  expiresAt: number;
}

export interface StoredOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  scope?: string;
  expiresAt: number;
  verifiedEmail?: string;
  provider: 'GOOGLE' | 'MICROSOFT';
  updatedAt: string;
}

interface EncryptedVaultEntry {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt: string;
  provider: 'GOOGLE' | 'MICROSOFT';
  verifiedEmail?: string;
  expiresAt: number;
  updatedAt: string;
}

export interface OAuthExchangeResult {
  success: boolean;
  provider: 'GOOGLE' | 'MICROSOFT';
  mailboxEmail?: string;
  verifiedEmail?: string;
  expiresAt?: number;
  scope?: string;
  statusCode?: number;
  errorCode?: string;
  error?: string;
}

export class OAuthService {
  private static instance: OAuthService;
  private activeStates: Map<string, OAuthSessionState> = new Map();
  private encryptedTokenVault: Map<string, EncryptedVaultEntry> = new Map();
  private ephemeralVaultSecret: Buffer | null = null;
  private vaultPersistencePath: string;

  private constructor() {
    const runtimeDir = process.env.PHUMULANI_RUNTIME_DATA_DIR?.trim()
      ? path.resolve(process.env.PHUMULANI_RUNTIME_DATA_DIR.trim())
      : path.resolve(os.tmpdir(), 'phumulani-runtime-data');
    this.vaultPersistencePath = path.resolve(runtimeDir, '.oauth_tokens_vault.enc.json');
    this.loadEncryptedVault();
    setInterval(() => this.cleanupExpiredStates(), 60000).unref?.();
  }

  public static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  public static initiateGoogleOAuth(param1: string, param2?: string) {
    return OAuthService.getInstance().initiateGoogleOAuth(param1, param2);
  }

  public static initiateMicrosoftOAuth(param1: string, param2?: string) {
    return OAuthService.getInstance().initiateMicrosoftOAuth(param1, param2);
  }

  public isProviderConfigured(provider: 'GOOGLE' | 'MICROSOFT'): boolean {
    if (provider === 'GOOGLE') {
      return Boolean(
        process.env.GOOGLE_WORKSPACE_CLIENT_ID?.trim() &&
        process.env.GOOGLE_WORKSPACE_CLIENT_SECRET?.trim()
      );
    }
    return Boolean(
      process.env.MICROSOFT_GRAPH_CLIENT_ID?.trim() &&
      process.env.MICROSOFT_GRAPH_CLIENT_SECRET?.trim()
    );
  }

  private isWeakKeyMaterial(value: string): boolean {
    if (!value || value.length < 32) return true;
    const lower = value.toLowerCase();
    const knownWeakPrefixes = ['changeme', 'default', 'test-key', 'placeholder', 'example', 'phumulani-dev', 'secret-key'];
    if (knownWeakPrefixes.some((p) => lower.startsWith(p))) return true;
    if (new Set(value).size < 6) return true;
    return false;
  }

  private resolveVaultSecret(): Buffer | string {
    const configured = (process.env.OAUTH_TOKEN_ENCRYPTION_KEY || process.env.SAFEGUARDING_MASTER_KEY || '').trim();
    if (configured && !this.isWeakKeyMaterial(configured)) {
      return configured;
    }
    if (
      EnvironmentService.isProductionOnly() ||
      process.env.PHUMULANI_OPERATIONAL_MODE === 'CONTROLLED_LIVE_PILOT' ||
      process.env.NODE_ENV === 'production' ||
      process.env.SAFEGUARDING_REQUIRE_CONFIGURED_KEY === 'true'
    ) {
      throw new Error('OAUTH_TOKEN_ENCRYPTION_KEY (minimum 32 high-entropy characters) is required for encrypted OAuth token storage in production.');
    }
    if (!this.ephemeralVaultSecret) {
      this.ephemeralVaultSecret = crypto.randomBytes(32);
    }
    return this.ephemeralVaultSecret;
  }

  private loadEncryptedVault(): void {
    try {
      if (fs.existsSync(this.vaultPersistencePath)) {
        const raw = fs.readFileSync(this.vaultPersistencePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.entries && typeof parsed.entries === 'object') {
          for (const [k, v] of Object.entries(parsed.entries)) {
            if (v && typeof v === 'object' && 'ciphertext' in v && 'iv' in v && 'authTag' in v && 'salt' in v) {
              this.encryptedTokenVault.set(k.toLowerCase(), v as EncryptedVaultEntry);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[OAuthService] Unable to load encrypted token vault:', err);
    }
  }

  private saveEncryptedVault(): void {
    try {
      const dir = path.dirname(this.vaultPersistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      const payload = {
        savedAt: new Date().toISOString(),
        encryption: 'AES-256-GCM',
        entries: Object.fromEntries(this.encryptedTokenVault.entries()),
      };
      const tmpPath = `${this.vaultPersistencePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
      fs.renameSync(tmpPath, this.vaultPersistencePath);
    } catch (err) {
      console.warn('[OAuthService] Failed to persist encrypted token vault:', err);
    }
  }

  private encryptTokens(connectionKey: string, payload: StoredOAuthTokens): EncryptedVaultEntry {
    const secret = this.resolveVaultSecret();
    const salt = crypto.randomBytes(16);
    const derivedKey = crypto.scryptSync(secret, salt, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
    cipher.setAAD(Buffer.from(connectionKey, 'utf8'));
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
      salt: salt.toString('hex'),
      provider: payload.provider,
      verifiedEmail: payload.verifiedEmail,
      expiresAt: payload.expiresAt,
      updatedAt: payload.updatedAt,
    };
  }

  private decryptTokens(connectionKey: string, entry: EncryptedVaultEntry): StoredOAuthTokens {
    const secret = this.resolveVaultSecret();
    const derivedKey = crypto.scryptSync(secret, Buffer.from(entry.salt, 'hex'), 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, Buffer.from(entry.iv, 'hex'));
    decipher.setAAD(Buffer.from(connectionKey, 'utf8'));
    decipher.setAuthTag(Buffer.from(entry.authTag, 'hex'));
    let decrypted = decipher.update(entry.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted) as StoredOAuthTokens;
  }

  public storeEncryptedTokens(connectionKey: string, tokens: StoredOAuthTokens): void {
    const normalizedKey = connectionKey.toLowerCase();
    const entry = this.encryptTokens(normalizedKey, tokens);
    this.encryptedTokenVault.set(normalizedKey, entry);
    this.saveEncryptedVault();
  }

  public getDecryptedTokens(connectionKey: string): StoredOAuthTokens | null {
    const normalizedKey = connectionKey.toLowerCase();
    const entry = this.encryptedTokenVault.get(normalizedKey);
    if (!entry) return null;
    try {
      return this.decryptTokens(normalizedKey, entry);
    } catch {
      return null;
    }
  }

  public hasStoredTokens(connectionKey: string): boolean {
    return this.encryptedTokenVault.has(connectionKey.toLowerCase());
  }

  public revokeTokens(connectionKey: string): void {
    this.encryptedTokenVault.delete(connectionKey.toLowerCase());
    this.saveEncryptedVault();
  }

  /**
   * Generate high-entropy PKCE code verifier and SHA-256 code challenge
   */
  public generatePkcePair(): { verifier: string; challenge: string } {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
  }

  /**
   * Initiate Google Workspace OAuth 2.0 PKCE flow
   */
  public initiateGoogleOAuth(
    param1: string,
    param2?: string
  ): {
    authUrl: string;
    stateId: string;
    state: string;
    codeVerifier: string;
    codeChallenge: string;
    isConfigured: boolean;
  } {
    const redirectUri = param1.startsWith('http')
      ? param1
      : param2 || 'http://localhost:3000/api/admin/email/oauth/google/callback';
    const mailboxEmail = param1.startsWith('http') ? param2 : param1;

    const { verifier, challenge } = this.generatePkcePair();
    const stateId = `oauth_goog_${crypto.randomBytes(16).toString('hex')}`;
    const configuredClientId = process.env.GOOGLE_WORKSPACE_CLIENT_ID?.trim();
    const isConfigured = this.isProviderConfigured('GOOGLE');

    this.activeStates.set(stateId, {
      stateId,
      provider: 'GOOGLE',
      codeVerifier: verifier,
      codeChallenge: challenge,
      redirectUri,
      mailboxEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: configuredClientId || 'UNCONFIGURED_GOOGLE_CLIENT_ID',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: stateId,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    if (mailboxEmail) {
      params.append('login_hint', mailboxEmail);
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return { authUrl, stateId, state: stateId, codeVerifier: verifier, codeChallenge: challenge, isConfigured };
  }

  /**
   * Initiate Microsoft 365 OAuth 2.0 PKCE flow
   */
  public initiateMicrosoftOAuth(
    param1: string,
    param2?: string
  ): {
    authUrl: string;
    stateId: string;
    state: string;
    codeVerifier: string;
    codeChallenge: string;
    isConfigured: boolean;
  } {
    const redirectUri = param1.startsWith('http')
      ? param1
      : param2 || 'http://localhost:3000/api/admin/email/oauth/microsoft/callback';
    const mailboxEmail = param1.startsWith('http') ? param2 : param1;

    const { verifier, challenge } = this.generatePkcePair();
    const stateId = `oauth_msft_${crypto.randomBytes(16).toString('hex')}`;
    const configuredClientId = process.env.MICROSOFT_GRAPH_CLIENT_ID?.trim();
    const tenantId = process.env.MICROSOFT_TENANT_ID?.trim() || 'common';
    const isConfigured = this.isProviderConfigured('MICROSOFT');

    this.activeStates.set(stateId, {
      stateId,
      provider: 'MICROSOFT',
      codeVerifier: verifier,
      codeChallenge: challenge,
      redirectUri,
      mailboxEmail,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const scopes = [
      'openid',
      'profile',
      'email',
      'offline_access',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/Mail.Send',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: configuredClientId || 'UNCONFIGURED_MICROSOFT_CLIENT_ID',
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scopes,
      state: stateId,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    if (mailboxEmail) {
      params.append('login_hint', mailboxEmail);
    }

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    return { authUrl, stateId, state: stateId, codeVerifier: verifier, codeChallenge: challenge, isConfigured };
  }

  /**
   * Validate incoming OAuth callback state (CSRF protection, TTL check, replay prevention)
   */
  public validateCallback(stateId: string, code: string): { valid: boolean; state?: OAuthSessionState; error?: string } {
    if (!code || !String(code).trim()) {
      return { valid: false, error: 'OAUTH_INVALID_CODE: Authorization code is required.' };
    }
    const state = this.activeStates.get(stateId);
    if (!state) {
      return { valid: false, error: 'OAUTH_CSRF_ERROR: Invalid or expired OAuth state parameter.' };
    }

    if (Date.now() > state.expiresAt) {
      this.activeStates.delete(stateId);
      return { valid: false, error: 'OAUTH_EXPIRED: State token has expired. Please initiate authentication again.' };
    }

    // Consume state immediately to prevent replay attacks
    this.activeStates.delete(stateId);
    return { valid: true, state };
  }

  /**
   * Exchange authorization code with the actual provider token endpoint (Google or Microsoft)
   * and store encrypted tokens in the server vault. Fails closed if provider credentials are absent.
   */
  public async exchangeAuthorizationCode(params: {
    provider: 'GOOGLE' | 'MICROSOFT';
    stateId: string;
    code: string;
    connectionKey?: string;
    mailboxEmail?: string;
  }): Promise<OAuthExchangeResult> {
    const { provider, stateId, code } = params;

    if (!this.isProviderConfigured(provider)) {
      return {
        success: false,
        provider,
        statusCode: 503,
        errorCode: 'OAUTH_CREDENTIALS_MISSING',
        error: `${provider === 'GOOGLE' ? 'Google Workspace' : 'Microsoft 365'} OAuth client credentials are not configured on the server. Set client ID and secret before completing OAuth authorization.`,
      };
    }

    const val = this.validateCallback(stateId, code);
    if (!val.valid || !val.state) {
      return {
        success: false,
        provider,
        statusCode: 400,
        errorCode: 'OAUTH_STATE_INVALID',
        error: val.error || 'Invalid OAuth callback state.',
      };
    }

    if (val.state.provider !== provider) {
      return {
        success: false,
        provider,
        statusCode: 400,
        errorCode: 'OAUTH_PROVIDER_MISMATCH',
        error: `OAuth state belongs to provider ${val.state.provider}, not ${provider}.`,
      };
    }

    const effectiveProvider = val.state.provider;
    const targetEmail = params.mailboxEmail || val.state.mailboxEmail;

    try {
      const tokenUrl =
        effectiveProvider === 'GOOGLE'
          ? 'https://oauth2.googleapis.com/token'
          : `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID?.trim() || 'common'}/oauth2/v2.0/token`;

      const form = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: val.state.redirectUri,
        code_verifier: val.state.codeVerifier,
        client_id:
          effectiveProvider === 'GOOGLE'
            ? process.env.GOOGLE_WORKSPACE_CLIENT_ID!.trim()
            : process.env.MICROSOFT_GRAPH_CLIENT_ID!.trim(),
        client_secret:
          effectiveProvider === 'GOOGLE'
            ? process.env.GOOGLE_WORKSPACE_CLIENT_SECRET!.trim()
            : process.env.MICROSOFT_GRAPH_CLIENT_SECRET!.trim(),
      });

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });

      const tokenData: any = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tokenData.access_token) {
        return {
          success: false,
          provider: effectiveProvider,
          statusCode: 401,
          errorCode: 'OAUTH_EXCHANGE_FAILED',
          error: tokenData.error_description || tokenData.error || `Provider token endpoint returned HTTP ${tokenRes.status}.`,
        };
      }

      // Verify authorized identity against provider profile endpoint
      let verifiedEmail: string | undefined;
      const profileUrl =
        effectiveProvider === 'GOOGLE'
          ? 'https://www.googleapis.com/oauth2/v2/userinfo'
          : 'https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName';
      const profileRes = await fetch(profileUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (!profileRes.ok) {
        return {
          success: false,
          provider: effectiveProvider,
          statusCode: 401,
          errorCode: 'OAUTH_IDENTITY_VERIFICATION_FAILED',
          error: `Provider identity verification endpoint returned HTTP ${profileRes.status}. Cannot mark mailbox connected without verified identity.`,
        };
      }
      const profile: any = await profileRes.json();
      verifiedEmail = profile.email || profile.mail || profile.userPrincipalName;
      if (!verifiedEmail) {
        return {
          success: false,
          provider: effectiveProvider,
          statusCode: 401,
          errorCode: 'OAUTH_IDENTITY_MISSING',
          error: 'Provider profile did not return a verified mailbox email address.',
        };
      }

      if (targetEmail && targetEmail.toLowerCase() !== verifiedEmail.toLowerCase()) {
        return {
          success: false,
          provider: effectiveProvider,
          statusCode: 403,
          errorCode: 'OAUTH_MAILBOX_MISMATCH',
          error: `Authorized provider account (${verifiedEmail}) does not match target mailbox (${targetEmail}).`,
        };
      }

      const expiresIn = Number(tokenData.expires_in) || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;
      const vaultKey = params.connectionKey || verifiedEmail || targetEmail || val.state.stateId;

      this.storeEncryptedTokens(vaultKey, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type || 'Bearer',
        scope: tokenData.scope,
        expiresAt,
        verifiedEmail,
        provider: effectiveProvider,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        provider: effectiveProvider,
        mailboxEmail: targetEmail,
        verifiedEmail,
        expiresAt,
        scope: tokenData.scope,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: effectiveProvider,
        statusCode: 502,
        errorCode: 'OAUTH_NETWORK_ERROR',
        error: err?.message || 'Failed to exchange authorization code with OAuth provider.',
      };
    }
  }

  /**
   * Refresh an expired OAuth access token using the vaulted encrypted refresh_token.
   */
  public async refreshAccessToken(connectionKey: string): Promise<{
    success: boolean;
    accessToken?: string;
    expiresAt?: number;
    error?: string;
  }> {
    const stored = this.getDecryptedTokens(connectionKey);
    if (!stored || !stored.refreshToken) {
      return { success: false, error: 'NO_REFRESH_TOKEN: Connection has no encrypted refresh token stored.' };
    }

    if (!this.isProviderConfigured(stored.provider)) {
      return { success: false, error: 'OAUTH_CREDENTIALS_MISSING: Provider client credentials missing.' };
    }

    const tokenUrl =
      stored.provider === 'GOOGLE'
        ? 'https://oauth2.googleapis.com/token'
        : `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID?.trim() || 'common'}/oauth2/v2.0/token`;

    const form = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: stored.refreshToken,
      client_id:
        stored.provider === 'GOOGLE'
          ? process.env.GOOGLE_WORKSPACE_CLIENT_ID!.trim()
          : process.env.MICROSOFT_GRAPH_CLIENT_ID!.trim(),
      client_secret:
        stored.provider === 'GOOGLE'
          ? process.env.GOOGLE_WORKSPACE_CLIENT_SECRET!.trim()
          : process.env.MICROSOFT_GRAPH_CLIENT_SECRET!.trim(),
    });

    try {
      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok || !data.access_token) {
        return {
          success: false,
          error: data.error_description || data.error || `Refresh grant rejected (HTTP ${res.status}).`,
        };
      }

      const expiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
      this.storeEncryptedTokens(connectionKey, {
        ...stored,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || stored.refreshToken,
        expiresAt,
        updatedAt: new Date().toISOString(),
      });

      return { success: true, accessToken: data.access_token, expiresAt };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Token refresh network failure.' };
    }
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [key, val] of this.activeStates.entries()) {
      if (now > val.expiresAt) {
        this.activeStates.delete(key);
      }
    }
  }
}

export const oAuthService = OAuthService.getInstance();
