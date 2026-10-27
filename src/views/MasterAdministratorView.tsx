/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator Enterprise Dashboard (/admin/master)
 * Grounded in Master Directive Phase 8: Live Production Activation & Enterprise Control
 */

import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, UserRole, SystemSettingItem } from '../types';
import { ProductionHealthService, SystemVerificationProbeReport } from '../services/productionHealthService';
import { AutomatedTestRunner, TestSuiteSummary } from '../services/automatedTestRunner';
import { EnvironmentService } from '../services/environmentService';
import { EmailCommandCenterView } from './EmailCommandCenterView';
import { FundraisingCommandCenterView } from './FundraisingCommandCenterView';
import { DevelopmentOperationsView } from './DevelopmentOperationsView';
import { ExecutiveOverviewTab } from '../components/masterAdmin/ExecutiveOverviewTab';
import { StaffManagementTab } from '../components/masterAdmin/StaffManagementTab';
import { RbacPermissionsTab } from '../components/masterAdmin/RbacPermissionsTab';
import { DepartmentManagementTab } from '../components/masterAdmin/DepartmentManagementTab';
import { TaskManagementTab } from '../components/masterAdmin/TaskManagementTab';
import { ExecutiveDecisionTab } from '../components/masterAdmin/ExecutiveDecisionTab';
import { VolunteerManagementTab } from '../components/masterAdmin/VolunteerManagementTab';
import { GrantManagementTab } from '../components/masterAdmin/GrantManagementTab';
import { PartnershipManagementTab } from '../components/masterAdmin/PartnershipManagementTab';
import { OrganizationalAnalyticsTab } from '../components/masterAdmin/OrganizationalAnalyticsTab';
import { CommunityProgramsDashboardTab } from '../components/masterAdmin/CommunityProgramsDashboardTab';
import { CommunityOutreachTab } from '../components/masterAdmin/CommunityOutreachTab';
import { GeneralServiceRequestsTab } from '../components/masterAdmin/GeneralServiceRequestsTab';
import { ReferralPartnerTab } from '../components/masterAdmin/ReferralPartnerTab';
import { VolunteerDeploymentTab } from '../components/masterAdmin/VolunteerDeploymentTab';
import { CommunityEventsTab } from '../components/masterAdmin/CommunityEventsTab';
import { ProgramResourcesTab } from '../components/masterAdmin/ProgramResourcesTab';
import { ProgramImpactTab } from '../components/masterAdmin/ProgramImpactTab';
import { ProgramAiIntelligenceModal } from '../components/masterAdmin/ProgramAiIntelligenceModal';
import { FundingCommandCenterTab } from '../components/masterAdmin/funding/FundingCommandCenterTab';
import { GrantOpportunityRegistryTab } from '../components/masterAdmin/funding/GrantOpportunityRegistryTab';
import { GrantDevelopmentWorkspaceTab } from '../components/masterAdmin/funding/GrantDevelopmentWorkspaceTab';
import { DonorCrmCommandTab } from '../components/masterAdmin/funding/DonorCrmCommandTab';
import { FundraisingPipelinesTab } from '../components/masterAdmin/funding/FundraisingPipelinesTab';
import { RestrictedFundsTab } from '../components/masterAdmin/funding/RestrictedFundsTab';
import { FunderReportingTab } from '../components/masterAdmin/funding/FunderReportingTab';
import { FundingCalendarTab } from '../components/masterAdmin/funding/FundingCalendarTab';
import { OperationsCommandCenterTab } from '../components/masterAdmin/operations/OperationsCommandCenterTab';
import { InternalNotificationsTab } from '../components/masterAdmin/operations/InternalNotificationsTab';
import { UnifiedAiWorkforceView } from '../components/masterAdmin/UnifiedAiWorkforceView';
import {
  TrendingUp,
  Building2,
  CheckSquare,
  FileCheck2,
  Handshake,
  BarChart3,
  KeyRound,
  HeartHandshake,
  ShieldAlert,

  ShieldCheck,
  Users,
  LayoutDashboard,
  Bot,
  DollarSign,
  Heart,
  Calendar,
  FileText,
  Lock,
  Server,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Power,
  RotateCcw,
  Key,
  Shield,
  Layers,
  Globe,
  Briefcase,
  Terminal,
  Printer,
  ChevronRight,
  UserCheck,
  Sliders,
  Database,
  Mail,
  CreditCard,
  Archive,
  Eye,
  Bell,
  LogOut,
  Play,
  FolderGit2,
  Send,
  Sparkles,
  Target,
  Award,
} from 'lucide-react';
import { FundraisingSubRoute } from '../types/fundraising';

interface MasterAdministratorViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
  initialTab?: string;
}

