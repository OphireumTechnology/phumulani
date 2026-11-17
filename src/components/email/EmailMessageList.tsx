/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Email Command Center — Compact Message List (Area C & Section 11)
 * Phase 60.1 Staff-First Navigation & Workspace
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Inbox,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  EnterpriseEmailThread,
  EMAIL_CATEGORY_METADATA,
  PRIORITY_CONFIG,
  ConnectedMailbox,
  EmailClassificationCategory,
} from '../../types/emailEnterprise';

interface EmailMessageListProps {
  threads: EnterpriseEmailThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  mailboxes: ConnectedMailbox[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  quickFilter: 'all' | 'p0' | 'needs_reply' | 'awaiting_approval' | 'donors' | 'unassigned' | 'unread' | 'priority' | 'assigned_to_me';
  onQuickFilterChange: (f: any) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (c: string) => void;
  selectedMailboxId: string;
  onMailboxChange: (m: string) => void;
  className?: string;
  onOpenFolders?: () => void;
  onOpenManageAccounts?: () => void;
}

export const EmailMessageList: React.FC<EmailMessageListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread,
  mailboxes,
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  selectedMailboxId,
  onMailboxChange,
  className = '',
  onOpenFolders,
  onOpenManageAccounts,
}) => {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Quick filter tabs (Section 11)
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'priority', label: 'Priority' },
    { id: 'assigned_to_me', label: 'Assigned to Me' },
    { id: 'awaiting_approval', label: 'Awaiting Approval' },
  ];

  return (
    <div
      className={`bg-white border-r border-phumulani-charcoal/12 flex flex-col overflow-hidden select-none ${className}`}
      aria-label="Message List"
    >
      {/* Top Filter & Search Controls */}
      <div className="p-3 border-b border-phumulani-charcoal/12 bg-phumulani-cream/70 space-y-2">
        {/* Prominent Search Field */}
        <div className="flex items-center gap-2">
          {onOpenFolders && (
            <button
              onClick={onOpenFolders}
              className="md:hidden px-2.5 py-1.5 text-phumulani-charcoal hover:text-phumulani-earth bg-white border border-phumulani-charcoal/15 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              title="Open folders sidebar"
            >
              <Inbox className="w-3.5 h-3.5 text-phumulani-earth" />
              <span>Folders</span>
            </button>
          )}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-phumulani-charcoal/55 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sender, subject, keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-phumulani-charcoal/15 rounded-lg focus:outline-none focus:border-phumulani-earth text-phumulani-charcoal placeholder:text-phumulani-charcoal/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-2 text-phumulani-charcoal/60 hover:text-phumulani-earth cursor-pointer"
                aria-label="Clear message search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Tabs (Section 11) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = quickFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onQuickFilterChange(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-phumulani-earth text-white shadow-2xs font-semibold'
                    : 'bg-white hover:bg-phumulani-cream/80 text-phumulani-charcoal border border-phumulani-charcoal/15'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable Toggle */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <button
            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
            className="flex items-center gap-1 text-[11px] font-semibold text-phumulani-charcoal/80 hover:text-phumulani-earth cursor-pointer"
            aria-expanded={isAdvancedFiltersOpen}
          >
            <Filter className="w-3 h-3 text-phumulani-charcoal/70" />
            <span>Advanced Filters</span>
            {isAdvancedFiltersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <span className="text-[11px] text-phumulani-charcoal/70 font-mono tabular-nums">
            {threads.length} {threads.length === 1 ? 'message' : 'messages'}
          </span>
        </div>

        {/* Advanced Filters Panel */}
        {isAdvancedFiltersOpen && (
          <div className="pt-2 border-t border-phumulani-charcoal/10 grid grid-cols-2 gap-2 text-xs animate-fadeIn">
            <div>
              <label className="text-[10px] uppercase font-bold text-phumulani-charcoal/70 block mb-0.5">
                Priority:
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityFilterChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-phumulani-charcoal/15 rounded-md p-1 text-phumulani-charcoal focus:border-phumulani-earth focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="P0">P0 — Critical (&lt;1h)</option>
                <option value="P1">P1 — Urgent (&lt;4h)</option>
                <option value="P2">P2 — High (&lt;24h)</option>
                <option value="P3">P3 — Normal (&lt;48h)</option>
                <option value="P4">P4 — Low (&lt;72h)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-phumulani-charcoal/70 block mb-0.5">
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-phumulani-charcoal/15 rounded-md p-1 text-phumulani-charcoal truncate focus:border-phumulani-earth focus:outline-none"
              >
                <option value="all">All 25 Categories</option>
                {Object.entries(EMAIL_CATEGORY_METADATA).map(([catKey, meta]) => (
                  <option key={catKey} value={catKey}>
                    {meta.code} {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Message List Rows (Area C) */}
      <div className="flex-1 overflow-y-auto divide-y divide-phumulani-charcoal/10">
        {threads.length === 0 ? (
          mailboxes.length === 0 ? (
            <div className="p-8 text-center text-phumulani-charcoal text-xs flex flex-col items-center justify-center h-full">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-phumulani-charcoal/40" />
              <p className="font-heading font-bold text-phumulani-charcoal text-sm">No Email Accounts Connected</p>
              <p className="text-xs text-phumulani-charcoal/70 mt-1.5 max-w-xs text-center leading-relaxed">
                Your Email Command Center is ready. Connect and authorize your organizational email accounts to begin receiving and managing messages.
              </p>
              {onOpenManageAccounts && (
                <button
                  onClick={onOpenManageAccounts}
                  className="mt-4 px-3.5 py-2 text-xs font-semibold bg-phumulani-earth hover:bg-phumulani-earth/90 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Connect Email Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-phumulani-charcoal text-xs flex flex-col items-center justify-center h-full">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-phumulani-charcoal/35" />
              <p className="font-semibold text-phumulani-charcoal">Inbox is empty</p>
              <p className="text-[11px] text-phumulani-charcoal/70 mt-1">
                {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No messages matched your active search or filters.'
                  : 'There are no messages in this connected mailbox.'}
              </p>
            </div>
          )
        ) : (
          threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;
            const latestMsg = thread.messages[thread.messages.length - 1] || thread.messages[0];
            const senderDisplay = latestMsg?.senderName || latestMsg?.senderEmail?.split('@')[0] || 'Unknown';
            const dateDisplay = latestMsg?.receivedAt
              ? new Date(latestMsg.receivedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : '';
            const previewText = latestMsg?.bodyText?.replace(/\s+/g, ' ').trim() || '';

            const isPriority = thread.priority === 'P0' || thread.priority === 'P1';
            const isUnread = !thread.isRead;
            const hasPendingApproval = thread.draft?.status === 'pending_approval';

            return (
              <div
                key={thread.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectThread(thread.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectThread(thread.id);
                  }
                }}
                className={`p-3 text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-phumulani-earth ${
                  isSelected
                    ? 'bg-phumulani-earth/10 ring-1 ring-inset ring-phumulani-earth/25'
                    : isUnread
                    ? 'bg-white hover:bg-phumulani-cream/70 font-medium'
                    : 'bg-phumulani-cream/35 hover:bg-phumulani-cream/75 text-phumulani-charcoal'
                }`}
              >
                {/* Row 1: Sender & Date */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Unread indicator */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-phumulani-earth shrink-0" title="Unread message" />
                    )}
                    <span className={`text-xs truncate ${isUnread ? 'font-bold text-phumulani-charcoal' : 'font-semibold text-phumulani-charcoal'}`}>
                      {senderDisplay}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono tabular-nums text-phumulani-charcoal/65 shrink-0">
                    {dateDisplay}
                  </span>
                </div>

                {/* Row 2: Subject */}
                <div className={`text-xs truncate mb-1 ${isUnread ? 'font-bold text-phumulani-charcoal' : 'text-phumulani-charcoal font-medium'}`}>
                  {thread.threadSubject}
                </div>

                {/* Row 3: One-line clean preview */}
                <p className="text-[11px] text-phumulani-charcoal/70 line-clamp-1 leading-snug">
                  {previewText}
                </p>

                {/* Row 4: Quiet Metadata (Priority badge where applicable, assignment, approval) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  {/* Priority Badge ONLY when P0 or P1 */}
                  {isPriority && (
                    <span className={`px-1.5 py-0.2 rounded-sm font-bold uppercase text-[9px] ${
                      thread.priority === 'P0' ? 'bg-phumulani-earth/10 text-phumulani-earth border border-phumulani-earth/30' : 'bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/50'
                    }`}>
                      {thread.priority}
                    </span>
                  )}

                  {/* Pending Approval Badge */}
                  {hasPendingApproval && (
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-sm bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/40 font-medium text-[9px]">
                      <Sparkles className="w-2.5 h-2.5 text-phumulani-earth" />
                      Approval Req
                    </span>
                  )}

                  {/* Assigned Staff Indicator */}
                  {thread.assignedStaffName && (
                    <span className="flex items-center gap-1 text-phumulani-charcoal/75 font-medium">
                      <UserCheck className="w-2.5 h-2.5 text-phumulani-charcoal/60" />
                      <span className="truncate max-w-[100px]">{thread.assignedStaffName}</span>
                    </span>
                  )}

                  {/* SLA Target indicator */}
                  {thread.slaDeadline && (
                    <span className="text-phumulani-charcoal/65 font-mono tabular-nums ml-auto">
                      SLA: {new Date(thread.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
