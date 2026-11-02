/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Email Command Center — Compact Summary Strip (Section 7)
 * Phase 60.1 Staff-First Navigation & Workspace
 */

import React, { useState } from 'react';
import {
  Inbox,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EmailSummaryStripProps {
  unreadCount: number;
  priorityCount: number;
  awaitingApprovalCount: number;
  followUpsCount: number;
  onFilterClick: (filter: 'all' | 'unread' | 'priority' | 'awaiting_approval' | 'follow_ups') => void;
  activeFilter?: string;
}

export const EmailSummaryStrip: React.FC<EmailSummaryStripProps> = ({
  unreadCount,
  priorityCount,
  awaitingApprovalCount,
  followUpsCount,
  onFilterClick,
  activeFilter,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('phumulani_email_summary_strip_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('phumulani_email_summary_strip_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200/90 text-xs px-3 sm:px-4 py-1.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Metric Badges Strip */}
        {!isCollapsed ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 overflow-x-auto py-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hidden sm:inline shrink-0">
              Overview:
            </span>

            {/* Unread */}
            <button
              onClick={() => onFilterClick('unread')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-200/60 font-medium'
              }`}
              title="Filter by unread messages"
            >
              <Inbox className="w-3.5 h-3.5 text-blue-600" />
              <span>Unread</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200/80 text-[11px]">
                {unreadCount}
              </span>
            </button>

            {/* Priority P0/P1 */}
            <button
              onClick={() => onFilterClick('priority')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'priority'
                  ? 'bg-rose-100 text-rose-900 font-bold border border-rose-200'
                  : 'text-slate-700 hover:bg-slate-200/60 font-medium'
              }`}
              title="Filter by high priority and critical triage"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Priority</span>
              <span className="font-mono tabular-nums font-bold text-rose-800 bg-white px-1.5 py-0.2 rounded border border-rose-200/80 text-[11px]">
                {priorityCount}
              </span>
            </button>

            {/* Awaiting Approval */}
            <button
              onClick={() => onFilterClick('awaiting_approval')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'awaiting_approval'
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200'
                  : 'text-slate-700 hover:bg-slate-200/60 font-medium'
              }`}
              title="Filter by pending human reviews"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Awaiting Approval</span>
              <span className="font-mono tabular-nums font-bold text-amber-800 bg-white px-1.5 py-0.2 rounded border border-amber-200/80 text-[11px]">
                {awaitingApprovalCount}
              </span>
            </button>

            {/* Follow-ups */}
            <button
              onClick={() => onFilterClick('follow_ups')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'follow_ups'
                  ? 'bg-teal-100 text-teal-900 font-bold border border-teal-200'
                  : 'text-slate-700 hover:bg-slate-200/60 font-medium'
              }`}
              title="Filter by follow-up tasks"
            >
              <Clock className="w-3.5 h-3.5 text-teal-700" />
              <span>Follow-ups</span>
              <span className="font-mono tabular-nums font-bold text-teal-900 bg-white px-1.5 py-0.2 rounded border border-teal-200/80 text-[11px]">
                {followUpsCount}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="font-medium">Metrics Summary</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[11px]">
              {unreadCount} unread · {priorityCount} priority · {awaitingApprovalCount} approvals
            </span>
          </div>
        )}

        {/* Expand / Collapse Control */}
        <button
          onClick={toggleCollapsed}
          className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 px-1.5 py-0.5 hover:bg-slate-200/50 rounded cursor-pointer shrink-0 ml-auto"
          title={isCollapsed ? 'Expand metric strip' : 'Collapse metric strip'}
          aria-expanded={!isCollapsed}
        >
          <span>{isCollapsed ? 'Show Metrics' : 'Collapse'}</span>
          {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
