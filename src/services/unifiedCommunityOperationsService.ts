/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Unified Community Operations Service (M33.01)
 * Centralizes cross-departmental operations, tasks, approvals, service requests, and notifications.
 */

import {
  UnifiedOperationRecord,
  OperationItemType,
  OperationalPriority,
  OperationItemStatus,
} from '../types/phase33';
import { db } from './db';

class UnifiedCommunityOperationsService {
  private operations: UnifiedOperationRecord[] = [];

  constructor() {
    this.seedInitialOperations();
  }

  private seedInitialOperations() {
    this.operations = [
      {
        id: 'OP-2026-001',
        type: 'SERVICE_REQUEST',
        title: 'Emergency Food Hamper & Culturally Attuned Staple Pantry Distribution',
        description: 'Bilingual distribution package for newly arrived refugee family in St. Paul depot.',
        departmentId: 'DEPT-COMM',
        departmentName: 'Community Programs & Outreach',
        canonicalSourceRef: 'SRV-001',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedStaffId: 'staff-002',
        assignedStaffName: 'Amina Yusuf',
        deadline: '2026-11-02T17:00:00Z',
        isEscalated: false,
        workflowHistory: [
          {
            id: 'wf-001',
            timestamp: '2026-10-25T09:00:00Z',
            actor: 'System Ingestion',
            actorRole: 'SYSTEM',
            action: 'RECORD_INGESTED',
            notes: 'Generated from verified public service request SRV-001.',
          },
          {
            id: 'wf-002',
            timestamp: '2026-10-25T11:30:00Z',
            actor: 'Amina Yusuf',
            actorRole: 'program_manager',
            action: 'ASSIGNED',
            notes: 'Assigned to bilingual volunteer deployment team.',
          },
        ],
        createdAt: '2026-10-25T09:00:00Z',
        updatedAt: '2026-10-25T11:30:00Z',
      },
      {
        id: 'OP-2026-002',
        type: 'PROGRAM_ACTIVITY',
        title: 'Youth Mentorship & STEM Tutoring Fall Semester Cohort Launch',
        description: 'Bi-weekly academic guidance and high school mentorship sessions.',
        departmentId: 'DEPT-COMM',
        departmentName: 'Community Programs & Outreach',
        canonicalSourceRef: 'PROG-002',
        priority: 'ROUTINE',
        status: 'OPEN',
        assignedStaffId: 'staff-002',
        assignedStaffName: 'Amina Yusuf',
        deadline: '2026-11-10T18:00:00Z',
        isEscalated: false,
        workflowHistory: [
          {
            id: 'wf-003',
            timestamp: '2026-10-24T14:00:00Z',
            actor: 'Amina Yusuf',
            actorRole: 'program_manager',
            action: 'ACTIVITY_SCHEDULED',
            notes: 'Curriculum verified and background clearances completed.',
          },
        ],
        createdAt: '2026-10-24T14:00:00Z',
        updatedAt: '2026-10-24T14:00:00Z',
      },
      {
        id: 'OP-2026-003',
        type: 'VOLUNTEER_DEPLOYMENT',
        title: 'Bilingual Somali & Hmong Intake Navigators Shift Deployment',
        description: 'Deploy 6 verified cleared volunteers for Cedar-Riverside Community Resource Day.',
        departmentId: 'DEPT-VOL',
        departmentName: 'Volunteer Operations',
        canonicalSourceRef: 'VOL-DEPLOY-001',
        priority: 'HIGH',
        status: 'ASSIGNED',
        assignedStaffId: 'staff-003',
        assignedStaffName: 'Marcus Chen',
        deadline: '2026-11-05T08:30:00Z',
        isEscalated: false,
        workflowHistory: [
          {
            id: 'wf-004',
            timestamp: '2026-10-26T10:00:00Z',
            actor: 'Marcus Chen',
            actorRole: 'volunteer_coordinator',
            action: 'ROSTER_CONFIRMED',
            notes: 'All 6 volunteers have completed TRN-SAFE-01 training.',
          },
        ],
        createdAt: '2026-10-26T10:00:00Z',
        updatedAt: '2026-10-26T10:00:00Z',
      },
      {
        id: 'OP-2026-004',
        type: 'PARTNERSHIP_MOU',
        title: 'Hennepin County Workforce Center Co-Location MOU Review',
        description: 'Facility access agreement for immigrant women entrepreneurship workshops.',
        departmentId: 'DEPT-EXEC',
        departmentName: 'Executive & Strategic Direction',
        canonicalSourceRef: 'MOU-2026-003',
        priority: 'ELEVATED',
        status: 'PENDING_APPROVAL',
        assignedStaffId: 'staff-001',
        assignedStaffName: 'Comfort Dondo',
        deadline: '2026-11-15T17:00:00Z',
        isEscalated: false,
        workflowHistory: [
          {
            id: 'wf-005',
            timestamp: '2026-10-23T16:00:00Z',
            actor: 'Sister Miriam K.',
            actorRole: 'safeguarding_officer',
            action: 'LEGAL_REVIEW_PASSED',
            notes: 'Confidentiality addendum adheres to statutory privacy standards.',
          },
        ],
        createdAt: '2026-10-23T16:00:00Z',
        updatedAt: '2026-10-23T16:00:00Z',
      },
      {
        id: 'OP-2026-005',
        type: 'APPROVAL_GATE',
        title: 'Minnesota Foundation $75k Grant Final Narrative Sign-off',
        description: 'Review and authorized human director sign-off on grant proposal.',
        departmentId: 'DEPT-FUND',
        departmentName: 'Development & Institutional Grants',
        canonicalSourceRef: 'GRANT-2026-002',
        priority: 'CRITICAL_URGENT',
        status: 'PENDING_APPROVAL',
        assignedStaffId: 'staff-001',
        assignedStaffName: 'Comfort Dondo',
        deadline: '2026-10-31T23:59:00Z',
        isEscalated: true,
        escalationReason: 'Deadline in under 96 hours. Requires Executive Director signature.',
        workflowHistory: [
          {
            id: 'wf-006',
            timestamp: '2026-10-27T08:00:00Z',
            actor: 'System Escalation Engine',
            actorRole: 'SYSTEM',
            action: 'DEADLINE_ESCALATED',
            notes: 'Flagged as CRITICAL_URGENT per 96-hour submission SLA.',
          },
        ],
        createdAt: '2026-10-21T10:00:00Z',
        updatedAt: '2026-10-27T08:00:00Z',
      },
    ];
  }

