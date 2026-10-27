/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Truthful Program Impact Measurement
 * M25.11: Impact Indicators, Verified Telemetry, Reporting & Zero-Synthetic Data Certification
 */

import React, { useState, useEffect } from 'react';
import { ProgramImpactMetrics } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
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
      {/* TRUTHFUL IMPACT DISCLOSURE BANNER */}
      <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-sm border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-teal-800 text-teal-200 px-2.5 py-0.5 rounded-full border border-teal-700 uppercase">
              M25.11 · VERIFIED IMPACT LEDGER
            </span>
            <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Data Classification: {metrics.dataClassification}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Community Program Impact Measurement</h2>
          <p className="text-teal-100/90 text-xs max-w-2xl mt-1 leading-relaxed">
            {metrics.truthfulnessStatement}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenAiAssist()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Impact Narrative</span>
          </button>
        </div>
      </div>

      {/* CORE VERIFIED METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Programs</span>
            <FileCheck2 className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-3xl font-bold font-serif text-slate-900">{metrics.activeProgramsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Of {metrics.totalProgramsCount} total approved programs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Volunteer Hours</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-700">{metrics.verifiedVolunteerHoursTotal} hrs</div>
          <div className="text-[10px] text-amber-700 mt-1 font-medium">
            {metrics.pendingVolunteerHoursTotal} hrs pending supervisor review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Services</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold font-serif text-slate-900">
            {metrics.completedGeneralServiceRequests} / {metrics.generalServiceRequestsTotal}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pantry hampers & tutoring inquiries</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Authorized Referrals</span>
            <HeartHandshake className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold font-serif text-purple-800">{metrics.verifiedReferralsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Coordinated with civic healthcare partners</div>
        </div>
      </div>

      {/* DETAILED VERIFICATION COMPARISON AUDIT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Truthful Telemetry Breakdown</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Strict segregation of verified community achievements from unverified public registrations.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{metrics.reportingPeriod}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* LEFT: COMMUNITY EVENTS VERIFICATION */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-800" />
              <span>Community Events Attendance Audit</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">Unverified Public Registrations:</span>
                <span className="font-mono font-bold text-slate-800">{metrics.unverifiedEventRegistrationsTotal} RSVPS</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-950 font-bold">Verified On-Site Attendees:</span>
                <span className="font-mono font-bold text-emerald-800">{metrics.verifiedEventAttendanceTotal} Attended</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              In accordance with Phumulani's Truthful Reporting Directive, pre-event RSVPs are never reported as realized community impact until confirmed by check-in attendants.
            </p>
          </div>

          {/* RIGHT: VOLUNTEER HOURS AUDIT */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-800" />
              <span>Volunteer Contribution Audit</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-950 font-bold">Supervisor-Certified Service:</span>
                <span className="font-mono font-bold text-emerald-800">{metrics.verifiedVolunteerHoursTotal} hrs</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-600">Pending Supervisor Sign-Off:</span>
                <span className="font-mono font-bold text-amber-700">{metrics.pendingVolunteerHoursTotal} hrs</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Self-reported hours remain strictly quarantined until Sister Miriam K. or designated staff supervisors verify attendance rosters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
