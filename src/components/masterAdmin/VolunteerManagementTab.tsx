/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Volunteer Management (M24.09)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { EnterpriseVolunteerProfile, VolunteerLifecycleStage } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  HeartHandshake,
  UserCheck,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Lock,
} from 'lucide-react';

interface VolunteerManagementTabProps {
  currentUser: User;
}

export const VolunteerManagementTab: React.FC<VolunteerManagementTabProps> = ({ currentUser }) => {
  const [volunteers, setVolunteers] = useState<EnterpriseVolunteerProfile[]>(masterAdminService.getVolunteers());
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const reloadVolunteers = () => {
    setVolunteers(masterAdminService.getVolunteers());
  };

  const handleAdvanceStage = (
    volunteerId: string,
    newStage: VolunteerLifecycleStage,
    screeningDetails?: { clearedBackgroundCheck?: boolean; orientationCompleted?: boolean }
  ) => {
    const res = masterAdminService.advanceVolunteerStage(
      volunteerId,
      newStage,
      currentUser.role,
      currentUser.name,
      screeningDetails
    );

    if (res.success) {
      setActionNotice({ type: 'success', message: `Volunteer status advanced to ${newStage}.` });
      reloadVolunteers();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to advance volunteer stage.' });
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.departmentPlacement.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || v.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-800" />
            <h2 className="text-lg font-bold text-slate-900">Volunteer Operations & Safeguarding Screening</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete volunteer lifecycle with verified BCA background checks, safeguarding training, and hours tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
            {volunteers.filter((v) => v.stage === 'ACTIVE_ENGAGEMENT').length} Active Volunteers
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            {volunteers.filter((v) => v.stage === 'APPLICATION' || v.stage === 'SCREENING').length} In Screening
          </span>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search volunteers by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
        >
          <option value="all">All Lifecycle Stages ({volunteers.length})</option>
          <option value="APPLICATION">Application</option>
          <option value="SCREENING">Screening</option>
          <option value="APPROVAL">Approval</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="ACTIVE_ENGAGEMENT">Active Engagement</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Volunteer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVolunteers.map((vol) => (
          <div key={vol.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{vol.fullName}</h3>
                  <p className="text-[11px] text-slate-500">{vol.email}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    vol.stage === 'ACTIVE_ENGAGEMENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : vol.stage === 'APPROVAL'
                      ? 'bg-blue-100 text-blue-800'
                      : vol.stage === 'SCREENING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {vol.stage.replace('_', ' ')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Placement:</span>
                  <span className="font-semibold text-slate-800">{vol.departmentPlacement}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Screening Status:</span>
                  <span
                    className={`font-bold ${
                      vol.screeningStatus === 'CLEARED' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {vol.screeningStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Orientation:</span>
                  <span className={vol.orientationCompleted ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                    {vol.orientationCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Logged Hours:</span>
                  <span className="font-bold text-teal-800">{vol.totalHoursLogged} hrs</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1">
                {vol.skills.map((s, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Stage Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {vol.stage === 'APPLICATION' && (
                <button
                  onClick={() => handleAdvanceStage(vol.id, 'SCREENING')}
                  className="w-full py-1.5 bg-teal-800 text-white rounded font-medium hover:bg-teal-900"
                >
                  Initiate Screening
                </button>
              )}
              {vol.stage === 'SCREENING' && (
                <button
                  onClick={() =>
                    handleAdvanceStage(vol.id, 'APPROVAL', {
                      clearedBackgroundCheck: true,
                      orientationCompleted: true,
                    })
                  }
                  className="w-full py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800"
                >
                  Clear Background & Approve
                </button>
              )}
              {vol.stage === 'APPROVAL' && (
                <button
                  onClick={() => handleAdvanceStage(vol.id, 'ACTIVE_ENGAGEMENT')}
                  className="w-full py-1.5 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800"
                >
                  Place in Active Engagement
                </button>
              )}
              {vol.stage === 'ACTIVE_ENGAGEMENT' && (
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cleared & Active in Program
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
