/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Culturally Grounded Geometric Accents
 * Crafted strictly with official Phumulani Brand Manual colors.
 */

import React from 'react';

interface CulturalGeometricAccentProps {
  variant?: 'hero-lattice' | 'section-crest' | 'dark-woven';
  className?: string;
}

export const CulturalGeometricAccent: React.FC<CulturalGeometricAccentProps> = ({
  variant = 'hero-lattice',
  className = '',
}) => {
  if (variant === 'section-crest') {
    return (
      <div
        className={`inline-flex items-center justify-center gap-2 pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        <svg
          width="76"
          height="14"
          viewBox="0 0 76 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path d="M2 7H22" stroke="#B3340F" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
          <polygon points="30,7 34,3 38,7 34,11" fill="#EF5C2C" />
          <polygon points="38,7 42,2 46,7 42,12" fill="#F7B24A" />
          <polygon points="46,7 50,3 54,7 50,11" fill="#62C4B4" />
          <path d="M58 7H74" stroke="#B3340F" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
        </svg>
      </div>
    );
  }

  if (variant === 'dark-woven') {
    return (
      <svg
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none select-none ${className}`}
        aria-hidden="true"
      >
        <g opacity="0.12">
          <polygon points="210,15 260,65 210,115 160,65" stroke="#F7B24A" strokeWidth="1.5" />
          <polygon points="210,35 240,65 210,95 180,65" stroke="#62C4B4" strokeWidth="1.5" />
          <polygon points="110,65 160,115 110,165 60,115" stroke="#EF5C2C" strokeWidth="1.5" />
          <polygon points="310,65 360,115 310,165 260,115" stroke="#6AAD7C" strokeWidth="1.5" />
          <polygon points="210,115 260,165 210,215 160,165" stroke="#EFEBD1" strokeWidth="1.5" />
          <circle cx="210" cy="65" r="5" fill="#F7B24A" />
          <circle cx="110" cy="115" r="4" fill="#62C4B4" />
          <circle cx="310" cy="115" r="4" fill="#EF5C2C" />
          <circle cx="210" cy="165" r="5" fill="#6AAD7C" />
        </g>
      </svg>
    );
  }

  // hero-lattice: calm African woven geometric diamond & step-pyramid backdrop
  return (
    <svg
      viewBox="0 0 560 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <g opacity="0.12">
        <path
          d="M40 340L140 240L240 340L340 240L440 340L520 260"
          stroke="#B3340F"
          strokeWidth="1.5"
        />
        <path
          d="M80 380L180 280L280 380L380 280L480 380"
          stroke="#EF5C2C"
          strokeWidth="1.5"
        />
        <polygon points="440,56 492,108 440,160 388,108" stroke="#B3340F" strokeWidth="1.5" />
        <polygon points="440,76 472,108 440,140 408,108" fill="#F7B24A" opacity="0.45" />
        <polygon points="348,148 388,188 348,228 308,188" stroke="#62C4B4" strokeWidth="1.5" />
        <polygon points="440,160 480,200 440,240 400,200" stroke="#6AAD7C" strokeWidth="1.5" />
        <polygon points="280,52 308,80 280,108 252,80" stroke="#EF5C2C" strokeWidth="1.25" />
        <circle cx="440" cy="108" r="6" fill="#B3340F" />
        <circle cx="348" cy="188" r="4" fill="#62C4B4" />
        <circle cx="440" cy="200" r="4" fill="#6AAD7C" />
        <circle cx="140" cy="240" r="3.5" fill="#EF5C2C" />
        <circle cx="340" cy="240" r="3.5" fill="#F7B24A" />
      </g>
    </svg>
  );
};
