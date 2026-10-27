/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Grant Opportunity Registry, Eligibility & Go/No-Go (M26.02 - M26.04)
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Plus,
  Scale,
  FileCheck2,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import {
  GrantOpportunity,
  GrantLifecycleStatus,
  GrantEligibilityAssessment,
  GoNoGoReviewRecord,
  GoNoGoDecision,
} from '../../../types/fundingCommand';

interface GrantOpportunityRegistryTabProps {
  currentUser: any;
  onOpenWorkspace: (opportunityId: string) => void;
}

export const GrantOpportunityRegistryTab: React.FC<GrantOpportunityRegistryTabProps> = ({
  currentUser,
  onOpenWorkspace,
}) => {
  const fundingService = FundingCommandService.getInstance();
  const [opportunities, setOpportunities] = useState<GrantOpportunity[]>(fundingService.getGrantOpportunities());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Eligibility modal state
  const [selectedEligibilityOpp, setSelectedEligibilityOpp] = useState<GrantOpportunity | null>(null);
  const [eligibilityAssessment, setEligibilityAssessment] = useState<GrantEligibilityAssessment | null>(null);

  // Go / No-Go modal state
  const [selectedGoNoGoOpp, setSelectedGoNoGoOpp] = useState<GrantOpportunity | null>(null);
  const [gngDecision, setGngDecision] = useState<GoNoGoDecision>('GO');
  const [gngWorkloadHours, setGngWorkloadHours] = useState(40);
  const [gngReportingBurden, setGngReportingBurden] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE'>('MEDIUM');
  const [gngJustification, setGngJustification] = useState('');
  const [gngError, setGngError] = useState<string | null>(null);
  const [gngSuccess, setGngSuccess] = useState<string | null>(null);

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.funder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.targetPopulation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || opp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEligibilityModal = (opp: GrantOpportunity) => {
    setSelectedEligibilityOpp(opp);
    const assessment = fundingService.evaluateEligibility(opp.id, currentUser);
    setEligibilityAssessment(assessment);
  };

  const handleOpenGoNoGoModal = (opp: GrantOpportunity) => {
    setSelectedGoNoGoOpp(opp);
    setGngError(null);
    setGngSuccess(null);
    setGngJustification(`Authorized evaluation for ${opp.opportunityTitle}. Alignment with ${opp.programId} certified.`);
  };

  const handleSubmitGoNoGo = () => {
    if (!selectedGoNoGoOpp) return;
    setGngError(null);
    try {
      const record = fundingService.submitGoNoGoReview(
        {
          opportunityId: selectedGoNoGoOpp.id,
          opportunityTitle: selectedGoNoGoOpp.opportunityTitle,
          funder: selectedGoNoGoOpp.funder,
          fundingPotentialAmount: selectedGoNoGoOpp.fundingRangeMax,
          programAlignmentScore: 95,
          estimatedWorkloadHours: gngWorkloadHours,
          reportingBurden: gngReportingBurden,
          strategicRisks: ['Staff allocation required for quarterly reporting'],
          aiRecommendation: 'GO',
          finalDecision: gngDecision,
          decisionMaker: currentUser?.name || 'Nombuso Tembe (Executive Director)',
          justification: gngJustification,
          materialCommitmentRequiresEd: true,
        },
        currentUser
      );
      setGngSuccess(`Decision recorded: ${record.finalDecision}. Opportunity transitioned to ${selectedGoNoGoOpp.status}.`);
      setOpportunities(fundingService.getGrantOpportunities());
      setTimeout(() => setSelectedGoNoGoOpp(null), 1500);
    } catch (err: any) {
      setGngError(err.message || 'Failed to submit decision.');
    }
  };

  const getStatusBadge = (status: GrantLifecycleStatus) => {
    switch (status) {
      case 'AWARDED':
        return <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">AWARDED</span>;
      case 'IN_DEVELOPMENT':
        return <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">IN_DEVELOPMENT</span>;
      case 'APPROVED_TO_PURSUE':
        return <span className="text-[11px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">APPROVED_TO_PURSUE</span>;
      case 'GO_NO_GO_REVIEW':
        return <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">GO_NO_GO_REVIEW</span>;
      case 'SUBMITTED':
        return <span className="text-[11px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">SUBMITTED</span>;
      case 'NOT_PURSUED':
      case 'DECLINED':
        return <span className="text-[11px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">{status}</span>;
      default:
        return <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">
              M26.02 Registry
            </span>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
              M26.03 Eligibility
            </span>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
              M26.04 Go / No-Go Gate
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Institutional Grant Opportunities & Decision Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            11-stage opportunity lifecycle with automated 501(c)(3) eligibility checks and formal Executive Director approval gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
            Total Opportunities: <strong>{opportunities.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by funder, title, or population..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Lifecycle Stages (11 Stages)</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="GO_NO_GO_REVIEW">Go/No-Go Review</option>
            <option value="APPROVED_TO_PURSUE">Approved to Pursue</option>
            <option value="IN_DEVELOPMENT">In Development</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="AWARDED">Awarded</option>
            <option value="NOT_PURSUED">Not Pursued</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {opp.id}
                </span>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {opp.programId}
                </span>
                {getStatusBadge(opp.status)}
                <span className="text-xs font-mono text-slate-500">
                  {opp.funderType}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {opp.opportunityTitle}
                </h3>
                <p className="text-xs font-medium text-teal-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {opp.funder}
                </p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {opp.eligibilitySummary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>
                  <strong>Range:</strong> ${opp.fundingRangeMin.toLocaleString()} – ${opp.fundingRangeMax.toLocaleString()}
                </span>
                <span>
                  <strong>Deadline:</strong> {opp.applicationDeadline}
                </span>
                <span>
                  <strong>Owner:</strong> {opp.assignedOwner}
                </span>
                {opp.matchingRequirements.required && (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                    Match: {opp.matchingRequirements.percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => handleOpenEligibilityModal(opp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Check Eligibility
              </button>

              <button
                onClick={() => handleOpenGoNoGoModal(opp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                Go / No-Go Review
              </button>

              <button
                onClick={() => onOpenWorkspace(opp.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Open Workspace
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
            No grant opportunities match your criteria.
          </div>
        )}
      </div>

      {/* M26.03: Grant Eligibility Assessment Modal */}
      {selectedEligibilityOpp && eligibilityAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">
                  M26.03 Automated Eligibility Ruleset
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                  Eligibility Assessment: {selectedEligibilityOpp.funder}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEligibilityOpp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Eligibility Verdict:</span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  {eligibilityAssessment.verdict === 'ELIGIBLE' && (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ELIGIBLE TO PURSUE
                    </span>
                  )}
                  {eligibilityAssessment.verdict === 'POTENTIALLY_ELIGIBLE' && (
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> POTENTIALLY ELIGIBLE (REVIEW)
                    </span>
                  )}
                  {eligibilityAssessment.verdict === 'INELIGIBLE' && (
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-rose-600" /> INELIGIBLE
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono bg-blue-100 text-blue-900 px-2 py-1 rounded">
                Human Review Required
              </span>
            </div>

            {/* Criteria Evaluation List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Authoritative Evaluation Against Phumulani Profile
              </h4>

              {Object.entries(eligibilityAssessment.criteria).map(([key, item]) => (
                <div
                  key={key}
                  className="p-3 border border-slate-200 rounded-lg flex items-start gap-3 bg-white"
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">{item.criterion}</p>
                    <p className="text-slate-600 mt-0.5">{item.evidence}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <strong>Mandatory Rule:</strong> AI and automated rulesets cannot make the final determination. Authorized human leadership review is required to advance to proposal development.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEligibilityOpp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                Close Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M26.04: Go / No-Go Decision Gate Modal */}
      {selectedGoNoGoOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                  M26.04 Formal Decision Gate
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                  Executive Go / No-Go Determination
                </h3>
              </div>
              <button
                onClick={() => setSelectedGoNoGoOpp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p><strong>Opportunity:</strong> {selectedGoNoGoOpp.opportunityTitle}</p>
              <p><strong>Funder:</strong> {selectedGoNoGoOpp.funder} (${selectedGoNoGoOpp.fundingRangeMax.toLocaleString()})</p>
              <p><strong>Target Program:</strong> {selectedGoNoGoOpp.programId}</p>
            </div>

            {gngError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{gngError}</span>
              </div>
            )}

            {gngSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gngSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Executive Decision:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['GO', 'NO_GO', 'HOLD', 'NEEDS_INFORMATION'] as GoNoGoDecision[]).map((dec) => (
                    <button
                      key={dec}
                      type="button"
                      onClick={() => setGngDecision(dec)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        gngDecision === dec
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Workload (Hours):
                  </label>
                  <input
                    type="number"
                    value={gngWorkloadHours}
                    onChange={(e) => setGngWorkloadHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reporting Burden:
                  </label>
                  <select
                    value={gngReportingBurden}
                    onChange={(e) => setGngReportingBurden(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Decision Justification & Strategic Alignment:
                </label>
                <textarea
                  rows={3}
                  value={gngJustification}
                  onChange={(e) => setGngJustification(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>Authorization Notice:</strong> Material funding commitments require Executive Director approval. General staff cannot execute binding Go decisions.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedGoNoGoOpp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGoNoGo}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Record Official Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
