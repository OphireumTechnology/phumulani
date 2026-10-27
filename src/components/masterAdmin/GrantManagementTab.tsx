/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Grant Management Operations (M24.10)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { EnterpriseGrantRecord, EnterpriseGrantPipelineStage } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  FileText,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Building,
  FileCheck,
} from 'lucide-react';

interface GrantManagementTabProps {
  currentUser: User;
}

export const GrantManagementTab: React.FC<GrantManagementTabProps> = ({ currentUser }) => {
  const [grants, setGrants] = useState<EnterpriseGrantRecord[]>(masterAdminService.getGrants());
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const reloadGrants = () => {
    setGrants(masterAdminService.getGrants());
  };

  const handleAdvanceStage = (grantId: string, newStage: EnterpriseGrantPipelineStage) => {
    const res = masterAdminService.advanceGrantStage(
      grantId,
      newStage,
      currentUser.role,
      currentUser.name
    );

    if (res.success) {
      setActionNotice({ type: 'success', message: `Grant pipeline stage advanced to ${newStage}.` });
      reloadGrants();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to advance grant stage.' });
    }
  };

  const filteredGrants = grants.filter((g) => {
    if (stageFilter === 'all') return true;
    return g.pipelineStage === stageFilter;
  });

  const totalPipelineUSD = grants.reduce((sum, g) => sum + g.fundingAmountRequested, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-slate-900">Institutional Grant Management Operations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional RFP tracking, submission checklists, AI research synthesis, and executive approval gates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Active Pipeline Value</div>
            <div className="text-base font-bold">${totalPipelineUSD.toLocaleString()}</div>
          </div>
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

      {/* Grant Cards List */}
      <div className="space-y-4">
        {filteredGrants.map((grant) => (
          <div key={grant.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                    {grant.id}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{grant.funderOrganization}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      grant.pipelineStage === 'AWARDED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : grant.pipelineStage === 'EXECUTIVE_APPROVAL'
                        ? 'bg-purple-100 text-purple-800'
                        : grant.pipelineStage === 'SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {grant.pipelineStage.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{grant.opportunityTitle}</h3>
              </div>

              <div className="text-right">
                <div className="text-base font-bold text-slate-900">
                  ${grant.fundingAmountRequested.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-slate-400" /> Deadline: {grant.applicationDeadline}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500">Program Target:</span>{' '}
                  <strong className="text-slate-800">{grant.programTarget}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Proposal Owner:</span>{' '}
                  <strong className="text-slate-800">{grant.proposalOwner}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Eligibility Notes:</span>{' '}
                  <span className="text-slate-700">{grant.eligibilityNotes}</span>
                </div>
                {grant.aiResearchAssistanceSummary && (
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 text-[11px] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>{grant.aiResearchAssistanceSummary}</span>
                  </div>
                )}
              </div>

              {/* Submission Checklist */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Submission Readiness Checklist
                </div>
                {grant.submissionChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-[11px]">
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className={item.isCompleted ? 'text-slate-800' : 'text-slate-400'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Advancement Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Executive Sign-off:</span>
                <span className={grant.executiveApproved ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {grant.executiveApproved ? 'Approved by Comfort Dondo' : 'Awaiting Approval'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {grant.pipelineStage === 'RESEARCH' && (
                  <button
                    onClick={() => handleAdvanceStage(grant.id, 'PROPOSAL_DRAFT')}
                    className="px-3 py-1.5 bg-teal-800 text-white rounded font-medium hover:bg-teal-900"
                  >
                    Advance to Proposal Draft
                  </button>
                )}
                {grant.pipelineStage === 'EXECUTIVE_APPROVAL' && (
                  <button
                    onClick={() => handleAdvanceStage(grant.id, 'SUBMISSION_READY')}
                    className="px-3 py-1.5 bg-purple-800 text-white rounded font-medium hover:bg-purple-900"
                  >
                    Grant Executive Approval
                  </button>
                )}
                {grant.pipelineStage === 'SUBMISSION_READY' && (
                  <button
                    onClick={() => handleAdvanceStage(grant.id, 'SUBMITTED')}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded font-medium hover:bg-blue-800"
                  >
                    Confirm Submission to Funder
                  </button>
                )}
                {grant.pipelineStage === 'SUBMITTED' && (
                  <button
                    onClick={() => handleAdvanceStage(grant.id, 'AWARDED')}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800"
                  >
                    Record Award Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
