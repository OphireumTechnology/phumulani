/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 36 Master Data Types
 * Platform Reliability, Data Integrity, Security Hardening & Production-Quality User Experience
 */

import { UserRole } from './index';

// =============================================================================
// M36.01: TRACEABILITY MATRIX & REPOSITORY AUDIT
// =============================================================================

export interface TraceabilityMatrixItem {
  id: string;
  featureName: string;
  category: 'PUBLIC_PORTAL' | 'MEMBER_PORTAL' | 'VOLUNTEER' | 'DONOR_FUNDRAISING' | 'GRANTS' | 'EXECUTIVE_GOVERNANCE' | 'AI_WORKFORCE' | 'OPERATIONS';
  frontendComponent: string;
  canonicalService: string;
  backendApiRoute: string;
  authorizationRequirement: string;
  persistenceModel: string;
  testCoverageId: string;
  implementationState: 'IMPLEMENTED_VERIFIED' | 'REPAIRED_PHASE36' | 'PLANNED_DEFERRED';
  dataOrigin: 'REAL_PERSISTED_DATA' | 'LABELED_DEMO_CONTENT' | 'ISOLATED_TEST_FIXTURE';
}

// =============================================================================
// M36.02: HARDCODED DATA AUDIT & ELIMINATION
// =============================================================================

export type DataOriginClassification =
  | 'LEGITIMATE_STATIC_CONFIG'
  | 'ISOLATED_TEST_FIXTURE'
  | 'LABELED_DEMO_CONTENT'
  | 'MISLEADING_OPERATIONAL_DATA'
  | 'REAL_PERSISTED_DATA';

export interface HardcodedDataAuditRecord {
  id: string;
  operationalDomain: string;
  location: string;
  reportedValue: string;
  classification: DataOriginClassification;
  remediationAction: 'PRESERVED_LEGITIMATE' | 'REPLACED_WITH_CANONICAL_QUERY' | 'ISOLATED_IN_TEST_SUITE' | 'EMPTY_STATE_FALLBACK';
  verifiedSourceTable?: string;
  notes: string;
}

// =============================================================================
// M36.03: CANONICAL DASHBOARD SERVICE INTEGRATION
// =============================================================================

export interface CanonicalDashboardSyncStatus {
  dashboardName: string;
  dashboardPath: string;
  authorizedRoles: string[];
  canonicalSourceCollection: string;
  recordCount: number;
  lastSyncTimestamp: string;
  dataFreshnessMs: number;
  syncState: 'SYNCHRONIZED' | 'STALE' | 'OFFLINE';
  crossModulePropagationVerified: boolean;
}

// =============================================================================
// M36.04: PERSISTENCE & CRUD RELIABILITY
// =============================================================================

export interface CrudOperationVerification {
  entityType: string;
  createSupported: boolean;
  readSupported: boolean;
  updateSupported: boolean;
  deleteOrArchiveSupported: boolean;
  concurrencyLockVerified: boolean;
  restartDurabilityVerified: boolean;
  processRestartVerified: boolean;
  lastVerifiedTimestamp: string;
}

// =============================================================================
// M36.05: AUTHENTICATION & SESSION HARDENING
// =============================================================================

export interface PasswordPolicyConfig {
  algorithm: 'PBKDF2_SHA512' | 'ARGON2ID_PLANNED';
  iterations: number;
  saltBytes: number;
  keyLengthBytes: number;
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxFailedAttemptsBeforeLockout: number;
  lockoutDurationMinutes: number;
  sessionTokenEntropyBits: number;
  cookieSameSite: 'Strict' | 'Lax';
  cookieSecureInProduction: boolean;
  cookieHttpOnly: boolean;
}

export interface AuthAuditEvent {
  id: string;
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'MFA_CHALLENGE' | 'MFA_SUCCESS' | 'MFA_FAILED' | 'SESSION_CREATED' | 'SESSION_REVOKED' | 'SESSION_EXPIRED' | 'LOCKOUT_TRIGGERED' | 'PASSWORD_RESET_REQUEST';
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
}

// =============================================================================
// M36.06: AUTHORIZATION & RECORD OWNERSHIP
// =============================================================================

export interface RecordOwnershipPolicy {
  domain: string;
  allowedAccessorRole: string;
  crossTenantAccessAllowed: boolean;
  safeguardingExemption: boolean;
  serverSideEnforced: boolean;
}

