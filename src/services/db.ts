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
  User,
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
}

function getInitialState(): AppDatabaseState {
  return {
    currentUser: INITIAL_USERS[0], // Default: Comfort Dondo (Executive Director)
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
  };
}

class DatabaseService {
  private state: AppDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppDatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all required fields exist
        return { ...getInitialState(), ...parsed };
      }
    } catch {
      // Fallback if parsing fails
    }
    const initial = getInitialState();
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
      actorEmail: user.email,
      actorRole: user.role,
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
}

export const db = new DatabaseService();
