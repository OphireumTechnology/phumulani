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
      // Auto route to appropriate portal if relevant
      if (selected.role === 'volunteer' && activeView !== 'community') {
        onViewChange('community');
      } else if (selected.role === 'donor' && activeView !== 'donor') {
        onViewChange('donor');
      } else if (['staff', 'volunteer_coordinator', 'finance_officer', 'safeguarding_officer'].includes(selected.role) && activeView === 'public') {
        onViewChange('staff');
      } else if (['executive_director', 'board_member'].includes(selected.role) && activeView === 'public') {
        onViewChange('governance');
      }
    }
  };

  const handleResetData = () => {
    if (confirm('Reset entire interactive database to original baseline seed data?')) {
      db.resetDatabase();
      alert('Database successfully reset to seed data.');
    }
  };

  const roleLabels: Record<UserRole, string> = {
    visitor: 'Public Visitor',
    volunteer: 'Volunteer',
    donor: 'Donor / Sponsor',
    sponsor: 'Corporate Sponsor',
    staff: 'Staff Member',
    volunteer_coordinator: 'Volunteer Coordinator',
    finance_officer: 'Finance Director',
    communications_officer: 'Communications Lead',
    executive_director: 'Executive Director (CEO)',
    board_member: 'Board Chair',
    safeguarding_officer: 'Safeguarding Officer',
    super_admin: 'Super Administrator',
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
    <div className="bg-slate-950 text-white text-xs py-1.5 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print z-50">
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
            className="bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none font-medium cursor-pointer"
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

      <div className="flex items-center gap-2">
        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors text-[11px]"
          title="Restore baseline test records"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span>Reset Demo Data</span>
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
          <span>12 Release Gates</span>
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
