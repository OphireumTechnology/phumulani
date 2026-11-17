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
      <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-phumulani-earth" />
            <h2 className="text-lg font-bold text-phumulani-charcoal">Corporate & Community Partnerships</h2>
          </div>
          <p className="text-xs text-phumulani-charcoal mt-1">
            Corporate CSR initiatives, foundation alliances, institutional MOUs, and verified sponsor contributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-phumulani-cream text-phumulani-earth border border-phumulani-teal rounded-full">
            {partnerships.filter((p) => p.workflowStage === 'ACTIVE_PARTNERSHIP').length} Active Alliances
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

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPartnerships.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                    {p.id}
                  </span>
                  <h3 className="text-sm font-bold text-phumulani-charcoal mt-1">{p.organizationName}</h3>
                  <div className="text-[11px] text-phumulani-charcoal">{p.category.replace('_', ' ')}</div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    p.workflowStage === 'ACTIVE_PARTNERSHIP'
                      ? 'bg-phumulani-cream text-phumulani-charcoal'
                      : p.workflowStage === 'NEGOTIATION'
                      ? 'bg-phumulani-cream text-phumulani-earth'
                      : 'bg-phumulani-cream text-phumulani-charcoal'
                  }`}
                >
                  {p.workflowStage.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-phumulani-charcoal mb-3">{p.notes}</p>

              <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-phumulani-charcoal">Contact:</span>
                  <span className="font-semibold text-phumulani-charcoal">{p.contactPerson} ({p.contactEmail})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-phumulani-charcoal">Relationship Owner:</span>
                  <span className="font-semibold text-phumulani-charcoal">{p.relationshipOwner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-phumulani-charcoal">Agreement Status:</span>
                  <span className="font-bold text-phumulani-earth">{p.agreementStatus}</span>
                </div>
                {p.estimatedContributionUSD > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-phumulani-charcoal">Estimated Contribution:</span>
                    <span className="font-bold text-phumulani-charcoal">${p.estimatedContributionUSD.toLocaleString()}</span>
                  </div>
                )}
                {p.verifiedContributionReceivedUSD > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-phumulani-charcoal">Verified Received:</span>
                    <span className="font-bold text-phumulani-earth">${p.verifiedContributionReceivedUSD.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Actions */}
            <div className="pt-3 border-t border-phumulani-cream flex items-center justify-between text-xs">
              <span className="text-[11px] text-phumulani-charcoal">Renewal: {p.renewalDate || 'Ongoing'}</span>
              <div className="flex items-center gap-1.5">
                {p.workflowStage === 'ENGAGEMENT' && (
                  <button
                    onClick={() => handleAdvanceStage(p.id, 'PROPOSAL_REVIEW', 'DRAFTING')}
                    className="px-2.5 py-1 bg-phumulani-charcoal text-white rounded font-medium hover:bg-phumulani-earth"
                  >
                    Submit Proposal
                  </button>
                )}
                {p.workflowStage === 'NEGOTIATION' && (
                  <button
                    onClick={() => handleAdvanceStage(p.id, 'ACTIVE_PARTNERSHIP', 'SIGNED')}
                    className="px-2.5 py-1 bg-phumulani-earth text-white rounded font-medium hover:bg-phumulani-charcoal"
                  >
                    Execute Signed MOU
                  </button>
                )}
                {p.workflowStage === 'ACTIVE_PARTNERSHIP' && (
                  <span className="text-[11px] font-semibold text-phumulani-earth flex items-center gap-1">
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
