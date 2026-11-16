/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.06 Advanced Fundraising & Donor Intelligence Tab
 */

import React from 'react';
import { DollarSign, TrendingUp, Users, Award, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const FundraisingIntelligenceTab: React.FC<Props> = ({ currentUser }) => {
  const profiles = phase34Service.getDonorEngagementProfiles();
  const forecasts = phase34Service.getCampaignForecastingScenarios();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
              M34.06
            </span>
            <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
              Advanced Fundraising & Donor Intelligence
            </h2>
          </div>
          <p className="text-sm text-phumulani-charcoal max-w-2xl">
            Donor engagement scoring, verified giving segmentation, uncertainty intervals, and human stewardship recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-phumulani-earth" />
          <span>Zero Soft-Pledge Commingling Enforced</span>
        </div>
      </div>

      {/* Campaign Forecast Scenarios */}
      <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-4">
        <h3 className="font-bold font-serif text-phumulani-charcoal text-base">Campaign Forecasting with Uncertainty Intervals</h3>
        {forecasts.map((f) => (
          <div key={f.campaignId} className="p-4 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                  {f.campaignId}
                </span>
                <h4 className="font-bold text-phumulani-charcoal text-base mt-1">{f.campaignTitle}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-phumulani-charcoal">Settled Cash:</span>
                <div className="text-lg font-bold font-serif text-phumulani-earth">
                  ${f.settledRevenueDollars.toLocaleString()} <span className="text-xs text-phumulani-charcoal font-normal">/ ${f.targetGoalDollars.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Projection Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white border border-phumulani-cream rounded-lg">
                <span className="text-[10px] uppercase font-bold text-phumulani-charcoal">Conservative (-{f.uncertaintyBandPercent}%)</span>
                <div className="text-base font-bold text-phumulani-charcoal">${f.forecastConservative.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white border border-phumulani-teal rounded-lg ring-1 ring-phumulani-earth">
                <span className="text-[10px] uppercase font-bold text-phumulani-earth">Expected Forecast</span>
                <div className="text-base font-bold text-phumulani-earth">${f.forecastExpected.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white border border-phumulani-cream rounded-lg">
                <span className="text-[10px] uppercase font-bold text-phumulani-charcoal">Optimistic (+{f.uncertaintyBandPercent}%)</span>
                <div className="text-base font-bold text-phumulani-charcoal">${f.forecastOptimistic.toLocaleString()}</div>
              </div>
            </div>

            {/* Transparent Assumptions */}
            <div className="pt-2 text-xs text-phumulani-charcoal">
              <span className="font-bold text-phumulani-charcoal">Model Assumptions:</span>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                {f.assumptions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Donor Segmentation & Stewardship Table */}
      <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-phumulani-cream bg-phumulani-cream flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-phumulani-charcoal">
            Verified Donor Profiles & Stewardship Recommendations
          </h3>
          <span className="text-xs text-phumulani-charcoal">
            Based strictly on settled contributions
          </span>
        </div>

        <div className="divide-y divide-phumulani-cream">
          {profiles.map((p) => (
            <div key={p.donorId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-phumulani-charcoal text-sm">{p.donorName}</h4>
                  <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded border border-phumulani-gold">
                    {p.givingTier}
                  </span>
                  <span className="text-xs text-phumulani-earth font-semibold bg-phumulani-cream px-2 py-0.5 rounded">
                    Score: {p.engagementScore}/100
                  </span>
                </div>
                <p className="text-xs text-phumulani-charcoal">
                  Lifetime Settled Giving: <strong className="text-phumulani-charcoal">${p.totalVerifiedLifetimeGiving.toLocaleString()}</strong> ({p.verifiedGiftsCount} gifts) • Cadence: {p.givingFrequency}
                </p>
                <p className="text-xs text-phumulani-charcoal font-medium bg-phumulani-cream p-2 rounded mt-1">
                  <strong>Recommended Action:</strong> {p.recommendedStewardshipAction} (Due: {p.stewardshipActionDueDate})
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-phumulani-charcoal block">Next Ask Target</span>
                <span className="text-base font-bold text-phumulani-charcoal font-serif">${p.nextTargetAskAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
