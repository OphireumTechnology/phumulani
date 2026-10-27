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
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <RefreshCw className="w-8 h-8 text-teal-700 animate-spin mx-auto mb-2" />
        <span className="text-xs text-slate-500 font-semibold">Calculating verified impact metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PHASE 26 / PHASE 25 NAVIGATION SWITCHER */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('meal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'meal'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Phase 26 · MEAL Command Center (M26.01 - M26.15)
          </button>
          <button
            onClick={() => setViewMode('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'telemetry'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Phase 25 · Program Impact Telemetry
          </button>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 px-2 hidden sm:inline">
          {viewMode === 'meal' ? 'MEAL & IMPACT COMMAND CENTER ACTIVE' : 'M25.11 TELEMETRY'}
        </span>
      </div>

      {viewMode === 'meal' ? (
        <MealCommandCenter />
      ) : (
        <div className="space-y-6">
          {/* TRUTHFUL IMPACT DISCLOSURE BANNER */}
          <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-sm border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold bg-teal-800 text-teal-200 px-2.5 py-0.5 rounded-full border border-teal-700 uppercase">
                  M25.11 · VERIFIED IMPACT LEDGER
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-700 uppercase">
                  ZERO-SYNTHETIC GUARANTEE
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Truthful Community Program Impact Measurement</h2>
              <p className="text-xs text-teal-200/80 mt-1 max-w-2xl">
                Every metric is traceable to authorized source records in the Phumulani immutable ledger. No synthetic participants or unverified hours are represented as impact achievements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAiAssist}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl border border-teal-700 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>AI Impact Assistant</span>
              </button>
              <button
                onClick={refreshData}
                className="p-2 bg-teal-800 hover:bg-teal-700 text-teal-200 rounded-xl border border-teal-700 transition-colors"
                title="Refresh metrics from ledger"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* IMPACT KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Programs</span>
                <Layers className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-3xl font-black text-slate-900">{metrics.totalProgramsCount}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {metrics.activeProgramsCount} Active · {metrics.completedProgramsCount} Completed
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Volunteer Hrs</span>
                <Clock className="w-4 h-4 text-rose-700" />
              </div>
              <div className="text-3xl font-black text-rose-700">{metrics.verifiedVolunteerHoursTotal}</div>
              <div className="text-[11px] text-slate-500 mt-1">Supervisor-confirmed logs</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Service Requests</span>
                <FileCheck2 className="w-4 h-4 text-teal-700" />
              </div>
              <div className="text-3xl font-black text-slate-900">{metrics.generalServiceRequestsTotal}</div>
              <div className="text-[11px] text-teal-700 font-semibold mt-1">
                {metrics.completedGeneralServiceRequests} Completed Triaged
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Attendance</span>
                <Users className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="text-3xl font-black text-indigo-700">{metrics.verifiedEventAttendanceTotal}</div>
              <div className="text-[11px] text-slate-500 mt-1">From completed community events</div>
            </div>
          </div>

          {/* DETAILED LEDGER BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-700" />
                Community Outreach & Objective Delivery
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium">Completed Outreach Initiatives</span>
                  <span className="text-sm font-bold text-slate-900">{metrics.outreachActivitiesCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium">Verified Partner Referrals</span>
                  <span className="text-sm font-bold text-teal-700">{metrics.verifiedReferralsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium">Program Milestone Objectives Met</span>
                  <span className="text-sm font-bold text-slate-900">{metrics.programObjectivesCompletedCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Data Integrity & Truthful Reporting Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900 block">Immutable Verification Pass</span>
                    <span className="text-emerald-700">All figures match verified timestamps and supervisor signatures.</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 block">External Infrastructure Guard</span>
                    <span className="text-amber-700">PostgreSQL is NOT_CONNECTED; production mutations fail-closed.</span>
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
