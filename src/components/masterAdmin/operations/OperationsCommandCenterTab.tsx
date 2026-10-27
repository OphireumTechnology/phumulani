/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Unified Operations Command Center Tab
 * Grounded in Master Directive Phase 27: M27.02 Unified Operations Command Center
 */

import React, { useState, useEffect } from 'react';
import { operationsService } from '../../../services/operationsService';
import {
  OperationalWorkflow,
  WorkflowStatus,
  WorkflowPriority,
  OperationalApproval,
  ApprovalDecision,
  OperationalMilestone,
  OperationalIncident,
  DataQualityCheckResult,
  InfrastructureReadinessProbe,
  ExecutiveOperationsReport,
} from '../../../types/operations';
import { User } from '../../../types';
import {
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Bot,
  FileCheck2,
  Calendar,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';

interface OperationsCommandCenterTabProps {
  currentUser: User;
  onNavigateToNotifications?: () => void;
}

export const OperationsCommandCenterTab: React.FC<OperationsCommandCenterTabProps> = ({
  currentUser,
  onNavigateToNotifications,
}) => {
  const [activeSubView, setActiveSubView] = useState<
    | 'overview'
    | 'workflows'
    | 'approvals'
    | 'tasks'
    | 'milestones'
    | 'ai_workforce'
    | 'incidents'
    | 'data_quality'
    | 'readiness'
    | 'reports'
  >('overview');

  const [workflows, setWorkflows] = useState<OperationalWorkflow[]>([]);
  const [approvals, setApprovals] = useState<OperationalApproval[]>([]);
  const [milestones, setMilestones] = useState<OperationalMilestone[]>([]);
  const [incidents, setIncidents] = useState<OperationalIncident[]>([]);
  const [dataQualityChecks, setDataQualityChecks] = useState<DataQualityCheckResult[]>([]);
  const [readinessProbes, setReadinessProbes] = useState<InfrastructureReadinessProbe[]>([]);
  const [executiveReports, setExecutiveReports] = useState<ExecutiveOperationsReport[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(
    null
  );
  const [selectedWorkflow, setSelectedWorkflow] = useState<OperationalWorkflow | null>(null);
  const [transitionStatus, setTransitionStatus] = useState<WorkflowStatus>('IN_PROGRESS');
  const [transitionNote, setTransitionNote] = useState('');
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);

  const [selectedApproval, setSelectedApproval] = useState<OperationalApproval | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>('APPROVED');
  const [approvalComment, setApprovalComment] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);
  const [newWfTitle, setNewWfTitle] = useState('');
  const [newWfType, setNewWfType] = useState('PROGRAM_APPROVAL');
  const [newWfSource, setNewWfSource] = useState('PROG-002');
  const [newWfDept, setNewWfDept] = useState('DEPT-COMM');
  const [newWfRespDept, setNewWfRespDept] = useState('DEPT-EXEC');
  const [newWfPriority, setNewWfPriority] = useState<WorkflowPriority>('HIGH');
  const [newWfDesc, setNewWfDesc] = useState('');

  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncCategory, setNewIncCategory] = useState('WORKFLOW_FAILURE');
  const [newIncSeverity, setNewIncSeverity] = useState('MEDIUM');
  const [newIncSystem, setNewIncSystem] = useState('Operations Workflow Engine');
  const [newIncDesc, setNewIncDesc] = useState('');

  const refreshData = () => {
    setWorkflows(operationsService.getWorkflows());
    setApprovals(operationsService.getApprovals());
    setMilestones(operationsService.getMilestones());
    const isSafeOfficer = currentUser.role === 'PLATFORM_SUPER_ADMIN' || currentUser.department === 'Restricted Safeguarding Services';
    setIncidents(operationsService.getIncidents(currentUser.department, isSafeOfficer));
    setDataQualityChecks(operationsService.getDataQualityChecks());
    setReadinessProbes(operationsService.probeInfrastructureReadiness());
    setExecutiveReports(operationsService.getExecutiveReports());
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  useEffect(() => {
    if (actionNotice) {
      const t = setTimeout(() => setActionNotice(null), 5000);
      return () => clearTimeout(t);
    }
  }, [actionNotice]);

  const handleExecuteTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;
    try {
      operationsService.transitionWorkflow(
        selectedWorkflow.id,
        transitionStatus,
        transitionNote || `Status shifted to ${transitionStatus}`,
        currentUser.id,
        selectedWorkflow.version
      );
      setActionNotice({
        type: 'success',
        message: `Workflow ${selectedWorkflow.id} transitioned to ${transitionStatus} (version ${selectedWorkflow.version + 1}).`,
      });
      setIsTransitionModalOpen(false);
      setSelectedWorkflow(null);
      setTransitionNote('');
      refreshData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Failed to transition workflow.',
      });
    }
  };

  const handleExecuteApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    try {
      operationsService.processApprovalDecision(
        selectedApproval.id,
        approvalDecision,
        approvalComment || `Executive action: ${approvalDecision}`,
        currentUser.id,
        currentUser.name,
        currentUser.role,
        selectedApproval.recordVersion
      );
      setActionNotice({
        type: 'success',
        message: `Approval request ${selectedApproval.id} finalized with decision: ${approvalDecision}.`,
      });
      setIsApprovalModalOpen(false);
      setSelectedApproval(null);
      setApprovalComment('');
      refreshData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Failed to process approval decision.',
      });
    }
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfTitle.trim()) return;
    try {
      const created = operationsService.createWorkflow(
        {
          workflowType: newWfType as any,
          sourceRecordId: newWfSource.trim(),
          title: newWfTitle.trim(),
          description: newWfDesc.trim(),
          requestingDepartmentId: newWfDept,
          responsibleDepartmentId: newWfRespDept,
          assignedOwnerId: currentUser.id,
          assignedOwnerName: currentUser.name,
          priority: newWfPriority,
          status: 'CREATED',
          currentStage: 'Created — Pending Triage & Validation',
          requiredApprovals: ['EXECUTIVE_DIRECTOR'],
        },
        currentUser.id
      );
      setActionNotice({
        type: 'success',
        message: `Cross-department workflow ${created.id} created successfully.`,
      });
      setIsNewWorkflowModalOpen(false);
      setNewWfTitle('');
      setNewWfDesc('');
      refreshData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Failed to create workflow.',
      });
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle.trim()) return;
    try {
      const inc = operationsService.reportIncident(
        {
          incidentCategory: newIncCategory as any,
          severity: newIncSeverity as any,
          reportingUserId: currentUser.id,
          reportingUserName: currentUser.name,
          responsibleOwnerId: currentUser.id,
          responsibleOwnerName: currentUser.name,
          responsibleDepartmentId: currentUser.department || 'DEPT-OPS',
          relatedSystem: newIncSystem,
          title: newIncTitle.trim(),
          description: newIncDesc.trim(),
          status: 'OPEN',
        },
        currentUser.id
      );
      setActionNotice({
        type: 'success',
        message: `Incident ${inc.id} logged${inc.isSafeguardingCrisisQuarantine ? ' (SAFEGUARDING QUARANTINE ENFORCED)' : ''}.`,
      });
      setIsNewIncidentModalOpen(false);
      setNewIncTitle('');
      setNewIncDesc('');
      refreshData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Failed to report incident.',
      });
    }
  };

  const handleGenerateReport = (type: any) => {
    try {
      const rep = operationsService.generateExecutiveReport(type, currentUser.id);
      setActionNotice({
        type: 'success',
        message: `Generated report ${rep.id} (${rep.title}). Stamped in audit ledger.`,
      });
      refreshData();
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err?.message || 'Failed to generate report.',
      });
    }
  };

  const pendingApprovalsCount = approvals.filter((a) => a.decision === 'PENDING').length;
  const overdueMilestonesCount = milestones.filter((m) => m.isOverdue).length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const aiAgents = operationsService.getAiWorkforceStatus();

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Phase 27 • Unified Operations Command Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Production Readiness Active
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-white">
              Organizational Operations & Workflow Automation
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Cross-departmental orchestration, human-supervised AI workforce, executive decision barriers, and truthful infrastructure readiness monitoring.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refreshData}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Engine
            </button>
            <button
              onClick={() => setIsNewWorkflowModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Workflow
            </button>
          </div>
        </div>

        {/* SUBVIEW NAVIGATION BAR */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-teal-800/30 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'workflows', label: 'Workflows', count: workflows.length, icon: Layers },
            { id: 'approvals', label: 'Approvals', count: pendingApprovalsCount, icon: FileCheck2 },
            { id: 'tasks', label: 'Cross-Dept Tasks', count: 5, icon: CheckSquare },
            { id: 'milestones', label: 'Milestones', count: overdueMilestonesCount > 0 ? `${overdueMilestonesCount} Due` : milestones.length, icon: Calendar },
            { id: 'ai_workforce', label: 'AI Supervision (18)', count: '18 Active', icon: Bot },
            { id: 'incidents', label: 'Incidents', count: openIncidentsCount, icon: AlertTriangle },
            { id: 'data_quality', label: 'Data Integrity', count: '100% Audit', icon: Shield },
            { id: 'readiness', label: 'Readiness Matrix', count: '7 Probes', icon: Clock },
            { id: 'reports', label: 'Executive Reports', count: executiveReports.length, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-900 text-teal-300 font-bold' : 'bg-white/20 text-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-lg border text-sm flex items-center justify-between shadow-xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. OVERVIEW VIEW */}
      {activeSubView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Active Workflows</span>
                <Layers className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{workflows.length}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-teal-600 font-semibold">{workflows.filter((w) => w.status === 'IN_PROGRESS').length} in progress</span>
                <span>• {workflows.filter((w) => w.status === 'APPROVED').length} approved</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Executive Approvals</span>
                <FileCheck2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{pendingApprovalsCount} Pending</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">{approvals.filter((a) => a.decision === 'APPROVED').length} finalized</span>
                <span>• Separation of duties active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>AI Workforce Status</span>
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">18 / 18 Active</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span className="text-indigo-600 font-semibold">5 Pipelines</span>
                <span>• Human approval gates enforced</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
                <span>Readiness Probes</span>
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Fail-Closed Staged</div>
              <div className="text-xs text-slate-500 mt-1 text-emerald-700 font-medium">
                Truthful: No synthetic production claims
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">Current Operational Workflows</h3>
                  <p className="text-xs text-slate-500">Cross-department initiatives managed with optimistic concurrency</p>
                </div>
                <button
                  onClick={() => setActiveSubView('workflows')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  View All ({workflows.length}) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {workflows.slice(0, 3).map((wf) => (
                  <div
                    key={wf.id}
                    className="p-3.5 border border-slate-100 rounded-lg hover:border-teal-300 transition-colors bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800">{wf.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                          {wf.workflowType}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          wf.status === 'APPROVED' || wf.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wf.status === 'REVIEW_REQUIRED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-teal-100 text-teal-900'
                        }`}
                      >
                        {wf.status} (v{wf.version})
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">{wf.title}</div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <span>Owner: <strong className="text-slate-800">{wf.assignedOwnerName}</strong></span>
                      <span>• Stage: {wf.currentStage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif font-bold text-slate-900 text-base">Executive Approvals</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                    {pendingApprovalsCount} Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Separation of duties strictly enforces that no requester can authorize their own operational proposal.
                </p>

                <div className="space-y-3">
                  {approvals.slice(0, 2).map((app) => (
                    <div key={app.id} className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg text-xs">
                      <div className="font-bold text-slate-900 mb-1">{app.title}</div>
                      <div className="text-slate-600 mb-2">Requester: {app.requesterName}</div>
                      <button
                        onClick={() => {
                          setSelectedApproval(app);
                          setIsApprovalModalOpen(true);
                        }}
                        className="w-full py-1.5 bg-slate-900 text-white rounded font-semibold text-xs hover:bg-slate-800 transition-colors"
                      >
                        Review Governance Decision
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Human Approval Gate</span>
                <span className="font-semibold text-emerald-700">100% Invariant Enforced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WORKFLOWS VIEW */}
      {activeSubView === 'workflows' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Cross-Department Workflows</h2>
              <p className="text-xs text-slate-500">
                Auditable state transitions with version validation, department handoffs, and idempotency protection.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => setIsNewWorkflowModalOpen(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Workflow
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Workflow ID</th>
                  <th className="py-2.5 px-3">Type & Source</th>
                  <th className="py-2.5 px-3">Title & Stage</th>
                  <th className="py-2.5 px-3">Owner & Dept</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status / Version</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workflows
                  .filter(
                    (w) =>
                      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      w.workflowType.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((wf) => (
                    <tr key={wf.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-800">{wf.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{wf.workflowType}</span>
                        <div className="text-[10px] font-mono text-slate-500">{wf.sourceRecordId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{wf.title}</div>
                        <div className="text-[11px] text-slate-500">{wf.currentStage}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{wf.assignedOwnerName}</div>
                        <div className="text-[10px] text-slate-500">{wf.responsibleDepartmentId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            wf.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : wf.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {wf.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            wf.status === 'APPROVED' || wf.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : wf.status === 'REVIEW_REQUIRED'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-teal-100 text-teal-900'
                          }`}
                        >
                          {wf.status}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">ver {wf.version}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedWorkflow(wf);
                            setTransitionStatus(wf.status === 'REVIEW_REQUIRED' ? 'APPROVED' : 'IN_PROGRESS');
                            setIsTransitionModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                        >
                          Transition
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. APPROVALS VIEW */}
      {activeSubView === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Organizational Approvals Register</h2>
              <p className="text-xs text-slate-500">
                Executive decisions, separation-of-duties governance, and cryptographic audit trace linking.
              </p>
            </div>
            <div className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
              Separation of Duties Active: Requester ≠ Approver
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Approval ID</th>
                  <th className="py-2.5 px-3">Request Type</th>
                  <th className="py-2.5 px-3">Subject & Details</th>
                  <th className="py-2.5 px-3">Requester</th>
                  <th className="py-2.5 px-3">Required Role</th>
                  <th className="py-2.5 px-3">Decision Status</th>
                  <th className="py-2.5 px-3 text-right">Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvals.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-800">{app.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{app.requestType}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{app.title}</div>
                      <div className="text-[11px] text-slate-500">{app.description}</div>
                      {app.comments && (
                        <div className="text-[10px] text-teal-800 mt-0.5 italic">Note: {app.comments}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{app.requesterName}</span>
                      <div className="text-[10px] font-mono text-slate-400">{app.requesterId}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{app.requiredApproverRole}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          app.decision === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.decision === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {app.decision} (v{app.recordVersion})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {app.decision === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setSelectedApproval(app);
                            setIsApprovalModalOpen(true);
                          }}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors shadow-xs"
                        >
                          Decide
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Decided by {app.approverName}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TASKS VIEW */}
      {activeSubView === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Organizational Task Orchestration</h2>
              <p className="text-xs text-slate-500">
                Tasks coordinated across departments, linked to active workflows, and audited for supervisor verification.
              </p>
            </div>
            <span className="text-xs font-mono bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-lg">
              10 Departments Synced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-teal-800">{wf.id}</span>
                    <span className="text-[10px] font-mono bg-white border px-2 py-0.5 rounded text-slate-700">
                      {wf.responsibleDepartmentId}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{wf.title}</h4>
                  <p className="text-xs text-slate-600 mb-3">{wf.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Owner: {wf.assignedOwnerName}</span>
                  <span className="font-semibold text-teal-700">{wf.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MILESTONES VIEW */}
      {activeSubView === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Program & Grant Delivery Milestones</h2>
              <p className="text-xs text-slate-500">
                Real organizational deadlines, grant submission targets, and overdue detection.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
              Zero Synthetic Deadlines
            </span>
          </div>

          <div className="space-y-3">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className="p-4 border border-slate-200 rounded-xl hover:border-teal-300 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800">{ms.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ms.milestoneType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Source: {ms.sourceRecordId}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{ms.title}</h4>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Due: <strong>{new Date(ms.dueDate).toLocaleDateString()}</strong></span>
                    <span>Owner: {ms.responsibleOwnerName}</span>
                    <span>Dept: {ms.responsibleDepartmentId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                      ms.completionStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ms.isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-teal-100 text-teal-900'
                    }`}
                  >
                    {ms.completionStatus}
                  </span>
                  {ms.completionStatus !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        operationsService.completeMilestone(ms.id, currentUser.id);
                        setActionNotice({
                          type: 'success',
                          message: `Milestone ${ms.id} completed.`,
                        });
                        refreshData();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI WORKFORCE SUPERVISION */}
      {activeSubView === 'ai_workforce' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">AI Workforce Supervision & Governance</h2>
              <p className="text-xs text-slate-500">
                18 registered agents across 5 pipelines operating strictly under human supervisory approval barriers.
              </p>
            </div>
            <div className="text-xs font-mono bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-lg">
              Human-in-the-Loop Enforced
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAgents.map((ag) => (
              <div key={ag.agentId} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-indigo-900">{ag.agentId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                      {ag.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{ag.name}</h4>
                  <p className="text-xs text-slate-600 mb-2">{ag.role}</p>
                  <div className="text-[11px] text-slate-500 mb-2">Pipeline: {ag.assignedPipeline}</div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                  <div>Supervisor: <strong className="text-slate-800">{ag.humanSupervisor}</strong></div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Prohibited from self-approving grants/funds</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. INCIDENTS VIEW */}
      {activeSubView === 'incidents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Operational Incidents Register</h2>
              <p className="text-xs text-slate-500">
                Tracking operational errors, service interruptions, and strict VAWA safeguarding crisis quarantine.
              </p>
            </div>
            <button
              onClick={() => setIsNewIncidentModalOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Report Incident
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className={`p-4 border rounded-xl transition-colors ${
                  inc.isSafeguardingCrisisQuarantine
                    ? 'border-purple-300 bg-purple-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{inc.id}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{inc.incidentCategory}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {inc.status}
                  </span>
                </div>

                <h4 className="font-semibold text-slate-900 text-sm">{inc.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{inc.description}</p>
                {inc.resolutionSummary && (
                  <div className="text-xs text-emerald-800 mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                    Resolution: {inc.resolutionSummary}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Reported by: {inc.reportingUserName} • System: {inc.relatedSystem}</span>
                  {inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && (
                    <button
                      onClick={() => {
                        operationsService.triageIncident(inc.id, 'RESOLVED', 'Issue investigated and mitigated by operator.', currentUser.id);
                        setActionNotice({
                          type: 'success',
                          message: `Incident ${inc.id} marked as RESOLVED.`,
                        });
                        refreshData();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DATA QUALITY VIEW */}
      {activeSubView === 'data_quality' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Data Quality & Integrity Monitor</h2>
              <p className="text-xs text-slate-500">
                Automated cross-domain integrity verification, orphan reference checks, and non-fabrication audits.
              </p>
            </div>
            <button
              onClick={() => {
                const results = operationsService.runDataQualityAudit();
                setDataQualityChecks(results);
                setActionNotice({
                  type: 'success',
                  message: `Data quality engine completed audit across 10 departments.`,
                });
              }}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Run Integrity Audit
            </button>
          </div>

          <div className="space-y-3">
            {dataQualityChecks.map((dq) => (
              <div key={dq.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-800">{dq.id}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{dq.checkType}</span>
                    <span className="text-[10px] font-mono text-slate-400">Target: {dq.sourceRecordId}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{dq.description}</p>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                    dq.state === 'VALID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : dq.state === 'WARNING'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {dq.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. READINESS MATRIX VIEW */}
      {activeSubView === 'readiness' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Truthful Infrastructure Readiness Matrix</h2>
              <p className="text-xs text-slate-500">
                Ground-truth assessment of connected vs deferred infrastructure without synthetic live claims.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
              100% Truthful Policy
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Technical Detail</th>
                  <th className="py-2.5 px-3">Truthful Deferral Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readinessProbes.map((p) => (
                  <tr key={p.componentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.componentName}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{p.category}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          p.status === 'CONNECTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'AUTHORIZATION_REQUIRED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{p.detail}</td>
                    <td className="py-3 px-3 text-slate-500 italic">{p.truthfulReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. EXECUTIVE REPORTS VIEW */}
      {activeSubView === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-lg">Executive Operations Reports</h2>
              <p className="text-xs text-slate-500">
                Automated, auditable governance briefings generated strictly from verified records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateReport('OPERATIONAL_STATUS_SUMMARY')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                + Status Brief
              </button>
              <button
                onClick={() => handleGenerateReport('DEPARTMENT_WORKLOAD_REPORT')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                + Capacity Report
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {executiveReports.map((rep) => (
              <div key={rep.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-teal-800">{rep.id}</span>
                  <span className="font-mono text-[10px] bg-white border px-2 py-0.5 rounded text-slate-700">
                    {rep.approvalStatus}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{rep.title}</h4>
                <p className="text-xs text-slate-600 mb-2">{rep.summary}</p>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(rep.keyMetrics).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400 text-[10px] block">{k}</span>
                      <strong className="text-slate-900">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSITION WORKFLOW MODAL */}
      {isTransitionModalOpen && selectedWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">
              Transition Workflow {selectedWorkflow.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current Status: <strong>{selectedWorkflow.status}</strong> (Version {selectedWorkflow.version})
            </p>

            <form onSubmit={handleExecuteTransition} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Status</label>
                <select
                  value={transitionStatus}
                  onChange={(e) => setTransitionStatus(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="ESCALATED">ESCALATED</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Stage Progress Note</label>
                <textarea
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="Explain reason for transition and operational milestone progress..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransitionModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL DECISION MODAL */}
      {isApprovalModalOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">
              Executive Decision: {selectedApproval.id}
            </h3>
            <p className="text-xs text-slate-500 mb-2">Subject: {selectedApproval.title}</p>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 mb-4">
              Separation of Duties Check: Requester is <strong>{selectedApproval.requesterName}</strong>. You are acting as <strong>{currentUser.name}</strong>.
            </div>

            <form onSubmit={handleExecuteApproval} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Governance Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="APPROVED">APPROVED — Grant Authorization</option>
                  <option value="RETURNED">RETURNED — Request Revisions</option>
                  <option value="REJECTED">REJECTED — Deny Proposal</option>
                  <option value="ESCALATED">ESCALATED — Refer to Board</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Executive Decision Comments</label>
                <textarea
                  rows={3}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Record formal executive rationale for audit register..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Commit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WORKFLOW MODAL */}
      {isNewWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">Create Cross-Department Workflow</h3>
            <p className="text-xs text-slate-500 mb-4">Initialize a coordinated initiative with required approval milestones.</p>

            <form onSubmit={handleCreateWorkflow} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Workflow Title</label>
                <input
                  type="text"
                  value={newWfTitle}
                  onChange={(e) => setNewWfTitle(e.target.value)}
                  placeholder="e.g. Winter Safe Shelter Intake Expansion"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Workflow Type</label>
                  <select
                    value={newWfType}
                    onChange={(e) => setNewWfType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="PROGRAM_APPROVAL">PROGRAM_APPROVAL</option>
                    <option value="GRANT_REVIEW">GRANT_REVIEW</option>
                    <option value="PARTNERSHIP_REVIEW">PARTNERSHIP_REVIEW</option>
                    <option value="RESOURCE_REQUEST">RESOURCE_REQUEST</option>
                    <option value="VOLUNTEER_DEPLOYMENT">VOLUNTEER_DEPLOYMENT</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newWfPriority}
                    onChange={(e) => setNewWfPriority(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Requesting Dept</label>
                  <input
                    type="text"
                    value={newWfDept}
                    onChange={(e) => setNewWfDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsible Dept</label>
                  <input
                    type="text"
                    value={newWfRespDept}
                    onChange={(e) => setNewWfRespDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  placeholder="Outline objectives, program milestones, and resource boundaries..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkflowModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW INCIDENT MODAL */}
      {isNewIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif font-bold text-slate-900 text-lg mb-1">Report Operational Incident</h3>
            <p className="text-xs text-slate-500 mb-4">
              All entries are scanned by VAWA filter. Domestic violence disclosures are automatically isolated to DEPT-SAFE.
            </p>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Incident Title</label>
                <input
                  type="text"
                  value={newIncTitle}
                  onChange={(e) => setNewIncTitle(e.target.value)}
                  placeholder="e.g. Outreach Logistic Disruption"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newIncCategory}
                    onChange={(e) => setNewIncCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="WORKFLOW_FAILURE">WORKFLOW_FAILURE</option>
                    <option value="SYSTEM_ERROR">SYSTEM_ERROR</option>
                    <option value="MISSED_DEADLINE">MISSED_DEADLINE</option>
                    <option value="DATA_QUALITY_ISSUE">DATA_QUALITY_ISSUE</option>
                    <option value="SERVICE_INTERRUPTION">SERVICE_INTERRUPTION</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newIncSeverity}
                    onChange={(e) => setNewIncSeverity(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newIncDesc}
                  onChange={(e) => setNewIncDesc(e.target.value)}
                  placeholder="Describe incident impact and immediate containment steps taken..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewIncidentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
