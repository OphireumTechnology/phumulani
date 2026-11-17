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
  const isSafeguarding = role === 'safeguarding_officer' || role === 'safeguarding_lead';

  return (
    <aside
      className={`bg-white border-r border-phumulani-charcoal/12 transition-all duration-200 flex flex-col shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
      aria-label="Email Navigation Sidebar"
    >
      {/* Top Header Bar / Sidebar Toggle */}
      <div className="p-3 border-b border-phumulani-charcoal/10 flex items-center justify-between">
        {!isCollapsed && (
          <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal/70">
            Mail Folders
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand Email Sidebar' : 'Collapse Email Sidebar'}
            className="p-1 text-phumulani-charcoal/70 hover:text-phumulani-earth hover:bg-phumulani-cream/80 rounded-md transition-colors cursor-pointer ml-auto"
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
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal/65 hover:text-phumulani-earth cursor-pointer"
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-earth bg-phumulani-teal/12 hover:bg-phumulani-teal/25 border border-phumulani-teal/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'phumulani_ai' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {!isCollapsed && <span className="truncate font-bold">Phumulani Ai</span>}
                </div>
                {!isCollapsed && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm ${activeTab === 'phumulani_ai' ? 'bg-phumulani-charcoal text-phumulani-teal' : 'bg-phumulani-earth text-white'}`}>
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Inbox className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Inbox</span>}
                </div>
                {!isCollapsed && unreadCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-sm font-bold ${
                      activeTab === 'all_mailboxes' || activeTab === 'conversations'
                        ? 'bg-phumulani-charcoal text-phumulani-teal'
                        : 'bg-phumulani-earth/10 text-phumulani-earth'
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${activeTab === 'priority' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {!isCollapsed && <span className="truncate">Priority</span>}
                </div>
                {!isCollapsed && priorityCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-sm font-bold ${
                      activeTab === 'priority' ? 'bg-phumulani-charcoal text-phumulani-teal' : 'bg-phumulani-earth/10 text-phumulani-earth'
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileEdit className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Drafts</span>}
                </div>
                {!isCollapsed && draftsCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-current">
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'approvals' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {!isCollapsed && <span className="truncate">Approvals</span>}
                </div>
                {!isCollapsed && approvalsCount > 0 && (
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-sm font-bold ${
                      activeTab === 'approvals' ? 'bg-phumulani-charcoal text-phumulani-teal' : 'bg-phumulani-gold/20 text-phumulani-charcoal'
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Send className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Sent</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono tabular-nums text-current">
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className={`w-4 h-4 shrink-0 ${activeTab === 'follow_up_tasks' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {!isCollapsed && <span className="truncate">Follow-ups</span>}
                </div>
                {!isCollapsed && followUpsCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-phumulani-cream text-phumulani-charcoal">
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCheck className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Assigned to Me</span>}
                </div>
              </button>

              {/* Team Inbox (Supervisor / Team view) */}
              <button
                onClick={() => onTabSelect('team_inbox')}
                title="Departmental Team Inbox"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'team_inbox'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Users className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Team Inbox</span>}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: CONTACTS & COMMUNICATIONS (Collapsed by default) */}
        <div className="space-y-0.5 pt-2 border-t border-phumulani-charcoal/10">
          {!isCollapsed && (
            <button
              onClick={() => toggleGroup('contacts')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal/65 hover:text-phumulani-earth cursor-pointer"
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <Database className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Contacts & CRM</span>}
              </button>

              <button
                onClick={() => onTabSelect('templates')}
                title="Approved Email Templates & Canned Responses"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Email Templates</span>}
              </button>

              <button
                onClick={() => onTabSelect('ai_intelligence')}
                title="AI Email Assistant (A02 Configuration)"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'ai_intelligence'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <Bot className={`w-4 h-4 shrink-0 ${activeTab === 'ai_intelligence' ? 'text-white' : 'text-phumulani-earth'}`} />
                {!isCollapsed && <span className="truncate">AI Assistant</span>}
              </button>

              <button
                onClick={() => onTabSelect('fundraising')}
                title="Communications Intelligence (Major Gifts & Grants)"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'fundraising' || activeTab === 'grants' || activeTab === 'corporate' || activeTab === 'executive'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Comms Intelligence</span>}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 3: MANAGEMENT & REPORTING (Collapsed by default) */}
        <div className="space-y-0.5 pt-2 border-t border-phumulani-charcoal/10">
          {!isCollapsed && (
            <button
              onClick={() => toggleGroup('management')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal/65 hover:text-phumulani-earth cursor-pointer"
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
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <Inbox className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Org Mailboxes</span>}
              </button>

              <button
                onClick={() => onTabSelect('analytics')}
                title="Email Performance, Response Times & SLAs"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <BarChart2 className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Email Analytics</span>}
              </button>

              <button
                onClick={() => onTabSelect('audit_history')}
                title="Immutable Tamper-Evident Audit Logs"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'audit_history'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-current" />
                {!isCollapsed && <span className="truncate">Audit Logs</span>}
              </button>

              <button
                onClick={() => onTabSelect('financial_docs')}
                title="Grant Financial Documents & Advance Liquidation Guard"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'financial_docs'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <DollarSign className={`w-4 h-4 shrink-0 ${activeTab === 'financial_docs' ? 'text-white' : 'text-phumulani-earth'}`} />
                {!isCollapsed && <span className="truncate">Grant Financials</span>}
              </button>

              <button
                onClick={() => onTabSelect('governance')}
                title="Mailbox ACLs, Legal Holds, Retention & Worker Telemetry"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'governance'
                    ? 'bg-phumulani-earth text-white shadow-2xs'
                    : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'governance' ? 'text-white' : 'text-phumulani-earth'}`} />
                {!isCollapsed && <span className="truncate">Governance & Holds</span>}
              </button>
            </div>
          )}
        </div>

        {/* GROUP 4: SETTINGS & CONNECTIONS (Collapsed by default) */}
        {(isSuperAdmin || isSupervisor) && (
          <div className="space-y-0.5 pt-2 border-t border-phumulani-charcoal/10">
            {!isCollapsed && (
              <button
                onClick={() => toggleGroup('settings')}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-phumulani-charcoal/65 hover:text-phumulani-earth cursor-pointer"
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
                      ? 'bg-phumulani-earth text-white shadow-2xs'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <Sliders className={`w-4 h-4 shrink-0 ${activeTab === 'universal_connectors' ? 'text-white' : 'text-phumulani-earth'}`} />
                  {!isCollapsed && <span className="truncate">Email Accounts</span>}
                </button>

                <button
                  onClick={() => onTabSelect('synchronization')}
                  title="Two-Way Inbound & Outbound Sync Checkpoints"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'synchronization'
                      ? 'bg-phumulani-earth text-white shadow-2xs'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Sync Management</span>}
                </button>

                <button
                  onClick={() => onTabSelect('settings')}
                  title="Email Policy, Security & Dispatch Settings"
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-phumulani-earth text-white shadow-2xs'
                      : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0 text-current" />
                  {!isCollapsed && <span className="truncate">Email Settings</span>}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer Profile Status */}
      <div className="p-2.5 border-t border-phumulani-charcoal/10 bg-phumulani-cream/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-phumulani-charcoal text-white font-bold text-xs flex items-center justify-center shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-phumulani-charcoal truncate">{currentUser.name}</div>
              <div className="text-[10px] text-phumulani-charcoal/70 truncate">{currentUser.email}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
