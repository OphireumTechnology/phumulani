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
          <path d="M2 7H22" stroke="#A63C14" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
          <polygon points="30,7 34,3 38,7 34,11" fill="#F97316" />
          <polygon points="38,7 42,2 46,7 42,12" fill="#F7B733" />
          <polygon points="46,7 50,3 54,7 50,11" fill="#60C3B4" />
          <path d="M58 7H74" stroke="#A63C14" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
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
          <polygon points="210,15 260,65 210,115 160,65" stroke="#F7B733" strokeWidth="1.5" />
          <polygon points="210,35 240,65 210,95 180,65" stroke="#60C3B4" strokeWidth="1.5" />
          <polygon points="110,65 160,115 110,165 60,115" stroke="#F97316" strokeWidth="1.5" />
          <polygon points="310,65 360,115 310,165 260,115" stroke="#4CAF7C" strokeWidth="1.5" />
          <polygon points="210,115 260,165 210,215 160,165" stroke="#F7F3E0" strokeWidth="1.5" />
          <circle cx="210" cy="65" r="5" fill="#F7B733" />
          <circle cx="110" cy="115" r="4" fill="#60C3B4" />
          <circle cx="310" cy="115" r="4" fill="#F97316" />
          <circle cx="210" cy="165" r="5" fill="#4CAF7C" />
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
          stroke="#A63C14"
          strokeWidth="1.5"
        />
        <path
          d="M80 380L180 280L280 380L380 280L480 380"
          stroke="#F97316"
          strokeWidth="1.5"
        />
        <polygon points="440,56 492,108 440,160 388,108" stroke="#A63C14" strokeWidth="1.5" />
        <polygon points="440,76 472,108 440,140 408,108" fill="#F7B733" opacity="0.45" />
        <polygon points="348,148 388,188 348,228 308,188" stroke="#60C3B4" strokeWidth="1.5" />
        <polygon points="440,160 480,200 440,240 400,200" stroke="#4CAF7C" strokeWidth="1.5" />
        <polygon points="280,52 308,80 280,108 252,80" stroke="#F97316" strokeWidth="1.25" />
        <circle cx="440" cy="108" r="6" fill="#A63C14" />
        <circle cx="348" cy="188" r="4" fill="#60C3B4" />
        <circle cx="440" cy="200" r="4" fill="#4CAF7C" />
        <circle cx="140" cy="240" r="3.5" fill="#F97316" />
        <circle cx="340" cy="240" r="3.5" fill="#F7B733" />
      </g>
    </svg>
  );
};