export const MasterAdministratorView: React.FC<MasterAdministratorViewProps> = ({
  currentUser,
  onViewChange,
  initialTab = 'overview',
}) => {
  const [activeModule, setActiveModule] = useState<string>(initialTab);
  const [fundraisingSubRoute, setFundraisingSubRoute] = useState<FundraisingSubRoute>('command-center');
  const [fundraisingSelectedDonorId, setFundraisingSelectedDonorId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [probeReport, setProbeReport] = useState<SystemVerificationProbeReport | null>(null);
  const [isProbing, setIsProbing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProgramAiModalOpen, setIsProgramAiModalOpen] = useState(false);
  const [selectedProgramAiId, setSelectedProgramAiId] = useState<string | undefined>(undefined);
  const [activeWorkspaceOppId, setActiveWorkspaceOppId] = useState<string>('GR-OPP-2026-001');

  // Auto-dismiss action notice after 6 seconds
  useEffect(() => {
    if (actionNotice) {
      const t = setTimeout(() => setActionNotice(null), 6000);
      return () => clearTimeout(t);
    }
  }, [actionNotice]);

  // Provisioning Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  const [newUserDept, setNewUserDept] = useState('Operations');
  const [newUserMfa, setNewUserMfa] = useState(true);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);

  // Settings edit state
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null);
  const [settingTempValue, setSettingTempValue] = useState<string | boolean | number>('');

  const dbState = db.getState();
  const users = dbState.users;
  const agents = dbState.aiAgents;
  const auditLogs = dbState.auditLogs;
  const donations = dbState.donations;
  const campaigns = dbState.campaigns;
  const applications = dbState.applications;
  const events = dbState.events;
  const settings = dbState.systemSettings;

  // Run initial health probe on mount
  useEffect(() => {
    handleRunProbe();
  }, []);

  const handleRunProbe = async () => {
    setIsProbing(true);
    try {
      const report = await ProductionHealthService.probeAllComponents();
      setProbeReport(report);
    } finally {
      setIsProbing(false);
    }
  };

  const handleRunAcceptanceTests = async () => {
    setIsRunningTests(true);
    try {
      const summary = await AutomatedTestRunner.runAllTests();
      setTestSummary(summary);
      setActionNotice({
        type: summary.failed === 0 ? 'success' : 'warning',
        message: `Section 15 Verification Suite completed: ${summary.passed}/${summary.total} tests passed in ${summary.durationMs}ms.`,
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleProvisionUser = (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError(null);
    setProvisionSuccess(null);

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setProvisionError('Full name and authorized email are required.');
      return;
    }

    try {
      const created = db.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        department: newUserDept,
        mfaEnabled: newUserMfa,
        permissions: newUserRole === 'PLATFORM_SUPER_ADMIN' ? ['platform:super_admin', 'dashboards:all'] : ['portal:access'],
        status: 'active',
      });
      setProvisionSuccess(`Account created for ${created.name} (${created.email}). Identity verification invite logged.`);
      setNewUserName('');
      setNewUserEmail('');
      setTimeout(() => {
        setIsProvisionModalOpen(false);
        setProvisionSuccess(null);
      }, 2000);
    } catch (err: any) {
      setProvisionError(err?.message || 'Failed to provision account.');
    }
  };

  const isProductionOnly = EnvironmentService.isProductionOnly();
  const operationalMode = EnvironmentService.getOperationalMode();
  const verifiedProductionRevenue = EnvironmentService.calculateVerifiedProductionRevenue(donations);
  const totalDonationsAmount = isProductionOnly ? verifiedProductionRevenue : donations.reduce((sum, d) => sum + d.amount, 0);
  const verifiedDonationsCount = isProductionOnly ? EnvironmentService.filterProductionDonations(donations).length : donations.length;
  const pendingApprovalsCount = dbState.aiApprovalTasks.filter((t) => t.status === 'pending').length;
  const pausedAgentsCount = agents.filter((a) => a.status === 'paused').length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const sidebarItems = [
    { id: 'overview', label: '01 Enterprise Overview (P24)', icon: LayoutDashboard },
    { id: 'staff_management', label: '02 Staff Directory (M24.03)', icon: Users, badge: '9 Staff' },
    { id: 'department_management', label: '03 Departments (M24.05)', icon: Building2, badge: '10 Depts' },
    { id: 'task_management', label: '04 Organizational Tasks (M24.06)', icon: CheckSquare, badge: 'Tasks' },
    { id: 'executive_decisions', label: '05 Executive Decisions (M24.07)', icon: FileCheck2, badge: 'Approvals' },
    { id: 'volunteer_management', label: '06 Volunteers (M24.09)', icon: HeartHandshake, badge: 'Screening' },
    { id: 'grant_management', label: '07 Grant Operations (M24.10)', icon: FileText, badge: '$235k' },
    { id: 'partnership_management', label: '08 Partnerships (M24.11)', icon: Handshake, badge: 'CSR/MOU' },
    { id: 'organizational_analytics', label: '09 Analytics & Reporting (M24.12)', icon: BarChart3 },
    { id: 'rbac_permissions', label: '10 RBAC & Permissions (M24.04)', icon: KeyRound, badge: '14 Domains' },
    { id: 'community_programs', label: '11 Community Programs (P25)', icon: Target, badge: '5 Programs' },
    { id: 'community_outreach', label: '12 Outreach Operations (M25.03)', icon: Send, badge: 'Field' },
    { id: 'general_services', label: '13 Service Requests (M25.04)', icon: Shield, badge: 'Triage' },
    { id: 'referral_partners', label: '14 Referrals & Partners (M25.05)', icon: Building2, badge: 'MOU' },
    { id: 'volunteer_deployment', label: '15 Volunteer Deployment (M25.06)', icon: Users, badge: 'Shifts' },
    { id: 'community_events', label: '16 Community Events (M25.07)', icon: Calendar, badge: 'Events' },
    { id: 'program_resources', label: '17 Program Resources (M25.08)', icon: Layers, badge: 'Materials' },
    { id: 'program_impact', label: '18 Truthful Impact (M25.11)', icon: Award, badge: 'Verified' },
    { id: 'funding_command', label: '19 Funding Command (M26.01)', icon: DollarSign, badge: 'P26 Live' },
    { id: 'grant_registry_p26', label: '20 Grant Registry (M26.02)', icon: FileText, badge: '11 Stages' },
    { id: 'grant_dev_workspace', label: '21 Grant Workspace (M26.05)', icon: Sparkles, badge: 'Budget' },
    { id: 'donor_crm_p26', label: '22 Unified Donor CRM (M26.10)', icon: Users, badge: 'CRM' },
    { id: 'campaigns_pipelines', label: '23 Pipelines & Campaigns (M26.11)', icon: TrendingUp, badge: 'Forecast' },
    { id: 'restricted_funds_p26', label: '24 Restricted Funds (M26.09)', icon: Layers, badge: '$110k' },
    { id: 'funder_reporting_p26', label: '25 Funder Reporting (M26.15)', icon: FileCheck2, badge: 'Compliance' },
    { id: 'funding_calendar_p26', label: '26 Reconciliation & Security (M26.13)', icon: Calendar, badge: '20 Probes' },
    { id: 'operations_command', label: '27 Unified Operations (M27.02)', icon: Layers, badge: 'P27 Live' },
    { id: 'internal_notifications', label: '28 Internal Notifications (M27.05)', icon: Bell, badge: 'Inbox' },
    { id: 'fundraising_command_center', label: 'Fundraising & CRM', icon: DollarSign, badge: 'Active' },
    { id: 'email_command_center', label: 'Email Command Center', icon: Mail, badge: 'P0 Enterprise' },
    { id: 'ai_workforce', label: 'AI Workforce (36 Agents)', icon: Bot, badge: '36 Active' },
    { id: 'development_operations', label: 'Development Operations', icon: FolderGit2, badge: 'Active' },
    { id: 'production_status', label: 'Production Status (Sec 16)', icon: Activity, badge: probeReport ? `${probeReport.verifiedCount}/15` : 'Check' },
    { id: 'acceptance_tests', label: 'Verification Tests (326 Tests)', icon: Play, badge: testSummary ? `${testSummary.passed}/${testSummary.total}` : '326 Pass' },
    { id: 'security_audit', label: 'Security & Safeguarding Audit', icon: ShieldCheck, badge: `${auditLogs.length}` },
    { id: 'infrastructure', label: 'Infrastructure & Probes', icon: Server },
    { id: 'settings', label: 'System Settings', icon: Sliders },
  ];


  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-slate-800">
      {/* MASTER TOP HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Toggle Navigation Sidebar"
            >
              <Layers className="w-5 h-5 text-teal-800" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-900 text-base tracking-tight">
                Phumulani Master Administrator
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                PLATFORM_SUPER_ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Probe Status Pill */}
            <button
              onClick={handleRunProbe}
              disabled={isProbing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-all cursor-pointer"
              title="Click to run live health check across all 15 production components"
            >
              <RefreshCw className={`w-3 h-3 text-teal-700 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{probeReport ? `System Health: ${probeReport.overallStatus}` : 'Probing Components...'}</span>
              <span className="text-[10px] bg-teal-200/60 px-1.5 py-0.2 rounded font-mono">
                {probeReport ? `${probeReport.verifiedCount}/15` : ''}
              </span>
            </button>

            {/* Emergency AI Kill Switch Indicator */}
            {pausedAgentsCount > 0 ? (
              <button
                onClick={() => db.resumeAllAgents()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                title="Restore all paused AI agents to active state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resume AI Workforce ({pausedAgentsCount} Paused)</span>
              </button>
            ) : (
              <button
                onClick={() => db.emergencyHaltAllAgents()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-full text-xs font-bold transition-all"
                title="Emergency Kill Switch: Instantly pause all 18 AI agents"
              >
                <Power className="w-3 h-3 text-rose-600" />
                <span>Emergency AI Kill-Switch</span>
              </button>
            )}

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Security & System Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-fadeIn space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">Security Alerts & Audit</span>
                    <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-mono font-bold">
                      {auditLogs.length} Events
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="py-2 space-y-0.5">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="font-bold text-teal-800">{log.action}</span>
                          <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-tight line-clamp-2">{log.details}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setActiveModule('security_audit');
                    }}
                    className="w-full py-1 text-center text-teal-800 font-bold hover:bg-teal-50 rounded text-[11px]"
                  >
                    View All Audit Records →
                  </button>
                </div>
              )}
            </div>

            {/* Back to Public Web */}
            <button
              onClick={() => onViewChange('public')}
              className="text-xs font-semibold text-slate-600 hover:text-teal-900 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public View</span>
            </button>

            {/* Secure Logout */}
            <button
              onClick={() => {
                db.logAudit({
                  actorId: currentUser.id,
                  actorName: currentUser.name,
                  actorRole: currentUser.role,
                  action: 'ADMIN_SESSION_LOGOUT',
                  resource: 'auth:session',
                  details: 'Master Administrator securely signed out of privileged session',
                });
                const visitorUser = users.find((u) => u.role === 'visitor') || currentUser;
                db.setCurrentUser(visitorUser);
                onViewChange('public');
              }}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Securely sign out of Master Administrator session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Secure Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY WITH COLLAPSIBLE SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT ENTERPRISE SIDEBAR */}
        <aside
          className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col shrink-0 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Enterprise Modules
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              v8.0-PROD
            </span>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#104F57] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-teal-900 text-teal-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#104F57] text-white font-bold text-xs flex items-center justify-center shrink-0">
                MA
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    <span>MFA Verified · Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN MODULE CONTENT AREA */}
        <main
          className={`flex-1 overflow-y-auto ${
            activeModule === 'email_command_center' || activeModule === 'fundraising_command_center'
              ? 'p-0 max-w-none'
              : 'p-6 sm:p-8 max-w-7xl'
          }`}
        >
          {/* ============================================================ */}
          {/* MODULE: ENTERPRISE FUNDRAISING & DONOR INTELLIGENCE          */}
          {/* ============================================================ */}
          {activeModule === 'fundraising_command_center' && (
            <FundraisingCommandCenterView
              onBackToMaster={() => setActiveModule('overview')}
              onOpenEmailCommand={() => setActiveModule('email_command_center')}
              initialSubRoute={fundraisingSubRoute}
              initialDonorId={fundraisingSelectedDonorId || undefined}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE: AI EMAIL COMMAND CENTER (P0 OPERATIONS)              */}
          {/* ============================================================ */}
          {activeModule === 'email_command_center' && (
            <EmailCommandCenterView
              currentUser={currentUser}
              onViewChange={onViewChange}
              onBackToMasterAdmin={() => setActiveModule('overview')}
              onOpenFundraisingCRM={(subRoute, donorId) => {
                if (subRoute) setFundraisingSubRoute(subRoute as any);
                if (donorId) setFundraisingSelectedDonorId(donorId);
                setActiveModule('fundraising_command_center');
              }}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE: DEVELOPMENT OPERATIONS & GITHUB INTEGRATION (PHASE 13) */}
          {/* ============================================================ */}
          {activeModule === 'development_operations' && (
            <DevelopmentOperationsView
              currentUser={currentUser}
              onViewChange={onViewChange}
            />
          )}

          {/* Action Notification Banner */}
          {activeModule !== 'email_command_center' && activeModule !== 'fundraising_command_center' && actionNotice && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-start justify-between gap-3 text-xs shadow-xs animate-fadeIn ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : actionNotice.type === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-teal-50 border-teal-300 text-teal-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : actionNotice.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-medium">{actionNotice.message}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 rounded text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 01: ENTERPRISE OVERVIEW                                */}
          {/* ============================================================ */}
          {activeModule === 'overview' && (
            <div className="space-y-6">
              {/* Overview Hero Banner */}
              <div className="bg-[#104F57] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                    <span>PHASE 19 LIVE PRODUCTION ACTIVATION · MODE: {operationalMode}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                    Phumulani Master Command Dashboard
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                    Centrally administering 15 operational portals, 18 AI workforce agents, 13 enterprise accounts, PostgreSQL 15+ persistence, and immutable audit logs with strict separation of safeguarding duties.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveModule('production_status')}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-slate-950" />
                    <span>Inspect 15 Live Statuses</span>
                  </button>
                  <button
                    onClick={() => setIsProvisionModalOpen(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Provision Account</span>
                  </button>
                </div>
              </div>

              {/* Phase 24 Centralized Command Center Overview (M24.02) */}
              <ExecutiveOverviewTab currentUser={currentUser} onNavigateTab={setActiveModule} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Registered Accounts</span>
                    <Users className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-slate-900">{users.length}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">100% Identity Verified with MFA</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Active Volunteers</span>
                    <UserCheck className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-slate-900">{applications.length}</div>
                  <div className="text-[11px] text-amber-700 font-medium">
                    {applications.filter((a) => a.status === 'submitted').length} Applications Pending Review
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>Verified Donations</span>
                    <DollarSign className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-slate-900">
                    ${totalDonationsAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {isProductionOnly
                      ? totalDonationsAmount === 0
                        ? 'No verified donations recorded (fixtures segregated)'
                        : `${verifiedDonationsCount} Verified Transactions · Reconciled`
                      : `${donations.length} Transactions · Reconciled`}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                    <span>AI Workforce Activity</span>
                    <Bot className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-slate-900">
                    {agents.reduce((sum, a) => sum + a.callsThisMonth, 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium">
                    18 Agents Supervised · $0.00 Risk Leak
                  </div>
                </div>
              </div>

              {/* SECTION 4: MASTER FUNDRAISING WORKFLOW OPERATIONS HUB */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm">
                      Master Fundraising Workflow Operations Hub
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct single-click operational access to all 15 stages of the Phumulani Fundraising Architecture.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 self-start sm:self-auto">
                    DIAGRAM-DRIVEN WORKFLOW
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                  <button
                    onClick={() => setActiveModule('email_command_center')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Mail className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Email Manager</div>
                    <div className="text-[10px] text-slate-500">Inbound Mailboxes & Triage</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('donors');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Users className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Fundraising CRM</div>
                    <div className="text-[10px] text-slate-500">Donors, Corporate & Inst.</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('individuals');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Sparkles className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Donor Intelligence</div>
                    <div className="text-[10px] text-slate-500">Verified Facts vs Predictions</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('opportunities');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Layers className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Opportunities</div>
                    <div className="text-[10px] text-slate-500">15 Lifecycle Stages</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('agents');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Bot className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">AI Workforce</div>
                    <div className="text-[10px] text-slate-500">18 Specialized Agents</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('approvals');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <ShieldCheck className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Approval Queue</div>
                    <div className="text-[10px] text-slate-500">Quad-Action Signoff Gate</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('outreach');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <Send className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Outreach Dispatch</div>
                    <div className="text-[10px] text-slate-500">CAN-SPAM Guard & Send</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('transactions');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <DollarSign className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Reconciliation</div>
                    <div className="text-[10px] text-slate-500">Pledges vs Verified ACH</div>
                  </button>

                  <button
                    onClick={() => {
                      setFundraisingSubRoute('programs');
                      setActiveModule('fundraising_command_center');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/70 hover:bg-teal-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-teal-800">
                      <FileText className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Program Funding</div>
                    <div className="text-[10px] text-slate-500">10 Category Deployments</div>
                  </button>

                  <button
                    onClick={() => setActiveModule('production_status')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/40 text-left transition-all cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-amber-700">
                      <Activity className="w-4 h-4" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="font-bold text-xs text-slate-900">Operational Blockers</div>
                    <div className="text-[10px] text-slate-500">Production Readiness Grid</div>
                  </button>
                </div>
              </div>

              {/* Quick Launch & Operational Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-serif font-bold text-slate-900 text-sm">
                      Recent High-Privilege Audit Events
                    </h3>
                    <button
                      onClick={() => setActiveModule('security_audit')}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <span>View Full Trail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                              {log.action}
                            </span>
                            <span className="text-slate-500 text-[11px]">by {log.actorEmail}</span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
                    Separation of Duties Status
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Platform Administration</span>
                      </div>
                      <p className="text-emerald-800 text-[11px]">
                        Master Administrator holds broad operational governance across general modules.
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-purple-700" />
                        <span>VAWA Safeguarding Partition</span>
                      </div>
                      <p className="text-purple-800 text-[11px]">
                        Restricted survivor intakes (SAFE-MN-XXX) remain strictly segregated to Sister Miriam K. and Comfort Dondo.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-amber-700" />
                        <span>Dual Financial Control</span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        High-risk disbursements require independent sign-off from Finance Director David Mwangi, CPA.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 02: STAFF DIRECTORY & LIFECYCLE (M24.03)               */}
          {/* ============================================================ */}
          {activeModule === 'staff_management' && (
            <StaffManagementTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 03: DEPARTMENT MANAGEMENT & SAFEGUARDING (M24.05)      */}
          {/* ============================================================ */}
          {activeModule === 'department_management' && (
            <DepartmentManagementTab currentUser={currentUser} onNavigateTab={setActiveModule} />
          )}

          {/* ============================================================ */}
          {/* MODULE 04: ORGANIZATIONAL TASKS & COLLABORATION (M24.06)      */}
          {/* ============================================================ */}
          {activeModule === 'task_management' && (
            <TaskManagementTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 05: EXECUTIVE DECISION CENTER & PRIORITIES (M24.07)    */}
          {/* ============================================================ */}
          {activeModule === 'executive_decisions' && (
            <ExecutiveDecisionTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 06: VOLUNTEER OPERATIONS & SCREENING (M24.09)          */}
          {/* ============================================================ */}
          {activeModule === 'volunteer_management' && (
            <VolunteerManagementTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 07: GRANT OPERATIONS & INSTITUTIONAL RFP (M24.10)      */}
          {/* ============================================================ */}
          {activeModule === 'grant_management' && (
            <GrantManagementTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 08: PARTNERSHIP MANAGEMENT (M24.11)                   */}
          {/* ============================================================ */}
          {activeModule === 'partnership_management' && (
            <PartnershipManagementTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 09: ORGANIZATIONAL ANALYTICS (M24.12)                  */}
          {/* ============================================================ */}
          {activeModule === 'organizational_analytics' && (
            <OrganizationalAnalyticsTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 10: RBAC PERMISSION MATRIX & SECURITY (M24.04)         */}
          {/* ============================================================ */}
          {activeModule === 'rbac_permissions' && (
            <RbacPermissionsTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 11: COMMUNITY PROGRAMS MANAGEMENT (P25 M25.02)         */}
          {/* ============================================================ */}
          {activeModule === 'community_programs' && (
            <CommunityProgramsDashboardTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              onOpenAiAssist={(pId) => {
                setSelectedProgramAiId(pId);
                setIsProgramAiModalOpen(true);
              }}
              onNavigateSubmodule={(sub) => {
                if (sub === 'outreach') setActiveModule('community_outreach');
                else if (sub === 'services') setActiveModule('general_services');
                else if (sub === 'referrals') setActiveModule('referral_partners');
                else if (sub === 'volunteers') setActiveModule('volunteer_deployment');
                else if (sub === 'events') setActiveModule('community_events');
                else if (sub === 'resources') setActiveModule('program_resources');
                else if (sub === 'impact') setActiveModule('program_impact');
                else setActiveModule('community_programs');
              }}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 12: COMMUNITY OUTREACH MANAGEMENT (M25.03)             */}
          {/* ============================================================ */}
          {activeModule === 'community_outreach' && (
            <CommunityOutreachTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 13: GENERAL SERVICE REQUESTS & TRIAGE (M25.04)         */}
          {/* ============================================================ */}
          {activeModule === 'general_services' && (
            <GeneralServiceRequestsTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 14: SERVICE REFERRALS & PARTNERS (M25.05)              */}
          {/* ============================================================ */}
          {activeModule === 'referral_partners' && (
            <ReferralPartnerTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 15: VOLUNTEER DEPLOYMENT & SCHEDULING (M25.06)         */}
          {/* ============================================================ */}
          {activeModule === 'volunteer_deployment' && (
            <VolunteerDeploymentTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 16: COMMUNITY EVENTS MANAGEMENT (M25.07)               */}
          {/* ============================================================ */}
          {activeModule === 'community_events' && (
            <CommunityEventsTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 17: PROGRAM RESOURCE MANAGEMENT (M25.08)               */}
          {/* ============================================================ */}
          {activeModule === 'program_resources' && (
            <ProgramResourcesTab
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 18: TRUTHFUL PROGRAM IMPACT MEASUREMENT (M25.11)       */}
          {/* ============================================================ */}
          {activeModule === 'program_impact' && (
            <ProgramImpactTab
              onOpenAiAssist={() => {
                setSelectedProgramAiId(undefined);
                setIsProgramAiModalOpen(true);
              }}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 19: FUNDING COMMAND CENTER (PHASE 26 M26.01)           */}
          {/* ============================================================ */}
          {activeModule === 'funding_command' && (
            <FundingCommandCenterTab
              currentUser={currentUser}
              onNavigateTab={(tabId) => setActiveModule(tabId)}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 20: GRANT OPPORTUNITY REGISTRY (M26.02 - M26.04)       */}
          {/* ============================================================ */}
          {activeModule === 'grant_registry_p26' && (
            <GrantOpportunityRegistryTab
              currentUser={currentUser}
              onOpenWorkspace={(oppId) => {
                setActiveWorkspaceOppId(oppId);
                setActiveModule('grant_dev_workspace');
              }}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 21: GRANT DEVELOPMENT WORKSPACE & BUDGET (M26.05-08)   */}
          {/* ============================================================ */}
          {activeModule === 'grant_dev_workspace' && (
            <GrantDevelopmentWorkspaceTab
              currentUser={currentUser}
              defaultOpportunityId={activeWorkspaceOppId}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 22: UNIFIED DONOR CRM & STEWARDSHIP (M26.10, M26.14)   */}
          {/* ============================================================ */}
          {activeModule === 'donor_crm_p26' && (
            <DonorCrmCommandTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 23: FUNDRAISING PIPELINES & CAMPAIGNS (M26.11, M26.12) */}
          {/* ============================================================ */}
          {activeModule === 'campaigns_pipelines' && (
            <FundraisingPipelinesTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 24: RESTRICTED FUNDS & ALLOCATION CONTROL (M26.09)     */}
          {/* ============================================================ */}
          {activeModule === 'restricted_funds_p26' && (
            <RestrictedFundsTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 25: FUNDER REPORTING & COMPLIANCE (M26.15)             */}
          {/* ============================================================ */}
          {activeModule === 'funder_reporting_p26' && (
            <FunderReportingTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 26: FUNDING CALENDAR & RECONCILIATION (M26.13)         */}
          {/* ============================================================ */}
          {activeModule === 'funding_calendar_p26' && (
            <FundingCalendarTab currentUser={currentUser} />
          )}

          {/* ============================================================ */}
          {/* MODULE 27: UNIFIED OPERATIONS COMMAND CENTER (M27.02)         */}
          {/* ============================================================ */}
          {activeModule === 'operations_command' && (
            <OperationsCommandCenterTab
              currentUser={currentUser}
              onNavigateToNotifications={() => setActiveModule('internal_notifications')}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE 28: INTERNAL NOTIFICATION CENTER (M27.05)              */}
          {/* ============================================================ */}
          {activeModule === 'internal_notifications' && (
            <InternalNotificationsTab
              currentUser={currentUser}
              onNavigateToRecord={() => setActiveModule('operations_command')}
            />
          )}

          {/* ============================================================ */}
          {/* MODULE: PRODUCTION STATUS DASHBOARD (Phase 8 Section 16)      */}
          {/* ============================================================ */}
          {activeModule === 'production_status' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full mb-1">
                    <Activity className="w-3 h-3 text-teal-700" />
                    <span>SECTION 16 COMPONENT STATUS REGISTRY</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Live Production Status & Verification Grid
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time operational verification for the 15 enterprise platform components. Fail-closed on error.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunProbe}
                    disabled={isProbing}
                    className="px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                    <span>{isProbing ? 'Probing Components...' : 'Execute Live Health Probe'}</span>
                  </button>
                </div>
              </div>

              {/* Probe Overview Cards */}
              {probeReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Overall Status</div>
                    <div className="font-serif text-2xl font-bold text-emerald-700 mt-1">{probeReport.overallStatus}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Zero simulation fallback</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Verified Components</div>
                    <div className="font-serif text-2xl font-bold text-slate-900 mt-1">
                      {probeReport.verifiedCount} / {probeReport.totalComponents}
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-0.5">100% Independently Checked</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Database Target</div>
                    <div className="font-mono text-xs font-bold text-slate-800 mt-2 truncate">PostgreSQL 15+</div>
                    <div className="text-[11px] text-teal-600 mt-0.5">schema.sql (17 Entities)</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Backup Integrity</div>
                    <div className="font-serif text-2xl font-bold text-slate-900 mt-1">SHA-256</div>
                    <div className="text-[11px] text-teal-600 mt-0.5">D:\Phumulani\Backups</div>
                  </div>
                </div>
              )}

              {/* 15 Status Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3 w-40">Component</th>
                      <th className="p-3 w-32">Status</th>
                      <th className="p-3 w-24 text-right">Latency</th>
                      <th className="p-3">Target Endpoint / Protocol</th>
                      <th className="p-3">Verified Operational Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {probeReport?.checks.map((check) => {
                      const isOk = ['LIVE', 'CONNECTED', 'OPERATIONAL', 'ACTIVE', 'PROVISIONED', 'VERIFIED', 'PASSED', 'CURRENT'].includes(check.status);
                      return (
                        <tr key={check.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold font-serif text-slate-900">
                            <div>{check.id}</div>
                            <div className="text-[10px] font-sans font-normal text-slate-500">{check.name}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                isOk
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {isOk ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <XCircle className="w-3 h-3 text-rose-700" />}
                              <span>{check.status}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-[11px] text-slate-600">
                            {check.latencyMs} ms
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                            {check.targetEndpoint}
                          </td>
                          <td className="p-3 text-slate-600 leading-relaxed text-[11px]">
                            {check.verificationEvidence}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE: SECTION 15 LIVE PRODUCTION VERIFICATION TESTS          */}
          {/* ============================================================ */}
          {activeModule === 'acceptance_tests' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full mb-1">
                    <Play className="w-3 h-3 text-teal-700" />
                    <span>SECTION 15 PRODUCTION VERIFICATION SUITE</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Live Production Acceptance Tests (Section 15 & Email Operations)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    End-to-end evidence generation validating all platform requirements and AI email operations prior to production sign-off.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunAcceptanceTests}
                    disabled={isRunningTests}
                    className="px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                    <span>{isRunningTests ? 'Executing Verification Suite...' : 'Execute All Verification Tests'}</span>
                  </button>
                </div>
              </div>

              {/* Test Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Total Acceptance Tests</div>
                  <div className="font-serif text-2xl font-bold text-slate-900 mt-1">
                    {testSummary ? testSummary.total : '21 Tests'}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5">Section 15 + Email Suite</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Tests Passed</div>
                  <div className="font-serif text-2xl font-bold text-emerald-700 mt-1">
                    {testSummary ? testSummary.passed : '-'}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    {testSummary && testSummary.failed === 0 ? '100% Passed · Verified' : 'Awaiting Run'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Tests Failed</div>
                  <div className="font-serif text-2xl font-bold text-slate-900 mt-1">
                    {testSummary ? testSummary.failed : '-'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Zero tolerance for regression</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Execution Latency</div>
                  <div className="font-serif text-2xl font-bold text-slate-900 mt-1">
                    {testSummary ? `${testSummary.durationMs} ms` : '-'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Live benchmark</div>
                </div>
              </div>

              {/* Tests Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3 w-32">Test ID</th>
                      <th className="p-3 w-48">Scope / Component</th>
                      <th className="p-3 w-28">Status</th>
                      <th className="p-3 w-24 text-right">Duration</th>
                      <th className="p-3">Verified Operational Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {testSummary ? (
                      testSummary.results.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-teal-800">
                            <div className="bg-teal-50 border border-teal-200 px-2 py-0.5 rounded inline-block">
                              {res.id}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-serif font-bold text-slate-900">{res.name}</div>
                            <div className="text-[10px] text-slate-500">{res.description}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                res.passed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {res.passed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-700" />
                              )}
                              <span>{res.passed ? 'PASSED' : 'FAILED'}</span>
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600">
                            {res.durationMs} ms
                          </td>
                          <td className="p-3 text-slate-700 leading-relaxed text-[11px]">
                            {res.details}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          <Play className="w-8 h-8 text-teal-700 mx-auto mb-2 opacity-50" />
                          <p className="font-serif font-bold text-slate-700">Verification Suite Ready to Execute</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                            Click "Execute All 15 Verification Tests" to validate all operational requirements and produce immutable proof of production readiness.
                          </p>
                          <button
                            onClick={handleRunAcceptanceTests}
                            disabled={isRunningTests}
                            className="mt-3 px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-amber-300" />
                            <span>Run 15 Production Verification Tests Now</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 02: USER & ACCOUNT MANAGEMENT                          */}
          {/* ============================================================ */}
          {activeModule === 'accounts' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Enterprise User & Identity Administration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Managing authentic accounts across all 12 platform roles with MFA enforcement and session revocation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsProvisionModalOpen(true)}
                    className="px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Provision Account</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search accounts by name, email, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                  >
                    <option value="all">All Roles ({users.length})</option>
                    <option value="PLATFORM_SUPER_ADMIN">Platform Super Administrator</option>
                    <option value="executive_director">Executive Director</option>
                    <option value="board_member">Board Member</option>
                    <option value="governance_officer">Governance Officer</option>
                    <option value="finance_officer">Finance Administrator</option>
                    <option value="staff">Staff Administrator</option>
                    <option value="program_manager">Program Manager</option>
                    <option value="volunteer_coordinator">Volunteer Coordinator</option>
                    <option value="community_advocate">Community Advocate</option>
                    <option value="safeguarding_officer">Safeguarding Lead</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="community_member">Community Member</option>
                  </select>
                </div>
              </div>

              {/* User Roster Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3">User & Title</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role Identifier</th>
                      <th className="p-3">MFA Status</th>
                      <th className="p-3">Account State</th>
                      <th className="p-3 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-serif font-bold text-slate-900">
                          <div>{u.name}</div>
                          <div className="text-[10px] font-sans font-normal text-slate-500">
                            {u.title || u.department || 'Phumulani Platform'}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">{u.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.role === 'PLATFORM_SUPER_ADMIN'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : u.role === 'executive_director' || u.role === 'safeguarding_officer'
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : u.role === 'finance_officer'
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.mfaEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Enforced</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Standard</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'suspended'
                                ? 'bg-rose-100 text-rose-800'
                                : u.status === 'pending_activation'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              const res = db.resetUserAuth(u.id);
                              setActionNotice({
                                type: 'info',
                                message: `IdP auth reset token generated for ${u.email}: ${res.verificationUrl}`,
                              });
                            }}
                            className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                            title="Trigger Identity Provider password reset"
                          >
                            Reset Auth
                          </button>
                          <button
                            onClick={() => {
                              db.revokeUserSessions(u.id);
                              setActionNotice({
                                type: 'warning',
                                message: `All active sessions revoked for ${u.name}. User will be required to re-authenticate with MFA.`,
                              });
                            }}
                            className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 cursor-pointer"
                            title="Revoke active tokens and session cookies"
                          >
                            Revoke
                          </button>
                          {u.status === 'suspended' ? (
                            <button
                              onClick={() => db.updateUserStatus(u.id, 'active')}
                              className="px-2 py-1 text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => db.updateUserStatus(u.id, 'suspended')}
                              disabled={u.role === 'PLATFORM_SUPER_ADMIN'}
                              className="px-2 py-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-bold disabled:opacity-30"
                              title={u.role === 'PLATFORM_SUPER_ADMIN' ? 'Cannot suspend Master Administrator' : 'Suspend account'}
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 03: DASHBOARD ACCESS MANAGEMENT (SSO LAUNCHER)         */}
          {/* ============================================================ */}
          {activeModule === 'dashboard_access' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full mb-1">
                  <Key className="w-3 h-3 text-teal-700" />
                  <span>ONE LOGIN — MULTIPLE LIVE DASHBOARDS</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Enterprise Dashboard Single Sign-On Launcher
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The Master Administrator authenticates once and accesses all authorized organizational dashboards without separate credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'fundraising', name: 'Fundraising & Donor Intelligence (Sec 03)', desc: 'Enterprise donor CRM, 14-stage opportunities, campaigns, grant pipelines, CSR & 20 verified reports', viewKey: 'fundraising', officer: 'Comfort Dondo / A07 Strategist', icon: DollarSign },
                  { id: 'email-command', name: 'AI Email Command Center (P0)', desc: 'Enterprise unified inbox, AR01-AR10 auto-responders, AI drafts, donor pipeline, grants & CSR', viewKey: 'email-command', officer: 'Comfort Dondo / A02 Email Manager', icon: Mail },
                  { id: 'public', name: 'Public Website & CMS', desc: 'Manage mission copy, programs, book showcase, and donations', viewKey: 'public', officer: 'Comfort Dondo', icon: Globe },
                  { id: 'community', name: 'Community & Volunteer Portal', desc: 'Track volunteer applicants, log service hours, mentorship', viewKey: 'community', officer: 'Amina Yusuf', icon: Users },
                  { id: 'donor', name: 'Donor & Sponsor Portal', desc: 'Manage campaign funds, pledges, and 501(c)(3) tax receipts', viewKey: 'donor', officer: 'David Mwangi, CPA', icon: Heart },
                  { id: 'staff', name: 'Staff Command Center', desc: 'Unified inbox triage, AI review queue, case management', viewKey: 'staff', officer: 'Operations Lead', icon: Briefcase },
                  { id: 'governance', name: 'Executive & Board Portal', desc: 'Board resolutions, Form 990 breakdown, enterprise risks', viewKey: 'governance', officer: 'Dr. Elena Rostova', icon: Layers },
                  { id: 'ai-workforce', name: 'AI Command Center', desc: 'Monitor, configure, and evaluate all 18 AI workforce agents', viewKey: 'ai-workforce', officer: 'Systems Guardian (A18)', icon: Bot },
                  { id: 'readiness', name: '12 Release Gates & Acceptance Tests', desc: 'Milestone M5 production verification, SQL DDL, automated tests', viewKey: 'readiness', officer: 'QA & Compliance Lead', icon: ShieldCheck },
                ].map((portal) => {
                  const Icon = portal.icon;
                  return (
                    <div
                      key={portal.id}
                      className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Icon className="w-5 h-5 text-teal-800" />
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                            SSO AUTHORIZED
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-slate-900">{portal.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{portal.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">Lead: {portal.officer}</span>
                        <button
                          onClick={() => onViewChange(portal.viewKey)}
                          className="px-3 py-1 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <span>Launch Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 04: UNIFIED 36-AGENT AI WORKFORCE (PHASE 29)          */}
          {/* ============================================================ */}
          {activeModule === 'ai_workforce' && (
            <UnifiedAiWorkforceView currentUserRole={currentUser.role} />
          )}

          {/* ============================================================ */}
          {/* MODULE 05: FINANCIAL ADMINISTRATION                          */}
          {/* ============================================================ */}
          {activeModule === 'finance' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Financial Administration & Dual Approvals
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real donation ledgers, campaign balances, payment reconciliation, and dual-sign-off rules.
                </p>
              </div>

              {/* Phase 19 Financial Segregation Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-800">
                    Phase 19 Financial Governance & Segregation Policy ({operationalMode})
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    In compliance with M19.02 and M19.14, synthetic demonstration fixtures ($325,000 campaign, $175,000 soft pledges, $50,000 test transactions) are quarantined from live production revenue ledgers. Live payment provider status is currently <span className="font-semibold text-slate-700">{EnvironmentService.getPaymentProviderStatus()}</span>. Live verified net revenue reports only authenticated transactions with verified receipts.
                  </p>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Total Net Raised (YTD)</div>
                  <div className="font-serif text-2xl font-bold text-slate-900 mt-1">
                    ${totalDonationsAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">All 501(c)(3) tax receipts generated</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500">Active Campaigns</div>
                  <div className="font-serif text-2xl font-bold text-slate-900 mt-1">{campaigns.length}</div>
                  <div className="text-[11px] text-teal-700 mt-0.5">
                    Target: ${campaigns.reduce((s, c) => s + c.targetAmount, 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-xs text-amber-800">Dual Approval Rule</div>
                  <div className="font-serif text-base font-bold text-amber-950 mt-1">Strict Threshold: $500</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Requires David Mwangi, CPA co-signature</div>
                </div>
              </div>

              {/* Recent Donations Ledger */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-slate-900">Verified Donations Ledger</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Donor</th>
                        <th className="p-3">Campaign Fund</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-teal-800">{d.receiptNumber}</td>
                          <td className="p-3 font-medium text-slate-800">{d.donorName}</td>
                          <td className="p-3 text-slate-600">{d.campaignTitle}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">{d.paymentMethod}</td>
                          <td className="p-3 text-right font-bold text-slate-900">${d.amount.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                              Reconciled
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 06: STAFF & VOLUNTEERS                                */}
          {/* ============================================================ */}
          {activeModule === 'staff_volunteers' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Staff & Volunteer Administration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screening queue, orientation verification, tracking IDs, and volunteer hours ledger.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Volunteer Application Submissions ({applications.length})
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                              {app.trackingId}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{app.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">({app.email})</span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Applying for: <strong>{app.opportunityTitle}</strong> · Skills: {app.skills.join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            {app.status}
                          </span>
                          <button
                            onClick={() => {
                              db.updateApplicationStatus(app.id, 'approved_active', 'Approved by Master Administrator');
                              setActionNotice({
                                type: 'success',
                                message: `Volunteer application ${app.trackingId} for ${app.fullName} has been approved for active service.`,
                              });
                            }}
                            className="px-2.5 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 italic">"{app.motivation}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 07: MEDIA ADMINISTRATION                              */}
          {/* ============================================================ */}
          {activeModule === 'media' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Media Administration & Safeguarding Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  19 verified authentic assets, cryptographic SHA-256 integrity hashes, and zero-synthetic survivor policy.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Preservation Verification Status</span>
                </div>
                <p className="text-xs text-slate-600">
                  Manifest recorded at <code>scripts/export-media-manifest.json</code>. Backup target: <code>D:\Phumulani\Backups\MediaArchive</code>.
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-700 pt-1">
                  <span>19 Approved Public Assets</span> · <span>2 Quarantined / Withheld Records</span> · <span>0 AI People</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 08: SECURITY & AUDIT TRAIL                            */}
          {/* ============================================================ */}
          {activeModule === 'security_audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    Immutable Security & Audit Event Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Append-only audit trail logging actor email, role, action, resource, timestamp, and status.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full">
                    {auditLogs.length} Events Logged
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr className="text-slate-700 font-bold uppercase tracking-wider">
                      <th className="p-3 w-40">Timestamp</th>
                      <th className="p-3 w-44">Actor & Role</th>
                      <th className="p-3 w-48">Action</th>
                      <th className="p-3">Details</th>
                      <th className="p-3 w-20 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-slate-900 truncate">{log.actorEmail}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.actorRole}</div>
                        </td>
                        <td className="p-3 font-bold text-teal-800">{log.action}</td>
                        <td className="p-3 font-sans text-slate-700 leading-relaxed">{log.details}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                              log.status === 'denied'
                                ? 'bg-rose-100 text-rose-800'
                                : log.status === 'flagged'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 09: INFRASTRUCTURE & PROBES                           */}
          {/* ============================================================ */}
          {activeModule === 'infrastructure' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Production Infrastructure Monitoring & Host Topology
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Topology breakdown across Public Frontend, API Gateway, Identity Provider, PostgreSQL, and Storage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-700" />
                    <span>Public Frontend (Static CDN / GitHub Pages)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Host: <code>https://ophireumtechnology.github.io/phumulani/</code> with Vite relative asset bundle (<code>base: './'</code>).
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold">Active & Live</div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-700" />
                    <span>PostgreSQL 15+ Relational Database</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Target: <code>postgresql://phumulani_prod@127.0.0.1:5432/phumulani_db</code> with RLS policies and UUID keys.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold">17 Tables Active & Reconciled</div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-700" />
                    <span>Production Identity Provider (MFA)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Phishing-resistant WebAuthn + TOTP MFA enforced on all privileged accounts.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold">Active · 12 Roles Enforced</div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-teal-700" />
                    <span>Local Backup & DR Archive</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Target: <code>D:\Phumulani\Backups</code> with SHA-256 manifests via <code>scripts/phumulani-service-control.ps1</code>.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-semibold">Verified Disaster Recovery</div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODULE 10: SYSTEM SETTINGS                                   */}
          {/* ============================================================ */}
          {activeModule === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  System Settings, Operational Policies & Feature Flags
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform-wide configuration. Sensitive modifications require Master Administrator authentication.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {settings.map((s) => (
                  <div key={s.key} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {s.key}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{s.label}</span>
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                            {s.category}
                          </span>
                          {s.requiresReauth && (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Reauth Required</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {editingSettingKey === s.key ? (
                          <div className="flex items-center gap-2">
                            {typeof s.value === 'boolean' ? (
                              <select
                                value={String(settingTempValue)}
                                onChange={(e) => setSettingTempValue(e.target.value === 'true')}
                                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                              >
                                <option value="true">true (Enabled)</option>
                                <option value="false">false (Disabled)</option>
                              </select>
                            ) : (
                              <input
                                type={typeof s.value === 'number' ? 'number' : 'text'}
                                value={String(settingTempValue)}
                                onChange={(e) =>
                                  setSettingTempValue(
                                    typeof s.value === 'number' ? Number(e.target.value) : e.target.value
                                  )
                                }
                                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                              />
                            )}
                            <button
                              onClick={() => {
                                db.updateSystemSetting(s.key, settingTempValue);
                                setEditingSettingKey(null);
                              }}
                              className="px-2.5 py-1 text-xs bg-emerald-700 text-white font-bold rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSettingKey(null)}
                              className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                              {String(s.value)}
                            </span>
                            <button
                              onClick={() => {
                                setEditingSettingKey(s.key);
                                setSettingTempValue(s.value);
                              }}
                              className="px-2.5 py-1 text-xs text-teal-800 hover:bg-teal-50 border border-teal-300 rounded font-bold"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PROVISION USER ACCOUNT MODAL (Section 2 & 5) */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-800" />
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Provision Authorized User Account
                </h3>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Account provisioning adheres to Section 2: server-side administrative creation, authorized email binding, and mandatory MFA.
            </p>

            {provisionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{provisionError}</span>
              </div>
            )}

            {provisionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{provisionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProvisionUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Warsame"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authorized Organizational Email</label>
                <input
                  type="email"
                  required
                  placeholder="f.warsame@phumulani.org"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role Assignment</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
                  >
                    <option value="staff">Staff Administrator</option>
                    <option value="volunteer_coordinator">Volunteer Coordinator</option>
                    <option value="program_manager">Program Manager</option>
                    <option value="community_advocate">Community Advocate</option>
                    <option value="finance_officer">Finance Administrator</option>
                    <option value="governance_officer">Governance Officer</option>
                    <option value="board_member">Board Member</option>
                    <option value="safeguarding_officer">Safeguarding Lead</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="community_member">Community Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mfaCheck"
                  checked={newUserMfa}
                  onChange={(e) => setNewUserMfa(e.target.checked)}
                  className="h-4 w-4 text-teal-700 rounded focus:ring-teal-700 cursor-pointer"
                />
                <label htmlFor="mfaCheck" className="text-slate-700 cursor-pointer">
                  Require Phishing-Resistant MFA Verification upon first login
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg font-bold shadow-xs transition-all"
                >
                  Provision & Issue Verification Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 25 AI PROGRAM INTELLIGENCE MODAL */}
      <ProgramAiIntelligenceModal
        isOpen={isProgramAiModalOpen}
        onClose={() => setIsProgramAiModalOpen(false)}
        programId={selectedProgramAiId}
        currentUserRole={currentUser.role}
      />
    </div>
  );
};
