/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 33 Master Data Types
 * Advanced Community Operations, AI Automation & Platform Enhancement
 */

import { UserRole, CanonicalRoleFamily } from './index';
import { AgentDivision } from './aiWorkforce';

// =============================================================================
// M33.01: UNIFIED COMMUNITY OPERATIONS CENTER
// =============================================================================
export type OperationalPriority = 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'CRITICAL_URGENT';
export type OperationItemType =
  | 'SERVICE_REQUEST'
  | 'PROGRAM_ACTIVITY'
  | 'VOLUNTEER_DEPLOYMENT'
  | 'COMMUNITY_EVENT'
  | 'OUTREACH_INITIATIVE'
  | 'PARTNERSHIP_MOU'
  | 'RESOURCE_DISTRIBUTION'
  | 'APPROVAL_GATE'
  | 'ORGANIZATIONAL_TASK'
  | 'GOVERNANCE_ACTION';

export type OperationItemStatus =
  | 'OPEN'
  | 'PENDING_APPROVAL'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ESCALATED';

export interface UnifiedOperationRecord {
  id: string; // e.g. 'OP-2026-001'
  type: OperationItemType;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  canonicalSourceRef: string; // Links to source entity (e.g. 'SRV-001', 'PROG-002', 'EVT-004')
  priority: OperationalPriority;
  status: OperationItemStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  deadline?: string;
  isEscalated: boolean;
  escalationReason?: string;
  workflowHistory: {
    id: string;
    timestamp: string;
    actor: string;
    actorRole: string;
    action: string;
    notes?: string;
  }[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M33.03: VOLUNTEER INTELLIGENCE & ENGAGEMENT
// =============================================================================
export type VolunteerClearanceStatus =
  | 'APPLICATION_SUBMITTED'
  | 'IDENTITY_VERIFIED'
  | 'BACKGROUND_CHECK_PENDING'
  | 'CLEARANCE_VERIFIED'
  | 'RENEWAL_REQUIRED'
  | 'DISQUALIFIED';

export type VolunteerRetentionRisk = 'EXCELLENT' | 'STABLE' | 'MODERATE' | 'AT_RISK_INACTIVE';

export interface VolunteerSkillProfile {
  id: string;
  volunteerId: string;
  volunteerName: string;
  email: string;
  phone?: string;
  skills: string[]; // e.g. ['Youth Mentoring', 'Somali Translation', 'Digital Literacy', 'Food Prep']
  availabilityDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
  preferredTimeOfDay: ('MORNING' | 'AFTERNOON' | 'EVENING')[];
  maxHoursPerWeek: number;
  totalServiceHoursYTD: number;
  completedTrainingModuleIds: string[];
  clearanceStatus: VolunteerClearanceStatus;
  clearanceVerifiedBy?: string;
  clearanceVerifiedAt?: string;
  retentionRisk: VolunteerRetentionRisk;
  lastActiveDate: string;
  assignedProgramIds: string[];
  supervisorNotes?: string;
}

export interface VolunteerMatchRecommendation {
  opportunityId: string;
  opportunityTitle: string;
  programName: string;
  volunteerId: string;
  volunteerName: string;
  overallMatchScore: number; // 0 - 100
  scoreFactors: {
    skillMatchPercentage: number;
    scheduleAlignmentPercentage: number;
    clearanceEligibility: boolean;
    proximityOrRemoteAffinity: number;
  };
  explanation: string;
  generatedAt: string;
}

// =============================================================================
// M33.04: ADVANCED COMMUNITY PROGRAM MANAGEMENT
// =============================================================================
export interface ProgramEligibilityRule {
  id: string;
  name: string;
  description: string;
  requiredCriteria: string[];
  allowedGeographies: string[];
  documentationRequired: string[];
  allowExceptionsWithExecutiveApproval: boolean;
}

export interface ProgramWaitlistEntry {
  id: string;
  programId: string;
  applicantIdentifier: string; // Obfuscated token or non-sensitive reference
  requestedCategory: string;
  position: number;
  dateAdded: string;
  priorityScore: number;
  status: 'WAITING' | 'OFFERED_SEAT' | 'ENROLLED' | 'WITHDRAWN';
}

export interface EnhancedCommunityProgramDetail {
  programId: string;
  eligibilityRule: ProgramEligibilityRule;
  maxEnrollmentCapacity: number;
  currentEnrolledCount: number;
  waitlistedCount: number;
  schedulesSummary: string[];
  requiredStaffRoles: string[];
  leadProgramManager: {
    id: string;
    name: string;
    email: string;
  };
  keyMilestones: {
    id: string;
    title: string;
    targetDate: string;
    isCompleted: boolean;
    outcomeSummary?: string;
  }[];
}

// =============================================================================
// M33.05: ADVANCED FUNDRAISING INTELLIGENCE
// =============================================================================
export interface FundraisingForecastItem {
  id: string;
  periodLabel: string; // e.g. '2026-Q4'
  projectedRevenueLow: number;
  projectedRevenueExpected: number;
  projectedRevenueHigh: number;
  confidenceScore: number; // 0 - 100
  forecastAssumptions: string[];
  dataFreshnessTimestamp: string;
  isPledgeIncludedAsSettled: false; // Must ALWAYS be false
}

export interface GrantPrioritizationRank {
  grantOpportunityId: string;
  grantTitle: string;
  funderName: string;
  amountRequested: number;
  deadlineDate: string;
  strategicAlignmentScore: number; // 1 - 100
  winProbabilityScore: number; // 1 - 100
  urgencyDaysLeft: number;
  priorityTier: 'TIER_1_TOP_PRIORITY' | 'TIER_2_HIGH' | 'TIER_3_OPPORTUNISTIC';
  recommendedLeadAgentId: string; // e.g. 'FUND-AI-002'
  stewardedStaffId: string;
}

// =============================================================================
// M33.06: ADVANCED 36-AGENT AI WORKFORCE COLLABORATION
// =============================================================================
export interface CrossAgentTaskPlan {
  planId: string;
  title: string;
  initiatingAgentId: string;
  initiatingSupervisorRole: string;
  leadDepartment: string;
  status: 'PLANNED' | 'IN_EXECUTION' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'HALTED_BY_EMERGENCY';
  tasks: {
    taskId: string;
    assignedAgentId: string;
    actionName: string;
    dependsOnTaskIds: string[];
    status: 'QUEUED' | 'IN_PROGRESS' | 'DONE' | 'FAILED' | 'AWAITING_HUMAN_APPROVAL';
    allowedPermissions: string[];
    resultSnippet?: string;
  }[];
  executionBudgetUSD: number;
  actualCostUSD: number;
  humanSignOffRequired: boolean;
  humanApproverId?: string;
  createdAt: string;
  completedAt?: string;
}

// =============================================================================
// M33.08: BOARD GOVERNANCE PORTAL
// =============================================================================
export interface BoardMeetingAgendaItem {
  id: string;
  orderNumber: number;
  title: string;
  presenter: string;
  durationMinutes: number;
  isActionItem: boolean;
  associatedResolutionId?: string;
}

export interface BoardResolutionRecord {
  id: string; // e.g. 'RES-2026-004'
  resolutionNumber: string;
  title: string;
  description: string;
  sponsoringCommittee: 'AUDIT_FINANCE' | 'GOVERNANCE_NOMINATING' | 'PROGRAM_IMPACT' | 'EXECUTIVE';
  dateProposed: string;
  status: 'DRAFT' | 'VOTING_OPEN' | 'ADOPTED' | 'DEFEATED' | 'TABLED';
  votesInFavor: number;
  votesAgainst: number;
  votesAbstain: number;
  certifiedBySecretaryName?: string;
  certifiedDate?: string;
  documentVersion: number;
}

export interface ConflictOfInterestDeclaration {
  id: string;
  boardMemberId: string;
  boardMemberName: string;
  declarationYear: number;
  hasConflictToDeclare: boolean;
  conflictDetails?: string;
  mitigationPlan?: string;
  signedDate: string;
  complianceApproved: boolean;
}

// =============================================================================
// M33.09: COMMUNITY ENGAGEMENT & FEEDBACK
// =============================================================================
export interface CommunityAnnouncement {
  id: string;
  title: string;
  summary: string;
  content: string;
  targetAudience: 'ALL_COMMUNITY' | 'VOLUNTEERS' | 'PROGRAM_PARTICIPANTS' | 'DONORS';
  category: 'PROGRAM_UPDATE' | 'EVENT' | 'WORKSHOP' | 'IMPACT_STORY' | 'EMERGENCY_WEATHER_HOURS';
  publishStatus: 'DRAFT' | 'PENDING_MODERATION' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  moderatedByStaffName?: string;
  isPubliclyVisible: boolean;
}

export interface CommunityFeedbackEntry {
  id: string;
  category: 'PROGRAM_QUALITY' | 'ACCESSIBILITY' | 'VOLUNTEER_EXPERIENCE' | 'GENERAL_SUGGESTION';
  rating: number; // 1 - 5
  feedbackText: string;
  isAnonymous: boolean;
  submitterEmail?: string;
  triagedStatus: 'NEW' | 'REVIEWED' | 'ASSIGNED_TO_DEPARTMENT' | 'RESOLVED';
  assignedDepartmentId?: string;
  actionTakenNotes?: string;
  submittedAt: string;
}

// =============================================================================
// M33.10: TRAINING & ORGANIZATIONAL KNOWLEDGE CENTER
// =============================================================================
export interface TrainingModuleRecord {
  id: string; // e.g. 'TRN-SAFE-01'
  title: string;
  track: 'STAFF_ONBOARDING' | 'VOLUNTEER_ONBOARDING' | 'SAFEGUARDING_COMPLIANCE' | 'CULTURAL_COMPETENCE';
  description: string;
  durationMinutes: number;
  isMandatoryForClearance: boolean;
  passingScorePercent: number;
  version: string;
  authorStaffName: string;
  reviewedDate: string;
}

export interface TrainingAssignmentRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  scoreAchieved?: number;
  completedAt?: string;
  certifiedByStaffId?: string; // AI cannot certify
  certificateNumber?: string;
}

export interface KnowledgeArticleRecord {
  id: string;
  articleCode: string;
  title: string;
  category: 'SOP' | 'POLICY' | 'COMMUNITY_GUIDE' | 'GOVERNANCE' | 'SAFEGUARDING_PROCEDURE';
  summary: string;
  content: string;
  targetRoleAccess: CanonicalRoleFamily[];
  version: number;
  lastUpdatedDate: string;
  approvedByDirector: boolean;
}

// =============================================================================
// M33.11: ADVANCED WORKFLOW AUTOMATION ENGINE
// =============================================================================
export type WorkflowTriggerType =
  | 'NEW_SERVICE_REQUEST'
  | 'VOLUNTEER_APPLICATION'
  | 'PROGRAM_ENROLLMENT'
  | 'DONATION_RECEIVED'
  | 'GRANT_STAGE_ADVANCE'
  | 'DOCUMENT_MODERATION_PENDING';

export interface WorkflowDefinition {
  id: string;
  name: string;
  triggerType: WorkflowTriggerType;
  isActive: boolean;
  version: number;
  steps: {
    stepIndex: number;
    name: string;
    stepType: 'AUTO_EVALUATE' | 'HUMAN_APPROVAL' | 'NOTIFICATION_DISPATCH' | 'STATE_TRANSITION';
    assignedRole: CanonicalRoleFamily;
    slaHours: number;
    escalateToRole?: CanonicalRoleFamily;
  }[];
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  sourceEntityId: string;
  currentStepIndex: number;
  status: 'ACTIVE' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  idempotencyKey: string;
  auditTrail: {
    timestamp: string;
    stepIndex: number;
    actor: string;
    result: string;
  }[];
  startedAt: string;
  completedAt?: string;
}

// =============================================================================
// M33.12: IMPACT MEASUREMENT DATA QUALITY FLAGS
// =============================================================================
export type ImpactDataQuality = 'ACTUAL_VERIFIED' | 'ESTIMATE_METHODOLOGY_DOCUMENTED' | 'STATISTICAL_FORECAST' | 'MISSING_DATA';

export interface EnhancedImpactMetric {
  metricId: string;
  indicatorCode: string;
  name: string;
  baseline: number;
  target2026: number;
  currentValue: number;
  qualityFlag: ImpactDataQuality;
  evidenceDocumentRef: string;
  provenanceSource: string;
  lastAuditedDate: string;
}

// =============================================================================
// M33.13: MULTILINGUAL & ACCESSIBILITY
// =============================================================================
export type SupportedLanguageCode = 'en' | 'es' | 'so' | 'hmn' | 'kar' | 'orm';

export interface LanguageDefinition {
  code: SupportedLanguageCode;
  name: string;
  localName: string;
  isRTL: boolean;
  coverageStatus: 'VERIFIED_PRODUCTION' | 'SUPERVISED_COMMUNITY_REVIEW';
}
