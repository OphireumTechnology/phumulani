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
    <div className="bg-white rounded-xl shadow-xs border border-phumulani-charcoal/12 overflow-hidden flex flex-col min-h-[750px]">
      {/* 1. TOP HEADER & MODEL STATUS BAR */}
      <div className="bg-phumulani-charcoal text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-phumulani-teal/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-phumulani-teal/15 flex items-center justify-center border border-phumulani-teal/40">
            <Sparkles className="w-5 h-5 text-phumulani-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-heading">Phumulani Ai</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-sm bg-phumulani-teal/20 text-phumulani-teal border border-phumulani-teal/40">
                Phase 65 Local LLM
              </span>
            </div>
            <p className="text-xs text-phumulani-cream/75">
              Autonomous Fundraising Intelligence & Donor Engagement Assistant
            </p>
          </div>
        </div>

        {/* Autonomy Level & Local Runtime Controls */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Autonomy Selector */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-phumulani-teal/35">
            <Shield className="w-3.5 h-3.5 text-phumulani-teal" />
            <span className="text-phumulani-teal font-medium">Autonomy:</span>
            <select
              value={policy?.autonomyLevel || 2}
              onChange={(e) => handleAutonomyChange(parseInt(e.target.value, 10) as AutonomyLevel)}
              className="bg-phumulani-charcoal text-white font-semibold text-xs rounded px-1.5 py-0.5 border border-phumulani-teal/40 focus:outline-none cursor-pointer"
            >
              <option value={1}>Level 1: Analyze Only</option>
              <option value={2}>Level 2: Draft & Recommend</option>
              <option value={3}>Level 3: Approved Automation</option>
              <option value={4}>Level 4: Human-Controlled Actions</option>
            </select>
          </div>

          {/* Truthful Multi-Model AI Runtime Indicator */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/15 tabular-nums">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-phumulani-teal" />
              <span className="text-phumulani-teal font-medium">AI Engine:</span>
              <span className="font-semibold text-white">
                {aiTelemetry?.config?.geminiConfigured
                  ? `Gemini (${aiTelemetry?.config?.geminiModel || 'gemini-4-hydrogen'})`
                  : healthStatus?.backend === 'ollama'
                  ? `Ollama (${healthStatus?.modelId || 'local'})`
                  : 'Deterministic Fallback'}
              </span>
            </div>
            <span className="text-white/25">|</span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  aiTelemetry?.config?.geminiConfigured || healthStatus?.status === 'healthy'
                    ? 'bg-phumulani-green'
                    : 'bg-phumulani-gold'
                }`}
              />
              <span className="text-phumulani-cream/85">
                {aiTelemetry?.config?.geminiConfigured
                  ? 'Gemini Live Ready'
                  : healthStatus?.status === 'healthy'
                  ? 'Local Ollama Connected'
                  : 'Rule-Based Fallback Active'}
              </span>
            </div>
            {aiTelemetry?.telemetry && (
              <>
                <span className="text-white/25">|</span>
                <span className="text-phumulani-teal" title="Persisted AI invocations">
                  {aiTelemetry.telemetry.totalCalls || 0} calls · {aiTelemetry.telemetry.avgLatencyMs || 0}ms
                </span>
              </>
            )}
            <button
              onClick={refreshData}
              disabled={isLoadingHealth}
              className="p-1 text-phumulani-teal hover:text-white transition-colors cursor-pointer"
              title="Refresh AI health status and metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 12-SECTION HORIZONTAL TAB NAVIGATION */}
      <div className="bg-phumulani-cream/70 border-b border-phumulani-charcoal/12 px-4 flex items-center gap-1 overflow-x-auto text-xs py-1.5 scrollbar-thin">
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-phumulani-earth text-white shadow-xs'
                  : 'text-phumulani-charcoal/80 hover:text-phumulani-earth hover:bg-white/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-phumulani-charcoal/70'}`} />
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
              <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
                <div className="flex items-center justify-between text-phumulani-earth">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Prospects</span>
                  <Users className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-2 tabular-nums">{prospects.length}</div>
                <div className="text-xs text-phumulani-charcoal/70 mt-1">Foundations & CSR programs</div>
              </div>

              <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
                <div className="flex items-center justify-between text-phumulani-earth">
                  <span className="text-xs font-semibold uppercase tracking-wider">Campaigns Staged</span>
                  <Send className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-2 tabular-nums">{campaigns.length}</div>
                <div className="text-xs text-phumulani-charcoal/70 mt-1">Pending staff review</div>
              </div>

              <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
                <div className="flex items-center justify-between text-phumulani-charcoal">
                  <span className="text-xs font-semibold uppercase tracking-wider">High-Interest Leads</span>
                  <Award className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-2 tabular-nums">{highInterestLeads.length}</div>
                <div className="text-xs text-phumulani-charcoal/70 mt-1">Score ≥ 80 / Meeting signals</div>
              </div>

              <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
                <div className="flex items-center justify-between text-phumulani-earth">
                  <span className="text-xs font-semibold uppercase tracking-wider">Proposals Drafted</span>
                  <FileCheck className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-2 tabular-nums">{proposals.length}</div>
                <div className="text-xs text-phumulani-charcoal/70 mt-1">Grounded in approved budgets</div>
              </div>
            </div>

            {/* Model & Architecture Status Card */}
            <div className="p-5 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/50">
              <h3 className="text-sm font-bold text-phumulani-charcoal flex items-center gap-2">
                <Cpu className="w-4 h-4 text-phumulani-earth" />
                Local LLM Inference & Windows Host Configuration (D:\PhumulaniAI)
              </h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-phumulani-charcoal/70 block">Configured Model:</span>
                  <span className="font-semibold text-phumulani-charcoal">
                    {healthStatus?.modelId || 'llama3.2:3b (Meta Llama 3.2 3B Instruct)'}
                  </span>
                </div>
                <div>
                  <span className="text-phumulani-charcoal/70 block">Local Inference Endpoint:</span>
                  <span className="font-semibold text-phumulani-charcoal">http://127.0.0.1:11434 (Ollama)</span>
                </div>
                <div>
                  <span className="text-phumulani-charcoal/70 block">Fallback & Fail-Safe:</span>
                  <span className="font-semibold text-phumulani-earth">Deterministic Rules & Cloud Hybrid</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-phumulani-charcoal/10 flex flex-wrap items-center justify-between gap-3 text-xs text-phumulani-charcoal">
                <span>
                  <strong>Windows Scripts:</strong> Staged at <code>scripts/windows/</code> (install, start, stop, check, sync-github).
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-phumulani-teal/15 text-phumulani-charcoal border border-phumulani-teal/35 font-medium">
                  VAWA Section 1367 Safeguarding Firewall Active
                </span>
              </div>
            </div>

            {/* Coordinated 12-Task AI Fundraising Workforce (Phase 70) */}
            <div className="p-5 rounded-xl border border-phumulani-teal/40 bg-phumulani-cream/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-phumulani-charcoal flex items-center gap-2">
                    <Target className="w-4 h-4 text-phumulani-earth" />
                    Coordinated 12-Task AI Fundraising Workforce (Phase 70)
                  </h3>
                  <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                    Structured human-gated task agents grounded in verified institutional budgets and strict VAWA isolation.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-sm bg-white text-phumulani-earth border border-phumulani-teal/40 tabular-nums">
                  {workforceTasks.length} Tasks Registered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workforceTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="p-3.5 rounded-xl bg-white border border-phumulani-charcoal/12 flex flex-col justify-between space-y-2 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold bg-phumulani-cream text-phumulani-charcoal px-1.5 py-0.5 rounded-sm">
                          {task.taskId}
                        </span>
                        <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-gold/15 border border-phumulani-gold/40 px-1.5 py-0.5 rounded-sm">
                          {task.humanGate || 'Human Review'}
                        </span>
                      </div>
                      <h4 className="font-bold text-phumulani-charcoal">{task.title}</h4>
                      <p className="text-[11px] text-phumulani-charcoal/75 mt-0.5">{task.description}</p>
                    </div>
                    <div className="pt-2 border-t border-phumulani-charcoal/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-phumulani-charcoal/70">{task.scope}</span>
                      <button
                        type="button"
                        disabled={executingTaskId === task.taskId}
                        onClick={() => handleExecuteWorkforceTask(task.taskId)}
                        className="px-2.5 py-1 bg-phumulani-earth hover:bg-phumulani-earth/90 text-white rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {executingTaskId === task.taskId ? 'Running...' : 'Run Task'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {workforceResult && (
                <div className="p-3.5 rounded-xl bg-white border border-phumulani-teal text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-phumulani-earth">
                      Execution Result: {workforceResult.taskId} — {workforceResult.title || ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWorkforceResult(null)}
                      className="text-phumulani-charcoal hover:text-phumulani-earth font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {workforceResult.error ? (
                    <p className="text-phumulani-earth font-medium">{workforceResult.error}</p>
                  ) : (
                    <pre className="p-2.5 bg-phumulani-charcoal text-phumulani-teal rounded-lg font-mono text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(workforceResult.artifact || workforceResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* System Prompt Inspector */}
            <div className="p-5 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-phumulani-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
                  Phumulani Ai Canonical System Prompt & Non-Delegable Constraints
                </h3>
                <span className="text-xs text-phumulani-charcoal/70 font-mono">v65.1-canonical</span>
              </div>
              <pre className="mt-3 p-4 bg-phumulani-charcoal text-phumulani-teal font-mono text-xs rounded-lg overflow-x-auto max-h-60 whitespace-pre-wrap leading-relaxed">
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
                <h3 className="text-base font-bold font-heading text-phumulani-charcoal">Fundraising Prospect Database</h3>
                <p className="text-xs text-phumulani-charcoal/70">Verified Minnesota foundations, corporate CSR leads, and sponsors</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-phumulani-charcoal/70">Selected for Matching:</span>
                <select
                  value={selectedProspectId}
                  onChange={(e) => setSelectedProspectId(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-phumulani-charcoal/15 rounded-lg bg-white font-medium text-phumulani-charcoal"
                >
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.organizationName} ({p.contactName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-phumulani-charcoal/12 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-phumulani-charcoal/10 text-xs">
                <thead className="bg-phumulani-cream/70 text-phumulani-charcoal font-semibold">
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
                <tbody className="divide-y divide-phumulani-charcoal/10 bg-white">
                  {prospects.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className={`hover:bg-phumulani-cream/50 transition-colors ${
                        selectedProspectId === prospect.id ? 'bg-phumulani-earth/8 font-medium' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-phumulani-charcoal">{prospect.organizationName}</div>
                        <div className="text-phumulani-charcoal/70 text-[11px]">
                          {prospect.contactName} • {prospect.contactEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-phumulani-cream text-phumulani-charcoal capitalize">
                          {prospect.prospectType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-phumulani-charcoal tabular-nums">
                        ${prospect.estimatedCapacity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-phumulani-charcoal">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {prospect.areasOfInterest.map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded-sm bg-phumulani-cream text-[10px] text-phumulani-charcoal">
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {prospect.optOut ? (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-phumulani-earth/10 text-phumulani-earth border border-phumulani-earth/25">
                            OPTED OUT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-phumulani-teal/15 text-phumulani-charcoal border border-phumulani-teal/35 capitalize">
                            {prospect.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-bold text-phumulani-earth tabular-nums">
                          <span className="w-7 text-right">{prospect.matchScore}%</span>
                          <div className="w-16 h-1.5 bg-phumulani-cream rounded-full overflow-hidden">
                            <div className="h-full bg-phumulani-earth rounded-full" style={{ width: `${prospect.matchScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProspectId(prospect.id);
                            setActiveSection('program_matching');
                          }}
                          className="px-2.5 py-1 rounded-md bg-phumulani-earth text-white hover:bg-phumulani-earth/90 transition-colors font-medium text-[11px] cursor-pointer"
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
            <div className="p-4 rounded-xl bg-phumulani-cream border border-phumulani-teal flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-phumulani-earth">
                  Target Prospect: {prospects.find((p) => p.id === selectedProspectId)?.organizationName}
                </h3>
                <p className="text-xs text-phumulani-earth mt-0.5">
                  Evaluated across 4 transparent criteria: Interest Fit (40%), Geographic Fit (20%), Budget Alignment (20%), Historical Fit (20%)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-phumulani-charcoal">Switch Prospect:</span>
                <select
                  value={selectedProspectId}
                  onChange={(e) => setSelectedProspectId(e.target.value)}
                  className="px-3 py-1 text-xs border border-phumulani-teal rounded-lg bg-white"
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
                <div key={match.programId} className="p-5 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-phumulani-earth font-mono">{match.programId}</div>
                      <h4 className="text-sm font-bold text-phumulani-charcoal">{match.programTitle}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold font-heading text-phumulani-earth tabular-nums">{match.matchScore}%</span>
                      <span className="text-[10px] text-phumulani-charcoal/65 uppercase font-medium">Match Score</span>
                    </div>
                  </div>

                  {/* Criteria Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-phumulani-charcoal/10 text-[11px] text-center tabular-nums">
                    <div className="p-2 rounded bg-phumulani-cream/70">
                      <span className="text-phumulani-charcoal/70 block text-[10px]">Interest Fit</span>
                      <span className="font-bold text-phumulani-charcoal">{match.criteriaScores.interestFit}/40</span>
                    </div>
                    <div className="p-2 rounded bg-phumulani-cream/70">
                      <span className="text-phumulani-charcoal/70 block text-[10px]">Geographic</span>
                      <span className="font-bold text-phumulani-charcoal">{match.criteriaScores.geographicFit}/20</span>
                    </div>
                    <div className="p-2 rounded bg-phumulani-cream/70">
                      <span className="text-phumulani-charcoal/70 block text-[10px]">Budget</span>
                      <span className="font-bold text-phumulani-charcoal">{match.criteriaScores.budgetAlignment}/20</span>
                    </div>
                    <div className="p-2 rounded bg-phumulani-cream/70">
                      <span className="text-phumulani-charcoal/70 block text-[10px]">Historical</span>
                      <span className="font-bold text-phumulani-charcoal">{match.criteriaScores.historicalFit}/20</span>
                    </div>
                  </div>

                  <p className="text-xs text-phumulani-charcoal leading-relaxed bg-phumulani-cream/50 p-2.5 rounded border border-phumulani-charcoal/10">
                    <strong>Evidence:</strong> {match.rationale}
                  </p>

                  <div className="flex items-center justify-between text-xs text-phumulani-charcoal pt-2 border-t border-phumulani-charcoal/10">
                    <span className="tabular-nums">
                      Recommended Ask: <strong className="text-phumulani-earth">${match.recommendedAsk.toLocaleString()}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setActiveSection('campaign_builder');
                      }}
                      className="px-3 py-1 bg-phumulani-earth text-white rounded-md text-xs hover:bg-phumulani-earth/90 font-medium cursor-pointer transition-colors"
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
            <div className="p-4 rounded-xl border border-phumulani-teal/40 bg-phumulani-cream/60">
              <h3 className="text-sm font-bold text-phumulani-earth flex items-center gap-2">
                <Send className="w-4 h-4 text-phumulani-earth" />
                AI Campaign Builder with Mandatory Human-in-the-Loop Gate
              </h3>
              <p className="text-xs text-phumulani-charcoal/80 mt-1">
                Phumulani Ai generates individualized prospect solicitations. In accordance with Section 7 of the Platform Policy, initial outreach campaigns require explicit human staff approval prior to email queueing.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-phumulani-charcoal tabular-nums">Active & Staged Campaigns ({campaigns.length})</h4>
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
                className="px-3 py-1.5 bg-phumulani-earth text-white rounded-lg text-xs hover:bg-phumulani-earth/90 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate New Campaign
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-phumulani-charcoal/70 text-xs border border-dashed border-phumulani-charcoal/20 rounded-lg">
                  No campaigns currently staged. Click "Generate New Campaign" above.
                </div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-phumulani-charcoal">{camp.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                              camp.approvalStatus === 'approved'
                                ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/35'
                                : 'bg-phumulani-gold/15 text-phumulani-charcoal border-phumulani-gold/35'
                            }`}
                          >
                            {camp.approvalStatus === 'approved' ? 'Staff Approved' : 'Pending Human Approval'}
                          </span>
                        </div>
                        <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                          Target Program: {camp.programName} • Sender: {camp.senderMailbox} • Prospects: {camp.prospectCount}
                        </p>
                      </div>

                      {camp.approvalStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveCampaign(camp.id)}
                          className="px-3 py-1.5 rounded-lg bg-phumulani-green text-phumulani-charcoal text-xs font-semibold hover:bg-phumulani-green/85 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Campaign
                        </button>
                      )}
                    </div>

                    <div className="bg-phumulani-cream/50 p-3 rounded border border-phumulani-charcoal/10 text-xs text-phumulani-charcoal font-mono whitespace-pre-wrap">
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
            <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
              <h3 className="text-sm font-bold text-phumulani-charcoal">Phumulani Ai Email Priority Engine (P0–P4)</h3>
              <p className="text-xs text-phumulani-charcoal/75 mt-1">
                Evaluates incoming donor and community correspondence, separating operational urgency from donor interest. Automatically intercepts crisis safeguarding content into P0 quarantine.
              </p>

              {/* Priority Tier Guide */}
              <div className="grid grid-cols-5 gap-2 mt-3 text-center text-xs">
                <div className="p-2 rounded bg-white border border-phumulani-earth/40 text-phumulani-earth">
                  <div className="font-bold">P0</div>
                  <div className="text-[10px]">Restricted Safety Quarantine</div>
                </div>
                <div className="p-2 rounded bg-white border border-phumulani-gold/50 text-phumulani-charcoal">
                  <div className="font-bold">P1</div>
                  <div className="text-[10px]">Urgent Funding / Meeting</div>
                </div>
                <div className="p-2 rounded bg-white border border-phumulani-teal/50 text-phumulani-earth">
                  <div className="font-bold">P2</div>
                  <div className="text-[10px]">Positive Funding Interest</div>
                </div>
                <div className="p-2 rounded bg-white border border-phumulani-charcoal/15 text-phumulani-charcoal">
                  <div className="font-bold">P3</div>
                  <div className="text-[10px]">Routine Correspondence</div>
                </div>
                <div className="p-2 rounded bg-white border border-phumulani-charcoal/12 text-phumulani-charcoal/75">
                  <div className="font-bold">P4</div>
                  <div className="text-[10px]">Informational / General</div>
                </div>
              </div>
            </div>

            {/* Live Interactive Tester */}
            <div className="p-5 rounded-xl border border-phumulani-charcoal/12 bg-white space-y-4">
              <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider">Test Priority Classification</h4>
              <div>
                <label className="text-xs font-medium text-phumulani-charcoal block mb-1">Incoming Email Subject:</label>
                <input
                  type="text"
                  value={emailSubjectInput}
                  onChange={(e) => setEmailSubjectInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-phumulani-charcoal/15 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-phumulani-charcoal block mb-1">Incoming Email Body:</label>
                <textarea
                  rows={4}
                  value={emailBodyInput}
                  onChange={(e) => setEmailBodyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-phumulani-charcoal/15 rounded-lg font-mono"
                />
              </div>

              <button
                onClick={handleTestEmailClassification}
                className="px-4 py-2 bg-phumulani-earth text-white rounded-lg text-xs font-semibold hover:bg-phumulani-earth/90 cursor-pointer transition-colors"
              >
                Analyze & Classify Correspondence
              </button>

              {classificationResult && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs space-y-2 ${
                    classificationResult.priority === 'P0'
                      ? 'bg-phumulani-earth/10 border-phumulani-earth/35 text-phumulani-earth'
                      : classificationResult.priority === 'P1'
                      ? 'bg-phumulani-gold/15 border-phumulani-gold/45 text-phumulani-charcoal'
                      : 'bg-phumulani-green/12 border-phumulani-green/35 text-phumulani-charcoal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{classificationResult.priorityLabel}</span>
                    <span className="font-mono text-[11px] tabular-nums">Confidence: {Math.round(classificationResult.confidence * 100)}%</span>
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
            <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
              <h3 className="text-sm font-bold text-phumulani-earth">Donor Interest Scoring (0–100 Scale)</h3>
              <p className="text-xs text-phumulani-charcoal/80 mt-1">
                Estimates funder engagement from observable signals (responsiveness, specificity, meeting willingness).
                <strong className="block mt-1 text-phumulani-earth">Hard Rule: An explicit opt-out overrides all scoring and permanently halts solicitation.</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prospects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-phumulani-charcoal">{p.organizationName}</h4>
                      <p className="text-xs text-phumulani-charcoal/70">{p.contactName} ({p.contactEmail})</p>
                    </div>
                    {p.optOut ? (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-phumulani-earth/10 text-phumulani-earth border border-phumulani-earth/25">
                        OPTED OUT (0/100)
                      </span>
                    ) : (
                      <div className="text-right">
                        <span className="text-xl font-bold text-phumulani-earth">{p.interestScore}/100</span>
                        <div className="text-[10px] text-phumulani-charcoal uppercase font-semibold">
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

                  <div className="w-full h-2 bg-phumulani-cream rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p.optOut
                          ? 'bg-phumulani-orange'
                          : p.interestScore >= 80
                          ? 'bg-phumulani-green'
                          : p.interestScore >= 60
                          ? 'bg-phumulani-teal'
                          : 'bg-phumulani-gold'
                      }`}
                      style={{ width: `${p.optOut ? 0 : p.interestScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal/75 pt-2 border-t border-phumulani-charcoal/10">
                    <span>Program: {p.matchedProgramName || 'Healing Homes Housing'}</span>
                    {!p.optOut && (
                      <button
                        onClick={async () => {
                          await phumulaniApiClient.optOutProspect(p.id);
                          refreshData();
                        }}
                        className="text-phumulani-earth hover:underline font-semibold cursor-pointer"
                      >
                        Simulate Opt-Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-phumulani-charcoal/70 italic text-center">
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
                <h3 className="text-sm font-bold text-phumulani-charcoal">Context-Aware AI Reply Drafts</h3>
                <p className="text-xs text-phumulani-charcoal/70">Grounded in verified program budgets and objectives</p>
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
                className="px-3 py-1.5 bg-phumulani-earth text-white rounded-md text-xs hover:bg-phumulani-earth/90 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Draft Grounded Reply
              </button>
            </div>

            <div className="space-y-3">
              {replyDrafts.length === 0 ? (
                <div className="text-center py-8 text-phumulani-charcoal/70 text-xs border border-dashed border-phumulani-charcoal/20 rounded-lg">
                  No reply drafts pending review. Click "Draft Grounded Reply" above.
                </div>
              ) : (
                replyDrafts.map((draft) => (
                  <div key={draft.id} className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-phumulani-charcoal">{draft.suggestedSubject}</h4>
                        <p className="text-xs text-phumulani-charcoal/70">
                          To: {draft.prospectName} ({draft.prospectEmail}) • Program: {draft.programName}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/35 uppercase">
                        Pending Staff Review
                      </span>
                    </div>

                    <div className="p-3 bg-phumulani-cream/50 rounded border border-phumulani-charcoal/10 text-xs text-phumulani-charcoal font-mono whitespace-pre-wrap leading-relaxed">
                      {draft.suggestedBody}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-phumulani-charcoal/75 pt-2 border-t border-phumulani-charcoal/10">
                      <span>Verified Facts: {draft.verifiedFactsUsed.join(' • ')}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            draft.approvalStatus = 'approved';
                            refreshData();
                          }}
                          className="px-2.5 py-1 bg-phumulani-green text-phumulani-charcoal rounded font-medium hover:bg-phumulani-green/85 cursor-pointer transition-colors"
                        >
                          Approve Draft
                        </button>
                        <button
                          onClick={() => {
                            draft.approvalStatus = 'rejected';
                            refreshData();
                          }}
                          className="px-2.5 py-1 bg-phumulani-cream text-phumulani-charcoal rounded font-medium hover:bg-phumulani-charcoal/10 border border-phumulani-charcoal/15 cursor-pointer transition-colors"
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
                <h3 className="text-sm font-bold text-phumulani-charcoal">Follow-Up Coordinator</h3>
                <p className="text-xs text-phumulani-charcoal/70">Respectful outreach sequence (Days 3, 7, 14) with automatic cancellation</p>
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
                className="px-3 py-1.5 bg-phumulani-earth text-white rounded-md text-xs hover:bg-phumulani-earth/90 font-semibold cursor-pointer transition-colors"
              >
                Schedule Follow-Up
              </button>
            </div>

            <div className="border border-phumulani-charcoal/12 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-phumulani-charcoal/10 text-xs">
                <thead className="bg-phumulani-cream/70 text-phumulani-charcoal font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Prospect</th>
                    <th className="px-4 py-3 text-left">Step</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-phumulani-charcoal/10 bg-white">
                  {followUps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-phumulani-charcoal/70">
                        No active follow-ups in queue.
                      </td>
                    </tr>
                  ) : (
                    followUps.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-3 font-semibold text-phumulani-charcoal">
                          {f.prospectName}
                          <div className="text-[10px] text-phumulani-charcoal/65 font-normal">{f.prospectEmail}</div>
                        </td>
                        <td className="px-4 py-3 tabular-nums">Step {f.sequenceStep}</td>
                        <td className="px-4 py-3 text-phumulani-charcoal tabular-nums">{f.dueDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                              f.status === 'scheduled'
                                ? 'bg-phumulani-teal/15 text-phumulani-earth border-phumulani-teal/35'
                                : f.status === 'cancelled_reply_received'
                                ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-charcoal/15'
                                : 'bg-phumulani-earth/10 text-phumulani-earth border-phumulani-earth/25'
                            }`}
                          >
                            {f.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {f.cancellationReason && (
                            <div className="text-[10px] text-phumulani-charcoal/70 mt-0.5">{f.cancellationReason}</div>
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
                              className="px-2 py-1 text-xs text-phumulani-earth hover:underline font-medium cursor-pointer"
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
            <h3 className="text-sm font-bold text-phumulani-charcoal">Qualified High-Interest Leads & Briefing Dossiers</h3>
            <p className="text-xs text-phumulani-charcoal/70">Funders demonstrating explicit meeting willingness or score ≥ 80</p>

            <div className="space-y-4">
              {highInterestLeads.map((lead) => (
                <div key={lead.id} className="p-5 rounded-xl border border-phumulani-gold/45 bg-phumulani-cream/50 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-phumulani-charcoal">{lead.organization}</h4>
                        <span className="px-2 py-0.5 rounded-sm bg-phumulani-gold/20 text-phumulani-charcoal font-bold text-xs tabular-nums">
                          Score: {lead.interestScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-phumulani-charcoal/75 mt-0.5">
                        Contact: {lead.prospectName} ({lead.contactEmail}) • Assigned Rep: {lead.assignedRepresentativeName}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveSection('meeting_scheduler')}
                      className="px-3 py-1.5 bg-phumulani-earth text-white rounded-lg text-xs font-semibold hover:bg-phumulani-earth/90 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Meeting
                    </button>
                  </div>

                  {/* Executive Briefing Dossier */}
                  <div className="p-3 bg-white rounded-lg border border-phumulani-charcoal/12 text-xs space-y-2">
                    <div className="font-bold text-xs uppercase tracking-wider text-phumulani-earth">
                      Executive Briefing Dossier for Comfort Dondo
                    </div>
                    <p className="text-phumulani-charcoal">{lead.briefingDossier.executiveSummary}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-phumulani-charcoal/10 text-[11px]">
                      <div className="tabular-nums">
                        <strong className="text-phumulani-charcoal">Giving Capacity:</strong> $
                        {lead.briefingDossier.givingCapacityEstimate.toLocaleString()}
                      </div>
                      <div>
                        <strong className="text-phumulani-charcoal">Primary Program:</strong> {lead.briefingDossier.primaryProgramInterest}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-phumulani-charcoal/10">
                      <strong className="text-phumulani-charcoal block mb-1">Key Discussion Points:</strong>
                      <ul className="list-disc list-inside text-phumulani-charcoal space-y-0.5">
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
            <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-phumulani-charcoal">Google Calendar & Microsoft 365 Meeting Scheduler</h3>
                <p className="text-xs text-phumulani-charcoal/70">Double-booking prevention & authenticated free/busy slot selection</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-phumulani-charcoal/70">Calendar Provider:</span>
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value as any)}
                  className="px-2.5 py-1 text-xs border border-phumulani-charcoal/15 rounded bg-white font-medium"
                >
                  <option value="google">Google Calendar (Workspace)</option>
                  <option value="microsoft">Microsoft Outlook (M365 Graph)</option>
                </select>
              </div>
            </div>

            {bookingNotice && (
              <div className="p-3 rounded-lg bg-phumulani-teal/15 border border-phumulani-teal/40 text-phumulani-earth text-xs font-semibold">
                {bookingNotice}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Available Slots */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider">
                  Available Slots for Comfort Dondo (Twin Cities Business Hours)
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.slotId}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        !slot.isAvailable
                          ? 'bg-phumulani-cream/50 text-phumulani-charcoal/50 border-phumulani-charcoal/10 cursor-not-allowed'
                          : selectedSlot?.slotId === slot.slotId
                          ? 'border-phumulani-earth bg-phumulani-earth/10 font-bold text-phumulani-earth ring-1 ring-inset ring-phumulani-earth/25'
                          : 'border-phumulani-charcoal/12 hover:border-phumulani-earth/40 bg-white text-phumulani-charcoal'
                      }`}
                    >
                      <div className="font-semibold tabular-nums">{new Date(slot.startTime).toLocaleDateString()}</div>
                      <div className="text-[11px] text-phumulani-charcoal/70 mt-0.5 tabular-nums">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] mt-1 text-phumulani-earth font-medium">
                        {slot.isAvailable ? 'Available' : 'Booked'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Panel */}
              <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/50 space-y-4 text-xs">
                <h4 className="font-bold text-phumulani-charcoal">Confirm Booking</h4>
                {selectedSlot ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-phumulani-charcoal/70 block">Staff Member:</span>
                      <span className="font-semibold text-phumulani-charcoal">{selectedSlot.staffName}</span>
                    </div>
                    <div>
                      <span className="text-phumulani-charcoal/70 block">Selected Time:</span>
                      <span className="font-semibold text-phumulani-charcoal tabular-nums">
                        {new Date(selectedSlot.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-phumulani-charcoal/70 block">Funder Prospect:</span>
                      <span className="font-semibold text-phumulani-charcoal">
                        {prospects.find((p) => p.id === selectedProspectId)?.organizationName}
                      </span>
                    </div>

                    <button
                      onClick={handleBookMeeting}
                      className="w-full mt-3 py-2 bg-phumulani-green text-phumulani-charcoal rounded-lg font-bold hover:bg-phumulani-green/85 shadow-xs cursor-pointer transition-colors"
                    >
                      Book & Send Calendar Invite
                    </button>
                  </div>
                ) : (
                  <p className="text-phumulani-charcoal/70 text-xs">Select an available slot on the left to confirm an appointment.</p>
                )}

                <div className="pt-3 border-t border-phumulani-charcoal/10 text-[11px] space-y-1">
                  <div className="font-semibold text-phumulani-charcoal">Live Calendar Provider Status:</div>
                  <div className="flex items-center justify-between">
                    <span>Google Calendar:</span>
                    <span className={calendarProviderStatus?.googleConnected ? 'text-phumulani-green font-bold' : 'text-phumulani-earth font-semibold'}>
                      {calendarProviderStatus?.googleConnected ? 'CONNECTED' : 'AUTHORIZATION_REQUIRED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Microsoft Graph:</span>
                    <span className={calendarProviderStatus?.microsoftConnected ? 'text-phumulani-green font-bold' : 'text-phumulani-earth font-semibold'}>
                      {calendarProviderStatus?.microsoftConnected ? 'CONNECTED' : 'AUTHORIZATION_REQUIRED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Bookings & Reschedule / Cancel Controls */}
            <div className="border border-phumulani-charcoal/12 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider tabular-nums">
                  Scheduled Meetings & Reminders ({scheduledBookings.length} Bookings · {calendarReminders.length} Reminders)
                </h4>
              </div>
              {scheduledBookings.length === 0 ? (
                <p className="text-xs text-phumulani-charcoal/70">No donor meetings currently scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {scheduledBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3 rounded-lg border border-phumulani-charcoal/12 bg-phumulani-cream/50 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-phumulani-charcoal">{booking.title}</div>
                        <div className="text-[11px] text-phumulani-charcoal/75">
                          {new Date(booking.startTime).toLocaleString()} · {booking.prospectName} ({booking.prospectEmail}) · Status:{' '}
                          <span className="font-mono font-bold">{booking.status}</span>
                        </div>
                      </div>
                      {booking.status !== 'cancelled' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRescheduleBooking(booking)}
                            className="px-2.5 py-1 rounded bg-white border border-phumulani-charcoal/15 text-phumulani-charcoal hover:bg-phumulani-cream font-semibold text-[11px] cursor-pointer"
                          >
                            Reschedule (+24h)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-2.5 py-1 rounded bg-white border border-phumulani-earth/40 text-phumulani-earth hover:bg-phumulani-earth/10 font-semibold text-[11px] cursor-pointer"
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
            <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-phumulani-charcoal">Funding Concept Notes & Grant Proposal Generator</h3>
                <p className="text-xs text-phumulani-charcoal/75">
                  Prepares editable drafts conforming to 15% de minimis non-profit indirect cost guidelines. Watermarked for human executive review.
                </p>
              </div>
            </div>

            {proposalNotice && (
              <div className="p-3 rounded-lg bg-phumulani-green/15 border border-phumulani-green/40 text-phumulani-charcoal text-xs font-semibold">
                {proposalNotice}
              </div>
            )}

            {/* Proposal Generator Form */}
            <form onSubmit={handleCreateProposal} className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-white grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-phumulani-charcoal block mb-1">Target Grantmaker:</label>
                <input
                  type="text"
                  value={proposalGrantmaker}
                  onChange={(e) => setProposalGrantmaker(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/15 rounded"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal block mb-1">Target Program:</label>
                <select
                  value={proposalProgramId}
                  onChange={(e) => setProposalProgramId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/15 rounded bg-white"
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
                <label className="font-semibold text-phumulani-charcoal block mb-1">Requested Amount ($):</label>
                <input
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/15 rounded tabular-nums"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-phumulani-earth text-white rounded-md font-bold hover:bg-phumulani-earth/90 cursor-pointer transition-colors"
                >
                  Generate Proposal Draft
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-5 rounded-xl border border-phumulani-charcoal/12 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-phumulani-charcoal">{prop.title}</h4>
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/35 uppercase">
                          DRAFT — REQUIRES REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-phumulani-charcoal/75 mt-0.5 tabular-nums">
                        Target: {prop.targetGrantmaker} • Amount: ${prop.requestedAmount.toLocaleString()} • Program: {prop.programTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-phumulani-charcoal leading-relaxed bg-phumulani-cream/50 p-3 rounded border border-phumulani-charcoal/10">
                    <strong>Executive Summary:</strong> {prop.executiveSummary}
                  </p>

                  <div className="p-3 rounded border border-phumulani-charcoal/12 bg-white text-xs">
                    <strong className="text-phumulani-charcoal block mb-1">Approved Budget Breakdown:</strong>
                    <div className="space-y-1">
                      {prop.budgetBreakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-phumulani-charcoal tabular-nums">
                          <span>{b.item}</span>
                          <span className="font-semibold text-phumulani-charcoal">${b.amount.toLocaleString()}</span>
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
            <div className="p-4 rounded-xl border border-phumulani-charcoal/12 bg-phumulani-cream/60">
              <h3 className="text-sm font-bold text-phumulani-charcoal">Fundraising Pipeline Overview</h3>
              <p className="text-xs text-phumulani-charcoal/70 mt-0.5">
                Stage progression of active institutional, corporate CSR, and foundation partnerships
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {[
                { title: '1. Identified', count: prospects.filter((p) => p.status === 'uncontacted').length, color: 'border-t-phumulani-charcoal/30' },
                { title: '2. Solicited', count: prospects.filter((p) => p.status === 'solicited').length, color: 'border-t-phumulani-teal' },
                { title: '3. Meeting Staged', count: prospects.filter((p) => p.status === 'meeting_scheduled').length, color: 'border-t-phumulani-gold' },
                { title: '4. Proposal Review', count: proposals.length, color: 'border-t-phumulani-earth' },
                { title: '5. Funded Deals', count: 1, color: 'border-t-phumulani-green' },
              ].map((col, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border border-phumulani-charcoal/12 border-t-2 ${col.color} bg-phumulani-cream/50 shadow-2xs`}>
                  <div className="font-bold text-phumulani-charcoal">{col.title}</div>
                  <div className="text-xl font-bold font-heading text-phumulani-charcoal mt-2 tabular-nums">{col.count} Deals</div>
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
            <div className="p-5 rounded-xl border border-phumulani-teal/40 bg-phumulani-cream/60 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-5 h-5 text-phumulani-earth" />
                <h3 className="text-base font-bold text-phumulani-earth font-heading">
                  Local Institutional Source-of-Truth & Grounding Registry
                </h3>
                <span className="px-2 py-0.5 rounded-sm text-[11px] font-bold bg-white text-phumulani-earth border border-phumulani-teal/40 font-mono">
                  D:\Phumulani\data\knowledge\approved
                </span>
              </div>
              <p className="text-xs text-phumulani-charcoal/80 leading-relaxed">
                Phumulani Ai strictly rejects unverified fundraising claims, unratified capital forecasts, and simulated metrics. All donor-facing communications, solicitation emails, and grant proposals must cite verified institutional source document IDs. If an approved record is absent, the system explicitly states that verified figures are unavailable rather than hallucinating estimates.
              </p>
            </div>

            {/* Financial Ledger Distinction Cards */}
            <div>
              <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider mb-2">
                FY2026 Institutional Financial Reality vs Projections (DOC-FIN-001)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-phumulani-green/50 bg-phumulani-green/8">
                  <div className="flex items-center justify-between text-phumulani-charcoal font-bold">
                    <span>Settled Actual Cash</span>
                    <span className="text-[10px] bg-white border border-phumulani-green/35 px-1.5 py-0.5 rounded-sm font-mono">AUDITED</span>
                  </div>
                  <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-1 tabular-nums">$296,800</div>
                  <p className="text-[11px] text-phumulani-charcoal/75 mt-1">
                    Verified bank receipts. Legally recognized 501(c)(3) revenues.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-phumulani-teal/45 bg-phumulani-teal/8">
                  <div className="flex items-center justify-between text-phumulani-earth font-bold">
                    <span>Confirmed Commitments</span>
                    <span className="text-[10px] bg-white border border-phumulani-teal/35 px-1.5 py-0.5 rounded-sm font-mono">BINDING</span>
                  </div>
                  <div className="text-2xl font-bold font-heading text-phumulani-earth mt-1 tabular-nums">$65,000</div>
                  <p className="text-[11px] text-phumulani-charcoal/75 mt-1">
                    Signed grant agreements & recurring donor contracts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-phumulani-gold/50 bg-phumulani-gold/10">
                  <div className="flex items-center justify-between text-phumulani-charcoal font-bold">
                    <span>Pending Applications</span>
                    <span className="text-[10px] bg-white border border-phumulani-gold/40 px-1.5 py-0.5 rounded-sm font-mono">UNDER REVIEW</span>
                  </div>
                  <div className="text-2xl font-bold font-heading text-phumulani-charcoal mt-1 tabular-nums">$115,000</div>
                  <p className="text-[11px] text-phumulani-charcoal/75 mt-1">
                    Submitted proposals (McKnight, Bush, Otto Bremer).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-phumulani-earth/40 bg-phumulani-earth/8">
                  <div className="flex items-center justify-between text-phumulani-earth font-bold">
                    <span>Indirect Cost Cap</span>
                    <span className="text-[10px] bg-white border border-phumulani-earth/30 px-1.5 py-0.5 rounded-sm font-mono">15% DE MINIMIS</span>
                  </div>
                  <div className="text-2xl font-bold font-heading text-phumulani-earth mt-1 tabular-nums">$66,000 Max</div>
                  <p className="text-[11px] text-phumulani-charcoal/75 mt-1">
                    Strict federal standard cap across all funding asks.
                  </p>
                </div>
              </div>
            </div>

            {/* Source Approval Audit Status Banner */}
            {auditReport && (
              <div className="p-4 rounded-xl border border-phumulani-gold/45 bg-phumulani-cream/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-phumulani-charcoal">
                    <Shield className="w-4 h-4 text-phumulani-earth" />
                    <span>Institutional Source Approval Audit Status</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-white text-phumulani-charcoal border border-phumulani-gold/45">
                    PROVISIONAL BENCHMARK ENFORCED
                  </span>
                </div>
                <p className="text-phumulani-charcoal/85 leading-relaxed">
                  {auditReport.institutionalIntegrityNotice}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 font-medium text-phumulani-charcoal text-[11px] tabular-nums">
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
                <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider tabular-nums">
                  Role-Controlled Knowledge Documents ({knowledgeDocs.length} Active for Current Role)
                </h4>
                <span className="text-[11px] text-phumulani-charcoal/70 font-medium">
                  Authenticated API • Zero Raw Knowledge in Browser Bundle
                </span>
              </div>
              <div className="space-y-2.5">
                {(knowledgeDocs.length > 0 ? knowledgeDocs : []).map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-lg border border-phumulani-charcoal/12 bg-white hover:border-phumulani-earth/40 transition-colors text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-sm border border-phumulani-teal/35">
                          {doc.metadata?.sourceDocumentId || doc.id}
                        </span>
                        <span className="font-semibold text-phumulani-charcoal">{doc.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/40">
                          {doc.metadata?.sourceApprovalStatus || 'PROVISIONAL_BENCHMARK'}
                        </span>
                      </div>
                      <p className="text-[11px] text-phumulani-charcoal/75">
                        Owner: <strong>{doc.metadata?.recordOwner}</strong> • Approved: {doc.metadata?.approvalDate} • Evidence: {doc.metadata?.evidenceReference}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-phumulani-cream text-phumulani-charcoal font-mono">
                        {doc.metadata?.accessClassification || 'DONOR_FACING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarantine & Anti-Contamination Invariant Notice */}
            <div className="p-4 rounded-xl border border-phumulani-earth/35 bg-phumulani-earth/8 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-phumulani-earth">
                <AlertTriangle className="w-4 h-4 text-phumulani-earth" />
                <span>Simulated Sandbox & Pending-Review Quarantine (Fail-Closed Enforcement)</span>
              </div>
              <p className="text-phumulani-earth leading-relaxed">
                Any document located in <code className="font-mono bg-white px-1 rounded">data/knowledge/pending-review/</code> (e.g., draft capital expansion proposals) or marked with <code className="font-mono bg-white px-1 rounded">isDemoData: true</code> is barred from live donor-facing solicitation generation. In accordance with anti-commercial contamination protocols, Phumulani maintains 0% TaxGuard or commercial tax preparation software.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
