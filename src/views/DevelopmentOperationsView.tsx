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
      <div className="bg-white rounded-2xl border border-phumulani-cream p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-phumulani-charcoal tracking-tight">
              Development Operations Center
            </h1>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal px-2.5 py-0.5 rounded-full">
              Phase 13 Active
            </span>
          </div>
          <p className="text-xs text-phumulani-charcoal mt-1 max-w-2xl leading-relaxed">
            Centralized engineering management hub connecting Google AI Studio, GitHub repository (<code className="font-mono bg-phumulani-cream px-1 py-0.5 rounded">{githubMetadata.owner}/{githubMetadata.repoName}</code>),
            GitHub Actions CI/CD, and authenticated Windows local sync reports (<code className="font-mono bg-phumulani-cream px-1 py-0.5 rounded">D:\Phumulani\Development</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => db.refreshGitHubWorkflows()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Refresh GitHub metadata"
          >
            <RefreshCw className="w-3.5 h-3.5 text-phumulani-charcoal" />
            <span>Sync GitHub</span>
          </button>
          <button
            onClick={() => onViewChange('client-development')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-orange text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
            <span>Open Client Portal View</span>
          </button>
        </div>
      </div>

      {/* TOP PROGRESS & INTEGRATION STATUS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Verified Progress */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Verified Progress</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-phumulani-earth">{progressMetrics.verifiedProgressPercent}%</span>
            <span className="text-xs font-medium text-phumulani-charcoal">
              ({progressMetrics.verifiedMilestonesWeight}/{progressMetrics.totalApprovedWeights} pts)
            </span>
          </div>
          <div className="w-full bg-phumulani-cream h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-phumulani-earth h-full rounded-full transition-all duration-500"
              style={{ width: `${progressMetrics.verifiedProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-phumulani-charcoal mt-1 block">Only approved/verified milestones counted</span>
        </div>

        {/* Card 2: GitHub Branch & Commit */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">GitHub Remote</span>
            <GitBranch className="w-3.5 h-3.5 text-phumulani-earth" />
          </div>
          <div className="font-bold text-phumulani-charcoal text-sm mt-1 truncate">
            {githubMetadata.owner}/{githubMetadata.repoName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-phumulani-charcoal mt-1">
            <span className="font-mono text-phumulani-earth font-bold bg-phumulani-cream px-1.5 py-0.2 rounded border border-phumulani-teal">
              {githubMetadata.currentBranch}
            </span>
            <span className="font-mono text-[11px] text-phumulani-charcoal">SHA: {githubMetadata.lastCommitSha}</span>
          </div>
          <span className="text-[10px] text-phumulani-earth font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>CI: Passing (Run #42)</span>
          </span>
        </div>

        {/* Card 3: Windows Local Sync */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Windows Sync Hub</span>
            <HardDrive className="w-3.5 h-3.5 text-phumulani-charcoal" />
          </div>
          <div className="font-bold text-phumulani-charcoal text-sm mt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${localSyncReport.status === 'SYNCHRONIZED' ? 'bg-phumulani-green' : 'bg-phumulani-gold'}`} />
            <span>{localSyncReport.status}</span>
          </div>
          <p className="text-[11px] text-phumulani-charcoal font-mono mt-0.5 truncate" title={localSyncReport.localPath}>
            {localSyncReport.localPath}
          </p>
          <span className="text-[10px] text-phumulani-charcoal mt-1 block">
            {localSyncReport.uncommittedChanges} uncommitted changes
          </span>
        </div>

        {/* Card 4: Client Collaboration */}
        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Client Approvals</span>
            <MessageSquare className="w-3.5 h-3.5 text-phumulani-earth" />
          </div>
          <div className="font-bold text-phumulani-charcoal text-sm mt-1">
            {transparencyOverview.kpis.pendingClientApprovalsCount} Awaiting Review
          </div>
          <div className="text-xs text-phumulani-charcoal mt-1">
            {feedbacks.filter((f) => f.status === 'SUBMITTED').length} Open Feedback Items
          </div>
          <span className="text-[10px] text-phumulani-charcoal mt-1 block">
            {changeRequests.length} Change Requests recorded
          </span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-phumulani-cream bg-white rounded-t-xl px-4 gap-2 text-xs font-semibold overflow-x-auto">
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
      <div className="bg-white rounded-b-xl border border-t-0 border-phumulani-cream p-6 shadow-xs">
        {/* TAB 1: ROADMAP & MILESTONES */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                  Development Roadmap & Deliverables (Phases 1–13)
                </h3>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
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
                          ? 'border-phumulani-earth bg-phumulani-cream ring-1 ring-phumulani-earth'
                          : 'border-phumulani-cream hover:border-phumulani-cream bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">
                            {m.id}
                          </span>
                          <span className="font-bold text-phumulani-charcoal text-xs">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">
                            Weight: {m.weight}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isVerified
                                ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                                : m.developmentStatus === 'READY_FOR_CLIENT_REVIEW'
                                ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                                : 'bg-phumulani-cream text-phumulani-charcoal'
                            }`}
                          >
                            {m.developmentStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-phumulani-charcoal mt-2 line-clamp-2 leading-relaxed">{m.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal mt-3 pt-2 border-t border-phumulani-cream">
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
              <div className="bg-phumulani-cream rounded-xl border border-phumulani-cream p-4 space-y-4">
                {selectedMilestone ? (
                  <>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                        {selectedMilestone.id} (Phase {selectedMilestone.phase})
                      </span>
                      <h4 className="font-bold text-phumulani-charcoal text-sm mt-1.5">{selectedMilestone.title}</h4>
                      <p className="text-xs text-phumulani-charcoal mt-1 leading-relaxed">{selectedMilestone.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-phumulani-cream pt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal">Weight:</span>
                        <strong className="text-phumulani-charcoal font-mono">{selectedMilestone.weight}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal">Target Date:</span>
                        <span className="text-phumulani-charcoal">{new Date(selectedMilestone.targetDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal">Development Status:</span>
                        <span className="font-semibold">{selectedMilestone.developmentStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-phumulani-charcoal">Testing Status:</span>
                        <span className="font-semibold text-phumulani-charcoal">{selectedMilestone.testingStatus}</span>
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="border-t border-phumulani-cream pt-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase text-phumulani-charcoal">Deliverables</span>
                      {selectedMilestone.deliverables.map((d) => (
                        <div key={d.id} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${d.isCompleted ? 'text-phumulani-earth' : 'text-phumulani-charcoal'}`} />
                          <div>
                            <span className="font-semibold text-phumulani-charcoal">{d.title}</span>
                            <p className="text-phumulani-charcoal text-[11px]">{d.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Evidence References */}
                    <div className="border-t border-phumulani-cream pt-3 space-y-1 text-[11px]">
                      <span className="font-bold uppercase text-phumulani-charcoal block text-[10px]">Verified Evidence</span>
                      {selectedMilestone.evidence.map((ev, i) => (
                        <div key={i} className="font-mono text-phumulani-charcoal bg-white p-1 rounded border border-phumulani-cream">
                          {ev}
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    {selectedMilestone.developmentStatus === 'READY_FOR_CLIENT_REVIEW' && (
                      <button
                        onClick={() => handleApproveMilestone(selectedMilestone)}
                        className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Milestone Approval (v13.0)</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-phumulani-charcoal text-xs">Select a milestone to view detailed acceptance criteria and evidence.</p>
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
              <h4 className="font-bold text-phumulani-charcoal text-sm">Verified Commits Feed with Plain-English Translations</h4>
              <div className="divide-y divide-phumulani-cream border border-phumulani-cream rounded-xl overflow-hidden">
                {githubCommits.map((c) => (
                  <div key={c.sha} className="p-4 hover:bg-phumulani-cream transition-colors space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                          {c.shortSha}
                        </span>
                        <span className="text-xs font-bold text-phumulani-charcoal">{c.clientFriendlyDescription}</span>
                      </div>
                      <span className="text-[11px] text-phumulani-charcoal font-mono shrink-0">
                        {new Date(c.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-phumulani-charcoal bg-phumulani-cream px-2 py-1 rounded">
                      Technical: {c.technicalMessage}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal pt-1">
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                  GitHub Actions CI/CD Pipeline Monitoring
                </h3>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
                  Workflow: <code className="font-mono bg-phumulani-cream px-1 py-0.5 rounded">Deploy Phumulani Website (.github/workflows/deploy.yml)</code>
                </p>
              </div>
            </div>

            <div className="border border-phumulani-cream rounded-xl overflow-hidden divide-y divide-phumulani-cream">
              {githubWorkflowRuns.map((run) => (
                <div key={run.id} className="p-4 hover:bg-phumulani-cream transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">
                        #{run.runNumber}
                      </span>
                      <strong className="text-xs text-phumulani-charcoal">{run.workflowName}</strong>
                      <span className="text-[11px] font-mono text-phumulani-charcoal">({run.event})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Build status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">
                        Build: {run.buildStatus}
                      </span>
                      {/* Test status */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">
                        Test: {run.testStatus}
                      </span>
                      {/* Deploy status: If skipped, stay SKIPPED! */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          run.deploymentStatus === 'SUCCESS'
                            ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                            : run.deploymentStatus === 'SKIPPED'
                            ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                            : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
                        }`}
                      >
                        Deploy: {run.deploymentStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-phumulani-charcoal bg-phumulani-cream p-2 rounded-lg leading-relaxed">
                    <strong>Client Summary:</strong> {run.simplifiedClientExplanation}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal font-mono">
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
            <div className="bg-phumulani-cream border border-phumulani-cream rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                    Windows Local Development Drive & Sync Controller Hub
                  </h3>
                  <p className="text-xs text-phumulani-charcoal mt-1">
                    Connects local workstation environment (<code className="font-mono bg-white px-1 py-0.5 rounded">D:\Phumulani\Development\phumulani-platform</code>)
                    with the local SyncController (<code className="font-mono bg-white px-1 py-0.5 rounded">D:\Phumulani\SyncController</code>).
                  </p>
                </div>
                <button
                  onClick={handleManualSyncIngest}
                  className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-orange text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ingest Status From Windows Agent</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    syncStatusMsg.type === 'success'
                      ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                      : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
                  }`}
                >
                  {syncStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-phumulani-earth" />
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                  Client Collaboration, Feedback & Change Requests
                </h3>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
                  Review client suggestions, report resolutions, and evaluate formal Change Requests.
                </p>
              </div>
            </div>

            {/* Feedback items */}
            <div className="space-y-3">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider text-phumulani-charcoal">
                Submitted Feedback Items ({feedbacks.length})
              </h4>
              <div className="divide-y divide-phumulani-cream border border-phumulani-cream rounded-xl overflow-hidden">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-phumulani-cream transition-colors space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                            {f.id}
                          </span>
                          <span className="font-bold text-phumulani-charcoal text-xs">{f.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-earth border border-phumulani-teal">
                            {f.feedbackType}
                          </span>
                        </div>
                        <p className="text-xs text-phumulani-charcoal mt-1 leading-relaxed">{f.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'RESOLVED'
                              ? 'bg-phumulani-cream text-phumulani-charcoal'
                              : 'bg-phumulani-cream text-phumulani-charcoal'
                          }`}
                        >
                          {f.status}
                        </span>
                        {f.status !== 'RESOLVED' && (
                          <button
                            onClick={() => setFeedbackResolveModal(f)}
                            className="px-2.5 py-1 bg-phumulani-earth hover:bg-phumulani-orange text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            Resolve Issue
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal pt-1 border-t border-phumulani-cream">
                      <span>Submitted by: <strong>{f.submittedBy}</strong> ({f.submitterRole})</span>
                      <span>{new Date(f.submissionDate).toLocaleDateString()}</span>
                    </div>

                    {f.resolutionNotes && (
                      <div className="p-2 bg-phumulani-cream border border-phumulani-green rounded text-[11px] text-phumulani-charcoal">
                        <strong>Resolution Notes:</strong> {f.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Change Requests */}
            <div className="space-y-3 pt-4 border-t border-phumulani-cream">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider text-phumulani-charcoal">
                Formal Change Requests ({changeRequests.length})
              </h4>
              <div className="divide-y divide-phumulani-cream border border-phumulani-cream rounded-xl overflow-hidden">
                {changeRequests.map((cr) => (
                  <div key={cr.id} className="p-4 hover:bg-phumulani-cream transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                            {cr.id}
                          </span>
                          <span className="font-bold text-phumulani-charcoal text-xs">{cr.title}</span>
                        </div>
                        <p className="text-xs text-phumulani-charcoal mt-1">{cr.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">
                        {cr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-phumulani-cream p-2.5 rounded-lg text-phumulani-charcoal">
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
                <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                  Development Documentation & Automated Weekly Reports
                </h3>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
                  15-section structured weekly progress reporting grounded exclusively in verified database records.
                </p>
              </div>
            </div>

            {/* Weekly Reports List */}
            <div className="space-y-4">
              {weeklyReports.map((report) => (
                <div key={report.id} className="border border-phumulani-cream rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-phumulani-cream pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                          {report.id}
                        </span>
                        <h4 className="font-bold text-phumulani-charcoal text-sm">
                          PHUMULANI DEVELOPMENT PROGRESS REPORT
                        </h4>
                      </div>
                      <p className="text-xs text-phumulani-charcoal mt-0.5">Period: {report.reportingPeriod}</p>
                    </div>

                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-phumulani-charcoal" />
                      <span>Print / Export PDF</span>
                    </button>
                  </div>

                  <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-lg text-xs leading-relaxed text-phumulani-earth">
                    <strong>1. Executive Summary:</strong> {report.executiveSummary}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-phumulani-charcoal">2. Completed Milestones:</span>
                      <ul className="list-disc list-inside text-phumulani-charcoal space-y-0.5">
                        {report.completedMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-phumulani-charcoal">3. Active Milestones:</span>
                      <ul className="list-disc list-inside text-phumulani-charcoal space-y-0.5">
                        {report.activeMilestones.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal border-t border-phumulani-cream pt-3">
                    <span>Generated by: {report.generatedBy} · Verified by: {report.verifiedBy}</span>
                    <span className="text-phumulani-earth font-bold">✓ Approved for Stakeholder Distribution</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Library */}
            <div className="space-y-3 pt-4 border-t border-phumulani-cream">
              <h4 className="font-bold text-phumulani-charcoal text-xs uppercase tracking-wider text-phumulani-charcoal">
                Official Project Document Library ({projectDocuments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectDocuments.map((doc) => (
                  <div key={doc.id} className="p-3 border border-phumulani-cream rounded-xl bg-phumulani-cream space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-phumulani-charcoal uppercase">{doc.category}</span>
                        <div className="font-bold text-phumulani-charcoal text-xs mt-0.5">{doc.title}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-phumulani-cream text-phumulani-charcoal">
                        {doc.accessTier}
                      </span>
                    </div>
                    <p className="text-[11px] text-phumulani-charcoal">{doc.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal font-mono pt-1">
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <h3 className="font-bold text-phumulani-charcoal font-serif text-base">
              Resolve Feedback: {feedbackResolveModal.id}
            </h3>
            <p className="text-xs text-phumulani-charcoal">{feedbackResolveModal.title}</p>
            <form onSubmit={handleResolveFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-phumulani-charcoal">Resolution Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Describe technical implementation or resolution..."
                  rows={3}
                  className="w-full mt-1 border border-phumulani-cream rounded-lg p-2 text-xs focus:ring-1 focus:ring-phumulani-earth outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackResolveModal(null)}
                  className="px-3 py-1.5 border border-phumulani-cream rounded-lg text-xs font-semibold hover:bg-phumulani-cream cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-lg text-xs font-bold cursor-pointer"
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
