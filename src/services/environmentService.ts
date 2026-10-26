/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Production Environment Configuration & Operational Mode Controller
 * Grounded in Master Directive Phase 19 (M19.01, M19.02, M19.03, M19.14)
 */

export type PhumulaniOperationalMode = 'PRODUCTION_ONLY' | 'STAGED_DEVELOPMENT';

export interface PhumulaniEnvironmentConfig {
  nodeEnv: string;
  phumulaniEnvironment: string;
  operationalMode: PhumulaniOperationalMode;
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
  private static operationalMode: PhumulaniOperationalMode = 'PRODUCTION_ONLY';

  public static getOperationalMode(): PhumulaniOperationalMode {
    if (typeof process !== 'undefined' && process.env?.PHUMULANI_OPERATIONAL_MODE) {
      return (process.env.PHUMULANI_OPERATIONAL_MODE.trim() as PhumulaniOperationalMode) || this.operationalMode;
    }
    return this.operationalMode;
  }

  public static setOperationalMode(mode: PhumulaniOperationalMode): void {
    this.operationalMode = mode;
    if (typeof process !== 'undefined' && process.env) {
      process.env.PHUMULANI_OPERATIONAL_MODE = mode;
    }
  }

  public static getConfig(): PhumulaniEnvironmentConfig {
    const isProdOnly = this.isProductionOnly();

    return {
      nodeEnv: isProdOnly ? 'production' : 'development',
      phumulaniEnvironment: isProdOnly ? 'production' : 'staged-development',
      operationalMode: this.getOperationalMode(),
      enableDemoMode: !isProdOnly,
      enableSyntheticData: !isProdOnly,
      enableFixtureSeeding: !isProdOnly,
      enableMockEmail: !isProdOnly,
      enableMockPayments: false, // Never enable mock payments
      enableMockCrm: !isProdOnly,
      enableSimulatedAiResults: !isProdOnly,
      requireLiveDatabase: isProdOnly,
      requireRealProviderVerification: true,
      requireHumanEmailApproval: true, // Always mandatory
      requireFinancialEvidence: true, // Always mandatory
      allowJsonProductionFallback: !isProdOnly,
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
    return this.isProductionOnly();
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
    // If no live merchant API credentials exist, report truthfully
    return 'NOT_CONNECTED';
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
