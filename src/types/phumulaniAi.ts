/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 65 Local LLM & Autonomous Fundraising Agent Types
 */

export type LocalInferenceBackend = 'ollama' | 'vllm' | 'lmstudio' | 'gemini_fallback';

export interface LocalInferenceConfig {
  backend: LocalInferenceBackend;
  endpoint: string;
  modelId: string;
  timeoutMs: number;
  maxTokens: number;
  temperature: number;
  systemPromptVersion: string;
  fallbackToCloud: boolean;
  sensitiveRedactionEnabled: boolean;
}

export interface ModelHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  modelId: string;
  backend: LocalInferenceBackend;
  endpoint: string;
  latencyMs: number;
  version?: string;
  ramUsageEstimateMb?: number;
  contextWindow?: number;
  isQuantized: boolean;
  quantizationType?: string;
  lastChecked: string;
  details: string;
  canonicalSystemPrompt?: string;
  metrics?: GatewayInferenceMetrics;
}

export type ProspectType =
  | 'individual'
  | 'foundation'
  | 'corporate_csr'
  | 'sponsor'
  | 'institutional_grantmaker'
  | 'renewal';

export type ProspectEngagementStatus =
  | 'uncontacted'
  | 'campaign_queued'
  | 'solicited'
  | 'replied'
  | 'qualified'
  | 'meeting_scheduled'
  | 'proposal_submitted'
  | 'funded'
  | 'declined'
  | 'opted_out';

export interface ProspectProfile {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactTitle?: string;
  prospectType: ProspectType;
  estimatedCapacity: number;
  areasOfInterest: string[];
  geographicFocus: string;
  status: ProspectEngagementStatus;
  matchScore: number;
  matchedProgramId: string;
  matchedProgramName?: string;
  interestScore: number; // 0-100
  optOut: boolean;
  lastContactedAt?: string;
  assignedStaffId: string;
  assignedStaffName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramMatchCriteria {
  interestFit: number;      // 0-40 weight
  geographicFit: number;    // 0-20 weight
  budgetAlignment: number;  // 0-20 weight
  historicalFit: number;    // 0-20 weight
}

export interface ProgramMatchResult {
  prospectId: string;
  prospectName: string;
  programId: string;
  programTitle: string;
  matchScore: number; // 0-100
  criteriaScores: ProgramMatchCriteria;
  rationale: string;
  recommendedAsk: number;
  suggestedAngle: string;
  verifiedProgramObjectives: string[];
}

export interface AiCampaign {
  id: string;
  title: string;
  targetProgramId: string;
  programName: string;
  prospectIds: string[];
  prospectCount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled';
  senderMailbox: string;
  scheduledDate: string;
  followUpIntervalDays: number;
  templateSubject: string;
  templateBody: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  createdBy: string;
}

export type EmailPriorityP0P4 = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface EmailClassificationResult {
  priority: EmailPriorityP0P4;
  priorityLabel: string;
  category: string;
  confidence: number;
  reasoning: string;
  isSafeguardingCrisis: boolean;
  isOptOut: boolean;
  hasMeetingSignal: boolean;
  hasFundingSignal: boolean;
  extractedDetails?: {
    suggestedFollowUpDate?: string;
    identifiedGrantName?: string;
    requestedAmount?: number;
    proposedMeetingTimes?: string[];
  };
}

export type InterestTier = 'high' | 'promising' | 'developing' | 'limited' | 'none';

export interface DonorInterestScore {
  prospectId: string;
  prospectEmail: string;
  score: number; // 0-100
  tier: InterestTier;
  tierLabel: string;
  isOptOut: boolean;
  signals: string[];
  breakdown: {
    responsiveness: number;
    sentimentScore: number;
    specificity: number;
    meetingWillingness: number;
  };
  disclosureNotice: string; // Non-predictive disclosure statement
  lastAnalyzedAt: string;
}

export interface AiReplyDraft {
  id: string;
  threadId: string;
  incomingEmailId: string;
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  programId: string;
  programName: string;
  suggestedSubject: string;
  suggestedBody: string;
  tone: 'professional' | 'warm' | 'visionary' | 'stewardship';
  programCitations: string[];
  verifiedFactsUsed: string[];
  approvalStatus: 'pending_human_review' | 'approved' | 'rejected' | 'dispatched';
  reviewedBy?: string;
  reviewedAt?: string;
  editedBody?: string;
  createdAt: string;
}

export interface FollowUpItem {
  id: string;
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  programId: string;
  programName: string;
  sequenceStep: number;
  dueDate: string;
  status: 'scheduled' | 'ready_for_review' | 'cancelled_reply_received' | 'halted_opt_out' | 'sent';
  cancellationReason?: string;
  draftSubject?: string;
  draftBody?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface HighInterestLead {
  id: string;
  prospectId: string;
  prospectName: string;
  organization: string;
  contactEmail: string;
  interestScore: number;
  sourceEmailId: string;
  receivedAt: string;
  meetingRequested: boolean;
  assignedRepresentativeId: string;
  assignedRepresentativeName: string;
  assignedStaffEmail?: string;
  assignedStaffName?: string;
  briefingDossier: {
    executiveSummary: string;
    givingCapacityEstimate: number;
    primaryProgramInterest: string;
    conversationHistorySummary: string;
    keyQuestionsToAddress: string[];
    recommendedNextStep: string;
  };
  meetingDraftInvitation: {
    subject: string;
    body: string;
    suggestedDurationsMinutes: number[];
  };
  status: 'new' | 'briefing_reviewed' | 'invitation_sent' | 'meeting_scheduled' | 'closed_won' | 'closed_lost';
}

export interface FundingProposalDraft {
  id: string;
  title: string;
  targetGrantmaker: string;
  programId: string;
  programTitle: string;
  requestedAmount: number;
  durationMonths: number;
  executiveSummary: string;
  problemStatement: string;
  proposedActivities: string[];
  deliverables: string[];
  budgetBreakdown: Array<{ item: string; amount: number; isDirect: boolean }>;
  complianceNotes: string;
  status: 'draft_ai' | 'under_human_review' | 'executive_approved' | 'submitted';
  isDraftWatermarked: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarMeetingSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  staffName: string;
  staffEmail: string;
  isAvailable: boolean;
  reasonIfUnavailable?: string;
}

export interface CalendarMeetingBooking {
  id: string;
  prospectId: string;
  prospectName: string;
  prospectEmail: string;
  staffEmail: string;
  staffName: string;
  provider: 'google' | 'microsoft';
  title: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  status: 'pending_confirmation' | 'confirmed' | 'cancelled';
  calendarEventId?: string;
  meetingLink?: string;
  confirmationAuditToken?: string;
  createdAt: string;
}

export type AutonomyLevel = 1 | 2 | 3 | 4;

export interface AutonomousPolicyConfig {
  autonomyLevel: AutonomyLevel;
  autonomyLevelLabel: string;
  allowAutonomousClassification: boolean;
  allowAutonomousDrafting: boolean;
  allowAutonomousFollowUpRecommendations: boolean;
  allowUnattendedSending: false; // STRICT FAIL-CLOSED INVARIANT
  requireHumanCampaignApproval: true;
  requireProposalDirectorApproval: true;
  maxDailyDrafts: number;
  rateLimitPerHour: number;
}

export interface GatewayInferenceMetrics {
  totalRequests: number;
  successfulRequests: number;
  fallbackRequests: number;
  promptInjectionBlocks: number;
  averageLatencyMs: number;
  lastLatencyMs: number;
  lastActiveBackend: string;
  uptimeSeconds: number;
}
