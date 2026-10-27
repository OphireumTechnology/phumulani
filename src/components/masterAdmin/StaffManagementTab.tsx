/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Enterprise Staff Management (M24.03)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { EnterpriseStaffMember, StaffLifecycleStatus, StaffAccessLevel } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Building2,
  Phone,
  Mail,
  Edit,
  UserX,
  UserCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface StaffManagementTabProps {
  currentUser: User;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ currentUser }) => {
  const [staffList, setStaffList] = useState<EnterpriseStaffMember[]>(masterAdminService.getStaffMembers());
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteJobTitle, setInviteJobTitle] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteDept, setInviteDept] = useState('DEPT-COMM-PROG');
  const [inviteAccessLevel, setInviteAccessLevel] = useState<StaffAccessLevel>('STANDARD');

  const departments = masterAdminService.getDepartments();

  const reloadStaff = () => {
    setStaffList(masterAdminService.getStaffMembers());
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === inviteDept);
    const res = masterAdminService.createStaffMember(
      {
        name: inviteName,
        email: inviteEmail,
        jobTitle: inviteJobTitle,
        organizationalRole: inviteRole,
        departmentId: inviteDept,
        departmentName: dept?.name || 'General Operations',
        accessLevel: inviteAccessLevel,
        status: 'INVITED',
        assignedResponsibilities: ['General operational support'],
        mfaEnforced: true,
      },
      currentUser.role
    );

    if (res.success) {
      setActionNotice({ type: 'success', message: `Staff invitation successfully sent to ${inviteName} (${inviteEmail}).` });
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteJobTitle('');
      reloadStaff();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to invite staff.' });
    }
  };

  const handleUpdateStatus = (staffId: string, status: StaffLifecycleStatus) => {
    const res = masterAdminService.updateStaffLifecycle(staffId, status, currentUser.role, `Updated status to ${status}`);
    if (res.success) {
      setActionNotice({ type: 'success', message: `Staff lifecycle status updated to ${status}.` });
      reloadStaff();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to update status.' });
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-800" />
            <h2 className="text-lg font-bold text-slate-900">Enterprise Staff Management & Directory</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative directory, 10-stage staff lifecycle, role delegation, and access governance
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Enterprise Staff</span>
        </button>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff by name, title, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INVITED">Invited</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Access Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">MFA & Review</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{staff.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({staff.staffId})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{staff.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{staff.jobTitle}</div>
                    <div className="text-[11px] text-slate-500">{staff.departmentName}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        staff.accessLevel === 'SUPER_ADMIN'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : staff.accessLevel === 'RESTRICTED_SAFEGUARDING'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : staff.accessLevel === 'EXECUTIVE'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : staff.accessLevel === 'ELEVATED'
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {staff.accessLevel}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        staff.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : staff.status === 'INVITED'
                          ? 'bg-blue-100 text-blue-800'
                          : staff.status === 'SUSPENDED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    <div>MFA: {staff.mfaEnforced ? 'Enforced (FIDO2/TOTP)' : 'Pending'}</div>
                    <div className="text-[10px] text-slate-400">Reviewed: {staff.lastAccessReviewAt.split('T')[0]}</div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {staff.status === 'ACTIVE' && staff.staffId !== 'STF-001' && (
                        <button
                          onClick={() => handleUpdateStatus(staff.id, 'SUSPENDED')}
                          className="p-1.5 text-amber-700 hover:bg-amber-50 rounded"
                          title="Suspend account access"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      {(staff.status === 'SUSPENDED' || staff.status === 'INVITED') && (
                        <button
                          onClick={() => handleUpdateStatus(staff.id, 'ACTIVE')}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Activate staff account"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-800" />
                Invite Enterprise Staff Member
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zainab Al-Mansoor"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Email (@phumulani.org)</label>
                <input
                  type="email"
                  required
                  placeholder="zainab.m@phumulani.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workforce Development Specialist"
                  value={inviteJobTitle}
                  onChange={(e) => setInviteJobTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Access Level</label>
                  <select
                    value={inviteAccessLevel}
                    onChange={(e) => setInviteAccessLevel(e.target.value as StaffAccessLevel)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="ELEVATED">ELEVATED</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
