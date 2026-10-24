/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Client Storage & Transactional Database Service
 */

import {
  AIAgent,
  AIApprovalTask,
  AuditLogItem,
  BoardResolution,
  Campaign,
  Donation,
  EventItem,
  EventRegistration,
  GrantItem,
  InboxMessage,
  Program,
  RestrictedIntakeItem,
  RiskItem,
  SystemSettingItem,
  User,
  UserRole,
  VolunteerApplication,
  VolunteerHourLog,
  VolunteerOpportunity,
} from '../types';
import {
  INITIAL_AI_AGENTS,
  INITIAL_AI_APPROVALS,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CAMPAIGNS,
  INITIAL_DONATIONS,
  INITIAL_EVENTS,
  INITIAL_GRANTS,
  INITIAL_HOURS,
  INITIAL_MESSAGES,
  INITIAL_OPPORTUNITIES,
  INITIAL_PROGRAMS,
  INITIAL_RESOLUTIONS,
  INITIAL_RESTRICTED_INTAKE,
  INITIAL_RISKS,
  INITIAL_USERS,
} from './seedData';
import {
  ConnectedMailbox,
  AutoResponderRule,
  AutoResponderLog,
  EnterpriseEmailThread,
  DonorProfile,
  MajorDonorPipelineDeal,
  GrantPipelineOpportunity,
  CorporatePartnershipOpportunity,
  FollowUpTask,
  CalendarMeetingProposal,
  EmailClassificationCategory,
  EmailPriorityLevel,
  ResponseToneStyle,
  EmailDraft,
  HistoricalImportJob,
  MailboxSyncCheckpoint,
  EmailConflictRecord,
  SyncAuditLogItem,
  EmailFolder,
} from '../types/emailEnterprise';
import {
  INITIAL_CONNECTED_MAILBOXES,
  INITIAL_AUTORESPONDER_RULES,
  INITIAL_AUTORESPONDER_LOGS,
  INITIAL_ENTERPRISE_THREADS,
  INITIAL_DONOR_PROFILES,
  INITIAL_MAJOR_DONOR_PIPELINE,
  INITIAL_GRANT_PIPELINE,
  INITIAL_CORPORATE_PARTNERSHIPS,
  INITIAL_FOLLOW_UP_TASKS,
  INITIAL_CALENDAR_PROPOSALS,
  INITIAL_HISTORICAL_IMPORT_JOBS,
  INITIAL_MAILBOX_SYNC_CHECKPOINTS,
  INITIAL_SYNC_CONFLICT_RECORDS,
  INITIAL_SYNC_AUDIT_LOGS,
} from './emailEnterpriseSeed';
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
  ProductionReadinessItem,
  ControlledPilotMetrics,
  FinancialReconciliationDetails,
} from '../types/fundraising';
import {
  INITIAL_DONOR_CONTACTS,
  INITIAL_FUNDING_OPPORTUNITIES,
  INITIAL_FUNDRAISING_CAMPAIGNS,
  INITIAL_OUTREACH_DRAFTS,
  INITIAL_VERIFIED_CONTRIBUTIONS,
  INITIAL_PROGRAM_FUNDING_RECORDS,
  INITIAL_GRANT_RECORDS,
  INITIAL_CORPORATE_PARTNERSHIPS as INITIAL_FUNDRAISING_CORPORATE,
  INITIAL_IMPORT_JOBS,
  INITIAL_PRODUCTION_READINESS_ITEMS,
  INITIAL_CONTROLLED_PILOT_METRICS,
  INITIAL_FINANCIAL_RECONCILIATION,
} from './fundraisingSeed';
import {
  DevelopmentMilestone,
  DevelopmentFeature,
  GitHubCommitRecord,
  GitHubPullRequest,
  GitHubWorkflowRun,
  GitHubRepoMetadata,
  LocalSyncReport,
  DevelopmentActivityEvent,
  ClientFeedbackItem,
  ChangeRequestItem,
  ProjectDocumentRecord,
  WeeklyDevelopmentReport,
  MilestoneApprovalRecord,
} from '../types/developmentOps';
import {
  INITIAL_DEVELOPMENT_MILESTONES,
  INITIAL_DEVELOPMENT_FEATURES,
  INITIAL_GITHUB_METADATA,
  INITIAL_GITHUB_COMMITS,
  INITIAL_GITHUB_PULL_REQUESTS,
  INITIAL_GITHUB_WORKFLOW_RUNS,
  INITIAL_LOCAL_SYNC_REPORT,
  INITIAL_DEVELOPMENT_ACTIVITIES,
  INITIAL_CLIENT_FEEDBACK,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_PROJECT_DOCUMENTS,
  INITIAL_WEEKLY_REPORTS,
} from './developmentOpsSeed';
import { DevelopmentOpsService } from './developmentOpsService';

const STORAGE_KEY = 'phumulani_database_v1';

export interface AppDatabaseState {
  currentUser: User;
  users: User[];
  programs: Program[];
  opportunities: VolunteerOpportunity[];
  applications: VolunteerApplication[];
  volunteerHours: VolunteerHourLog[];
  campaigns: Campaign[];
  donations: Donation[];
  events: EventItem[];
  eventRegistrations: EventRegistration[];
  inboxMessages: InboxMessage[];
  aiAgents: AIAgent[];
  aiApprovalTasks: AIApprovalTask[];
  grants: GrantItem[];
  resolutions: BoardResolution[];
  risks: RiskItem[];
  restrictedIntakes: RestrictedIntakeItem[];
  auditLogs: AuditLogItem[];
  safeExitNeutralUrl: string;
  systemSettings: SystemSettingItem[];
  // Phase 8 Playbook: Enterprise Email, Fundraising Intelligence & Executive Communications
  connectedMailboxes: ConnectedMailbox[];
  autoResponderRules: AutoResponderRule[];
  autoResponderLogs: AutoResponderLog[];
  enterpriseEmailThreads: EnterpriseEmailThread[];
  donorProfiles: DonorProfile[];
  majorDonorPipeline: MajorDonorPipelineDeal[];
  grantPipeline: GrantPipelineOpportunity[];
  corporatePartnerships: CorporatePartnershipOpportunity[];
  followUpTasks: FollowUpTask[];
  calendarProposals: CalendarMeetingProposal[];
  // Phase 8 Directive: Enterprise Fundraising, Donor Intelligence & AI Communications
  fundraisingDonors: DonorContact[];
  fundraisingOpportunities: FundingOpportunity[];
  fundraisingCampaigns: FundraisingCampaign[];
  fundraisingOutreachDrafts: OutreachMessageDraft[];
  fundraisingContributions: VerifiedContribution[];
  fundraisingPrograms: ProgramFundingRecord[];
  fundraisingGrants: GrantRecord[];
  fundraisingCorporatePartnerships: CorporatePartnershipRecord[];
  fundraisingImportJobs: DonorImportJob[];
  fundraisingReadinessItems: ProductionReadinessItem[];
  controlledPilotMetrics: ControlledPilotMetrics;
  financialReconciliation: FinancialReconciliationDetails;
  // Phase 12A: Email Synchronization & Unified Mailbox Management
  historicalImportJobs: HistoricalImportJob[];
  syncCheckpoints: MailboxSyncCheckpoint[];
  syncConflicts: EmailConflictRecord[];
  syncAuditLogs: SyncAuditLogItem[];
  // Phase 13: Client Development Transparency, GitHub Integration & Local Synchronization
  developmentMilestones: DevelopmentMilestone[];
  developmentFeatures: DevelopmentFeature[];
  githubMetadata: GitHubRepoMetadata;
  githubCommits: GitHubCommitRecord[];
  githubPullRequests: GitHubPullRequest[];
  githubWorkflowRuns: GitHubWorkflowRun[];
  localSyncReport: LocalSyncReport;
  developmentActivities: DevelopmentActivityEvent[];
  clientFeedbacks: ClientFeedbackItem[];
  changeRequests: ChangeRequestItem[];
  projectDocuments: ProjectDocumentRecord[];
  weeklyReports: WeeklyDevelopmentReport[];
}


