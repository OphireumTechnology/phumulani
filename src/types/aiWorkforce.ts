/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 29 Unified 36-Agent AI Workforce Type Definitions
 * Grounded in Master Directive Phase 29 (M29.02, M29.03, M29.10, M29.11)
 */

export type AgentDivision = 'ORGANIZATIONAL' | 'FUNDRAISING';

export type AgentLifecycle =
  | 'REGISTERED'
  | 'CONFIGURED'
  | 'TESTING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'DISABLED';

export type AgentReadiness =
  | 'NOT_VERIFIED'
  | 'BLOCKED_BY_INTEGRATION'
  | 'READY_FOR_SUPERVISED_PILOT'
  | 'READY_FOR_SUPERVISED_PRODUCTION'
  | 'NOT_READY';

export interface UnifiedAgentDefinition {
  id: string; // e.g. 'ORG-AI-001' or 'FUND-AI-001'
  legacyId?: string; // e.g. 'A01' for backward compatibility
  code: string; // e.g. 'ORG 01' or 'FUND 01'
  name: string;
  division: AgentDivision;
  purpose: string;
  role: string;
  ownerDepartment: string;
  supervisorRole: string;
  supervisorName: string;
  pipelineIds: string[];
  modelConfigurationId: string;
  allowedToolIds: string[];
  prohibitedActionIds: string[];
  allowedDataClassifications: string[];
  requiresHumanApproval: boolean;
  version: string;
  lifecycle: AgentLifecycle;
  readiness: AgentReadiness;
  systemPrompt: string;
  callsThisMonth: number;
  tokenUsage: number;
  costEstimateUSD: number;
  lastEvaluationScore: number;
  lastActiveAt?: string;
  integrationBlockers?: string[];
  // Consumer and test compatibility aliases
  description?: string;
  systemInstructions?: string;
  allowedTools?: string[];
  prohibitedTools?: string[];
  lifecycleStatus?: string;
  humanSupervisor?: { role: string; name: string };
  fundraisingPipeline?: string;
}

export interface CrossDivisionHandoff {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  workflowId: string;
  initiatingUserId: string;
  initiatingUserRole: string;
  payload: Record<string, any>;
  propagatedPermissions: string[];
  requiresHumanApproval: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED_BY_POLICY';
  createdAt: string;
  completedAt?: string;
  resultSummary?: string;
}

export interface PendingAgentApproval {
  id: string;
  agentId: string;
  agentName: string;
  division: AgentDivision;
  actionType: string;
  targetEntity: string;
  previewSummary: string;
  draftContent: string;
  requesterRole: string;
  requiredApproverRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
}

export interface WorkforceSummaryKPIs {
  totalDistinctAgents: number;
  organizationalAgentsCount: number;
  fundraisingAgentsCount: number;
  activeAgentsCount: number;
  pausedAgentsCount: number;
  blockedAgentsCount: number;
  totalExecutions: number;
  totalFailures: number;
  pendingApprovalsCount: number;
  totalMonthlyCostUSD: number;
  globalEmergencyHaltActive: boolean;
}
