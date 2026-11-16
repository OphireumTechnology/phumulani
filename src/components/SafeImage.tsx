/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Resilient SafeImage Component
 * Automatic base-path resolution, error interception, zero-broken-image guarantees,
 * and culturally attuned fallback rendering for logos, heroes, portraits, programs, and events.
 */

import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/assetPath';
import { Shield, Sparkles, BookOpen, Calendar, Users, Heart } from 'lucide-react';

export type SafeImageFallbackType =
  | 'logo'
  | 'founder'
  | 'hero'
  | 'leadership'
  | 'program'
  | 'event'
  | 'volunteer'
  | 'publication'
  | 'generic';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: SafeImageFallbackType;
  fallbackText?: string;
  fallbackSrc?: string;
  containerClassName?: string;
  initials?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackType = 'generic',
  fallbackText,
  fallbackSrc,
  containerClassName = '',
  initials,
  onError,
  loading = 'lazy',
  ...rest
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => getAssetUrl(src));
  const [triedFallbackSrc, setTriedFallbackSrc] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setResolvedSrc(getAssetUrl(src));
    setTriedFallbackSrc(false);
    setHasError(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If fallbackSrc provided and not yet attempted, try it once
    if (fallbackSrc && !triedFallbackSrc) {
      setTriedFallbackSrc(true);
      setResolvedSrc(getAssetUrl(fallbackSrc));
      return;
    }

    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  // Render Fallback if image failed to load or no src provided
  if (hasError || !resolvedSrc) {
    if (fallbackType === 'logo') {
      return (
        <div
          role="img"
          aria-label={alt || 'Phumulani Organization Logo'}
          className={`flex items-center justify-center bg-phumulani-earth text-white rounded-lg shadow-xs select-none ${className}`}
        >
          <div className="flex items-center justify-center font-serif font-black text-phumulani-gold text-lg tracking-wider">
            P
          </div>
        </div>
      );
    }

    if (fallbackType === 'founder') {
      return (
        <div
          role="img"
          aria-label={alt || 'Comfort Dondo, Founder and Executive Director of Phumulani'}
          className={`flex flex-col items-center justify-center bg-gradient-to-br from-phumulani-earth to-phumulani-charcoal text-white shadow-md border-2 border-phumulani-gold select-none ${className}`}
        >
          <span className="font-serif font-black text-phumulani-gold text-xl tracking-wider">
            {initials || 'CD'}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-phumulani-cream mt-0.5">
            Founder
          </span>
        </div>
      );
    }

    if (fallbackType === 'hero') {
      return (
        <div
          role="img"
          aria-label={alt || 'Phumulani Community Sanctuary and Sisterhood'}
          className={`relative overflow-hidden bg-gradient-to-br from-phumulani-earth to-phumulani-charcoal text-white flex flex-col justify-between p-6 ${className}`}
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-phumulani-charcoal bg-phumulani-gold px-2 py-0.5 rounded">
              Cultural Sanctuary
            </span>
            <h4 className="font-serif text-lg font-bold text-white pt-1">
              Phumulani Sisterhood &amp; Healing
            </h4>
          </div>
          <p className="text-xs text-phumulani-cream leading-relaxed max-w-sm">
            {fallbackText || 'A safe, culturally grounded haven empowering African immigrant and refugee survivors in Minnesota.'}
          </p>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-phumulani-gold">
            <Shield className="w-3.5 h-3.5" />
            <span>Peace · Rest · Autonomy</span>
          </div>
        </div>
      );
    }

    if (fallbackType === 'leadership') {
      return (
        <div
          role="img"
          aria-label={alt || 'Leadership Representative'}
          className={`flex items-center justify-center bg-gradient-to-br from-phumulani-earth to-phumulani-charcoal text-white rounded-xl shadow-xs select-none font-bold text-sm tracking-wider ${className}`}
        >
          <span>{initials || (alt ? alt.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'PL')}</span>
        </div>
      );
    }

    if (fallbackType === 'program') {
      return (
        <div
          role="img"
          aria-label={alt || 'Phumulani Community Program'}
          className={`flex flex-col items-center justify-center bg-phumulani-cream text-phumulani-earth border border-phumulani-earth p-4 text-center select-none ${className}`}
        >
          <Sparkles className="w-8 h-8 text-phumulani-earth mb-2" />
          <span className="font-serif font-bold text-xs text-phumulani-charcoal line-clamp-1">
            {fallbackText || alt || 'Community Program'}
          </span>
          <span className="text-[10px] text-phumulani-earth font-semibold mt-0.5">Phumulani Initiative</span>
        </div>
      );
    }

    if (fallbackType === 'event') {
      return (
        <div
          role="img"
          aria-label={alt || 'Community Event'}
          className={`flex flex-col items-center justify-center bg-phumulani-cream text-phumulani-earth border border-phumulani-gold p-4 text-center select-none ${className}`}
        >
          <Calendar className="w-8 h-8 text-phumulani-earth mb-2" />
          <span className="font-serif font-bold text-xs text-phumulani-charcoal line-clamp-1">
            {fallbackText || alt || 'Community Gathering'}
          </span>
          <span className="text-[10px] text-phumulani-earth font-semibold mt-0.5">Phumulani Community</span>
        </div>
      );
    }

    if (fallbackType === 'volunteer') {
      return (
        <div
          role="img"
          aria-label={alt || 'Volunteer Community'}
          className={`flex flex-col items-center justify-center bg-phumulani-cream text-phumulani-earth p-4 text-center select-none ${className}`}
        >
          <Users className="w-8 h-8 text-phumulani-earth mb-2" />
          <span className="font-serif font-bold text-xs text-phumulani-charcoal">
            {fallbackText || alt || 'Community Volunteer Service'}
          </span>
        </div>
      );
    }

    if (fallbackType === 'publication') {
      return (
        <div
          role="img"
          aria-label={alt || 'Authored Publication'}
          className={`flex flex-col items-center justify-center bg-phumulani-charcoal text-phumulani-gold p-4 border border-phumulani-gold text-center select-none ${className}`}
        >
          <BookOpen className="w-8 h-8 text-phumulani-gold mb-2" />
          <span className="font-serif font-bold text-xs text-white line-clamp-2">
            {fallbackText || alt || 'Comfort Dondo Publication'}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-phumulani-gold font-semibold mt-1">
            Survivor Literature
          </span>
        </div>
      );
    }

    // Default Generic Fallback
    return (
      <div
        role="img"
        aria-label={alt || 'Phumulani Visual Asset'}
        className={`flex items-center justify-center bg-phumulani-cream text-phumulani-charcoal p-2 text-center text-xs select-none ${className}`}
      >
        <span className="font-medium text-[11px] text-phumulani-charcoal">{fallbackText || alt || 'Phumulani Asset'}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading={loading}
      referrerPolicy="no-referrer"
      {...rest}
    />
  );
};
