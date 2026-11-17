/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SectionHeading — Accessible, Responsive Brand Section Heading
 */

import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  id,
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[align];

  return (
    <div id={id} className={`max-w-3xl space-y-2.5 mb-8 sm:mb-10 ${alignClasses} ${className}`}>
      {eyebrow && (
        <div className="text-[11px] font-bold text-phumulani-earth font-heading uppercase tracking-[0.12em]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-phumulani-earth leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-phumulani-charcoal/90 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
