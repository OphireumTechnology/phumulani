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

  return (
    <div className="bg-slate-950 text-white text-xs border-b border-slate-800 no-print z-50 w-full transition-all">
      {/* COMPACT SINGLE CONTROL BAR */}
      <div className="py-1 px-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="demo-tools-panel"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-[11px] border border-amber-400/30 transition-colors cursor-pointer shrink-0"
            title="Toggle Demo Simulation Tools"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Demo Tools</span>
            <span className="text-[10px] text-amber-300/80">{isCollapsed ? '▼' : '▲'}</span>
          </button>

          <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
            <span className="text-slate-500">Current Role:</span>{' '}
            <strong className="text-slate-200">{currentUser.name}</strong> ({roleLabels[currentUser.role] || currentUser.role})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            SIMULATION MODE
          </span>
          <button
            onClick={toggleCollapsed}
            className="text-slate-400 hover:text-slate-200 text-[11px] underline cursor-pointer"
          >
            {isCollapsed ? 'Expand Controls' : 'Hide Controls'}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SIMULATION PANEL */}
      {!isCollapsed && (
        <div
          id="demo-tools-panel"
          className="border-t border-slate-800 bg-slate-900/95 py-2.5 px-3 sm:px-4 flex flex-col gap-2.5 animate-fadeIn"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
            {/* Role Simulation Selector */}
            <div className="flex items-center gap-2 min-w-0">
              <label htmlFor="role-simulation-select" className="text-slate-400 text-[11px] font-semibold shrink-0">
                Simulate Role:
              </label>
              <select
                id="role-simulation-select"
                aria-label="Role Simulation"
                value={currentUser.id}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-amber-400 outline-none font-medium cursor-pointer max-w-[260px] truncate"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {roleLabels[u.role] || u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulated MFA: {currentUser.mfaEnabled ? 'Enforced' : 'Standard'}</span>
              </div>

              <button
                onClick={handleResetData}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors text-[11px] cursor-pointer ${
                  resetStatus === 'confirming'
                    ? 'bg-rose-900 border-rose-500 text-rose-100 font-bold animate-pulse'
                    : resetStatus === 'done'
                    ? 'bg-emerald-900 border-emerald-500 text-emerald-100 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
                title="Restore baseline test records"
              >
                <RefreshCw className={`w-3 h-3 ${resetStatus === 'done' ? 'text-emerald-400 rotate-180' : 'text-slate-400'}`} />
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
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold mr-1 shrink-0">
              Portals:
            </span>

            <button
              onClick={() => onViewChange('public')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                activeView === 'public'
                  ? 'bg-slate-200 text-slate-950 border border-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              Public Website
            </button>

            <button
              onClick={() => onViewChange('community')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'community'
                  ? 'bg-teal-400 text-slate-950 border border-teal-300'
                  : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
              }`}
            >
              Community Member
            </button>

            <button
              onClick={() => onViewChange('community')}
              className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors"
            >
              Volunteer
            </button>

            <button
              onClick={() => onViewChange('donor')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'donor'
                  ? 'bg-purple-400 text-slate-950 border border-purple-300'
                  : 'bg-slate-800 text-purple-300 hover:text-white border border-purple-500/40'
              }`}
            >
              Donor
            </button>

            <button
              onClick={() => onViewChange('staff')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'staff'
                  ? 'bg-sky-400 text-slate-950 border border-sky-300'
                  : 'bg-slate-800 text-sky-300 hover:text-white border border-sky-500/40'
              }`}
            >
              Staff
            </button>

            <button
              onClick={() => onViewChange('master-admin')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'master-admin'
                  ? 'bg-amber-400 text-slate-950 border border-amber-300'
                  : 'bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Master Admin</span>
            </button>

            <button
              onClick={() => onViewChange('email-command')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'email-command'
                  ? 'bg-teal-400 text-slate-950 border border-teal-300'
                  : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
              }`}
            >
              <Mail className="w-3 h-3 text-teal-400" />
              <span>Email Admin</span>
            </button>

            <button
              onClick={() => onViewChange('client-development')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'client-development'
                  ? 'bg-amber-400 text-slate-950 border border-amber-300'
                  : 'bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Client Portal</span>
            </button>

            <button
              onClick={() => onViewChange('development-ops')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'development-ops'
                  ? 'bg-teal-400 text-slate-950 border border-teal-300'
                  : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
              }`}
            >
              DevOps
            </button>

            <button
              onClick={() => onViewChange('fundraising')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'fundraising'
                  ? 'bg-teal-400 text-slate-950 border border-teal-300'
                  : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
              }`}
            >
              Fundraising CRM
            </button>

            <button
              onClick={() => onViewChange('email-command')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                activeView === 'email-command'
                  ? 'bg-emerald-400 text-slate-950 border border-emerald-300'
                  : 'bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40'
              }`}
            >
              Email Command
            </button>

            <button
              onClick={() => onViewChange('production-status')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeView === 'production-status'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              Live Status
            </button>

            <button
              onClick={() => onViewChange('readiness')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                activeView === 'readiness'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>12 Gates</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
