/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Browser stub for 'child_process' module to prevent browser runtime errors in Vite
 */

export function spawnSync(_command?: string, _args?: string[], _options?: any): {
  status: number | null;
  stdout: string | Buffer;
  stderr: string | Buffer;
  error?: Error;
} {
  return {
    status: 0,
    stdout: '',
    stderr: '',
  };
}

export function spawn(_command?: string, _args?: string[], _options?: any): any {
  return {
    on: () => {},
    stdout: { on: () => {} },
    stderr: { on: () => {} },
  };
}

export function execSync(_command?: string, _options?: any): string {
  return '';
}

export function exec(_command?: string, _callback?: any): any {
  return {};
}

const childProcessStub = {
  spawnSync,
  spawn,
  execSync,
  exec,
  default: {
    spawnSync,
    spawn,
    execSync,
    exec,
  },
};

export default childProcessStub;
