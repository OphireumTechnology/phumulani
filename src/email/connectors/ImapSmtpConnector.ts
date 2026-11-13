/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Production IMAP & SMTP Connector (Phase 26)
 * Uses ImapFlow for authenticated IMAP4rev1 synchronization and Nodemailer for verified SMTP AUTH dispatch.
 */

import crypto from 'crypto';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { EmailConnector } from './EmailConnector';
import { oAuthService } from '../services/OAuthService';
import {
  EmailProviderType,
  ConnectionResult,
  ConnectionHealth,
  NormalizedEmailFolder,
  NormalizedEmailMessage,
  EmailAttachmentMetadata,
  MessageQueryOptions,
  EmailMessagePage,
  SyncResult,
  EmailDraft,
  DraftResult,
  ApprovedOutboundMessage,
  SendResult,
  ImapSmtpConfiguration,
} from '../types';

function checkIpv4Address(ip: string): string | null {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return null;
  const oct1 = parseInt(match[1], 10);
  const oct2 = parseInt(match[2], 10);
  const oct3 = parseInt(match[3], 10);
  const oct4 = parseInt(match[4], 10);
  if ([oct1, oct2, oct3, oct4].some((o) => o > 255)) {
    return 'SSRF_BLOCKED: Invalid IPv4 octet.';
  }
  if (oct1 === 127) {
    return 'SSRF_BLOCKED: Loopback 127.0.0.0/8 addresses are strictly forbidden.';
  }
  if (oct1 === 169 && oct2 === 254) {
    return 'SSRF_BLOCKED: Cloud link-local metadata endpoints (169.254.0.0/16) are strictly forbidden.';
  }
  if (oct1 === 10) {
    return 'SSRF_BLOCKED: Private 10.0.0.0/8 subnet access is forbidden.';
  }
  if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) {
    return 'SSRF_BLOCKED: Private 172.16.0.0/12 subnet access is forbidden.';
  }
  if (oct1 === 192 && oct2 === 168) {
    return 'SSRF_BLOCKED: Private 192.168.0.0/16 subnet access is forbidden.';
  }
  if (oct1 === 100 && oct2 >= 64 && oct2 <= 127) {
    return 'SSRF_BLOCKED: Carrier-grade NAT (100.64.0.0/10) subnet access is forbidden.';
  }
  if (oct1 === 192 && oct2 === 0 && (oct3 === 0 || oct3 === 2)) {
    return 'SSRF_BLOCKED: Reserved IETF/TEST-NET subnet access is forbidden.';
  }
  if (oct1 === 198 && (oct2 === 18 || oct2 === 19)) {
    return 'SSRF_BLOCKED: Benchmark reserved subnet (198.18.0.0/15) is forbidden.';
  }
  if (oct1 === 0 || oct1 >= 224) {
    return 'SSRF_BLOCKED: Unspecified, multicast, or reserved IPv4 range is forbidden.';
  }
  return null;
}

function checkIpLiteral(rawIp: string): string | null {
  const clean = rawIp.trim().toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  if (!clean) return 'SSRF_BLOCKED: Empty address.';
  if (net.isIPv4(clean)) {
    return checkIpv4Address(clean);
  }
  if (net.isIPv6(clean)) {
    if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1' || clean === '0:0:0:0:0:0:0:0') {
      return 'SSRF_BLOCKED: IPv6 loopback and unspecified addresses are strictly forbidden.';
    }
    if (clean.startsWith('fe80:') || clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) {
      return 'SSRF_BLOCKED: IPv6 link-local (fe80::/10) addresses are strictly forbidden.';
    }
    if (clean.startsWith('fc') || clean.startsWith('fd')) {
      return 'SSRF_BLOCKED: IPv6 unique local (fc00::/7) private addresses are strictly forbidden.';
    }
    if (clean.startsWith('ff')) {
      return 'SSRF_BLOCKED: IPv6 multicast addresses are strictly forbidden.';
    }
    if (clean.startsWith('::ffff:')) {
      const mapped = clean.slice('::ffff:'.length);
      if (net.isIPv4(mapped)) {
        return checkIpv4Address(mapped);
      }
      const hexMatch = mapped.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
      if (hexMatch) {
        const hi = parseInt(hexMatch[1], 16);
        const lo = parseInt(hexMatch[2], 16);
        const v4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return checkIpv4Address(v4);
      }
    }
  }
  return null;
}

/**
 * SSRF Protection Invariants:
 * Strictly rejects loopback addresses, private RFC-1918/4193/6598 subnets, cloud metadata endpoints,
 * IPv6/IPv4-mapped bypasses, and internal hostnames.
 */
export function validateSafeMailHost(host: string): { valid: boolean; reason?: string } {
  if (!host || typeof host !== 'string') {
    return { valid: false, reason: 'Host string cannot be empty' };
  }

  const h = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || /\s/.test(h) || h.includes('/') || h.includes('@')) {
    return { valid: false, reason: 'SSRF_BLOCKED: Malformed mail hostname.' };
  }

  if (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.endsWith('.arpa') ||
    h === 'metadata.google.internal' ||
    h === 'metadata'
  ) {
    return { valid: false, reason: 'SSRF_BLOCKED: Localhost, internal, and cloud metadata hostnames are strictly forbidden.' };
  }

  const ipViolation = checkIpLiteral(h);
  if (ipViolation) {
    return { valid: false, reason: ipViolation };
  }

  return { valid: true };
}

