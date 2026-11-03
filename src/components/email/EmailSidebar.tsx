/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Email Command Center — Collapsible Sidebar (Area B & Section 6)
 * Phase 60.1 Staff-First Navigation & Workspace
 */

import React, { useState } from 'react';
import {
  Inbox,
  AlertTriangle,
  FileEdit,
  Sparkles,
  Send,
  Clock,
  UserCheck,
  Users,
  ChevronDown,
  ChevronRight,
  Database,
  FileText,
  Bot,
  TrendingUp,
  BarChart2,
  History,
  Settings,
  RefreshCw,
  Sliders,
  Award,
  DollarSign,
  Handshake,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { User } from '../../types';
import { EmailCommandCenterTab } from '../../views/EmailCommandCenterView';

interface EmailSidebarProps {
  currentUser: User;
  activeTab: EmailCommandCenterTab;
  onTabSelect: (tab: EmailCommandCenterTab) => void;
  unreadCount: number;
  priorityCount: number;
  draftsCount: number;
  approvalsCount: number;
  followUpsCount: number;
  sentCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  currentUser,
  activeTab,
  onTabSelect,
  unreadCount,
  priorityCount,
  draftsCount,
  approvalsCount,
  followUpsCount,
  sentCount,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  // Navigation Groups Collapsed States (Section 6)
  const [groupOpen, setGroupOpen] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('phumulani_email_nav_groups');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      everyday: true, // Group 1 expanded by default
      contacts: false, // Group 2 collapsed by default
      management: false, // Group 3 collapsed by default
      settings: false, // Group 4 collapsed by default
    };
  });

  const toggleGroup = (key: string) => {
    setGroupOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('phumulani_email_nav_groups', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Role permissions check
  const role = currentUser.role as string;
  const isSuperAdmin = role === 'PLATFORM_SUPER_ADMIN' || role === 'super_admin' || role === 'master_admin';
  const isExec = role === 'executive_director' || role === 'board_member';
  const isSupervisor = isSuperAdmin || isExec || role === 'communications_officer';
  const isSafeguarding = role === 'safeguarding_officer';

  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
      aria-label="Email Navigation Sidebar"
    >
      {/* Top Header Bar / Sidebar Toggle */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mail Folders
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand Email Sidebar' : 'Collapse Email Sidebar'}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <nav className="flex-1 p-2 space-y-3 overflow-y-auto scrollbar-thin">
        {/* GROUP 1: EVERYDAY EMAIL (Expanded by default) */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <button
              onClick={() => toggleGroup('everyday')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span>Everyday Email</span>
              {groupOpen.everyday ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {(groupOpen.everyday || isCollapsed) && (
            <div className="space-y-0.5">
              {/* Phumulani Ai (Phase 65) */}
              <button
                onClick={() => onTabSelect('phumulani_ai')}
                title="Phumulani Ai — Local LLM & Autonomous Fundraising"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'phumulani_ai'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-teal-900 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'phumulani_ai' ? 'text-teal-200' : 'text-teal-700'}`} />
                  {!isCollapsed && <span className="truncate font-bold">Phumulani Ai</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${activeTab === 'phumulani_ai' ? 'bg-teal-900 text-teal-100' : 'bg-teal-700 text-white'}`}>
                    LOCAL
                  </span>
                )}
              </button>

              {/* Inbox / All Mailboxes */}
              <button
                onClick={() => onTabSelect('all_mailboxes')}
                title="Unified Inbox (All Connected Mailboxes)"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all_mailboxes' || activeTab === 'conversations'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Inbox className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Inbox</span>}
                </div>
                {!isCollapsed && unreadCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'all_mailboxes' || activeTab === 'conversations'
                        ? 'bg-teal-900 text-teal-100'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Priority */}
              <button
                onClick={() => onTabSelect('priority')}
                title="Priority Triage (P0 Critical & P1 Urgent)"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'priority'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${activeTab === 'priority' ? 'text-amber-300' : 'text-rose-600'}`} />
                  {!isCollapsed && <span className="truncate">Priority</span>}
                </div>
                {!isCollapsed && priorityCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'priority' ? 'bg-teal-900 text-teal-100' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {priorityCount}
                  </span>
                )}
              </button>

              {/* Drafts */}
              <button
                onClick={() => onTabSelect('drafts')}
                title="Draft Messages & Staged Responses"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'drafts'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileEdit className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Drafts</span>}
                </div>
                {!isCollapsed && draftsCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-slate-500">
                    {draftsCount}
                  </span>
                )}
              </button>

              {/* Approvals */}
              <button
                onClick={() => onTabSelect('approvals')}
                title="Pending Human Approvals (Quad-Action Review)"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'approvals'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'approvals' ? 'text-amber-300' : 'text-amber-500'}`} />
                  {!isCollapsed && <span className="truncate">Approvals</span>}
                </div>
                {!isCollapsed && approvalsCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === 'approvals' ? 'bg-teal-900 text-teal-100' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {approvalsCount}
                  </span>
                )}
              </button>

              {/* Sent Messages */}
              <button
                onClick={() => onTabSelect('sent')}
                title="Sent Messages Ledger"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'sent'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Send className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Sent</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono tabular-nums text-slate-400">
                    {sentCount}
                  </span>
                )}
              </button>

              {/* Follow-up Tasks */}
              <button
                onClick={() => onTabSelect('follow_up_tasks')}
                title="Follow-Up Tasks & Reminders"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'follow_up_tasks'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className="w-4 h-4 shrink-0 text-teal-700" />
                  {!isCollapsed && <span className="truncate">Follow-ups</span>}
                </div>
                {!isCollapsed && followUpsCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {followUpsCount}
                  </span>
                )}
              </button>

              {/* Assigned to Me */}
              <button
                onClick={() => onTabSelect('assigned_to_me')}
                title="Conversations assigned to you"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'assigned_to_me'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Assigned to Me</span>}
                </div>
              </button>

              {/* Team Inbox (Supervisor / Team view) */}
              <button
                onClick={() => onTabSelect('team_inbox')}
                title="Departmental Team Inbox"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'team_inbox'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Team Inbox</span>}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: CONTACTS & COMMUNICATIONS (Collapsed by default) */}
        <div className="space-y-0.5 pt-1 border-t border-slate-100">
          {!isCollapsed && (
            <button
              onClick={() => toggleGroup('contacts')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span>Contacts & CRM</span>
              {groupOpen.contacts ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {(groupOpen.contacts || isCollapsed) && (
            <div className="space-y-0.5">
              <button
                onClick={() => onTabSelect('crm_connections')}
                title="Constituent & Donor CRM Records"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'crm_connections'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Database className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Contacts & CRM</span>}
              </button>

              <button
                onClick={() => onTabSelect('templates')}
                title="Approved Email Templates & Canned Responses"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Email Templates</span>}
              </button>

              <button
                onClick={() => onTabSelect('ai_intelligence')}
                title="AI Email Assistant (A02 Configuration)"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'ai_intelligence'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-4 h-4 shrink-0 text-teal-600" />
                {!isCollapsed && <span className="truncate">AI Assistant</span>}
              </button>

              <button
                onClick={() => onTabSelect('fundraising')}
                title="Communications Intelligence (Major Gifts & Grants)"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'fundraising' || activeTab === 'grants' || activeTab === 'corporate' || activeTab === 'executive'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Comms Intelligence</span>}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 3: MANAGEMENT & REPORTING (Collapsed by default) */}
        <div className="space-y-0.5 pt-1 border-t border-slate-100">
          {!isCollapsed && (
            <button
              onClick={() => toggleGroup('management')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span>Management & Reports</span>
              {groupOpen.management ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {(groupOpen.management || isCollapsed) && (
            <div className="space-y-0.5">
              <button
                onClick={() => onTabSelect('mailboxes')}
                title="10 Organizational Mailboxes Inventory"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'mailboxes'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Inbox className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Org Mailboxes</span>}
              </button>

              <button
                onClick={() => onTabSelect('analytics')}
                title="Email Performance, Response Times & SLAs"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Email Analytics</span>}
              </button>

              <button
                onClick={() => onTabSelect('audit_history')}
                title="Immutable Tamper-Evident Audit Logs"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'audit_history'
                    ? 'bg-[#104F57] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span className="truncate">Audit Logs</span>}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 4: SETTINGS & CONNECTIONS (Collapsed by default) */}
        {(isSuperAdmin || isSupervisor) && (
          <div className="space-y-0.5 pt-1 border-t border-slate-100">
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup('settings')}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <span>Settings & Connectors</span>
                {groupOpen.settings ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}

            {(groupOpen.settings || isCollapsed) && (
              <div className="space-y-0.5">
                <button
                  onClick={() => onTabSelect('universal_connectors')}
                  title="Universal Email Connectors (Google, MS365, IMAP/SMTP)"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'universal_connectors'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0 text-teal-700" />
                  {!isCollapsed && <span className="truncate">Email Accounts</span>}
                </button>

                <button
                  onClick={() => onTabSelect('synchronization')}
                  title="Two-Way Inbound & Outbound Sync Checkpoints"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'synchronization'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Sync Management</span>}
                </button>

                <button
                  onClick={() => onTabSelect('settings')}
                  title="Email Policy, Security & Dispatch Settings"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#104F57] text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span className="truncate">Email Settings</span>}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer Profile Status */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#104F57] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