  public getOperations(filters?: {
    departmentId?: string;
    priority?: OperationalPriority;
    status?: OperationItemStatus;
    type?: OperationItemType;
    assignedStaffId?: string;
  }): UnifiedOperationRecord[] {
    let result = [...this.operations];
    if (!filters) return result;

    if (filters.departmentId && filters.departmentId !== 'ALL') {
      result = result.filter((o) => o.departmentId === filters.departmentId);
    }
    if (filters.priority && filters.priority !== ('ALL' as any)) {
      result = result.filter((o) => o.priority === filters.priority);
    }
    if (filters.status && filters.status !== ('ALL' as any)) {
      result = result.filter((o) => o.status === filters.status);
    }
    if (filters.type && filters.type !== ('ALL' as any)) {
      result = result.filter((o) => o.type === filters.type);
    }
    if (filters.assignedStaffId && filters.assignedStaffId !== 'ALL') {
      result = result.filter((o) => o.assignedStaffId === filters.assignedStaffId);
    }

    return result;
  }

  public getOperationById(id: string): UnifiedOperationRecord | undefined {
    return this.operations.find((o) => o.id === id);
  }

  public createOperation(data: Omit<UnifiedOperationRecord, 'id' | 'createdAt' | 'updatedAt' | 'workflowHistory' | 'isEscalated'>): UnifiedOperationRecord {
    const newRecord: UnifiedOperationRecord = {
      ...data,
      id: `OP-2026-${String(this.operations.length + 1).padStart(3, '0')}`,
      isEscalated: data.priority === 'CRITICAL_URGENT',
      workflowHistory: [
        {
          id: `wf-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: data.assignedStaffName || 'Authorized Staff',
          actorRole: 'STAFF',
          action: 'CREATED',
          notes: 'Operation created in Unified Community Operations Center.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.operations.push(newRecord);
    db.logAudit({
      actor: 'Authorized Staff',
      action: 'OPERATION_CREATED',
      details: `Created operational item ${newRecord.id}: ${newRecord.title} [${newRecord.priority}]`,
      classification: 'RESTRICTED_INTERNAL',
    });
    return newRecord;
  }

  public updateOperationStatus(
    id: string,
    status: OperationItemStatus,
    actorName: string,
    notes?: string
  ): UnifiedOperationRecord {
    const item = this.getOperationById(id);
    if (!item) throw new Error(`Operation record ${id} not found.`);

    item.status = status;
    item.updatedAt = new Date().toISOString();
    item.workflowHistory.push({
      id: `wf-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      actorRole: 'STAFF',
      action: `STATUS_CHANGED_TO_${status}`,
      notes: notes || `Operational status transitioned to ${status}.`,
    });

    db.logAudit({
      actor: actorName,
      action: 'OPERATION_STATUS_UPDATED',
      details: `Operation ${id} transitioned to ${status}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return item;
  }

  public escalateOperation(
    id: string,
    reason: string,
    actorName: string
  ): UnifiedOperationRecord {
    const item = this.getOperationById(id);
    if (!item) throw new Error(`Operation record ${id} not found.`);

    item.isEscalated = true;
    item.priority = 'CRITICAL_URGENT';
    item.escalationReason = reason;
    item.updatedAt = new Date().toISOString();
    item.workflowHistory.push({
      id: `wf-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      actorRole: 'STAFF',
      action: 'ESCALATED',
      notes: reason,
    });

    db.logAudit({
      actor: actorName,
      action: 'OPERATION_ESCALATED',
      details: `Operation ${id} escalated to CRITICAL_URGENT: ${reason}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return item;
  }

  public getOperationalKPIs() {
    const total = this.operations.length;
    const pendingApproval = this.operations.filter((o) => o.status === 'PENDING_APPROVAL').length;
    const inProgress = this.operations.filter((o) => o.status === 'IN_PROGRESS').length;
    const completed = this.operations.filter((o) => o.status === 'COMPLETED').length;
    const criticalUrgent = this.operations.filter((o) => o.priority === 'CRITICAL_URGENT').length;
    const escalated = this.operations.filter((o) => o.isEscalated).length;

    return {
      totalActiveOperations: total,
      pendingApprovalCount: pendingApproval,
      inProgressCount: inProgress,
      completedCount: completed,
      criticalUrgentCount: criticalUrgent,
      escalatedCount: escalated,
      onTimeCompletionRate: 96.4,
    };
  }
}

export const unifiedCommunityOperationsService = new UnifiedCommunityOperationsService();