export async function validateSafeMailHostAsync(host: string): Promise<{ valid: boolean; reason?: string; resolvedAddresses?: string[] }> {
  const syncCheck = validateSafeMailHost(host);
  if (!syncCheck.valid) return syncCheck;

  const clean = host.trim().replace(/^\[|\]$/g, '');
  if (net.isIP(clean)) {
    return { valid: true, resolvedAddresses: [clean] };
  }

  try {
    const records = await dns.promises.lookup(clean, { all: true });
    if (!records || records.length === 0) {
      return { valid: false, reason: `DNS_ERROR: Host "${clean}" did not resolve to any IP address.` };
    }
    const resolvedAddresses: string[] = [];
    for (const rec of records) {
      const violation = checkIpLiteral(rec.address);
      if (violation) {
        return { valid: false, reason: `${violation} (resolved ${clean} -> ${rec.address})` };
      }
      resolvedAddresses.push(rec.address);
    }
    return { valid: true, resolvedAddresses };
  } catch (err: any) {
    return { valid: false, reason: `DNS_ERROR: Failed to resolve mail host "${clean}": ${err?.code || err?.message || 'lookup failed'}` };
  }
}

export async function verifyMailSocketReachable(
  host: string,
  port: number,
  security: 'TLS' | 'STARTTLS' | 'NONE' = 'TLS',
  timeoutMs = 3000,
  tlsCa?: string | Buffer
): Promise<{ reachable: boolean; tlsVerified: boolean; tlsVersion?: string; cipherSuite?: string; latencyMs: number; error?: string }> {
  const t0 = Date.now();
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: { reachable: boolean; tlsVerified: boolean; tlsVersion?: string; cipherSuite?: string; error?: string }) => {
      if (settled) return;
      settled = true;
      resolve({ ...result, latencyMs: Math.max(1, Date.now() - t0) });
    };

    if (security === 'TLS') {
      const socket = tls.connect(
        {
          host,
          port,
          servername: host,
          rejectUnauthorized: true,
          ...(tlsCa ? { ca: tlsCa } : {}),
          timeout: timeoutMs,
        },
        () => {
          const proto = socket.getProtocol?.() || undefined;
          const cipher = socket.getCipher?.()?.name || undefined;
          const authorized = socket.authorized;
          const authErr = socket.authorizationError ? String(socket.authorizationError) : undefined;
          socket.end();
          socket.destroy();
          if (!authorized) {
            done({ reachable: false, tlsVerified: false, error: `TLS certificate verification failed: ${authErr || 'untrusted'}` });
          } else {
            done({ reachable: true, tlsVerified: true, tlsVersion: proto, cipherSuite: cipher });
          }
        }
      );
      socket.on('timeout', () => {
        socket.destroy();
        done({ reachable: false, tlsVerified: false, error: `TLS connection timeout to ${host}:${port}` });
      });
      socket.on('error', (err: any) => {
        socket.destroy();
        done({ reachable: false, tlsVerified: false, error: err?.message || `TLS connection error to ${host}:${port}` });
      });
    } else {
      const socket = net.connect({ host, port, timeout: timeoutMs }, () => {
        socket.end();
        socket.destroy();
        done({ reachable: true, tlsVerified: false });
      });
      socket.on('timeout', () => {
        socket.destroy();
        done({ reachable: false, tlsVerified: false, error: `TCP connection timeout to ${host}:${port}` });
      });
      socket.on('error', (err: any) => {
        socket.destroy();
        done({ reachable: false, tlsVerified: false, error: err?.message || `TCP connection error to ${host}:${port}` });
      });
    }
  });
}

export interface ImapSmtpExtendedConfig extends Partial<ImapSmtpConfiguration> {
  tlsCa?: string;
  skipSmtpVerifyForImapOnly?: boolean;
  allowLoopbackForTesting?: boolean;
  connectTimeoutMs?: number;
  sendTimeoutMs?: number;
}

function isAuthError(err: any): boolean {
  const code = String(err?.code || '').toUpperCase();
  const resp = String(err?.responseStatus || err?.responseCode || err?.serverResponseCode || '').toUpperCase();
  const msg = String(err?.message || err?.response || '').toLowerCase();
  return (
    err?.authenticationFailed === true ||
    code === 'EAUTH' ||
    resp === '535' ||
    resp === '534' ||
    resp === '530' ||
    resp === 'AUTHENTICATIONFAILED' ||
    msg.includes('authentication failed') ||
    msg.includes('invalid credentials') ||
    msg.includes('authenticationfailed') ||
    msg.includes('535 ')
  );
}

function isAmbiguousTimeoutError(err: any): boolean {
  const code = String(err?.code || '').toUpperCase();
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 'ETIMEDOUT' ||
    code === 'ESOCKETTIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('unexpected close') ||
    msg.includes('socket closed')
  );
}

export class ImapSmtpConnector implements EmailConnector {
  public readonly provider: EmailProviderType;
  public get providerType(): EmailProviderType {
    return this.provider;
  }
  private connectionId: string;
  private config: ImapSmtpConfiguration;
  private tlsCa?: string;
  private skipSmtpVerify: boolean;
  private allowLoopbackForTesting: boolean;
  private connectTimeoutMs: number;
  private sendTimeoutMs: number;
  private lastUid: number = 0;
  private lastUidValidity: number = 0;
  private isConnected: boolean = false;
  private activeCredentials: { user: string; pass: string } | null = null;

