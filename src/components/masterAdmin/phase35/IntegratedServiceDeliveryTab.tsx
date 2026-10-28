/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 35 Integrated Service Delivery & Automation Tab
 */

import React, { useState } from 'react';
import {
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Building,
  Heart,
  Bot,
  BarChart3,
  BookOpen,
  Layers,
  RefreshCw,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react';
import { phase35Service } from '../../../services/phase35Service';
import {
  IntegratedServiceRequest,
  IntegratedServiceRequestStatus,
  ServiceResolutionCode,
  ResourceReferralRecord,
  ProgramEnrollmentApplication,
  VolunteerServiceLifecycleRecord,
  DonorStewardshipRecord,
  GrantLifecycleRecord,
  CrossDepartmentWorkflowInstance,
  AiWorkforceExecutionRecord,
} from '../../../types/phase35';

export const IntegratedServiceDeliveryTab: React.FC = () => {
  const [subTab, setSubTab] = useState<
    | 'service_queue'
    | 'referrals'
    | 'enrollments'
    | 'volunteers'
    | 'donors'
    | 'grants'
    | 'workflows'
    | 'ai_workforce'
    | 'executive_accountability'
  >('service_queue');

  // Service Requests state
  const [serviceRequests, setServiceRequests] = useState<IntegratedServiceRequest[]>(
    phase35Service.getAllServiceRequests()
  );
  const [selectedReq, setSelectedReq] = useState<IntegratedServiceRequest | null>(
    serviceRequests[0] || null
  );
  const [newStatus, setNewStatus] = useState<IntegratedServiceRequestStatus>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [assignDept, setAssignDept] = useState('DEPT-WORKFORCE');
  const [assignStaff, setAssignStaff] = useState('Amina Yusuf');
  const [internalNote, setInternalNote] = useState('');
  const [resCode, setResCode] = useState<ServiceResolutionCode>('RESOLVED_FULFILLED');
  const [resSummary, setResSummary] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Workflow state
  const [workflows, setWorkflows] = useState<CrossDepartmentWorkflowInstance[]>(
    phase35Service.getWorkflows()
  );

  // Referrals
  const [referrals, setReferrals] = useState<ResourceReferralRecord[]>(
    phase35Service.getMemberReferrals('usr-mem-01')
  );

  // Enrollments
  const [enrollments, setEnrollments] = useState<ProgramEnrollmentApplication[]>(
    phase35Service.getMemberEnrollments('usr-mem-01')
  );

  // Volunteers
  const [volunteers, setVolunteers] = useState<VolunteerServiceLifecycleRecord[]>([
    phase35Service.getVolunteerLifecycle('vol-usr-01')!,
  ].filter(Boolean));

  // Donors
  const [donors, setDonors] = useState<DonorStewardshipRecord[]>(
    phase35Service.getDonorStewardships()
  );

  // Grants
  const [grants, setGrants] = useState<GrantLifecycleRecord[]>(
    phase35Service.getGrantLifecycles()
  );

  // AI Executions
  const [aiExecutions, setAiExecutions] = useState<AiWorkforceExecutionRecord[]>(
    phase35Service.getAiExecutions()
  );

  // Executive summary
  const [execSummary, setExecSummary] = useState(
    phase35Service.getExecutivePerformanceSummary()
  );

  const refreshAll = () => {
    setServiceRequests(phase35Service.getAllServiceRequests());
    setWorkflows(phase35Service.getWorkflows());
    setReferrals(phase35Service.getMemberReferrals('usr-mem-01'));
    setEnrollments(phase35Service.getMemberEnrollments('usr-mem-01'));
    setDonors(phase35Service.getDonorStewardships());
    setGrants(phase35Service.getGrantLifecycles());
    setAiExecutions(phase35Service.getAiExecutions());
    setExecSummary(phase35Service.getExecutivePerformanceSummary());
    if (selectedReq) {
      setSelectedReq(phase35Service.getServiceRequestById(selectedReq.id) || null);
    }
  };

  const handleStatusChange = () => {
    if (!selectedReq) return;
    try {
      const updated = phase35Service.transitionServiceRequestStatus(
        selectedReq.id,
        newStatus,
        'Staff Supervisor',
        'staff',
        statusNote || `Status updated to ${newStatus}`
      );
      setSelectedReq(updated);
      setStatusNote('');
      refreshAll();
      setActionFeedback(`Request ${selectedReq.trackingReference} transitioned to ${newStatus}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssign = () => {
    if (!selectedReq) return;
    try {
      const updated = phase35Service.assignServiceRequest(
        selectedReq.id,
        assignDept,
        'usr-staff-assigned',
        assignStaff,
        'department_manager'
      );
      setSelectedReq(updated);
      refreshAll();
      setActionFeedback(`Request assigned to ${assignStaff} (${assignDept})`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddNote = () => {
    if (!selectedReq || !internalNote.trim()) return;
    try {
      phase35Service.addRoleBasedStaffNote(
        selectedReq.id,
        'Staff Member',
        'staff',
        'staff',
        internalNote
      );
      setInternalNote('');
      refreshAll();
      setActionFeedback('Role-based staff note appended successfully');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolve = () => {
    if (!selectedReq || !resSummary.trim()) return;
    try {
      const updated = phase35Service.resolveServiceRequest(
        selectedReq.id,
        resCode,
        resSummary,
        'Amina Yusuf',
        'community_advocate'
      );
      setSelectedReq(updated);
      setResSummary('');
      refreshAll();
      setActionFeedback(`Request marked RESOLVED with code ${resCode}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdvanceWorkflow = (wfId: string) => {
    try {
      phase35Service.advanceWorkflowStep(wfId, 'Staff Coordinator', 'staff');
      refreshAll();
      setActionFeedback('Workflow step advanced successfully');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVerifyVolunteerClearance = (volId: string) => {
    try {
      phase35Service.verifyVolunteerClearance(volId, 'David Mwangi', 'Volunteer Coordinator');
      refreshAll();
      setActionFeedback('Volunteer clearance verified by human supervisor');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveThankYou = (stewId: string) => {
    try {
      phase35Service.approveThankYouLetter(stewId, 'Comfort Dondo', 'executive_director');
      refreshAll();
      setActionFeedback('Stewardship thank-you letter approved');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveAiTask = (execId: string) => {
    try {
      phase35Service.approveAiTaskOutput(execId, 'Comfort Dondo', 'executive_director');
      refreshAll();
      setActionFeedback('AI task recommendation verified and co-signed');
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold tracking-wide border border-teal-500/30">
                PHASE 35 MASTER DIRECTIVE
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/30">
                M35.01 – M35.15
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Intelligent Community Service Delivery & Automation
            </h2>
            <p className="text-teal-200/80 text-sm mt-1 max-w-3xl">
              Unified cross-module coordination connecting Member Service Journeys, Resource Referrals, Program Enrollments, Volunteer Lifecycles, Donor Stewardship, Grants, Workflows, 36 AI Agents, and Executive Accountability.
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700/60 hover:bg-teal-600 text-white text-sm font-medium rounded-xl border border-teal-500/40 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Operational Data
          </button>
        </div>

        {actionFeedback && (
          <div className="mt-4 p-3 bg-teal-500/20 border border-teal-400/40 rounded-xl text-teal-100 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-300" />
            {actionFeedback}
          </div>
        )}

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-teal-800/60 scrollbar-none">
          {[
            { id: 'service_queue', label: 'Service Queue (M35.01-02)', icon: LifeBuoy },
            { id: 'referrals', label: 'Resource Referrals (M35.03)', icon: Compass },
            { id: 'enrollments', label: 'Program Enrollments (M35.04)', icon: BookOpen },
            { id: 'volunteers', label: 'Volunteer Journey (M35.05)', icon: Users },
            { id: 'donors', label: 'Donor Stewardship (M35.06)', icon: Heart },
            { id: 'grants', label: 'Grant Lifecycle (M35.07)', icon: Building },
            { id: 'workflows', label: 'Workflows (M35.08)', icon: Layers },
            { id: 'ai_workforce', label: 'AI Execution (M35.09)', icon: Bot },
            { id: 'executive_accountability', label: 'Executive Accountability (M35.12)', icon: BarChart3 },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-teal-950/40 text-teal-200/70 hover:bg-teal-900/40 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SERVICE QUEUE & FOLLOW-UP (M35.01 & M35.02) */}
      {subTab === 'service_queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Queue List */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-teal-600" />
                Unified Service Delivery Queue
              </h3>
              <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 font-semibold rounded-full border border-teal-100">
                {serviceRequests.length} Requests
              </span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {serviceRequests.map((r) => {
                const isSelected = selectedReq?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReq(r)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-800">{r.trackingReference}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          r.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'ASSIGNED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 text-sm line-clamp-1">{r.memberName}</div>
                    <div className="text-xs text-slate-500 line-clamp-2 mt-1">{r.intakeSummary}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{r.serviceCategory.replace('_', ' ')}</span>
                      <span>SLA: {r.priority}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Request Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {selectedReq ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800 text-sm">{selectedReq.trackingReference}</span>
                      <span className="text-xs text-slate-400">({selectedReq.id})</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                        {selectedReq.serviceCategory}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedReq.memberName}</h3>
                    <p className="text-xs text-slate-500">{selectedReq.memberEmail} • {selectedReq.memberPhone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full">
                      Status: {selectedReq.status}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">SLA Due: {new Date(selectedReq.slaDeadline).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Intake Summary */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Intake Summary</span>
                  <p className="text-sm text-slate-800">{selectedReq.intakeSummary}</p>
                </div>

                {/* Staff Assignment & State Transition Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transition Form */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Transition Lifecycle Status
                    </span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING_FOR_MEMBER">WAITING_FOR_MEMBER</option>
                      <option value="WAITING_FOR_PARTNER">WAITING_FOR_PARTNER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Public note for member timeline..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={handleStatusChange}
                      className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Update Lifecycle Status
                    </button>
                  </div>

                  {/* Staff Assignment */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Department & Staff Assignment
                    </span>
                    <select
                      value={assignDept}
                      onChange={(e) => setAssignDept(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="DEPT-PROG">Community Programs (DEPT-PROG)</option>
                      <option value="DEPT-WORKFORCE">Workforce Pathways (DEPT-WORKFORCE)</option>
                      <option value="DEPT-HOUSING">Housing Stability (DEPT-HOUSING)</option>
                      <option value="DEPT-LEGAL">Legal Advocacy (DEPT-LEGAL)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Assignee Name..."
                      value={assignStaff}
                      onChange={(e) => setAssignStaff(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={handleAssign}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Assign Staff Member
                    </button>
                  </div>
                </div>

                {/* Resolution Confirmation Box */}
                {selectedReq.status !== 'RESOLVED' && selectedReq.status !== 'CLOSED' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                      Final Service Resolution
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={resCode}
                        onChange={(e) => setResCode(e.target.value as any)}
                        className="text-xs p-2 bg-white border border-emerald-300 rounded-lg"
                      >
                        <option value="RESOLVED_FULFILLED">RESOLVED_FULFILLED (Service Provided)</option>
                        <option value="RESOLVED_REFERRED">RESOLVED_REFERRED (Connected to Partner)</option>
                        <option value="RESOLVED_INELIGIBLE">RESOLVED_INELIGIBLE</option>
                        <option value="CANCELLED_BY_MEMBER">CANCELLED_BY_MEMBER</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Resolution summary notes..."
                        value={resSummary}
                        onChange={(e) => setResSummary(e.target.value)}
                        className="text-xs p-2 bg-white border border-emerald-300 rounded-lg"
                      />
                    </div>
                    <button
                      onClick={handleResolve}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Verify & Close Request
                    </button>
                  </div>
                )}

                {/* Member Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Auditable Member-Visible Timeline ({selectedReq.timeline.length} Events)
                  </h4>
                  <div className="space-y-2 border-l-2 border-teal-200 pl-4 ml-2">
                    {selectedReq.timeline.map((t) => (
                      <div key={t.id} className="text-xs relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white" />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{t.actorName}</span>
                          <span className="text-slate-400">({t.actorRole})</span>
                          <span className="text-[11px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{t.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role-Based Internal Staff Notes */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    Confidential Staff Collaboration Notes ({selectedReq.staffNotes.length})
                  </h4>
                  <div className="space-y-2 mb-3">
                    {selectedReq.staffNotes.map((n) => (
                      <div key={n.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                        <div className="flex items-center justify-between font-semibold text-amber-900 mb-1">
                          <span>{n.authorName} ({n.authorRole})</span>
                          <span className="text-[10px] text-amber-700">Min Role: {n.minRoleToView}</span>
                        </div>
                        <p className="text-amber-800">{n.noteText}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add confidential internal staff note..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                Select a service request from the queue to review details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. RESOURCE REFERRALS (M35.03) */}
      {subTab === 'referrals' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                Community Resource Referral Management (M35.03)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Approved referrals linked to verified Directory organizations with public contact information. Confidential shelter locations strictly safeguarded.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {referrals.length} Active Referrals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Referral ID</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Verified Resource & Partner</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Public Contact</th>
                  <th className="p-3">Staff Approver</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Follow-Up Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-slate-800">{ref.id}</td>
                    <td className="p-3 font-medium text-slate-900">{ref.memberName}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{ref.resourceTitle}</div>
                      <div className="text-[11px] text-slate-500">{ref.organizationName}</div>
                    </td>
                    <td className="p-3 text-slate-600">{ref.resourceCategory}</td>
                    <td className="p-3 text-[11px] text-slate-500">
                      <div>{ref.publicContactInfo.phone}</div>
                      <div>{ref.publicContactInfo.email}</div>
                    </td>
                    <td className="p-3 text-slate-700">{ref.staffApproverName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[11px]">
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(ref.followUpDueAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PROGRAM ENROLLMENTS (M35.04) */}
      {subTab === 'enrollments' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                Program Enrollment & Participation Journey (M35.04)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Auditable application review, capacity validation, milestone completions, and verified outcomes.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {enrollments.length} Active Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enr) => (
              <div key={enr.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-teal-800">{enr.id}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold text-xs rounded">
                    {enr.status}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{enr.programTitle}</div>
                <div className="text-xs text-slate-600">Member: {enr.memberName} ({enr.memberEmail})</div>
                <div className="text-xs text-slate-500">
                  Reviewed by: {enr.reviewedByStaffName || 'Pending'} ({enr.reviewedByStaffRole || 'Staff'})
                </div>

                {/* Progress */}
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>Attendance: {enr.sessionsAttended} / {enr.totalSessions} sessions</span>
                    <span>{Math.round((enr.sessionsAttended / enr.totalSessions) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${Math.round((enr.sessionsAttended / enr.totalSessions) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {enr.milestonesCompleted.length > 0 && (
                  <div className="pt-2 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">Completed Milestones:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {enr.milestonesCompleted.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. VOLUNTEER LIFECYCLE (M35.05) */}
      {subTab === 'volunteers' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Volunteer Onboarding-to-Service Lifecycle (M35.05)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Continuous onboarding from registration, required TRN-SAFE-01 training, human clearance certification, to verified service hours.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {volunteers.length} Active Volunteers
            </span>
          </div>

          <div className="space-y-4">
            {volunteers.map((vol) => (
              <div key={vol.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-teal-800">{vol.id}</span>
                    <h4 className="font-bold text-slate-900 text-base mt-0.5">{vol.name}</h4>
                    <p className="text-xs text-slate-500">{vol.email} • Languages: {vol.languages.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs">
                      {vol.onboardingStatus}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Verified Service: <strong>{vol.verifiedServiceHours} hrs</strong> ({vol.verifiedAttendanceSessions} shifts)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Training Status:</span>
                    <span className="font-semibold text-slate-800">
                      {vol.trainingCompletedAt ? 'TRN-SAFE-01 Completed' : 'Pending Training'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Supervisor Clearance:</span>
                    <span className="font-semibold text-slate-800">
                      {vol.clearanceVerifiedByHumanSupervisor || 'Pending Human Review'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Availability:</span>
                    <span className="font-semibold text-slate-800">{vol.availabilityDays.join(', ')}</span>
                  </div>
                </div>

                {!vol.clearanceVerifiedByHumanSupervisor && (
                  <button
                    onClick={() => handleVerifyVolunteerClearance(vol.id)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Authorize Human Clearance Gate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DONOR STEWARDSHIP (M35.06) */}
      {subTab === 'donors' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-600" />
                Donor Stewardship & Campaign Engagement (M35.06)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Strict segregation between Pledged ($) vs Settled ($) revenue. Human approval required for thank-you acknowledgment letters.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {donors.length} Stewardship Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donors.map((d) => (
              <div key={d.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-teal-800">{d.id}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                    {d.givingTier}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{d.donorName}</h4>
                <p className="text-xs text-slate-500">{d.donorEmail} • Campaign: {d.campaignTitle}</p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Pledge Commitment:</span>
                    <span className="font-bold text-amber-700 text-sm">
                      ${d.pledgedAmount.toLocaleString()} ({d.pledgeStatus})
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Settled Revenue:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      ${d.totalSettledAmount.toLocaleString()} ({d.settledContributionsCount} gifts)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-600">
                    Thank-You Approved:{' '}
                    <strong>{d.thankYouLetterApproved ? `Yes (${d.thankYouLetterApprovedBy})` : 'Pending Review'}</strong>
                  </span>
                  {!d.thankYouLetterApproved && (
                    <button
                      onClick={() => handleApproveThankYou(d.id)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold"
                    >
                      Approve Thank-You
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. GRANT LIFECYCLE (M35.07) */}
      {subTab === 'grants' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                Grant Application Lifecycle Integration (M35.07)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Full 15-stage grant pipeline with verified submission evidence hashes and post-award milestone tracking.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {grants.length} Tracked Grants
            </span>
          </div>

          <div className="space-y-4">
            {grants.map((g) => (
              <div key={g.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-teal-800">{g.id}</span>
                    <h4 className="font-bold text-slate-900 text-base mt-0.5">{g.opportunityTitle}</h4>
                    <p className="text-xs text-slate-500">Funder: {g.funderName} • Lead: {g.leadStaffAssignee}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-semibold text-xs rounded">
                      Stage: {g.currentStage}
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-1">${g.requestedAmount.toLocaleString()} requested</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Go/No-Go Decision:</span>
                    <span className="font-semibold text-slate-800">{g.goNoGoDecision} ({g.goNoGoApprovedBy})</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Submission Evidence:</span>
                    <span className="font-mono text-[10px] text-slate-700 truncate block">
                      {g.submissionEvidenceHash || 'Pending Submission'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Award Status:</span>
                    <span className="font-bold text-emerald-700">
                      {g.awardStatus} (${g.verifiedAwardAmount.toLocaleString()})
                    </span>
                  </div>
                </div>

                {g.postAwardMilestones.length > 0 && (
                  <div className="pt-2 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1">Post-Award Compliance Milestones:</span>
                    <div className="space-y-1">
                      {g.postAwardMilestones.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                          <span className="text-slate-800">{m.milestone}</span>
                          <span className="text-slate-400">Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CROSS-DEPARTMENT WORKFLOWS (M35.08) */}
      {subTab === 'workflows' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Cross-Department Workflow Orchestration (M35.08)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                8-stage cross-department journey powered by the Phase 33 state machine engine with strict idempotency and audit trails.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              {workflows.length} Workflows
            </span>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-teal-800">{wf.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{wf.name}</h4>
                  </div>
                  <button
                    onClick={() => handleAdvanceWorkflow(wf.id)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold transition"
                  >
                    Advance Step
                  </button>
                </div>

                {/* Steps progress */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                  {wf.steps.map((s, idx) => (
                    <div
                      key={s.stepIndex}
                      className={`p-2 rounded-lg border text-center ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : s.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono">Step {idx + 1}</div>
                      <div className="font-medium text-[11px] truncate mt-0.5">{s.stepName}</div>
                      <div className="text-[9px] mt-1">{s.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. AI WORKFORCE VERIFICATION (M35.09) */}
      {subTab === 'ai_workforce' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bot className="w-5 h-5 text-teal-600" />
                AI Workforce Execution & Evidence Verification (M35.09)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Truthful execution state tracking across 36 agents. Distinguishes live Gemini execution from deterministic offline fallback.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
              36 Agents Registered
            </span>
          </div>

          <div className="space-y-3">
            {aiExecutions.map((exec) => (
              <div key={exec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-800">{exec.agentId}</span>
                    <span className="font-bold text-slate-900">{exec.agentName}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">{exec.division}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded font-semibold text-xs ${
                      exec.executionStatus === 'COMPLETED_VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exec.executionStatus === 'COMPLETED_REVIEW_REQUIRED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {exec.executionStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{exec.outputResult}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                  <span>Provider: {exec.providerAvailability}</span>
                  <span>Sources: {exec.evidenceSources.join(', ')}</span>
                  {exec.requiresHumanApproval && exec.executionStatus === 'COMPLETED_REVIEW_REQUIRED' && (
                    <button
                      onClick={() => handleApproveAiTask(exec.id)}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded font-medium"
                    >
                      Co-Sign & Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. EXECUTIVE ACCOUNTABILITY (M35.12) */}
      {subTab === 'executive_accountability' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Executive Operational Performance & Accountability (M35.12)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Live verified metrics tagged with confidence ratings (ACTUAL_VERIFIED / ESTIMATED). Fabricated telemetry is strictly prohibited.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              100% Audit Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Service Requests */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Service Requests</span>
              <div className="text-2xl font-bold text-slate-900">{execSummary.serviceRequests.volume}</div>
              <p className="text-xs text-slate-600">SLA Performance: {execSummary.serviceRequests.slaPerformancePercent}%</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.serviceRequests.confidence}
              </span>
            </div>

            {/* Program Enrollment */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Program Enrollment</span>
              <div className="text-2xl font-bold text-slate-900">{execSummary.programEnrollment.totalEnrolled}</div>
              <p className="text-xs text-slate-600">Completion Rate: {execSummary.programEnrollment.completionRatePercent}%</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.programEnrollment.confidence}
              </span>
            </div>

            {/* Volunteer Hours */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Verified Volunteer Hours</span>
              <div className="text-2xl font-bold text-slate-900">{execSummary.volunteerEngagement.verifiedHours} hrs</div>
              <p className="text-xs text-slate-600">Active Volunteers: {execSummary.volunteerEngagement.activeVolunteers}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.volunteerEngagement.confidence}
              </span>
            </div>

            {/* Resource Referrals */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Resource Referrals</span>
              <div className="text-2xl font-bold text-slate-900">{execSummary.resourceReferrals.totalReferrals}</div>
              <p className="text-xs text-slate-600">Outcome Rate: {execSummary.resourceReferrals.verifiedOutcomePercent}%</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.resourceReferrals.confidence}
              </span>
            </div>

            {/* Fundraising Settled vs Pledged */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Settled Revenue</span>
              <div className="text-2xl font-bold text-emerald-700">${execSummary.fundraising.settledRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-600">Pledged (Segregated): ${execSummary.fundraising.pledgedAmount.toLocaleString()}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.fundraising.confidence}
              </span>
            </div>

            {/* AI Workforce */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">AI Workforce Readiness</span>
              <div className="text-2xl font-bold text-slate-900">{execSummary.aiWorkforce.readinessRatio}</div>
              <p className="text-xs text-slate-600">Pending Approvals: {execSummary.aiWorkforce.pendingApprovalsCount}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                {execSummary.aiWorkforce.confidence}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
