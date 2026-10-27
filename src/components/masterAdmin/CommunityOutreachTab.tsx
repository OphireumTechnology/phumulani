/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Community Outreach Management
 * M25.03: Outreach Initiatives, Field Scheduling, Approved Materials & Anti-Surveillance Controls
 */

import React, { useState, useEffect } from 'react';
import {
  CommunityOutreachInitiative,
  OutreachStatus,
} from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  Shield,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const CommunityOutreachTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const [outreachList, setOutreachList] = useState<CommunityOutreachInitiative[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetArea, setTargetArea] = useState('');
  const [populationSummary, setPopulationSummary] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedReach, setEstimatedReach] = useState(150);
  const [approvedMaterial, setApprovedMaterial] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setOutreachList(commService.getOutreachInitiatives());
  };

  const handleCreateOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetArea.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Title and public target area are required.' });
      return;
    }

    const res = commService.createOutreachInitiative(
      {
        title: title.trim(),
        description: description.trim(),
        targetArea: targetArea.trim(),
        targetPopulationSummary: populationSummary.trim() || 'General immigrant community members and families',
        scheduledDate,
        leadStaffId: 'STF-006',
        leadStaffName: currentUserName,
        assignedVolunteerIds: [],
        partnerOrganizationNames: ['Hennepin Healthcare', 'Local Community Centers'],
        approvedMaterials: approvedMaterial ? [approvedMaterial.trim()] : ['Multilingual Program Handbill (Somali/Spanish/English)'],
        status: 'PLANNING',
        estimatedReach: Number(estimatedReach) || 100,
        executiveApproved: true,
      },
      currentUserRole,
      currentUserName
    );

    if (res.success && res.initiative) {
      setFeedbackNotice({ type: 'success', message: `Outreach initiative "${res.initiative.title}" scheduled successfully.` });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTargetArea('');
      setPopulationSummary('');
      setApprovedMaterial('');
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to create outreach initiative.' });
    }
  };

  const handleStatusChange = (id: string, newStatus: OutreachStatus) => {
    const res = commService.updateOutreachStatus(id, newStatus, currentUserRole, currentUserName);
    if (res.success) {
      setFeedbackNotice({ type: 'success', message: `Status updated to ${newStatus}.` });
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to update status.' });
    }
  };

  const filtered = outreachList.filter((item) => {
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.leadStaffName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
              M25.03 · FIELD OPERATIONS
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Community Outreach Operations</h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-xl">
            Coordinate public information distribution, aggregate demographic field outreach, and multilingual education without collecting confidential survivor data.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Outreach Initiative</span>
        </button>
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
          <button onClick={() => setFeedbackNotice(null)} className="text-slate-400 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search outreach title, target areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button
            onClick={refreshData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OUTREACH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              </div>
            </div>

            <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{item.description}</p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-medium truncate">{item.targetArea}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Scheduled: {item.scheduledDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Est. Reach: {item.estimatedReach} individuals (Aggregate Only)</span>
              </div>
            </div>

            {/* Approved materials */}
            <div className="text-[11px]">
              <span className="font-bold text-slate-700 block mb-1">Approved Materials:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {item.approvedMaterials.map((mat, i) => (
                  <li key={i} className="truncate">{mat}</li>
                ))}
              </ul>
            </div>

            {/* Status change action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">Lead: {item.leadStaffName}</span>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as OutreachStatus)}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 cursor-pointer"
              >
                <option value="PLANNING">Planning</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FOLLOW_UP">Follow Up</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE OUTREACH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Field Operations</span>
                <h3 className="text-base font-bold text-slate-900">Plan Community Outreach Initiative</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOutreach} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Initiative Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cedar-Riverside Community Health Fair Table"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Public Target Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cedar-Riverside Opportunity Center (Public Plaza)"
                  value={targetArea}
                  onChange={(e) => setTargetArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Reach</label>
                  <input
                    type="number"
                    value={estimatedReach}
                    onChange={(e) => setEstimatedReach(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Scope & Objectives</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of outreach goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Approved Distribution Materials</label>
                <input
                  type="text"
                  placeholder="e.g. Nutrition Pantry Schedules & Multilingual Brochure"
                  value={approvedMaterial}
                  onChange={(e) => setApprovedMaterial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] flex items-start gap-2">
                <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Surveillance Safeguard:</strong> Outreach forms must never gather identifiable survivor data or domestic violence crisis information. Confidential shelter venues are prohibited fail-closed.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Schedule Outreach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
