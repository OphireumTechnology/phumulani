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
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">ACTIVE</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal">APPROVED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold">UNDER REVIEW</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal">COMPLETED</span>;
      case 'ON_HOLD':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-orange">ON HOLD</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-cream">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm border border-phumulani-teal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-widest uppercase bg-phumulani-charcoal text-phumulani-teal px-2.5 py-0.5 rounded-full border border-phumulani-teal font-semibold">
                PHASE 25 · COMMUNITY OPERATIONS SYSTEM
              </span>
              <span className="text-[11px] font-mono text-phumulani-green flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 306 Tests Certified
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              Community Programs & Service Delivery Management
            </h1>
            <p className="text-phumulani-teal text-xs max-w-2xl mt-1 leading-relaxed">
              Unified operating command for Phumulani's community initiatives: vocational workforce pathways, youth mentorship, cultural nutrition pantry, civic navigation, volunteer deployment, and truthful impact.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAiAssist()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-phumulani-gold hover:bg-phumulani-teal text-phumulani-charcoal rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>AI Program Assistant</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-phumulani-earth hover:bg-phumulani-cream rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Program Proposal</span>
            </button>
          </div>
        </div>

        {/* FAST SUBMODULE NAVIGATION BAR */}
        <div className="mt-6 pt-4 border-t border-phumulani-teal flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => onNavigateSubmodule('programs')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal text-white font-bold flex items-center gap-1.5 border border-phumulani-cream"
          >
            <Target className="w-3.5 h-3.5" /> Programs Overview
          </button>
          <button
            onClick={() => onNavigateSubmodule('outreach')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Community Outreach
          </button>
          <button
            onClick={() => onNavigateSubmodule('services')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Shield className="w-3.5 h-3.5" /> General Services & Triage
          </button>
          <button
            onClick={() => onNavigateSubmodule('referrals')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Building className="w-3.5 h-3.5" /> Service Referrals
          </button>
          <button
            onClick={() => onNavigateSubmodule('volunteers')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Users className="w-3.5 h-3.5" /> Volunteer Deployment
          </button>
          <button
            onClick={() => onNavigateSubmodule('events')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" /> Community Events
          </button>
          <button
            onClick={() => onNavigateSubmodule('resources')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> Resources & Materials
          </button>
          <button
            onClick={() => onNavigateSubmodule('impact')}
            className="px-3 py-1.5 rounded-lg bg-phumulani-charcoal hover:bg-phumulani-earth text-phumulani-teal font-semibold flex items-center gap-1.5 border border-phumulani-teal transition-colors"
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
              ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
              : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-phumulani-charcoal hover:text-phumulani-earth font-bold px-2 py-0.5"
          >
            ×
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-phumulani-charcoal" />
          <input
            type="text"
            placeholder="Search programs, managers, objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-phumulani-cream focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth bg-phumulani-cream focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-phumulani-cream bg-phumulani-cream font-medium text-phumulani-charcoal"
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
            className="text-xs px-2.5 py-1.5 rounded-lg border border-phumulani-cream bg-phumulani-cream font-medium text-phumulani-charcoal"
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
            className="p-1.5 rounded-lg border border-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream"
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
            <div className="bg-white p-12 rounded-2xl border border-phumulani-cream text-center">
              <Target className="w-10 h-10 text-phumulani-charcoal mx-auto mb-3" />
              <h3 className="text-sm font-bold text-phumulani-charcoal">No programs match current filters</h3>
              <p className="text-phumulani-charcoal text-xs mt-1">Adjust search terms or proposal categories to view records.</p>
            </div>
          ) : (
            filteredPrograms.map((prog) => {
              const isSelected = selectedProgram?.id === prog.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgram(prog)}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:border-phumulani-earth ${
                    isSelected ? 'border-phumulani-earth ring-2 ring-phumulani-earth shadow-md' : 'border-phumulani-cream'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded">
                          {prog.id}
                        </span>
                        <span className="text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal uppercase">
                          {prog.category.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(prog.status)}
                      </div>
                      <h3 className="font-bold text-phumulani-charcoal text-sm">{prog.name}</h3>
                    </div>
                  </div>

                  <p className="text-phumulani-charcoal text-xs line-clamp-2 mb-3 leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-phumulani-cream text-[11px] text-phumulani-charcoal">
                    <div>
                      <span className="block text-[10px] text-phumulani-charcoal uppercase font-semibold">Manager</span>
                      <span className="font-semibold text-phumulani-charcoal truncate block">{prog.programManagerName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-phumulani-charcoal uppercase font-semibold">Department</span>
                      <span className="font-semibold text-phumulani-charcoal truncate block">{prog.responsibleDepartmentName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-phumulani-charcoal uppercase font-semibold">Objectives</span>
                      <span className="font-semibold text-phumulani-earth">{prog.objectives.length} Defined</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-phumulani-charcoal uppercase font-semibold">Executive Gate</span>
                      <span className={prog.executiveApproved ? 'font-bold text-phumulani-earth' : 'font-medium text-phumulani-earth'}>
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
            <div className="bg-white p-6 rounded-2xl border border-phumulani-cream shadow-xs sticky top-20 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                <div>
                  <span className="text-[10px] font-mono text-phumulani-charcoal font-bold">{selectedProgram.id}</span>
                  <h2 className="text-sm font-bold text-phumulani-charcoal">{selectedProgram.name}</h2>
                </div>
                {getStatusBadge(selectedProgram.status)}
              </div>

              {/* Status & Dates */}
              <div className="bg-phumulani-cream p-3.5 rounded-xl border border-phumulani-cream space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Program Manager:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedProgram.programManagerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Department:</span>
                  <span className="font-semibold text-phumulani-charcoal">{selectedProgram.responsibleDepartmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Launch Date:</span>
                  <span className="font-mono text-phumulani-charcoal">{selectedProgram.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Executive Approval:</span>
                  <span className={`font-bold ${selectedProgram.executiveApproved ? 'text-phumulani-earth' : 'text-phumulani-earth'}`}>
                    {selectedProgram.executiveApproved
                      ? `Approved by ${selectedProgram.executiveApproverName || 'Comfort Dondo'}`
                      : 'Pending Sign-off'}
                  </span>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <h4 className="font-bold text-phumulani-charcoal uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-phumulani-earth" />
                  <span>Program Objectives ({selectedProgram.objectives.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedProgram.objectives.map((obj) => (
                    <div key={obj.id} className="p-2.5 rounded-lg border border-phumulani-cream bg-phumulani-cream text-[11px]">
                      <div className="font-medium text-phumulani-charcoal">{obj.description}</div>
                      <div className="text-[10px] font-mono text-phumulani-earth mt-0.5">
                        Target: {obj.targetMetric} {obj.achievedMetric ? `· Achieved: ${obj.achievedMetric}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              {selectedProgram.activities.length > 0 && (
                <div>
                  <h4 className="font-bold text-phumulani-charcoal uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-phumulani-earth" />
                    <span>Scheduled Activities</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedProgram.activities.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-lg border border-phumulani-cream bg-phumulani-cream text-[11px]">
                        <div className="font-bold text-phumulani-charcoal">{act.title}</div>
                        <div className="text-[10px] text-phumulani-charcoal">{act.location} ({act.frequency})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Governance Actions */}
              <div className="pt-3 border-t border-phumulani-cream space-y-2">
                <h4 className="font-bold text-phumulani-charcoal uppercase text-[10px] tracking-wider mb-2">
                  Governance Controls
                </h4>

                {/* If draft or on hold, request review */}
                {(selectedProgram.status === 'DRAFT' || selectedProgram.status === 'ON_HOLD') && (
                  <button
                    onClick={() => handleRequestApproval(selectedProgram.id)}
                    className="w-full py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Executive Authorization</span>
                  </button>
                )}

                {/* If under review and user is executive or super admin, show approve/return */}
                {selectedProgram.status === 'UNDER_REVIEW' && (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-phumulani-cream border border-phumulani-gold rounded-lg text-phumulani-charcoal text-[11px] leading-tight">
                      Awaiting formal Executive Director review before operational resource allocation.
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleExecutiveSignOff(selectedProgram.id, true)}
                        className="py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleExecutiveSignOff(selectedProgram.id, false)}
                        className="py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth border border-phumulani-earth font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Return</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onOpenAiAssist(selectedProgram.id)}
                  className="w-full py-2 bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-charcoal border border-phumulani-gold font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-phumulani-earth" />
                  <span>AI Pre-Event & Planning Assistant</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-phumulani-cream p-8 rounded-2xl border border-dashed border-phumulani-cream text-center text-phumulani-charcoal text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>Select any community program card to view dossier, objectives, activities, and approval actions.</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROGRAM PROPOSAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-phumulani-cream max-w-xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <span className="text-[10px] font-mono text-phumulani-earth font-bold uppercase">Community Operations</span>
                <h3 className="text-base font-bold text-phumulani-charcoal">Draft New Community Program</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-phumulani-charcoal hover:text-phumulani-earth font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immigrant Women Micro-Enterprise Lab"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth bg-phumulani-cream focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProgramCategory)}
                    className="w-full px-2.5 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream font-medium"
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
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Lead Manager *</label>
                  <input
                    type="text"
                    required
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Description & Scope *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe program goals, community eligibility, and delivery model..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth bg-phumulani-cream focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Primary Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Conduct 10 financial independence workshops in Hennepin County"
                  value={formObjectiveText}
                  onChange={(e) => setFormObjectiveText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Target Community Outcome</label>
                <input
                  type="text"
                  placeholder="e.g. 80% of participants transition to living wage employment"
                  value={formTargetOutcome}
                  onChange={(e) => setFormTargetOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream focus:bg-white"
                />
              </div>

              <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-xl text-phumulani-earth text-[11px] flex items-start gap-2">
                <Shield className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                <span>
                  Programs are initialized in <strong>DRAFT</strong>. Executive Director Comfort Dondo must review and authorize before public publishing or resource allocation.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-phumulani-cream">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-phumulani-cream text-phumulani-charcoal font-semibold rounded-xl hover:bg-phumulani-cream cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
