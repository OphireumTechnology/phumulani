/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform Type Definitions
 */

export type UserRole =
  | 'visitor'
  | 'volunteer'
  | 'donor'
  | 'sponsor'
  | 'staff'
  | 'volunteer_coordinator'
  | 'finance_officer'
  | 'communications_officer'
  | 'executive_director'
  | 'board_member'
  | 'safeguarding_officer'
  | 'super_admin'
  | 'PLATFORM_SUPER_ADMIN' // Phase 8 Master Administrator
  | 'governance_officer'
  | 'program_manager'
  | 'community_advocate'
  | 'community_member'
  // Phase 13 Development Transparency Roles
  | 'DEVELOPMENT_ADMIN'
  | 'DEVELOPER'
  | 'CLIENT_PROJECT_ADMIN'
  | 'CLIENT_PROJECT_VIEWER'
  | 'CLIENT_APPROVER';

export * from './developmentOps';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  avatar?: string;
  mfaEnabled: boolean;
  department?: string;
  permissions: string[];
  status?: 'active' | 'suspended' | 'pending_activation' | 'invited';
  createdAt?: string;
  lastLoginAt?: string;
  phoneNumber?: string;
  invitedBy?: string;
  emergencyRecoveryConfigured?: boolean;
}

// Production Health & Enterprise Status (Phase 8 Section 16)
export type ProductionComponentId =
  | 'FRONTEND'
  | 'BACKEND'
  | 'DATABASE'
  | 'AUTHENTICATION'
  | 'MASTER ADMIN'
  | 'VOLUNTEER PORTAL'
  | 'DONOR PORTAL'
  | 'STAFF PORTAL'
  | 'EXECUTIVE PORTAL'
  | 'AI WORKFORCE'
  | 'EMAIL'
  | 'PAYMENTS'
  | 'BACKUPS'
  | 'SECURITY'
  | 'DEPLOYMENT';

export type ProductionOperationalStatus =
  | 'LIVE'
  | 'OFFLINE'
  | 'UNVERIFIED'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'ACTIVE'
  | 'FAILED'
  | 'PROVISIONED'
  | 'PENDING'
  | 'OPERATIONAL'
  | 'BLOCKED'
  | 'PAUSED'
  | 'DISABLED'
  | 'VERIFIED'
  | 'PASSED'
  | 'CURRENT'
  | 'OUTDATED'
  | 'STAGED_READY'
  | 'SIMULATED_OAUTH_PENDING'
  | 'STAGED_PENDING_AUTH';

export interface ProductionHealthCheckItem {
  id: ProductionComponentId;
  name: string;
  category: 'Core Infrastructure' | 'Operational Dashboards' | 'Enterprise Integrations' | 'Security & Governance';
  status: ProductionOperationalStatus;
  latencyMs: number;
  lastChecked: string;
  targetEndpoint: string;
  verificationEvidence: string;
  isFailClosed: boolean;
}

export interface SystemSettingItem {
  key: string;
  category: 'Organization' | 'Security' | 'AI Workforce' | 'Finance' | 'Communications';
  label: string;
  value: string | boolean | number;
  description: string;
  requiresReauth: boolean;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

// Programs
export type ProgramCategory =
  | 'advocacy'
  | 'workforce'
  | 'financial_literacy'
  | 'mentorship'
  | 'housing'
  | 'entrepreneurship';

export interface Program {
  id: string;
  slug: ProgramCategory;
  name: string;
  tagline: string;
  description: string;
  fullDetails: string;
  beneficiariesCount: number;
  keyServices: string[];
  eligibility: string;
  leadCoordinator: string;
  contactEmail: string;
  iconName: string;
}

// Volunteer Engine
export type ScreeningStatus =
  | 'submitted'
  | 'screening_review'
  | 'background_check'
  | 'orientation_scheduled'
  | 'training_completed'
  | 'approved_active'
  | 'declined'
  | 'inactive';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  programId: string;
  programName: string;
  description: string;
  requirements: string[];
  commitment: string;
  location: string;
  languagesNeeded: string[];
  openSlots: number;
  urgent: boolean;
  active: boolean;
}

export interface VolunteerApplication {
  id: string;
  trackingId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage: string;
  opportunityId: string;
  opportunityTitle: string;
  skills: string[];
  availability: string[];
  motivation: string;
  status: ScreeningStatus;
  aiSuggestedMatchNotes?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  safeguardingAcknowledged: boolean;
}

