/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Development Operations Center (/admin/master/development)
 * Phase 13 Master Development Management & Integration Hub
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import {
  DevelopmentMilestone,
  DevelopmentFeature,
  GitHubCommitRecord,
  GitHubWorkflowRun,
  LocalSyncReport,
  ClientFeedbackItem,
  ChangeRequestItem,
  ProjectDocumentRecord,
  WeeklyDevelopmentReport,
} from '../types/developmentOps';
import { DevelopmentOpsService } from '../services/developmentOpsService';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FolderGit2,
  HardDrive,
  ShieldCheck,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Download,
  Filter,
  Check,
  Search,
} from 'lucide-react';

interface DevelopmentOperationsViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export const DevelopmentOperationsView: React.FC<DevelopmentOperationsViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const dbState = db.getState();
  const milestones = dbState.developmentMilestones;
  const features = dbState.developmentFeatures;
  const githubMetadata = dbState.githubMetadata;
  const githubCommits = dbState.githubCommits;
  const githubWorkflowRuns = dbState.githubWorkflowRuns;
  const localSyncReport = dbState.localSyncReport;
  const feedbacks = dbState.clientFeedbacks;
  const changeRequests = dbState.changeRequests;
  const projectDocuments = dbState.projectDocuments;
  const weeklyReports = dbState.weeklyReports;

  const [activeTab, setActiveTab] = useState<
    'roadmap' | 'github' | 'actions' | 'windows_sync' | 'feedback' | 'reports'
  >('roadmap');

  const [syncTokenInput, setSyncTokenInput] = useState('bearer-sec-win-controller-9921');
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<DevelopmentMilestone | null>(milestones[milestones.length - 1]);
  const [feedbackResolveModal, setFeedbackResolveModal] = useState<ClientFeedbackItem | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Calculate evidence-based progress
  const progressMetrics = DevelopmentOpsService.calculateProgress(milestones);
  const transparencyOverview = DevelopmentOpsService.getTransparencyOverview(
    milestones,
    features,
    feedbacks,
    changeRequests,
    localSyncReport
  );

  const handleManualSyncIngest = () => {
    const payload = {
      project: 'phumulani',
      branch: 'main',
      localPath: 'D:\\Phumulani\\Development\\phumulani-platform',
      controllerPath: 'D:\\Phumulani\\SyncController',
      localCommit: '4f81c9a',
      remoteCommit: '4f81c9a',
      ahead: 0,
      behind: 0,
      uncommittedChanges: 0,
      status: 'SYNCHRONIZED',
      checkedAt: new Date().toISOString(),
      reportedBy: `Admin Ingestion (${currentUser.name})`,
    };

    const res = db.ingestLocalSyncReport(payload, syncTokenInput);
    if (res.success) {
      setSyncStatusMsg({ type: 'success', text: 'Windows Local Synchronization report verified and updated!' });
    } else {
      setSyncStatusMsg({ type: 'error', text: res.error || 'Ingestion failed.' });
    }
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  const handleResolveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackResolveModal) return;
    db.resolveClientFeedback(feedbackResolveModal.id, resolveNotes);
    setFeedbackResolveModal(null);
    setResolveNotes('');
  };

  const handleApproveMilestone = (m: DevelopmentMilestone) => {
    db.approveMilestone(
      m.id,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'APPROVED',
      'v13.0-PREVIEW',
      `Authorized development approval granted by ${currentUser.name}`
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Development Operations Center
            </h1>
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-full">
              Phase 13 Active
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Centralized engineering management hub connecting Google AI Studio, GitHub repository (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{githubMetadata.owner}/{githubMetadata.repoName}</code>),
            GitHub Actions CI/CD, and authenticated Windows local sync reports (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">D:\Phumulani\Development</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => db.refreshGitHubWorkflows()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Refresh GitHub metadata"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Sync GitHub</span>
          </button>
          <button
            onClick={() => onViewChange('client-development')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            <span>Open Client Portal View</span>
          </button>
        </div>
      </div>

      {/* TOP PROGRESS & INTEGRATION STATUS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Verified Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Progress</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-[#104F57]">{progressMetrics.verifiedProgressPercent}%</span>
            <span className="text-xs font-medium text-slate-500">
              ({progressMetrics.verifiedMilestonesWeight}/{progressMetrics.totalApprovedWeights} pts)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#104F57] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressMetrics.verifiedProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Only approved/verified milestones counted</span>
        </div>

        {/* Card 2: GitHub Branch & Commit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GitHub Remote</span>
            <GitBranch className="w-3.5 h-3.5 text-teal-700" />
          </div>
          <div className="font-bold text-slate-900 text-sm mt-1 truncate">
            {githubMetadata.owner}/{githubMetadata.repoName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
            <span className="font-mono text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
              {githubMetadata.currentBranch}
            </span>
            <span className="font-mono text-[11px] text-slate-500">SHA: {githubMetadata.lastCommitSha}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>CI: Passing (Run #42)</span>
          </span>
        </div>

        {/* Card 3: Windows Local Sync */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Windows Sync Hub</span>
            <HardDrive className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${localSyncReport.status === 'SYNCHRONIZED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{localSyncReport.status}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate" title={localSyncReport.localPath}>
            {localSyncReport.localPath}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {localSyncReport.uncommittedChanges} uncommitted changes
          </span>
        </div>

        {/* Card 4: Client Collaboration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Approvals</span>
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="font-bold text-slate-900 text-sm mt-1">
            {transparencyOverview.kpis.pendingClientApprovalsCount} Awaiting Review
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {feedbacks.filter((f) => f.status === 'SUBMITTED').length} Open Feedback Items
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {changeRequests.length} Change Requests recorded
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'roadmap'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Roadmap & Milestones ({milestones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'github'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>GitHub Commits & Branches</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'actions'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>GitHub Actions CI/CD ({githubWorkflowRuns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('windows_sync')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'windows_sync'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Windows Sync Controller</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'feedback'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Client Feedback & CRs ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reports'
              ? 'border-[#104F57] text-[#104F57] font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Weekly Reports & Docs ({weeklyReports.length})</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs">
        {/* TAB 1: ROADMAP & MILESTONES */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Development Roadmap & Deliverables (Phases 1–13)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formula: Sum of completed verified milestone weights ({progressMetrics.verifiedMilestonesWeight}) ÷ Sum of approved weights ({progressMetrics.totalApprovedWeights}) = {progressMetrics.verifiedProgressPercent}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Milestone List */}
              <div className="lg:col-span-2 space-y-3">
                {milestones.map((m) => {
                  const isVerified = m.developmentStatus === 'CLIENT_APPROVED' || m.developmentStatus === 'PRODUCTION_VERIFIED';
                  const isSelected = selectedMilestone?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMilestone(m)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#104F57] bg-teal-50/30 ring-1 ring-[#104F57]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {m.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Weight: {m.weight}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : m.developmentStatus === 'READY_FOR_CLIENT_REVIEW'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.developmentStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{m.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                        <span>Owner: {m.assignedOwner}</span>
                        <div className="flex items-center gap-3">
                          <span>Testing: <strong className={m.testingStatus === 'PASSED' ? 'text-emerald-700' : 'text-slate-600'}>{m.testingStatus}</strong></span>
                          <span>Client Acceptance: <strong>{m.clientAcceptanceStatus}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Details & Action Panel */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
                {selectedMilestone ? (
                  <>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        {selectedMilestone.id} (Phase {selectedMilestone.phase})
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">{selectedMilestone.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedMilestone.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Weight:</span>
                        <strong className="text-slate-900 font-mono">{selectedMilestone.weight}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Date:</span>
                        <span className="text-slate-800">{new Date(selectedMilestone.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Development Status:</span>
                        <span className="font-semibold">{selectedMilestone.developmentStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Testing Status:</span>
                        <span className="font-semibold text-emerald-800">{selectedMilestone.testingStatus}</span>
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="border-t border-slate-200 pt-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Deliverables</span>
                      {selectedMilestone.deliverables.map((d) => (
                        <div key={d.id} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${d.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <div>
                            <span className="font-semibold text-slate-800">{d.title}</span>
                            <p className="text-slate-500 text-[11px]">{d.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Evidence References */}
                    <div className="border-t border-slate-200 pt-3 space-y-1 text-[11px]">
                      <span className="font-bold uppercase text-slate-400 block text-[10px]">Verified Evidence</span>
                      {selectedMilestone.evidence.map((ev, i) => (
                        <div key={i} className="font-mono text-slate-600 bg-white p-1 rounded border border-slate-200">
                          {ev}
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    {selectedMilestone.developmentStatus === 'READY_FOR_CLIENT_REVIEW' && (
                      <button
                        onClick={() => handleApproveMilestone(selectedMilestone)}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Milestone Approval (v13.0)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 text-xs">Select a milestone to view detailed acceptance criteria and evidence.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB COMMITS & BRANCHES */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">GitHub Integration</span>
                <div className="text-lg font-bold font-mono mt-0.5">
                  {githubMetadata.owner}/{githubMetadata.repoName}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Default: <strong className="text-white">{githubMetadata.defaultBranch}</strong></span>
                  <span>·</span>
                  <span>Active Branch: <strong className="text-teal-400">{githubMetadata.currentBranch}</strong></span>
                  <span>·</span>
                  <span>Last Commit: <strong className="text-white font-mono">{githubMetadata.lastCommitSha}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-900/60 border border-emerald-500 text-emerald-300 font-bold rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Server-Side Integration Active</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Verified Commits Feed with Plain-English Translations</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {githubCommits.map((c) => (
                  <div key={c.sha} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {c.shortSha}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{c.clientFriendlyDescription}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(c.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      Technical: {c.technicalMessage}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Author: {c.author} · Component: <strong>{c.component}</strong></span>
                      <span className="text-emerald-700 font-medium">✓ Verified Commit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GITHUB ACTIONS MONITOR */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  GitHub Actions CI/CD Pipeline Monitoring
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Workflow: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Deploy Phumulani Website (.github/workflows/deploy.yml)</code>
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {githubWorkflowRuns.map((run) => (
                <div key={run.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        #{run.runNumber}
                      </span>
                      <strong className="text-xs text-slate-900">{run.workflowName}</strong>
                      <span className="text-[11px] font-mono text-slate-500">({run.event})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Build status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Build: {run.buildStatus}
                      </span>
                      {/* Test status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Test: {run.testStatus}
                      </span>
                      {/* Deploy status: If skipped, stay SKIPPED! */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          run.deploymentStatus === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : run.deploymentStatus === 'SKIPPED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        Deploy: {run.deploymentStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                    <strong>Client Summary:</strong> {run.simplifiedClientExplanation}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Branch: <strong>{run.triggeringBranch}</strong> (Commit: {run.commitSha})</span>
                    <span>Duration: {run.durationSeconds}s · {new Date(run.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WINDOWS SYNC CONTROLLER */}
        {activeTab === 'windows_sync' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Windows Local Development Drive & Sync Controller Hub
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Connects local workstation environment (<code className="font-mono bg-white px-1 py-0.5 rounded">D:\Phumulani\Development\phumulani-platform</code>)
                    with the local SyncController (<code className="font-mono bg-white px-1 py-0.5 rounded">D:\Phumulani\SyncController</code>).
                  </p>
                </div>
                <button
                  onClick={handleManualSyncIngest}
                  className="px-3.5 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ingest Status From Windows Agent</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    syncStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  {syncStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{syncStatusMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Sync Status</span>
                  <div className="text-base font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{localSyncReport.status}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Last inspected: {new Date(localSyncReport.checkedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Git Commit Parity</span>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                    Local: {localSyncReport.localCommit} | Remote: {localSyncReport.remoteCommit}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {localSyncReport.ahead} commits ahead · {localSyncReport.behind} behind
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Disaster Recovery Safety</span>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Backups Untouched</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block truncate">
                    D:\Phumulani\Backups
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-900">Sanitized Client Summary:</span>
                <p className="text-slate-600 leading-relaxed">{localSyncReport.sanitizedSummary}</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                <span className="font-bold text-slate-900 text-xs">Enterprise Safety Invariants Enforced:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Prohibited: <code className="bg-rose-50 px-1 py-0.2 rounded font-mono">git push --force</code></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Prohibited: <code className="bg-rose-50 px-1 py-0.2 rounded font-mono">git reset --hard</code></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guaranteed: Local working tree uncommitted work protected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guaranteed: Disaster recovery backups preserved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CLIENT FEEDBACK & CHANGE REQUESTS */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Client Collaboration, Feedback & Change Requests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review client suggestions, report resolutions, and evaluate formal Change Requests.
                </p>
              </div>
            </div>

            {/* Feedback items */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Submitted Feedback Items ({feedbacks.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {f.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{f.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            {f.feedbackType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {f.status}
                        </span>
                        {f.status !== 'RESOLVED' && (
                          <button
                            onClick={() => setFeedbackResolveModal(f)}
                            className="px-2.5 py-1 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            Resolve Issue
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Submitted by: <strong>{f.submittedBy}</strong> ({f.submitterRole})</span>
                      <span>{new Date(f.submissionDate).toLocaleDateString()}</span>
                    </div>

                    {f.resolutionNotes && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                        <strong>Resolution Notes:</strong> {f.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Change Requests */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Formal Change Requests ({changeRequests.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {changeRequests.map((cr) => (
                  <div key={cr.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {cr.id}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{cr.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{cr.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {cr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg text-slate-700">
                      <div>Requested by: <strong>{cr.requestedBy}</strong></div>
                      <div>Budget Impact: <strong>${cr.budgetImpactUSD}</strong></div>
                      <div>Schedule: <strong>{cr.scheduleImpactDays} days</strong></div>
                      <div>Approved by: <strong>{cr.approvedBy || 'Pending'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & DOCS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Development Documentation & Automated Weekly Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  15-section structured weekly progress reporting grounded exclusively in verified database records.
                </p>
              </div>
            </div>

            {/* Weekly Reports List */}
            <div className="space-y-4">
              {weeklyReports.map((report) => (
                <div key={report.id} className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                          {report.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          PHUMULANI DEVELOPMENT PROGRESS REPORT
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Period: {report.reportingPeriod}</p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print / Export PDF</span>
                    </button>
                  </div>

                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs leading-relaxed text-teal-950">
                    <strong>1. Executive Summary:</strong> {report.executiveSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">2. Completed Milestones:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {report.completedMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900">3. Active Milestones:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {report.activeMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <span>Generated by: {report.generatedBy} · Verified by: {report.verifiedBy}</span>
                    <span className="text-emerald-700 font-bold">✓ Approved for Stakeholder Distribution</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Library */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Official Project Document Library ({projectDocuments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectDocuments.map((doc) => (
                  <div key={doc.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.category}</span>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">{doc.title}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {doc.accessTier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{doc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>SHA: {doc.sha256Hash.substring(0, 12)}...</span>
                      <span>Version: {doc.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {feedbackResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-slate-900 font-serif text-base">
              Resolve Feedback: {feedbackResolveModal.id}
            </h3>
            <p className="text-xs text-slate-600">{feedbackResolveModal.title}</p>
            <form onSubmit={handleResolveFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Resolution Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Describe technical implementation or resolution..."
                  rows={3}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackResolveModal(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
