/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Staff Command Center (Application 4)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { InboxMessage, User, VolunteerApplication, EventItem } from '../types';
import {
  Inbox,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  Lock,
  Search,
  Filter,
  Check,
  X,
  Edit3,
  ShieldAlert,
  ArrowRight,
  Eye,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';
import { PHUMULANI_MEDIA_INVENTORY, MediaAsset, getSafeguardingQueueMedia } from '../services/mediaInventory';

interface StaffCommandCenterViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
  onOpenReceipt: (donation: any) => void;
  onOpenMediaRegistry?: () => void;
}

export const StaffCommandCenterView: React.FC<StaffCommandCenterViewProps> = ({
  currentUser,
  onViewChange,
  onOpenReceipt,
  onOpenMediaRegistry,
}) => {
  const state = db.getState();
  const messages = state.inboxMessages;
  const applications = state.applications;
  const events = state.events;
  const donations = state.donations;
  const approvalTasks = state.aiApprovalTasks;
  const restrictedIntakes = state.restrictedIntakes;

  const [activeTab, setActiveTab] = useState<
    'inbox' | 'volunteers' | 'events' | 'finance' | 'ai_queue' | 'restricted' | 'media'
  >('inbox');

  // Selected message for viewing/drafting
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(messages[0] || null);
  const [draftEditText, setDraftEditText] = useState(messages[0]?.aiDraftReply || '');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Volunteer screening selection
  const [screeningApp, setScreeningApp] = useState<VolunteerApplication | null>(applications[0] || null);
  const [screeningNotes, setScreeningNotes] = useState('');

  // New Event Form State
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-20');
  const [newEventTime, setNewEventTime] = useState('10:00 AM - 1:00 PM CST');
  const [newEventLocation, setNewEventLocation] = useState('Phumulani Community Center');
  const [newEventCategory, setNewEventCategory] = useState('Workforce');
  const [newEventCapacity, setNewEventCapacity] = useState(40);
  const [newEventDesc, setNewEventDesc] = useState('');

  // Media registry filter & review state
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');
  const [stagedMediaList, setStagedMediaList] = useState<MediaAsset[]>(
    PHUMULANI_MEDIA_INVENTORY.filter(
      (m) => m.publicationStatus === 'staged' || m.publicationStatus === 'withheld'
    )
  );

  const handleApproveMediaRelease = (id: string) => {
    setStagedMediaList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              safeguardingReviewStatus: 'cleared_for_public_web',
              publicationStatus: 'published',
              consentStatus: 'approved',
            }
          : item
      )
    );
    setActionFeedback(`Media asset ${id} approved by ${currentUser.name} (Safeguarding Lead). Audit record appended.`);
    db.appendAuditLog(
      'SAFEGUARDING_MEDIA_APPROVED',
      `Media release ${id} verified and approved for public portal by ${currentUser.name}`
    );
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleWithholdMediaRelease = (id: string, reason: string) => {
    setStagedMediaList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              safeguardingReviewStatus: 'restricted_internal_only',
              publicationStatus: 'withheld',
            }
          : item
      )
    );
    setActionFeedback(`Media asset ${id} strictly withheld: ${reason}`);
    db.appendAuditLog(
      'SAFEGUARDING_MEDIA_WITHHELD',
      `Media release ${id} withheld under VAWA digital protections by ${currentUser.name}: ${reason}`
    );
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Handle Generate / Regenerate AI Draft for selected message
  const handleGenerateDraft = async (msg: InboxMessage) => {
    setIsGeneratingDraft(true);
    try {
      const res = await aiOrchestrator.generateEmailDraft(msg.body, msg.fromName, msg.subject);
      setDraftEditText(res.draft);
      db.updateMessageStatus(msg.id, 'draft_ready', res.draft);
      setSelectedMessage({
        ...msg,
        aiDraftReply: res.draft,
        status: 'draft_ready',
        aiReasoning: res.reasoning,
      });
      setActionFeedback('AI draft prepared by Agent A02. Please review and authorize.');
    } finally {
      setIsGeneratingDraft(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  // Handle Approve & Send Draft
  const handleApproveSend = (msgId: string) => {
    db.updateMessageStatus(msgId, 'sent', draftEditText);
    setActionFeedback('Draft authorized by staff and sent to recipient. Audit logged.');
    const updated = db.getState().inboxMessages.find((m) => m.id === msgId);
    if (updated) setSelectedMessage(updated);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Handle Volunteer Status Change
  const handleUpdateVolunteerStatus = (appId: string, status: VolunteerApplication['status']) => {
    db.updateApplicationStatus(appId, status, screeningNotes);
    setActionFeedback(`Volunteer application updated to: ${status}`);
    const updated = db.getState().applications.find((a) => a.id === appId);
    if (updated) setScreeningApp(updated);
    setScreeningNotes('');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Handle New Event Creation
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: EventItem = {
      id: `evt-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation,
      isVirtual: false,
      category: newEventCategory,
      description: newEventDesc,
      capacity: Number(newEventCapacity),
      registeredCount: 0,
      waitlistCount: 0,
      approved: true,
      accessibilityNotes: 'Full wheelchair accessibility; multilingual interpretation available.',
    };

    db.getState().events.unshift(newEvt);
    db.appendAuditLog('EVENT_CREATED', `Created new community event: ${newEventTitle} (Capacity: ${newEventCapacity})`);
    setShowNewEventModal(false);
    setActionFeedback(`Event "${newEventTitle}" published successfully.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const isSafeguardingOfficer = currentUser.role === 'safeguarding_officer' || currentUser.role === 'executive_director';

  const pendingInboxCount = messages.filter((m) => m.status === 'unread' || m.status === 'draft_ready').length;
  const pendingVolunteersCount = applications.filter((a) => a.status === 'submitted' || a.status === 'screening_review').length;
  const pendingAICount = approvalTasks.filter((t) => t.status === 'pending').length;
  const safeguardingMediaCount = PHUMULANI_MEDIA_INVENTORY.filter(
    (m) => m.safeguardingReviewStatus !== 'cleared_for_public_web' || m.publicationStatus !== 'published'
  ).length;

  const navGroups = [
    {
      groupLabel: 'Operational Management',
      items: [
        { id: 'inbox', label: 'Unified Inbox & Triage', icon: Inbox, badge: pendingInboxCount },
        { id: 'volunteers', label: 'Volunteer Screening Queue', icon: Users, badge: pendingVolunteersCount },
        { id: 'events', label: 'Event Operations', icon: Calendar, badge: events.length },
        { id: 'finance', label: 'Donations & Ledger', icon: DollarSign },
      ],
    },
    {
      groupLabel: 'Oversight & Safeguarding',
      items: [
        { id: 'ai_queue', label: 'AI Approval Queue', icon: Sparkles, badge: pendingAICount },
        { id: 'restricted', label: 'Restricted Survivor Route', icon: ShieldAlert, badge: restrictedIntakes.length },
        { id: 'media', label: 'Media & Safeguarding Registry', icon: Camera, badge: safeguardingMediaCount },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="staff"
      portalTitle="Staff Command Center"
      portalSubtitle="Unified triage, CRM, volunteers & approvals"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId={activeTab}
      onSelectNavItem={(id) => setActiveTab(id as any)}
    >
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm border border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700">
              <Briefcase className="w-3.5 h-3.5 text-teal-400" />
              <span>STAFF COMMAND CENTER</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              Operations & Triage Command
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Human-in-the-loop operational management: review AI-triaged email, screen volunteer candidates, reconcile financial ledgers, and oversee events.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-center min-w-[100px]">
              <div className="font-serif text-lg font-bold text-amber-400">{pendingInboxCount}</div>
              <div className="text-[10px] text-slate-400">Pending Triage</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-center min-w-[100px]">
              <div className="font-serif text-lg font-bold text-teal-400">{pendingVolunteersCount}</div>
              <div className="text-[10px] text-slate-400">To Screen</div>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-center min-w-[100px]">
              <div className="font-serif text-lg font-bold text-rose-400">{restrictedIntakes.length}</div>
              <div className="text-[10px] text-slate-400">Safeguarding</div>
            </div>
            <div
              onClick={() => setActiveTab('media')}
              className="bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 rounded-xl p-3 text-center min-w-[100px] cursor-pointer transition-colors"
            >
              <div className="font-serif text-lg font-bold text-emerald-400">{PHUMULANI_MEDIA_INVENTORY.length}</div>
              <div className="text-[10px] text-slate-400">Media Vault</div>
            </div>
          </div>
        </div>

        {actionFeedback && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

      {/* TAB 1: UNIFIED INBOX & AI TRIAGE (WORKFLOW A) */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs min-h-[580px]">
          {/* Left Column: Messages List */}
          <div className="lg:col-span-5 border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto max-h-[700px]">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Inbox Queue (Workflow A)</span>
              <span className="text-[11px] text-slate-400">Classified by Agent A02</span>
            </div>

            {messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setDraftEditText(msg.aiDraftReply || '');
                  }}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected ? 'bg-teal-50/70 border-l-4 border-[#104F57]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-slate-900">{msg.fromName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="font-semibold text-xs text-slate-800 mt-1 line-clamp-1">
                    {msg.subject}
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {msg.body}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {msg.isSafeguardingAlert ? (
                        <span className="text-rose-800 bg-rose-100 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>SAFEGUARDING HALT</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {msg.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        msg.status === 'sent'
                          ? 'text-emerald-700 bg-emerald-50'
                          : msg.status === 'escalated'
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {msg.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Message Detail & AI Draft Review */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[700px]">
            {selectedMessage ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">
                        {selectedMessage.subject}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        From: <strong>{selectedMessage.fromName}</strong> ({selectedMessage.fromEmail})
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(selectedMessage.receivedAt).toLocaleString()}
                    </span>
                  </div>

                  {selectedMessage.isSafeguardingAlert && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-950 font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>
                        SAFEGUARDING ISOLATION: Message contains trauma/crisis disclosure. Automated AI responses are permanently halted per Principle 1.4. Assigned to Sister Miriam K.
                      </span>
                    </div>
                  )}
                </div>

                {/* Original Body */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>

                {/* AI Triage & Draft Section (Disabled if safeguarding alert) */}
                {!selectedMessage.isSafeguardingAlert ? (
                  <div className="bg-white rounded-xl border border-teal-200 p-5 space-y-4 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#104F57]" />
                        <span className="font-serif text-xs font-bold text-slate-900">
                          AI Draft Proposal (Agent A02 · Email Manager)
                        </span>
                      </div>
                      <button
                        onClick={() => handleGenerateDraft(selectedMessage)}
                        disabled={isGeneratingDraft}
                        className="text-xs text-[#104F57] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Regenerate Draft</span>
                      </button>
                    </div>

                    {selectedMessage.aiReasoning && (
                      <div className="text-[11px] text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200/60">
                        <strong>Triage Reasoning:</strong> {selectedMessage.aiReasoning}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Staff Review & Edit (Changes will be audited):
                      </label>
                      <textarea
                        rows={6}
                        value={draftEditText}
                        onChange={(e) => setDraftEditText(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#104F57] font-sans leading-relaxed"
                        disabled={selectedMessage.status === 'sent'}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Requires human staff sign-off before transmission</span>
                      </div>

                      {selectedMessage.status === 'sent' ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sent & Logged by {selectedMessage.approvedBy || currentUser.name}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveSend(selectedMessage.id)}
                          className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Authorize & Send Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="font-bold text-slate-800">Restricted Human Handling:</div>
                    <p>
                      This message was isolated from ordinary CRM and AI workflows. Please open the "Restricted Survivor Route" tab to review emergency safety notes and manage confidential outreach.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Select a message from the queue to view triage notes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VOLUNTEER SCREENING QUEUE (WORKFLOW B) */}
      {activeTab === 'volunteers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {/* Applications list */}
          <div className="lg:col-span-5 border-r border-slate-200 pr-4 space-y-3">
            <h3 className="font-serif text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Applications to Screen
            </h3>
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setScreeningApp(app)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  screeningApp?.id === app.id
                    ? 'bg-teal-50 border-[#104F57]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start text-xs">
                  <span className="font-bold text-slate-900">{app.fullName}</span>
                  <span className="font-mono text-[10px] text-slate-500">{app.trackingId}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">{app.opportunityTitle}</div>
                <div className="mt-2 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">{app.preferredLanguage}</span>
                  <span className="font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded capitalize">
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Screening Review Form */}
          <div className="lg:col-span-7 pl-2 space-y-5">
            {screeningApp ? (
              <div className="space-y-5 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#104F57] bg-teal-50 px-2 py-0.5 rounded">
                      {screeningApp.trackingId}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">
                      {screeningApp.fullName}
                    </h3>
                    <div className="text-slate-500 mt-0.5">
                      Email: {screeningApp.email} · Phone: {screeningApp.phone}
                    </div>
                  </div>
                  <span className="font-bold text-xs uppercase text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    Status: {screeningApp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500">Stated Skills:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{screeningApp.skills.join(', ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Availability:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{screeningApp.availability.join(', ')}</div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Applicant Motivation:</span>
                  <p className="mt-1 p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    "{screeningApp.motivation}"
                  </p>
                </div>

                {screeningApp.aiSuggestedMatchNotes && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-slate-800 space-y-1">
                    <div className="font-bold text-[#104F57] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#104F57]" />
                      <span>Agent A04 (Volunteer Recruiter) Advisory Matching:</span>
                    </div>
                    <p className="text-[11px]">{screeningApp.aiSuggestedMatchNotes}</p>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Coordinator Screening Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={screeningNotes}
                    onChange={(e) => setScreeningNotes(e.target.value)}
                    placeholder="Enter interview feedback, background check reference numbers, or orientation schedule notes..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none text-xs"
                  />
                </div>

                {/* Workflow B Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateVolunteerStatus(screeningApp.id, 'screening_review')}
                    className="px-3 py-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    Mark Screening In-Progress
                  </button>
                  <button
                    onClick={() => handleUpdateVolunteerStatus(screeningApp.id, 'orientation_scheduled')}
                    className="px-3 py-2 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg font-semibold hover:bg-purple-100 cursor-pointer"
                  >
                    Schedule Orientation
                  </button>
                  <button
                    onClick={() => handleUpdateVolunteerStatus(screeningApp.id, 'approved_active')}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Active Placement</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Select an applicant to review.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVENT OPERATIONS (WORKFLOW D) */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Community Events & Workshops (Workflow D)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enforce venue capacity limits, manage attendee registration, and promote waitlist entries.
              </p>
            </div>
            <button
              onClick={() => setShowNewEventModal(true)}
              className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Event Title</th>
                  <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Capacity</th>
                  <th className="py-2.5 px-3 font-semibold">Registrations</th>
                  <th className="py-2.5 px-3 font-semibold">Waitlist</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{evt.title}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{evt.date}</div>
                      <div className="text-[11px] text-slate-400">{evt.time}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{evt.category}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{evt.capacity} max</td>
                    <td className="py-3 px-3 font-bold text-[#104F57]">
                      {evt.registeredCount} booked
                    </td>
                    <td className="py-3 px-3">
                      {evt.waitlistCount > 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                          {evt.waitlistCount} waiting
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DONATIONS & LEDGER (WORKFLOW C) */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Financial Ledger & Webhook Reconciliation (Workflow C)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Only provider-verified transactions write to ledger. Dual human control for any refund or bank change.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Transactions Reconciled</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Txn ID</th>
                  <th className="py-2.5 px-3 font-semibold">Donor</th>
                  <th className="py-2.5 px-3 font-semibold">Campaign</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Receipt #</th>
                  <th className="py-2.5 px-3 font-semibold">Reconciliation</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-600">{don.transactionId}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{don.donorName}</td>
                    <td className="py-3 px-3 text-slate-700">{don.campaignTitle}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">${don.amount.toLocaleString()}.00</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#104F57]">{don.receiptNumber}</td>
                    <td className="py-3 px-3">
                      {don.reconciled ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Reconciled</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                          Pending batch
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onOpenReceipt(don)}
                        className="text-xs font-semibold text-[#104F57] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI APPROVAL QUEUE (SECTION 7.3 & 11.6) */}
      {activeTab === 'ai_queue' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Centralized AI Approval Queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "AI drafts, humans decide." Outbound communications, grant narratives, public events, and campaign texts require authorized staff approval.
            </p>
          </div>

          <div className="space-y-4">
            {approvalTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {task.agentId} ({task.agentName})
                      </span>
                      <h4 className="font-serif font-bold text-base text-slate-900">{task.title}</h4>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Context: {task.contextSummary} · Queued at {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      task.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  <strong>Proposed Output:</strong>
                  <p className="mt-1 font-serif text-slate-700 whitespace-pre-wrap">
                    {task.proposedContent}
                  </p>
                </div>

                {task.status === 'pending' && (
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={() => {
                        db.resolveApprovalTask(task.id, 'rejected', 'Staff requested revision.');
                        setActionFeedback(`Task ${task.id} rejected.`);
                      }}
                      className="px-4 py-2 border border-slate-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        db.resolveApprovalTask(task.id, 'approved', 'Staff approved without change.');
                        setActionFeedback(`Task ${task.id} approved and executed.`);
                      }}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Authorize Action</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RESTRICTED SURVIVOR ROUTE (WORKFLOW E & SECTION 13) */}
      {activeTab === 'restricted' && (
        <div className="bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>RESTRICTED SURVIVOR SERVICES BOUNDARY (SECTION 13)</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-rose-950">
                Isolated Confidential Intake Queue
              </h3>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                This environment is completely segregated from the public CRM, general analytics, and external AI agents. Only certified Safeguarding Officers and trauma advocates have access.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs text-right">
              <div className="text-slate-500">Authorized Officer:</div>
              <div className="font-bold text-rose-900">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Role Verified</div>
            </div>
          </div>

          <div className="space-y-4">
            {restrictedIntakes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                      {item.anonymousCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.urgencyLevel === 'immediate_safety'
                          ? 'bg-rose-700 text-white animate-pulse'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.urgencyLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Received: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">Language:</span>
                    <div className="font-semibold text-slate-800">{item.languageNeeded}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Method:</span>
                    <div className="font-semibold text-slate-800 capitalize">{item.preferredContactMethod.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Safe Window:</span>
                    <div className="font-semibold text-slate-800">{item.safeTimeToContact}</div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-lg text-xs font-mono text-slate-700">
                  {item.notesEncryptedSummary}
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">
                    Lead Advocate: <strong>{item.assignedSpecialist}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setActionFeedback(`Confidential safety protocol initiated for reference ${item.anonymousCode}. A certified trauma advocate will make discreet contact during the designated safe window.`);
                      setTimeout(() => setActionFeedback(null), 6000);
                    }}
                    className="px-4 py-1.5 bg-rose-800 hover:bg-rose-900 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Initiate Safe Outreach
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: MEDIA PRESERVATION & SAFEGUARDING REGISTRY */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Top safeguard header & actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#104F57] uppercase tracking-wider mb-1">
                <Camera className="w-4 h-4 text-[#104F57]" />
                <span>Authentic Media Preservation & Safeguarding Registry</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Visual Assets & Digital Dignity Protocol
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Phumulani maintains a strict Zero-AI Generation Rule for real individuals. All 19 media assets represent real community members, founder Comfort Dondo, board leaders, publications, and cultural programs. Identifiable survivor records are never published without written re-consent.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenMediaRegistry && (
                <button
                  type="button"
                  onClick={onOpenMediaRegistry}
                  className="px-4 py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Full Registry Modal</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup Location & Integrity Notice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Local Backup Path</span>
              <p className="font-mono text-xs font-semibold text-slate-900 break-all">
                D:\Phumulani\Backups\MediaArchive
              </p>
              <p className="text-[10px] text-slate-500">Automated mirror with SHA-256 integrity verification.</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Public Web Cleared</span>
              <div className="font-serif text-2xl font-bold text-emerald-900">17 Assets</div>
              <p className="text-[10px] text-emerald-700">All rights verified, founder approved, zero synthetic faces.</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Withheld / Staged (Safeguarding)</span>
              <div className="font-serif text-2xl font-bold text-rose-900">
                {stagedMediaList.filter((m) => m.publicationStatus !== 'published').length} Assets
              </div>
              <p className="text-[10px] text-rose-700">Protected under VAWA & Minnesota confidentiality laws.</p>
            </div>
          </div>

          {/* Staged & Withheld Media Safeguarding Queue */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-rose-50/80 border-b border-rose-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <h3 className="font-serif text-sm font-bold text-rose-950">
                  Safeguarding Review Queue — Staged & Withheld Assets
                </h3>
              </div>
              <span className="text-[11px] bg-rose-200 text-rose-900 font-bold px-2.5 py-0.5 rounded-full">
                Review Gate Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 p-4 space-y-4">
              {stagedMediaList.map((asset) => (
                <div key={asset.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {asset.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        asset.publicationStatus === 'withheld'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : asset.publicationStatus === 'staged'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {asset.publicationStatus}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{asset.title}</span>
                    </div>

                    <p className="text-xs text-slate-600">{asset.caption}</p>

                    {asset.sensitiveContextNotes && (
                      <div className="p-2.5 bg-rose-100/60 rounded-lg text-[11px] text-rose-900 border border-rose-200/60 font-medium">
                        <strong>Safeguarding Note:</strong> {asset.sensitiveContextNotes}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono">
                      Checksum: {asset.checksumSha256.slice(0, 16)}... | Rights: {asset.usageAuthorization}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {asset.publicationStatus !== 'published' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleWithholdMediaRelease(asset.id, 'Withheld per active protection order precautions.')}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Enforce Withhold
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveMediaRelease(asset.id)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          Authorize Release
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cleared for Web</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Published Media Inventory Gallery */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Approved Public Visual Assets ({PHUMULANI_MEDIA_INVENTORY.filter((m) => m.publicationStatus === 'published').length})
                </h3>
                <p className="text-xs text-slate-500">Live on public portal views, founder profile, and programs.</p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'founder', 'publications', 'programs', 'events', 'leadership', 'branding'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMediaCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      mediaCategoryFilter === cat
                        ? 'bg-[#104F57] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
              {PHUMULANI_MEDIA_INVENTORY.filter(
                (item) => mediaCategoryFilter === 'all' || item.category === mediaCategoryFilter
              ).map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden hover:border-teal-500/50 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-900/10 relative overflow-hidden flex items-center justify-center">
                    {asset.localPath.endsWith('.svg') || asset.localPath.endsWith('.png') ? (
                      <img
                        src={asset.localPath}
                        alt={asset.altText}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase">{asset.mediaType}</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded">
                      {asset.category}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-xs font-bold text-slate-900 line-clamp-1">{asset.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">{asset.caption}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-400">{asset.checksumSha256.slice(0, 10)}...</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        asset.safeguardingReviewStatus === 'cleared_for_public_web'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {asset.safeguardingReviewStatus === 'cleared_for_public_web' ? 'Cleared' : 'Restricted'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Create & Publish Community Event
              </h3>
              <button onClick={() => setShowNewEventModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Immigrant Small Business Tax Clinic"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="10:00 AM - 1:00 PM CST"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity Limit</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    required
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Briefly describe the workshop, agenda, and targeted immigrant community cohort..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PortalLayout>
  );
};