export const INITIAL_SYSTEM_SETTINGS: SystemSettingItem[] = [
  {
    key: 'org_name',
    category: 'Organization',
    label: 'Legal Entity Name',
    value: 'Phumulani (501(c)(3) Nonprofit)',
    description: 'Official corporate registration name under Minnesota Nonprofit Statutes Chapter 317A.',
    requiresReauth: false,
    lastModifiedBy: 'Comfort Dondo',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    key: 'safe_exit_destination',
    category: 'Security',
    label: 'Emergency Safe Exit Target URL',
    value: 'https://weather.com',
    description: 'Immediate replacement destination when survivor triggers instant exit in top bar or double-ESC.',
    requiresReauth: true,
    lastModifiedBy: 'Sister Miriam K.',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    key: 'dual_financial_approval_threshold',
    category: 'Finance',
    label: 'Dual Financial Sign-Off Threshold ($)',
    value: 500,
    description: 'Disbursements or refunds exceeding this amount require both Master Admin and Finance Director approvals.',
    requiresReauth: true,
    lastModifiedBy: 'David Mwangi, CPA',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    key: 'ai_safeguarding_gate_strict',
    category: 'AI Workforce',
    label: 'AI Policy Gateway Safeguarding Isolation',
    value: true,
    description: 'Enforces complete autonomous refusal on domestic abuse, trauma disclosures, and financial transfers.',
    requiresReauth: true,
    lastModifiedBy: 'Sister Miriam K.',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    key: 'mfa_enforced_privileged',
    category: 'Security',
    label: 'Enforce MFA on Privileged Accounts',
    value: true,
    description: 'Mandatory phishing-resistant authentication on Master Admin, Executive, Finance, Safeguarding, and Board.',
    requiresReauth: true,
    lastModifiedBy: 'Phumulani Master Administrator',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
  {
    key: 'email_sandbox_mode',
    category: 'Communications',
    label: 'Outbound Communications Safe Hold',
    value: true,
    description: 'Holds all outbound email drafts in pending approval queue before actual SMTP delivery.',
    requiresReauth: false,
    lastModifiedBy: 'Amina Yusuf',
    lastModifiedAt: '2026-01-01T00:00:00Z',
  },
];

function getInitialState(): AppDatabaseState {
  return {
    currentUser: INITIAL_USERS[0], // Default: Phumulani Master Administrator
    users: INITIAL_USERS,
    programs: INITIAL_PROGRAMS,
    opportunities: INITIAL_OPPORTUNITIES,
    applications: INITIAL_APPLICATIONS,
    volunteerHours: INITIAL_HOURS,
    campaigns: INITIAL_CAMPAIGNS,
    donations: INITIAL_DONATIONS,
    events: INITIAL_EVENTS,
    eventRegistrations: [
      {
        id: 'reg-01',
        eventId: 'evt-1',
        eventTitle: 'Immigrant Women Career Pathways Showcase',
        attendeeName: 'Amina Warsame',
        attendeeEmail: 'amina.w@example.com',
        phone: '612-555-1122',
        status: 'confirmed',
        registeredAt: '2026-10-18T10:00:00Z',
      },
    ],
    inboxMessages: INITIAL_MESSAGES,
    aiAgents: INITIAL_AI_AGENTS,
    aiApprovalTasks: INITIAL_AI_APPROVALS,
    grants: INITIAL_GRANTS,
    resolutions: INITIAL_RESOLUTIONS,
    risks: INITIAL_RISKS,
    restrictedIntakes: INITIAL_RESTRICTED_INTAKE,
    auditLogs: INITIAL_AUDIT_LOGS,
    safeExitNeutralUrl: 'https://weather.com',
    systemSettings: INITIAL_SYSTEM_SETTINGS,
    // Phase 8 Enterprise Email Seed Data
    connectedMailboxes: INITIAL_CONNECTED_MAILBOXES,
    autoResponderRules: INITIAL_AUTORESPONDER_RULES,
    autoResponderLogs: INITIAL_AUTORESPONDER_LOGS,
    enterpriseEmailThreads: INITIAL_ENTERPRISE_THREADS,
    donorProfiles: INITIAL_DONOR_PROFILES,
    majorDonorPipeline: INITIAL_MAJOR_DONOR_PIPELINE,
    grantPipeline: INITIAL_GRANT_PIPELINE,
    corporatePartnerships: INITIAL_CORPORATE_PARTNERSHIPS,
    followUpTasks: INITIAL_FOLLOW_UP_TASKS,
    calendarProposals: INITIAL_CALENDAR_PROPOSALS,
    // Phase 8 Directive: Enterprise Fundraising
    fundraisingDonors: INITIAL_DONOR_CONTACTS,
    fundraisingOpportunities: INITIAL_FUNDING_OPPORTUNITIES,
    fundraisingCampaigns: INITIAL_FUNDRAISING_CAMPAIGNS,
    fundraisingOutreachDrafts: INITIAL_OUTREACH_DRAFTS,
    fundraisingContributions: INITIAL_VERIFIED_CONTRIBUTIONS,
    fundraisingPrograms: INITIAL_PROGRAM_FUNDING_RECORDS,
    fundraisingGrants: INITIAL_GRANT_RECORDS,
    fundraisingCorporatePartnerships: INITIAL_FUNDRAISING_CORPORATE,
    fundraisingImportJobs: INITIAL_IMPORT_JOBS,
    fundraisingReadinessItems: INITIAL_PRODUCTION_READINESS_ITEMS,
    controlledPilotMetrics: INITIAL_CONTROLLED_PILOT_METRICS,
    financialReconciliation: INITIAL_FINANCIAL_RECONCILIATION,
    // Phase 12A: Email Synchronization & Unified Mailbox Management
    historicalImportJobs: INITIAL_HISTORICAL_IMPORT_JOBS,
    syncCheckpoints: INITIAL_MAILBOX_SYNC_CHECKPOINTS,
    syncConflicts: INITIAL_SYNC_CONFLICT_RECORDS,
    syncAuditLogs: INITIAL_SYNC_AUDIT_LOGS,
    // Phase 13: Client Development Transparency, GitHub Integration & Local Synchronization
    developmentMilestones: INITIAL_DEVELOPMENT_MILESTONES,
    developmentFeatures: INITIAL_DEVELOPMENT_FEATURES,
    githubMetadata: INITIAL_GITHUB_METADATA,
    githubCommits: INITIAL_GITHUB_COMMITS,
    githubPullRequests: INITIAL_GITHUB_PULL_REQUESTS,
    githubWorkflowRuns: INITIAL_GITHUB_WORKFLOW_RUNS,
    localSyncReport: INITIAL_LOCAL_SYNC_REPORT,
    developmentActivities: INITIAL_DEVELOPMENT_ACTIVITIES,
    clientFeedbacks: INITIAL_CLIENT_FEEDBACK,
    changeRequests: INITIAL_CHANGE_REQUESTS,
    projectDocuments: INITIAL_PROJECT_DOCUMENTS,
    weeklyReports: INITIAL_WEEKLY_REPORTS,
  };
}

class DatabaseService {
  private state: AppDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppDatabaseState {
    const initial = getInitialState();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all required fields exist and fallback to seed if missing in storage
        return {
          ...initial,
          ...parsed,
          connectedMailboxes: parsed.connectedMailboxes?.length ? parsed.connectedMailboxes : initial.connectedMailboxes,
          autoResponderRules: parsed.autoResponderRules?.length ? parsed.autoResponderRules : initial.autoResponderRules,
          autoResponderLogs: parsed.autoResponderLogs || initial.autoResponderLogs,
          enterpriseEmailThreads: parsed.enterpriseEmailThreads?.length ? parsed.enterpriseEmailThreads : initial.enterpriseEmailThreads,
          donorProfiles: parsed.donorProfiles?.length ? parsed.donorProfiles : initial.donorProfiles,
          majorDonorPipeline: parsed.majorDonorPipeline?.length ? parsed.majorDonorPipeline : initial.majorDonorPipeline,
          grantPipeline: parsed.grantPipeline?.length ? parsed.grantPipeline : initial.grantPipeline,
          corporatePartnerships: parsed.corporatePartnerships?.length ? parsed.corporatePartnerships : initial.corporatePartnerships,
          followUpTasks: parsed.followUpTasks?.length ? parsed.followUpTasks : initial.followUpTasks,
          calendarProposals: parsed.calendarProposals?.length ? parsed.calendarProposals : initial.calendarProposals,
          // Fundraising collections
          fundraisingDonors: parsed.fundraisingDonors?.length ? parsed.fundraisingDonors : initial.fundraisingDonors,
          fundraisingOpportunities: parsed.fundraisingOpportunities?.length ? parsed.fundraisingOpportunities : initial.fundraisingOpportunities,
          fundraisingCampaigns: parsed.fundraisingCampaigns?.length ? parsed.fundraisingCampaigns : initial.fundraisingCampaigns,
          fundraisingOutreachDrafts: parsed.fundraisingOutreachDrafts?.length ? parsed.fundraisingOutreachDrafts : initial.fundraisingOutreachDrafts,
          fundraisingContributions: parsed.fundraisingContributions?.length ? parsed.fundraisingContributions : initial.fundraisingContributions,
          fundraisingPrograms: parsed.fundraisingPrograms?.length ? parsed.fundraisingPrograms : initial.fundraisingPrograms,
          fundraisingGrants: parsed.fundraisingGrants?.length ? parsed.fundraisingGrants : initial.fundraisingGrants,
          fundraisingCorporatePartnerships: parsed.fundraisingCorporatePartnerships?.length ? parsed.fundraisingCorporatePartnerships : initial.fundraisingCorporatePartnerships,
          fundraisingImportJobs: parsed.fundraisingImportJobs?.length ? parsed.fundraisingImportJobs : initial.fundraisingImportJobs,
          fundraisingReadinessItems: parsed.fundraisingReadinessItems?.length >= 18 ? parsed.fundraisingReadinessItems : initial.fundraisingReadinessItems,
          controlledPilotMetrics: parsed.controlledPilotMetrics || initial.controlledPilotMetrics,
          financialReconciliation: parsed.financialReconciliation || initial.financialReconciliation,
          // Phase 12A sync collections
          historicalImportJobs: parsed.historicalImportJobs?.length ? parsed.historicalImportJobs : initial.historicalImportJobs,
          syncCheckpoints: parsed.syncCheckpoints?.length ? parsed.syncCheckpoints : initial.syncCheckpoints,
          syncConflicts: parsed.syncConflicts?.length ? parsed.syncConflicts : initial.syncConflicts,
          syncAuditLogs: parsed.syncAuditLogs?.length ? parsed.syncAuditLogs : initial.syncAuditLogs,
          // Phase 13 Development Transparency collections
          developmentMilestones: parsed.developmentMilestones?.length ? parsed.developmentMilestones : initial.developmentMilestones,
          developmentFeatures: parsed.developmentFeatures?.length ? parsed.developmentFeatures : initial.developmentFeatures,
          githubMetadata: parsed.githubMetadata || initial.githubMetadata,
          githubCommits: parsed.githubCommits?.length ? parsed.githubCommits : initial.githubCommits,
          githubPullRequests: parsed.githubPullRequests?.length ? parsed.githubPullRequests : initial.githubPullRequests,
          githubWorkflowRuns: parsed.githubWorkflowRuns?.length ? parsed.githubWorkflowRuns : initial.githubWorkflowRuns,
          localSyncReport: parsed.localSyncReport || initial.localSyncReport,
          developmentActivities: parsed.developmentActivities?.length ? parsed.developmentActivities : initial.developmentActivities,
          clientFeedbacks: parsed.clientFeedbacks?.length ? parsed.clientFeedbacks : initial.clientFeedbacks,
          changeRequests: parsed.changeRequests?.length ? parsed.changeRequests : initial.changeRequests,
          projectDocuments: parsed.projectDocuments?.length ? parsed.projectDocuments : initial.projectDocuments,
          weeklyReports: parsed.weeklyReports?.length ? parsed.weeklyReports : initial.weeklyReports,
        };
      }
    } catch {
      // Fallback if parsing fails
    }
    this.saveState(initial);
    return initial;
  }


  private saveState(state: AppDatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in restricted envs
    }
    this.state = state;
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getState(): AppDatabaseState {
    return this.state;
  }

  public resetDatabase(): void {
    const fresh = getInitialState();
    this.saveState(fresh);
    this.appendAuditLog('DATABASE_RESET', 'Entire test database reset to baseline seed data.');
  }

  // --- Auth & Role Switching ---
  public setCurrentUser(user: User): void {
    this.saveState({ ...this.state, currentUser: user });
    this.appendAuditLog('USER_SWITCH', `Switched active session to ${user.name} (${user.role})`);
  }

  // --- Audit Log ---
  public appendAuditLog(action: string, details: string, status: 'success' | 'flagged' | 'denied' = 'success'): void {
    const user = this.state.currentUser;
    const newEntry: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorEmail: user?.email || 'master.admin@phumulani.org',
      actorRole: user?.role || 'PLATFORM_SUPER_ADMIN',
      action,
      resource: 'Phumulani Platform',
      details,
      ipAddress: '127.0.0.1 (preview)',
      status,
    };
    this.saveState({
      ...this.state,
      auditLogs: [newEntry, ...this.state.auditLogs].slice(0, 200), // keep latest 200
    });
  }

  public logAudit(entry: { actorId: string; actorName: string; actorRole: string; action: string; resource: string; details: string }): void {
    const newEntry: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorEmail: entry.actorName,
      actorRole: entry.actorRole,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: '127.0.0.1 (internal)',
      status: 'success',
    };
    this.saveState({
      ...this.state,
      auditLogs: [newEntry, ...this.state.auditLogs].slice(0, 200),
    });
  }

  // --- Volunteers ---
  public submitVolunteerApplication(app: Omit<VolunteerApplication, 'id' | 'trackingId' | 'status' | 'submittedAt'>): VolunteerApplication {
    const trackingId = `PHM-VOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newApp: VolunteerApplication = {
      ...app,
      id: `app-${Date.now()}`,
      trackingId,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      aiSuggestedMatchNotes: `Initial analysis by Agent A04: Skills (${app.skills.join(', ')}) mapped to community needs.`,
    };
    this.saveState({
      ...this.state,
      applications: [newApp, ...this.state.applications],
    });
    this.appendAuditLog('VOLUNTEER_APPLICATION_SUBMITTED', `Application ${trackingId} submitted for ${app.fullName}`);
    return newApp;
  }

  public updateApplicationStatus(id: string, status: VolunteerApplication['status'], notes?: string): void {
    const updated = this.state.applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status,
          notes: notes || app.notes,
          reviewedBy: this.state.currentUser.name,
          reviewedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    this.saveState({ ...this.state, applications: updated });
    this.appendAuditLog('VOLUNTEER_STATUS_UPDATED', `Application ${id} status moved to ${status}`);
  }

  public logVolunteerHours(entry: Omit<VolunteerHourLog, 'id' | 'verified'>): VolunteerHourLog {
    const newLog: VolunteerHourLog = {
      ...entry,
      id: `hr-${Date.now()}`,
      verified: false,
    };
    this.saveState({
      ...this.state,
      volunteerHours: [newLog, ...this.state.volunteerHours],
    });
    this.appendAuditLog('VOLUNTEER_HOURS_LOGGED', `${entry.volunteerName} logged ${entry.hours} hours for ${entry.opportunityTitle}`);
    return newLog;
  }

  public verifyVolunteerHours(id: string): void {
    const updated = this.state.volunteerHours.map((hr) => {
      if (hr.id === id) {
        return {
          ...hr,
          verified: true,
          verifiedBy: this.state.currentUser.name,
          verifiedAt: new Date().toISOString(),
        };
      }
      return hr;
    });
    this.saveState({ ...this.state, volunteerHours: updated });
    this.appendAuditLog('VOLUNTEER_HOURS_VERIFIED', `Hours record ${id} verified by ${this.state.currentUser.name}`);
  }

  // --- Donations ---
  public processDonation(donationData: {
    donorName: string;
    donorEmail: string;
    amount: number;
    frequency: Donation['frequency'];
    campaignId: string;
    campaignTitle: string;
    paymentMethod: string;
    isAnonymous: boolean;
  }): Donation {
    const txnId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const rcpNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDonation: Donation = {
      ...donationData,
      id: `don-${Date.now()}`,
      transactionId: txnId,
      receiptNumber: rcpNumber,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
      reconciled: true,
      reconciledAt: new Date().toISOString(),
    };

    // Update campaign raised total
    const updatedCampaigns = this.state.campaigns.map((c) => {
      if (c.id === donationData.campaignId) {
        return {
          ...c,
          raisedAmount: c.raisedAmount + donationData.amount,
          donorCount: c.donorCount + 1,
        };
      }
      return c;
    });

    this.saveState({
      ...this.state,
      donations: [newDonation, ...this.state.donations],
      campaigns: updatedCampaigns,
    });

    this.appendAuditLog(
      'DONATION_PROCESSED',
      `Processed $${donationData.amount} (${donationData.frequency}) for ${donationData.campaignTitle}. Receipt: ${rcpNumber}`
    );
    return newDonation;
  }

  // --- Events & Capacity Enforcement ---
  public registerForEvent(eventId: string, attendeeName: string, attendeeEmail: string, phone: string): { status: 'confirmed' | 'waitlist'; message: string } {
    const event = this.state.events.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const isFull = event.registeredCount >= event.capacity;
    const registrationStatus: 'confirmed' | 'waitlist' = isFull ? 'waitlist' : 'confirmed';

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      eventTitle: event.title,
      attendeeName,
      attendeeEmail,
      phone,
      status: registrationStatus,
      registeredAt: new Date().toISOString(),
    };

    const updatedEvents = this.state.events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          registeredCount: isFull ? e.registeredCount : e.registeredCount + 1,
          waitlistCount: isFull ? e.waitlistCount + 1 : e.waitlistCount,
        };
      }
      return e;
    });

    this.saveState({
      ...this.state,
      events: updatedEvents,
      eventRegistrations: [newReg, ...this.state.eventRegistrations],
    });

    const msg = isFull
      ? `Event capacity reached. You have been added to the priority waitlist (#${event.waitlistCount + 1}).`
      : `Registration confirmed! Your seat is reserved for ${event.title}.`;

    this.appendAuditLog('EVENT_REGISTRATION', `${attendeeName} registered for ${event.title} (${registrationStatus})`);
    return { status: registrationStatus, message: msg };
  }

  // --- Inbox & Triage ---
  public updateMessageStatus(id: string, status: InboxMessage['status'], editedDraft?: string): void {
    const updated = this.state.inboxMessages.map((msg) => {
      if (msg.id === id) {
        return {
          ...msg,
          status,
          aiDraftReply: editedDraft !== undefined ? editedDraft : msg.aiDraftReply,
          approvedBy: status === 'approved' || status === 'sent' ? this.state.currentUser.name : msg.approvedBy,
          approvedAt: status === 'approved' || status === 'sent' ? new Date().toISOString() : msg.approvedAt,
        };
      }
      return msg;
    });
    this.saveState({ ...this.state, inboxMessages: updated });
    this.appendAuditLog('INBOX_MESSAGE_UPDATED', `Message ${id} updated to status: ${status}`);
  }

  // --- AI Workforce Controls ---
  public updateAgentStatus(agentId: string, status: AIAgent['status']): void {
    const updated = this.state.aiAgents.map((ag) => (ag.id === agentId ? { ...ag, status } : ag));
    this.saveState({ ...this.state, aiAgents: updated });
    this.appendAuditLog('AI_AGENT_STATUS_CHANGE', `Agent ${agentId} status updated to ${status}`);
  }

  public recordAgentRun(agentId: string, tokens: number, costUSD: number): void {
    const updated = this.state.aiAgents.map((ag) => {
      if (ag.id === agentId) {
        return {
          ...ag,
          callsThisMonth: ag.callsThisMonth + 1,
          tokenUsage: ag.tokenUsage + tokens,
          costEstimateUSD: +(ag.costEstimateUSD + costUSD).toFixed(4),
        };
      }
      return ag;
    });
    this.saveState({ ...this.state, aiAgents: updated });
  }

  // --- AI Approval Tasks ---
  public resolveApprovalTask(taskId: string, decision: 'approved' | 'rejected', notes?: string): void {
    const task = this.state.aiApprovalTasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated = this.state.aiApprovalTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: decision,
            reviewedBy: this.state.currentUser.name,
            reviewedAt: new Date().toISOString(),
          }
        : t
    );
    this.saveState({ ...this.state, aiApprovalTasks: updated });
    this.appendAuditLog('AI_APPROVAL_DECIDED', `Task ${taskId} (${task.title}) was ${decision} by ${this.state.currentUser.name}. ${notes || ''}`);
  }

  // --- Restricted Survivor Route ---
  public submitRestrictedIntake(intakeData: Omit<RestrictedIntakeItem, 'id' | 'anonymousCode' | 'status' | 'createdAt' | 'lastUpdated' | 'assignedSpecialist'>): RestrictedIntakeItem {
    const code = `SAFE-MN-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: RestrictedIntakeItem = {
      ...intakeData,
      id: `surv-${Date.now()}`,
      anonymousCode: code,
      assignedSpecialist: 'Sister Miriam K. (Safeguarding Lead)',
      status: 'new',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    // Stored strictly inside restricted boundary
    this.saveState({
      ...this.state,
      restrictedIntakes: [newItem, ...this.state.restrictedIntakes],
    });

    // We do NOT log sensitive notes to the general audit log!
    this.appendAuditLog('RESTRICTED_INTAKE_ROUTED', `Discreet intake reference ${code} routed to authorized safeguarding queue.`);
    return newItem;
  }

  public getRestrictedIntakes(userIdOrRole: string): RestrictedIntakeItem[] {
    const user = this.state.users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole);
    if (!user) {
      if (userIdOrRole === 'safeguarding_officer' || userIdOrRole === 'executive_director') {
        return this.state.restrictedIntakes;
      }
      return [];
    }
    // Only Safeguarding Officer and Executive Director are permissioned
    if (user.role === 'safeguarding_officer' || user.role === 'executive_director') {
      return this.state.restrictedIntakes;
    }
    return [];
  }

  // --- Master Administrator & Account Management (Phase 8 Section 2 & 3) ---
  public createUser(userData: Omit<User, 'id'>): User {
    // Check permission - only super admin or executive can provision accounts
    const actor = this.state.currentUser;
    const isAuthorized = actor.role === 'PLATFORM_SUPER_ADMIN' || actor.role === 'executive_director';
    if (!isAuthorized) {
      this.appendAuditLog('UNAUTHORIZED_USER_PROVISION_ATTEMPT', `Actor ${actor.name} (${actor.role}) denied provisioning account for ${userData.email}`, 'denied');
      throw new Error('Permission denied: Account creation requires PLATFORM_SUPER_ADMIN or Executive authorization.');
    }

    // Prohibit unauthorized self-provisioning of PLATFORM_SUPER_ADMIN
    if (userData.role === 'PLATFORM_SUPER_ADMIN' && actor.role !== 'PLATFORM_SUPER_ADMIN' && actor.role !== 'executive_director') {
      this.appendAuditLog('PRIVILEGED_SUPER_ADMIN_ELEVATION_DENIED', `Attempted unauthorized escalation to PLATFORM_SUPER_ADMIN for ${userData.email}`, 'denied');
      throw new Error('Privileged escalation violation: PLATFORM_SUPER_ADMIN cannot be provisioned without verified credentials.');
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
      invitedBy: actor.name,
    };

    this.saveState({
      ...this.state,
      users: [...this.state.users, newUser],
    });

    this.appendAuditLog('USER_ACCOUNT_PROVISIONED', `Provisioned account for ${newUser.name} (${newUser.email}) with role ${newUser.role}. MFA: ${newUser.mfaEnabled ? 'Enforced' : 'Standard'}.`);
    return newUser;
  }

  public updateUserStatus(userId: string, status: User['status']): void {
    const actor = this.state.currentUser;
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) return;

    const updated = this.state.users.map((u) => (u.id === userId ? { ...u, status } : u));
    this.saveState({ ...this.state, users: updated });
    this.appendAuditLog('USER_STATUS_CHANGED', `Account ${target.name} (${target.email}) status changed from ${target.status || 'active'} to ${status} by ${actor.name}`);
  }

  public updateUserRole(userId: string, role: UserRole, permissions?: string[]): void {
    const actor = this.state.currentUser;
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) return;

    const updated = this.state.users.map((u) =>
      u.id === userId
        ? {
            ...u,
            role,
            permissions: permissions || u.permissions,
          }
        : u
    );
    this.saveState({ ...this.state, users: updated });
    this.appendAuditLog('USER_ROLE_MODIFIED', `Account ${target.name} role changed to ${role} by ${actor.name}`);
  }

  public revokeUserSessions(userId: string): void {
    const actor = this.state.currentUser;
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) return;

    this.appendAuditLog('USER_SESSIONS_REVOKED', `All active identity sessions revoked for ${target.name} (${target.email}) by ${actor.name}. Mandatory re-auth required.`);
  }

  public resetUserAuth(userId: string): { success: boolean; verificationUrl: string } {
    const actor = this.state.currentUser;
    const target = this.state.users.find((u) => u.id === userId);
    if (!target) throw new Error('User not found');

    const resetToken = `rst-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationUrl = `https://auth.phumulani.org/verify?token=${resetToken}&email=${encodeURIComponent(target.email)}`;

    this.appendAuditLog('USER_AUTH_RESET_INITIATED', `Identity Provider credential reset initiated for ${target.email} by ${actor.name}. Verification token generated.`);
    return { success: true, verificationUrl };
  }

  // --- AI Master Emergency Controls ---
  public emergencyHaltAllAgents(): void {
    const actor = this.state.currentUser;
    const updated = this.state.aiAgents.map((ag) => ({ ...ag, status: 'paused' as const }));
    this.saveState({ ...this.state, aiAgents: updated });
    this.appendAuditLog('EMERGENCY_AI_KILL_SWITCH_ENGAGED', `Master Administrator ${actor.name} engaged emergency kill switch. All 18 AI agents PAUSED immediately.`, 'flagged');
  }

  public resumeAllAgents(): void {
    const actor = this.state.currentUser;
    const updated = this.state.aiAgents.map((ag) => ({
      ...ag,
      status: ag.id === 'A10' || ag.id === 'A01' || ag.id === 'A03' || ag.id === 'A04' || ag.id === 'A07' || ag.id === 'A08' || ag.id === 'A13' || ag.id === 'A15' || ag.id === 'A18' ? ('active' as const) : ('supervised' as const),
    }));
    this.saveState({ ...this.state, aiAgents: updated });
    this.appendAuditLog('AI_AGENTS_RESUMED', `All 18 AI agents restored to active/supervised governance state by ${actor.name}.`);
  }

  // --- System Settings Management ---
  public updateSystemSetting(key: string, value: string | boolean | number): void {
    const actor = this.state.currentUser;
    const exists = this.state.systemSettings.some((s) => s.key === key);
    let updated;
    if (exists) {
      updated = this.state.systemSettings.map((s) =>
        s.key === key
          ? {
              ...s,
              value,
              lastModifiedBy: actor.name,
              lastModifiedAt: new Date().toISOString(),
            }
          : s
      );
    } else {
      updated = [
        ...this.state.systemSettings,
        {
          key,
          category: 'Organization' as const,
          label: key,
          value,
          description: 'Configured platform setting',
          requiresReauth: false,
          lastModifiedBy: actor.name,
          lastModifiedAt: new Date().toISOString(),
        },
      ];
    }
    this.saveState({ ...this.state, systemSettings: updated });
    this.appendAuditLog('SYSTEM_SETTING_UPDATED', `Setting [${key}] changed to [${value}] by ${actor.name}`);
  }

  // --- Phase 12A Email Synchronization & Unified Mailbox Management ---
  public getConnectedMailboxes(): ConnectedMailbox[] {
    return this.state.connectedMailboxes;
  }

  public getHistoricalImportJobs(): HistoricalImportJob[] {
    return this.state.historicalImportJobs;
  }

  public getHistoricalImportJob(id: string): HistoricalImportJob | undefined {
    return this.state.historicalImportJobs.find((j) => j.id === id);
  }

  public saveHistoricalImportJob(job: HistoricalImportJob): void {
    const exists = this.state.historicalImportJobs.some((j) => j.id === job.id);
    const updated = exists
      ? this.state.historicalImportJobs.map((j) => (j.id === job.id ? job : j))
      : [job, ...this.state.historicalImportJobs];
    this.saveState({ ...this.state, historicalImportJobs: updated });
  }

  public startHistoricalImport(
    mailboxId: string,
    options?: { folders?: string[]; dateRange?: string }
  ): HistoricalImportJob {
    const actor = this.state.currentUser;
    const mbx = this.state.connectedMailboxes.find((m) => m.id === mailboxId);
    if (!mbx) throw new Error(`Mailbox not found: ${mailboxId}`);
    const existing = this.state.historicalImportJobs.find((j) => j.mailboxId === mailboxId);
    const newJob: HistoricalImportJob = {
      id: existing ? existing.id : `imp-job-${mailboxId}-${Date.now()}`,
      mailboxId,
      mailboxEmail: mbx.email,
      provider: mbx.provider,
      status: 'running',
      stage: 'batch_retrieval',
      currentStage: 'batch_retrieval',
      scope: 'all_history',
      startDate: options?.dateRange?.split(' to ')[0] || '2025-01-01',
      endDate: options?.dateRange?.split(' to ')[1] || '2026-12-31',
      totalFound: existing?.totalFound || 450,
      importedCount: existing?.importedCount || 0,
      duplicatesSkipped: existing?.duplicatesSkipped || 0,
      safeguardingQuarantined: existing?.safeguardingQuarantined || 0,
      errorsCount: 0,
      cursor: `cursor-${mailboxId}-checkpoint`,
      batchSize: 50,
      currentBatch: 1,
      totalBatches: 9,
      progressPercent: existing ? Math.min(100, Math.round(((existing.importedCount + 50) / (existing.totalFound || 450)) * 100)) : 10,
      progressPercentage: existing ? Math.min(100, Math.round(((existing.importedCount + 50) / (existing.totalFound || 450)) * 100)) : 10,
      isResumable: true,
      startedAt: existing?.startedAt || new Date().toISOString(),
      lastCheckpointAt: new Date().toISOString(),
      auditEvidence: `Historical import initiated for ${mbx.email}. Auto-responders suppressed.`,
    };
    this.saveHistoricalImportJob(newJob);

    // Update mailbox state
    const updatedMbx = this.state.connectedMailboxes.map((m) =>
      m.id === mailboxId
        ? {
            ...m,
            historicalImportStatus: 'in_progress' as const,
            historicalImportProgress: newJob.progressPercent,
          }
        : m
    );
    this.saveState({ ...this.state, connectedMailboxes: updatedMbx });

    this.appendSyncAuditLog({
      mailboxEmail: mbx.email,
      action: 'HISTORICAL_IMPORT_STARTED',
      actor: actor.name,
      details: `Started historical import job ${newJob.id} for ${mbx.email} (${newJob.totalFound} items scope). Non-solicitation invariant active.`,
      direction: 'inbound',
      status: 'success',
    });
    return newJob;
  }

  public pauseHistoricalImport(jobIdOrMailboxId: string): HistoricalImportJob {
    const actor = this.state.currentUser;
    const job = this.state.historicalImportJobs.find((j) => j.id === jobIdOrMailboxId || j.mailboxId === jobIdOrMailboxId);
    if (!job) throw new Error(`Historical import job ${jobIdOrMailboxId} not found.`);
    const updated: HistoricalImportJob = {
      ...job,
      status: 'paused',
      lastCheckpointAt: new Date().toISOString(),
      auditEvidence: `Historical import paused at checkpoint ${job.cursor}. Resumption enabled.`,
    };
    this.saveHistoricalImportJob(updated);
    this.appendSyncAuditLog({
      mailboxEmail: job.mailboxEmail,
      action: 'HISTORICAL_IMPORT_PAUSED',
      actor: actor.name,
      details: `Paused historical import at ${job.importedCount}/${job.totalFound} messages.`,
      direction: 'internal',
      status: 'warning',
    });
    return updated;
  }

  public resumeHistoricalImport(jobIdOrMailboxId: string): HistoricalImportJob {
    const actor = this.state.currentUser;
    const job = this.state.historicalImportJobs.find((j) => j.id === jobIdOrMailboxId || j.mailboxId === jobIdOrMailboxId);
    if (!job) throw new Error('No historical import job found to resume.');
    const nextImported = Math.min(job.totalFound, job.importedCount + job.batchSize);
    const isCompleted = nextImported >= job.totalFound;
    const percent = Math.round((nextImported / (job.totalFound || 450)) * 100);
    const updated: HistoricalImportJob = {
      ...job,
      status: 'in_progress',
      stage: 'validation',
      currentStage: 'validation',
      importedCount: nextImported,
      progressPercent: percent,
      progressPercentage: percent,
      currentBatch: 2,
      totalBatches: 5,
      isResumable: true,
      lastCheckpointAt: new Date().toISOString(),
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      auditEvidence: `Resumed from checkpoint ${job.cursor}. Progress: ${nextImported}/${job.totalFound}.`,
    };
    this.saveHistoricalImportJob(updated);
    this.appendSyncAuditLog({
      mailboxEmail: job.mailboxEmail,
      action: 'HISTORICAL_IMPORT_RESUMED',
      actor: actor.name,
      details: `Resumed import: now at ${nextImported}/${job.totalFound}.`,
      direction: 'inbound',
      status: 'success',
    });
    return updated;
  }

  public getMailboxSyncCheckpoints(): MailboxSyncCheckpoint[] {
    return this.state.syncCheckpoints;
  }

  public getMailboxSyncCheckpoint(mailboxId: string): MailboxSyncCheckpoint | undefined {
    return this.state.syncCheckpoints.find((c) => c.mailboxId === mailboxId);
  }

  public updateMailboxSyncCheckpoint(checkpoint: MailboxSyncCheckpoint): void {
    const updated = this.state.syncCheckpoints.map((c) => (c.mailboxId === checkpoint.mailboxId ? checkpoint : c));
    this.saveState({ ...this.state, syncCheckpoints: updated });
  }

  public runIncrementalSync(mailboxId: string): {
    success: boolean;
    deltaToken: string;
    newCount: number;
    newIncomingCount: number;
    newSentCount: number;
    error?: string;
  } {
    const actor = this.state.currentUser;
    const mbx = this.state.connectedMailboxes.find((m) => m.id === mailboxId);
    const cp = this.state.syncCheckpoints.find((c) => c.mailboxId === mailboxId);
    const fallbackDeltaToken = `dt-${mailboxId}-${Date.now()}`;
    if (!mbx || !cp) {
      return {
        success: false,
        deltaToken: fallbackDeltaToken,
        newCount: 0,
        newIncomingCount: 0,
        newSentCount: 0,
        error: 'Mailbox or checkpoint not found',
      };
    }

    // Rate limit check
    if (cp.rateLimit?.backoffUntil && new Date(cp.rateLimit.backoffUntil) > new Date()) {
      return {
        success: false,
        deltaToken: cp.deltaToken,
        newCount: 0,
        newIncomingCount: 0,
        newSentCount: 0,
        error: `Rate limited by provider until ${cp.rateLimit.backoffUntil}. Fail-closed backoff active.`,
      };
    }

    const now = new Date().toISOString();
    const newIncoming = Math.floor(1 + Math.random() * 3);
    const newSent = Math.floor(Math.random() * 2);
    const newDeltaToken = `d-token-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedCheckpoint: MailboxSyncCheckpoint = {
      ...cp,
      historyId: `hist-${mailboxId}-${Date.now()}`,
      deltaToken: newDeltaToken,
      lastSuccessfulSyncAt: now,
      lastCheckpointAt: now,
      lastAttemptAt: now,
      newMessagesCount: (cp.newMessagesCount || 0) + newIncoming,
      sentMessagesCount: (cp.sentMessagesCount || 0) + newSent,
      retryCount: 0,
      currentError: undefined,
      nextScheduledSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    const updatedMailboxes = this.state.connectedMailboxes.map((m) =>
      m.id === mailboxId
        ? {
            ...m,
            lastSyncedAt: now,
            lastSyncAt: now,
            status: 'connected' as const,
            unreadCount: m.unreadCount + newIncoming,
            newMessagesCount: (m.newMessagesCount || 0) + newIncoming,
          }
        : m
    );

    this.saveState({
      ...this.state,
      syncCheckpoints: this.state.syncCheckpoints.map((c) => (c.mailboxId === mailboxId ? updatedCheckpoint : c)),
      connectedMailboxes: updatedMailboxes,
    });

    this.appendSyncAuditLog({
      mailboxEmail: mbx.email,
      action: 'INCREMENTAL_DELTA_SYNC',
      actor: actor.name,
      details: `Incremental delta token advanced to [${newDeltaToken}]. Synced ${newIncoming} incoming, ${newSent} sent messages.`,
      direction: 'inbound',
      status: 'success',
    });

    return {
      success: true,
      deltaToken: newDeltaToken,
      newCount: newIncoming,
      newIncomingCount: newIncoming,
      newSentCount: newSent,
    };
  }

  public toggleTwoWaySync(mailboxId: string, enabled?: boolean): ConnectedMailbox {
    const actor = this.state.currentUser;
    const mbx = this.state.connectedMailboxes.find((m) => m.id === mailboxId);
    if (!mbx) throw new Error(`Mailbox ${mailboxId} not found`);

    const newTwoWay = enabled !== undefined ? enabled : !mbx.twoWaySyncEnabled;
    const updatedCp = this.state.syncCheckpoints.map((c) =>
      c.mailboxId === mailboxId ? { ...c, twoWaySyncEnabled: newTwoWay } : c
    );
    const updatedMbx = this.state.connectedMailboxes.map((m) =>
      m.id === mailboxId ? { ...m, twoWaySyncEnabled: newTwoWay } : m
    );
    this.saveState({
      ...this.state,
      syncCheckpoints: updatedCp,
      connectedMailboxes: updatedMbx,
    });
    this.appendSyncAuditLog({
      mailboxEmail: mbx.email,
      action: 'TWO_WAY_SYNC_TOGGLED',
      actor: actor.name,
      details: `Two-way sync set to ${newTwoWay ? 'ENABLED' : 'DISABLED'} for mailbox ${mbx.email}.`,
      direction: 'two_way',
      status: 'success',
    });
    return { ...mbx, twoWaySyncEnabled: newTwoWay };
  }

  public reauthorizeMailbox(mailboxId: string): ConnectedMailbox & { authUrl: string } {
    const actor = this.state.currentUser;
    const mbx = this.state.connectedMailboxes.find((m) => m.id === mailboxId);
    if (!mbx) throw new Error(`Mailbox ${mailboxId} not found`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=phumulani-workspace&redirect_uri=https://app.phumulani.org/oauth2/callback&scope=https://mail.google.com/&login_hint=${encodeURIComponent(mbx.email)}`;
    const updated = this.state.connectedMailboxes.map((m) =>
      m.id === mailboxId
        ? {
            ...m,
            status: 'connected' as const,
            authStatus: 'authorized' as const,
            currentError: undefined,
            lastSyncedAt: new Date().toISOString(),
            lastSyncAt: new Date().toISOString(),
          }
        : m
    );
    this.saveState({ ...this.state, connectedMailboxes: updated });
    this.appendSyncAuditLog({
      mailboxEmail: mbx.email,
      action: 'MAILBOX_REAUTHORIZED',
      actor: actor.name,
      details: `Mailbox ${mbx.email} successfully reauthorized with provider OAuth gateway.`,
      direction: 'internal',
      status: 'success',
    });
    return { ...mbx, authStatus: 'authorized', authUrl };
  }

  public updateMessageReadState(
    threadId: string,
    isReadOrMessageId: boolean | string,
    maybeIsRead?: boolean
  ): void {
    const actor = this.state.currentUser;
    const isRead = typeof isReadOrMessageId === 'boolean' ? isReadOrMessageId : (maybeIsRead ?? true);
    const messageId = typeof isReadOrMessageId === 'string' ? isReadOrMessageId : undefined;

    const updatedThreads = this.state.enterpriseEmailThreads.map((t) => {
      if (t.id === threadId) {
        const msgs = t.messages.map((m) => (messageId ? (m.id === messageId ? { ...m, isRead } : m) : { ...m, isRead }));
        return {
          ...t,
          isRead,
          status: isRead ? ('responded' as const) : ('unread' as const),
          messages: msgs,
        };
      }
      return t;
    });
    this.saveState({ ...this.state, enterpriseEmailThreads: updatedThreads });

    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    this.appendSyncAuditLog({
      mailboxEmail: thread?.mailboxEmail || 'info@phumulani.org',
      action: 'MESSAGE_READ_STATE_SYNC',
      actor: actor.name,
      details: `Thread [${threadId}] marked as ${isRead ? 'READ' : 'UNREAD'}. Two-way state dispatched to provider.`,
      direction: 'two_way',
      status: 'success',
    });
  }

  public archiveThread(threadId: string, isArchived: boolean = true): void {
    const actor = this.state.currentUser;
    const updatedThreads = this.state.enterpriseEmailThreads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          isArchived,
          folder: (isArchived ? 'ARCHIVE' : 'INBOX') as EmailFolder,
          messages: t.messages.map((m) => ({
            ...m,
            isArchived,
            folder: (isArchived ? 'ARCHIVE' : 'INBOX') as EmailFolder,
          })),
        };
      }
      return t;
    });
    this.saveState({ ...this.state, enterpriseEmailThreads: updatedThreads });

    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    this.appendSyncAuditLog({
      mailboxEmail: thread?.mailboxEmail || 'info@phumulani.org',
      action: 'THREAD_ARCHIVE_SYNC',
      actor: actor.name,
      details: `Thread [${threadId}] ${isArchived ? 'ARCHIVED' : 'UNARCHIVED'}. Provider folder synchronized.`,
      direction: 'two_way',
      status: 'success',
    });
  }

  public updateThreadFolderAndLabels(
    threadId: string,
    folder: EmailFolder,
    labels?: string[]
  ): void {
    const actor = this.state.currentUser;
    const updatedThreads = this.state.enterpriseEmailThreads.map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          folder,
          isArchived: folder === 'ARCHIVE',
          labels: labels || t.labels,
          messages: t.messages.map((m) => ({ ...m, folder, isArchived: folder === 'ARCHIVE' })),
        };
      }
      return t;
    });
    this.saveState({ ...this.state, enterpriseEmailThreads: updatedThreads });

    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    this.appendSyncAuditLog({
      mailboxEmail: thread?.mailboxEmail || 'info@phumulani.org',
      action: 'FOLDER_LABEL_SYNC',
      actor: actor.name,
      details: `Thread [${threadId}] moved to folder [${folder}] with labels: ${(labels || thread?.labels || []).join(', ')}`,
      direction: 'two_way',
      status: 'success',
    });
  }

  public getSyncConflicts(): EmailConflictRecord[] {
    return this.state.syncConflicts;
  }

  public resolveSyncConflict(
    conflictId: string,
    strategy: 'provider_authoritative' | 'dashboard_authoritative' | 'manual_review' | 'KEEP_PROVIDER' | 'KEEP_DASHBOARD'
  ): EmailConflictRecord {
    const actor = this.state.currentUser;
    const conflict = this.state.syncConflicts.find((c) => c.id === conflictId);
    if (!conflict) throw new Error(`Conflict ${conflictId} not found`);

    const standardStrategy =
      strategy === 'KEEP_PROVIDER'
        ? 'provider_authoritative'
        : strategy === 'KEEP_DASHBOARD'
        ? 'dashboard_authoritative'
        : strategy;

    const resolved: EmailConflictRecord = {
      ...conflict,
      status: 'RESOLVED',
      resolution: strategy,
      resolutionStrategy: standardStrategy as any,
      resolvedAt: new Date().toISOString(),
      resolvedBy: actor.name,
    };

    const updated = this.state.syncConflicts.map((c) => (c.id === conflictId ? resolved : c));
    this.saveState({ ...this.state, syncConflicts: updated });

    this.appendSyncAuditLog({
      mailboxEmail: conflict.mailboxEmail,
      action: 'CONFLICT_RESOLVED',
      actor: actor.name,
      details: `Conflict [${conflictId}] resolved via strategy: ${strategy}`,
      direction: 'internal',
      status: 'success',
    });

    return resolved;
  }

  public getSyncAuditLogs(): SyncAuditLogItem[] {
    return this.state.syncAuditLogs;
  }

  public appendSyncAuditLog(
    logData: Omit<SyncAuditLogItem, 'id' | 'timestamp'>
  ): SyncAuditLogItem {
    const newLog: SyncAuditLogItem = {
      ...logData,
      id: `sync-log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
    };
    this.saveState({
      ...this.state,
      syncAuditLogs: [newLog, ...this.state.syncAuditLogs.slice(0, 99)],
    });
    return newLog;
  }

  // --- Enterprise Email & Communications Operations ---
  public syncMailbox(mailboxId: string): void {
    const actor = this.state.currentUser;
    const mbx = this.state.connectedMailboxes.find((m) => m.id === mailboxId);
    if (!mbx) return;
    const updated = this.state.connectedMailboxes.map((m) =>
      m.id === mailboxId ? { ...m, lastSyncedAt: new Date().toISOString(), status: 'connected' as const } : m
    );
    this.saveState({ ...this.state, connectedMailboxes: updated });
    this.appendAuditLog('MAILBOX_SYNC_TRIGGERED', `Mailbox [${mbx.email}] synchronized by ${actor.name}`);
  }

  public updateAutoResponderRule(rule: AutoResponderRule): void {
    const actor = this.state.currentUser;
    const updated = this.state.autoResponderRules.map((r) => (r.id === rule.id ? rule : r));
    this.saveState({ ...this.state, autoResponderRules: updated });
    this.appendAuditLog('AUTORESPONDER_RULE_UPDATED', `Auto-responder rule ${rule.code} (${rule.name}) updated by ${actor.name}`);
  }

  public toggleAutoResponderRule(ruleId: string, enabled: boolean): void {
    const actor = this.state.currentUser;
    const updated = this.state.autoResponderRules.map((r) =>
      r.id === ruleId ? { ...r, enabled } : r
    );
    this.saveState({ ...this.state, autoResponderRules: updated });
    this.appendAuditLog('AUTORESPONDER_RULE_TOGGLED', `Auto-responder rule ${ruleId} set to ${enabled ? 'ENABLED' : 'DISABLED'} by ${actor.name}`);
  }

  public recordAutoResponderLog(log: AutoResponderLog): void {
    this.saveState({
      ...this.state,
      autoResponderLogs: [log, ...this.state.autoResponderLogs.slice(0, 49)],
    });
  }

  public updateEmailThread(thread: EnterpriseEmailThread): void {
    const updated = this.state.enterpriseEmailThreads.map((t) => (t.id === thread.id ? thread : t));
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
  }

  public classifyEmailThread(threadId: string, newCategory: EmailClassificationCategory, reason?: string): void {
    const actor = this.state.currentUser;
    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    if (!thread) return;

    const oldCategory = thread.classification;
    const isSafeguarding = newCategory === '01_safeguarding';

    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            classification: newCategory,
            priority: isSafeguarding ? ('P0' as const) : t.priority,
            status: isSafeguarding ? ('escalated_safeguarding' as const) : t.status,
            classificationOverridden: true,
            classificationOverrideReason: reason || `Manual reclassification by ${actor.name}`,
          }
        : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog(
      'EMAIL_CLASSIFICATION_OVERRIDDEN',
      `Thread "${thread.threadSubject}" reclassified from [${oldCategory}] to [${newCategory}] by ${actor.name}. Reason: ${reason || 'Staff correction'}`
    );
  }

  public updateThreadPriority(threadId: string, priority: EmailPriorityLevel): void {
    const actor = this.state.currentUser;
    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    if (!thread) return;

    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId ? { ...t, priority } : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog('EMAIL_PRIORITY_OVERRIDDEN', `Thread "${thread.threadSubject}" priority set to [${priority}] by ${actor.name}`);
  }

  public assignEmailThread(threadId: string, staffId: string, staffName: string): void {
    const actor = this.state.currentUser;
    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            assignedStaffId: staffId,
            assignedStaffName: staffName,
          }
        : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog('EMAIL_THREAD_ASSIGNED', `Thread ${threadId} assigned to ${staffName} by ${actor.name}`);
  }

  public saveEmailDraft(threadId: string, draft: EmailDraft): void {
    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId ? { ...t, draft, status: 'awaiting_approval' as const } : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
  }

  public approveEmailDraft(threadId: string): void {
    const actor = this.state.currentUser;
    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    if (!thread || !thread.draft) return;

    const approvedDraft: EmailDraft = {
      ...thread.draft,
      status: 'approved',
      approvedByStaff: actor.name,
      approvedAt: new Date().toISOString(),
    };

    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId ? { ...t, draft: approvedDraft } : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog('EMAIL_DRAFT_APPROVED', `AI Draft for thread "${thread.threadSubject}" authorized by ${actor.name} (${actor.role})`);
  }

  public rejectEmailDraft(threadId: string, reason: string): void {
    const actor = this.state.currentUser;
    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    if (!thread || !thread.draft) return;

    const rejectedDraft: EmailDraft = {
      ...thread.draft,
      status: 'rejected',
      rejectionReason: reason,
    };

    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId ? { ...t, draft: rejectedDraft, status: 'in_review' as const } : t
    );
    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog('EMAIL_DRAFT_REJECTED', `AI Draft for thread "${thread.threadSubject}" rejected by ${actor.name}. Reason: ${reason}`);
  }

  public sendApprovedEmail(threadId: string): void {
    const actor = this.state.currentUser;
    const thread = this.state.enterpriseEmailThreads.find((t) => t.id === threadId);
    if (!thread || !thread.draft) throw new Error('No draft to send');
    if (thread.draft.status !== 'approved') {
      throw new Error('Safety policy violation: Email draft must be explicitly APPROVED by human staff before sending.');
    }

    const sentMessage = {
      id: `msg-sent-${Date.now()}`,
      threadId,
      senderName: actor.name,
      senderEmail: thread.mailboxEmail,
      recipientEmail: thread.draft.recipientEmail,
      subject: thread.draft.suggestedSubject,
      bodyText: thread.draft.proposedBody,
      receivedAt: new Date().toISOString(),
      direction: 'outbound' as const,
    };

    const updatedDraft: EmailDraft = {
      ...thread.draft,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    const updated = this.state.enterpriseEmailThreads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            draft: updatedDraft,
            status: 'responded' as const,
            messageCount: t.messageCount + 1,
            lastMessageAt: new Date().toISOString(),
            messages: [...t.messages, sentMessage],
          }
        : t
    );

    this.saveState({ ...this.state, enterpriseEmailThreads: updated });
    this.appendAuditLog(
      'EMAIL_DISPATCHED_TO_RECIPIENT',
      `Approved email dispatched to ${thread.draft.recipientEmail} via authorized mailbox [${thread.mailboxEmail}] by ${actor.name}`
    );
  }

  public updateMajorDonorDeal(deal: MajorDonorPipelineDeal): void {
    const actor = this.state.currentUser;
    const updated = this.state.majorDonorPipeline.map((d) => (d.id === deal.id ? deal : d));
    this.saveState({ ...this.state, majorDonorPipeline: updated });
    this.appendAuditLog('MAJOR_DONOR_PIPELINE_UPDATED', `Deal "${deal.donorName}" ($${deal.estimatedAmount.toLocaleString()}) updated to stage [${deal.stage}] by ${actor.name}`);
  }

  public updateGrantOpportunity(grant: GrantPipelineOpportunity): void {
    const actor = this.state.currentUser;
    const updated = this.state.grantPipeline.map((g) => (g.id === grant.id ? grant : g));
    this.saveState({ ...this.state, grantPipeline: updated });
    this.appendAuditLog('GRANT_PIPELINE_UPDATED', `Grant "${grant.opportunityTitle}" ($${grant.fundingAmount.toLocaleString()}) updated to stage [${grant.stage}] by ${actor.name}`);
  }

  public updateCorporatePartnership(corp: CorporatePartnershipOpportunity): void {
    const actor = this.state.currentUser;
    const updated = this.state.corporatePartnerships.map((c) => (c.id === corp.id ? corp : c));
    this.saveState({ ...this.state, corporatePartnerships: updated });
    this.appendAuditLog('CORPORATE_PARTNERSHIP_UPDATED', `Partnership "${corp.companyName}" ($${corp.estimatedValue.toLocaleString()}) updated to stage [${corp.stage}] by ${actor.name}`);
  }

  public createFollowUpTask(taskData: Omit<FollowUpTask, 'id'>): FollowUpTask {
    const actor = this.state.currentUser;
    const newTask: FollowUpTask = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    this.saveState({
      ...this.state,
      followUpTasks: [newTask, ...this.state.followUpTasks],
    });
    this.appendAuditLog('FOLLOW_UP_TASK_CREATED', `Follow-up task "${newTask.title}" assigned to ${newTask.assignedTo} by ${actor.name}`);
    return newTask;
  }

  public toggleFollowUpTask(taskId: string): void {
    const actor = this.state.currentUser;
    const target = this.state.followUpTasks.find((t) => t.id === taskId);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    const updated = this.state.followUpTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus as FollowUpTask['status'],
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          }
        : t
    );
    this.saveState({ ...this.state, followUpTasks: updated });
    this.appendAuditLog('FOLLOW_UP_TASK_UPDATED', `Task "${target.title}" marked as ${newStatus} by ${actor.name}`);
  }

  public createCalendarProposal(proposalData: Omit<CalendarMeetingProposal, 'id'>): CalendarMeetingProposal {
    const actor = this.state.currentUser;
    const newProp: CalendarMeetingProposal = {
      ...proposalData,
      id: `cal-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    this.saveState({
      ...this.state,
      calendarProposals: [newProp, ...this.state.calendarProposals],
    });
    this.appendAuditLog('CALENDAR_PROPOSAL_CREATED', `Meeting proposal "${newProp.proposedTitle}" drafted by ${actor.name}`);
    return newProp;
  }

  public approveCalendarProposal(proposalId: string, confirmedTime: string): void {
    const actor = this.state.currentUser;
    const prop = this.state.calendarProposals.find((p) => p.id === proposalId);
    if (!prop) return;
    const updated = this.state.calendarProposals.map((p) =>
      p.id === proposalId ? { ...p, status: 'approved_sent' as const, confirmedTime } : p
    );
    this.saveState({ ...this.state, calendarProposals: updated });
    this.appendAuditLog('CALENDAR_PROPOSAL_APPROVED', `Meeting "${prop.proposedTitle}" confirmed for ${confirmedTime} and invite dispatched by ${actor.name}`);
  }

  // =========================================================================
  // Phase 8 Directive: Enterprise Fundraising & Donor Intelligence Methods
  // =========================================================================

  public getFundraisingDonors(): DonorContact[] {
    return this.state.fundraisingDonors;
  }

  public addFundraisingDonor(donor: DonorContact): void {
    const actor = this.state.currentUser;
    this.saveState({
      ...this.state,
      fundraisingDonors: [donor, ...this.state.fundraisingDonors],
    });
    this.appendAuditLog('DONOR_RECORD_CREATED', `Donor "${donor.name}" (${donor.category}) registered by ${actor.name}`);
  }

  public updateFundraisingDonor(donorId: string, updates: Partial<DonorContact>): void {
    const actor = this.state.currentUser;
    const donor = this.state.fundraisingDonors.find((d) => d.id === donorId);
    if (!donor) return;
    const updated = this.state.fundraisingDonors.map((d) =>
      d.id === donorId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    this.saveState({ ...this.state, fundraisingDonors: updated });
    this.appendAuditLog('DONOR_RECORD_UPDATED', `Donor "${donor.name}" updated by ${actor.name}`);
  }

  public saveFundraisingImportJob(job: DonorImportJob, newDonors: DonorContact[]): void {
    const actor = this.state.currentUser;
    this.saveState({
      ...this.state,
      fundraisingImportJobs: [job, ...this.state.fundraisingImportJobs],
      fundraisingDonors: [...newDonors, ...this.state.fundraisingDonors],
    });
    this.appendAuditLog(
      'DONOR_IMPORT_COMMITTED',
      `Imported ${newDonors.length} verified donor contacts from "${job.fileName}" by ${actor.name}`
    );
  }

  public rollbackFundraisingImport(jobId: string): boolean {
    const actor = this.state.currentUser;
    const job = this.state.fundraisingImportJobs.find((j) => j.id === jobId);
    if (!job || !job.rollbackPossible) return false;

    // Filter out donors imported by this job prefix
    const updatedDonors = this.state.fundraisingDonors.filter(
      (d) => !d.id.startsWith(`donor-imp-${jobId}`) && d.contactSource !== 'CSV_IMPORT'
    );
    const updatedJobs = this.state.fundraisingImportJobs.map((j) =>
      j.id === jobId ? { ...j, status: 'ROLLED_BACK' as const, rollbackPossible: false } : j
    );
    this.saveState({
      ...this.state,
      fundraisingDonors: updatedDonors,
      fundraisingImportJobs: updatedJobs,
    });
    this.appendAuditLog('DONOR_IMPORT_ROLLED_BACK', `Import job "${job.fileName}" rolled back by ${actor.name}`);
    return true;
  }

  public getFundraisingOpportunities(): FundingOpportunity[] {
    return this.state.fundraisingOpportunities;
  }

  public addFundraisingOpportunity(opp: FundingOpportunity): void {
    const actor = this.state.currentUser;
    this.saveState({
      ...this.state,
      fundraisingOpportunities: [opp, ...this.state.fundraisingOpportunities],
    });
    this.appendAuditLog('FUNDING_OPPORTUNITY_CREATED', `Opportunity "${opp.title}" ($${opp.targetAmount.toLocaleString()}) created by ${actor.name}`);
  }

  public updateFundraisingOpportunity(id: string, updates: Partial<FundingOpportunity>): void {
    const actor = this.state.currentUser;
    const opp = this.state.fundraisingOpportunities.find((o) => o.id === id);
    if (!opp) return;
    const updated = this.state.fundraisingOpportunities.map((o) =>
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    this.saveState({ ...this.state, fundraisingOpportunities: updated });
    this.appendAuditLog('FUNDING_OPPORTUNITY_UPDATED', `Opportunity "${opp.title}" status changed to ${updates.status || opp.status} by ${actor.name}`);
  }

  public getFundraisingCampaigns(): FundraisingCampaign[] {
    return this.state.fundraisingCampaigns;
  }

  public addFundraisingCampaign(camp: FundraisingCampaign): void {
    const actor = this.state.currentUser;
    this.saveState({
      ...this.state,
      fundraisingCampaigns: [camp, ...this.state.fundraisingCampaigns],
    });
    this.appendAuditLog('CAMPAIGN_CREATED', `Campaign "${camp.title}" target $${camp.fundingTarget.toLocaleString()} registered by ${actor.name}`);
  }

  public updateFundraisingCampaign(id: string, updates: Partial<FundraisingCampaign>): void {
    const actor = this.state.currentUser;
    const camp = this.state.fundraisingCampaigns.find((c) => c.id === id);
    if (!camp) return;
    const updated = this.state.fundraisingCampaigns.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    this.saveState({ ...this.state, fundraisingCampaigns: updated });
    this.appendAuditLog('CAMPAIGN_UPDATED', `Campaign "${camp.title}" updated (${updates.status || camp.status}) by ${actor.name}`);
  }

  public getFundraisingOutreachDrafts(): OutreachMessageDraft[] {
    return this.state.fundraisingOutreachDrafts;
  }

  public saveFundraisingOutreachDraft(draft: OutreachMessageDraft): void {
    const existingIdx = this.state.fundraisingOutreachDrafts.findIndex((d) => d.id === draft.id);
    let updated: OutreachMessageDraft[];
    if (existingIdx >= 0) {
      updated = this.state.fundraisingOutreachDrafts.map((d) => (d.id === draft.id ? draft : d));
    } else {
      updated = [draft, ...this.state.fundraisingOutreachDrafts];
    }
    this.saveState({ ...this.state, fundraisingOutreachDrafts: updated });
  }

  public approveFundraisingOutreachDraft(draftId: string, approvedBy: string): OutreachMessageDraft | null {
    const draft = this.state.fundraisingOutreachDrafts.find((d) => d.id === draftId);
    if (!draft) return null;
    const updatedDraft: OutreachMessageDraft = {
      ...draft,
      approvalStatus: 'APPROVED',
      approvedBy,
      approvedAt: new Date().toISOString(),
    };
    const updatedList = this.state.fundraisingOutreachDrafts.map((d) => (d.id === draftId ? updatedDraft : d));
    this.saveState({ ...this.state, fundraisingOutreachDrafts: updatedList });
    this.appendAuditLog('OUTREACH_DRAFT_APPROVED', `Outreach draft "${draft.subject}" approved for dispatch by ${approvedBy}`);
    return updatedDraft;
  }

  public sendFundraisingOutreachDraft(draftId: string): { success: boolean; msgId?: string; error?: string } {
    const actor = this.state.currentUser;
    const draft = this.state.fundraisingOutreachDrafts.find((d) => d.id === draftId);
    if (!draft) return { success: false, error: 'Draft not found' };
    if (draft.approvalStatus !== 'APPROVED') {
      return { success: false, error: 'Cannot send unapproved outreach draft. Human sign-off required.' };
    }

    const deliveryMsgId = `OUT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedDraft: OutreachMessageDraft = {
      ...draft,
      approvalStatus: 'EXECUTED',
      deliveryStatus: 'DELIVERED',
      deliveryProviderMsgId: deliveryMsgId,
      sentAt: new Date().toISOString(),
    };
    const updatedList = this.state.fundraisingOutreachDrafts.map((d) => (d.id === draftId ? updatedDraft : d));
    this.saveState({ ...this.state, fundraisingOutreachDrafts: updatedList });
    this.appendAuditLog('OUTREACH_EMAIL_DISPATCHED', `Outreach email "${draft.subject}" dispatched to ${draft.recipientEmail} [MsgID: ${deliveryMsgId}] by ${actor.name}`);
    return { success: true, msgId: deliveryMsgId };
  }

  public getFundraisingContributions(): VerifiedContribution[] {
    return this.state.fundraisingContributions;
  }

  public addVerifiedContribution(
    contribData: Omit<VerifiedContribution, 'id' | 'receiptNumber'>
  ): VerifiedContribution {
    const actor = this.state.currentUser;
    const receiptNumber = `RCP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newContrib: VerifiedContribution = {
      ...contribData,
      id: `contrib-${Date.now()}`,
      receiptNumber,
    };
    this.saveState({
      ...this.state,
      fundraisingContributions: [newContrib, ...this.state.fundraisingContributions],
    });
    this.appendAuditLog(
      'CONTRIBUTION_VERIFIED',
      `Contribution $${newContrib.amount.toLocaleString()} from "${newContrib.donorName}" verified by ${actor.name} [Receipt: ${receiptNumber}]`
    );
    return newContrib;
  }

  public getFundraisingPrograms(): ProgramFundingRecord[] {
    return this.state.fundraisingPrograms;
  }

  public updateProgramFunding(programId: string, updates: Partial<ProgramFundingRecord>): void {
    const actor = this.state.currentUser;
    const prog = this.state.fundraisingPrograms.find((p) => p.programId === programId);
    if (!prog) return;
    const updated = this.state.fundraisingPrograms.map((p) =>
      p.programId === programId ? { ...p, ...updates } : p
    );
    this.saveState({ ...this.state, fundraisingPrograms: updated });
    this.appendAuditLog('PROGRAM_FUNDING_UPDATED', `Program "${prog.programName}" funding allocation updated by ${actor.name}`);
  }

  public getFundraisingGrants(): GrantRecord[] {
    return this.state.fundraisingGrants;
  }

  public updateGrantRecord(grantId: string, updates: Partial<GrantRecord>): void {
    const actor = this.state.currentUser;
    const grant = this.state.fundraisingGrants.find((g) => g.id === grantId);
    if (!grant) return;
    const updated = this.state.fundraisingGrants.map((g) =>
      g.id === grantId ? { ...g, ...updates } : g
    );
    this.saveState({ ...this.state, fundraisingGrants: updated });
    this.appendAuditLog('GRANT_RECORD_UPDATED', `Grant from "${grant.grantmakerName}" updated (${updates.stage || grant.stage}) by ${actor.name}`);
  }

  public getFundraisingCorporatePartnerships(): CorporatePartnershipRecord[] {
    return this.state.fundraisingCorporatePartnerships;
  }

  public updateFundraisingCorporateRecord(partId: string, updates: Partial<CorporatePartnershipRecord>): void {
    const actor = this.state.currentUser;
    const part = this.state.fundraisingCorporatePartnerships.find((p) => p.id === partId);
    if (!part) return;
    const updated = this.state.fundraisingCorporatePartnerships.map((p) =>
      p.id === partId ? { ...p, ...updates } : p
    );
    this.saveState({ ...this.state, fundraisingCorporatePartnerships: updated });
    this.appendAuditLog('CORPORATE_PARTNERSHIP_UPDATED', `Partnership with "${part.companyName}" updated by ${actor.name}`);
  }

  public getFundraisingImportJobs(): DonorImportJob[] {
    return this.state.fundraisingImportJobs;
  }

  public getFundraisingReadinessItems(): ProductionReadinessItem[] {
    return this.state.fundraisingReadinessItems;
  }

  public updateReadinessItem(id: string, updates: Partial<ProductionReadinessItem>): void {
    const actor = this.state.currentUser;
    const updated = this.state.fundraisingReadinessItems.map((item) =>
      item.id === id ? { ...item, ...updates, lastVerification: new Date().toISOString() } : item
    );
    this.saveState({ ...this.state, fundraisingReadinessItems: updated });
    this.appendAuditLog('READINESS_ITEM_VERIFIED', `Readiness item "${id}" updated by ${actor.name}`);
  }

  public getControlledPilotMetrics(): ControlledPilotMetrics {
    return this.state.controlledPilotMetrics;
  }

  public saveControlledPilotMetrics(metrics: ControlledPilotMetrics): void {
    const actor = this.state.currentUser;
    this.saveState({ ...this.state, controlledPilotMetrics: metrics });
    this.appendAuditLog(
      'PILOT_CAMPAIGN_SIMULATED',
      `Controlled pilot simulation executed for "${metrics.campaignTitle}" by ${actor.name} (Delivered: ${metrics.acceptedSendsCount}, Verified: $${metrics.verifiedDonationsAmount.toLocaleString()})`
    );
  }

  public getFinancialReconciliation(): FinancialReconciliationDetails {
    return this.state.financialReconciliation;
  }

  public updateFinancialReconciliation(updates: Partial<FinancialReconciliationDetails>): void {
    const actor = this.state.currentUser;
    const updated = { ...this.state.financialReconciliation, ...updates, reconciledAt: new Date().toISOString() };
    this.saveState({ ...this.state, financialReconciliation: updated });
    this.appendAuditLog('FINANCIAL_RECONCILIATION_UPDATED', `Authoritative financial reconciliation re-calculated by ${actor.name}`);
  }

  // ==========================================================================
  // PHASE 13: CLIENT DEVELOPMENT TRANSPARENCY & GITHUB / LOCAL SYNC ENGINE
  // ==========================================================================

  public getDevelopmentMilestones(): DevelopmentMilestone[] {
    return this.state.developmentMilestones;
  }

  public updateDevelopmentMilestone(id: string, updates: Partial<DevelopmentMilestone>): void {
    const actor = this.state.currentUser;
    const updated = this.state.developmentMilestones.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.saveState({ ...this.state, developmentMilestones: updated });
    this.appendAuditLog('MILESTONE_UPDATED', `Milestone ${id} updated by ${actor.name} (${actor.role})`);
  }

  public approveMilestone(
    milestoneId: string,
    approverId: string,
    approverName: string,
    approverRole: string,
    decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL',
    artifactVersion: string,
    comments: string
  ): MilestoneApprovalRecord {
    const milestone = this.state.developmentMilestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error(`Milestone ${milestoneId} not found.`);

    const { updatedMilestone, approvalRecord } = DevelopmentOpsService.executeMilestoneApproval(
      milestone,
      approverId,
      approverName,
      approverRole,
      decision,
      artifactVersion,
      comments
    );

    const updatedList = this.state.developmentMilestones.map((m) =>
      m.id === milestoneId ? updatedMilestone : m
    );

    this.saveState({ ...this.state, developmentMilestones: updatedList });
    this.appendAuditLog(
      'CLIENT_MILESTONE_APPROVAL',
      `Milestone ${milestoneId} "${milestone.title}" decision: ${decision} by ${approverName} (${approverRole}) on artifact ${artifactVersion}. AuditRef: ${approvalRecord.auditReference}`
    );

    this.addDevelopmentActivity({
      type: 'MILESTONE_APPROVED',
      sourceSystem: 'CLIENT_PORTAL',
      responsibleActor: `${approverName} (${approverRole})`,
      component: 'Milestone Management',
      eventStatus: decision === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      title: `Milestone ${milestoneId} ${decision}`,
      clientDescription: `${approverName} formally evaluated milestone ${milestoneId} (${milestone.title}): ${decision}. Comments: "${comments}"`,
      evidenceReference: `ARTIFACT_SHA: ${artifactVersion}`,
    });

    return approvalRecord;
  }

  public getDevelopmentFeatures(): DevelopmentFeature[] {
    return this.state.developmentFeatures;
  }

  public updateDevelopmentFeature(id: string, updates: Partial<DevelopmentFeature>): void {
    const actor = this.state.currentUser;
    const updated = this.state.developmentFeatures.map((f) =>
      f.id === id ? { ...f, ...updates, lastUpdated: new Date().toISOString() } : f
    );
    this.saveState({ ...this.state, developmentFeatures: updated });
    this.appendAuditLog('FEATURE_UPDATED', `Feature ${id} updated by ${actor.name}`);
  }

  public getGitHubMetadata(): GitHubRepoMetadata {
    return this.state.githubMetadata;
  }

  public getGitHubCommits(): GitHubCommitRecord[] {
    return this.state.githubCommits;
  }

  public getGitHubPullRequests(): GitHubPullRequest[] {
    return this.state.githubPullRequests;
  }

  public getGitHubWorkflowRuns(): GitHubWorkflowRun[] {
    return this.state.githubWorkflowRuns;
  }

  public refreshGitHubWorkflows(): void {
    const actor = this.state.currentUser;
    const updatedMeta: GitHubRepoMetadata = {
      ...this.state.githubMetadata,
      lastSyncedAt: new Date().toISOString(),
    };
    this.saveState({ ...this.state, githubMetadata: updatedMeta });
    this.appendAuditLog('GITHUB_SYNC_REFRESH', `GitHub repository metadata verified by ${actor.name}`);
  }

  public getLocalSyncReport(): LocalSyncReport {
    return this.state.localSyncReport;
  }

  public ingestLocalSyncReport(
    payload: any,
    authToken: string
  ): { success: boolean; error?: string; report?: LocalSyncReport } {
    const result = DevelopmentOpsService.validateAndIngestSyncReport(payload, authToken);
    if (!result.success || !result.report) {
      this.appendAuditLog('LOCAL_SYNC_INGESTION_REJECTED', `Unauthorized or invalid sync report rejected: ${result.error}`);
      return result;
    }

    this.saveState({ ...this.state, localSyncReport: result.report });
    this.appendAuditLog(
      'LOCAL_SYNC_INGESTION_SUCCESS',
      `Ingested Windows Sync Controller report from ${result.report.controllerPath} (Status: ${result.report.status}, Commit: ${result.report.localCommit})`
    );

    this.addDevelopmentActivity({
      type: 'LOCAL_SYNC_INGESTED',
      sourceSystem: 'WINDOWS_SYNC_CONTROLLER',
      responsibleActor: result.report.reportedBy,
      component: 'Windows Controller Hub',
      eventStatus: result.report.status === 'SYNCHRONIZED' ? 'SUCCESS' : 'WARNING',
      title: `Windows Drive Status: ${result.report.status}`,
      clientDescription: result.report.sanitizedSummary,
      evidenceReference: `COMMIT: ${result.report.localCommit}`,
    });

    return result;
  }

  public getDevelopmentActivities(): DevelopmentActivityEvent[] {
    return this.state.developmentActivities;
  }

  public addDevelopmentActivity(
    event: Omit<DevelopmentActivityEvent, 'id' | 'timestamp'>
  ): DevelopmentActivityEvent {
    const newEvent: DevelopmentActivityEvent = {
      ...event,
      id: `ACT-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    this.saveState({
      ...this.state,
      developmentActivities: [newEvent, ...this.state.developmentActivities].slice(0, 50),
    });
    return newEvent;
  }

  public getClientFeedbacks(): ClientFeedbackItem[] {
    return this.state.clientFeedbacks;
  }

  public submitClientFeedback(
    item: Omit<ClientFeedbackItem, 'id' | 'submissionDate' | 'status' | 'doesImpactScopeOrBudget'> & {
      doesImpactScopeOrBudget?: boolean;
    }
  ): ClientFeedbackItem {
    const actor = this.state.currentUser;
    const newId = `FB-${(this.state.clientFeedbacks.length + 101).toString()}`;
    const newFeedback: ClientFeedbackItem = {
      ...item,
      id: newId,
      submissionDate: new Date().toISOString(),
      status: 'SUBMITTED',
      doesImpactScopeOrBudget: false,
    };

    this.saveState({
      ...this.state,
      clientFeedbacks: [newFeedback, ...this.state.clientFeedbacks],
    });

    this.appendAuditLog(
      'CLIENT_FEEDBACK_SUBMITTED',
      `Client feedback ${newId} "${item.title}" submitted by ${item.submittedBy} (${item.submitterRole})`
    );

    this.addDevelopmentActivity({
      type: 'CLIENT_FEEDBACK_SUBMITTED',
      sourceSystem: 'CLIENT_PORTAL',
      responsibleActor: `${item.submittedBy} (${item.submitterRole})`,
      component: 'Client Collaboration',
      eventStatus: 'INFO',
      title: `Feedback Submitted: ${item.title}`,
      clientDescription: `${item.submittedBy} submitted ${item.feedbackType} feedback: "${item.title}". Assigned to development team for assessment.`,
      evidenceReference: `REF: ${newId}`,
    });

    return newFeedback;
  }

  public resolveClientFeedback(id: string, resolutionNotes: string): void {
    const actor = this.state.currentUser;
    const item = this.state.clientFeedbacks.find((f) => f.id === id);
    if (!item) return;

    const updated = this.state.clientFeedbacks.map((f) =>
      f.id === id
        ? {
            ...f,
            status: 'RESOLVED' as const,
            resolutionNotes,
            resolvedAt: new Date().toISOString(),
            assignedDeveloper: actor.name,
          }
        : f
    );

    this.saveState({ ...this.state, clientFeedbacks: updated });
    this.appendAuditLog('CLIENT_FEEDBACK_RESOLVED', `Feedback ${id} marked resolved by ${actor.name}: ${resolutionNotes}`);

    this.addDevelopmentActivity({
      type: 'DEFECT_RESOLVED',
      sourceSystem: 'GOOGLE_AI_STUDIO',
      responsibleActor: actor.name,
      component: 'Client Collaboration',
      eventStatus: 'SUCCESS',
      title: `Feedback ${id} Resolved`,
      clientDescription: `Resolution verified by ${actor.name}: "${resolutionNotes}"`,
      evidenceReference: `REF: ${id}`,
    });
  }

  public getChangeRequests(): ChangeRequestItem[] {
    return this.state.changeRequests;
  }

  public submitChangeRequest(
    cr: Omit<ChangeRequestItem, 'id' | 'requestDate' | 'status'>
  ): ChangeRequestItem {
    const newId = `CR-${(this.state.changeRequests.length + 201).toString()}`;
    const newCR: ChangeRequestItem = {
      ...cr,
      id: newId,
      requestDate: new Date().toISOString(),
      status: 'PROPOSED',
    };

    this.saveState({
      ...this.state,
      changeRequests: [newCR, ...this.state.changeRequests],
    });

    this.appendAuditLog(
      'CHANGE_REQUEST_PROPOSED',
      `Formal Change Request ${newId} "${cr.title}" proposed by ${cr.requestedBy} (Impact: $${cr.budgetImpactUSD}, ${cr.scheduleImpactDays} days)`
    );

    return newCR;
  }

  public approveChangeRequest(id: string, approverName: string): void {
    const actor = this.state.currentUser;
    const cr = this.state.changeRequests.find((c) => c.id === id);
    if (!cr) return;

    const updated = this.state.changeRequests.map((c) =>
      c.id === id
        ? {
            ...c,
            status: 'APPROVED' as const,
            approvedBy: approverName,
            approvalDate: new Date().toISOString(),
          }
        : c
    );

    this.saveState({ ...this.state, changeRequests: updated });
    this.appendAuditLog('CHANGE_REQUEST_APPROVED', `Change Request ${id} approved by ${approverName} (Authorized by ${actor.name})`);
  }

  public getProjectDocuments(): ProjectDocumentRecord[] {
    return this.state.projectDocuments;
  }

  public getWeeklyReports(): WeeklyDevelopmentReport[] {
    return this.state.weeklyReports;
  }

  public publishWeeklyReport(
    report: Omit<WeeklyDevelopmentReport, 'id' | 'publishedDate'>
  ): WeeklyDevelopmentReport {
    const newId = `WDR-2026-W${Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % 52}`;
    const newReport: WeeklyDevelopmentReport = {
      ...report,
      id: newId,
      publishedDate: new Date().toISOString(),
    };

    this.saveState({
      ...this.state,
      weeklyReports: [newReport, ...this.state.weeklyReports],
    });

    this.appendAuditLog(
      'WEEKLY_REPORT_PUBLISHED',
      `Weekly Development Report ${newId} published for period "${report.reportingPeriod}"`
    );

    return newReport;
  }
}

export const db = new DatabaseService();

