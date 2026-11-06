/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EmptyState — Reusable Empty State Component
 * Palette: Unity Teal (#006D6F), Ubuntu Orange (#F05A28), Slate neutrals
 */

import React from 'react';
import { Inbox } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-6 space-y-4 shadow-2xs ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
        {icon || <Inbox className="w-7 h-7 text-[#006D6F]" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-base text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <PrimaryButton variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
