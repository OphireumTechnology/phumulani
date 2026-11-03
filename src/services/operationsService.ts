/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 27 Unified Operations Service
 * Grounded in Master Directive Phase 27: Integrated Operations, Workflow Automation & Production Readiness
 */

import {
  OperationalWorkflow,
  WorkflowStatus,
  OperationalApproval,
  ApprovalDecision,
  InternalNotification,
  OperationalMilestone,
  MilestoneStatus,
  OperationalIncident,
  IncidentStatus,
  DataQualityCheckResult,
  InfrastructureReadinessProbe,
  ExecutiveOperationsReport,
  ExecutiveReportType,
} from '../types/operations';
import {
  BASELINE_WORKFLOWS,
  BASELINE_APPROVALS,
  BASELINE_NOTIFICATIONS,
  BASELINE_MILESTONES,
  BASELINE_INCIDENTS,
  BASELINE_DATA_QUALITY_CHECKS,
  BASELINE_READINESS_PROBES,
  BASELINE_EXECUTIVE_REPORTS,
} from './operationsSeed';
import { db } from './db';
import { masterAdminService } from './masterAdminService';

const VALID_WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  CREATED: ['VALIDATED', 'ASSIGNED', 'CANCELLED', 'ON_HOLD'],
  VALIDATED: ['ASSIGNED', 'IN_PROGRESS', 'RETURNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW_REQUIRED', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'ESCALATED'],
  REVIEW_REQUIRED: ['APPROVED', 'RETURNED', 'REJECTED', 'ESCALATED', 'IN_PROGRESS'],
  APPROVED: ['IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
  COMPLETED: ['ON_HOLD'],
  RETURNED: ['IN_PROGRESS', 'REVIEW_REQUIRED', 'CANCELLED'],
  REJECTED: ['CANCELLED', 'CREATED'],
  ON_HOLD: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
  CANCELLED: [],
  ESCALATED: ['REVIEW_REQUIRED', 'APPROVED', 'RETURNED', 'REJECTED'],
};

export class OperationsService {
  private static instance: OperationsService;

  private workflows: OperationalWorkflow[] = [];
  private approvals: OperationalApproval[] = [];
  private notifications: InternalNotification[] = [];
  private milestones: OperationalMilestone[] = [];
  private incidents: OperationalIncident[] = [];
  private dataQualityChecks: DataQualityCheckResult[] = [];
  private readinessProbes: InfrastructureReadinessProbe[] = [];
  private executiveReports: ExecutiveOperationsReport[] = [];

  private constructor() {
    this.resetToDefaults();
  }

  public static getInstance(): OperationsService {
    if (!OperationsService.instance) {
      OperationsService.instance = new OperationsService();
    }
    return OperationsService.instance;
  }

  public resetToDefaults(): void {
    this.workflows = JSON.parse(JSON.stringify(BASELINE_WORKFLOWS));
    this.approvals = JSON.parse(JSON.stringify(BASELINE_APPROVALS));
    this.notifications = JSON.parse(JSON.stringify(BASELINE_NOTIFICATIONS));
    this.milestones = JSON.parse(JSON.stringify(BASELINE_MILESTONES));
    this.incidents = JSON.parse(JSON.stringify(BASELINE_INCIDENTS));
    this.dataQualityChecks = JSON.parse(JSON.stringify(BASELINE_DATA_QUALITY_CHECKS));
    this.readinessProbes = JSON.parse(JSON.stringify(BASELINE_READINESS_PROBES));
    this.executiveReports = JSON.parse(JSON.stringify(BASELINE_EXECUTIVE_REPORTS));
  }

  // Workflows (M27.03)
  public getWorkflows(): OperationalWorkflow[] {
    return [...this.workflows];
  }

  public getWorkflowById(id: string): OperationalWorkflow | undefined {
    return this.workflows.find((w) => w.id === id);
  }

