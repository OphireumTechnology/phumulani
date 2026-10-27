/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Funding Command Center Types
 * Master Types for Grants, Fundraising, Donor CRM, Restricted Funds & Funder Reporting
 */

export type GrantLifecycleStatus =
  | 'DISCOVERED'
  | 'SCREENING'
  | 'QUALIFIED'
  | 'GO_NO_GO_REVIEW'
  | 'APPROVED_TO_PURSUE'
  | 'IN_DEVELOPMENT'
  | 'SUBMITTED'
  | 'AWARDED'
  | 'DECLINED'
  | 'NOT_PURSUED'
  | 'EXPIRED'
  | 'CLOSED';

export type FundingType =
  | 'FEDERAL'
  | 'STATE'
  | 'FOUNDATION'
  | 'CORPORATE'
  | 'COMMUNITY'
  | 'FAITH_BASED';

export type EligibilityVerdict =
  | 'ELIGIBLE'
  | 'POTENTIALLY_ELIGIBLE'
  | 'INELIGIBLE'
  | 'REQUIRES_HUMAN_REVIEW';

export type GoNoGoDecision =
  | 'GO'
  | 'NO_GO'
  | 'HOLD'
  | 'NEEDS_INFORMATION';

export type FunderReportType =
  | 'INTERIM_PROGRESS'
  | 'FINAL_CLOSEOUT'
  | 'FINANCIAL_EXPENDITURE'
  | 'NARRATIVE_IMPACT'
  | 'ANNUAL_COMPLIANCE';

export type FunderReportStatus =
  | 'UPCOMING'
  | 'DRAFTING'
  | 'INTERNAL_REVIEW'
  | 'EXECUTIVE_CERTIFIED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'OVERDUE';

export type PipelineStage =
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'CULTIVATION'
  | 'SOLICITATION'
  | 'NEGOTIATION'
  | 'STEWARDSHIP'
  | 'WON'
  | 'LOST'
  | 'STALLED';

export type RestrictionType =
  | 'PROGRAM_SPECIFIC'
  | 'TIME_RESTRICTED'
  | 'CAPITAL_PROJECT'
  | 'ENDOWMENT'
  | 'UNRESTRICTED';

export type DonationStatus =
  | 'PLEDGED'
  | 'RECEIVED'
  | 'RECONCILED'
  | 'RESTRICTED'
  | 'FLAGGED_FRAUD';

export type DonorCategoryType =
  | 'INDIVIDUAL'
  | 'MAJOR_DONOR'
  | 'CORPORATE'
  | 'PRIVATE_FOUNDATION'
  | 'GOVERNMENT'
  | 'FAITH_BASED'
  | 'COMMUNITY'
  | 'IN_KIND';

// ============================================================================
// M26.02: Grant Opportunity
// ============================================================================
export interface GrantOpportunity {
  id: string;
  funder: string;
  funderType: FundingType;
  programId: string; // References community program e.g. PROG-001
  opportunityTitle: string;
  fundingType: FundingType;
  fundingRangeMin: number;
  fundingRangeMax: number;
  applicationDeadline: string; // ISO date
  eligibilitySummary: string;
  geographicRequirements: string;
  targetPopulation: string;
  requiredDocuments: string[];
  matchingRequirements: {
    required: boolean;
    percentage: number;
    cashRequired: boolean;
    inKindAllowed: boolean;
  };
  reportingObligations: string;
  restrictions: string;
  sourceUrl: string;
  discoverySource: string;
  assignedOwner: string;
  status: GrantLifecycleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.03: Grant Eligibility Criteria & Assessment
// ============================================================================
export interface EligibilityCriterionResult {
  criterion: string;
  passed: boolean;
  evidence: string;
  requiresReview: boolean;
}

export interface GrantEligibilityAssessment {
  opportunityId: string;
  verdict: EligibilityVerdict;
  assessedAt: string;
  assessedBy: string;
  isAiAssisted: boolean;
  requiresHumanReview: boolean;
  criteria: {
    nonprofitStatus501c3: EligibilityCriterionResult;
    geographyAlignment: EligibilityCriterionResult;
    programCompatibility: EligibilityCriterionResult;
    targetPopulationMatch: EligibilityCriterionResult;
    organizationalCapacity: EligibilityCriterionResult;
    fundingRestrictionsAcceptable: EligibilityCriterionResult;
    reportingBurdenManageable: EligibilityCriterionResult;
    deadlineFeasible: EligibilityCriterionResult;
    matchingFundsAvailable: EligibilityCriterionResult;
  };
  humanVerificationNotes?: string;
  finalHumanApprovalSignOff?: {
    approvedBy: string;
    approvedAt: string;
    decisionNotes: string;
  };
}

// ============================================================================
// M26.04: Go / No-Go Decision Gate
// ============================================================================
export interface GoNoGoReviewRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  funder: string;
  fundingPotentialAmount: number;
  programAlignmentScore: number; // 1-100
  estimatedWorkloadHours: number;
  reportingBurden: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  strategicRisks: string[];
  aiRecommendation: GoNoGoDecision;
  finalDecision: GoNoGoDecision;
  decisionMaker: string; // Must be Executive Director or authorized leadership
  decisionTimestamp: string;
  justification: string;
  materialCommitmentRequiresEd: boolean;
  edSignatureVerified: boolean;
}

