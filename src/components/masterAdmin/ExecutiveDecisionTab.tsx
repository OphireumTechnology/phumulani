/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Executive Decision Center & Priorities (M24.07)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { ExecutiveDecisionRecord, ExecutiveDecisionStatus, ExecutiveStrategicPriority } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpRight,
  TrendingUp,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  Shield,
  Send,
  Building2,
} from 'lucide-react';

interface ExecutiveDecisionTabProps {
  currentUser: User;
}

export const ExecutiveDecisionTab: React.FC<ExecutiveDecisionTabProps> = ({ currentUser }) => {
  const [decisions, setDecisions] = useState<ExecutiveDecisionRecord[]>(masterAdminService.getExecutiveDecisions());
  const [priorities, setPriorities] = useState<ExecutiveStrategicPriority[]>(masterAdminService.getStrategicPriorities());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Review Modal
  const [selectedDecision, setSelectedDecision] = useState<ExecutiveDecisionRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | 'RETURNED' | 'ESCALATED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');

  const reloadData = () => {
    setDecisions(masterAdminService.getExecutiveDecisions());
    setPriorities(masterAdminService.getStrategicPriorities());
  };

  const handleExecuteReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDecision) return;

    const res = masterAdminService.reviewExecutiveDecision(
      selectedDecision.id,
      reviewAction,
      currentUser.role,
      currentUser.name,
      reviewNotes
    );

    if (res.success) {
      setActionNotice({
        type: 'success',
        message: `Decision ${selectedDecision.reference} was marked ${reviewAction} by ${currentUser.name}.`,
      });
      setSelectedDecision(null);
      setReviewNotes('');
      reloadData();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to review decision.' });
    }
  };

  const isExecutiveOrAdmin =
    currentUser.role === 'PLATFORM_SUPER_ADMIN' || currentUser.role === 'executive_director';

  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-bold text-slate-900">Executive Decision Center & Leadership Priorities</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop executive governance, quad-action decision approvals, and strategic KPI milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              isExecutiveOrAdmin ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isExecutiveOrAdmin ? 'Executive Sign-off Authority Active' : 'Read-Only Observer Mode'}
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

      {/* Strategic Priorities Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-800" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Executive Strategic Priorities & Milestones
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Board Alignment 2026/2027</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorities.map((pri) => (
            <div key={pri.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-mono font-bold text-teal-800">{pri.targetQuarter}</span>
                  <span className="px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">{pri.status}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">{pri.title}</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-slate-800">{pri.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-700 h-full rounded-full" style={{ width: `${pri.progressPercent}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 mt-2">Owner: {pri.leadOwner}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Register Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Official Executive Decision Register
            </h3>
            <p className="text-[11px] text-slate-500">
              Audit-proven record of all financial, legal, and operational leadership authorizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Decision Statuses ({decisions.length})</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="RETURNED">Returned</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredDecisions.map((dec) => (
            <div key={dec.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                    {dec.reference}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      dec.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : dec.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : dec.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {dec.status}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{dec.title}</span>
                </div>

                <p className="text-xs text-slate-600">{dec.summary}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                  <span>Requesting: <strong>{dec.requestingStaffName}</strong> ({dec.requestingDepartmentName})</span>
                  {dec.financialImpactUSD && (
                    <span>Impact: <strong className="text-slate-800">${dec.financialImpactUSD.toLocaleString()}</strong></span>
                  )}
                  {dec.decidedBy && (
                    <span className="text-emerald-700 font-semibold">
                      Decided by {dec.decidedBy} on {dec.decidedAt?.split('T')[0]}
                    </span>
                  )}
                </div>

                {dec.decisionNotes && (
                  <div className="p-2 bg-slate-100/70 rounded text-[11px] text-slate-700 italic border-l-2 border-purple-600">
                    "{dec.decisionNotes}"
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {dec.status === 'PENDING' ? (
                  <button
                    onClick={() => setSelectedDecision(dec)}
                    className="px-3.5 py-1.5 bg-purple-800 text-white rounded-lg text-xs font-semibold hover:bg-purple-900 transition-colors shadow-xs"
                  >
                    Executive Review
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedDecision(dec)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    View Audit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review & Decision Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700">{selectedDecision.reference}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedDecision.title}</h3>
              </div>
              <button onClick={() => setSelectedDecision(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><strong>Summary:</strong> {selectedDecision.summary}</div>
              <div><strong>Department:</strong> {selectedDecision.requestingDepartmentName}</div>
              <div><strong>Impact:</strong> ${selectedDecision.financialImpactUSD?.toLocaleString() || 'N/A'}</div>
              <div><strong>Required Approver:</strong> {selectedDecision.requiredApproverRole}</div>
            </div>

            {selectedDecision.status === 'PENDING' && isExecutiveOrAdmin ? (
              <form onSubmit={handleExecuteReview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Executive Quad-Action Determination</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction('APPROVED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'APPROVED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      APPROVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('REJECTED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'REJECTED' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      REJECT
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('RETURNED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'RETURNED' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      RETURN FOR CHANGES
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('ESCALATED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'ESCALATED' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      ESCALATE TO BOARD
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Executive Rationale & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide rationale for this decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedDecision(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Record Executive Decision
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-slate-500 space-y-2">
                <p>Status: <strong>{selectedDecision.status}</strong></p>
                <div className="space-y-1">
                  <strong>Audit History:</strong>
                  {selectedDecision.auditHistory.map((h, i) => (
                    <div key={i} className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                      <span>{h.timestamp.split('T')[0]}: <strong>{h.actor}</strong> — {h.action}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setSelectedDecision(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