  public createWorkflow(
    input: Omit<OperationalWorkflow, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'auditReference'>,
    actingUserId: string
  ): OperationalWorkflow {
    if (input.idempotencyKey) {
      const existing = this.workflows.find((w) => w.idempotencyKey === input.idempotencyKey);
      if (existing) return existing;
    }

    const id = `WF-2026-${String(this.workflows.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const auditRef = `AUDIT-${id}-${Date.now()}`;

    const newWorkflow: OperationalWorkflow = {
      ...input,
      id,
      version: 1,
      createdAt: now,
      updatedAt: now,
      auditReference: auditRef,
    };

    this.workflows.unshift(newWorkflow);

    db.logAudit({
      actorId: actingUserId,
      actorName: actingUserId,
      actorRole: 'OPERATIONS_MANAGER',
      action: 'WORKFLOW_CREATED',
      resource: id,
      details: `Created cross-department workflow ${id} (${input.workflowType}): ${input.title}`,
    });

    this.sendNotification({
      recipientId: input.assignedOwnerId,
      category: 'TASK_ASSIGNED',
      priority: input.priority,
      title: `New Workflow Assigned: ${input.title}`,
      message: `You are assigned as owner for ${input.workflowType} workflow ${id}.`,
      relatedRecordType: 'WORKFLOW',
      relatedRecordId: id,
    });

    return newWorkflow;
  }

  public transitionWorkflow(
    id: string,
    newStatus: WorkflowStatus,
    stageNote: string,
    actingUserId: string,
    expectedVersion?: number
  ): OperationalWorkflow {
    const workflow = this.workflows.find((w) => w.id === id);
    if (!workflow) throw new Error(`Workflow ${id} not found.`);

    if (expectedVersion !== undefined && workflow.version !== expectedVersion) {
      throw new Error(
        `Optimistic concurrency violation: Expected workflow version ${expectedVersion}, but current version is ${workflow.version}. Please refresh.`
      );
    }

    const allowed = VALID_WORKFLOW_TRANSITIONS[workflow.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: Cannot transition workflow from ${workflow.status} to ${newStatus}. Permitted next states: [${(allowed || []).join(', ')}]`
      );
    }

    workflow.status = newStatus;
    workflow.currentStage = stageNote;
    workflow.version += 1;
    workflow.updatedAt = new Date().toISOString();

    db.logAudit({
      actorId: actingUserId,
      actorName: actingUserId,
      actorRole: 'OPERATIONS_MANAGER',
      action: 'WORKFLOW_TRANSITIONED',
      resource: id,
      details: `Workflow ${id} transitioned to ${newStatus} (version ${workflow.version}): ${stageNote}`,
    });

    return workflow;
  }

  // Approvals (M27.04)
  public getApprovals(): OperationalApproval[] {
    return [...this.approvals];
  }

  public getPendingApprovals(): OperationalApproval[] {
    return this.approvals.filter((a) => a.decision === 'PENDING');
  }

  public createApproval(
    input: Omit<OperationalApproval, 'id' | 'decision' | 'recordVersion' | 'auditReference' | 'createdAt'>,
    requesterId: string
  ): OperationalApproval {
    const id = `APP-2026-${String(this.approvals.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const auditRef = `AUDIT-${id}-${Date.now()}`;

    const newApproval: OperationalApproval = {
      ...input,
      id,
      requesterId,
      decision: 'PENDING',
      recordVersion: 1,
      auditReference: auditRef,
      createdAt: now,
    };

    this.approvals.unshift(newApproval);

    db.logAudit({
      actorId: requesterId,
      actorName: requesterId,
      actorRole: 'STAFF',
      action: 'APPROVAL_REQUESTED',
      resource: id,
      details: `Approval requested for ${input.requestType} (${input.sourceRecordId})`,
    });

    this.sendNotification({
      recipientId: 'EXECUTIVE_ROLE',
      recipientRole: input.requiredApproverRole,
      category: 'APPROVAL_REQUESTED',
      priority: 'HIGH',
      title: `Executive Approval Requested: ${input.title}`,
      message: `${input.requesterName} requested authorization for ${input.title}.`,
      relatedRecordType: 'APPROVAL',
      relatedRecordId: id,
    });

    return newApproval;
  }

  public processApprovalDecision(
    approvalId: string,
    decision: ApprovalDecision,
    comments: string,
    approverId: string,
    approverName: string,
    approverRole: string,
    expectedRecordVersion?: number
  ): OperationalApproval {
    const approval = this.approvals.find((a) => a.id === approvalId);
    if (!approval) throw new Error(`Approval request ${approvalId} not found.`);

    if (approval.decision !== 'PENDING') {
      throw new Error(`Approval request ${approvalId} has already been finalized with decision: ${approval.decision}.`);
    }

    if (approverId && approverId === approval.requesterId) {
      throw new Error(
        `Separation of duties violation: Requester (${approval.requesterName}) cannot approve their own organizational request ${approvalId}.`
      );
    }

    const isPlatformAdmin = approverRole === 'PLATFORM_SUPER_ADMIN' || approverRole === 'MASTER_ADMIN';
    if (!isPlatformAdmin && approverRole !== approval.requiredApproverRole) {
      throw new Error(
        `Authorization barrier: Approver with role ${approverRole} is not authorized for request requiring ${approval.requiredApproverRole}.`
      );
    }

    if (expectedRecordVersion !== undefined && approval.recordVersion !== expectedRecordVersion) {
      throw new Error(
        `Stale approval version detected: Expected version ${expectedRecordVersion}, current version is ${approval.recordVersion}.`
      );
    }

    approval.decision = decision;
    approval.approverId = approverId;
    approval.approverName = approverName;
    approval.comments = comments;
    approval.decisionTimestamp = new Date().toISOString();
    approval.recordVersion += 1;

    db.logAudit({
      actorId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      action: `APPROVAL_${decision}`,
      resource: approvalId,
      details: `Approval ${approvalId} decided as ${decision} by ${approverName} (${approverRole}): ${comments}`,
    });

    this.sendNotification({
      recipientId: approval.requesterId,
      category: 'APPROVAL_COMPLETED',
      priority: decision === 'APPROVED' ? 'HIGH' : 'CRITICAL',
      title: `Approval Decision: ${approval.title} (${decision})`,
      message: `Your request was marked as ${decision} by ${approverName}. Note: ${comments}`,
      relatedRecordType: 'APPROVAL',
      relatedRecordId: approvalId,
    });

    return approval;
  }

  // Notifications (M27.05)
  public getNotifications(recipientId?: string): InternalNotification[] {
    if (!recipientId || recipientId === 'all' || recipientId === 'ALL_STAFF') {
      return [...this.notifications];
    }
    return this.notifications.filter(
      (n) => n.recipientId === recipientId || n.recipientId === 'ALL_STAFF' || n.recipientId === 'EXECUTIVE_ROLE'
    );
  }

  public getUnreadNotificationCount(recipientId?: string): number {
    return this.getNotifications(recipientId).filter((n) => !n.isRead).length;
  }

  public markNotificationAsRead(id: string, recipientId: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.isRead = true;
    notif.readAt = new Date().toISOString();
    return true;
  }

  public markAllNotificationsAsRead(recipientId: string): number {
    let count = 0;
    this.notifications.forEach((n) => {
      if (!n.isRead && (n.recipientId === recipientId || recipientId === 'ALL_STAFF')) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  public sendNotification(
    input: Omit<InternalNotification, 'id' | 'isRead' | 'deliveryStatus' | 'createdAt'>
  ): InternalNotification {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const existing = this.notifications.find(
      (n) =>
        !n.isRead &&
        n.recipientId === input.recipientId &&
        n.category === input.category &&
        n.relatedRecordId === input.relatedRecordId &&
        new Date(n.createdAt).getTime() > fiveMinutesAgo
    );
    if (existing) return existing;

    const id = `NOTIF-2026-${String(this.notifications.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const notif: InternalNotification = {
      ...input,
      id,
      isRead: false,
      deliveryStatus: 'DELIVERED_INBOX',
      createdAt: now,
    };

    this.notifications.unshift(notif);
    return notif;
  }

  // Milestones (M27.07)
  public getMilestones(): OperationalMilestone[] {
    const now = Date.now();
    return this.milestones.map((m) => {
      const isDue = new Date(m.dueDate).getTime() < now;
      const isComplete = m.completionStatus === 'COMPLETED';
      return {
        ...m,
        isOverdue: isDue && !isComplete,
        completionStatus: isDue && !isComplete ? ('OVERDUE' as MilestoneStatus) : m.completionStatus,
      };
    });
  }

  public getOverdueMilestones(): OperationalMilestone[] {
    return this.getMilestones().filter((m) => m.isOverdue);
  }

  public completeMilestone(id: string, actingUserId: string): OperationalMilestone {
    const milestone = this.milestones.find((m) => m.id === id);
    if (!milestone) throw new Error(`Milestone ${id} not found.`);

    milestone.completionStatus = 'COMPLETED';
    milestone.isOverdue = false;
    milestone.completedAt = new Date().toISOString();

    db.logAudit({
      actorId: actingUserId,
      actorName: actingUserId,
      actorRole: 'OPERATIONS_MANAGER',
      action: 'MILESTONE_COMPLETED',
      resource: id,
      details: `Completed operational milestone ${id}: ${milestone.title}`,
    });

    return milestone;
  }

  // Staff & Volunteer Eligibility (M27.08)
  public validateStaffEligibility(staffId: string): { eligible: boolean; reason?: string } {
    const normalizedId = staffId.toUpperCase().replace('STAFF-', 'STF-');
    const staff = masterAdminService.getStaffMembers().find(
      (s) => s.id === staffId || s.staffId === staffId || s.staffId === normalizedId || s.id === normalizedId
    );
    if (staff) {
      if (staff.status !== 'ACTIVE') {
        return {
          eligible: false,
          reason: `Staff member account status is ${staff.status}. Suspended or inactive staff cannot receive new operational assignments.`,
        };
      }
      return { eligible: true };
    }

    const user = db.getState().users.find(
      (u) => u.id === staffId || u.email === staffId || (staffId === 'staff-001' && u.role === 'PLATFORM_SUPER_ADMIN')
    );
    if (user) {
      if (user.status !== 'active') {
        return {
          eligible: false,
          reason: `Staff member account is ${user.status}. Suspended or inactive staff cannot receive new operational assignments.`,
        };
      }
      return { eligible: true };
    }

    return { eligible: false, reason: 'Staff member record not found in directory.' };
  }

  public validateVolunteerEligibility(
    volunteerId: string,
    requiresScreening: boolean = true
  ): { eligible: boolean; reason?: string } {
    const volunteers = masterAdminService.getVolunteers();
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    if (!volunteer) {
      return { eligible: false, reason: 'Volunteer record not found in directory.' };
    }
    if (volunteer.stage !== 'ACTIVE_ENGAGEMENT' && volunteer.stage !== 'ASSIGNMENT' && volunteer.stage !== 'APPROVAL') {
      return { eligible: false, reason: `Volunteer lifecycle stage is ${volunteer.stage}. Active or assigned status required.` };
    }
    if (requiresScreening) {
      const verifiedScreening =
        volunteer.screeningStatus === 'CLEARED' &&
        volunteer.trainingCompleted === true;
      if (!verifiedScreening) {
        return {
          eligible: false,
          reason: `Volunteer screening is incomplete. Screening status '${volunteer.screeningStatus}' and training required prior to community deployment.`,
        };
      }
    }
    return { eligible: true };
  }

  // AI Workforce Supervision (M27.09)
  public getAiWorkforceStatus() {
    const agents = db.getState().aiAgents;
    return agents.map((a) => ({
      agentId: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      assignedPipeline: `${a.category.toUpperCase()} Orchestration Pipeline`,
      humanSupervisor: 'Amara Okafor (Platform Super Admin)',
      lastExecution: '2026-10-27T08:14:00Z',
      executionCount: 142,
      pendingHumanReviews: 0,
      guardrailEnforced: true,
    }));
  }

  public validateAiApprovalRestriction(actionType: string): void {
    const prohibitedAiActions = [
      'APPROVE_FINANCIAL_COMMITMENT',
      'APPROVE_LEGAL_AGREEMENT',
      'APPROVE_GRANT_SUBMISSION',
      'AUTHORIZE_RESTRICTED_REFERRAL',
      'MODIFY_RBAC_PERMISSIONS',
      'ACCESS_RESTRICTED_SURVIVOR_DATA',
      'EXECUTE_UNAUTHORIZED_EXTERNAL_COMMUNICATION',
    ];

    if (prohibitedAiActions.includes(actionType)) {
      throw new Error(
        `AI Governance Violation: AI workforce is strictly prohibited from executing '${actionType}'. Mandatory human supervisor approval gate enforced.`
      );
    }
  }

  // Incidents & Safeguarding Isolation (M27.10 & M27.14)
  public getIncidents(userDepartment?: string, isSafeguardingOfficer?: boolean): OperationalIncident[] {
    return this.incidents.filter((inc) => {
      if (inc.isSafeguardingCrisisQuarantine) {
        return userDepartment === 'DEPT-SAFE' || isSafeguardingOfficer === true;
      }
      return true;
    });
  }

  public reportIncident(
    input: Omit<OperationalIncident, 'id' | 'isSafeguardingCrisisQuarantine' | 'createdAt' | 'auditReference'>,
    reportingUserId: string
  ): OperationalIncident {
    const textToCheck = `${input.title} ${input.description}`.toLowerCase();
    const isCrisis =
      textToCheck.includes('shelter address') ||
      textToCheck.includes('domestic violence') ||
      textToCheck.includes('assault') ||
      textToCheck.includes('protection order') ||
      textToCheck.includes('safe house coordinate') ||
      textToCheck.includes('trauma disclosure');

    const id = isCrisis
      ? `INC-2026-SAFE-${String(this.incidents.length + 1).padStart(3, '0')}`
      : `INC-2026-${String(this.incidents.length + 1).padStart(3, '0')}`;

    const now = new Date().toISOString();
    const auditRef = `AUDIT-${id}-${Date.now()}`;

    const newIncident: OperationalIncident = {
      ...input,
      id,
      responsibleDepartmentId: isCrisis ? 'DEPT-SAFE' : input.responsibleDepartmentId,
      title: isCrisis ? '[SAFEGUARDING CRISIS QUARANTINE - DEPT-SAFE ACCESS ONLY]' : input.title,
      description: isCrisis
        ? '[CONFIDENTIAL SAFEGUARDING INCIDENT: Domestic violence disclosure isolated from general operations. Quarantined to DEPT-SAFE under VAWA non-disclosure rules.]'
        : input.description,
      isSafeguardingCrisisQuarantine: isCrisis,
      createdAt: now,
      auditReference: auditRef,
    };

    this.incidents.unshift(newIncident);

    db.logAudit({
      actorId: reportingUserId,
      actorName: reportingUserId,
      actorRole: 'STAFF',
      action: 'OPERATIONAL_INCIDENT_REPORTED',
      resource: id,
      details: `Reported incident ${id} (quarantine=${isCrisis})`,
    });

    return newIncident;
  }

  public triageIncident(
    id: string,
    newStatus: IncidentStatus,
    summary: string,
    actingUserId: string
  ): OperationalIncident {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) throw new Error(`Incident ${id} not found.`);

    incident.status = newStatus;
    if (summary) incident.resolutionSummary = summary;
    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      incident.resolvedAt = new Date().toISOString();
    }

    db.logAudit({
      actorId: actingUserId,
      actorName: actingUserId,
      actorRole: 'OPERATIONS_MANAGER',
      action: 'INCIDENT_TRIAGED',
      resource: id,
      details: `Incident ${id} updated to ${newStatus}: ${summary}`,
    });

    return incident;
  }

  // Data Quality (M27.11)
  public runDataQualityAudit(): DataQualityCheckResult[] {
    const results: DataQualityCheckResult[] = [...this.dataQualityChecks];
    const now = new Date().toISOString();

    const staleApprovals = this.approvals.filter(
      (a) => a.decision === 'PENDING' && Date.now() - new Date(a.createdAt).getTime() > 30 * 24 * 60 * 60 * 1000
    );
    if (staleApprovals.length > 0) {
      results.push({
        id: `DQ-STALE-${Date.now()}`,
        checkType: 'EXPIRED_APPROVALS',
        sourceRecordType: 'APPROVAL',
        sourceRecordId: staleApprovals.map((a) => a.id).join(', '),
        severity: 'WARNING',
        state: 'WARNING',
        description: `${staleApprovals.length} approvals pending beyond standard 30-day decision window.`,
        responsibleOwnerId: 'staff-001',
        lastCheckedAt: now,
      });
    }

    return results;
  }

  public getDataQualityChecks(): DataQualityCheckResult[] {
    return [...this.dataQualityChecks];
  }

  // Infrastructure Readiness (M27.12)
  public probeInfrastructureReadiness(): InfrastructureReadinessProbe[] {
    const now = new Date().toISOString();
    return this.readinessProbes.map((p) => ({
      ...p,
      lastProbedAt: now,
    }));
  }

  // Executive Reports (M27.13)
  public getExecutiveReports(): ExecutiveOperationsReport[] {
    return [...this.executiveReports];
  }

  public generateExecutiveReport(reportType: ExecutiveReportType, generatingUserId: string): ExecutiveOperationsReport {
    const id = `REP-OPS-${String(this.executiveReports.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const auditRef = `AUDIT-${id}-${Date.now()}`;

    let title = 'Executive Operations Report';
    let summary = 'Automated operations summary';
    let keyMetrics: Record<string, string | number> = {};

    switch (reportType) {
      case 'OPERATIONAL_STATUS_SUMMARY':
        title = 'Unified Operations Status Executive Brief';
        summary = `Cross-departmental summary covering ${this.workflows.length} active workflows and ${this.getPendingApprovals().length} pending approvals.`;
        keyMetrics = {
          totalWorkflows: this.workflows.length,
          pendingApprovals: this.getPendingApprovals().length,
          activeStaff: db.getState().users.filter((u) => u.status === 'active').length,
          overdueMilestones: this.getOverdueMilestones().length,
        };
        break;
      case 'DEPARTMENT_WORKLOAD_REPORT':
        title = 'Cross-Departmental Task and Workflow Distribution';
        summary = 'Analysis of operational capacity across all 10 departments.';
        keyMetrics = {
          activeWorkflows: this.workflows.length,
          totalDepartments: 10,
          pendingTasks: masterAdminService.getTasks().length,
        };
        break;
      case 'INFRASTRUCTURE_READINESS_REPORT':
        title = 'Truthful Production Readiness & Infrastructure Assessment';
        summary = 'Truthful assessment of connected vs deferred external services.';
        keyMetrics = {
          postgresqlStatus: 'NOT_CONNECTED',
          googleWorkspaceStatus: 'AUTHORIZATION_REQUIRED',
          emailSyncStatus: 'NOT_ACTIVATED',
          paymentGatewayStatus: 'NOT_CONNECTED',
        };
        break;
      default:
        title = `${reportType} Briefing`;
        summary = `Operational audit for ${reportType}.`;
        keyMetrics = { timestamp: now };
    }

    const report: ExecutiveOperationsReport = {
      id,
      reportType,
      title,
      summary,
      reportingPeriod: 'Current Operating Period',
      keyMetrics,
      sourceRecordsCount: this.workflows.length + this.approvals.length,
      dataAvailability: 'PARTIAL_TRUTHFUL',
      generatedAt: now,
      generatedByUserId: generatingUserId,
      approvalStatus: 'DRAFT',
      auditReference: auditRef,
    };

    this.executiveReports.unshift(report);

    db.logAudit({
      actorId: generatingUserId,
      actorName: generatingUserId,
      actorRole: 'EXECUTIVE',
      action: 'EXECUTIVE_REPORT_GENERATED',
      resource: id,
      details: `Generated executive operations report ${id} (${reportType})`,
    });

    return report;
  }
}

export const operationsService = OperationsService.getInstance();
