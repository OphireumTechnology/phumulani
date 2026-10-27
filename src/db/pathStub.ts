/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Browser stub for 'path' module to prevent browser runtime errors in Vite
 */

export function resolve(...args: (string | undefined)[]): string {
  const parts: string[] = [];
  for (const arg of args) {
    if (arg) {
      if (arg.startsWith('/')) {
        parts.length = 0;
      }
      parts.push(...arg.split('/').filter(Boolean));
    }
  }
  return '/' + parts.join('/');
}

export function join(...args: (string | undefined)[]): string {
  return args.filter(Boolean).join('/').replace(/\/+/g, '/');
}

export function dirname(p: string): string {
  const parts = p.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

export function basename(p: string): string {
  return p.split('/').filter(Boolean).pop() || '';
}

const pathStub = {
  resolve,
  join,
  dirname,
  basename,
  default: {
    resolve,
    join,
    dirname,
    basename,
  },
};

export default pathStub;
