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
}

export interface KnowledgeCitation {
  sourceDocumentId: string;
  title: string;
  approvalDate: string;
  owner: string;
  evidenceReference: string;
  isAuditedOrApproved: boolean;
}

export interface KnowledgeRetrievalResult {
  documents: VerifiedKnowledgeDocument[];
  citations: KnowledgeCitation[];
  hasVerifiedFacts: boolean;
  contextText: string;
  missingFactNotice?: string;
}
