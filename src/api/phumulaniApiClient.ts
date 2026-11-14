/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Client-Side API Client
 * Separates browser UI from server-side services, credentials, and raw knowledge records.
 * All operations execute through authenticated, role-controlled REST endpoints.
 */

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
} from '../types/phumulaniAi';
import {
  VerifiedKnowledgeDocument,
  KnowledgeRetrievalQuery,
  KnowledgeRetrievalResult,
  SourceApprovalAuditReport,
} from '../types/verifiedKnowledge';

import { authFetch, sessionTokenStore } from '../services/sessionTokenStore';

export interface VerifiedProgramSummary {
  id: string;
  title: string;
  category: string;
  annualBudget: number;
  geographicFocus: string;
  objectives: string[];
}

class PhumulaniApiClient {
  private userRole: string = 'staff';

  public setUserRole(role: string) {
    this.userRole = role;
  }

  public setAuthToken(token: string) {
    sessionTokenStore.setAuthToken(token, this.userRole);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }

    const res = await authFetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // --- Gateway & Health ---
  public async getGatewayStatus(): Promise<{
    gateway: ModelHealthStatus & { metrics?: GatewayInferenceMetrics; canonicalSystemPrompt?: string };
  }> {
    return this.request('/api/phumulani-ai/gateway/status');
  }

  public async getGatewayMetrics(): Promise<{ metrics: GatewayInferenceMetrics }> {
    return this.request('/api/phumulani-ai/gateway/metrics');
  }

  // --- Policy & Autonomy ---
  public async getPolicyConfig(): Promise<{ policy: AutonomousPolicyConfig }> {
    return this.request('/api/phumulani-ai/policy');
  }

  public async setAutonomyLevel(level: AutonomyLevel): Promise<{ policy: AutonomousPolicyConfig }> {
    return this.request('/api/phumulani-ai/policy/autonomy-level', {
      method: 'POST',
      body: JSON.stringify({ level }),
    });
  }

  // --- Programs ---
  public async getPrograms(): Promise<{ programs: VerifiedProgramSummary[] }> {
    return this.request('/api/phumulani-ai/programs');
  }

  // --- Prospects & Program Matching ---
  public async getProspects(): Promise<{ prospects: ProspectProfile[] }> {
    return this.request('/api/phumulani-ai/prospects');
  }

  public async matchProspect(prospectId: string): Promise<{ matches: ProgramMatchResult[] }> {
    return this.request(`/api/phumulani-ai/prospects/${prospectId}/match`, {
      method: 'POST',
    });
  }

  public async optOutProspect(prospectId: string): Promise<{ success: boolean; haltedCount?: number }> {
    return this.request(`/api/phumulani-ai/prospects/${prospectId}/opt-out`, {
      method: 'POST',
    });
  }

  // --- Campaigns ---
  public async getCampaigns(): Promise<{ campaigns: AiCampaign[] }> {
    return this.request('/api/phumulani-ai/campaigns');
  }