export interface VolunteerHourLog {
  id: string;
  volunteerId: string;
  volunteerName: string;
  opportunityTitle: string;
  date: string;
  hours: number;
  activityDescription: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

// Donations & Finance
export type PaymentFrequency = 'one_time' | 'monthly' | 'annual';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Campaign {
  id: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  deadline: string;
  description: string;
  featured: boolean;
  impactMetric: string;
}

export interface Donation {
  id: string;
  transactionId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  frequency: PaymentFrequency;
  campaignId: string;
  campaignTitle: string;
  paymentMethod: string;
  status: PaymentStatus;
  isAnonymous: boolean;
  receiptNumber: string;
  createdAt: string;
  reconciled: boolean;
  reconciledAt?: string;
}

// Events
export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  category: string;
  description: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  approved: boolean;
  accessibilityNotes: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  phone: string;
  specialNeeds?: string;
  status: 'confirmed' | 'waitlist' | 'checked_in' | 'cancelled';
  registeredAt: string;
}

// Email Triage & Inbox
export type TriageUrgency = 'urgent' | 'high' | 'normal' | 'low';
export type MessageCategory =
  | 'general_inquiry'
  | 'donation_support'
  | 'volunteer_inquiry'
  | 'partnership'
  | 'media_press'
  | 'safeguarding_concern'
  | 'grant_correspondence';

export interface InboxMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  receivedAt: string;
  body: string;
  category: MessageCategory;
  urgency: TriageUrgency;
  isSafeguardingAlert: boolean;
  assignedStaff?: string;
  status: 'unread' | 'draft_ready' | 'approved' | 'sent' | 'escalated';
  aiDraftReply?: string;
  aiReasoning?: string;
  calendarConflictDetected?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

// AI Workforce (18 Agents)
export type AgentCategory =
  | 'executive'
  | 'community'
  | 'fundraising'
  | 'comms'
  | 'governance'
  | 'safeguarding';

export type AgentStatus = 'active' | 'supervised' | 'shadow' | 'paused';

export interface AIAgent {
  id: string; // e.g. A01 to A18
  name: string;
  role: string;
  category: AgentCategory;
  description: string;
  status: AgentStatus;
  version: string;
  systemPromptSummary: string;
  toolAllowlist: string[];
  restrictedTools: string[];
  requiresHumanApproval: boolean;
  callsThisMonth: number;
  tokenUsage: number;
  costEstimateUSD: number;
  lastEvaluationScore: number; // 0 - 100%
  escalationOfficer: string;
}

export interface AIApprovalTask {
  id: string;
  agentId: string;
  agentName: string;
  taskType: 'email_reply' | 'event_publish' | 'grant_summary' | 'campaign_draft' | 'social_post';
  title: string;
  proposedContent: string;
  contextSummary: string;
  riskScore: 'low' | 'medium' | 'high';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'revised';
  reviewedBy?: string;
  reviewedAt?: string;
}

// Governance & Grants
export interface GrantItem {
  id: string;
  funderName: string;
  opportunityTitle: string;
  amountRequested: number;
  stage: 'research' | 'drafting' | 'internal_review' | 'submitted' | 'awarded' | 'closed';
  deadline: string;
  programTarget: string;
  executiveApproved: boolean;
  aiAssistanceNotes?: string;
}

export interface BoardResolution {
  id: string;
  referenceNo: string;
  title: string;
  meetingDate: string;
  status: 'proposed' | 'passed' | 'deferred';
  summary: string;
  votingResult: string;
}

export interface RiskItem {
  id: string;
  category: 'Safeguarding' | 'Financial' | 'Cybersecurity' | 'Operational' | 'Regulatory';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  owner: string;
  lastReviewed: string;
}

// Restricted Survivor Route
export interface RestrictedIntakeItem {
  id: string;
  anonymousCode: string;
  urgencyLevel: 'immediate_safety' | 'within_24h' | 'general_support';
  preferredContactMethod: 'phone' | 'secure_signal' | 'safe_email' | 'in_person_shelter';
  languageNeeded: string;
  safeTimeToContact: string;
  assignedSpecialist: string;
  status: 'new' | 'contact_attempted' | 'intake_conducted' | 'safe_exit_complete';
  createdAt: string;
  lastUpdated: string;
  notesEncryptedSummary: string;
}

// Audit Log
export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'flagged' | 'denied';
}

// Enterprise Email, Fundraising Intelligence & Executive Communications Types
export * from './emailEnterprise';
export * from './fundraising';
export * from './masterAdmin';
export * from './operations';