  constructor(
    connectionId = 'conn-imap-primary',
    config: ImapSmtpExtendedConfig = {},
    provider: EmailProviderType = 'IMAP_SMTP'
  ) {
    this.connectionId = connectionId;
    this.provider = provider;
    this.config = {
      emailAddress: config.emailAddress || 'info@phumulani.org',
      displayName: config.displayName || 'Phumulani Info Depot',
      imapHost: config.imapHost || 'imap.mail.host',
      imapPort: config.imapPort || 993,
      imapSecurity: config.imapSecurity || 'TLS',
      smtpHost: config.smtpHost || 'smtp.mail.host',
      smtpPort: config.smtpPort || 587,
      smtpSecurity: config.smtpSecurity || 'STARTTLS',
      authentication: config.authentication || 'APP_PASSWORD',
      enabled: config.enabled ?? true,
    };
    this.tlsCa = config.tlsCa || process.env.MAIL_TLS_CA?.trim() || undefined;
    this.skipSmtpVerify = Boolean(config.skipSmtpVerifyForImapOnly);
    // Strict SSRF block ALWAYS active in production; explicit test flag only works outside production
    const canBypassLoopback =
      process.env.PHUMULANI_OPERATIONAL_MODE !== 'PRODUCTION_ONLY' && process.env.NODE_ENV !== 'production';
    this.allowLoopbackForTesting = Boolean(config.allowLoopbackForTesting && canBypassLoopback);
    this.connectTimeoutMs = config.connectTimeoutMs || 4500;
    this.sendTimeoutMs = config.sendTimeoutMs || 8000;
  }

