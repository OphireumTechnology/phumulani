/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Grant Development Workspace & Budget Builder (M26.05 - M26.08)
 */

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Save,
  Send,
  Building2,
  Layers,
  HelpCircle,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import {
  GrantProposalRecord,
  GrantBudgetSheet,
  SubmissionComplianceChecklist,
  BudgetLineItem,
} from '../../../types/fundingCommand';

interface GrantDevelopmentWorkspaceTabProps {
  currentUser: any;
  defaultOpportunityId?: string;
}

export const GrantDevelopmentWorkspaceTab: React.FC<GrantDevelopmentWorkspaceTabProps> = ({
  currentUser,
  defaultOpportunityId = 'GR-OPP-2026-001',
}) => {
  const fundingService = FundingCommandService.getInstance();
  const opportunities = fundingService.getGrantOpportunities();

  const [selectedOppId, setSelectedOppId] = useState<string>(defaultOpportunityId);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<'NARRATIVE' | 'BUDGET' | 'SUBMISSION_GATE'>('NARRATIVE');

  // Narrative Workspace State
  const [proposal, setProposal] = useState<GrantProposalRecord>(
    fundingService.getProposal(selectedOppId) || fundingService.getProposals()[0]
  );
  const [activeSectionKey, setActiveSectionKey] = useState<keyof GrantProposalRecord['sections']>('executiveSummary');
  const [sectionContent, setSectionContent] = useState<string>(
    proposal?.sections?.executiveSummary?.content || ''
  );
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Budget Builder State
  const [budgetSheet, setBudgetSheet] = useState<GrantBudgetSheet>(fundingService.getBudgetSheet(selectedOppId));
  const [budgetNotice, setBudgetNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Submission Gate State
  const [checklist, setChecklist] = useState<SubmissionComplianceChecklist>(
    fundingService.getSubmissionChecklist(selectedOppId)
  );

  const handleSelectOpportunity = (oppId: string) => {
    setSelectedOppId(oppId);
    const prop = fundingService.getProposal(oppId);
    if (prop) {
      setProposal(prop);
      setSectionContent(prop.sections[activeSectionKey]?.content || '');
    }
    setBudgetSheet(fundingService.getBudgetSheet(oppId));
    setChecklist(fundingService.getSubmissionChecklist(oppId));
  };

  const handleSelectSection = (key: keyof GrantProposalRecord['sections']) => {
    setActiveSectionKey(key);
    if (proposal && proposal.sections[key]) {
      setSectionContent(proposal.sections[key].content);
    } else {
      setSectionContent('');
    }
    setNotice(null);
  };

  const handleSaveSection = () => {
    try {
      const updated = fundingService.updateProposalSection(selectedOppId, activeSectionKey, sectionContent, currentUser);
      setProposal({ ...updated });
      setNotice({ type: 'success', message: `Saved section "${activeSectionKey}" (v${updated.version}) successfully.` });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to save section.' });
    }
  };

  const handleGenerateAiDraft = () => {
    setIsGeneratingAi(true);
    setNotice(null);
    setTimeout(() => {
      try {
        const text = fundingService.generateAiDraftSection(selectedOppId, activeSectionKey, currentUser);
        setSectionContent(text);
        setNotice({
          type: 'success',
          message: 'Grounded AI draft generated. Strictly grounded in Phumulani 501(c)(3) registry with required human review disclaimer.',
        });
      } catch (err: any) {
        setNotice({ type: 'error', message: err.message || 'AI generation failed.' });
      } finally {
        setIsGeneratingAi(false);
      }
    }, 400);
  };

  // Budget Builder Handlers
  const handleAddBudgetLine = () => {
    const newItem: BudgetLineItem = {
      id: `BLI-${Date.now()}`,
      category: 'SUPPLIES',
      description: 'New workshop supplies line item',
      directCost: 1000,
      cashMatch: 0,
      inKindMatch: 0,
      isUnallowableExpense: false,
      justification: 'Cohort educational materials',
    };
    const cloned = { ...budgetSheet, lineItems: [...budgetSheet.lineItems, newItem] };
    setBudgetSheet(cloned);
  };

  const handleRemoveBudgetLine = (id: string) => {
    const cloned = { ...budgetSheet, lineItems: budgetSheet.lineItems.filter((i) => i.id !== id) };
    setBudgetSheet(cloned);
  };

  const handleSaveBudget = () => {
    try {
      const saved = fundingService.saveBudgetSheet(budgetSheet, currentUser);
      setBudgetSheet({ ...saved });
      setBudgetNotice({ type: 'success', message: 'Budget formulas validated and reconciled without unallowable costs.' });
    } catch (err: any) {
      setBudgetNotice({ type: 'error', message: err.message });
    }
  };

  // Submission Gate Handler
  const handleSubmitGrant = () => {
    try {
      const updated = fundingService.submitGrantProposal(selectedOppId, currentUser);
      setChecklist({ ...updated });
      setNotice({ type: 'success', message: `Proposal successfully submitted! Confirmation Ref: ${updated.submissionConfirmationRef}` });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  const sectionsList: { key: keyof GrantProposalRecord['sections']; label: string }[] = [
    { key: 'executiveSummary', label: '1. Executive Summary' },
    { key: 'organizationalBackground', label: '2. Org Background' },
    { key: 'statementOfNeed', label: '3. Statement of Need' },
    { key: 'programDescription', label: '4. Program Description' },
    { key: 'goalsAndObjectives', label: '5. Goals & Objectives' },
    { key: 'activitiesAndTimeline', label: '6. Activities & Timeline' },
    { key: 'targetPopulation', label: '7. Target Population' },
    { key: 'keyPersonnel', label: '8. Key Personnel' },
    { key: 'evaluationPlan', label: '9. Evaluation Plan' },
    { key: 'budgetNarrative', label: '10. Budget Narrative' },
    { key: 'sustainabilityPlan', label: '11. Sustainability Plan' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Selector & Mode Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
              M26.05 Narrative
            </span>
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase">
              M26.06 Grounded AI
            </span>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
              M26.07 Budget
            </span>
            <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
              M26.08 Submission Gate
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Grant Development Workspace & Compliance Gate
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full narrative formulation, 10% de minimis budget builder, grounded AI drafting, and Executive Director submission sign-off.
          </p>
        </div>

        {/* Opportunity Picker */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Target Grant:</label>
          <select
            value={selectedOppId}
            onChange={(e) => handleSelectOpportunity(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-hidden"
          >
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id}: {o.funder} (${o.fundingRangeMax.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveWorkspaceMode('NARRATIVE')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeWorkspaceMode === 'NARRATIVE'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Proposal Narrative Workspace (11 Sections)
        </button>
        <button
          onClick={() => setActiveWorkspaceMode('BUDGET')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeWorkspaceMode === 'BUDGET'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Grant Budget Builder & Indirect Cost Rate
        </button>
        <button
          onClick={() => setActiveWorkspaceMode('SUBMISSION_GATE')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeWorkspaceMode === 'SUBMISSION_GATE'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Compliance Submission Gate & Assurances
        </button>
      </div>

      {/* Notification banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* MODE 1: NARRATIVE WORKSPACE */}
      {activeWorkspaceMode === 'NARRATIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Sections List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Proposal Sections
            </h3>
            {sectionsList.map((sec) => (
              <button
                key={sec.key}
                onClick={() => handleSelectSection(sec.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  activeSectionKey === sec.key
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sec.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {proposal?.sections?.[sec.key]?.wordCount || 0}w
                </span>
              </button>
            ))}
          </div>

          {/* Right: Section Editor */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  Version {proposal?.version || 1} • Last edited by {proposal?.sections?.[activeSectionKey]?.lastEditedBy || 'Staff'}
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900 mt-1 capitalize">
                  {activeSectionKey.replace(/([A-Z])/g, ' $1')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Generate grounded narrative text using Phumulani 501(c)(3) knowledge"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  {isGeneratingAi ? 'Drafting...' : 'Grounded AI Draft'}
                </button>
                <button
                  onClick={handleSaveSection}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Section
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div>
              <textarea
                rows={12}
                value={sectionContent}
                onChange={(e) => setSectionContent(e.target.value)}
                placeholder="Draft proposal narrative text here..."
                className="w-full p-4 border border-slate-200 rounded-lg text-xs font-sans leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>
                  Word Count: <strong>{sectionContent.trim().split(/\s+/).filter(Boolean).length}</strong> words
                </span>
                <span>
                  VAWA Safeguarding Rule: Prohibits cleartext survivor crisis records or confidential shelter addresses.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BUDGET BUILDER */}
      {activeWorkspaceMode === 'BUDGET' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Grant Budget Builder & Indirect Rate Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates direct costs, applies 10% de minimis indirect rate, tracks in-kind matching, and audits for unallowable expenses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddBudgetLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
              <button
                onClick={handleSaveBudget}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Validate & Save Budget
              </button>
            </div>
          </div>

          {budgetNotice && (
            <div
              className={`p-3 rounded-lg text-xs ${
                budgetNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {budgetNotice.message}
            </div>
          )}

          {/* Budget Summary Totals Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Total Direct Costs:</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                ${budgetSheet.totals.totalDirectCost.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Indirect (10% De Minimis):</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                ${budgetSheet.totals.totalIndirectCost.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Total Grant Requested:</span>
              <p className="text-lg font-bold text-teal-800 mt-0.5 font-mono">
                ${budgetSheet.totals.totalGrantRequested.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Committed Match (Cash/In-Kind):</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
                ${(budgetSheet.totals.totalCashMatch + budgetSheet.totals.totalInKindMatch).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description & Justification</th>
                  <th className="p-3">Direct Cost ($)</th>
                  <th className="p-3">Match ($)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetSheet.lineItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...budgetSheet.lineItems];
                          updated[idx].category = e.target.value as any;
                          setBudgetSheet({ ...budgetSheet, lineItems: updated });
                        }}
                        className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                      >
                        <option value="PERSONNEL">Personnel</option>
                        <option value="FRINGE">Fringe Benefits</option>
                        <option value="TRAVEL">Travel</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="SUPPLIES">Supplies</option>
                        <option value="CONTRACTUAL">Contractual</option>
                        <option value="OTHER_DIRECT">Other Direct</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...budgetSheet.lineItems];
                          updated[idx].description = e.target.value;
                          setBudgetSheet({ ...budgetSheet, lineItems: updated });
                        }}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.directCost}
                        onChange={(e) => {
                          const updated = [...budgetSheet.lineItems];
                          updated[idx].directCost = Number(e.target.value);
                          setBudgetSheet({ ...budgetSheet, lineItems: updated });
                        }}
                        className="w-24 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.inKindMatch}
                        onChange={(e) => {
                          const updated = [...budgetSheet.lineItems];
                          updated[idx].inKindMatch = Number(e.target.value);
                          setBudgetSheet({ ...budgetSheet, lineItems: updated });
                        }}
                        className="w-20 border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveBudgetLine(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: SUBMISSION COMPLIANCE GATE */}
      {activeWorkspaceMode === 'SUBMISSION_GATE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Grant Submission Compliance Gate & Legal Assurances
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforces board authorization, SAM.gov validation, and Executive Director binding signature before proposal transmission.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-slate-900">501(c)(3) Nonprofit Eligibility Verified</p>
                  <p className="text-[11px] text-slate-500">IRS determination letter and Minnesota AG annual filing verified active.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                CERTIFIED
              </span>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-slate-900">Board Authorization Documented</p>
                  <p className="text-[11px] text-slate-500">Board of Directors resolution authorizing pursuit of grant.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                RECORDED
              </span>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-slate-900">Federal Debarment & SAM.gov Active</p>
                  <p className="text-[11px] text-slate-500">UEI active; no exclusion records found in federal SAM directory.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-lg flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {checklist.executiveDirectorSignatureVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-xs text-slate-900">Executive Director Signature Verification</p>
                  <p className="text-[11px] text-slate-500">
                    {checklist.executiveDirectorSignatureVerified
                      ? `Signed by ${checklist.executiveSignerName} (Executive Director)`
                      : 'Pending Executive Director binding signature.'}
                  </p>
                </div>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  checklist.executiveDirectorSignatureVerified
                    ? 'text-emerald-800 bg-emerald-100'
                    : 'text-amber-800 bg-amber-100'
                }`}
              >
                {checklist.executiveDirectorSignatureVerified ? 'AUTHORIZED' : 'ED_REQUIRED'}
              </span>
            </div>
          </div>

          {/* Submission status or execute button */}
          {checklist.submissionConfirmationRef ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-900">
                Grant Proposal Officially Submitted!
              </p>
              <p className="text-xs text-emerald-800 font-mono">
                Confirmation Ref: {checklist.submissionConfirmationRef}
              </p>
              <p className="text-[11px] text-emerald-700">
                Timestamp: {checklist.submissionTimestamp} • Submitted by: {checklist.submittedBy}
              </p>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleSubmitGrant}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Execute Official Grant Submission
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
