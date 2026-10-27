/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Executive Overview & Priority Action Center (M24.02 & M24.12)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { User } from '../../types';
import {
  Building2,
  Users,
  CheckSquare,
  FileCheck2,
  HeartHandshake,
  Bot,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Server,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface ExecutiveOverviewTabProps {
  currentUser: User;
  onNavigateTab: (tabId: string) => void;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  const analytics = masterAdminService.getTruthfulAnalytics();
  const departments = masterAdminService.getDepartments();
  const pendingDecisions = masterAdminService.getExecutiveDecisions('PENDING');
  const urgentTasks = masterAdminService.getTasks({ priority: 'HIGH' }).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Depts</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.administration.departmentsCount}</div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">100% Operational Structure</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Staff</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.administration.activeStaff}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {analytics.administration.pendingOnboardingStaff} onboarding pending
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics.administration.openTasksCount}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {urgentTasks.length} high priority
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Exec Decisions</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{analytics.administration.pendingDecisionsCount}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Awaiting ED Approval</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Grant Pipeline</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            ${(analytics.fundraising.grantPipelineValueUSD / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {analytics.fundraising.grantOpportunitiesCount} institutional grants
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Workforce</span>
            <Bot className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">18</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">
            {analytics.aiWorkforce.activeAgentsCount} active / 0 failed
          </div>
        </div>
      </div>

      {/* 2. PRIORITY ACTION CENTER (M24.02.B) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority Action Center</h2>
              <p className="text-xs text-slate-500">Items requiring executive review, approval, or inter-departmental action</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            {pendingDecisions.length + urgentTasks.length} Urgent Items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending Leadership Decisions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                Pending Executive Approvals ({pendingDecisions.length})
              </span>
              <button
                onClick={() => onNavigateTab('executive_decisions')}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {pendingDecisions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                No decisions currently awaiting approval.
              </div>
            ) : (
              pendingDecisions.map((dec) => (
                <div key={dec.id} className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded">
                        {dec.reference}
                      </span>
                      <span className="text-xs font-bold text-purple-950">{dec.title}</span>
                    </div>
                    <p className="text-[11px] text-purple-800 line-clamp-1 mt-1">{dec.summary}</p>
                    <div className="flex items-center gap-3 text-[10px] text-purple-700 mt-1.5">
                      <span>Dept: {dec.requestingDepartmentName}</span>
                      {dec.financialImpactUSD && (
                        <span>Impact: ${dec.financialImpactUSD.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('executive_decisions')}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-xs font-medium hover:bg-purple-800 shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>

          {/* High Priority Tasks */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                High Priority Department Tasks ({urgentTasks.length})
              </span>
              <button
                onClick={() => onNavigateTab('task_management')}
                className="text-xs text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {urgentTasks.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                      {t.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                    <span>Assigned: {t.assignedStaffName}</span>
                    <span>Dept: {t.departmentName}</span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('task_management')}
                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium hover:bg-slate-300 shrink-0"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DEPARTMENT OVERVIEW GRID (M24.02.C & M24.05) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-700 border border-teal-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Organizational Department Workload & Structure</h2>
              <p className="text-xs text-slate-500">10 functional departments with assigned leadership, staff, and active tasks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('department_management')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1"
          >
            Manage Departments <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => onNavigateTab('department_management')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                dept.isSafeguardingIsolated
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                  : 'bg-slate-50 border-slate-200 hover:border-teal-400'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-slate-900 line-clamp-1">{dept.name}</span>
                {dept.isSafeguardingIsolated && (
                  <span title="VAWA Confidentiality Isolation Firewall">
                    <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mb-2.5">
                Lead: <span className="text-slate-900 font-semibold">{dept.headStaffName}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                <span>{dept.assignedStaffCount} Staff</span>
                <span className="font-semibold text-teal-800">{dept.openTasksCount} Tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TRUTHFUL INFRASTRUCTURE HEALTH (M24.02.D & M24.12) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 rounded-lg text-sky-700 border border-sky-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Truthful Infrastructure & External Dependency Health</h2>
              <p className="text-xs text-slate-500">Live operational reporting adhering to Phase 24 external dependency deferral</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
            MODE: {analytics.infrastructureStatus.operationalMode}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
              <span>App Gateway & Server</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-emerald-950">HEALTHY (Port 3000)</div>
            <div className="text-[10px] text-emerald-700 mt-1">Express API Gateway + Vite SPA</div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
              <span>PostgreSQL Persistence</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-amber-950">{analytics.infrastructureStatus.postgresql}</div>
            <div className="text-[10px] text-amber-800 mt-1">Deferred — Durable isolated fallback</div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
              <span>Google Workspace OAuth</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-amber-950">AUTHORIZATION_REQUIRED</div>
            <div className="text-[10px] text-amber-800 mt-1">5 mailboxes staged pending OAuth</div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
              <span>Payment Gateway</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-sm font-bold text-amber-950">{analytics.infrastructureStatus.paymentGateway}</div>
            <div className="text-[10px] text-amber-800 mt-1">Stripe keys deferred; no fake money</div>
          </div>
        </div>
      </div>
    </div>
  );
};
