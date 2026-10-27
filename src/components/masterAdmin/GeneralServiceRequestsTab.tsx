/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 General Service Requests
 * M25.04: General Community Service Triage & VAWA Section 1367 Safeguarding Firewall
 */

import React, { useState, useEffect } from 'react';
import {
  GeneralServiceRequest,
  ServiceCategory,
  ServiceRequestStatus,
  ServicePriority,
} from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  UserCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  FolderLock,
  Send,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const GeneralServiceRequestsTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const [requests, setRequests] = useState<GeneralServiceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Intake Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ServiceCategory>('FOOD_PANTRY_HAMPER');
  const [source, setSource] = useState<'COMMUNITY_CENTER' | 'PHONE_LINE' | 'WALK_IN' | 'PARTNER_DESK'>('WALK_IN');
  const [intakeSummary, setIntakeSummary] = useState('');
  const [priority, setPriority] = useState<ServicePriority>('ROUTINE');
  const [followUp, setFollowUp] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setRequests(commService.getServiceRequests());
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeSummary.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Intake summary cannot be empty.' });
      return;
    }

    const res = commService.createServiceRequest(
      {
        serviceCategory: category,
        requestSource: source,
        intakeSummary: intakeSummary.trim(),
        responsibleDepartmentId: 'DEPT-PROG',
        priority,
        followUpRequirement: followUp.trim() || 'Coordinate general community delivery with department lead.',
      },
      currentUserName,
      currentUserRole
    );

    if (res.isSafeguardingCrisis) {
      setFeedbackNotice({
        type: 'warning',
        message: 'CRITICAL SAFEGUARDING HALT: Domestic violence/crisis indicators detected. Record was quarantined into DEPT-SAFE and cleartext was redacted under VAWA Section 1367 protocols.',
      });
      setIsModalOpen(false);
      setIntakeSummary('');
      setFollowUp('');
      refreshData();
    } else if (res.success && res.request) {
      setFeedbackNotice({
        type: 'success',
        message: `General service request ${res.request.id} logged cleanly.`,
      });
      setIsModalOpen(false);
      setIntakeSummary('');
      setFollowUp('');
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to record service request.' });
    }
  };

  const handleStatusUpdate = (id: string, newStatus: ServiceRequestStatus) => {
    const res = commService.updateServiceRequestStatus(id, newStatus, currentUserName, currentUserRole);
    if (res.success) {
      setFeedbackNotice({ type: 'success', message: `Request status updated to ${newStatus}.` });
      refreshData();
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const matchesSearch =
      r.intakeSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.assignedStaffName && r.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const quarantinedCount = requests.filter((r) => r.isSafeguardingCrisisQuarantine).length;

  return (
    <div className="space-y-6">
      {/* SAFEGUARDING BOUNDARY BANNER */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-amber-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-200/80 rounded-xl shrink-0 mt-0.5">
            <FolderLock className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">VAWA Section 1367 Zero-Disclosure Safeguarding Boundary</h3>
              <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-400/60 uppercase">
                STRICT QUARANTINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 max-w-2xl leading-relaxed">
              This module is strictly for <strong>approved general community services</strong> (food pantry hampers, youth robotics tutoring, ESL document assistance). Survivor domestic violence case files, safe house shelter addresses, and protection orders are <strong>firewalled into DEPT-SAFE</strong> and quarantined from general CRM or AI contexts.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl font-bold font-mono text-amber-900">{quarantinedCount}</div>
          <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Quarantined Intakes</div>
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
            M25.04 · COMMUNITY SERVICE TRIAGE
          </span>
          <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">General Community Service Requests</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Coordinate non-confidential community pantry requests, student tutoring signups, and public transit navigation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Intake</span>
        </button>
      </div>

      {/* FEEDBACK NOTICE */}
      {feedbackNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : feedbackNotice.type === 'warning'
              ? 'bg-amber-100 text-amber-950 border border-amber-300'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-slate-400 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search service category, summary, assigned staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECEIVED">Received</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold / Quarantined</option>
          </select>

          <button
            onClick={refreshData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SERVICE REQUEST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Intake Summary & Non-Confidential Scope</th>
                <th className="py-3 px-4">Assigned Personnel</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((req) => {
                const isQuarantined = req.isSafeguardingCrisisQuarantine;
                return (
                  <tr
                    key={req.id}
                    className={`transition-colors ${
                      isQuarantined ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">{req.id}</span>
                      <div className="text-[10px] text-slate-400">{new Date(req.requestDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                        {req.serviceCategory.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-600 font-medium">{req.requestSource}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {isQuarantined ? (
                        <div className="p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                          <span>{req.intakeSummary}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-2">{req.intakeSummary}</p>
                          <div className="text-[10px] text-slate-400 mt-0.5">Follow-up: {req.followUpRequirement}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isQuarantined ? (
                        <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          Sister Miriam K. (DEPT-SAFE)
                        </span>
                      ) : (
                        <span className="font-medium text-slate-800">
                          {req.assignedStaffName || 'Unassigned / General Triage'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          disabled={isQuarantined}
                          value={req.status}
                          onChange={(e) => handleStatusUpdate(req.id, e.target.value as ServiceRequestStatus)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer ${
                            isQuarantined ? 'opacity-60 cursor-not-allowed text-amber-900 bg-amber-100' : ''
                          }`}
                        >
                          <option value="RECEIVED">Received</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="ON_HOLD">On Hold</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SERVICE INTAKE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Community Service Triage</span>
                <h3 className="text-base font-bold text-slate-900">Log Community Service Request</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="FOOD_PANTRY_HAMPER">Food Pantry Hamper</option>
                    <option value="YOUTH_TUTORING_ENROLLMENT">Youth Tutoring Enrollment</option>
                    <option value="COMPUTER_LAB_ACCESS">Computer Lab Access</option>
                    <option value="JOB_CLINIC_COACHING">Job Clinic Coaching</option>
                    <option value="NON_CONFIDENTIAL_TRANSLATION">Public School/Transit Translation</option>
                    <option value="CLOTHING_CLOSET">Community Clothing Closet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Intake Source *</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="WALK_IN">Walk-In Welcome Center</option>
                    <option value="COMMUNITY_CENTER">Community Center Partner Desk</option>
                    <option value="PHONE_LINE">General Community Phone Line</option>
                    <option value="PARTNER_DESK">Civic Agency Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Intake Description & Non-Confidential Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record routine community service needs (e.g. household food pantry pickup, tutoring grade level)..."
                  value={intakeSummary}
                  onChange={(e) => setIntakeSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Follow-up Action</label>
                <input
                  type="text"
                  placeholder="e.g. Prepare cultural dry hamper for Thursday collection"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Crisis Interceptor:</strong> If an intake contains domestic abuse, protective order, or trauma crisis indicators, general logging will halt immediately and quarantine the file to the Restricted Safeguarding Lead Sister Miriam K.
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
                  Record Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
