/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Partnership Management (M24.11)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { EnterprisePartnershipRecord, PartnershipWorkflowStage } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  Building,
  Handshake,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';

interface PartnershipManagementTabProps {
  currentUser: User;
}

export const PartnershipManagementTab: React.FC<PartnershipManagementTabProps> = ({ currentUser }) => {
  const [partnerships, setPartnerships] = useState<EnterprisePartnershipRecord[]>(
    masterAdminService.getPartnerships()
  );
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const reloadPartnerships = () => {
    setPartnerships(masterAdminService.getPartnerships());
  };

  const handleAdvanceStage = (
    partnershipId: string,
    newStage: PartnershipWorkflowStage,
    agreementStatus?: 'NONE' | 'DRAFTING' | 'UNDER_REVIEW' | 'SIGNED' | 'RENEWAL_DUE'
  ) => {
    const res = masterAdminService.advancePartnershipStage(
      partnershipId,
      newStage,
      currentUser.role,
      currentUser.name,
      { agreementStatus }
    );

    if (res.success) {
      setActionNotice({ type: 'success', message: `Partnership stage updated to ${newStage}.` });
      reloadPartnerships();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to advance partnership stage.' });
    }
  };

  const filteredPartnerships = partnerships.filter((p) => {
    if (stageFilter === 'all') return true;
    return p.workflowStage === stageFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-indigo-800" />
            <h2 className="text-lg font-bold text-slate-900">Corporate & Community Partnerships</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Corporate CSR initiatives, foundation alliances, institutional MOUs, and verified sponsor contributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-full">
            {partnerships.filter((p) => p.workflowStage === 'ACTIVE_PARTNERSHIP').length} Active Alliances
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

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPartnerships.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                    {p.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{p.organizationName}</h3>
                  <div className="text-[11px] text-slate-500">{p.category.replace('_', ' ')}</div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.workflowStage === 'ACTIVE_PARTNERSHIP'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.workflowStage === 'NEGOTIATION'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.workflowStage.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3">{p.notes}</p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-800">{p.contactPerson} ({p.contactEmail})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relationship Owner:</span>
                  <span className="font-semibold text-slate-800">{p.relationshipOwner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Agreement Status:</span>
                  <span className="font-bold text-indigo-800">{p.agreementStatus}</span>
                </div>
                {p.estimatedContributionUSD > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimated Contribution:</span>
                    <span className="font-bold text-slate-900">${p.estimatedContributionUSD.toLocaleString()}</span>
                  </div>
                )}
                {p.verifiedContributionReceivedUSD > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Verified Received:</span>
                    <span className="font-bold text-emerald-700">${p.verifiedContributionReceivedUSD.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Renewal: {p.renewalDate || 'Ongoing'}</span>
              <div className="flex items-center gap-1.5">
                {p.workflowStage === 'ENGAGEMENT' && (
                  <button
                    onClick={() => handleAdvanceStage(p.id, 'PROPOSAL_REVIEW', 'DRAFTING')}
                    className="px-2.5 py-1 bg-teal-800 text-white rounded font-medium hover:bg-teal-900"
                  >
                    Submit Proposal
                  </button>
                )}
                {p.workflowStage === 'NEGOTIATION' && (
                  <button
                    onClick={() => handleAdvanceStage(p.id, 'ACTIVE_PARTNERSHIP', 'SIGNED')}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded font-medium hover:bg-emerald-800"
                  >
                    Execute Signed MOU
                  </button>
                )}
                {p.workflowStage === 'ACTIVE_PARTNERSHIP' && (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Alliance
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
