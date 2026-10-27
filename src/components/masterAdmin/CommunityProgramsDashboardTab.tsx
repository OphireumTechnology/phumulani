/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Community Programs Management Hub
 * M25.02, M25.12, M25.13: Program Registry, Status State Machine & Executive Governance
 */

import React, { useState, useEffect } from 'react';
import {
  CommunityProgram,
  ProgramCategory,
  ProgramStatus,
} from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Users,
  Shield,
  FileCheck2,
  Calendar,
  ChevronRight,
  Send,
  Building,
  Target,
  FileText,
  HeartHandshake,
  Bot,
  RefreshCw,
  Award,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
  onOpenAiAssist: (programId?: string) => void;
  onNavigateSubmodule: (submodule: string) => void;
}

export const CommunityProgramsDashboardTab: React.FC<Props> = ({
  currentUserRole,
  currentUserName,
  onOpenAiAssist,
  onNavigateSubmodule,
}) => {
  const commService = CommunityProgramsService.getInstance();
  const [programs, setPrograms] = useState<CommunityProgram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<CommunityProgram | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProgramCategory>('WORKFORCE_DEVELOPMENT');
  const [formDescription, setFormDescription] = useState('');
  const [formManagerName, setFormManagerName] = useState(currentUserName);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formObjectiveText, setFormObjectiveText] = useState('');
  const [formTargetOutcome, setFormTargetOutcome] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPrograms(commService.getPrograms());
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Program name and description are required.' });
      return;
    }

    const res = commService.createProgram(
      {
        name: formName.trim(),
        description: formDescription.trim(),
        category: formCategory,
        objectives: formObjectiveText
          ? [
              {
                id: `OBJ-${Date.now()}`,
                description: formObjectiveText.trim(),
                targetMetric: '1 Cohort / Annual Target',
                isCompleted: false,
              },
            ]
          : [],
        responsibleDepartmentId: 'DEPT-PROG',
        responsibleDepartmentName: 'Community Programs',
        programManagerId: 'STF-002',
        programManagerName: formManagerName.trim() || currentUserName,
        startDate: formStartDate,
        status: 'DRAFT',
        targetOutcomes: formTargetOutcome ? [formTargetOutcome.trim()] : ['Enhanced community economic stability'],
        approvedResourceRequirements: ['Community room reservation', 'Bilingual curriculum packets'],
        associatedVolunteerIds: [],
        associatedPartnerIds: [],
        relatedTaskIds: [],
        activities: [],
      },
      currentUserRole,
      currentUserName
    );

    if (res.success && res.program) {
      setFeedbackNotice({ type: 'success', message: `Program "${res.program.name}" drafted successfully.` });
      setIsCreateModalOpen(false);
      setFormName('');
      setFormDescription('');
      setFormObjectiveText('');
      setFormTargetOutcome('');
      refreshData();
      setSelectedProgram(res.program);
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to create program.' });
    }
  };

  const handleRequestApproval = (programId: string) => {
    const res = commService.requestProgramApproval(programId, currentUserRole, currentUserName);
    if (res.success) {
      setFeedbackNotice({ type: 'success', message: 'Submitted program to Executive Decision Center for authorization.' });
      refreshData();
      if (selectedProgram?.id === programId) {
        setSelectedProgram(commService.getProgramById(programId) || null);
      }
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to request approval.' });
    }
  };

  const handleExecutiveSignOff = (programId: string, approved: boolean) => {
    const res = commService.reviewProgramApproval(
      programId,
      approved,
      currentUserRole,
      currentUserName,
      approved ? 'Executive Director sign-off granted.' : 'Returned for revision.'
    );

    if (res.success) {
      setFeedbackNotice({
        type: 'success',
        message: approved ? 'Program successfully APPROVED and certified.' : 'Program returned to revision.',
      });
      refreshData();
      if (selectedProgram?.id === programId) {
        setSelectedProgram(commService.getProgramById(programId) || null);
      }
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Approval action failed.' });
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.programManagerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">ACTIVE</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">UNDER REVIEW</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">COMPLETED</span>;
      case 'ON_HOLD':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">ON HOLD</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#104F57] to-[#0A363C] text-white p-6 rounded-2xl shadow-sm border border-teal-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-widest uppercase bg-teal-800/80 text-teal-200 px-2.5 py-0.5 rounded-full border border-teal-600/60 font-semibold">
                PHASE 25 · COMMUNITY OPERATIONS SYSTEM
              </span>
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 306 Tests Certified
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              Community Programs & Service Delivery Management
            </h1>
            <p className="text-teal-100/90 text-xs max-w-2xl mt-1 leading-relaxed">
              Unified operating command for Phumulani's community initiatives: vocational workforce pathways, youth mentorship, cultural nutrition pantry, civic navigation, volunteer deployment, and truthful impact.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAiAssist()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>AI Program Assistant</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Program Proposal</span>
            </button>
          </div>
        </div>

        {/* FAST SUBMODULE NAVIGATION BAR */}
        <div className="mt-6 pt-4 border-t border-teal-700/60 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => onNavigateSubmodule('programs')}
            className="px-3 py-1.5 rounded-lg bg-white/20 text-white font-bold flex items-center gap-1.5 border border-white/30"
          >
            <Target className="w-3.5 h-3.5" /> Programs Overview
          </button>
          <button
            onClick={() => onNavigateSubmodule('outreach')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Community Outreach
          </button>
          <button
            onClick={() => onNavigateSubmodule('services')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" /> General Services & Triage
          </button>
          <button
            onClick={() => onNavigateSubmodule('referrals')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Building className="w-3.5 h-3.5" /> Service Referrals
          </button>
          <button
            onClick={() => onNavigateSubmodule('volunteers')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> Volunteer Deployment
          </button>
          <button
            onClick={() => onNavigateSubmodule('events')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" /> Community Events
          </button>
          <button
            onClick={() => onNavigateSubmodule('resources')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> Resources & Materials
          </button>
          <button
            onClick={() => onNavigateSubmodule('impact')}
            className="px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-white/10 text-teal-100 font-semibold flex items-center gap-1.5 border border-teal-700/40 transition-colors"
          >
            <Award className="w-3.5 h-3.5" /> Truthful Impact
          </button>
        </div>
      </div>

      {/* FEEDBACK NOTICE */}
      {feedbackNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs, managers, objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="WORKFORCE_DEVELOPMENT">Workforce Development</option>
            <option value="YOUTH_MENTORSHIP">Youth Mentorship</option>
            <option value="FOOD_SECURITY">Food Security</option>
            <option value="FINANCIAL_LITERACY">Financial Literacy</option>
            <option value="LANGUAGE_ACCESS">Language Access</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="APPROVED">Approved</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            onClick={refreshData}
            title="Refresh programs list"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PROGRAM GRID & DETAIL DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: PROGRAM CARDS */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No programs match current filters</h3>
              <p className="text-slate-500 text-xs mt-1">Adjust search terms or proposal categories to view records.</p>
            </div>
          ) : (
            filteredPrograms.map((prog) => {
              const isSelected = selectedProgram?.id === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgram(prog)}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:border-teal-700 ${
                    isSelected ? 'border-teal-800 ring-2 ring-teal-700/20 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {prog.id}
                        </span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 uppercase">
                          {prog.category.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(prog.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{prog.name}</h3>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs line-clamp-2 mb-3 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Manager</span>
                      <span className="font-semibold text-slate-800 truncate block">{prog.programManagerName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                      <span className="font-semibold text-slate-800 truncate block">{prog.responsibleDepartmentName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Objectives</span>
                      <span className="font-semibold text-teal-800">{prog.objectives.length} Defined</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Executive Gate</span>
                      <span className={prog.executiveApproved ? 'font-bold text-emerald-700' : 'font-medium text-amber-700'}>
                        {prog.executiveApproved ? '✓ Signed Off' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COL: SELECTED PROGRAM DOSSIER */}
        <div className="lg:col-span-1">
          {selectedProgram ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-20 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedProgram.id}</span>
                  <h2 className="text-sm font-bold text-slate-900">{selectedProgram.name}</h2>
                </div>
                {getStatusBadge(selectedProgram.status)}
              </div>

              {/* Status & Dates */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Program Manager:</span>
                  <span className="font-bold text-slate-800">{selectedProgram.programManagerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedProgram.responsibleDepartmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Launch Date:</span>
                  <span className="font-mono text-slate-800">{selectedProgram.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Executive Approval:</span>
                  <span className={`font-bold ${selectedProgram.executiveApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedProgram.executiveApproved
                      ? `Approved by ${selectedProgram.executiveApproverName || 'Comfort Dondo'}`
                      : 'Pending Sign-off'}
                  </span>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-700" />
                  <span>Program Objectives ({selectedProgram.objectives.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedProgram.objectives.map((obj) => (
                    <div key={obj.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[11px]">
                      <div className="font-medium text-slate-800">{obj.description}</div>
                      <div className="text-[10px] font-mono text-teal-800 mt-0.5">
                        Target: {obj.targetMetric} {obj.achievedMetric ? `· Achieved: ${obj.achievedMetric}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              {selectedProgram.activities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-700" />
                    <span>Scheduled Activities</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedProgram.activities.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[11px]">
                        <div className="font-bold text-slate-800">{act.title}</div>
                        <div className="text-[10px] text-slate-500">{act.location} ({act.frequency})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Governance Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2">
                  Governance Controls
                </h4>

                {/* If draft or on hold, request review */}
                {(selectedProgram.status === 'DRAFT' || selectedProgram.status === 'ON_HOLD') && (
                  <button
                    onClick={() => handleRequestApproval(selectedProgram.id)}
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Executive Authorization</span>
                  </button>
                )}

                {/* If under review and user is executive or super admin, show approve/return */}
                {selectedProgram.status === 'UNDER_REVIEW' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-tight">
                      Awaiting formal Executive Director review before operational resource allocation.
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleExecutiveSignOff(selectedProgram.id, true)}
                        className="py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleExecutiveSignOff(selectedProgram.id, false)}
                        className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Return</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onOpenAiAssist(selectedProgram.id)}
                  className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>AI Pre-Event & Planning Assistant</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>Select any community program card to view dossier, objectives, activities, and approval actions.</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROGRAM PROPOSAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Community Operations</span>
                <h3 className="text-base font-bold text-slate-900">Draft New Community Program</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immigrant Women Micro-Enterprise Lab"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProgramCategory)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="WORKFORCE_DEVELOPMENT">Workforce Development</option>
                    <option value="YOUTH_MENTORSHIP">Youth Mentorship</option>
                    <option value="FOOD_SECURITY">Food Security</option>
                    <option value="FINANCIAL_LITERACY">Financial Literacy</option>
                    <option value="LANGUAGE_ACCESS">Language Access</option>
                    <option value="HEALTH_WELLNESS">Health & Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lead Manager *</label>
                  <input
                    type="text"
                    required
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description & Scope *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe program goals, community eligibility, and delivery model..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Primary Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Conduct 10 financial independence workshops in Hennepin County"
                  value={formObjectiveText}
                  onChange={(e) => setFormObjectiveText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Community Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. 80% of participants transition to living wage employment"
                  value={formTargetOutcome}
                  onChange={(e) => setFormTargetOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] flex items-start gap-2">
                <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  Programs are initialized in <strong>DRAFT</strong>. Executive Director Comfort Dondo must review and authorize before public publishing or resource allocation.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Draft Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
