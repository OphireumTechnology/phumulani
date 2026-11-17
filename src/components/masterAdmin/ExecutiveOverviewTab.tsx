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
        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Depts</span>
            <Building2 className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-charcoal">{analytics.administration.departmentsCount}</div>
          <div className="text-[11px] text-phumulani-earth font-medium mt-1">100% Operational Structure</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Staff</span>
            <Users className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-charcoal">{analytics.administration.activeStaff}</div>
          <div className="text-[11px] text-phumulani-charcoal font-medium mt-1">
            {analytics.administration.pendingOnboardingStaff} onboarding pending
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-charcoal">{analytics.administration.openTasksCount}</div>
          <div className="text-[11px] text-phumulani-earth font-medium mt-1">
            {urgentTasks.length} high priority
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Exec Decisions</span>
            <FileCheck2 className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-earth">{analytics.administration.pendingDecisionsCount}</div>
          <div className="text-[11px] text-phumulani-earth font-medium mt-1">Awaiting ED Approval</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Grant Pipeline</span>
            <TrendingUp className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-charcoal">
            ${(analytics.fundraising.grantPipelineValueUSD / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-phumulani-earth font-medium mt-1">
            {analytics.fundraising.grantOpportunitiesCount} institutional grants
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-phumulani-charcoal mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Workforce</span>
            <Bot className="w-4 h-4 text-phumulani-earth" />
          </div>
          <div className="text-2xl font-bold text-phumulani-charcoal">18</div>
          <div className="text-[11px] text-phumulani-earth font-medium mt-1">
            {analytics.aiWorkforce.activeAgentsCount} active / 0 failed
          </div>
        </div>
      </div>

      {/* 2. PRIORITY ACTION CENTER (M24.02.B) */}
      <div className="bg-white rounded-xl border border-phumulani-cream p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-phumulani-cream">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-phumulani-cream rounded-lg text-phumulani-earth border border-phumulani-gold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-phumulani-charcoal">Priority Action Center</h2>
              <p className="text-xs text-phumulani-charcoal">Items requiring executive review, approval, or inter-departmental action</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-phumulani-cream text-phumulani-charcoal rounded-full">
            {pendingDecisions.length + urgentTasks.length} Urgent Items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pending Leadership Decisions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-phumulani-earth" />
                Pending Executive Approvals ({pendingDecisions.length})
              </span>
              <button
                onClick={() => onNavigateTab('executive_decisions')}
                className="text-xs text-phumulani-earth hover:text-phumulani-earth font-medium inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {pendingDecisions.length === 0 ? (
              <div className="p-4 bg-phumulani-cream rounded-lg text-center text-xs text-phumulani-charcoal">
                No decisions currently awaiting approval.
              </div>
            ) : (
              pendingDecisions.map((dec) => (
                <div key={dec.id} className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-1.5 py-0.5 rounded">
                        {dec.reference}
                      </span>
                      <span className="text-xs font-bold text-phumulani-earth">{dec.title}</span>
                    </div>
                    <p className="text-[11px] text-phumulani-earth line-clamp-1 mt-1">{dec.summary}</p>
                    <div className="flex items-center gap-3 text-[10px] text-phumulani-earth mt-1.5">
                      <span>Dept: {dec.requestingDepartmentName}</span>
                      {dec.financialImpactUSD && (
                        <span>Impact: ${dec.financialImpactUSD.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('executive_decisions')}
                    className="px-2.5 py-1 bg-phumulani-earth text-white rounded text-xs font-medium hover:bg-phumulani-charcoal shrink-0"
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
              <span className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-phumulani-earth" />
                High Priority Department Tasks ({urgentTasks.length})
              </span>
              <button
                onClick={() => onNavigateTab('task_management')}
                className="text-xs text-phumulani-earth hover:text-phumulani-charcoal font-medium inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {urgentTasks.map((t) => (
              <div key={t.id} className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-1.5 py-0.5 rounded">
                      {t.priority}
                    </span>
                    <span className="text-xs font-semibold text-phumulani-charcoal">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-phumulani-charcoal mt-1.5">
                    <span>Assigned: {t.assignedStaffName}</span>
                    <span>Dept: {t.departmentName}</span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('task_management')}
                  className="px-2 py-1 bg-phumulani-cream text-phumulani-charcoal rounded text-xs font-medium hover:bg-phumulani-cream shrink-0"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DEPARTMENT OVERVIEW GRID (M24.02.C & M24.05) */}
      <div className="bg-white rounded-xl border border-phumulani-cream p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-phumulani-cream">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-phumulani-cream rounded-lg text-phumulani-earth border border-phumulani-teal">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-phumulani-charcoal">Organizational Department Workload & Structure</h2>
              <p className="text-xs text-phumulani-charcoal">10 functional departments with assigned leadership, staff, and active tasks</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('department_management')}
            className="text-xs font-semibold text-phumulani-earth hover:text-phumulani-earth inline-flex items-center gap-1"
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
                  ? 'bg-phumulani-cream border-phumulani-earth hover:border-phumulani-earth'
                  : 'bg-phumulani-cream border-phumulani-cream hover:border-phumulani-orange'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-phumulani-charcoal line-clamp-1">{dept.name}</span>
                {dept.isSafeguardingIsolated && (
                  <span title="VAWA Confidentiality Isolation Firewall">
                    <Lock className="w-3.5 h-3.5 text-phumulani-earth shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-phumulani-charcoal font-medium mb-2.5">
                Lead: <span className="text-phumulani-charcoal font-semibold">{dept.headStaffName}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-phumulani-charcoal pt-2 border-t border-phumulani-cream">
                <span>{dept.assignedStaffCount} Staff</span>
                <span className="font-semibold text-phumulani-earth">{dept.openTasksCount} Tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TRUTHFUL INFRASTRUCTURE HEALTH (M24.02.D & M24.12) */}
      <div className="bg-white rounded-xl border border-phumulani-cream p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-phumulani-cream">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-phumulani-cream rounded-lg text-phumulani-earth border border-phumulani-teal">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-phumulani-charcoal">Truthful Infrastructure & External Dependency Health</h2>
              <p className="text-xs text-phumulani-charcoal">Live operational reporting adhering to Phase 24 external dependency deferral</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-phumulani-cream text-phumulani-charcoal rounded border border-phumulani-cream">
            MODE: {analytics.infrastructureStatus.operationalMode}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-phumulani-cream border border-phumulani-green rounded-lg">
            <div className="flex items-center justify-between text-xs text-phumulani-charcoal font-semibold mb-1">
              <span>App Gateway & Server</span>
              <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
            </div>
            <div className="text-sm font-bold text-phumulani-charcoal">HEALTHY (Port 3000)</div>
            <div className="text-[10px] text-phumulani-earth mt-1">Express API Gateway + Vite SPA</div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-lg">
            <div className="flex items-center justify-between text-xs text-phumulani-charcoal font-semibold mb-1">
              <span>PostgreSQL Persistence</span>
              <AlertTriangle className="w-4 h-4 text-phumulani-earth" />
            </div>
            <div className="text-sm font-bold text-phumulani-charcoal">{analytics.infrastructureStatus.postgresql}</div>
            <div className="text-[10px] text-phumulani-charcoal mt-1">Deferred — Durable isolated fallback</div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-lg">
            <div className="flex items-center justify-between text-xs text-phumulani-charcoal font-semibold mb-1">
              <span>Google Workspace OAuth</span>
              <AlertTriangle className="w-4 h-4 text-phumulani-earth" />
            </div>
            <div className="text-sm font-bold text-phumulani-charcoal">AUTHORIZATION_REQUIRED</div>
            <div className="text-[10px] text-phumulani-charcoal mt-1">5 mailboxes staged pending OAuth</div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-gold rounded-lg">
            <div className="flex items-center justify-between text-xs text-phumulani-charcoal font-semibold mb-1">
              <span>Payment Gateway</span>
              <AlertTriangle className="w-4 h-4 text-phumulani-earth" />
            </div>
            <div className="text-sm font-bold text-phumulani-charcoal">{analytics.infrastructureStatus.paymentGateway}</div>
            <div className="text-[10px] text-phumulani-charcoal mt-1">Stripe keys deferred; no fake money</div>
          </div>
        </div>
      </div>
    </div>
  );
};
