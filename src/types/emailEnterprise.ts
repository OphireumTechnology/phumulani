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

export type EmailAIRewriteAction =
  | 'shorten'
  | 'expand'
  | 'formal'
  | 'warm'
  | 'executive'
  | 'clarity';

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  categoryCode: EmailClassificationCategory;
  subjectTemplate: string;
  bodyTemplate: string;
  subject?: string;
  body?: string;
  suggestedTone: ResponseToneStyle;
  variables: string[];
  description: string;
}

export const EMAIL_STAFF_MEMBERS = [
  { id: 'usr-001', name: 'Comfort Dondo', role: 'Executive Director', email: 'executive@phumulani.org', department: 'Executive Office' },
  { id: 'usr-002', name: 'Sister Miriam K.', role: 'Safeguarding Lead', email: 'safeguarding@phumulani.org', department: 'Safeguarding' },
  { id: 'usr-003', name: 'Dr. Elena Rostova', role: 'Board Secretary', email: 'governance@phumulani.org', department: 'Governance' },
  { id: 'usr-004', name: 'David Mwangi, CPA', role: 'Finance Director', email: 'finance@phumulani.org', department: 'Finance' },
  { id: 'usr-005', name: 'Amina Yusuf', role: 'Partnerships & Community Lead', email: 'partnerships@phumulani.org', department: 'Strategic Partnerships' },
  { id: 'usr-006', name: 'Sarah Jenkins', role: 'Development Officer', email: 'donations@phumulani.org', department: 'Development' },
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-01-donation-thank-you',
    name: 'Donation Thank You & Tax Receipt Acknowledgment',
    category: 'Individual Donations',
    categoryCode: '05_individual_donations',
    subjectTemplate: 'Thank You for Your Generous Support of Phumulani — Tax Receipt #{{receipt_number}}',
    bodyTemplate: `Dear {{recipient_name}},

On behalf of the mothers, children, and families served by Phumulani (Minnesota African Women Against Violence), thank you from the depths of our hearts for your generous contribution of {{donation_amount}} to the {{campaign_name}} on {{donation_date}}.

Phumulani is an exempt 501(c)(3) organization under Minnesota Statutes Chapter 317A (EIN: 88-1234567). No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits; therefore, the full amount of your contribution is deductible for federal and state income tax purposes to the extent permitted by law.

Your support directly funds:
• Emergency shelter bridge grants and safe transitional housing.
• Culturally grounded Tea Healing Sisterhood Circles.
• Legal advocacy, safety planning, and trauma recovery counseling.

With our deepest gratitude and blessings,

Comfort Dondo
Founder & Executive Director, Phumulani
executive@phumulani.org | https://phumulani.org`,
    suggestedTone: 'donor_appreciation',
    variables: ['{{recipient_name}}', '{{donation_amount}}', '{{campaign_name}}', '{{donation_date}}', '{{receipt_number}}'],
    description: 'Compliant 501(c)(3) tax-deductible receipt acknowledgment with program impact reporting.',
  },
  {
    id: 'tmpl-02-major-donor-cultivation',
    name: 'Major Donor Cultivation & Leadership Briefing',
    category: 'Major Donors',
    categoryCode: '04_major_donors',
    subjectTemplate: 'Phumulani Community Resilience — Briefing & Conversation Request with Comfort Dondo',
    bodyTemplate: `Dear {{recipient_name}},

I hope this message finds you well. 

As we expand our Survivor Safe Housing Bridge Fund and culturally centered trauma recovery initiatives across Minnesota, our leadership team has been deeply inspired by your continued vision for community healing and systemic equity.

We would be honored to host you for a private 30-minute briefing—either in person at our Brooklyn Park center or virtually—with our Executive Director Comfort Dondo and Board Leadership. We would welcome the chance to share our 2026 program milestones, client outcomes, and strategic growth priorities.

Could we coordinate a brief discussion in the coming two weeks? Please let us know if any of the following days work well with your schedule: {{proposed_dates}}.

Warmest regards,

Sarah Jenkins & Comfort Dondo
Office of Major Gifts & Philanthropic Alliances
Phumulani | donations@phumulani.org`,
    suggestedTone: 'donor_appreciation',
    variables: ['{{recipient_name}}', '{{proposed_dates}}'],
    description: 'Executive stewardship outreach tailored for high-capacity philanthropic partners.',
  },
  {
    id: 'tmpl-03-grant-loi',
    name: 'Foundation Grant Letter of Inquiry (LOI)',
    category: 'Foundation Grants',
    categoryCode: '07_foundation_grants',
    subjectTemplate: 'Letter of Inquiry: Phumulani {{program_name}} (Grant Opportunity: {{grant_title}})',
    bodyTemplate: `Dear {{recipient_name}} and the Grants Review Committee,

On behalf of Phumulani (Minnesota African Women Against Violence), we are pleased to submit this Letter of Inquiry for the {{grant_title}} funding opportunity.

Phumulani is an immigrant-led 501(c)(3) nonprofit headquartered in Brooklyn Park, MN, dedicated to breaking generational cycles of violence, poverty, and isolation among African immigrant and refugee women and children. 

Through our proposed initiative, "{{program_name}}", we seek grant funding in the amount of {{grant_amount}} over {{grant_duration}} to achieve the following target outcomes:
1. Provide emergency safe transitional housing and rapid-exit financial assistance to 120 families.
2. Conduct 48 weekly culturally grounded trauma healing and sisterhood support circles.
3. Deliver specialized career coaching, digital literacy, and financial independence training.

We look forward to the opportunity to submit a full application. Audited financial statements, IRS determination letters, and logic models are available immediately upon request.

Respectfully submitted,

David Mwangi, CPA (Finance Director) & Comfort Dondo (Executive Director)
Phumulani Institutional Grants Office | grants@phumulani.org`,
    suggestedTone: 'grant_correspondence',
    variables: ['{{recipient_name}}', '{{grant_title}}', '{{program_name}}', '{{grant_amount}}', '{{grant_duration}}'],
    description: 'Structured institutional LOI introducing program objectives, metrics, and leadership.',
  },
  {
    id: 'tmpl-04-grant-submission-confirmation',
    name: 'Grant Proposal Formal Submission Confirmation',
    category: 'Foundation Grants',
    categoryCode: '07_foundation_grants',
    subjectTemplate: 'Proposal Submission Confirmation: Phumulani — {{grant_title}} (App #{{application_id}})',
    bodyTemplate: `Dear {{recipient_name}},

This email serves as formal confirmation that Phumulani has successfully transmitted our complete proposal package for the {{grant_title}} program (Application ID: {{application_id}}).

Included with our submission:
• Executive Narrative & Program Logic Model
• 2026 Operational Budget & Cost Justification (Total Request: {{grant_amount}})
• 501(c)(3) IRS Exemption Letter & Minnesota Certificate of Good Standing
• Most recent Audited Financial Statements & Board Resolution

Should the evaluation committee have any questions or require additional supporting data during the technical review phase, please do not hesitate to contact our Institutional Grants team directly.

Thank you for your dedicated stewardship of community philanthropy in Minnesota.

Sincerely,

David Mwangi, CPA & Comfort Dondo
Phumulani Grants & Compliance | grants@phumulani.org`,
    suggestedTone: 'grant_correspondence',
    variables: ['{{recipient_name}}', '{{grant_title}}', '{{application_id}}', '{{grant_amount}}'],
    description: 'Formal confirmation and documentation inventory following grant submission.',
  },
  {
    id: 'tmpl-05-corporate-sponsorship',
    name: 'Corporate Sponsorship Prospectus Outreach',
    category: 'Corporate Sponsorships',
    categoryCode: '06_corporate_sponsorships',
    subjectTemplate: 'Partnership & Sponsorship Prospectus: Phumulani Annual Gala & Community Showcase',
    bodyTemplate: `Dear {{recipient_name}},

I am writing to invite {{company_name}} to partner with Phumulani as an official Corporate Sponsor for our upcoming Annual Sisterhood Gala and Community Economic Empowerment Showcase.

Phumulani serves hundreds of immigrant women and children across the Minneapolis-St. Paul metro. By sponsoring this marquee gathering, {{company_name}} will demonstrate visible corporate social leadership while providing direct resources for workforce development, safe housing, and youth academic mentorship.

Sponsorship tiers and benefits include:
• Presenting & Visionary Sponsor ({{tier_amount_1}}): Keynote acknowledgment, premier digital and on-site branding, corporate volunteer engagement day.
• Empowerment Partner ({{tier_amount_2}}): Prominent logo placement, recognition in all media releases, 10 executive reserved seats.

We would be delighted to schedule a brief 15-minute call to discuss how we can tailor this partnership to align with {{company_name}}'s community engagement and ESG objectives.

Warm regards,

Amina Yusuf & Comfort Dondo
Corporate Partnerships Lead | partnerships@phumulani.org`,
    suggestedTone: 'partnership_development',
    variables: ['{{recipient_name}}', '{{company_name}}', '{{tier_amount_1}}', '{{tier_amount_2}}'],
    description: 'High-impact corporate outreach with clear sponsorship tiers and community ROI.',
  },
  {
    id: 'tmpl-06-corporate-csr-proposal',
    name: 'Corporate CSR Partnership Proposal',
    category: 'Corporate Social Responsibility',
    categoryCode: '12_corporate_csr',
    subjectTemplate: 'Collaborative CSR Initiative: Phumulani & {{company_name}} Workforce Opportunity Alliance',
    bodyTemplate: `Dear {{recipient_name}},

Thank you for your interest in advancing community equity and economic mobility through Phumulani.

We have prepared a customized Corporate Social Responsibility (CSR) proposal connecting {{company_name}}'s workforce initiatives with Phumulani's Career Advancement & Digital Empowerment Hub. Through this partnership, {{company_name}} employees can engage through:
1. Skills-based corporate mentorship and resume coaching clinics.
2. Direct hiring pathways and apprenticeship sponsorships for program graduates.
3. Employee workplace giving matching campaigns.

Attached is our executive concept paper detailing participant demographics, training curriculum, and impact measurement frameworks.

Could we convene a brief review call next week? Please let us know dates and times that work best for your CSR team.

Sincerely,

Amina Yusuf
Strategic Partnerships Director | partnerships@phumulani.org`,
    suggestedTone: 'partnership_development',
    variables: ['{{recipient_name}}', '{{company_name}}'],
    description: 'Comprehensive CSR proposal emphasizing employee volunteerism, hiring, and grant match.',
  },
  {
    id: 'tmpl-07-volunteer-welcome-packet',
    name: 'Volunteer Welcome & Orientation Packet',
    category: 'Volunteer Applications',
    categoryCode: '13_volunteer_applications',
    subjectTemplate: 'Welcome to the Phumulani Family! Volunteer Orientation Details',
    bodyTemplate: `Dear {{recipient_name}},

Thank you so much for offering your time, skills, and heart to Phumulani! Volunteers are the lifeblood of our organization, and we are thrilled to welcome you to our sisterhood community.

Your volunteer application for {{volunteer_role}} has been reviewed and approved by our Volunteer Services team.

Next Steps for Onboarding:
1. Attend our Virtual Volunteer Orientation on {{orientation_date}} at {{orientation_time}}.
2. Complete our confidential background clearance form: https://phumulani.org/volunteer-clearance
3. Review our Safeguarding & Confidentiality Code of Conduct.

If you have any questions or require language interpretation, please reply directly to this message. We are excited to collaborate with you!

With warm sisterhood,

Amina Yusuf
Volunteer Services Coordinator | info@phumulani.org`,
    suggestedTone: 'volunteer_coordination',
    variables: ['{{recipient_name}}', '{{volunteer_role}}', '{{orientation_date}}', '{{orientation_time}}'],
    description: 'Warm onboarding communication with next steps, safety code, and orientation scheduling.',
  },
  {
    id: 'tmpl-08-community-program-enrollment',
    name: 'Community Program Information & Enrollment',
    category: 'Community Programs',
    categoryCode: '15_community_programs',
    subjectTemplate: 'Welcome to {{program_name}} — Schedule, Location & Supportive Services',
    bodyTemplate: `Hello {{recipient_name}},

We are delighted to confirm your enrollment in Phumulani's upcoming {{program_name}}!

Program Details:
• Schedule: {{program_schedule}}
• Location: Phumulani Community Healing Center, Brooklyn Park, MN (Virtual option available)
• Facilitator: Sister Miriam K. and Community Elders

All Phumulani programs are completely free and confidential. We provide complimentary on-site childcare, light culturally familiar refreshments, and transportation assistance upon request.

Please let us know if you or your family require any accommodations. We look forward to seeing you!

With warmth and love,

Phumulani Program Operations Team
info@phumulani.org | (763) 555-0199`,
    suggestedTone: 'community_engagement',
    variables: ['{{recipient_name}}', '{{program_name}}', '{{program_schedule}}'],
    description: 'Supportive community enrollment notice with childcare, transportation, and schedule info.',
  },
  {
    id: 'tmpl-09-media-press-response',
    name: 'Media Interview & Press Kit Response',
    category: 'Media Inquiries',
    categoryCode: '18_media_inquiries',
    subjectTemplate: 'Phumulani Statement & Media Availability — {{topic_inquiry}}',
    bodyTemplate: `Dear {{recipient_name}},

Thank you for reaching out to Phumulani regarding your coverage of {{topic_inquiry}}.

Our Founder & Executive Director Comfort Dondo is available for an on-record interview. As an advocate, cultural educator, and survivor leader in Minnesota, Comfort can speak directly to:
• The nuanced cultural realities and systemic barriers facing African immigrant women and children.
• Community-led prevention models and restorative justice practices.
• Practical policy solutions for emergency transitional housing and economic security.

To ensure we meet your editorial deadline ({{deadline}}), please let us know your preferred interview format (television studio, phone, or video conference) and proposed schedule.

Attached is our 2026 Organizational Media Kit and high-resolution leadership photography.

Best regards,

Phumulani Communications & Media Relations
info@phumulani.org | https://phumulani.org/press`,
    suggestedTone: 'formal',
    variables: ['{{recipient_name}}', '{{topic_inquiry}}', '{{deadline}}'],
    description: 'Professional press desk response with leadership availability and editorial boundaries.',
  },
  {
    id: 'tmpl-10-board-governance-notice',
    name: 'Board of Directors Governance Notice',
    category: 'Board Governance',
    categoryCode: '03_board_governance',
    subjectTemplate: 'Notice of Board Meeting & Governance Packet — {{meeting_date}}',
    bodyTemplate: `Dear Members of the Board of Directors,

Notice is hereby given that the regular quarterly meeting of the Board of Directors of Phumulani will convene on {{meeting_date}} at {{meeting_time}} via secure video conference and in person at the Executive Boardroom.

Meeting Agenda & Governance Packet:
1. Call to Order & Approval of Minutes
2. Executive Director Report & Strategic Expansion (Comfort Dondo)
3. Q3 2026 Financial Statements & Audit Committee Report (David Mwangi, CPA)
4. Safeguarding & Safeguarding Officer Risk Assessment (Sister Miriam K.)
5. Development & Major Gifts Pipeline Review (Sarah Jenkins)
6. New Business & Adjournment

Please confirm your attendance by replying to this notice so quorum may be officially recorded.

Respectfully submitted,

Dr. Elena Rostova
Secretary, Board of Directors
Phumulani | governance@phumulani.org`,
    suggestedTone: 'formal',
    variables: ['{{meeting_date}}', '{{meeting_time}}'],
    description: 'Formal corporate board governance notice adhering to MN Nonprofit Statutes.',
  },
  {
    id: 'tmpl-11-executive-formal-notice',
    name: 'Executive Director Formal Communication',
    category: 'Executive Communications',
    categoryCode: '02_executive',
    subjectTemplate: 'Phumulani Executive Office — {{subject_matter}}',
    bodyTemplate: `Dear {{recipient_name}},

I write to you from the Executive Office of Phumulani regarding {{subject_matter}}.

Our leadership and staff remain steadfastly dedicated to our founding mandate: providing unconditional safety, holistic healing, and dignified self-reliance to immigrant families overcoming violence.

We deeply appreciate your collaboration and leadership on this matter. I have reviewed our operational priorities and authorized our team to proceed in alignment with the terms discussed.

Should you wish to schedule a follow-up consultation with my office, please coordinate directly with my executive team at executive@phumulani.org.

Sincerely and in solidarity,

Comfort Dondo
Executive Director & Founder, Phumulani
executive@phumulani.org | https://phumulani.org`,
    suggestedTone: 'executive',
    variables: ['{{recipient_name}}', '{{subject_matter}}'],
    description: 'High-level formal correspondence from Executive Director Comfort Dondo.',
  },
  {
    id: 'tmpl-12-general-community-inquiry',
    name: 'General Community Inquiry Standard Response',
    category: 'General Inquiries',
    categoryCode: '23_general_inquiries',
    subjectTemplate: 'Thank You for Contacting Phumulani — General Inquiries Response',
    bodyTemplate: `Dear {{recipient_name}},

Thank you for reaching out to Phumulani. We have received your inquiry regarding {{inquiry_topic}}.

Our community operations team is reviewing your message and will provide a comprehensive response within 1 to 2 business days. 

In the interim, please explore our resources:
• Program Overviews & Sisterhood Circles: https://phumulani.org/programs
• Community Events & Workshops: https://phumulani.org/events
• Volunteer & Career Opportunities: https://phumulani.org/get-involved

NOTE: If your inquiry pertains to an urgent crisis or immediate safety emergency, please call 911 or the Day One Crisis Hotline at 1-866-223-1111 immediately.

Kind regards,

Phumulani Front Office & Community Services
info@phumulani.org | (763) 555-0199`,
    suggestedTone: 'professional',
    variables: ['{{recipient_name}}', '{{inquiry_topic}}'],
    description: 'Standard front-office acknowledgment with program links and emergency safety notice.',
  },
];
