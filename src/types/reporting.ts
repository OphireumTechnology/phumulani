/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Client-Safe Operational Reporting Types
 */

export type ReportingPeriod =
  | 'TODAY'
  | 'LAST_7_DAYS'
  | 'CURRENT_MONTH'
  | 'PREVIOUS_MONTH'
  | 'CURRENT_QUARTER'
  | 'PREVIOUS_QUARTER'
  | 'CURRENT_YEAR'
  | 'CUSTOM';

export type ReportingCategory =
  | 'STAFF_OPERATIONAL'
  | 'CASEWORKER_PERFORMANCE'
  | 'PROGRAM_PERFORMANCE'
  | 'VOLUNTEER_PERFORMANCE'
  | 'FUNDRAISING_PERFORMANCE'
  | 'FIVE_PIPELINES'
  | 'EXECUTIVE_DASHBOARD'
  | 'BOARD_GOVERNANCE'
  | 'AI_GOVERNANCE'
  | 'SAFEGUARDING_OVERSIGHT';

export type ReportApprovalState =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export interface DateRangeFilter {
  period: ReportingPeriod;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  programId?: string;
  caseworkerId?: string;
  priority?: string;
}

export interface FinancialClassificationSummary {
  pledgedAmount: number;
  internallyRecordedAmount: number;
  externallyVerifiedAmount: number;
  pendingGrantAmount: number;
  unreconciledVariancesCount: number;
  accountingIntegrityNotice: string;
}

export interface StaffOperationsMetrics {
  totalActiveMembers: number;
  newMemberRegistrations: number;
  openServiceRequests: number;
  serviceRequestsAwaitingReview: number;
  assignedServiceRequests: number;
  requestsInProgress: number;
  resolvedServiceRequests: number;
  closedServiceRequests: number;
  overdueServiceRequests: number;
  activeCaseworkerAssignments: number;
  programApplications: number;
  confirmedEnrollments: number;
  waitlistedMembers: number;
  programCapacityUtilizationPct: number;
  volunteerApplications: number;
  volunteersAwaitingClearance: number;
  activeClearedVolunteers: number;
  upcomingShifts: number;
  pendingServiceHourSubmissions: number;
  verifiedVolunteerHours: number;
}

export interface CaseworkerWorkloadMetrics {
  totalCases: number;
  assignedCases: number;
  openCases: number;
  underReviewCases: number;
  inProgressCases: number;
  resolvedCases: number;
  closedCases: number;
  overdueCases: number;
  averageResolutionDurationHours: number;
  pendingFollowUps: number;
  caseworkerDistribution: {
    caseworkerId: string;
    caseworkerName: string;
    activeCount: number;
    resolvedCount: number;
    overdueCount: number;
  }[];
}

export interface ProgramPerformanceMetrics {
  totalPrograms: number;
  activePrograms: number;
  totalCapacity: number;
  confirmedEnrollments: number;
  availablePlaces: number;
  waitlistedApplicants: number;
  withdrawalsCount: number;
  completedParticipationCount: number;
  aggregateCapacityUtilizationPct: number;
  programBreakdown: {
    id: string;
    name: string;
    category: string;
    capacity: number;
    confirmed: number;
    available: number;
    waitlisted: number;
    utilizationPct: number;
  }[];
}

export interface VolunteerPerformanceMetrics {
  totalApplications: number;
  underReviewCount: number;
  awaitingTrainingCount: number;
  awaitingClearanceCount: number;
  clearedVolunteersCount: number;
  restrictedVolunteersCount: number;
  revokedClearanceCount: number;
  activeAssignmentsCount: number;
  completedShiftsCount: number;
  pendingAttendanceCount: number;
  submittedHoursTotal: number;
  approvedHoursTotal: number;
  rejectedHoursTotal: number;
  officialVerifiedVolunteerHours: number;
}