// ============================================================================
// M26.05: Grant Development Workspace & Narrative
// ============================================================================
export interface GrantProposalSection {
  title: string;
  content: string;
  wordCount: number;
  lastEditedBy: string;
  lastEditedAt: string;
  isLocked: boolean;
}

export interface GrantProposalRecord {
  id: string;
  opportunityId: string;
  proposalTitle: string;
  version: number;
  sections: {
    executiveSummary: GrantProposalSection;
    organizationalBackground: GrantProposalSection;
    statementOfNeed: GrantProposalSection;
    programDescription: GrantProposalSection;
    goalsAndObjectives: GrantProposalSection;
    activitiesAndTimeline: GrantProposalSection;
    targetPopulation: GrantProposalSection;
    keyPersonnel: GrantProposalSection;
    evaluationPlan: GrantProposalSection;
    budgetNarrative: GrantProposalSection;
    sustainabilityPlan: GrantProposalSection;
  };
  executiveSignOff?: {
    signedBy: string;
    signedAt: string;
    role: string;
  };
  status: 'DRAFTING' | 'INTERNAL_REVIEW' | 'EXECUTIVE_APPROVED' | 'READY_TO_SUBMIT' | 'SUBMITTED';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.07: Grant Budget Builder
// ============================================================================
export interface BudgetLineItem {
  id: string;
  category: 'PERSONNEL' | 'FRINGE' | 'TRAVEL' | 'EQUIPMENT' | 'SUPPLIES' | 'CONTRACTUAL' | 'OTHER_DIRECT' | 'INDIRECT';
  description: string;
  directCost: number;
  cashMatch: number;
  inKindMatch: number;
  isUnallowableExpense: boolean;
  justification: string;
}

export interface GrantBudgetSheet {
  opportunityId: string;
  indirectRatePercentage: number; // typically 10% de minimis or negotiated
  lineItems: BudgetLineItem[];
  totals: {
    totalPersonnel: number;
    totalFringe: number;
    totalTravel: number;
    totalEquipment: number;
    totalSupplies: number;
    totalContractual: number;
    totalOtherDirect: number;
    totalDirectCost: number;
    totalIndirectCost: number;
    totalGrantRequested: number;
    totalCashMatch: number;
    totalInKindMatch: number;
    grandTotalProjectBudget: number;
  };
  unallowableCostsDetected: string[];
  isBalancedAndVerified: boolean;
}

// ============================================================================
// M26.08: Grant Submission Compliance Gate
// ============================================================================
export interface SubmissionComplianceChecklist {
  opportunityId: string;
  eligibilityVerified: boolean;
  boardAuthorizationDocumented: boolean;
  budgetReconciledAndApproved: boolean;
  nonDiscriminationAssuranceSigned: boolean;
  samGovRegistrationActive: boolean;
  executiveDirectorSignatureVerified: boolean;
  executiveSignerName: string;
  allRequiredAttachmentsUploaded: boolean;
  readyForSubmission: boolean;
  submissionConfirmationRef?: string;
  submissionTimestamp?: string;
  submittedBy?: string;
}

// ============================================================================
// M26.09: Restricted Funds & Program Allocation Control
// ============================================================================
export interface RestrictedFundRecord {
  id: string;
  sourceFunderOrDonor: string;
  grantOrDonationRefId: string;
  allocatedProgramId: string; // e.g. PROG-001
  allocatedProgramName: string;
  restrictionType: RestrictionType;
  restrictionTerms: string;
  awardOrReceivedDate: string;
  expirationDate: string;
  totalRestrictedAmount: number;
  allocatedAmount: number;
  expendedAmount: number;
  remainingBalance: number;
  unallowableExpenses: string[];
  spendDownStatus: 'ON_TRACK' | 'ACCELERATED' | 'SLOW' | 'OVERALLOCATED' | 'EXPIRED';
  isComminglingProhibited: boolean;
  auditVerified: boolean;
}

// ============================================================================
// M26.10: Unified Donor CRM
// ============================================================================
export interface UnifiedDonorProfile {
  id: string;
  name: string;
  organizationName?: string;
  contactPerson?: string;
  category: DonorCategoryType;
  email: string;
  phone?: string;
  city: string;
  state: string;
  country: string;
  relationshipOwner: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'CULTIVATION' | 'SOLICITATION' | 'STEWARDSHIP' | 'LAPSED';
  lifetimeGiving: number;
  largestGift: number;
  lastGiftDate?: string;
  giftCount: number;
  givingTier: 'COMMUNITY' | 'SUPPORTER' | 'BENEFACTOR' | 'PATRON' | 'VISIONARY' | 'LEGACY';
  programInterests: string[];
  consentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  vawaSafeguardingCertified: boolean; // Confirms zero survivor case intake overlap
  engagementLogCount: number;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// M26.11: Fundraising Pipeline Management
// ============================================================================
export interface PipelineDeal {
  id: string;
  donorId: string;
  donorName: string;
  dealTitle: string;
  stage: PipelineStage;
  targetAmount: number;
  probabilityPercentage: number;
  weightedForecastValue: number;
  targetProgramId?: string;
  expectedCloseDate: string;
  assignedStaff: string;
  campaignId?: string;
  nextStewardshipStep: string;
  lastActivityDate: string;
  status: 'OPEN' | 'WON' | 'LOST' | 'STALLED';
  notes: string;
}

// ============================================================================
// M26.12: Campaign Management
// ============================================================================
export interface FundraisingCampaignRecord {
  id: string;
  campaignCode: string;
  name: string;
  category: 'ANNUAL_FUND' | 'CAPITAL' | 'EMERGENCY_RELIEF' | 'GIVING_DAY' | 'PROGRAM_SPECIFIC' | 'EVENT';
  targetGoal: number;
  pledgedAmount: number;
  receivedAmount: number;
  reconciledAmount: number;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  channels: ('EMAIL' | 'EVENT' | 'DIRECT_MAIL' | 'ONLINE' | 'MAJOR_GIFTS')[];
  totalExpenses: number;
  roiRatio: number;
  linkedProgramId?: string;
  description: string;
}

// ============================================================================
// M26.13: Donation Reconciliation & Anti-Fraud
// ============================================================================
export interface FinancialReconciliationRecord {
  id: string;
  donationId: string;
  donorName: string;
  amount: number;
  pledgeDate: string;
  receivedDate?: string;
  reconciliationDate?: string;
  status: DonationStatus;
  paymentMethod: 'CHECK' | 'WIRE' | 'CREDIT_CARD' | 'ACH' | 'IN_KIND';
  offlineGiftReceiptNumber?: string;
  depositReferenceNumber?: string;
  isRestricted: boolean;
  restrictedProgramId?: string;
  firstApproverId: string;
  secondApproverId?: string; // Dual approval for amounts > $5,000
  dualApprovalComplete: boolean;
  antiFraudFlags: string[];
  reconciliationAuditNotes: string;
}

// ============================================================================
// M26.14: Donor Stewardship & Staged Acknowledgments
// ============================================================================
export interface DonorStewardshipAction {
  id: string;
  donorId: string;
  donorName: string;
  actionType: 'TAX_ACKNOWLEDGMENT' | 'THANK_YOU_LETTER' | 'IMPACT_UPDATE' | 'STEWARDSHIP_CALL' | 'ANNUAL_REPORT';
  taxYear: number;
  giftAmount: number;
  giftDate: string;
  status: 'DRAFTED' | 'STAGED_AUTHORIZATION_REQUIRED' | 'SENT' | 'COMPLETED';
  letterText: string;
  disclaimerVerified: boolean; // IRS 501(c)(3) "no goods or services provided"
  stagedEmailQueueRef?: string;
  notes: string;
}

// ============================================================================
// M26.15: Funder Reporting & Compliance
// ============================================================================
export interface FunderReportRecord {
  id: string;
  grantOpportunityId: string;
  funderName: string;
  opportunityTitle: string;
  reportType: FunderReportType;
  dueDate: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: FunderReportStatus;
  assignedWriter: string;
  executiveCertifierId?: string;
  executiveCertificationTimestamp?: string;
  deliverablesChecklist: {
    item: string;
    completed: boolean;
    evidenceRef?: string;
  }[];
  actualProgramImpactCited: {
    programId: string;
    programName: string;
    metricsCited: string;
  };
  submissionReceiptRef?: string;
  submissionTimestamp?: string;
  notes: string;
}

// ============================================================================
// Funding Command Center Master Overview Summary
// ============================================================================
export interface FundingCommandCenterSummary {
  activeGrantsCount: number;
  grantOpportunitiesCount: number;
  proposalsInDevelopmentCount: number;
  pendingApprovalsCount: number;
  submittedProposalsCount: number;
  awardedGrantsCount: number;
  awardedGrantsTotal: number;
  rejectedOrDeclinedCount: number;
  upcomingDeadlinesCount: number;
  activeCampaignsCount: number;
  donorPipelineTotalWeighted: number;
  institutionalFundersCount: number;
  restrictedFundsTotal: number;
  reportingDeadlinesUpcomingCount: number;
  outstandingStewardshipActionsCount: number;
  fundingAllocatedToProgramsTotal: number;
  truthfulDataVerificationNotice: string;
  infrastructureStatus: {
    POSTGRESQL: string;
    GOOGLE_WORKSPACE: string;
    PAYMENT_GATEWAY: string;
    LIVE_EMAIL_SYNCHRONIZATION: string;
  };
}
