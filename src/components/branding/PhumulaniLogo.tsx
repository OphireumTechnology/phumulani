/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Official Mosaic USA Logo Component
 * Source of Truth: /public/assets/aistudio/Phumulani_Mosaic_USA_Logo_3269971f.png
 * Brand Identity Guide: /public/assets/aistudio/Phumulani_Brand_Identity_Guide_23b89f10.png
 */

import React, { useState } from 'react';
import { getAssetUrl } from '../../utils/assetPath';

export type LogoVariant = 'full' | 'emblem' | 'mark' | 'horizontal';

export interface PhumulaniLogoProps {
  variant?: LogoVariant;
  className?: string;
  height?: number | string;
  width?: number | string;
  size?: number | string;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  surface?: 'transparent' | 'white' | 'cream';
  enforceClearSpace?: boolean;
  alt?: string;
  onClick?: () => void;
}

export const PhumulaniLogo: React.FC<PhumulaniLogoProps> = ({
  variant = 'full',
  className = '',
  height,
  width,
  size,
  surface = 'transparent',
  enforceClearSpace = false,
  alt = 'Phumulani — The voice of immigrants and refugees in America',
  onClick,
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const effectiveHeight = height ?? size;
  const effectiveWidth = width ?? (variant === 'mark' ? size : undefined);

  // Asset mapping based on variant with base-path safety
  let rawSrc = 'images/branding/phumulani-logo-primary.png';
  let rawFallbackSrc = 'media/branding/phumulani-logo-primary.png';
  let aspectRatio = 'aspect-[2131/556]';

  if (variant === 'emblem') {
    rawSrc = 'images/branding/phumulani-logo-emblem.png';
    rawFallbackSrc = 'media/branding/phumulani-logo-emblem.png';
    aspectRatio = 'aspect-[861/556]';
  } else if (variant === 'mark') {
    rawSrc = 'images/branding/phumulani-logo-mark.png';
    rawFallbackSrc = 'media/branding/phumulani-logo-mark.png';
    aspectRatio = 'aspect-square';
  }

  const src = getAssetUrl(rawSrc);
  const fallbackSrc = getAssetUrl(rawFallbackSrc);

  // Fallback rendering if asset fails
  if (hasError) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="w-9 h-9 rounded-lg bg-phumulani-earth flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
          PH
        </div>
        <div>
          <div className="font-heading font-extrabold text-base tracking-tight text-phumulani-earth leading-none">
            PHUMULANI
          </div>
          <div className="font-merriweather italic text-[11px] text-phumulani-charcoal leading-tight">
            The voice of immigrants and refugees in America
          </div>
        </div>
      </div>
    );
  }

  const style: React.CSSProperties = {
    height: effectiveHeight !== undefined ? effectiveHeight : undefined,
    width: effectiveWidth !== undefined ? effectiveWidth : undefined,
  };

  const surfaceClass =
    surface === 'white'
      ? 'bg-white rounded-xl'
      : surface === 'cream'
      ? 'bg-phumulani-cream rounded-xl'
      : '';
  const clearSpaceClass = enforceClearSpace ? 'p-[6%]' : '';

  const imgEl = (
    <img
      src={useFallback ? fallbackSrc : src}
      onError={() => {
        if (!useFallback) {
          setUseFallback(true);
        } else {
          setHasError(true);
        }
      }}
      alt={alt}
      style={style}
      onClick={surface === 'transparent' && !enforceClearSpace ? onClick : undefined}
      className={`object-contain shrink-0 max-w-full select-none ${aspectRatio} ${surface === 'transparent' && !enforceClearSpace ? className : ''}`}
      loading="eager"
      decoding="async"
    />
  );

  if (surface !== 'transparent' || enforceClearSpace) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center justify-center ${surfaceClass} ${clearSpaceClass} ${className}`}
      >
        {imgEl}
      </span>
    );
  }

  return imgEl;
};

export const PhumulaniLogoFull: React.FC<Omit<PhumulaniLogoProps, 'variant'>> = (props) => (
  <PhumulaniLogo variant="full" {...props} />
);

export const PhumulaniLogoMark: React.FC<Omit<PhumulaniLogoProps, 'variant'>> = (props) => (
  <PhumulaniLogo variant="mark" {...props} />
);

export default PhumulaniLogo;
