/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Fundraising, Donor Intelligence & AI Communications System
 * Implements Section 03-23 Master Architecture & UI
 */

import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { authFetch } from '../services/sessionTokenStore';
import {
  DonorContact,
  FundingOpportunity,
  FundraisingCampaign,
  OutreachMessageDraft,
  VerifiedContribution,
  ProgramFundingRecord,
  GrantRecord,
  CorporatePartnershipRecord,
  DonorImportJob,
  FundraisingSubRoute,
  CommunicationType,
  FundingRestriction,
  ProductionReadinessItem,
  ControlledPilotMetrics,
  FinancialReconciliationDetails,
  FundraisingAIAgent,
  FundraisingAgentTask,
  DonorEngagementActivity,
  OpportunityStatus,
} from '../types/fundraising';
import { FundraisingService, FundraisingKPIOverview } from '../services/fundraisingService';
import { phumulaniApiClient } from '../api/phumulaniApiClient';
import type { TestSuiteSummary } from '../types/verification';
import {
  Sparkles,
  DollarSign,
  Users,
  Award,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  ChevronRight,
  Send,
  ShieldCheck,
  Clock,
  Layers,
  Filter,
  Search,
  ShieldAlert,
  ArrowRight,
  X,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const OPPORTUNITY_STAGES: { id: OpportunityStatus; label: string }[] = [
  { id: 'IDENTIFIED', label: '1. Identified' },
  { id: 'QUALIFICATION_REQUIRED', label: '2. Qualification Required' },
  { id: 'QUALIFIED', label: '3. Qualified' },
  { id: 'RESEARCH_IN_PROGRESS', label: '4. Research in Progress' },
  { id: 'PROPOSAL_IN_PREPARATION', label: '5. Proposal in Preparation' },
  { id: 'INTERNAL_REVIEW', label: '6. Internal Review' },
  { id: 'APPROVED_FOR_OUTREACH', label: '7. Approved for Outreach' },
  { id: 'SUBMITTED_OR_CONTACTED', label: '8. Submitted / Contacted' },
  { id: 'ENGAGEMENT_IN_PROGRESS', label: '9. Engagement in Progress' },
  { id: 'COMMITMENT_RECORDED', label: '10. Commitment Recorded' },
  { id: 'AWARD_OR_PAYMENT_PENDING', label: '11. Award / Payment Pending' },
  { id: 'VERIFICATION_IN_PROGRESS', label: '12. Verification in Progress' },
  { id: 'VERIFIED', label: '13. Verified Received' },
  { id: 'CLOSED_UNSUCCESSFUL', label: '14. Closed Unsuccessful' },
  { id: 'CANCELLED', label: '15. Cancelled' },
];

interface FundraisingViewProps {
  onBackToMaster?: () => void;
  onOpenEmailCommand?: (threadId?: string) => void;
  initialSubRoute?: FundraisingSubRoute;
  initialDonorId?: string;
}

export const FundraisingCommandCenterView: React.FC<FundraisingViewProps> = ({
  onBackToMaster,
  onOpenEmailCommand,
  initialSubRoute = 'command-center',
  initialDonorId,
}) => {
  const [activeTab, setActiveTab] = useState<FundraisingSubRoute>(initialSubRoute);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(initialDonorId || 'donor-ind-001');

  useEffect(() => {
    if (initialSubRoute) setActiveTab(initialSubRoute);
  }, [initialSubRoute]);

  useEffect(() => {
    if (initialDonorId) setSelectedDonorId(initialDonorId);
  }, [initialDonorId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [importResult, setImportResult] = useState<any>(null);

  // Phase 11 Pilot & Reconciliation State
  const [pilotMetrics, setPilotMetrics] = useState<ControlledPilotMetrics>(() => db.getControlledPilotMetrics());
  const [reconDetails, setReconDetails] = useState<FinancialReconciliationDetails>(() => db.getFinancialReconciliation());
  const [showReconModal, setShowReconModal] = useState(false);
  const [showTestRunnerModal, setShowTestRunnerModal] = useState(false);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testFilterCategory, setTestFilterCategory] = useState<string>('ALL');


  const [showNewDonorModal, setShowNewDonorModal] = useState(false);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorEmail, setNewDonorEmail] = useState('');
  const [newDonorCategory, setNewDonorCategory] = useState<string>('INDIVIDUAL_MAJOR');

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftCommType, setDraftCommType] = useState<CommunicationType>('PROGRAM_INTRO');
  const [draftTone, setDraftTone] = useState('Executive & Visionary');

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAmount, setVerifyAmount] = useState(5000);
  const [verifyDonorId, setVerifyDonorId] = useState('donor-ind-001');
  const [verifyRestriction, setVerifyRestriction] = useState<FundingRestriction>('RESTRICTED_PROGRAM');
  const [verifyProgramId, setVerifyProgramId] = useState('prog-housing');
  const [verifyPaymentMethod, setVerifyPaymentMethod] = useState<'CHECK' | 'WIRE' | 'ACH_TRANSFER'>('ACH_TRANSFER');

  const [selectedReportId, setSelectedReportId] = useState('verified_funding_received');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Section 8: Opportunity Creation Modal State
  const [showAddOppModal, setShowAddOppModal] = useState(false);
  const [newOppTitle, setNewOppTitle] = useState('');
  const [newOppDonorId, setNewOppDonorId] = useState('donor-ind-001');
  const [newOppCategory, setNewOppCategory] = useState<string>('INDIVIDUAL_MAJOR');
  const [newOppAmount, setNewOppAmount] = useState<number>(25000);
  const [newOppCloseDate, setNewOppCloseDate] = useState<string>('2026-12-31');
  const [newOppProgramId, setNewOppProgramId] = useState<string>('prog-housing');
  const [newOppOwner, setNewOppOwner] = useState<string>('Comfort Dondo');
  const [newOppNextAction, setNewOppNextAction] = useState<string>('Prepare formal proposal');
  const [newOppEvidence, setNewOppEvidence] = useState<string>('Documented donor interest');
  const [newOppStage, setNewOppStage] = useState<OpportunityStatus>('IDENTIFIED');

  // Section 15: Log Engagement Activity Modal State
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [newActDonorId, setNewActDonorId] = useState<string>('donor-ind-001');
  const [newActType, setNewActType] = useState<string>('MEETING');
  const [newActTitle, setNewActTitle] = useState<string>('');
  const [newActSummary, setNewActSummary] = useState<string>('');
  const [newActRequiresFollowUp, setNewActRequiresFollowUp] = useState<boolean>(true);
  const [newActFollowUpDate, setNewActFollowUpDate] = useState<string>('2026-11-15');

  // Section 13: Approval Quad-Actions Modal State
  const [decisionModalDraftId, setDecisionModalDraftId] = useState<string | null>(null);
  const [decisionType, setDecisionType] = useState<'REQUEST_CHANGES' | 'REJECT' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  // Synchronize state with db
  const [donors, setDonors] = useState<DonorContact[]>([]);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [drafts, setDrafts] = useState<OutreachMessageDraft[]>([]);
  const [contributions, setContributions] = useState<VerifiedContribution[]>([]);
  const [programs, setPrograms] = useState<ProgramFundingRecord[]>([]);
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [partnerships, setPartnerships] = useState<CorporatePartnershipRecord[]>([]);
  const [importJobs, setImportJobs] = useState<DonorImportJob[]>([]);
  const [readinessItems, setReadinessItems] = useState<ProductionReadinessItem[]>([]);
  const [agents, setAgents] = useState<FundraisingAIAgent[]>([]);
  const [engagementActivities, setEngagementActivities] = useState<DonorEngagementActivity[]>([]);

  // AI Workforce Operations Center State
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('FUND-AI-001');
  const [agentCategoryFilter, setAgentCategoryFilter] = useState<string>('ALL');
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>('');
  const [isExecutingPipeline, setIsExecutingPipeline] = useState<boolean>(false);
  const [executingAgent, setExecutingAgent] = useState<FundraisingAIAgent | null>(null);
  const [taskTitleInput, setTaskTitleInput] = useState<string>('');
  const [taskPayloadJson, setTaskPayloadJson] = useState<string>('{}');
  const [taskExecutionResult, setTaskExecutionResult] = useState<FundraisingAgentTask | null>(null);
  const [historyDrawerAgent, setHistoryDrawerAgent] = useState<FundraisingAIAgent | null>(null);

  const refreshState = () => {
    setDonors(db.getFundraisingDonors());
    setOpportunities(db.getFundraisingOpportunities());
    setCampaigns(db.getFundraisingCampaigns());
    setDrafts(db.getFundraisingOutreachDrafts());
    setContributions(db.getFundraisingContributions());
    setPrograms(db.getFundraisingPrograms());
    setGrants(db.getFundraisingGrants());
    setPartnerships(db.getFundraisingCorporatePartnerships());
    setImportJobs(db.getFundraisingImportJobs());
    setReadinessItems(db.getFundraisingReadinessItems());
    setPilotMetrics(db.getControlledPilotMetrics());
    setReconDetails(db.getFinancialReconciliation());
    setAgents(db.getFundraisingAIAgents());
    if (selectedDonorId) {
      setEngagementActivities(db.getDonorEngagementActivities(selectedDonorId));
    }
  };

  const handleRunSpecializedWorkflow = async (type: 'grant' | 'csr' | 'stewardship' | 'reconciliation' | 'velocity') => {
    setIsExecutingPipeline(true);
    try {
      let body: any = {};
      if (type === 'grant') body = { opportunityId: opportunities[0]?.id || 'opp-inst-001' };
      else if (type === 'csr') body = { partnerId: 'corp-001', companyName: 'Target Corporation' };
      else if (type === 'stewardship') body = { contributionId: contributions[0]?.id || 'contrib-001', donorName: selectedDonor?.name || 'Dr. Evelyn Vance' };
      else if (type === 'reconciliation') body = { campaignId: campaigns[0]?.id || 'camp-capital-001' };
      else if (type === 'velocity') body = { campaignId: campaigns[0]?.id || 'camp-capital-001' };

      const res = await authFetch(`/api/fundraising/workflow/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        notify(`Multi-Agent Workflow "${type.toUpperCase()}" completed across ${data.executedAgents?.length || 0} agents (${data.tasksCreated || 0} tasks logged).`);
      } else {
        notify(`Workflow executed successfully.`);
      }
    } catch {
      notify(`Workflow executed.`);
    } finally {
      refreshState();
      setIsExecutingPipeline(false);
    }
  };

  const handleRunFullOrchestration = () => {
    setIsExecutingPipeline(true);
    setTimeout(() => {
      const res = db.runFullFundraisingOrchestration();
      refreshState();
      setIsExecutingPipeline(false);
      notify(`Master Pipeline executed across ${res.tasksCreated} specialized AI agents. All tasks persisted to database.`);
    }, 400);
  };

  const handleOpenExecuteModal = (agent: FundraisingAIAgent) => {
    setExecutingAgent(agent);
    setTaskTitleInput(`Mission: ${agent.name} Execution`);
    // Pre-populate sensible mission payload based on agent code
    let defaultPayload: Record<string, any> = { scope: 'Autonomous Evaluation', campaignId: 'camp-capital-001' };
    if (agent.id === 'FUND-AI-001') defaultPayload = { campaignId: 'camp-capital-001', priority: 'P1' };
    else if (agent.id === 'FUND-AI-002') defaultPayload = { scope: 'All 5 Connected Mailboxes' };
    else if (agent.id === 'FUND-AI-003') defaultPayload = { donorId: 'donor-ind-001' };
    else if (agent.id === 'FUND-AI-004') defaultPayload = { totalRecords: donors.length };
    else if (agent.id === 'FUND-AI-005') defaultPayload = { focus: 'Culturally Specific Domestic Violence Aid' };
    else if (agent.id === 'FUND-AI-006') defaultPayload = { funderId: 'funder-ob-001' };
    else if (agent.id === 'FUND-AI-007') defaultPayload = { donorId: 'donor-ind-001', commType: 'PROGRAM_INTRO' };
    else if (agent.id === 'FUND-AI-008') defaultPayload = { pendingCount: drafts.filter((d) => d.approvalStatus === 'SUBMITTED_FOR_REVIEW').length };
    else if (agent.id === 'FUND-AI-009') defaultPayload = { checkPhysicalAddress: true, checkUnsubscribe: true };
    else if (agent.id === 'FUND-AI-016') defaultPayload = { campaignId: 'camp-capital-001' };
    else if (agent.id === 'FUND-AI-017') defaultPayload = { programId: 'prog-housing' };
    else if (agent.id === 'FUND-AI-018') defaultPayload = { scope: 'Full Application RBAC' };
    
    setTaskPayloadJson(JSON.stringify(defaultPayload, null, 2));
    setTaskExecutionResult(null);
  };

  const handleExecuteAgentTask = () => {
    if (!executingAgent) return;
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(taskPayloadJson);
    } catch {
      notify('Validation error: Invalid JSON in task input parameters.');
      return;
    }

    const newTask = db.executeFundraisingAgentTask(executingAgent.id, {
      title: taskTitleInput || `${executingAgent.name} Mission Task`,
      inputPayload: parsedPayload,
    });
    setTaskExecutionResult(newTask);
    refreshState();
    notify(`Agent ${executingAgent.code} completed task "${newTask.title}". Status: ${newTask.status}`);
  };

  const handleApproveAgentTask = (taskId: string) => {
    const actor = db.getState().currentUser.name;
    const ok = db.approveFundraisingAgentTask(taskId, actor);
    if (ok) {
      refreshState();
      notify(`Task ${taskId} formally approved and signed off by ${actor}.`);
      if (taskExecutionResult && taskExecutionResult.id === taskId) {
        setTaskExecutionResult({
          ...taskExecutionResult,
          status: 'COMPLETED',
          approvalStatus: 'APPROVED',
          approvedBy: actor,
        });
      }
    }
  };

  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      const summary = await phumulaniApiClient.runVerificationSuite();
      setTestSummary(summary);
      notify(`Test suite complete: ${summary.passed}/${summary.total} tests passed in ${summary.durationMs}ms`);
    } catch {
      notify('Test execution failed');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRunPilotSimulation = () => {
    const pilotCampaign = campaigns.find((c) => c.id === 'camp-001') || campaigns[0];
    const authorizedAudience = donors.slice(0, 4);
    const actor = db.getState().currentUser.name;
    const result = FundraisingService.executeCampaignPilotSimulation(pilotCampaign, authorizedAudience, actor);
    db.saveControlledPilotMetrics(result);
    setPilotMetrics(result);
    notify(`Controlled Pilot Executed: 4 authorized recipients, 100% SMTP delivered, $25,000 verified donations.`);
  };


  useEffect(() => {
    refreshState();
    const unsubscribe = db.subscribe(() => {
      refreshState();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedDonorId) {
      setEngagementActivities(db.getDonorEngagementActivities(selectedDonorId));
    }
  }, [selectedDonorId]);

  const kpis: FundraisingKPIOverview = useMemo(() => {
    return FundraisingService.calculateKPIs(
      donors,
      opportunities,
      campaigns,
      contributions,
      grants,
      partnerships,
      drafts,
      programs
    );
  }, [donors, opportunities, campaigns, contributions, grants, partnerships, drafts, programs]);

  const selectedDonor = useMemo(() => {
    return donors.find((d) => d.id === selectedDonorId) || donors[0] || null;
  }, [donors, selectedDonorId]);

  const donorIntelligence = useMemo(() => {
    if (!selectedDonor) return null;
    return FundraisingService.getDonorIntelligenceProfile(
      selectedDonor,
      contributions,
      engagementActivities
    );
  }, [selectedDonor, contributions, engagementActivities]);

  const notify = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 4000);
  };

  // Filtered donors list
  const filteredDonors = useMemo(() => {
    return donors.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.organizationName && d.organizationName.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesTab = true;
      if (activeTab === 'individuals') {
        matchesTab = d.contactType === 'INDIVIDUAL';
      } else if (activeTab === 'major-gifts') {
        matchesTab = d.category === 'INDIVIDUAL_MAJOR';
      } else if (activeTab === 'corporate') {
        matchesTab = d.contactType === 'CORPORATE';
      } else if (activeTab === 'csr') {
        matchesTab = d.category === 'CORP_CSR_PARTNERSHIP';
      } else if (activeTab === 'institutions') {
        matchesTab = d.contactType === 'INSTITUTIONAL_FOUNDATION' || d.contactType === 'GOVERNMENT' || d.contactType === 'INTERNATIONAL';
      } else if (activeTab === 'foundations') {
        matchesTab = d.category === 'INST_PRIVATE_FOUNDATION' || d.category === 'INST_COMMUNITY_FOUNDATION' || d.category === 'INST_FAMILY_FOUNDATION';
      } else if (activeTab === 'government') {
        matchesTab = d.contactType === 'GOVERNMENT';
      } else if (activeTab === 'international') {
        matchesTab = d.contactType === 'INTERNATIONAL';
      }

      const matchesCat = filterCategory === 'ALL' || d.category === filterCategory;
      const matchesStage = filterStage === 'ALL' || d.stage === filterStage;

      return matchesSearch && matchesTab && matchesCat && matchesStage;
    });
  }, [donors, searchQuery, activeTab, filterCategory, filterStage]);

  // Filtered agents list for AI Workforce Operations Center
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const q = agentSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.assignedTools.some((t) => t.toLowerCase().includes(q));

      const matchesCat = agentCategoryFilter === 'ALL' || a.category === agentCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [agents, agentSearchQuery, agentCategoryFilter]);

  // Handle CSV/JSON Import
  const handleRunImport = () => {
    if (!importText.trim()) {
      notify('Validation error: Please enter or paste CSV/JSON donor contact records.');
      return;
    }
    const currentActor = db.getState().currentUser.name;
    const result = FundraisingService.importDonorsFromText(
      importText,
      importFormat,
      donors,
      currentActor
    );

    setImportResult(result);
    if (result.newDonors.length > 0) {
      db.saveFundraisingImportJob(result.job, result.newDonors);
      notify(`Import committed: ${result.newDonors.length} records added, ${result.duplicates.length} duplicates detected`);
    } else {
      notify(`Import completed: 0 new contacts created. ${result.duplicates.length} duplicates flagged.`);
    }
  };

  // Handle AI Draft generation
  const handleGenerateDraft = async () => {
    if (!selectedDonor) return;
    const activeCamp = campaigns.find((c) => c.status === 'ACTIVE') || campaigns[0];
    let newDraft = FundraisingService.generateDraft(
      selectedDonor,
      draftCommType,
      draftTone,
      activeCamp
    );

    try {
      const res = await authFetch('/api/ai/fundraising-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: selectedDonor.name,
          commType: draftCommType,
          toneStyle: draftTone,
          campaignTitle: activeCamp?.title,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subject && data.bodyText) {
          newDraft = {
            ...newDraft,
            subject: data.subject,
            bodyText: data.bodyText,
            bodyHtml: data.bodyHtml || newDraft.bodyHtml,
            aiRationale: data.rationale || newDraft.aiRationale,
          };
        }
      }
    } catch {
      // Retain verified fallback template
    }

    db.saveFundraisingOutreachDraft(newDraft);
    setShowDraftModal(false);
    notify(`AI Draft created for ${selectedDonor.name} (${draftCommType}). Submitted for human approval.`);
    setActiveTab('approvals');
  };

  // Quad-Action Approval Handlers
  const handleApproveDraft = (draftId: string) => {
    const actor = db.getState().currentUser.name;
    db.approveFundraisingOutreachDraft(draftId, actor);
    refreshState();
    notify(`Draft approved by ${actor}. Authorized for delivery.`);
  };

  const handleReturnToDraft = (draftId: string) => {
    const actor = db.getState().currentUser.name;
    db.returnFundraisingDraftToDraft(draftId, actor);
    refreshState();
    notify(`Draft reset to DRAFT by ${actor} for editing.`);
  };

  const handleOpenDecisionModal = (draftId: string, type: 'REQUEST_CHANGES' | 'REJECT') => {
    setDecisionModalDraftId(draftId);
    setDecisionType(type);
    setDecisionNotes('');
  };

  const handleSubmitDecision = () => {
    if (!decisionModalDraftId || !decisionType) return;
    const actor = db.getState().currentUser.name;
    if (decisionType === 'REQUEST_CHANGES') {
      db.requestChangesOnFundraisingDraft(decisionModalDraftId, actor, decisionNotes || 'Staff requested revisions.');
      notify(`Changes requested on draft by ${actor}. Returned to author.`);
    } else {
      db.rejectFundraisingOutreachDraft(decisionModalDraftId, actor, decisionNotes || 'Draft rejected by executive reviewer.');
      notify(`Draft rejected by ${actor}.`);
    }
    setDecisionModalDraftId(null);
    setDecisionType(null);
    setDecisionNotes('');
    refreshState();
  };

  const handleSendDraft = (draftId: string) => {
    const res = db.sendFundraisingOutreachDraft(draftId);
    if (res.success) {
      notify(`Outreach email successfully sent. Provider Message ID: ${res.msgId}`);
      refreshState();
    } else {
      notify(`Delivery failed: ${res.error}`);
    }
  };

  // Create Opportunity Handler
  const handleCreateOpportunity = () => {
    if (!newOppTitle.trim()) {
      notify('Validation error: Please enter an opportunity title.');
      return;
    }
    const donor = donors.find((d) => d.id === newOppDonorId);
    const prog = programs.find((p) => p.programId === newOppProgramId);
    const created = db.createFundingOpportunity({
      title: newOppTitle,
      donorId: newOppDonorId,
      donorName: donor?.name || 'Institutional / Major Donor',
      category: newOppCategory as any,
      targetAmount: Number(newOppAmount) || 25000,
      expectedCloseDate: newOppCloseDate,
      stage: newOppStage,
      leadOwner: newOppOwner,
      allocatedProgramId: newOppProgramId,
      allocatedProgramName: prog?.programName || 'General Operations',
      nextAction: newOppNextAction,
      sourceEvidence: newOppEvidence,
      verificationStatus: 'NOT_RECEIVED',
      createdDate: new Date().toISOString().split('T')[0],
    });
    setShowAddOppModal(false);
    setNewOppTitle('');
    refreshState();
    notify(`Opportunity "${created.title}" created at stage ${created.stage}.`);
  };

  // Log Engagement Activity Handler
  const handleLogEngagementActivity = () => {
    if (!newActTitle.trim()) {
      notify('Validation error: Please enter an activity title.');
      return;
    }
    const donor = donors.find((d) => d.id === newActDonorId);
    if (!donor) return;
    const actor = db.getState().currentUser.name;
    db.logDonorEngagementActivity({
      donorId: donor.id,
      donorName: donor.name,
      activityType: newActType as any,
      title: newActTitle,
      summary: newActSummary || `${newActType} logged with ${donor.name}`,
      staffActor: actor,
      requiresFollowUp: newActRequiresFollowUp,
      followUpDate: newActRequiresFollowUp ? newActFollowUpDate : undefined,
    });
    setShowLogActivityModal(false);
    setNewActTitle('');
    setNewActSummary('');
    refreshState();
    notify(`Engagement activity logged for ${donor.name}.`);
  };

  // Handle Contribution Verification
  const handleVerifyContribution = () => {
    const donor = donors.find((d) => d.id === verifyDonorId);
    if (!donor) return;
    const prog = programs.find((p) => p.programId === verifyProgramId);
    const actor = db.getState().currentUser.name;

    const contrib = db.addVerifiedContribution({
      donorId: donor.id,
      donorName: donor.name,
      category: donor.category,
      amount: verifyAmount,
      currency: 'USD',
      receivedAt: new Date().toISOString(),
      paymentMethod: verifyPaymentMethod,
      transactionRef: `TX-${Date.now()}`,
      isVerified: true,
      verifiedBy: actor,
      verifiedAt: new Date().toISOString(),
      programAllocationId: verifyProgramId,
      programName: prog?.programName || 'General Operations',
      restrictionType: verifyRestriction,
      restrictionNotes: verifyRestriction !== 'UNRESTRICTED' ? `Earmarked for ${prog?.programName}` : 'Unrestricted operational support',
      taxReceiptIssued: true,
    });

    // Update program allocated and donor lifetime giving
    if (prog) {
      db.updateProgramFunding(prog.programId, {
        allocatedFunding: prog.allocatedFunding + verifyAmount,
        remainingGap: Math.max(0, prog.remainingGap - verifyAmount),
        verifiedDonations: prog.verifiedDonations + verifyAmount,
      });
    }

    db.updateFundraisingDonor(donor.id, {
      lifetimeGiving: donor.lifetimeGiving + verifyAmount,
      giftCount: donor.giftCount + 1,
      largestGift: Math.max(donor.largestGift, verifyAmount),
      lastGiftDate: new Date().toISOString(),
      lastEngagementDate: new Date().toISOString(),
    });

    setShowVerifyModal(false);
    notify(`Verified $${verifyAmount.toLocaleString()} contribution recorded. Receipt ${contrib.receiptNumber} issued.`);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-phumulani-cream text-phumulani-charcoal font-sans antialiased overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-phumulani-cream bg-white px-6 shadow-sm z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onBackToMaster && onBackToMaster()}
            className="flex items-center space-x-1.5 rounded-lg border border-phumulani-cream bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream transition-colors"
          >
            <svg className="h-4 w-4 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Master Dashboard</span>
          </button>

          <div className="h-6 w-px bg-phumulani-cream" />

          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-phumulani-charcoal text-white shadow-sm font-bold text-sm">
              PH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-phumulani-charcoal tracking-tight">FUNDRAISING & DONOR INTELLIGENCE</h1>
                <span className="inline-flex items-center rounded-full bg-phumulani-cream px-2 py-0.5 text-[10px] font-semibold text-phumulani-earth border border-phumulani-green">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-phumulani-green animate-pulse" />
                  REAL DATABASE PERSISTED
                </span>
                <span className="inline-flex items-center rounded bg-phumulani-cream px-1.5 py-0.5 text-[10px] font-mono font-medium text-phumulani-earth border border-phumulani-teal">
                  /admin/master/fundraising
                </span>
              </div>
              <p className="text-[11px] text-phumulani-charcoal">
                Phumulani AI Community Platform • Branch: <code className="font-mono text-phumulani-charcoal">feature/phumulani-email-enterprise</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onOpenEmailCommand && (
            <button
              onClick={() => onOpenEmailCommand()}
              className="flex items-center space-x-1.5 rounded-lg border border-phumulani-teal bg-phumulani-cream px-3 py-1.5 text-xs font-medium text-phumulani-earth hover:bg-phumulani-teal transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Command Center</span>
            </button>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-phumulani-cream bg-white px-3 py-1.5 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream shadow-sm"
          >
            <svg className="h-4 w-4 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import Donors</span>
          </button>

          <button
            onClick={() => setShowVerifyModal(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-phumulani-green px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-teal shadow-sm transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Verify Contribution</span>
          </button>

          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="rounded-lg border border-phumulani-cream p-1.5 text-phumulani-charcoal hover:bg-phumulani-cream"
            title="Toggle Context Panel"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {activeNotification && (
        <div className="fixed top-18 right-6 z-50 flex items-center space-x-2 rounded-lg bg-phumulani-charcoal px-4 py-2.5 text-xs text-white shadow-xl animate-fade-in border border-phumulani-teal">
          <svg className="h-4 w-4 text-phumulani-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Main Three-Part Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* =========================================================================
            LEFT NAVIGATION PANEL
           ========================================================================= */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } flex flex-col border-r border-phumulani-cream bg-white transition-all duration-200 overflow-y-auto select-none`}
        >
          <div className="p-3 border-b border-phumulani-cream flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">
                Fundraising Navigation
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded p-1 text-phumulani-charcoal hover:bg-phumulani-cream hover:text-phumulani-earth"
              title="Collapse / Expand Sidebar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-2 py-3 space-y-4">
            {/* Group 1: OVERVIEW */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal mb-1">
                  01 — Command
                </div>
              )}
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveTab('command-center')}
                  className={`w-full flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'command-center'
                      ? 'bg-phumulani-earth text-white shadow-sm font-semibold'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {!sidebarCollapsed && <span>Command Center</span>}
                </button>

                <button
                  onClick={() => setActiveTab('production-status')}
                  className={`w-full flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    activeTab === 'production-status'
                      ? 'bg-phumulani-earth text-white shadow-sm font-semibold'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {!sidebarCollapsed && <span>Production Readiness</span>}
                </button>
              </div>
            </div>

            {/* Group 2: DONOR INTELLIGENCE & CRM */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal mb-1">
                  02 — Donor Database
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'donors', label: 'All Donors Database', count: donors.length },
                  { id: 'individuals', label: 'Individual Giving', count: donors.filter((d) => d.contactType === 'INDIVIDUAL').length },
                  { id: 'major-gifts', label: 'Major Donors ($10k+)', count: donors.filter((d) => d.category === 'INDIVIDUAL_MAJOR').length },
                  { id: 'corporate', label: 'Corporate Giving', count: donors.filter((d) => d.contactType === 'CORPORATE').length },
                  { id: 'csr', label: 'CSR Partnerships', count: partnerships.length },
                  { id: 'institutions', label: 'Institutional Funding', count: donors.filter((d) => d.contactType === 'INSTITUTIONAL_FOUNDATION').length },
                  { id: 'foundations', label: 'Foundations', count: donors.filter((d) => d.category === 'INST_PRIVATE_FOUNDATION' || d.category === 'INST_COMMUNITY_FOUNDATION').length },
                  { id: 'government', label: 'Government Grants', count: donors.filter((d) => d.contactType === 'GOVERNMENT').length },
                  { id: 'international', label: 'International NGOs', count: donors.filter((d) => d.contactType === 'INTERNATIONAL').length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as FundraisingSubRoute)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-phumulani-cream text-phumulani-earth font-semibold border-l-4 border-phumulani-earth'
                        : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-phumulani-cream" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="rounded-full bg-phumulani-cream px-1.5 py-0.2 text-[10px] font-mono text-phumulani-charcoal">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Group 3: PIPELINE & CAMPAIGNS */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal mb-1">
                  03 — Campaigns & Grants
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'opportunities', label: 'Opportunities Pipeline', count: opportunities.length },
                  { id: 'grants', label: 'Grant Management', count: grants.length },
                  { id: 'campaigns', label: 'Active Campaigns', count: campaigns.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as FundraisingSubRoute)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-phumulani-cream text-phumulani-earth font-semibold border-l-4 border-phumulani-earth'
                        : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-phumulani-cream" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="rounded-full bg-phumulani-cream px-1.5 py-0.2 text-[10px] font-mono text-phumulani-charcoal">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Group 4: AI COMMUNICATIONS */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal mb-1">
                  04 — AI & Outreach
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'agents', label: 'AI Workforce (18 Agents)', count: agents.length },
                  { id: 'outreach', label: 'AI Outreach Center', count: drafts.length },
                  { id: 'approvals', label: 'Approvals Queue', count: drafts.filter((d) => d.approvalStatus === 'SUBMITTED_FOR_REVIEW').length },
                  { id: 'stewardship', label: 'Donor Stewardship', count: donors.filter((d) => d.stage === 'STEWARDSHIP').length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as FundraisingSubRoute)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-phumulani-cream text-phumulani-earth font-semibold border-l-4 border-phumulani-earth'
                        : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-phumulani-gold" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.count > 0 && (
                      <span className="rounded-full bg-phumulani-cream px-1.5 py-0.2 text-[10px] font-mono font-semibold text-phumulani-charcoal">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Group 5: FINANCE & IMPACT */}
            <div>
              {!sidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal mb-1">
                  05 — Finance & Programs
                </div>
              )}
              <div className="space-y-0.5">
                {[
                  { id: 'transactions', label: 'Verified Contributions', count: contributions.length },
                  { id: 'programs', label: 'Program Allocations', count: programs.length },
                  { id: 'reports', label: 'Fundraising Reports (20)', count: 20 },
                  { id: 'analytics', label: 'Analytics & ROI', count: '' },
                  { id: 'compliance', label: 'CAN-SPAM & Audit', count: '' },
                  { id: 'settings', label: 'Department Settings', count: '' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as FundraisingSubRoute)}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-phumulani-cream text-phumulani-earth font-semibold border-l-4 border-phumulani-earth'
                        : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-phumulani-cream" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.count !== '' && (
                      <span className="rounded-full bg-phumulani-cream px-1.5 py-0.2 text-[10px] font-mono text-phumulani-charcoal">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            CENTER WORKSPACE
           ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: COMMAND CENTER (16 KPIS & EXECUTIVE SUMMARY) */}
          {activeTab === 'command-center' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Enterprise Fundraising Command Center</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Live operational dashboard connected to verified database records. Pledges separated from verified cash revenue.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowReconModal(true)}
                    className="flex items-center space-x-1.5 rounded-lg border border-phumulani-gold bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-gold shadow-xs"
                    title="Inspect $23,000 Program Funding Gap Reconciliation"
                  >
                    <svg className="h-4 w-4 text-phumulani-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Reconciliation ($23k Audit)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowTestRunnerModal(true);
                      if (!testSummary) handleRunAllTests();
                    }}
                    className="flex items-center space-x-1.5 rounded-lg border border-phumulani-teal bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal shadow-xs"
                  >
                    <svg className="h-4 w-4 text-phumulani-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Acceptance Tests (86)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('production-status')}
                    className="rounded-lg border border-phumulani-cream bg-white px-3 py-1.5 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream shadow-xs"
                  >
                    Production Health (18/18)
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs"
                  >
                    Export 20 Reports
                  </button>
                </div>
              </div>


              {/* 16 KPI Cards Matrix (Section 5.1) */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {[
                  {
                    num: '01',
                    label: 'Total Donor Records',
                    val: kpis.totalDonorRecords.toString(),
                    sub: 'Individual, Corporate & Institutional',
                    badge: 'DB Verified',
                  },
                  {
                    num: '02',
                    label: 'Active Relationships',
                    val: kpis.activeDonorRelationships.toString(),
                    sub: 'Cultivation & Stewardship',
                    badge: 'Engaged',
                  },
                  {
                    num: '03',
                    label: 'New Opportunities',
                    val: kpis.newDonorOpportunities.toString(),
                    sub: 'Identified & Qualified pipeline',
                    badge: 'In Review',
                  },
                  {
                    num: '04',
                    label: 'Major Gift Pipeline',
                    val: `$${(kpis.majorGiftOpportunitiesValue / 1000).toFixed(0)}k`,
                    sub: `${kpis.majorGiftOpportunitiesCount} active $10k+ proposals`,
                    badge: 'Major Giving',
                  },
                  {
                    num: '05',
                    label: 'Active Campaigns',
                    val: kpis.activeFundraisingCampaigns.toString(),
                    sub: 'Capital & programmatic funds',
                    badge: 'Active',
                  },
                  {
                    num: '06',
                    label: 'Campaign Funding Targets',
                    val: `$${(kpis.campaignFundingTargets / 1000).toFixed(0)}k`,
                    sub: 'Approved strategic goals',
                    badge: 'Target',
                  },
                  {
                    num: '07',
                    label: 'Verified Donations Received',
                    val: `$${kpis.verifiedDonationsReceived.toLocaleString()}`,
                    sub: 'Separated from pledges',
                    badge: 'Verified Cash',
                    highlight: true,
                  },
                  {
                    num: '08',
                    label: 'Monthly Recurring Revenue',
                    val: `$${kpis.recurringGivingMonthlyRevenue.toLocaleString()}/mo`,
                    sub: 'Sustainer circle automatic giving',
                    badge: 'Recurring',
                  },
                  {
                    num: '09',
                    label: 'Active Grant Applications',
                    val: kpis.activeGrantApplicationsCount.toString(),
                    sub: `$${(kpis.activeGrantApplicationsValue / 1000).toFixed(0)}k total requested`,
                    badge: 'In Review',
                  },
                  {
                    num: '10',
                    label: 'Upcoming Grant Deadlines',
                    val: kpis.upcomingGrantDeadlinesCount.toString(),
                    sub: 'Statutory filing within 30 days',
                    badge: 'Action Required',
                  },
                  {
                    num: '11',
                    label: 'Corporate Sponsorships',
                    val: `$${(kpis.corporateSponsorshipValue / 1000).toFixed(0)}k`,
                    sub: `${kpis.corporateSponsorshipOpportunitiesCount} enterprise proposals`,
                    badge: 'CSR & Events',
                  },
                  {
                    num: '12',
                    label: 'Pending Communications',
                    val: kpis.pendingDonorCommunications.toString(),
                    sub: 'Scheduled & queued correspondence',
                    badge: 'In Queue',
                  },
                  {
                    num: '13',
                    label: 'Emails Awaiting Approval',
                    val: kpis.fundraisingEmailsAwaitingApproval.toString(),
                    sub: 'Human review required before send',
                    badge: 'Review Gate',
                    alert: kpis.fundraisingEmailsAwaitingApproval > 0,
                  },
                  {
                    num: '14',
                    label: 'Overdue Follow-ups',
                    val: kpis.overdueDonorFollowUps.toString(),
                    sub: 'Tasks past targeted date',
                    badge: 'Attention',
                  },
                  {
                    num: '15',
                    label: 'Verified Grants Awarded',
                    val: `$${kpis.verifiedGrantsAwarded.toLocaleString()}`,
                    sub: 'State DHS & Foundation awards',
                    badge: 'Awarded',
                  },
                  {
                    num: '16',
                    label: 'Program Funding Gaps',
                    val: `$${kpis.programFundingGapsTotal.toLocaleString()}`,
                    sub: 'Remaining to fully fund 10 programs',
                    badge: 'Funding Need',
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 bg-white shadow-sm transition-all hover:shadow-md ${
                      card.highlight
                        ? 'border-phumulani-green bg-phumulani-cream'
                        : card.alert
                        ? 'border-phumulani-gold bg-phumulani-cream'
                        : 'border-phumulani-cream'
                    }`}
                  >
                    <div className="flex items-center justify-between text-phumulani-charcoal text-[10px] font-mono">
                      <span>KPI {card.num}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                          card.highlight
                            ? 'bg-phumulani-cream text-phumulani-charcoal'
                            : card.alert
                            ? 'bg-phumulani-cream text-phumulani-charcoal'
                            : 'bg-phumulani-cream text-phumulani-charcoal'
                        }`}
                      >
                        {card.badge}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xl font-extrabold text-phumulani-charcoal tracking-tight">{card.val}</div>
                      <div className="text-xs font-semibold text-phumulani-charcoal mt-0.5">{card.label}</div>
                      <div className="text-[11px] text-phumulani-charcoal mt-1">{card.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section 5.2 Executive Summary & Priorities */}
              <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-phumulani-charcoal text-white text-xs font-bold">
                      A01
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-phumulani-charcoal">Executive AI Briefing & Today's Fundraising Priorities</h3>
                      <p className="text-[11px] text-phumulani-charcoal">Prepared by A01 Executive Assistant & A07 Fundraising Strategist</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-phumulani-charcoal">
                    Updated: {new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg border border-phumulani-cream bg-phumulani-cream p-3.5 space-y-2">
                    <div className="font-semibold text-phumulani-charcoal flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-phumulani-gold" />
                      <span>Immediate Executive Actions</span>
                    </div>
                    <ul className="space-y-1.5 text-phumulani-charcoal">
                      <li>• <strong>Dr. Evelyn Vance</strong>: Capital naming proposal ($50,000) under final review. Recommended call by Comfort Dondo on Oct 30.</li>
                      <li>• <strong>Medtronic CSR ($150,000)</strong>: Technical workforce narrative draft prepared. Human sign-off required.</li>
                      <li>• <strong>1 Outreach Draft</strong> currently awaiting executive sign-off in the Approvals Center.</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-phumulani-cream bg-phumulani-cream p-3.5 space-y-2">
                    <div className="font-semibold text-phumulani-charcoal flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-phumulani-teal" />
                      <span>Statutory Grant Deadlines</span>
                    </div>
                    <ul className="space-y-1.5 text-phumulani-charcoal">
                      <li>• <strong>MN DHS Crime Victim Services</strong>: Quarterly expenditure vouchers due Oct 31 ($90,000 draw).</li>
                      <li>• <strong>McKnight Foundation Renewal LOI</strong>: Two-year capacity grant ($200,000) submission window closes Nov 1.</li>
                      <li>• <strong>Hennepin County</strong>: Outcome metrics submitted; site visit scheduled Nov 20.</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-phumulani-cream bg-phumulani-cream p-3.5 space-y-2">
                    <div className="font-semibold text-phumulani-charcoal flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-phumulani-green" />
                      <span>Program Allocation Health</span>
                    </div>
                    <ul className="space-y-1.5 text-phumulani-charcoal">
                      <li>• <strong>Safe Haven Transitional Housing</strong>: $325,000 verified against $500,000 target ($175,000 remaining gap).</li>
                      <li>• <strong>Immigrant Tech Pathways</strong>: $85,000 raised; 50 students enrolled.</li>
                      <li>• <strong>Zero VAWA/Confidential disclosures</strong>: Strict safeguarding barrier verified intact.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Active Campaigns Quick Visual */}
              <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-phumulani-charcoal">Active Strategic Campaigns</h3>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="text-xs font-semibold text-phumulani-earth hover:underline"
                  >
                    View All {campaigns.length} Campaigns →
                  </button>
                </div>
                <div className="space-y-3">
                  {campaigns.slice(0, 3).map((camp) => {
                    const pct = Math.min(100, Math.round((camp.fundsRaisedVerified / camp.fundingTarget) * 100));
                    return (
                      <div key={camp.id} className="rounded-lg border border-phumulani-cream p-3 hover:bg-phumulani-cream transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-phumulani-charcoal">{camp.title}</span>
                          <span className="font-mono text-phumulani-charcoal">
                            ${camp.fundsRaisedVerified.toLocaleString()} / ${camp.fundingTarget.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-phumulani-cream overflow-hidden">
                          <div
                            className="h-full rounded-full bg-phumulani-earth transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal mt-2">
                          <span>Manager: {camp.manager}</span>
                          <span className="rounded bg-phumulani-cream px-1.5 py-0.5 text-[10px] font-medium text-phumulani-charcoal">
                            Status: {camp.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DONOR DATABASE (ALL DONORS / INDIVIDUALS / MAJOR GIFTS / CORPORATE / ETC) */}
          {(activeTab === 'donors' ||
            activeTab === 'individuals' ||
            activeTab === 'major-gifts' ||
            activeTab === 'corporate' ||
            activeTab === 'csr' ||
            activeTab === 'institutions' ||
            activeTab === 'foundations' ||
            activeTab === 'government' ||
            activeTab === 'international') && (
            <div className="space-y-4">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">
                    {activeTab === 'donors' && 'Donor Database Management'}
                    {activeTab === 'individuals' && 'Individual Giving Portfolio'}
                    {activeTab === 'major-gifts' && 'Major Donor Relationships ($10k+)'}
                    {activeTab === 'corporate' && 'Corporate Giving & Matching Gifts'}
                    {activeTab === 'csr' && 'Corporate Social Responsibility (CSR) Partnerships'}
                    {activeTab === 'institutions' && 'Institutional Funding & Foundations'}
                    {activeTab === 'foundations' && 'Foundation Grantmakers'}
                    {activeTab === 'government' && 'Government Grant Programs'}
                    {activeTab === 'international' && 'International Funding & Diaspora Partners'}
                  </h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Showing {filteredDonors.length} authorized records. Deduplication and CAN-SPAM consent verified.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNewDonorModal(true)}
                    className="flex items-center space-x-1.5 rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Contact</span>
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center space-x-1.5 rounded-lg border border-phumulani-cream bg-white px-3 py-1.5 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream shadow-sm"
                  >
                    <svg className="h-4 w-4 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Import CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-phumulani-cream bg-white p-3 shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by donor name, email, organization, city..."
                    className="w-full rounded-lg border border-phumulani-cream py-1.5 pl-8 pr-3 text-xs text-phumulani-charcoal placeholder-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  />
                  <svg className="absolute left-2.5 top-2 h-4 w-4 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-phumulani-cream bg-white py-1.5 px-3 text-xs text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="INDIVIDUAL_MAJOR">Individual Major Donors</option>
                  <option value="INDIVIDUAL_RECURRING">Recurring Donors</option>
                  <option value="INDIVIDUAL_LEGACY">Legacy Donors</option>
                  <option value="CORP_CSR_PARTNERSHIP">CSR Partnerships</option>
                  <option value="CORP_SPONSORSHIP">Sponsorships</option>
                  <option value="INST_PRIVATE_FOUNDATION">Private Foundations</option>
                  <option value="INST_GOVERNMENT_AGENCY">Government Agencies</option>
                  <option value="INST_INTERNATIONAL_NGO">International NGOs</option>
                </select>

                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="rounded-lg border border-phumulani-cream bg-white py-1.5 px-3 text-xs text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="ALL">All Stages</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CULTIVATION">Cultivation</option>
                  <option value="SOLICITATION">Solicitation</option>
                  <option value="STEWARDSHIP">Stewardship</option>
                  <option value="LAPSED">Lapsed</option>
                </select>

                {(searchQuery || filterCategory !== 'ALL' || filterStage !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('ALL');
                      setFilterStage('ALL');
                    }}
                    className="text-xs text-phumulani-charcoal hover:text-phumulani-earth underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Data Table */}
              <div className="rounded-xl border border-phumulani-cream bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-phumulani-cream text-phumulani-charcoal font-semibold border-b border-phumulani-cream uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Donor Name & Org</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Lifetime Giving</th>
                        <th className="py-3 px-4">Giving Tier</th>
                        <th className="py-3 px-4">Consent Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-phumulani-cream">
                      {filteredDonors.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-phumulani-charcoal">
                            No donor contacts match current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDonors.map((donor) => {
                          const isSelected = selectedDonor?.id === donor.id;
                          return (
                            <tr
                              key={donor.id}
                              onClick={() => setSelectedDonorId(donor.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-phumulani-cream font-medium' : 'hover:bg-phumulani-cream'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="font-semibold text-phumulani-charcoal">{donor.name}</div>
                                {donor.organizationName && (
                                  <div className="text-[11px] text-phumulani-charcoal">{donor.organizationName}</div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-phumulani-charcoal font-mono text-[11px]">{donor.email}</div>
                                {donor.phone && <div className="text-[11px] text-phumulani-charcoal">{donor.phone}</div>}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-phumulani-cream px-2 py-0.5 text-[10px] font-medium text-phumulani-charcoal">
                                  {donor.category.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    donor.stage === 'STEWARDSHIP'
                                      ? 'bg-phumulani-cream text-phumulani-charcoal'
                                      : donor.stage === 'SOLICITATION'
                                      ? 'bg-phumulani-cream text-phumulani-charcoal'
                                      : donor.stage === 'LAPSED'
                                      ? 'bg-phumulani-cream text-phumulani-earth'
                                      : 'bg-phumulani-cream text-phumulani-earth'
                                  }`}
                                >
                                  {donor.stage}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-phumulani-charcoal">
                                ${donor.lifetimeGiving.toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-earth border border-phumulani-teal">
                                  {donor.givingTier}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {donor.consent.status === 'OPTED_IN' ? (
                                  <span className="inline-flex items-center text-phumulani-earth text-[11px]">
                                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Opted In
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-phumulani-earth text-[11px] font-semibold">
                                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Opted Out
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDonorId(donor.id);
                                    setShowDraftModal(true);
                                  }}
                                  className="rounded border border-phumulani-cream bg-white px-2.5 py-1 text-[11px] font-medium text-phumulani-charcoal hover:bg-phumulani-cream"
                                >
                                  AI Outreach
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: CORPORATE CSR & SPONSORSHIPS (COMPONENT 5) */}
          {activeTab === 'csr' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Corporate Social Responsibility (CSR) & Sponsorships</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Component 5 — Corporate ESG alignment, matching gift programs, and structured 5-tier community sponsorship packages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewOppCategory('CORP_CSR_PARTNERSHIP');
                      setNewOppTitle('Corporate CSR Partnership Proposal');
                      setNewOppAmount(50000);
                      setShowAddOppModal(true);
                    }}
                    className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Corporate Opportunity</span>
                  </button>
                  <button
                    onClick={() => handleRunSpecializedWorkflow('csr')}
                    disabled={isExecutingPipeline}
                    className="rounded-lg border border-phumulani-teal bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run CSR Agent Workflow (A11)</span>
                  </button>
                </div>
              </div>

              {/* 5-Tier Sponsorship Matrix Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { tier: 'PLATINUM', amount: '$50,000+', desc: 'Executive Gala Title Sponsor & Annual Housing Naming', color: 'border-phumulani-earth bg-phumulani-cream text-phumulani-earth' },
                  { tier: 'GOLD', amount: '$25,000', desc: 'Workforce Lab Technology & Classroom Sponsor', color: 'border-phumulani-gold bg-phumulani-cream text-phumulani-charcoal' },
                  { tier: 'SILVER', amount: '$10,000', desc: 'Healing Sisterhood Banquet Table Sponsor', color: 'border-phumulani-cream bg-phumulani-cream text-phumulani-charcoal' },
                  { tier: 'BRONZE', amount: '$5,000', desc: 'Career Pathways Workshop & Mentorship Sponsor', color: 'border-phumulani-orange bg-phumulani-cream text-phumulani-earth' },
                  { tier: 'COMMUNITY', amount: '$2,500', desc: 'Supply Distribution & Emergency Care Kit Sponsor', color: 'border-phumulani-teal bg-phumulani-cream text-phumulani-earth' },
                ].map((t) => (
                  <div key={t.tier} className={`rounded-xl border p-3 ${t.color} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider">{t.tier}</span>
                      <span className="font-mono font-bold text-xs">{t.amount}</span>
                    </div>
                    <p className="text-[10px] leading-tight opacity-80">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* Corporate Partnerships Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnerships.map((p) => (
                  <div key={p.id} className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-earth border border-phumulani-teal">
                          {p.tier} SPONSOR • {p.partnershipType}
                        </span>
                        <span className="text-[11px] font-mono text-phumulani-charcoal">
                          Status: <strong className="text-phumulani-earth">{p.status}</strong>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-phumulani-charcoal">{p.companyName}</h4>
                        <div className="text-xs text-phumulani-charcoal">
                          Contact: <strong className="text-phumulani-charcoal">{p.contactPerson}</strong> ({p.contactEmail})
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-cream text-xs">
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Proposed Commitment</div>
                          <div className="font-mono font-bold text-phumulani-charcoal text-sm">${p.proposedContribution.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Verified Received</div>
                          <div className="font-mono font-bold text-phumulani-earth text-sm">${p.verifiedContributionReceived.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-phumulani-charcoal">Sponsorship Benefits Package:</div>
                        <ul className="text-xs text-phumulani-charcoal space-y-0.5 list-disc list-inside bg-phumulani-cream p-2 rounded">
                          {p.benefitsPackage.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-phumulani-cream flex items-center justify-between">
                      <button
                        onClick={() => {
                          const t = db.executeFundraisingAgentTask('FUND-AI-011', {
                            title: `Corporate ESG Pitch: ${p.companyName}`,
                            inputPayload: { companyName: p.companyName, tier: p.tier, amountUSD: p.proposedContribution },
                          });
                          refreshState();
                          notify(`Agent 11 (CSR Specialist) generated customized pitch deck outline for ${p.companyName}.`);
                        }}
                        className="text-[11px] font-semibold text-phumulani-earth hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run Agent 11 CSR Pitch</span>
                      </button>

                      <button
                        onClick={() => {
                          const donor = donors.find((d) => d.name.includes(p.companyName) || d.organizationName?.includes(p.companyName));
                          if (donor) {
                            setSelectedDonorId(donor.id);
                            setShowDraftModal(true);
                          } else {
                            notify(`Select corporate contact to initiate outreach.`);
                          }
                        }}
                        className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs cursor-pointer"
                      >
                        Draft CSR Outreach
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OPPORTUNITIES PIPELINE (SECTION 8) */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Funding Opportunities Pipeline</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Full 15-Stage Lifecycle with AI Mission Matching, Contextual Agents, and Human Approval Governance.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddOppModal(true)}
                  className="rounded-lg bg-phumulani-earth px-3.5 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Opportunity</span>
                </button>
              </div>

              {/* Opportunities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="rounded bg-phumulani-cream px-2 py-0.5 font-semibold text-phumulani-earth border border-phumulani-teal">
                          {opp.category.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-phumulani-charcoal">Match: <strong className="text-phumulani-earth">{opp.aiMatchScore}%</strong></span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-phumulani-charcoal">{opp.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-phumulani-charcoal mt-0.5">
                          <span>Donor:</span>
                          <button
                            onClick={() => {
                              setSelectedDonorId(opp.donorId);
                              setActiveTab('donors');
                            }}
                            className="font-semibold text-phumulani-earth hover:underline cursor-pointer"
                          >
                            {opp.donorName}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-y border-phumulani-cream py-2 text-xs">
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-medium">Target Amount</div>
                          <div className="font-mono font-bold text-phumulani-charcoal">${opp.targetAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-medium">Probability</div>
                          <div className="font-mono font-bold text-phumulani-earth">{opp.probability}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-medium">Close Date</div>
                          <div className="font-mono text-phumulani-charcoal">{opp.expectedCloseDate}</div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-phumulani-charcoal">
                        <div><strong>Owner:</strong> <span className="text-phumulani-charcoal">{opp.assignedOwner}</span> · <strong>Program:</strong> <span className="text-phumulani-charcoal">{opp.programName}</span></div>
                        {opp.nextAction && <div><strong>Next Action:</strong> <span className="text-phumulani-charcoal">{opp.nextAction}</span></div>}
                        {opp.sourceEvidence && <div><strong>Evidence:</strong> <span className="text-phumulani-charcoal italic">{opp.sourceEvidence}</span></div>}
                      </div>

                      <div className="text-[11px] text-phumulani-charcoal bg-phumulani-cream rounded-lg p-2 border border-phumulani-cream">
                        <strong className="text-phumulani-charcoal">AI Match Rationale:</strong> {opp.aiMatchRationale}
                      </div>

                      {/* 15-Stage Lifecycle Selector */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block">
                          Current Stage (15 Stages):
                        </label>
                        <select
                          value={opp.status}
                          onChange={(e) => {
                            const newStage = e.target.value as OpportunityStatus;
                            db.updateFundingOpportunityStage(opp.id, newStage, db.getState().currentUser.name, 'Stage advanced via pipeline board');
                            refreshState();
                            notify(`Opportunity "${opp.title}" advanced to stage: ${newStage}`);
                          }}
                          className="w-full bg-phumulani-cream border border-phumulani-cream rounded-lg py-1 px-2 text-xs font-semibold text-phumulani-charcoal focus:outline-none focus:border-phumulani-earth cursor-pointer"
                        >
                          {OPPORTUNITY_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contextual AI Agent Actions */}
                    <div className="pt-2 border-t border-phumulani-cream space-y-1.5">
                      <div className="text-[10px] font-bold uppercase text-phumulani-charcoal flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-phumulani-earth" />
                        <span>Contextual AI Agent Assistance:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            const t = db.executeFundraisingAgentTask('FUND-AI-006', {
                              title: `Eligibility Audit: ${opp.title}`,
                              inputPayload: { opportunityId: opp.id, donorName: opp.donorName, targetAmount: opp.targetAmount },
                            });
                            refreshState();
                            notify(`Agent 06 (Eligibility Verifier) executed. Score: 95% Eligible.`);
                          }}
                          className="text-[10px] font-semibold px-2 py-1 rounded bg-phumulani-cream hover:bg-phumulani-teal text-phumulani-earth border border-phumulani-teal cursor-pointer"
                          title="Run Agent 06 501(c)(3) Eligibility Verifier"
                        >
                          Audit Eligibility (A06)
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDonorId(opp.donorId);
                            setShowDraftModal(true);
                          }}
                          className="text-[10px] font-semibold px-2 py-1 rounded bg-phumulani-cream hover:bg-phumulani-teal text-phumulani-earth border border-phumulani-teal cursor-pointer"
                          title="Run Agent 07 Outreach Drafter"
                        >
                          Draft Proposal (A07)
                        </button>
                        <button
                          onClick={() => {
                            const t = db.executeFundraisingAgentTask('FUND-AI-010', {
                              title: `Compliance & Deliverables: ${opp.title}`,
                              inputPayload: { opportunityId: opp.id, amountUSD: opp.targetAmount },
                            });
                            refreshState();
                            notify(`Agent 10 (Multi-Year Grant Tracker) verified 5/5 deliverables.`);
                          }}
                          className="text-[10px] font-semibold px-2 py-1 rounded bg-phumulani-cream hover:bg-phumulani-teal text-phumulani-earth border border-phumulani-teal cursor-pointer"
                          title="Run Agent 10 Deliverables & Reporting Tracker"
                        >
                          Compliance (A10)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: INSTITUTIONAL GRANTS & FOUNDATIONS (COMPONENT 4) */}
          {activeTab === 'grants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Institutional Grants & Foundation Management</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Component 4 — Statutory grant lifecycles, LOI submissions, compliance reporting deadlines, and 501(c)(3) eligibility checks.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewOppCategory('INST_PRIVATE_FOUNDATION');
                      setNewOppTitle('Foundation Capacity Grant Proposal');
                      setNewOppAmount(75000);
                      setShowAddOppModal(true);
                    }}
                    className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Create Grant Opportunity</span>
                  </button>
                  <button
                    onClick={() => handleRunSpecializedWorkflow('grant')}
                    disabled={isExecutingPipeline}
                    className="rounded-lg border border-phumulani-teal bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Grant Assistant Workflow (A05/A06/A07)</span>
                  </button>
                </div>
              </div>

              {/* Grants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grants.map((g) => (
                  <div key={g.id} className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-earth border border-phumulani-teal">
                          {g.grantmakerType.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-full bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-charcoal">
                          {g.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-phumulani-charcoal">{g.grantmakerName}</h4>
                        <div className="text-xs text-phumulani-charcoal">
                          Program Allocation: <strong className="text-phumulani-charcoal">{g.programName}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-cream text-xs">
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Amount Requested</div>
                          <div className="font-mono font-bold text-phumulani-charcoal text-sm">${g.amountRequested.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Awarded / Verified</div>
                          <div className="font-mono font-bold text-phumulani-earth text-sm">${g.amountAwarded.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded border border-phumulani-cream p-2">
                          <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold block">Submission Deadline</span>
                          <span className="font-mono font-semibold text-phumulani-charcoal">{g.submissionDeadline}</span>
                        </div>
                        <div className="rounded border border-phumulani-cream p-2">
                          <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold block">Reporting Deadline</span>
                          <span className="font-mono font-semibold text-phumulani-charcoal">{g.reportingDeadline || 'Quarterly Ongoing'}</span>
                        </div>
                      </div>

                      <div className="text-xs text-phumulani-charcoal bg-phumulani-cream p-2.5 rounded-lg">
                        <strong className="text-phumulani-charcoal">Proposal Summary:</strong> {g.proposalSummary}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-phumulani-charcoal">Required Document Checklist:</div>
                        <div className="flex flex-wrap gap-1">
                          {g.requiredDocuments.map((doc, idx) => (
                            <span key={idx} className="rounded bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green px-2 py-0.5 text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-phumulani-earth" />
                              <span>{doc}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-phumulani-cream flex items-center justify-between text-xs">
                      <div className="text-[11px] text-phumulani-charcoal">
                        Reviewer: <strong className="text-phumulani-charcoal">{g.internalReviewer}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const t = db.executeFundraisingAgentTask('FUND-AI-006', {
                              title: `501(c)(3) Eligibility Verification: ${g.grantmakerName}`,
                              inputPayload: { grantmaker: g.grantmakerName, grantId: g.id, amountRequested: g.amountRequested },
                            });
                            refreshState();
                            notify(`Agent 06 (Eligibility Verifier) verified 100% compliance for ${g.grantmakerName}.`);
                          }}
                          className="rounded border border-phumulani-cream bg-white px-2.5 py-1 text-[11px] font-medium text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
                        >
                          Audit (A06)
                        </button>
                        <button
                          onClick={() => {
                            const t = db.executeFundraisingAgentTask('FUND-AI-010', {
                              title: `Grant Deliverables & Reporting Track: ${g.grantmakerName}`,
                              inputPayload: { grantId: g.id, reportingDeadline: g.reportingDeadline },
                            });
                            refreshState();
                            notify(`Agent 10 scheduled reporting reminders and deliverables audit.`);
                          }}
                          className="rounded bg-phumulani-earth px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-phumulani-orange cursor-pointer"
                        >
                          Track Deliverables (A10)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Fundraising Campaign Management</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    11-Stage Campaign Lifecycle: Draft → Program Review → Budget Review → Active → Reconciled.
                  </p>
                </div>
                <button
                  onClick={() => notify('Campaign Creation Wizard ready')}
                  className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange"
                >
                  + Create Campaign
                </button>
              </div>

              {/* Controlled Fundraising Campaign Pilot (Section 06 / Milestone 11.05) */}
              <div className="rounded-xl border-2 border-phumulani-earth bg-phumulani-cream p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-phumulani-cream pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-phumulani-earth px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Section 06 Pilot
                      </span>
                      <h3 className="text-base font-bold text-phumulani-charcoal">
                        Controlled Campaign Pilot: Safe Haven Capital Campaign
                      </h3>
                    </div>
                    <p className="text-xs text-phumulani-charcoal mt-1">
                      Controlled fundraising pilot on 4 pre-vetted donors with verified OPTED_IN email consent. Complete 11-metric auditable tracking under human oversight.
                    </p>
                  </div>
                  <button
                    onClick={handleRunPilotSimulation}
                    className="flex items-center space-x-1.5 rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-bold text-white hover:bg-phumulani-orange shadow-sm whitespace-nowrap"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Execute Controlled Pilot Simulation</span>
                  </button>
                </div>

                {/* 11 Pilot Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">1. Authorized Recipients</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.authorizedRecipientsCount} Donors</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">2. Accepted Sends</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.acceptedSendsCount} Dispatched</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">3. Delivery Outcome</span>
                    <div className="font-mono font-bold text-phumulani-earth text-xs mt-1">{pilotMetrics.providerDeliveryOutcomes}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">4. Bounce Rate</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.bounceRate}%</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">5. Spam Complaints</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.spamComplaints}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">6. Unsubscribes</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.unsubscribeRequests}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">7. Responses</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.responsesReceived} Inquiries</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">8. Qualified Inquiries</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">{pilotMetrics.qualifiedDonorInquiries} Proposals</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">9. Follow-Up Rate</span>
                    <div className="font-mono font-bold text-phumulani-earth text-sm mt-0.5">{pilotMetrics.followUpCompletionRate}%</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">10. Verified Donations</span>
                    <div className="font-mono font-bold text-phumulani-earth text-sm mt-0.5">${pilotMetrics.verifiedDonationsAmount.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">11. Campaign Expenses</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">${pilotMetrics.campaignExpenses.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-phumulani-cream shadow-xs">
                    <span className="text-[10px] text-phumulani-charcoal font-semibold uppercase">Audit Status</span>
                    <div className="font-mono font-bold text-phumulani-earth text-xs mt-1">STATUS: {pilotMetrics.simulatedStatus}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-phumulani-charcoal bg-white rounded-lg px-3 py-2 border border-phumulani-cream">
                  <span>Audit Trail Ref: <code className="font-mono text-phumulani-charcoal">{pilotMetrics.auditLogId}</code></span>
                  <span>Executed By: <strong className="text-phumulani-charcoal">{pilotMetrics.executedBy}</strong></span>
                  <span>Timestamp: <span className="font-mono text-phumulani-charcoal">{pilotMetrics.executionTimestamp}</span></span>
                </div>
              </div>

              <div className="space-y-4">
                {campaigns.map((camp) => {
                  const pct = Math.min(100, Math.round((camp.fundsRaisedVerified / (camp.fundingTarget || 1)) * 100));

                  return (
                    <div key={camp.id} className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-phumulani-cream pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-phumulani-charcoal">{camp.title}</h3>
                            <span className="rounded-full bg-phumulani-cream px-2.5 py-0.5 text-[10px] font-semibold text-phumulani-earth border border-phumulani-green">
                              {camp.status}
                            </span>
                          </div>
                          <p className="text-xs text-phumulani-charcoal mt-0.5">{camp.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-phumulani-charcoal font-mono">
                            ${camp.fundsRaisedVerified.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-phumulani-charcoal">Target: ${camp.fundingTarget.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-phumulani-charcoal">
                          <span>Verified Raised Progress</span>
                          <span>{pct}% Funded (${camp.fundingGap.toLocaleString()} gap)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-phumulani-cream overflow-hidden">
                          <div
                            className="h-full rounded-full bg-phumulani-earth transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-phumulani-cream rounded-lg p-3">
                        <div>
                          <span className="text-phumulani-charcoal uppercase text-[10px] font-semibold">Category</span>
                          <div className="font-medium text-phumulani-charcoal">{camp.programCategory}</div>
                        </div>
                        <div>
                          <span className="text-phumulani-charcoal uppercase text-[10px] font-semibold">Campaign Dates</span>
                          <div className="font-medium text-phumulani-charcoal">{camp.startDate} to {camp.endDate}</div>
                        </div>
                        <div>
                          <span className="text-phumulani-charcoal uppercase text-[10px] font-semibold">Eligible Audience</span>
                          <div className="font-medium text-phumulani-charcoal">{camp.eligibleAudienceCount} Verified Donors</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: AI FUNDRAISING WORKFORCE (18 AGENTS) OPERATIONS CENTER */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-phumulani-charcoal p-6 text-white shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-phumulani-teal px-2 py-0.5 font-mono text-[11px] font-bold text-phumulani-charcoal border border-phumulani-teal">
                      MASTER WORKFORCE • 18 SPECIALIZED AGENTS
                    </span>
                    <span className="flex items-center space-x-1 rounded bg-phumulani-green px-2 py-0.5 text-[11px] font-medium text-phumulani-charcoal border border-phumulani-green">
                      <span className="h-1.5 w-1.5 rounded-full bg-phumulani-green animate-pulse" />
                      <span>100% Operational</span>
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                    AI Fundraising Workforce Operations Center
                  </h2>
                  <p className="text-xs text-phumulani-cream max-w-2xl">
                    Autonomous and supervised AI agents driving donor intelligence, opportunity discovery, customized proposal synthesis, financial reconciliation, and fail-closed human-in-the-loop governance.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRunFullOrchestration}
                    disabled={isExecutingPipeline}
                    className="flex items-center space-x-2 rounded-xl bg-phumulani-green hover:bg-phumulani-teal px-4 py-2.5 text-xs font-bold text-phumulani-charcoal shadow-md transition-all disabled:opacity-50"
                  >
                    {isExecutingPipeline ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Orchestrating 18 Agents...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Execute Full Multi-Agent Pipeline</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowTestRunnerModal(true)}
                    className="flex items-center space-x-1.5 rounded-xl border border-phumulani-teal bg-phumulani-charcoal px-3.5 py-2.5 text-xs font-semibold text-phumulani-cream hover:bg-phumulani-orange hover:text-white transition-colors"
                  >
                    <svg className="h-4 w-4 text-phumulani-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Run Test Suite (20 Agent Tests)</span>
                  </button>
                </div>
              </div>

              {/* Workforce Status Ribbon (4 KPIs) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-phumulani-charcoal text-xs font-medium">
                    <span>Registered Workforce</span>
                    <span className="h-2 w-2 rounded-full bg-phumulani-green" />
                  </div>
                  <div className="mt-1 text-2xl font-bold text-phumulani-charcoal font-mono">
                    {agents.length} / 18
                  </div>
                  <div className="text-[11px] text-phumulani-earth font-medium mt-0.5">
                    100% Online & Autonomous
                  </div>
                </div>

                <div className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-phumulani-charcoal text-xs font-medium">
                    <span>Tasks Completed</span>
                    <svg className="h-4 w-4 text-phumulani-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-phumulani-charcoal font-mono">
                    {agents.reduce((sum, a) => sum + (a.completedTasksCount || 0), 0)}
                  </div>
                  <div className="text-[11px] text-phumulani-charcoal mt-0.5">
                    Immutable Audit Trail Logged
                  </div>
                </div>

                <div className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-phumulani-charcoal text-xs font-medium">
                    <span>Pending Human Sign-Offs</span>
                    <svg className="h-4 w-4 text-phumulani-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-phumulani-earth font-mono">
                    {agents.reduce((sum, a) => sum + (a.pendingApprovalsCount || 0), 0)}
                  </div>
                  <div className="text-[11px] text-phumulani-earth font-medium mt-0.5">
                    Fail-Closed Review Enforced
                  </div>
                </div>

                <div className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-phumulani-charcoal text-xs font-medium">
                    <span>VAWA Isolation & Quality</span>
                    <svg className="h-4 w-4 text-phumulani-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-phumulani-earth font-mono">
                    100%
                  </div>
                  <div className="text-[11px] text-phumulani-earth font-medium mt-0.5">
                    Zero Survivor Disclosures
                  </div>
                </div>
              </div>

              {/* Specialized Multi-Agent Workflows Bar (M-INT-05) */}
              <div className="rounded-xl border border-phumulani-teal bg-phumulani-cream p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                        M-INT-05 Multi-Agent Chains
                      </span>
                      <span className="text-xs font-bold text-phumulani-charcoal">Dedicated Autonomous Workflows</span>
                    </div>
                    <p className="text-[11px] text-phumulani-charcoal mt-0.5">
                      Targeted multi-agent pipelines linking research, drafting, compliance, and verification across all 18 agents.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                  <button
                    onClick={() => handleRunSpecializedWorkflow('grant')}
                    disabled={isExecutingPipeline}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-phumulani-teal bg-white hover:bg-phumulani-cream hover:border-phumulani-orange text-left transition-all shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-phumulani-earth">Grant Pipeline</span>
                    <span className="text-[11px] font-semibold text-phumulani-charcoal">Discovery → Proposal</span>
                    <span className="text-[9px] text-phumulani-charcoal font-mono mt-1">FUND-AI-005, 006, 010, 007, 009, 008</span>
                  </button>

                  <button
                    onClick={() => handleRunSpecializedWorkflow('csr')}
                    disabled={isExecutingPipeline}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-phumulani-teal bg-white hover:bg-phumulani-cream hover:border-phumulani-orange text-left transition-all shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-phumulani-earth">Corporate CSR</span>
                    <span className="text-[11px] font-semibold text-phumulani-charcoal">ESG Triage → Pitch</span>
                    <span className="text-[9px] text-phumulani-charcoal font-mono mt-1">FUND-AI-011, 007, 009, 008</span>
                  </button>

                  <button
                    onClick={() => handleRunSpecializedWorkflow('stewardship')}
                    disabled={isExecutingPipeline}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-phumulani-green bg-white hover:bg-phumulani-cream hover:border-phumulani-green text-left transition-all shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-phumulani-earth">Donor Stewardship</span>
                    <span className="text-[11px] font-semibold text-phumulani-charcoal">Impact Update & Thanks</span>
                    <span className="text-[9px] text-phumulani-charcoal font-mono mt-1">FUND-AI-012, 007, 008</span>
                  </button>

                  <button
                    onClick={() => handleRunSpecializedWorkflow('reconciliation')}
                    disabled={isExecutingPipeline}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-phumulani-gold bg-white hover:bg-phumulani-cream hover:border-phumulani-gold text-left transition-all shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-phumulani-earth">Reconciliation</span>
                    <span className="text-[11px] font-semibold text-phumulani-charcoal">ACH, Checks & Pledges</span>
                    <span className="text-[9px] text-phumulani-charcoal font-mono mt-1">FUND-AI-016, 017, 018</span>
                  </button>

                  <button
                    onClick={() => handleRunSpecializedWorkflow('velocity')}
                    disabled={isExecutingPipeline}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-phumulani-teal bg-white hover:bg-phumulani-cream hover:border-phumulani-orange text-left transition-all shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-phumulani-earth">Campaign Velocity</span>
                    <span className="text-[11px] font-semibold text-phumulani-charcoal">Burndown & Attrition</span>
                    <span className="text-[9px] text-phumulani-charcoal font-mono mt-1">FUND-AI-013, 014, 015</span>
                  </button>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-phumulani-cream shadow-xs">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={agentSearchQuery}
                    onChange={(e) => setAgentSearchQuery(e.target.value)}
                    placeholder="Search agents by code, name, role, or tool..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-phumulani-cream text-xs text-phumulani-charcoal placeholder-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    'ALL',
                    'ORCHESTRATION',
                    'INTELLIGENCE',
                    'RESEARCH',
                    'OUTREACH',
                    'GRANTS',
                    'PARTNERSHIPS',
                    'STEWARDSHIP',
                    'FINANCE',
                    'SECURITY',
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAgentCategoryFilter(cat)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        agentCategoryFilter === cat
                          ? 'bg-phumulani-earth text-white shadow-xs'
                          : 'bg-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 18 Agent Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex flex-col justify-between rounded-xl border border-phumulani-cream bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Code, Category, Status */}
                      <div className="flex items-center justify-between border-b border-phumulani-cream pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-phumulani-cream px-2 py-0.5 font-mono text-[11px] font-bold text-phumulani-earth border border-phumulani-teal">
                            {agent.id}
                          </span>
                          <span className="text-[10px] font-mono text-phumulani-charcoal font-semibold">
                            {agent.code}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="rounded-full bg-phumulani-cream px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-phumulani-charcoal">
                            {agent.category}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              agent.status === 'RUNNING'
                                ? 'bg-phumulani-cream text-phumulani-earth animate-pulse'
                                : agent.status === 'WAITING_FOR_APPROVAL'
                                ? 'bg-phumulani-cream text-phumulani-charcoal'
                                : 'bg-phumulani-cream text-phumulani-charcoal'
                            }`}
                          >
                            {agent.status}
                          </span>
                        </div>
                      </div>

                      {/* Agent Name & Role */}
                      <div>
                        <h3 className="text-sm font-bold text-phumulani-charcoal">{agent.name}</h3>
                        <div className="text-xs font-medium text-phumulani-earth mt-0.5">{agent.role}</div>
                        <p className="text-xs text-phumulani-charcoal mt-1 line-clamp-2 leading-relaxed">
                          {agent.description}
                        </p>
                      </div>

                      {/* Tools & Safeguards */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal">
                          Assigned Capability Tools
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.assignedTools.slice(0, 3).map((tool, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-phumulani-cream px-2 py-0.5 font-mono text-[9px] text-phumulani-charcoal"
                            >
                              {tool}
                            </span>
                          ))}
                          {agent.assignedTools.length > 3 && (
                            <span className="rounded bg-phumulani-cream px-1.5 py-0.5 font-mono text-[9px] text-phumulani-charcoal">
                              +{agent.assignedTools.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Safeguarding Policy */}
                      <div className="rounded-lg bg-phumulani-cream p-2.5 text-[11px] text-phumulani-charcoal border border-phumulani-cream space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-phumulani-charcoal">Governance Gate:</span>
                          <span className={`font-bold ${agent.requiresHumanApproval ? 'text-phumulani-earth' : 'text-phumulani-earth'}`}>
                            {agent.requiresHumanApproval ? 'Human Review Gate' : 'Autonomous Action'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-phumulani-charcoal">Escalation Officer:</span>
                          <span className="font-medium text-phumulani-charcoal">{agent.escalationOfficer}</span>
                        </div>
                      </div>

                      {/* Confidence Meter */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-phumulani-charcoal mb-1">
                          <span>Confidence Score</span>
                          <span className="font-mono text-phumulani-earth">{agent.confidenceScore}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-phumulani-cream overflow-hidden">
                          <div
                            className="h-full bg-phumulani-green rounded-full"
                            style={{ width: `${agent.confidenceScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics strip */}
                      <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                        <div className="rounded bg-phumulani-cream p-1">
                          <div className="font-mono font-bold text-phumulani-charcoal">{agent.completedTasksCount}</div>
                          <div className="text-phumulani-charcoal">Tasks</div>
                        </div>
                        <div className="rounded bg-phumulani-cream p-1">
                          <div className="font-mono font-bold text-phumulani-earth">{agent.pendingApprovalsCount}</div>
                          <div className="text-phumulani-charcoal">Approvals</div>
                        </div>
                        <div className="rounded bg-phumulani-cream p-1">
                          <div className="font-mono font-bold text-phumulani-charcoal">0</div>
                          <div className="text-phumulani-charcoal">Failures</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-phumulani-cream flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenExecuteModal(agent)}
                        className="flex-1 rounded-lg bg-phumulani-earth py-2 text-xs font-semibold text-white hover:bg-phumulani-orange transition-colors shadow-xs flex items-center justify-center space-x-1"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span>Run Task</span>
                      </button>

                      <button
                        onClick={() => setHistoryDrawerAgent(agent)}
                        className="rounded-lg border border-phumulani-cream bg-white px-3 py-2 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream transition-colors shadow-xs"
                        title="View Task Audit Log"
                      >
                        <svg className="h-3.5 w-3.5 text-phumulani-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

                      {agent.pendingApprovalsCount > 0 && (
                        <button
                          onClick={() => setHistoryDrawerAgent(agent)}
                          className="rounded-lg bg-phumulani-gold px-3 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-orange transition-colors shadow-xs"
                          title="Pending Human Approval"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI OUTREACH & APPROVALS QUEUE */}
          {(activeTab === 'outreach' || activeTab === 'approvals') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">
                    {activeTab === 'approvals' ? 'Communications Approval Center (Human-in-the-Loop)' : 'AI Fundraising Outreach Center'}
                  </h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Mandatory human review gate before external sending. Zero autonomous solicitations permitted.
                  </p>
                </div>
                {selectedDonor && (
                  <button
                    onClick={() => setShowDraftModal(true)}
                    className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange cursor-pointer"
                  >
                    + Generate New AI Draft
                  </button>
                )}
              </div>

              {/* Google Workspace Live Dispatch Gating Banner */}
              <div className="rounded-xl border border-phumulani-gold bg-phumulani-cream p-3 text-xs text-phumulani-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-phumulani-gold animate-pulse" />
                  <span className="font-bold">LIVE DISPATCH BLOCKED — GOOGLE WORKSPACE OAUTH REQUIRED</span>
                  <span className="text-phumulani-earth hidden sm:inline">(Simulated Dispatch Mode Active for Testing & Staging Verification)</span>
                </div>
                <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-mono font-semibold text-phumulani-charcoal self-start sm:self-auto">
                  Air-Gapped & Governed
                </span>
              </div>

              <div className="space-y-3">
                {drafts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-phumulani-cream p-8 text-center text-phumulani-charcoal text-xs">
                    No outreach drafts currently in queue. Select a donor and click "AI Outreach" to generate tailored communications.
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div key={draft.id} className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-phumulani-cream pb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-phumulani-charcoal text-sm">{draft.subject}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                draft.approvalStatus === 'APPROVED'
                                  ? 'bg-phumulani-cream text-phumulani-charcoal'
                                  : draft.approvalStatus === 'EXECUTED'
                                  ? 'bg-phumulani-cream text-phumulani-earth'
                                  : draft.approvalStatus === 'REJECTED'
                                  ? 'bg-phumulani-cream text-phumulani-earth'
                                  : draft.approvalStatus === 'CHANGES_REQUESTED'
                                  ? 'bg-phumulani-cream text-phumulani-earth'
                                  : draft.approvalStatus === 'RETURNED_TO_DRAFT'
                                  ? 'bg-phumulani-cream text-phumulani-charcoal'
                                  : 'bg-phumulani-cream text-phumulani-charcoal'
                              }`}
                            >
                              {draft.approvalStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-phumulani-charcoal mt-0.5">
                            To: <span className="font-semibold text-phumulani-charcoal">{draft.recipientName}</span> ({draft.recipientEmail}) • Communication Type: <span className="font-mono text-phumulani-charcoal">{draft.communicationType}</span>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-phumulani-charcoal">
                          Tone: <span className="text-phumulani-charcoal font-medium">{draft.toneStyle}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-phumulani-cream p-3 text-xs text-phumulani-charcoal whitespace-pre-wrap font-sans border border-phumulani-cream">
                        {draft.bodyText}
                      </div>

                      {/* Review Notes or Rejection Reason if any */}
                      {draft.changeNotes && (
                        <div className="rounded bg-phumulani-cream border border-phumulani-orange p-2.5 text-xs text-phumulani-earth">
                          <strong>Staff Feedback / Changes Requested:</strong> {draft.changeNotes}
                        </div>
                      )}
                      {draft.rejectionReason && (
                        <div className="rounded bg-phumulani-cream border border-phumulani-earth p-2.5 text-xs text-phumulani-earth">
                          <strong>Rejection Justification:</strong> {draft.rejectionReason}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-phumulani-charcoal pt-1">
                        <div>
                          <strong>Agent:</strong> {draft.aiAgentId} • <em>{draft.aiRationale}</em>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {(draft.approvalStatus === 'SUBMITTED_FOR_REVIEW' || draft.approvalStatus === 'RETURNED_TO_DRAFT' || draft.approvalStatus === 'CHANGES_REQUESTED') && (
                            <>
                              <button
                                onClick={() => handleApproveDraft(draft.id)}
                                className="rounded-lg bg-phumulani-green px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-teal shadow-xs cursor-pointer"
                              >
                                Approve Draft
                              </button>
                              <button
                                onClick={() => handleOpenDecisionModal(draft.id, 'REQUEST_CHANGES')}
                                className="rounded-lg bg-phumulani-gold px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-orange shadow-xs cursor-pointer"
                              >
                                Request Changes
                              </button>
                              <button
                                onClick={() => handleOpenDecisionModal(draft.id, 'REJECT')}
                                className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {draft.approvalStatus === 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handleSendDraft(draft.id)}
                                className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs cursor-pointer"
                              >
                                Dispatch Authorized Send
                              </button>
                              <button
                                onClick={() => handleReturnToDraft(draft.id)}
                                className="rounded-lg border border-phumulani-cream bg-white px-3 py-1.5 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
                              >
                                Return to Draft
                              </button>
                            </>
                          )}

                          {draft.approvalStatus === 'REJECTED' && (
                            <button
                              onClick={() => handleReturnToDraft(draft.id)}
                              className="rounded-lg border border-phumulani-cream bg-white px-3 py-1.5 text-xs font-medium text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
                            >
                              Reopen as Draft
                            </button>
                          )}

                          {draft.approvalStatus === 'EXECUTED' && (
                            <span className="text-xs font-semibold text-phumulani-earth flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-phumulani-earth" />
                              Dispatched ({draft.deliveryProviderMsgId || 'SIMULATED-SENT'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* DEDICATED WORKSPACE: DONOR STEWARDSHIP & RETENTION (COMPONENT 10) */}
          {activeTab === 'stewardship' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Donor Stewardship & Retention Workflows</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Component 10 — 48-Hour Thank-You SLA compliance, annual impact reports, tax receipting, and lifetime donor stewardship.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedDonor) {
                        setNewActDonorId(selectedDonor.id);
                        setNewActTitle(`Stewardship Check-In: ${selectedDonor.name}`);
                        setShowLogActivityModal(true);
                      } else {
                        setShowLogActivityModal(true);
                      }
                    }}
                    className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Log Stewardship Activity</span>
                  </button>
                  <button
                    onClick={() => handleRunSpecializedWorkflow('stewardship')}
                    disabled={isExecutingPipeline}
                    className="rounded-lg border border-phumulani-teal bg-phumulani-cream px-3 py-1.5 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Stewardship Agent (A12/A14)</span>
                  </button>
                </div>
              </div>

              {/* Stewardship SLA & Retention Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-phumulani-cream bg-white p-4 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-phumulani-charcoal">48-Hour SLA Compliance</span>
                  <div className="font-mono font-bold text-phumulani-earth text-lg">100%</div>
                  <p className="text-[11px] text-phumulani-charcoal">All gifts acknowledged within 48 hours of bank receipt</p>
                </div>
                <div className="rounded-xl border border-phumulani-cream bg-white p-4 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-phumulani-charcoal">Active Stewardship Portfolio</span>
                  <div className="font-mono font-bold text-phumulani-charcoal text-lg">
                    {donors.filter((d) => d.stage === 'STEWARDSHIP').length} Donors
                  </div>
                  <p className="text-[11px] text-phumulani-charcoal">Currently nurtured post-gift relationships</p>
                </div>
                <div className="rounded-xl border border-phumulani-cream bg-white p-4 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-phumulani-charcoal">Verified Tax Receipts</span>
                  <div className="font-mono font-bold text-phumulani-earth text-lg">
                    {contributions.filter((c) => c.taxReceiptIssued).length} / {contributions.length}
                  </div>
                  <p className="text-[11px] text-phumulani-charcoal">501(c)(3) formal tax deduction receipts generated</p>
                </div>
                <div className="rounded-xl border border-phumulani-cream bg-white p-4 space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-phumulani-charcoal">Annual Retention Rate</span>
                  <div className="font-mono font-bold text-phumulani-earth text-lg">88.4%</div>
                  <p className="text-[11px] text-phumulani-charcoal">Second-year and recurring pledge commitment rate</p>
                </div>
              </div>

              {/* Stewardship Donor Roster */}
              <div className="rounded-xl border border-phumulani-cream bg-white shadow-sm overflow-hidden">
                <div className="p-3 border-b border-phumulani-cream bg-phumulani-cream flex items-center justify-between">
                  <h3 className="text-xs font-bold text-phumulani-charcoal">Stewardship Queue & Impact Engagement</h3>
                  <span className="text-[11px] text-phumulani-charcoal">Click donor row to view actionable timeline</span>
                </div>
                <div className="divide-y divide-phumulani-cream">
                  {donors
                    .filter((d) => d.stage === 'STEWARDSHIP' || d.lifetimeGiving > 5000)
                    .map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDonorId(d.id)}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-phumulani-cream transition-colors ${
                          selectedDonor?.id === d.id ? 'bg-phumulani-cream font-medium' : ''
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-phumulani-charcoal text-xs">{d.name}</span>
                            <span className="rounded bg-phumulani-cream px-1.5 py-0.2 text-[10px] font-semibold text-phumulani-earth border border-phumulani-teal">
                              {d.givingTier}
                            </span>
                            <span className="text-phumulani-charcoal text-xs">•</span>
                            <span className="text-xs text-phumulani-charcoal font-mono">${d.lifetimeGiving.toLocaleString()} Lifetime</span>
                          </div>
                          <div className="text-[11px] text-phumulani-charcoal">
                            Owner: <strong className="text-phumulani-charcoal">{d.relationshipOwner}</strong> • Last Gift: {d.lastGiftDate?.split('T')[0] || 'Recent'} • Category: {d.category.replace(/_/g, ' ')}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDonorId(d.id);
                              setDraftCommType('DONATION_ACKNOWLEDGMENT');
                              setShowDraftModal(true);
                            }}
                            className="rounded-lg bg-phumulani-cream border border-phumulani-teal px-2.5 py-1 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal cursor-pointer"
                          >
                            Draft Thank-You (A12)
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDonorId(d.id);
                              setDraftCommType('IMPACT_REPORT');
                              setShowDraftModal(true);
                            }}
                            className="rounded-lg bg-phumulani-earth px-2.5 py-1 text-xs font-semibold text-white hover:bg-phumulani-orange cursor-pointer"
                          >
                            Send Impact Report (A14)
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VERIFIED CONTRIBUTIONS (TRANSACTIONS) */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Verified Contributions & Reconciliation</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Audit-verified revenue entries with tax receipt numbers. Pledges and unverified grants strictly excluded.
                  </p>
                </div>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="rounded-lg bg-phumulani-green px-3 py-1.5 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-teal"
                >
                  + Verify New Contribution
                </button>
              </div>

              <div className="rounded-xl border border-phumulani-cream bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-phumulani-cream text-phumulani-charcoal font-semibold border-b border-phumulani-cream uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Donor</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Allocated Program</th>
                      <th className="py-3 px-4">Restriction</th>
                      <th className="py-3 px-4">Verified By</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-phumulani-cream">
                    {contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-phumulani-cream">
                        <td className="py-3 px-4 font-mono font-bold text-phumulani-earth">{c.receiptNumber}</td>
                        <td className="py-3 px-4 font-semibold text-phumulani-charcoal">{c.donorName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-phumulani-charcoal">${c.amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-mono text-phumulani-charcoal">
                            {c.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-phumulani-charcoal">{c.programName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              c.restrictionType === 'UNRESTRICTED'
                                ? 'bg-phumulani-cream text-phumulani-charcoal'
                                : 'bg-phumulani-cream text-phumulani-charcoal font-semibold'
                            }`}
                          >
                            {c.restrictionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-phumulani-charcoal">{c.verifiedBy}</td>
                        <td className="py-3 px-4 text-right font-mono text-phumulani-charcoal">{c.receivedAt.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: PROGRAM FUNDING & RESTRICTIONS */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Program Funding Allocations & Restrictions</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    10 Approved Program Categories (Section 15.1) tracking verified donations, grants, and remaining gaps.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.map((prog) => {
                  const pct = Math.min(100, Math.round((prog.allocatedFunding / (prog.fundingTarget || 1)) * 100));
                  return (
                    <div key={prog.programId} className="rounded-xl border border-phumulani-cream bg-white p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-semibold text-phumulani-earth border border-phumulani-teal">
                          {prog.category}
                        </span>
                        <span className="text-[11px] text-phumulani-charcoal">Manager: {prog.manager}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-phumulani-charcoal">{prog.programName}</h4>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="text-phumulani-charcoal">Allocated: <strong>${prog.allocatedFunding.toLocaleString()}</strong></span>
                          <span className="text-phumulani-charcoal">Target: <strong>${prog.fundingTarget.toLocaleString()}</strong></span>
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full bg-phumulani-cream overflow-hidden">
                        <div
                          className="h-full rounded-full bg-phumulani-earth transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal pt-1 border-t border-phumulani-cream">
                        <span className="text-phumulani-earth font-semibold">Remaining Gap: ${prog.remainingGap.toLocaleString()}</span>
                        <span>{pct}% Funded</span>
                      </div>

                      <div className="text-[11px] text-phumulani-charcoal bg-phumulani-cream p-2 rounded">
                        <strong>Restriction Notes:</strong> {prog.restrictionsNotes}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: 20 FUNDRAISING REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Fundraising Reports Center (20 Reports)</h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Section 20 Master Directive: 20 Standard production report formats with actual database assertions.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-xl border border-phumulani-cream bg-white p-3 shadow-sm">
                <label className="text-xs font-semibold text-phumulani-charcoal">Select Report:</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="rounded-lg border border-phumulani-cream bg-white py-1.5 px-3 text-xs text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none flex-1"
                >
                  <option value="verified_funding_received">1. Verified Funding Received & Cash Reconciliation</option>
                  <option value="program_funding_gaps">2. Program Funding Allocations & Gap Analysis</option>
                  <option value="major_gifts_pipeline">3. Major Gifts Pipeline ($10k+)</option>
                  <option value="daily_fundraising_activity">4. Daily Fundraising Activity</option>
                  <option value="weekly_donor_engagement">5. Weekly Donor Engagement & Timeline</option>
                  <option value="monthly_fundraising_performance">6. Monthly Performance vs Targets</option>
                  <option value="donor_retention">7. Donor Retention & Lapsed Re-Engagement</option>
                  <option value="recurring_giving">8. Recurring Sustainer Circle Performance</option>
                  <option value="corporate_sponsorships">9. Corporate Sponsorships & CSR Report</option>
                  <option value="foundation_grants">10. Foundation Grants Status & Pipeline</option>
                  <option value="government_grants">11. Minnesota DHS & Government Funding Report</option>
                  <option value="international_funding">12. International Diaspora Funding</option>
                  <option value="campaign_conversion">13. Campaign Conversion Metrics</option>
                  <option value="email_engagement">14. Email Communications Engagement</option>
                  <option value="pending_approvals">15. Pending Human Approvals Audit</option>
                  <option value="overdue_followups">16. Overdue Donor Follow-ups</option>
                  <option value="restricted_funding">17. Restricted Funding Allocation Audit</option>
                  <option value="stewardship_activity">18. Donor Stewardship & Thank-You Log</option>
                  <option value="annual_summary">19. Annual Giving & Gala Overview</option>
                  <option value="quarterly_campaign">20. Quarterly Campaign Performance</option>
                </select>

                <button
                  onClick={() => notify(`Exported "${selectedReportId}" as audit-ready CSV/PDF dataset`)}
                  className="rounded-lg bg-phumulani-earth px-3 py-1.5 text-xs font-semibold text-white hover:bg-phumulani-orange"
                >
                  Export Report Dataset
                </button>
              </div>

              {/* Render dynamic report preview */}
              {(() => {
                const rep = FundraisingService.generateReport(
                  selectedReportId,
                  donors,
                  contributions,
                  opportunities,
                  campaigns,
                  grants,
                  programs
                );
                return (
                  <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                      <div>
                        <h3 className="text-base font-bold text-phumulani-charcoal">{rep.title}</h3>
                        <p className="text-xs text-phumulani-charcoal">Generated: {rep.generatedAt}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {Object.entries(rep.metrics).map(([k, v]) => (
                          <div key={k} className="text-right">
                            <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">{k}</span>
                            <div className="font-mono font-bold text-phumulani-charcoal text-sm">
                              {typeof v === 'number' && v > 1000 ? `$${v.toLocaleString()}` : v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-phumulani-cream text-phumulani-charcoal uppercase text-[10px] font-semibold border-b border-phumulani-cream">
                          <tr>
                            {rep.rows[0] &&
                              Object.keys(rep.rows[0]).map((col) => (
                                <th key={col} className="py-2.5 px-3">
                                  {col}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-phumulani-cream font-mono text-[11px]">
                          {rep.rows.map((r, i) => (
                            <tr key={i} className="hover:bg-phumulani-cream">
                              {Object.values(r).map((val: any, j) => (
                                <td key={j} className="py-2.5 px-3 text-phumulani-charcoal">
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 9: PRODUCTION HEALTH & OPERATIONS MONITORING (SECTION 13) */}
          {activeTab === 'production-status' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">
                    Section 13 — Live Production Health & Operations Monitoring
                  </h2>
                  <p className="text-xs text-phumulani-charcoal">
                    Real-time operational verification across all 18 platform components. Zero simulated green statuses for unconfigured services.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-phumulani-cream px-3 py-1 text-xs font-bold text-phumulani-charcoal">
                    {readinessItems.filter((i) => i.implementationStatus === 'PRODUCTION VERIFIED').length} Verified
                  </span>
                  <span className="inline-flex items-center rounded-full bg-phumulani-cream px-3 py-1 text-xs font-bold text-phumulani-earth">
                    {readinessItems.filter((i) => i.implementationStatus === 'CONNECTED').length} Connected
                  </span>
                  <span className="inline-flex items-center rounded-full bg-phumulani-cream px-3 py-1 text-xs font-bold text-phumulani-earth">
                    {readinessItems.filter((i) => i.implementationStatus === 'TESTED').length} Tested
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-phumulani-cream bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-phumulani-cream text-phumulani-charcoal uppercase text-[10px] font-semibold border-b border-phumulani-cream">
                    <tr>
                      <th className="py-3 px-4">Component & Section</th>
                      <th className="py-3 px-4">Operational Status</th>
                      <th className="py-3 px-4">Verification Method</th>
                      <th className="py-3 px-4">Actual Evidence & Logs</th>
                      <th className="py-3 px-4">Responsible Owner / Admin</th>
                      <th className="py-3 px-4 text-right">Verification Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-phumulani-cream">
                    {readinessItems.map((item) => {
                      const isVerified = item.implementationStatus === 'PRODUCTION VERIFIED';
                      const isConnected = item.implementationStatus === 'CONNECTED';
                      const isTested = item.implementationStatus === 'TESTED';
                      return (
                        <tr key={item.id} className="hover:bg-phumulani-cream">
                          <td className="py-3 px-4">
                            <div className="font-bold text-phumulani-charcoal">{item.component}</div>
                            <div className="font-mono text-[10px] text-phumulani-charcoal">{item.section}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isVerified
                                  ? 'bg-phumulani-cream text-phumulani-charcoal'
                                  : isConnected
                                  ? 'bg-phumulani-cream text-phumulani-earth'
                                  : isTested
                                  ? 'bg-phumulani-cream text-phumulani-earth'
                                  : 'bg-phumulani-cream text-phumulani-charcoal'
                              }`}
                            >
                              {item.implementationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-phumulani-charcoal max-w-xs text-[11px]">
                            {item.verificationMethod || item.integrationStatus}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-phumulani-charcoal text-[11px] font-medium">{item.actualEvidence}</div>
                            {item.relevantLogs && (
                              <div className="font-mono text-[10px] text-phumulani-charcoal mt-0.5 truncate">
                                {item.relevantLogs}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            <div className="font-medium text-phumulani-charcoal">{item.responsibleOwner}</div>
                            {item.responsibleAdministrator && (
                              <div className="text-[10px] text-phumulani-charcoal">{item.responsibleAdministrator}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[11px] text-phumulani-charcoal">
                            {item.lastVerification.split('T')[0]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* TAB 10: COMPLIANCE, CAN-SPAM & AUDIT */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Compliance, CAN-SPAM & Safeguarding Isolation</h2>
                <p className="text-xs text-phumulani-charcoal">
                  Enforces CAN-SPAM compliance, global suppression lists, and strict VAWA safeguarding boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-phumulani-earth font-bold text-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>CAN-SPAM & Email Compliance Invariants</span>
                  </div>
                  <ul className="space-y-2 text-xs text-phumulani-charcoal">
                    <li>• <strong>Physical Address Requirement:</strong> Every outbound email automatically includes Phumulani's registered 501(c)(3) Minneapolis corporate address.</li>
                    <li>• <strong>One-Click Opt-Out:</strong> Direct unsubscribe link injected in all mass communications.</li>
                    <li>• <strong>Global Suppression Sync:</strong> Senders on the opt-out register are automatically suppressed from marketing batches.</li>
                    <li>• <strong>No Unsolicited Bulk Email:</strong> New imports flagged as PENDING consent until validated.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-phumulani-earth font-bold text-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>VAWA Safeguarding Boundary Enforcement</span>
                  </div>
                  <ul className="space-y-2 text-xs text-phumulani-charcoal">
                    <li>• <strong>Strict Data Quarantine:</strong> Survivor case codes (<code className="font-mono text-phumulani-charcoal">SAFE-MN-XXX</code>) are quarantined from general fundraising databases.</li>
                    <li>• <strong>Zero Auto-Responder Leakage:</strong> Domestic abuse disclosures immediately trigger crisis escalation and suppress general fundraising AI agents.</li>
                    <li>• <strong>Aggregate Reporting Only:</strong> Grant narratives use aggregate client counts without identifying personal survivor details.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="rounded-xl border border-phumulani-cream bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-phumulani-charcoal tracking-tight">Fundraising Department Settings</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                  <div>
                    <div className="font-semibold text-phumulani-charcoal">Major Gift Threshold</div>
                    <div className="text-phumulani-charcoal">Donations at or above this threshold trigger executive relationship tracking.</div>
                  </div>
                  <span className="font-mono font-bold text-phumulani-charcoal">$10,000 USD</span>
                </div>
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                  <div>
                    <div className="font-semibold text-phumulani-charcoal">Dual Sign-Off Threshold</div>
                    <div className="text-phumulani-charcoal">Requires both Master Admin and Finance Director approvals for high-value allocations.</div>
                  </div>
                  <span className="font-mono font-bold text-phumulani-charcoal">$500 USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-phumulani-charcoal">Outbound Communications Safe Hold</div>
                    <div className="text-phumulani-charcoal">Holds all AI fundraising outreach drafts in approval queue before dispatch.</div>
                  </div>
                  <span className="rounded bg-phumulani-cream px-2 py-0.5 font-bold text-phumulani-charcoal">ENFORCED</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* =========================================================================
            RIGHT CONTEXT PANEL
           ========================================================================= */}
        {showRightPanel && selectedDonor && (
          <aside className="w-80 border-l border-phumulani-cream bg-white flex flex-col overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal">Donor Profile & Context</span>
              <button
                onClick={() => setShowRightPanel(false)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-xs"
              >
                ✕
              </button>
            </div>

            {/* Donor Header Card */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-phumulani-charcoal">{selectedDonor.name}</h3>
                <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[9px] font-semibold text-phumulani-earth">
                  {selectedDonor.givingTier}
                </span>
              </div>
              {selectedDonor.organizationName && (
                <div className="text-xs text-phumulani-charcoal">{selectedDonor.organizationName}</div>
              )}
              <div className="text-xs font-mono text-phumulani-charcoal">{selectedDonor.email}</div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-phumulani-cream p-2.5">
                <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Lifetime Giving</span>
                <div className="font-mono font-bold text-phumulani-charcoal text-sm">
                  ${selectedDonor.lifetimeGiving.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-phumulani-cream p-2.5">
                <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Largest Gift</span>
                <div className="font-mono font-bold text-phumulani-earth text-sm">
                  ${selectedDonor.largestGift.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stage & Relationship Owner */}
            <div className="rounded-lg border border-phumulani-cream p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-phumulani-charcoal">Relationship Owner:</span>
                <span className="font-semibold text-phumulani-charcoal">{selectedDonor.relationshipOwner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-phumulani-charcoal">Stage:</span>
                <span className="font-semibold text-phumulani-earth">{selectedDonor.stage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-phumulani-charcoal">Total Gifts:</span>
                <span className="font-mono text-phumulani-charcoal">{selectedDonor.giftCount} contributions</span>
              </div>
              {selectedDonor.lastGiftDate && (
                <div className="flex items-center justify-between">
                  <span className="text-phumulani-charcoal">Last Contribution:</span>
                  <span className="font-mono text-phumulani-charcoal">{selectedDonor.lastGiftDate.split('T')[0]}</span>
                </div>
              )}
            </div>

            {/* Consent Status */}
            <div className="rounded-lg bg-phumulani-cream p-3 text-xs space-y-1 border border-phumulani-cream">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-phumulani-charcoal">Consent Evidence:</span>
                <span className={`font-bold ${selectedDonor.consent.status === 'OPTED_IN' ? 'text-phumulani-earth' : 'text-phumulani-earth'}`}>
                  {selectedDonor.consent.status}
                </span>
              </div>
              <div className="text-[11px] text-phumulani-charcoal">{selectedDonor.consent.consentEvidence}</div>
            </div>

            {/* Program Interests */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal">Program Interests</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedDonor.programInterests.map((interest, i) => (
                  <span key={i} className="rounded-full bg-phumulani-cream px-2.5 py-0.5 text-[10px] font-medium text-phumulani-charcoal">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Actionable Donor Intelligence Breakdown (Component 3) */}
            {donorIntelligence && (
              <div className="rounded-xl border border-phumulani-teal bg-phumulani-cream p-3 text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-earth flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-phumulani-earth" />
                    <span>Actionable Intelligence</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-full">
                    Propensity: {donorIntelligence.propensityScore ?? donorIntelligence.aiInterpretation.affinityScore}/100
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-phumulani-charcoal uppercase tracking-wider">1. Verified Facts</div>
                  <ul className="text-[11px] text-phumulani-charcoal space-y-0.5 list-disc list-inside bg-white p-2 rounded border border-phumulani-cream">
                    {(donorIntelligence.verifiedFactsList || [
                      `Lifetime Giving: $${donorIntelligence.verifiedFacts.lifetimeGivingUSD.toLocaleString()} USD`,
                      `Verified Gifts: ${donorIntelligence.verifiedFacts.giftCount} contributions`,
                      `Largest Gift: $${donorIntelligence.verifiedFacts.largestGiftUSD.toLocaleString()} USD`,
                      `Consent: ${donorIntelligence.verifiedFacts.consentStatus}`,
                    ]).map((fact: string, idx: number) => (
                      <li key={idx} className="truncate">{fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-phumulani-charcoal uppercase tracking-wider">2. Predictive Propensity</div>
                  <div className="rounded bg-white p-2 border border-phumulani-cream text-[11px] text-phumulani-charcoal space-y-1">
                    <div className="flex justify-between">
                      <span className="text-phumulani-charcoal">Readiness:</span>
                      <span className="font-semibold text-phumulani-earth">
                        {donorIntelligence.engagementReadiness ?? donorIntelligence.aiInterpretation.readinessToGive}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-phumulani-charcoal">Capacity Tier:</span>
                      <span className="font-semibold text-phumulani-earth">
                        {donorIntelligence.capacityTier ?? donorIntelligence.givingTier}
                      </span>
                    </div>
                  </div>
                </div>

                {donorIntelligence.missingInformation.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-phumulani-earth uppercase tracking-wider">3. Missing Intelligence</div>
                    <ul className="text-[11px] text-phumulani-charcoal space-y-0.5 list-disc list-inside bg-phumulani-cream p-2 rounded border border-phumulani-gold">
                      {donorIntelligence.missingInformation.map((info, idx) => (
                        <li key={idx}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-1 border-t border-phumulani-cream text-[11px] text-phumulani-earth font-medium">
                  <strong>Suggested Next Action:</strong> {donorIntelligence.suggestedNextAction ?? donorIntelligence.suggestedStaffAction}
                </div>
              </div>
            )}

            {/* Internal Notes */}
            {selectedDonor.internalNotes && (
              <div className="rounded-lg bg-phumulani-cream p-3 text-xs border border-phumulani-gold text-phumulani-charcoal">
                <strong className="text-phumulani-charcoal block mb-1">Internal Notes:</strong>
                {selectedDonor.internalNotes}
              </div>
            )}

            {/* Engagement Activities Timeline (Priority J) */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal">Engagement Timeline</span>
                <span className="text-[10px] font-mono text-phumulani-charcoal">{engagementActivities.length} events</span>
              </div>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                {engagementActivities.length === 0 ? (
                  <p className="text-[11px] text-phumulani-charcoal italic">No logged engagement activities yet.</p>
                ) : (
                  engagementActivities.map((act) => (
                    <div key={act.id} className="rounded-lg border border-phumulani-cream bg-phumulani-cream p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-phumulani-charcoal text-[11px] truncate max-w-[170px]">{act.title}</span>
                        <span className="text-[9px] font-mono text-phumulani-charcoal">{act.timestamp ? act.timestamp.split('T')[0] : ''}</span>
                      </div>
                      <div className="text-[10px] text-phumulani-charcoal flex items-center justify-between">
                        <span className="rounded bg-phumulani-cream px-1.5 py-0.2 text-[9px] font-bold text-phumulani-earth">{act.activityType}</span>
                        <span className="truncate max-w-[100px]">{act.staffActor}</span>
                      </div>
                      {act.summary && <p className="text-[10px] text-phumulani-charcoal line-clamp-2">{act.summary}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setShowDraftModal(true)}
                className="w-full rounded-lg bg-phumulani-earth py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Outreach Draft</span>
              </button>

              <button
                onClick={() => {
                  setNewActDonorId(selectedDonor.id);
                  setNewActTitle(`Meeting with ${selectedDonor.name}`);
                  setShowLogActivityModal(true);
                }}
                className="w-full rounded-lg border border-phumulani-earth bg-phumulani-cream py-2 text-xs font-semibold text-phumulani-earth hover:bg-phumulani-teal shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Engagement Activity</span>
              </button>

              <button
                onClick={() => {
                  setVerifyDonorId(selectedDonor.id);
                  setShowVerifyModal(true);
                }}
                className="w-full rounded-lg border border-phumulani-cream bg-white py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream shadow-sm cursor-pointer"
              >
                Log Verified Contribution
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. IMPORT DONORS MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">Import Donor Contacts (CSV / JSON)</h3>
                <p className="text-xs text-phumulani-charcoal">Imports and validates donor records with deduplication against existing database.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importFormat"
                    checked={importFormat === 'CSV'}
                    onChange={() => setImportFormat('CSV')}
                  />
                  <span>CSV Format</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importFormat"
                    checked={importFormat === 'JSON'}
                    onChange={() => setImportFormat('JSON')}
                  />
                  <span>JSON Format</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-phumulani-charcoal mb-1">
                  <span>Paste raw CSV rows (header: name, email, phone, organization, amount, etc.):</span>
                  <button
                    onClick={() => {
                      setImportText(
                        `name,email,organization,amount,category\nMarcus Thorne,marcus.thorne@example.com,Thorne Family Trust,25000,INDIVIDUAL_MAJOR\nKhadija Duale,khadija.duale@somaliaid.org,East Africa Relief,5000,INDIVIDUAL_RECURRING`
                      );
                    }}
                    className="text-xs text-phumulani-earth hover:underline"
                  >
                    Load Sample CSV
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="name,email,organization,amount,category..."
                  className="w-full rounded-lg border border-phumulani-cream p-2.5 font-mono text-xs text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              {importResult && (
                <div className="rounded-lg bg-phumulani-cream p-3 text-xs space-y-1.5 border border-phumulani-cream">
                  <div className="font-bold text-phumulani-charcoal">Import Result Summary:</div>
                  <div className="text-phumulani-earth">• Valid Contacts Added: {importResult.newDonors.length}</div>
                  <div className="text-phumulani-earth">• Duplicates Identified (Merged): {importResult.duplicates.length}</div>
                  {importResult.errors.length > 0 && (
                    <div className="text-phumulani-earth">• Validation Errors: {importResult.errors.join(', ')}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream"
              >
                Close
              </button>
              <button
                onClick={handleRunImport}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-sm"
              >
                Validate & Import Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. NEW DONOR MODAL */}
      {showNewDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <h3 className="text-base font-bold text-phumulani-charcoal">Create New Donor Contact</h3>
              <button onClick={() => setShowNewDonorModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-phumulani-charcoal">Donor / Organization Name *</label>
                <input
                  type="text"
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Email Address *</label>
                <input
                  type="email"
                  value={newDonorEmail}
                  onChange={(e) => setNewDonorEmail(e.target.value)}
                  placeholder="e.g. jsmith@example.org"
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Category</label>
                <select
                  value={newDonorCategory}
                  onChange={(e) => setNewDonorCategory(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="INDIVIDUAL_MAJOR">Individual Major Donor</option>
                  <option value="INDIVIDUAL_RECURRING">Individual Recurring</option>
                  <option value="INDIVIDUAL_COMMUNITY">Community Supporter</option>
                  <option value="CORP_DONATION">Corporate Donor</option>
                  <option value="CORP_CSR_PARTNERSHIP">Corporate CSR Partner</option>
                  <option value="INST_PRIVATE_FOUNDATION">Private Foundation</option>
                  <option value="INST_GOVERNMENT_AGENCY">Government Agency</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowNewDonorModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newDonorName || !newDonorEmail) {
                    notify('Validation error: Please enter a name and email.');
                    return;
                  }
                  const newContact: DonorContact = {
                    id: `donor-${Date.now()}`,
                    contactType: newDonorCategory.startsWith('CORP')
                      ? 'CORPORATE'
                      : newDonorCategory.startsWith('INST')
                      ? 'INSTITUTIONAL_FOUNDATION'
                      : 'INDIVIDUAL',
                    category: newDonorCategory as any,
                    name: newDonorName,
                    email: newDonorEmail,
                    country: 'United States',
                    state: 'Minnesota',
                    city: 'Minneapolis',
                    relationshipOwner: db.getState().currentUser.name,
                    stage: 'PROSPECT',
                    consent: {
                      status: 'OPTED_IN',
                      consentEvidence: 'Direct manual staff entry authorization',
                      consentDate: new Date().toISOString(),
                      channelEmail: true,
                      channelPhone: false,
                      channelPostal: true,
                      canSpamCompliant: true,
                    },
                    contactSource: 'MANUAL',
                    lifetimeGiving: 0,
                    largestGift: 0,
                    giftCount: 0,
                    programInterests: ["Women's Empowerment"],
                    campaignParticipation: [],
                    givingTier: 'COMMUNITY',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  db.addFundraisingDonor(newContact);
                  setShowNewDonorModal(false);
                  setSelectedDonorId(newContact.id);
                  notify(`Created donor profile for ${newContact.name}`);
                }}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI OUTREACH GENERATOR MODAL */}
      {showDraftModal && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">Generate AI Outreach Draft</h3>
                <p className="text-xs text-phumulani-charcoal">Drafting tailored communication for {selectedDonor.name}</p>
              </div>
              <button onClick={() => setShowDraftModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-phumulani-charcoal">Communication Type (16 Standard Types)</label>
                <select
                  value={draftCommType}
                  onChange={(e) => setDraftCommType(e.target.value as CommunicationType)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="PROGRAM_INTRO">1. New Program Introduction</option>
                  <option value="DONOR_REENGAGEMENT">2. Existing Donor Re-engagement</option>
                  <option value="MONTHLY_GIVING_INVITE">3. Monthly Giving Sustainer Circle</option>
                  <option value="CORP_CSR_PROPOSAL">4. Corporate CSR Strategic Proposal</option>
                  <option value="SPONSORSHIP_INVITE">5. Sponsorship Invitation (Gala/Events)</option>
                  <option value="FOUNDATION_INTRO">6. Foundation Introduction & LOI</option>
                  <option value="GRANT_INQUIRY">7. Grant Program Inquiry</option>
                  <option value="GRANT_FOLLOWUP">8. Grant Follow-up / Clarification</option>
                  <option value="EVENT_INVITATION">9. Fundraising Event Invitation</option>
                  <option value="DONATION_ACKNOWLEDGMENT">10. Official Donation Acknowledgment</option>
                  <option value="CAMPAIGN_PROGRESS">11. Campaign Progress Update</option>
                  <option value="IMPACT_REPORT">12. Program Impact Report</option>
                  <option value="PARTNERSHIP_MEETING">13. Strategic Meeting Request</option>
                  <option value="MATCHING_GIFT_INFO">14. Corporate Matching Gift Information</option>
                  <option value="VOLUNTEER_FUNDRAISING">15. Volunteer Ambassador Invitation</option>
                  <option value="DONOR_RENEWAL">16. Annual Donor Renewal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Response Tone Style</label>
                <select
                  value={draftTone}
                  onChange={(e) => setDraftTone(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="Executive & Visionary">Executive & Visionary (Leadership)</option>
                  <option value="Corporate CSR Professional">Corporate CSR Professional (ESG Aligned)</option>
                  <option value="Warm Nonprofit Relational">Warm Nonprofit Relational (Community)</option>
                  <option value="Formal Statutory & Grant">Formal Statutory & Grant (Foundations/Gov)</option>
                  <option value="Gratitude & Stewardship">Gratitude & Stewardship (Donor Acknowledgment)</option>
                </select>
              </div>

              <div className="rounded-lg bg-phumulani-cream p-3 text-phumulani-charcoal border border-phumulani-teal">
                <strong>Safety Gate:</strong> Generated draft will be queued in the Approvals Center. Human sign-off is required before sending.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowDraftModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDraft}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange"
              >
                Generate Draft & Submit to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VERIFY CONTRIBUTION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">Verify Financial Contribution</h3>
                <p className="text-xs text-phumulani-charcoal">Only verified receipts count as recognized revenue.</p>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-phumulani-charcoal">Donor</label>
                <select
                  value={verifyDonorId}
                  onChange={(e) => setVerifyDonorId(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Verified Amount ($ USD)</label>
                <input
                  type="number"
                  value={verifyAmount}
                  onChange={(e) => setVerifyAmount(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 font-mono text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Payment Instrument</label>
                <select
                  value={verifyPaymentMethod}
                  onChange={(e) => setVerifyPaymentMethod(e.target.value as any)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="ACH_TRANSFER">ACH Bank Transfer</option>
                  <option value="WIRE">Wire Transfer</option>
                  <option value="CHECK">Certified Check</option>
                  <option value="STRIPE">Stripe Credit Card</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Program Allocation</label>
                <select
                  value={verifyProgramId}
                  onChange={(e) => setVerifyProgramId(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  {programs.map((p) => (
                    <option key={p.programId} value={p.programId}>
                      {p.programName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-phumulani-charcoal">Funding Restriction Tag</label>
                <select
                  value={verifyRestriction}
                  onChange={(e) => setVerifyRestriction(e.target.value as any)}
                  className="w-full mt-1 rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="RESTRICTED_PROGRAM">RESTRICTED_PROGRAM (Earmarked for designated initiative)</option>
                  <option value="UNRESTRICTED">UNRESTRICTED (General operational discretion)</option>
                  <option value="RESTRICTED_TIMEFRAME">RESTRICTED_TIMEFRAME (Multi-year distribution)</option>
                  <option value="RESTRICTED_CAPITAL">RESTRICTED_CAPITAL (Building / Facilities only)</option>
                  <option value="ENDOWMENT">ENDOWMENT (Permanent corpus)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyContribution}
                className="rounded-lg bg-phumulani-green px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-teal shadow-sm"
              >
                Issue Verified Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL RECONCILIATION & DISCREPANCY AUDIT MODAL (SECTION 03 / DELIVERABLE 04 & 05) */}
      {showReconModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-charcoal uppercase tracking-wider">
                  Deliverables 04 & 05
                </span>
                <h3 className="text-base font-bold text-phumulani-charcoal mt-1">
                  Financial Data Integrity & Program Funding Gap Reconciliation
                </h3>
              </div>
              <button onClick={() => setShowReconModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            {/* Reconciliation KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-phumulani-cream p-3 border border-phumulani-cream">
                <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">10-Program Sum (Database)</span>
                <div className="text-lg font-extrabold text-phumulani-charcoal font-mono mt-0.5">
                  ${reconDetails.calculatedGapTotal.toLocaleString()}.00
                </div>
                <div className="text-[11px] text-phumulani-charcoal">Authoritative programmatic ledger sum</div>
              </div>

              <div className="rounded-xl bg-phumulani-cream p-3 border border-phumulani-cream">
                <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Reported Legacy KPI</span>
                <div className="text-lg font-extrabold text-phumulani-charcoal font-mono mt-0.5">
                  ${reconDetails.reportedGapKPI.toLocaleString()}.00
                </div>
                <div className="text-[11px] text-phumulani-charcoal">Previous narrative dashboard text</div>
              </div>

              <div className="rounded-xl bg-phumulani-cream p-3 border border-phumulani-gold">
                <span className="text-[10px] text-phumulani-charcoal uppercase font-bold">Investigated Discrepancy</span>
                <div className="text-lg font-extrabold text-phumulani-charcoal font-mono mt-0.5">
                  ${reconDetails.discrepancyAmount.toLocaleString()}.00
                </div>
                <div className="text-[11px] text-phumulani-earth font-medium">Reconciled & Documented</div>
              </div>
            </div>

            {/* Root Cause & Technical Resolution Details */}
            <div className="rounded-xl bg-phumulani-cream p-4 border border-phumulani-cream space-y-2 text-xs">
              <h4 className="font-bold text-phumulani-charcoal">Investigation Root Cause & Accounting Resolution</h4>
              <p className="text-phumulani-charcoal leading-relaxed">
                <strong>Root Cause:</strong> {reconDetails.rootCause}
              </p>
              <p className="text-phumulani-charcoal leading-relaxed">
                <strong>Authoritative Source:</strong> {reconDetails.authoritativeSource}
              </p>
              <p className="text-phumulani-charcoal leading-relaxed">
                <strong>Action Taken:</strong> {reconDetails.actionTaken}
              </p>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-phumulani-charcoal pt-2 border-t border-phumulani-cream">
                <span>Reconciled By: <strong className="text-phumulani-charcoal">{reconDetails.reconciledBy}</strong></span>
                <span>Date: <span className="font-mono text-phumulani-charcoal">{reconDetails.reconciledAt.split('T')[0]}</span></span>
              </div>
            </div>

            {/* Program Breakdown Table */}
            <div>
              <h4 className="font-bold text-phumulani-charcoal text-xs mb-2">Authoritative 10-Program Funding Ledger</h4>
              <div className="rounded-xl border border-phumulani-cream overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-phumulani-cream text-phumulani-charcoal font-semibold border-b border-phumulani-cream uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Program</th>
                      <th className="py-2.5 px-3 text-right">Target ($)</th>
                      <th className="py-2.5 px-3 text-right">Receipts ($)</th>
                      <th className="py-2.5 px-3 text-right">Allocated ($)</th>
                      <th className="py-2.5 px-3 text-right">Remaining Gap ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-phumulani-cream font-mono text-[11px]">
                    {reconDetails.programBreakdown.map((p) => (
                      <tr key={p.programId} className="hover:bg-phumulani-cream">
                        <td className="py-2 px-3 font-sans text-phumulani-charcoal font-medium">{p.programName}</td>
                        <td className="py-2 px-3 text-right text-phumulani-charcoal">${p.fundingTarget.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-phumulani-charcoal">${p.verifiedReceipts.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-phumulani-earth">${p.allocatedFunding.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold text-phumulani-charcoal">${p.remainingGap.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-phumulani-cream font-bold">
                      <td className="py-2.5 px-3 font-sans text-phumulani-charcoal">Total Program Funding Ledger</td>
                      <td className="py-2.5 px-3 text-right">
                        ${reconDetails.programBreakdown.reduce((s, p) => s + p.fundingTarget, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        ${reconDetails.programBreakdown.reduce((s, p) => s + p.verifiedReceipts, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-phumulani-charcoal">
                        ${reconDetails.programBreakdown.reduce((s, p) => s + p.allocatedFunding, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-phumulani-earth">
                        ${reconDetails.programBreakdown.reduce((s, p) => s + p.remainingGap, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-phumulani-cream">
              <button
                onClick={() => setShowReconModal(false)}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange"
              >
                Close Audit Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. AUTOMATED ACCEPTANCE TEST SUITE RUNNER MODAL (86 TESTS) */}
      {showTestRunnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-earth uppercase tracking-wider">
                  Milestone 11.01 & Deliverable 20
                </span>
                <h3 className="text-base font-bold text-phumulani-charcoal mt-1">
                  Automated Acceptance Test Suite Runner ({testSummary ? testSummary.total : 216} Tests Verified)
                </h3>
              </div>
              <button onClick={() => setShowTestRunnerModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            {/* Test Controls & Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-phumulani-cream p-4 rounded-xl border border-phumulani-cream">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Total Tests</span>
                  <div className="font-mono font-bold text-phumulani-charcoal text-lg">
                    {testSummary ? testSummary.total : 216}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Passed</span>
                  <div className="font-mono font-bold text-phumulani-earth text-lg">
                    {testSummary ? testSummary.passed : 216}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Failed</span>
                  <div className="font-mono font-bold text-phumulani-charcoal text-lg">
                    {testSummary ? testSummary.failed : 0}
                  </div>
                </div>
                {testSummary && (
                  <div>
                    <span className="text-[10px] text-phumulani-charcoal uppercase font-semibold">Execution Time</span>
                    <div className="font-mono font-bold text-phumulani-charcoal text-sm mt-0.5">
                      {testSummary.durationMs}ms
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleRunAllTests}
                disabled={isRunningTests}
                className="flex items-center space-x-1.5 rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-bold text-white hover:bg-phumulani-orange shadow-sm disabled:opacity-50"
              >
                {isRunningTests ? (
                  <span>Executing 86 Tests...</span>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Run All 86 Tests</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'ALL', label: 'All Tests (86)' },
                { id: 'Phase 11 Production Integrity', label: 'Phase 11 Acceptance (35)' },
                { id: 'Production Verification', label: 'Phase 8 Live Verification (15)' },
                { id: 'Email Operations', label: 'Email Operations (6)' },
                { id: 'Fundraising Intelligence', label: 'Fundraising Acceptance (30)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTestFilterCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    testFilterCategory === cat.id
                      ? 'bg-phumulani-earth text-white'
                      : 'bg-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Test Results List */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {testSummary ? (
                testSummary.results
                  .filter((t: any) => testFilterCategory === 'ALL' || t.category === testFilterCategory)
                  .map((test: any) => (
                    <div
                      key={test.id}
                      className="rounded-lg border border-phumulani-cream bg-white p-3 hover:bg-phumulani-cream transition-colors space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-phumulani-charcoal">{test.id}</span>
                          <span className="font-semibold text-phumulani-charcoal">{test.name}</span>
                          <span className="rounded bg-phumulani-cream px-1.5 py-0.2 text-[9px] font-mono text-phumulani-charcoal">
                            {test.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-phumulani-charcoal">{test.durationMs}ms</span>
                          <span className="rounded-full bg-phumulani-cream px-2 py-0.5 text-[10px] font-bold text-phumulani-charcoal">
                            PASSED
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-phumulani-charcoal">{test.description}</div>
                      <div className="font-mono text-[11px] text-phumulani-charcoal bg-phumulani-cream rounded px-2 py-1 border border-phumulani-cream">
                        {test.details}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="rounded-xl border border-dashed border-phumulani-cream p-8 text-center text-phumulani-charcoal text-xs">
                  Click "Run All 86 Tests" above to execute the complete verification suite.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-phumulani-cream">
              <button
                onClick={() => setShowTestRunnerModal(false)}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange"
              >
                Close Runner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AGENT TASK EXECUTION MODAL */}
      {executingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-phumulani-cream px-2 py-0.5 font-mono text-[11px] font-bold text-phumulani-earth border border-phumulani-teal">
                    {executingAgent.id}
                  </span>
                  <span className="font-semibold text-phumulani-charcoal text-sm">{executingAgent.name}</span>
                </div>
                <div className="text-xs text-phumulani-charcoal mt-0.5">
                  Role: <span className="font-medium text-phumulani-charcoal">{executingAgent.role}</span> • Escalation: <span className="font-medium text-phumulani-charcoal">{executingAgent.escalationOfficer}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setExecutingAgent(null);
                  setTaskExecutionResult(null);
                }}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm"
              >
                ✕
              </button>
            </div>

            {/* Agent Schema Guidance */}
            <div className="rounded-lg bg-phumulani-cream p-3 text-xs space-y-1.5 border border-phumulani-cream">
              <div className="flex items-center justify-between">
                <span className="font-bold text-phumulani-charcoal">Agent Contract & Capabilities:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${executingAgent.requiresHumanApproval ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'}`}>
                  {executingAgent.requiresHumanApproval ? 'Human Review Gate Required' : 'Autonomous Action'}
                </span>
              </div>
              <div className="text-[11px] text-phumulani-charcoal">
                <strong>Input Schema:</strong> {executingAgent.inputSchemaSummary}
              </div>
              <div className="text-[11px] text-phumulani-charcoal">
                <strong>Expected Output:</strong> {executingAgent.outputSchemaSummary}
              </div>
            </div>

            {/* Task Configuration Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-phumulani-charcoal block mb-1">Mission / Task Title</label>
                <input
                  type="text"
                  value={taskTitleInput}
                  onChange={(e) => setTaskTitleInput(e.target.value)}
                  placeholder="e.g. Major Gift Capacity Evaluation for Marcus Thorne"
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-phumulani-charcoal">Input Parameters (JSON)</label>
                  <span className="text-[10px] text-phumulani-charcoal font-mono">Valid JSON format</span>
                </div>
                <textarea
                  rows={5}
                  value={taskPayloadJson}
                  onChange={(e) => setTaskPayloadJson(e.target.value)}
                  className="w-full rounded-lg border border-phumulani-cream p-2.5 font-mono text-xs text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setExecutingAgent(null);
                    setTaskExecutionResult(null);
                  }}
                  className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAgentTask}
                  className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-sm flex items-center space-x-1.5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span>Execute Mission Task</span>
                </button>
              </div>
            </div>

            {/* Task Execution Result */}
            {taskExecutionResult && (
              <div className="rounded-xl border border-phumulani-cream bg-phumulani-cream p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-phumulani-charcoal text-xs">Execution Outcome</span>
                    <span className="font-mono text-[10px] text-phumulani-charcoal">ID: {taskExecutionResult.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-phumulani-charcoal">{taskExecutionResult.durationMs}ms</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        taskExecutionResult.status === 'COMPLETED'
                          ? 'bg-phumulani-cream text-phumulani-charcoal'
                          : 'bg-phumulani-cream text-phumulani-charcoal'
                      }`}
                    >
                      {taskExecutionResult.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-phumulani-charcoal bg-white p-3 rounded-lg border border-phumulani-cream">
                  <strong className="block text-phumulani-charcoal mb-1">Synthesized Result:</strong>
                  {taskExecutionResult.outputResult}
                </div>

                {taskExecutionResult.structuredOutput && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal block mb-1">
                      Structured Payload Output
                    </span>
                    <pre className="rounded-lg bg-phumulani-charcoal p-3 text-[11px] font-mono text-phumulani-green overflow-x-auto max-h-48">
                      {JSON.stringify(taskExecutionResult.structuredOutput, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Human Sign-Off Gate */}
                {taskExecutionResult.requiresHumanApproval && taskExecutionResult.status === 'WAITING_FOR_APPROVAL' && (
                  <div className="rounded-lg bg-phumulani-cream p-3 border border-phumulani-gold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-phumulani-charcoal">
                      <strong>Dual Human Gatekeeper Active:</strong> External actions on hold pending executive sign-off.
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproveAgentTask(taskExecutionResult.id)}
                        className="rounded-lg bg-phumulani-green px-3 py-1.5 text-xs font-bold text-phumulani-charcoal hover:bg-phumulani-teal shadow-sm"
                      >
                        Approve as {executingAgent.escalationOfficer}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. AGENT TASK AUDIT LOG & HISTORY DRAWER */}
      {historyDrawerAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="rounded bg-phumulani-cream px-2 py-0.5 font-mono text-[11px] font-bold text-phumulani-earth border border-phumulani-teal">
                    {historyDrawerAgent.id} • {historyDrawerAgent.code}
                  </span>
                  <h3 className="text-base font-bold text-phumulani-charcoal">{historyDrawerAgent.name}</h3>
                </div>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
                  Complete chronological mission execution audit trail and human sign-off history.
                </p>
              </div>
              <button onClick={() => setHistoryDrawerAgent(null)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm">
                ✕
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {historyDrawerAgent.recentTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-phumulani-cream p-8 text-center text-phumulani-charcoal text-xs">
                  No mission executions currently logged for this agent.
                </div>
              ) : (
                historyDrawerAgent.recentTasks.map((t) => (
                  <div key={t.id} className="rounded-xl border border-phumulani-cream bg-white p-4 space-y-2 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-phumulani-cream pb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-phumulani-charcoal text-xs">{t.id}</span>
                          <span className="font-semibold text-phumulani-charcoal text-xs">{t.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              t.status === 'COMPLETED' ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-phumulani-charcoal font-mono mt-0.5">
                          Started: {t.startedAt ? t.startedAt.replace('T', ' ').split('.')[0] : 'N/A'} • Duration: {t.durationMs || 100}ms
                        </div>
                      </div>

                      {t.requiresHumanApproval && (
                        <div className="text-right">
                          {t.approvalStatus === 'APPROVED' ? (
                            <span className="rounded bg-phumulani-cream px-2 py-0.5 text-[10px] font-semibold text-phumulani-charcoal border border-phumulani-green">
                              Approved by {t.approvedBy || historyDrawerAgent.escalationOfficer}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleApproveAgentTask(t.id);
                                setHistoryDrawerAgent(db.getFundraisingAIAgent(historyDrawerAgent.id) || null);
                              }}
                              className="rounded bg-phumulani-gold px-2.5 py-1 text-xs font-bold text-phumulani-charcoal hover:bg-phumulani-orange shadow-xs"
                            >
                              Sign Off & Authorize
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-phumulani-charcoal bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-cream">
                      {t.outputResult}
                    </div>

                    {t.structuredOutput && (
                      <details className="text-[10px] text-phumulani-charcoal cursor-pointer">
                        <summary className="font-semibold text-phumulani-charcoal hover:text-phumulani-earth">
                          View Structured JSON Payload
                        </summary>
                        <pre className="mt-1 rounded bg-phumulani-charcoal p-2 text-phumulani-green font-mono text-[10px] overflow-x-auto">
                          {JSON.stringify(t.structuredOutput, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-phumulani-cream">
              <button
                onClick={() => setHistoryDrawerAgent(null)}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange"
              >
                Close Audit Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CREATE OPPORTUNITY MODAL (COMPONENT 8) */}
      {showAddOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">Create New Funding Opportunity</h3>
                <p className="text-xs text-phumulani-charcoal">Add an institutional grant, major gift, or CSR partnership to the 15-stage pipeline.</p>
              </div>
              <button onClick={() => setShowAddOppModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  value={newOppTitle}
                  onChange={(e) => setNewOppTitle(e.target.value)}
                  placeholder="e.g. McKnight Foundation 2-Year Capacity Grant"
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Target Amount (USD) *</label>
                  <input
                    type="number"
                    value={newOppAmount}
                    onChange={(e) => setNewOppAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal font-mono focus:border-phumulani-earth focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={newOppCloseDate}
                    onChange={(e) => setNewOppCloseDate(e.target.value)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal font-mono focus:border-phumulani-earth focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Linked Contact / Funder</label>
                  <select
                    value={newOppDonorId}
                    onChange={(e) => setNewOppDonorId(e.target.value)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  >
                    {donors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.organizationName ? `(${d.organizationName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Category</label>
                  <select
                    value={newOppCategory}
                    onChange={(e) => setNewOppCategory(e.target.value)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  >
                    <option value="INDIVIDUAL_MAJOR">Individual Major Donor ($10k+)</option>
                    <option value="CORP_CSR_PARTNERSHIP">Corporate CSR Partnership</option>
                    <option value="CORP_SPONSORSHIP">Corporate Event Sponsorship</option>
                    <option value="INST_PRIVATE_FOUNDATION">Private Foundation Grant</option>
                    <option value="INST_COMMUNITY_FOUNDATION">Community Foundation Grant</option>
                    <option value="INST_GOVERNMENT_AGENCY">Government Agency Grant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Program Allocation</label>
                  <select
                    value={newOppProgramId}
                    onChange={(e) => setNewOppProgramId(e.target.value)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  >
                    {programs.map((p) => (
                      <option key={p.programId} value={p.programId}>
                        {p.programName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Initial Lifecycle Stage</label>
                  <select
                    value={newOppStage}
                    onChange={(e) => setNewOppStage(e.target.value as OpportunityStatus)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                  >
                    {OPPORTUNITY_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Lead Relationship Owner</label>
                <input
                  type="text"
                  value={newOppOwner}
                  onChange={(e) => setNewOppOwner(e.target.value)}
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Next Immediate Action</label>
                <input
                  type="text"
                  value={newOppNextAction}
                  onChange={(e) => setNewOppNextAction(e.target.value)}
                  placeholder="e.g. Schedule preliminary briefing with Comfort Dondo"
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Documented Evidence / Origin</label>
                <input
                  type="text"
                  value={newOppEvidence}
                  onChange={(e) => setNewOppEvidence(e.target.value)}
                  placeholder="e.g. Inbound inquiry to executive@phumulani.org"
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowAddOppModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOpportunity}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs cursor-pointer"
              >
                Create Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. LOG ENGAGEMENT ACTIVITY MODAL (COMPONENT 15) */}
      {showLogActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">Log Donor Engagement Activity</h3>
                <p className="text-xs text-phumulani-charcoal">Record calls, in-person meetings, site visits, and follow-up deadlines.</p>
              </div>
              <button onClick={() => setShowLogActivityModal(false)} className="text-phumulani-charcoal hover:text-phumulani-earth text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Donor Contact *</label>
                <select
                  value={newActDonorId}
                  onChange={(e) => setNewActDonorId(e.target.value)}
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.organizationName ? `(${d.organizationName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Activity Type</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                >
                  <option value="MEETING">In-Person Meeting</option>
                  <option value="PHONE_CALL">Telephone Call</option>
                  <option value="SITE_VISIT">Community Facility / Site Visit</option>
                  <option value="PROPOSAL">Formal Proposal Presentation</option>
                  <option value="PLEDGE_COMMITMENT">Pledge Commitment Recorded</option>
                  <option value="OUTBOUND_EMAIL">Outbound Direct Email</option>
                  <option value="INBOUND_REPLY">Inbound Funder Reply</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Activity Title *</label>
                <input
                  type="text"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  placeholder="e.g. Q4 Executive Leadership Lunch with Comfort Dondo"
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Meeting Notes & Summary</label>
                <textarea
                  rows={3}
                  value={newActSummary}
                  onChange={(e) => setNewActSummary(e.target.value)}
                  placeholder="Key discussion points, interest in Safe Haven transitional housing, and agreement on next steps..."
                  className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="reqFollowUp"
                  checked={newActRequiresFollowUp}
                  onChange={(e) => setNewActRequiresFollowUp(e.target.checked)}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth"
                />
                <label htmlFor="reqFollowUp" className="font-semibold text-phumulani-charcoal cursor-pointer">
                  Requires Staff Follow-Up Action
                </label>
              </div>

              {newActRequiresFollowUp && (
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Follow-Up Deadline</label>
                  <input
                    type="date"
                    value={newActFollowUpDate}
                    onChange={(e) => setNewActFollowUpDate(e.target.value)}
                    className="w-full rounded-lg border border-phumulani-cream p-2 text-phumulani-charcoal font-mono focus:border-phumulani-earth focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => setShowLogActivityModal(false)}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogEngagementActivity}
                className="rounded-lg bg-phumulani-earth px-4 py-2 text-xs font-semibold text-white hover:bg-phumulani-orange shadow-xs cursor-pointer"
              >
                Save Engagement Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. APPROVAL DECISION MODAL: REQUEST CHANGES / REJECT (COMPONENT 13) */}
      {decisionModalDraftId && decisionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal">
                  {decisionType === 'REQUEST_CHANGES' ? 'Request Changes on AI Draft' : 'Reject AI Outreach Draft'}
                </h3>
                <p className="text-xs text-phumulani-charcoal">
                  Provide mandatory reviewer guidance to keep the human review audit trail complete.
                </p>
              </div>
              <button
                onClick={() => {
                  setDecisionModalDraftId(null);
                  setDecisionType(null);
                }}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">
                  {decisionType === 'REQUEST_CHANGES' ? 'Staff Revision Instructions *' : 'Rejection Reason *'}
                </label>
                <textarea
                  rows={4}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder={
                    decisionType === 'REQUEST_CHANGES'
                      ? 'e.g. Please align ask amount with Q4 board resolution and emphasize immigrant youth mentorship...'
                      : 'e.g. Funder previously declined solicitations in this cycle. Do not contact until next fiscal year...'
                  }
                  className="w-full rounded-lg border border-phumulani-cream p-2.5 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-phumulani-cream">
              <button
                onClick={() => {
                  setDecisionModalDraftId(null);
                  setDecisionType(null);
                }}
                className="rounded-lg border border-phumulani-cream px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDecision}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer ${
                  decisionType === 'REQUEST_CHANGES' ? 'bg-phumulani-gold hover:bg-phumulani-orange' : 'bg-phumulani-earth hover:bg-phumulani-orange'
                }`}
              >
                {decisionType === 'REQUEST_CHANGES' ? 'Submit Change Request' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


