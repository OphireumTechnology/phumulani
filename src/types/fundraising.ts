/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Enterprise Fundraising, Donor Intelligence & AI Communications
 * Master Directive Types conforming to Section 01 through Section 26
 */

export type DonorContactType =
  | 'INDIVIDUAL'
  | 'CORPORATE'
  | 'INSTITUTIONAL_FOUNDATION'
  | 'GOVERNMENT'
  | 'INTERNATIONAL';

export type DonorCategory =
  // Individual
  | 'INDIVIDUAL_ONE_TIME'
  | 'INDIVIDUAL_RECURRING'
  | 'INDIVIDUAL_MAJOR'
  | 'INDIVIDUAL_COMMUNITY'
  | 'INDIVIDUAL_LEGACY'
  // Corporate
  | 'CORP_DONATION'
  | 'CORP_CSR_PARTNERSHIP'
  | 'CORP_SPONSORSHIP'
  | 'CORP_EMPLOYEE_GIVING'
  | 'CORP_MATCHING_GIFTS'
  // Institutional & Grants
  | 'INST_PRIVATE_FOUNDATION'
  | 'INST_FAMILY_FOUNDATION'
  | 'INST_COMMUNITY_FOUNDATION'
  | 'INST_GOVERNMENT_AGENCY'
  | 'INST_GRANTMAKING'
  | 'INST_INTERNATIONAL_NGO'
  | 'INST_UNIVERSITY'
  | 'INST_PROFESSIONAL_ASSOC';

export type RelationshipStage =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'ENGAGED'
  | 'CULTIVATION'
  | 'SOLICITATION'
  | 'STEWARDSHIP'
  | 'LAPSED'
  | 'RE_ENGAGED';

export interface CommunicationConsent {
  status: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  consentEvidence: string;
  consentDate: string;
  channelEmail: boolean;
  channelPhone: boolean;
  channelPostal: boolean;
  suppressionReason?: string;
  canSpamCompliant: boolean;
}

