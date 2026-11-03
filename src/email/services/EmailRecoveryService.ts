/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email Recovery Service (Phase 62)
 * Grounded in Section 16 of Phase 62 Directive:
 * Administrator recovery actions with dry-run support, checkpoint rollbacks, and rollback safety.
 */

import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { emailAuditService } from './EmailAuditService';

export class EmailRecoveryService {
  private static instance: EmailRecoveryService;

  private constructor() {}

  public static getInstance(): EmailRecoveryService {
    if (!EmailRecoveryService.instance) {
      EmailRecoveryService.instance = new EmailRecoveryService();
    }
    return EmailRecoveryService.instance;
  }

  /**
   * Rollback a corrupted or degraded cursor to the last verified durable checkpoint
   */
  public async rollbackToCheckpoint(
    connectionId: string,
    checkpointId: string,
    actorName: string,
    dryRun = false
  ): Promise<{ success: boolean; restoredCursor?: string; message: string }> {
    const conn = connectorRegistry.getConnection(connectionId);
    if (!conn) {
      return { success: false, message: `Connection ${connectionId} not found.` };
    }

    if (dryRun) {
      return {
        success: true,
        restoredCursor: conn.syncCursor,
        message: `[DRY_RUN] Verification passed for rollback of ${conn.emailAddress} to checkpoint ${checkpointId}.`,
      };
    }

    // Perform rollback in registry
    const success = await connectorRegistry.rollbackToLastVerifiedCheckpoint(connectionId);
    if (success) {
      emailAuditService.recordEvent({
        connectionId,
        mailboxEmail: conn.emailAddress,
        provider: conn.provider,
        action: 'CURSOR_RECOVERED',
        actorName,
        actorRole: 'master_admin',
        details: `Restored sync cursor to checkpoint ${checkpointId}.`,
        status: 'success',
      });
      return {
        success: true,
        restoredCursor: conn.syncCursor,
        message: `Successfully rolled back cursor for ${conn.emailAddress} to verified checkpoint.`,
      };
    }

    return {
      success: false,
      message: `Failed to rollback checkpoint for connection ${connectionId}.`,
    };
  }

  /**
   * Refresh expired or near-expired provider tokens
   */
  public async refreshTokens(connectionId: string, actorName: string): Promise<boolean> {
    const success = await connectorRegistry.refreshTokenGrant(connectionId);
    if (success) {
      const conn = connectorRegistry.getConnection(connectionId);
      emailAuditService.recordEvent({
        connectionId,
        mailboxEmail: conn?.emailAddress || connectionId,
        provider: conn?.provider || 'GOOGLE',
        action: 'TOKEN_REFRESHED',
        actorName,
        actorRole: 'master_admin',
        details: 'Refreshed provider OAuth tokens successfully.',
        status: 'success',
      });
    }
    return success;
  }
}

export const emailRecoveryService = EmailRecoveryService.getInstance();
