/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Asset Path Resolver
 * Ensures asset paths resolve correctly across local development,
 * preview environments, and GitHub Pages production subdirectories (/phumulani/).
 */

export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  
  // Data URIs, absolute URLs, or blob URLs are returned unmodified
  if (/^(?:https?:\/\/|data:|blob:)/i.test(path)) {
    return path;
  }

  // Vite sets import.meta.env.BASE_URL according to the `base` option in vite.config.ts
  let baseUrl = '/';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.BASE_URL === 'string') {
      baseUrl = import.meta.env.BASE_URL;
    }
  } catch {
    baseUrl = '/';
  }

  // Runtime defense: if running in browser and location has /phumulani/ subpath (e.g. GitHub Pages) but BASE_URL was root:
  if (typeof window !== 'undefined' && window.location) {
    const pathname = window.location.pathname || '';
    if (pathname.startsWith('/phumulani/') && !baseUrl.includes('/phumulani/')) {
      baseUrl = '/phumulani/';
    }
  }

  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanBase = prefix.replace(/^\/+/, '').replace(/\/+$/, '');

  // Strip leading slash
  let cleanPath = path.replace(/^\/+/, '');

  // Idempotency: if cleanPath already begins with cleanBase or 'phumulani/', strip it
  if (cleanBase && cleanPath.startsWith(`${cleanBase}/`)) {
    cleanPath = cleanPath.slice(cleanBase.length + 1);
  } else if (cleanPath.startsWith('phumulani/')) {
    cleanPath = cleanPath.slice('phumulani/'.length);
  }

  return `${prefix}${cleanPath}`;
}
