/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Community Programs & Service Delivery Types
 * Community Programs, Outreach, General Service Requests, Referrals, Volunteer Deployment, Events, Resources & Impact
 */

export type ProgramCategory =
  | 'WORKFORCE_DEVELOPMENT'
  | 'YOUTH_MENTORSHIP'
  | 'FOOD_SECURITY'
  | 'FINANCIAL_LITERACY'
  | 'LANGUAGE_ACCESS'
  | 'HEALTH_WELLNESS'
  | 'CIVIC_ENGAGEMENT';

export type ProgramStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface ProgramObjective {
  id: string;
  description: string;
  targetMetric: string;
  achievedMetric?: string;
  isCompleted: boolean;
}

export interface ProgramActivity {
  id: string;
  title: string;
  frequency: 'ONE_TIME' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  location: string;
  leadStaffName: string;
  leadStaffId: string;
  volunteerCountNeeded: number;
}

export interface CommunityProgram {
  id: string; // e.g. PROG-001
  name: string;
  description: string;
  category: ProgramCategory;
  objectives: ProgramObjective[];
  responsibleDepartmentId: string;
  responsibleDepartmentName: string;
  programManagerId: string;
  programManagerName: string;
  startDate: string;
  endDate?: string;
  status: ProgramStatus;
  targetOutcomes: string[];
  approvedResourceRequirements: string[];
  associatedVolunteerIds: string[];
  associatedPartnerIds: string[];
  relatedTaskIds: string[];
  executiveApproved: boolean;
  executiveApproverName?: string;
  executiveApprovedAt?: string;
  activities: ProgramActivity[];
  activityHistory: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }[];
}

// =============================================================================
// OUTREACH MANAGEMENT (M25.03)
// =============================================================================
export type OutreachStatus =
  | 'PROPOSED'
  | 'PLANNING'
  | 'REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FOLLOW_UP';

export interface CommunityOutreachInitiative {
  id: string; // e.g. OUT-001
  title: string;
  description: string;
  relatedProgramId?: string;
  relatedProgramName?: string;
  targetArea: string; // e.g. "Cedar-Riverside, Minneapolis"
  targetPopulationSummary: string; // Aggregated, non-PII
  scheduledDate: string;
  leadStaffId: string;
  leadStaffName: string;
  assignedVolunteerIds: string[];
  partnerOrganizationNames: string[];
  approvedMaterials: string[];
  status: OutreachStatus;
  estimatedReach: number;
  verifiedAttendeesCount?: number;
  followUpTasksCreated: number;
  executiveApproved: boolean;
  notes?: string;
}

// =============================================================================
// GENERAL SERVICE REQUESTS (M25.04) — NON-SURVIVOR GENERAL SERVICES
// =============================================================================
export type ServiceCategory =
  | 'FOOD_PANTRY_HAMPER'
  | 'YOUTH_TUTORING_ENROLLMENT'
  | 'COMPUTER_LAB_ACCESS'
  | 'JOB_CLINIC_COACHING'
  | 'CLOTHING_CLOSET'
  | 'NON_CONFIDENTIAL_TRANSLATION'
  | 'TRANSPORTATION_ASSISTANCE';

export type ServiceRequestStatus =
  | 'RECEIVED'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'REFERRED'
  | 'CANCELLED';

export type ServicePriority = 'ROUTINE' | 'ELEVATED' | 'URGENT';

export interface GeneralServiceRequest {
  id: string; // e.g. SRV-001
  serviceCategory: ServiceCategory;
  requestDate: string;
  requestSource: 'COMMUNITY_CENTER' | 'PHONE_LINE' | 'WALK_IN' | 'PARTNER_DESK' | 'ONLINE_PORTAL';
  intakeSummary: string; // Strictly non-confidential
  responsibleDepartmentId: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  priority: ServicePriority;
  status: ServiceRequestStatus;
  relatedProgramId?: string;
  followUpRequirement: string;
  completionDate?: string;
  isSafeguardingCrisisQuarantine: boolean; // True if crisis indicators triggered firewall
  outcomeSummary?: string;
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
}

// =============================================================================
// REFERRALS & SERVICE PARTNERS (M25.05)
// =============================================================================
export type ReferralStatus =
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'AUTHORIZED'
  | 'REFERRED'
  | 'FOLLOW_UP'
  | 'CLOSED';

export interface CommunityReferral {
  id: string; // e.g. REF-001
  partnerId: string;
  partnerName: string;
  serviceType: string;
  referralEligibilityCriteria: string;
  assignedStaffId: string;
  assignedStaffName: string;
  status: ReferralStatus;
  followUpDeadline: string;
  completionConfirmed: boolean;
  externalDispatchBlocked: boolean; // Gated while Google Workspace / email disconnected
  executiveAuthorized: boolean;
  notes?: string;
}

