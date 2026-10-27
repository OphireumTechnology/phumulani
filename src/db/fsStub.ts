/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Browser stub for 'fs' module to prevent browser runtime errors in Vite
 */

export function existsSync(_path: string): boolean {
  return false;
}

export function readFileSync(_path: string, _encoding?: string): string {
  return '';
}

export function writeFileSync(_path: string, _data: any, _encoding?: string): void {}

export function mkdirSync(_path: string, _options?: any): void {}

export function renameSync(_oldPath: string, _newPath: string): void {}

const fsStub = {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  renameSync,
  default: {
    existsSync,
    readFileSync,
    writeFileSync,
    mkdirSync,
    renameSync,
  },
};

export default fsStub;
