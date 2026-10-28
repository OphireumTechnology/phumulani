/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 38 Master Data Types
 * Real Browser Testing, Multilingual Completion, Accessibility Remediation,
 * Persistence & Application Reliability.
 */

import { SupportedLanguageCode } from './phase33';

export type BrowserExecutionStatus =
  | 'EXECUTED_PASSED'
  | 'EXECUTED_FAILED'
  | 'NOT_EXECUTED_SANDBOX_RESTRICTION'
  | 'SKIPPED';

export type PersistenceLevel =
  | 'SIMULATED_RELOAD'
  | 'ACTUAL_PROCESS_RESTART'
  | 'DURABLE_LOCAL_STORAGE'
  | 'REAL_POSTGRESQL'
  | 'PRODUCTION_DATABASE';

export type FinancialAccountingClassification =
  | 'SETTLED_CASH'
  | 'PLEDGED_UNEARNED'
  | 'PENDING_SETTLEMENT'
  | 'PROGRAM_BUDGET_ALLOCATION'
  | 'LIFETIME_GIVING_HISTORICAL'
  | 'UNVERIFIED_PIPELINE';

export interface TraceabilityMatrixItem {
  id: string;
  featureName: string;
  route: string;
  primaryUiComponent: string;
  canonicalService: string;
  dataSource: string;
  authorizationRequirement: string;
  testIdentifier: string;
  testType: 'PLAYWRIGHT_E2E' | 'INTEGRATION_AUTOMATED' | 'STATIC_LINT';
  status: 'VERIFIED' | 'ENVIRONMENT_BLOCKED' | 'PARTIALLY_VERIFIED';
  notes: string;
}

export interface PlaywrightBrowserExecutionResult {
  suiteName: string;
  filePath: string;
  browserTargets: string[];
  testsDiscovered: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  executionStatus: BrowserExecutionStatus;
  blockerReason?: string;
  details: string;
}

export interface LanguageAuditParityItem {
  code: SupportedLanguageCode;
  name: string;
  localName: string;
  coverageStatus: string;
  canonicalKeyCount: number;
  translatedKeyCount: number;
  missingKeyCount: number;
  parityPercentage: number;
  scriptEncodingValid: boolean;
  humanReviewStatus: 'APPROVED' | 'HUMAN_REVIEWED' | 'REVIEW_REQUIRED' | 'DRAFT_MACHINE_ASSISTED' | 'SUPERVISED_COMMUNITY_REVIEW';
}

export interface AccessibilityAuditItem {
  criterion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  componentChecked: string;
  passed: boolean;
  remediationApplied: string;
  evidence: string;
}

export interface PersistenceRestartResult {
  persistenceLevel: PersistenceLevel;
  storageFilePath: string;
  recordIdentifier: string;
  testPayloadChecksum: string;
  initialProcessWritten: boolean;
  actualProcessRestartExecuted: boolean;
  childProcessExitCode: number;
  recordRecoveredAfterRestart: boolean;
  dataIntegrityMatch: boolean;
  unauthorizedAccessRejected: boolean;
  survivesFullProcessTermination: boolean;
  truthfulStorageClassification: string;
}

export interface FinancialReconciliationRecord {
  recordId: string;
  amount: number;
  currency: string;
  recordType: string;
  source: string;
  evidenceStatus: 'VERIFIED_CPA_CONFIRMED' | 'SUBMITTED_PROPOSAL' | 'APPROVED_BOARD_BUDGET' | 'HISTORICAL_DONOR_LEDGER';
  bankingRef?: string;
  receiptNumber?: string;
  accountingClassification: FinancialAccountingClassification;
  dashboardTreatment: 'LIQUID_CASH_IN_BANK' | 'FUTURE_PIPELINE' | 'ANNUAL_EXPENSE_CEILING' | 'DONOR_TIER_BENCHMARK';
  notes: string;
}

export interface CrossPortalSessionVerification {
  sameSessionNavigationReliable: boolean;
  pageReloadPreservesContext: boolean;
  multiTabIsolationMaintained: boolean;
  sessionRevocationImmediatelyEnforced: boolean;
  staleDataHandledSafely: boolean;
  roleSwitchingEnforcesPermissions: boolean;
}

export interface Phase38AcceptanceAssessment {
  developmentStatus: 'DEVELOPMENT_ACCEPTED' | 'DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS' | 'DEVELOPMENT_BLOCKED';
  productionDeploymentStatus: 'PRODUCTION_DEPLOYMENT_NOT_VERIFIED' | 'PRODUCTION_DEPLOYED';
  checklistPassing: number;
  checklistTotal: number;
  summary: string;
  infrastructureStatus: {
    POSTGRESQL: string;
    BACKEND_HOSTING: string;
    GOOGLE_WORKSPACE: string;
    PAYMENT_GATEWAY: string;
    AI_MODELS: string;
  };
}
