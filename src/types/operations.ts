/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 27 Operations & Automation Domain Types
 */

export type WorkflowType =
  | 'PROGRAM_APPROVAL'
  | 'GRANT_REVIEW'
  | 'PARTNERSHIP_REVIEW'
  | 'RESOURCE_REQUEST'
  | 'VOLUNTEER_DEPLOYMENT'
  | 'STAFF_ASSIGNMENT'
  | 'COMMUNITY_EVENT_APPROVAL'
  | 'REPORT_REVIEW'
  | 'EXECUTIVE_ESCALATION';

export type WorkflowStatus =
  | 'CREATED'
  | 'VALIDATED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'RETURNED'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'ESCALATED';

export type WorkflowPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OperationalWorkflow {
  id: string;
  workflowType: WorkflowType;
  sourceRecordId: string;
  title: string;
  description: string;
  requestingDepartmentId: string;
  responsibleDepartmentId: string;
  assignedOwnerId: string;
  assignedOwnerName: string;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  currentStage: string;
  requiredApprovals: string[];
  idempotencyKey?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  auditReference: string;
  metadata?: Record<string, any>;
}

export type ApprovalRequestType =
  | 'PROGRAM_APPROVAL'
  | 'GRANT_SUBMISSION_APPROVAL'
  | 'PARTNERSHIP_APPROVAL'
  | 'RESOURCE_ALLOCATION'
  | 'EVENT_PUBLICATION'
  | 'IMPACT_REPORT_PUBLICATION'
  | 'OPERATIONAL_POLICY_EXCEPTION';

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'ESCALATED';

export interface OperationalApproval {
  id: string;
  requestType: ApprovalRequestType;
  sourceRecordId: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requiredApproverRole: string;
  approverId?: string;
  approverName?: string;
  decision: ApprovalDecision;
  decisionTimestamp?: string;
  comments?: string;
  recordVersion: number;
  auditReference: string;
  createdAt: string;
}

export type NotificationCategory =
  | 'TASK_ASSIGNED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_COMPLETED'
  | 'TASK_OVERDUE'
  | 'PROGRAM_MILESTONE_DUE'
  | 'GRANT_DEADLINE_APPROACHING'
  | 'VOLUNTEER_ASSIGNMENT_UPDATED'
  | 'EXECUTIVE_ESCALATION'
  | 'OPERATIONAL_INCIDENT'
  | 'DATA_QUALITY_ALERT';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InternalNotification {
  id: string;
  recipientId: string;
  recipientRole?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  relatedRecordType?: string;
  relatedRecordId?: string;
  isRead: boolean;
  readAt?: string;
  deliveryStatus: 'DELIVERED_INBOX' | 'QUEUED' | 'EXTERNAL_EMAIL_DEFERRED_OAUTH_REQUIRED';
  createdAt: string;
}

export type MilestoneType =
  | 'PROGRAM_LAUNCH'
  | 'OUTREACH_ACTIVITY'
  | 'COMMUNITY_EVENT'
  | 'GRANT_APPLICATION_DEADLINE'
  | 'GRANT_REPORT_DEADLINE'
  | 'PARTNERSHIP_REVIEW'
  | 'PROGRAM_EVALUATION'
  | 'IMPACT_REPORT_APPROVAL';

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'BLOCKED';

export interface OperationalMilestone {
  id: string;
  milestoneType: MilestoneType;
  sourceRecordId: string;
  sourceRecordType: string;
  title: string;
  responsibleOwnerId: string;
  responsibleOwnerName: string;
  responsibleDepartmentId: string;
  dueDate: string;
  completionStatus: MilestoneStatus;
  dependencyMilestoneIds?: string[];
  isOverdue: boolean;
  auditReference: string;
  completedAt?: string;
}

export type IncidentCategory =
  | 'WORKFLOW_FAILURE'
  | 'SYSTEM_ERROR'
  | 'MISSED_DEADLINE'
  | 'DATA_QUALITY_ISSUE'
  | 'RESOURCE_CONFLICT'
  | 'SERVICE_INTERRUPTION'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED'
  | 'REOPENED';

export interface OperationalIncident {
  id: string;
  incidentCategory: IncidentCategory;
  severity: IncidentSeverity;
  reportingUserId: string;
  reportingUserName: string;
  responsibleOwnerId: string;
  responsibleOwnerName: string;
  responsibleDepartmentId: string;
  relatedSystem: string;
  title: string;
  description: string;
  status: IncidentStatus;
  resolutionSummary?: string;
  isSafeguardingCrisisQuarantine: boolean;
  createdAt: string;
  resolvedAt?: string;
  auditReference: string;
}

export type DataQualityCheckType =
  | 'DUPLICATE_RECORD'
  | 'MISSING_REQUIRED_FIELDS'
  | 'INVALID_STATUS_TRANSITIONS'
  | 'ORPHANED_SOURCE_REFERENCES'
  | 'EXPIRED_APPROVALS'
  | 'UNVERIFIED_REPORTING_METRICS'
  | 'INVALID_STAFF_ASSIGNMENTS'
  | 'INVALID_VOLUNTEER_ASSIGNMENTS'
  | 'INCONSISTENT_PROGRAM_STATUS'
  | 'UNAUTHORIZED_RECORD_CHANGES';

export type DataQualitySeverity = 'INFO' | 'WARNING' | 'ERROR';
export type DataQualityState = 'VALID' | 'WARNING' | 'ERROR' | 'UNAVAILABLE';

export interface DataQualityCheckResult {
  id: string;
  checkType: DataQualityCheckType;
  sourceRecordType: string;
  sourceRecordId: string;
  severity: DataQualitySeverity;
  state: DataQualityState;
  description: string;
  responsibleOwnerId: string;
  remediationTaskId?: string;
  lastCheckedAt: string;
}

export type ReadinessComponentStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'AUTHORIZATION_REQUIRED'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export interface InfrastructureReadinessProbe {
  componentId: string;
  componentName: string;
  category: 'DATABASE' | 'AUTHENTICATION' | 'EMAIL' | 'AI_GATEWAY' | 'PAYMENT' | 'STORAGE' | 'AUDIT';
  status: ReadinessComponentStatus;
  detail: string;
  truthfulReason: string;
  actionRequired?: string;
  lastProbedAt: string;
}

export type ExecutiveReportType =
  | 'OPERATIONAL_STATUS_SUMMARY'
  | 'DEPARTMENT_WORKLOAD_REPORT'
  | 'PENDING_APPROVALS_REPORT'
  | 'OVERDUE_TASK_REPORT'
  | 'PROGRAM_MILESTONE_REPORT'
  | 'GRANT_DEADLINE_REPORT'
  | 'AI_WORKFORCE_STATUS_REPORT'
  | 'DATA_QUALITY_REPORT'
  | 'OPERATIONAL_INCIDENT_REPORT'
  | 'INFRASTRUCTURE_READINESS_REPORT';

export interface ExecutiveOperationsReport {
  id: string;
  reportType: ExecutiveReportType;
  title: string;
  summary: string;
  reportingPeriod: string;
  keyMetrics: Record<string, string | number>;
  sourceRecordsCount: number;
  dataAvailability: 'COMPLETE' | 'PARTIAL_TRUTHFUL' | 'DEFERRED_INFRASTRUCTURE';
  generatedAt: string;
  generatedByUserId: string;
  approvalStatus: 'DRAFT' | 'REVIEWED' | 'EXECUTIVE_APPROVED';
  auditReference: string;
}
