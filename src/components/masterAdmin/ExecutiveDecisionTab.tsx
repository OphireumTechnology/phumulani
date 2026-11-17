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
      <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-phumulani-earth" />
            <h2 className="text-lg font-bold text-phumulani-charcoal">Executive Decision Center & Leadership Priorities</h2>
          </div>
          <p className="text-xs text-phumulani-charcoal mt-1">
            Human-in-the-loop executive governance, quad-action decision approvals, and strategic KPI milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              isExecutiveOrAdmin ? 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth' : 'bg-phumulani-cream text-phumulani-charcoal'
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
              ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
              : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="text-phumulani-charcoal hover:text-phumulani-earth">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Strategic Priorities Section */}
      <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-phumulani-cream">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-phumulani-earth" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal">
              Executive Strategic Priorities & Milestones
            </h3>
          </div>
          <span className="text-[11px] text-phumulani-charcoal">Board Alignment 2026/2027</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {priorities.map((pri) => (
            <div key={pri.id} className="p-3.5 bg-phumulani-cream border border-phumulani-cream rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal mb-1">
                  <span className="font-mono font-bold text-phumulani-earth">{pri.targetQuarter}</span>
                  <span className="px-1.5 py-0.2 rounded font-bold bg-phumulani-cream text-phumulani-charcoal">{pri.status}</span>
                </div>
                <div className="text-xs font-bold text-phumulani-charcoal line-clamp-2 mb-2">{pri.title}</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-phumulani-charcoal mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-phumulani-charcoal">{pri.progressPercent}%</span>
                </div>
                <div className="w-full bg-phumulani-cream h-1.5 rounded-full overflow-hidden">
                  <div className="bg-phumulani-earth h-full rounded-full" style={{ width: `${pri.progressPercent}%` }} />
                </div>
                <div className="text-[10px] text-phumulani-charcoal mt-2">Owner: {pri.leadOwner}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Register Section */}
      <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
        <div className="p-4 border-b border-phumulani-cream bg-phumulani-cream flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal">
              Official Executive Decision Register
            </h3>
            <p className="text-[11px] text-phumulani-charcoal">
              Audit-proven record of all financial, legal, and operational leadership authorizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-phumulani-cream rounded-lg px-2.5 py-1.5 bg-white text-phumulani-charcoal"
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

        <div className="divide-y divide-phumulani-cream">
          {filteredDecisions.map((dec) => (
            <div key={dec.id} className="p-4 hover:bg-phumulani-cream transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                    {dec.reference}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      dec.status === 'APPROVED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal'
                        : dec.status === 'PENDING'
                        ? 'bg-phumulani-cream text-phumulani-charcoal'
                        : dec.status === 'REJECTED'
                        ? 'bg-phumulani-cream text-phumulani-earth'
                        : 'bg-phumulani-cream text-phumulani-charcoal'
                    }`}
                  >
                    {dec.status}
                  </span>
                  <span className="text-xs font-bold text-phumulani-charcoal">{dec.title}</span>
                </div>

                <p className="text-xs text-phumulani-charcoal">{dec.summary}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-phumulani-charcoal">
                  <span>Requesting: <strong>{dec.requestingStaffName}</strong> ({dec.requestingDepartmentName})</span>
                  {dec.financialImpactUSD && (
                    <span>Impact: <strong className="text-phumulani-charcoal">${dec.financialImpactUSD.toLocaleString()}</strong></span>
                  )}
                  {dec.decidedBy && (
                    <span className="text-phumulani-earth font-semibold">
                      Decided by {dec.decidedBy} on {dec.decidedAt?.split('T')[0]}
                    </span>
                  )}
                </div>

                {dec.decisionNotes && (
                  <div className="p-2 bg-phumulani-cream rounded text-[11px] text-phumulani-charcoal italic border-l-2 border-phumulani-earth">
                    "{dec.decisionNotes}"
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {dec.status === 'PENDING' ? (
                  <button
                    onClick={() => setSelectedDecision(dec)}
                    className="px-3.5 py-1.5 bg-phumulani-earth text-white rounded-lg text-xs font-semibold hover:bg-phumulani-charcoal transition-colors shadow-xs"
                  >
                    Executive Review
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedDecision(dec)}
                    className="px-3 py-1 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg text-xs font-medium"
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
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-phumulani-cream space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-phumulani-cream">
              <div>
                <span className="text-[10px] font-mono font-bold text-phumulani-earth">{selectedDecision.reference}</span>
                <h3 className="text-sm font-bold text-phumulani-charcoal">{selectedDecision.title}</h3>
              </div>
              <button onClick={() => setSelectedDecision(null)} className="text-phumulani-charcoal hover:text-phumulani-earth">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 bg-phumulani-cream p-3 rounded-lg border border-phumulani-cream">
              <div><strong>Summary:</strong> {selectedDecision.summary}</div>
              <div><strong>Department:</strong> {selectedDecision.requestingDepartmentName}</div>
              <div><strong>Impact:</strong> ${selectedDecision.financialImpactUSD?.toLocaleString() || 'N/A'}</div>
              <div><strong>Required Approver:</strong> {selectedDecision.requiredApproverRole}</div>
            </div>

            {selectedDecision.status === 'PENDING' && isExecutiveOrAdmin ? (
              <form onSubmit={handleExecuteReview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-phumulani-charcoal font-semibold mb-1">Executive Quad-Action Determination</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction('APPROVED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'APPROVED' ? 'bg-phumulani-green text-phumulani-charcoal border-phumulani-green' : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                      }`}
                    >
                      APPROVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('REJECTED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'REJECTED' ? 'bg-phumulani-earth text-white border-phumulani-earth' : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                      }`}
                    >
                      REJECT
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('RETURNED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'RETURNED' ? 'bg-phumulani-gold text-phumulani-charcoal border-phumulani-gold' : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                      }`}
                    >
                      RETURN FOR CHANGES
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('ESCALATED')}
                      className={`p-2 rounded-lg font-bold border transition-colors ${
                        reviewAction === 'ESCALATED' ? 'bg-phumulani-earth text-white border-phumulani-earth' : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                      }`}
                    >
                      ESCALATE TO BOARD
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-phumulani-charcoal font-semibold mb-1">Executive Rationale & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide rationale for this decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2 border border-phumulani-cream rounded-lg"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-phumulani-cream">
                  <button
                    type="button"
                    onClick={() => setSelectedDecision(null)}
                    className="px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-semibold shadow-xs"
                  >
                    Record Executive Decision
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-phumulani-charcoal space-y-2">
                <p>Status: <strong>{selectedDecision.status}</strong></p>
                <div className="space-y-1">
                  <strong>Audit History:</strong>
                  {selectedDecision.auditHistory.map((h, i) => (
                    <div key={i} className="text-[11px] text-phumulani-charcoal bg-phumulani-cream p-2 rounded">
                      <span>{h.timestamp.split('T')[0]}: <strong>{h.actor}</strong> — {h.action}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setSelectedDecision(null)}
                    className="px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg font-medium"
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