// =============================================================================
// VOLUNTEER DEPLOYMENT & SCHEDULING (M25.06)
// =============================================================================
export type DeploymentStatus =
  | 'ELIGIBLE'
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'SUPERVISOR_VERIFIED'
  | 'COMPLETED';

export interface VolunteerDeployment {
  id: string; // e.g. DEP-001
  volunteerId: string;
  volunteerName: string;
  programId: string;
  programName: string;
  activityTitle: string;
  shiftDate: string;
  shiftHours: number;
  supervisorStaffId: string;
  supervisorStaffName: string;
  status: DeploymentStatus;
  attendanceVerified: boolean;
  verifiedHours: number;
  supervisorSignOff: boolean;
  supervisorNotes?: string;
}

// =============================================================================
// COMMUNITY EVENTS MANAGEMENT (M25.07)
// =============================================================================
export type CommunityEventType =
  | 'CAREER_FAIR'
  | 'YOUTH_WORKSHOP'
  | 'FOOD_DISTRIBUTION'
  | 'FINANCIAL_CLINIC'
  | 'CULTURAL_CELEBRATION'
  | 'COMMUNITY_FORUM';

export type CommunityEventStatus =
  | 'DRAFT'
  | 'PLANNING'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export interface CommunityEvent {
  id: string; // e.g. EVT-001
  title: string;
  description: string;
  relatedProgramId?: string;
  relatedProgramName?: string;
  eventType: CommunityEventType;
  eventDate: string;
  startTime: string;
  endTime: string;
  generalLocation: string; // Strictly public venue! Never shelter address
  organizingDepartmentId: string;
  eventManagerId: string;
  eventManagerName: string;
  assignedStaffNames: string[];
  volunteersRequiredCount: number;
  volunteersAssignedCount: number;
  approvedResourceSummary: string;
  registrationOpen: boolean;
  maxCapacity: number;
  registeredCount: number;
  verifiedAttendanceCount?: number;
  status: CommunityEventStatus;
  executiveApproved: boolean;
  followUpTasksSummary?: string;
}

// =============================================================================
// PROGRAM RESOURCE MANAGEMENT (M25.08)
// =============================================================================
export type ResourceCategory =
  | 'PROGRAM_MATERIALS'
  | 'EQUIPMENT'
  | 'FACILITIES'
  | 'TRANSPORTATION'
  | 'STAFF_TIME'
  | 'VOLUNTEER_TIME'
  | 'NONFINANCIAL_CONTRIBUTION';

export type ResourceStatus =
  | 'REQUESTED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'ALLOCATED'
  | 'IN_USE'
  | 'CLOSED';

export interface ProgramResourceRequest {
  id: string; // e.g. RES-001
  programId: string;
  programName: string;
  resourceCategory: ResourceCategory;
  resourceName: string;
  quantityRequested: number;
  unitOfMeasure: string;
  requiredByDate: string;
  requestOwnerId: string;
  requestOwnerName: string;
  estimatedCostUSD?: number;
  status: ResourceStatus;
  executiveApproved: boolean;
  allocatedDate?: string;
  utilizationNotes?: string;
}

// =============================================================================
// PROGRAM IMPACT MEASUREMENT (M25.11)
// =============================================================================
export type ImpactDataClassification =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'PENDING_SUPERVISOR'
  | 'UNAVAILABLE_DB_REQUIRED';

export interface ProgramImpactMetrics {
  totalProgramsCount: number;
  activeProgramsCount: number;
  completedProgramsCount: number;
  outreachActivitiesCount: number;
  verifiedEventAttendanceTotal: number;
  unverifiedEventRegistrationsTotal: number;
  verifiedVolunteerHoursTotal: number;
  pendingVolunteerHoursTotal: number;
  generalServiceRequestsTotal: number;
  completedGeneralServiceRequests: number;
  verifiedReferralsCount: number;
  programObjectivesCompletedCount: number;
  totalProgramObjectivesCount: number;
  resourcesAllocatedCount: number;
  reportingPeriod: string;
  dataClassification: ImpactDataClassification;
  truthfulnessStatement: string;
}

// =============================================================================
// AI PROGRAM INTELLIGENCE (M25.10)
// =============================================================================
export type AIProgramActionType =
  | 'PLANNING_ASSISTANCE'
  | 'OUTREACH_SUMMARY'
  | 'EVENT_CHECKLIST'
  | 'RESOURCE_ESTIMATION'
  | 'VOLUNTEER_SCHEDULING'
  | 'IMPACT_NARRATIVE';

export interface AIProgramRecommendation {
  id: string;
  actionType: AIProgramActionType;
  programId?: string;
  title: string;
  recommendationText: string;
  sourceDataSource: string;
  confidenceScore: number;
  requiresHumanApproval: boolean;
  humanReviewStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  generatedAt: string;
}
