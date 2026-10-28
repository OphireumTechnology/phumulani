/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 35 Member Self-Service Views (M35.11)
 * Supporting 9 distinct dashboard views for the constituent lifecycle
 */

import React, { useState } from 'react';
import {
  LifeBuoy,
  BookOpen,
  FileCheck2,
  Compass,
  Calendar,
  Bell,
  UserCheck,
  Settings,
  Award,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { phase35Service } from '../../services/phase35Service';
import { db } from '../../services/db';
import {
  IntegratedServiceRequest,
  ResourceReferralRecord,
  ProgramEnrollmentApplication,
  CommunityNotification,
  UserNotificationPreferences,
} from '../../types/phase35';
import { User } from '../../types';

interface MemberSelfServiceSectionProps {
  activeTab: string;
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const MemberSelfServiceSection: React.FC<MemberSelfServiceSectionProps> = ({
  activeTab,
  currentUser,
}) => {
  // Common member ID lookup (defaults to demo member usr-mem-01 if currentUser is admin or staff)
  const memberId =
    currentUser.role === 'PUBLIC_VISITOR' || currentUser.role === 'COMMUNITY_MEMBER'
      ? currentUser.id || 'usr-mem-01'
      : 'usr-mem-01';

  // State collections from Phase35Service
  const [requests, setRequests] = useState<IntegratedServiceRequest[]>(
    phase35Service.getMemberServiceRequests(memberId)
  );
  const [referrals, setReferrals] = useState<ResourceReferralRecord[]>(
    phase35Service.getMemberReferrals(memberId)
  );
  const [enrollments, setEnrollments] = useState<ProgramEnrollmentApplication[]>(
    phase35Service.getMemberEnrollments(memberId)
  );
  const [notifications, setNotifications] = useState<CommunityNotification[]>(
    phase35Service.getUserNotifications(memberId)
  );
  const [notifPreferences, setNotifPreferences] = useState<UserNotificationPreferences>(
    phase35Service.getUserPreferences(memberId)
  );

  // New Request Form state
  const [newCategory, setNewCategory] = useState('EMERGENCY_SUPPLIES');
  const [newPriority, setNewPriority] = useState<'ROUTINE' | 'EXPEDITED' | 'URGENT'>('ROUTINE');
  const [newSummary, setNewSummary] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Feedback modal / rating state
  const [activeFeedbackModalReq, setActiveFeedbackModalReq] = useState<IntegratedServiceRequest | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Referral outcome state
  const [referralFeedbackId, setReferralFeedbackId] = useState<string | null>(null);
  const [referralNotes, setReferralNotes] = useState('');

  // Program Enrollment modal
  const [selectedProgForEnroll, setSelectedProgForEnroll] = useState('PROG-001');
  const [selectedProgTitle, setSelectedProgTitle] = useState('East African Women Entrepreneurship Lab');
  const [enrollReason, setEnrollReason] = useState('');
  const [enrollSubmitted, setEnrollSubmitted] = useState<string | null>(null);

  // Event registration state
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([
    {
      id: 'evt-1',
      title: 'Immigrant Women Career Pathways Showcase',
      date: '2026-11-12T10:00:00Z',
      location: 'Cedar-Riverside Community Center, Minneapolis',
      status: 'confirmed',
      checkedIn: false,
    },
    {
      id: 'evt-2',
      title: 'Multilingual Financial Capability & Credit Workshop',
      date: '2026-11-20T17:30:00Z',
      location: 'East Side Neighborhood Center, St. Paul',
      status: 'confirmed',
      checkedIn: true,
    },
  ]);

  // Profile preferences
  const [profileName, setProfileName] = useState(currentUser.name || 'Amina Warsame');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || 'amina.w@example.com');
  const [profilePhone, setProfilePhone] = useState(currentUser.phoneNumber || '(612) 555-0188');
  const [profileLanguage, setProfileLanguage] = useState('Somali (Af-Soomaali)');
  const [profileAccommodations, setProfileAccommodations] = useState('Wheelchair accessible venues, prayer space, large print materials');
  const [profileSafeContact, setProfileSafeContact] = useState('Morning phone call or secure text message');
  const [emergencyContact, setEmergencyContact] = useState('Sister Khadija — (612) 555-0199');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const result = phase35Service.createServiceRequest({
      memberId,
      memberName: profileName,
      memberEmail: profileEmail,
      memberPhone: profilePhone,
      serviceCategory: newCategory,
      priority: newPriority,
      intakeSummary: newSummary,
    });

    setRequests(phase35Service.getMemberServiceRequests(memberId));
    setNewSummary('');
    if (result.isSafeguardingCrisis) {
      setFeedbackMsg('CRISIS SAFEGUARDING ACTIVATED: Your request was securely quarantined to Sister Miriam K. and our trauma-informed safeguarding team.');
    } else {
      setFeedbackMsg(`Service request ${result.request.id} (${result.request.trackingReference}) created successfully!`);
    }
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleSubmitFeedback = (requestId: string) => {
    if (!feedbackComment.trim()) return;
    phase35Service.submitMemberFeedback(requestId, memberId, satisfactionScore, feedbackComment);
    setRequests(phase35Service.getMemberServiceRequests(memberId));
    setActiveFeedbackModalReq(null);
    setFeedbackComment('');
    setFeedbackMsg('Thank you for your feedback! It helps improve community care.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleRecordReferralOutcome = (referralId: string) => {
    if (!referralNotes.trim()) return;
    phase35Service.recordReferralOutcome(referralId, referralNotes, true);
    setReferrals(phase35Service.getMemberReferrals(memberId));
    setReferralFeedbackId(null);
    setReferralNotes('');
    setFeedbackMsg('Referral follow-up feedback saved!');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleEnrollProgram = (e: React.FormEvent) => {
    e.preventDefault();
    const app = phase35Service.applyForProgramEnrollment({
      programId: selectedProgForEnroll,
      programTitle: selectedProgTitle,
      memberId,
      memberName: profileName,
      memberEmail: profileEmail,
    });
    setEnrollments(phase35Service.getMemberEnrollments(memberId));
    setEnrollReason('');
    setEnrollSubmitted(`Application ${app.id} submitted! Status: ${app.status} (Waitlist #${app.waitlistPosition || 0})`);
    setTimeout(() => setEnrollSubmitted(null), 5000);
  };

  const handleMarkNotificationRead = (id: string) => {
    phase35Service.markNotificationRead(id, memberId);
    setNotifications(phase35Service.getUserNotifications(memberId));
  };

  const handleTogglePreference = (key: keyof UserNotificationPreferences) => {
    const updated = phase35Service.updateUserPreferences(memberId, {
      [key]: !notifPreferences[key],
    });
    setNotifPreferences({ ...updated });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.appendAuditLog('MEMBER_PROFILE_UPDATED', `Member profile updated for ${profileName} (${memberId})`);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 4000);
  };

  const handleEventCheckin = (eventId: string) => {
    setUserRegisteredEvents(
      userRegisteredEvents.map((ev) =>
        ev.id === eventId ? { ...ev, checkedIn: true } : ev
      )
    );
    db.appendAuditLog('EVENT_CHECKIN', `Attendee checked in to event ${eventId}`);
    setFeedbackMsg('Checked in successfully! Welcome to the event.');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // ===========================================================================
  // RENDER SECTIONS BASED ON TAB
  // ===========================================================================

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-[#104F57] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-teal-700 hover:text-teal-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW 1: MY SERVICE REQUESTS */}
      {activeTab === 'service_requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-[#104F57]" />
                  <span>My Service Requests & Follow-Up Tracking</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track real-time lifecycle status, coordinator assignments, SLA milestones, and provide service resolution feedback.
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] max-w-sm">
                <strong>Safeguarding Notice:</strong> Crisis requests are quarantined under VAWA Section 1367 directly to Sister Miriam K.
              </div>
            </div>

            {/* Intake Form */}
            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-800 text-sm">Submit New Service Request</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Service Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="EMERGENCY_SUPPLIES">Emergency Supplies & Winterization</option>
                    <option value="EMPLOYMENT_ASSISTANCE">Employment & Career Coaching</option>
                    <option value="HOUSING_REFERRAL">Housing Stability & Rental Navigation</option>
                    <option value="COMMUNITY_RESOURCE">Food Pantry & Community Resources</option>
                    <option value="OTHER">General Constituent Inquiries</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Urgency Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ROUTINE">Routine (72h SLA)</option>
                    <option value="EXPEDITED">Expedited (24h SLA)</option>
                    <option value="URGENT">Urgent (12h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Request Details & Needs</label>
                <textarea
                  rows={3}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe your family's needs, language preferences, or any specific deadlines..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Submissions receive a tracking number and automated SLA countdown.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  Submit Service Request
                </button>
              </div>
            </form>

            {/* List of Requests */}
            <div className="space-y-4 pt-2">
              <h4 className="font-serif text-sm font-bold text-slate-900">
                Active & Completed Requests ({requests.length})
              </h4>

              {requests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No service requests found for your account.
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {req.trackingReference}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">
                            {req.serviceCategory.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            req.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-200' :
                            req.priority === 'EXPEDITED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {req.priority}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          req.status === 'RESOLVED' || req.status === 'CLOSED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{req.intakeSummary}</p>

                      {/* Coordinator & SLA */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <strong>Assigned Coordinator:</strong> {req.assignedStaffName || 'Triage in Progress'}
                        </div>
                        <div>
                          <strong>Department:</strong> {req.assignedDepartmentId}
                        </div>
                        <div>
                          <strong>SLA Target:</strong> {new Date(req.slaDeadline).toLocaleDateString()} ({req.isEscalated ? 'Escalated' : 'On Track'})
                        </div>
                      </div>

                      {/* Timeline */}
                      {req.timeline && req.timeline.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity History</div>
                          <div className="space-y-1">
                            {req.timeline.map((t) => (
                              <div key={t.id} className="text-[11px] text-slate-600 flex items-start gap-2">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                                </span>
                                <span>{t.notes}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution & Feedback */}
                      {req.resolutionSummary && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs space-y-1">
                          <div className="font-bold text-emerald-900">Resolution Summary:</div>
                          <div className="text-emerald-800">{req.resolutionSummary}</div>
                          {req.feedback ? (
                            <div className="pt-1 text-[11px] text-emerald-700 font-medium">
                              Your rating: {req.feedback.satisfactionScore}/5 stars — "{req.feedback.feedbackText}"
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveFeedbackModalReq(req)}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#104F57] hover:underline"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>Provide Service Feedback</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Modal */}
          {activeFeedbackModalReq && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Rate Your Experience ({activeFeedbackModalReq.trackingReference})
                </h4>
                <p className="text-xs text-slate-500">
                  How satisfied were you with the support provided by {activeFeedbackModalReq.assignedStaffName || 'our team'}?
                </p>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSatisfactionScore(score)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          score <= satisfactionScore
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {satisfactionScore}/5 Stars
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Feedback & Comments
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what went well or how we can improve..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveFeedbackModalReq(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitFeedback(activeFeedbackModalReq.id)}
                    className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#104F57]" />
                <span>My Enrolled Programs & Attendance Tracking</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active cohort participation, session schedules, mentor check-ins, and graduation credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border border-slate-200 rounded-xl space-y-3 bg-teal-50/30">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                    Active Enrollment
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-700">85% Attendance</span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900">
                  East African Women Entrepreneurship Lab
                </h4>
                <p className="text-xs text-slate-600">
                  Cohort 4: Business planning, microloan readiness, and commercial licensing for Somali & Oromo women founders.
                </p>
                <div className="pt-2 border-t border-teal-100 text-[11px] text-slate-500 space-y-1">
                  <div><strong>Lead Instructor:</strong> Comfort Dondo & Dr. Elena Rostova</div>
                  <div><strong>Next Session:</strong> Saturday, Nov 14 · 10:00 AM - 1:00 PM</div>
                  <div><strong>Location:</strong> Minneapolis Urban Hub & Virtual Zoom</div>
                </div>
                <div className="pt-2 flex gap-2">
                  <span className="px-3 py-1 bg-white border border-teal-200 text-teal-900 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Graduation Ready (Dec 2026)</span>
                  </span>
                </div>
              </div>

              <div className="p-5 border border-slate-200 rounded-xl space-y-3 bg-purple-50/30">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded">
                    Active Enrollment
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-700">100% Attendance</span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Bilingual Youth Mentorship & Homework Circles
                </h4>
                <p className="text-xs text-slate-600">
                  Weekly 1-on-1 tutoring, college readiness counseling, and cross-cultural leadership circles.
                </p>
                <div className="pt-2 border-t border-purple-100 text-[11px] text-slate-500 space-y-1">
                  <div><strong>Assigned Mentor:</strong> Amina Yusuf</div>
                  <div><strong>Next Session:</strong> Tuesday, Nov 10 · 4:30 PM - 6:30 PM</div>
                  <div><strong>Location:</strong> Cedar-Riverside Tutoring Center</div>
                </div>
                <div className="pt-2 flex gap-2">
                  <span className="px-3 py-1 bg-white border border-purple-200 text-purple-900 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Fall Term Certificate Pending</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MY ENROLLMENT APPLICATIONS */}
      {activeTab === 'enrollment_apps' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#104F57]" />
                  <span>My Program Enrollment Applications</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted applications, capacity waitlist tracking, and intake verification.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProgForEnroll('PROG-001');
                  setSelectedProgTitle('East African Women Entrepreneurship Lab');
                }}
                className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Apply to Program</span>
              </button>
            </div>

            {/* Quick Apply Panel */}
            <form onSubmit={handleEnrollProgram} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-900">New Program Application</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Program</label>
                  <select
                    value={selectedProgForEnroll}
                    onChange={(e) => {
                      setSelectedProgForEnroll(e.target.value);
                      setSelectedProgTitle(e.target.value === 'PROG-001' ? 'East African Women Entrepreneurship Lab' : 'Cedar-Riverside Youth Tech Mentorship');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PROG-001">East African Women Entrepreneurship Lab</option>
                    <option value="PROG-002">Cedar-Riverside Youth Tech Mentorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason / Goals for Joining</label>
                  <input
                    type="text"
                    required
                    value={enrollReason}
                    onChange={(e) => setEnrollReason(e.target.value)}
                    placeholder="e.g. Developing catering small business plan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-500">Waitlist spots allocated based on verified intake priorities.</span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white font-bold rounded-lg"
                >
                  Submit Application
                </button>
              </div>
            </form>

            {enrollSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{enrollSubmitted}</span>
              </div>
            )}

            {/* Applications List */}
            <div className="space-y-3">
              {enrollments.map((app) => (
                <div key={app.id} className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{app.programTitle}</span>
                    </div>
                    <div className="text-xs text-slate-600">{app.eligibilityNotes}</div>
                    <div className="text-[10px] text-slate-400">
                      Applied: {new Date(app.submissionDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.waitlistPosition && app.waitlistPosition > 0 ? (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Waitlist #{app.waitlistPosition}
                      </span>
                    ) : null}
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: MY RESOURCE REFERRALS */}
      {activeTab === 'resource_referrals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#104F57]" />
                <span>My Community Resource Referrals & Follow-Up</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified community resources shared with you by Phumulani coordinators, directions, and outcome feedback.
              </p>
            </div>

            {referrals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No active community resource referrals on file.
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref.id} className="p-5 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {ref.id}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-slate-900">{ref.resourceTitle}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase">
                        {ref.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ref.publicContactInfo?.phone || 'Available upon intake'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ref.publicContactInfo?.email || 'Direct intake email'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ref.publicContactInfo?.addressNotes || 'Hennepin County Service Hub'}</span>
                      </div>
                    </div>

                    {/* Outcome feedback box */}
                    {ref.outcomeNotes ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900">
                        <strong>Outcome Recorded:</strong> {ref.outcomeNotes}
                      </div>
                    ) : (
                      <div className="pt-2">
                        {referralFeedbackId === ref.id ? (
                          <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <label className="block font-semibold text-slate-700">
                              Did this referral connect you with the help you needed?
                            </label>
                            <input
                              type="text"
                              value={referralNotes}
                              onChange={(e) => setReferralNotes(e.target.value)}
                              placeholder="e.g. Connected successfully with counselor, appointment set for next Tuesday."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setReferralFeedbackId(null)}
                                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRecordReferralOutcome(ref.id)}
                                className="px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white font-bold rounded-lg"
                              >
                                Save Feedback
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReferralFeedbackId(ref.id)}
                            className="text-xs font-bold text-[#104F57] hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Share Outcome Feedback for this Referral</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: MY EVENTS */}
      {activeTab === 'member_events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#104F57]" />
                <span>My Registered Community Events & Attendance Check-In</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upcoming workshops, community galas, resource distributions, and mobile check-in verification.
              </p>
            </div>

            <div className="space-y-4">
              {userRegisteredEvents.map((evt) => (
                <div key={evt.id} className="p-5 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      Registration Confirmed
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900">{evt.title}</h4>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(evt.date).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {evt.checkedIn ? (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Checked In</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEventCheckin(evt.id)}
                        className="px-4 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Self Check-In Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: MY NOTIFICATIONS */}
      {activeTab === 'member_notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#104F57]" />
                  <span>My Notification Center</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  In-app notifications, program alerts, shift schedules, and referral updates.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                {notifications.filter((n) => !n.isRead).length} Unread
              </span>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border rounded-xl flex items-start justify-between gap-3 ${
                    notif.isRead
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-teal-50/40 border-teal-200 text-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                        {notif.category.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-xs">{notif.title}</span>
                    </div>
                    <p className="text-xs text-slate-700">{notif.message}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()} · Delivery: {notif.inAppDelivered ? 'In-App' : 'Queued'} (External Email: {notif.externalEmailDeliveryStatus})
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkNotificationRead(notif.id)}
                      className="text-xs font-bold text-[#104F57] hover:underline whitespace-nowrap cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 7: MY PROFILE */}
      {activeTab === 'member_profile' && (
        <div className="max-w-3xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#104F57]" />
              <span>Community Member Profile & Accessibility Settings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Culturally responsive language preferences, safe contact methods, and accessibility accommodations.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile information successfully updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal / Preferred Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Safe Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
                <select
                  value={profileLanguage}
                  onChange={(e) => setProfileLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="English">English</option>
                  <option value="Somali (Af-Soomaali)">Somali (Af-Soomaali)</option>
                  <option value="Oromo (Afaan Oromoo)">Oromo (Afaan Oromoo)</option>
                  <option value="Amharic (አማርኛ)">Amharic (አማርኛ)</option>
                  <option value="Spanish (Español)">Spanish (Español)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Safe Contact Instructions</label>
              <input
                type="text"
                value={profileSafeContact}
                onChange={(e) => setProfileSafeContact(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accessibility Accommodations</label>
              <input
                type="text"
                value={profileAccommodations}
                onChange={(e) => setProfileAccommodations(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white font-bold rounded-lg cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 8: MY COMMUNICATION PREFERENCES */}
      {activeTab === 'comm_preferences' && (
        <div className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#104F57]" />
              <span>Communication & Alert Preferences</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select what alerts you wish to receive. External email dispatch requires live Google Workspace connection.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">In-App Notifications</div>
                <div className="text-slate-500">Real-time alerts displayed inside the member portal</div>
              </div>
              <input
                type="checkbox"
                checked={notifPreferences.inAppEnabled}
                onChange={() => handleTogglePreference('inAppEnabled')}
                className="h-4 w-4 text-[#104F57] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Service Request Updates</div>
                <div className="text-slate-500">Milestones, coordinator notes, and SLA status changes</div>
              </div>
              <input
                type="checkbox"
                checked={notifPreferences.serviceUpdates}
                onChange={() => handleTogglePreference('serviceUpdates')}
                className="h-4 w-4 text-[#104F57] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Program & Cohort Alerts</div>
                <div className="text-slate-500">Application approvals, schedule reminders, and session materials</div>
              </div>
              <input
                type="checkbox"
                checked={notifPreferences.programAlerts}
                onChange={() => handleTogglePreference('programAlerts')}
                className="h-4 w-4 text-[#104F57] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Volunteer Shift Reminders</div>
                <div className="text-slate-500">Reminders for upcoming volunteer service shifts</div>
              </div>
              <input
                type="checkbox"
                checked={notifPreferences.volunteerReminders}
                onChange={() => handleTogglePreference('volunteerReminders')}
                className="h-4 w-4 text-[#104F57] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Community Governance Notices</div>
                <div className="text-slate-500">Annual meeting invitations and board updates</div>
              </div>
              <input
                type="checkbox"
                checked={notifPreferences.governanceNotices}
                onChange={() => handleTogglePreference('governanceNotices')}
                className="h-4 w-4 text-[#104F57] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 9: MY FEEDBACK HISTORY */}
      {activeTab === 'feedback_history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#104F57]" />
                <span>My Feedback History & Quality Assurance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your past reviews, satisfaction ratings, and resolved constituent feedback.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">5/5 Stars</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Oct 24, 2026</span>
                </div>
                <p className="text-xs text-slate-700">
                  "The emergency supplies and winter coats arrived right on time for our children. Coordinator Amina was compassionate and respectful of our privacy."
                </p>
                <div className="text-[10px] text-teal-800 font-semibold">
                  Reference: TRK-SRV-4819 · Resolved by Amina Yusuf
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-2">4/5 Stars</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Oct 16, 2026</span>
                </div>
                <p className="text-xs text-slate-700">
                  "Very informative resume workshop. Would appreciate having materials translated into Oromo as well next time."
                </p>
                <div className="text-[10px] text-teal-800 font-semibold">
                  Reference: TRK-SRV-1029 · Resolved by David Mwangi
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
