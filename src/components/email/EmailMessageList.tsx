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
      className={`bg-white border-r border-slate-200 flex flex-col overflow-hidden select-none ${className}`}
      aria-label="Message List"
    >
      {/* Top Filter & Search Controls */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
        {/* Prominent Search Field */}
        <div className="flex items-center gap-2">
          {onOpenFolders && (
            <button
              onClick={onOpenFolders}
              className="md:hidden px-2.5 py-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              title="Open folders sidebar"
            >
              <Inbox className="w-3.5 h-3.5 text-teal-800" />
              <span>Folders</span>
            </button>
          )}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sender, subject, keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-700 text-slate-800 placeholder-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    ? 'bg-[#104F57] text-white shadow-2xs font-semibold'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
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
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-teal-900 cursor-pointer"
            aria-expanded={isAdvancedFiltersOpen}
          >
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Advanced Filters</span>
            {isAdvancedFiltersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            {threads.length} {threads.length === 1 ? 'message' : 'messages'}
          </span>
        </div>

        {/* Advanced Filters Panel */}
        {isAdvancedFiltersOpen && (
          <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-xs animate-fadeIn">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Priority:
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityFilterChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1 text-slate-700"
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
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1 text-slate-700 truncate"
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
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {threads.length === 0 ? (
          mailboxes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="font-bold text-slate-800 text-sm">No email accounts connected.</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs text-center">
                Connect an email account to start managing your messages.
              </p>
              {onOpenManageAccounts && (
                <button
                  onClick={onOpenManageAccounts}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-[#104F57] hover:bg-teal-900 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Connect an Email Account</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-700">Inbox is empty</p>
              <p className="text-[11px] text-slate-400 mt-1">
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
                className={`p-3 text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  isSelected
                    ? 'bg-teal-50/90 border-l-3 border-[#104F57]'
                    : isUnread
                    ? 'bg-white hover:bg-slate-50 font-medium'
                    : 'bg-slate-50/40 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {/* Row 1: Sender & Date */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Unread indicator */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-teal-700 shrink-0" title="Unread message" />
                    )}
                    <span className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                      {senderDisplay}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                    {dateDisplay}
                  </span>
                </div>

                {/* Row 2: Subject */}
                <div className={`text-xs truncate mb-1 ${isUnread ? 'font-bold text-slate-900' : 'text-slate-800 font-medium'}`}>
                  {thread.threadSubject}
                </div>

                {/* Row 3: One-line clean preview */}
                <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                  {previewText}
                </p>

                {/* Row 4: Quiet Metadata (Priority badge where applicable, assignment, approval) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  {/* Priority Badge ONLY when P0 or P1 */}
                  {isPriority && (
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                      thread.priority === 'P0' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}>
                      {thread.priority}
                    </span>
                  )}

                  {/* Pending Approval Badge */}
                  {hasPendingApproval && (
                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[9px]">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      Approval Req
                    </span>
                  )}

                  {/* Assigned Staff Indicator */}
                  {thread.assignedStaffName && (
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <UserCheck className="w-2.5 h-2.5 text-slate-400" />
                      <span className="truncate max-w-[100px]">{thread.assignedStaffName}</span>
                    </span>
                  )}

                  {/* SLA Target indicator */}
                  {thread.slaDeadline && (
                    <span className="text-slate-400 font-mono ml-auto">
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
