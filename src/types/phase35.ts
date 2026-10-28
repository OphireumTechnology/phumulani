/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 35 Master Data Types
 * Intelligent Community Service Delivery, Platform Integration & Advanced Automation
 */

import { UserRole } from './index';
import { ResourceCategory } from './phase34';

// =============================================================================
// M35.01 & M35.02: END-TO-END COMMUNITY SERVICE DELIVERY & FOLLOW-UP
// =============================================================================

export type IntegratedServiceRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_MEMBER'
  | 'WAITING_FOR_PARTNER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type ServiceResolutionCode =
  | 'RESOLVED_FULFILLED'
  | 'RESOLVED_REFERRED'
  | 'RESOLVED_INELIGIBLE'
  | 'CANCELLED_BY_MEMBER';

export interface ServiceTimelineEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  fromStatus: IntegratedServiceRequestStatus;
  toStatus: IntegratedServiceRequestStatus;
  notes: string;
  isMemberVisible: boolean;
}

export interface RoleBasedStaffNote {
  id: string;
  authorName: string;
  authorRole: string;
  minRoleToView: string; // e.g. 'staff', 'manager', 'executive'
  noteText: string;
  createdAt: string;
}

export interface ServiceFeedbackRecord {
  id: string;
  requestId: string;
  memberId: string;
  satisfactionScore: number; // 1 to 5
  feedbackText: string;
  submittedAt: string;
}

