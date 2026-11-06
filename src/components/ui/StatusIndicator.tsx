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
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
      defaultLabel: 'Active',
    },
    VERIFIED: {
      bg: 'bg-teal-50',
      text: 'text-[#006D6F]',
      border: 'border-teal-200',
      icon: <ShieldCheck className="w-3 h-3 text-[#006D6F]" />,
      defaultLabel: 'Verified',
    },
    PENDING: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3 h-3 text-amber-600" />,
      defaultLabel: 'Pending',
    },
    REQUIRES_APPROVAL: {
      bg: 'bg-orange-50',
      text: 'text-[#F05A28]',
      border: 'border-orange-200',
      icon: <AlertTriangle className="w-3 h-3 text-[#F05A28]" />,
      defaultLabel: 'Requires Approval',
    },
    FUNDING_DEPENDENT: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <HelpCircle className="w-3 h-3 text-amber-600" />,
      defaultLabel: 'Funding Dependent',
    },
    COMPLETED: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <CheckCircle2 className="w-3 h-3 text-slate-500" />,
      defaultLabel: 'Completed',
    },
    FAILED: {
      bg: 'bg-rose-50',
      text: 'text-[#C62828]',
      border: 'border-rose-200',
      icon: <XCircle className="w-3 h-3 text-[#C62828]" />,
      defaultLabel: 'Failed',
    },
    DRAFT: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <Clock className="w-3 h-3 text-slate-400" />,
      defaultLabel: 'Draft',
    },
    IN_REVIEW: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: <Clock className="w-3 h-3 text-sky-600" />,
      defaultLabel: 'In Review',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <Clock className="w-3 h-3 text-slate-500" />,
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