export interface AccessAttemptAudit {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorRole: string;
  targetRecordId: string;
  targetRecordOwnerId: string;
  decision: 'ALLOWED' | 'DENIED';
  denialReason?: string;
}

// =============================================================================
// M36.07: SAFEGUARDING PRIVACY & SENSITIVE DATA ISOLATION
// =============================================================================

export type SensitiveDataClassification =
  | 'PUBLIC_COMMUNITY'
  | 'INTERNAL_STAFF_OPERATIONAL'
  | 'CONFIDENTIAL_MEMBER_PII'
  | 'RESTRICTED_SURVIVOR_VAWA_SECTION_1367';

export interface SensitiveDataFieldPolicy {
  modelName: string;
  fieldName: string;
  classification: SensitiveDataClassification;
  maskInUi: boolean;
  excludeFromAuditLogs: boolean;
  excludeFromGeneralSearch: boolean;
  excludeFromAiPrompts: boolean;
  excludeFromExportDumps: boolean;
  authorizedViewingRoles: string[];
}

// =============================================================================
// M36.08: AI AGENT EXECUTION TRUTHFULNESS & RELIABILITY
// =============================================================================

export type AiAgentExecutionTruthState =
  | 'NOT_CONFIGURED'
  | 'READY'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED_VERIFIED'
  | 'COMPLETED_REVIEW_REQUIRED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export interface AiAgentExecutionAuditRecord {
  id: string;
  agentId: string;
  agentCode: string;
  agentName: string;
  division: 'OPERATIONAL' | 'FUNDRAISING' | 'ORGANIZATIONAL';
  taskDescription: string;
  executionState: AiAgentExecutionTruthState;
  providerStatus: 'LIVE_GEMINI_CONNECTED' | 'FALLBACK_DETERMINISTIC' | 'OFFLINE_BLOCKED';
  evidenceSourceList: string[];
  requiresHumanReview: boolean;
  humanReviewDecision?: 'PENDING' | 'APPROVED' | 'REJECTED';
  humanReviewerName?: string;
  humanReviewerRole?: string;
  safeguardingQuarantineApplied: boolean;
  latencyMs: number;
  timestamp: string;
}

// =============================================================================
// M36.09: WORKFLOW & TRANSACTION INTEGRITY
// =============================================================================

export interface WorkflowTransactionBoundary {
  transactionId: string;
  idempotencyKey: string;
  workflowName: string;
  stepName: string;
  status: 'COMMITTED' | 'ROLLED_BACK' | 'IN_FLIGHT';
  compensatingActionExecuted: boolean;
  compensatingActionDetails?: string;
  timestamp: string;
}

// =============================================================================
// M36.10: BROWSER USER JOURNEYS
// =============================================================================

export interface BrowserUserJourneyRecord {
  journeyId: string;
  journeyName: string;
  targetRole: string;
  startingRoute: string;
  endingRoute: string;
  stepsCount: number;
  executionStatus: 'VERIFIED_FRAMEWORK' | 'ENVIRONMENT_LIMITED_REPORTED' | 'FAILED';
  verificationMethod: 'SIMULATED_E2E_CONTRACT' | 'BROWSER_AUTOMATION_HEADLESS';
  testedAt: string;
  durationMs: number;
  notes: string;
}

// =============================================================================
// M36.11: MOBILE & ACCESSIBILITY REMEDIATION
// =============================================================================

export interface MobileAccessibilityAuditReport {
  viewportsTested: Array<{ name: string; width: number; height: number; passed: boolean }>;
  wcagAaCriteriaPassing: number;
  wcagAaCriteriaTotal: number;
  touchTargetCompliancePercent: number; // Must be 100% >= 44x44px
  colorContrastPassing: boolean;
  reducedMotionRespected: boolean;
  keyboardFocusOrderValid: boolean;
  screenReaderAnnouncementsFunctional: boolean;
  safeExitEmergencyFunctional: boolean;
  remediatedItems: string[];
  lastAuditTimestamp: string;
}

// =============================================================================
// M36.13: POSTGRESQL MIGRATION COMPATIBILITY
// =============================================================================

export interface PostgresSchemaMigrationDefinition {
  version: number;
  name: string;
  description: string;
  appliedAt: string;
  rollbackStrategy: string;
  tableCount: number;
  foreignKeyConstraintsEnforced: boolean;
  verifiedCompatibility: boolean;
}
