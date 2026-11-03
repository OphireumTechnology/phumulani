/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 MEAL (Monitoring, Evaluation, Accountability & Learning) Types
 * Master Types for Indicators, Outputs, Outcome Evaluations, Evidence, Community Feedback, Risks, and Impact Reports
 */

export type IndicatorType =
  | 'INPUT'
  | 'ACTIVITY'
  | 'OUTPUT'
  | 'OUTCOME'
  | 'IMPACT'
  | 'QUALITY'
  | 'EFFICIENCY';

export type OutputVerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'INCLUDED_IN_REPORT'
  | 'RETURNED_FOR_CORRECTION'
  | 'REJECTED'
  | 'SUPERSEDED';

export type EvaluationStatus =
  | 'PLANNED'
  | 'DATA_COLLECTION'
  | 'ANALYSIS'
  | 'INTERNAL_REVIEW'
  | 'APPROVED'
  | 'CLOSED';

export type FeedbackType =
  | 'PROGRAM_SUGGESTION'
  | 'GENERAL_SERVICE_EXPERIENCE'
  | 'EVENT_FEEDBACK'
  | 'ACCESSIBILITY_FEEDBACK'
  | 'COMMUNITY_CONCERN'
  | 'SERVICE_QUALITY_COMPLAINT'
  | 'GENERAL_COMPLIMENT';

export type FeedbackStatus =
  | 'RECEIVED'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

export type ProgramRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProgramRiskLikelihood = 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'ALMOST_CERTAIN';

export type ProgramRiskStatus =
  | 'IDENTIFIED'
  | 'ASSESSED'
  | 'MITIGATION_ASSIGNED'
  | 'MONITORED'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'ACCEPTED_WITH_AUTHORIZATION'
  | 'CLOSED';

export type MealReportType =
  | 'MONTHLY_PROGRAM_PERFORMANCE'
  | 'QUARTERLY_ORGANIZATIONAL_IMPACT'
  | 'ANNUAL_IMPACT_SUMMARY'
  | 'COMMUNITY_OUTREACH_REPORT'
  | 'VOLUNTEER_CONTRIBUTION_REPORT'
  | 'GRANT_PERFORMANCE_REPORT'
  | 'COMMUNITY_FEEDBACK_SUMMARY'
  | 'PROGRAM_RISK_REPORT'
  | 'EXECUTIVE_PERFORMANCE_REPORT';

export type ReportApprovalStatus =
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'EXECUTIVE_APPROVED'
  | 'REJECTED_NEEDS_REVISION'
  | 'AUTHORIZED_FOR_PUBLICATION'
  | 'ARCHIVED';

