/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Browser stub for 'crypto' module to prevent browser runtime errors in Vite
 */

export function randomBytes(size: number): { toString: (enc?: string) => string } {
  const bytes = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return {
    toString: (_encoding?: string) => {
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    },
  };
}

export function createHash(_algo: string) {
  let content = '';
  return {
    update(data: any) {
      content += String(data);
      return this;
    },
    digest(_enc?: string) {
      let h1 = 0xdeadbeef;
      let h2 = 0x41c6ce57;
      for (let i = 0; i < content.length; i++) {
        const ch = content.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
      const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
      return (hex1 + hex2).repeat(4);
    },
  };
}

export function createHmac(_algo: string, _secret: string) {
  return createHash(_algo);
}

export function timingSafeEqual(a: any, b: any): boolean {
  const strA = typeof a?.toString === 'function' ? a.toString() : String(a);
  const strB = typeof b?.toString === 'function' ? b.toString() : String(b);
  if (strA.length !== strB.length) return false;
  let mismatch = 0;
  for (let i = 0; i < strA.length; i++) {
    mismatch |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return mismatch === 0;
}

export function pbkdf2Sync(
  password: string,
  salt: string,
  iterations: number,
  keylen: number,
  _digest: string
) {
  const combined = password + salt + iterations;
  const hash = createHash('sha256').update(combined).digest('hex');
  return {
    toString: (_enc?: string) => hash.substring(0, keylen * 2),
  };
}

const cryptoStub = {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
  pbkdf2Sync,
  default: {
    randomBytes,
    createHash,
    createHmac,
    timingSafeEqual,
    pbkdf2Sync,
  },
};

export default cryptoStub;
