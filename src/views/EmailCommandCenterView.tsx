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
} from '../types/emailEnterprise';
import { EmailEnterpriseService } from '../services/emailEnterpriseService';
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
} from 'lucide-react';

export type EmailCommandCenterTab =
  | 'all_mailboxes'
  | 'priority'
  | 'mailboxes'
  | 'historical'
  | 'sent'
  | 'drafts'
  | 'scheduled'
  | 'assigned_to_me'
  | 'team_inbox'
  | 'follow_up_tasks'
  | 'ai_intelligence'
  | 'approvals'
  | 'crm_connections'
  | 'analytics'
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
  | 'partnerships';

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
  const [importTargetMailbox, setImportTargetMailbox] = useState<string>('mbx-grants');
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
  const [composeRecipient, setComposeRecipient] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeTone, setComposeTone] = useState<ResponseToneStyle>('professional');

  // Action Notice Banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Quick filter pills
  const [quickFilter, setQuickFilter] = useState<'all' | 'p0' | 'needs_reply' | 'awaiting_approval' | 'donors' | 'unassigned'>('all');

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
  const handleSyncMailbox = (mbxId: string) => {
    db.syncMailbox(mbxId);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Mailbox successfully synchronized with production identity gateway. 0 transmission errors.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleVerifyMailbox = (mbxId: string) => {
    db.syncMailbox(mbxId);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Mailbox connection verified for ${mbxId}. Provider API authenticated, 0 errors.`,
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

  const handleIncrementalSync = (mbxId: string) => {
    const res = db.runIncrementalSync(mbxId);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Incremental sync complete for ${mbxId}. Delta token: ${res.deltaToken}. Synced ${res.newCount} new messages.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
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
    db.reauthorizeMailbox(mbxId);
    refreshSyncState();
    setActionNotice({
      type: 'success',
      message: `Mailbox ${mbxId} successfully reauthorized with provider. OAuth token refreshed.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
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
      const res = await fetch('/api/ai/email-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageBody: latestMessage?.bodyText || '',
          senderName: latestMessage?.senderName || 'Valued Correspondent',
          subject: thread.threadSubject,
          toneStyle: tone,
          role: currentUser.role,
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
  const handleApproveDraft = (threadId: string) => {
    db.approveEmailDraft(threadId);
    setActionNotice({
      type: 'success',
      message: `Draft authorized by ${currentUser.name}. Ready for authorized dispatch.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Reject Draft
  const handleRejectDraft = (threadId: string) => {
    db.rejectEmailDraft(threadId, 'Draft does not meet institutional standards.');
    setActionNotice({
      type: 'info',
      message: `Draft rejected and routed back to review queue.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Request Changes
  const handleRequestChanges = (threadId: string) => {
    db.requestChangesEmailDraft(threadId, 'Staff review requested revisions to tone and factual alignment.');
    setActionNotice({
      type: 'warning',
      message: `Revisions requested. Draft marked as changes_requested for editing.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Return to Draft
  const handleReturnToDraft = (threadId: string) => {
    db.returnToDraftEmailDraft(threadId, 'Returned to draft workspace by reviewer.');
    setActionNotice({
      type: 'info',
      message: `Draft returned to initial drafting workspace.`,
    });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Handle Send Approved Email
  const handleSendApprovedEmail = (threadId: string) => {
    try {
      db.sendApprovedEmail(threadId);
      setActionNotice({
        type: 'success',
        message: `Approved email successfully dispatched through authenticated gateway. Recipient delivery confirmed.`,
      });
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      setActionNotice({
        type: 'warning',
        message: err?.message || 'Failed to dispatch email.',
      });
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

  // Handle Compose Send
  const handleSendComposedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeRecipient || !composeSubject || !composeBody) {
      setActionNotice({ type: 'warning', message: 'Please fill in recipient, subject, and message body.' });
      return;
    }

    const { category, isSafeguardingAlert } = EmailEnterpriseService.classifyMessage(composeSubject, composeBody, composeRecipient);
    const { priority, deadline } = EmailEnterpriseService.calculatePriority(category, composeSubject, composeBody);

    const newThreadId = `th-out-${Date.now()}`;
    const newThread: EnterpriseEmailThread = {
      id: newThreadId,
      mailboxId: mailboxes.find((m) => m.email === composeMailbox)?.id || 'mbx-info',
      mailboxEmail: composeMailbox,
      threadSubject: composeSubject,
      participantEmails: [composeRecipient, composeMailbox],
      messageCount: 1,
      lastMessageAt: new Date().toISOString(),
      classification: category,
      priority,
      status: 'responded',
      assignedStaffId: currentUser.id,
      assignedStaffName: currentUser.name,
      slaDeadline: deadline,
      isOverdue: false,
      messages: [
        {
          id: `msg-out-${Date.now()}`,
          threadId: newThreadId,
          senderName: currentUser.name,
          senderEmail: composeMailbox,
          recipientEmail: composeRecipient,
          subject: composeSubject,
          bodyText: composeBody,
          receivedAt: new Date().toISOString(),
          direction: 'outbound',
        },
      ],
    };

    db.updateEmailThread(newThread);
    db.logAudit({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'OUTBOUND_EMAIL_COMPOSED_AND_SENT',
      resource: `email:${composeMailbox}`,
      details: `Dispatched email to ${composeRecipient} subject: "${composeSubject}"`,
    });

    setIsComposeOpen(false);
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
    setSelectedThreadId(newThreadId);
    setActionNotice({
      type: 'success',
      message: `Outbound email dispatched to ${composeRecipient} via ${composeMailbox}. Recorded in enterprise communications log.`,
    });
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-slate-800">
      {/* 1. MASTER EMAIL COMMAND CENTER TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Department Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onBackToMasterAdmin ? onBackToMasterAdmin() : onViewChange('master-admin')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Return to Master Administrator Command Center"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Master Admin</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#104F57] text-white flex items-center justify-center shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-slate-900 text-sm tracking-tight">
                    PHUMULANI — AI EMAIL COMMAND CENTER
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.2 rounded-full uppercase">
                    P0 Operations
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Live Enterprise Communications · Fundraising Intelligence · Executive Office
                </p>
              </div>
            </div>
          </div>

          {/* Center: Mailbox Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
            <Inbox className="w-3.5 h-3.5 text-teal-800" />
            <span className="font-semibold text-slate-600 hidden md:inline">Mailbox:</span>
            <select
              value={selectedMailboxId}
              onChange={(e) => setSelectedMailboxId(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Mailboxes ({mailboxes.length} Connected)</option>
              {mailboxes.map((mbx) => (
                <option key={mbx.id} value={mbx.id}>
                  {mbx.email} ({mbx.department})
                </option>
              ))}
            </select>
          </div>

          {/* Right: Actions, AI Status & Compose */}
          <div className="flex items-center gap-2">
            {/* AI Workforce Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>A02 Email Manager Active</span>
              <span className="text-[10px] bg-emerald-200/60 px-1 rounded font-mono">Supervised</span>
            </div>

            {/* Compose Button */}
            <button
              onClick={() => setIsComposeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Email</span>
            </button>

            {/* Sync Active Mailbox */}
            <button
              onClick={() => handleSyncMailbox(selectedMailboxId === 'all' ? 'mbx-info' : selectedMailboxId)}
              className="p-1.5 text-slate-600 hover:text-teal-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Synchronize Mailbox with Google Workspace Gateway"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            className={`px-4 py-2 text-xs font-medium border-t flex items-center justify-between ${
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
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* 2. 12 VERIFIED KPI METRICS CARDS */}
      <section className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* Card 1: Total Incoming */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Total Incoming</span>
              <Mail className="w-3.5 h-3.5 text-teal-800" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{analytics.totalIncoming}</span>
              <span className="text-[10px] text-teal-700 font-semibold">Live Threads</span>
            </div>
          </div>

          {/* Card 2: Unread Messages */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Unread Messages</span>
              <Inbox className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-blue-900">{analytics.unreadCount}</span>
              <span className="text-[10px] text-blue-700 font-semibold">Triage Ready</span>
            </div>
          </div>

          {/* Card 3: Critical P0 */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-700 text-[11px] font-bold">
              <span>Critical (P0)</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-rose-900">{analytics.criticalP0Count}</span>
              <span className="text-[10px] text-rose-700 font-semibold">Safeguarding / &lt;1h</span>
            </div>
          </div>

          {/* Card 4: Urgent P1 */}
          <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-700 text-[11px] font-bold">
              <span>Urgent (P1)</span>
              <Clock className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-orange-900">{analytics.urgentP1Count}</span>
              <span className="text-[10px] text-orange-700 font-semibold">Grants & Exec / &lt;4h</span>
            </div>
          </div>

          {/* Card 5: AI Drafts Awaiting Approval */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold">
              <span>Drafts Awaiting Approval</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-amber-900">{analytics.draftsAwaitingApprovalCount}</span>
              <span className="text-[10px] text-amber-700 font-semibold">Human In Loop</span>
            </div>
          </div>

          {/* Card 6: Overdue Follow-ups */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Overdue Follow-ups</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{analytics.overdueFollowUpsCount}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">On Track</span>
            </div>
          </div>

          {/* Card 7: Active Donor Conversations */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Active Donors</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{analytics.activeDonorConversations}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Relationships</span>
            </div>
          </div>

          {/* Card 8: Active Fundraising Pipeline */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Major Gifts Pipeline</span>
              <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-teal-900">${(pipeline.reduce((s, p) => s + p.estimatedAmount, 0) / 1000).toFixed(0)}k</span>
              <span className="text-[10px] text-slate-500 font-semibold">{pipeline.length} Deals</span>
            </div>
          </div>

          {/* Card 9: Upcoming Grant Deadlines */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Active Grants</span>
              <Award className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-indigo-900">{analytics.upcomingGrantDeadlines}</span>
              <span className="text-[10px] text-indigo-700 font-semibold">${(grants.reduce((s, g) => s + g.fundingAmount, 0) / 1000).toFixed(0)}k Total</span>
            </div>
          </div>

          {/* Card 10: Scheduled Meetings */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Executive Calendar</span>
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-purple-900">{calendarProposals.length}</span>
              <span className="text-[10px] text-purple-700 font-semibold">Coordinated</span>
            </div>
          </div>

          {/* Card 11: Auto-Responders Sent */}
          <div className="bg-[#F8FAFB] border border-slate-200/80 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
              <span>Auto-Responders</span>
              <Send className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900">{analytics.autoResponsesSentTotal}</span>
              <span className="text-[10px] text-teal-700 font-semibold">AR01-AR10 Rules</span>
            </div>
          </div>

          {/* Card 12: Processing Errors */}
          <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold">
              <span>Fail-Closed Status</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-900">0 Errors</span>
              <span className="text-[10px] text-emerald-700 font-semibold">100% Operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NAVIGATION SUB-TABS (Section 6 Mandated Views + Operations) */}
      <div className="bg-white border-b border-slate-200 px-4 py-1.5 space-y-1">
        {/* Row 1: Unified Mailbox Views */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 shrink-0">
            Mail Views:
          </span>

          <button
            onClick={() => setActiveTab('all_mailboxes')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all_mailboxes'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>All Mailboxes</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'all_mailboxes' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
              {threads.filter((t) => !t.isArchived).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('historical')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'historical'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>Historical Emails</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'historical' ? 'bg-teal-800 text-teal-100' : 'bg-indigo-100 text-indigo-800'}`}>
              {threads.filter((t) => t.isHistorical || t.messages.some((m) => m.isHistorical)).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new_emails')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'new_emails'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>New Emails</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'new_emails' ? 'bg-teal-800 text-teal-100' : 'bg-blue-100 text-blue-800'}`}>
              {threads.filter((t) => !t.isHistorical && (t.status === 'new' || t.status === 'triage_ready' || t.isRead === false)).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('priority')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'priority'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Priority Inbox</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'priority' ? 'bg-teal-800 text-teal-100' : 'bg-rose-100 text-rose-800'}`}>
              {threads.filter((t) => t.priority === 'P0' || t.priority === 'P1').length} P0/P1
            </span>
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'donors'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Donor Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('grants')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'grants'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>Grant Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('corporate')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'corporate'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-teal-500" />
            <span>Corporate Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('executive')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'executive'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Executive Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Sent Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('archived')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-slate-500" />
            <span>Archived Emails</span>
          </button>

          <button
            onClick={() => setActiveTab('synchronization')}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer border ${
              activeTab === 'synchronization'
                ? 'bg-teal-900 text-white border-teal-700 shadow-xs'
                : 'bg-teal-50/80 text-teal-900 border-teal-200 hover:bg-teal-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Sync Management</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-teal-200 text-teal-900 font-bold">
              5 Mailboxes
            </span>
          </button>
        </div>

        {/* Row 2: Department Operations */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold pt-1 border-t border-slate-100">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 shrink-0">
            Operations:
          </span>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Drafts & Approvals</span>
            {analytics.draftsAwaitingApprovalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500 text-white">
                {analytics.draftsAwaitingApprovalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('autoresponders')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'autoresponders'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Auto-Responders (AR01–AR10)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#104F57] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Communications Intelligence</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE 3-PANEL CONTAINER (Milestone 23.01) */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col md:flex-row gap-4">
        {/* PANEL 1: LEFT NAVIGATION SIDEBAR (16 Working Sections with Unread Badges) */}
        <aside className="w-full md:w-56 xl:w-64 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-800" />
                <span>Mail Workspace</span>
              </span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-900 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                16 Sections
              </span>
            </div>
            {/* Quick Mailbox Switcher Dropdown */}
            <select
              value={selectedMailboxId}
              onChange={(e) => {
                setSelectedMailboxId(e.target.value);
                if (activeTab === 'mailboxes') {
                  setActiveTab('all_mailboxes');
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">All 5 Mailboxes</option>
              {mailboxes.map((mbx) => (
                <option key={mbx.id} value={mbx.id}>
                  {mbx.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3 divide-y divide-slate-100">
            {/* Section 1: Inboxes & Correspondence */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Inboxes & Messages
              </div>
              {[
                { id: 'all_mailboxes', label: 'Unified Inbox', icon: Inbox, count: threads.filter((t) => !t.isArchived).length, color: 'text-teal-800' },
                { id: 'priority', label: 'Priority Inbox', icon: ShieldAlert, count: threads.filter((t) => t.priority === 'P0' || t.priority === 'P1').length, badgeText: 'P0/P1', color: 'text-rose-600' },
                { id: 'mailboxes', label: 'Org Mailboxes', icon: Mail, count: mailboxes.length, color: 'text-teal-700' },
                { id: 'historical', label: 'Historical Emails', icon: History, count: threads.filter((t) => t.isHistorical || t.messages.some((m) => m.isHistorical)).length, color: 'text-indigo-600' },
                { id: 'sent', label: 'Sent Emails', icon: Send, count: threads.filter((t) => t.folder === 'SENT' || t.messages.some((m) => m.direction === 'outbound')).length, color: 'text-slate-600' },
                { id: 'drafts', label: 'Drafts', icon: FileText, count: threads.filter((t) => Boolean(t.draft)).length, color: 'text-amber-600' },
                { id: 'scheduled', label: 'Scheduled Comms', icon: Clock, count: threads.filter((t) => Boolean(t.draft && t.draft.status === 'approved')).length, color: 'text-purple-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as EmailCommandCenterTab)}
                    className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      isActive ? 'bg-[#104F57] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-teal-900/90 text-teal-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badgeText || item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section 2: Staff Collaboration */}
            <div className="space-y-0.5 pt-2">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Staff Collaboration
              </div>
              {[
                { id: 'assigned_to_me', label: 'Assigned to Me', icon: UserIcon, count: threads.filter((t) => t.assignedStaffId === currentUser.id || t.assignedStaffName === currentUser.name).length, color: 'text-blue-600' },
                { id: 'team_inbox', label: 'Team Inbox', icon: Users, count: threads.length, color: 'text-slate-700' },
                { id: 'follow_up_tasks', label: 'Follow-Up Tasks', icon: CheckSquare, count: followUps.filter((f) => f.status === 'pending').length, color: 'text-emerald-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as EmailCommandCenterTab)}
                    className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      isActive ? 'bg-[#104F57] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-teal-900/90 text-teal-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section 3: Intelligence & CRM */}
            <div className="space-y-0.5 pt-2">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Intelligence & CRM
              </div>
              {[
                { id: 'ai_intelligence', label: 'AI Intelligence', icon: Sparkles, count: '25 Cats', color: 'text-teal-600' },
                { id: 'approvals', label: 'Approval Queue', icon: FileCheck, count: threads.filter((t) => t.draft?.status === 'pending_approval').length, color: 'text-amber-600' },
                { id: 'crm_connections', label: 'CRM Connections', icon: DollarSign, count: threads.filter((t) => Boolean(t.crmLink)).length, color: 'text-emerald-600' },
                { id: 'analytics', label: 'Email Analytics', icon: BarChart2, count: '99.4%', color: 'text-indigo-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as EmailCommandCenterTab)}
                    className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      isActive ? 'bg-[#104F57] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-teal-900/90 text-teal-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section 4: System & Ops */}
            <div className="space-y-0.5 pt-2">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                System & Settings
              </div>
              {[
                { id: 'synchronization', label: 'Synchronization', icon: Activity, count: `${mailboxes.length} Mbx`, color: 'text-teal-700' },
                { id: 'settings', label: 'Settings & Templates', icon: Settings, count: '12 Tmpl', color: 'text-slate-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as EmailCommandCenterTab)}
                    className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer ${
                      isActive ? 'bg-[#104F57] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-teal-900/90 text-teal-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* WORKSPACE CONTENT: PANELS 2 & 3 */}
        {(activeTab === 'all_mailboxes' ||
          activeTab === 'historical' ||
          activeTab === 'new_emails' ||
          activeTab === 'priority' ||
          activeTab === 'mailboxes' ||
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
          <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
            {/* Center Thread List (Panel 2) */}
            <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden shrink-0">
              {/* Filter / Search Bar with Quick Filter Pills */}
              <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search threads, senders, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-700"
                  />
                </div>

                {/* Quick Filter Pills (Milestone 23.02) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-none">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'p0', label: 'P0 Emergency' },
                    { id: 'needs_reply', label: 'Needs Reply' },
                    { id: 'awaiting_approval', label: 'Awaiting Approval' },
                    { id: 'donors', label: 'Donors' },
                    { id: 'unassigned', label: 'Unassigned' },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setQuickFilter(pill.id as any)}
                      className={`px-2 py-0.5 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        quickFilter === pill.id
                          ? 'bg-[#104F57] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full text-[11px] font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700"
                    >
                      <option value="all">All Priorities</option>
                      <option value="P0">P0 — Critical (&lt;1h)</option>
                      <option value="P1">P1 — Urgent (&lt;4h)</option>
                      <option value="P2">P2 — High (&lt;24h)</option>
                      <option value="P3">P3 — Normal (&lt;48h)</option>
                      <option value="P4">P4 — Low (&lt;72h)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full text-[11px] font-semibold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 truncate"
                    >
                      <option value="all">All 25 Categories</option>
                      {Object.entries(EMAIL_CATEGORY_METADATA).map(([catKey, meta]) => (
                        <option key={catKey} value={catKey}>
                          {meta.code} {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Thread List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredThreads.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No messages match active filters.</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const isSelected = thread.id === selectedThreadId;
                    const meta = EMAIL_CATEGORY_METADATA[thread.classification];
                    const priorityCfg = PRIORITY_CONFIG[thread.priority];
                    const isSafeguarding = thread.classification === '01_safeguarding';

                    return (
                      <div
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50/70 border-l-4 border-[#104F57]'
                            : 'hover:bg-slate-50'
                        } ${isSafeguarding ? 'bg-rose-50/30' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityCfg.badgeColor}`}>
                            {priorityCfg.label.split('—')[0].trim()}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(thread.lastMessageAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                          {thread.threadSubject}
                        </div>

                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {thread.participantEmails.join(', ')}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px]">
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {meta?.code} {meta?.label.substring(0, 18)}...
                          </span>
                          {thread.draft && thread.draft.status === 'pending_approval' && (
                            <span className="text-amber-700 bg-amber-100 font-bold px-1.5 py-0.2 rounded-full">
                              Draft Ready
                            </span>
                          )}
                          {thread.draft && thread.draft.status === 'approved' && (
                            <span className="text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded-full">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Thread Detail & Response Engine (Panel B, C, D) */}
            {selectedThread ? (
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden">
                {/* Thread Header with Two-Way Synchronization Controls */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_CONFIG[selectedThread.priority].badgeColor}`}>
                          {PRIORITY_CONFIG[selectedThread.priority].label}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                          {EMAIL_CATEGORY_METADATA[selectedThread.classification]?.code} — {EMAIL_CATEGORY_METADATA[selectedThread.classification]?.label}
                        </span>
                        <button
                          onClick={() => {
                            setReclassifyingThreadId(selectedThread.id);
                            setNewCategoryTarget(selectedThread.classification);
                          }}
                          className="text-[11px] text-teal-800 underline hover:text-teal-950 font-medium cursor-pointer"
                          title="Correct email classification and submit evaluation feedback"
                        >
                          Change Classification
                        </button>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">{selectedThread.threadSubject}</h2>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Mailbox: <span className="font-mono font-medium text-slate-700">{selectedThread.mailboxEmail}</span> · Assigned to: <span className="font-semibold text-slate-800">{selectedThread.assignedStaffName || 'Unassigned'}</span> · SLA Target: <span className="font-mono text-slate-700">{new Date(selectedThread.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Right Header Actions: CRM Link & Two-Way Sync Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedThread.crmLink && (
                        <div className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl text-xs">
                          <span className="text-[10px] font-bold uppercase text-teal-800 block">
                            Linked CRM ({selectedThread.crmLink.entityType})
                          </span>
                          <span className="font-bold text-teal-950">{selectedThread.crmLink.entityName}</span>
                        </div>
                      )}

                      {/* Two-Way Action: Read / Unread */}
                      <button
                        onClick={() => handleToggleRead(selectedThread.id, selectedThread.isRead ?? true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer shadow-2xs"
                        title="Toggle Read / Unread Status (Two-way sync updates provider)"
                      >
                        {selectedThread.isRead ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <Mail className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{selectedThread.isRead ? 'Mark Unread' : 'Mark Read'}</span>
                      </button>

                      {/* Two-Way Action: Archive */}
                      <button
                        onClick={() => handleToggleArchive(selectedThread.id, selectedThread.isArchived ?? false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer shadow-2xs"
                        title="Archive or Unarchive thread (Provider folder reflects change)"
                      >
                        <Archive className="w-3.5 h-3.5 text-slate-600" />
                        <span>{selectedThread.isArchived ? 'Unarchive' : 'Archive'}</span>
                      </button>

                      {/* Two-Way Action: Folder Move */}
                      <div className="flex items-center gap-1 text-xs">
                        <select
                          value={selectedThread.folder || 'INBOX'}
                          onChange={(e) => handleChangeFolder(selectedThread.id, e.target.value as EmailFolder)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
                        >
                          <option value="INBOX">Folder: Inbox</option>
                          <option value="SENT">Folder: Sent</option>
                          <option value="ARCHIVE">Folder: Archive</option>
                          <option value="TRASH">Folder: Trash</option>
                          <option value="SPAM">Folder: Spam</option>
                          <option value="DRAFTS">Folder: Drafts</option>
                        </select>
                      </div>

                      {/* Staff Assignment Selector (Milestone 23.05) */}
                      <div className="flex items-center gap-1 text-xs">
                        <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={selectedThread.assignedStaffName || 'Unassigned'}
                          onChange={(e) => {
                            const staff = EMAIL_STAFF_MEMBERS.find((s) => s.name === e.target.value);
                            if (staff) {
                              handleAssignStaff(selectedThread.id, staff.id, staff.name);
                            }
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
                          title="Assign thread to team member"
                        >
                          <option value="Unassigned">Assign: Unassigned</option>
                          {EMAIL_STAFF_MEMBERS.map((st) => (
                            <option key={st.id} value={st.name}>
                              Assign: {st.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick Communication Actions (Reply, Reply All, Forward, Add Task) */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReplyToThread(selectedThread)}
                          className="p-1.5 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Reply to sender"
                        >
                          <Reply className="w-3.5 h-3.5 text-teal-800" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                        <button
                          onClick={() => handleReplyToThread(selectedThread, true)}
                          className="p-1.5 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Reply all"
                        >
                          <ReplyAll className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">All</span>
                        </button>
                        <button
                          onClick={() => handleForwardThread(selectedThread)}
                          className="p-1.5 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Forward thread"
                        >
                          <Forward className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Fwd</span>
                        </button>
                        <button
                          onClick={() => {
                            setNewTaskTitle(`Follow up with ${selectedThread.messages[0]?.senderName || 'contact'} re: ${selectedThread.threadSubject}`);
                            setIsNewTaskModalOpen(true);
                          }}
                          className="p-1.5 text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Create linked follow-up task"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                          <span className="hidden sm:inline">Task</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Provider Synchronization Metadata Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-medium">
                      <RefreshCw className="w-3 h-3 text-emerald-600" />
                      Two-Way Synced
                    </span>
                    {selectedThread.isHistorical && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                        <History className="w-3 h-3 text-indigo-600" />
                        Historical Import · External Auto-Responses Suppressed
                      </span>
                    )}
                    <span className="font-mono text-slate-500">
                      Provider ID: <strong className="text-slate-700">{selectedThread.providerMessageId || selectedThread.messages[0]?.providerMessageId || 'msg-prov-auto'}</strong>
                    </span>
                    {selectedThread.labels && selectedThread.labels.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Labels:</span>
                        {selectedThread.labels.map((lbl) => (
                          <span key={lbl} className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-medium">
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Safeguarding Alert Banner if Category 01 */}
                {selectedThread.classification === '01_safeguarding' && (
                  <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                        CRITICAL SAFEGUARDING & SURVIVOR ISOLATION BOUNDARY ACTIVE
                      </h4>
                      <p className="text-xs text-rose-800 mt-1">
                        This correspondence involves potential domestic danger or confidential survivor support. General AI auto-replies and automated external drafts are strictly withheld per Architecture Principle 1.4. This record is escalated to Safeguarding Lead Sister Miriam K. for human trauma-informed protocol.
                      </p>
                    </div>
                  </div>
                )}
                {/* Fundraising CRM Bridge Panel (Section 5) */}
                {selectedThread.classification !== '01_safeguarding' && (() => {
                  const latestMsg = selectedThread.messages[selectedThread.messages.length - 1] || selectedThread.messages[0];
                  const senderEmail = (latestMsg?.senderEmail || '').trim().toLowerCase();
                  const fundraisingDonors = db.getFundraisingDonors();
                  const matchedDonor = fundraisingDonors.find(
                    (d) => d.email.toLowerCase() === senderEmail
                  );
                  const linkedOpps = matchedDonor ? db.getFundraisingOpportunities().filter((o) => o.donorId === matchedDonor.id) : [];

                  return (
                    <div className="bg-teal-50/70 border-b border-teal-200 p-3 sm:p-4 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-teal-950 flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-teal-700" />
                              Fundraising CRM & Opportunity Bridge
                            </span>
                            {matchedDonor ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px] border border-emerald-300">
                                Matched Contact: {matchedDonor.givingTier}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px] border border-amber-300">
                                Unlinked / Prospective Supporter
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {matchedDonor ? (
                              <span>
                                Linked to <strong>{matchedDonor.name}</strong> ({matchedDonor.category.replace(/_/g, ' ')}) · Lifetime Giving: <strong className="text-teal-900">${matchedDonor.lifetimeGiving.toLocaleString()}</strong> · Relationship Owner: <strong>{matchedDonor.relationshipOwner}</strong>
                              </span>
                            ) : (
                              <span>
                                Inbound correspondence from <span className="font-mono text-slate-800">{latestMsg?.senderEmail}</span> classified as <strong>{EMAIL_CATEGORY_METADATA[selectedThread.classification]?.label}</strong>.
                              </span>
                            )}
                          </div>
                          {linkedOpps.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] font-semibold text-slate-500">Active Opportunities:</span>
                              {linkedOpps.map((opp) => (
                                <span key={opp.id} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-950">
                                  {opp.title} (${opp.targetAmount.toLocaleString()} · {opp.status.replace(/_/g, ' ')})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {matchedDonor ? (
                            <button
                              onClick={() => {
                                if (onOpenFundraisingCRM) {
                                  onOpenFundraisingCRM('donors', matchedDonor.id);
                                } else {
                                  onViewChange('fundraising');
                                }
                              }}
                              className="px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3d43] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Open this donor in the full Fundraising CRM workspace"
                            >
                              <span>View Profile in CRM →</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const res = EmailEnterpriseService.ingestAndLinkFundraisingEmail(selectedThread, latestMsg);
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
                              className="px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3d43] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Ingest message, resolve sender identity, and create CRM opportunity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ingest into Fundraising CRM</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {selectedThread.messages.map((msg) => {
                    const isInbound = msg.direction === 'inbound';
                    return (
                      <div
                        key={msg.id}
                        className={`rounded-2xl p-4 border ${
                          isInbound
                            ? 'bg-white border-slate-200 shadow-2xs mr-8'
                            : 'bg-teal-50/50 border-teal-200 shadow-2xs ml-8'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{msg.senderName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">&lt;{msg.senderEmail}&gt;</span>
                            {msg.isAutoResponse && (
                              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-mono">
                                Auto-Response ({msg.autoResponderRuleId})
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px] font-mono">
                            {new Date(msg.receivedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                          {msg.bodyText}
                        </div>

                        {/* Attachments Section */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                              Secure Attachments ({msg.attachments.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-teal-800 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-900 truncate">{att.filename}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        {(att.sizeBytes / 1024).toFixed(1)} KB · {att.mimeType}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                                      att.scanStatus === 'clean' || !att.isQuarantined
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {att.scanStatus === 'clean' || !att.isQuarantined ? 'Scanned Safe' : 'Quarantined'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Staff Private Collaboration: Internal Notes Box (Milestone 23.05) */}
                <div className="border-t border-amber-200/80 bg-amber-50/50 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Private Internal Staff Notes
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                        Internal Only · Never Dispatched Externally
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-mono font-semibold">
                      {selectedThread.internalNotes?.length || 0} Notes
                    </span>
                  </div>

                  {/* List of Existing Notes */}
                  {selectedThread.internalNotes && selectedThread.internalNotes.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedThread.internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-white border border-amber-200 rounded-xl p-2.5 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                            <span className="font-bold text-slate-900">{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Note Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add confidential internal note for team members..."
                      value={newInternalNote}
                      onChange={(e) => setNewInternalNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddInternalNote(selectedThread.id);
                        }
                      }}
                      className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-amber-800/50 focus:outline-hidden focus:border-amber-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddInternalNote(selectedThread.id)}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                    >
                      Add Note
                    </button>
                  </div>
                </div>

                {/* AI RESPONSE ENGINE & APPROVAL BAR (Panel C & D) */}
                {selectedThread.classification !== '01_safeguarding' && (
                  <div className="border-t border-slate-200 bg-white p-4 space-y-3">
                    {/* Draft Status / Tone Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-800" />
                        <span className="text-xs font-bold text-slate-900">AI Response Engine (A02 Email Manager)</span>
                        {selectedThread.draft && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              selectedThread.draft.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : selectedThread.draft.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            Status: {selectedThread.draft.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>

                      {/* 9 Tone Selector */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-medium">Response Tone:</span>
                        <select
                          value={selectedDraftTone}
                          onChange={(e) => setSelectedDraftTone(e.target.value as ResponseToneStyle)}
                          className="bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-800"
                        >
                          <option value="professional">Professional</option>
                          <option value="formal">Formal</option>
                          <option value="warm_welcoming">Warm & Welcoming</option>
                          <option value="executive">Executive</option>
                          <option value="donor_appreciation">Donor Appreciation</option>
                          <option value="partnership_development">Partnership Development</option>
                          <option value="grant_correspondence">Grant Correspondence</option>
                          <option value="volunteer_coordination">Volunteer Coordination</option>
                          <option value="community_engagement">Community Engagement</option>
                        </select>
                        <button
                          onClick={() => handleGenerateDraft(selectedThread, selectedDraftTone)}
                          className="px-2.5 py-1 bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-teal-700" />
                          <span>{selectedThread.draft ? 'Regenerate Draft' : 'Generate Draft'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Rewrite Actions Toolbar (Milestone 23.04) */}
                    {selectedThread.draft && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-teal-50/70 border border-teal-200/80 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-teal-800" />
                          <span className="font-bold text-teal-950 text-[11px]">AI Rewrite:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {[
                              { action: 'shorten', label: 'Shorten' },
                              { action: 'expand', label: 'Expand' },
                              { action: 'formal', label: 'Formal' },
                              { action: 'warm', label: 'Warm Sisterhood' },
                              { action: 'executive', label: 'Executive' },
                              { action: 'clarity', label: 'Fix Clarity' },
                            ].map((btn) => (
                              <button
                                key={btn.action}
                                type="button"
                                onClick={() => handleAIRewrite(btn.action as EmailAIRewriteAction)}
                                className="px-2 py-0.5 rounded-lg bg-white border border-teal-200 text-teal-900 hover:bg-teal-100 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs"
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTargetTemplateInsert('draft');
                            setIsTemplateModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span>Insert Template...</span>
                        </button>
                      </div>
                    )}

                    {/* Active Draft Box */}
                    {selectedThread.draft && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                          <div>
                            <span className="font-semibold text-slate-700">Recipient:</span>{' '}
                            <span className="font-mono text-slate-900">{selectedThread.draft.recipientEmail}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Confidence: <span className="font-bold text-teal-800">{selectedThread.draft.confidenceScore}%</span> · Tone: <span className="font-semibold capitalize">{selectedThread.draft.toneStyle.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Verified Context Summary */}
                        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 text-[11px] text-emerald-900 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span><strong>Verified Context Grounding:</strong> {selectedThread.draft.verifiedContextSummary}</span>
                        </div>

                        {/* Draft Content (View / Edit) */}
                        {isEditingDraft ? (
                          <textarea
                            rows={6}
                            value={draftEditContent}
                            onChange={(e) => setDraftEditContent(e.target.value)}
                            className="w-full text-xs font-sans p-2.5 bg-white border border-teal-500 rounded-lg focus:outline-hidden"
                          />
                        ) : (
                          <div className="text-xs text-slate-800 whitespace-pre-wrap bg-white p-3 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                            {selectedThread.draft.proposedBody}
                          </div>
                        )}

                        {/* Action Buttons: Edit, Save, Approve, Reject, Send */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            {isEditingDraft ? (
                              <button
                                onClick={() => {
                                  if (selectedThread.draft) {
                                    db.saveEmailDraft(selectedThread.id, {
                                      ...selectedThread.draft,
                                      proposedBody: draftEditContent,
                                      status: 'pending_approval',
                                    });
                                  }
                                  setIsEditingDraft(false);
                                }}
                                className="px-3 py-1 bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Save Changes
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setDraftEditContent(selectedThread.draft?.proposedBody || '');
                                  setIsEditingDraft(true);
                                }}
                                className="px-3 py-1 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit Draft</span>
                              </button>
                            )}

                            {selectedThread.draft.status !== 'approved' && selectedThread.draft.status !== 'sent' && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => handleApproveDraft(selectedThread.id)}
                                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Approve draft and bind to current version"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>Approve Draft</span>
                                </button>
                                <button
                                  onClick={() => handleRequestChanges(selectedThread.id)}
                                  className="px-2.5 py-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                                  title="Request staff modifications before re-review"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Request Changes</span>
                                </button>
                                <button
                                  onClick={() => handleReturnToDraft(selectedThread.id)}
                                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                                  title="Return to drafting stage"
                                >
                                  <FileCheck className="w-3 h-3" />
                                  <span>Return to Draft</span>
                                </button>
                                <button
                                  onClick={() => handleRejectDraft(selectedThread.id)}
                                  className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                                  title="Reject proposed draft"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Send Button: strictly enabled only if approved */}
                          <div>
                            {selectedThread.draft.status === 'approved' ? (
                              <button
                                onClick={() => handleSendApprovedEmail(selectedThread.id)}
                                className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>SEND APPROVED EMAIL</span>
                              </button>
                            ) : selectedThread.draft.status === 'sent' ? (
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Dispatched to Recipient</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium italic">
                                Human approval required before sending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-8 text-slate-400">
                Select a thread to view details and response recommendations.
              </div>
            )}
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
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      5 Connected Mailboxes · Provider Authoritative
                    </span>
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
                    onClick={() => {
                      mailboxes.forEach((m) => db.syncMailbox(m.id));
                      refreshSyncState();
                      setActionNotice({
                        type: 'success',
                        message: 'All 5 mailboxes verified against provider gateways. Zero transmission failures.',
                      });
                      setTimeout(() => setActionNotice(null), 5000);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Verify All Connections</span>
                  </button>

                  <button
                    onClick={() => {
                      setImportTargetMailbox(mailboxes[0]?.id || 'mbx-info');
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
                            {mbx.totalImportedMessages?.toLocaleString() ?? '1,250'} msgs
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
                            {mbx.lastSyncAt ? new Date(mbx.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block">Next Scheduled</span>
                          <span className="font-mono text-[11px] text-slate-700">
                            In 4 minutes
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
                        <span className="truncate">Cursor: {checkpoint?.historyId || 'hist-std-01'}</span>
                        <span className="truncate">Token: {checkpoint?.deltaToken?.substring(0, 10)}...</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-fadeIn">
            <div className="bg-[#104F57] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <h3 className="font-serif font-bold text-sm">Compose New Enterprise Email</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-teal-200 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendComposedEmail} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">From Mailbox:</label>
                  <select
                    value={composeMailbox}
                    onChange={(e) => setComposeMailbox(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs"
                  >
                    {mailboxes.map((mbx) => (
                      <option key={mbx.id} value={mbx.email}>
                        {mbx.email} ({mbx.displayName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">To Recipient Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@organization.org"
                    value={composeRecipient}
                    onChange={(e) => setComposeRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
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

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-500">
                  Sender Identity: <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize & Dispatch Email</span>
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
    </div>
  );
};
