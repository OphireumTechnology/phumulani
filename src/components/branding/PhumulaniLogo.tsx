/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Official Mosaic USA Logo Component
 * Source of Truth: /public/assets/aistudio/Phumulani_Mosaic_USA_Logo_3269971f.png
 * Brand Identity Guide: /public/assets/aistudio/Phumulani_Brand_Identity_Guide_23b89f10.png
 */

import React, { useState } from 'react';

export type LogoVariant = 'full' | 'emblem' | 'mark' | 'horizontal';

export interface PhumulaniLogoProps {
  variant?: LogoVariant;
  className?: string;
  height?: number | string;
  width?: number | string;
  size?: number | string;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  alt?: string;
  onClick?: () => void;
}

export const PhumulaniLogo: React.FC<PhumulaniLogoProps> = ({
  variant = 'full',
  className = '',
  height,
  width,
  size,
  theme = 'light',
  alt = 'Phumulani — The voice of immigrants and refugees in America',
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const effectiveHeight = height ?? size;
  const effectiveWidth = width ?? (variant === 'mark' ? size : undefined);

  // Asset mapping based on variant
  let src = '/images/branding/phumulani-logo-primary.png';
  let fallbackSrc = '/media/branding/phumulani-logo-primary.png';
  let aspectRatio = 'aspect-[2131/556]';

  if (variant === 'emblem') {
    src = '/images/branding/phumulani-logo-emblem.png';
    fallbackSrc = '/media/branding/phumulani-logo-emblem.png';
    aspectRatio = 'aspect-[861/556]';
  } else if (variant === 'mark') {
    src = '/images/branding/phumulani-logo-mark.png';
    fallbackSrc = '/media/branding/phumulani-logo-mark.png';
    aspectRatio = 'aspect-square';
  }

  // Fallback rendering if asset fails
  if (hasError) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="w-9 h-9 rounded-lg bg-[#006D6F] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
          PH
        </div>
        <div>
          <div className="font-heading font-extrabold text-base tracking-tight text-[#F05A28] leading-none">
            PHUMULANI
          </div>
          <div className="font-merriweather italic text-[11px] text-[#7A9B29] leading-tight">
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

  return (
    <img
      src={src}
      onError={() => {
        // Try fallback directory
        if (src !== fallbackSrc) {
          src = fallbackSrc;
        } else {
          setHasError(true);
        }
      }}
      alt={alt}
      style={style}
      onClick={onClick}
      className={`object-contain shrink-0 max-w-full select-none ${aspectRatio} ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

export const PhumulaniLogoFull: React.FC<Omit<PhumulaniLogoProps, 'variant'>> = (props) => (
  <PhumulaniLogo variant="full" {...props} />
);

export const PhumulaniLogoMark: React.FC<Omit<PhumulaniLogoProps, 'variant'>> = (props) => (
  <PhumulaniLogo variant="mark" {...props} />
);

export default PhumulaniLogo;
