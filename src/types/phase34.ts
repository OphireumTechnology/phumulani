/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 34 Master Data Types
 * Advanced Platform Intelligence, Community Service Optimization & Operational Excellence
 */

import { UserRole } from './index';

// =============================================================================
// M34.01: UNIFIED OPERATIONAL SEARCH
// =============================================================================
export type SearchDomain =
  | 'ALL'
  | 'COMMUNITY_PROGRAMS'
  | 'SERVICE_REQUESTS'
  | 'VOLUNTEER_OPPORTUNITIES'
  | 'VOLUNTEER_ASSIGNMENTS'
  | 'COMMUNITY_EVENTS'
  | 'GRANTS'
  | 'FUNDRAISING_CAMPAIGNS'
  | 'ORGANIZATIONAL_DOCUMENTS'
  | 'OPERATIONAL_TASKS'
  | 'WORKFLOW_RECORDS';

export interface SearchFilterCriteria {
  query: string;
  domain: SearchDomain;
  status?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}

export interface SearchResultItem {
  id: string;
  domain: SearchDomain;
  title: string;
  snippet: string;
  status: string;
  department: string;
  canonicalPath: string;
  updatedAt: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

export interface SearchAuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  query: string;
  domainFilter: SearchDomain;
  resultsCount: number;
  blockedSafeguardingCount: number;
}

// =============================================================================
// M34.02: COMMUNITY RESOURCE DIRECTORY
// =============================================================================
export type ResourceCategory =
  | 'EMERGENCY_HOUSING'
  | 'FOOD_ASSISTANCE'
  | 'LEGAL_AID'
  | 'HEALTHCARE_MENTAL_HEALTH'
  | 'EMPLOYMENT_TRAINING'
  | 'YOUTH_SERVICES'
  | 'IMMIGRATION_LEGAL'
  | 'TRANSPORTATION'
  | 'FINANCIAL_COACHING';

export type ResourceApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface CommunityResource {
  id: string;
  title: string;
  category: ResourceCategory;
  organizationName: string;
  serviceDescription: string;
  publicContact: {
    phone?: string;
    email?: string;
    website?: string;
    publicAddress?: string; // Strictly non-confidential; shelter addresses prohibited
  };
  geographicServiceAreas: string[]; // e.g. ['Hennepin County', 'Ramsey County', 'Twin Cities Metro']
  eligibilityRequirements: string;
  accessibilityFeatures: string[]; // e.g. ['ADA Accessible', 'ASL Interpreters', 'Transit Accessible']
  languagesSupported: string[]; // e.g. ['English', 'Somali', 'Oromo', 'Spanish', 'Amharic', 'Karen']
  verificationStatus: 'VERIFIED_ACTIVE' | 'PENDING_REVERIFICATION' | 'UNVERIFIED';
  lastReviewedDate: string;
  nextReviewDeadline: string;
  approvalStatus: ResourceApprovalStatus;
  submittedBy: string;
  reviewedBy?: string;
  reviewNotes?: string;
  publishedAt?: string;
  isConfidentialShelter: false; // Invariant: must ALWAYS be false. Shelters never published in public directory
}

// =============================================================================
// M34.03: SERVICE REQUEST LIFECYCLE OPTIMIZATION
// =============================================================================
export type ServiceRequestLifecycleStatus =
  | 'INTAKE'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_INFO'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export type ServiceRequestCategory =
  | 'WORKFORCE_COACHING'
  | 'FINANCIAL_LITERACY'
  | 'YOUTH_MENTORSHIP'
  | 'HOUSING_STABILITY_NAVIGATION'
  | 'ENTREPRENEURSHIP_LAB'
  | 'COMMUNITY_FOOD_SUPPLY'
  | 'GENERAL_COMMUNITY_INQUIRY';

