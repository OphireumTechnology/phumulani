/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Connection Health Service (Phase 62)
 */

import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { ConnectionHealth } from '../types';

export class EmailHealthService {
  private static instance: EmailHealthService;

  private constructor() {}

  public static getInstance(): EmailHealthService {
    if (!EmailHealthService.instance) {
      EmailHealthService.instance = new EmailHealthService();
    }
    return EmailHealthService.instance;
  }

  public async checkHealth(connectionId: string): Promise<ConnectionHealth> {
    return connectorRegistry.checkConnectionHealth(connectionId);
  }

  public async checkAllHealth(): Promise<Record<string, ConnectionHealth>> {
    const connections = connectorRegistry.getAllConnections();
    const results: Record<string, ConnectionHealth> = {};

    for (const conn of connections) {
      results[conn.id] = await connectorRegistry.checkConnectionHealth(conn.id);
    }

    return results;
  }

  public async checkAllMailboxes(): Promise<{ totalMailboxes: number; healthyCount: number; results: Record<string, ConnectionHealth> }> {
    const results = await this.checkAllHealth();
    const totalMailboxes = Object.keys(results).length;
    const healthyCount = Object.values(results).filter((h: any) => h.isHealthy ?? h.healthy).length;
    return {
      totalMailboxes,
      healthyCount,
      results,
    };
  }
}

export const emailHealthService = EmailHealthService.getInstance();
