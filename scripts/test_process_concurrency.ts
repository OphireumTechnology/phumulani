/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Multi-Process Concurrency Verification (M39.09)
 * Tests two independent Node.js processes writing concurrently to PostgresPersistenceAdapter,
 * validating mutex write queues, atomic file flushing, and absence of record corruption.
 */

import { PostgresPersistenceAdapter } from '../src/services/postgresPersistenceAdapter';
import path from 'path';

const WRITER_ID = process.argv.find((a) => a.startsWith('--writer='))?.split('=')[1] || 'writer-default';
const COUNT = parseInt(process.argv.find((a) => a.startsWith('--count='))?.split('=')[1] || '5', 10);

async function runConcurrentWriter() {
  process.env.PHUMULANI_OPERATIONAL_MODE = 'STAGED_DEVELOPMENT';
  const adapter = PostgresPersistenceAdapter.getInstance();
  await adapter.initialize();

  const writtenIds: string[] = [];
  for (let i = 0; i < COUNT; i++) {
    const id = `rec-conc-${WRITER_ID}-${Date.now()}-${i}`;
    await adapter.insert('p39_concurrency_records', {
      id,
      writerId: WRITER_ID,
      index: i,
      timestamp: new Date().toISOString(),
      payload: `payload_from_${WRITER_ID}_item_${i}`,
    });
    writtenIds.push(id);
    // Brief natural jitter
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  console.log(JSON.stringify({ writerId: WRITER_ID, recordsWritten: writtenIds.length, writtenIds }));
  process.exit(0);
}

runConcurrentWriter().catch((err) => {
  console.error(JSON.stringify({ writerId: WRITER_ID, error: String(err) }));
  process.exit(1);
});