export interface OptimizedServiceRequest {
  id: string; // e.g. 'REQ-2026-001'
  trackingNumber: string;
  category: ServiceRequestCategory;
  title: string;
  description: string;
  status: ServiceRequestLifecycleStatus;
  priority: 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'URGENT';
  slaTargetHours: number;
  slaElapsedHours: number;
  slaBreached: boolean;
  assignedStaffId?: string;
  assignedStaffName?: string;
  memberVisibility: 'VISIBLE_TO_MEMBER' | 'STAFF_INTERNAL_ONLY';
  memberEmail?: string;
  humanEscalated: boolean;
  escalationReason?: string;
  resolutionCode?: 'SERVICE_COMPLETED' | 'REFERRED_TO_PARTNER' | 'DUPLICATE' | 'INELIGIBLE' | 'CANCELLED_BY_MEMBER';
  resolutionNotes?: string;
  followUpTasks: {
    id: string;
    description: string;
    dueDate: string;
    completed: boolean;
  }[];
  history: {
    id: string;
    timestamp: string;
    actor: string;
    previousStatus: ServiceRequestLifecycleStatus;
    newStatus: ServiceRequestLifecycleStatus;
    notes: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// M34.04: PROGRAM CAPACITY & RESOURCE PLANNING
// =============================================================================
export interface ProgramCapacityPlan {
  programId: string;
  programName: string;
  departmentId: string;
  maxParticipantCapacity: number;
  currentEnrolledCount: number;
  activeWaitlistCount: number;
  utilizationRatePercent: number;
  projectedDemandNextQuarter: number;
  waitlistPrioritizationRules: string[];
  requiredStaffFTE: number;
  allocatedStaffFTE: number;
  requiredVolunteersPerWeek: number;
  allocatedVolunteersPerWeek: number;
  scheduleConflictsCount: number;
  capacityAlertLevel: 'NORMAL' | 'NEAR_CAPACITY' | 'AT_CAPACITY' | 'OVER_CAPACITY';
  scenarioProjections: {
    scenarioName: string;
    projectedEnrollment: number;
    requiredBudget: number;
    staffNeeded: number;
    feasibilityScore: number;
  }[];
}

// =============================================================================
// M34.05: VOLUNTEER SCHEDULING OPTIMIZATION
// =============================================================================
export interface VolunteerShiftOpportunity {
  id: string;
  programId: string;
  programName: string;
  roleTitle: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  volunteersRequired: number;
  volunteersConfirmed: number;
  requiredSkills: string[];
  mandatoryTrainingCompleted: boolean;
  mandatoryBackgroundClearance: boolean;
  status: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';
}

export interface ShiftMatchScore {
  volunteerId: string;
  volunteerName: string;
  shiftId: string;
  matchScore: number; // 0 - 100
  skillsMatchExplanation: string;
  availabilityMatch: boolean;
  clearanceVerified: boolean;
  trainingVerified: boolean;
  conflictDetected: boolean;
  conflictReason?: string;
  supervisorApproved: boolean;
  confirmationStatus: 'PENDING_SUPERVISOR' | 'SUPERVISOR_APPROVED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';
}

// =============================================================================
// M34.06: ADVANCED FUNDRAISING & DONOR INTELLIGENCE
// =============================================================================
export interface DonorEngagementProfile {
  donorId: string;
  donorName: string;
  organization?: string;
  givingTier: string;
  totalVerifiedLifetimeGiving: number;
  verifiedGiftsCount: number;
  firstGiftDate: string;
  lastGiftDate: string;
  givingFrequency: 'ANNUAL' | 'MONTHLY' | 'ONE_TIME' | 'OCCASIONAL' | 'LAPSED';
  engagementScore: number; // 0 - 100
  preferredProgramInterests: string[];
  recommendedStewardshipAction: string;
  stewardshipActionDueDate: string;
  nextTargetAskAmount: number;
  isSoftPledgeOnly: boolean; // Flagged to ensure soft pledges never count as settled cash
}

export interface CampaignForecastingScenario {
  campaignId: string;
  campaignTitle: string;
  targetGoalDollars: number;
  settledRevenueDollars: number;
  percentAchieved: number;
  forecastConservative: number;
  forecastExpected: number;
  forecastOptimistic: number;
  uncertaintyBandPercent: number; // e.g. 15%
  assumptions: string[];
  lastCalculatedAt: string;
}

// =============================================================================
// M34.07: AI WORKFORCE QUALITY & EVALUATION FRAMEWORK
// =============================================================================
export type AgentExecutionEnvironment =
  | 'STATIC_FIXTURE_TEST'
  | 'SIMULATED_INTEGRATION'
  | 'REAL_MODEL_EXECUTION'
  | 'LIVE_PRODUCTION_GATED';

export interface AgentQualityEvaluationRecord {
  agentId: string; // e.g. 'AG-01', 'FUND-AI-007'
  agentName: string;
  division: 'OPERATIONAL' | 'FUNDRAISING';
  executionEnvironment: AgentExecutionEnvironment;
  testScenarioCount: number;
  taskSuccessRatePercent: number; // 0 - 100%
  toolAuthorizationAudit: 'PASS_ENFORCED' | 'PERMISSION_REVOKED' | 'AUDIT_WARNING';
  responseQualityScore: number; // 0 - 100
  sourceGroundingScore: number; // 0 - 100
  errorRatePercent: number;
  averageLatencyMs: number;
  estimatedCostPerKiloToken: number;
  humanSupervisorFeedbackCount: number;
  supervisorApprovalRatePercent: number;
  safeguardingQuarantineVerified: boolean;
  readinessRating: 'CERTIFIED_READY' | 'CONDITIONAL_REVIEW' | 'REQUIRES_REMEDIATION';
  lastEvaluatedAt: string;
}

// =============================================================================
// M34.08: AI-ASSISTED ORGANIZATIONAL KNOWLEDGE SEARCH
// =============================================================================
export interface ApprovedKnowledgeDocument {
  id: string;
  title: string;
  category: 'SOP' | 'POLICY' | 'PROGRAM_GUIDE' | 'GOVERNANCE_CHARTER' | 'SAFEGUARDING_PROTOCOL';
  version: string;
  approvedBy: string;
  approvalDate: string;
  effectiveDate: string;
  reviewFrequencyMonths: number;
  isStale: boolean; // Flagged if past review schedule
  allowedRoles: (UserRole | string)[];
  contentSummary: string;
  keyCitations: string[];
  fullTextPreview: string;
}

export interface KnowledgeSearchQueryResponse {
  query: string;
  matchedDocuments: {
    documentId: string;
    title: string;
    version: string;
    relevanceScore: number;
    exactCitations: string[];
    snippet: string;
    isStale: boolean;
  }[];
  synthesizedAnswer?: string;
  isModelGrounded: boolean;
  retrievalMode: 'SEARCH_ONLY_DETERMINISTIC' | 'AI_GROUNDED_SYNTHESIS';
}

// =============================================================================
// M34.09: EXECUTIVE FORECASTING & SCENARIO PLANNING
// =============================================================================
export interface ExecutiveScenarioPlan {
  id: string;
  title: string;
  fiscalYear: string;
  version: number;
  createdAt: string;
  createdBy: string;
  status: 'DRAFT' | 'EXECUTIVE_REVIEWED' | 'BOARD_PRESENTED' | 'ARCHIVED';
  programDemandProjection: {
    programId: string;
    programName: string;
    projectedSurvivorsServed: number;
    fundingRequired: number;
  }[];
  volunteerCapacityProjectionHours: number;
  fundraisingRevenueProjection: {
    grantsProjected: number;
    individualGiftsProjected: number;
    corporateSponsorshipProjected: number;
    totalProjected: number;
  };
  operationalRisks: {
    riskDescription: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigationStrategy: string;
  }[];
  assumptions: string[];
  executiveNotes?: string;
}

// =============================================================================
// M34.10: BOARD GOVERNANCE CALENDAR & COMPLIANCE TRACKING
// =============================================================================
export interface BoardComplianceEvent {
  id: string;
  title: string;
  category: 'BOARD_MEETING' | 'COMMITTEE_DEADLINE' | 'ANNUAL_FILING' | 'POLICY_REVIEW' | 'CONFLICT_OF_INTEREST';
  dueDate: string;
  assignedOwnerId: string;
  assignedOwnerName: string;
  status: 'PENDING' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  completionEvidence?: string;
  humanSignOffBy?: string;
  humanSignOffAt?: string;
  reminderNoticeSent: boolean;
  notes: string;
}

// =============================================================================
// M34.11: ADVANCED REPORTING & CONTROLLED DATA EXPORTS
// =============================================================================
export type ReportExportDomain =
  | 'COMMUNITY_OPERATIONS'
  | 'PROGRAM_METRICS'
  | 'VOLUNTEER_ROSTER'
  | 'EVENT_ATTENDANCE'
  | 'FUNDRAISING_SETTLED_SUMMARY'
  | 'GRANT_PIPELINE'
  | 'WORKFLOW_SLA_PERFORMANCE'
  | 'AI_WORKFORCE_TELEMETRY'
  | 'BOARD_GOVERNANCE_AUDIT';

export interface ExportPermissionRequest {
  domain: ReportExportDomain;
  userRole: UserRole;
  requestedFormat: 'CSV' | 'PRINT_HTML';
  purpose: string;
}

export interface ExportAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  domain: ReportExportDomain;
  format: 'CSV' | 'PRINT_HTML';
  rowCount: number;
  serverAuthorized: boolean;
  safeguardingFieldsRedactedCount: number;
}

// =============================================================================
// M34.12: COMMUNITY FEEDBACK INTELLIGENCE
// =============================================================================
export interface CommunityFeedbackItem {
  id: string;
  category: 'PROGRAM_QUALITY' | 'FACILITY_ACCESSIBILITY' | 'COMMUNICATION' | 'STAFF_APPRECIATION' | 'SERVICE_SUGGESTION';
  submissionDate: string;
  isAnonymous: boolean;
  constituentIdentifier?: string; // strictly masked if anonymous
  sentimentScore: 'POSITIVE' | 'NEUTRAL' | 'CONSTRUCTIVE_IMPROVEMENT';
  feedbackText: string;
  identifiedThemes: string[];
  actionItemGenerated?: string;
  responseStatus: 'NEW' | 'UNDER_REVIEW' | 'ACTION_IN_PROGRESS' | 'CLOSED_IMPLEMENTED';
  reviewedByStaff?: string;
  isSafeguardingQuarantine: boolean; // True if crisis/abuse detected, immediately quarantined to DEPT-SAFE
}

// =============================================================================
// M34.13: MOBILE ACCESSIBILITY & UX VERIFICATION
// =============================================================================
export interface MobileAccessibilityAuditResult {
  wcagCriteriaChecked: number;
  wcagCriteriaPassed: number;
  touchTargetCompliantPercent: number; // Target >= 44x44px
  reducedMotionSupported: boolean;
  keyboardFocusNavigable: boolean;
  colorContrastRatioPassing: boolean; // AA >= 4.5:1
  screenReaderAriaLabelsVerified: boolean;
  safeExitEmergencyFunctional: boolean;
  responsiveBreakpointsTested: ('mobile_375px' | 'tablet_768px' | 'desktop_1280px')[];
  lastAuditTimestamp: string;
}
