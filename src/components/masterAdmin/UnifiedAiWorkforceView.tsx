/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 29 Unified 36-Agent AI Workforce Command Center
 * Grounded in Master Directive Phase 29 (M29.11, M29.12)
 */

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Power,
  RotateCcw,
  Clock,
  Layers,
  ArrowRightLeft,
  FileText,
  DollarSign,
  Send,
  Lock,
  Eye,
  Info,
  Check,
  X,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import {
  UnifiedAgentDefinition,
  AgentDivision,
  PendingAgentApproval,
  WorkforceSummaryKPIs,
  CrossDivisionHandoff,
} from '../../types/aiWorkforce';
import { ALL_UNIFIED_AGENTS } from '../../services/unifiedAiWorkforceSeed';
import { unifiedAiWorkforceService } from '../../services/unifiedAiWorkforceService';

interface UnifiedAiWorkforceViewProps {
  currentUserRole?: string;
}

export const UnifiedAiWorkforceView: React.FC<UnifiedAiWorkforceViewProps> = ({
  currentUserRole = 'master_admin',
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ORGANIZATIONAL' | 'FUNDRAISING' | 'APPROVALS' | 'COLLABORATION' | 'SECURITY'>('ALL');
  const [agents, setAgents] = useState<UnifiedAgentDefinition[]>(ALL_UNIFIED_AGENTS);
  const [kpis, setKpis] = useState<WorkforceSummaryKPIs>(unifiedAiWorkforceService.getWorkforceKPIs());
  const [approvals, setApprovals] = useState<PendingAgentApproval[]>(unifiedAiWorkforceService.getPendingApprovals());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<UnifiedAgentDefinition | null>(null);
  const [executionModalAgent, setExecutionModalAgent] = useState<UnifiedAgentDefinition | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Cross-division handoff state
  const [handoffSource, setHandoffSource] = useState('ORG-AI-012');
  const [handoffTarget, setHandoffTarget] = useState('FUND-AI-008');
  const [handoffPayload, setHandoffPayload] = useState('{"rfpTitle": "Minnesota OJP Immigrant Services Grant 2026", "fundingAmount": 150000}');
  const [handoffResult, setHandoffResult] = useState<CrossDivisionHandoff | null>(null);
  const [isHandoffRunning, setIsHandoffRunning] = useState(false);

  const refreshData = () => {
    setAgents([...unifiedAiWorkforceService.getAllAgents()]);
    setKpis(unifiedAiWorkforceService.getWorkforceKPIs());
    setApprovals([...unifiedAiWorkforceService.getPendingApprovals()]);
  };

  const handleToggleLifecycle = async (agentId: string, current: string) => {
    try {
      const next = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await unifiedAiWorkforceService.setAgentLifecycle(agentId, next, currentUserRole);
      setActionMessage({ text: `Agent ${agentId} is now ${next}.`, type: 'success' });
      refreshData();
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  const handleEmergencyHalt = async () => {
    if (confirm('CRITICAL ACTION: Halt all 36 AI workforce agents immediately?')) {
      await unifiedAiWorkforceService.emergencyHaltAllAgents(currentUserRole);
      setActionMessage({ text: 'EMERGENCY HALT ACTIVATED: All 36 agents paused.', type: 'error' });
      refreshData();
    }
  };

  const handleResumeAll = async () => {
    await unifiedAiWorkforceService.resumeAllAgents(currentUserRole);
    setActionMessage({ text: 'All 36 agents resumed successfully.', type: 'success' });
    refreshData();
  };

  const handleApprovalDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await unifiedAiWorkforceService.decideApproval(id, decision, currentUserRole, `Reviewed via Unified AI Command Center by ${currentUserRole}`);
      setActionMessage({ text: `Recommendation ${decision.toLowerCase()} successfully.`, type: 'success' });
      refreshData();
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    }
  };

  const handleExecuteTask = async () => {
    if (!executionModalAgent) return;
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      let parsedPayload: Record<string, any> = {};
      try {
        parsedPayload = taskInput ? JSON.parse(taskInput) : { task: taskTitle };
      } catch {
        parsedPayload = { text: taskInput || taskTitle };
      }

      const res = await unifiedAiWorkforceService.executeAgentTask({
        agentId: executionModalAgent.id,
        taskTitle: taskTitle || 'Operational Task',
        inputPayload: parsedPayload,
        requesterRole: currentUserRole,
      });

      setExecutionResult(res);
      refreshData();
    } catch (err: any) {
      setExecutionResult({ success: false, blockedByPolicy: true, policyReason: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunHandoff = async () => {
    setIsHandoffRunning(true);
    setHandoffResult(null);
    try {
      let payload = {};
      try {
        payload = JSON.parse(handoffPayload);
      } catch {
        payload = { text: handoffPayload };
      }
      const res = await unifiedAiWorkforceService.executeCrossDivisionHandoff({
        sourceAgentId: handoffSource,
        targetAgentId: handoffTarget,
        workflowId: `wf-p29-${Date.now()}`,
        initiatingUserId: 'usr-admin-01',
        initiatingUserRole: currentUserRole,
        payload,
      });
      setHandoffResult(res);
      refreshData();
    } catch (err: any) {
      setActionMessage({ text: err.message, type: 'error' });
    } finally {
      setIsHandoffRunning(false);
    }
  };

  // Filter agents
  const filteredAgents = agents.filter((ag) => {
    if (activeTab === 'ORGANIZATIONAL' && ag.division !== 'ORGANIZATIONAL') return false;
    if (activeTab === 'FUNDRAISING' && ag.division !== 'FUNDRAISING') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ag.id.toLowerCase().includes(q) ||
        ag.name.toLowerCase().includes(q) ||
        ag.role.toLowerCase().includes(q) ||
        ag.ownerDepartment.toLowerCase().includes(q) ||
        ag.supervisorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Emergency Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Phase 29 Master Unified Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                36 Autonomous Agents
              </span>
              {kpis.globalEmergencyHaltActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  EMERGENCY HALT ACTIVE
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-teal-400" />
              Unified AI Workforce Command Center
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              Centralized orchestration and human supervision across Division A (18 Organizational AI Roles) and Division B (18 Fundraising AI Agents). Enforces strict VAWA Section 1367 safeguarding boundaries and least-privilege tool allowlists.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            {kpis.globalEmergencyHaltActive ? (
              <button
                onClick={handleResumeAll}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resume All 36 Agents</span>
              </button>
            ) : (
              <button
                onClick={handleEmergencyHalt}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Halt All 36 Agents</span>
              </button>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div
            className={`mt-4 p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                : 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Total Workforce</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{kpis.totalDistinctAgents} Agents</div>
            <div className="text-[10px] text-teal-400 font-medium">18 Org + 18 Fund</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Active / Operational</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{kpis.activeAgentsCount} Active</div>
            <div className="text-[10px] text-slate-400 font-medium">{kpis.pausedAgentsCount} Paused by Policy</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Human Review Queue</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{kpis.pendingApprovalsCount} Pending</div>
            <div className="text-[10px] text-amber-300/80 font-medium">Consequential gates active</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Monthly Executions</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{kpis.totalExecutions.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-medium">0 Unrecovered failures</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Estimated Cost</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">${kpis.totalMonthlyCostUSD.toFixed(2)}</div>
            <div className="text-[10px] text-teal-400 font-medium">Under $50/mo ceiling</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="text-[11px] font-medium text-slate-400">Safeguarding Status</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">VAWA SEC 1367</div>
            <div className="text-[10px] text-emerald-400 font-medium">Zero-disclosure vault</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Agents (36)
          </button>
          <button
            onClick={() => setActiveTab('ORGANIZATIONAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ORGANIZATIONAL'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Division A: Organizational</span>
            <span className="px-1.5 py-0.2 bg-teal-800 text-teal-100 rounded text-[10px]">18</span>
          </button>
          <button
            onClick={() => setActiveTab('FUNDRAISING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'FUNDRAISING'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Division B: Fundraising</span>
            <span className="px-1.5 py-0.2 bg-indigo-800 text-indigo-100 rounded text-[10px]">18</span>
          </button>
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'APPROVALS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Human Approvals</span>
            <span className="px-1.5 py-0.2 bg-amber-700 text-amber-100 rounded text-[10px]">
              {kpis.pendingApprovalsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('COLLABORATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'COLLABORATION'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Cross-Division Handoffs</span>
          </button>
          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SECURITY'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>VAWA Safeguarding</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents, roles, supervisors..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* VIEW: AGENTS GRID (ALL, ORGANIZATIONAL, FUNDRAISING) */}
      {(activeTab === 'ALL' || activeTab === 'ORGANIZATIONAL' || activeTab === 'FUNDRAISING') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Showing {filteredAgents.length} of 36 Registered AI Agents
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          ag.division === 'ORGANIZATIONAL'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {ag.id}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{ag.ownerDepartment}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ag.lifecycle === 'PAUSED'
                          ? 'bg-rose-100 text-rose-800'
                          : ag.lifecycle === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {ag.lifecycle}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">{ag.name}</h4>
                    <div className="text-[11px] font-medium text-slate-500">{ag.role}</div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{ag.purpose}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {ag.modelConfigurationId}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Sup: {ag.supervisorName}
                    </span>
                    {ag.requiresHumanApproval && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                        Approval Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Calls: {ag.callsThisMonth.toLocaleString()}</span>
                    <span>Cost: ${ag.costEstimateUSD.toFixed(3)}</span>
                    <span className="text-emerald-700 font-semibold">{ag.lastEvaluationScore.toFixed(1)}% Score</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedAgent(ag)}
                      className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setExecutionModalAgent(ag);
                          setTaskTitle(`Execute Task for ${ag.name}`);
                          setTaskInput('');
                          setExecutionResult(null);
                        }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded font-bold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-slate-700" />
                        <span>Run</span>
                      </button>

                      <button
                        onClick={() => handleToggleLifecycle(ag.id, ag.lifecycle)}
                        className={`text-xs px-2 py-1 rounded font-bold ${
                          ag.lifecycle === 'PAUSED'
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {ag.lifecycle === 'PAUSED' ? 'Activate' : 'Pause'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: HUMAN APPROVALS QUEUE */}
      {activeTab === 'APPROVALS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Human Approval Gateway ({approvals.filter((a) => a.status === 'PENDING').length} Pending Review)
              </h3>
              <p className="text-xs text-slate-500">
                Consequential actions (donor correspondence, grant submissions, partnership MOUs) are held in fail-closed review.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {approvals.map((appr) => (
              <div
                key={appr.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        appr.division === 'ORGANIZATIONAL' ? 'bg-teal-100 text-teal-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {appr.agentName} ({appr.agentId})
                    </span>
                    <span className="font-semibold text-xs text-slate-900">{appr.actionType}</span>
                    <span className="text-xs text-slate-500">• Target: {appr.targetEntity}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      appr.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : appr.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {appr.status}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  {appr.draftContent}
                </div>

                {appr.status === 'PENDING' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Required Signoff: <strong className="text-slate-700">{appr.requiredApproverRole}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'REJECTED')}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprovalDecision(appr.id, 'APPROVED')}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Authorize</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CROSS-DIVISION COLLABORATION HANDOFFS */}
      {activeTab === 'COLLABORATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              Cross-Division Agent Collaboration Gateway
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforces the non-delegable authority principle: Agent A cannot grant Agent B more authority than the human requester possesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Initiate Authorized Collaboration Handoff
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Agent (Division A or B)</label>
                  <select
                    value={handoffSource}
                    onChange={(e) => setHandoffSource(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.division})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Agent (Division A or B)</label>
                  <select
                    value={handoffTarget}
                    onChange={(e) => setHandoffTarget(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.division})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Handoff Payload (JSON)</label>
                  <textarea
                    rows={4}
                    value={handoffPayload}
                    onChange={(e) => setHandoffPayload(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900 focus:outline-hidden"
                  />
                </div>

                <button
                  disabled={isHandoffRunning}
                  onClick={handleRunHandoff}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isHandoffRunning ? 'Evaluating Handoff...' : 'Execute Authorized Handoff'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Handoff Verification & Propagated Permissions
              </h4>
              {handoffResult ? (
                <div
                  className={`p-4 rounded-xl border space-y-2 text-xs ${
                    handoffResult.status === 'BLOCKED_BY_POLICY'
                      ? 'bg-rose-50 text-rose-900 border-rose-200'
                      : 'bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Handoff Status: {handoffResult.status}</span>
                    <span className="font-mono text-[10px]">{handoffResult.id}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{handoffResult.resultSummary}</p>
                  <div className="pt-2 border-t border-slate-200/60 font-mono text-[10px]">
                    Propagated Tool Permissions: [{handoffResult.propagatedPermissions.join(', ')}]
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Select a source and target agent and execute handoff to inspect least-privilege permission propagation and audit traces.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: VAWA SAFEGUARDING & PRIVACY SENTINEL */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-700" />
                VAWA Section 1367 Safeguarding & Privacy Architecture
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Strict statutory firewall isolating confidential survivor cases (SAFE-MN-*) from general organizational and fundraising AI.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              100% Policy Isolation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                Zero-Disclosure Database Vault
              </div>
              <p className="text-xs text-slate-600">
                Confidential survivor intakes are partitioned into <code className="text-slate-800 bg-slate-200 px-1 py-0.5 rounded">restricted_intakes</code> with anonymous tracking codes. AI agents receive default-deny foreign key restrictions.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Real-Time Crisis Interception
              </div>
              <p className="text-xs text-slate-600">
                Trauma, abuse, or danger keywords halt all automated model processing immediately. Requests are evicted and routed directly to Sister Miriam K. and MN Day One Hotline.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-700" />
                Sentinel Agent ORG-AI-018
              </div>
              <p className="text-xs text-slate-600">
                Audits append-only SHA-256 logs continuously to detect anomalous query attempts without ever accessing private case files or shelter locations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AGENT DETAIL INSPECTION MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                  {selectedAgent.id} ({selectedAgent.division})
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 mt-1">{selectedAgent.name}</h3>
                <div className="text-xs text-slate-500">{selectedAgent.role} • {selectedAgent.ownerDepartment}</div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700">System Instruction & Purpose:</span>
                <p className="text-slate-600 mt-0.5">{selectedAgent.purpose}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-wrap text-slate-800">
                {selectedAgent.systemPrompt}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-800 mb-1">Allowed Tools ({selectedAgent.allowedToolIds.length})</div>
                  <ul className="list-disc list-inside text-emerald-900 text-[11px] space-y-0.5">
                    {selectedAgent.allowedToolIds.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <div className="font-bold text-rose-800 mb-1">Prohibited Tools ({selectedAgent.prohibitedActionIds.length})</div>
                  <ul className="list-disc list-inside text-rose-900 text-[11px] space-y-0.5">
                    {selectedAgent.prohibitedActionIds.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-100">
                <span>Supervisor: <strong>{selectedAgent.supervisorName} ({selectedAgent.supervisorRole})</strong></span>
                <span>Model: <strong>{selectedAgent.modelConfigurationId}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT TEST EXECUTION MODAL */}
      {executionModalAgent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Execute Agent: {executionModalAgent.name} ({executionModalAgent.id})
                </h3>
                <div className="text-xs text-slate-500">Division: {executionModalAgent.division} • Supervisor: {executionModalAgent.supervisorName}</div>
              </div>
              <button onClick={() => setExecutionModalAgent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Input Payload (JSON or Prompt Text)</label>
                <textarea
                  rows={3}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder='{"donorName": "Generous Donor", "giftAmount": 5000}'
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setExecutionModalAgent(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={isExecuting}
                  onClick={handleExecuteTask}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isExecuting ? 'Executing...' : 'Run Agent Task'}</span>
                </button>
              </div>

              {executionResult && (
                <div
                  className={`p-3.5 rounded-xl border mt-3 text-xs space-y-1.5 ${
                    executionResult.blockedByPolicy
                      ? 'bg-rose-50 text-rose-900 border-rose-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {executionResult.blockedByPolicy ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                    <span>{executionResult.blockedByPolicy ? 'Policy Halt / Blocked' : 'Execution Succeeded'}</span>
                  </div>
                  {executionResult.policyReason && (
                    <p className="text-[11px] font-medium">{executionResult.policyReason}</p>
                  )}
                  {executionResult.output && (
                    <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] whitespace-pre-wrap text-slate-800 mt-2">
                      {executionResult.output}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                    <span>Task ID: {executionResult.taskId}</span>
                    <span>Approval Required: {String(executionResult.requiresHumanApproval)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
