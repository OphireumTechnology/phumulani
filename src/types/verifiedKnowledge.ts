/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Verified Knowledge & Institutional Source-of-Truth Types
 * Enforces strict separation of settled funding vs projections, verified facts vs simulated demos,
 * and comprehensive audit metadata for all donor-facing AI knowledge.
 */

export type InstitutionalApprovalStatus =
  | 'APPROVED'
  | 'PENDING_REVIEW'
  | 'DRAFT'
  | 'DEPRECATED'
  | 'SIMULATED_DEMO';

export type SourceApprovalStatus =
  | 'PROVISIONAL_DEVELOPMENT_BENCHMARK'
  | 'UNVERIFIED_SEED_DATA'
  | 'PENDING_RATIFICATION'
  | 'BOARD_VERIFIED_AUTHENTIC';

export type AccessClassification =
  | 'PUBLIC'
  | 'DONOR_FACING'
  | 'INTERNAL_CONFIDENTIAL'
  | 'VAWA_PROTECTED_RESTRICTED';

export type FinancialFactType =
  | 'SETTLED_ACTUAL'
  | 'CONFIRMED_COMMITMENT'
  | 'PENDING_APPLICATION'
  | 'PIPELINE_OPPORTUNITY'
  | 'ANALYTICAL_PROJECTION';

export interface VerifiedSourceMetadata {
  sourceDocumentId: string;
  institutionalApprovalStatus: InstitutionalApprovalStatus;
  sourceApprovalStatus?: SourceApprovalStatus;
  isProvisionalBenchmark: boolean;
  recordOwner: string;
  approvalDate: string;
  effectiveDate: string;
  lastVerificationDate: string;
  reviewExpirationDate: string;
  accessClassification: AccessClassification;
  programId?: string;
  evidenceReference: string;
  isDemoData: boolean;
  verificationHash?: string;
  ratifiedByBoardMinuteRef?: string;
  isExpired?: boolean;
  requiresReverification?: boolean;
}

export type KnowledgeCategory =
  | 'FOUNDATION_OVERVIEW'
  | 'PROGRAM_OBJECTIVE'
  | 'BUDGET_FINANCIAL'
  | 'BENEFICIARY_METRIC'
  | 'GOVERNANCE_LEADERSHIP'
  | 'IMPACT_CASE_STUDY'
  | 'INSTITUTIONAL_POLICY';

export interface VerifiedKnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  content: string;
  keyFacts: string[];
  metadata: VerifiedSourceMetadata;
  tags: string[];
}

export interface VerifiedFinancialFact {
  factId: string;
  financialType: FinancialFactType;
  period: string;
  amountUSD: number;
  description: string;
  isAudited: boolean;
  auditOfficerOrFirm: string;
  metadata: VerifiedSourceMetadata;
}

export interface KnowledgeRetrievalQuery {
  query: string;
  programId?: string;
  categories?: KnowledgeCategory[];
  accessLevel?: AccessClassification;
  allowDemo?: boolean;
  limit?: number;
  userRole?: string;
}

export interface KnowledgeCitation {
  sourceDocumentId: string;
  title: string;
  approvalDate: string;
  owner: string;
  evidenceReference: string;
  isAuditedOrApproved: boolean;
  isProvisionalBenchmark: boolean;
  sourceApprovalStatus: SourceApprovalStatus;
}

export interface KnowledgeRetrievalResult {
  documents: VerifiedKnowledgeDocument[];
  citations: KnowledgeCitation[];
  hasVerifiedFacts: boolean;
  contextText: string;
  missingFactNotice?: string;
  rbacFilteredCount?: number;
}

export interface SourceApprovalAuditItem {
  documentId: string;
  title: string;
  category: KnowledgeCategory;
  sourceApprovalStatus: SourceApprovalStatus;
  isProvisionalBenchmark: boolean;
  evidenceReference: string;
  lastVerificationDate: string;
  reviewExpirationDate: string;
  isExpired: boolean;
  requiresReverification?: boolean;
  recordOwner: string;
  notes: string;
}

export interface SourceApprovalAuditReport {
  timestamp: string;
  totalDocumentsAudited: number;
  provisionalBenchmarkCount: number;
  unverifiedSeedCount: number;
  boardVerifiedCount: number;
  expiredCount: number;
  auditItems: SourceApprovalAuditItem[];
  items?: SourceApprovalAuditItem[];
  institutionalIntegrityNotice: string;
  summary?: string;
  verificationPolicy?: string;
}
