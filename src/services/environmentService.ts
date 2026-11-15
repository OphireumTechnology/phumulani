/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Production Environment Configuration & Operational Mode Controller
 * Grounded in Master Directive Phase 19 (M19.01, M19.02, M19.03, M19.14)
 */

export type PhumulaniOperationalMode = 'LOCAL_DEVELOPMENT' | 'STAGED_DEVELOPMENT' | 'PRODUCTION_ONLY';

export interface DatabaseEnvironmentPolicy {
  nodeEnv: string;
  rawOperationalMode: string;
  effectiveMode: PhumulaniOperationalMode;
  requireLiveDatabase: boolean;
  allowEmbeddedFallback: boolean;
  requireStrictTls: boolean;
  policyCode:
    | 'PRODUCTION_ONLY'
    | 'PRODUCTION_AUTHORIZED'
    | 'NODE_ENV_PRODUCTION_DEFAULT'
    | 'STAGED_DEVELOPMENT_AUTHORIZED'
    | 'LOCAL_DEVELOPMENT';
  reason: string;
}

export interface PhumulaniEnvironmentConfig {
  nodeEnv: string;
  phumulaniEnvironment: string;
  operationalMode: PhumulaniOperationalMode;
  isProductionReady: boolean;
  nonProductionNotice: string | null;
  enableDemoMode: boolean;
  enableSyntheticData: boolean;
  enableFixtureSeeding: boolean;
  enableMockEmail: boolean;
  enableMockPayments: boolean;
  enableMockCrm: boolean;
  enableSimulatedAiResults: boolean;
  requireLiveDatabase: boolean;
  requireRealProviderVerification: boolean;
  requireHumanEmailApproval: boolean;
  requireFinancialEvidence: boolean;
  allowJsonProductionFallback: boolean;
  allowSimulatedDispatch: boolean;
  allowUnverifiedRevenue: boolean;
}

export class EnvironmentService {
  private static operationalMode: PhumulaniOperationalMode = 'STAGED_DEVELOPMENT';
  private static liveDatabaseConnectedProbe: (() => boolean) | null = null;

  public static registerLiveDatabaseProbe(probe: () => boolean): void {
    this.liveDatabaseConnectedProbe = probe;
  }

