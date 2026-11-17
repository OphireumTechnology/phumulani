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
    <div className="min-h-screen bg-phumulani-cream flex flex-col font-sans text-phumulani-charcoal">
      {/* 1. MASTER HEADER — SECTION 04 SPECIFICATION */}
      <header className="bg-white border-b border-phumulani-charcoal/12 sticky top-0 z-30">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold tracking-widest uppercase text-phumulani-earth">
                CLIENT PORTAL
              </span>
              <span className="text-phumulani-charcoal/40" aria-hidden="true">·</span>
              <span className="font-semibold text-phumulani-charcoal/85">
                Partner: {overview.developmentOrganization}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-phumulani-charcoal tracking-tight mt-0.5">
              PHUMULANI AI COMMUNITY PLATFORM
            </h1>
            <p className="text-xs font-medium text-phumulani-charcoal/75">
              Development Progress &amp; Project Transparency
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Quick Status */}
            <div className="hidden md:flex flex-col text-right text-xs tabular-nums">
              <span className="font-semibold text-phumulani-charcoal">
                Current Phase: <strong className="text-phumulani-earth">{overview.currentApprovedPhase}</strong>
              </span>
              <span className="text-[11px] text-phumulani-charcoal/75 font-mono">
                Release: {overview.currentReleaseVersion}
              </span>
            </div>

            {/* Launch Staging Sandbox */}
            <button
              onClick={() => setIsStagingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-phumulani-gold hover:bg-phumulani-teal text-phumulani-charcoal text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Launch protected staging preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Staging Preview</span>
            </button>

            {/* Submit Client Feedback */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>

            {/* Exit to Public */}
            <button
              onClick={() => onViewChange('public')}
              className="px-3 py-2 border border-phumulani-charcoal/20 hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap"
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
          className={`bg-white border-r border-phumulani-charcoal/12 transition-all duration-200 flex flex-col shrink-0 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="p-3 border-b border-phumulani-charcoal/12 flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/75">
                Navigation
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded text-phumulani-charcoal hover:text-phumulani-earth cursor-pointer"
              title="Toggle sidebar"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-4 overflow-y-auto text-xs">
            {/* GROUP 1: PROJECT OVERVIEW */}
            <div>
              {isSidebarOpen && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block mb-1">
                  Project Overview
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'dashboard'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Executive Dashboard</span>}
                </button>
                <button
                  onClick={() => setActiveSection('roadmap')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'roadmap'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
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
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block mb-1">
                  Development
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('features')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'features'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Delivered Features</span>}
                </button>
                <button
                  onClick={() => setActiveSection('activity')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'activity'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Activity Feed</span>}
                </button>
                <button
                  onClick={() => setActiveSection('sync_verification')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'sync_verification'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
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
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block mb-1">
                  Collaboration
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('approvals')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'approvals'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 shrink-0 ${activeSection === 'approvals' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {isSidebarOpen && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Approvals</span>
                      <span className="text-[10px] font-mono bg-phumulani-cream text-phumulani-charcoal px-1.5 py-0.2 rounded font-bold">
                        {overview.kpis.pendingClientApprovalsCount}
                      </span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setActiveSection('feedback_list')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'feedback_list'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Feedback Items</span>}
                </button>
                <button
                  onClick={() => setActiveSection('change_requests')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'change_requests'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
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
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block mb-1">
                  Reports & Records
                </span>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'reports'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span>Weekly Reports</span>}
                </button>
                <button
                  onClick={() => setActiveSection('documents')}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeSection === 'documents'
                      ? 'bg-phumulani-earth text-white'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
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
              <div className="p-4 bg-white border border-phumulani-teal/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-phumulani-earth">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-phumulani-earth shrink-0" />
                  <div>
                    <span className="font-bold">Next Expected Milestone:</span>{' '}
                    <span className="text-phumulani-charcoal">{overview.nextExpectedMilestone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 font-medium tabular-nums">
                  <span className="text-phumulani-charcoal/80">Last update: {new Date(overview.lastVerifiedProjectUpdate).toLocaleTimeString()}</span>
                  <span className="font-mono bg-phumulani-cream text-phumulani-earth px-2.5 py-0.5 rounded-md font-bold border border-phumulani-charcoal/12">
                    Delivery: {overview.kpis.currentProjectDeliveryStatus}
                  </span>
                </div>
              </div>

              {/* 12 EXECUTIVE KPI CARDS GRID */}
              <div>
                <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-phumulani-charcoal/80 mb-3">
                  Executive KPI Performance Grid (Audited &amp; Verified Values)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 tabular-nums">
                  {/* Card 1: Verified Progress */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">1. Verified Progress</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.verifiedProgressPercent}%
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Approved weighted sum</span>
                  </div>

                  {/* Card 2: Completed Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">2. Milestones Done</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.completedMilestonesCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Signed off / verified</span>
                  </div>

                  {/* Card 3: Active Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">3. Active Milestones</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.activeMilestonesCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">In testing &amp; review</span>
                  </div>

                  {/* Card 4: Pending Milestones */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">4. Pending Milestones</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-charcoal mt-1">
                      {overview.kpis.pendingMilestonesCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Scheduled in roadmap</span>
                  </div>

                  {/* Card 5: Features Delivered */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">5. Features Delivered</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.featuresDeliveredCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Completed &amp; functional</span>
                  </div>

                  {/* Card 6: Features Awaiting Acceptance */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">6. Awaiting Accept</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.featuresAwaitingAcceptanceCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Ready for sign-off</span>
                  </div>

                  {/* Card 7: Open Issues */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">7. Open Feedback</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-charcoal mt-1">
                      {overview.kpis.openDevelopmentIssuesCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Under assessment</span>
                  </div>

                  {/* Card 8: Resolved Issues */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">8. Resolved Issues</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.resolvedDevelopmentIssuesCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Verified &amp; closed</span>
                  </div>

                  {/* Card 9: Latest Build */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">9. Latest Build</span>
                    <div className="text-sm font-bold font-mono text-phumulani-charcoal mt-1 truncate">
                      SHA: {overview.kpis.latestSuccessfulBuildSha}
                    </div>
                    <span className="text-[10px] text-phumulani-earth font-semibold">✓ Pass (CI #42)</span>
                  </div>

                  {/* Card 10: Verified Deployment */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">10. Verified Deploy</span>
                    <div className="text-xs font-bold text-phumulani-charcoal mt-1 truncate">
                      {overview.kpis.latestVerifiedDeploymentEnv}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Staging sandbox active</span>
                  </div>

                  {/* Card 11: Pending Client Approvals */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">11. Pending Approvals</span>
                    <div className="font-heading text-xl font-extrabold text-phumulani-earth mt-1">
                      {overview.kpis.pendingClientApprovalsCount}
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">Milestones awaiting</span>
                  </div>

                  {/* Card 12: Delivery Status */}
                  <div className="bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12">
                    <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">12. Delivery Status</span>
                    <div className="text-sm font-bold text-phumulani-earth mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{overview.kpis.currentProjectDeliveryStatus}</span>
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal/75">On schedule</span>
                  </div>
                </div>
              </div>

              {/* DUAL PROGRESS GAUGES */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-phumulani-charcoal/12 tabular-nums">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-phumulani-charcoal">Verified Milestone Progress</span>
                    <span className="font-bold text-phumulani-earth">{progressMetrics.verifiedProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-phumulani-cream h-2 rounded-full overflow-hidden">
                    <div className="bg-phumulani-charcoal h-full rounded-full" style={{ width: `${progressMetrics.verifiedProgressPercent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-phumulani-charcoal">Testing Pass Rate</span>
                    <span className="font-bold text-phumulani-earth">{progressMetrics.testingProgress}%</span>
                  </div>
                  <div className="w-full bg-phumulani-cream h-2 rounded-full overflow-hidden">
                    <div className="bg-phumulani-green h-full rounded-full" style={{ width: `${progressMetrics.testingProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-phumulani-charcoal">Implementation Deliverables</span>
                    <span className="font-bold text-phumulani-earth">{progressMetrics.implementationProgress}%</span>
                  </div>
                  <div className="w-full bg-phumulani-cream h-2 rounded-full overflow-hidden">
                    <div className="bg-phumulani-earth h-full rounded-full" style={{ width: `${progressMetrics.implementationProgress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-phumulani-charcoal">Client Acceptance</span>
                    <span className="font-bold text-phumulani-earth">{progressMetrics.clientAcceptanceProgress}%</span>
                  </div>
                  <div className="w-full bg-phumulani-cream h-2 rounded-full overflow-hidden">
                    <div className="bg-phumulani-gold h-full rounded-full" style={{ width: `${progressMetrics.clientAcceptanceProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY STREAM PREVIEW */}
              <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-phumulani-charcoal text-sm font-heading">
                    Live Verified Development Events
                  </h3>
                  <button
                    onClick={() => setActiveSection('activity')}
                    className="text-xs text-phumulani-earth hover:underline font-semibold cursor-pointer"
                  >
                    View All ({activities.length}) →
                  </button>
                </div>

                <div className="divide-y divide-phumulani-charcoal/10">
                  {activities.slice(0, 4).map((act) => (
                    <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-phumulani-charcoal">{act.title}</div>
                        <p className="text-phumulani-charcoal leading-tight">{act.clientDescription}</p>
                        <div className="flex items-center gap-2 text-[10px] text-phumulani-charcoal font-mono">
                          <span>Source: {act.sourceSystem}</span>
                          <span>·</span>
                          <span>Evidence: {act.evidenceReference}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-phumulani-charcoal font-mono shrink-0">
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Development Milestone Timeline &amp; Deliverables
                </h3>
                <p className="text-xs text-phumulani-charcoal/80 mt-1 tabular-nums">
                  Progress is computed exclusively from verified milestone weights ({progressMetrics.verifiedMilestonesWeight}/{progressMetrics.totalApprovedWeights} points).
                </p>

                <div className="mt-6 space-y-4">
                  {milestones.map((m) => {
                    const isApproved = m.developmentStatus === 'CLIENT_APPROVED' || m.developmentStatus === 'PRODUCTION_VERIFIED';
                    return (
                      <div key={m.id} className="p-4 bg-phumulani-cream/60 rounded-xl border border-phumulani-charcoal/12 space-y-2.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-phumulani-charcoal/12 text-phumulani-charcoal tabular-nums">
                              {m.id}
                            </span>
                            <h4 className="font-heading font-bold text-phumulani-charcoal text-sm mt-1.5">{m.title}</h4>
                          </div>

                          <div className="flex items-center gap-2 tabular-nums">
                            <span className="text-xs font-mono font-bold text-phumulani-charcoal">Weight: {m.weight}%</span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                                isApproved
                                  ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                                  : m.developmentStatus === 'READY_FOR_CLIENT_REVIEW'
                                  ? 'bg-phumulani-gold/15 text-phumulani-charcoal border-phumulani-gold/40'
                                  : 'bg-white text-phumulani-charcoal border-phumulani-charcoal/15'
                              }`}
                            >
                              {m.developmentStatus}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-phumulani-charcoal/85 leading-relaxed">{m.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-phumulani-charcoal/10 text-xs text-phumulani-charcoal tabular-nums">
                          <div>Assigned Owner: <strong>{m.assignedOwner}</strong></div>
                          <div>Target Completion: <strong>{new Date(m.targetDate).toLocaleDateString()}</strong></div>
                        </div>

                        {/* Deliverables checklist */}
                        <div className="space-y-1 pt-1">
                          {m.deliverables.map((d) => (
                            <div key={d.id} className="flex items-center gap-2 text-[11px] text-phumulani-charcoal/85">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${d.isCompleted ? 'text-phumulani-earth' : 'text-phumulani-charcoal/45'}`} />
                              <span>{d.title} — {d.description}</span>
                            </div>
                          ))}
                        </div>

                        {/* Sign-off button if awaiting review */}
                        {m.developmentStatus === 'READY_FOR_CLIENT_REVIEW' && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setApprovalModalMilestone(m)}
                              className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Review &amp; Formally Sign Off</span>
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Delivered Platform Features ({features.length})
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Select a feature to inspect implementation requirements, acceptance criteria, and verified commit hashes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((f) => {
                    const isSelected = selectedFeature?.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFeature(f)}
                        className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                          isSelected
                            ? 'border-phumulani-earth bg-phumulani-cream/70 ring-1 ring-phumulani-earth'
                            : 'border-phumulani-charcoal/12 hover:border-phumulani-earth/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded-md border border-phumulani-charcoal/10">
                            {f.id} · {f.category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/35">
                            {f.status}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-phumulani-charcoal text-xs">{f.title}</h4>
                        <p className="text-[11px] text-phumulani-charcoal/80 line-clamp-2 leading-relaxed">{f.description}</p>
                        <div className="flex justify-between items-center text-[10px] text-phumulani-charcoal/75 pt-2 border-t border-phumulani-charcoal/10">
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Chronological Development Activity Stream
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Audited events across Google AI Studio, GitHub, GitHub Actions, and Windows sync controller.
                </p>

                <div className="divide-y divide-phumulani-charcoal/10">
                  {activities.map((act) => (
                    <div key={act.id} className="py-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-phumulani-cream px-1.5 py-0.5 rounded-md border border-phumulani-charcoal/10 text-phumulani-charcoal">
                            {act.type}
                          </span>
                          <strong className="text-phumulani-charcoal">{act.title}</strong>
                        </div>
                        <span className="text-[10px] text-phumulani-charcoal/70 font-mono tabular-nums">
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-phumulani-charcoal/85 leading-relaxed">{act.clientDescription}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-phumulani-charcoal/75 font-mono pt-1">
                        <span>Actor: {act.responsibleActor}</span>
                        <span aria-hidden="true">·</span>
                        <span>System: {act.sourceSystem}</span>
                        <span aria-hidden="true">·</span>
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Local Windows Development Synchronization Hub
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Verifies working tree state between local developer storage and the GitHub remote.
                </p>

                <div className="p-4 bg-phumulani-cream/70 border border-phumulani-charcoal/12 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-phumulani-charcoal">Current Synchronization Status</span>
                    <span className="font-mono font-bold text-phumulani-charcoal bg-phumulani-green/15 border border-phumulani-green/35 px-2.5 py-0.5 rounded-md">
                      {localSync.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-phumulani-charcoal font-mono text-[11px]">
                    <div>Local Path: {localSync.localPath}</div>
                    <div>Controller Path: {localSync.controllerPath}</div>
                    <div>Local Commit: {localSync.localCommit}</div>
                    <div>Remote Commit: {localSync.remoteCommit}</div>
                  </div>
                  <div className="p-3 bg-white border border-phumulani-charcoal/12 rounded-lg text-phumulani-charcoal leading-relaxed">
                    <strong>Summary for Client Review:</strong> {localSync.sanitizedSummary}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: APPROVALS */}
          {activeSection === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Formal Client Milestone Sign-Off &amp; Approvals
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Authorized client representatives can review deliverable evidence and grant version-bound approvals.
                </p>

                <div className="space-y-3">
                  {milestones.map((m) => {
                    const isPending = m.developmentStatus === 'READY_FOR_CLIENT_REVIEW';
                    const hasApprovals = m.approvals && m.approvals.length > 0;
                    return (
                      <div key={m.id} className="p-4 border border-phumulani-charcoal/12 rounded-xl bg-phumulani-cream/60 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-phumulani-charcoal/15 text-phumulani-charcoal">
                              {m.id}
                            </span>
                            <span className="font-bold text-phumulani-charcoal ml-2">{m.title}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                              m.developmentStatus === 'CLIENT_APPROVED' || m.developmentStatus === 'PRODUCTION_VERIFIED'
                                ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                                : 'bg-white text-phumulani-charcoal border-phumulani-charcoal/15'
                            }`}
                          >
                            {m.developmentStatus}
                          </span>
                        </div>

                        {hasApprovals && (
                          <div className="p-3 bg-white border border-phumulani-charcoal/12 rounded-lg space-y-1 text-[11px]">
                            <span className="font-bold text-phumulani-charcoal">Latest Recorded Approval:</span>
                            {m.approvals.map((app) => (
                              <div key={app.id} className="text-phumulani-charcoal/85">
                                <strong>{app.approverName}</strong> ({app.approverRole}) — Decision: <span className="font-bold text-phumulani-charcoal">{app.decision}</span> on artifact <code className="font-mono bg-phumulani-cream px-1">{app.approvedArtifactVersion}</code> at {new Date(app.timestamp).toLocaleString()}.
                                <p className="italic text-phumulani-charcoal/80 mt-0.5">&quot;{app.comments}&quot;</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {isPending && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => setApprovalModalMilestone(m)}
                              className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                    Client Feedback &amp; Observations ({feedbacks.length})
                  </h3>
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    + Submit New Feedback
                  </button>
                </div>

                <div className="divide-y divide-phumulani-charcoal/10 border border-phumulani-charcoal/12 rounded-xl overflow-hidden">
                  {feedbacks.map((f) => (
                    <div key={f.id} className="p-4 space-y-1.5 text-xs hover:bg-phumulani-cream/40 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-phumulani-cream border border-phumulani-charcoal/12 px-2 py-0.5 rounded-md text-phumulani-charcoal">
                            {f.id}
                          </span>
                          <strong className="text-phumulani-charcoal">{f.title}</strong>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                            f.status === 'RESOLVED'
                              ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/35'
                              : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-charcoal/15'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <p className="text-phumulani-charcoal/85 leading-relaxed">{f.description}</p>
                      {f.resolutionNotes && (
                        <div className="p-2.5 bg-phumulani-green/15 border border-phumulani-green/35 rounded-lg text-[11px] text-phumulani-charcoal">
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
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Automated Weekly Development Reports
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Comprehensive progress reports grounded strictly in verified system data.
                </p>

                {weeklyReports.map((r) => (
                  <div key={r.id} className="border border-phumulani-charcoal/12 rounded-xl p-5 space-y-3 text-xs bg-phumulani-cream/60">
                    <div className="flex items-center justify-between border-b border-phumulani-charcoal/10 pb-2.5">
                      <div>
                        <span className="font-mono font-bold bg-white border border-phumulani-charcoal/12 text-phumulani-earth px-2 py-0.5 rounded-md">
                          {r.id}
                        </span>
                        <span className="font-bold text-phumulani-charcoal ml-2 tabular-nums">Period: {r.reportingPeriod}</span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-white border border-phumulani-charcoal/20 text-phumulani-charcoal font-semibold rounded-lg hover:bg-phumulani-cream cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Print Report</span>
                      </button>
                    </div>
                    <div className="text-phumulani-charcoal/90 leading-relaxed">
                      <strong>Executive Summary:</strong> {r.executiveSummary}
                    </div>
                    <div className="text-phumulani-charcoal/85">
                      <strong>GitHub &amp; CI Activity:</strong> {r.githubActivitySummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: DOCUMENTS */}
          {activeSection === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-phumulani-charcoal/12 space-y-4">
                <h3 className="text-base font-bold text-phumulani-charcoal font-heading">
                  Official Project Document Library
                </h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Approved proposals, architecture blueprints, test registers, and media preservation manifests.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-phumulani-cream/60 border border-phumulani-charcoal/12 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase text-phumulani-charcoal/75">{doc.category}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-phumulani-charcoal/12">
                          {doc.accessTier}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-phumulani-charcoal">{doc.title}</h4>
                      <p className="text-[11px] text-phumulani-charcoal/80">{doc.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal/75 font-mono pt-2 border-t border-phumulani-charcoal/10">
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
        <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-phumulani-charcoal/12 p-5 overflow-y-auto shrink-0 space-y-5 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal/70">Context Inspector</span>
            <h4 className="font-heading font-bold text-phumulani-charcoal text-sm mt-1">
              {selectedFeature ? selectedFeature.title : 'Feature Details'}
            </h4>
            <span className="text-[10px] font-mono text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-md border border-phumulani-teal/40 mt-1.5 inline-block">
              {selectedFeature?.id || 'FEAT-INSPECT'} · {selectedFeature?.category}
            </span>
          </div>

          {selectedFeature && (
            <>
              <div className="space-y-1">
                <span className="font-bold text-phumulani-charcoal">Description:</span>
                <p className="text-phumulani-charcoal leading-relaxed">{selectedFeature.description}</p>
              </div>

              <div className="space-y-2 border-t border-phumulani-cream pt-3">
                <span className="font-bold text-phumulani-charcoal">Acceptance Requirements:</span>
                <ul className="space-y-1.5 list-disc list-inside text-phumulani-charcoal">
                  {selectedFeature.acceptanceCriteria.map((req, i) => (
                    <li key={i} className="text-[11px] leading-tight">{req}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 border-t border-phumulani-cream pt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Assigned Owner:</span>
                  <strong className="text-phumulani-charcoal">{selectedFeature.assignedOwner}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Verification Commit:</span>
                  <strong className="font-mono text-phumulani-earth">{selectedFeature.evidenceSha}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Feedback Count:</span>
                  <span>{selectedFeature.clientFeedbackCount} notes</span>
                </div>
              </div>
            </>
          )}

          <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-phumulani-charcoal">
              <Lock className="w-3.5 h-3.5" />
              <span>Safeguarding Isolation</span>
            </div>
            <p className="text-phumulani-charcoal leading-tight">
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
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-fadeIn text-xs">
            <h3 className="font-bold text-phumulani-charcoal font-heading text-base">
              Submit Client Feedback or Observation
            </h3>
            <p className="text-phumulani-charcoal/80">
              Your feedback is directly routed to the development team lead and tracked with a unique reference number.
            </p>

            {feedbackSuccessMsg && (
              <div className="p-3 bg-phumulani-green/15 border border-phumulani-green/40 rounded-lg text-phumulani-charcoal font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-phumulani-charcoal" />
                <span>Feedback submitted successfully! Registered in audit trail.</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal uppercase">Feedback Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
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
                <label className="block text-[11px] font-bold text-phumulani-charcoal uppercase">Subject / Title</label>
                <input
                  type="text"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="e.g. Clarify Safe Housing Bridge Fund impact text"
                  className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal uppercase">Detailed Observations</label>
                <textarea
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  placeholder="Provide concrete details or suggestions..."
                  rows={4}
                  className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal uppercase">Priority</label>
                <select
                  value={feedbackPriority}
                  onChange={(e) => setFeedbackPriority(e.target.value)}
                  className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
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
                  className="px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal font-semibold cursor-pointer hover:bg-phumulani-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs border border-phumulani-charcoal/15">
            <h3 className="font-bold text-phumulani-charcoal font-heading text-base">
              Milestone Sign-Off: {approvalModalMilestone.id}
            </h3>
            <p className="text-phumulani-charcoal/85">
              You are certifying that <strong>{approvalModalMilestone.title}</strong> has been inspected, tested, and accepted on release artifact <code className="font-mono bg-phumulani-cream px-1">v13.0-PREVIEW</code>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-phumulani-charcoal uppercase">Comments or Executive Sign-Off Note</label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Enter sign-off comments or conditions..."
                rows={3}
                className="w-full mt-1 border border-phumulani-charcoal/20 rounded-lg p-2 text-xs focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 outline-none bg-white text-phumulani-charcoal"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleFormalApproval('REJECTED')}
                className="px-3 py-1.5 bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/40 hover:bg-phumulani-earth hover:text-white rounded-lg font-bold cursor-pointer transition-colors"
              >
                Request Revision
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setApprovalModalMilestone(null)}
                  className="px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal font-semibold cursor-pointer hover:bg-phumulani-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFormalApproval('APPROVED')}
                  className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
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