export interface IntegratedServiceRequest {
  id: string; // e.g. 'SRV-2026-101'
  trackingReference: string; // e.g. 'TRK-SRV-4819'
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  serviceCategory: string; // 'EMERGENCY_SUPPLIES' | 'EMPLOYMENT_ASSISTANCE' | 'HOUSING_REFERRAL' | 'COMMUNITY_RESOURCE' | 'OTHER'
  priority: 'ROUTINE' | 'EXPEDITED' | 'URGENT';
  status: IntegratedServiceRequestStatus;
  assignedDepartmentId: string; // e.g. 'DEPT-PROG'
  assignedStaffId?: string;
  assignedStaffName?: string;
  intakeSummary: string;
  timeline: ServiceTimelineEvent[];
  staffNotes: RoleBasedStaffNote[];
  linkedReferralIds: string[];
  linkedProgramEnrollmentId?: string;
  slaDeadline: string;
  isEscalated: boolean;
  escalationReason?: string;
  resolutionCode?: ServiceResolutionCode;
  resolutionSummary?: string;
  feedback?: ServiceFeedbackRecord;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// =============================================================================
// M35.03: COMMUNITY RESOURCE REFERRAL MANAGEMENT
// =============================================================================

export type ReferralLifecycleStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SHARED_WITH_MEMBER'
  | 'FOLLOW_UP_DUE'
  | 'COMPLETED'
  | 'DECLINED'
  | 'EXPIRED';

export interface ResourceReferralRecord {
  id: string; // e.g. 'REF-2026-001'
  serviceRequestId: string;
  memberId: string;
  memberName: string;
  resourceId: string;
  resourceTitle: string;
  organizationName: string;
  resourceCategory: ResourceCategory | string;
  publicContactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    addressNotes?: string; // Strictly non-confidential
  };
  status: ReferralLifecycleStatus;
  staffApproverRole?: string;
  staffApproverName?: string;
  approvedAt?: string;
  memberAcknowledgedAt?: string;
  followUpDueAt: string;
  followUpCompletedAt?: string;
  outcomeNotes?: string;
  safeguardingWarningIssued: boolean; // Disclaimers against disclosing confidential shelter info
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.04: PROGRAM ENROLLMENT & PARTICIPATION JOURNEY
// =============================================================================

export type ProgramEnrollmentStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'WAITLISTED'
  | 'DECLINED'
  | 'ACTIVE_PARTICIPATING'
  | 'COMPLETED'
  | 'WITHDRAWN';

export interface ProgramEnrollmentApplication {
  id: string; // e.g. 'ENR-2026-001'
  programId: string; // e.g. 'PROG-001'
  programTitle: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  submissionDate: string;
  status: ProgramEnrollmentStatus;
  reviewedByStaffName?: string;
  reviewedByStaffRole?: string;
  reviewedAt?: string;
  eligibilityNotes?: string;
  waitlistPosition?: number;
  capacityChecked: boolean;
  sessionsAttended: number;
  totalSessions: number;
  milestonesCompleted: string[];
  verifiedOutcomes: string[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.05: VOLUNTEER ONBOARDING-TO-SERVICE JOURNEY
// =============================================================================

export type VolunteerOnboardingState =
  | 'REGISTERED'
  | 'PROFILE_COMPLETED'
  | 'TRAINING_ASSIGNED'
  | 'TRAINING_COMPLETED'
  | 'CLEARANCE_PENDING'
  | 'CLEARANCE_APPROVED'
  | 'ACTIVE_SERVICE'
  | 'SUSPENDED';

export interface VolunteerServiceLifecycleRecord {
  id: string; // e.g. 'VOL-LIFE-001'
  volunteerId: string;
  name: string;
  email: string;
  languages: string[];
  skills: string[];
  availabilityDays: string[];
  onboardingStatus: VolunteerOnboardingState;
  assignedTrainingModuleId: string; // e.g. 'TRN-SAFE-01'
  trainingCompletedAt?: string;
  clearanceVerifiedByHumanSupervisor?: string; // Human supervisor name, strictly non-AI
  clearanceVerifiedAt?: string;
  appliedShiftIds: string[];
  assignedShiftIds: string[];
  verifiedAttendanceSessions: number;
  verifiedServiceHours: number;
  volunteerFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.06: DONOR STEWARDSHIP & CAMPAIGN ENGAGEMENT JOURNEY
// =============================================================================

export type PledgeStatus = 'NONE' | 'PLEDGED' | 'FULFILLED' | 'CANCELLED';

export interface DonorStewardshipRecord {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  givingTier: string;
  campaignId: string;
  campaignTitle: string;
  pledgeStatus: PledgeStatus;
  pledgedAmount: number;
  settledContributionsCount: number;
  totalSettledAmount: number; // Strictly segregated from unearned pledges
  communicationPreferences: {
    emailUpdates: boolean;
    postalLetter: boolean;
    anonymousInReports: boolean;
  };
  thankYouLetterApproved: boolean;
  thankYouLetterApprovedBy?: string;
  thankYouLetterApprovedAt?: string;
  lastImpactUpdateSentAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.07: GRANT APPLICATION LIFECYCLE INTEGRATION
// =============================================================================

export type GrantLifecycleStage =
  | 'OPPORTUNITY_IDENTIFIED'
  | 'OPPORTUNITY_VERIFIED'
  | 'ELIGIBILITY_REVIEW'
  | 'GO_NO_GO_DECIDED'
  | 'APPLICATION_ASSIGNED'
  | 'DOCUMENT_COLLECTION'
  | 'PROPOSAL_DRAFTING'
  | 'BUDGET_REVIEW'
  | 'INTERNAL_APPROVAL'
  | 'AUTHORIZED_SUBMITTED'
  | 'SUBMISSION_CONFIRMED'
  | 'AWARD_DECISION_PENDING'
  | 'AWARDED'
  | 'POST_AWARD_MILESTONES'
  | 'REPORTING_COMPLIANCE'
  | 'GRANT_CLOSEOUT';

export interface GrantPostAwardMilestone {
  milestone: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface GrantLifecycleRecord {
  id: string; // e.g. 'GTRK-2026-001'
  grantId: string;
  opportunityTitle: string;
  funderName: string;
  requestedAmount: number;
  currentStage: GrantLifecycleStage;
  goNoGoDecision: 'GO' | 'NO_GO' | 'PENDING';
  goNoGoApprovedBy?: string;
  leadStaffAssignee: string;
  proposalDraft: string;
  budgetValidated: boolean;
  internalApprovalRole?: string;
  internalApprovedBy?: string;
  submissionEvidenceHash?: string | null;
  submissionConfirmedAt?: string | null;
  awardStatus: 'PENDING' | 'AWARDED' | 'DECLINED';
  verifiedAwardAmount: number;
  postAwardMilestones: GrantPostAwardMilestone[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.08: CROSS-DEPARTMENT WORKFLOW ORCHESTRATION
// =============================================================================

export interface CrossDepartmentWorkflowStep {
  stepIndex: number;
  stepName: string;
  departmentId: string;
  assignedRole: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completedAt?: string;
  completedBy?: string;
}

export interface CrossDepartmentWorkflowInstance {
  id: string;
  workflowDefinitionId: string; // e.g. 'WFD-COMM-SERVICE-JOURNEY'
  name: string;
  referenceRecordId: string;
  initiatingDepartmentId: string;
  currentStepIndex: number;
  steps: CrossDepartmentWorkflowStep[];
  isEscalated: boolean;
  escalationReason?: string;
  idempotencyKey: string;
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M35.09: AI WORKFORCE TASK EXECUTION & EVIDENCE VERIFICATION
// =============================================================================

export type AiWorkforceExecutionState =
  | 'NOT_CONFIGURED'
  | 'READY'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED_VERIFIED'
  | 'COMPLETED_REVIEW_REQUIRED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export interface AiWorkforceExecutionRecord {
  id: string;
  agentId: string; // 1 of 36
  agentName: string;
  division: 'ORGANIZATIONAL' | 'FUNDRAISING';
  taskDescription: string;
  inputPayload: Record<string, any>;
  executionStatus: AiWorkforceExecutionState;
  providerAvailability: 'CONNECTED' | 'FALLBACK_DETERMINISTIC' | 'UNAVAILABLE';
  evidenceSources: string[];
  outputResult: string;
  requiresHumanApproval: boolean;
  approvedByRole?: string;
  approvedByName?: string;
  approvedAt?: string;
  costEstCents: number;
  isEmergencyHalted: boolean;
  createdAt: string;
  completedAt?: string;
}

// =============================================================================
// M35.10: COMMUNITY NOTIFICATIONS & PREFERENCES
// =============================================================================

export type CommunityNotificationCategory =
  | 'SERVICE_UPDATE'
  | 'PROGRAM_DECISION'
  | 'VOLUNTEER_SHIFT'
  | 'TRAINING_REMINDER'
  | 'RESOURCE_REFERRAL'
  | 'GRANT_DEADLINE'
  | 'GOVERNANCE_REMINDER';

export interface CommunityNotification {
  id: string;
  recipientUserId: string;
  recipientRole: string;
  category: CommunityNotificationCategory;
  title: string;
  message: string;
  referenceUrl?: string;
  isRead: boolean;
  inAppDelivered: boolean;
  externalEmailDeliveryStatus: 'BLOCKED_UNCONFIGURED' | 'QUEUED_LOCALLY';
  createdAt: string;
}

export interface UserNotificationPreferences {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean; // Note: delivery blocked until live Google Workspace connected
  serviceUpdates: boolean;
  programAlerts: boolean;
  volunteerReminders: boolean;
  governanceNotices: boolean;
}

// =============================================================================
// M35.12: EXECUTIVE OPERATIONAL PERFORMANCE & ACCOUNTABILITY
// =============================================================================

export type MetricConfidenceLevel =
  | 'ACTUAL_VERIFIED'
  | 'ESTIMATED'
  | 'FORECAST'
  | 'MISSING_DATA';

export interface ExecutiveOperationalPerformanceSummary {
  serviceRequests: {
    volume: number;
    avgResolutionHours: number;
    slaPerformancePercent: number;
    confidence: MetricConfidenceLevel;
  };
  programEnrollment: {
    totalEnrolled: number;
    completionRatePercent: number;
    waitlistedCount: number;
    confidence: MetricConfidenceLevel;
  };
  volunteerEngagement: {
    activeVolunteers: number;
    verifiedHours: number;
    coverageRatioPercent: number;
    confidence: MetricConfidenceLevel;
  };
  resourceReferrals: {
    totalReferrals: number;
    verifiedOutcomePercent: number;
    confidence: MetricConfidenceLevel;
  };
  fundraising: {
    settledRevenue: number;
    pledgedAmount: number;
    activeCampaignCount: number;
    confidence: MetricConfidenceLevel;
  };
  grants: {
    activeGrantPipelineValue: number;
    submittedCount: number;
    awardedCount: number;
    confidence: MetricConfidenceLevel;
  };
  aiWorkforce: {
    totalAgents: number; // 36
    readinessRatio: string; // e.g. "36/36"
    pendingApprovalsCount: number;
    emergencyHaltActive: boolean;
    confidence: MetricConfidenceLevel;
  };
  timestamp: string;
}
