/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Role Switcher & Interactive Demo Toolbar
 */

import React from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { UserCheck, Shield, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

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
      } else if (['staff', 'volunteer_coordinator', 'finance_officer', 'safeguarding_officer', 'program_manager'].includes(selected.role) && activeView === 'public') {
        onViewChange('staff');
      } else if (['executive_director', 'board_member', 'governance_officer'].includes(selected.role) && activeView === 'public') {
        onViewChange('governance');
      } else if (selected.role === 'community_advocate' || selected.role === 'community_member') {
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

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  if (isCollapsed) {
    return (
      <div className="bg-slate-900/90 text-white text-[11px] py-1 px-4 border-b border-slate-800 flex items-center justify-between no-print z-50">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>DEMO MODE ACTIVE</span>
          <span className="text-slate-400 font-normal hidden sm:inline">
            · Simulating: {currentUser.name} ({roleLabels[currentUser.role] || currentUser.role})
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-slate-300 hover:text-white underline text-[11px] cursor-pointer"
        >
          Expand Demo Controls ▾
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white text-xs py-1.5 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print z-50 max-w-full overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold tracking-wide text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEMO SIMULATION TOOLBAR</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Role Simulation:</span>
          <select
            value={currentUser.id}
            onChange={(e) => handleUserSelect(e.target.value)}
            className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none font-medium cursor-pointer max-w-[160px] truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {roleLabels[u.role] || u.role}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Simulated MFA: {currentUser.mfaEnabled ? 'Enforced' : 'Standard'}</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 min-w-0 overflow-x-auto py-1">
        <button
          onClick={handleResetData}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border transition-colors text-[11px] cursor-pointer ${
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

        <button
          onClick={() => onViewChange('public')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] font-semibold ${
            activeView === 'public'
              ? 'bg-slate-200 text-slate-950 border border-white'
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Public Website"
        >
          <span>Public Website</span>
        </button>

        <button
          onClick={() => onViewChange('community')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'community'
              ? 'bg-teal-400 text-slate-950 border border-teal-300'
              : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
          }`}
          title="Community Member Portal"
        >
          <span>Community Member</span>
        </button>

        <button
          onClick={() => onViewChange('community')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'community'
              ? 'bg-emerald-400 text-slate-950 border border-emerald-300'
              : 'bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40'
          }`}
          title="Volunteer Portal"
        >
          <span>Volunteer</span>
        </button>

        <button
          onClick={() => onViewChange('donor')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'donor'
              ? 'bg-purple-400 text-slate-950 border border-purple-300'
              : 'bg-slate-800 text-purple-300 hover:text-white border border-purple-500/40'
          }`}
          title="Donor & Sponsor Portal"
        >
          <span>Donor</span>
        </button>

        <button
          onClick={() => onViewChange('staff')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'staff'
              ? 'bg-sky-400 text-slate-950 border border-sky-300'
              : 'bg-slate-800 text-sky-300 hover:text-white border border-sky-500/40'
          }`}
          title="Staff Command Center"
        >
          <span>Staff</span>
        </button>

        <button
          onClick={() => onViewChange('master-admin')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'master-admin'
              ? 'bg-amber-400 text-slate-950 border border-amber-300'
              : 'bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40'
          }`}
          title="Master Administrator Command Dashboard (/admin/master)"
        >
          <Shield className="w-3 h-3 text-amber-400" />
          <span>Master Admin</span>
        </button>

        <button
          onClick={() => onViewChange('client-development')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'client-development'
              ? 'bg-amber-400 text-slate-950 border border-amber-300'
              : 'bg-slate-800 text-amber-300 hover:text-white border border-amber-500/40'
          }`}
          title="Client Development Transparency Portal (/client/project-dashboard)"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Client Portal</span>
        </button>

        <button
          onClick={() => onViewChange('development-ops')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'development-ops'
              ? 'bg-teal-400 text-slate-950 border border-teal-300'
              : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
          }`}
          title="Development Operations Hub (/admin/master/development)"
        >
          <span>Dev Ops</span>
        </button>

        <button
          onClick={() => onViewChange('fundraising')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'fundraising'
              ? 'bg-teal-400 text-slate-950 border border-teal-300'
              : 'bg-slate-800 text-teal-300 hover:text-white border border-teal-500/40'
          }`}
          title="Enterprise Fundraising CRM & Donor Intelligence (/admin/master/fundraising)"
        >
          <span>Fundraising CRM</span>
        </button>

        <button
          onClick={() => onViewChange('email-command')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] font-bold ${
            activeView === 'email-command'
              ? 'bg-emerald-400 text-slate-950 border border-emerald-300'
              : 'bg-slate-800 text-emerald-300 hover:text-white border border-emerald-500/40'
          }`}
          title="Enterprise AI Email Command Center (/admin/master/email)"
        >
          <span>Email Command</span>
        </button>

        <button
          onClick={() => onViewChange('production-status')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] ${
            activeView === 'production-status'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title="Section 16 Live Production Component Status"
        >
          <span>Live Status</span>
        </button>

        <button
          onClick={() => onViewChange('readiness')}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors text-[11px] ${
            activeView === 'readiness'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <UserCheck className="w-3 h-3 text-amber-400" />
          <span>12 Gates</span>
        </button>

        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 hover:bg-slate-800 rounded ml-1"
          title="Minimize toolbar"
        >
          ▴ Hide
        </button>
      </div>
    </div>
  );
};
