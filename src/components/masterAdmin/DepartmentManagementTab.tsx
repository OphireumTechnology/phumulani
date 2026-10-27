/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Department Management (M24.05)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { OrganizationalDepartment } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  Building2,
  Users,
  CheckSquare,
  FileCheck2,
  Lock,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface DepartmentManagementTabProps {
  currentUser: User;
  onNavigateTab: (tabId: string) => void;
}

export const DepartmentManagementTab: React.FC<DepartmentManagementTabProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const [departments, setDepartments] = useState<OrganizationalDepartment[]>(masterAdminService.getDepartments());
  const [selectedDept, setSelectedDept] = useState<OrganizationalDepartment | null>(departments[0] || null);
  const [search, setSearch] = useState('');

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.headStaffName.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-800" />
            <h2 className="text-lg font-bold text-slate-900">Organizational Department Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure department leadership, track cross-functional workloads, and enforce safeguarding isolation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Total Departments:</span>
          <span className="font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
            {departments.length} Active
          </span>
        </div>
      </div>

      {/* Main Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredDepts.map((dept) => {
              const isSelected = selectedDept?.id === dept.id;
              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                    {dept.isSafeguardingIsolated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded">
                        <Lock className="w-3 h-3" /> VAWA
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 mb-2">
                    Lead: <span className="font-semibold text-slate-700">{dept.headStaffName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>{dept.assignedStaffCount} Staff</span>
                    <span className="text-teal-800 font-semibold">{dept.openTasksCount} Tasks</span>
                    <span className="text-purple-800 font-semibold">{dept.pendingApprovalsCount} Approvals</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Department Detail Panel */}
        <div className="lg:col-span-2">
          {selectedDept ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedDept.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                      {selectedDept.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedDept.description}</p>
                </div>

                {selectedDept.isSafeguardingIsolated && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-bold">Safeguarding Isolated</div>
                      <div className="text-[10px]">Zero-disclosure boundary active</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Department Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Department Head</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedDept.headStaffName}</div>
                  <div className="text-[10px] text-slate-500">{selectedDept.headTitle}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Staff</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedDept.assignedStaffCount} Members</div>
                  <div className="text-[10px] text-teal-700">Active engagement</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Annual Budget</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    ${selectedDept.budgetAnnualUSD.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">Allocated for FY2026</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Operational Status</div>
                  <div className="text-xs font-bold text-emerald-800 mt-0.5">{selectedDept.operationalStatus}</div>
                  <div className="text-[10px] text-slate-500">100% SLA compliant</div>
                </div>
              </div>

              {/* Authorized Permissions Strip */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Assigned Capability & Permission Domains
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept.authorizedPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-mono text-slate-800 font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Department Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Department configuration maintained under Phase 24 standards.</span>
                <button
                  onClick={() => onNavigateTab('task_management')}
                  className="px-3.5 py-1.5 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-900 transition-colors"
                >
                  View Department Tasks
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a department to view detailed workload and leadership information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
