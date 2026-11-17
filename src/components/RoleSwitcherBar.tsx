/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Role Switcher & Interactive Demo Toolbar
 */

import React from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { UserCheck, ShieldCheck, RefreshCw, Sparkles, Mail } from 'lucide-react';

interface RoleSwitcherBarProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  activeView,
  onViewChange,
}) => {
  const users = db.getState().users;

  const handleUserSelect = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (selected) {
      db.setCurrentUser(selected);
      // Auto route to appropriate portal
      if (selected.role === 'PLATFORM_SUPER_ADMIN') {
        onViewChange('master-admin');
      } else if (['CLIENT_PROJECT_ADMIN', 'CLIENT_PROJECT_VIEWER', 'CLIENT_APPROVER'].includes(selected.role)) {
        onViewChange('client-development');
      } else if (['DEVELOPMENT_ADMIN', 'DEVELOPER'].includes(selected.role)) {
        onViewChange('development-ops');
      } else if (selected.role === 'volunteer' && activeView !== 'community') {
        onViewChange('community');
      } else if (selected.role === 'donor' && activeView !== 'donor') {
        onViewChange('donor');
      } else if (['staff', 'volunteer_coordinator', 'finance_officer', 'safeguarding_officer', 'program_manager'].includes(selected.role) && activeView !== 'staff') {
        onViewChange('staff');
      } else if (['executive_director', 'board_member', 'governance_officer'].includes(selected.role) && activeView !== 'governance') {
        onViewChange('governance');
      } else if ((selected.role === 'community_advocate' || selected.role === 'community_member') && activeView !== 'community') {
        onViewChange('community');
      }
    }
  };

  const [resetStatus, setResetStatus] = React.useState<'idle' | 'confirming' | 'done'>('idle');

  const handleResetData = () => {
    if (resetStatus === 'idle') {
      setResetStatus('confirming');
      setTimeout(() => setResetStatus('idle'), 4000);
      return;
    }
    if (resetStatus === 'confirming') {
      db.resetDatabase();
      setResetStatus('done');
      setTimeout(() => setResetStatus('idle'), 2500);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    visitor: 'Public Visitor',
    volunteer: 'Volunteer',
    donor: 'Donor / Sponsor',
    sponsor: 'Corporate Sponsor',
    staff: 'Staff Administrator',
    volunteer_coordinator: 'Volunteer Coordinator',
    finance_officer: 'Finance Director',
    communications_officer: 'Communications Lead',
    executive_director: 'Executive Director (CEO)',
    board_member: 'Board Chair',
    safeguarding_officer: 'Safeguarding Officer',
    safeguarding_lead: 'Safeguarding Lead',
    super_admin: 'Super Administrator',
    PLATFORM_SUPER_ADMIN: 'Master Administrator',
    governance_officer: 'Governance Officer',
    program_manager: 'Program Manager',
    community_advocate: 'Community Advocate',
    community_member: 'Community Member',
    PUBLIC_VISITOR: 'Public Visitor (Canonical)',
    COMMUNITY_MEMBER: 'Community Member (Canonical)',
    VOLUNTEER_APPLICANT: 'Volunteer Applicant (Canonical)',
    APPROVED_VOLUNTEER: 'Approved Volunteer (Canonical)',
    DONOR: 'Donor (Canonical)',
    STAFF: 'Staff (Canonical)',
    DEPARTMENT_MANAGER: 'Department Manager (Canonical)',
    EXECUTIVE: 'Executive Leadership (Canonical)',
    BOARD_MEMBER: 'Board Member (Canonical)',
    MASTER_ADMIN: 'Master Administrator (Canonical)',
    CLIENT_PROJECT_ADMIN: 'Client Project Lead',
    CLIENT_PROJECT_VIEWER: 'Client Project Viewer',
    CLIENT_APPROVER: 'Client Approver (CEO)',
    DEVELOPMENT_ADMIN: 'DevOps Administrator',
    DEVELOPER: 'Senior Engineer',
  };

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('phumulani_demo_toolbar_collapsed');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('phumulani_demo_toolbar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isPublicVisitor = currentUser.role === 'visitor' || currentUser.role === 'PUBLIC_VISITOR';

  // Do not expose demo or simulation controls to ordinary public visitors on public pages
  if (isPublicVisitor && activeView === 'public') {
    return (
      <div className="sr-only" aria-hidden="true">
        <select
          id="role-simulation-select"
          aria-label="Role Simulation"
          value={currentUser.id}
          onChange={(e) => handleUserSelect(e.target.value)}
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {roleLabels[u.role] || u.role}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-phumulani-charcoal text-phumulani-cream text-xs border-b border-phumulani-earth/40 no-print z-50 w-full transition-all shadow-sm">
      {/* COMPACT REFINED CONTROL BAR */}
      <div className="py-1.5 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="demo-tools-panel"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-phumulani-charcoal hover:bg-phumulani-earth text-white font-semibold text-[11px] border border-phumulani-cream/30 transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-phumulani-gold"
            title="Toggle Demo Simulation Tools"
          >
            <Sparkles className="w-3 h-3 text-phumulani-gold shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Admin Tools</span>
            <span className="text-[9px] text-phumulani-cream">{isCollapsed ? '▼' : '▲'}</span>
          </button>

          <span className="text-phumulani-cream text-[11px] truncate hidden sm:inline">
            <span className="text-phumulani-gold font-medium">Active Role:</span>{' '}
            <strong className="text-white font-semibold">{currentUser.name}</strong>{' '}
            <span className="text-phumulani-cream/85">({roleLabels[currentUser.role] || currentUser.role})</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] text-phumulani-gold font-mono tracking-wider hidden md:inline">
            STAFF &amp; ADMIN CONSOLE
          </span>
          <button
            onClick={toggleCollapsed}
            className="text-phumulani-gold hover:text-white text-[11px] font-medium hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-gold rounded px-1"
          >
            {isCollapsed ? 'Show Options' : 'Hide Options'}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SIMULATION PANEL */}
      {!isCollapsed && (
        <div
          id="demo-tools-panel"
          className="border-t border-phumulani-cream/15 bg-phumulani-charcoal py-2.5 px-3 sm:px-4 flex flex-col gap-2.5 animate-fadeIn max-w-7xl mx-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-phumulani-cream/15">
            {/* Role Simulation Selector */}
            <div className="flex items-center gap-2 min-w-0">
              <label htmlFor="role-simulation-select" className="text-phumulani-cream text-[11px] font-semibold shrink-0">
                Simulate Role:
              </label>
              <select
                id="role-simulation-select"
                aria-label="Role Simulation"
                value={currentUser.id}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="bg-white text-phumulani-charcoal border border-phumulani-cream rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-phumulani-gold outline-none font-medium cursor-pointer max-w-[260px] truncate"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {roleLabels[u.role] || u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-white bg-phumulani-charcoal px-2.5 py-1 rounded-md border border-phumulani-green/50 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-phumulani-green" strokeWidth={1.75} aria-hidden="true" />
                <span>Simulated MFA: {currentUser.mfaEnabled ? 'Enforced' : 'Standard'}</span>
              </div>

              <button
                onClick={handleResetData}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors text-[11px] cursor-pointer ${
                  resetStatus === 'confirming'
                    ? 'bg-phumulani-earth border-phumulani-gold text-white font-bold'
                    : resetStatus === 'done'
                    ? 'bg-phumulani-green border-phumulani-cream text-phumulani-charcoal font-bold'
                    : 'bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-cream hover:text-white border-phumulani-cream/30'
                }`}
                title="Restore baseline test records"
              >
                <RefreshCw
                  className={`w-3 h-3 transition-transform duration-300 ${
                    resetStatus === 'done' ? 'text-phumulani-charcoal rotate-180' : 'text-phumulani-gold'
                  }`}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>
                  {resetStatus === 'confirming'
                    ? 'Click to Confirm Reset'
                    : resetStatus === 'done'
                    ? 'Reset Complete!'
                    : 'Reset Demo Data'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Portal Switchers */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[10px] font-mono uppercase text-phumulani-gold font-bold mr-1 shrink-0">
              Portals:
            </span>

            {[
              { id: 'public', label: 'Public Website' },
              { id: 'community', label: 'Community Member' },
              { id: 'donor', label: 'Donor' },
              { id: 'staff', label: 'Staff' },
              { id: 'master-admin', label: 'Master Admin', icon: ShieldCheck },
              { id: 'email-command', label: 'Email Admin', icon: Mail },
              { id: 'client-development', label: 'Client Portal', icon: Sparkles },
              { id: 'development-ops', label: 'DevOps' },
              { id: 'fundraising', label: 'Fundraising CRM' },
              { id: 'production-status', label: 'Live Status' },
              { id: 'readiness', label: '12 Gates', icon: UserCheck },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = activeView === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onViewChange(p.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-phumulani-gold text-phumulani-charcoal border border-phumulani-gold'
                      : 'bg-phumulani-charcoal text-phumulani-cream hover:bg-phumulani-earth hover:text-white border border-phumulani-cream/25'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