// ============================================================================
// M26.03: Organizational Indicator Framework
// ============================================================================
export interface ImpactIndicator {
  id: string;
  indicatorCode: string;
  name: string;
  description: string;
  organizationalObjective: string;
  programId: string; // References PROG-001 through PROG-005
  responsibleDepartmentId: string;
  indicatorType: IndicatorType;
  measurementUnit: string;
  calculationMethod: string;
  dataSource: string;
  baselineValue: number;
  targetValue: number;
  currentVerifiedValue: number;
  reportingFrequency: 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
  verificationRequirement: string;
  indicatorOwner: string;
  approvalStatus: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.04: Program Output Tracking
// ============================================================================
export interface ProgramOutputRecord {
  id: string;
  sourceRecordId: string; // e.g. OUTR-001, EVT-001, SRV-001, VOL-001
  sourceRecordType: 'ACTIVITY' | 'OUTREACH' | 'EVENT' | 'SERVICE_REQUEST' | 'REFERRAL' | 'VOLUNTEER_SHIFT' | 'RESOURCE_DISBURSEMENT';
  programId: string;
  indicatorId: string;
  reportingPeriod: string; // e.g. '2026-Q3', '2026-OCT'
  reportedValue: number;
  measurementUnit: string;
  evidenceReferenceId: string;
  verificationStatus: OutputVerificationStatus;
  reportedBy: string;
  verifiedBy?: string;
  verificationDate?: string;
  correctionNotes?: string;
  auditReference: string;
  isDuplicateFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.05: Program Outcome Evaluation
// ============================================================================
export interface ProgramOutcomeEvaluation {
  id: string;
  evaluationCode: string;
  programId: string;
  programObjective: string;
  indicatorId: string;
  evaluationQuestion: string;
  evaluationPeriodStart: string;
  evaluationPeriodEnd: string;
  methodologyDescription: string;
  dataSourcesCited: string[];
  findingsSummary: string;
  qualitativeEvidence: string;
  quantitativeChangeMetric: string;
  identifiedLimitations: string[];
  attributionConfidence: 'HIGH' | 'MODERATE' | 'PRELIMINARY' | 'CAUTION_CORRELATION_ONLY';
  assignedEvaluator: string;
  status: EvaluationStatus;
  executiveReviewSignOff?: {
    reviewedBy: string;
    reviewedAt: string;
    role: string;
    comments: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.06: Data Collection & Evidence Management
// ============================================================================
export interface ImpactEvidenceRecord {
  id: string;
  evidenceType:
    | 'ACTIVITY_LOG'
    | 'ATTENDANCE_SUMMARY'
    | 'PROGRAM_DOCUMENT'
    | 'VOLUNTEER_HOURS_CERT'
    | 'RESOURCE_UTILIZATION'
    | 'SURVEY_AGGREGATE'
    | 'GRANT_DELIVERABLE'
    | 'PARTNER_CONFIRMATION'
    | 'EVALUATION_REPORT';
  title: string;
  sourceReference: string;
  recordOwner: string;
  collectionDate: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  accessClassification: 'GENERAL_STAFF' | 'RESTRICTED_EVALUATION' | 'EXECUTIVE_ONLY' | 'SAFEGUARDING_QUARANTINE';
  retentionCategory: 'STANDARD_7_YEARS' | 'PERMANENT_ARCHIVE' | 'GRANT_COMPLIANCE';
  relatedIndicatorId?: string;
  relatedProgramId: string;
  summaryText: string;
  storageUri?: string;
  isStorageDisconnectedNotice: boolean;
  createdAt: string;
}

// ============================================================================
// M26.07: Community Feedback & Accountability
// ============================================================================
export interface CommunityFeedbackRecord {
  id: string;
  feedbackType: FeedbackType;
  submissionChannel: 'COMMUNITY_PORTAL' | 'PROGRAM_EVENT' | 'SERVICE_DESK' | 'PAPER_SURVEY' | 'COMMUNITY_MEETING';
  programId?: string;
  content: string;
  isSafeguardingCrisisQuarantine: boolean;
  responsibleDepartmentId: string;
  assignedStaff?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS_ESCALATION';
  status: FeedbackStatus;
  resolutionSummary?: string;
  followUpTaskId?: string;
  dateReceived: string;
  resolvedAt?: string;
  auditTrail: string[];
}

// ============================================================================
// M26.08: Grant Performance & Deliverable Progress
// ============================================================================
export interface GrantDeliverableProgress {
  id: string;
  grantId: string;
  grantFunder: string;
  grantTitle: string;
  programId: string;
  deliverableName: string;
  targetCount: number;
  verifiedProgressCount: number;
  measurementUnit: string;
  deadlineDate: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'COMPLETED' | 'OVERDUE';
  linkedOutputIds: string[];
  funderReportingChecklist: {
    item: string;
    completed: boolean;
    evidenceRef?: string;
  }[];
  complianceNotes: string;
}

// ============================================================================
// M26.09: Volunteer Contribution Analytics
// ============================================================================
export interface VolunteerImpactAnalytics {
  totalApprovedVolunteers: number;
  totalCompletedAssignments: number;
  totalSupervisorVerifiedHours: number;
  unverifiedHoursPendingReview: number;
  programHoursBreakdown: {
    programId: string;
    programName: string;
    hours: number;
  }[];
  independentVerificationScore: number; // 100%
  noDoubleCountingEnforced: boolean;
}

// ============================================================================
// M26.10: Program Quality & Risk Management
// ============================================================================
export interface ProgramRiskRecord {
  id: string;
  programId: string;
  programName: string;
  riskCategory: 'SAFEGUARDING' | 'STAFF_CAPACITY' | 'FUNDING_COMPLIANCE' | 'FACILITY_SAFETY' | 'PARTNER_DEPENDENCY' | 'DATA_QUALITY';
  description: string;
  likelihood: ProgramRiskLikelihood;
  severity: ProgramRiskSeverity;
  responsibleOwner: string;
  mitigationPlan: string;
  targetResolutionDate: string;
  status: ProgramRiskStatus;
  escalationLevel: 'STANDARD' | 'DEPARTMENT_HEAD' | 'EXECUTIVE_DIRECTOR' | 'BOARD_ESCALATED';
  isSafeguardingRestricted: boolean;
  historyLogs: {
    timestamp: string;
    action: string;
    actor: string;
    note: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.13: Impact Reports & Executive Governance
// ============================================================================
export interface MealReportRecord {
  id: string;
  reportCode: string;
  title: string;
  reportType: MealReportType;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  programId?: string; // Optional for org-wide reports
  sourceDatasetReferences: string[];
  executiveSummary: string;
  keyOutputsTable: {
    indicatorCode: string;
    indicatorName: string;
    target: number;
    achieved: number;
    unit: string;
    status: 'MET' | 'PARTIALLY_MET' | 'NOT_MET';
  }[];
  outcomesAndImpactNarrative: string;
  limitationsAndAttributionCaution: string;
  volunteerHoursCited: number;
  grantComplianceSummary: string;
  risksAndMitigationSummary: string;
  version: number;
  approvalStatus: ReportApprovalStatus;
  preparerName: string;
  preparerRole: string;
  executiveApproverName?: string;
  executiveApprovalTimestamp?: string;
  isAiAssisted: boolean;
  aiAssistanceNotes?: string;
  exportFormatAvailable: ('PRINTABLE_HTML' | 'CSV_METRICS' | 'STRUCTURED_JSON')[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.02: MEAL Command Center Summary Overview
// ============================================================================
export interface MealCommandCenterSummary {
  totalIndicatorsTracked: number;
  activeOutputsUnderVerification: number;
  totalVerifiedOutputsCount: number;
  completedEvaluationsCount: number;
  evidenceRecordsCount: number;
  communityFeedbackTotal: number;
  feedbackPendingReview: number;
  activeGrantDeliverablesCount: number;
  totalVerifiedVolunteerHours: number;
  openProgramRisksCount: number;
  highOrCriticalRisksCount: number;
  publishedExecutiveReportsCount: number;
  dataQualityIntegrityScore: number; // e.g. 100%
  safeguardingFirewallStatus: 'ACTIVE_100_PERCENT_ENFORCED';
  truthfulDataNotice: string;
  infrastructureStatus: {
    POSTGRESQL: string;
    GOOGLE_WORKSPACE: string;
    PAYMENT_GATEWAY: string;
    LIVE_EMAIL_SYNCHRONIZATION: string;
  };
}
