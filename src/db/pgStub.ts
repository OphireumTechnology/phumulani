/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Browser stub for 'pg' module to prevent browser syntax errors
 * Real PostgreSQL connections are executed exclusively server-side in Node.js
 */

export class Pool {
  constructor(_config?: any) {}

  async connect() {
    return {
      query: async () => ({ rows: [] }),
      release: () => {},
    };
  }

  async query(_queryText: string, _values?: any[]) {
    return { rows: [], rowCount: 0 };
  }

  async end() {}

  on(_event: string, _handler: any) {
    return this;
  }
}

const pgStub = {
  Pool,
  default: {
    Pool,
  },
};

export default pgStub;
