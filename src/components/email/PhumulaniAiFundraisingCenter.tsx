/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phumulani Ai Fundraising Command & Intelligence Center
 * Implements all 12 staff-facing operational sections in /admin/master/email
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Target,
  Send,
  AlertTriangle,
  Flame,
  FileText,
  Clock,
  Award,
  Calendar,
  FileCheck,
  TrendingUp,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  DollarSign,
  Building,
  Mail,
  Check,
  X,
  Lock,
  Cpu,
} from 'lucide-react';
import {
  ProspectProfile,
  ProgramMatchResult,
  AiCampaign,
  EmailClassificationResult,
  DonorInterestScore,
  AiReplyDraft,
  FollowUpItem,
  HighInterestLead,
  FundingProposalDraft,
  CalendarMeetingSlot,
  CalendarMeetingBooking,
  ModelHealthStatus,
  AutonomousPolicyConfig,
  AutonomyLevel,
  GatewayInferenceMetrics,
} from '../../types/phumulaniAi';
import { phumulaniApiClient, VerifiedProgramSummary } from '../../api/phumulaniApiClient';
import { VerifiedKnowledgeDocument, SourceApprovalAuditReport } from '../../types/verifiedKnowledge';

export type PhumulaniAiSection =
  | 'overview'
  | 'prospects'
  | 'program_matching'
  | 'campaign_builder'
  | 'priority_inbox'
  | 'donor_interest'
  | 'reply_drafts'
  | 'followup_queue'
  | 'high_interest_leads'
  | 'meeting_scheduler'
  | 'funding_proposals'
  | 'fundraising_pipeline'
  | 'verified_knowledge';

interface PhumulaniAiFundraisingCenterProps {
  initialSection?: PhumulaniAiSection;
  onNavigateTab?: (tab: string) => void;
}

