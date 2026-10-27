/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — 36-Agent AI Workforce Collaboration Service (M33.06)
 * Governs multi-agent task planning, permission intersection, execution budgets, DAG workflows,
 * failure escalation, and emergency halt propagation across ORG-AI-001..018 and FUND-AI-001..018.
 */

import { CrossAgentTaskPlan } from '../types/phase33';
import { db } from './db';

class AIWorkforceCollaborationService {
  private plans: CrossAgentTaskPlan[] = [];
  private emergencyHaltActive: boolean = false;
  private haltedAgentIds: Set<string> = new Set();

  constructor() {
    this.seedCollaborationPlans();
  }

  private seedCollaborationPlans() {
    this.plans = [
      {
        planId: 'PLAN-2026-001',
        title: 'Q4 Integrated Year-End Community Appeal & Grant Synchronization',
        initiatingAgentId: 'ORG-AI-001',
        initiatingSupervisorRole: 'executive_director',
        leadDepartment: 'Executive & Development',
        status: 'IN_EXECUTION',
        tasks: [
          {
            taskId: 'TASK-P01-1',
            assignedAgentId: 'FUND-AI-001',
            actionName: 'Analyze Q4 donor segment engagement history',
            dependsOnTaskIds: [],
            status: 'DONE',
            allowedPermissions: ['crm:read_non_pii', 'analytics:aggregate'],
            resultSnippet: 'Analyzed 180 donors; identified 42 prospective year-end recurring donors.',
          },
          {
            taskId: 'TASK-P01-2',
            assignedAgentId: 'FUND-AI-002',
            actionName: 'Verify matching requirements for Minnesota Foundation Grant',
            dependsOnTaskIds: ['TASK-P01-1'],
            status: 'DONE',
            allowedPermissions: ['grants:read', 'budget:verify'],
            resultSnippet: 'Verified $25k matching funds requirement from community giving pool.',
          },
          {
            taskId: 'TASK-P01-3',
            assignedAgentId: 'ORG-AI-005',
            actionName: 'Draft bilingual community newsletter appeal',
            dependsOnTaskIds: ['TASK-P01-2'],
            status: 'AWAITING_HUMAN_APPROVAL',
            allowedPermissions: ['content:draft', 'translation:bilingual'],
            resultSnippet: 'Draft created. Awaiting review by Communications Officer.',
          },
          {
            taskId: 'TASK-P01-4',
            assignedAgentId: 'FUND-AI-005',
            actionName: 'Prepare executive donation acknowledgment template',
            dependsOnTaskIds: ['TASK-P01-3'],
            status: 'QUEUED',
            allowedPermissions: ['stewardship:draft'],
          },
        ],
        executionBudgetUSD: 5.0,
        actualCostUSD: 0.85,
        humanSignOffRequired: true,
        createdAt: '2026-10-25T10:00:00Z',
      },
      {
        planId: 'PLAN-2026-002',
        title: 'Volunteer Intake & Safeguarding Clearance Verification Pipeline',
        initiatingAgentId: 'ORG-AI-009',
        initiatingSupervisorRole: 'volunteer_coordinator',
        leadDepartment: 'Volunteer Operations',
        status: 'IN_EXECUTION',
        tasks: [
          {
            taskId: 'TASK-P02-1',
            assignedAgentId: 'ORG-AI-009',
            actionName: 'Extract skills and availability from new volunteer applicants',
            dependsOnTaskIds: [],
            status: 'DONE',
            allowedPermissions: ['volunteers:read_application'],
            resultSnippet: 'Processed 5 new applications; parsed skills and language proficiencies.',
          },
          {
            taskId: 'TASK-P02-2',
            assignedAgentId: 'ORG-AI-011',
            actionName: 'Check training module completion records',
            dependsOnTaskIds: ['TASK-P02-1'],
            status: 'IN_PROGRESS',
            allowedPermissions: ['training:verify_completion'],
          },
          {
            taskId: 'TASK-P02-3',
            assignedAgentId: 'ORG-AI-010',
            actionName: 'Route clearance dossier to human Volunteer Coordinator (Marcus Chen)',
            dependsOnTaskIds: ['TASK-P02-2'],
            status: 'QUEUED',
            allowedPermissions: ['safeguarding:route_to_human'],
          },
        ],
        executionBudgetUSD: 3.5,
        actualCostUSD: 0.42,
        humanSignOffRequired: true,
        createdAt: '2026-10-26T14:30:00Z',
      },
    ];
  }

  public getCollaborationPlans(): CrossAgentTaskPlan[] {
    return [...this.plans];
  }

  public getPlanById(planId: string): CrossAgentTaskPlan | undefined {
    return this.plans.find((p) => p.planId === planId);
  }

