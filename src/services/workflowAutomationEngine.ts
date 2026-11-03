/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Advanced Workflow Automation Engine (M33.11)
 * Provides reusable workflow definitions, state machines, human approval gates, SLAs,
 * escalations, retries, and strict idempotency key enforcement.
 */

import {
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTriggerType,
} from '../types/phase33';
import { db } from './db';

class WorkflowAutomationEngine {
  private definitions: WorkflowDefinition[] = [];
  private instances: WorkflowInstance[] = [];
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor() {
    this.seedWorkflowDefinitions();
  }

  private seedWorkflowDefinitions() {
    this.definitions = [
      {
        id: 'WFD-VOL-ONBOARD',
        name: 'Volunteer Onboarding & Safeguarding Workflow',
        triggerType: 'VOLUNTEER_APPLICATION',
        isActive: true,
        version: 1,
        steps: [
          {
            stepIndex: 0,
            name: 'Application Intake & Skills Extraction',
            stepType: 'AUTO_EVALUATE',
            assignedRole: 'VOLUNTEER_APPLICANT',
            slaHours: 24,
          },
          {
            stepIndex: 1,
            name: 'Mandatory TRN-SAFE-01 Safeguarding Module Assignment',
            stepType: 'STATE_TRANSITION',
            assignedRole: 'STAFF',
            slaHours: 48,
          },
          {
            stepIndex: 2,
            name: 'Human Supervisor Clearance Sign-off (Marcus Chen)',
            stepType: 'HUMAN_APPROVAL',
            assignedRole: 'DEPARTMENT_MANAGER',
            slaHours: 72,
            escalateToRole: 'EXECUTIVE',
          },
        ],
      },
      {
        id: 'WFD-GRANT-SUBMIT',
        name: 'Institutional Grant Proposal Submission Gate',
        triggerType: 'GRANT_STAGE_ADVANCE',
        isActive: true,
        version: 1,
        steps: [
          {
            stepIndex: 0,
            name: 'Proposal Narrative & Budget Match Verification',
            stepType: 'AUTO_EVALUATE',
            assignedRole: 'STAFF',
            slaHours: 24,
          },
          {
            stepIndex: 1,
            name: 'Finance Officer Budget Reconciliation Sign-off',
            stepType: 'HUMAN_APPROVAL',
            assignedRole: 'DEPARTMENT_MANAGER',
            slaHours: 48,
          },
          {
            stepIndex: 2,
            name: 'Executive Director Final Submission Authorization (Comfort Dondo)',
            stepType: 'HUMAN_APPROVAL',
            assignedRole: 'EXECUTIVE',
            slaHours: 48,
            escalateToRole: 'MASTER_ADMIN',
          },
        ],
      },
      {
        id: 'WFD-CONTENT-MOD',
        name: 'Public Announcement Moderation & Publication Gate',
        triggerType: 'DOCUMENT_MODERATION_PENDING',
        isActive: true,
        version: 1,
        steps: [
          {
            stepIndex: 0,
            name: 'Content & Anti-Contamination Screening',
            stepType: 'AUTO_EVALUATE',
            assignedRole: 'STAFF',
            slaHours: 12,
          },
          {
            stepIndex: 1,
            name: 'Authorized Staff Editorial Review & Approval',
            stepType: 'HUMAN_APPROVAL',
            assignedRole: 'STAFF',
            slaHours: 24,
            escalateToRole: 'DEPARTMENT_MANAGER',
          },
        ],
      },
    ];

    this.instances = [
      {
        id: 'INST-2026-001',
        definitionId: 'WFD-VOL-ONBOARD',
        definitionName: 'Volunteer Onboarding & Safeguarding Workflow',
        sourceEntityId: 'vol-001',
        currentStepIndex: 2,
        status: 'AWAITING_APPROVAL',
        idempotencyKey: 'idemp-vol-001-onboard',
        auditTrail: [
          {
            timestamp: '2026-10-24T10:00:00Z',
            stepIndex: 0,
            actor: 'System Ingestion',
            result: 'Application validated and skills extracted.',
          },
          {
            timestamp: '2026-10-24T10:05:00Z',
            stepIndex: 1,
            actor: 'System Ingestion',
            result: 'Assigned TRN-SAFE-01 training module.',
          },
        ],
        startedAt: '2026-10-24T10:00:00Z',
      },
    ];
    this.processedIdempotencyKeys.add('idemp-vol-001-onboard');
  }

