/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani African Geometric Mosaic Pattern Divider
 * Brand Accent from Brand Identity Guide (Reference A)
 */

import React from 'react';
import { getAssetUrl } from '../../utils/assetPath';

export interface BrandPatternDividerProps {
  className?: string;
  height?: number | string;
  variant?: 'subtle' | 'vibrant' | 'ribbon';
}

export const BrandPatternDivider: React.FC<BrandPatternDividerProps> = ({
  className = '',
  height = 8,
  variant = 'vibrant',
}) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  const patternUrl = getAssetUrl('images/branding/phumulani-pattern.svg');

  if (variant === 'ribbon') {
    return (
      <div
        className={`w-full overflow-hidden shadow-2xs ${className}`}
        style={{ height: heightStyle }}
        role="presentation"
        aria-hidden="true"
      >
        <div
          className="w-full h-full african-mosaic-pattern"
          style={{
            backgroundImage: `url('${patternUrl}')`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ height: heightStyle }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="w-full h-full african-mosaic-pattern"
        style={{
          backgroundImage: `url('${patternUrl}')`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          opacity: variant === 'subtle' ? 0.75 : 1,
        }}
      />
    </div>
  );
};

export default BrandPatternDivider;
