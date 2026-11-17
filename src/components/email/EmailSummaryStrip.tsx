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
  Mail,
  FileEdit,
  Send,
  RefreshCw,
} from 'lucide-react';

interface EmailSummaryStripProps {
  connectedMailboxesCount?: number;
  inboxCount?: number;
  unreadCount: number;
  priorityCount: number;
  draftsCount?: number;
  sentCount?: number;
  awaitingApprovalCount: number;
  followUpsCount: number;
  autoSyncEnabled?: boolean;
  autoSendingEnabled?: boolean;
  onFilterClick: (
    filter: 'all' | 'unread' | 'priority' | 'drafts' | 'sent' | 'awaiting_approval' | 'follow_ups'
  ) => void;
  activeFilter?: string;
}

export const EmailSummaryStrip: React.FC<EmailSummaryStripProps> = ({
  connectedMailboxesCount = 0,
  inboxCount = 0,
  unreadCount,
  priorityCount,
  draftsCount = 0,
  sentCount = 0,
  awaitingApprovalCount,
  followUpsCount,
  autoSyncEnabled = false,
  autoSendingEnabled = false,
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
    <div
      className="bg-phumulani-cream/70 border-b border-phumulani-charcoal/12 text-xs px-3 sm:px-4 py-2 transition-all"
      data-testid="email-summary-strip"
    >
      <div className="flex items-start sm:items-center justify-between gap-2">
        {/* Metric Badges Strip */}
        {!isCollapsed ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 py-0.5 flex-1">
            {/* Connected Mailboxes */}
            <div
              data-testid="metric-connected-mailboxes"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-phumulani-charcoal/12 text-phumulani-charcoal font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Connected mailboxes</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal text-[11px]">
                {connectedMailboxesCount}
              </span>
            </div>

            {/* Inbox */}
            <button
              type="button"
              data-testid="metric-inbox"
              onClick={() => onFilterClick('all')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-phumulani-teal/15 text-phumulani-earth font-bold border border-phumulani-teal/50'
                  : 'text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent'
              }`}
              title="View Inbox"
            >
              <Inbox className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Inbox</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-charcoal/12 text-[11px]">
                {inboxCount}
              </span>
            </button>

            {/* Unread */}
            <button
              type="button"
              data-testid="metric-unread"
              onClick={() => onFilterClick('unread')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-phumulani-teal/15 text-phumulani-earth font-bold border border-phumulani-teal/50'
                  : 'text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent'
              }`}
              title="Filter by unread messages"
            >
              <span>Unread</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-charcoal/12 text-[11px]">
                {unreadCount}
              </span>
            </button>

            {/* Priority P0/P1 */}
            <button
              type="button"
              data-testid="metric-priority"
              onClick={() => onFilterClick('priority')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'priority'
                  ? 'bg-phumulani-earth/10 text-phumulani-earth font-bold border border-phumulani-earth/40'
                  : 'text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent'
              }`}
              title="Filter by high priority and critical triage"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Priority</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-earth bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-earth/30 text-[11px]">
                {priorityCount}
              </span>
            </button>

            {/* Drafts */}
            <button
              type="button"
              data-testid="metric-drafts"
              onClick={() => onFilterClick('drafts')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent"
              title="View drafts"
            >
              <FileEdit className="w-3.5 h-3.5 text-phumulani-charcoal/75" />
              <span>Drafts</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-charcoal/12 text-[11px]">
                {draftsCount}
              </span>
            </button>

            {/* Sent */}
            <button
              type="button"
              data-testid="metric-sent"
              onClick={() => onFilterClick('sent')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent"
              title="View sent messages"
            >
              <Send className="w-3.5 h-3.5 text-phumulani-charcoal/75" />
              <span>Sent</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-charcoal/12 text-[11px]">
                {sentCount}
              </span>
            </button>

            {/* Awaiting Approval */}
            <button
              type="button"
              data-testid="metric-awaiting-approval"
              onClick={() => onFilterClick('awaiting_approval')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'awaiting_approval'
                  ? 'bg-phumulani-gold/15 text-phumulani-charcoal font-bold border border-phumulani-gold/50'
                  : 'text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent'
              }`}
              title="Filter by pending human reviews"
            >
              <Sparkles className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Awaiting approval</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-charcoal bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-gold/50 text-[11px]">
                {awaitingApprovalCount}
              </span>
            </button>

            {/* Follow-ups */}
            <button
              type="button"
              data-testid="metric-follow-ups"
              onClick={() => onFilterClick('follow_ups')}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors text-xs cursor-pointer ${
                activeFilter === 'follow_ups'
                  ? 'bg-phumulani-teal/15 text-phumulani-earth font-bold border border-phumulani-teal/50'
                  : 'text-phumulani-charcoal hover:bg-white/80 font-medium border border-transparent'
              }`}
              title="Filter by follow-up tasks"
            >
              <Clock className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Follow-ups</span>
              <span className="font-mono tabular-nums font-bold text-phumulani-earth bg-white px-1.5 py-0.2 rounded-sm border border-phumulani-teal/50 text-[11px]">
                {followUpsCount}
              </span>
            </button>

            {/* Operational Lock Statuses */}
            <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
              <span
                data-testid="status-active-sync"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                  autoSyncEnabled
                    ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                    : 'bg-white text-phumulani-charcoal/75 border-phumulani-charcoal/12'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>Active email synchronization:</span>
                <strong className="font-semibold">{autoSyncEnabled ? 'Enabled' : 'Disabled'}</strong>
              </span>
              <span
                data-testid="status-auto-sending"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                  autoSendingEnabled
                    ? 'bg-phumulani-green/15 text-phumulani-charcoal border-phumulani-green/40'
                    : 'bg-white text-phumulani-charcoal/75 border-phumulani-charcoal/12'
                }`}
              >
                <span>Automatic email sending:</span>
                <strong className="font-semibold">{autoSendingEnabled ? 'Enabled' : 'Disabled'}</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-phumulani-charcoal text-xs">
            <span className="font-medium">Metrics Summary</span>
            <span className="text-phumulani-charcoal/55">·</span>
            <span className="font-mono text-[11px] tabular-nums text-phumulani-charcoal/80">
              {connectedMailboxesCount} mailboxes · {inboxCount} inbox · {unreadCount} unread · {priorityCount} priority · {awaitingApprovalCount} approvals
            </span>
          </div>
        )}

        {/* Expand / Collapse Control */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="text-phumulani-charcoal/75 hover:text-phumulani-earth text-[11px] flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/80 rounded cursor-pointer shrink-0 ml-2 transition-colors"
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
