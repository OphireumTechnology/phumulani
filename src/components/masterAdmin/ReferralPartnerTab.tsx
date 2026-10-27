/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Referral & Service Partner Coordination
 * M25.05: Verified Partner Referrals, Eligibility Criteria & Gated External Dispatch
 */

import React, { useState, useEffect } from 'react';
import { CommunityReferral, ReferralStatus } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Clock,
  ArrowUpRight,
  Shield,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const ReferralPartnerTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const [referrals, setReferrals] = useState<CommunityReferral[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('Hennepin Healthcare Community Clinic');
  const [serviceType, setServiceType] = useState('Community Wellness & Routine Dental Care');
  const [eligibility, setEligibility] = useState('Resident of Hennepin County in need of preventative care.');
  const [deadline, setDeadline] = useState('2026-11-20');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setReferrals(commService.getReferrals());
  };

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const res = commService.createReferral(
      {
        partnerId: 'PART-004',
        partnerName: partnerName.trim(),
        serviceType: serviceType.trim(),
        referralEligibilityCriteria: eligibility.trim(),
        assignedStaffId: 'STF-006',
        assignedStaffName: currentUserName,
        status: 'DRAFT',
        followUpDeadline: deadline,
        executiveAuthorized: true,
      },
      currentUserName,
      currentUserRole
    );

    if (res.success && res.referral) {
      setFeedbackNotice({
        type: 'success',
        message: `Referral ${res.referral.id} created under verified partner agreement. External dispatch remains safely gated.`,
      });
      setIsModalOpen(false);
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to create referral.' });
    }
  };

  const handleStatusUpdate = (id: string, newStatus: ReferralStatus) => {
    const res = commService.updateReferralStatus(id, newStatus, currentUserName, currentUserRole);
    if (res.error?.includes('DISPATCH_GATED')) {
      setFeedbackNotice({
        type: 'warning',
        message: 'GATED DISPATCH: Referral authorized internally. Live email dispatch to partner is gated pending Google Workspace OAuth authorization.',
      });
    } else if (res.success) {
      setFeedbackNotice({ type: 'success', message: `Referral status updated to ${newStatus}.` });
    }
    refreshData();
  };

  const filtered = referrals.filter(
    (r) =>
      r.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* GATED DISPATCH DISCLOSURE BANNER */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 mt-0.5 border border-amber-500/40">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">External Dispatch Gating Invariant</h3>
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Referral packages are authorized and tracked in the internal registry. Direct automated email transmission to external partner contact desks is held in <strong>Staged Development Quarantine</strong> until Google Workspace OAuth 2.0 authorization is completed.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-teal-300 rounded-full text-xs font-mono font-bold border border-slate-700">
            <Mail className="w-3.5 h-3.5" /> Dispatch Safe-Mode Active
          </span>
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
            M25.05 · CIVIC & HEALTH PARTNERSHIPS
          </span>
          <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">Community Referrals & Service Partners</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Coordinate specialized external services through verified 501(c)(3) institutional agreements and MOUs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Prepare Authorized Referral</span>
        </button>
      </div>

      {/* NOTICE */}
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

      {/* SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search partner, service type, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>
        <button
          onClick={refreshData}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* REFERRAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ref) => (
          <div key={ref.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {ref.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {ref.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{ref.partnerName}</h3>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-[11px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Service Type</span>
                <span className="font-semibold text-slate-800">{ref.serviceType}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Eligibility Criteria</span>
                <span className="text-slate-600">{ref.referralEligibilityCriteria}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/40 text-[10px]">
                <span className="text-slate-500">Coordinator: {ref.assignedStaffName}</span>
                <span className="font-mono text-slate-600">Follow-up: {ref.followUpDeadline}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[10px] font-mono text-amber-700 flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3" /> Gated Dispatch
              </span>
              <select
                value={ref.status}
                onChange={(e) => handleStatusUpdate(ref.id, e.target.value as ReferralStatus)}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 cursor-pointer"
              >
                <option value="DRAFT">Draft</option>
                <option value="INTERNAL_REVIEW">Internal Review</option>
                <option value="AUTHORIZED">Authorized</option>
                <option value="REFERRED">Refer To Partner</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CLOSED">Closed & Verified</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* PREPARE REFERRAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Partner Alliance</span>
                <h3 className="text-base font-bold text-slate-900">Prepare Authorized Referral</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Partner Organization *</label>
                <select
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="Hennepin Healthcare Community Clinic">Hennepin Healthcare Community Clinic (Active MOU)</option>
                  <option value="Target Foundation Community Partner Desk">Target Foundation Community Partner Desk (Active MOU)</option>
                  <option value="Second Harvest Heartland">Second Harvest Heartland (Active Logistics MOU)</option>
                  <option value="Cedar-Riverside Opportunity Center">Cedar-Riverside Opportunity Center (Workforce)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Required *</label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Referral Eligibility Criteria</label>
                <textarea
                  rows={2}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Follow-up Target Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
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
                  Authorize Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