export interface DonorContact {
  id: string;
  contactType: DonorContactType;
  category: DonorCategory;
  name: string;
  organizationName?: string;
  primaryContactPerson?: string;
  title?: string;
  email: string;
  phone?: string;
  website?: string;
  country: string;
  state: string;
  city: string;
  mailingAddress?: string;
  relationshipOwner: string;
  stage: RelationshipStage;
  consent: CommunicationConsent;
  contactSource: 'EXISTING_DB' | 'CSV_IMPORT' | 'XLSX_IMPORT' | 'DIRECT_DONATION' | 'WEBSITE_CONTACT' | 'MANUAL';
  lifetimeGiving: number;
  largestGift: number;
  lastGiftDate?: string;
  giftCount: number;
  programInterests: string[];
  campaignParticipation: string[];
  lastEngagementDate?: string;
  nextFollowUpDate?: string;
  internalNotes?: string;
  givingTier: 'COMMUNITY' | 'SUPPORTER' | 'BENEFACTOR' | 'PATRON' | 'VISIONARY' | 'LEGACY';
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStatus =
  | 'IDENTIFIED'
  | 'UNDER_REVIEW'
  | 'QUALIFIED'
  | 'CONTACT_APPROVED'
  | 'CONTACTED'
  | 'ENGAGED'
  | 'PROPOSAL_PREPARATION'
  | 'PROPOSAL_SUBMITTED'
  | 'DECISION_PENDING'
  | 'COMMITTED'
  | 'AWARDED'
  | 'FUNDED'
  | 'DECLINED'
  | 'CLOSED';

export interface FundingOpportunity {
  id: string;
  title: string;
  donorId: string;
  donorName: string;
  contactType: DonorContactType;
  category: DonorCategory;
  targetAmount: number;
  expectedAmount: number;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  status: OpportunityStatus;
  programId: string;
  programName: string;
  aiMatchScore: number; // 0 to 100
  aiMatchRationale: string;
  supportingEvidenceUrl?: string;
  assignedOwner: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignLifecycleStatus =
  | 'DRAFT'
  | 'PROGRAM_REVIEW'
  | 'BUDGET_REVIEW'
  | 'MANAGEMENT_APPROVAL'
  | 'AUDIENCE_VALIDATION'
  | 'COMMUNICATION_APPROVAL'
  | 'ACTIVE'
  | 'MONITORING'
  | 'CLOSED'
  | 'RECONCILED'
  | 'IMPACT_REPORTED';

export interface FundraisingCampaign {
  id: string;
  title: string;
  programCategory: string;
  description: string;
  approvedObjectives: string[];
  fundingTarget: number;
  approvedBudget: number;
  startDate: string;
  endDate: string;
  manager: string;
  eligibleAudienceCount: number;
  status: CampaignLifecycleStatus;
  fundsRaisedVerified: number;
  fundingGap: number;
  reportingRequirements: string[];
  targetAudiences: string[];
  paymentDestination: string;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationType =
  | 'PROGRAM_INTRO'
  | 'DONOR_REENGAGEMENT'
  | 'MONTHLY_GIVING_INVITE'
  | 'CORP_CSR_PROPOSAL'
  | 'SPONSORSHIP_INVITE'
  | 'FOUNDATION_INTRO'
  | 'GRANT_INQUIRY'
  | 'GRANT_FOLLOWUP'
  | 'EVENT_INVITATION'
  | 'DONATION_ACKNOWLEDGMENT'
  | 'CAMPAIGN_PROGRESS'
  | 'IMPACT_REPORT'
  | 'PARTNERSHIP_MEETING'
  | 'MATCHING_GIFT_INFO'
  | 'VOLUNTEER_FUNDRAISING'
  | 'DONOR_RENEWAL';

export type ApprovalStatus =
  | 'DRAFT'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'AUTHORIZED_FOR_EXECUTION'
  | 'EXECUTED'
  | 'AUDITED';

export interface OutreachMessageDraft {
  id: string;
  campaignId?: string;
  donorId: string;
  recipientEmail: string;
  recipientName: string;
  communicationType: CommunicationType;
  toneStyle: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  approvalStatus: ApprovalStatus;
  aiAgentId: string;
  aiRationale: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  changeNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  deliveryStatus?: 'PENDING' | 'SENT' | 'DELIVERED' | 'BOUNCED' | 'FAILED';
  deliveryProviderMsgId?: string;
}

export type FundingRestriction =
  | 'UNRESTRICTED'
  | 'RESTRICTED_PROGRAM'
  | 'RESTRICTED_TIMEFRAME'
  | 'RESTRICTED_CAPITAL'
  | 'ENDOWMENT';

export interface VerifiedContribution {
  id: string;
  donorId: string;
  donorName: string;
  category: DonorCategory;
  amount: number;
  currency: string;
  receivedAt: string;
  paymentMethod: 'STRIPE' | 'ACH_TRANSFER' | 'CHECK' | 'WIRE' | 'STOCK_TRANSFER' | 'IN_KIND';
  transactionRef: string;
  isVerified: boolean;
  verifiedBy: string;
  verifiedAt: string;
  programAllocationId: string;
  programName: string;
  restrictionType: FundingRestriction;
  restrictionNotes: string;
  taxReceiptIssued: boolean;
  receiptNumber: string;
}

export type EngagementActivityType =
  | 'OUTBOUND_EMAIL'
  | 'INBOUND_REPLY'
  | 'MEETING'
  | 'PHONE_CALL'
  | 'PROPOSAL'
  | 'PLEDGE_COMMITMENT'
  | 'STIPULATION'
  | 'SITE_VISIT';

export interface DonorEngagementActivity {
  id: string;
  donorId: string;
  donorName: string;
  opportunityId?: string;
  activityType: EngagementActivityType;
  title: string;
  summary: string;
  sourceEmailThreadId?: string;
  sourceProviderMsgId?: string;
  staffActor: string;
  timestamp: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  metadata?: Record<string, any>;
}

export interface ProgramFundingRecord {
  programId: string;
  programName: string;
  category: string;
  manager: string;
  approvedBudget: number;
  fundingTarget: number;
  verifiedDonations: number;
  verifiedGrants: number;
  sponsorshipContributions: number;
  allocatedFunding: number;
  remainingGap: number;
  restrictionsNotes: string;
  status: 'ACTIVE' | 'PLANNING' | 'FULLY_FUNDED' | 'SUSPENDED';
}

export interface GrantRecord {
  id: string;
  grantmakerName: string;
  grantmakerType: 'PRIVATE_FOUNDATION' | 'FAMILY_FOUNDATION' | 'COMMUNITY_FOUNDATION' | 'GOVERNMENT_AGENCY' | 'INTERNATIONAL_NGO';
  programId: string;
  programName: string;
  amountRequested: number;
  amountAwarded: number;
  submissionDeadline: string;
  reportingDeadline?: string;
  stage: OpportunityStatus;
  requiredDocuments: string[];
  proposalSummary: string;
  internalReviewer: string;
  executiveApprover?: string;
  status: 'ACTIVE' | 'SUBMITTED' | 'AWARDED' | 'DECLINED' | 'CLOSED';
}

export interface CorporatePartnershipRecord {
  id: string;
  companyName: string;
  partnershipType: 'CSR' | 'SPONSORSHIP' | 'MATCHING_GIFTS' | 'IN_KIND';
  proposedContribution: number;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'COMMUNITY';
  contactPerson: string;
  contactEmail: string;
  status: OpportunityStatus;
  renewalDate?: string;
  benefitsPackage: string[];
  verifiedContributionReceived: number;
}

export interface DonorImportJob {
  id: string;
  fileName: string;
  fileFormat: 'CSV' | 'XLSX' | 'JSON';
  importedAt: string;
  importedBy: string;
  totalRecords: number;
  validRecords: number;
  duplicatesCount: number;
  errorsCount: number;
  status: 'PREVIEW' | 'APPROVED' | 'COMPLETED' | 'ROLLED_BACK';
  previewRecords: Partial<DonorContact>[];
  rollbackPossible: boolean;
}

export type ProductionReadinessStatus =
  | 'NOT CONFIGURED'
  | 'IN DEVELOPMENT'
  | 'IMPLEMENTED — UNVERIFIED'
  | 'TESTED'
  | 'CONNECTED'
  | 'PRODUCTION VERIFIED'
  | 'DEGRADED'
  | 'BLOCKED'
  | 'FAILED';

export interface ProductionReadinessItem {
  id: string;
  component: string;
  section: string;
  implementationStatus: ProductionReadinessStatus;
  integrationStatus: string;
  lastVerification: string;
  actualEvidence: string;
  responsibleOwner: string;
  requiredApproval: string;
  isProductionReady: boolean;
  verificationMethod?: string;
  errorDetails?: string;
  recoveryRecommendation?: string;
  responsibleAdministrator?: string;
  lastIncident?: string;
  relevantLogs?: string;
}

export interface ControlledPilotMetrics {
  campaignId: string;
  campaignTitle: string;
  programName: string;
  authorizedRecipientsCount: number;
  acceptedSendsCount: number;
  providerDeliveryOutcomes: '100% SMTP Delivered' | 'Partial' | 'Pending';
  bounceRate: number; // e.g. 0%
  spamComplaints: number; // 0
  unsubscribeRequests: number; // 0
  responsesReceived: number; // e.g. 3
  qualifiedDonorInquiries: number; // e.g. 2
  followUpCompletionRate: number; // 100%
  verifiedDonationsAmount: number; // e.g. $15,000
  campaignExpenses: number; // e.g. $250
  executionTimestamp: string;
  executedBy: string;
  auditLogId: string;
  simulatedStatus: 'COMPLETED' | 'SIMULATION_READY' | 'HALTED';
}

export interface FinancialReconciliationDetails {
  calculatedGapTotal: number;
  reportedGapKPI: number;
  discrepancyAmount: number;
  rootCause: string;
  authoritativeSource: string;
  actionTaken: string;
  reconciledAt: string;
  reconciledBy: string;
  programBreakdown: {
    programId: string;
    programName: string;
    approvedBudget: number;
    fundingTarget: number;
    verifiedReceipts: number;
    allocatedFunding: number;
    remainingGap: number;
  }[];
}


export type AgentExecutionState =
  | 'IDLE'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_FOR_DATA'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export interface FundraisingAgentTask {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  status: AgentExecutionState;
  inputPayload: Record<string, any>;
  outputResult?: string;
  structuredOutput?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  requiresHumanApproval: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  errorMessage?: string;
  auditLogId?: string;
  modelUsed?: 'gemini-2.5-flash' | 'deterministic_offline_fallback' | string;
}

export interface FundraisingAIAgent {
  id: string; // 'FUND-AI-001' ... 'FUND-AI-018'
  code: string; // 'AGENT 01' ... 'AGENT 18'
  name: string;
  role: string;
  category:
    | 'ORCHESTRATION'
    | 'INTELLIGENCE'
    | 'RESEARCH'
    | 'OUTREACH'
    | 'GRANTS'
    | 'PARTNERSHIPS'
    | 'STEWARDSHIP'
    | 'FINANCE'
    | 'SECURITY';
  description: string;
  status: AgentExecutionState;
  assignedTools: string[];
  restrictedTools: string[];
  requiresHumanApproval: boolean;
  escalationOfficer: string;
  recentTasks: FundraisingAgentTask[];
  completedTasksCount: number;
  failedTasksCount: number;
  pendingApprovalsCount: number;
  lastActiveAt: string;
  confidenceScore: number;
  inputSchemaSummary: string;
  outputSchemaSummary: string;
}

export type FundraisingSubRoute =
  | 'command-center'
  | 'donors'
  | 'individuals'
  | 'major-gifts'
  | 'corporate'
  | 'csr'
  | 'institutions'
  | 'foundations'
  | 'government'
  | 'international'
  | 'grants'
  | 'opportunities'
  | 'campaigns'
  | 'outreach'
  | 'approvals'
  | 'stewardship'
  | 'transactions'
  | 'programs'
  | 'reports'
  | 'analytics'
  | 'compliance'
  | 'settings'
  | 'production-status'
  | 'agents';

