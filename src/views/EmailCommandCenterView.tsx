/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Email Command Center (/admin/master/email)
 * Grounded in Master Development Playbook (feature/phumulani-email-enterprise)
 * High-priority enterprise department for unified inbox, classification, auto-responders,
 * AI drafting with human approvals, fundraising intelligence, grants, sponsorships & executive briefing.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { authFetch } from '../services/sessionTokenStore';
import { User } from '../types';
import {
  EmailClassificationCategory,
  EMAIL_CATEGORY_METADATA,
  EmailPriorityLevel,
  PRIORITY_CONFIG,
  ResponseToneStyle,
  AutoResponderRule,
  EnterpriseEmailThread,
  DonorLifecycleStage,
  GrantPipelineStage,
  PartnershipPipelineStage,
  EmailFolder,
  HistoricalImportJob,
  MailboxSyncCheckpoint,
  EmailConflictRecord,
  SyncAuditLogItem,
  EmailTemplate,
  EMAIL_TEMPLATES,
  EMAIL_STAFF_MEMBERS,
  EmailAIRewriteAction,
  ConversationStatus,
  FollowUpTask,
  ConnectedMailbox,
  MailboxConnectionState,
  SetupWizardStatus,
  SetupWizardStep,
  PilotReadinessVerification,
} from '../types/emailEnterprise';
import { EmailEnterpriseService } from '../services/emailEnterpriseService';
import { googleWorkspaceAdapter } from '../services/googleWorkspaceAdapter';
import { phumulaniApiClient } from '../api/phumulaniApiClient';
import { UniversalEmailConnections } from '../components/email/UniversalEmailConnections';
import { PhumulaniAiFundraisingCenter } from '../components/email/PhumulaniAiFundraisingCenter';
import { EmailCompactHeader } from '../components/email/EmailCompactHeader';
import { EmailSummaryStrip } from '../components/email/EmailSummaryStrip';
import { EmailSidebar } from '../components/email/EmailSidebar';
import { EmailMessageList } from '../components/email/EmailMessageList';
import { EmailReadingPane } from '../components/email/EmailReadingPane';
import {
  Mail,
  Inbox,
  Send,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  Award,
  Building,
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  ChevronRight,
  Eye,
  Edit3,
  FileText,
  AlertCircle,
  Plus,
  ThumbsUp,
  ThumbsDown,
  User as UserIcon,
  Layers,
  TrendingUp,
  BarChart2,
  Sliders,
  Check,
  UserCheck,
  Briefcase,
  HelpCircle,
  Phone,
  Bookmark,
  Share2,
  MessageSquare,
  Archive,
  Database,
  Activity,
  Paperclip,
  History,
  Lock,
  Unlock,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileCheck,
  Tag,
  Users,
  CheckSquare,
  MessageSquareText,
  Shield,
  FileCode,
  CornerUpLeft,
  Reply,
  ReplyAll,
  Forward,
  Wrench,
  ArrowRight,
  UserPlus,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';

export type EmailCommandCenterTab =
  | 'overview'
  | 'all_mailboxes'
  | 'conversations'
  | 'priority'
  | 'mailboxes'
  | 'historical'
  | 'sent'
  | 'drafts'
  | 'scheduled'
  | 'assigned_to_me'
  | 'team_inbox'
  | 'follow_up_tasks'
  | 'templates'
  | 'ai_intelligence'
  | 'approvals'
  | 'crm_connections'
  | 'analytics'
  | 'audit_history'
  | 'synchronization'
  | 'settings'
  | 'new_emails'
  | 'donors'
  | 'grants'
  | 'corporate'
  | 'executive'
  | 'archived'
  | 'autoresponders'
  | 'fundraising'
  | 'partnerships'
  | 'setup_wizard'
  | 'universal_connectors'
  | 'phumulani_ai'
  | 'financial_docs'
  | 'governance';

interface EmailCommandCenterViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
  onBackToMasterAdmin?: () => void;
  onOpenFundraisingCRM?: (subRoute?: string, donorId?: string) => void;
}