  /**
   * Authoritative, documented database policy shared across EnvironmentService,
   * PostgresPersistenceAdapter, DatabaseMigrationService, and server readiness probes.
   *
   * Rules:
   * 1. PHUMULANI_OPERATIONAL_MODE=PRODUCTION_ONLY or PRODUCTION_AUTHORIZED -> live PostgreSQL mandatory; JSON fallback prohibited.
   * 2. NODE_ENV=production without explicit PHUMULANI_OPERATIONAL_MODE=STAGED_DEVELOPMENT -> live PostgreSQL mandatory; JSON fallback prohibited.
   * 3. PHUMULANI_OPERATIONAL_MODE=LOCAL_DEVELOPMENT -> isolated embedded storage (never allowed in NODE_ENV=production).
   * 4. PHUMULANI_OPERATIONAL_MODE=STAGED_DEVELOPMENT -> isolated test infrastructure / embedded fallback when DATABASE_URL is omitted; never reported as production-ready.
   */
  public static getDatabasePolicy(): DatabaseEnvironmentPolicy {
    const nodeEnv =
      typeof process !== 'undefined' && process.env?.NODE_ENV ? process.env.NODE_ENV.trim() : 'development';
    const rawOperationalMode =
      typeof process !== 'undefined' && process.env?.PHUMULANI_OPERATIONAL_MODE
        ? process.env.PHUMULANI_OPERATIONAL_MODE.trim()
        : '';

    if (rawOperationalMode === 'PRODUCTION_ONLY') {
      return {
        nodeEnv,
        rawOperationalMode,
        effectiveMode: 'PRODUCTION_ONLY',
        requireLiveDatabase: true,
        allowEmbeddedFallback: false,
        requireStrictTls: true,
        policyCode: 'PRODUCTION_ONLY',
        reason: 'PHUMULANI_OPERATIONAL_MODE=PRODUCTION_ONLY enforces mandatory live PostgreSQL and forbids embedded JSON fallback.',
      };
    }

    if (rawOperationalMode === 'PRODUCTION_AUTHORIZED') {
      return {
        nodeEnv,
        rawOperationalMode,
        effectiveMode: 'PRODUCTION_ONLY',
        requireLiveDatabase: true,
        allowEmbeddedFallback: false,
        requireStrictTls: true,
        policyCode: 'PRODUCTION_AUTHORIZED',
        reason: 'PHUMULANI_OPERATIONAL_MODE=PRODUCTION_AUTHORIZED enforces mandatory live PostgreSQL and forbids embedded JSON fallback.',
      };
    }

    if (rawOperationalMode === 'LOCAL_DEVELOPMENT') {
      if (nodeEnv === 'production') {
        return {
          nodeEnv,
          rawOperationalMode,
          effectiveMode: 'PRODUCTION_ONLY',
          requireLiveDatabase: true,
          allowEmbeddedFallback: false,
          requireStrictTls: true,
          policyCode: 'NODE_ENV_PRODUCTION_DEFAULT',
          reason: 'LOCAL_DEVELOPMENT is prohibited when NODE_ENV=production; failing closed into PRODUCTION_ONLY.',
        };
      }
      return {
        nodeEnv,
        rawOperationalMode,
        effectiveMode: 'LOCAL_DEVELOPMENT',
        requireLiveDatabase: false,
        allowEmbeddedFallback: true,
        requireStrictTls: false,
        policyCode: 'LOCAL_DEVELOPMENT',
        reason: 'LOCAL_DEVELOPMENT permits isolated embedded storage and explicit development fixture opt-in without touching production data.',
      };
    }

    if (rawOperationalMode === 'STAGED_DEVELOPMENT') {
      return {
        nodeEnv,
        rawOperationalMode,
        effectiveMode: 'STAGED_DEVELOPMENT',
        requireLiveDatabase: false,
        allowEmbeddedFallback: true,
        requireStrictTls: nodeEnv === 'production',
        policyCode: 'STAGED_DEVELOPMENT_AUTHORIZED',
        reason: 'PHUMULANI_OPERATIONAL_MODE=STAGED_DEVELOPMENT permits isolated non-production test infrastructure and is never production-ready.',
      };
    }

    if (nodeEnv === 'production') {
      return {
        nodeEnv,
        rawOperationalMode,
        effectiveMode: 'PRODUCTION_ONLY',
        requireLiveDatabase: true,
        allowEmbeddedFallback: false,
        requireStrictTls: true,
        policyCode: 'NODE_ENV_PRODUCTION_DEFAULT',
        reason: 'NODE_ENV=production requires a live PostgreSQL database unless PHUMULANI_OPERATIONAL_MODE=STAGED_DEVELOPMENT is explicitly authorized.',
      };
    }

    return {
      nodeEnv,
      rawOperationalMode,
      effectiveMode: this.operationalMode,
      requireLiveDatabase: this.operationalMode === 'PRODUCTION_ONLY',
      allowEmbeddedFallback: this.operationalMode !== 'PRODUCTION_ONLY',
      requireStrictTls: false,
      policyCode: 'LOCAL_DEVELOPMENT',
      reason: 'Local development mode allows isolated embedded durable storage when DATABASE_URL is omitted.',
    };
  }

  public static getOperationalMode(): PhumulaniOperationalMode {
    return this.getDatabasePolicy().effectiveMode;
  }

  public static setOperationalMode(mode: PhumulaniOperationalMode): void {
    this.operationalMode = mode;
    if (typeof process !== 'undefined' && process.env) {
      process.env.PHUMULANI_OPERATIONAL_MODE = mode;
    }
  }

  public static isLocalDevelopment(): boolean {
    return this.getOperationalMode() === 'LOCAL_DEVELOPMENT';
  }

  public static getNonProductionStatusBanner(): string | null {
    const mode = this.getOperationalMode();
    if (mode === 'PRODUCTION_ONLY') return null;
    if (mode === 'LOCAL_DEVELOPMENT') {
      return 'NON-PRODUCTION MODE (LOCAL_DEVELOPMENT): Isolated local embedded storage active; production data connections blocked.';
    }
    return 'NON-PRODUCTION MODE (STAGED_DEVELOPMENT): Isolated staging test infrastructure active; not certified for live production traffic.';
  }

  public static getConfig(): PhumulaniEnvironmentConfig {
    const policy = this.getDatabasePolicy();
    const isProdOnly = policy.effectiveMode === 'PRODUCTION_ONLY';
    const isLocalDev = policy.effectiveMode === 'LOCAL_DEVELOPMENT';
    const explicitDevFixturesEnabled =
      typeof process !== 'undefined' &&
      (process.env?.PHUMULANI_ENABLE_DEV_FIXTURES === 'true' ||
        process.env?.PHUMULANI_EMAIL_TEST_FIXTURES === 'true' ||
        process.env?.PHUMULANI_EMAIL_TEST_FIXTURES === '1');

    return {
      nodeEnv: isProdOnly ? 'production' : policy.nodeEnv || 'development',
      phumulaniEnvironment: isProdOnly ? 'production' : isLocalDev ? 'local-development' : 'staged-development',
      operationalMode: policy.effectiveMode,
      isProductionReady: isProdOnly,
      nonProductionNotice: this.getNonProductionStatusBanner(),
      enableDemoMode: !isProdOnly,
      enableSyntheticData: !isProdOnly,
      enableFixtureSeeding: isProdOnly ? false : isLocalDev ? explicitDevFixturesEnabled : true,
      enableMockEmail: !isProdOnly,
      enableMockPayments: false, // Never enable mock payments
      enableMockCrm: !isProdOnly,
      enableSimulatedAiResults: !isProdOnly,
      requireLiveDatabase: policy.requireLiveDatabase,
      requireRealProviderVerification: true,
      requireHumanEmailApproval: true, // Always mandatory
      requireFinancialEvidence: true, // Always mandatory
      allowJsonProductionFallback: policy.allowEmbeddedFallback,
      allowSimulatedDispatch: false, // Dispatches must never be silently simulated without notification
      allowUnverifiedRevenue: false, // Never allow unverified revenue
    };
  }

