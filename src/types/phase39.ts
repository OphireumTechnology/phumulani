/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 39 Master Data Types
 * Browser Execution Enablement, Runtime Separation, Persistence Concurrency & Financial Classification.
 */

import { SupportedLanguageCode } from './phase33';
import { FinancialAccountingClassification } from './phase38';

export type FinancialEvidenceStatus =
  | 'INTERNAL_RECORD_ONLY'
  | 'DOCUMENT_ATTACHED_UNREVIEWED'
  | 'AUTHORIZED_STAFF_REVIEWED'
  | 'INDEPENDENTLY_RECONCILED'
  | 'UNVERIFIED';

export type FinancialDetailedSettlementStatus =
  | 'PLEDGED'
  | 'PENDING'
  | 'SETTLED_IN_INTERNAL_LEDGER'
  | 'BANK_RECONCILED'
  | 'REFUNDED'
  | 'RESTRICTED'
  | 'UNRESTRICTED'
  | 'BUDGETED'
  | 'AWARDED'
  | 'RECEIVED';

export interface Phase39FinancialEvidenceRecord {
  recordId: string;
  amount: number;
  currency: string;
  recordType: string;
  source: string;
  evidenceStatus: FinancialEvidenceStatus;
  settlementStatus: FinancialDetailedSettlementStatus;
  accountingClassification: FinancialAccountingClassification;
  bankingEvidenceType: 'NONE' | 'INTERNAL_CPA_RECEIPT' | 'STATUTORY_GRANT_CONTRACT' | 'THIRD_PARTY_BANK_STATEMENT';
  thirdPartyBankReconciled: boolean;
  notes: string;
}

export interface PersistenceConcurrencyResult {
  engine: string;
  concurrentWritersTested: number;
  totalRecordsWritten: number;
  recordsRecovered: number;
  dataLossDetected: boolean;
  concurrencyLockEnforced: boolean;
  checksumMatches: boolean;
  durationMs: number;
  limitationNotice: string;
}

export interface LanguageQAReviewPacket {
  code: SupportedLanguageCode;
  name: string;
  localName: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  scriptEncodingValid: boolean;
  reviewStatus: 'APPROVED' | 'SUPERVISED_COMMUNITY_REVIEW' | 'DRAFT_MACHINE_ASSISTED';
  priorityCategories: {
    categoryName: string;
    keysCount: number;
    requiresHumanElderSignoff: boolean;
    sampleTerms: string[];
  }[];
  qaVerificationNotes: string;
}

export interface Phase39AcceptanceAssessment {
  developmentStatus: 'DEVELOPMENT_ACCEPTED' | 'DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS' | 'DEVELOPMENT_BLOCKED';
  productionDeploymentStatus: 'PRODUCTION_DEPLOYMENT_NOT_VERIFIED' | 'PRODUCTION_DEPLOYED';
  checklistPassing: number;
  checklistTotal: number;
  summary: string;
  runtimeSeparationEnforced: boolean;
  browserExecutionSummary: {
    environment: string;
    testsDiscovered: number;
    testsExecuted: number;
    testsPassed: number;
    testsBlocked: number;
    blockerReason: string;
  };
  infrastructureStatus: {
    POSTGRESQL: string;
    BACKEND_HOSTING: string;
    GOOGLE_WORKSPACE: string;
    PAYMENT_GATEWAY: string;
    AI_MODELS: string;
  };
}