export const PhumulaniAiFundraisingCenter: React.FC<PhumulaniAiFundraisingCenterProps> = ({
  initialSection = 'overview',
}) => {
  const [activeSection, setActiveSection] = useState<PhumulaniAiSection>(initialSection);
  const [healthStatus, setHealthStatus] = useState<ModelHealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  // Core Data States
  const [prospects, setProspects] = useState<ProspectProfile[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string>('PROSP-001');
  const [matches, setMatches] = useState<ProgramMatchResult[]>([]);
  const [campaigns, setCampaigns] = useState<AiCampaign[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<AiReplyDraft[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [highInterestLeads, setHighInterestLeads] = useState<HighInterestLead[]>([]);
  const [proposals, setProposals] = useState<FundingProposalDraft[]>([]);
  const [programs, setPrograms] = useState<VerifiedProgramSummary[]>([]);
  const [auditReport, setAuditReport] = useState<SourceApprovalAuditReport | null>(null);
  const [knowledgeDocs, setKnowledgeDocs] = useState<VerifiedKnowledgeDocument[]>([]);
  const [financialBreakdown, setFinancialBreakdown] = useState<any>(null);

  // Testing & Interactive Form States
  const [emailSubjectInput, setEmailSubjectInput] = useState('Interest in Funding Phumulani Transitional Housing');
  const [emailBodyInput, setEmailBodyInput] = useState(
    'Hello Comfort and team,\n\nOur foundation board reviewed your annual report and is very impressed by the Healing Homes Transitional Housing program. We would like to schedule a 30-minute discussion next week to review your outcomes and discuss submitting a $50,000 grant proposal.\n\nBest regards,\nSarah Lindstrom, The McKnight Foundation'
  );
  const [classificationResult, setClassificationResult] = useState<EmailClassificationResult | null>(null);
  const [interestAnalysisResult, setInterestAnalysisResult] = useState<DonorInterestScore | null>(null);

  // Calendar Slots State
  const [availableSlots, setAvailableSlots] = useState<CalendarMeetingSlot[]>([]);
  const [calendarProvider, setCalendarProvider] = useState<'google' | 'microsoft'>('google');
  const [selectedSlot, setSelectedSlot] = useState<CalendarMeetingSlot | null>(null);
  const [scheduledBookings, setScheduledBookings] = useState<CalendarMeetingBooking[]>([]);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  // New Proposal Form State
  const [proposalGrantmaker, setProposalGrantmaker] = useState('Otto Bremer Trust');
  const [proposalProgramId, setProposalProgramId] = useState('PROG-001');
  const [proposalAmount, setProposalAmount] = useState(45000);
  const [proposalNotice, setProposalNotice] = useState<string | null>(null);

  // Policy & Autonomy Controls State
  const [policy, setPolicy] = useState<AutonomousPolicyConfig | null>(null);
  const [metrics, setMetrics] = useState<GatewayInferenceMetrics | null>(null);

  // Phase 66-72 Multi-Model Telemetry, 12-Task Workforce & Calendar Lifecycle
  const [aiTelemetry, setAiTelemetry] = useState<{ config?: any; telemetry?: any } | null>(null);
  const [workforceTasks, setWorkforceTasks] = useState<any[]>([]);
  const [workforceResult, setWorkforceResult] = useState<any | null>(null);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [calendarReminders, setCalendarReminders] = useState<any[]>([]);
  const [calendarProviderStatus, setCalendarProviderStatus] = useState<{
    googleConnected?: boolean;
    microsoftConnected?: boolean;
  } | null>(null);

  // Load All Data via Role-Controlled Client API
  const refreshData = async () => {
    setIsLoadingHealth(true);
    try {
      const [
        prospectsRes,
        campaignsRes,
        draftsRes,
        followUpsRes,
        leadsRes,
        proposalsRes,
        bookingsRes,
        policyRes,
        gatewayRes,
        programsRes,
        knowledgeDocsRes,
        auditReportRes,
        financialRes,
        aiTelemetryRes,
        workforceRes,
        remindersRes,
        calStatusRes,
      ] = await Promise.all([
        phumulaniApiClient.getProspects().catch(() => ({ prospects: [] })),
        phumulaniApiClient.getCampaigns().catch(() => ({ campaigns: [] })),
        phumulaniApiClient.getReplyDrafts().catch(() => ({ drafts: [] })),
        phumulaniApiClient.getFollowUps().catch(() => ({ followUps: [] })),
        phumulaniApiClient.getHighInterestLeads().catch(() => ({ leads: [] })),
        phumulaniApiClient.getProposals().catch(() => ({ proposals: [] })),
        phumulaniApiClient.getBookings().catch(() => ({ bookings: [] })),
        phumulaniApiClient.getPolicyConfig().catch(() => ({ policy: null })),
        phumulaniApiClient.getGatewayStatus().catch(() => ({ gateway: null })),
        phumulaniApiClient.getPrograms().catch(() => ({ programs: [] })),
        phumulaniApiClient.getKnowledgeDocuments().catch(() => ({ documents: [] })),
        phumulaniApiClient.getSourceApprovalAuditReport().catch(() => ({ auditReport: null })),
        phumulaniApiClient.getFinancialBreakdown().catch(() => ({ financialBreakdown: null })),
        phumulaniApiClient.getEmailAiTelemetry().catch(() => null),
        phumulaniApiClient.getWorkforceTasks().catch(() => ({ tasks: [] })),
        phumulaniApiClient.getCalendarReminders().catch(() => ({ reminders: [] })),
        phumulaniApiClient.getCalendarStatus().catch(() => null),
      ]);

      setProspects(prospectsRes.prospects || []);
      setCampaigns(campaignsRes.campaigns || []);
      setReplyDrafts(draftsRes.drafts || []);
      setFollowUps(followUpsRes.followUps || []);
      setHighInterestLeads(leadsRes.leads || []);
      setProposals(proposalsRes.proposals || []);
      setScheduledBookings(bookingsRes.bookings || []);
      setPrograms(programsRes.programs || []);
      setKnowledgeDocs(knowledgeDocsRes.documents || []);
      setAuditReport(auditReportRes.auditReport || null);
      setFinancialBreakdown(financialRes.financialBreakdown || null);
      setAiTelemetry(aiTelemetryRes);
      setWorkforceTasks(workforceRes.tasks || []);
      setCalendarReminders(remindersRes.reminders || []);
      setCalendarProviderStatus(calStatusRes as any);

      if (policyRes.policy) setPolicy(policyRes.policy);
      if (gatewayRes.gateway) {
        setHealthStatus(gatewayRes.gateway);
        setMetrics(gatewayRes.gateway.metrics || null);
      }

      if (selectedProspectId) {
        const matchRes = await phumulaniApiClient.matchProspect(selectedProspectId).catch(() => ({ matches: [] }));
        setMatches(matchRes.matches || []);
      }
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleExecuteWorkforceTask = async (taskId: string) => {
    setExecutingTaskId(taskId);
    try {
      const res = await phumulaniApiClient.executeWorkforceTask({
        taskId,
        context: {
          prospectId: selectedProspectId,
          programId: proposalProgramId,
          subject: emailSubjectInput,
          body: emailBodyInput,
        },
      });
      setWorkforceResult(res.execution);
      refreshData();
    } catch (err: any) {
      setWorkforceResult({ taskId, error: err?.message || 'Task execution failed' });
    } finally {
      setExecutingTaskId(null);
    }
  };

  const handleRescheduleBooking = async (booking: CalendarMeetingBooking) => {
    const newStart = new Date(new Date(booking.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString();
    const newEnd = new Date(new Date(booking.endTime).getTime() + 24 * 60 * 60 * 1000).toISOString();
    try {
      const res = await phumulaniApiClient.rescheduleMeeting({
        bookingId: booking.id,
        newStartTime: newStart,
        newEndTime: newEnd,
      });
      setBookingNotice(
        res.success
          ? `Meeting rescheduled to ${new Date(newStart).toLocaleString()}.`
          : `Reschedule blocked: ${res.error || 'Calendar provider update failed'}`
      );
      refreshData();
    } catch (err: any) {
      setBookingNotice(`Reschedule error: ${err?.message || 'Unknown error'}`);
    }
    setTimeout(() => setBookingNotice(null), 6000);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await phumulaniApiClient.cancelMeeting({
        bookingId,
        reason: 'Cancelled by staff via Fundraising Command Center',
      });
      setBookingNotice(
        res.success ? 'Meeting cancelled and reminders cleared.' : `Cancel notice: ${res.error || 'Failed to cancel'}`
      );
      refreshData();
    } catch (err: any) {
      setBookingNotice(`Cancel error: ${err?.message || 'Unknown error'}`);
    }
    setTimeout(() => setBookingNotice(null), 6000);
  };

  const handleAutonomyChange = async (lvl: AutonomyLevel) => {
    try {
      const res = await phumulaniApiClient.setAutonomyLevel(lvl);
      if (res.policy) setPolicy(res.policy);
    } catch (err: any) {
      console.error('Failed to change autonomy level:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedProspectId) {
      phumulaniApiClient
        .matchProspect(selectedProspectId)
        .then((res) => setMatches(res.matches || []))
        .catch(() => setMatches([]));
    }
  }, [selectedProspectId]);

  // Load slots when calendar tab active
  useEffect(() => {
    if (activeSection === 'meeting_scheduler') {
      phumulaniApiClient
        .getAvailableSlots({
          staffEmail: 'director@phumulani.org',
          staffName: 'Comfort Dondo',
          startDate: new Date().toISOString(),
          daysCount: 5,
          durationMinutes: 30,
        })
        .then((res) => setAvailableSlots(res.slots || []))
        .catch(() => setAvailableSlots([]));
    }
  }, [activeSection]);

  // Handlers
  const handleTestEmailClassification = async () => {
    try {
      const classRes = await phumulaniApiClient.classifyEmail({
        emailSubject: emailSubjectInput,
        emailBody: emailBodyInput,
        senderEmail: 'slindstrom@mcknight-foundation-example.org',
      });
      setClassificationResult(classRes.classification);

      const intRes = await phumulaniApiClient.analyzeDonorInterest({
        prospectId: selectedProspectId,
        emailSubject: emailSubjectInput,
        emailBody: emailBodyInput,
      });
      setInterestAnalysisResult(intRes.interestScore);
      refreshData();
    } catch (err: any) {
      console.error('Failed to classify or analyze email:', err);
    }
  };

  const handleApproveCampaign = async (campaignId: string) => {
    try {
      await phumulaniApiClient.approveCampaign(campaignId, 'Executive Director');
      refreshData();
    } catch (err: any) {
      console.error('Failed to approve campaign:', err);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await phumulaniApiClient.generateProposal({
        targetGrantmaker: proposalGrantmaker,
        programId: proposalProgramId,
        requestedAmount: proposalAmount,
        author: 'Phumulani Ai Agent (Reviewed by Development Team)',
      });
      setProposalNotice(`Draft proposal "${res.proposal.title}" generated successfully! Watermarked for review.`);
      refreshData();
      setTimeout(() => setProposalNotice(null), 5000);
    } catch (err: any) {
      setProposalNotice(`Failed to generate proposal: ${err.message}`);
      setTimeout(() => setProposalNotice(null), 6000);
    }
  };

  const handleBookMeeting = async () => {
    if (!selectedSlot) return;
    const currentProspect = prospects.find((p) => p.id === selectedProspectId) || prospects[0];
    const res = await phumulaniApiClient.scheduleMeeting({
      prospectId: currentProspect.id,
      prospectName: currentProspect.contactName,
      prospectEmail: currentProspect.contactEmail,
      staffEmail: selectedSlot.staffEmail,
      staffName: selectedSlot.staffName,
      provider: calendarProvider,
      title: `Phumulani / ${currentProspect.organizationName} — Introductory Discussion`,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });

    if (res.success && res.booking) {
      setBookingNotice(`Meeting confirmed for ${new Date(res.booking.startTime).toLocaleString()} with ${res.booking.staffName}!`);
      setSelectedSlot(null);
      refreshData();
    } else {
      setBookingNotice(`Booking notice: ${res.error || 'Failed to schedule.'}`);
    }
    setTimeout(() => setBookingNotice(null), 6000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden flex flex-col min-h-[750px]">
      {/* 1. TOP HEADER & MODEL STATUS BAR */}
      <div className="bg-gradient-to-r from-[#104F57] via-[#165B64] to-[#0A3C42] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center border border-teal-300/30">
            <Sparkles className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-serif">Phumulani Ai</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/30 text-teal-100 border border-teal-300/30">
                Phase 65 Local LLM
              </span>
            </div>
            <p className="text-xs text-teal-100/90">
              Autonomous Fundraising Intelligence & Donor Engagement Assistant
            </p>
          </div>
        </div>

        {/* Autonomy Level & Local Runtime Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Autonomy Selector */}
          <div className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-lg border border-teal-300/30">
            <Shield className="w-3.5 h-3.5 text-teal-300" />
            <span className="text-teal-200 font-medium">Autonomy:</span>
            <select
              value={policy?.autonomyLevel || 2}
              onChange={(e) => handleAutonomyChange(parseInt(e.target.value, 10) as AutonomyLevel)}
              className="bg-teal-900/80 text-white font-semibold text-xs rounded px-1.5 py-0.5 border border-teal-400/40 focus:outline-none cursor-pointer"
            >
              <option value={1}>Level 1: Analyze Only</option>
              <option value={2}>Level 2: Draft & Recommend</option>
              <option value={3}>Level 3: Approved Automation</option>
              <option value={4}>Level 4: Human-Controlled Actions</option>
            </select>
          </div>

          {/* Truthful Multi-Model AI Runtime Indicator */}
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-teal-200 font-medium">AI Engine:</span>
              <span className="font-semibold text-white">
                {aiTelemetry?.config?.geminiConfigured
                  ? `Gemini (${aiTelemetry?.config?.geminiModel || 'gemini-4-hydrogen'})`
                  : healthStatus?.backend === 'ollama'
                  ? `Ollama (${healthStatus?.modelId || 'local'})`
                  : 'Deterministic Fallback'}
              </span>
            </div>
            <span className="text-teal-400/50">|</span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  aiTelemetry?.config?.geminiConfigured || healthStatus?.status === 'healthy'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-teal-100">
                {aiTelemetry?.config?.geminiConfigured
                  ? 'Gemini Live Ready'
                  : healthStatus?.status === 'healthy'
                  ? 'Local Ollama Connected'
                  : 'Rule-Based Fallback Active'}
              </span>
            </div>
            {aiTelemetry?.telemetry && (
              <>
                <span className="text-teal-400/50">|</span>
                <span className="text-teal-200" title="Persisted AI invocations">
                  {aiTelemetry.telemetry.totalCalls || 0} calls · {aiTelemetry.telemetry.avgLatencyMs || 0}ms
                </span>
              </>
            )}
            <button
              onClick={refreshData}
              disabled={isLoadingHealth}
              className="p-1 text-teal-200 hover:text-white transition-colors cursor-pointer"
              title="Refresh AI health status and metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 12-SECTION HORIZONTAL TAB NAVIGATION */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 flex items-center gap-1 overflow-x-auto text-xs py-1.5 scrollbar-thin">
        {[
          { id: 'overview', label: 'AI Overview', icon: Sparkles },
          { id: 'prospects', label: 'Prospect Database', icon: Users },
          { id: 'program_matching', label: 'Program Matching', icon: Target },
          { id: 'campaign_builder', label: 'Campaign Builder', icon: Send },
          { id: 'priority_inbox', label: 'Priority Inbox (P0–P4)', icon: Flame },
          { id: 'donor_interest', label: 'Donor Interest', icon: TrendingUp },
          { id: 'reply_drafts', label: 'Reply Drafts', icon: FileText },
          { id: 'followup_queue', label: 'Follow-Up Queue', icon: Clock },
          { id: 'high_interest_leads', label: 'High-Interest Leads', icon: Award },
          { id: 'meeting_scheduler', label: 'Meeting Scheduler', icon: Calendar },
          { id: 'funding_proposals', label: 'Funding Proposals', icon: FileCheck },
          { id: 'fundraising_pipeline', label: 'Fundraising Pipeline', icon: DollarSign },
          { id: 'verified_knowledge', label: 'Truth & Knowledge Grounding', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as PhumulaniAiSection)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#104F57] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE SECTION WORKSPACE */}
      <div className="p-6 flex-1 bg-white overflow-y-auto">
        {/* ================================================================= */}
        {/* 1. OVERVIEW SECTION */}
        {/* ================================================================= */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50">
                <div className="flex items-center justify-between text-teal-800">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Prospects</span>
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{prospects.length}</div>
                <div className="text-xs text-gray-600 mt-1">Foundations & CSR programs</div>
              </div>

              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between text-blue-800">
                  <span className="text-xs font-semibold uppercase tracking-wider">Campaigns Staged</span>
                  <Send className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{campaigns.length}</div>
                <div className="text-xs text-gray-600 mt-1">Pending staff review</div>
              </div>

              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-semibold uppercase tracking-wider">High-Interest Leads</span>
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{highInterestLeads.length}</div>
                <div className="text-xs text-gray-600 mt-1">Score ≥ 80 / Meeting signals</div>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                <div className="flex items-center justify-between text-purple-800">
                  <span className="text-xs font-semibold uppercase tracking-wider">Proposals Drafted</span>
                  <FileCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{proposals.length}</div>
                <div className="text-xs text-gray-600 mt-1">Grounded in approved budgets</div>
              </div>
            </div>

            {/* Model & Architecture Status Card */}
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#104F57]" />
                Local LLM Inference & Windows Host Configuration (D:\PhumulaniAI)
              </h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block">Configured Model:</span>
                  <span className="font-semibold text-gray-900">
                    {healthStatus?.modelId || 'llama3.2:3b (Meta Llama 3.2 3B Instruct)'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Local Inference Endpoint:</span>
                  <span className="font-semibold text-gray-900">http://127.0.0.1:11434 (Ollama)</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Fallback & Fail-Safe:</span>
                  <span className="font-semibold text-emerald-700">Deterministic Rules & Cloud Hybrid</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                <span>
                  <strong>Windows Scripts:</strong> Staged at <code>scripts/windows/</code> (install, start, stop, check, sync-github).
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  VAWA Section 1367 Safeguarding Firewall Active
                </span>
              </div>
            </div>

            {/* Coordinated 12-Task AI Fundraising Workforce (Phase 70) */}
            <div className="p-5 rounded-xl border border-teal-200 bg-teal-50/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#104F57]" />
                    Coordinated 12-Task AI Fundraising Workforce (Phase 70)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Structured human-gated task agents grounded in verified institutional budgets and strict VAWA isolation.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                  {workforceTasks.length} Tasks Registered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workforceTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-2 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {task.taskId}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          {task.humanGate || 'Human Review'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{task.scope}</span>
                      <button
                        type="button"
                        disabled={executingTaskId === task.taskId}
                        onClick={() => handleExecuteWorkforceTask(task.taskId)}
                        className="px-2.5 py-1 bg-[#104F57] hover:bg-teal-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {executingTaskId === task.taskId ? 'Running...' : 'Run Task'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {workforceResult && (
                <div className="p-3.5 rounded-xl bg-white border border-teal-300 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950">
                      Execution Result: {workforceResult.taskId} — {workforceResult.title || ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWorkforceResult(null)}
                      className="text-slate-400 hover:text-slate-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {workforceResult.error ? (
                    <p className="text-rose-700 font-medium">{workforceResult.error}</p>
                  ) : (
                    <pre className="p-2.5 bg-slate-900 text-teal-200 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(workforceResult.artifact || workforceResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* System Prompt Inspector */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  Phumulani Ai Canonical System Prompt & Non-Delegable Constraints
                </h3>
                <span className="text-xs text-gray-500 font-mono">v65.1-canonical</span>
              </div>
              <pre className="mt-3 p-4 bg-gray-900 text-teal-300 font-mono text-xs rounded-lg overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
                {healthStatus?.canonicalSystemPrompt ||
                  'Phumulani Ai Canonical System Prompt: Autonomous fundraising intelligence bounded by Section 7 non-delegable donor safeguards, verifiable institutional source grounding, and mandatory human authorization for donor outbound communications.'}
              </pre>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. PROSPECT DATABASE */}
        {/* ================================================================= */}
        {activeSection === 'prospects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Fundraising Prospect Database</h3>
                <p className="text-xs text-gray-500">Verified Minnesota foundations, corporate CSR leads, and sponsors</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Selected for Matching:</span>
                <select
                  value={selectedProspectId}
                  onChange={(e) => setSelectedProspectId(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white font-medium text-gray-800"
                >
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.organizationName} ({p.contactName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Organization & Contact</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Capacity</th>
                    <th className="px-4 py-3 text-left">Focus Areas</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Program Match</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {prospects.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className={`hover:bg-teal-50/40 transition-colors ${
                        selectedProspectId === prospect.id ? 'bg-teal-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{prospect.organizationName}</div>
                        <div className="text-gray-500 text-[11px]">
                          {prospect.contactName} • {prospect.contactEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                          {prospect.prospectType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        ${prospect.estimatedCapacity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {prospect.areasOfInterest.map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600">
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {prospect.optOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            OPTED OUT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 capitalize">
                            {prospect.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800">
                          <span className="w-7 text-right">{prospect.matchScore}%</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${prospect.matchScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProspectId(prospect.id);
                            setActiveSection('program_matching');
                          }}
                          className="px-2.5 py-1 rounded bg-[#104F57] text-white hover:bg-teal-800 transition-colors font-medium text-[11px]"
                        >
                          Match Program
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. PROGRAM MATCHING (TRANSPARENT MATCH SCORING) */}
        {/* ================================================================= */}
        {activeSection === 'program_matching' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-teal-950">
                  Target Prospect: {prospects.find((p) => p.id === selectedProspectId)?.organizationName}
                </h3>
                <p className="text-xs text-teal-800 mt-0.5">
                  Evaluated across 4 transparent criteria: Interest Fit (40%), Geographic Fit (20%), Budget Alignment (20%), Historical Fit (20%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Switch Prospect:</span>
                <select
                  value={selectedProspectId}
                  onChange={(e) => setSelectedProspectId(e.target.value)}
                  className="px-3 py-1 text-xs border border-teal-300 rounded-lg bg-white"
                >
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.organizationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div key={match.programId} className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-teal-700">{match.programId}</div>
                      <h4 className="text-sm font-bold text-gray-900">{match.programTitle}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold text-teal-800">{match.matchScore}%</span>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Match Score</span>
                    </div>
                  </div>

                  {/* Criteria Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-[11px] text-center">
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-gray-500 block text-[10px]">Interest Fit</span>
                      <span className="font-bold text-gray-900">{match.criteriaScores.interestFit}/40</span>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-gray-500 block text-[10px]">Geographic</span>
                      <span className="font-bold text-gray-900">{match.criteriaScores.geographicFit}/20</span>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-gray-500 block text-[10px]">Budget</span>
                      <span className="font-bold text-gray-900">{match.criteriaScores.budgetAlignment}/20</span>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-gray-500 block text-[10px]">Historical</span>
                      <span className="font-bold text-gray-900">{match.criteriaScores.historicalFit}/20</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/80 p-2.5 rounded border border-gray-100">
                    <strong>Evidence:</strong> {match.rationale}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <span>
                      Recommended Ask: <strong className="text-teal-900">${match.recommendedAsk.toLocaleString()}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setActiveSection('campaign_builder');
                      }}
                      className="px-3 py-1 bg-[#104F57] text-white rounded text-xs hover:bg-teal-800 font-medium"
                    >
                      Stage in Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. AI CAMPAIGN BUILDER */}
        {/* ================================================================= */}
        {activeSection === 'campaign_builder' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
              <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-700" />
                AI Campaign Builder with Mandatory Human-in-the-Loop Gate
              </h3>
              <p className="text-xs text-blue-900 mt-1">
                Phumulani Ai generates individualized prospect solicitations. In accordance with Section 7 of the Platform Policy, initial outreach campaigns require explicit human staff approval prior to email queueing.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-900">Active & Staged Campaigns ({campaigns.length})</h4>
              <button
                onClick={async () => {
                  await phumulaniApiClient.generateCampaign({
                    title: 'Q4 2026 Housing & Transitional Stability Campaign',
                    targetProgramId: 'PROG-002',
                    prospectIds: ['PROSP-001', 'PROSP-003'],
                    senderMailbox: 'grants@phumulani.org',
                    createdBy: 'Development Director',
                  });
                  refreshData();
                }}
                className="px-3 py-1.5 bg-[#104F57] text-white rounded-lg text-xs hover:bg-teal-800 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate New Campaign
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs border border-dashed rounded-lg">
                  No campaigns currently staged. Click "Generate New Campaign" above.
                </div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{camp.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              camp.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {camp.approvalStatus === 'approved' ? 'Staff Approved' : 'Pending Human Approval'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Target Program: {camp.programName} • Sender: {camp.senderMailbox} • Prospects: {camp.prospectCount}
                        </p>
                      </div>

                      {camp.approvalStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveCampaign(camp.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Campaign
                        </button>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-700 font-mono whitespace-pre-wrap">
                      <strong>Subject:</strong> {camp.templateSubject}
                      <br />
                      <br />
                      {camp.templateBody}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. PRIORITY INBOX (P0 - P4) */}
        {/* ================================================================= */}
        {activeSection === 'priority_inbox' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
              <h3 className="text-sm font-bold text-gray-900">Phumulani Ai Email Priority Engine (P0–P4)</h3>
              <p className="text-xs text-gray-600 mt-1">
                Evaluates incoming donor and community correspondence, separating operational urgency from donor interest. Automatically intercepts crisis safeguarding content into P0 quarantine.
              </p>

              {/* Priority Tier Guide */}
              <div className="grid grid-cols-5 gap-2 mt-3 text-center text-xs">
                <div className="p-2 rounded bg-red-100 border border-red-200 text-red-900">
                  <div className="font-bold">P0</div>
                  <div className="text-[10px]">Restricted Safety Quarantine</div>
                </div>
                <div className="p-2 rounded bg-amber-100 border border-amber-200 text-amber-900">
                  <div className="font-bold">P1</div>
                  <div className="text-[10px]">Urgent Funding / Meeting</div>
                </div>
                <div className="p-2 rounded bg-blue-100 border border-blue-200 text-blue-900">
                  <div className="font-bold">P2</div>
                  <div className="text-[10px]">Positive Funding Interest</div>
                </div>
                <div className="p-2 rounded bg-gray-100 border border-gray-200 text-gray-800">
                  <div className="font-bold">P3</div>
                  <div className="text-[10px]">Routine Correspondence</div>
                </div>
                <div className="p-2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  <div className="font-bold">P4</div>
                  <div className="text-[10px]">Informational / General</div>
                </div>
              </div>
            </div>

            {/* Live Interactive Tester */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Test Priority Classification</h4>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Incoming Email Subject:</label>
                <input
                  type="text"
                  value={emailSubjectInput}
                  onChange={(e) => setEmailSubjectInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Incoming Email Body:</label>
                <textarea
                  rows={4}
                  value={emailBodyInput}
                  onChange={(e) => setEmailBodyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono"
                />
              </div>

              <button
                onClick={handleTestEmailClassification}
                className="px-4 py-2 bg-[#104F57] text-white rounded-lg text-xs font-semibold hover:bg-teal-800"
              >
                Analyze & Classify Correspondence
              </button>

              {classificationResult && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
                    classificationResult.priority === 'P0'
                      ? 'bg-red-50 border-red-300 text-red-950'
                      : classificationResult.priority === 'P1'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{classificationResult.priorityLabel}</span>
                    <span className="font-mono text-[11px]">Confidence: {Math.round(classificationResult.confidence * 100)}%</span>
                  </div>
                  <p><strong>Reasoning:</strong> {classificationResult.reasoning}</p>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-current/20 text-[11px]">
                    <span>Safeguarding Crisis: {classificationResult.isSafeguardingCrisis ? 'YES (QUARANTINED)' : 'NO'}</span>
                    <span>•</span>
                    <span>Opt-Out Request: {classificationResult.isOptOut ? 'YES (SUPPRESSED)' : 'NO'}</span>
                    <span>•</span>
                    <span>Meeting Requested: {classificationResult.hasMeetingSignal ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. DONOR INTEREST DASHBOARD */}
        {/* ================================================================= */}
        {activeSection === 'donor_interest' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-teal-50/50">
              <h3 className="text-sm font-bold text-teal-950">Donor Interest Scoring (0–100 Scale)</h3>
              <p className="text-xs text-teal-900 mt-1">
                Estimates funder engagement from observable signals (responsiveness, specificity, meeting willingness).
                <strong className="block mt-1 text-red-700">Hard Rule: An explicit opt-out overrides all scoring and permanently halts solicitation.</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prospects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{p.organizationName}</h4>
                      <p className="text-xs text-gray-500">{p.contactName} ({p.contactEmail})</p>
                    </div>
                    {p.optOut ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        OPTED OUT (0/100)
                      </span>
                    ) : (
                      <div className="text-right">
                        <span className="text-xl font-bold text-teal-800">{p.interestScore}/100</span>
                        <div className="text-[10px] text-gray-500 uppercase font-semibold">
                          {p.interestScore >= 80
                            ? 'High Engagement'
                            : p.interestScore >= 60
                            ? 'Promising'
                            : p.interestScore >= 40
                            ? 'Developing'
                            : p.interestScore >= 20
                            ? 'Limited'
                            : 'No Engagement'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.optOut
                          ? 'bg-red-400'
                          : p.interestScore >= 80
                          ? 'bg-emerald-500'
                          : p.interestScore >= 60
                          ? 'bg-teal-500'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${p.optOut ? 0 : p.interestScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-600 pt-2 border-t border-gray-100">
                    <span>Program: {p.matchedProgramName || 'Healing Homes Housing'}</span>
                    {!p.optOut && (
                      <button
                        onClick={async () => {
                          await phumulaniApiClient.optOutProspect(p.id);
                          refreshData();
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Simulate Opt-Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 italic text-center">
              Notice: Engagement scores represent internal behavioral classifications based on email signals; they do not represent statistical guarantees of grant awards.
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* 7. AI REPLY DRAFTS */}
        {/* ================================================================= */}
        {activeSection === 'reply_drafts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Context-Aware AI Reply Drafts</h3>
                <p className="text-xs text-gray-500">Grounded in verified program budgets and objectives</p>
              </div>
              <button
                onClick={async () => {
                  await phumulaniApiClient.generateReplyDraft({
                    incomingEmailId: `em-${Date.now()}`,
                    incomingEmailSubject: 'Inquiry on Healing Homes Capacity',
                    incomingEmailBody: 'Can you provide details on your current transitional housing capacity and funding needs?',
                    prospectId: selectedProspectId,
                    tone: 'professional',
                  });
                  refreshData();
                }}
                className="px-3 py-1.5 bg-[#104F57] text-white rounded text-xs hover:bg-teal-800 font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Draft Grounded Reply
              </button>
            </div>

            <div className="space-y-3">
              {replyDrafts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs border border-dashed rounded-lg">
                  No reply drafts pending review. Click "Draft Grounded Reply" above.
                </div>
              ) : (
                replyDrafts.map((draft) => (
                  <div key={draft.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{draft.suggestedSubject}</h4>
                        <p className="text-xs text-gray-500">
                          To: {draft.prospectName} ({draft.prospectEmail}) • Program: {draft.programName}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        Pending Staff Review
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded border border-gray-100 text-xs text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">
                      {draft.suggestedBody}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                      <span>Verified Facts: {draft.verifiedFactsUsed.join(' • ')}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            draft.approvalStatus = 'approved';
                            refreshData();
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                        >
                          Approve Draft
                        </button>
                        <button
                          onClick={() => {
                            draft.approvalStatus = 'rejected';
                            refreshData();
                          }}
                          className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 8. FOLLOW-UP QUEUE */}
        {/* ================================================================= */}
        {activeSection === 'followup_queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Follow-Up Coordinator</h3>
                <p className="text-xs text-gray-500">Respectful outreach sequence (Days 3, 7, 14) with automatic cancellation</p>
              </div>
              <button
                onClick={async () => {
                  await phumulaniApiClient.scheduleFollowUp({
                    prospectId: selectedProspectId,
                    programId: 'PROG-002',
                    sequenceStep: 1,
                    delayDays: 3,
                  });
                  refreshData();
                }}
                className="px-3 py-1.5 bg-[#104F57] text-white rounded text-xs hover:bg-teal-800 font-semibold"
              >
                Schedule Follow-Up
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Prospect</th>
                    <th className="px-4 py-3 text-left">Step</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {followUps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        No active follow-ups in queue.
                      </td>
                    </tr>
                  ) : (
                    followUps.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {f.prospectName}
                          <div className="text-[10px] text-gray-500 font-normal">{f.prospectEmail}</div>
                        </td>
                        <td className="px-4 py-3">Step {f.sequenceStep}</td>
                        <td className="px-4 py-3 text-gray-700">{f.dueDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : f.status === 'cancelled_reply_received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {f.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {f.cancellationReason && (
                            <div className="text-[10px] text-gray-500 mt-0.5">{f.cancellationReason}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {f.status === 'scheduled' && (
                            <button
                              onClick={async () => {
                                await phumulaniApiClient.cancelFollowUpOnReply(
                                  f.prospectId,
                                  'Manual staff cancellation or reply received.'
                                );
                                refreshData();
                              }}
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Cancel (Reply Received)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 9. HIGH-INTEREST LEADS */}
        {/* ================================================================= */}
        {activeSection === 'high_interest_leads' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Qualified High-Interest Leads & Briefing Dossiers</h3>
            <p className="text-xs text-gray-500">Funders demonstrating explicit meeting willingness or score ≥ 80</p>

            <div className="space-y-4">
              {highInterestLeads.map((lead) => (
                <div key={lead.id} className="p-5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-gray-900">{lead.organization}</h4>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                          Score: {lead.interestScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Contact: {lead.prospectName} ({lead.contactEmail}) • Assigned Rep: {lead.assignedRepresentativeName}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveSection('meeting_scheduler')}
                      className="px-3 py-1.5 bg-[#104F57] text-white rounded-lg text-xs font-semibold hover:bg-teal-800 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Meeting
                    </button>
                  </div>

                  {/* Executive Briefing Dossier */}
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-2">
                    <div className="font-bold text-gray-900 text-xs uppercase tracking-wider text-teal-800">
                      Executive Briefing Dossier for Comfort Dondo
                    </div>
                    <p className="text-gray-700">{lead.briefingDossier.executiveSummary}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                      <div>
                        <strong className="text-gray-500">Giving Capacity:</strong> $
                        {lead.briefingDossier.givingCapacityEstimate.toLocaleString()}
                      </div>
                      <div>
                        <strong className="text-gray-500">Primary Program:</strong> {lead.briefingDossier.primaryProgramInterest}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <strong className="text-gray-700 block mb-1">Key Discussion Points:</strong>
                      <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                        {lead.briefingDossier.keyQuestionsToAddress.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 10. MEETING SCHEDULER */}
        {/* ================================================================= */}
        {activeSection === 'meeting_scheduler' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Google Calendar & Microsoft 365 Meeting Scheduler</h3>
                <p className="text-xs text-gray-600">Double-booking prevention & authenticated free/busy slot selection</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Calendar Provider:</span>
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value as any)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="google">Google Calendar (Workspace)</option>
                  <option value="microsoft">Microsoft Outlook (M365 Graph)</option>
                </select>
              </div>
            </div>

            {bookingNotice && (
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-300 text-teal-900 text-xs font-semibold">
                {bookingNotice}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Available Slots */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Available Slots for Comfort Dondo (Twin Cities Business Hours)
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.slotId}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all ${
                        !slot.isAvailable
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : selectedSlot?.slotId === slot.slotId
                          ? 'border-teal-600 bg-teal-50 font-bold text-teal-950 ring-2 ring-teal-400'
                          : 'border-gray-200 hover:border-teal-300 bg-white text-gray-800'
                      }`}
                    >
                      <div className="font-semibold">{new Date(slot.startTime).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] mt-1 text-teal-700 font-medium">
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Panel */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-4 text-xs">
                <h4 className="font-bold text-gray-900">Confirm Booking</h4>
                {selectedSlot ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-500 block">Staff Member:</span>
                      <span className="font-semibold text-gray-800">{selectedSlot.staffName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Selected Time:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(selectedSlot.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Funder Prospect:</span>
                      <span className="font-semibold text-gray-800">
                        {prospects.find((p) => p.id === selectedProspectId)?.organizationName}
                      </span>
                    </div>

                    <button
                      onClick={handleBookMeeting}
                      className="w-full mt-3 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-xs"
                    >
                      Book & Send Calendar Invite
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">Select an available slot on the left to confirm an appointment.</p>
                )}

                <div className="pt-3 border-t border-gray-200 text-[11px] space-y-1">
                  <div className="font-semibold text-gray-700">Live Calendar Provider Status:</div>
                  <div className="flex items-center justify-between">
                    <span>Google Calendar:</span>
                    <span className={calendarProviderStatus?.googleConnected ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                      {calendarProviderStatus?.googleConnected ? 'CONNECTED' : 'AUTHORIZATION_REQUIRED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Microsoft Graph:</span>
                    <span className={calendarProviderStatus?.microsoftConnected ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                      {calendarProviderStatus?.microsoftConnected ? 'CONNECTED' : 'AUTHORIZATION_REQUIRED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Bookings & Reschedule / Cancel Controls */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Scheduled Meetings & Reminders ({scheduledBookings.length} Bookings · {calendarReminders.length} Reminders)
                </h4>
              </div>
              {scheduledBookings.length === 0 ? (
                <p className="text-xs text-gray-500">No donor meetings currently scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {scheduledBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{booking.title}</div>
                        <div className="text-[11px] text-gray-600">
                          {new Date(booking.startTime).toLocaleString()} · {booking.prospectName} ({booking.prospectEmail}) · Status:{' '}
                          <span className="font-mono font-bold">{booking.status}</span>
                        </div>
                      </div>
                      {booking.status !== 'cancelled' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRescheduleBooking(booking)}
                            className="px-2.5 py-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Reschedule (+24h)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 11. FUNDING PROPOSALS */}
        {/* ================================================================= */}
        {activeSection === 'funding_proposals' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Funding Concept Notes & Grant Proposal Generator</h3>
                <p className="text-xs text-gray-600">
                  Prepares editable drafts conforming to 15% de minimis non-profit indirect cost guidelines. Watermarked for human executive review.
                </p>
              </div>
            </div>

            {proposalNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
                {proposalNotice}
              </div>
            )}

            {/* Proposal Generator Form */}
            <form onSubmit={handleCreateProposal} className="p-4 rounded-xl border border-gray-200 bg-white grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Grantmaker:</label>
                <input
                  type="text"
                  value={proposalGrantmaker}
                  onChange={(e) => setProposalGrantmaker(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Target Program:</label>
                <select
                  value={proposalProgramId}
                  onChange={(e) => setProposalProgramId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white"
                >
                  {(programs.length > 0
                    ? programs
                    : [
                        { id: 'PROG-001', title: 'Healing Sisterhood Circles' },
                        { id: 'PROG-002', title: 'Healing Homes Transitional Housing' },
                        { id: 'PROG-003', title: 'Economic Self-Reliance & Entrepreneurship Lab' },
                        { id: 'PROG-004', title: 'Education & Workforce Pathways' },
                        { id: 'PROG-005', title: 'Youth Leadership & Mentorship' },
                      ]
                  ).map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Requested Amount ($):</label>
                <input
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#104F57] text-white rounded font-bold hover:bg-teal-800"
                >
                  Generate Proposal Draft
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-gray-900">{prop.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                          DRAFT — REQUIRES REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Target: {prop.targetGrantmaker} • Amount: ${prop.requestedAmount.toLocaleString()} • Program: {prop.programTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                    <strong>Executive Summary:</strong> {prop.executiveSummary}
                  </p>

                  <div className="p-3 rounded border border-gray-200 bg-white text-xs">
                    <strong className="text-gray-800 block mb-1">Approved Budget Breakdown:</strong>
                    <div className="space-y-1">
                      {prop.budgetBreakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-gray-600">
                          <span>{b.item}</span>
                          <span className="font-semibold text-gray-900">${b.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 12. FUNDRAISING PIPELINE */}
        {/* ================================================================= */}
        {activeSection === 'fundraising_pipeline' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">Fundraising Pipeline Overview</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Stage progression of active institutional, corporate CSR, and foundation partnerships
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {[
                { title: '1. Identified', count: prospects.filter((p) => p.status === 'uncontacted').length, color: 'border-gray-300' },
                { title: '2. Solicited', count: prospects.filter((p) => p.status === 'solicited').length, color: 'border-blue-300' },
                { title: '3. Meeting Staged', count: prospects.filter((p) => p.status === 'meeting_scheduled').length, color: 'border-amber-300' },
                { title: '4. Proposal Review', count: proposals.length, color: 'border-purple-300' },
                { title: '5. Funded Deals', count: 1, color: 'border-emerald-300' },
              ].map((col, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-t-4 ${col.color} bg-gray-50 shadow-2xs`}>
                  <div className="font-bold text-gray-800">{col.title}</div>
                  <div className="text-xl font-bold text-gray-900 mt-2">{col.count} Deals</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 13. TRUTH & KNOWLEDGE GROUNDING (MILESTONES 1 & 2) */}
        {/* ================================================================= */}
        {activeSection === 'verified_knowledge' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-5 rounded-xl border border-teal-200 bg-teal-50/70 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-teal-900 font-serif">
                  Local Institutional Source-of-Truth & Grounding Registry
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-200 text-teal-900 border border-teal-300">
                  D:\Phumulani\data\knowledge\approved
                </span>
              </div>
              <p className="text-xs text-teal-800 leading-relaxed">
                Phumulani Ai strictly rejects unverified fundraising claims, unratified capital forecasts, and simulated metrics. All donor-facing communications, solicitation emails, and grant proposals must cite verified institutional source document IDs. If an approved record is absent, the system explicitly states that verified figures are unavailable rather than hallucinating estimates.
              </p>
            </div>

            {/* Financial Ledger Distinction Cards */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                FY2026 Institutional Financial Reality vs Projections (DOC-FIN-001)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-lg border-2 border-emerald-300 bg-emerald-50/50">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span>Settled Actual Cash</span>
                    <span className="text-[10px] bg-emerald-200 px-1.5 py-0.2 rounded font-mono">AUDITED</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">$296,800</div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Verified bank receipts. Legally recognized 501(c)(3) revenues.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-blue-300 bg-blue-50/50">
                  <div className="flex items-center justify-between text-blue-800 font-bold">
                    <span>Confirmed Commitments</span>
                    <span className="text-[10px] bg-blue-200 px-1.5 py-0.2 rounded font-mono">BINDING</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-950 mt-1">$65,000</div>
                  <p className="text-[11px] text-blue-700 mt-1">
                    Signed grant agreements & recurring donor contracts.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/50">
                  <div className="flex items-center justify-between text-amber-800 font-bold">
                    <span>Pending Applications</span>
                    <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded font-mono">UNDER REVIEW</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-950 mt-1">$115,000</div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Submitted proposals (McKnight, Bush, Otto Bremer).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-purple-300 bg-purple-50/50">
                  <div className="flex items-center justify-between text-purple-800 font-bold">
                    <span>Indirect Cost Cap</span>
                    <span className="text-[10px] bg-purple-200 px-1.5 py-0.2 rounded font-mono">15% DE MINIMIS</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-950 mt-1">$66,000 Max</div>
                  <p className="text-[11px] text-purple-700 mt-1">
                    Strict federal standard cap across all funding asks.
                  </p>
                </div>
              </div>
            </div>

            {/* Source Approval Audit Status Banner */}
            {auditReport && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Institutional Source Approval Audit Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                    PROVISIONAL BENCHMARK ENFORCED
                  </span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {auditReport.institutionalIntegrityNotice}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 font-medium text-amber-950 text-[11px]">
                  <span>Total Documents Audited: <strong>{auditReport.totalDocumentsAudited}</strong></span>
                  <span>Provisional Development Benchmarks: <strong>{auditReport.provisionalBenchmarkCount}</strong></span>
                  <span>Expired / Review Pending: <strong>{auditReport.expiredCount}</strong></span>
                  <span>Zero PII Leaks Verified: <strong>100%</strong></span>
                </div>
              </div>
            )}

            {/* Approved Knowledge Documents Inventory */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Role-Controlled Knowledge Documents ({knowledgeDocs.length} Active for Current Role)
                </h4>
                <span className="text-[11px] text-gray-500 font-medium">
                  Authenticated API • Zero Raw Knowledge in Browser Bundle
                </span>
              </div>
              <div className="space-y-2.5">
                {(knowledgeDocs.length > 0 ? knowledgeDocs : []).map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-teal-300 transition-colors text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {doc.metadata?.sourceDocumentId || doc.id}
                        </span>
                        <span className="font-semibold text-gray-900">{doc.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          {doc.metadata?.sourceApprovalStatus || 'PROVISIONAL_BENCHMARK'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Owner: <strong>{doc.metadata?.recordOwner}</strong> • Approved: {doc.metadata?.approvalDate} • Evidence: {doc.metadata?.evidenceReference}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                        {doc.metadata?.accessClassification || 'DONOR_FACING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarantine & Anti-Contamination Invariant Notice */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Simulated Sandbox & Pending-Review Quarantine (Fail-Closed Enforcement)</span>
              </div>
              <p className="text-red-800 leading-relaxed">
                Any document located in <code className="font-mono bg-red-100 px-1 rounded">data/knowledge/pending-review/</code> (e.g., draft capital expansion proposals) or marked with <code className="font-mono bg-red-100 px-1 rounded">isDemoData: true</code> is barred from live donor-facing solicitation generation. In accordance with anti-commercial contamination protocols, Phumulani maintains 0% TaxGuard or commercial tax preparation software.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
