/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Role Switcher & Interactive Demo Toolbar
 */

import React from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { UserCheck, Shield, RefreshCw, Sparkles, AlertCircle, Mail } from 'lucide-react';

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
    <div className="bg-phumulani-charcoal text-phumulani-cream text-xs border-b border-phumulani-earth no-print z-50 w-full transition-all">
      {/* COMPACT REFINED CONTROL BAR */}
      <div className="py-1 px-3 sm:px-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="demo-tools-panel"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-phumulani-charcoal hover:bg-phumulani-earth text-white font-medium text-[11px] border border-phumulani-gold transition-colors cursor-pointer shrink-0"
            title="Toggle Demo Simulation Tools"
          >
            <Sparkles className="w-3 h-3 text-phumulani-gold shrink-0" />
            <span>Admin Tools</span>
            <span className="text-[9px] text-phumulani-cream">{isCollapsed ? '▼' : '▲'}</span>
          </button>

          <span className="text-phumulani-cream text-[11px] truncate hidden sm:inline">
            <span className="text-phumulani-gold">Active Role:</span>{' '}
            <strong className="text-white font-semibold">{currentUser.name}</strong>{' '}
            <span className="text-phumulani-cream">({roleLabels[currentUser.role] || currentUser.role})</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-phumulani-cream font-mono tracking-wider hidden md:inline">
            STAFF CONSOLE
          </span>
          <button
            onClick={toggleCollapsed}
            className="text-phumulani-gold hover:text-white text-[11px] hover:underline cursor-pointer"
          >
            {isCollapsed ? 'Show Options' : 'Hide Options'}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SIMULATION PANEL */}
      {!isCollapsed && (
        <div
          id="demo-tools-panel"
          className="border-t border-phumulani-earth bg-phumulani-charcoal py-2.5 px-3 sm:px-4 flex flex-col gap-2.5 animate-fadeIn"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-phumulani-earth">
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
                className="bg-white text-phumulani-charcoal border border-phumulani-earth rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-phumulani-gold outline-none font-medium cursor-pointer max-w-[260px] truncate"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {roleLabels[u.role] || u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-white bg-phumulani-charcoal px-2.5 py-1 rounded border border-phumulani-green text-[11px]">
                <Shield className="w-3.5 h-3.5 text-phumulani-green" />
                <span>Simulated MFA: {currentUser.mfaEnabled ? 'Enforced' : 'Standard'}</span>
              </div>

              <button
                onClick={handleResetData}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors text-[11px] cursor-pointer ${
                  resetStatus === 'confirming'
                    ? 'bg-phumulani-earth border-phumulani-gold text-white font-bold animate-pulse'
                    : resetStatus === 'done'
                    ? 'bg-phumulani-green border-phumulani-cream text-phumulani-charcoal font-bold'
                    : 'bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-cream hover:text-white border-phumulani-cream'
                }`}
                title="Restore baseline test records"
              >
                <RefreshCw className={`w-3 h-3 ${resetStatus === 'done' ? 'text-phumulani-charcoal rotate-180' : 'text-phumulani-gold'}`} />
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

            <button
              onClick={() => onViewChange('public')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                activeView === 'public'
                  ? 'bg-phumulani-cream text-phumulani-charcoal border border-white'
                  : 'bg-phumulani-charcoal text-phumulani-cream hover:text-white border border-phumulani-cream'
              }`}
            >
              Public Website
            </button>

            <button
              onClick={() => onViewChange('community')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'community'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-teal hover:text-white border border-phumulani-teal'
              }`}
            >
              Community Member
            </button>

            <button
              onClick={() => onViewChange('community')}
              className="px-2 py-0.5 rounded text-[11px] font-bold bg-phumulani-charcoal text-phumulani-green hover:text-white border border-phumulani-green transition-colors"
            >
              Volunteer
            </button>

            <button
              onClick={() => onViewChange('donor')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'donor'
                  ? 'bg-phumulani-orange text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-gold hover:text-white border border-phumulani-orange'
              }`}
            >
              Donor
            </button>

            <button
              onClick={() => onViewChange('staff')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'staff'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-teal hover:text-white border border-phumulani-teal'
              }`}
            >
              Staff
            </button>

            <button
              onClick={() => onViewChange('master-admin')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'master-admin'
                  ? 'bg-phumulani-gold text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-gold hover:text-white border border-phumulani-gold'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Master Admin</span>
            </button>

            <button
              onClick={() => onViewChange('email-command')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'email-command'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-teal hover:text-white border border-phumulani-teal'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>Email Admin</span>
            </button>

            <button
              onClick={() => onViewChange('client-development')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'client-development'
                  ? 'bg-phumulani-gold text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-gold hover:text-white border border-phumulani-gold'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Client Portal</span>
            </button>

            <button
              onClick={() => onViewChange('development-ops')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'development-ops'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-teal hover:text-white border border-phumulani-teal'
              }`}
            >
              DevOps
            </button>

            <button
              onClick={() => onViewChange('fundraising')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'fundraising'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-teal hover:text-white border border-phumulani-teal'
              }`}
            >
              Fundraising CRM
            </button>

            <button
              onClick={() => onViewChange('email-command')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'email-command'
                  ? 'bg-phumulani-green text-phumulani-charcoal border border-phumulani-cream'
                  : 'bg-phumulani-charcoal text-phumulani-green hover:text-white border border-phumulani-green'
              }`}
            >
              Email Command
            </button>

            <button
              onClick={() => onViewChange('production-status')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeView === 'production-status'
                  ? 'bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream font-bold'
                  : 'bg-phumulani-charcoal text-phumulani-cream hover:text-white border border-phumulani-cream'
              }`}
            >
              Live Status
            </button>

            <button
              onClick={() => onViewChange('readiness')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeView === 'readiness'
                  ? 'bg-phumulani-gold text-phumulani-charcoal border border-phumulani-cream font-bold'
                  : 'bg-phumulani-charcoal text-phumulani-cream hover:text-white border border-phumulani-gold'
              }`}
            >
              <UserCheck className="w-3 h-3 text-phumulani-gold" />
              <span>12 Gates</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
