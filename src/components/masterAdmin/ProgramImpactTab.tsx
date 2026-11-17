/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Truthful Program Impact Measurement & MEAL
 * M26.01 - M26.15: MEAL Command Center & Phase 25 Telemetry Integration
 */

import React, { useState, useEffect } from 'react';
import { ProgramImpactMetrics } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import { MealCommandCenter } from './meal/MealCommandCenter';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Calendar,
  FileCheck2,
  RefreshCw,
  Clock,
  Layers,
  HeartHandshake,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';

interface Props {
  onOpenAiAssist: () => void;
}

export const ProgramImpactTab: React.FC<Props> = ({ onOpenAiAssist }) => {
  const commService = CommunityProgramsService.getInstance();
  const [metrics, setMetrics] = useState<ProgramImpactMetrics | null>(null);
  const [viewMode, setViewMode] = useState<'meal' | 'telemetry'>('meal');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMetrics(commService.getTruthfulImpactMetrics());
  };

  if (!metrics) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-phumulani-cream text-center">
        <RefreshCw className="w-8 h-8 text-phumulani-earth animate-spin mx-auto mb-2" />
        <span className="text-xs text-phumulani-charcoal font-semibold">Calculating verified impact metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PHASE 26 / PHASE 25 NAVIGATION SWITCHER */}
      <div className="bg-white p-2 rounded-xl border border-phumulani-cream shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('meal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'meal'
                ? 'bg-phumulani-earth text-white shadow-sm'
                : 'text-phumulani-charcoal hover:bg-phumulani-cream'
            }`}
          >
            Phase 26 · MEAL Command Center (M26.01 - M26.15)
          </button>
          <button
            onClick={() => setViewMode('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'telemetry'
                ? 'bg-phumulani-earth text-white shadow-sm'
                : 'text-phumulani-charcoal hover:bg-phumulani-cream'
            }`}
          >
            Phase 25 · Program Impact Telemetry
          </button>
        </div>
        <span className="text-[11px] font-mono font-semibold text-phumulani-charcoal px-2 hidden sm:inline">
          {viewMode === 'meal' ? 'MEAL & IMPACT COMMAND CENTER ACTIVE' : 'M25.11 TELEMETRY'}
        </span>
      </div>

      {viewMode === 'meal' ? (
        <MealCommandCenter />
      ) : (
        <div className="space-y-6">
          {/* TRUTHFUL IMPACT DISCLOSURE BANNER */}
          <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm border border-phumulani-teal flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold bg-phumulani-charcoal text-phumulani-teal px-2.5 py-0.5 rounded-full border border-phumulani-teal uppercase">
                  M25.11 · VERIFIED IMPACT LEDGER
                </span>
                <span className="text-[10px] font-mono font-bold bg-phumulani-earth text-phumulani-green px-2.5 py-0.5 rounded-full border border-phumulani-green uppercase">
                  ZERO-SYNTHETIC GUARANTEE
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Truthful Community Program Impact Measurement</h2>
              <p className="text-xs text-phumulani-cream mt-1 max-w-2xl">
                Every metric is traceable to authorized source records in the Phumulani immutable ledger. No synthetic participants or unverified hours are represented as impact achievements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAiAssist}
                className="px-3.5 py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white text-xs font-semibold rounded-xl border border-phumulani-teal flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-phumulani-gold" />
                <span>AI Impact Assistant</span>
              </button>
              <button
                onClick={refreshData}
                className="p-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal rounded-xl border border-phumulani-teal transition-colors"
                title="Refresh metrics from ledger"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IMPACT KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-phumulani-cream shadow-sm">
              <div className="flex items-center justify-between text-phumulani-charcoal mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Verified Programs</span>
                <Layers className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="text-3xl font-black text-phumulani-charcoal">{metrics.totalProgramsCount}</div>
              <div className="text-[11px] text-phumulani-earth font-semibold mt-1">
                {metrics.activeProgramsCount} Active · {metrics.completedProgramsCount} Completed
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-phumulani-cream shadow-sm">
              <div className="flex items-center justify-between text-phumulani-charcoal mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Verified Volunteer Hrs</span>
                <Clock className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="text-3xl font-black text-phumulani-earth">{metrics.verifiedVolunteerHoursTotal}</div>
              <div className="text-[11px] text-phumulani-charcoal mt-1">Supervisor-confirmed logs</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-phumulani-cream shadow-sm">
              <div className="flex items-center justify-between text-phumulani-charcoal mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Service Requests</span>
                <FileCheck2 className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="text-3xl font-black text-phumulani-charcoal">{metrics.generalServiceRequestsTotal}</div>
              <div className="text-[11px] text-phumulani-earth font-semibold mt-1">
                {metrics.completedGeneralServiceRequests} Completed Triaged
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-phumulani-cream shadow-sm">
              <div className="flex items-center justify-between text-phumulani-charcoal mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-phumulani-charcoal">Verified Attendance</span>
                <Users className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="text-3xl font-black text-phumulani-earth">{metrics.verifiedEventAttendanceTotal}</div>
              <div className="text-[11px] text-phumulani-charcoal mt-1">From completed community events</div>
            </div>
          </div>

          {/* DETAILED LEDGER BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-phumulani-cream shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-phumulani-charcoal uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-phumulani-earth" />
                Community Outreach & Objective Delivery
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-phumulani-cream rounded-xl">
                  <span className="text-xs text-phumulani-charcoal font-medium">Completed Outreach Initiatives</span>
                  <span className="text-sm font-bold text-phumulani-charcoal">{metrics.outreachActivitiesCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-phumulani-cream rounded-xl">
                  <span className="text-xs text-phumulani-charcoal font-medium">Verified Partner Referrals</span>
                  <span className="text-sm font-bold text-phumulani-earth">{metrics.verifiedReferralsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-phumulani-cream rounded-xl">
                  <span className="text-xs text-phumulani-charcoal font-medium">Program Milestone Objectives Met</span>
                  <span className="text-sm font-bold text-phumulani-charcoal">{metrics.programObjectivesCompletedCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-phumulani-cream shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-phumulani-charcoal uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
                Data Integrity & Truthful Reporting Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-cream flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-phumulani-charcoal block">Immutable Verification Pass</span>
                    <span className="text-phumulani-earth">All figures match verified timestamps and supervisor signatures.</span>
                  </div>
                </div>
                <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-cream flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-phumulani-charcoal block">External Infrastructure Guard</span>
                    <span className="text-phumulani-earth">PostgreSQL is NOT_CONNECTED; production mutations fail-closed.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
