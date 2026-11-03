/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 24 Master Administration Types
 * Enterprise Administration, Staff Governance, AI Workforce, Volunteers, Grants & Executive Oversight
 */

export type StaffAccessLevel =
  | 'STANDARD'
  | 'ELEVATED'
  | 'EXECUTIVE'
  | 'SUPER_ADMIN'
  | 'RESTRICTED_SAFEGUARDING';

export type StaffLifecycleStatus =
  | 'INVITED'
  | 'PENDING_ONBOARDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED'
  | 'OFFBOARDED';

export interface EnterpriseStaffMember {
  id: string;
  staffId: string; // e.g. STF-001
  userId?: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  organizationalRole: string;
  accessLevel: StaffAccessLevel;
  status: StaffLifecycleStatus;
  supervisorId?: string;
  supervisorName?: string;
  assignedResponsibilities: string[];
  phone?: string;
  hireDate: string;
  lastAccessReviewAt: string;
  mfaEnforced: boolean;
  notes?: string;
}

export type DepartmentCategory =
  | 'EXECUTIVE'
  | 'FUNDRAISING'
  | 'GRANTS'
  | 'CORPORATE_PARTNERSHIPS'
  | 'COMMUNICATIONS'
  | 'VOLUNTEER_COORDINATION'
  | 'COMMUNITY_PROGRAMS'
  | 'FINANCE_ADMINISTRATION'
  | 'TECHNOLOGY_AI_OPERATIONS'
  | 'RESTRICTED_SAFEGUARDING';

export interface OrganizationalDepartment {
  id: string; // e.g. DEPT-EXEC
  name: string;
  code: DepartmentCategory;
  description: string;
  headStaffId: string;
  headStaffName: string;
  headTitle: string;
  assignedStaffCount: number;
  openTasksCount: number;
  pendingApprovalsCount: number;
  isSafeguardingIsolated: boolean;
  authorizedPermissions: string[];
  operationalStatus: 'OPERATIONAL' | 'HIGH_WORKLOAD' | 'ATTENTION_REQUIRED' | 'STANDBY';
  budgetAnnualUSD: number;
}

export type OrgTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';

export type OrgTaskStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'REVIEW_REQUIRED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface OrgTaskComment {
  id: string;
  authorStaffId: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  text: string;
}

export interface OrgTaskActivity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export interface OrganizationalTask {
  id: string; // e.g. TASK-ORG-001
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  assignedStaffId: string;
  assignedStaffName: string;
  priority: OrgTaskPriority;
  dueDate: string;
  status: OrgTaskStatus;
  relatedProject?: string;
  relatedCrmRecordId?: string;
  relatedEmailThreadId?: string;
  relatedGrantId?: string;
  relatedPartnershipId?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  activityHistory: OrgTaskActivity[];
  internalComments: OrgTaskComment[];
  aiAssistanceNotes?: string;
}

export type ExecutiveDecisionType =
  | 'FINANCIAL_COMMITMENT'
  | 'LEGAL_OBLIGATION'
  | 'STRATEGIC_INITIATIVE'
  | 'POLICY_CHANGE'
  | 'GRANT_SUBMISSION'
  | 'PARTNERSHIP_AGREEMENT'
  | 'SAFEGUARDING_EXCEPTION'
  | 'PROGRAM_LAUNCH';

export type ExecutiveDecisionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'ESCALATED';

export interface ExecutiveDecisionRecord {
  id: string; // e.g. DEC-2026-001
  reference: string;
  title: string;
  requestingDepartmentId: string;
  requestingDepartmentName: string;
  requestingStaffName: string;
  decisionType: ExecutiveDecisionType;
  summary: string;
  supportingDocumentation: string[];
  financialImpactUSD?: number;
  requiredApproverRole: string;
  status: ExecutiveDecisionStatus;
  decisionNotes?: string;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }[];
}

export interface ExecutiveStrategicPriority {
  id: string;
  title: string;
  category: 'STRATEGIC_INITIATIVE' | 'MAJOR_PROJECT' | 'DEPARTMENTAL_OBJECTIVE' | 'LEADERSHIP_ASSIGNMENT';
  departmentName: string;
  targetQuarter: string;
  leadOwner: string;
  progressPercent: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
  deadline: string;
}

