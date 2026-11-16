/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Fundraising Pipelines & Campaigns (M26.11, M26.12)
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import { PipelineDeal, FundraisingCampaignRecord, PipelineStage } from '../../../types/fundingCommand';

interface FundraisingPipelinesTabProps {
  currentUser: any;
}

export const FundraisingPipelinesTab: React.FC<FundraisingPipelinesTabProps> = ({ currentUser }) => {
  const fundingService = FundingCommandService.getInstance();
  const [deals, setDeals] = useState<PipelineDeal[]>(fundingService.getPipelineDeals());
  const [campaigns, setCampaigns] = useState<FundraisingCampaignRecord[]>(fundingService.getCampaigns());
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'CAMPAIGNS'>('PIPELINE');

  const stages: { stage: PipelineStage; label: string; prob: string }[] = [
    { stage: 'PROSPECTING', label: '1. Prospecting', prob: '10%' },
    { stage: 'QUALIFICATION', label: '2. Qualification', prob: '25%' },
    { stage: 'CULTIVATION', label: '3. Cultivation', prob: '50%' },
    { stage: 'SOLICITATION', label: '4. Solicitation', prob: '75%' },
    { stage: 'NEGOTIATION', label: '5. Negotiation', prob: '90%' },
    { stage: 'STEWARDSHIP', label: '6. Stewardship', prob: '100%' },
  ];

  const handleAdvanceStage = (dealId: string, newStage: PipelineStage) => {
    try {
      const updated = fundingService.updatePipelineDealStage(dealId, newStage, currentUser);
      setDeals(fundingService.getPipelineDeals());
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalWeightedForecast = deals.reduce((sum, d) => sum + d.weightedForecastValue, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-phumulani-cream rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
              M26.11 Pipelines
            </span>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
              M26.12 Campaigns
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-phumulani-charcoal tracking-tight">
            Fundraising Pipeline & Campaign Management
          </h2>
          <p className="text-xs text-phumulani-charcoal mt-0.5">
            Probability-weighted donor pipelines, major gift tracking, and multi-channel campaign ROI monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-xl text-xs">
            <span className="text-phumulani-earth font-medium">Weighted Forecast:</span>
            <p className="text-lg font-bold font-mono text-phumulani-earth mt-0.5">
              ${totalWeightedForecast.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex border-b border-phumulani-cream gap-2">
        <button
          onClick={() => setActiveTab('PIPELINE')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'PIPELINE'
              ? 'border-phumulani-earth text-phumulani-earth'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          Probability Pipeline Deals ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab('CAMPAIGNS')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'CAMPAIGNS'
              ? 'border-phumulani-earth text-phumulani-earth'
              : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
          }`}
        >
          Active Campaigns & ROI ({campaigns.length})
        </button>
      </div>

      {/* PIPELINE VIEW */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white border border-phumulani-cream rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                      {deal.id}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                      {deal.stage} ({deal.probabilityPercentage}%)
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-phumulani-charcoal">
                    {deal.dealTitle}
                  </h3>
                  <p className="text-xs text-phumulani-earth font-medium flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {deal.donorName}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-phumulani-cream rounded-lg mt-3 text-xs">
                    <div>
                      <span className="text-[11px] text-phumulani-charcoal">Target Amount:</span>
                      <p className="font-bold font-mono text-phumulani-charcoal">
                        ${deal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-phumulani-charcoal">Weighted Forecast:</span>
                      <p className="font-bold font-mono text-phumulani-earth">
                        ${deal.weightedForecastValue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-phumulani-charcoal mt-2">
                    <strong>Next Step:</strong> {deal.nextStewardshipStep}
                  </p>
                </div>

                <div className="pt-2 border-t border-phumulani-cream flex items-center justify-between">
                  <span className="text-[11px] text-phumulani-charcoal">
                    Close: {deal.expectedCloseDate}
                  </span>
                  <div className="flex items-center gap-1">
                    {deal.stage !== 'STEWARDSHIP' && deal.stage !== 'WON' && (
                      <button
                        onClick={() => {
                          const nextIdx = stages.findIndex((s) => s.stage === deal.stage) + 1;
                          if (nextIdx < stages.length) {
                            handleAdvanceStage(deal.id, stages[nextIdx].stage);
                          }
                        }}
                        className="text-xs font-semibold text-phumulani-earth hover:text-phumulani-earth bg-phumulani-cream px-2.5 py-1 rounded cursor-pointer"
                      >
                        Advance Stage →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CAMPAIGNS VIEW */}
      {activeTab === 'CAMPAIGNS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.receivedAmount / camp.targetGoal) * 100));
            return (
              <div
                key={camp.id}
                className="bg-white border border-phumulani-cream rounded-xl p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">
                      {camp.campaignCode} • {camp.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-phumulani-charcoal mt-1">
                      {camp.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                    {camp.status}
                  </span>
                </div>

                <p className="text-xs text-phumulani-charcoal">
                  {camp.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-phumulani-charcoal">
                      Raised: ${camp.receivedAmount.toLocaleString()} ({percent}%)
                    </span>
                    <span className="text-phumulani-charcoal font-bold">
                      Goal: ${camp.targetGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-phumulani-cream rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-phumulani-earth h-2.5 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-phumulani-cream rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-phumulani-charcoal text-[10px]">PLEDGED</span>
                    <p className="font-bold text-phumulani-charcoal">${camp.pledgedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-phumulani-charcoal text-[10px]">RECONCILED</span>
                    <p className="font-bold text-phumulani-earth">${camp.reconciledAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-phumulani-charcoal text-[10px]">ROI RATIO</span>
                    <p className="font-bold text-phumulani-charcoal">{camp.roiRatio}x</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-phumulani-charcoal pt-1">
                  <span>Channels:</span>
                  {camp.channels.map((ch) => (
                    <span key={ch} className="bg-phumulani-cream px-2 py-0.5 rounded font-mono text-[10px]">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
