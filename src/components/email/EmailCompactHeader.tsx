/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Email Command Center — Compact Header (Area A)
 * Phase 60.1 Staff-First Navigation & Workspace
 */

import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  Plus,
  RefreshCw,
  Search,
  Bell,
  MoreVertical,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  X,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { User } from '../../types';
import { ConnectedMailbox } from '../../types/emailEnterprise';

interface EmailCompactHeaderProps {
  currentUser: User;
  mailboxes: ConnectedMailbox[];
  selectedMailboxId: string;
  onMailboxChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  pendingApprovalsCount: number;
  onOpenCompose: () => void;
  onSyncMailbox: (id: string) => void;
  onBackToMasterAdmin?: () => void;
  onOpenSettings?: () => void;
  onOpenAuditLogs?: () => void;
  onOpenManageAccounts?: () => void;
  isSyncing?: boolean;
}

export const EmailCompactHeader: React.FC<EmailCompactHeaderProps> = ({
  currentUser,
  mailboxes,
  selectedMailboxId,
  onMailboxChange,
  searchQuery,
  onSearchChange,
  unreadCount,
  pendingApprovalsCount,
  onOpenCompose,
  onSyncMailbox,
  onBackToMasterAdmin,
  onOpenSettings,
  onOpenAuditLogs,
  onOpenManageAccounts,
  isSyncing = false,
}) => {
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="bg-white border-b border-phumulani-charcoal/12 sticky top-0 z-30 shadow-2xs">
      <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Return to Master Admin & Mailbox Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap sm:flex-nowrap">
          {onBackToMasterAdmin && (
            <button
              onClick={onBackToMasterAdmin}
              className="p-1.5 rounded-lg text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream/80 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0"
              title="Return to Master Administrator Overview"
              aria-label="Return to Master Administrator Overview"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Master Admin</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-phumulani-charcoal text-white flex items-center justify-center shadow-2xs shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-heading font-bold text-phumulani-charcoal text-sm tracking-tight truncate">
                Email Command Center
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold bg-phumulani-teal/15 text-phumulani-earth border border-phumulani-teal/40 px-1.5 py-0.2 rounded-sm uppercase">
                Staff
              </span>
            </div>
          </div>

          <div className="hidden lg:block h-4 w-px bg-phumulani-charcoal/15" />

          {/* Mailbox Selector */}
          <div className="flex items-center gap-1.5 bg-phumulani-cream/70 border border-phumulani-charcoal/15 px-2 py-1 rounded-lg text-xs min-w-0 max-w-[140px] sm:max-w-[240px]">
            <Inbox className="w-3.5 h-3.5 text-phumulani-earth shrink-0" />
            <select
              id="header-mailbox-select"
              aria-label="Filter Mailbox"
              value={selectedMailboxId}
              onChange={(e) => onMailboxChange(e.target.value)}
              className="bg-transparent font-medium text-phumulani-charcoal focus:outline-none cursor-pointer truncate w-full text-xs"
            >
              <option value="all">All Mailboxes ({mailboxes.length})</option>
              {mailboxes.map((mbx) => (
                <option key={mbx.id} value={mbx.id}>
                  {mbx.email} ({mbx.department})
                </option>
              ))}
            </select>
          </div>

          {/* STAGE 1: Visible Manage Email Accounts Button Beside Mailbox Selector */}
          {onOpenManageAccounts && (
            <button
              id="btn-manage-email-accounts"
              onClick={onOpenManageAccounts}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-phumulani-teal/50 bg-phumulani-teal/12 hover:bg-phumulani-teal/25 text-phumulani-earth transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Manage Email Accounts, Connections & Official Provider Authorization"
              aria-label="Manage Email Accounts"
            >
              <Settings className="w-3.5 h-3.5 text-phumulani-earth shrink-0" />
              <span className="hidden sm:inline">Manage Email Accounts</span>
              <span className="sm:hidden">Accounts</span>
            </button>
          )}
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-phumulani-charcoal/55 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              aria-label="Search all messages"
              placeholder="Search sender, subject, keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1 text-xs bg-phumulani-cream/70 border border-phumulani-charcoal/15 rounded-lg focus:outline-none focus:bg-white focus:border-phumulani-earth text-phumulani-charcoal transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-2 text-phumulani-charcoal/60 hover:text-phumulani-earth cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications, Compose & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              aria-label="Toggle search input"
              className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream rounded-lg"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Connection Status Indicator (Dynamic from Mailbox State) */}
          {(() => {
            const liveAuthorizedCount = mailboxes.filter(
              (m) =>
                (m.status === 'CONNECTED' || m.status === 'connected' || m.status === 'SYNCING' || m.status === 'syncing') &&
                ['authorized', 'AUTHORIZED', 'CONNECTED', 'OAUTH_AUTHORIZED'].includes(String(m.authStatus || ''))
            ).length;
            const activeStagedCount = mailboxes.filter(
              (m) => m.status === 'CONNECTED' || m.status === 'connected' || m.status === 'SYNCING' || m.status === 'syncing'
            ).length;
            if (liveAuthorizedCount > 0) {
              return (
                <div
                  className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/40 text-[11px] font-medium tabular-nums"
                  title="Live Provider OAuth Sync Active"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-phumulani-green" />
                  <span>Live Sync ({liveAuthorizedCount}/{mailboxes.length})</span>
                </div>
              );
            }
            if (activeStagedCount > 0) {
              return (
                <div
                  className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/50 text-[11px] font-medium tabular-nums"
                  title="Staged Sync Active — Live Provider OAuth Authorization Required"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-phumulani-gold" />
                  <span>Staged Sync ({activeStagedCount}/{mailboxes.length} · OAuth Req)</span>
                </div>
              );
            }
            return (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-phumulani-cream/70 text-phumulani-charcoal/70 border border-phumulani-charcoal/15 text-[11px] font-medium"
                title="Active Email Synchronization Disabled Until a Mailbox Is Connected"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-phumulani-charcoal/40" />
                <span>Sync Disabled</span>
              </div>
            );
          })()}

          {/* Notifications / Approvals Indicator */}
          {onOpenAuditLogs && (
            <button
              onClick={onOpenAuditLogs}
              aria-label={`Security & System Notifications: ${pendingApprovalsCount} pending`}
              className="p-1.5 rounded-lg text-phumulani-charcoal hover:bg-phumulani-cream/80 transition-colors relative cursor-pointer"
              title="Notifications & Audit Records"
            >
              <Bell className="w-4 h-4 text-phumulani-charcoal" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-phumulani-gold text-phumulani-charcoal rounded-full text-[9px] font-bold w-4 h-4 flex items-center justify-center tabular-nums">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* New Email Compose Action */}
          <button
            onClick={onOpenCompose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-earth/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
            title="Compose New Outbound Email"
            aria-label="Compose New Outbound Email"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Email</span>
          </button>

          {/* Secondary Administrative Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              aria-label="More administration actions"
              aria-expanded={isOverflowOpen}
              className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream/80 rounded-lg cursor-pointer transition-colors"
              title="Mailbox Actions & Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isOverflowOpen && (
              <div
                className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-phumulani-charcoal/12 p-1.5 z-50 text-xs animate-fadeIn space-y-0.5"
                role="menu"
              >
                <div className="px-2.5 py-1.5 border-b border-phumulani-charcoal/10 mb-1">
                  <div className="font-bold text-phumulani-charcoal text-xs truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-phumulani-charcoal/70 truncate">{currentUser.email}</div>
                </div>

                <button
                  onClick={() => {
                    setIsOverflowOpen(false);
                    onSyncMailbox(selectedMailboxId === 'all' ? (mailboxes[0]?.id || '') : selectedMailboxId);
                  }}
                  disabled={isSyncing || mailboxes.length === 0}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-phumulani-cream/80 disabled:opacity-50 disabled:cursor-not-allowed text-phumulani-charcoal flex items-center gap-2 cursor-pointer font-medium transition-colors"
                  role="menuitem"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-phumulani-earth ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {mailboxes.length === 0
                      ? 'Sync Disabled (No Accounts)'
                      : isSyncing
                      ? 'Syncing Mailbox...'
                      : 'Sync Current Mailbox'}
                  </span>
                </button>

                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsOverflowOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-phumulani-cream text-phumulani-charcoal flex items-center gap-2 cursor-pointer font-medium"
                    role="menuitem"
                  >
                    <Sliders className="w-3.5 h-3.5 text-phumulani-charcoal" />
                    <span>Email & Connector Settings</span>
                  </button>
                )}

                {onOpenAuditLogs && (
                  <button
                    onClick={() => {
                      setIsOverflowOpen(false);
                      onOpenAuditLogs();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-phumulani-cream text-phumulani-charcoal flex items-center gap-2 cursor-pointer font-medium"
                    role="menuitem"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-phumulani-earth" />
                    <span>Security Audit Logs</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Expandable Field */}
      {isSearchExpanded && (
        <div className="p-2 border-t border-phumulani-charcoal/10 md:hidden bg-phumulani-cream/70">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-phumulani-charcoal/55 absolute left-2.5 top-2.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search sender, subject, keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-phumulani-charcoal/15 rounded-lg focus:outline-none focus:border-phumulani-earth text-phumulani-charcoal"
            />
          </div>
        </div>
      )}
    </header>
  );
};
