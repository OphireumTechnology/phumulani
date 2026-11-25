/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Accessible Dialog/Modal & Card Primitives — Phumulani Enterprise Design System
 * Enforces WCAG 2.2 AA contrast, Escape handling, role="dialog", aria-modal="true", and focus styling.
 */

import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerVariant?: 'light' | 'charcoal' | 'earth';
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-2xl',
  children,
  footer,
  headerVariant = 'light',
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const closeBtnStyles =
    headerVariant === 'light'
      ? 'text-phumulani-charcoal hover:bg-phumulani-cream hover:text-phumulani-earth focus-visible:ring-2 focus-visible:ring-phumulani-earth'
      : 'text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-phumulani-gold';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-2xl border border-phumulani-charcoal/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div
          className={`px-5 py-4 flex items-start justify-between gap-3 shrink-0 ${
            headerVariant === 'charcoal'
              ? 'bg-phumulani-charcoal text-white border-b border-phumulani-teal/30'
              : headerVariant === 'earth'
              ? 'bg-phumulani-earth text-white border-b border-phumulani-earth'
              : 'bg-phumulani-cream/70 text-phumulani-charcoal border-b border-phumulani-charcoal/15'
          }`}
        >
          <div className="min-w-0">
            <h2 id={titleId} className="font-heading font-bold text-base sm:text-lg leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs mt-0.5 opacity-95">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${closeBtnStyles}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 text-phumulani-charcoal">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-phumulani-cream/50 border-t border-phumulani-charcoal/12 flex flex-wrap items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface SurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = '',
  interactive = false,
}) => (
  <div
    className={`${
      interactive ? 'phumulani-card-interactive' : 'phumulani-card'
    } p-4 sm:p-5 text-phumulani-charcoal ${className}`}
  >
    {children}
  </div>
);

export const LoadingSkeleton: React.FC<{ label?: string; className?: string }> = ({
  label = 'Loading view...',
  className = '',
}) => (
  <div
    role="status"
    aria-live="polite"
    className={`bg-white rounded-2xl border border-phumulani-charcoal/15 p-8 text-center space-y-3 ${className}`}
  >
    <div className="w-7 h-7 border-2 border-phumulani-earth border-t-transparent rounded-full animate-spin mx-auto" />
    <div className="text-xs font-heading font-semibold text-phumulani-charcoal">{label}</div>
  </div>
);
