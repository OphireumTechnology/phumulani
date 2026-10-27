/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Volunteer Deployment & Scheduling
 * M25.06: Shift Scheduling, Background Check Verification & Supervisor Hour Certification
 */

import React, { useState, useEffect } from 'react';
import { VolunteerDeployment, DeploymentStatus } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import { MasterAdminService } from '../../services/masterAdminService';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Award,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const VolunteerDeploymentTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const masterAdmin = MasterAdminService.getInstance();

  const [deployments, setDeployments] = useState<VolunteerDeployment[]>([]);
  const [volunteersList, setVolunteersList] = useState(masterAdmin.getVolunteers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('VOL-001');
  const [selectedProgramId, setSelectedProgramId] = useState('PROG-003');
  const [activityTitle, setActivityTitle] = useState('Thursday Cultural Food Hamper Distribution');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftHours, setShiftHours] = useState(4);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setDeployments(commService.getDeployments());
    setVolunteersList(masterAdmin.getVolunteers());
  };

  const handleScheduleVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    const res = commService.scheduleVolunteer(
      selectedVolunteerId,
      selectedProgramId,
      activityTitle.trim(),
      shiftDate,
      Number(shiftHours),
      'STF-006',
      'Sister Miriam K.',
      currentUserRole,
      currentUserName
    );

    if (res.success && res.deployment) {
      setFeedbackNotice({
        type: 'success',
        message: `Scheduled ${res.deployment.volunteerName} for ${res.deployment.shiftHours} hrs (${res.deployment.activityTitle}).`,
      });
      setIsModalOpen(false);
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to schedule volunteer.' });
    }
  };

  const handleVerifyHours = (deploymentId: string, hours: number) => {
    const res = commService.verifyVolunteerHours(
      deploymentId,
      hours,
      currentUserRole,
      currentUserName,
      'Supervised shift verified by community operations lead.'
    );

    if (res.success) {
      setFeedbackNotice({
        type: 'success',
        message: `Verified and certified ${hours} volunteer service hours. Updated in organizational master registry.`,
      });
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Verification failed.' });
    }
  };

  const filtered = deployments.filter(
    (d) =>
      d.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.activityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.programName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVerifiedHours = deployments
    .filter((d) => d.supervisorSignOff)
    .reduce((sum, d) => sum + d.verifiedHours, 0);

  return (
    <div className="space-y-6">
      {/* METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled Shifts</span>
            <Calendar className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">{deployments.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Community programs coverage</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Hours Total</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700">{totalVerifiedHours} hrs</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Supervisor certified service</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Screening Policy</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-800">100% Cleared Only</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mandatory BCA background checks</div>
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
            M25.06 · VOLUNTEER WORKFORCE DEPLOYMENT
          </span>
          <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">Volunteer Deployment & Scheduling</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Deploy background-screened volunteers into community pantry logistics, youth tutoring labs, and language interpretation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Volunteer Shift</span>
        </button>
      </div>

      {/* FEEDBACK NOTICE */}
      {feedbackNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-slate-400 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteer name, activity, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>
        <button onClick={refreshData} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* DEPLOYMENT ROSTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Deployment Ref</th>
                <th className="py-3 px-4">Volunteer</th>
                <th className="py-3 px-4">Program & Activity</th>
                <th className="py-3 px-4">Shift Date & Hours</th>
                <th className="py-3 px-4">Supervisor</th>
                <th className="py-3 px-4">Hours Certification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900">{dep.id}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900">{dep.volunteerName}</span>
                    <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Cleared BCA & Trained
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{dep.activityTitle}</div>
                    <div className="text-[10px] text-teal-800">{dep.programName}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-slate-700">{dep.shiftDate}</span>
                    <div className="text-[10px] text-slate-500 font-semibold">{dep.shiftHours} hrs scheduled</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{dep.supervisorStaffName}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {dep.supervisorSignOff ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{dep.verifiedHours} hrs Verified</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyHours(dep.id, dep.shiftHours)}
                        className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Sign Off ({dep.shiftHours} hrs)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE VOLUNTEER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Volunteer Scheduling</span>
                <h3 className="text-base font-bold text-slate-900">Schedule Vetted Volunteer</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleVolunteer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Volunteer *</label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  {volunteersList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.fullName} ({v.screeningStatus}) · {v.skills[0] || 'Community Volunteer'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program *</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="PROG-003">PROG-003: Cultural Nutrition Pantry</option>
                  <option value="PROG-002">PROG-002: Youth STEM Mentorship Circle</option>
                  <option value="PROG-001">PROG-001: Immigrant Women Career Pathways</option>
                  <option value="PROG-005">PROG-005: Language Access Clinic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hours *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={shiftHours}
                    onChange={(e) => setShiftHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Screening Enforcement:</strong> The system automatically verifies that the volunteer has a verified <strong>CLEARED</strong> background check and completed safeguarding training before creating the shift assignment.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Schedule Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