  public static isProductionOnly(): boolean {
    return this.getOperationalMode() === 'PRODUCTION_ONLY';
  }

  public static isSyntheticDataAllowed(): boolean {
    return !this.isProductionOnly();
  }

  public static isLiveDatabaseRequired(): boolean {
    return this.getDatabasePolicy().requireLiveDatabase;
  }

  public static isRealProviderVerificationRequired(): boolean {
    return true;
  }

  public static isHumanEmailApprovalRequired(): boolean {
    return true;
  }

  public static isSimulatedDispatchAllowed(): boolean {
    return false;
  }

  public static getPaymentProviderStatus(): 'CONNECTED' | 'NOT_CONNECTED' | 'STAGED_PENDING_AUTH' {
    if (typeof process !== 'undefined' && Boolean(process.env?.STRIPE_SECRET_KEY?.trim())) {
      return 'CONNECTED';
    }
    return 'NOT_CONNECTED';
  }

  public static getInfrastructureStatuses(): {
    POSTGRESQL: 'NOT_CONNECTED' | 'CONNECTED';
    GOOGLE_WORKSPACE: 'AUTHORIZATION_REQUIRED' | 'CONNECTED';
    PAYMENT_GATEWAY: 'NOT_CONNECTED' | 'CONNECTED';
    LIVE_EMAIL_SYNCHRONIZATION: 'NOT_ACTIVATED' | 'ACTIVATED';
  } {
    const hasDatabaseUrl = typeof process !== 'undefined' && Boolean(process.env?.DATABASE_URL?.trim());
    const pgConnected = hasDatabaseUrl && (this.liveDatabaseConnectedProbe ? this.liveDatabaseConnectedProbe() : false);
    return {
      POSTGRESQL: pgConnected ? 'CONNECTED' : 'NOT_CONNECTED',
      GOOGLE_WORKSPACE: 'AUTHORIZATION_REQUIRED',
      PAYMENT_GATEWAY: this.getPaymentProviderStatus() === 'CONNECTED' ? 'CONNECTED' : 'NOT_CONNECTED',
      LIVE_EMAIL_SYNCHRONIZATION: 'NOT_ACTIVATED',
    };
  }

  public static getFinancialDataSource(): 'AUTHORIZED_RECORDS_ONLY' | 'FIXTURES_ALLOWED' {
    return this.isProductionOnly() ? 'AUTHORIZED_RECORDS_ONLY' : 'FIXTURES_ALLOWED';
  }

  /**
   * Filters out demonstration records ($325k campaign fixtures, $175k soft pledges, $50k test transactions)
   * when running in PRODUCTION_ONLY mode.
   */
  public static filterProductionDonations<T extends { id?: string; amount?: number; isSynthetic?: boolean; paymentStatus?: string }>(
    donations: T[]
  ): T[] {
    if (!this.isProductionOnly()) {
      return donations;
    }

    // In PRODUCTION_ONLY mode: only include verified, non-synthetic records with real payment status
    return donations.filter((d) => {
      if (d.isSynthetic) return false;
      if (d.id?.includes('synth') || d.id?.includes('fixture') || d.id?.includes('test-trans')) return false;
      if (d.amount === 325000 || d.amount === 175000 || d.amount === 50000) return false;
      return d.paymentStatus === 'succeeded' || d.paymentStatus === 'VERIFIED_ACH';
    });
  }

  /**
   * Returns verified financial total. In PRODUCTION_ONLY mode, returns only real confirmed revenue.
   * If the production database contains 0 verified donations, returns 0 truthfully.
   */
  public static calculateVerifiedProductionRevenue<T extends { amount?: number; isSynthetic?: boolean; paymentStatus?: string }>(
    donations: T[]
  ): number {
    const verified = this.filterProductionDonations(donations);
    return verified.reduce((sum, d) => sum + (d.amount || 0), 0);
  }
}
