/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Client Development Transparency Portal (/client/project-dashboard)
 * Grounded in Phase 13 Master Directive Section 04 & 05
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import {
  DevelopmentMilestone,
  DevelopmentFeature,
  ClientFeedbackItem,
  ChangeRequestItem,
  ProjectDocumentRecord,
  WeeklyDevelopmentReport,
} from '../types/developmentOps';
import { DevelopmentOpsService } from '../services/developmentOpsService';
import { ClientStagingModal } from '../components/ClientStagingModal';
import {
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Check,
  Download,
  Calendar,
  Lock,
  UserCheck,
  FolderGit2,
  GitBranch,
  HardDrive,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface ClientDevelopmentPortalViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export const ClientDevelopmentPortalView: React.FC<ClientDevelopmentPortalViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const dbState = db.getState();
  const milestones = dbState.developmentMilestones;
  const features = dbState.developmentFeatures;
  const feedbacks = dbState.clientFeedbacks;
  const changeRequests = dbState.changeRequests;
  const documents = dbState.projectDocuments;
  const weeklyReports = dbState.weeklyReports;
  const activities = dbState.developmentActivities;
  const localSync = dbState.localSyncReport;
  const githubWorkflows = dbState.githubWorkflowRuns;

  // Selected navigation section in left sidebar
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<DevelopmentFeature | null>(features[0]);
  const [isStagingModalOpen, setIsStagingModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // New feedback form state
  const [feedbackType, setFeedbackType] = useState<any>('General Feedback');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [feedbackPriority, setFeedbackPriority] = useState<any>('MEDIUM');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState(false);

  // Formal Approval confirmation modal
  const [approvalModalMilestone, setApprovalModalMilestone] = useState<DevelopmentMilestone | null>(null);
  const [approvalComments, setApprovalComments] = useState('');

  // Overview calculations
  const overview = DevelopmentOpsService.getTransparencyOverview(
    milestones,
    features,
    feedbacks,
    changeRequests,
    localSync
  );
  const progressMetrics = DevelopmentOpsService.calculateProgress(milestones);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    db.submitClientFeedback({
      feedbackType,
      title: feedbackTitle,
      description: feedbackDesc,
      submittedBy: currentUser.name,
      submitterEmail: currentUser.email,
      submitterRole: currentUser.role,
      priority: feedbackPriority,
      relatedFeatureId: selectedFeature?.id,
    });
    setFeedbackTitle('');
    setFeedbackDesc('');
    setFeedbackSuccessMsg(true);
    setTimeout(() => {
      setFeedbackSuccessMsg(false);
      setIsFeedbackModalOpen(false);
    }, 2000);
  };

  const handleFormalApproval = (decision: 'APPROVED' | 'REJECTED') => {
    if (!approvalModalMilestone) return;
    db.approveMilestone(
      approvalModalMilestone.id,
      currentUser.id,
      currentUser.name,
      currentUser.role,
      decision,
      'v13.0-PREVIEW',
      approvalComments || `Formal ${decision.toLowerCase()} decision recorded by ${currentUser.name}`
    );
    setApprovalModalMilestone(null);
    setApprovalComments('');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-slate-800">
      {/* 1. MASTER HEADER — SECTION 04 SPECIFICATION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                CLIENT PORTAL
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500">
                Partner: {overview.developmentOrganization}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
              PHUMULANI AI COMMUNITY PLATFORM
            </h1>
            <p className="text-xs font-medium text-slate-600">
              Development Progress & Project Transparency
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Quick Status Pill */}
            <div className="hidden md:flex flex-col text-right text-xs">
              <span className="font-semibold text-slate-900">
                Current Phase: <strong className="text-teal-800">{overview.currentApprovedPhase}</strong>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Release: {overview.currentReleaseVersion}
              </span>
            </div>

            {/* Launch Staging Sandbox */}
            <button
              onClick={() => setIsStagingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Launch protected staging preview"
            >
              <Eye className="w-3.5 h-3.5 text-slate-950" />
              <span>Launch Staging Preview</span>
            </button>

            {/* Submit Client Feedback */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Submit Feedback</span>
            </button>

            {/* Exit to Public */}
            <button
              onClick={() => onViewChange('public')}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Public Website
            </button>
          </div>
        </div>
      </header>

      {/* 2. THREE-PANEL LAYOUT: LEFT SIDEBAR, CENTER WORKSPACE, RIGHT CONTEXT PANEL */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLLAPSIBLE SIDEBAR — SECTION 05 */}
        <aside
          className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col shrink-0 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Toggle sidebar"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-4 overflow-y-auto text-xs">
            {/* GROUP 1: PROJECT OVERVIEW */}
            <div>
              {isSidebarOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Project Overview
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'dashboard'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Executive Dashboard</span>}
                </button>
                <button
                  onClick={() => setActiveSection('roadmap')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'roadmap'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Development Roadmap</span>}
                </button>
              </div>
            </div>

            {/* GROUP 2: DEVELOPMENT */}
            <div>
              {isSidebarOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Development
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('features')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'features'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Delivered Features</span>}
                </button>
                <button
                  onClick={() => setActiveSection('activity')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'activity'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Activity Feed</span>}
                </button>
                <button
                  onClick={() => setActiveSection('sync_verification')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'sync_verification'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HardDrive className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Workstation Sync</span>}
                </button>
              </div>
            </div>

            {/* GROUP 3: CLIENT COLLABORATION */}
            <div>
              {isSidebarOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Collaboration
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('approvals')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'approvals'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 shrink-0 text-amber-400" />
                  {isSidebarOpen && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Approvals</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                        {overview.kpis.pendingClientApprovalsCount}
                      </span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setActiveSection('feedback_list')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'feedback_list'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Feedback Items</span>}
                </button>
                <button
                  onClick={() => setActiveSection('change_requests')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'change_requests'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Change Requests</span>}
                </button>
              </div>
            </div>

            {/* GROUP 4: RESOURCES & GOVERNANCE */}
            <div>
              {isSidebarOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reports & Records
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'reports'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Weekly Reports</span>}
                </button>
                <button
                  onClick={() => setActiveSection('documents')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'documents'
                      ? 'bg-[#104F57] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Project Documents</span>}
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* CENTER WORKSPACE — SECTION 04 & 05 */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* SECTION: DASHBOARD (12 EXECUTIVE KPI CARDS) */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner Notice */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-teal-950">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-teal-800 shrink-0" />
                  <div>
                    <span className="font-bold">Next Expected Milestone:</span>{' '}
                    <span>{overview.nextExpectedMilestone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <span>Last update: {new Date(overview.lastVerifiedProjectUpdate).toLocaleTimeString()}</span>
                  <span className="font-mono bg-teal-100 text-teal-900 px-2 py-0.5 rounded font-bold">
                    Delivery: {overview.kpis.currentProjectDeliveryStatus}
                  </span>
                </div>
              </div>

              {/* 12 EXECUTIVE KPI CARDS GRID */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Executive KPI Performance Grid (Audited & Verified Values)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {/* Card 1: Verified Progress */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">1. Verified Progress</span>
                    <div className="text-xl font-extrabold text-[#104F57] mt-1">
                      {overview.kpis.verifiedProgressPercent}%
                    </div>
                    <span className="text-[10px] text-slate-500">Approved weighted sum</span>
                  </div>

                  {/* Card 2: Completed Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">2. Milestones Done</span>
                    <div className="text-xl font-extrabold text-emerald-700 mt-1">
                      {overview.kpis.completedMilestonesCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Signed off / verified</span>
                  </div>

                  {/* Card 3: Active Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">3. Active Milestones</span>
                    <div className="text-xl font-extrabold text-amber-700 mt-1">
                      {overview.kpis.activeMilestonesCount}
                    </div>
                    <span className="text-[10px] text-slate-500">In testing & review</span>
                  </div>

                  {/* Card 4: Pending Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">4. Pending Milestones</span>
                    <div className="text-xl font-extrabold text-slate-600 mt-1">
                      {overview.kpis.pendingMilestonesCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Scheduled in roadmap</span>
                  </div>

                  {/* Card 5: Features Delivered */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">5. Features Delivered</span>
                    <div className="text-xl font-extrabold text-teal-800 mt-1">
                      {overview.kpis.featuresDeliveredCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Completed & functional</span>
                  </div>

                  {/* Card 6: Features Awaiting Acceptance */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">6. Awaiting Accept</span>
                    <div className="text-xl font-extrabold text-amber-600 mt-1">
                      {overview.kpis.featuresAwaitingAcceptanceCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Ready for sign-off</span>
                  </div>

                  {/* Card 7: Open Issues */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">7. Open Feedback</span>
                    <div className="text-xl font-extrabold text-slate-700 mt-1">
                      {overview.kpis.openDevelopmentIssuesCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Under assessment</span>
                  </div>

                  {/* Card 8: Resolved Issues */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">8. Resolved Issues</span>
                    <div className="text-xl font-extrabold text-emerald-700 mt-1">
                      {overview.kpis.resolvedDevelopmentIssuesCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Verified & closed</span>
                  </div>

                  {/* Card 9: Latest Build */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">9. Latest Build</span>
                    <div className="text-sm font-bold font-mono text-slate-900 mt-1 truncate">
                      SHA: {overview.kpis.latestSuccessfulBuildSha}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Pass (CI #42)</span>
                  </div>

                  {/* Card 10: Verified Deployment */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">10. Verified Deploy</span>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                      {overview.kpis.latestVerifiedDeploymentEnv}
                    </div>
                    <span className="text-[10px] text-slate-500">Staging sandbox active</span>
                  </div>

                  {/* Card 11: Pending Client Approvals */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">11. Pending Approvals</span>
                    <div className="text-xl font-extrabold text-amber-700 mt-1">
                      {overview.kpis.pendingClientApprovalsCount}
                    </div>
                    <span className="text-[10px] text-slate-500">Milestones awaiting</span>
                  </div>

                  {/* Card 12: Delivery Status */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">12. Delivery Status</span>
                    <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{overview.kpis.currentProjectDeliveryStatus}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">On schedule</span>
                  </div>
                </div>
              </div>

              {/* DUAL PROGRESS GAUGES */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Verified Milestone Progress</span>
                    <span className="font-bold text-[#104F57]">{progressMetrics.verifiedProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#104F57] h-full rounded-full" style={{ width: `${progressMetrics.verifiedProgressPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Testing Pass Rate</span>
                    <span className="font-bold text-emerald-700">{progressMetrics.testingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${progressMetrics.testingProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Implementation Deliverables</span>
                    <span className="font-bold text-teal-700">{progressMetrics.implementationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${progressMetrics.implementationProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Client Acceptance</span>
                    <span className="font-bold text-amber-700">{progressMetrics.clientAcceptanceProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${progressMetrics.clientAcceptanceProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY STREAM PREVIEW */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm font-serif">
                    Live Verified Development Events
                  </h3>
                  <button
                    onClick={() => setActiveSection('activity')}
                    className="text-xs text-teal-800 hover:text-teal-950 font-semibold cursor-pointer"
                  >
                    View All ({activities.length}) →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {activities.slice(0, 4).map((act) => (
                    <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{act.title}</div>
                        <p className="text-slate-600 leading-tight">{act.clientDescription}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Source: {act.sourceSystem}</span>
                          <span>·</span>
                          <span>Evidence: {act.evidenceReference}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ROADMAP TIMELINE */}
          {activeSection === 'roadmap' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Development Milestone Timeline & Deliverables
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Progress is computed exclusively from verified milestone weights ({progressMetrics.verifiedMilestonesWeight}/{progressMetrics.totalApprovedWeights} points).
                </p>

                <div className="mt-6 space-y-4">
                  {milestones.map((m) => {
                    const isApproved = m.developmentStatus === 'CLIENT_APPROVED' || m.developmentStatus === 'PRODUCTION_VERIFIED';
                    return (
                      <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                              {m.id}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{m.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500">Weight: {m.weight}%</span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : m.developmentStatus === 'READY_FOR_CLIENT_REVIEW'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {m.developmentStatus}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                          <div>Assigned Owner: <strong>{m.assignedOwner}</strong></div>
                          <div>Target Completion: <strong>{new Date(m.targetDate).toLocaleDateString()}</strong></div>
                        </div>

                        {/* Deliverables checklist */}
                        <div className="space-y-1 pt-1">
                          {m.deliverables.map((d) => (
                            <div key={d.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${d.isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{d.title} — {d.description}</span>
                            </div>
                          ))}
                        </div>

                        {/* Sign-off button if awaiting review */}
                        {m.developmentStatus === 'READY_FOR_CLIENT_REVIEW' && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setApprovalModalMilestone(m)}
                              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Review & Formally Sign Off</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DELIVERED FEATURES */}
          {activeSection === 'features' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Delivered Platform Features ({features.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Select a feature to inspect implementation requirements, acceptance criteria, and verified commit hashes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((f) => {
                    const isSelected = selectedFeature?.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFeature(f)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'border-[#104F57] bg-teal-50/40 ring-1 ring-[#104F57]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {f.id} · {f.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                            {f.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">{f.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{f.description}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>Owner: {f.assignedOwner}</span>
                          <span className="font-mono">Evidence: {f.evidenceSha}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: ACTIVITY FEED */}
          {activeSection === 'activity' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Chronological Development Activity Stream
                </h3>
                <p className="text-xs text-slate-500">
                  Audited events across Google AI Studio, GitHub, GitHub Actions, and Windows sync controller.
                </p>

                <div className="divide-y divide-slate-100">
                  {activities.map((act) => (
                    <div key={act.id} className="py-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                            {act.type}
                          </span>
                          <strong className="text-slate-900">{act.title}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{act.clientDescription}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                        <span>Actor: {act.responsibleActor}</span>
                        <span>·</span>
                        <span>System: {act.sourceSystem}</span>
                        <span>·</span>
                        <span>Reference: {act.evidenceReference}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: WORKSTATION SYNC VERIFICATION */}
          {activeSection === 'sync_verification' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Local Windows Development Synchronization Hub
                </h3>
                <p className="text-xs text-slate-500">
                  Verifies working tree state between local developer storage and the GitHub remote.
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Current Synchronization Status</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {localSync.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                    <div>Local Path: {localSync.localPath}</div>
                    <div>Controller Path: {localSync.controllerPath}</div>
                    <div>Local Commit: {localSync.localCommit}</div>
                    <div>Remote Commit: {localSync.remoteCommit}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    <strong>Summary for Client Review:</strong> {localSync.sanitizedSummary}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: APPROVALS */}
          {activeSection === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Formal Client Milestone Sign-Off & Approvals
                </h3>
                <p className="text-xs text-slate-500">
                  Authorized client representatives can review deliverable evidence and grant version-bound approvals.
                </p>

                <div className="space-y-3">
                  {milestones.map((m) => {
                    const isPending = m.developmentStatus === 'READY_FOR_CLIENT_REVIEW';
                    const hasApprovals = m.approvals && m.approvals.length > 0;
                    return (
                      <div key={m.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border text-slate-800">
                              {m.id}
                            </span>
                            <span className="font-bold text-slate-900 ml-2">{m.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.developmentStatus === 'CLIENT_APPROVED' || m.developmentStatus === 'PRODUCTION_VERIFIED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {m.developmentStatus}
                          </span>
                        </div>

                        {hasApprovals && (
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1 text-[11px]">
                            <span className="font-bold text-slate-800">Latest Recorded Approval:</span>
                            {m.approvals.map((app) => (
                              <div key={app.id} className="text-slate-600">
                                <strong>{app.approverName}</strong> ({app.approverRole}) — Decision: <span className="font-bold text-emerald-800">{app.decision}</span> on artifact <code className="font-mono bg-slate-100 px-1">{app.approvedArtifactVersion}</code> at {new Date(app.timestamp).toLocaleString()}.
                                <p className="italic text-slate-500">"{app.comments}"</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {isPending && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => setApprovalModalMilestone(m)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Authorize Milestone Acceptance</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: FEEDBACK LIST */}
          {activeSection === 'feedback_list' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Client Feedback & Observations ({feedbacks.length})
                  </h3>
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    + Submit New Feedback
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {feedbacks.map((f) => (
                    <div key={f.id} className="p-4 space-y-1.5 text-xs hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {f.id}
                          </span>
                          <strong className="text-slate-900">{f.title}</strong>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            f.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{f.description}</p>
                      {f.resolutionNotes && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900">
                          <strong>Resolution:</strong> {f.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: REPORTS */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Automated Weekly Development Reports
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive progress reports grounded strictly in verified system data.
                </p>

                {weeklyReports.map((r) => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-5 space-y-3 text-xs bg-slate-50">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                          {r.id}
                        </span>
                        <span className="font-bold text-slate-900 ml-2">Period: {r.reportingPeriod}</span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print Report</span>
                      </button>
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <strong>Executive Summary:</strong> {r.executiveSummary}
                    </div>
                    <div className="text-slate-600">
                      <strong>GitHub & CI Activity:</strong> {r.githubActivitySummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: DOCUMENTS */}
          {activeSection === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Official Project Document Library
                </h3>
                <p className="text-xs text-slate-500">
                  Approved proposals, architecture blueprints, test registers, and media preservation manifests.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{doc.category}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {doc.accessTier}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-600">{doc.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200">
                        <span>SHA: {doc.sha256Hash.substring(0, 10)}...</span>
                        <span>{doc.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT CONTEXT PANEL — SECTION 05 */}
        <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto shrink-0 space-y-5 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Context Inspector</span>
            <h4 className="font-bold text-slate-900 text-sm mt-1">
              {selectedFeature ? selectedFeature.title : 'Feature Details'}
            </h4>
            <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mt-1 inline-block">
              {selectedFeature?.id || 'FEAT-INSPECT'} · {selectedFeature?.category}
            </span>
          </div>

          {selectedFeature && (
            <>
              <div className="space-y-1">
                <span className="font-bold text-slate-700">Description:</span>
                <p className="text-slate-600 leading-relaxed">{selectedFeature.description}</p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-700">Acceptance Requirements:</span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                  {selectedFeature.acceptanceCriteria.map((req, i) => (
                    <li key={i} className="text-[11px] leading-tight">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Owner:</span>
                  <strong className="text-slate-900">{selectedFeature.assignedOwner}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Commit:</span>
                  <strong className="font-mono text-teal-800">{selectedFeature.evidenceSha}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Feedback Count:</span>
                  <span>{selectedFeature.clientFeedbackCount} notes</span>
                </div>
              </div>
            </>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Lock className="w-3.5 h-3.5" />
              <span>Safeguarding Isolation</span>
            </div>
            <p className="text-amber-900/80 leading-tight">
              Client Development Portal displays verified project metadata only. Survivor case files and real donor accounts are isolated under VAWA.
            </p>
          </div>
        </aside>
      </div>

      {/* 3. PROTECTED STAGING PREVIEW MODAL */}
      <ClientStagingModal
        isOpen={isStagingModalOpen}
        onClose={() => setIsStagingModalOpen(false)}
        onOpenFeedback={(title) => {
          setIsStagingModalOpen(false);
          setFeedbackTitle(title || '');
          setIsFeedbackModalOpen(true);
        }}
      />

      {/* 4. SUBMIT CLIENT FEEDBACK MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-fadeIn text-xs">
            <h3 className="font-bold text-slate-900 font-serif text-base">
              Submit Client Feedback or Observation
            </h3>
            <p className="text-slate-600">
              Your feedback is directly routed to the development team lead and tracked with a unique reference number.
            </p>

            {feedbackSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Feedback submitted successfully! Registered in audit trail.</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Feedback Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                >
                  <option>General Feedback</option>
                  <option>Design Change</option>
                  <option>Functional Issue</option>
                  <option>New Feature Request</option>
                  <option>Content Correction</option>
                  <option>Accessibility Concern</option>
                  <option>Performance Issue</option>
                  <option>Security Concern</option>
                  <option>Acceptance Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Subject / Title</label>
                <input
                  type="text"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="e.g. Clarify Safe Housing Bridge Fund impact text"
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Detailed Observations</label>
                <textarea
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  placeholder="Provide concrete details or suggestions..."
                  rows={4}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Priority</label>
                <select
                  value={feedbackPriority}
                  onChange={(e) => setFeedbackPriority(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Observation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FORMAL MILESTONE SIGN-OFF MODAL */}
      {approvalModalMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fadeIn text-xs">
            <h3 className="font-bold text-slate-900 font-serif text-base">
              Milestone Sign-Off: {approvalModalMilestone.id}
            </h3>
            <p className="text-slate-600">
              You are certifying that <strong>{approvalModalMilestone.title}</strong> has been inspected, tested, and accepted on release artifact <code className="font-mono bg-slate-100 px-1">v13.0-PREVIEW</code>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase">Comments or Executive Sign-Off Note</label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Enter sign-off comments or conditions..."
                rows={3}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleFormalApproval('REJECTED')}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold cursor-pointer"
              >
                Request Revision
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setApprovalModalMilestone(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFormalApproval('APPROVED')}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Approval</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
