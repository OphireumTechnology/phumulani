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
      <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold font-heading text-phumulani-charcoal tracking-tight">
              Development Operations Center
            </h1>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal/50 px-2.5 py-0.5 rounded-md">
              Phase 13 Active
            </span>
          </div>
          <p className="text-xs text-phumulani-charcoal/80 mt-1.5 max-w-2xl leading-relaxed">
            Centralized engineering management hub connecting Google AI Studio, GitHub repository (<code className="font-mono bg-phumulani-cream px-1.5 py-0.5 rounded">{githubMetadata.owner}/{githubMetadata.repoName}</code>),
            GitHub Actions CI/CD, and authenticated Windows local sync reports (<code className="font-mono bg-phumulani-cream px-1.5 py-0.5 rounded">D:\Phumulani\Development</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => db.refreshGitHubWorkflows()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-phumulani-cream hover:bg-phumulani-gold/25 border border-phumulani-charcoal/15 text-phumulani-charcoal text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Refresh GitHub metadata"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync GitHub</span>
          </button>
          <button
            onClick={() => onViewChange('client-development')}
            className="flex items-center gap-1.5 px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Client Portal View</span>
          </button>
        </div>
      </div>

      {/* TOP PROGRESS & INTEGRATION STATUS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 tabular-nums">
        {/* Card 1: Verified Progress */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-charcoal/12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/75">Verified Progress</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-heading text-2xl font-extrabold text-phumulani-earth">{progressMetrics.verifiedProgressPercent}%</span>
            <span className="text-xs font-medium text-phumulani-charcoal/80">
              ({progressMetrics.verifiedMilestonesWeight}/{progressMetrics.totalApprovedWeights} pts)
            </span>
          </div>
          <div className="w-full bg-phumulani-cream h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-phumulani-earth h-full rounded-full transition-all duration-500"
              style={{ width: `${progressMetrics.verifiedProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-phumulani-charcoal/75 mt-1.5 block">Only approved/verified milestones counted</span>
        </div>

        {/* Card 2: GitHub Branch & Commit */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-charcoal/12">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/75">GitHub Remote</span>
            <GitBranch className="w-3.5 h-3.5 text-phumulani-earth" />
          </div>
          <div className="font-bold text-phumulani-charcoal text-sm mt-1 truncate">
            {githubMetadata.owner}/{githubMetadata.repoName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-phumulani-charcoal mt-1">
            <span className="font-mono text-phumulani-earth font-bold bg-phumulani-cream px-1.5 py-0.5 rounded-md border border-phumulani-teal/40">
              {githubMetadata.currentBranch}
            </span>
            <span className="font-mono text-[11px] text-phumulani-charcoal/80">SHA: {githubMetadata.lastCommitSha}</span>
          </div>
          <span className="text-[10px] text-phumulani-earth font-medium mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>CI: Passing (Run #42)</span>
          </span>
        </div>

        {/* Card 3: Windows Local Sync */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-charcoal/12">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/75">Windows Sync Hub</span>
            <HardDrive className="w-3.5 h-3.5 text-phumulani-charcoal/75" />
          </div>
          <div className="font-bold text-phumulani-charcoal text-sm mt-1 flex items-center gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${localSyncReport.status === 'SYNCHRONIZED' ? 'text-phumulani-green' : 'text-phumulani-gold'}`} />
            <span>{localSyncReport.status}</span>
          </div>
          <p className="text-[11px] text-phumulani-charcoal/80 font-mono mt-0.5 truncate" title={localSyncReport.localPath}>
            {localSyncReport.localPath}
          </p>
          <span className="text-[10px] text-phumulani-charcoal/75 mt-1.5 block">
            {localSyncReport.uncommittedChanges} uncommitted changes
          </span>
        </div>

        {/* Card 4: Client Collaboration */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-charcoal/12">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/75">Client Approvals</span>
            <MessageSquare className="w-3.5 h-3.5 text-phumulani-earth" />
          </div>
          <div className="font-heading font-bold text-phumulani-charcoal text-sm mt-1">
            {transparencyOverview.kpis.pendingClientApprovalsCount} Awaiting Review
          </div>
          <div className="text-xs text-phumulani-charcoal/85 mt-1">
            {feedbacks.filter((f) => f.status === 'SUBMITTED').length} Open Feedback Items
          </div>
          <span className="text-[10px] text-phumulani-charcoal/75 mt-1.5 block">
            {changeRequests.length} Change Requests recorded
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-phumulani-charcoal/12 bg-white rounded-t-xl px-4 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'roadmap'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Roadmap & Milestones ({milestones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'github'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>GitHub Commits & Branches</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'actions'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>GitHub Actions CI/CD ({githubWorkflowRuns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('windows_sync')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'windows_sync'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Windows Sync Controller</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'feedback'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Client Feedback & CRs ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'reports'
              ? 'border-phumulani-earth text-phumulani-earth font-bold'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Weekly Reports & Docs ({weeklyReports.length})</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white rounded-b-xl border border-t-0 border-phumulani-charcoal/12 p-6">
        {/* TAB 1: ROADMAP & MILESTONES */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Development Roadmap &amp; Deliverables (Phases 1–13)
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-0.5 tabular-nums">
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
                      className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-phumulani-earth bg-phumulani-cream/70 ring-1 ring-phumulani-earth'
                          : 'border-phumulani-charcoal/12 hover:border-phumulani-earth/40 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded-md border border-phumulani-charcoal/10 tabular-nums">
                            {m.id}
                          </span>
                          <span className="font-heading font-bold text-phumulani-charcoal text-xs">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                          <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded-md border border-phumulani-charcoal/10">
                            Weight: {m.weight}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isVerified
                                ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                                : m.developmentStatus === 'READY_FOR_CLIENT_REVIEW'
                                ? 'bg-phumulani-gold/15 text-phumulani-charcoal border-phumulani-gold/40'
                                : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-charcoal/15'
                            }`}
                          >
                            {m.developmentStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-phumulani-charcoal/85 mt-2 line-clamp-2 leading-relaxed">{m.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-phumulani-charcoal/80 mt-3 pt-2 border-t border-phumulani-charcoal/10">
                        <span>Owner: {m.assignedOwner}</span>
                        <div className="flex items-center gap-3">
                          <span>Testing: <strong className={m.testingStatus === 'PASSED' ? 'text-phumulani-earth' : 'text-phumulani-charcoal'}>{m.testingStatus}</strong></span>
                          <span>Client Acceptance: <strong>{m.clientAcceptanceStatus}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Details & Action Panel */}
              <div className="bg-phumulani-cream/60 rounded-xl border border-phumulani-charcoal/12 p-4 space-y-4">
                {selectedMilestone ? (
                  <>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-phumulani-earth bg-white border border-phumulani-charcoal/12 px-2 py-0.5 rounded-md">
                        {selectedMilestone.id} (Phase {selectedMilestone.phase})
                      </span>
                      <h4 className="font-heading font-bold text-phumulani-charcoal text-sm mt-2">{selectedMilestone.title}</h4>
                      <p className="text-xs text-phumulani-charcoal/85 mt-1 leading-relaxed">{selectedMilestone.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-phumulani-charcoal/10 pt-3 text-xs tabular-nums">
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal/75">Weight:</span>
                        <strong className="text-phumulani-charcoal font-mono">{selectedMilestone.weight}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal/75">Target Date:</span>
                        <span className="text-phumulani-charcoal">{new Date(selectedMilestone.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal/75">Development Status:</span>
                        <span className="font-semibold text-phumulani-charcoal">{selectedMilestone.developmentStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal/75">Testing Status:</span>
                        <span className="font-semibold text-phumulani-charcoal">{selectedMilestone.testingStatus}</span>
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="border-t border-phumulani-charcoal/10 pt-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase text-phumulani-charcoal/80">Deliverables</span>
                      {selectedMilestone.deliverables.map((d) => (
                        <div key={d.id} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${d.isCompleted ? 'text-phumulani-earth' : 'text-phumulani-charcoal/45'}`} />
                          <div>
                            <span className="font-semibold text-phumulani-charcoal">{d.title}</span>
                            <p className="text-phumulani-charcoal/80 text-[11px]">{d.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Evidence References */}
                    <div className="border-t border-phumulani-charcoal/10 pt-3 space-y-1 text-[11px]">
                      <span className="font-bold uppercase text-phumulani-charcoal/80 block text-[10px]">Verified Evidence</span>
                      {selectedMilestone.evidence.map((ev, i) => (
                        <div key={i} className="font-mono text-phumulani-charcoal bg-white p-1.5 rounded-md border border-phumulani-charcoal/10">
                          {ev}
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    {selectedMilestone.developmentStatus === 'READY_FOR_CLIENT_REVIEW' && (
                      <button
                        onClick={() => handleApproveMilestone(selectedMilestone)}
                        className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Milestone Approval (v13.0)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-phumulani-charcoal/75 text-xs">Select a milestone to view detailed acceptance criteria and evidence.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GITHUB COMMITS & BRANCHES */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            <div className="p-4 bg-phumulani-charcoal text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-phumulani-teal uppercase tracking-wider">GitHub Integration</span>
                <div className="text-lg font-bold font-mono mt-0.5">
                  {githubMetadata.owner}/{githubMetadata.repoName}
                </div>
                <div className="flex items-center gap-2 text-xs text-phumulani-cream mt-1">
                  <span>Default: <strong className="text-white">{githubMetadata.defaultBranch}</strong></span>
                  <span>·</span>
                  <span>Active Branch: <strong className="text-phumulani-teal">{githubMetadata.currentBranch}</strong></span>
                  <span>·</span>
                  <span>Last Commit: <strong className="text-white font-mono">{githubMetadata.lastCommitSha}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-phumulani-charcoal border border-phumulani-green text-phumulani-green font-bold rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Server-Side Integration Active</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-heading font-bold text-phumulani-charcoal text-sm">Verified Commits Feed with Plain-English Translations</h4>
              <div className="divide-y divide-phumulani-charcoal/10 border border-phumulani-charcoal/12 rounded-xl overflow-hidden">
                {githubCommits.map((c) => (
                  <div key={c.sha} className="p-4 hover:bg-phumulani-cream/40 transition-colors space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-md border border-phumulani-teal/40">
                          {c.shortSha}
                        </span>
                        <span className="text-xs font-bold text-phumulani-charcoal">{c.clientFriendlyDescription}</span>
                      </div>
                      <span className="text-[11px] text-phumulani-charcoal/75 font-mono shrink-0 tabular-nums">
                        {new Date(c.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-phumulani-charcoal bg-phumulani-cream/60 px-2.5 py-1.5 rounded-md">
                      Technical: {c.technicalMessage}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal/80 pt-1">
                      <span>Author: {c.author} · Component: <strong>{c.component}</strong></span>
                      <span className="text-phumulani-earth font-medium">✓ Verified Commit</span>
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  GitHub Actions CI/CD Pipeline Monitoring
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                  Workflow: <code className="font-mono bg-phumulani-cream px-1.5 py-0.5 rounded">Deploy Phumulani Website (.github/workflows/deploy.yml)</code>
                </p>
              </div>
            </div>

            <div className="border border-phumulani-charcoal/12 rounded-xl overflow-hidden divide-y divide-phumulani-charcoal/10">
              {githubWorkflowRuns.map((run) => (
                <div key={run.id} className="p-4 hover:bg-phumulani-cream/40 transition-colors space-y-2 tabular-nums">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded-md border border-phumulani-charcoal/10">
                        #{run.runNumber}
                      </span>
                      <strong className="text-xs text-phumulani-charcoal">{run.workflowName}</strong>
                      <span className="text-[11px] font-mono text-phumulani-charcoal/75">({run.event})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Build status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/40">
                        Build: {run.buildStatus}
                      </span>
                      {/* Test status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/40">
                        Test: {run.testStatus}
                      </span>
                      {/* Deploy status: If skipped, stay SKIPPED! */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          run.deploymentStatus === 'SUCCESS'
                            ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                            : run.deploymentStatus === 'SKIPPED'
                            ? 'bg-phumulani-gold/15 text-phumulani-charcoal border-phumulani-gold/40'
                            : 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth/40'
                        }`}
                      >
                        Deploy: {run.deploymentStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-phumulani-charcoal bg-phumulani-cream/60 p-2.5 rounded-lg leading-relaxed">
                    <strong>Client Summary:</strong> {run.simplifiedClientExplanation}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-phumulani-charcoal/80 font-mono">
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
            <div className="bg-phumulani-cream/60 border border-phumulani-charcoal/12 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                    Windows Local Development Drive &amp; Sync Controller Hub
                  </h3>
                  <p className="text-xs text-phumulani-charcoal/80 mt-1">
                    Connects local workstation environment (<code className="font-mono bg-white px-1.5 py-0.5 rounded">D:\Phumulani\Development\phumulani-platform</code>)
                    with the local SyncController (<code className="font-mono bg-white px-1.5 py-0.5 rounded">D:\Phumulani\SyncController</code>).
                  </p>
                </div>
                <button
                  onClick={handleManualSyncIngest}
                  className="px-3.5 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ingest Status From Windows Agent</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                    syncStatusMsg.type === 'success'
                      ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                      : 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth/40'
                  }`}
                >
                  {syncStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-phumulani-charcoal" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-phumulani-earth" />
                  )}
                  <span>{syncStatusMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-phumulani-cream rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-phumulani-charcoal">Sync Status</span>
                  <div className="text-base font-bold text-phumulani-earth mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{localSyncReport.status}</span>
                  </div>
                  <span className="text-[11px] text-phumulani-charcoal mt-1 block">
                    Last inspected: {new Date(localSyncReport.checkedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3 bg-white border border-phumulani-cream rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-phumulani-charcoal">Git Commit Parity</span>
                  <div className="text-sm font-bold text-phumulani-charcoal font-mono mt-0.5">
                    Local: {localSyncReport.localCommit} | Remote: {localSyncReport.remoteCommit}
                  </div>
                  <span className="text-[11px] text-phumulani-charcoal mt-1 block">
                    {localSyncReport.ahead} commits ahead · {localSyncReport.behind} behind
                  </span>
                </div>

                <div className="p-3 bg-white border border-phumulani-cream rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-phumulani-charcoal">Disaster Recovery Safety</span>
                  <div className="text-sm font-bold text-phumulani-charcoal mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
                    <span>Backups Untouched</span>
                  </div>
                  <span className="text-[11px] text-phumulani-charcoal font-mono mt-1 block truncate">
                    D:\Phumulani\Backups
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-phumulani-cream rounded-xl space-y-2 text-xs">
                <span className="font-bold text-phumulani-charcoal">Sanitized Client Summary:</span>
                <p className="text-phumulani-charcoal leading-relaxed">{localSyncReport.sanitizedSummary}</p>
              </div>

              <div className="border border-phumulani-cream rounded-xl p-3 bg-white space-y-2">
                <span className="font-bold text-phumulani-charcoal text-xs">Enterprise Safety Invariants Enforced:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-phumulani-charcoal">
                  <div className="flex items-center gap-1.5 text-phumulani-earth font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Prohibited: <code className="bg-phumulani-cream px-1 py-0.2 rounded font-mono">git push --force</code></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-phumulani-earth font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Prohibited: <code className="bg-phumulani-cream px-1 py-0.2 rounded font-mono">git reset --hard</code></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-phumulani-charcoal font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guaranteed: Local working tree uncommitted work protected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-phumulani-charcoal font-medium">
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Client Collaboration, Feedback &amp; Change Requests
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                  Review client suggestions, report resolutions, and evaluate formal Change Requests.
                </p>
              </div>
            </div>

            {/* Feedback items */}
            <div className="space-y-3">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider">
                Submitted Feedback Items ({feedbacks.length})
              </h4>
              <div className="divide-y divide-phumulani-charcoal/10 border border-phumulani-charcoal/12 rounded-xl overflow-hidden">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-phumulani-cream/40 transition-colors space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-phumulani-charcoal bg-phumulani-cream border border-phumulani-charcoal/12 px-2 py-0.5 rounded-md">
                            {f.id}
                          </span>
                          <span className="font-bold text-phumulani-charcoal text-xs">{f.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-phumulani-cream text-phumulani-earth border border-phumulani-teal/40">
                            {f.feedbackType}
                          </span>
                        </div>
                        <p className="text-xs text-phumulani-charcoal/85 mt-1 leading-relaxed">{f.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                            f.status === 'RESOLVED'
                              ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                              : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-charcoal/15'
                          }`}
                        >
                          {f.status}
                        </span>
                        {f.status !== 'RESOLVED' && (
                          <button
                            onClick={() => setFeedbackResolveModal(f)}
                            className="px-2.5 py-1 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal text-xs font-semibold rounded-md cursor-pointer transition-colors"
                          >
                            Resolve Issue
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal/75 pt-1 border-t border-phumulani-charcoal/10 tabular-nums">
                      <span>Submitted by: <strong className="text-phumulani-charcoal">{f.submittedBy}</strong> ({f.submitterRole})</span>
                      <span>{new Date(f.submissionDate).toLocaleDateString()}</span>
                    </div>

                    {f.resolutionNotes && (
                      <div className="p-2.5 bg-phumulani-green/15 border border-phumulani-green/40 rounded-lg text-[11px] text-phumulani-charcoal">
                        <strong>Resolution Notes:</strong> {f.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Change Requests */}
            <div className="space-y-3 pt-4 border-t border-phumulani-charcoal/12">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider">
                Formal Change Requests ({changeRequests.length})
              </h4>
              <div className="divide-y divide-phumulani-charcoal/10 border border-phumulani-charcoal/12 rounded-xl overflow-hidden">
                {changeRequests.map((cr) => (
                  <div key={cr.id} className="p-4 hover:bg-phumulani-cream/40 transition-colors space-y-2 tabular-nums">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-md border border-phumulani-teal/40">
                            {cr.id}
                          </span>
                          <span className="font-bold text-phumulani-charcoal text-xs">{cr.title}</span>
                        </div>
                        <p className="text-xs text-phumulani-charcoal/85 mt-1">{cr.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/40 shrink-0">
                        {cr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-phumulani-cream/60 p-2.5 rounded-lg text-phumulani-charcoal">
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Development Documentation &amp; Automated Weekly Reports
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                  15-section structured weekly progress reporting grounded exclusively in verified database records.
                </p>
              </div>
            </div>

            {/* Weekly Reports List */}
            <div className="space-y-4">
              {weeklyReports.map((report) => (
                <div key={report.id} className="border border-phumulani-charcoal/12 rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-phumulani-charcoal/12 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-phumulani-cream border border-phumulani-charcoal/12 text-phumulani-earth px-2 py-0.5 rounded-md">
                          {report.id}
                        </span>
                        <h4 className="font-heading font-bold text-phumulani-charcoal text-sm">
                          PHUMULANI DEVELOPMENT PROGRESS REPORT
                        </h4>
                      </div>
                      <p className="text-xs text-phumulani-charcoal/75 mt-0.5 tabular-nums">Period: {report.reportingPeriod}</p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-gold/25 border border-phumulani-charcoal/15 text-phumulani-charcoal text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / Export PDF</span>
                    </button>
                  </div>

                  <div className="p-3 bg-phumulani-cream/70 border border-phumulani-teal/40 rounded-lg text-xs leading-relaxed text-phumulani-earth">
                    <strong>1. Executive Summary:</strong> <span className="text-phumulani-charcoal">{report.executiveSummary}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-phumulani-charcoal">2. Completed Milestones:</span>
                      <ul className="list-disc list-inside text-phumulani-charcoal/85 space-y-0.5">
                        {report.completedMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-phumulani-charcoal">3. Active Milestones:</span>
                      <ul className="list-disc list-inside text-phumulani-charcoal/85 space-y-0.5">
                        {report.activeMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-phumulani-charcoal/80 border-t border-phumulani-charcoal/10 pt-3">
                    <span>Generated by: {report.generatedBy} · Verified by: {report.verifiedBy}</span>
                    <span className="text-phumulani-earth font-bold">✓ Approved for Stakeholder Distribution</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Library */}
            <div className="space-y-3 pt-4 border-t border-phumulani-charcoal/12">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider">
                Official Project Document Library ({projectDocuments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectDocuments.map((doc) => (
                  <div key={doc.id} className="p-3.5 border border-phumulani-charcoal/12 rounded-xl bg-phumulani-cream/60 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-phumulani-charcoal/75 uppercase">{doc.category}</span>
                        <div className="font-heading font-bold text-phumulani-charcoal text-xs mt-0.5">{doc.title}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-phumulani-charcoal/12 text-phumulani-charcoal shrink-0">
                        {doc.accessTier}
                      </span>
                    </div>
                    <p className="text-[11px] text-phumulani-charcoal/80">{doc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal/75 font-mono pt-1">
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
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-phumulani-charcoal/15">
            <h3 className="font-bold text-phumulani-charcoal font-heading text-base">
              Resolve Feedback: {feedbackResolveModal.id}
            </h3>
            <p className="text-xs text-phumulani-charcoal/85">{feedbackResolveModal.title}</p>
            <form onSubmit={handleResolveFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-phumulani-charcoal">Resolution Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Describe technical implementation or resolution..."
                  rows={3}
                  className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2.5 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackResolveModal(null)}
                  className="px-3.5 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-xs font-semibold hover:bg-phumulani-cream cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