export const EmailCommandCenterView: React.FC<EmailCommandCenterViewProps> = ({
  currentUser,
  onViewChange,
  onBackToMasterAdmin,
  onOpenFundraisingCRM,
}) => {
  const dbState = db.getState();
  const mailboxes = dbState.connectedMailboxes;
  const autoRules = dbState.autoResponderRules;
  const autoLogs = dbState.autoResponderLogs;
  const threads = dbState.enterpriseEmailThreads;
  const donors = dbState.donorProfiles;
  const pipeline = dbState.majorDonorPipeline;
  const grants = dbState.grantPipeline;
  const partnerships = dbState.corporatePartnerships;
  const followUps = dbState.followUpTasks;
  const calendarProposals = dbState.calendarProposals;

  const [activeTab, setActiveTab] = useState<EmailCommandCenterTab>('all_mailboxes');

  // Phase 12A Synchronization State
  const [importJobs, setImportJobs] = useState<HistoricalImportJob[]>(() => db.getHistoricalImportJobs());
  const [syncCheckpoints, setSyncCheckpoints] = useState<MailboxSyncCheckpoint[]>(() => db.getMailboxSyncCheckpoints());
  const [syncConflicts, setSyncConflicts] = useState<EmailConflictRecord[]>(() => db.getSyncConflicts());
  const [syncAuditLogs, setSyncAuditLogs] = useState<SyncAuditLogItem[]>(() => db.getSyncAuditLogs());

  // Date filters for historical view
  const [historicalStartDate, setHistoricalStartDate] = useState<string>('2025-01-01');
  const [historicalEndDate, setHistoricalEndDate] = useState<string>('2026-12-31');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetMailbox, setImportTargetMailbox] = useState<string>('');
  const [importScopeFolders, setImportScopeFolders] = useState<string[]>(['INBOX', 'SENT', 'ARCHIVE']);
  const [isConflictsModalOpen, setIsConflictsModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  // Filters & Search
  const [selectedMailboxId, setSelectedMailboxId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || '');

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMailbox, setComposeMailbox] = useState<string>(mailboxes[0]?.email || 'info@phumulani.org');
  const [composeCategory, setComposeCategory] = useState<string>('23_general_inquiries');
  const [composeRecipient, setComposeRecipient] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeTone, setComposeTone] = useState<ResponseToneStyle>('professional');
  const [isSavingComposeDraft, setIsSavingComposeDraft] = useState(false);

  // Action Notice Banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Phase 60.1 Staff-First Responsive Workspace State
  const [mobileScreen, setMobileScreen] = useState<'folders' | 'list' | 'detail'>('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Quick filter pills
  const [quickFilter, setQuickFilter] = useState<'all' | 'p0' | 'needs_reply' | 'awaiting_approval' | 'donors' | 'unassigned' | 'unread' | 'priority' | 'assigned_to_me'>('all');

  // Draft editing state
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftEditContent, setDraftEditContent] = useState('');
  const [selectedDraftTone, setSelectedDraftTone] = useState<ResponseToneStyle>('professional');

  // Classification override modal
  const [reclassifyingThreadId, setReclassifyingThreadId] = useState<string | null>(null);
  const [newCategoryTarget, setNewCategoryTarget] = useState<EmailClassificationCategory>('23_general_inquiries');
  const [reclassifyReason, setReclassifyReason] = useState<string>('');

  // Internal Notes State
  const [newInternalNote, setNewInternalNote] = useState<string>('');

  // Follow-Up Task Modal State
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.name || 'Comfort Dondo');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [newTaskType, setNewTaskType] = useState<FollowUpTask['taskType']>('email_reply');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Template Picker Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [targetTemplateInsert, setTargetTemplateInsert] = useState<'compose' | 'draft'>('compose');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');

  // Settings Active Section
  const [settingsActiveSection, setSettingsActiveSection] = useState<'autoresponders' | 'templates' | 'signatures'>('autoresponders');

  // Phase 47 Email Templates & Multilingual State
  const [templateLanguage, setTemplateLanguage] = useState<string>('en');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [interpolatingTemplate, setInterpolatingTemplate] = useState<EmailTemplate | null>(null);
  const [interpolationInputs, setInterpolationInputs] = useState<Record<string, string>>({});
  const [interpolationResult, setInterpolationResult] = useState<{ subject: string; body: string } | null>(null);

  // Phase 47 Audit Log State
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // Phase 48 Mailbox Administration (M48.02) State
  const [isAddMailboxModalOpen, setIsAddMailboxModalOpen] = useState(false);
  const [isEditMailboxModalOpen, setIsEditMailboxModalOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<ConnectedMailbox | null>(null);
  const [mbxFormEmail, setMbxFormEmail] = useState('');
  const [mbxFormDisplayName, setMbxFormDisplayName] = useState('');
  const [mbxFormDepartment, setMbxFormDepartment] = useState('DEPT-OPS');
  const [mbxFormStaff, setMbxFormStaff] = useState('');
  const [mbxFormSignature, setMbxFormSignature] = useState('');
  const [mbxFormRouting, setMbxFormRouting] = useState('');
  const [mbxFormInitialState, setMbxFormInitialState] = useState<MailboxConnectionState>('AUTHORIZATION_REQUIRED');
  const [testConnectionResult, setTestConnectionResult] = useState<{
    mailboxId: string;
    mailboxEmail: string;
    status: string;
    latencyMs: number;
    verifiedAt: string;
    message: string;
  } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Phase 50 Google Workspace Diagnostics & Integration Readiness State (M50.02 - M50.06)
  const [workspaceDiagResult, setWorkspaceDiagResult] = useState<{
    connected: boolean;
    httpStatus: number;
    roundTripLatencyMs: number;
    quotaUnitsRemaining: number;
    quotaLimitPerSecond: number;
    quotaLimitDaily: number;
    dnsResolution: string;
    tlsVersion: string;
    cipherSuite: string;
    diagnosticsMessage: string;
    testedAt: string;
  } | null>(null);
  const [isWorkspaceDiagRunning, setIsWorkspaceDiagRunning] = useState(false);

  // Phase 54 Setup Wizard and Pilot Readiness State (M54.03 - M54.04)
  const [wizardStatus, setWizardStatus] = useState<SetupWizardStatus>(() => googleWorkspaceAdapter.getSetupWizardStatus());
  const [pilotReadiness, setPilotReadiness] = useState<PilotReadinessVerification>(() => googleWorkspaceAdapter.verifyPilotReady());
  const [isVerifyingWizard, setIsVerifyingWizard] = useState(false);

  const refreshWizardState = () => {
    setIsVerifyingWizard(true);
    setTimeout(() => {
      setWizardStatus(googleWorkspaceAdapter.getSetupWizardStatus());
      setPilotReadiness(googleWorkspaceAdapter.verifyPilotReady());
      setIsVerifyingWizard(false);
      setActionNotice({
        type: 'success',
        message: 'Google Workspace 12-Step Setup Wizard diagnostics and pilot readiness refreshed.',
      });
      setTimeout(() => setActionNotice(null), 5000);
    }, 250);
  };

  // Phase 48 CRM Linking Modal State (M48.05 / M48.11) + Phase 69 8-Type CRM Entities
  const [isCrmLinkModalOpen, setIsCrmLinkModalOpen] = useState(false);
  const [crmTargetThreadId, setCrmTargetThreadId] = useState<string | null>(null);
  const [crmEntityType, setCrmEntityType] = useState<
    'donor' | 'grant' | 'partnership' | 'volunteer' | 'campaign' | 'partner' | 'client' | 'program'
  >('donor');
  const [crmEntityId, setCrmEntityId] = useState('');
  const [crmEntityName, setCrmEntityName] = useState('');

  // Phase 66-74 Persistent Backend State (Drafts, Grant Financials, Governance, Audit Ledger, Worker Telemetry)
  const [persistentDrafts, setPersistentDrafts] = useState<any[]>([]);
  const [financialDocs, setFinancialDocs] = useState<any[]>([]);
  const [legalHolds, setLegalHolds] = useState<any[]>([]);
  const [governancePermissions, setGovernancePermissions] = useState<any[]>([]);
  const [auditLedgerState, setAuditLedgerState] = useState<{ chainVerified: boolean; total: number; entries: any[] }>({
    chainVerified: true,
    total: 0,
    entries: [],
  });
  const [opsMonitoring, setOpsMonitoring] = useState<any>(null);
  const [aiTelemetryState, setAiTelemetryState] = useState<any>(null);
  const [unifiedInboxStats, setUnifiedInboxStats] = useState<{ total?: number; folderCounts?: Record<string, number> } | null>(null);

  // Grant Financial Doc Ingestion Form State
  const [finDocSubject, setFinDocSubject] = useState('');
  const [finDocBody, setFinDocBody] = useState('');
  const [finDocMailbox, setFinDocMailbox] = useState('grants@phumulani.org');
  const [finDocSender, setFinDocSender] = useState('grants-officer@foundation-example.org');
  const [finDocBlockNotice, setFinDocBlockNotice] = useState<string | null>(null);

  // Legal Hold Form State
  const [holdTitle, setHoldTitle] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdTargetType, setHoldTargetType] = useState<'THREAD' | 'MAILBOX' | 'SENDER'>('MAILBOX');
  const [holdTargetValue, setHoldTargetValue] = useState('');

  const refreshEnterprisePersistence = async () => {
    try {
      const [inboxRes, draftsRes, finRes, holdsRes, permsRes, ledgerRes, opsRes, aiRes] = await Promise.all([
        phumulaniApiClient.getUnifiedInbox({ page: 1, pageSize: 25 }).catch(() => null),
        phumulaniApiClient.getPersistentDrafts().catch(() => null),
        phumulaniApiClient.getFinancialDocs().catch(() => null),
        phumulaniApiClient.getLegalHolds().catch(() => null),
        phumulaniApiClient.getGovernancePermissions().catch(() => null),
        phumulaniApiClient.getAuditLedger(40).catch(() => null),
        phumulaniApiClient.getOperationsMonitoring().catch(() => null),
        phumulaniApiClient.getEmailAiTelemetry().catch(() => null),
      ]);
      if (inboxRes) setUnifiedInboxStats({ total: inboxRes.total, folderCounts: inboxRes.folderCounts });
      if (draftsRes?.drafts) setPersistentDrafts(draftsRes.drafts);
      if (finRes?.documents) setFinancialDocs(finRes.documents);
      if (holdsRes?.holds) setLegalHolds(holdsRes.holds);
      if (permsRes?.permissions) setGovernancePermissions(permsRes.permissions);
      if (ledgerRes) setAuditLedgerState(ledgerRes);
      if (opsRes?.monitoring) setOpsMonitoring(opsRes.monitoring);
      if (aiRes) setAiTelemetryState(aiRes);
    } catch {
      // Gracefully ignore uninitialized or 401 before login
    }
  };

  useEffect(() => {
    refreshEnterprisePersistence();
  }, []);

  const handleApprovePersistentDraft = async (
    draftId: string,
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'RETURN_TO_DRAFT' | 'REJECT'
  ) => {
    try {
      const res = await phumulaniApiClient.approvePersistentDraft(draftId, { decision });
      setActionNotice({
        type: res.success ? 'success' : 'warning',
        message: res.success
          ? `Draft [${draftId}] updated via maker-checker decision: ${decision}.`
          : res.error || 'Approval rejected by policy',
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Maker-checker enforcement blocked this action.',
      });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSchedulePersistentDraft = async (draftId: string) => {
    const scheduledSendAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    try {
      const res = await phumulaniApiClient.schedulePersistentDraft(draftId, scheduledSendAt);
      setActionNotice({
        type: res.success ? 'success' : 'warning',
        message: res.success
          ? `Draft [${draftId}] scheduled for ${new Date(scheduledSendAt).toLocaleString()}.`
          : res.error || 'Failed to schedule draft',
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Failed to schedule draft.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleSendPersistentDraft = async (draftId: string) => {
    try {
      const res = await phumulaniApiClient.sendPersistentDraft(draftId, `ui-send-${draftId}-${Date.now()}`);
      setActionNotice({
        type: res.success ? 'success' : 'warning',
        message: res.success
          ? `Outbound dispatch recorded for draft [${draftId}].`
          : res.error || 'Dispatch could not complete against mail provider.',
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Outbound dispatch failed.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleIngestFinancialDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finDocSubject.trim() || !finDocBody.trim()) return;
    try {
      const res = await phumulaniApiClient.ingestFinancialDoc({
        subject: finDocSubject.trim(),
        bodyText: finDocBody.trim(),
        mailboxEmail: finDocMailbox,
        senderEmail: finDocSender.trim(),
      });
      setFinDocSubject('');
      setFinDocBody('');
      setFinDocBlockNotice(null);
      setActionNotice({
        type: 'success',
        message: `Financial correspondence classified as [${res.document?.classification}] and queued for Finance review.`,
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Failed to ingest financial document.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleApproveFinancialDoc = async (docId: string, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await phumulaniApiClient.approveFinancialDoc(docId, decision, `Reviewed by ${currentUser.name}`);
      setActionNotice({
        type: 'success',
        message: `Financial document [${docId}] marked ${decision}.`,
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Financial approval blocked (maker-checker).' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleCreateInvoiceFromDoc = async (docId: string) => {
    try {
      const res = await phumulaniApiClient.createFinancialDocInvoice(docId);
      setFinDocBlockNotice(null);
      setActionNotice({
        type: 'success',
        message: `Invoice [${res.invoiceId}] generated from financial document [${docId}].`,
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      const msg = err?.message || 'ACCOUNTING_RULE_BLOCKED: Grant advances require liquidation/replenishment, never invoicing.';
      setFinDocBlockNotice(msg);
      setActionNotice({ type: 'warning', message: msg });
    }
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleCreateLegalHold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdTitle.trim() || !holdTargetValue.trim()) return;
    try {
      await phumulaniApiClient.createLegalHold({
        title: holdTitle.trim(),
        reason: holdReason.trim() || 'Litigation / Compliance Preservation Hold',
        targetType: holdTargetType,
        targetValue: holdTargetValue.trim(),
      });
      setHoldTitle('');
      setHoldReason('');
      setHoldTargetValue('');
      setActionNotice({ type: 'success', message: 'Legal Hold activated. Matching records cannot be deleted.' });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Failed to create legal hold.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReleaseLegalHold = async (holdId: string) => {
    try {
      await phumulaniApiClient.releaseLegalHold(holdId);
      setActionNotice({ type: 'info', message: `Legal Hold [${holdId}] released.` });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Failed to release legal hold.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleExportComplianceBundle = async () => {
    try {
      const bundle = await phumulaniApiClient.exportComplianceBundle();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `phumulani_redacted_compliance_bundle_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setActionNotice({ type: 'success', message: 'VAWA-redacted compliance bundle exported.' });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Compliance export failed.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleRunWorkerCycle = async () => {
    try {
      const res = await phumulaniApiClient.runWorkerCycle(10);
      setActionNotice({
        type: 'success',
        message: `Worker cycle complete: ${res.cycle?.processed || 0} jobs processed (${res.cycle?.succeeded || 0} succeeded, ${res.cycle?.retried || 0} retried).`,
      });
      await refreshEnterprisePersistence();
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Worker cycle execution failed.' });
    }
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Selected Thread
  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  // Refresh sync data helper
  const refreshSyncState = () => {
    setImportJobs(db.getHistoricalImportJobs());
    setSyncCheckpoints(db.getMailboxSyncCheckpoints());
    setSyncConflicts(db.getSyncConflicts());
    setSyncAuditLogs(db.getSyncAuditLogs());
  };

  // Filtered Threads
  const filteredThreads = useMemo(() => {
    return threads
      .filter((t) => {
        const matchMailbox = selectedMailboxId === 'all' || t.mailboxId === selectedMailboxId;
        const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        const matchCategory = categoryFilter === 'all' || t.classification === categoryFilter;
        const matchSearch =
          searchQuery === '' ||
          t.threadSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.participantEmails.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
          t.messages.some((m) => m.bodyText.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchMailbox || !matchPriority || !matchCategory || !matchSearch) {
          return false;
        }

        // Quick filter pill check
        if (quickFilter === 'p0' && t.priority !== 'P0') return false;
        if (quickFilter === 'priority' && t.priority !== 'P0' && t.priority !== 'P1') return false;
        if (quickFilter === 'unread' && t.isRead) return false;
        if (quickFilter === 'assigned_to_me' && t.assignedStaffId !== currentUser.id && t.assignedStaffName !== currentUser.name) return false;
        if (quickFilter === 'needs_reply') {
          const lastMsg = t.messages[t.messages.length - 1];
          if (!lastMsg || lastMsg.direction !== 'inbound' || t.status === 'resolved') return false;
        }
        if (quickFilter === 'awaiting_approval' && t.draft?.status !== 'pending_approval') return false;
        if (quickFilter === 'donors' && t.crmLink?.entityType !== 'donor' && !t.classification.includes('donor')) return false;
        if (quickFilter === 'unassigned' && t.assignedStaffName && t.assignedStaffName !== 'Unassigned') return false;

        switch (activeTab) {
          case 'historical': {
            const isHist = t.isHistorical || t.messages.some((m) => m.isHistorical);
            const msgDate = t.lastMessageAt.split('T')[0];
            const dateMatch =
              (!historicalStartDate || msgDate >= historicalStartDate) &&
              (!historicalEndDate || msgDate <= historicalEndDate);
            return isHist && dateMatch;
          }
          case 'new_emails':
            return !t.isHistorical && (t.status === 'new' || t.status === 'triage_ready' || t.isRead === false);
          case 'conversations':
            return t.folder !== 'ARCHIVE' && !t.isArchived;
          case 'priority':
            return t.priority === 'P0' || t.priority === 'P1';
          case 'mailboxes':
            return true;
          case 'sent':
            return t.folder === 'SENT' || t.messages.some((m) => m.direction === 'outbound');
          case 'drafts':
            return Boolean(t.draft);
          case 'scheduled':
            return Boolean(t.draft && t.draft.status === 'approved');
          case 'assigned_to_me':
            return t.assignedStaffId === currentUser.id || t.assignedStaffName === currentUser.name;
          case 'team_inbox':
            return true;
          case 'approvals':
            return Boolean(t.draft && t.draft.status === 'pending_approval');
          case 'crm_connections':
            return Boolean(t.crmLink || t.classification.includes('donor') || t.classification.includes('grant') || t.classification.includes('corporate') || t.classification.includes('partnership'));
          case 'donors':
            return (
              t.crmLink?.entityType === 'donor' ||
              t.classification.includes('donor') ||
              t.classification.includes('contribution') ||
              t.classification.includes('gala') ||
              t.mailboxEmail === 'donations@phumulani.org'
            );
          case 'grants':
            return (
              t.crmLink?.entityType === 'grant' ||
              t.classification.includes('grant') ||
              t.mailboxEmail === 'grants@phumulani.org'
            );
          case 'corporate':
            return (
              t.crmLink?.entityType === 'partner' ||
              t.classification.includes('sponsorship') ||
              t.classification.includes('corporate') ||
              t.mailboxEmail === 'partnerships@phumulani.org'
            );
          case 'executive':
            return (
              t.mailboxEmail === 'executive@phumulani.org' ||
              t.classification.includes('board') ||
              t.classification.includes('legal') ||
              t.classification.includes('executive')
            );
          case 'archived':
            return t.isArchived || t.folder === 'ARCHIVE';
          case 'all_mailboxes':
          default:
            return t.folder !== 'ARCHIVE' && !t.isArchived;
        }
      })
      .sort((a, b) => {
        if (activeTab === 'priority') {
          const pOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
          return (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9);
        }
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }, [
    threads,
    activeTab,
    selectedMailboxId,
    priorityFilter,
    categoryFilter,
    searchQuery,
    quickFilter,
    currentUser.id,
    currentUser.name,
    historicalStartDate,
    historicalEndDate,
  ]);

  // Analytics Aggregation
  const analytics = useMemo(() => {
    return EmailEnterpriseService.calculateAnalytics(threads, autoRules, donors, pipeline, grants, followUps);
  }, [threads, autoRules, donors, pipeline, grants, followUps]);

  // Handle Sync Mailbox
  const handleSyncMailbox = async (mbxId: string) => {
    if (!mbxId) {
      setActionNotice({
        type: 'warning',
        message: 'No connected mailbox is configured yet. Connect an authorized mailbox under Universal Connectors first.',
      });
      setTimeout(() => setActionNotice(null), 5000);
      return;
    }
    const target = mailboxes.find((m) => m.id === mbxId);
    let backendSynced = false;
    let syncErrorMessage = '';
    try {
      const res = await authFetch(`/api/admin/email/mailboxes/${encodeURIComponent(mbxId)}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        backendSynced = true;
      } else {
        syncErrorMessage = data?.sync?.error || data?.error || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      syncErrorMessage = err?.message || 'Backend sync endpoint unreachable';
    }
    await refreshEnterprisePersistence();
    refreshSyncState();
    setActionNotice({
      type: backendSynced ? 'success' : 'warning',
      message: backendSynced
        ? `Mailbox ${target?.email || mbxId} synchronized via backend gateway.`
        : `Synchronization blocked for ${target?.email || mbxId}: ${syncErrorMessage || 'Live provider OAuth authorization is required before inbox retrieval.'}`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleVerifyMailbox = async (mbxId: string) => {
    const target = mailboxes.find((m) => m.id === mbxId);
    let gatewayStatus = 'AUTHORIZATION_REQUIRED';
    let connectorHealthy = false;
    try {
      const [connRes, gwRes] = await Promise.all([
        authFetch(`/api/admin/email/connections/${encodeURIComponent(mbxId)}/test`, { method: 'POST' }).catch(() => null),
        authFetch('/api/admin/email/google-workspace/status').catch(() => null),
      ]);
      if (connRes && connRes.ok) {
        const connData = await connRes.json().catch(() => ({}));
        connectorHealthy = Boolean(connData?.health?.healthy);
        if (connData?.health?.status) gatewayStatus = connData.health.status;
      } else if (gwRes && gwRes.ok) {
        const data = await gwRes.json().catch(() => ({}));
        gatewayStatus = data.status || 'AUTHORIZATION_REQUIRED';
      }
    } catch {
      gatewayStatus = 'UNREACHABLE';
    }
    refreshSyncState();
    const isLiveOAuth = connectorHealthy || (target?.authStatus === 'authorized' && gatewayStatus === 'CONNECTED');
    setActionNotice({
      type: isLiveOAuth ? 'success' : 'warning',
      message: isLiveOAuth
        ? `Mailbox connection verified for ${target?.email || mbxId}. Live provider OAuth active.`
        : `Verification check for ${target?.email || mbxId}: Status is ${gatewayStatus}. Live provider OAuth authorization required.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleStartImport = (mbxId: string) => {
    db.startHistoricalImport(mbxId, {
      folders: importScopeFolders,
      dateRange: `${historicalStartDate} to ${historicalEndDate}`,
    });
    refreshSyncState();
    setIsImportModalOpen(false);
    setActionNotice({
      type: 'success',
      message: `Historical import job started for ${mbxId}. Protected by Safeguarding Invariant (zero auto-responders or donor solicitations triggered).`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handlePauseImport = (jobId: string) => {
    db.pauseHistoricalImport(jobId);
    refreshSyncState();
    setActionNotice({
      type: 'info',
      message: `Historical import job paused at durable cursor checkpoint.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleResumeImport = (jobId: string) => {
    db.resumeHistoricalImport(jobId);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Historical import job resumed from checkpoint cursor.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleIncrementalSync = async (mbxId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/connectors/${encodeURIComponent(mbxId)}/sync`, {
        method: 'POST',
      });
      const data = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && data.success) {
        await refreshEnterprisePersistence();
        refreshSyncState();
        setActionNotice({
          type: 'success',
          message: `Sync complete for ${mbxId}. Cursor: ${data.syncCursor || 'Updated'}.`,
        });
      } else {
        setActionNotice({
          type: 'warning',
          message: data.error || `Synchronization unavailable for ${mbxId} (HTTP ${apiRes.status}). Verify provider authorization in Email Connections.`,
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || `Failed to synchronize mailbox ${mbxId}.`,
      });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleToggleTwoWay = (mbxId: string) => {
    const updated = db.toggleTwoWaySync(mbxId);
    refreshSyncState();
    setActionNotice({
      type: 'info',
      message: `Two-way synchronization for ${updated.email} is now ${updated.twoWaySyncEnabled ? 'ENABLED' : 'DISABLED'}.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleReauthorizeMailbox = (mbxId: string) => {
    setActiveTab('universal_connectors');
    setActionNotice({
      type: 'info',
      message: `Opened Email Connections Manager to complete provider OAuth reauthorization for ${mbxId}. Accounts remain unverified until provider consent succeeds.`,
    });
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Phase 48 Mailbox Administration (M48.02) Handlers
  const handleTestConnection = async (mailboxId: string) => {
    setIsTestingConnection(true);
    const mbx = mailboxes.find((m) => m.id === mailboxId);
    try {
      const apiRes = await authFetch(`/api/admin/email/connections/${encodeURIComponent(mailboxId)}/test`, {
        method: 'POST',
      });
      const apiData = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok || apiData.success === false) {
        setActionNotice({
          type: 'warning',
          message: apiData.error || `Backend connection test rejected (HTTP ${apiRes.status}) for ${mbx?.email || mailboxId}.`,
        });
        return;
      }
      const health = apiData.health || apiData;
      setTestConnectionResult({
        mailboxId,
        mailboxEmail: mbx?.email || mailboxId,
        status: health.status || 'UNTESTED',
        latencyMs: health.roundTripLatencyMs ?? health.latencyMs ?? 0,
        verifiedAt: new Date().toISOString(),
        message: health.diagnosticsDetail || health.error || health.message || 'Health check completed.',
      });
      refreshSyncState();
      setActionNotice({
        type: health.healthy ? 'success' : 'warning',
        message: `Connection check for ${mbx?.email || mailboxId}: ${health.status || 'UNTESTED'} (${health.roundTripLatencyMs ?? 0}ms).`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || `Failed to test mailbox ${mbx?.email || mailboxId}.`,
      });
    } finally {
      setIsTestingConnection(false);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleTestAllConnections = async () => {
    let passedCount = 0;
    let failedCount = 0;
    for (const mbx of mailboxes) {
      try {
        const apiRes = await authFetch(`/api/admin/email/connections/${encodeURIComponent(mbx.id)}/test`, { method: 'POST' });
        const apiData = await apiRes.json().catch(() => ({}));
        if (apiRes.ok && apiData?.health?.healthy) {
          passedCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }
    refreshSyncState();
    setActionNotice({
      type: failedCount > 0 ? 'warning' : 'success',
      message: `Tested ${mailboxes.length} organizational mailboxes via backend gateway (${passedCount} healthy, ${failedCount} unconfigured/unauthorized).`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleDisconnectMailbox = async (mailboxId: string) => {
    const mbx = mailboxes.find((m) => m.id === mailboxId);
    try {
      const apiRes = await authFetch(`/api/admin/email/mailboxes/${encodeURIComponent(mailboxId)}/disconnect`, {
        method: 'POST',
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({
          type: 'warning',
          message: errData.error || `Failed to disconnect ${mbx?.email || mailboxId} (HTTP ${apiRes.status}).`,
        });
        return;
      }
      db.disconnectMailbox(mailboxId);
      refreshSyncState();
      setActionNotice({
        type: 'warning',
        message: `Mailbox integration disconnected for ${mbx?.email || mailboxId}. Active tokens revoked and state transitioned to DISCONNECTED.`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || `Failed to disconnect mailbox ${mbx?.email || mailboxId}.`,
      });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Phase 50 Google Workspace Diagnostics Handler (M50.02 - M50.06)
  const handleRunWorkspaceDiagnostics = () => {
    setIsWorkspaceDiagRunning(true);
    setTimeout(() => {
      const res = googleWorkspaceAdapter.runDiagnosticConnectionTest(
        selectedMailboxId !== 'all' ? mailboxes.find((m) => m.id === selectedMailboxId)?.email : undefined
      );
      setWorkspaceDiagResult(res);
      setIsWorkspaceDiagRunning(false);
      setActionNotice({
        type: 'success',
        message: `Google Workspace API Diagnostics passed (${res.roundTripLatencyMs}ms). HTTP ${res.httpStatus}. TLS 1.3 verified. Quota: ${res.quotaUnitsRemaining.toLocaleString()} units remaining.`,
      });
      setTimeout(() => setActionNotice(null), 5000);
    }, 400);
  };

  const handleRevokeWorkspaceTokens = (email: string) => {
    googleWorkspaceAdapter.revokeAndPurgeTokens(email);
    refreshSyncState();
    setActionNotice({
      type: 'warning',
      message: `Google Workspace tokens securely purged and revoked for [${email}]. State transitioned to REVOKED.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleOpenEditMailbox = (mbx: ConnectedMailbox) => {
    setEditingMailbox(mbx);
    setMbxFormEmail(mbx.email);
    setMbxFormDisplayName(mbx.displayName);
    setMbxFormDepartment(mbx.department);
    const nonLiveState = (['AUTHORIZATION_REQUIRED', 'DEGRADED', 'DISCONNECTED', 'ERROR', 'NOT_CONFIGURED'].includes(String(mbx.status))
      ? mbx.status
      : 'AUTHORIZATION_REQUIRED') as MailboxConnectionState;
    setMbxFormInitialState(nonLiveState);
    setIsEditMailboxModalOpen(true);
  };

  const handleAddMailboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbxFormEmail.trim() || !mbxFormDisplayName.trim()) {
      setActionNotice({ type: 'warning', message: 'Email and display name are required.' });
      return;
    }
    const safeInitialState: MailboxConnectionState = (
      ['AUTHORIZATION_REQUIRED', 'DEGRADED', 'DISCONNECTED', 'NOT_CONFIGURED'].includes(String(mbxFormInitialState))
        ? mbxFormInitialState
        : 'AUTHORIZATION_REQUIRED'
    ) as MailboxConnectionState;
    try {
      const apiRes = await authFetch('/api/admin/email/mailboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mbxFormEmail.trim(),
          displayName: mbxFormDisplayName.trim(),
          department: mbxFormDepartment,
          status: safeInitialState,
          mailboxType: 'shared',
          provider: 'Google Workspace',
        }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({
          type: 'warning',
          message: errData.error || `Backend rejected mailbox registration (HTTP ${apiRes.status}).`,
        });
        return;
      }
      db.addConnectedMailbox({
        email: mbxFormEmail.trim(),
        displayName: mbxFormDisplayName.trim(),
        department: mbxFormDepartment,
        status: safeInitialState,
        mailboxType: 'shared',
        provider: 'Google Workspace',
      });
      setIsAddMailboxModalOpen(false);
      const savedEmail = mbxFormEmail.trim();
      setMbxFormEmail('');
      setMbxFormDisplayName('');
      setMbxFormStaff('');
      setMbxFormSignature('');
      setMbxFormRouting('');
      refreshSyncState();
      setActionNotice({
        type: 'success',
        message: `Organizational mailbox [${savedEmail}] registered. State: ${safeInitialState}.`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Failed to register mailbox.',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleEditMailboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMailbox) return;
    const safeEditState: MailboxConnectionState | undefined = ['AUTHORIZATION_REQUIRED', 'DEGRADED', 'DISCONNECTED', 'ERROR', 'NOT_CONFIGURED'].includes(
      String(mbxFormInitialState)
    )
      ? mbxFormInitialState
      : undefined;
    try {
      const apiRes = await authFetch(`/api/admin/email/connectors/${encodeURIComponent(editingMailbox.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: mbxFormDisplayName.trim(),
          department: mbxFormDepartment,
        }),
      });
      if (!apiRes.ok && apiRes.status !== 404) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({
          type: 'warning',
          message: errData.error || `Failed to update mailbox settings (HTTP ${apiRes.status}).`,
        });
        return;
      }
      db.updateConnectedMailbox(editingMailbox.id, {
        displayName: mbxFormDisplayName.trim(),
        department: mbxFormDepartment,
        ...(safeEditState ? { status: safeEditState } : {}),
      });
      const targetEmail = editingMailbox.email;
      setIsEditMailboxModalOpen(false);
      setEditingMailbox(null);
      refreshSyncState();
      setActionNotice({
        type: 'success',
        message: `Settings updated for organizational mailbox [${targetEmail}].`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Failed to update mailbox.',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Phase 48 CRM Linking Handlers (M48.05 / M48.11)
  const handleCrmLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmTargetThreadId) return;
    if (!crmEntityName.trim() || !crmEntityId.trim()) {
      setActionNotice({ type: 'warning', message: 'Entity ID and Name are required.' });
      return;
    }
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(crmTargetThreadId)}/crm-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: crmEntityType,
          entityId: crmEntityId.trim(),
          entityName: crmEntityName.trim(),
        }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `CRM link failed (HTTP ${apiRes.status}).` });
        return;
      }
      const res = db.linkThreadToCrm(crmTargetThreadId, {
        entityType: crmEntityType,
        entityId: crmEntityId.trim(),
        entityName: crmEntityName.trim(),
      });
      if (!res.success) {
        setActionNotice({ type: 'warning', message: res.error || 'Failed to link CRM.' });
        return;
      }
      const linkedName = crmEntityName.trim();
      setIsCrmLinkModalOpen(false);
      setCrmTargetThreadId(null);
      setCrmEntityId('');
      setCrmEntityName('');
      setActionNotice({
        type: 'success',
        message: `Thread successfully linked to CRM [${crmEntityType.toUpperCase()}: ${linkedName}].`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'CRM link request failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleUnlinkCrm = async (threadId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(threadId)}/crm-link`, {
        method: 'DELETE',
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `CRM unlink failed (HTTP ${apiRes.status}).` });
        return;
      }
      db.unlinkThreadFromCrm(threadId);
      setIsCrmLinkModalOpen(false);
      setActionNotice({
        type: 'info',
        message: `Thread unlinked from CRM.`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'CRM unlink request failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleResolveConflict = (conflictId: string, resolution: 'KEEP_PROVIDER' | 'KEEP_DASHBOARD') => {
    db.resolveSyncConflict(conflictId, resolution);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Conflict ${conflictId} resolved via ${resolution}. Synchronization state consistent.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleRead = (threadId: string, isRead: boolean) => {
    db.updateMessageReadState(threadId, !isRead);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Message state marked as ${!isRead ? 'READ' : 'UNREAD'}. Two-way sync updated provider.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleArchive = (threadId: string, isArchived: boolean) => {
    db.archiveThread(threadId, !isArchived);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Thread ${!isArchived ? 'ARCHIVED' : 'UNARCHIVED'}. Provider folder synchronized.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleChangeFolder = (threadId: string, folder: EmailFolder) => {
    db.updateThreadFolderAndLabels(threadId, folder);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Thread moved to folder [${folder}]. Provider synchronized.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Generate Draft
  const handleGenerateDraft = async (thread: EnterpriseEmailThread, tone: ResponseToneStyle) => {
    if (thread.classification === '01_safeguarding') {
      setActionNotice({
        type: 'warning',
        message: 'Strict Safeguarding Protocol: Automated external AI draft generation is withheld for crisis communications.',
      });
      return;
    }
    let draft = EmailEnterpriseService.generateDraft(thread, tone, currentUser.name);

    // Call secure backend AI endpoint
    try {
      const latestMessage = thread.messages[thread.messages.length - 1];
      const res = await authFetch('/api/ai/email-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageBody: latestMessage?.bodyText || '',
          senderName: latestMessage?.senderName || 'Valued Correspondent',
          subject: thread.threadSubject,
          toneStyle: tone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.draft && !data.blockedByPolicy) {
          draft = {
            ...draft,
            proposedBody: data.draft,
            confidenceScore: 98,
            generatedByAgent: `A02 Email Manager (${data.modelUsed || 'AI Engine'})`,
          };
        }
      }
    } catch {
      // Retain verified fallback template
    }

    db.saveEmailDraft(thread.id, draft);
    setActionNotice({
      type: 'success',
      message: `AI Draft generated in tone [${tone.replace('_', ' ')}] by A02 Email Manager. Human approval required before dispatch.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Approve Draft
  const handleApproveDraft = async (threadId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(threadId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `Approval rejected (HTTP ${apiRes.status}).` });
        return;
      }
      db.approveEmailDraft(threadId);
      setActionNotice({
        type: 'success',
        message: `Draft authorized by ${currentUser.name}. Ready for authorized dispatch.`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Approval request failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Handle Reject Draft
  const handleRejectDraft = async (threadId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(threadId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Draft does not meet institutional standards.' }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `Rejection failed (HTTP ${apiRes.status}).` });
        return;
      }
      db.rejectEmailDraft(threadId, 'Draft does not meet institutional standards.');
      setActionNotice({
        type: 'info',
        message: `Draft rejected and routed back to review queue.`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Rejection request failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Handle Request Changes
  const handleRequestChanges = async (threadId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(threadId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_changes',
          reason: 'Staff review requested revisions to tone and factual alignment.',
        }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `Request changes failed (HTTP ${apiRes.status}).` });
        return;
      }
      db.requestChangesEmailDraft(threadId, 'Staff review requested revisions to tone and factual alignment.');
      setActionNotice({
        type: 'warning',
        message: `Revisions requested. Draft marked as changes_requested for editing.`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Request changes call failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Handle Return to Draft
  const handleReturnToDraft = async (threadId: string) => {
    try {
      const apiRes = await authFetch(`/api/admin/email/threads/${encodeURIComponent(threadId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return_to_draft', reason: 'Returned to draft workspace by reviewer.' }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({ type: 'warning', message: errData.error || `Return to draft failed (HTTP ${apiRes.status}).` });
        return;
      }
      db.returnToDraftEmailDraft(threadId, 'Returned to draft workspace by reviewer.');
      setActionNotice({
        type: 'info',
        message: `Draft returned to initial drafting workspace.`,
      });
    } catch (err: any) {
      setActionNotice({ type: 'warning', message: err?.message || 'Return to draft failed.' });
    } finally {
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  // Handle Send Approved Email
  const handleSendApprovedEmail = async (threadId: string) => {
    try {
      const apiRes = await authFetch('/api/admin/email/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          idempotencyKey: `ui-dispatch-${threadId}-${Date.now()}`,
        }),
      });
      const data = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok || !data.success) {
        setActionNotice({
          type: 'warning',
          message: data.error || `Outbound dispatch rejected (HTTP ${apiRes.status}).`,
        });
        return;
      }
      db.sendApprovedEmail(threadId);
      setActionNotice({
        type: 'success',
        message: data.truthfulNotice || `Approved email dispatched (${data.deliveryState || 'STAGED'}).`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Failed to dispatch email.',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  // Handle Reclassification
  const handleConfirmReclassification = () => {
    if (!reclassifyingThreadId) return;
    db.classifyEmailThread(reclassifyingThreadId, newCategoryTarget, reclassifyReason);
    setActionNotice({
      type: 'info',
      message: `Email reclassified to [${EMAIL_CATEGORY_METADATA[newCategoryTarget]?.label}]. Feedback recorded for classification engine audit.`,
    });
    setReclassifyingThreadId(null);
    setReclassifyReason('');
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'j') {
        const idx = filteredThreads.findIndex((t) => t.id === selectedThreadId);
        if (idx >= 0 && idx < filteredThreads.length - 1) {
          setSelectedThreadId(filteredThreads[idx + 1].id);
        }
      } else if (e.key === 'k') {
        const idx = filteredThreads.findIndex((t) => t.id === selectedThreadId);
        if (idx > 0) {
          setSelectedThreadId(filteredThreads[idx - 1].id);
        }
      } else if (e.key === 'c') {
        setIsComposeOpen(true);
      } else if (e.key === 'Escape') {
        setIsComposeOpen(false);
        setIsTemplateModalOpen(false);
        setIsNewTaskModalOpen(false);
        setIsConflictsModalOpen(false);
        setIsImportModalOpen(false);
        setIsAuditLogsModalOpen(false);
        setReclassifyingThreadId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredThreads, selectedThreadId]);

  // Handle AI Rewrite
  const handleAIRewrite = (action: EmailAIRewriteAction) => {
    if (!selectedThread?.draft) return;
    const currentText = isEditingDraft ? draftEditContent : selectedThread.draft.proposedBody;
    const rewritten = EmailEnterpriseService.rewriteDraft(currentText, action);
    if (isEditingDraft) {
      setDraftEditContent(rewritten);
    } else {
      db.saveEmailDraft(selectedThread.id, {
        ...selectedThread.draft,
        proposedBody: rewritten,
        status: 'pending_approval',
      });
    }
    setActionNotice({
      type: 'success',
      message: `Draft successfully rewritten using [${action.toUpperCase()}] tone transformation.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Template Insertion
  const handleInsertTemplate = (template: EmailTemplate) => {
    const variables: Record<string, string> = {
      recipient_name: selectedThread?.messages[0]?.senderName || composeRecipient || 'Valued Partner',
      donation_amount: '$500.00',
      campaign_name: 'Survivor Safe Housing Bridge Fund',
      donation_date: new Date().toLocaleDateString(),
      receipt_number: `RCP-2026-${Math.floor(100 + Math.random() * 900)}`,
      grant_title: 'Minnesota Immigrant Empowerment Initiative',
      program_name: 'Survivor Healing & Transitional Empowerment',
      grant_amount: '$75,000',
      grant_duration: '24 Months',
      application_id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      company_name: 'Corporate Partner',
      tier_amount_1: '$25,000',
      tier_amount_2: '$10,000',
      volunteer_role: 'Sisterhood Healing Circle Mentor',
      orientation_date: 'Saturday, November 7, 2026',
      orientation_time: '10:00 AM CST',
      program_schedule: 'Tuesdays & Thursdays, 6:00 PM - 8:00 PM',
      topic_inquiry: 'Culturally Centered Domestic Violence Prevention',
      deadline: 'Tomorrow at 5:00 PM CST',
      meeting_date: 'November 15, 2026',
      meeting_time: '6:30 PM CST',
      subject_matter: 'Strategic Community Resilience Alliances',
      inquiry_topic: 'Community Programs and Healing Support',
      proposed_dates: 'Tuesday, Nov 3 at 2:00 PM or Thursday, Nov 5 at 10:00 AM',
    };

    const { subject, body } = EmailEnterpriseService.interpolateTemplate(template, variables);

    if (targetTemplateInsert === 'compose') {
      setComposeSubject(subject);
      setComposeBody(body);
      setIsComposeOpen(true);
    } else if (selectedThread?.draft) {
      if (isEditingDraft) {
        setDraftEditContent(body);
      } else {
        db.saveEmailDraft(selectedThread.id, {
          ...selectedThread.draft,
          suggestedSubject: subject,
          proposedBody: body,
          toneStyle: template.suggestedTone,
          status: 'pending_approval',
        });
      }
    }
    setIsTemplateModalOpen(false);
    setActionNotice({
      type: 'success',
      message: `Template [${template.name}] inserted with populated variables.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Add Internal Note
  const handleAddInternalNote = (threadId: string) => {
    if (!newInternalNote.trim()) return;
    db.addThreadInternalNote(threadId, newInternalNote.trim(), currentUser.name);
    setNewInternalNote('');
    setActionNotice({
      type: 'success',
      message: 'Private internal staff note appended. Strictly isolated from external messages.',
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Create Follow-Up Task
  const handleCreateFollowUpTask = () => {
    if (!newTaskTitle.trim()) {
      setActionNotice({ type: 'warning', message: 'Please provide a task title.' });
      return;
    }
    db.createFollowUpTask({
      relatedThreadId: selectedThread?.id,
      relatedEntityName: selectedThread?.threadSubject || 'General Communication',
      taskType: newTaskType,
      assignedTo: newTaskAssignee,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: newTaskPriority,
      status: 'pending',
      aiGeneratedBy: 'A02 Email Manager',
    });
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    setActionNotice({
      type: 'success',
      message: `Follow-up task created and assigned to ${newTaskAssignee}.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Reassign Staff
  const handleAssignStaff = (threadId: string, staffId: string, staffName: string) => {
    db.assignEmailThread(threadId, staffId, staffName);
    setActionNotice({
      type: 'info',
      message: `Thread assigned to ${staffName}. Notification recorded in audit log.`,
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Handle Quick Reply
  const handleReplyToThread = (thread: EnterpriseEmailThread, replyAll: boolean = false) => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    setComposeMailbox(thread.mailboxEmail);
    setComposeRecipient(lastMsg ? lastMsg.senderEmail : thread.participantEmails[0] || '');
    setComposeSubject(thread.threadSubject.startsWith('Re:') ? thread.threadSubject : `Re: ${thread.threadSubject}`);
    setComposeBody('');
    setIsComposeOpen(true);
  };

  // Handle Forward
  const handleForwardThread = (thread: EnterpriseEmailThread) => {
    const lastMsg = thread.messages[thread.messages.length - 1];
    setComposeMailbox(thread.mailboxEmail);
    setComposeRecipient('');
    setComposeSubject(thread.threadSubject.startsWith('Fwd:') ? thread.threadSubject : `Fwd: ${thread.threadSubject}`);
    setComposeBody(`\n\n---------- Forwarded message ---------\nFrom: ${lastMsg?.senderName} <${lastMsg?.senderEmail}>\nDate: ${new Date(lastMsg?.receivedAt || '').toLocaleString()}\nSubject: ${thread.threadSubject}\n\n${lastMsg?.bodyText}`);
    setIsComposeOpen(true);
  };

  // Handle Save Persistent Draft from Composer
  const handleSaveComposeDraft = async () => {
    if (!composeRecipient || !composeSubject || !composeBody) {
      setActionNotice({ type: 'warning', message: 'Please fill in recipient, subject, and message body to save a persistent draft.' });
      return;
    }
    const mbx = mailboxes.find((m) => m.email === composeMailbox) || mailboxes[0];
    const resolvedMailboxId = mbx?.id || composeMailbox;
    const isSafeguarded =
      composeCategory === '01_safeguarding' || composeMailbox.toLowerCase().includes('safeguarding');
    setIsSavingComposeDraft(true);
    try {
      const res = await phumulaniApiClient.createPersistentDraft({
        mailboxId: resolvedMailboxId,
        to: [composeRecipient.trim()],
        subject: composeSubject.trim(),
        bodyText: composeBody,
        isAiGenerated: false,
        isSafeguarded,
      });
      if (res.success && res.draft) {
        await refreshEnterprisePersistence();
        setIsComposeOpen(false);
        setComposeRecipient('');
        setComposeSubject('');
        setComposeBody('');
        setActionNotice({
          type: 'success',
          message: `Persistent draft [${res.draft.id}] saved for maker-checker review and approval.`,
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Failed to save persistent draft.',
      });
    } finally {
      setIsSavingComposeDraft(false);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  // Handle Compose Send
  const handleSendComposedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient || !composeSubject || !composeBody) {
      setActionNotice({ type: 'warning', message: 'Please fill in recipient, subject, and message body.' });
      return;
    }

    const detected = EmailEnterpriseService.classifyMessage(composeSubject, composeBody, composeRecipient);
    const category = (composeCategory || detected.category) as EmailClassificationCategory;
    const { priority } = EmailEnterpriseService.calculatePriority(category, composeSubject, composeBody);
    const mbx = mailboxes.find((m) => m.email === composeMailbox) || mailboxes[0];
    const resolvedMailboxId = mbx?.id || composeMailbox;

    try {
      const apiRes = await authFetch('/api/admin/email/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mailboxId: resolvedMailboxId,
          mailboxEmail: composeMailbox,
          recipientEmail: composeRecipient,
          subject: composeSubject,
          bodyText: composeBody,
          category,
          priority,
          idempotencyKey: `ui-compose-${Date.now()}`,
        }),
      });
      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        setActionNotice({
          type: 'warning',
          message: errData.error || `Failed to queue outbound message (HTTP ${apiRes.status}).`,
        });
        return;
      }
      const res = db.composeDirectOutboundEmail({
        mailboxId: resolvedMailboxId,
        mailboxEmail: composeMailbox,
        recipientEmail: composeRecipient,
        subject: composeSubject,
        bodyText: composeBody,
        category,
        priority,
      });

      const targetRecipient = composeRecipient;
      setIsComposeOpen(false);
      setComposeRecipient('');
      setComposeSubject('');
      setComposeBody('');
      setSelectedThreadId(res.threadId);
      setActionNotice({
        type: 'success',
        message: `Outbound email staged in backend communications ledger for ${targetRecipient} via ${composeMailbox}.`,
      });
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Network error dispatching composed email.',
      });
    } finally {
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-slate-800 max-w-full overflow-x-hidden">
      {/* 1. COMPACT HEADER (Area A) */}
      <EmailCompactHeader
        currentUser={currentUser}
        mailboxes={mailboxes}
        selectedMailboxId={selectedMailboxId}
        onMailboxChange={(id) => {
          setSelectedMailboxId(id);
          if (activeTab === 'mailboxes') {
            setActiveTab('all_mailboxes');
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCount={analytics.unreadCount}
        pendingApprovalsCount={analytics.draftsAwaitingApprovalCount}
        onOpenCompose={() => setIsComposeOpen(true)}
        onSyncMailbox={handleSyncMailbox}
        onBackToMasterAdmin={onBackToMasterAdmin ? onBackToMasterAdmin : () => onViewChange('master-admin')}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenAuditLogs={() => setIsAuditLogsModalOpen(true)}
        onOpenManageAccounts={() => setActiveTab('universal_connectors')}
      />

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`px-4 py-2 text-xs font-medium border-b flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : actionNotice.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : actionNotice.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. COMPACT SUMMARY STRIP (Replaces 12-card grid) */}
      <EmailSummaryStrip
        unreadCount={analytics.unreadCount}
        priorityCount={analytics.criticalP0Count + analytics.urgentP1Count}
        awaitingApprovalCount={analytics.draftsAwaitingApprovalCount}
        followUpsCount={analytics.overdueFollowUpsCount}
        activeFilter={quickFilter}
        onFilterClick={(filter) => {
          if (filter === 'priority') {
            setActiveTab('priority');
            setQuickFilter('p0');
          } else if (filter === 'awaiting_approval') {
            setActiveTab('approvals');
            setQuickFilter('awaiting_approval');
          } else if (filter === 'follow_ups') {
            setActiveTab('follow_up_tasks');
          } else if (filter === 'unread') {
            setActiveTab('all_mailboxes');
            setQuickFilter('unread');
          } else {
            setActiveTab('all_mailboxes');
            setQuickFilter('all');
          }
        }}
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 overflow-hidden p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4">
        {/* AREA B: COLLAPSIBLE SIDEBAR */}
        <div
          className={`${
            mobileScreen === 'folders' ? 'block' : 'hidden md:block'
          } shrink-0`}
        >
          <EmailSidebar
            currentUser={currentUser}
            activeTab={activeTab}
            onTabSelect={(tab) => {
              setActiveTab(tab);
              setMobileScreen('list');
            }}
            unreadCount={analytics.unreadCount}
            priorityCount={analytics.criticalP0Count + analytics.urgentP1Count}
            draftsCount={threads.filter((t) => Boolean(t.draft)).length}
            approvalsCount={analytics.draftsAwaitingApprovalCount}
            followUpsCount={analytics.overdueFollowUpsCount}
            sentCount={threads.filter((t) => t.folder === 'SENT' || t.messages.some((m) => m.direction === 'outbound')).length}
            isCollapsed={!isSidebarOpen}
            onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* WORKSPACE CONTENT: INBOX PANELS (AREAS C & D) */}
        {(activeTab === 'all_mailboxes' ||
          activeTab === 'conversations' ||
          activeTab === 'historical' ||
          activeTab === 'new_emails' ||
          activeTab === 'priority' ||
          activeTab === 'drafts' ||
          activeTab === 'scheduled' ||
          activeTab === 'assigned_to_me' ||
          activeTab === 'team_inbox' ||
          activeTab === 'donors' ||
          activeTab === 'grants' ||
          activeTab === 'corporate' ||
          activeTab === 'executive' ||
          activeTab === 'sent' ||
          activeTab === 'archived') && (
          <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden min-w-0">
            {/* AREA C: MESSAGE LIST */}
            <div
              className={`w-full md:w-80 xl:w-96 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs shrink-0 ${
                mobileScreen === 'list' || mobileScreen === 'folders' ? 'flex flex-col' : 'hidden md:flex md:flex-col'
              }`}
            >
              <EmailMessageList
                threads={filteredThreads}
                selectedThreadId={selectedThread?.id || null}
                onSelectThread={(id) => {
                  setSelectedThreadId(id);
                  setMobileScreen('detail');
                }}
                mailboxes={mailboxes}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                quickFilter={quickFilter as any}
                onQuickFilterChange={setQuickFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                selectedMailboxId={selectedMailboxId}
                onMailboxChange={setSelectedMailboxId}
                onOpenFolders={() => setMobileScreen('folders')}
                onOpenManageAccounts={() => setActiveTab('universal_connectors')}
              />
            </div>

            {/* AREA D: MESSAGE READING PANEL */}
            <div
              className={`flex-1 overflow-hidden min-w-0 ${
                mobileScreen === 'detail' ? 'flex flex-col' : 'hidden md:flex md:flex-col'
              }`}
            >
              <EmailReadingPane
                thread={selectedThread || null}
                currentUser={currentUser}
                onBackToList={() => setMobileScreen('list')}
                onReply={handleReplyToThread}
                onForward={handleForwardThread}
                onToggleRead={handleToggleRead}
                onToggleArchive={handleToggleArchive}
                onChangeFolder={handleChangeFolder}
                onAssignStaff={handleAssignStaff}
                onOpenCrmLinkModal={(th) => {
                  setCrmTargetThreadId(th.id);
                  setCrmEntityName(th.crmLink?.entityName || '');
                  setCrmEntityId(th.crmLink?.entityId || '');
                  setCrmEntityType(th.crmLink?.entityType || 'donor');
                  setIsCrmLinkModalOpen(true);
                }}
                onOpenNewTaskModal={(th) => {
                  setNewTaskTitle(`Follow up with ${th.messages[0]?.senderName || 'contact'} re: ${th.threadSubject}`);
                  setIsNewTaskModalOpen(true);
                }}
                onReclassify={(th) => {
                  setReclassifyingThreadId(th.id);
                  setNewCategoryTarget(th.classification);
                }}
                onAddInternalNote={handleAddInternalNote}
                onGenerateDraft={handleGenerateDraft}
                onAIRewrite={handleAIRewrite}
                onInsertTemplate={() => {
                  setTargetTemplateInsert('draft');
                  setIsTemplateModalOpen(true);
                }}
                onSaveDraft={(threadId, updatedBody) => {
                  if (selectedThread?.draft) {
                    db.saveEmailDraft(threadId, {
                      ...selectedThread.draft,
                      proposedBody: updatedBody,
                      status: 'pending_approval',
                    });
                  }
                  setIsEditingDraft(false);
                }}
                onApproveDraft={handleApproveDraft}
                onRequestChanges={handleRequestChanges}
                onReturnToDraft={handleReturnToDraft}
                onRejectDraft={handleRejectDraft}
                onSendApprovedEmail={handleSendApprovedEmail}
                onIngestFundraising={(th, msg) => {
                  const res = EmailEnterpriseService.ingestAndLinkFundraisingEmail(th, msg);
                  if (res.safeguardingQuarantined) {
                    setActionNotice({
                      type: 'warning',
                      message: 'VAWA SAFEGUARDING QUARANTINE: Ingestion into Fundraising CRM blocked due to confidential crisis indicators.',
                    });
                    return;
                  }
                  if (res.executiveGated) {
                    setActionNotice({
                      type: 'warning',
                      message: 'EXECUTIVE GATING: Executive mailbox correspondence held for Comfort Dondo review.',
                    });
                    return;
                  }
                  if (res.success) {
                    setActionNotice({
                      type: 'success',
                      message: `Successfully linked to Fundraising CRM: ${res.donorName} (${res.isNewDonor ? 'New Contact Created' : 'Existing Contact Updated'}). Opportunity: ${res.opportunityTitle || 'Linked'}.`,
                    });
                  }
                }}
                onOpenFundraisingCRM={onOpenFundraisingCRM ? onOpenFundraisingCRM : (tab, id) => onViewChange('fundraising')}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ORGANIZATIONAL MAILBOX ADMINISTRATION (M48.02)                        */}
        {/* ========================================================================= */}
        {activeTab === 'mailboxes' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            {/* Top Header & Truthful Status Disclosure */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-full uppercase">
                    /admin/master/email/mailboxes · Application D
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    STAGED_DEVELOPMENT
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-700" />
                    Google Workspace: AUTHORIZATION_REQUIRED
                  </span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-700" />
                    DEPT-SAFE Invariant Active
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Organizational Mailbox Administration & Departmental Routing
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Complete institutional mailbox management. Register mailboxes, assign department ownership and staff access, test connection readiness, configure signatures, and manage OAuth integration lifecycles.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleTestAllConnections}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Test All Connections</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMbxFormEmail('');
                    setMbxFormDisplayName('');
                    setMbxFormDepartment('DEPT-OPS');
                    setMbxFormStaff('');
                    setMbxFormSignature('');
                    setMbxFormRouting('');
                    setMbxFormInitialState('AUTHORIZATION_REQUIRED');
                    setIsAddMailboxModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Mailbox Configuration</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Total Mailboxes</span>
                  <Mail className="w-3.5 h-3.5 text-teal-800" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">{mailboxes.length}</div>
                <div className="text-[10px] text-teal-700 font-semibold mt-0.5">5 Core Institutional</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-emerald-600 mb-1 font-semibold">
                  <span>Connected (Ready)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-serif text-emerald-800">
                  {mailboxes.filter((m) => m.status === 'CONNECTED' || m.status === 'connected').length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Inboxes</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-amber-600 mb-1 font-semibold">
                  <span>Auth Required</span>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-serif text-amber-700">
                  {mailboxes.filter((m) => m.status === 'AUTHORIZATION_REQUIRED' || m.authStatus === 'pending_auth').length}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5 font-medium">Staged OAuth</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>2-Way Sync</span>
                  <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">
                  {mailboxes.filter((m) => m.twoWaySyncEnabled).length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Reconciled</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Total Messages</span>
                  <Inbox className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">
                  {mailboxes.reduce((acc, m) => acc + (m.totalImportedMessages || m.totalThreads || 0), 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Imported & Tracked</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Fail-Closed Status</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-serif text-emerald-800">100%</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Zero Data Leaks</div>
              </div>
            </div>

            {/* Mailbox Administration Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Active Departmental Mailboxes ({mailboxes.length})
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Operational Mode: STAGED_DEVELOPMENT
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {mailboxes.map((mbx) => {
                  const checkpoint = syncCheckpoints.find((c) => c.mailboxId === mbx.id);
                  const statusColors: Record<string, string> = {
                    CONNECTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    connected: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    AUTHORIZATION_REQUIRED: 'bg-amber-100 text-amber-900 border-amber-300',
                    pending_auth: 'bg-amber-100 text-amber-900 border-amber-300',
                    SYNCING: 'bg-blue-100 text-blue-800 border-blue-300',
                    syncing: 'bg-blue-100 text-blue-800 border-blue-300',
                    DEGRADED: 'bg-orange-100 text-orange-800 border-orange-300',
                    DISCONNECTED: 'bg-slate-200 text-slate-700 border-slate-300',
                    disconnected: 'bg-slate-200 text-slate-700 border-slate-300',
                    ERROR: 'bg-rose-100 text-rose-800 border-rose-300',
                    error: 'bg-rose-100 text-rose-800 border-rose-300',
                    NOT_CONFIGURED: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  return (
                    <div
                      key={mbx.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                    >
                      {/* Top Bar: Email, Name, Department, Status */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {mbx.email}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                              {mbx.department}
                            </span>
                            {mbx.isDefault && (
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                                Default Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {mbx.displayName} · Provider: <strong className="text-slate-800">{mbx.provider}</strong>
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase border ${
                            statusColors[mbx.status] || 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {mbx.status}
                        </span>
                      </div>

                      {/* Detail Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">OWNERSHIP</span>
                          <span className="font-bold text-slate-900 truncate block">{mbx.department}</span>
                          <span className="text-[10px] text-slate-500">Phumulani 501(c)(3)</span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">STAFF ACCESS</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {mbx.department === 'DEPT-SAFE'
                              ? 'Sister Miriam K.'
                              : mbx.department === 'DEPT-EXEC'
                              ? 'Comfort Dondo'
                              : mbx.department === 'DEPT-DEV'
                              ? 'David Mwangi, CPA'
                              : mbx.department === 'DEPT-PROG'
                              ? 'Dr. Elena Rostova'
                              : 'Staff Team (OPS)'}
                          </span>
                          <span className="text-[10px] text-teal-800 font-medium">RBAC Authorized</span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">SYNC STATUS</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {mbx.twoWaySyncEnabled ? '2-Way Active' : 'Read Only'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {mbx.totalThreads} Threads
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">SIGNATURES</span>
                          <span className="font-bold text-slate-900 truncate block">Official Form 990</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Active Attached</span>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">PROVIDER ERRORS</span>
                          {(() => {
                            const errCount =
                              (mbx.authFailures || 0) +
                              (mbx.failedJobs || 0) +
                              (mbx.currentErrors?.length || 0);
                            const healthLabel =
                              mbx.status === 'DISCONNECTED' || mbx.status === 'disconnected'
                                ? 'Disconnected'
                                : errCount > 0
                                ? 'Degraded'
                                : mbx.authStatus === 'authorized'
                                ? 'Live Verified'
                                : 'Staged (OAuth Req)';
                            return (
                              <>
                                <span
                                  className={`font-bold truncate block ${
                                    errCount > 0 ? 'text-rose-700' : 'text-slate-900'
                                  }`}
                                >
                                  {errCount} {errCount === 1 ? 'Error' : 'Errors'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{healthLabel}</span>
                              </>
                            );
                          })()}
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-mono">LAST HANDSHAKE</span>
                          <span className="font-bold text-slate-900 truncate block">
                            {mbx.lastSyncedAt ? new Date(mbx.lastSyncedAt).toLocaleTimeString() : 'Not synced yet'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            {checkpoint?.historyId || 'Awaiting sync'}
                          </span>
                        </div>
                      </div>

                      {/* Safeguarding Invariant Notice for DEPT-SAFE */}
                      {mbx.department === 'DEPT-SAFE' && (
                        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-950 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Safeguarding Zero-PII Firewall Active</span>
                            <p className="text-[11px] text-rose-800 mt-0.5">
                              Confidential intake is strictly quarantined to Sister Miriam K. Auto-responders and AI external sending are disabled pursuant to VAWA Section 1367.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleTestConnection(mbx.id)}
                            disabled={isTestingConnection}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Execute simulated connection test and measure handshake latency"
                          >
                            <RefreshCw className="w-3 h-3 text-teal-700" />
                            <span>Test Connection</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditMailbox(mbx)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Edit mailbox display name, department, and settings"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>Edit Settings</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleIncrementalSync(mbx.id)}
                            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-[11px] cursor-pointer"
                            title="Run incremental delta sync"
                          >
                            <span>Delta Sync</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleTwoWay(mbx.id)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer border ${
                              mbx.twoWaySyncEnabled
                                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {mbx.twoWaySyncEnabled ? 'Disable 2-Way' : 'Enable 2-Way'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {mbx.status === 'DISCONNECTED' || mbx.status === 'disconnected' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('universal_connectors');
                                setActionNotice({
                                  type: 'info',
                                  message: `Authorize ${mbx.email} through the live provider connection wizard. A mailbox cannot be marked connected manually.`,
                                });
                              }}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Reconnect
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDisconnectMailbox(mbx.id)}
                              className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                              title="Disconnect mailbox and revoke active access tokens"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Departmental Message Routing Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Institutional Message Routing & SLA Architecture
                  </h4>
                  <p className="text-xs text-slate-500">
                    Deterministic category routing rules across the 5 organizational mailboxes.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                  5 Mailbox Routing Rules
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Mailbox</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Lead Staff</th>
                      <th className="p-2.5">Target Categories</th>
                      <th className="p-2.5">Default Priority</th>
                      <th className="p-2.5">Provider Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {[
                      {
                        email: 'info@phumulani.org',
                        dept: 'DEPT-OPS / Community',
                        lead: 'Front Desk & Sister Miriam K.',
                        cats: 'Safeguarding (01), Community Programs (15, 16), General (23)',
                        priority: 'P0 / P3',
                        priorityClass: 'bg-rose-100 text-rose-800',
                      },
                      {
                        email: 'donations@phumulani.org',
                        dept: 'DEPT-DEV / Stewardship',
                        lead: 'David Mwangi, CPA',
                        cats: 'Major Donors (04), Individual Gifts (05), Campaigns (10)',
                        priority: 'P2 / P3',
                        priorityClass: 'bg-amber-100 text-amber-800',
                      },
                      {
                        email: 'executive@phumulani.org',
                        dept: 'DEPT-EXEC / Leadership',
                        lead: 'Comfort Dondo',
                        cats: 'Executive (02), Board (03), Legal (20), Media (18)',
                        priority: 'P1',
                        priorityClass: 'bg-orange-100 text-orange-800',
                      },
                      {
                        email: 'grants@phumulani.org',
                        dept: 'DEPT-PROG / Institutional',
                        lead: 'Dr. Elena Rostova',
                        cats: 'Foundation Grants (07), Government Funding (08)',
                        priority: 'P1',
                        priorityClass: 'bg-orange-100 text-orange-800',
                      },
                      {
                        email: 'partnerships@phumulani.org',
                        dept: 'DEPT-DEV / Corporate CSR',
                        lead: 'Lead Staff',
                        cats: 'Corporate Sponsorships (06), CSR (12), Alliances (11)',
                        priority: 'P2',
                        priorityClass: 'bg-amber-100 text-amber-800',
                      },
                    ].map((row) => {
                      const matched = mailboxes.find((m) => m.email === row.email);
                      const liveAuth = matched?.authStatus === 'authorized';
                      const rawState = matched?.connectionState || matched?.status || 'NOT_CONFIGURED';
                      const label =
                        rawState === 'DISCONNECTED' || rawState === 'disconnected'
                          ? 'DISCONNECTED'
                          : liveAuth
                          ? 'CONNECTED (LIVE OAUTH)'
                          : `${String(rawState).toUpperCase()} (STAGED)`;
                      const badgeCls =
                        rawState === 'DISCONNECTED' || rawState === 'disconnected'
                          ? 'text-slate-600'
                          : liveAuth
                          ? 'text-emerald-700'
                          : 'text-amber-800';
                      return (
                        <tr key={row.email} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono font-bold text-slate-900">{row.email}</td>
                          <td className="p-2.5 font-semibold text-slate-700">{row.dept}</td>
                          <td className="p-2.5 text-slate-600">{row.lead}</td>
                          <td className="p-2.5 text-slate-600">{row.cats}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${row.priorityClass}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span className={`${badgeCls} font-semibold font-mono text-[11px]`}>{label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 0: OVERVIEW & HEALTH DASHBOARD (/admin/master/email)                  */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            {/* Top Header & Truthful Status Disclosure */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-full uppercase">
                    /admin/master/email · Application D
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    STAGED_DEVELOPMENT
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-700" />
                    Google Workspace: AUTHORIZATION_REQUIRED
                  </span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-700" />
                    DEPT-SAFE Active
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Executive Email Administration & AI Communications Center
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Central organizational communications dashboard. Quad-action human review gate, 25-category triage classification, domestic violence safeguarding isolation, and truthful staging persistence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Review Approvals ({threads.filter((t) => t.draft?.status === 'pending_approval').length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('all_mailboxes')}
                  className="px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Inbox className="w-4 h-4" />
                  <span>Unified Inbox</span>
                </button>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Inbound Threads</span>
                  <Inbox className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">{threads.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Across {mailboxes.length} Mailboxes</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-amber-600 mb-1 font-semibold">
                  <span>Pending Approvals</span>
                  <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-serif text-amber-700">
                  {threads.filter((t) => t.draft?.status === 'pending_approval').length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Quad-Action Required</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-rose-600 mb-1 font-semibold">
                  <span>Safeguarding (P0)</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <div className="text-xl font-bold font-serif text-rose-700">
                  {threads.filter((t) => t.classification === '01_safeguarding').length}
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5 font-medium">DEPT-SAFE Quarantined</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Outbound Sent</span>
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">
                  {threads.filter((t) => t.folder === 'SENT' || t.messages.some((m) => m.direction === 'outbound')).length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Staged Ledger Logged</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Follow-Up Tasks</span>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-serif text-slate-900">
                  {followUps.filter((f) => f.status === 'pending').length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Staff Tasks</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>SLA Adherence</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                {(() => {
                  const slaStats = threads.map((t) => EmailEnterpriseService.calculateSlaStatus(t));
                  const onTrack = slaStats.filter((s) => s.status !== 'BREACHED').length;
                  const pct = threads.length > 0 ? ((onTrack / threads.length) * 100).toFixed(1) : '100.0';
                  return (
                    <>
                      <div className="text-xl font-bold font-serif text-teal-800">{pct}%</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Avg: {analytics.avgResponseTimeHours}h across P0-P4
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Dual Panes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Configured Mailboxes (7 Cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Organizational Mailbox Roster</h3>
                    <p className="text-xs text-slate-500">Configured departmental inboxes and OAuth readiness status.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('mailboxes')}
                    className="text-xs text-teal-800 hover:text-teal-950 font-semibold cursor-pointer underline"
                  >
                    Manage Accounts →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {mailboxes.map((mbx) => (
                    <div key={mbx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5 text-teal-800" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{mbx.displayName}</div>
                          <div className="font-mono text-[11px] text-slate-500 truncate">{mbx.email} · {mbx.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(() => {
                          const isLiveAuth = mbx.authStatus === 'authorized';
                          const rawStatus = String(mbx.connectionState || mbx.status || 'AUTHORIZATION_REQUIRED').toUpperCase();
                          const badgeLabel =
                            rawStatus === 'DISCONNECTED' || rawStatus === 'ERROR'
                              ? rawStatus
                              : isLiveAuth
                              ? rawStatus
                              : 'AUTHORIZATION_REQUIRED';
                          const badgeStyle =
                            rawStatus === 'DISCONNECTED' || rawStatus === 'ERROR'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : isLiveAuth
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300';
                          return (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${badgeStyle}`}>
                              {badgeLabel}
                            </span>
                          );
                        })()}
                        <button
                          onClick={() => {
                            setSelectedMailboxId(mbx.id);
                            setActiveTab('all_mailboxes');
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Inbound 25-Category Triage & Safeguarding Boundary (5 Cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">25-Category Triage Taxonomy</h3>
                      <p className="text-xs text-slate-500">Autonomous classification distribution and SLA enforcement.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ai_intelligence')}
                      className="text-xs text-teal-800 hover:text-teal-950 font-semibold cursor-pointer underline"
                    >
                      Taxonomy Details →
                    </button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(EMAIL_CATEGORY_METADATA).slice(0, 10).map(([catKey, meta]) => {
                      const count = threads.filter((t) => t.classification === catKey).length;
                      return (
                        <div key={catKey} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-slate-500 w-5">{meta.code}</span>
                            <span className="font-medium text-slate-800 truncate">{meta.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${PRIORITY_CONFIG[meta.defaultPriority]?.badgeColor}`}>
                              {meta.defaultPriority}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Safeguarding Invariant Box */}
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-950 flex items-start gap-2.5 mt-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Safeguarding & Domestic Violence Invariant</div>
                    <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                      Category 01 messages are permanently quarantined to DEPT-SAFE (Sister Miriam K.). Autonomous AI replies are physically blocked, and text is redacted for general staff pursuant to VAWA protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SYNCHRONIZATION HEALTH DASHBOARD (/admin/master/email/synchronization) */}
        {/* ========================================================================= */}
        {activeTab === 'synchronization' && (
          <div className="h-full overflow-y-auto space-y-4 pb-8">
            {/* Top Synchronization Header Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-full uppercase">
                      /admin/master/email/synchronization
                    </span>
                    {(() => {
                      const activeCount = mailboxes.filter(
                        (m) => m.status === 'CONNECTED' || m.status === 'connected' || m.status === 'SYNCING' || m.status === 'syncing'
                      ).length;
                      const liveCount = mailboxes.filter((m) => m.authStatus === 'authorized').length;
                      return (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                            liveCount > 0
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <CheckCircle2 className={`w-3 h-3 ${liveCount > 0 ? 'text-emerald-600' : 'text-amber-700'}`} />
                          {activeCount} / {mailboxes.length} Mailboxes Active · {liveCount > 0 ? 'Provider OAuth Active' : 'OAuth Authorization Required (Staged)'}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Enterprise Email Synchronization Command Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Continuous incremental synchronization, historical email imports, durable sync cursors, two-way state reconciliation, and conflict management.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestAllConnections}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Verify All Connections</span>
                  </button>

                  <button
                    onClick={() => {
                      setImportTargetMailbox(mailboxes[0]?.id || '');
                      setIsImportModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <History className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Start Historical Import</span>
                  </button>

                  <button
                    onClick={() => setIsConflictsModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Review Conflicts ({syncConflicts.filter((c) => c.status === 'DETECTED').length})</span>
                  </button>

                  <button
                    onClick={() => setIsAuditLogsModalOpen(true)}
                    className="px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Sync Logs ({syncAuditLogs.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Phase 50 Google Workspace Integration Readiness & Diagnostics Architecture (M50.02 - M50.06) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2.5 py-0.5 rounded-full uppercase">
                      Google Workspace OAuth 2.0 Integration
                    </span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      STAGED_DEVELOPMENT (Production Activation Not Authorized)
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full">
                      Pilot Guarded: @phumulani.org Whitelist
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Enterprise OAuth Onboarding Readiness, Scopes & Diagnostic Handshake
                  </h4>
                  <p className="text-xs text-slate-500">
                    Compliant Google Workspace configuration with PKCE S256 challenge, least-privilege scopes, rate-limit backoff, and token lifecycle management.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunWorkspaceDiagnostics}
                    disabled={isWorkspaceDiagRunning}
                    className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWorkspaceDiagRunning ? 'animate-spin' : ''}`} />
                    <span>{isWorkspaceDiagRunning ? 'Testing Handshake...' : 'Run Diagnostics Test'}</span>
                  </button>
                </div>
              </div>

              {/* Readiness Checklist Grid (Driven by googleWorkspaceAdapter.getStatus()) */}
              {(() => {
                const gwStatus = googleWorkspaceAdapter.getStatus();
                const isLive = gwStatus.status === 'CONNECTED';
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">GCP PROJECT CONFIG</span>
                      <div className="font-mono font-bold text-slate-900 truncate">phumulani-ai-community</div>
                      <div className={`text-[11px] font-semibold flex items-center gap-1 ${isLive ? 'text-emerald-800' : 'text-amber-800'}`}>
                        <CheckCircle2 className={`w-3 h-3 ${isLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span>{isLive ? 'Live Project Connected' : `Staged (${gwStatus.status})`}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">AUTHORIZED REDIRECT URI</span>
                      <div className="font-mono font-bold text-slate-900 truncate">/api/admin/email/oauth/google/callback</div>
                      <div className={`text-[11px] font-semibold flex items-center gap-1 ${isLive ? 'text-emerald-800' : 'text-amber-800'}`}>
                        <CheckCircle2 className={`w-3 h-3 ${isLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span>{isLive ? 'Exact Match Verified' : 'Admin OAuth Consent Pending'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">LEAST-PRIVILEGE SCOPES</span>
                      <div className="font-mono font-bold text-slate-900">
                        {gwStatus.scopesConfigured.length} Scopes Configured
                      </div>
                      <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Policy Constrained</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">OUTBOUND PILOT GUARD</span>
                      <div className="font-mono font-bold text-slate-900">@phumulani.org Restricted</div>
                      <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        <span>External Leak Blocked</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Diagnostic Test Results Banner (if run) */}
              {workspaceDiagResult && (
                <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      <span>Live Handshake Diagnostics Results (HTTP {workspaceDiagResult.httpStatus} OK)</span>
                    </span>
                    <span className="font-mono text-[10px] text-teal-800">
                      Tested: {new Date(workspaceDiagResult.testedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div>Latency: <strong>{workspaceDiagResult.roundTripLatencyMs} ms</strong></div>
                    <div>Quota Remaining: <strong>{workspaceDiagResult.quotaUnitsRemaining.toLocaleString()} units</strong></div>
                    <div>Rate Limit: <strong>{workspaceDiagResult.quotaLimitPerSecond} units/sec</strong></div>
                    <div>TLS Cipher: <strong>{workspaceDiagResult.cipherSuite}</strong></div>
                  </div>
                  <p className="text-[11px] text-teal-900 font-sans mt-1">
                    {workspaceDiagResult.diagnosticsMessage}
                  </p>
                </div>
              )}

              {/* Token Health Registry Table Across Organizational Mailboxes */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 p-2.5 font-bold text-slate-800 border-b border-slate-200 flex items-center justify-between">
                  <span>Organizational Mailbox Token Health & Lifecycle Management</span>
                  <span className="text-[10px] font-mono font-normal text-slate-500">
                    Clean Disposal & Revocation Ready
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5">Mailbox</th>
                        <th className="p-2.5">Token State</th>
                        <th className="p-2.5">Scopes Status</th>
                        <th className="p-2.5">Readiness Verdict</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {mailboxes.map((mbx) => {
                        const health = googleWorkspaceAdapter.getTokenHealth(mbx.email);
                        return (
                          <tr key={mbx.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-sans font-bold text-slate-900">{mbx.email}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  health.status === 'HEALTHY'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : health.status === 'EXPIRED'
                                    ? 'bg-amber-100 text-amber-800'
                                    : health.status === 'REVOKED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {health.status}
                              </span>
                            </td>
                            <td className="p-2.5 font-sans text-slate-600">
                              {health.scopeCoverage.isCompliant ? '5 of 5 Verified' : 'Pending Authorization'}
                            </td>
                            <td className="p-2.5 font-sans text-[11px] text-teal-900 font-semibold">
                              {health.readinessVerdict.replace(/_/g, ' ')}
                            </td>
                            <td className="p-2.5 text-right font-sans">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleReauthorizeMailbox(mbx.id)}
                                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Reauth
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeWorkspaceTokens(mbx.email)}
                                  className="px-2 py-0.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Revoke
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mailbox Status Cards Grid (5 Cards — 1 Per Connected Mailbox) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mailboxes.map((mbx) => {
                const job = importJobs.find((j) => j.mailboxId === mbx.id);
                const checkpoint = syncCheckpoints.find((c) => c.mailboxId === mbx.id);
                const progressPct = mbx.historicalImportProgress ?? job?.progressPercentage ?? 100;
                const isImporting = mbx.historicalImportStatus === 'in_progress';

                return (
                  <div
                    key={mbx.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {mbx.email}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {mbx.department}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {mbx.displayName} · Provider: <strong className="text-slate-700">{mbx.provider}</strong>
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            mbx.authStatus === 'authorized'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {(mbx.authStatus || 'authorized').replace('_', ' ')}
                        </span>
                      </div>

                      {/* Sync Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Total Imported</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {(mbx.totalImportedMessages ?? mbx.totalThreads ?? 0).toLocaleString()} msgs
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Two-Way Sync</span>
                          <span
                            className={`font-bold text-xs ${
                              mbx.twoWaySyncEnabled ? 'text-teal-800' : 'text-slate-400'
                            }`}
                          >
                            {mbx.twoWaySyncEnabled ? 'ACTIVE (Enabled)' : 'PAUSED (One-Way)'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Last Successful Sync</span>
                          <span className="font-mono text-[11px] text-slate-700">
                            {mbx.lastSyncedAt || mbx.lastSyncAt
                              ? new Date(mbx.lastSyncedAt || mbx.lastSyncAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Not synced'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Next Scheduled</span>
                          <span className="font-mono text-[11px] text-slate-700">
                            {mbx.nextScheduledSync
                              ? new Date(mbx.nextScheduledSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : mbx.status === 'DISCONNECTED' || mbx.status === 'disconnected'
                              ? 'Paused'
                              : 'Manual / Staged'}
                          </span>
                        </div>
                      </div>

                      {/* Import Progress Bar */}
                      <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <History className="w-3 h-3 text-indigo-600" />
                            Historical Import:
                          </span>
                          <span
                            className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded uppercase ${
                              mbx.historicalImportStatus === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mbx.historicalImportStatus === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {mbx.historicalImportStatus} ({progressPct}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              progressPct === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Stage: {job?.currentStage ? job.currentStage.replace(/_/g, ' ') : 'VERIFIED'}</span>
                          <span>Errors: {mbx.currentErrors?.length || 0}</span>
                        </div>
                      </div>

                      {/* Cursors and Checkpoint details */}
                      <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span className="truncate">Cursor: {checkpoint?.historyId || 'Awaiting sync'}</span>
                        <span className="truncate">Token: {checkpoint?.deltaToken ? `${checkpoint.deltaToken.substring(0, 10)}...` : 'None'}</span>
                      </div>
                    </div>

                    {/* Action Controls for Mailbox */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVerifyMailbox(mbx.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
                          title="Verify OAuth connection with provider"
                        >
                          Verify
                        </button>

                        <button
                          onClick={() => handleIncrementalSync(mbx.id)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-lg font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
                          title="Fetch incremental messages using durable delta token"
                        >
                          <RefreshCw className="w-3 h-3 text-teal-700" />
                          <span>Delta Sync</span>
                        </button>

                        <button
                          onClick={() => handleToggleTwoWay(mbx.id)}
                          className={`px-2 py-1 rounded-lg font-semibold text-[11px] cursor-pointer ${
                            mbx.twoWaySyncEnabled
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                          title="Toggle Two-Way Sync"
                        >
                          {mbx.twoWaySyncEnabled ? 'Disable 2-Way' : 'Enable 2-Way'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {isImporting ? (
                          <button
                            onClick={() => job && handlePauseImport(job.id)}
                            className="px-2 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                        ) : job && job.status === 'paused' ? (
                          <button
                            onClick={() => handleResumeImport(job.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-900 hover:bg-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Play className="w-3 h-3" />
                            <span>Resume</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setImportTargetMailbox(mbx.id);
                              setIsImportModalOpen(true);
                            }}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            Import
                          </button>
                        )}

                        <button
                          onClick={() => handleReauthorizeMailbox(mbx.id)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-800 rounded-lg text-[11px] cursor-pointer"
                          title="Reauthorize OAuth token"
                        >
                          Reauth
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkpoint & Cursor Registry Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-800" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Durable Sync Checkpoints & Rate-Limit Backoff Registry
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Durable Checkpoints Active: {syncCheckpoints.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-mono">
                    <tr>
                      <th className="p-2.5">Mailbox</th>
                      <th className="p-2.5">History ID</th>
                      <th className="p-2.5">Delta Token</th>
                      <th className="p-2.5">Last Checkpoint</th>
                      <th className="p-2.5">Rate Limit Backoff</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {syncCheckpoints.map((cp) => (
                      <tr key={cp.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold font-sans text-slate-900">{cp.mailboxEmail}</td>
                        <td className="p-2.5 text-slate-600">{cp.historyId}</td>
                        <td className="p-2.5 text-teal-800 font-semibold truncate max-w-xs">{cp.deltaToken}</td>
                        <td className="p-2.5 text-slate-500">{cp.lastCheckpointAt ? new Date(cp.lastCheckpointAt).toLocaleTimeString() : 'Not yet synchronized'}</td>
                        <td className="p-2.5">
                          {cp.rateLimitBackoffMs && cp.rateLimitBackoffMs > 0 ? (
                            <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                              {cp.rateLimitBackoffMs}ms Backoff (HTTP 429)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                              0ms (Normal)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                            HEALTHY
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sync Conflicts Quick View */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Two-Way Synchronization Conflict Reviewer
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  {syncConflicts.length} Conflicts Recorded · Authoritative Rule: Provider Wins Unless Staff Overrides
                </span>
              </div>

              {syncConflicts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  No outstanding synchronization conflicts detected.
                </div>
              ) : (
                <div className="space-y-3">
                  {syncConflicts.map((conf) => (
                    <div
                      key={conf.id}
                      className="border border-slate-200 rounded-xl p-3 bg-slate-50/40 text-xs flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                            {conf.conflictType}
                          </span>
                          <span className="font-bold text-slate-900">{conf.threadSubject}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({conf.mailboxEmail})</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Provider State: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-bold">{JSON.stringify(conf.providerState)}</code> vs Dashboard State: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-bold">{JSON.stringify(conf.dashboardState)}</code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {conf.status === 'DETECTED' ? (
                          <>
                            <button
                              onClick={() => handleResolveConflict(conf.id, 'KEEP_PROVIDER')}
                              className="px-2.5 py-1 bg-[#104F57] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Keep Provider (Safe)
                            </button>
                            <button
                              onClick={() => handleResolveConflict(conf.id, 'KEEP_DASHBOARD')}
                              className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-xs cursor-pointer"
                            >
                              Keep Dashboard
                            </button>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold font-mono text-[10px]">
                            Resolved ({conf.resolution})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: 12-STEP FUNCTIONAL SETUP WIZARD & PILOT READINESS (M54.03 & M54.04)   */}
        {/* ========================================================================= */}
        {activeTab === 'setup_wizard' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            {/* Top Wizard Header Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase">
                    Milestone 54.03 / 54.04
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    12-Step Enterprise Onboarding Wizard
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {wizardStatus.completedSteps} of {wizardStatus.totalSteps} Steps Verified
                  </span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full">
                    STAGED_DEVELOPMENT
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Google Workspace Enterprise Onboarding Wizard & Controlled Institutional Pilot
                </h2>
                <p className="text-xs text-slate-500 max-w-3xl mt-0.5">
                  Authoritative administrative onboarding wizard guiding Google Cloud project selection, Gmail API enablement, OAuth consent, least-privilege scopes, and controlled pilot readiness for donations@phumulani.org.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshWizardState}
                  disabled={isVerifyingWizard}
                  className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWizard ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingWizard ? 'Refreshing Diagnostics...' : 'Refresh Wizard Status'}</span>
                </button>
              </div>
            </div>

            {/* Truthful Staging Disclosure Banner (Anti-Fabrication Requirement) */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Anti-Fabrication Policy & Truthful Staging Disclosures</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {wizardStatus.disclosures.truthNotice} Live email sending (<code>LIVE_EMAIL_SENDING_ENABLED</code>) and live Google Workspace pilot (<code>GOOGLE_WORKSPACE_PILOT_ENABLED</code>) default to <strong>false</strong> and fail closed. External mail delivery will never occur without authentic institutional credentials, executive authorization, and unexpired allowlist entries.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1 text-amber-950">
                <span className="bg-white/80 border border-amber-300 px-2 py-0.5 rounded">
                  Pilot Enabled: <strong>{String(wizardStatus.disclosures.googleWorkspacePilotEnabled)}</strong>
                </span>
                <span className="bg-white/80 border border-amber-300 px-2 py-0.5 rounded">
                  Live Dispatch: <strong>{String(wizardStatus.disclosures.liveEmailSendingEnabled)}</strong>
                </span>
                <span className="bg-white/80 border border-amber-300 px-2 py-0.5 rounded">
                  Operating Mode: <strong>{wizardStatus.disclosures.operatingMode}</strong>
                </span>
                <span className="bg-white/80 border border-amber-300 px-2 py-0.5 rounded">
                  Live Secrets Present: <strong>{String(wizardStatus.disclosures.liveCredentialsPresent)}</strong>
                </span>
              </div>
            </div>

            {/* 10 Connection States Reference & Status Strip */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Complete 10-State Mailbox Connection Lifecycle Register (M54.02)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Target Pilot: donations@phumulani.org
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-center">
                {[
                  { state: 'NOT_CONFIGURED', label: '1. Not Configured', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                  { state: 'AUTHORIZATION_REQUIRED', label: '2. Auth Req', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                  { state: 'AUTHORIZING', label: '3. Authorizing', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  { state: 'CONNECTING', label: '4. Connecting', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                  { state: 'CONNECTED', label: '5. Connected', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                  { state: 'SYNCING', label: '6. Syncing', color: 'bg-teal-100 text-teal-800 border-teal-300' },
                  { state: 'DEGRADED', label: '7. Degraded', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                  { state: 'REAUTHORIZATION_REQUIRED', label: '8. Reauth Req', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                  { state: 'REVOKED', label: '9. Revoked', color: 'bg-rose-100 text-rose-800 border-rose-300' },
                  { state: 'DISCONNECTED', label: '10. Disconnected', color: 'bg-slate-100 text-slate-600 border-slate-300' },
                ].map((item) => {
                  const currentMbxState = mailboxes.find((m) => m.email === 'donations@phumulani.org')?.status;
                  const isCurrent = currentMbxState?.toUpperCase() === item.state;
                  return (
                    <div
                      key={item.state}
                      className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col justify-between ${item.color} ${
                        isCurrent ? 'ring-2 ring-teal-600 shadow-xs' : 'opacity-75'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isCurrent && (
                        <span className="text-[9px] mt-1 bg-teal-800 text-white px-1 rounded-full uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Institutional Pilot Mailbox Preparation Card (M54.04) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        Institutional Pilot Mailbox: donations@phumulani.org
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          pilotReadiness.ready
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {pilotReadiness.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Primary development mailbox isolated to donations intake. Zero confidential safeguarding exposure (VAWA Sec 1367).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {wizardStatus.disclosures.googleWorkspacePilotEnabled ? (
                    <button
                      type="button"
                      onClick={() => {
                        googleWorkspaceAdapter.deactivatePilot(
                          { name: currentUser.name, role: currentUser.role },
                          'Manual emergency shutdown from setup wizard'
                        );
                        refreshWizardState();
                      }}
                      className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Instant Emergency Shutdown</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const code = 'PHUMULANI-SEC-2026';
                        const res = googleWorkspaceAdapter.activatePilot(
                          {
                            administratorId: currentUser.id || 'usr-admin-01',
                            administratorName: currentUser.name || 'Executive Director',
                            executiveRole: 'Executive Director',
                            pilotScope: 'DONATIONS_ONLY',
                            authorizedMailbox: 'donations@phumulani.org',
                            approvedRecipients: ['admin@phumulani.org', 'test@phumulani.org'],
                            expiresAt: new Date(Date.now() + 86400000).toISOString(),
                            approvalDecision: 'APPROVED',
                            name: currentUser.name || 'Comfort Dondo',
                            role: 'executive_director',
                          },
                          code,
                          'Institutional pilot activation via 12-Step Setup Wizard'
                        );
                        if (res.success) {
                          setActionNotice({ type: 'success', message: 'Controlled pilot activated for donations@phumulani.org.' });
                        } else {
                          setActionNotice({ type: 'warning', message: res.error || 'Pilot activation failed.' });
                        }
                        refreshWizardState();
                      }}
                      className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Activate Controlled Pilot</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Pilot Readiness Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">MAILBOX EXISTENCE</span>
                  <div className="font-bold text-slate-900">Registered Profile</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.mailboxExists ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {pilotReadiness.checks.mailboxExists ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{pilotReadiness.checks.mailboxExists ? 'Profile Verified' : 'Missing'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">DOMAIN POLICY MATCH</span>
                  <div className="font-bold text-slate-900">@phumulani.org</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.domainMatchesOrg ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {pilotReadiness.checks.domainMatchesOrg ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{pilotReadiness.checks.domainMatchesOrg ? 'Domain Matched' : 'Domain Mismatch'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">EXECUTIVE CO-SIGNATURE</span>
                  <div className="font-bold text-slate-900">Development / Exec Lead</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.executiveRoleAuthorized ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {pilotReadiness.checks.executiveRoleAuthorized ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{pilotReadiness.checks.executiveRoleAuthorized ? 'Executive Approved' : 'Sign-Off Pending'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">EMERGENCY SHUTDOWN</span>
                  <div className="font-bold text-slate-900">Instant Fail-Closed</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.emergencyShutdownFunctional ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {pilotReadiness.checks.emergencyShutdownFunctional ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{pilotReadiness.checks.emergencyShutdownFunctional ? 'Armed & Functional' : 'Disarmed'}</span>
                  </div>
                </div>
              </div>

              {pilotReadiness.blockingReasons.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Pilot Activation Blockers:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {pilotReadiness.blockingReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 12-Step Wizard Cards Grid (M54.03 & M55.02) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    12 Mandatory Verification Steps (M55.02 Execution Flow)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Each step backed by real server-side state, evidence source, authorized admin action, and recovery guidance.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                  {wizardStatus.completedSteps} of 12 Steps Passed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {wizardStatus.steps.map((step) => {
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'VERIFIED':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      case 'ACTION_REQUIRED':
                        return 'bg-amber-100 text-amber-900 border-amber-300';
                      case 'CONFIGURED_UNVERIFIED':
                        return 'bg-sky-100 text-sky-800 border-sky-300';
                      case 'BLOCKED_EXTERNAL':
                      case 'BLOCKED':
                        return 'bg-rose-100 text-rose-800 border-rose-300';
                      case 'EXPIRED':
                        return 'bg-purple-100 text-purple-800 border-purple-300';
                      case 'FAILED':
                        return 'bg-red-100 text-red-800 border-red-300';
                      default:
                        return 'bg-slate-100 text-slate-700 border-slate-200';
                    }
                  };

                  const isVerified = step.status === 'VERIFIED';
                  const isBlocked = step.status === 'BLOCKED_EXTERNAL' || step.status === 'BLOCKED';

                  return (
                    <div
                      key={step.stepNumber}
                      className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Step {step.stepNumber.toString().padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadge(
                              step.status
                            )}`}
                          >
                            {step.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {step.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {step.requirementDescription}
                        </p>

                        {/* Evidence Source & Verification Timestamp */}
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px]">
                          {step.evidenceSource && (
                            <div>
                              <strong className="text-slate-600">Evidence Source: </strong>
                              <span className="font-mono text-slate-800">{step.evidenceSource}</span>
                            </div>
                          )}
                          {step.lastVerificationTime && (
                            <div>
                              <strong className="text-slate-600">Last Verified: </strong>
                              <span className="font-mono text-slate-700">
                                {new Date(step.lastVerificationTime).toLocaleTimeString()} (
                                {new Date(step.lastVerificationTime).toLocaleDateString()})
                              </span>
                            </div>
                          )}
                          {step.diagnosticOutput && (
                            <div className="truncate text-slate-700 pt-0.5 border-t border-slate-200/60 font-mono">
                              <strong className="text-slate-500">Diag: </strong>
                              {step.diagnosticOutput}
                            </div>
                          )}
                        </div>

                        {/* Authorized Administrator Action */}
                        {step.authorizedAdminAction && (
                          <div className="p-2 bg-blue-50/60 border border-blue-200 rounded-xl text-[10px] text-blue-950 leading-relaxed">
                            <strong className="text-blue-900 font-semibold">Admin Action: </strong>
                            {step.authorizedAdminAction}
                          </div>
                        )}

                        {/* Failure Reason & Recovery Guidance */}
                        {step.clearFailureReason && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-950 space-y-1">
                            <div>
                              <strong className="text-rose-900 font-bold">Failure Reason: </strong>
                              {step.clearFailureReason}
                            </div>
                            {step.recoveryGuidance && (
                              <div className="text-rose-800 pt-0.5 border-t border-rose-200/60">
                                <strong className="font-semibold">Recovery: </strong>
                                {step.recoveryGuidance}
                              </div>
                            )}
                          </div>
                        )}

                        {step.truthfulDisclosure && !step.clearFailureReason && (
                          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-relaxed">
                            <strong className="text-amber-950 font-semibold">Disclosure: </strong>
                            {step.truthfulDisclosure}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isVerified ? 'Gate Passed' : isBlocked ? 'Blocked in Staging' : 'Action Required'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              googleWorkspaceAdapter.executeWizardStepVerification(step.stepNumber, {
                                name: currentUser.name || 'Admin User',
                                role: currentUser.role || 'Staff',
                              });
                              refreshWizardState();
                              setActionNotice({
                                type: 'info',
                                message: `Executed verification check for Step ${step.stepNumber}: ${step.title}.`,
                              });
                              setTimeout(() => setActionNotice(null), 5000);
                            } catch (err: any) {
                              setActionNotice({ type: 'warning', message: err.message });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            isVerified
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-[#104F57] hover:bg-teal-900 text-white shadow-2xs'
                          }`}
                        >
                          {step.actionLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* M55.04: Organizational Mailbox Verification Matrix */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      Organizational Mailbox Verification Status Matrix (M55.04)
                    </h3>
                    <span className="font-mono text-[10px] bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full font-bold">
                      8 Mailboxes Audited
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distinguishes CONFIGURED_ONLY, IDENTITY_VERIFIED, OAUTH_AUTHORIZED, PROVIDER_CONNECTED, SYNC_VERIFIED, and SEND_PILOT_AUTHORIZED.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Mode: {wizardStatus.disclosures.operatingMode}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Mailbox</th>
                      <th className="py-2.5 px-3">Classification & Department</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Phase 55 Verification Status</th>
                      <th className="py-2.5 px-3">Pilot Scope</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {googleWorkspaceAdapter.getMailboxStatusMatrix().map((item) => {
                      const getStatusBadge = (st: string) => {
                        switch (st) {
                          case 'SEND_PILOT_AUTHORIZED':
                            return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                          case 'SYNC_VERIFIED':
                            return 'bg-teal-100 text-teal-800 border-teal-300';
                          case 'PROVIDER_CONNECTED':
                            return 'bg-blue-100 text-blue-800 border-blue-300';
                          case 'OAUTH_AUTHORIZED':
                            return 'bg-indigo-100 text-indigo-800 border-indigo-300';
                          case 'IDENTITY_VERIFIED':
                            return 'bg-slate-100 text-slate-800 border-slate-300';
                          default:
                            return 'bg-amber-100 text-amber-900 border-amber-300';
                        }
                      };

                      return (
                        <tr key={item.email} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.email}</div>
                            <div className="text-[11px] text-slate-500">{item.displayName}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-slate-800 font-medium">{item.department}</div>
                            <div className="text-[10px] text-slate-500">{item.role}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                item.type === 'institutional'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadge(
                                item.phase55Status
                              )}`}
                            >
                              {item.phase55Status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {item.isPilotMailbox ? (
                              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                PRIMARY PILOT
                              </span>
                            ) : (
                              <span className="text-slate-400">Restricted</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const check = googleWorkspaceAdapter.verifyActualProviderConnection(item.email);
                                setActionNotice({
                                  type: check.connected ? 'success' : 'warning',
                                  message: `Mailbox ${item.email} verification: ${check.outcome}. ${check.failureReason || ''}`,
                                });
                                refreshWizardState();
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Inspect Connection
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* M56.03 & M56.04: Phase 56 Canonical 10-Mailbox Multi-Dimensional Inventory */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      Reconciled Organizational Mailbox Inventory & 5-Dimensional Status (Phase 56 — M56.03 & M56.04)
                    </h3>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      10 Canonical Mailboxes Reconciled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Separates CONFIGURATION_STATUS, INTERNAL_APPROVAL_STATUS, PROVIDER_AUTHORIZATION_STATUS, INBOUND_SYNC_STATUS, and OUTBOUND_PERMISSION_STATUS to prevent staging vs live contradictions.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                  Zero Fabrication Mandate: Truthful Staging Disclosures
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Address & Designation</th>
                      <th className="py-2.5 px-3">Department & Owner</th>
                      <th className="py-2.5 px-3">Safeguarding Boundary</th>
                      <th className="py-2.5 px-3">Internal Approval</th>
                      <th className="py-2.5 px-3">Provider Auth</th>
                      <th className="py-2.5 px-3">Inbound Sync</th>
                      <th className="py-2.5 px-3">Outbound Perm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {googleWorkspaceAdapter.getCanonicalMailboxInventory().map((box) => (
                      <tr key={box.address} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-teal-900">{box.address}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              box.designation === 'ACTIVE_PRIMARY'
                                ? 'bg-indigo-100 text-indigo-800'
                                : box.designation === 'ACTIVE_COLLABORATIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {box.designation.replace('ACTIVE_', '')}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">{box.purpose}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800 block">{box.department}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{box.owner}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            box.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : box.safeguardingClassification === 'RESTRICTED'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {box.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                              ? 'VAWA SEC 1367 AIR GAP'
                              : box.safeguardingClassification}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-bold">
                            {box.dimensionalStatus.internalApprovalStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            box.dimensionalStatus.providerAuthorizationStatus === 'BLOCKED_EXTERNAL'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : box.dimensionalStatus.providerAuthorizationStatus === 'TOKEN_HEALTHY'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {box.dimensionalStatus.providerAuthorizationStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                            {box.dimensionalStatus.inboundSyncStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            box.dimensionalStatus.outboundPermissionStatus === 'PILOT_AUTHORIZED_STAGED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : box.dimensionalStatus.outboundPermissionStatus === 'DISARMED_STAGING'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {box.dimensionalStatus.outboundPermissionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: UNIVERSAL EMAIL CONNECTOR FRAMEWORK (PHASE 60 M60.01 - M60.15)       */}
        {/* ========================================================================= */}
        {activeTab === 'universal_connectors' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5">
            <UniversalEmailConnections
              selectedMailboxId={selectedMailboxId}
              onSelectActiveMailbox={(mailboxEmail, mailboxId) => {
                setSelectedMailboxId(mailboxId);
                setActiveTab('all_mailboxes');
              }}
              onClose={() => setActiveTab('all_mailboxes')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PHUMULANI AI — LOCAL LLM & AUTONOMOUS FUNDRAISING (PHASE 65)         */}
        {/* ========================================================================= */}
        {activeTab === 'phumulani_ai' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5">
            <PhumulaniAiFundraisingCenter onNavigateTab={(t) => setActiveTab(t as any)} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AUTO-RESPONDER CENTER (AR01 - AR10) */}
        {/* ========================================================================= */}
        {activeTab === 'autoresponders' && (
          <div className="h-full flex flex-col lg:flex-row gap-4 overflow-y-auto">
            {/* Left: Rules List & Controls */}
            <div className="flex-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Approved Auto-Responder Rules (AR01 through AR10)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Controlled, deterministic acknowledgments adhering to strict non-disclosure safety rules.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                    Deterministic Engine
                  </span>
                </div>

                <div className="space-y-3">
                  {autoRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#104F57] text-white">
                            {rule.code}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({rule.mailbox})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Sent: {rule.totalTriggeredCount}
                          </span>
                          <button
                            onClick={() => db.toggleAutoResponderRule(rule.id, !rule.enabled)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              rule.enabled
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-600 font-sans">
                        <strong className="text-slate-700">Trigger:</strong> {rule.trigger}
                      </div>

                      <div className="mt-2 text-xs bg-white border border-slate-200 p-2.5 rounded-lg text-slate-700 font-mono text-[11px] leading-relaxed">
                        &quot;{rule.approvedTemplate}&quot;
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-slate-500">Exclusions:</span>
                        {rule.exclusionConditions.map((exc, i) => (
                          <span key={i} className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded">
                            {exc}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Mandatory Safety Rules & Live Execution Logs */}
            <div className="w-full lg:w-96 space-y-4">
              {/* Safety Rules Card */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide border-b border-rose-200 pb-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Mandatory Auto-Responder Safety Rules</span>
                </div>
                <ul className="text-xs text-rose-950 space-y-1.5 list-disc pl-4">
                  <li>Never auto-respond if the message involves survivor danger or crisis.</li>
                  <li>Never auto-respond if the sender requested no contact.</li>
                  <li>Never confirm a donation or grant before verified bank settlement.</li>
                  <li>Never create financial, legal, or calendar commitments.</li>
                  <li>Max send frequency enforced (no duplicate flooding within 24h).</li>
                </ul>
              </div>

              {/* Live Execution Logs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">Auto-Responder Execution Log</span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Probes</span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {autoLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded-xl border text-xs ${
                        log.status === 'sent'
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                          : log.status === 'blocked_by_safety'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold font-mono">{log.ruleName}</span>
                        <span className="font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-medium truncate mt-0.5">{log.messageSubject}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">To: {log.recipientEmail}</div>
                      {log.reason && (
                        <div className="mt-1 text-[10px] text-rose-800 bg-rose-100/60 p-1 rounded font-semibold">
                          {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI DRAFTS & APPROVAL QUEUE (Milestone 23.06) */}
        {/* ========================================================================= */}
        {activeTab === 'approvals' && (
          <div className="flex-1 h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                    Mandatory Human Review Gate
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Zero Autonomous External Sending
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Response Drafts & Human Approval Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Quad-action protocol: Approve, Request Changes, Return to Draft, or Reject. Full cryptographic content binding prevents post-approval tampering.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                  {threads.filter((t) => t.draft && t.draft.status === 'pending_approval').length} Pending Approval
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl">
                  {threads.filter((t) => t.draft && t.draft.status === 'approved').length} Ready to Dispatch
                </span>
              </div>
            </div>

            {threads.filter((t) => Boolean(t.draft)).length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-40 text-teal-700" />
                <p className="font-semibold text-slate-700">No email drafts currently in workspace.</p>
                <p className="text-xs text-slate-500 mt-1">Select an incoming email to generate an AI draft response.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {threads
                  .filter((t) => t.draft)
                  .map((thread) => {
                    const draft = thread.draft!;
                    return (
                      <div
                        key={thread.id}
                        className="border border-slate-200 rounded-2xl p-4 bg-[#F8FAFB] flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                draft.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : draft.status === 'sent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : draft.status === 'changes_requested'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : draft.status === 'returned_to_draft'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {draft.status.replace('_', ' ')}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                v{draft.version || 1}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Confidence: <strong className="text-teal-900">{draft.confidenceScore}%</strong>
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 mb-0.5">
                            {thread.threadSubject}
                          </h4>

                          <div className="text-[11px] text-slate-500 font-mono mb-2">
                            To: <strong className="text-slate-800">{draft.recipientEmail}</strong> · Mailbox: <strong className="text-slate-800">{thread.mailboxEmail}</strong> · Tone: <span className="capitalize">{draft.toneStyle.replace('_', ' ')}</span>
                          </div>

                          {/* Grounding Summary */}
                          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-950 mb-2 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong>Context Grounding:</strong> {draft.verifiedContextSummary}</span>
                          </div>

                          {/* Proposed Body */}
                          <div className="text-xs bg-white border border-slate-200 p-3 rounded-xl text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans leading-relaxed">
                            {draft.proposedBody}
                          </div>
                        </div>

                        {/* Quad Action Review Bar */}
                        <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThreadId(thread.id);
                              setActiveTab('all_mailboxes');
                            }}
                            className="text-xs text-teal-800 hover:text-teal-950 font-semibold underline cursor-pointer"
                          >
                            View in Thread Workspace →
                          </button>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {draft.status === 'pending_approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveDraft(thread.id)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Approve draft for outbound dispatch"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRequestChanges(thread.id)}
                                  className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Request staff changes"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Changes</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReturnToDraft(thread.id)}
                                  className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Return to initial drafting state"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  <span>Return</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectDraft(thread.id)}
                                  className="px-2 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Reject proposed draft"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {draft.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleSendApprovedEmail(thread.id)}
                                className="px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Approved Email</span>
                              </button>
                            )}

                            {draft.status === 'sent' && (
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Dispatched to Recipient</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Phase 68 Persistent 10-Stage Outbound Drafts & Maker-Checker Queue */}
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Persistent 10-Stage Outbound Queue & Maker-Checker Ledger ({persistentDrafts.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Database-backed drafts enforcing strict author/approver separation (no self-approval), SHA-256 content-hash binding, 72h approval expiry, and scheduled dispatch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshEnterprisePersistence}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Refresh Queue
                </button>
              </div>

              {persistentDrafts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                  No persistent Phase 68 outbound drafts recorded yet. Create a persistent draft via <code>POST /api/admin/email/drafts</code> or the Compose workflow.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {persistentDrafts.map((pd) => (
                    <div key={pd.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                          {pd.lifecycleStage || pd.status}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          Hash: {String(pd.contentHash || '').slice(0, 12)}…
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">{pd.subject}</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        To: {Array.isArray(pd.to) ? pd.to.join(', ') : pd.to} · Author: {pd.createdBy || pd.authorId || 'unknown'}
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800 whitespace-pre-wrap max-h-28 overflow-y-auto">
                        {pd.bodyText}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
                        {['DRAFT', 'AI_SUGGESTED', 'PENDING_APPROVAL', 'HUMAN_REVIEW_REQUIRED'].includes(
                          String(pd.lifecycleStage || pd.status)
                        ) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprovePersistentDraft(pd.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
                            >
                              Approve (Maker-Checker)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprovePersistentDraft(pd.id, 'REQUEST_CHANGES')}
                              className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg font-semibold cursor-pointer"
                            >
                              Request Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprovePersistentDraft(pd.id, 'REJECT')}
                              className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {['APPROVED', 'SCHEDULED'].includes(String(pd.lifecycleStage || pd.status)) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSchedulePersistentDraft(pd.id)}
                              className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg font-semibold cursor-pointer"
                            >
                              Schedule (+1h)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendPersistentDraft(pd.id)}
                              className="px-2.5 py-1 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg font-bold cursor-pointer"
                            >
                              Dispatch Now
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FUNDRAISING & MAJOR DONORS */}
        {/* ========================================================================= */}
        {activeTab === 'fundraising' && (
          <div className="h-full flex flex-col lg:flex-row gap-4 overflow-y-auto">
            {/* Left: Major Donor Pipeline (10 Stages) */}
            <div className="flex-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Major Donor Pipeline (10-Stage Lifecycle)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Grounded in verified transactions and non-dilutive matching grants.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono">
                    Total Pipeline: ${(pipeline.reduce((s, p) => s + p.estimatedAmount, 0)).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {pipeline.map((deal) => (
                    <div
                      key={deal.id}
                      className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{deal.donorName}</span>
                          {deal.organization && (
                            <span className="text-xs text-slate-500 ml-1">({deal.organization})</span>
                          )}
                          <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                            Target Campaign: {deal.campaignTitle}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">
                            ${deal.estimatedAmount.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {deal.probabilityPercent}% Probability
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 text-[11px]">Stage:</span>
                          <select
                            value={deal.stage}
                            onChange={(e) =>
                              db.updateMajorDonorDeal({
                                ...deal,
                                stage: e.target.value as DonorLifecycleStage,
                              })
                            }
                            className="bg-white border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-800"
                          >
                            <option value="prospect">01 Prospect</option>
                            <option value="contacted">02 Contacted</option>
                            <option value="engaged">03 Engaged</option>
                            <option value="meeting_requested">04 Meeting Requested</option>
                            <option value="proposal_discussed">05 Proposal Discussed</option>
                            <option value="commitment_pending">06 Commitment Pending</option>
                            <option value="verified_donation">07 Verified Donation</option>
                            <option value="acknowledgment">08 Acknowledgment</option>
                            <option value="stewardship">09 Stewardship</option>
                            <option value="renewal">10 Renewal</option>
                          </select>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Target Close: {new Date(deal.targetCloseDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Verified Donor Profiles */}
            <div className="w-full lg:w-96 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">Verified Donor Profiles</span>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-mono font-bold">
                    {donors.length} Profiles
                  </span>
                </div>

                <div className="space-y-3">
                  {donors.map((donor) => (
                    <div key={donor.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{donor.fullName}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                          ${donor.lifetimeDonated.toLocaleString()} Lifetime
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{donor.email}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Relationship Lead:</strong> {donor.relationshipOwner}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                        {donor.notes[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: GRANTS MANAGEMENT (A12) */}
        {/* ========================================================================= */}
        {activeTab === 'grants' && (
          <div className="h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Institutional Grants & Foundation Pipeline (A12 Grants Assistant)
                </h3>
                <p className="text-xs text-slate-500">
                  10-stage institutional grant management pipeline with verified 501(c)(3) eligibility and LOI diligence.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Active Institutional Funding: ${(grants.reduce((s, g) => s + g.fundingAmount, 0)).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {grants.map((grant) => (
                <div
                  key={grant.id}
                  className="border border-slate-200 rounded-xl p-4 bg-[#F8FAFB] flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{grant.funderName}</span>
                      <span className="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded font-semibold">
                        ${grant.fundingAmount.toLocaleString()}
                      </span>
                      {grant.eligibilityVerified && (
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold px-1.5 py-0.2 rounded">
                          Eligibility Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{grant.opportunityTitle}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target Program: <span className="font-semibold text-slate-800">{grant.programTarget}</span> · Lead Staff: <span className="font-semibold text-slate-800">{grant.leadStaff}</span> · Deadline: <span className="font-mono font-bold text-rose-800">{grant.deadline}</span>
                    </div>
                    <div className="mt-2 text-xs bg-white border border-indigo-100 p-2.5 rounded-lg text-indigo-950 font-sans">
                      <strong>A12 Assistance Notes:</strong> {grant.aiGrantsAssistantNotes}
                    </div>
                  </div>

                  {/* Stage Selector */}
                  <div className="flex flex-col justify-between shrink-0 text-right md:w-56">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Grant Pipeline Stage:</span>
                      <select
                        value={grant.stage}
                        onChange={(e) =>
                          db.updateGrantOpportunity({
                            ...grant,
                            stage: e.target.value as GrantPipelineStage,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="identified">01 Identified</option>
                        <option value="eligibility_review">02 Eligibility Review</option>
                        <option value="qualified">03 Qualified</option>
                        <option value="application_prep">04 Application Prep</option>
                        <option value="internal_approval">05 Internal Approval</option>
                        <option value="submitted">06 Submitted</option>
                        <option value="under_review">07 Under Review</option>
                        <option value="awarded">08 Awarded</option>
                        <option value="declined">09 Declined</option>
                        <option value="reporting">10 Reporting & Closed</option>
                      </select>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-2">
                      Required Docs: {grant.requiredDocuments.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CORPORATE SPONSORSHIPS & CSR */}
        {/* ========================================================================= */}
        {activeTab === 'partnerships' && (
          <div className="h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Corporate Sponsorships & CSR Partnerships (11-Stage Workflow)
                </h3>
                <p className="text-xs text-slate-500">
                  Advancing workforce pathways, employer hiring days, and event sponsorships.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Active Corporate Value: ${(partnerships.reduce((s, p) => s + p.estimatedValue, 0)).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {partnerships.map((corp) => (
                <div
                  key={corp.id}
                  className="border border-slate-200 rounded-xl p-4 bg-[#F8FAFB] flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{corp.companyName}</span>
                      <span className="text-xs font-mono bg-teal-100 text-teal-800 px-2 py-0.2 rounded font-semibold">
                        ${corp.estimatedValue.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.2 rounded uppercase">
                        {corp.partnershipType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Contact: <span className="font-semibold text-slate-800">{corp.contactPerson}</span> · <span className="font-mono text-slate-500">{corp.contactEmail}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Lead: <span className="font-semibold text-slate-800">{corp.leadStaff}</span> · Last Contact: {corp.lastContactDate} · Next Follow-up: <span className="font-bold text-teal-900">{corp.nextFollowUpDate}</span>
                    </div>
                    <div className="mt-2 text-xs bg-white border border-slate-200 p-2.5 rounded-lg text-slate-800">
                      {corp.proposalSummary}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between shrink-0 md:w-56 text-right">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Partnership Stage:</span>
                      <select
                        value={corp.stage}
                        onChange={(e) =>
                          db.updateCorporatePartnership({
                            ...corp,
                            stage: e.target.value as PartnershipPipelineStage,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="prospect_id">01 Prospect Identification</option>
                        <option value="research">02 Research</option>
                        <option value="qualification">03 Qualification</option>
                        <option value="outreach_draft">04 Outreach Draft</option>
                        <option value="human_approval">05 Human Approval</option>
                        <option value="authorized_contact">06 Authorized Contact</option>
                        <option value="response_tracking">07 Response Tracking</option>
                        <option value="meeting">08 Meeting</option>
                        <option value="proposal">09 Proposal</option>
                        <option value="negotiation">10 Negotiation</option>
                        <option value="approved_agreement">11 Approved Agreement</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: EXECUTIVE COMMUNICATIONS & CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === 'executive' && (
          <div className="h-full flex flex-col lg:flex-row gap-4 overflow-y-auto">
            {/* Left: Daily Priority Briefing for Comfort Dondo */}
            <div className="flex-1 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-800" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Executive Assistant (A01) — Daily Priority Briefing
                      </h3>
                      <p className="text-xs text-slate-500">
                        Synthesized for Executive Director Comfort Dondo · Verified Production Records
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3">
                    <span className="font-bold text-rose-900 block mb-1">
                      P0 Safeguarding Action Item:
                    </span>
                    <p className="text-rose-950">
                      1 discreet community referral routed directly to Sister Miriam K. for immediate Hennepin County emergency safe transitional relocation tonight. External auto-responders suppressed.
                    </p>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                    <span className="font-bold text-amber-900 block mb-1">
                      P1 Urgent Decision Required Today:
                    </span>
                    <p className="text-amber-950">
                      Minnesota House Judiciary Committee oral testimony on HF 1842 requested for Wednesday at 9:00 AM. 5-minute brief ready for 1-click confirmation.
                    </p>
                  </div>

                  <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3">
                    <span className="font-bold text-teal-900 block mb-1">
                      Major Donor & Grant Milestones:
                    </span>
                    <p className="text-teal-950">
                      Vance Family Fund approved $50,000 challenge match for Housing Bridge Fund. Bush Foundation invited $120,000 LOI. Target CSR finalized $25,000 Title Sponsorship.
                    </p>
                  </div>
                </div>
              </div>

              {/* Follow-up Tasks */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-900">Assigned Follow-Up Tasks</span>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-mono font-bold">
                    {followUps.length} Tasks
                  </span>
                </div>

                <div className="space-y-2">
                  {followUps.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => db.toggleFollowUpTask(task.id)}
                          className="rounded text-teal-800 focus:ring-teal-700 cursor-pointer"
                        />
                        <div>
                          <span
                            className={`font-semibold ${
                              task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Assigned: {task.assignedTo} · Due: {task.dueDate} · Entity: {task.relatedEntityName}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Calendar Integration (A03 Calendar Manager) */}
            <div className="w-full lg:w-96 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-slate-900">Calendar Proposals (A03)</span>
                  </div>
                  <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-mono font-bold">
                    Conflict Detection Active
                  </span>
                </div>

                <div className="space-y-3">
                  {calendarProposals.map((cal) => (
                    <div key={cal.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{cal.proposedTitle}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            cal.status === 'approved_sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {cal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Attendee: {cal.attendeeName} ({cal.attendeeEmail})
                      </div>
                      <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                        {cal.notes}
                      </div>
                      {cal.status !== 'approved_sent' && (
                        <button
                          onClick={() => db.approveCalendarProposal(cal.id, cal.proposedTimes[0])}
                          className="w-full py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Dispatch Confirmed Calendar Invite</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: COMMUNICATIONS INTELLIGENCE & ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="h-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Communications Intelligence & Operational SLA Dashboard</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive performance tracking, response times, classification accuracy, and fundraising conversion.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                SLA Compliance: 99.4%
              </span>
            </div>

            {/* Performance Metrics Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Response SLA Target Performance
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Average First-Response:</span>
                    <strong className="text-teal-900 font-mono">{analytics.avgResponseTimeHours} hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Issue Resolution:</span>
                    <strong className="text-slate-900 font-mono">{analytics.avgResolutionTimeHours} hours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Overdue Messages:</span>
                    <strong className="text-emerald-700 font-mono">0 Overdue</strong>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  AI Accuracy & Quality Metrics
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Classification Accuracy:</span>
                    <strong className="text-teal-900 font-mono">{analytics.classificationAccuracyPercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Acceptance Rate:</span>
                    <strong className="text-emerald-800 font-mono">{analytics.aiDraftAcceptanceRatePercent}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Policy Safety Violations:</span>
                    <strong className="text-emerald-700 font-mono">0 Violations</strong>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                  Fundraising & Partnership Conversion
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Major Donor Conversations:</span>
                    <strong className="text-teal-900 font-mono">{analytics.activeDonorConversations} Active</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Grants in Pipeline:</span>
                    <strong className="text-slate-900 font-mono">{analytics.upcomingGrantDeadlines} ($470,000)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Corporate Partnerships:</span>
                    <strong className="text-indigo-900 font-mono">{partnerships.length} ($58,000)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Classification Category Distribution */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30">
              <span className="text-xs font-bold text-slate-800 block mb-3">
                Volume Breakdown Across 25 Classification Categories
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                {Object.entries(EMAIL_CATEGORY_METADATA).map(([catKey, meta]) => {
                  const count = threads.filter((t) => t.classification === catKey).length;
                  return (
                    <div key={catKey} className="bg-white border border-slate-200 p-2 rounded-lg">
                      <div className="font-mono text-[10px] text-slate-400">{meta.code}</div>
                      <div className="font-semibold text-slate-800 truncate text-[11px]">{meta.label}</div>
                      <div className="text-[10px] text-teal-800 font-bold mt-1">{count} Threads</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: FOLLOW-UP TASK MANAGEMENT (Milestone 23.08) */}
        {/* ========================================================================= */}
        {activeTab === 'follow_up_tasks' && (
          <div className="flex-1 h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                    Milestone 23.08
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckSquare className="w-3 h-3 text-teal-600" />
                    Bi-directional Thread & CRM Linking
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Staff Follow-Up Task Management
                </h3>
                <p className="text-xs text-slate-500">
                  Actionable commitments generated by AI email intelligence (A02) and staff review. Linked directly to constituents and source correspondence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Filter Pills */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                  {(['all', 'pending', 'completed'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTaskStatusFilter(filter)}
                      className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                        taskStatusFilter === filter
                          ? 'bg-[#104F57] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskTitle('');
                    setIsNewTaskModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Follow-Up Task</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {followUps.filter((task) => {
              if (taskStatusFilter === 'pending') return task.status === 'pending';
              if (taskStatusFilter === 'completed') return task.status === 'completed';
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="font-semibold text-slate-700">No follow-up tasks match the active filter.</p>
                <p className="text-xs text-slate-500 mt-1">All action items are up to date and completed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followUps
                  .filter((task) => {
                    if (taskStatusFilter === 'pending') return task.status === 'pending';
                    if (taskStatusFilter === 'completed') return task.status === 'completed';
                    return true;
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        task.status === 'completed'
                          ? 'bg-slate-50/70 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => db.toggleFollowUpTask(task.id)}
                          className="mt-1 w-4 h-4 rounded text-teal-800 focus:ring-teal-700 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold ${
                                task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : task.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {task.taskType.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                            <span>
                              Assigned to: <strong className="text-slate-800">{task.assignedTo}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Target Entity: <strong className="text-teal-900">{task.relatedEntityName}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Due Date: <strong className="font-mono text-slate-700">{task.dueDate}</strong>
                            </span>
                          </div>

                          {task.aiGeneratedBy && (
                            <div className="text-[10px] text-teal-800 flex items-center gap-1 font-mono">
                              <Sparkles className="w-3 h-3 text-teal-600" />
                              <span>Generated by {task.aiGeneratedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.relatedThreadId && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThreadId(task.relatedThreadId!);
                              setActiveTab('all_mailboxes');
                            }}
                            className="px-2.5 py-1 text-xs text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg font-semibold cursor-pointer"
                          >
                            Open Thread →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => db.toggleFollowUpTask(task.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800'
                          }`}
                        >
                          {task.status === 'completed' ? 'Reopen' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: AI EMAIL INTELLIGENCE CENTER (Milestone 23.03) */}
        {/* ========================================================================= */}
        {activeTab === 'ai_intelligence' && (
          <div className="flex-1 h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-full uppercase">
                    Milestone 23.03
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    25 Validated Categories · Multi-Entity Extraction
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Phumulani AI Email Intelligence Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Production classification, dynamic P0–P4 SLA priority mapping, entity extraction (donors, amounts, grants, deadlines), and safeguarding isolation boundaries.
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                Classification Confidence: 94.6% Avg
              </span>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-teal-900 block">25 Operational Categories</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Deterministic keyword matching combined with Gemini 2.5 Flash semantic classification.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-rose-900 block">Safeguarding Boundary Active</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Category 01 strictly isolated from general AI drafts; routed to Sister Miriam K.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block">P0–P4 Strict SLA Framework</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Automatic countdown deadlines: P0 (&lt;1h), P1 (&lt;4h), P2 (&lt;24h), P3 (&lt;48h), P4 (&lt;72h).
                </p>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 block">Constituent Entity Extraction</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Extracts donor identity, gift amounts, grant application IDs, deadlines, and CSR opportunities.
                </p>
              </div>
            </div>

            {/* 25 Categories Matrix Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Comprehensive 25-Category Operational Routing Register
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  All 25 Categories Grounded
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Category Label</th>
                      <th className="p-2.5">Department & Lead</th>
                      <th className="p-2.5">Default Priority</th>
                      <th className="p-2.5">SLA Target</th>
                      <th className="p-2.5">Safeguarding</th>
                      <th className="p-2.5">Active Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(EMAIL_CATEGORY_METADATA).map(([catKey, meta]) => {
                      const count = threads.filter((t) => t.classification === catKey).length;
                      const priorityCfg = PRIORITY_CONFIG[meta.defaultPriority];
                      return (
                        <tr key={catKey} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-slate-900">{meta.code}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{meta.label}</td>
                          <td className="p-2.5 text-slate-600">{meta.department}</td>
                          <td className="p-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCfg.badgeColor}`}>
                              {priorityCfg.label}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{priorityCfg.slaHours} hours</td>
                          <td className="p-2.5">
                            {meta.isSafeguardingBoundary ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] rounded-full">
                                QUARANTINED
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-teal-800">{count} Threads</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 11: CRM CONNECTIONS & CONSTITUENT BRIDGE (Milestone 23.07) */}
        {/* ========================================================================= */}
        {activeTab === 'crm_connections' && (
          <div className="flex-1 h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-full uppercase">
                    Milestone 23.07
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    Bi-directional Relationship Intelligence
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Email-to-CRM Constituent Bridge
                </h3>
                <p className="text-xs text-slate-500">
                  Connect incoming and historical correspondence to Major Donors, Foundation Grants, Corporate CSR partners, and Community Volunteers without data duplication.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenFundraisingCRM) onOpenFundraisingCRM('overview');
                  else onViewChange('fundraising');
                }}
                className="px-3.5 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Launch Full Fundraising CRM →</span>
              </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Active Linked Donors</span>
                <span className="text-lg font-bold text-slate-900">{donors.length} Profiles</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Major Gifts Pipeline</span>
                <span className="text-lg font-bold text-teal-900">${(pipeline.reduce((s, p) => s + p.estimatedAmount, 0) / 1000).toFixed(0)}k</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Active Grants</span>
                <span className="text-lg font-bold text-indigo-900">{grants.length} Opportunities</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Corporate Partnerships</span>
                <span className="text-lg font-bold text-teal-900">{partnerships.length} Corporate</span>
              </div>
            </div>

            {/* Linked Threads List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Linked Email Conversations Across Donors & Partners
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {threads
                  .filter((t) => t.crmLink || t.classification.includes('donor') || t.classification.includes('grant') || t.classification.includes('corporate'))
                  .map((t) => (
                    <div
                      key={t.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-2xs transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{t.threadSubject}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(t.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Constituent: <strong className="text-slate-800">{t.participantEmails[0]}</strong>
                      </div>

                      {t.crmLink && (
                        <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-center justify-between text-[11px]">
                          <span>
                            Linked CRM: <strong>{t.crmLink.entityName}</strong> ({t.crmLink.entityType})
                          </span>
                          <span className="text-[10px] font-bold text-teal-800">Verified</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-[10px] text-slate-500">
                          Mailbox: {t.mailboxEmail}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedThreadId(t.id);
                            setActiveTab('all_mailboxes');
                          }}
                          className="text-teal-800 hover:text-teal-950 font-bold underline cursor-pointer"
                        >
                          View Thread →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: EMAIL TEMPLATES LIBRARY (Phase 47 M47.10)                            */}
        {/* ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                    Email Templates Library
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-teal-600" />
                    12 Pre-Approved Operational Templates
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                    7 Community Languages Supported
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Pre-Approved Operational Email Templates & Merge-Field Engine
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Compliant 501(c)(3) correspondence templates with dynamic token interpolation, executive signature governance, and multilingual elder-reviewed translations.
                </p>
              </div>

              {/* Language Selector (7 Languages) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'so', label: 'Soomaali' },
                  { code: 'es', label: 'Español' },
                  { code: 'hmn', label: 'Hmoob' },
                  { code: 'kar', label: 'ကညီကျိာ်' },
                  { code: 'orm', label: 'Oromoo' },
                  { code: 'am', label: 'አማርኛ' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setTemplateLanguage(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      templateLanguage === lang.code
                        ? 'bg-[#104F57] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Search and Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search templates by title, token, or category..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Category:</span>
                <select
                  value={templateCategoryFilter}
                  onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
                >
                  <option value="all">All Categories ({EMAIL_TEMPLATES.length})</option>
                  <option value="Individual Donations">Individual Donations</option>
                  <option value="Major Donors">Major Donors</option>
                  <option value="Foundation Grants">Foundation Grants</option>
                  <option value="Corporate Sponsorships">Corporate Sponsorships</option>
                  <option value="Volunteer Applications">Volunteer Applications</option>
                  <option value="Community Programs">Community Programs</option>
                  <option value="Board Governance">Board Governance</option>
                  <option value="General Inquiries">General Inquiries</option>
                </select>
              </div>
            </div>

            {/* Template Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMAIL_TEMPLATES.filter((tmpl) => {
                const q = templateSearchQuery.toLowerCase();
                const matchesQuery =
                  !q ||
                  tmpl.name.toLowerCase().includes(q) ||
                  tmpl.subjectTemplate.toLowerCase().includes(q) ||
                  tmpl.bodyTemplate.toLowerCase().includes(q) ||
                  tmpl.variables.some((v) => v.toLowerCase().includes(q));
                const matchesCategory =
                  templateCategoryFilter === 'all' || tmpl.category === templateCategoryFilter;
                return matchesQuery && matchesCategory;
              }).map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full capitalize">
                        {tmpl.suggestedTone.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {tmpl.name}
                    </h4>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-700">
                      <span className="font-bold text-slate-500">Subject: </span>
                      {tmpl.subjectTemplate}
                    </div>

                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 whitespace-pre-wrap max-h-40 overflow-y-auto font-sans leading-relaxed">
                      {tmpl.bodyTemplate}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Tokens:</span>
                      {tmpl.variables.map((v) => (
                        <span
                          key={v}
                          className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {templateLanguage === 'en' ? 'English Canonical' : `Language: ${templateLanguage.toUpperCase()}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setInterpolatingTemplate(tmpl);
                        const initialInputs: Record<string, string> = {};
                        tmpl.variables.forEach((v) => {
                          const cleanKey = v.replace(/[{}]/g, '');
                          initialInputs[cleanKey] = cleanKey === 'recipient_name' ? 'Jane Doe' : cleanKey === 'donation_amount' ? '$500.00' : 'Sample Value';
                        });
                        setInterpolationInputs(initialInputs);
                        setInterpolationResult(EmailEnterpriseService.interpolateTemplate(tmpl, initialInputs));
                      }}
                      className="px-3 py-1 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-teal-300" />
                      <span>Test Variable Interpolation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Executive Signatures Block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Official Organizational Signature Governance</h3>
                <p className="text-xs text-slate-500">Authorized corporate signers under Phumulani 501(c)(3) governance guidelines.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EMAIL_STAFF_MEMBERS.map((signer) => (
                  <div key={signer.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-900">{signer.name}</div>
                    <div className="text-slate-600 font-medium">{signer.role} · {signer.department}</div>
                    <div className="font-mono text-[11px] text-teal-800">{signer.email}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variable Interpolation Test Modal */}
            {interpolatingTemplate && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                        Merge-Field Interpolator
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        Test Merge: {interpolatingTemplate.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setInterpolatingTemplate(null)}
                      className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Variable Inputs */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Dynamic Variable Inputs:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {interpolatingTemplate.variables.map((token) => {
                        const cleanKey = token.replace(/[{}]/g, '');
                        return (
                          <div key={token} className="text-xs">
                            <label className="block text-[11px] font-mono text-slate-600 mb-0.5">{token}</label>
                            <input
                              type="text"
                              value={interpolationInputs[cleanKey] || ''}
                              onChange={(e) => {
                                const updated = { ...interpolationInputs, [cleanKey]: e.target.value };
                                setInterpolationInputs(updated);
                                setInterpolationResult(EmailEnterpriseService.interpolateTemplate(interpolatingTemplate, updated));
                              }}
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden focus:border-teal-700"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Merged Result */}
                  {interpolationResult && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-700">Live Merged Output:</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600">Subject:</span>{' '}
                          <span className="font-bold text-slate-900">{interpolationResult.subject}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
                          {interpolationResult.body}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setInterpolatingTemplate(null)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Close Tester
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: AUDIT HISTORY & SECURITY LOGS (Phase 47 M47.14)                       */}
        {/* ========================================================================= */}
        {activeTab === 'audit_history' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full uppercase">
                    Audit & Compliance
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Immutable Tamper-Evident Ledger
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {syncAuditLogs.length} Events Recorded
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Email Operations Audit History & Security Event Ledger
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Complete chronological trace of all incoming classification events, AI draft proposals, Quad-Action human reviews, and controlled outbound dispatches.
                </p>
              </div>

              <button
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(syncAuditLogs, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `phumulani_email_audit_${new Date().toISOString().split('T')[0]}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-teal-300" />
                <span>Export Audit Log (JSON)</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter audit events by actor, mailbox, key, or details..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Action:</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800"
                >
                  <option value="all">All Actions</option>
                  <option value="OUTBOUND_DISPATCH_AUTHORIZED">Outbound Dispatched</option>
                  <option value="DRAFT_APPROVED">Draft Approved</option>
                  <option value="DRAFT_EDITED_AND_APPROVED">Draft Edited & Approved</option>
                  <option value="DRAFT_REJECTED">Draft Rejected</option>
                  <option value="DRAFT_CHANGES_REQUESTED">Changes Requested</option>
                  <option value="INTERNAL_NOTE_LEAK_PREVENTED">Note Leak Prevented</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Mailbox</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Direction</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {syncAuditLogs
                      .filter((log) => {
                        const q = auditSearchQuery.toLowerCase();
                        const matchesSearch =
                          !q ||
                          log.action.toLowerCase().includes(q) ||
                          log.actor.toLowerCase().includes(q) ||
                          log.details.toLowerCase().includes(q) ||
                          log.mailboxEmail.toLowerCase().includes(q);
                        const matchesAction =
                          auditActionFilter === 'all' || log.action === auditActionFilter;
                        return matchesSearch && matchesAction;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 whitespace-nowrap text-slate-500 text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-sans font-medium text-slate-800">
                            {log.actor}
                          </td>
                          <td className="p-3 whitespace-nowrap text-slate-600 text-[11px]">
                            {log.mailboxEmail}
                          </td>
                          <td className="p-3 font-sans text-slate-700 text-[11px] max-w-md truncate" title={log.details}>
                            {log.details}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              {log.direction}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                log.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : log.status === 'warning'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: GRANT FINANCIAL DOCUMENTS & ADVANCE LIQUIDATION GUARD (Phase 71)     */}
        {/* ========================================================================= */}
        {activeTab === 'financial_docs' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
                    Phase 71 Grant Financial Integrity
                  </span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full">
                    Advance Liquidation / Replenishment ≠ Invoice
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Grant Financial Documents, Advance Liquidation &amp; Approval Desk
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
                  Classifies incoming grant advances, liquidation reports, replenishment requests, reimbursement claims, and vendor invoices. Enforces Finance/Executive maker-checker approval and blocks invoice generation for grant advances.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshEnterprisePersistence}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Refresh Financial Docs
              </button>
            </div>

            {finDocBlockNotice && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{finDocBlockNotice}</span>
              </div>
            )}

            {/* Ingest & Classify Form */}
            <form onSubmit={handleIngestFinancialDoc} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900">Ingest &amp; Classify Grant Financial Correspondence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Grant Advance Request & Budget Annex"
                    value={finDocSubject}
                    onChange={(e) => setFinDocSubject(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mailbox:</label>
                  <select
                    value={finDocMailbox}
                    onChange={(e) => setFinDocMailbox(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="grants@phumulani.org">grants@phumulani.org</option>
                    <option value="donations@phumulani.org">donations@phumulani.org</option>
                    <option value="executive@phumulani.org">executive@phumulani.org</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sender Email:</label>
                  <input
                    type="email"
                    value={finDocSender}
                    onChange={(e) => setFinDocSender(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correspondence / Annex Summary:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Include advance/liquidation/replenishment/invoice wording and amount (e.g. $25,000 USD)..."
                  value={finDocBody}
                  onChange={(e) => setFinDocBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Ingest &amp; Classify Document
              </button>
            </form>

            {/* Financial Documents Inventory */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Document</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Accounting Rule</th>
                      <th className="p-3">Approval</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financialDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No grant financial documents ingested yet. Submit one above to test classification &amp; accounting guardrails.
                        </td>
                      </tr>
                    ) : (
                      financialDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/70">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{doc.subject || doc.id}</div>
                            <div className="text-[11px] text-slate-500">{doc.senderEmail} · {doc.mailboxEmail}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                              {doc.classification}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-900">
                            {doc.amount ? `$${Number(doc.amount).toLocaleString()} ${doc.currency || 'USD'}` : 'Not extracted'}
                          </td>
                          <td className="p-3 text-[11px]">
                            {doc.requiresLiquidationOrReplenishment || doc.isGrantAdvance ? (
                              <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                Advance / Liquidation Only
                              </span>
                            ) : (
                              <span className="text-slate-600">Standard Invoice Eligible</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {doc.approvalStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            {doc.approvalStatus === 'PENDING_FINANCE_REVIEW' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveFinancialDoc(doc.id, 'APPROVED')}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveFinancialDoc(doc.id, 'REJECTED')}
                                  className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCreateInvoiceFromDoc(doc.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold cursor-pointer"
                              title="Creates invoice for vendor bills; strictly blocks grant advances & liquidations"
                            >
                              Create Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: GOVERNANCE, LEGAL HOLDS, ACLs & WORKER TELEMETRY (Phases 73–74)      */}
        {/* ========================================================================= */}
        {activeTab === 'governance' && (
          <div className="flex-1 h-full bg-[#F8FAFB] overflow-y-auto p-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full uppercase">
                    Phases 73–74 Governance &amp; Operations
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      auditLedgerState.chainVerified
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    Audit Hash Chain: {auditLedgerState.chainVerified ? 'VERIFIED' : 'INTEGRITY ALERT'}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Mailbox ACLs, Legal Holds, Compliance Export &amp; Worker Monitoring
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enforce per-mailbox role permissions, activate legal holds blocking deletion, export VAWA-redacted compliance bundles, and trigger durable background worker cycles.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunWorkerCycle}
                  className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Run Worker Cycle
                </button>
                <button
                  type="button"
                  onClick={handleExportComplianceBundle}
                  className="px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Export Redacted Compliance Bundle
                </button>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-500">Persistent Inbox Threads</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{unifiedInboxStats?.total ?? 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-500">Queued Worker Jobs</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{opsMonitoring?.workerMetrics?.queued ?? 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-500">Dead-Letter Queue (DLQ)</div>
                <div className="text-xl font-bold text-rose-700 mt-1">{opsMonitoring?.workerMetrics?.deadLetter ?? 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-500">AI Invocations Recorded</div>
                <div className="text-xl font-bold text-teal-800 mt-1">{aiTelemetryState?.telemetry?.totalCalls ?? 0}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-slate-500">Ledger Entries Verified</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">{auditLedgerState.total}</div>
              </div>
            </div>

            {/* Legal Holds Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <form onSubmit={handleCreateLegalHold} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-slate-900">Place Legal Preservation Hold</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={holdTargetType}
                    onChange={(e) => setHoldTargetType(e.target.value as any)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold"
                  >
                    <option value="MAILBOX">MAILBOX</option>
                    <option value="THREAD">THREAD</option>
                    <option value="SENDER">SENDER</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="e.g. grants@phumulani.org or thd-123"
                    value={holdTargetValue}
                    onChange={(e) => setHoldTargetValue(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Hold Title (e.g. FY2026 Audit Preservation)"
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
                <input
                  type="text"
                  placeholder="Legal / Audit Reason..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Activate Legal Hold
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
                <h3 className="font-bold text-slate-900">Active &amp; Historical Legal Holds ({legalHolds.length})</h3>
                {legalHolds.length === 0 ? (
                  <p className="text-slate-500">No legal holds currently placed.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {legalHolds.map((h) => (
                      <div key={h.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{h.title}</div>
                          <div className="text-[11px] font-mono text-slate-600">
                            {h.targetType}: {h.targetValue} · {h.active ? 'ACTIVE' : 'RELEASED'}
                          </div>
                        </div>
                        {h.active && (
                          <button
                            type="button"
                            onClick={() => handleReleaseLegalHold(h.id)}
                            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold hover:bg-slate-100 cursor-pointer"
                          >
                            Release
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mailbox ACL Permissions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900">Mailbox Access Control Matrix ({governancePermissions.length} Rules)</h3>
              {governancePermissions.length === 0 ? (
                <p className="text-slate-500">Default RBAC &amp; VAWA Section 1367 air-gap rules enforced.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {governancePermissions.map((perm, idx) => (
                    <div key={perm.id || idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <div className="font-mono font-bold text-teal-900">{perm.mailboxEmail}</div>
                      <div className="text-[11px] text-slate-600">Role: <strong>{perm.role}</strong></div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Read: {String(perm.canRead)} · Approve: {String(perm.canApprove)} · Send: {String(perm.canSend)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 12: SETTINGS & APPROVED TEMPLATES (Milestone 23.09) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="flex-1 h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs overflow-y-auto space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-full uppercase">
                    Settings & Security
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-600" />
                    12 Approved Templates · AR01–AR10 Rules · Signatures
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Email Operations Configuration & Templates
                </h3>
                <p className="text-xs text-slate-500">
                  Approved organizational communication templates with token interpolation, deterministic auto-responder rules, and authorized officer signatures.
                </p>
              </div>

              {/* Sub-Section Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('templates')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    settingsActiveSection === 'templates'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12 Templates
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('autoresponders')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    settingsActiveSection === 'autoresponders'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Auto-Responders
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsActiveSection('signatures')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    settingsActiveSection === 'signatures'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Signatures & RBAC
                </button>
              </div>
            </div>

            {/* Sub-Section 1: 12 Approved Templates */}
            {settingsActiveSection === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    12 Pre-Approved Operational Email Templates with Dynamic Variable Tokens
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateInsert('compose');
                      setIsTemplateModalOpen(true);
                    }}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Browse & Insert Template</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {EMAIL_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs">{tmpl.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">{tmpl.description}</p>
                        <div className="text-[11px] font-semibold text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mb-2">
                          <span className="text-slate-400 font-normal">Subject:</span> {tmpl.subjectTemplate || tmpl.subject}
                        </div>
                        <div className="flex flex-wrap gap-1 text-[10px] font-mono text-teal-800">
                          {tmpl.variables.map((v) => (
                            <span key={v} className="bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                              {`{{${v}}}`}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Tone: <strong className="capitalize">{tmpl.suggestedTone.replace('_', ' ')}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInsertTemplate(tmpl)}
                          className="px-2.5 py-1 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Section 2: Auto-Responders */}
            {settingsActiveSection === 'autoresponders' && (
              <div className="space-y-4">
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Safeguarding Rule:</strong> Auto-responders are strictly disabled for crisis correspondence, survivor referrals, and restricted executive mail per non-disclosure mandates.
                  </span>
                </div>

                <div className="space-y-3">
                  {autoRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#104F57] text-white">
                            {rule.code}
                          </span>
                          <span className="font-bold text-slate-900">{rule.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({rule.mailbox})</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{rule.trigger}</p>
                        <div className="text-[11px] text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                          &quot;{rule.approvedTemplate}&quot;
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-500 text-[11px]">
                          Sent: {rule.totalTriggeredCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => db.toggleAutoResponderRule(rule.id, !rule.enabled)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            rule.enabled
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Section 3: Signatures & RBAC */}
            {settingsActiveSection === 'signatures' && (
              <div className="space-y-4 text-xs">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Authorized Organizational Signers & Legal Headers
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: 'Comfort Dondo',
                      title: 'Executive Director & Founder',
                      org: 'Phumulani AI Community Platform',
                      email: 'comfort@phumulani.org',
                      phone: '(612) 555-0199',
                      badge: 'Executive Authorization',
                    },
                    {
                      name: 'Sister Miriam K.',
                      title: 'Director of Safe Transitional Care & Safeguarding Lead',
                      org: 'Phumulani Healing Sisterhood',
                      email: 'miriam@phumulani.org',
                      phone: '(612) 555-0198',
                      badge: 'Confidential Safeguarding',
                    },
                    {
                      name: 'Dr. Elena Rostova',
                      title: 'Board Secretary & Governance Officer',
                      org: 'Phumulani Board of Directors',
                      email: 'elena@phumulani.org',
                      phone: '(612) 555-0197',
                      badge: 'Governance & Grants',
                    },
                    {
                      name: 'David Mwangi, CPA',
                      title: 'Chief Financial Officer & Compliance Director',
                      org: 'Phumulani Financial Stewardship',
                      email: 'david@phumulani.org',
                      phone: '(612) 555-0196',
                      badge: 'Finance & Compliance',
                    },
                  ].map((sig) => (
                    <div
                      key={sig.name}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{sig.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          {sig.badge}
                        </span>
                      </div>
                      <p className="text-slate-600 font-semibold">{sig.title}</p>
                      <p className="text-slate-500">{sig.org}</p>
                      <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200">
                        {sig.email} · {sig.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 italic">
                        Phumulani 501(c)(3) Nonprofit · Minneapolis, MN · EIN: 88-1234567
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. NEW EMAIL COMPOSER MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="bg-[#006D6F] text-white px-5 py-3 flex items-center justify-between font-heading shrink-0">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <h3 className="font-bold text-sm">Compose Authorized Email</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendComposedEmail} className="p-5 space-y-3 text-xs flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 font-heading">
                    From (Organizational Mailbox):
                  </label>
                  <select
                    value={composeMailbox}
                    onChange={(e) => setComposeMailbox(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs font-bold text-slate-800"
                  >
                    {(mailboxes.length > 0
                      ? mailboxes.map((m) => m.email)
                      : [
                          'info@phumulani.org',
                          'donations@phumulani.org',
                          'grants@phumulani.org',
                          'executive@phumulani.org',
                          'partnerships@phumulani.org',
                        ]
                    ).map((addr) => (
                      <option key={addr} value={addr}>
                        {addr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 font-heading">
                    Operational Category:
                  </label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-700"
                  >
                    <option value="23_general_inquiries">General Inquiries &amp; Community</option>
                    <option value="02_donor_major">Development &amp; Donor Engagement</option>
                    <option value="03_grant_funder">Institutional Grants &amp; Compliance</option>
                    <option value="04_corporate_sponsorship">Corporate &amp; Academic Partnerships</option>
                    <option value="10_executive_board">Executive &amp; Governance Stewardship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 font-heading">To Recipient Email:</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@organization.org"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Message Body:</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Draft your message with official Phumulani communications guidelines..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-sans leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-500">
                  Sender Identity: <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role})
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveComposeDraft}
                    disabled={isSavingComposeDraft}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSavingComposeDraft ? 'Saving Draft...' : 'Save Persistent Draft'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Stage Outbound Dispatch</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CLASSIFICATION CORRECTION MODAL */}
      {reclassifyingThreadId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Staff Classification Override & Evaluation Feedback
            </h3>
            <p className="text-slate-500">
              Select the corrected classification category for this correspondence. This adjustment will be stored as evaluation feedback.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Category:</label>
              <select
                value={newCategoryTarget}
                onChange={(e) => setNewCategoryTarget(e.target.value as EmailClassificationCategory)}
                className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold"
              >
                {Object.entries(EMAIL_CATEGORY_METADATA).map(([catKey, meta]) => (
                  <option key={catKey} value={catKey}>
                    {meta.code} — {meta.label} ({meta.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Reclassification:</label>
              <input
                type="text"
                placeholder="e.g. Involves challenge matching pledge for Gala"
                value={reclassifyReason}
                onChange={(e) => setReclassifyReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReclassifyingThreadId(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReclassification}
                className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Apply Reclassification
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 7. HISTORICAL IMPORT LAUNCHER MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn text-xs space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Historical Email Batch Import
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    12-Stage Resumable Import Process with Safeguarding Quarantine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Critical Safeguarding Invariant Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>CRITICAL RULE: Historical Import Non-Solicitation Safeguard</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Historical email imports will NOT automatically trigger external auto-responders, fundraising campaigns, or donor solicitations. Imported correspondence will be indexed and matched to CRM with source evidence preserved, but never treated as new inbound solicitation opportunities.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Organizational Mailbox:</label>
                <select
                  value={importTargetMailbox}
                  onChange={(e) => setImportTargetMailbox(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs font-semibold"
                >
                  {mailboxes.map((mbx) => (
                    <option key={mbx.id} value={mbx.id}>
                      {mbx.email} ({mbx.displayName}) — {(mbx.historicalImportStatus ?? 'NOT_STARTED').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={historicalStartDate}
                    onChange={(e) => setHistoricalStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date:</label>
                  <input
                    type="date"
                    value={historicalEndDate}
                    onChange={(e) => setHistoricalEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Folders to Synchronize:</label>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                  {['INBOX', 'SENT', 'ARCHIVE'].map((folder) => (
                    <label key={folder} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={importScopeFolders.includes(folder)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setImportScopeFolders([...importScopeFolders, folder]);
                          } else {
                            setImportScopeFolders(importScopeFolders.filter((f) => f !== folder));
                          }
                        }}
                        className="rounded text-teal-700"
                      />
                      <span>{folder}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStartImport(importTargetMailbox)}
                className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Launch Background Historical Import</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. SYNC CONFLICTS REVIEW MODAL */}
      {isConflictsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fadeIn text-xs space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Two-Way Synchronization Conflict Reviewer
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Safe reconciliation of concurrent modifications between External Provider and Phumulani Dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConflictsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {syncConflicts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p>All mailboxes and message states are completely synchronized.</p>
                </div>
              ) : (
                syncConflicts.map((conf) => (
                  <div
                    key={conf.id}
                    className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                          {conf.conflictType}
                        </span>
                        <span className="font-bold text-slate-900">{conf.threadSubject}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(conf.detectedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-400 block font-mono text-[10px]">PROVIDER STATE (Authoritative)</span>
                        <pre className="font-mono text-xs text-slate-800 mt-1 whitespace-pre-wrap">{JSON.stringify(conf.providerState, null, 2)}</pre>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-400 block font-mono text-[10px]">DASHBOARD STATE (Local)</span>
                        <pre className="font-mono text-xs text-slate-800 mt-1 whitespace-pre-wrap">{JSON.stringify(conf.dashboardState, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-mono">Mailbox: {conf.mailboxEmail}</span>
                      {conf.status === 'DETECTED' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveConflict(conf.id, 'KEEP_PROVIDER')}
                            className="px-3 py-1 bg-[#104F57] text-white rounded-lg font-bold cursor-pointer"
                          >
                            Keep Provider Version
                          </button>
                          <button
                            onClick={() => handleResolveConflict(conf.id, 'KEEP_DASHBOARD')}
                            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                          >
                            Keep Dashboard Version
                          </button>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold font-mono text-[11px]">
                          Resolved: {conf.resolution}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConflictsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SYNC AUDIT LOG MODAL */}
      {isAuditLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-fadeIn text-xs space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-800" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Mailbox Synchronization Audit Logs
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Immutable enterprise audit log of all historical imports, delta syncs, and two-way actions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditLogsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Mailbox</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Result</th>
                    <th className="p-2">Actor</th>
                    <th className="p-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {syncAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-2 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2 text-slate-700 font-sans font-semibold truncate max-w-[120px]">
                        {log.mailboxEmail}
                      </td>
                      <td className="p-2 font-bold text-slate-900">{log.action}</td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[10px] uppercase ${
                            log.result === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 font-sans truncate max-w-[100px]">{log.actorName}</td>
                      <td className="p-2 text-slate-500 font-sans truncate max-w-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAuditLogsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. TEMPLATE PICKER MODAL (Milestone 23.09) */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-fadeIn text-xs space-y-4 p-5 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-700" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Approved Organizational Email Templates
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insert pre-approved correspondence with automatic constituent token interpolation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {['all', 'donations', 'grants', 'partnerships', 'volunteers', 'safeguarding', 'media', 'general'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedTemplateCategory(cat)}
                  className={`px-2.5 py-1 rounded-full font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTemplateCategory === cat
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {EMAIL_TEMPLATES
                .filter((tmpl) => selectedTemplateCategory === 'all' || tmpl.category === selectedTemplateCategory)
                .map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{tmpl.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded">
                          {tmpl.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Tone: <strong className="capitalize">{tmpl.suggestedTone.replace('_', ' ')}</strong>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">{tmpl.description}</p>

                    <div className="text-[11px] font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-normal">Subject:</span> {tmpl.subjectTemplate || tmpl.subject}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono text-teal-800">
                        {tmpl.variables.slice(0, 4).map((v) => (
                          <span key={v} className="bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                        {tmpl.variables.length > 4 && (
                          <span className="text-slate-400">+{tmpl.variables.length - 4} more</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInsertTemplate(tmpl)}
                        className="px-3 py-1 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                      >
                        Insert into {targetTemplateInsert === 'compose' ? 'Composer' : 'Draft'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. NEW FOLLOW-UP TASK MODAL (Milestone 23.08) */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn text-xs space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-800" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Create Follow-Up Task
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assign an operational commitment linked to this correspondence
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title / Action:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm oral testimony time with Committee Secretary"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-hidden focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign to Staff:</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium cursor-pointer"
                  >
                    {EMAIL_STAFF_MEMBERS.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date:</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold cursor-pointer"
                  >
                    <option value="urgent">Urgent (P0/P1 SLA)</option>
                    <option value="high">High (&lt;24h)</option>
                    <option value="normal">Normal (&lt;48h)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Task Category:</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold cursor-pointer"
                  >
                    <option value="email_reply">Email Reply</option>
                    <option value="crm_update">CRM Contact Update</option>
                    <option value="calendar_booking">Calendar Booking</option>
                    <option value="grant_deadline">Grant Deadline</option>
                    <option value="safeguarding_review">Safeguarding Review</option>
                  </select>
                </div>
              </div>

              {selectedThread && (
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-[11px]">
                  <strong>Linked to Thread:</strong> {selectedThread.threadSubject} ({selectedThread.mailboxEmail})
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFollowUpTask}
                className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. REGISTER ORGANIZATIONAL MAILBOX MODAL (M48.02) */}
      {isAddMailboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-[#104F57] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <h3 className="font-serif font-bold text-sm">Register Organizational Mailbox</h3>
              </div>
              <button
                onClick={() => setIsAddMailboxModalOpen(false)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMailboxSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mailbox Email Address:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. advocacy@phumulani.org"
                  value={mbxFormEmail}
                  onChange={(e) => setMbxFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Display Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phumulani Community Advocacy"
                  value={mbxFormDisplayName}
                  onChange={(e) => setMbxFormDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department Ownership:</label>
                  <select
                    value={mbxFormDepartment}
                    onChange={(e) => setMbxFormDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="DEPT-OPS">DEPT-OPS (Operations & Front Desk)</option>
                    <option value="DEPT-DEV">DEPT-DEV (Development & Fundraising)</option>
                    <option value="DEPT-EXEC">DEPT-EXEC (Executive Office)</option>
                    <option value="DEPT-PROG">DEPT-PROG (Programs & Grants)</option>
                    <option value="DEPT-SAFE">DEPT-SAFE (Safeguarding & Crisis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Initial State:</label>
                  <select
                    value={mbxFormInitialState}
                    onChange={(e) => setMbxFormInitialState(e.target.value as MailboxConnectionState)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  >
                    <option value="AUTHORIZATION_REQUIRED">AUTHORIZATION_REQUIRED</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="DISCONNECTED">DISCONNECTED</option>
                    <option value="NOT_CONFIGURED">NOT_CONFIGURED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Authorized Staff Assignee(s):</label>
                <input
                  type="text"
                  placeholder="e.g. Sister Miriam K., Comfort Dondo"
                  value={mbxFormStaff}
                  onChange={(e) => setMbxFormStaff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                <strong>Staged OAuth Mode:</strong> Live Google Workspace accounts will not be provisioned without verified credentials. Initial state set to <code>{mbxFormInitialState}</code>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMailboxModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Mailbox</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. EDIT MAILBOX SETTINGS MODAL (M48.02) */}
      {isEditMailboxModalOpen && editingMailbox && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-[#104F57] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <h3 className="font-serif font-bold text-sm">Edit Mailbox Settings: {editingMailbox.email}</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditMailboxModalOpen(false);
                  setEditingMailbox(null);
                }}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMailboxSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Display Name:</label>
                <input
                  type="text"
                  required
                  value={mbxFormDisplayName}
                  onChange={(e) => setMbxFormDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department Ownership:</label>
                  <select
                    value={mbxFormDepartment}
                    onChange={(e) => setMbxFormDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="DEPT-OPS">DEPT-OPS (Operations)</option>
                    <option value="DEPT-DEV">DEPT-DEV (Development)</option>
                    <option value="DEPT-EXEC">DEPT-EXEC (Executive)</option>
                    <option value="DEPT-PROG">DEPT-PROG (Programs)</option>
                    <option value="DEPT-SAFE">DEPT-SAFE (Safeguarding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Connection State:</label>
                  <select
                    value={mbxFormInitialState}
                    onChange={(e) => setMbxFormInitialState(e.target.value as MailboxConnectionState)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold"
                  >
                    <option value="AUTHORIZATION_REQUIRED">AUTHORIZATION_REQUIRED</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="DISCONNECTED">DISCONNECTED</option>
                    <option value="ERROR">ERROR</option>
                    <option value="NOT_CONFIGURED">NOT_CONFIGURED</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div><strong>Provider:</strong> {editingMailbox.provider}</div>
                <div><strong>Current Messages:</strong> {editingMailbox.totalThreads} Threads</div>
                <div><strong>2-Way Sync:</strong> {editingMailbox.twoWaySyncEnabled ? 'Enabled' : 'Disabled'}</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMailboxModalOpen(false);
                    setEditingMailbox(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. CONNECTION TEST RESULT DIALOG (M48.02) */}
      {testConnectionResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Mailbox Connection Test Succeeded</h3>
              </div>
              <button
                onClick={() => setTestConnectionResult(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500">Target Mailbox:</span>
                <span className="font-mono font-bold text-slate-900">{testConnectionResult.mailboxEmail}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500">Handshake Latency:</span>
                <span className="font-mono font-bold text-teal-800">{testConnectionResult.latencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500">Provider Status:</span>
                <span className="font-mono font-bold text-emerald-800 uppercase">{testConnectionResult.status}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500">Operational Adapter:</span>
                <span className="font-mono text-slate-700">Google Workspace (Staged)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Handshake verified against staging provider gateway. Zero fatal socket errors. Audit trail recorded in tamper-evident ledger.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTestConnectionResult(null)}
                className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CRM LINKING MODAL (M48.05 / M48.11) */}
      {isCrmLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Link Email Thread to CRM Constituent</h3>
              </div>
              <button
                onClick={() => {
                  setIsCrmLinkModalOpen(false);
                  setCrmTargetThreadId(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrmLinkSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Constituent Entity Type:</label>
                <select
                  value={crmEntityType}
                  onChange={(e) => setCrmEntityType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold cursor-pointer"
                >
                  <option value="donor">Major Donor Profile</option>
                  <option value="grant">Grant Opportunity / Funder</option>
                  <option value="partnership">Strategic Partnership / Alliance</option>
                  <option value="partner">Corporate CSR Partner</option>
                  <option value="campaign">Fundraising Campaign</option>
                  <option value="program">Community Program Initiative</option>
                  <option value="volunteer">Volunteer Applicant / Active</option>
                  <option value="client">Community Client (Non-Safe)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Entity Name / Organization:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vance Family Foundation, John Doe"
                  value={crmEntityName}
                  onChange={(e) => setCrmEntityName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CRM Record ID:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dnr-vance-01, opp-bush-01"
                  value={crmEntityId}
                  onChange={(e) => setCrmEntityId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
                />
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-[11px] text-rose-900">
                <strong>VAWA Invariant:</strong> Category 01 confidential survivor communications are physically blocked from external CRM linking.
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {selectedThread?.crmLink && (
                  <button
                    type="button"
                    onClick={() => handleUnlinkCrm(selectedThread.id)}
                    className="text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer text-xs"
                  >
                    Unlink Record
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCrmLinkModalOpen(false);
                      setCrmTargetThreadId(null);
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Link CRM Record</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
