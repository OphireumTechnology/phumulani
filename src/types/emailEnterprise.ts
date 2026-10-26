/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Enterprise Email Management, Fundraising Intelligence & Executive Communications Types
 * Grounded in Master Development Playbook (feature/phumulani-email-enterprise)
 */

export type EmailClassificationCategory =
  | '01_safeguarding'
  | '02_executive'
  | '03_board_governance'
  | '04_major_donors'
  | '05_individual_donations'
  | '06_corporate_sponsorships'
  | '07_foundation_grants'
  | '08_government_funding'
  | '09_international_donors'
  | '10_fundraising_campaigns'
  | '11_strategic_partnerships'
  | '12_corporate_csr'
  | '13_volunteer_applications'
  | '14_volunteer_coordination'
  | '15_community_programs'
  | '16_community_events'
  | '17_advocacy_pr'
  | '18_media_inquiries'
  | '19_finance_accounting'
  | '20_legal_compliance'
  | '21_employment_recruitment'
  | '22_website_tech_support'
  | '23_general_inquiries'
  | '24_newsletters_announcements'
  | '25_spam_suspicious';

export const EMAIL_CATEGORY_METADATA: Record<
  EmailClassificationCategory,
  { code: string; label: string; department: string; defaultPriority: EmailPriorityLevel; isSafeguardingBoundary?: boolean }
> = {
  '01_safeguarding': { code: '01', label: 'Critical Safeguarding Routing', department: 'Safeguarding / Sister Miriam K.', defaultPriority: 'P0', isSafeguardingBoundary: true },
  '02_executive': { code: '02', label: 'Executive Communications', department: 'Executive Office / Comfort Dondo', defaultPriority: 'P1' },
  '03_board_governance': { code: '03', label: 'Board and Governance', department: 'Board Secretary / Dr. Elena Rostova', defaultPriority: 'P1' },
  '04_major_donors': { code: '04', label: 'Major Donors', department: 'Development / Major Gifts', defaultPriority: 'P2' },
  '05_individual_donations': { code: '05', label: 'Individual Donations', department: 'Donations & Stewardship', defaultPriority: 'P3' },
  '06_corporate_sponsorships': { code: '06', label: 'Corporate Sponsorships', department: 'Corporate Partnerships', defaultPriority: 'P2' },
  '07_foundation_grants': { code: '07', label: 'Foundation Grants', department: 'Grants & Institutional Funding', defaultPriority: 'P1' },
  '08_government_funding': { code: '08', label: 'Government Funding Opportunities', department: 'Grants & Compliance', defaultPriority: 'P1' },
  '09_international_donors': { code: '09', label: 'International Donor Organizations', department: 'Strategic Partnerships', defaultPriority: 'P2' },
  '10_fundraising_campaigns': { code: '10', label: 'Fundraising Campaigns', department: 'Development & Campaigns', defaultPriority: 'P2' },
  '11_strategic_partnerships': { code: '11', label: 'Strategic Partnerships', department: 'Community & Coalition Relations', defaultPriority: 'P2' },
  '12_corporate_csr': { code: '12', label: 'Corporate Social Responsibility', department: 'CSR & Corporate Giving', defaultPriority: 'P2' },
  '13_volunteer_applications': { code: '13', label: 'Volunteer Applications', department: 'Volunteer Services', defaultPriority: 'P3' },
  '14_volunteer_coordination': { code: '14', label: 'Volunteer Coordination', department: 'Volunteer Services', defaultPriority: 'P3' },
  '15_community_programs': { code: '15', label: 'Community Programs', department: 'Program Operations', defaultPriority: 'P3' },
  '16_community_events': { code: '16', label: 'Community Events', department: 'Events & Engagement', defaultPriority: 'P3' },
  '17_advocacy_pr': { code: '17', label: 'Advocacy and Public Relations', department: 'Advocacy & Outreach', defaultPriority: 'P2' },
  '18_media_inquiries': { code: '18', label: 'Media Inquiries', department: 'Communications & Media', defaultPriority: 'P1' },
  '19_finance_accounting': { code: '19', label: 'Finance and Accounting', department: 'Finance / David Mwangi, CPA', defaultPriority: 'P2' },
  '20_legal_compliance': { code: '20', label: 'Legal and Compliance', department: 'Legal & Risk Management', defaultPriority: 'P1' },
  '21_employment_recruitment': { code: '21', label: 'Employment and Recruitment', department: 'Human Resources', defaultPriority: 'P3' },
  '22_website_tech_support': { code: '22', label: 'Website and Technical Support', department: 'IT & Infrastructure', defaultPriority: 'P3' },
  '23_general_inquiries': { code: '23', label: 'General Inquiries', department: 'Front Office & Operations', defaultPriority: 'P3' },
  '24_newsletters_announcements': { code: '24', label: 'Newsletters and Announcements', department: 'Communications', defaultPriority: 'P4' },
  '25_spam_suspicious': { code: '25', label: 'Spam and Suspicious Messages', department: 'Security & Spam Filtering', defaultPriority: 'P4' },
};