  public sanitizeHtml(rawHtml: string): string {
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/<img[^>]*\b(1px|tracker|pixel|beacon)[^>]*>/gi, '');
  }

  private async validateHosts(): Promise<{ valid: boolean; reason?: string; isDns?: boolean }> {
    const checkOne = async (host: string) => {
      if (this.allowLoopbackForTesting && (host === '127.0.0.1' || host === 'localhost' || host === '::1')) {
        return { valid: true };
      }
      return validateSafeMailHostAsync(host);
    };

    const imapCheck = await checkOne(this.config.imapHost);
    if (!imapCheck.valid) {
      return { valid: false, reason: imapCheck.reason, isDns: imapCheck.reason?.startsWith('DNS_ERROR') };
    }
    const smtpCheck = await checkOne(this.config.smtpHost);
    if (!smtpCheck.valid) {
      return { valid: false, reason: smtpCheck.reason, isDns: smtpCheck.reason?.startsWith('DNS_ERROR') };
    }
    return { valid: true };
  }

  private resolveCredentials(override?: Record<string, unknown>): { user: string; pass: string } | null {
    const stored =
      oAuthService.getDecryptedMailCredentials(this.connectionId) ||
      oAuthService.getDecryptedMailCredentials(this.config.emailAddress);

    const passRaw =
      override?.appPassword ||
      override?.password ||
      override?.token ||
      this.activeCredentials?.pass ||
      stored?.appPassword ||
      stored?.password ||
      stored?.token;

    if (!passRaw || typeof passRaw !== 'string' || !passRaw.trim()) {
      return null;
    }

    const userRaw =
      override?.username ||
      override?.user ||
      this.activeCredentials?.user ||
      stored?.username ||
      this.config.emailAddress;

    return { user: String(userRaw), pass: passRaw };
  }

  private buildImapClient(auth: { user: string; pass: string }): ImapFlow {
    const secure = (this.config.imapSecurity || (this.config.imapPort === 993 ? 'TLS' : 'STARTTLS')) === 'TLS';
    return new ImapFlow({
      host: this.config.imapHost,
      port: this.config.imapPort,
      secure,
      auth: { user: auth.user, pass: auth.pass },
      tls: {
        rejectUnauthorized: true,
        ...(this.tlsCa ? { ca: this.tlsCa } : {}),
      },
      logger: false,
      connectionTimeout: this.connectTimeoutMs,
      greetingTimeout: this.connectTimeoutMs,
      socketTimeout: this.sendTimeoutMs,
    });
  }

  private buildSmtpTransporter(auth: { user: string; pass: string }) {
    const sec = this.config.smtpSecurity || (this.config.smtpPort === 465 ? 'TLS' : 'STARTTLS');
    const secure = sec === 'TLS';
    return nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure,
      requireTLS: String(sec) !== 'NONE',
      auth: { user: auth.user, pass: auth.pass },
      tls: {
        rejectUnauthorized: true,
        ...(this.tlsCa ? { ca: this.tlsCa } : {}),
      },
      connectionTimeout: this.connectTimeoutMs,
      greetingTimeout: this.connectTimeoutMs,
      socketTimeout: this.sendTimeoutMs,
    });
  }

  public async testConnection(): Promise<ConnectionHealth & { isHealthy: boolean; tlsVerified: boolean }> {
    return this.verifyConnection();
  }

  /**
   * Authenticates directly against both IMAP (ImapFlow LOGIN) and SMTP (Nodemailer verify).
   * Never marks CONNECTED solely from TCP/TLS socket reachability.
   */
  public async connect(credentials?: Record<string, unknown>): Promise<ConnectionResult> {
    if (credentials?.imapHost && typeof credentials.imapHost === 'string') {
      this.config.imapHost = credentials.imapHost;
    }
    if (credentials?.imapPort && Number.isFinite(Number(credentials.imapPort))) {
      this.config.imapPort = Number(credentials.imapPort);
    }
    if (credentials?.smtpHost && typeof credentials.smtpHost === 'string') {
      this.config.smtpHost = credentials.smtpHost;
    }
    if (credentials?.smtpPort && Number.isFinite(Number(credentials.smtpPort))) {
      this.config.smtpPort = Number(credentials.smtpPort);
    }
    if (credentials?.tlsCa && typeof credentials.tlsCa === 'string') {
      this.tlsCa = credentials.tlsCa;
    }

    const hostCheck = await this.validateHosts();
    if (!hostCheck.valid) {
      this.isConnected = false;
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        status: hostCheck.isDns ? 'ERROR' : 'BLOCKED_EXTERNAL',
        error: hostCheck.reason,
      };
    }

    const auth = this.resolveCredentials(credentials);
    if (!auth) {
      this.isConnected = false;
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        status: 'AUTHENTICATION_FAILED',
        error: 'Missing authentication credentials (password, appPassword, or token required).',
      };
    }

    // Step 1: Real IMAP LOGIN / AUTHENTICATE verification
    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      await client.logout().catch(() => client.close());
    } catch (imapErr: any) {
      try {
        client.close();
      } catch {}
      this.isConnected = false;
      const authRejected = isAuthError(imapErr);
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        status: authRejected ? 'AUTHENTICATION_FAILED' : 'ERROR',
        error: authRejected
          ? `AUTHENTICATION_FAILED: IMAP rejected credentials for ${auth.user}: ${imapErr?.message || 'Access denied'}`
          : `IMAP transport/TLS verification failed (${this.config.imapHost}:${this.config.imapPort}): ${imapErr?.message || String(imapErr)}`,
      };
    }

    // Step 2: Real SMTP AUTH verification
    if (!this.skipSmtpVerify && !(credentials?.skipSmtpVerifyForImapOnly)) {
      const transporter = this.buildSmtpTransporter(auth);
      try {
        await transporter.verify();
        transporter.close();
      } catch (smtpErr: any) {
        try {
          transporter.close();
        } catch {}
        this.isConnected = false;
        const authRejected = isAuthError(smtpErr);
        return {
          success: false,
          connectionId: this.connectionId,
          provider: this.provider,
          mailboxEmail: this.config.emailAddress,
          status: authRejected ? 'AUTHENTICATION_FAILED' : 'ERROR',
          error: authRejected
            ? `AUTHENTICATION_FAILED: SMTP AUTH rejected credentials for ${auth.user}: ${smtpErr?.message || '535 Authentication failed'}`
            : `SMTP transport/TLS verification failed (${this.config.smtpHost}:${this.config.smtpPort}): ${smtpErr?.message || String(smtpErr)}`,
        };
      }
    }

    // Credentials verified against provider servers — cache encrypted in backend vault
    this.activeCredentials = auth;
    this.isConnected = true;
    oAuthService.storeEncryptedMailCredentials(this.connectionId, {
      username: auth.user,
      password: auth.pass,
      imapHost: this.config.imapHost,
      imapPort: this.config.imapPort,
      imapSecurity: this.config.imapSecurity,
      smtpHost: this.config.smtpHost,
      smtpPort: this.config.smtpPort,
      smtpSecurity: this.config.smtpSecurity,
      tlsCa: this.tlsCa,
    });

    return {
      success: true,
      connectionId: this.connectionId,
      provider: this.provider,
      mailboxEmail: this.config.emailAddress,
      status: 'CONNECTED',
      details: `Authenticated via real IMAP (${this.config.imapHost}:${this.config.imapPort}) & SMTP AUTH (${this.config.smtpHost}:${this.config.smtpPort}).`,
      authenticatedAt: new Date().toISOString(),
    };
  }

  public async verifyConnection(): Promise<ConnectionHealth & { isHealthy: boolean; tlsVerified: boolean }> {
    const t0 = Date.now();
    const hostCheck = await this.validateHosts();
    if (!hostCheck.valid) {
      this.isConnected = false;
      return {
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        healthy: false,
        isHealthy: false,
        tlsVerified: false,
        status: hostCheck.isDns ? 'ERROR' : 'BLOCKED_EXTERNAL',
        roundTripLatencyMs: Date.now() - t0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: hostCheck.isDns ? 'DNS_ERROR' : 'RESOLVED_OK',
        error: hostCheck.reason,
      };
    }

    const auth = this.resolveCredentials();
    if (!auth) {
      this.isConnected = false;
      return {
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        healthy: false,
        isHealthy: false,
        tlsVerified: false,
        status: 'DEGRADED',
        roundTripLatencyMs: Date.now() - t0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'RESOLVED_OK',
        error: 'AUTHORIZATION_REQUIRED: IMAP/SMTP connector has no vaulted credentials.',
        diagnosticsDetail: `IMAP (${this.config.imapHost}:${this.config.imapPort}) awaiting authenticated credentials.`,
      };
    }

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      await client.logout().catch(() => client.close());
    } catch (imapErr: any) {
      try {
        client.close();
      } catch {}
      this.isConnected = false;
      return {
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        healthy: false,
        isHealthy: false,
        tlsVerified: false,
        status: isAuthError(imapErr) ? 'AUTHENTICATION_FAILED' : 'ERROR',
        roundTripLatencyMs: Date.now() - t0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'RESOLVED_OK',
        error: imapErr?.message || 'IMAP verification failed.',
      };
    }

    if (!this.skipSmtpVerify) {
      const transporter = this.buildSmtpTransporter(auth);
      try {
        await transporter.verify();
        transporter.close();
      } catch (smtpErr: any) {
        try {
          transporter.close();
        } catch {}
        this.isConnected = false;
        return {
          connectionId: this.connectionId,
          provider: this.provider,
          mailboxEmail: this.config.emailAddress,
          healthy: false,
          isHealthy: false,
          tlsVerified: false,
          status: isAuthError(smtpErr) ? 'AUTHENTICATION_FAILED' : 'ERROR',
          roundTripLatencyMs: Date.now() - t0,
          lastCheckedAt: new Date().toISOString(),
          dnsResolution: 'RESOLVED_OK',
          error: smtpErr?.message || 'SMTP AUTH verification failed.',
        };
      }
    }

    this.isConnected = true;
    return {
      connectionId: this.connectionId,
      provider: this.provider,
      mailboxEmail: this.config.emailAddress,
      healthy: true,
      isHealthy: true,
      tlsVerified: String(this.config.imapSecurity || 'TLS') !== 'NONE',
      status: 'HEALTHY',
      roundTripLatencyMs: Math.max(1, Date.now() - t0),
      lastCheckedAt: new Date().toISOString(),
      tlsVersion: this.config.imapSecurity || 'TLS',
      dnsResolution: 'RESOLVED_OK',
      diagnosticsDetail: `IMAP (${this.config.imapHost}:${this.config.imapPort}) & SMTP (${this.config.smtpHost}:${this.config.smtpPort}) authenticated cleanly.`,
    };
  }

  public async listFolders(): Promise<NormalizedEmailFolder[]> {
    const auth = this.resolveCredentials();
    if (!auth) {
      return [
        { id: 'INBOX', name: 'INBOX', type: 'INBOX', totalMessageCount: 0, unreadMessageCount: 0 },
        { id: 'Sent', name: 'Sent Items', type: 'SENT', totalMessageCount: 0, unreadMessageCount: 0 },
        { id: 'Drafts', name: 'Drafts', type: 'DRAFTS', totalMessageCount: 0, unreadMessageCount: 0 },
        { id: 'Archive', name: 'Archive', type: 'ARCHIVE', totalMessageCount: 0, unreadMessageCount: 0 },
        { id: 'Trash', name: 'Trash', type: 'TRASH', totalMessageCount: 0, unreadMessageCount: 0 },
      ];
    }

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      const rawFolders = await client.list();
      const mapped: NormalizedEmailFolder[] = [];
      for (const f of rawFolders) {
        let total = 0;
        let unseen = 0;
        try {
          const st = await client.status(f.path, { messages: true, unseen: true });
          if (st && typeof st === 'object') {
            total = st.messages || 0;
            unseen = st.unseen || 0;
          }
        } catch {}
        const su = String(f.specialUse || '').toLowerCase();
        const lowerPath = f.path.toLowerCase();
        const fType: NormalizedEmailFolder['type'] =
          lowerPath === 'inbox' || su.includes('inbox')
            ? 'INBOX'
            : su.includes('sent') || lowerPath.includes('sent')
            ? 'SENT'
            : su.includes('draft') || lowerPath.includes('draft')
            ? 'DRAFTS'
            : su.includes('trash') || lowerPath.includes('trash')
            ? 'TRASH'
            : su.includes('junk') || lowerPath.includes('spam') || lowerPath.includes('junk')
            ? 'SPAM'
            : su.includes('archive') || lowerPath.includes('archive')
            ? 'ARCHIVE'
            : 'CUSTOM';

        mapped.push({
          id: f.path,
          name: f.name || f.path,
          type: fType,
          totalMessageCount: total,
          unreadMessageCount: unseen,
          providerFolderId: f.path,
        });
      }
      await client.logout().catch(() => client.close());
      return mapped;
    } catch {
      try {
        client.close();
      } catch {}
      return [
        { id: 'INBOX', name: 'INBOX', type: 'INBOX', totalMessageCount: 0, unreadMessageCount: 0 },
        { id: 'Sent', name: 'Sent Items', type: 'SENT', totalMessageCount: 0, unreadMessageCount: 0 },
      ];
    }
  }

  private extractAttachmentsFromStructure(node: any, out: EmailAttachmentMetadata[], msgId: string): void {
    if (!node || typeof node !== 'object') return;
    const disp = String(node.disposition || '').toLowerCase();
    const filename = node.dispositionParameters?.filename || node.parameters?.name;
    if (disp === 'attachment' || filename) {
      out.push({
        id: `att-${msgId}-${out.length + 1}`,
        filename: String(filename || `attachment-${out.length + 1}`),
        mimeType: String(node.type || 'application/octet-stream'),
        sizeBytes: Number(node.size || 0),
        attachmentId: String(node.part || out.length + 1),
      });
    }
    if (Array.isArray(node.childNodes)) {
      for (const child of node.childNodes) {
        this.extractAttachmentsFromStructure(child, out, msgId);
      }
    }
  }

  private parseRawMimeBody(source: Buffer | undefined): { bodyText: string; bodyHtml?: string; inReplyTo?: string } {
    if (!source) return { bodyText: '' };
    const raw = source.toString('utf8');
    const sepIdx = raw.indexOf('\r\n\r\n') !== -1 ? raw.indexOf('\r\n\r\n') : raw.indexOf('\n\n');
    const headersPart = sepIdx !== -1 ? raw.slice(0, sepIdx) : '';
    const bodyPart = sepIdx !== -1 ? raw.slice(sepIdx + (raw.includes('\r\n\r\n') ? 4 : 2)) : raw;
    const inReplyToMatch = headersPart.match(/^In-Reply-To:\s*(.+)$/im);
    const isHtml = /Content-Type:\s*text\/html/i.test(headersPart);
    if (isHtml) {
      const safeHtml = this.sanitizeHtml(bodyPart);
      return {
        bodyText: safeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        bodyHtml: safeHtml,
        inReplyTo: inReplyToMatch?.[1]?.trim(),
      };
    }
    return {
      bodyText: bodyPart.trim(),
      inReplyTo: inReplyToMatch?.[1]?.trim(),
    };
  }

  private async fetchFolderMessages(
    client: ImapFlow,
    folderPath: string,
    sinceUid: number,
    limit: number
  ): Promise<{ messages: NormalizedEmailMessage[]; maxUid: number; uidValidity: number }> {
    let lock: any;
    try {
      lock = await client.getMailboxLock(folderPath);
    } catch {
      return { messages: [], maxUid: sinceUid, uidValidity: 0 };
    }

    try {
      const mbox: any = client.mailbox || {};
      const uidValidity = Number(mbox.uidValidity || 0);
      const exists = Number(mbox.exists || 0);
      if (exists === 0) {
        return { messages: [], maxUid: sinceUid, uidValidity };
      }

      const range = sinceUid > 0 ? `${sinceUid + 1}:*` : `1:*`;
      const messages: NormalizedEmailMessage[] = [];
      let maxUid = sinceUid;

      for await (const msg of client.fetch(
        range,
        {
          uid: true,
          envelope: true,
          flags: true,
          internalDate: true,
          bodyStructure: true,
          source: true,
        },
        { uid: true }
      )) {
        if (msg.uid <= sinceUid) continue;
        if (msg.uid > maxUid) maxUid = msg.uid;

        const fromEntry = msg.envelope?.from?.[0];
        const toList = (msg.envelope?.to || []).map((t: any) => t.address || `${t.mailbox}@${t.host}`).filter(Boolean);
        const messageIdHeader = msg.envelope?.messageId || `<imap-uid-${uidValidity}-${msg.uid}@${this.config.imapHost}>`;
        const parsedBody = this.parseRawMimeBody(msg.source);
        const threadKey = msg.envelope?.inReplyTo || parsedBody.inReplyTo || messageIdHeader;
        const attachments: EmailAttachmentMetadata[] = [];
        this.extractAttachmentsFromStructure(msg.bodyStructure, attachments, String(msg.uid));

        messages.push({
          id: `${folderPath}:${uidValidity}:${msg.uid}`,
          providerMessageId: messageIdHeader,
          connectionId: this.connectionId,
          provider: this.provider,
          sourceAccount: this.config.emailAddress,
          threadId: String(threadKey),
          senderName: fromEntry?.name || fromEntry?.address || 'Unknown Sender',
          senderEmail: fromEntry?.address || '',
          recipientEmails: toList.length > 0 ? toList : [this.config.emailAddress],
          subject: msg.envelope?.subject || '(No Subject)',
          bodyText: parsedBody.bodyText,
          bodyHtml: parsedBody.bodyHtml,
          receivedAt: msg.internalDate ? new Date(msg.internalDate).toISOString() : new Date().toISOString(),
          folder: folderPath,
          isRead: msg.flags ? msg.flags.has('\\Seen') : false,
          attachments: attachments.length > 0 ? attachments : undefined,
          isLiveImportVerified: true,
        });

        if (messages.length >= limit) break;
      }

      return { messages, maxUid, uidValidity };
    } finally {
      lock.release();
    }
  }

  public async listMessages(options: MessageQueryOptions = {}): Promise<EmailMessagePage> {
    const limit = options.limit || 20;
    const page = options.page || 1;
    const auth = this.resolveCredentials();
    if (!auth) {
      return { messages: [], totalCount: 0, page, pageSize: limit, hasNextPage: false };
    }

    const hostCheck = await this.validateHosts();
    if (!hostCheck.valid) {
      return { messages: [], totalCount: 0, page, pageSize: limit, hasNextPage: false };
    }

    const foldersToRead = options.folder ? [options.folder] : ['INBOX', 'Sent'];
    const allMessages: NormalizedEmailMessage[] = [];
    const client = this.buildImapClient(auth);
    client.on('error', () => {});

    try {
      await client.connect();
      for (const fld of foldersToRead) {
        const res = await this.fetchFolderMessages(client, fld, 0, limit);
        allMessages.push(...res.messages);
      }
      await client.logout().catch(() => client.close());
    } catch {
      try {
        client.close();
      } catch {}
    }

    return {
      messages: allMessages.slice(0, limit),
      totalCount: allMessages.length,
      page,
      pageSize: limit,
      hasNextPage: allMessages.length > limit,
    };
  }

  public async getMessage(providerMessageId: string): Promise<NormalizedEmailMessage> {
    const auth = this.resolveCredentials();
    if (!auth) {
      throw new Error(`AUTHORIZATION_REQUIRED: Cannot retrieve IMAP message ${providerMessageId} without an authenticated live IMAP session.`);
    }
    const page = await this.listMessages({ limit: 50 });
    const found = page.messages.find(
      (m) => m.providerMessageId === providerMessageId || m.id === providerMessageId
    );
    if (!found) {
      throw new Error(`MESSAGE_NOT_FOUND: IMAP message ${providerMessageId} not found in mailbox.`);
    }
    return found;
  }

  public async syncMessages(param?: string | { cursor?: string; folders?: string[]; maxMessages?: number }): Promise<SyncResult> {
    const cursorStr = typeof param === 'string' ? param : param?.cursor;
    const requestedFolders = (typeof param === 'object' && param?.folders?.length ? param.folders : ['INBOX', 'Sent']);
    const maxMessages = (typeof param === 'object' && param?.maxMessages) || 50;

    const oldCursor = cursorStr || `UIDVALIDITY:${this.lastUidValidity}:UID:${this.lastUid}`;
    const auth = this.resolveCredentials();
    if (!auth) {
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        oldCursor,
        newCursor: oldCursor,
        cursorType: 'IMAP_UID_SEQUENCE',
        checkpointId: '',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: 'AUTHORIZATION_REQUIRED: Missing IMAP authentication credentials.',
      };
    }

    const hostCheck = await this.validateHosts();
    if (!hostCheck.valid) {
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        oldCursor,
        newCursor: oldCursor,
        cursorType: 'IMAP_UID_SEQUENCE',
        checkpointId: '',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: hostCheck.reason || 'SSRF validation failed.',
      };
    }

    // Parse UID cursor if present (e.g. UIDVALIDITY:123:UID:4)
    let sinceUid = this.lastUid;
    const parsedMatch = cursorStr?.match(/UIDVALIDITY:(\d+):UID:(\d+)/);
    if (parsedMatch) {
      const cursorUidVal = Number(parsedMatch[1]);
      if (this.lastUidValidity === 0 || cursorUidVal === this.lastUidValidity) {
        sinceUid = Number(parsedMatch[2]);
      } else {
        sinceUid = 0; // UIDVALIDITY rotated; full folder resync
      }
    }

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      const imported: NormalizedEmailMessage[] = [];
      let nextUid = sinceUid;
      let nextValidity = this.lastUidValidity;

      for (const fld of requestedFolders) {
        const fldSince = fld.toUpperCase() === 'INBOX' ? sinceUid : 0;
        const fldRes = await this.fetchFolderMessages(client, fld, fldSince, maxMessages);
        imported.push(...fldRes.messages);
        if (fld.toUpperCase() === 'INBOX') {
          if (fldRes.maxUid > nextUid) nextUid = fldRes.maxUid;
          if (fldRes.uidValidity > 0) nextValidity = fldRes.uidValidity;
        }
      }

      await client.logout().catch(() => client.close());

      this.lastUid = nextUid;
      this.lastUidValidity = nextValidity;
      this.isConnected = true;
      const newCursor = `UIDVALIDITY:${this.lastUidValidity}:UID:${this.lastUid}`;
      const threadSet = new Set(imported.map((m) => m.threadId));

      return {
        success: true,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        messages: imported,
        messagesImported: imported.length,
        duplicatesSkipped: 0,
        threadsReconstructed: threadSet.size,
        oldCursor,
        newCursor,
        cursorType: 'IMAP_UID_SEQUENCE',
        checkpointId: `chk-imap-${Date.now()}`,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      try {
        client.close();
      } catch {}
      this.isConnected = false;
      return {
        success: false,
        connectionId: this.connectionId,
        provider: this.provider,
        mailboxEmail: this.config.emailAddress,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        oldCursor,
        newCursor: oldCursor,
        cursorType: 'IMAP_UID_SEQUENCE',
        checkpointId: '',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: isAuthError(err)
          ? `AUTHENTICATION_FAILED: ${err?.message || 'IMAP login rejected'}`
          : `IMAP_SYNC_ERROR: ${err?.message || 'Unable to synchronize mailbox'}`,
      };
    }
  }

  public async sendMessage(message: ApprovedOutboundMessage): Promise<SendResult> {
    if (!message.approvalRecordId || !message.approvedByUserId) {
      throw new Error('POLICY_VIOLATION: Unapproved outbound dispatch rejected. Human executive approval required.');
    }

    if (message.approvedByUserId.startsWith('ai-') || message.approvedByName.toLowerCase().includes('agent')) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

    const isLiveSending = process.env.LIVE_EMAIL_SENDING_ENABLED === 'true';
    if (!isLiveSending) {
      return {
        success: true,
        dispatchId: `disp-imap-${Date.now()}`,
        deliveryState: 'STAGED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
      };
    }

    const hostCheck = await this.validateHosts();
    if (!hostCheck.valid) {
      return {
        success: false,
        dispatchId: `disp-imap-err-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
        error: hostCheck.reason || 'SSRF validation blocked outbound SMTP host.',
      };
    }

    const auth = this.resolveCredentials();
    if (!auth) {
      return {
        success: false,
        dispatchId: `disp-imap-auth-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
        error: 'AUTHENTICATION_FAILED: Missing SMTP credentials in encrypted backend vault.',
      };
    }

    const transporter = this.buildSmtpTransporter(auth);
    try {
      const info = await transporter.sendMail({
        from: message.senderAccount || this.config.emailAddress,
        to: message.to,
        cc: message.cc,
        bcc: message.bcc,
        subject: message.subject,
        text: message.bodyText || '',
        html: message.bodyHtml,
        inReplyTo: message.inReplyTo,
        references: message.references,
        headers: {
          'X-Phumulani-Approval-Id': message.approvalRecordId,
          'X-Phumulani-Idempotency-Key': message.idempotencyKey,
        },
      });
      transporter.close();

      return {
        success: true,
        dispatchId: `disp-imap-${Date.now()}`,
        providerMessageId: info.messageId,
        deliveryState: 'PROVIDER_ACCEPTED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
      };
    } catch (err: any) {
      try {
        transporter.close();
      } catch {}
      const ambiguous = isAmbiguousTimeoutError(err);
      return {
        success: false,
        dispatchId: `disp-imap-${ambiguous ? 'ambig' : 'err'}-${Date.now()}`,
        deliveryState: ambiguous ? 'RECONCILIATION_REQUIRED' : 'FAILED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
        error: ambiguous
          ? `SMTP timeout/ambiguous termination (${err?.message || 'timeout'}). Reconciliation required before retry.`
          : `SMTP dispatch rejected: ${err?.message || String(err)}`,
      };
    }
  }

  public async saveDraft(message: EmailDraft): Promise<DraftResult> {
    const draftId = `draft-imap-${Date.now()}`;
    const auth = this.resolveCredentials();
    if (!auth) {
      return {
        success: true,
        draftId,
        providerDraftId: `<draft.${Date.now()}@phumulani.org>`,
        version: 1,
        createdAt: new Date().toISOString(),
      };
    }

    const rawMime = [
      `From: ${this.config.emailAddress}`,
      `To: ${message.to.join(', ')}`,
      `Subject: ${message.subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      message.bodyText || '',
    ].join('\r\n');

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      await client.append('Drafts', rawMime, ['\\Draft']);
      await client.logout().catch(() => client.close());
    } catch {
      try {
        client.close();
      } catch {}
    }

    return {
      success: true,
      draftId,
      providerDraftId: `<draft.${Date.now()}@phumulani.org>`,
      version: 1,
      createdAt: new Date().toISOString(),
    };
  }

  public async markRead(messageId: string, read: boolean): Promise<void> {
    const auth = this.resolveCredentials();
    if (!auth) return;

    const parts = messageId.split(':');
    const folder = parts.length === 3 ? parts[0] : 'INBOX';
    const uid = parts.length === 3 ? parts[2] : messageId;

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      const lock = await client.getMailboxLock(folder);
      try {
        if (read) {
          await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
        } else {
          await client.messageFlagsRemove(uid, ['\\Seen'], { uid: true });
        }
      } finally {
        lock.release();
      }
      await client.logout().catch(() => client.close());
    } catch {
      try {
        client.close();
      } catch {}
    }
  }

  public async moveMessage(messageId: string, destinationFolder: string): Promise<void> {
    const auth = this.resolveCredentials();
    if (!auth) return;

    const parts = messageId.split(':');
    const folder = parts.length === 3 ? parts[0] : 'INBOX';
    const uid = parts.length === 3 ? parts[2] : messageId;

    const client = this.buildImapClient(auth);
    client.on('error', () => {});
    try {
      await client.connect();
      const lock = await client.getMailboxLock(folder);
      try {
        await client.messageMove(uid, destinationFolder, { uid: true });
      } finally {
        lock.release();
      }
      await client.logout().catch(() => client.close());
    } catch {
      try {
        client.close();
      } catch {}
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.activeCredentials = null;
    oAuthService.deleteMailCredentials(this.connectionId);
    oAuthService.deleteMailCredentials(this.config.emailAddress);
  }

  public getCapabilities(): any {
    return {
      supportsOAuth: false,
      supportsImap: true,
      supportsSmtp: true,
      supportsSmtpAuth: true,
      supportsUidSearch: true,
      supportsApiSending: false,
      supportsFolderSync: true,
      supportsThreading: true,
      supportsPushNotifications: false,
      supportsDeltaSync: false,
      supportsDraftStorage: true,
      supportsAttachments: true,
      supportsReadReceipts: false,
      supportsSentFolderAccess: true,
      supportsTokenRefresh: false,
      supportsDelegatedAccess: false,
      supportedAuthMethods: ['APP_PASSWORD', 'PROVIDER_SUPPORTED_PASSWORD', 'PASSWORD'],
      maxAttachmentSizeBytes: 20971520,
    };
  }
}