export interface FivePipelineMetrics {
  grantsPipeline: {
    totalRecords: number;
    activeRecords: number;
    pendingReview: number;
    approvedActions: number;
    rejectedActions: number;
    overdueActions: number;
    humanApprovalRequired: boolean;
    financialClassification: 'PENDING_GRANT_AMOUNT';
    potentialAmount: number;
  };
  majorDonorsPipeline: {
    totalRecords: number;
    activeRecords: number;
    pendingReview: number;
    approvedActions: number;
    rejectedActions: number;
    overdueActions: number;
    humanApprovalRequired: boolean;
    financialClassification: 'PLEDGED_AMOUNT';
    forecastAmount: number;
  };
  csrPipeline: {
    totalRecords: number;
    activeRecords: number;
    pendingReview: number;
    approvedActions: number;
    rejectedActions: number;
    overdueActions: number;
    humanApprovalRequired: boolean;
    financialClassification: 'PLEDGED_AMOUNT';
    committedAmount: number;
  };
  capitalCampaignPipeline: {
    totalRecords: number;
    activeRecords: number;
    pendingReview: number;
    approvedActions: number;
    rejectedActions: number;
    overdueActions: number;
    humanApprovalRequired: boolean;
    financialClassification: 'INTERNALLY_RECORDED_AMOUNT';
    targetAmount: number;
    committedAmount: number;
  };
  reconciliationPipeline: {
    totalRecords: number;
    activeRecords: number;
    pendingReview: number;
    approvedActions: number;
    rejectedActions: number;
    overdueActions: number;
    humanApprovalRequired: boolean;
    financialClassification: 'EXTERNALLY_VERIFIED_AMOUNT';
    reconciledAmount: number;
    exceptionsCount: number;
  };
}

export interface ExecutiveDashboardReport {
  reportingPeriod: ReportingPeriod;
  generatedAt: string;
  dataFreshnessTimestamp: string;
  sourceRecordCounts: {
    members: number;
    serviceRequests: number;
    programs: number;
    enrollments: number;
    volunteers: number;
    volunteerHours: number;
    grants: number;
    donations: number;
    aiAgents: number;
  };
  communityEngagementScore: number;
  serviceDeliveryRatePct: number;
  caseworkerOperationalEfficiencyPct: number;
  programEnrollmentSaturationPct: number;
  volunteerContributionHours: number;
  financialSummary: FinancialClassificationSummary;
  fivePipelines: FivePipelineMetrics;
  operationalRiskSummary: {
    totalRisks: number;
    highSeverityRisks: number;
    mitigatedRisks: number;
  };
  safeguardingOversight: {
    crisisQuarantineFirewallActive: boolean;
    quarantinedIncidentsCount: number;
    zeroSurvivorPIIExposed: boolean;
    complianceBenchmark: string;
  };
  aiGovernance: {
    totalAgents: number;
    organizationalAgents: number;
    fundraisingAgents: number;
    activeCount: number;
    pausedCount: number;
    operatingMode: string;
    pendingHumanApprovalsCount: number;
    autonomousApprovalCount: number;
  };
  dataQualityWarnings: string[];
  trendComparisons: {
    comparableDataAvailable: boolean;
    serviceRequestTrendPct: string;
    enrollmentTrendPct: string;
    volunteerHourTrendPct: string;
  };
}

export interface BoardGovernanceReport {
  reportingPeriod: ReportingPeriod;
  generatedAt: string;
  approvalState: ReportApprovalState;
  governanceDisclaimer: string;
  organizationalPerformanceSummary: string;
  programOutcomesSummary: {
    totalServedEstimated: number;
    activeProgramsCount: number;
    averageSaturationPct: number;
  };
  serviceDeliveryTrends: {
    totalRequestsReceived: number;
    resolutionRatePct: number;
    activeReferralsCount: number;
  };
  volunteerContributionSummary: {
    activeClearedVolunteers: number;
    officialVerifiedHours: number;
    economicValueEstimated: number;
  };
  fundraisingAndGrantSummary: {
    pledgedTotal: number;
    internallyRecordedTotal: number;
    externallyVerifiedTotal: number;
    pendingGrantProposalsTotal: number;
  };
  strategicRisks: {
    id: string;
    title: string;
    severity: string;
    mitigationStrategy: string;
  }[];
  safeguardingGovernance: {
    vawaSection1367IsolationEnforced: boolean;
    zeroIdentifiableSurvivorDataExposed: boolean;
    incidentsEscalatedToLead: number;
  };
  aiGovernanceSummary: {
    canonicalAgentsCount: 36;
    humanAuthorityInvariantsPreserved: boolean;
    autonomousLegalOrFinancialActions: 0;
  };
  pendingBoardResolutionsCount: number;
  unresolvedOperationalExceptionsCount: number;
  dataQualityAttestation: string;
}

export interface ReportSnapshotRecord {
  id: string;
  reportType: ReportingCategory;
  period: ReportingPeriod;
  dateRange: { start: string; end: string };
  generatedAt: string;
  generatedByUserId: string;
  generatedByUserRole: string;
  sourceChecksum: string;
  reportDataChecksum: string;
  approvalState: ReportApprovalState;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  data: any;
  confidentialityClassification: 'PUBLIC' | 'RESTRICTED_STAFF' | 'CONFIDENTIAL_EXECUTIVE' | 'GOVERNANCE_BOARD';
  auditReference: string;
}