export type EmailPriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export const PRIORITY_CONFIG: Record<
  EmailPriorityLevel,
  { label: string; slaHours: number; description: string; badgeColor: string }
> = {
  P0: { label: 'P0 — Critical', slaHours: 1, description: 'Safeguarding emergency, serious security, imminent service jeopardy. Route to human officer immediately.', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
  P1: { label: 'P1 — Urgent', slaHours: 4, description: 'Grant deadline < 24h, executive decision, time-sensitive funding, immediate meeting.', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300' },
  P2: { label: 'P2 — High', slaHours: 24, description: 'Major donor inquiry, corporate sponsorship proposal, grant invitation, significant partnership.', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  P3: { label: 'P3 — Normal', slaHours: 48, description: 'Volunteer inquiries, event registration questions, administrative correspondence.', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  P4: { label: 'P4 — Low', slaHours: 72, description: 'Newsletters, general announcements, non-urgent updates, marketing.', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export type EmailFolder = 'INBOX' | 'SENT' | 'ARCHIVE' | 'TRASH' | 'SPAM' | 'DRAFTS';

export type MailboxConnectionState =
  | 'NOT_CONFIGURED'
  | 'AUTHORIZATION_REQUIRED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'SYNCING'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'AUTHENTICATION_FAILED'
  | 'RATE_LIMITED'
  | 'ERROR'
  | 'connected'
  | 'syncing'
  | 'error'
  | 'disconnected';

export type MailboxType = 'primary' | 'collaborative' | 'shared' | 'alias';

export interface ConnectedMailbox {
  id: string;
  email: string;
  displayName: string;
  department: string;
  provider: 'Google Workspace' | 'Microsoft 365' | 'Custom IMAP/SMTP';
  status: MailboxConnectionState;
  connectionState?: MailboxConnectionState;
  mailboxType?: MailboxType;
  lastSyncedAt: string;
  lastAttemptAt?: string;
  unreadCount: number;
  totalThreads: number;
  isDefault?: boolean;
  providerAccountId?: string;
  authStatus?: 'SIMULATED — LIVE OAUTH REQUIRED' | 'authorized' | 'pending_auth' | 'expired' | 'revoked' | string;
  permissionScopes?: string[];
  reauthRequired?: boolean;
  twoWaySyncEnabled?: boolean;
  historicalImportStatus?: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed';
  historicalImportProgress?: number;
  totalImportedMessages?: number;
  historicalDiscovered?: number;
  historicalRemaining?: number;
  syncLagSeconds?: number;
  sentMessagesReconciled?: number;
  duplicatesPrevented?: number;
  authFailures?: number;
  rateLimitEvents?: number;
  attachmentSyncFailures?: number;
  pendingSyncJobs?: number;
  failedJobs?: number;
  retryCount?: number;
  currentError?: string;
  currentErrors?: string[];
  nextScheduledSync?: string;
  newMessagesCount?: number;
  lastSyncAt?: string;
}

export interface MailboxHealthMetrics {
  mailboxId: string;
  mailboxEmail: string;
  connectionStatus: MailboxConnectionState;
  historicalDiscovered: number;
  historicalImported: number;
  historicalRemaining: number;
  importCompletionPercent: number;
  lastSuccessfulSync: string;
  syncLagSeconds: number;
  newMessagesSynchronized: number;
  sentMessagesReconciled: number;
  failedSyncJobs: number;
  duplicatesPrevented: number;
  authFailures: number;
  rateLimitEvents: number;
  attachmentSyncFailures: number;
  pendingRetries: number;
  lastReconciliationAt: string;
}

export interface EmailAttachmentItem {
  id: string;
  filename: string;
  name?: string;
  sizeBytes: number;
  fileType: string;
  mimeType: string;
  isQuarantined: boolean;
  scanStatus: 'clean' | 'quarantined' | 'pending';
  sha256?: string;
  storagePath?: string;
  downloadUrl?: string;
}

export interface OutboundEmailAuthorization {
  id: string;
  draftId: string;
  threadId: string;
  senderMailbox: string;
  recipientEmails: string[];
  subject: string;
  bodyText: string;
  approvedByUserId: string;
  approvedByName: string;
  approvedAt: string;
  idempotencyKey: string;
  providerSubmissionId?: string;
  deliveryStatus: 'submitted' | 'delivered' | 'bounced' | 'failed';
  dispatchedAt?: string;
  reconciledInSentFolder: boolean;
  error?: string;
}

export type HistoricalImportStage =
  | 'authorization'
  | 'config'
  | 'scope_review'
  | 'safeguarding_screen'
  | 'batch_retrieval'
  | 'validation'
  | 'dedup'
  | 'storage'
  | 'indexing'
  | 'crm_matching'
  | 'verification'
  | 'completed';

export interface HistoricalImportJob {
  id: string;
  mailboxId: string;
  mailboxEmail: string;
  provider: 'Google Workspace' | 'Microsoft 365' | 'Custom IMAP/SMTP';
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'in_progress';
  stage: HistoricalImportStage;
  currentStage?: HistoricalImportStage;
  scope: 'all_history' | 'last_12_months' | 'last_24_months' | 'custom_range';
  startDate?: string;
  endDate?: string;
  totalFound: number;
  importedCount: number;
  duplicatesSkipped: number;
  safeguardingQuarantined: number;
  errorsCount: number;
  cursor: string;
  batchSize: number;
  currentBatch?: number;
  totalBatches?: number;
  progressPercent: number;
  progressPercentage?: number;
  isResumable: boolean;
  startedAt?: string;
  lastCheckpointAt?: string;
  completedAt?: string;
  errorMessage?: string;
  auditEvidence?: string;
}

export interface MailboxSyncCheckpoint {
  id?: string;
  mailboxId: string;
  email: string;
  mailboxEmail?: string;
  provider: 'Google Workspace' | 'Microsoft 365' | 'Custom IMAP/SMTP';
  providerAccountId: string;
  authStatus: 'authorized' | 'pending_auth' | 'expired' | 'revoked';
  twoWaySyncEnabled: boolean;
  historyId: string;
  deltaToken: string;
  lastSuccessfulSyncAt: string;
  lastCheckpointAt?: string;
  lastAttemptAt: string;
  newMessagesCount: number;
  sentMessagesCount: number;
  pendingSyncJobs: number;
  failedSyncJobs: number;
  retryCount: number;
  currentError?: string;
  nextScheduledSyncAt: string;
  supportedFolders: string[];
  supportedLabels: string[];
  rateLimit: {
    requestsPerMin: number;
    currentUsage: number;
    backoffUntil?: string;
  };
  rateLimitBackoffMs?: number;
}

export interface EmailConflictRecord {
  id: string;
  threadId: string;
  threadSubject?: string;
  messageId: string;
  mailboxEmail: string;
  conflictType: 'concurrent_modification' | 'version_mismatch' | 'folder_divergence' | 'read_state_conflict';
  providerVersion?: string;
  providerState?: string;
  dashboardVersion?: string;
  dashboardState?: string;
  resolutionStrategy?: 'provider_authoritative' | 'dashboard_authoritative' | 'manual_review' | 'KEEP_PROVIDER' | 'KEEP_DASHBOARD';
  resolution?: string;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'resolved' | 'pending_review' | 'RESOLVED' | 'DETECTED';
  notes?: string;
}

export interface SyncAuditLogItem {
  id: string;
  timestamp: string;
  mailboxEmail: string;
  action: string;
  actor: string;
  actorName?: string;
  details: string;
  direction: 'inbound' | 'outbound' | 'two_way' | 'internal';
  status: 'success' | 'warning' | 'error';
  result?: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface EmailSearchFilters {
  mailboxId?: string;
  category?: string;
  priority?: string;
  folder?: EmailFolder | 'all';
  isHistorical?: boolean;
  startDate?: string;
  endDate?: string;
  hasAttachments?: boolean;
  crmEntityType?: 'donor' | 'grant' | 'partnership' | 'volunteer' | 'campaign';
  isRead?: boolean;
}

export type AutoResponderRuleId =
  | 'AR01'
  | 'AR02'
  | 'AR03'
  | 'AR04'
  | 'AR05'
  | 'AR06'
  | 'AR07'
  | 'AR08'
  | 'AR09'
  | 'AR10';

export interface AutoResponderRule {
  id: AutoResponderRuleId;
  code: string;
  name: string;
  trigger: string;
  mailbox: string;
  eligibleCategories: EmailClassificationCategory[];
  approvedTemplate: string;
  requiredPermission: string;
  exclusionConditions: string[];
  maxFrequencyHours: number;
  duplicatePrevention: boolean;
  enabled: boolean;
  totalTriggeredCount: number;
  lastTriggeredAt?: string;
}

export interface AutoResponderLog {
  id: string;
  ruleId: AutoResponderRuleId;
  ruleName: string;
  recipientEmail: string;
  messageSubject: string;
  timestamp: string;
  status: 'sent' | 'suppressed' | 'blocked_by_safety';
  reason?: string;
}

export type ResponseToneStyle =
  | 'professional'
  | 'formal'
  | 'warm_welcoming'
  | 'executive'
  | 'donor_appreciation'
  | 'partnership_development'
  | 'grant_correspondence'
  | 'volunteer_coordination'
  | 'community_engagement';

export interface EmailDraft {
  id: string;
  threadId: string;
  inReplyToMessageId: string;
  suggestedSubject: string;
  recipientEmail: string;
  proposedBody: string;
  toneStyle: ResponseToneStyle;
  verifiedContextSummary: string;
  requiredStaffAction: string;
  confidenceScore: number; // 0 - 100
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent' | 'changes_requested' | 'returned_to_draft';
  generatedByAgent: string; // e.g. 'A02 Email Manager'
  requestedByStaff?: string;
  approvedByStaff?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  approvedBody?: string;
  approvedRecipient?: string;
  approvedSubject?: string;
  approvedVersion?: number;
  sentAt?: string;
  rejectionReason?: string;
  changesRequestedReason?: string;
  returnToDraftReason?: string;
  humanFeedbackNotes?: string;
  version?: number;
  createdAt: string;
}

export type ConversationStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_EXTERNAL_RESPONSE'
  | 'RESOLVED'
  | 'ARCHIVED'
  | 'ESCALATED'
  | 'unread'
  | 'in_review'
  | 'awaiting_approval'
  | 'responded'
  | 'resolved'
  | 'escalated_safeguarding'
  | 'new'
  | 'triage_ready';

export interface EnterpriseEmailMessage {
  id: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  ccEmails?: string[];
  subject: string;
  bodyText: string;
  receivedAt: string;
  direction: 'inbound' | 'outbound';
  isAutoResponse?: boolean;
  autoResponderRuleId?: AutoResponderRuleId;
  providerMessageId?: string;
  providerThreadId?: string;
  rfcMessageId?: string;
  inReplyToRfcId?: string;
  folder?: EmailFolder;
  labels?: string[];
  isRead?: boolean;
  isArchived?: boolean;
  isHistorical?: boolean;
  importJobId?: string;
  syncVersion?: number;
  attachments?: Array<{
    id?: string;
    name: string;
    filename?: string;
    sizeBytes: number;
    fileType: string;
    mimeType?: string;
    isQuarantined?: boolean;
    scanStatus?: 'clean' | 'quarantined' | 'pending';
    storagePath?: string;
    sha256?: string;
  }>;
}

export interface EnterpriseEmailThread {
  id: string;
  mailboxId: string;
  mailboxEmail: string;
  threadSubject: string;
  participantEmails: string[];
  messageCount: number;
  lastMessageAt: string;
  classification: EmailClassificationCategory;
  priority: EmailPriorityLevel;
  status: ConversationStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  slaDeadline: string;
  isOverdue: boolean;
  messages: EnterpriseEmailMessage[];
  draft?: EmailDraft;
  crmLink?: {
    entityType: 'donor' | 'grant' | 'partnership' | 'volunteer' | 'campaign' | 'partner';
    entityId: string;
    entityName: string;
  };
  classificationOverridden?: boolean;
  classificationOverrideReason?: string;
  folder?: EmailFolder;
  labels?: string[];
  isRead?: boolean;
  isArchived?: boolean;
  isHistorical?: boolean;
  lastSyncAt?: string;
  providerThreadId?: string;
  providerMessageId?: string;
  syncState?: 'synced' | 'pending_push' | 'conflict' | 'error';
  internalNotes?: Array<{
    id: string;
    authorName: string;
    text: string;
    createdAt: string;
  }>;
}

// CRM & Fundraising
export type DonorLifecycleStage =
  | 'prospect'
  | 'contacted'
  | 'engaged'
  | 'meeting_requested'
  | 'proposal_discussed'
  | 'commitment_pending'
  | 'verified_donation'
  | 'acknowledgment'
  | 'stewardship'
  | 'renewal';

export interface DonorProfile {
  id: string;
  fullName: string;
  organization?: string;
  email: string;
  phone?: string;
  stage: DonorLifecycleStage;
  communicationPreference: 'email' | 'phone' | 'in_person' | 'discreet';
  consentStatus: 'opted_in' | 'confirmed_consent' | 'opted_out';
  relationshipOwner: string;
  lifetimeDonated: number;
  lastDonationDate?: string;
  campaignInterests: string[];
  threadIds: string[];
  nextFollowUpDate?: string;
  notes: string[];
  engagementStatus: 'active' | 'nurturing' | 'at_risk' | 'dormant';
}

export interface MajorDonorPipelineDeal {
  id: string;
  donorId: string;
  donorName: string;
  organization?: string;
  estimatedAmount: number;
  stage: DonorLifecycleStage;
  targetCloseDate: string;
  probabilityPercent: number;
  campaignId: string;
  campaignTitle: string;
  primaryContact: string;
  notes: string;
  lastInteraction: string;
}

export type GrantPipelineStage =
  | 'identified'
  | 'eligibility_review'
  | 'qualified'
  | 'application_prep'
  | 'internal_approval'
  | 'submitted'
  | 'under_review'
  | 'awarded'
  | 'declined'
  | 'reporting'
  | 'closed';

export interface GrantPipelineOpportunity {
  id: string;
  funderName: string;
  opportunityTitle: string;
  fundingAmount: number;
  deadline: string;
  stage: GrantPipelineStage;
  eligibilityVerified: boolean;
  programTarget: string;
  leadStaff: string;
  aiGrantsAssistantNotes: string;
  requiredDocuments: string[];
  awardStatus?: 'pending' | 'awarded' | 'declined';
  reportingDueDates?: string[];
  submissionDate?: string;
}

export type PartnershipPipelineStage =
  | 'prospect_id'
  | 'research'
  | 'qualification'
  | 'outreach_draft'
  | 'human_approval'
  | 'authorized_contact'
  | 'response_tracking'
  | 'meeting'
  | 'proposal'
  | 'negotiation'
  | 'approved_agreement'
  | 'reporting';

export interface CorporatePartnershipOpportunity {
  id: string;
  companyName: string;
  partnershipType: 'corporate_sponsorship' | 'csr_grant' | 'employer_hiring' | 'in_kind' | 'event_sponsor';
  contactPerson: string;
  contactEmail: string;
  estimatedValue: number;
  stage: PartnershipPipelineStage;
  leadStaff: string;
  proposalSummary: string;
  lastContactDate: string;
  nextFollowUpDate: string;
}

export interface FollowUpTask {
  id: string;
  relatedThreadId?: string;
  relatedEntityName: string;
  taskType: 'email_reply' | 'donor_call' | 'grant_submission' | 'meeting_prep' | 'executive_decision';
  assignedTo: string;
  title: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  aiGeneratedBy?: string;
  completedAt?: string;
}

export interface CalendarMeetingProposal {
  id: string;
  threadId: string;
  organizer: string;
  attendeeName: string;
  attendeeEmail: string;
  proposedTitle: string;
  proposedTimes: string[];
  confirmedTime?: string;
  status: 'suggested' | 'invite_drafted' | 'approved_sent' | 'declined';
  conflictDetected: boolean;
  notes: string;
  locationOrLink?: string;
}

export interface EmailAnalyticsReport {
  totalIncoming: number;
  unreadCount: number;
  criticalP0Count: number;
  urgentP1Count: number;
  pendingResponsesCount: number;
  draftsAwaitingApprovalCount: number;
  overdueFollowUpsCount: number;
  activeDonorConversations: number;
  activeFundraisingOpportunities: number;
  upcomingGrantDeadlines: number;
  scheduledMeetings: number;
  processingErrorsCount: number;
  avgResponseTimeHours: number;
  avgResolutionTimeHours: number;
  aiDraftAcceptanceRatePercent: number;
  classificationAccuracyPercent: number;
  autoResponsesSentTotal: number;
}
