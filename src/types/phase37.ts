/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 37 Master Consolidation & Reconciliation Type Definitions
 * Grounded in Phase 37 Master Development Directive (M37.01 through M37.15)
 */

export type InventoryClassification =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'DEFECT_CONFIRMED'
  | 'NOT_APPLICABLE';

export interface FeatureInventoryItem {
  id: string;
  featureName: string;
  category: string;
  route: string;
  primaryUiComponent: string;
  canonicalService: string;
  authRequirement: string;
  persistenceAdapter: string;
  automatedTestId: string;
  classificationStatus: InventoryClassification;
  notes: string;
}

export type CanonicalAgentDivision = 'ORGANIZATIONAL' | 'FUNDRAISING';

export interface AgentReconciliationRecord {
  agentId: string; // e.g. 'ORG-AI-001' or 'FUND-AI-001'
  code: string; // e.g. 'ORG 01' or 'AGENT 01'
  name: string;
  canonicalDivision: CanonicalAgentDivision;
  conceptualGrouping: 'ORGANIZATIONAL' | 'FUNDRAISING' | 'OPERATIONAL_SUPPORT';
  assignedRole: string;
  supervisorRole: string;
  supervisorName: string;
  allowedTools: string[];
  prohibitedActions: string[];
  allowedDataClassifications: string[];
  requiresHumanApproval: boolean;
  executionProvider: string;
  currentReadiness: 'READY_FOR_SUPERVISED_PRODUCTION' | 'READY_FOR_SUPERVISED_PILOT' | 'BLOCKED_BY_INTEGRATION';
  safeguardingAccessStatus: 'STRICTLY_ISOLATED_ZERO_DISCLOSURE';
  historicalDivisionMatch: boolean;
}

export interface ServiceConsolidationRecord {
  serviceDomain: string;
  redundantImplementations: string[];
  authoritativeService: string;
  compatibilityAdapterPresent: boolean;
  migrationStatus: 'CONSOLIDATED' | 'COMPATIBILITY_WRAPPED' | 'AUTHORITATIVE_PRESERVED';
  notes: string;
}

export interface PortalSyncParityRecord {
  portalId: string;
  portalName: string;
  primaryEntity: string;
  canonicalService: string;
  measuredSyncLatencyMs: number;
  isAuthorizedView: boolean;
  stateParityVerified: boolean;
  durabilityLevel: 'IN_MEMORY_SINGLETON' | 'LOCAL_STORAGE_DURABLE' | 'POSTGRESQL_STAGED_READY';
}

export interface FinancialReconciliationRecord {
  category: 'PROGRAM_BUDGET' | 'DONOR_LIFETIME' | 'PIPELINE_PLEDGES' | 'LIQUID_CASH' | 'RESTRICTED_FUNDS';
  recordId: string;
  reportedFigureUSD: number;
  actualVerifiedFigureUSD: number;
  accountingClassification: 'APPROVED_ALLOCATION' | 'CUMULATIVE_GIVING' | 'UNEARNED_PLEDGE' | 'SETTLED_CASH_IN_BANK';
  isSegregatedFromLiquidCash: boolean;
  notes: string;
}

export interface ServiceRequestLifecycleRecord {
  requestId: string;
  memberId: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status:
    | 'SUBMITTED'
    | 'TRIAGED'
    | 'COORDINATOR_ASSIGNED'
    | 'RESOURCE_SELECTED'
    | 'REFERRAL_REVIEWED'
    | 'SHARED_WITH_MEMBER'
    | 'FOLLOWUP_RECORDED'
    | 'RESOLVED'
    | 'FEEDBACK_SUBMITTED';
  coordinatorName?: string;
  selectedResourceId?: string;
  confidentialLocationMasked: boolean;
  slaHoursRemaining: number;
  feedbackScore?: number;
  timelineEvents: Array<{ status: string; timestamp: string; actor: string; note: string }>;
}

export interface ProgramConcurrencyEnrollmentResult {
  programId: string;
  programName: string;
  maxCapacity: number;
  initialEnrollment: number;
  requestA: { participantId: string; status: 'ENROLLED' | 'WAITLISTED'; timestamp: string };
  requestB: { participantId: string; status: 'ENROLLED' | 'WAITLISTED'; timestamp: string };
  finalEnrollmentCount: number;
  waitlistCount: number;
  capacityNeverExceeded: boolean;
}

export interface VolunteerClearanceRecord {
  volunteerId: string;
  name: string;
  trainingCompleted: boolean;
  backgroundCheckStatus: 'NOT_SUBMITTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  supervisorVerifiedClearance: boolean;
  clearanceApprovedBy?: string;
  clearanceApprovalTimestamp?: string;
  scheduledHours: number;
  reportedHours: number;
  supervisorVerifiedHours: number;
  restrictedDutyAssignmentAllowed: boolean;
}

export type DataSecurityClassification =
  | 'RESTRICTED_SAFEGUARDING'
  | 'CONFIDENTIAL_SURVIVOR'
  | 'INTERNAL_OPERATIONAL'
  | 'GENERAL_PUBLIC';

export interface ClassificationSafeguardingRecord {
  recordId: string;
  entityType: string;
  title: string;
  content: string;
  classification: DataSecurityClassification;
  containsCrisisKeywords: boolean;
  isBlockedFromGeneralSearch: boolean;
  isBlockedFromAiAgents: boolean;
  isBlockedFromGeneralReports: boolean;
  isBlockedFromPublicRoutes: boolean;
  safeReviewPathAllowed: boolean;
}

export interface LanguageCoverageMatrixItem {
  code: string;
  languageName: string;
  nativeName: string;
  coverageStatus: 'VERIFIED_PRODUCTION' | 'SUPERVISED_COMMUNITY_REVIEW' | 'FALLBACK_TO_ENGLISH';
  totalDictionaryKeys: number;
  translatedKeysCount: number;
  fallbackToEnglishCount: number;
  dateAndNumberFormattingVerified: boolean;
}

export interface PostgresMigrationVerificationItem {
  version: number;
  filename: string;
  description: string;
  orderValid: boolean;
  upScriptValid: boolean;
  downScriptValid: boolean;
  foreignKeyConstraintsEnforced: boolean;
  zeroTaxGuardContamination: boolean;
  executionStatus: 'STATIC_SCHEMA_VALIDATED' | 'RUNTIME_EXECUTED';
}