export type VolunteerLifecycleStage =
  | 'APPLICATION'
  | 'REVIEW'
  | 'SCREENING'
  | 'APPROVAL'
  | 'ONBOARDING'
  | 'ASSIGNMENT'
  | 'ACTIVE_ENGAGEMENT'
  | 'COMPLETED'
  | 'OFFBOARDED';

export interface EnterpriseVolunteerProfile {
  id: string; // e.g. VOL-001
  fullName: string;
  email: string;
  phone: string;
  stage: VolunteerLifecycleStage;
  departmentPlacement: string;
  skills: string[];
  availability: string[];
  assignmentPreferences: string[];
  assignedOpportunityId?: string;
  assignedOpportunityTitle?: string;
  orientationCompleted: boolean;
  screeningStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'CLEARED' | 'RESTRICTED_ACCESS_DENIED';
  backgroundCheckDate?: string;
  trainingCompleted: boolean;
  totalHoursLogged: number;
  supervisorFeedback?: string;
  safeguardingBoundariesAcknowledged: boolean;
  createdAt: string;
  updatedAt: string;
  offboardedAt?: string;
  offboardingReason?: string;
}

export type EnterpriseGrantPipelineStage =
  | 'OPPORTUNITY_IDENTIFIED'
  | 'ELIGIBILITY_REVIEW'
  | 'RESEARCH'
  | 'PROPOSAL_DRAFT'
  | 'INTERNAL_REVIEW'
  | 'EXECUTIVE_APPROVAL'
  | 'SUBMISSION_READY'
  | 'SUBMITTED'
  | 'FUNDER_DECISION'
  | 'AWARDED'
  | 'DECLINED';

export interface EnterpriseGrantRecord {
  id: string; // e.g. GRANT-2026-001
  funderOrganization: string;
  opportunityTitle: string;
  fundingAmountRequested: number;
  fundingAmountAwarded?: number;
  applicationDeadline: string;
  pipelineStage: EnterpriseGrantPipelineStage;
  proposalOwner: string;
  programTarget: string;
  eligibilityCriteriaMet: boolean;
  eligibilityNotes: string;
  budgetSummaryUSD: number;
  submissionChecklist: {
    id: string;
    label: string;
    isCompleted: boolean;
  }[];
  supportingDocuments: string[];
  executiveApproved: boolean;
  executiveApprover?: string;
  executiveApprovedAt?: string;
  submittedAt?: string;
  reportingObligations?: string;
  aiResearchAssistanceSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnershipCategoryType =
  | 'CORPORATE_SPONSOR'
  | 'COMMUNITY_ORGANIZATION'
  | 'FOUNDATION'
  | 'INSTITUTIONAL_PARTNER'
  | 'SERVICE_PROVIDER'
  | 'EDUCATIONAL_INSTITUTION'
  | 'VOLUNTEER_PARTNER';

export type PartnershipWorkflowStage =
  | 'IDENTIFIED'
  | 'QUALIFIED'
  | 'OUTREACH_PREPARED'
  | 'ENGAGEMENT'
  | 'PROPOSAL_REVIEW'
  | 'NEGOTIATION'
  | 'APPROVAL'
  | 'ACTIVE_PARTNERSHIP';

export interface EnterprisePartnershipRecord {
  id: string; // e.g. PART-2026-001
  organizationName: string;
  category: PartnershipCategoryType;
  relationshipOwner: string;
  workflowStage: PartnershipWorkflowStage;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  agreementStatus: 'NONE' | 'DRAFTING' | 'UNDER_REVIEW' | 'SIGNED' | 'RENEWAL_DUE';
  renewalDate?: string;
  estimatedContributionUSD: number;
  verifiedContributionReceivedUSD: number;
  notes: string;
  relatedTaskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type PermissionDomain =
  | 'master_administration'
  | 'staff_management'
  | 'department_management'
  | 'organizational_tasks'
  | 'executive_approvals'
  | 'email_management'
  | 'fundraising_crm'
  | 'grant_management'
  | 'partnership_management'
  | 'volunteer_management'
  | 'ai_workforce'
  | 'financial_information'
  | 'audit_records'
  | 'restricted_safeguarding';

export interface RolePermissionMatrixItem {
  role: string;
  label: string;
  description: string;
  allowedDomains: PermissionDomain[];
  canApproveExecutiveDecisions: boolean;
  canAccessSafeguarding: boolean;
  canManageStaff: boolean;
}