  public getDefinitions(): WorkflowDefinition[] {
    return [...this.definitions];
  }

  public getInstances(): WorkflowInstance[] {
    return [...this.instances];
  }

  public getInstanceById(id: string): WorkflowInstance | undefined {
    return this.instances.find((i) => i.id === id);
  }

  /**
   * Starts a new workflow instance with strict idempotency verification
   */
  public startWorkflow(
    definitionId: string,
    sourceEntityId: string,
    idempotencyKey: string,
    actorName: string
  ): WorkflowInstance {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      const existing = this.instances.find((i) => i.idempotencyKey === idempotencyKey);
      if (existing) return existing;
      throw new Error(`IDEMPOTENCY CONFLICT: Key "${idempotencyKey}" was already processed.`);
    }

    const def = this.definitions.find((d) => d.id === definitionId);
    if (!def) throw new Error(`Workflow definition ${definitionId} not found.`);

    const newInst: WorkflowInstance = {
      id: `INST-${Date.now()}`,
      definitionId: def.id,
      definitionName: def.name,
      sourceEntityId,
      currentStepIndex: 0,
      status: def.steps[0].stepType === 'HUMAN_APPROVAL' ? 'AWAITING_APPROVAL' : 'ACTIVE',
      idempotencyKey,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          stepIndex: 0,
          actor: actorName,
          result: `Workflow instance started on step: ${def.steps[0].name}`,
        },
      ],
      startedAt: new Date().toISOString(),
    };

    this.instances.push(newInst);
    this.processedIdempotencyKeys.add(idempotencyKey);

    db.logAudit({
      actor: actorName,
      action: 'WORKFLOW_INSTANCE_STARTED',
      details: `Started workflow "${def.name}" (${newInst.id}) for entity ${sourceEntityId}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return newInst;
  }

  /**
   * Advances a workflow instance past an approval or action step
   */
  public advanceStep(
    instanceId: string,
    actorName: string,
    approvalDecision: 'APPROVED' | 'REJECTED',
    notes?: string
  ): WorkflowInstance {
    const inst = this.getInstanceById(instanceId);
    if (!inst) throw new Error(`Workflow instance ${instanceId} not found.`);

    if (inst.status === 'COMPLETED' || inst.status === 'CANCELLED') {
      throw new Error(`Cannot advance workflow ${instanceId}: Status is already ${inst.status}.`);
    }

    const def = this.definitions.find((d) => d.id === inst.definitionId);
    if (!def) throw new Error(`Definition ${inst.definitionId} not found.`);

    if (approvalDecision === 'REJECTED') {
      inst.status = 'CANCELLED';
      inst.completedAt = new Date().toISOString();
      inst.auditTrail.push({
        timestamp: new Date().toISOString(),
        stepIndex: inst.currentStepIndex,
        actor: actorName,
        result: `Rejected at step "${def.steps[inst.currentStepIndex].name}". Reason: ${notes || 'No notes provided'}`,
      });
      return inst;
    }

    const nextStepIndex = inst.currentStepIndex + 1;
    if (nextStepIndex >= def.steps.length) {
      // Completed
      inst.currentStepIndex = nextStepIndex;
      inst.status = 'COMPLETED';
      inst.completedAt = new Date().toISOString();
      inst.auditTrail.push({
        timestamp: new Date().toISOString(),
        stepIndex: inst.currentStepIndex - 1,
        actor: actorName,
        result: `Final step approved. Workflow successfully completed. Notes: ${notes || 'None'}`,
      });
    } else {
      inst.currentStepIndex = nextStepIndex;
      const nextStep = def.steps[nextStepIndex];
      inst.status = nextStep.stepType === 'HUMAN_APPROVAL' ? 'AWAITING_APPROVAL' : 'ACTIVE';
      inst.auditTrail.push({
        timestamp: new Date().toISOString(),
        stepIndex: nextStepIndex,
        actor: actorName,
        result: `Approved step ${inst.currentStepIndex - 1}. Advanced to: "${nextStep.name}"`,
      });
    }

    db.logAudit({
      actor: actorName,
      action: 'WORKFLOW_STEP_ADVANCED',
      details: `Instance ${instanceId} advanced to step ${inst.currentStepIndex}. Status: ${inst.status}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return inst;
  }
}

export const workflowAutomationEngine = new WorkflowAutomationEngine();
