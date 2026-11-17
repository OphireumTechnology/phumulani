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
      <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-phumulani-earth" />
            <h2 className="text-lg font-bold text-phumulani-charcoal">Organizational Department Management</h2>
          </div>
          <p className="text-xs text-phumulani-charcoal mt-1">
            Configure department leadership, track cross-functional workloads, and enforce safeguarding isolation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-phumulani-charcoal">Total Departments:</span>
          <span className="font-bold text-phumulani-earth bg-phumulani-cream border border-phumulani-teal px-2.5 py-1 rounded-full">
            {departments.length} Active
          </span>
        </div>
      </div>

      {/* Main Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-phumulani-cream shadow-xs">
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 text-xs border border-phumulani-cream rounded-lg focus:outline-none focus:ring-1 focus:ring-phumulani-earth"
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
                      ? 'bg-phumulani-cream border-phumulani-earth shadow-xs'
                      : 'bg-white border-phumulani-cream hover:border-phumulani-cream'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-phumulani-charcoal">{dept.name}</span>
                    {dept.isSafeguardingIsolated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-1.5 py-0.2 rounded">
                        <Lock className="w-3 h-3" /> VAWA
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-phumulani-charcoal mb-2">
                    Lead: <span className="font-semibold text-phumulani-charcoal">{dept.headStaffName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal pt-2 border-t border-phumulani-cream">
                    <span>{dept.assignedStaffCount} Staff</span>
                    <span className="text-phumulani-earth font-semibold">{dept.openTasksCount} Tasks</span>
                    <span className="text-phumulani-earth font-semibold">{dept.pendingApprovalsCount} Approvals</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Department Detail Panel */}
        <div className="lg:col-span-2">
          {selectedDept ? (
            <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-phumulani-cream">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-phumulani-charcoal">{selectedDept.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 bg-phumulani-cream text-phumulani-charcoal rounded font-bold">
                      {selectedDept.id}
                    </span>
                  </div>
                  <p className="text-xs text-phumulani-charcoal mt-1">{selectedDept.description}</p>
                </div>

                {selectedDept.isSafeguardingIsolated && (
                  <div className="p-2.5 bg-phumulani-cream border border-phumulani-earth rounded-lg text-phumulani-earth text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 text-phumulani-earth" />
                    <div>
                      <div className="font-bold">Safeguarding Isolated</div>
                      <div className="text-[10px]">Zero-disclosure boundary active</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Department Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                  <div className="text-[10px] uppercase font-bold text-phumulani-charcoal">Department Head</div>
                  <div className="text-xs font-bold text-phumulani-charcoal mt-0.5">{selectedDept.headStaffName}</div>
                  <div className="text-[10px] text-phumulani-charcoal">{selectedDept.headTitle}</div>
                </div>

                <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                  <div className="text-[10px] uppercase font-bold text-phumulani-charcoal">Assigned Staff</div>
                  <div className="text-base font-bold text-phumulani-charcoal mt-0.5">{selectedDept.assignedStaffCount} Members</div>
                  <div className="text-[10px] text-phumulani-earth">Active engagement</div>
                </div>

                <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                  <div className="text-[10px] uppercase font-bold text-phumulani-charcoal">Annual Budget</div>
                  <div className="text-base font-bold text-phumulani-charcoal mt-0.5">
                    ${selectedDept.budgetAnnualUSD.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-phumulani-charcoal">Allocated for FY2026</div>
                </div>

                <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                  <div className="text-[10px] uppercase font-bold text-phumulani-charcoal">Operational Status</div>
                  <div className="text-xs font-bold text-phumulani-charcoal mt-0.5">{selectedDept.operationalStatus}</div>
                  <div className="text-[10px] text-phumulani-charcoal">100% SLA compliant</div>
                </div>
              </div>

              {/* Authorized Permissions Strip */}
              <div className="p-4 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                <div className="text-xs font-bold text-phumulani-charcoal mb-2 uppercase tracking-wider">
                  Assigned Capability & Permission Domains
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept.authorizedPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-2.5 py-1 bg-white border border-phumulani-cream rounded-md text-[11px] font-mono text-phumulani-charcoal font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Department Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-phumulani-cream text-xs">
                <span className="text-phumulani-charcoal">Department configuration maintained under Phase 24 standards.</span>
                <button
                  onClick={() => onNavigateTab('task_management')}
                  className="px-3.5 py-1.5 bg-phumulani-charcoal text-white rounded-lg font-semibold hover:bg-phumulani-earth transition-colors"
                >
                  View Department Tasks
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-xl border border-phumulani-cream text-center text-phumulani-charcoal text-xs">
              Select a department to view detailed workload and leadership information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
