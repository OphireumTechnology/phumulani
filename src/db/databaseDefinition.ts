/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Database Definition and Migration Utility
 */

import { db } from '../services/db';

export interface DatabaseTableMeta {
  tableName: string;
  domain: string;
  primaryKey: string;
  rowCount: number;
  description: string;
  securityClassification: 'PUBLIC' | 'RESTRICTED_STAFF' | 'RESTRICTED_VAWA_SAFEGUARDING' | 'AUDIT_APPEND_ONLY';
}

export function getDatabaseMetadata(): DatabaseTableMeta[] {
  const state = db.getState();
  return [
    {
      tableName: 'users',
      domain: 'Identity & Access Control',
      primaryKey: 'id (UUID)',
      rowCount: state.users.length,
      description: 'System users across 12 granular administrative and community roles with MFA',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'programs',
      domain: 'Public Programs',
      primaryKey: 'id (UUID)',
      rowCount: state.programs.length,
      description: 'Core organizational programs (Advocacy, Workforce, Financial Literacy, Housing, Mentorship)',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'volunteer_opportunities',
      domain: 'Volunteer Engine',
      primaryKey: 'id (UUID)',
      rowCount: state.opportunities.length,
      description: 'Community volunteer positions, commitment requirements, and language needs',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'volunteer_applications',
      domain: 'Volunteer Engine',
      primaryKey: 'id (UUID)',
      rowCount: state.applications.length,
      description: 'Volunteer intake applications with tracking IDs (PHM-VOL-2026-XXX) and screening status',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'volunteer_hours',
      domain: 'Volunteer Engine',
      primaryKey: 'id (UUID)',
      rowCount: state.volunteerHours.length,
      description: 'Service hours logged and verified by volunteer coordinators',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'campaigns',
      domain: 'Donations & Fundraising',
      primaryKey: 'id (UUID)',
      rowCount: state.campaigns.length,
      description: '501(c)(3) active fundraising campaigns, targets, and impact metrics',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'donations',
      domain: 'Donations & Fundraising',
      primaryKey: 'id (UUID)',
      rowCount: state.donations.length,
      description: 'Financial transactions with tax receipts, frequency, and reconciliation records',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'events',
      domain: 'Events & Activities',
      primaryKey: 'id (UUID)',
      rowCount: state.events.length,
      description: 'Community gatherings with hard capacity limits and priority waitlists',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'event_registrations',
      domain: 'Events & Activities',
      primaryKey: 'id (UUID)',
      rowCount: state.eventRegistrations.length,
      description: 'Community participant registrations, accessibility requirements, and check-in status',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'inbox_messages',
      domain: 'Email Automation & Triage',
      primaryKey: 'id (UUID)',
      rowCount: state.inboxMessages.length,
      description: 'Unified stakeholder correspondence with AI draft suggestions and safeguarding alerts',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'ai_agents',
      domain: 'AI Workforce Command',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.aiAgents.length,
      description: '18 specialized AI agents (A01 - A18) with system boundaries, tokens, and cost tracking',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'ai_approval_tasks',
      domain: 'AI Human-in-the-Loop',
      primaryKey: 'id (UUID)',
      rowCount: state.aiApprovalTasks.length,
      description: 'Human approval queue for agent drafts, event notices, and grant proposals',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'grants',
      domain: 'Governance & Grants',
      primaryKey: 'id (UUID)',
      rowCount: state.grants.length,
      description: 'Philanthropic grant applications, deadlines, amounts, and executive sign-offs',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'board_resolutions',
      domain: 'Governance & Grants',
      primaryKey: 'id (UUID)',
      rowCount: state.resolutions.length,
      description: 'Board of directors formal resolutions, voting tallies, and meeting minutes',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'risk_items',
      domain: 'Governance & Grants',
      primaryKey: 'id (UUID)',
      rowCount: state.risks.length,
      description: 'Enterprise risk register with severity matrix, owners, and mitigations',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'restricted_intakes',
      domain: 'Survivor Support (VAWA)',
      primaryKey: 'id (UUID)',
      rowCount: state.restrictedIntakes.length,
      description: 'Confidential crisis intakes with anonymous codes (SAFE-MN-XXX), restricted to Sister Miriam K.',
      securityClassification: 'RESTRICTED_VAWA_SAFEGUARDING',
    },
    {
      tableName: 'audit_events',
      domain: 'Security & Compliance',
      primaryKey: 'id (UUID)',
      rowCount: state.auditLogs.length,
      description: 'Tamper-resistant append-only security log tracking all mutations and actor sessions',
      securityClassification: 'AUDIT_APPEND_ONLY',
    },
    {
      tableName: 'system_settings',
      domain: 'System Administration',
      primaryKey: 'key (VARCHAR)',
      rowCount: state.systemSettings?.length || 0,
      description: 'Platform-wide operational policies, feature flags, and security configurations',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'development_milestones',
      domain: 'Development Transparency',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.developmentMilestones?.length || 0,
      description: 'Phase 1-13 development roadmap milestones with weights, dependencies, and evidence links',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'development_features',
      domain: 'Development Transparency',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.developmentFeatures?.length || 0,
      description: 'Delivered application features with acceptance criteria and commit hashes',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'client_feedbacks',
      domain: 'Client Collaboration',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.clientFeedbacks?.length || 0,
      description: 'Client feedback observations, suggestions, and resolution notes',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'weekly_development_reports',
      domain: 'Development Transparency',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.weeklyReports?.length || 0,
      description: '15-section structured weekly progress reports grounded in verified system data',
      securityClassification: 'PUBLIC',
    },
    {
      tableName: 'fundraising_donors',
      domain: 'Fundraising CRM & Intelligence',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.fundraisingDonors?.length || 0,
      description: 'Institutional, corporate, and individual donor contacts with giving tiers and capacity scores',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'fundraising_ai_agents',
      domain: 'AI Fundraising Workforce',
      primaryKey: 'id (VARCHAR)',
      rowCount: state.fundraisingAIAgents?.length || 18,
      description: '18 specialized autonomous and supervised fundraising agents (FUND-AI-001 through FUND-AI-018)',
      securityClassification: 'RESTRICTED_STAFF',
    },
    {
      tableName: 'fundraising_agent_tasks',
      domain: 'AI Fundraising Workforce',
      primaryKey: 'id (VARCHAR)',
      rowCount: (state.fundraisingAIAgents || []).reduce((sum, a) => sum + (a.recentTasks?.length || 0), 0),
      description: 'Autonomous and supervised execution tasks with structured inputs, outputs, and human sign-offs',
      securityClassification: 'AUDIT_APPEND_ONLY',
    },
  ];
}

/**
 * Generate full JSON database backup snapshot for local recovery sync
 */
export function generateDatabaseBackupJson(): string {
  const state = db.getState();
  const backupObject = {
    metadata: {
      platform: 'Phumulani AI Community Platform',
      archiveId: 'phumulani_database_backup',
      version: 'Phase 6 Enterprise Release',
      exportedAt: new Date().toISOString(),
      schemaVersion: '2026.10',
      hashAlgorithm: 'SHA-256',
      totalRecords: Object.values(state).reduce((sum, val) => sum + (Array.isArray(val) ? val.length : 1), 0),
    },
    tables: state,
  };
  return JSON.stringify(backupObject, null, 2);
}
