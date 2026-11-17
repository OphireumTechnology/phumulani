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
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">AWARDED</span>;
      case 'IN_DEVELOPMENT':
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">IN_DEVELOPMENT</span>;
      case 'APPROVED_TO_PURSUE':
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">APPROVED_TO_PURSUE</span>;
      case 'GO_NO_GO_REVIEW':
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">GO_NO_GO_REVIEW</span>;
      case 'SUBMITTED':
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">SUBMITTED</span>;
      case 'NOT_PURSUED':
      case 'DECLINED':
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">{status}</span>;
      default:
        return <span className="text-[11px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-phumulani-cream rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
              M26.02 Registry
            </span>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
              M26.03 Eligibility
            </span>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded uppercase">
              M26.04 Go / No-Go Gate
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-phumulani-charcoal tracking-tight">
            Institutional Grant Opportunities & Decision Registry
          </h2>
          <p className="text-xs text-phumulani-charcoal mt-0.5">
            11-stage opportunity lifecycle with automated 501(c)(3) eligibility checks and formal Executive Director approval gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-phumulani-cream text-phumulani-charcoal px-3 py-1.5 rounded-lg border border-phumulani-cream">
            Total Opportunities: <strong>{opportunities.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-phumulani-cream rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-phumulani-charcoal absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by funder, title, or population..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-phumulani-cream rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-phumulani-charcoal" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-phumulani-cream rounded-lg px-3 py-2 bg-white text-phumulani-charcoal focus:outline-hidden"
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
            className="bg-white border border-phumulani-cream rounded-xl p-5 shadow-xs hover:border-phumulani-cream transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                  {opp.id}
                </span>
                <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                  {opp.programId}
                </span>
                {getStatusBadge(opp.status)}
                <span className="text-xs font-mono text-phumulani-charcoal">
                  {opp.funderType}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-phumulani-charcoal font-serif">
                  {opp.opportunityTitle}
                </h3>
                <p className="text-xs font-medium text-phumulani-earth flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {opp.funder}
                </p>
              </div>

              <p className="text-xs text-phumulani-charcoal line-clamp-2">
                {opp.eligibilitySummary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-phumulani-charcoal pt-1">
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
                  <span className="text-phumulani-earth bg-phumulani-cream px-1.5 py-0.5 rounded font-mono">
                    Match: {opp.matchingRequirements.percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => handleOpenEligibilityModal(opp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-phumulani-earth" />
                Check Eligibility
              </button>

              <button
                onClick={() => handleOpenGoNoGoModal(opp)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-charcoal border border-phumulani-gold text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-phumulani-earth" />
                Go / No-Go Review
              </button>

              <button
                onClick={() => onOpenWorkspace(opp.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Open Workspace
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-phumulani-charcoal bg-white border border-phumulani-cream rounded-xl">
            No grant opportunities match your criteria.
          </div>
        )}
      </div>

      {/* M26.03: Grant Eligibility Assessment Modal */}
      {selectedEligibilityOpp && eligibilityAssessment && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-phumulani-cream space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-phumulani-cream">
              <div>
                <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
                  M26.03 Automated Eligibility Ruleset
                </span>
                <h3 className="text-lg font-serif font-bold text-phumulani-charcoal mt-1">
                  Eligibility Assessment: {selectedEligibilityOpp.funder}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEligibilityOpp(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-phumulani-cream rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-phumulani-charcoal">Eligibility Verdict:</span>
                <div className="text-sm font-bold text-phumulani-charcoal flex items-center gap-1.5 mt-0.5">
                  {eligibilityAssessment.verdict === 'ELIGIBLE' && (
                    <span className="text-phumulani-earth flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-phumulani-earth" /> ELIGIBLE TO PURSUE
                    </span>
                  )}
                  {eligibilityAssessment.verdict === 'POTENTIALLY_ELIGIBLE' && (
                    <span className="text-phumulani-earth flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-phumulani-earth" /> POTENTIALLY ELIGIBLE (REVIEW)
                    </span>
                  )}
                  {eligibilityAssessment.verdict === 'INELIGIBLE' && (
                    <span className="text-phumulani-earth flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-phumulani-earth" /> INELIGIBLE
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono bg-phumulani-cream text-phumulani-earth px-2 py-1 rounded">
                Human Review Required
              </span>
            </div>

            {/* Criteria Evaluation List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider">
                Authoritative Evaluation Against Phumulani Profile
              </h4>

              {Object.entries(eligibilityAssessment.criteria).map(([key, item]) => (
                <div
                  key={key}
                  className="p-3 border border-phumulani-cream rounded-lg flex items-start gap-3 bg-white"
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-phumulani-charcoal">{item.criterion}</p>
                    <p className="text-phumulani-charcoal mt-0.5">{item.evidence}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-lg text-xs text-phumulani-charcoal">
              <strong>Mandatory Rule:</strong> AI and automated rulesets cannot make the final determination. Authorized human leadership review is required to advance to proposal development.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEligibilityOpp(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-medium rounded-lg cursor-pointer"
              >
                Close Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M26.04: Go / No-Go Decision Gate Modal */}
      {selectedGoNoGoOpp && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-phumulani-cream space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-phumulani-cream">
              <div>
                <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded uppercase">
                  M26.04 Formal Decision Gate
                </span>
                <h3 className="text-lg font-serif font-bold text-phumulani-charcoal mt-1">
                  Executive Go / No-Go Determination
                </h3>
              </div>
              <button
                onClick={() => setSelectedGoNoGoOpp(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-lg text-xs space-y-1">
              <p><strong>Opportunity:</strong> {selectedGoNoGoOpp.opportunityTitle}</p>
              <p><strong>Funder:</strong> {selectedGoNoGoOpp.funder} (${selectedGoNoGoOpp.fundingRangeMax.toLocaleString()})</p>
              <p><strong>Target Program:</strong> {selectedGoNoGoOpp.programId}</p>
            </div>

            {gngError && (
              <div className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-xs text-phumulani-earth flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0" />
                <span>{gngError}</span>
              </div>
            )}

            {gngSuccess && (
              <div className="p-3 bg-phumulani-cream border border-phumulani-green rounded-lg text-xs text-phumulani-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
                <span>{gngSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">
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
                          ? 'bg-phumulani-earth text-white border-phumulani-earth'
                          : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream hover:bg-phumulani-cream'
                      }`}
                    >
                      {dec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">
                    Estimated Workload (Hours):
                  </label>
                  <input
                    type="number"
                    value={gngWorkloadHours}
                    onChange={(e) => setGngWorkloadHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-phumulani-cream rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">
                    Reporting Burden:
                  </label>
                  <select
                    value={gngReportingBurden}
                    onChange={(e) => setGngReportingBurden(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-phumulani-cream rounded-lg text-xs bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">
                  Decision Justification & Strategic Alignment:
                </label>
                <textarea
                  rows={3}
                  value={gngJustification}
                  onChange={(e) => setGngJustification(e.target.value)}
                  className="w-full p-2.5 border border-phumulani-cream rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-lg text-xs text-phumulani-charcoal">
                <strong>Authorization Notice:</strong> Material funding commitments require Executive Director approval. General staff cannot execute binding Go decisions.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedGoNoGoOpp(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-medium rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGoNoGo}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
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
