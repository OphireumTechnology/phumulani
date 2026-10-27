/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Community Events Management
 * M25.07: Event Planning, Executive Publication Gating & Confidential Location Protection
 */

import React, { useState, useEffect } from 'react';
import { CommunityEvent, CommunityEventStatus, CommunityEventType } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Shield,
  FileCheck2,
  RefreshCw,
  Globe,
  Lock,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const CommunityEventsTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<CommunityEventType>('CAREER_FAIR');
  const [eventDate, setEventDate] = useState('2026-11-28');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('2:00 PM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(80);
  const [volunteersRequired, setVolunteersRequired] = useState(4);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEvents(commService.getEvents());
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Event title and public location are required.' });
      return;
    }

    const res = commService.createEvent(
      {
        title: title.trim(),
        description: description.trim(),
        eventType,
        eventDate,
        startTime,
        endTime,
        generalLocation: location.trim(),
        organizingDepartmentId: 'DEPT-PROG',
        eventManagerId: 'STF-002',
        eventManagerName: currentUserName,
        assignedStaffNames: [currentUserName],
        volunteersRequiredCount: Number(volunteersRequired),
        volunteersAssignedCount: 0,
        approvedResourceSummary: 'Event flyers, sound system, guest registration roster',
        registrationOpen: false,
        maxCapacity: Number(maxCapacity),
        status: 'PLANNING',
      },
      currentUserName,
      currentUserRole
    );

    if (res.success && res.event) {
      setFeedbackNotice({
        type: 'success',
        message: `Event "${res.event.title}" planned successfully. Awaiting Executive Director publication approval.`,
      });
      setIsModalOpen(false);
      setTitle('');
      setLocation('');
      setDescription('');
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to create event.' });
    }
  };

  const handlePublishEvent = (eventId: string) => {
    const res = commService.publishEvent(eventId, currentUserRole, currentUserName);
    if (res.success) {
      setFeedbackNotice({
        type: 'success',
        message: 'Event certified and published to public community calendar.',
      });
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Publication failed.' });
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.generalLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.eventManagerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
            M25.07 · COMMUNITY EVENTS PLANNING
          </span>
          <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">Community Events Management</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Organize career showcases, youth robotics exhibitions, and cultural nutrition drives in verified public community venues.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Community Event</span>
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

      {/* SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search event title, venue, manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
          />
        </div>
        <button onClick={refreshData} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* EVENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((evt) => (
          <div key={evt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {evt.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                    {evt.status}
                  </span>
                  {evt.executiveApproved && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Exec Approved
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{evt.title}</h3>
              </div>
            </div>

            <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{evt.description}</p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-medium truncate">{evt.generalLocation}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  {evt.eventDate} · {evt.startTime} - {evt.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>
                  Registrations: {evt.registeredCount} / {evt.maxCapacity} capacity (Verified Attendance: {evt.verifiedAttendanceCount || 0})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[10px] text-slate-400">Manager: {evt.eventManagerName}</span>
              {evt.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handlePublishEvent(evt.id)}
                  className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>Publish to Public</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PLAN EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">Public Engagement</span>
                <h3 className="text-base font-bold text-slate-900">Plan Community Event</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Immigrant Women Career Pathways Showcase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CommunityEventType)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="CAREER_FAIR">Career Fair</option>
                    <option value="YOUTH_WORKSHOP">Youth Workshop</option>
                    <option value="FOOD_DISTRIBUTION">Food Distribution Drive</option>
                    <option value="FINANCIAL_CLINIC">Financial Independence Clinic</option>
                    <option value="COMMUNITY_FORUM">Community Forum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Public Venue Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minneapolis Public Library (Hall A - Public Venue)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Event summary and public activities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px] flex items-start gap-2">
                <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Venue Confidentiality Invariant:</strong> Confidential shelter locations and safe house addresses are prohibited from public events fail-closed.
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
                  Plan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
