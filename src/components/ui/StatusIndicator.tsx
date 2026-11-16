/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * StatusIndicator — Standardized Operational Status Badge Component
 * Clean, restrained professional indicators for administrative dashboards and workflows
 */

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, HelpCircle } from 'lucide-react';

export type OperationalStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'COMPLETED'
  | 'REQUIRES_APPROVAL'
  | 'VERIFIED'
  | 'FAILED'
  | 'DRAFT'
  | 'FUNDING_DEPENDENT'
  | 'IN_REVIEW';

export interface StatusIndicatorProps {
  status: OperationalStatus | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const normalized = (status || '').toUpperCase();

  const configs: Record<
    string,
    { bg: string; text: string; border: string; icon: React.ReactNode; defaultLabel: string }
  > = {
    ACTIVE: {
      bg: 'bg-phumulani-green',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-charcoal',
      icon: <CheckCircle2 className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Active',
    },
    VERIFIED: {
      bg: 'bg-phumulani-teal',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-charcoal',
      icon: <ShieldCheck className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Verified',
    },
    PENDING: {
      bg: 'bg-phumulani-gold',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-charcoal',
      icon: <Clock className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Pending',
    },
    REQUIRES_APPROVAL: {
      bg: 'bg-phumulani-gold',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-orange',
      icon: <AlertTriangle className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Requires Approval',
    },
    FUNDING_DEPENDENT: {
      bg: 'bg-phumulani-gold',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-earth',
      icon: <HelpCircle className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Funding Dependent',
    },
    COMPLETED: {
      bg: 'bg-phumulani-cream',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-charcoal',
      icon: <CheckCircle2 className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Completed',
    },
    FAILED: {
      bg: 'bg-phumulani-earth',
      text: 'text-white',
      border: 'border-phumulani-earth',
      icon: <XCircle className="w-3 h-3 text-current" />,
      defaultLabel: 'Failed',
    },
    DRAFT: {
      bg: 'bg-phumulani-cream',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-earth',
      icon: <Clock className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'Draft',
    },
    IN_REVIEW: {
      bg: 'bg-phumulani-teal',
      text: 'text-phumulani-charcoal',
      border: 'border-phumulani-charcoal',
      icon: <Clock className="w-3 h-3 text-phumulani-charcoal" />,
      defaultLabel: 'In Review',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-phumulani-cream',
    text: 'text-phumulani-charcoal',
    border: 'border-phumulani-charcoal',
    icon: <Clock className="w-3 h-3 text-phumulani-charcoal" />,
    defaultLabel: status,
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} font-heading select-none ${className}`}
    >
      {config.icon}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};

export default StatusIndicator;