  public async generateCampaign(payload: {
    title: string;
    targetProgramId: string;
    prospectIds: string[];
    senderMailbox: string;
    createdBy: string;
  }): Promise<{ campaign: AiCampaign }> {
    return this.request('/api/phumulani-ai/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async approveCampaign(campaignId: string, approvedBy: string): Promise<{ campaign: AiCampaign }> {
    return this.request(`/api/phumulani-ai/campaigns/${campaignId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedBy }),
    });
  }

  // --- Email Classification & Donor Scoring ---
  public async classifyEmail(payload: {
    emailSubject: string;
    emailBody: string;
    senderEmail: string;
  }): Promise<{ classification: EmailClassificationResult }> {
    return this.request('/api/phumulani-ai/classify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async analyzeDonorInterest(payload: {
    prospectId: string;
    emailSubject: string;
    emailBody: string;
  }): Promise<{ interestScore: DonorInterestScore }> {
    return this.request('/api/phumulani-ai/analyze-interest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Reply Drafts ---
  public async getReplyDrafts(): Promise<{ drafts: AiReplyDraft[] }> {
    return this.request('/api/phumulani-ai/reply-drafts');
  }

  public async generateReplyDraft(payload: {
    incomingEmailId: string;
    incomingEmailSubject?: string;
    incomingEmailBody?: string;
    prospectId: string;
    programId?: string;
    tone?: 'professional' | 'warm' | 'visionary' | 'stewardship';
  }): Promise<{ draft: AiReplyDraft }> {
    return this.request('/api/phumulani-ai/reply-drafts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Follow-Up Queue ---
  public async getFollowUps(): Promise<{ followUps: FollowUpItem[] }> {
    return this.request('/api/phumulani-ai/follow-ups');
  }

  public async scheduleFollowUp(payload: {
    prospectId: string;
    programId: string;
    sequenceStep: number;
    delayDays: number;
  }): Promise<{ followUp: FollowUpItem }> {
    return this.request('/api/phumulani-ai/follow-ups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async cancelFollowUpOnReply(prospectId: string, reason?: string): Promise<{ cancelledCount: number }> {
    return this.request(`/api/phumulani-ai/follow-ups/${prospectId}/cancel-on-reply`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- High-Interest Leads ---
  public async getHighInterestLeads(): Promise<{ leads: HighInterestLead[] }> {
    return this.request('/api/phumulani-ai/high-interest-leads');
  }

  // --- Funding Proposals ---
  public async getProposals(): Promise<{ proposals: FundingProposalDraft[] }> {
    return this.request('/api/phumulani-ai/proposals');
  }

  public async generateProposal(payload: {
    targetGrantmaker: string;
    programId: string;
    requestedAmount: number;
    author: string;
  }): Promise<{ proposal: FundingProposalDraft }> {
    return this.request('/api/phumulani-ai/proposals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Calendar Integration ---
  public async getCalendarStatus(provider: 'google' | 'microsoft' = 'google'): Promise<{ status: any }> {
    return this.request(`/api/phumulani-ai/calendar/status?provider=${provider}`);
  }

  public async getAvailableSlots(params: {
    staffEmail?: string;
    staffName?: string;
    startDate?: string;
    daysCount?: number;
    durationMinutes?: number;
  }): Promise<{ slots: CalendarMeetingSlot[] }> {
    const qs = new URLSearchParams({
      staffEmail: params.staffEmail || 'director@phumulani.org',
      staffName: params.staffName || 'Comfort Dondo',
      startDate: params.startDate || new Date().toISOString(),
      daysCount: String(params.daysCount || 5),
      durationMinutes: String(params.durationMinutes || 30),
    });
    return this.request(`/api/phumulani-ai/calendar/slots?${qs.toString()}`);
  }

  public async scheduleMeeting(payload: {
    prospectId: string;
    prospectName: string;
    prospectEmail: string;
    staffEmail: string;
    staffName: string;
    provider: 'google' | 'microsoft';
    title: string;
    startTime: string;
    endTime: string;
  }): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    return this.request('/api/phumulani-ai/calendar/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getBookings(): Promise<{ bookings: CalendarMeetingBooking[] }> {
    return this.request('/api/phumulani-ai/calendar/bookings');
  }

  // --- Knowledge Grounding & Truth APIs ---
  public async getKnowledgeStatus(): Promise<{ status: any }> {
    return this.request('/api/phumulani-ai/knowledge/status');
  }

  public async getKnowledgeDocuments(): Promise<{ documents: VerifiedKnowledgeDocument[] }> {
    return this.request('/api/phumulani-ai/knowledge/documents');
  }

  public async queryKnowledge(query: KnowledgeRetrievalQuery): Promise<{ result: KnowledgeRetrievalResult }> {
    return this.request('/api/phumulani-ai/knowledge/query', {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  public async getFinancialBreakdown(): Promise<{ financialBreakdown: any }> {
    return this.request('/api/phumulani-ai/knowledge/financial-breakdown');
  }

  public async getSourceApprovalAuditReport(): Promise<{ auditReport: SourceApprovalAuditReport }> {
    return this.request('/api/phumulani-ai/knowledge/audit-report');
  }

  // --- Milestone 4: Email Command Center & CRM Intelligence ---
  public async getThreadContext(threadId: string): Promise<{
    success: boolean;
    thread: any;
    donor: any;
    matchedProgram: any;
    verifiedCitations: any[];
    messageCount: number;
    combinedText: string;
  }> {
    return this.request(`/api/phumulani-ai/threads/${threadId}/context`);
  }

  public async processThread(threadId: string): Promise<{
    success: boolean;
    threadId: string;
    classification: EmailClassificationResult;
    interestScore: DonorInterestScore;
    draft?: AiReplyDraft;
    isOptOut: boolean;
    isEscalated: boolean;
    lead?: HighInterestLead;
    crmActionRecorded: boolean;
  }> {
    return this.request(`/api/phumulani-ai/threads/${threadId}/process`, {
      method: 'POST',
    });
  }

  public async checkDuplicateOutreach(
    contactEmail: string,
    programId?: string
  ): Promise<{
    isDuplicate: boolean;
    reason?: string;
    existingEntityId?: string;
    existingType?: string;
    daysSinceLastOutreach?: number;
  }> {
    const params = new URLSearchParams({ email: contactEmail });
    if (programId) params.append('programId', programId);
    return this.request(`/api/phumulani-ai/outreach/duplicate-check?${params.toString()}`);
  }

  public async syncCrmAction(payload: {
    donorId: string;
    actionType: string;
    details: string;
  }): Promise<{ success: boolean; auditId: string }> {
    return this.request('/api/phumulani-ai/crm/action', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Phase 72 Calendar Lifecycle & Reminders ---
  public async rescheduleMeeting(payload: {
    bookingId: string;
    newStartTime: string;
    newEndTime: string;
  }): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    return this.request('/api/phumulani-ai/calendar/reschedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async cancelMeeting(payload: {
    bookingId: string;
    reason?: string;
  }): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    return this.request('/api/phumulani-ai/calendar/cancel', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getCalendarReminders(): Promise<{ reminders: any[] }> {
    return this.request('/api/phumulani-ai/calendar/reminders');
  }

  // --- Phase 70 Coordinated 12-Task AI Fundraising Workforce ---
  public async getWorkforceTasks(): Promise<{ tasks: Array<any> }> {
    return this.request('/api/phumulani-ai/workforce/tasks');
  }

  public async executeWorkforceTask(payload: {
    taskId: string;
    context?: Record<string, any>;
  }): Promise<{ success: boolean; execution: any }> {
    return this.request('/api/phumulani-ai/workforce/execute', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Phase 66-74 AI Email Telemetry, Inbox, Drafts, Grant Financials & Governance ---
  public async getEmailAiTelemetry(): Promise<{ config: any; telemetry: any }> {
    return this.request('/api/admin/email/ai/telemetry');
  }

  public async getUnifiedInbox(params?: {
    view?: string;
    mailboxEmail?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const qs = new URLSearchParams();
    if (params?.view) qs.set('view', params.view);
    if (params?.mailboxEmail) qs.set('mailboxEmail', params.mailboxEmail);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    return this.request(`/api/admin/email/inbox?${qs.toString()}`);
  }

  public async getPersistentDrafts(): Promise<{ total: number; drafts: any[] }> {
    return this.request('/api/admin/email/drafts');
  }

  public async approvePersistentDraft(
    id: string,
    payload: {
      decision: 'APPROVE' | 'EDIT_AND_APPROVE' | 'REQUEST_CHANGES' | 'RETURN_TO_DRAFT' | 'REJECT';
      notes?: string;
      editedSubject?: string;
      editedBody?: string;
    }
  ): Promise<{ success: boolean; draft?: any; approval?: any; error?: string; code?: string }> {
    return this.request(`/api/admin/email/drafts/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async schedulePersistentDraft(
    id: string,
    scheduledSendAt: string
  ): Promise<{ success: boolean; draft?: any; error?: string }> {
    return this.request(`/api/admin/email/drafts/${encodeURIComponent(id)}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledSendAt }),
    });
  }

  public async sendPersistentDraft(
    id: string,
    idempotencyKey?: string
  ): Promise<{ success: boolean; dispatch?: any; draft?: any; error?: string }> {
    return this.request(`/api/admin/email/drafts/${encodeURIComponent(id)}/send`, {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    });
  }

  public async getFinancialDocs(): Promise<{ total: number; documents: any[] }> {
    return this.request('/api/admin/email/financial-docs');
  }

  public async ingestFinancialDoc(payload: {
    subject: string;
    bodyText: string;
    mailboxEmail?: string;
    senderEmail?: string;
    attachmentFilenames?: string[];
  }): Promise<{ document: any }> {
    return this.request('/api/admin/email/financial-docs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async approveFinancialDoc(id: string, decision: 'APPROVED' | 'REJECTED', notes?: string): Promise<{ document: any }> {
    return this.request(`/api/admin/email/financial-docs/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  public async createFinancialDocInvoice(id: string): Promise<{ success: boolean; invoiceId?: string; error?: string; code?: string }> {
    return this.request(`/api/admin/email/financial-docs/${encodeURIComponent(id)}/create-invoice`, {
      method: 'POST',
    });
  }

  public async getGovernancePermissions(): Promise<{ permissions: any[] }> {
    return this.request('/api/admin/email/governance/permissions');
  }

  public async getLegalHolds(activeOnly = false): Promise<{ holds: any[] }> {
    return this.request(`/api/admin/email/governance/legal-holds?activeOnly=${activeOnly}`);
  }

  public async createLegalHold(payload: {
    title: string;
    reason: string;
    targetType: 'THREAD' | 'MAILBOX' | 'SENDER';
    targetValue: string;
  }): Promise<{ hold: any }> {
    return this.request('/api/admin/email/governance/legal-holds', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async releaseLegalHold(holdId: string): Promise<{ hold: any }> {
    return this.request(`/api/admin/email/governance/legal-holds/${encodeURIComponent(holdId)}/release`, {
      method: 'POST',
    });
  }

  public async exportComplianceBundle(): Promise<any> {
    return this.request('/api/admin/email/governance/compliance-export');
  }

  public async getAuditLedger(limit = 50): Promise<{ chainVerified: boolean; total: number; entries: any[] }> {
    return this.request(`/api/admin/email/audit/ledger?limit=${limit}`);
  }

  public async getOperationsMonitoring(): Promise<{ monitoring: any }> {
    return this.request('/api/admin/operations/monitoring');
  }

  public async runWorkerCycle(maxJobs = 10): Promise<{ cycle: any }> {
    return this.request('/api/admin/operations/worker-cycle', {
      method: 'POST',
      body: JSON.stringify({ maxJobs }),
    });
  }

  public async createPersistentDraft(payload: {
    mailboxId: string;
    to: string[];
    cc?: string[];
    subject: string;
    bodyText: string;
    isAiGenerated?: boolean;
    isSafeguarded?: boolean;
  }): Promise<{ success: boolean; draft?: any; error?: string }> {
    return this.request('/api/admin/email/drafts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async discoverEmailProvider(emailAddress: string): Promise<{ success: boolean; discovery?: any; error?: string }> {
    return this.request('/api/admin/email/connectors/discover', {
      method: 'POST',
      body: JSON.stringify({ emailAddress }),
    });
  }

  public async dryRunDemoEmailCleanup(): Promise<{ success: boolean; report: any }> {
    return this.request('/api/admin/email/demo-cleanup/dry-run', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  public async executeDemoEmailCleanup(payload: {
    approvalToken: string;
    adminApproved: boolean;
  }): Promise<{
    success: boolean;
    deletedCount: number;
    uncertainPreservedCount: number;
    genuinePreservedCount: number;
    backupFilePath: string;
    auditLedgerId: string;
    auditLedgerHash: string;
  }> {
    return this.request('/api/admin/email/demo-cleanup/execute', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const phumulaniApiClient = new PhumulaniApiClient();

