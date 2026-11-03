/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Mailbox Connection Service (Phase 62)
 * Grounded in Section 7 & Section 8 of Phase 62 Directive:
 * Supports dynamic, database-driven mailbox registration with capacity controls.
 */

import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { RegisteredMailbox, EmailProviderType, ConnectorWizardState } from '../types';

export class MailboxConnectionService {
  private static instance: MailboxConnectionService;
  private readonly MAX_CAPACITY = 50; // Practical capacity limit per organization instance

  private constructor() {}

  public static getInstance(): MailboxConnectionService {
    if (!MailboxConnectionService.instance) {
      MailboxConnectionService.instance = new MailboxConnectionService();
    }
    return MailboxConnectionService.instance;
  }

  /**
   * List all registered mailboxes
   */
  public listMailboxes(orgId?: string): RegisteredMailbox[] {
    const connections = connectorRegistry.getAllConnections();
    const mailboxes = connections.map((conn) => ({
      id: conn.id,
      emailAddress: conn.emailAddress,
      displayName: conn.displayName,
      providerType: conn.provider,
      departmentId: conn.department,
      ownerUserId: conn.accountOwner,
      accessClassification: conn.safeguardingClassification,
      connectionStatus: conn.authStatus,
      inboundStatus: (conn.authStatus === 'CONNECTED' ? 'ACTIVE' : conn.authStatus === 'AUTHORIZATION_REQUIRED' ? 'AUTHORIZATION_REQUIRED' : 'PAUSED') as 'ACTIVE' | 'AUTHORIZATION_REQUIRED' | 'DISCONNECTED' | 'PAUSED',
      outboundStatus: conn.sendingPermission as any,
      lastSuccessfulSyncAt: conn.lastSuccessfulSyncAt || undefined,
      lastConnectionCheckAt: conn.currentEvidence?.timestamp || undefined,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      organizationId: 'org-phumulani-main',
    }));

    if (orgId && orgId !== 'org-phumulani-main') {
      return [];
    }
    return mailboxes;
  }

  public getMailboxes(orgId?: string): RegisteredMailbox[] {
    return this.listMailboxes(orgId);
  }

  public canRegisterMoreMailboxes(maxLimit: number = this.MAX_CAPACITY): boolean {
    return connectorRegistry.getAllConnections().length < maxLimit;
  }

  /**
   * Register a new mailbox account dynamically (database-driven)
   */
  public async registerMailbox(params: any): Promise<any> {
    const existing = connectorRegistry.getAllConnections();
    if (existing.length >= this.MAX_CAPACITY) {
      throw new Error(`CAPACITY_LIMIT_EXCEEDED: Cannot exceed maximum capacity of ${this.MAX_CAPACITY} registered mailboxes.`);
    }

    const email = (params.emailAddress || '').trim().toLowerCase();
    const duplicate = existing.find((c) => c.emailAddress.toLowerCase() === email);
    if (duplicate) {
      return {
        id: duplicate.id,
        emailAddress: duplicate.emailAddress,
        displayName: duplicate.displayName,
        providerType: duplicate.provider,
      };
    }

    try {
      const conn = await connectorRegistry.registerWizardConnection({
        currentStep: 6,
        emailAddress: email,
        selectedProvider: params.providerType || params.selectedProvider || 'GOOGLE',
        authMethod: params.authMethod || 'OAUTH_PKCE',
        credentials: params.credentials || {},
        syncPreferences: {
          selectedFolders: params.selectedFolders || ['INBOX', 'SENT'],
          historicalImportPeriod: params.historicalImportPeriod || 'LAST_90_DAYS',
          syncFrequencyMinutes: params.syncFrequencyMinutes || 15,
          departmentAssignment: params.department || params.purpose || 'General Operations',
          mailboxOwner: params.owner || 'Operations Coordinator',
          safeguardingClassification: params.isSafeguarded ? 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP' : 'GENERAL',
        },
        isComplete: true,
      });

      return {
        id: conn.id,
        emailAddress: conn.emailAddress,
        displayName: conn.displayName,
        providerType: conn.provider,
        departmentId: conn.department,
        ownerUserId: conn.accountOwner,
        accessClassification: conn.safeguardingClassification,
        connectionStatus: conn.authStatus,
        inboundStatus: conn.authStatus === 'CONNECTED' ? 'ACTIVE' : 'PAUSED',
        outboundStatus: conn.sendingPermission,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
        organizationId: params.organizationId || 'org-phumulani-main',
      };
    } catch (err: any) {
      throw new Error(err.message || 'Failed to register mailbox.');
    }
  }

  /**
   * Update mailbox operational settings
   */
  public async updateMailboxSettings(
    id: string,
    updates: Partial<{ displayName: string; department: string; accountOwner: string }>
  ): Promise<boolean> {
    const conn = connectorRegistry.getConnection(id);
    if (!conn) return false;

    if (updates.displayName) conn.displayName = updates.displayName;
    if (updates.department) conn.department = updates.department;
    if (updates.accountOwner) conn.accountOwner = updates.accountOwner;
    conn.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * Remove or disconnect a mailbox
   */
  public async removeMailbox(id: string): Promise<boolean> {
    return connectorRegistry.deleteConnection(id);
  }
}

export const mailboxConnectionService = MailboxConnectionService.getInstance();