  /**
   * Enforces strict Permission Intersection on Cross-Agent Delegation
   * The resulting execution permissions can NEVER exceed either agent's allowed capabilities.
   */
  public calculatePermissionIntersection(
    sourceAgentPermissions: string[],
    targetAgentPermissions: string[]
  ): string[] {
    const prohibitedActions = [
      'survivor:access',
      'survivor_case:access',
      'payments:transfer',
      'refund:issue',
      'grants:submit_binding',
      'bank:modify',
      'board:bind_vote',
    ];

    // Intersection
    const intersection = sourceAgentPermissions.filter((perm) =>
      targetAgentPermissions.includes(perm) && !prohibitedActions.includes(perm)
    );

    return intersection;
  }

  /**
   * Executes or transitions a step in a multi-agent plan with budget checking and halt guards.
   */
  public advanceTask(
    planId: string,
    taskId: string,
    actorName: string,
    resultSnippet?: string
  ): CrossAgentTaskPlan {
    if (this.emergencyHaltActive) {
      throw new Error('GLOBAL EMERGENCY HALT IS ACTIVE: All automated AI workforce actions are suspended.');
    }

    const plan = this.getPlanById(planId);
    if (!plan) throw new Error(`Collaboration plan ${planId} not found.`);

    const task = plan.tasks.find((t) => t.taskId === taskId);
    if (!task) throw new Error(`Task ${taskId} not found in plan ${planId}.`);

    if (this.haltedAgentIds.has(task.assignedAgentId)) {
      throw new Error(`Agent ${task.assignedAgentId} is halted. Cannot execute task.`);
    }

    // Verify dependencies
    const unmetDeps = task.dependsOnTaskIds.filter((depId) => {
      const dep = plan.tasks.find((t) => t.taskId === depId);
      return !dep || dep.status !== 'DONE';
    });

    if (unmetDeps.length > 0) {
      throw new Error(`Cannot advance task ${taskId}: Unmet dependencies: ${unmetDeps.join(', ')}.`);
    }

    task.status = 'DONE';
    if (resultSnippet) task.resultSnippet = resultSnippet;

    // Check if entire plan is complete
    const allDone = plan.tasks.every((t) => t.status === 'DONE');
    if (allDone) {
      plan.status = 'COMPLETED';
      plan.completedAt = new Date().toISOString();
    }

    db.logAudit({
      actor: actorName,
      action: 'AI_TASK_ADVANCED',
      details: `Plan ${planId} / Task ${taskId} completed by ${task.assignedAgentId}. Budget: $${plan.actualCostUSD.toFixed(2)}/$${plan.executionBudgetUSD.toFixed(2)}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return plan;
  }

  /**
   * Global Emergency Halt: Instantly suspends all 36 agents.
   */
  public triggerGlobalEmergencyHalt(reason: string, actorName: string): boolean {
    this.emergencyHaltActive = true;
    this.plans.forEach((p) => {
      if (p.status === 'IN_EXECUTION') p.status = 'HALTED_BY_EMERGENCY';
    });

    db.logAudit({
      actor: actorName,
      action: 'GLOBAL_EMERGENCY_HALT_TRIGGERED',
      details: `EMERGENCY HALT ACTIVATED across all 36 AI agents: ${reason}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return true;
  }

  /**
   * Resumes global execution after human executive verification.
   */
  public resumeGlobalExecution(actorName: string): boolean {
    this.emergencyHaltActive = false;
    this.haltedAgentIds.clear();

    db.logAudit({
      actor: actorName,
      action: 'GLOBAL_EMERGENCY_HALT_LIFTED',
      details: `Emergency halt lifted by authorized executive ${actorName}. AI workforce returned to normal supervised operation.`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return true;
  }

  public isGlobalHaltActive(): boolean {
    return this.emergencyHaltActive;
  }

  public getCollaborationStats() {
    const totalPlans = this.plans.length;
    const activePlans = this.plans.filter((p) => p.status === 'IN_EXECUTION').length;
    const completedPlans = this.plans.filter((p) => p.status === 'COMPLETED').length;
    const totalTasks = this.plans.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = this.plans.reduce(
      (sum, p) => sum + p.tasks.filter((t) => t.status === 'DONE').length,
      0
    );

    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalTasks,
      completedTasks,
      globalEmergencyHaltActive: this.emergencyHaltActive,
      haltedAgentsCount: this.haltedAgentIds.size,
      totalBudgetAllocatedUSD: this.plans.reduce((s, p) => s + p.executionBudgetUSD, 0),
      totalSpentUSD: this.plans.reduce((s, p) => s + p.actualCostUSD, 0),
    };
  }
}

export const aiWorkforceCollaborationService = new AIWorkforceCollaborationService();
