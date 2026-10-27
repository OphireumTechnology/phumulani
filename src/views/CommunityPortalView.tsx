/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Community and Volunteer Hub (Application 2)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { User, VolunteerOpportunity } from '../types';
import {
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  Award,
  PlusCircle,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  AlertCircle,
  ChevronRight,
  UserCheck,
  LifeBuoy,
  Shield,
  Download,
  Send,
  Sparkles,
  Lock,
  Heart,
  Globe,
  Settings,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';
import { CommunityProgramsService } from '../services/communityProgramsService';

interface CommunityPortalViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export type CommunityPortalTab =
  | 'overview'
  | 'member_profile'
  | 'service_requests'
  | 'programs'
  | 'privacy_consent'
  | 'applications'
  | 'log_hours'
  | 'training'
  | 'opportunities';

export const CommunityPortalView: React.FC<CommunityPortalViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const state = db.getState();
  const applications = state.applications;
  const hours = state.volunteerHours;
  const opportunities = state.opportunities;
  const programs = state.programs;
  const communityProgramsSvc = CommunityProgramsService.getInstance();

  const [activeTab, setActiveTab] = useState<CommunityPortalTab>('overview');

  // Member Profile State
  const [memberPhone, setMemberPhone] = useState(currentUser.phoneNumber || '612-555-0188');
  const [memberLanguage, setMemberLanguage] = useState('English');
  const [memberContactPref, setMemberContactPref] = useState<'email' | 'phone' | 'signal'>('email');
  const [memberAccommodations, setMemberAccommodations] = useState('Wheelchair accessible venues, prayer space');
  const [profileSavedFeedback, setProfileSavedFeedback] = useState<string | null>(null);

  // General Service Request State (M30.06)
  const [serviceCategory, setServiceCategory] = useState<'COMMUNITY_RESOURCE' | 'EMPLOYMENT_ASSISTANCE' | 'HOUSING_REFERRAL' | 'OTHER'>('COMMUNITY_RESOURCE');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceLanguage, setServiceLanguage] = useState('English');
  const [serviceSafeTime, setServiceSafeTime] = useState('Weekday mornings 9am-12pm');
  const [serviceRequestFeedback, setServiceRequestFeedback] = useState<string | null>(null);
  const [memberServiceRequests, setMemberServiceRequests] = useState([
    {
      id: 'REQ-SRV-2026-081',
      category: 'EMPLOYMENT_ASSISTANCE',
      status: 'IN_REVIEW',
      preferredLanguage: 'English',
      safeContactTime: 'Weekday mornings',
      submittedAt: '2026-10-24T11:00:00Z',
      notes: 'Resume translation and Minnesota healthcare employer job fair registration assistance.',
    },
    {
      id: 'REQ-SRV-2026-045',
      category: 'COMMUNITY_RESOURCE',
      status: 'RESOLVED',
      preferredLanguage: 'English',
      safeContactTime: 'Anytime',
      submittedAt: '2026-10-15T09:30:00Z',
      notes: 'Winter jacket and school supplies kit requested from Cedar-Riverside depot.',
    },
  ]);

  // Program Enrollment State
  const [enrolledProgramIds, setEnrolledProgramIds] = useState<string[]>(['prog-1', 'prog-4']);
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null);

  // Privacy & Consent State (M30.06 & M30.13)
  const [consentOutcomeResearch, setConsentOutcomeResearch] = useState(true);
  const [consentNotifications, setConsentNotifications] = useState(true);
  const [consentNewsletter, setConsentNewsletter] = useState(true);
  const [dataExportStatus, setDataExportStatus] = useState<string | null>(null);

  // Log Hours Form
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logHours, setLogHours] = useState(2.5);
  const [logOpportunityTitle, setLogOpportunityTitle] = useState('Bilingual Youth Mentor & Tutor');
  const [logDescription, setLogDescription] = useState('');
  const [hoursFeedback, setHoursFeedback] = useState<string | null>(null);

  // Safeguarding Training Quiz/Ack
  const [trainingCompleted, setTrainingCompleted] = useState(true);
  const [safeModule1, setSafeModule1] = useState(true);
  const [safeModule2, setSafeModule2] = useState(true);

  // Search in opportunities
  const [oppSearch, setOppSearch] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.appendAuditLog('MEMBER_PROFILE_UPDATED', `Member profile updated for ${currentUser.name} (${currentUser.email})`);
    setProfileSavedFeedback('Member preferences and accessibility accommodations updated successfully!');
    setTimeout(() => setProfileSavedFeedback(null), 4000);
  };

  const handleCreateServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDescription.trim()) return;

    const res = communityProgramsSvc.createServiceRequest(
      {
        serviceCategory: serviceCategory,
        requestSource: 'COMMUNITY_PORTAL',
        intakeSummary: `${serviceDescription} [Language: ${serviceLanguage}, Safe Contact: ${serviceSafeTime}]`,
        responsibleDepartmentId: 'DEPT-PROG',
        priority: 'ROUTINE',
        followUpRequirement: serviceSafeTime,
      },
      currentUser.name,
      currentUser.role
    );

    if (res.isSafeguardingCrisis) {
      setServiceRequestFeedback(
        'CRISIS SAFEGUARDING NOTICE: Message contains sensitive crisis indicators. Your request has been securely quarantined directly to Sister Miriam K. and our trauma-informed safeguarding team.'
      );
    } else {
      const newReq = {
        id: res.request?.id || `REQ-SRV-${Date.now().toString().slice(-4)}`,
        category: serviceCategory,
        status: res.request?.status || 'SUBMITTED',
        preferredLanguage: serviceLanguage,
        safeContactTime: serviceSafeTime,
        submittedAt: new Date().toISOString(),
        notes: serviceDescription,
      };
      setMemberServiceRequests([newReq, ...memberServiceRequests]);
      setServiceRequestFeedback(`Service request ${newReq.id} submitted successfully! Our community advocate team has been notified.`);
      setServiceDescription('');
    }
    setTimeout(() => setServiceRequestFeedback(null), 6000);
  };

  const handleToggleEnrollment = (progId: string, progName: string) => {
    if (enrolledProgramIds.includes(progId)) {
      setEnrolledProgramIds(enrolledProgramIds.filter((id) => id !== progId));
      setEnrollmentNotice(`Withdrawn from "${progName}".`);
    } else {
      setEnrolledProgramIds([...enrolledProgramIds, progId]);
      setEnrollmentNotice(`Successfully enrolled in "${progName}"! Check your email for cohort scheduling.`);
      db.appendAuditLog('PROGRAM_ENROLLMENT', `${currentUser.name} enrolled in ${progName}`);
    }
    setTimeout(() => setEnrollmentNotice(null), 4000);
  };

  const handleExportData = () => {
    const memberData = {
      exportTimestamp: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: memberPhone,
        preferredLanguage: memberLanguage,
        contactPreference: memberContactPref,
        accommodations: memberAccommodations,
      },
      serviceRequests: memberServiceRequests,
      enrolledProgramIds,
      volunteerHoursLogged: hours.filter((h) => h.volunteerName === currentUser.name),
      consents: {
        outcomeResearch: consentOutcomeResearch,
        notifications: consentNotifications,
        newsletter: consentNewsletter,
      },
      vawaSafeguardingCertification: 'Zero general AI access to survivor case files verified under VAWA Section 1367.',
    };

    const blob = new Blob([JSON.stringify(memberData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phumulani-member-data-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDataExportStatus('Your full member data archive has been exported in compliance with digital privacy standards.');
    setTimeout(() => setDataExportStatus(null), 5000);
  };

  // Handle Log Hours
  const handleLogHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.logVolunteerHours({
      volunteerId: currentUser.id,
      volunteerName: currentUser.name,
      opportunityTitle: logOpportunityTitle,
      date: logDate,
      hours: Number(logHours),
      activityDescription: logDescription,
    });
    setHoursFeedback('Volunteer hours logged successfully! Queued for coordinator verification.');
    setLogDescription('');
    setTimeout(() => setHoursFeedback(null), 4000);
  };

  const totalVerifiedHours = hours
    .filter((h) => h.verified)
    .reduce((acc, curr) => acc + curr.hours, 0);

  const pendingHours = hours
    .filter((h) => !h.verified)
    .reduce((acc, curr) => acc + curr.hours, 0);

  const filteredOpps = opportunities.filter((o) =>
    o.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
    o.programName.toLowerCase().includes(oppSearch.toLowerCase())
  );

  const navGroups = [
    {
      groupLabel: 'Member Services (M30.06)',
      items: [
        { id: 'overview', label: 'My Dashboard', icon: Users },
        { id: 'member_profile', label: 'Member Profile', icon: UserCheck },
        { id: 'service_requests', label: 'General Service Requests', icon: LifeBuoy, badge: memberServiceRequests.length },
        { id: 'programs', label: 'Program Enrollments', icon: BookOpen, badge: enrolledProgramIds.length },
        { id: 'privacy_consent', label: 'Consent & Data Rights', icon: Shield },
      ],
    },
    {
      groupLabel: 'Volunteer Operations (M30.07)',
      items: [
        { id: 'opportunities', label: 'Opportunities & Shifts', icon: Award, badge: opportunities.length },
        { id: 'applications', label: '15-Stage Application Status', icon: FileText, badge: applications.length },
        { id: 'log_hours', label: 'Log Service Hours', icon: Clock },
        { id: 'training', label: 'Safeguarding Credentials', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="community"
      portalTitle="Community & Volunteer Hub"
      portalSubtitle="Volunteer tracking, service hours & mentorship"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId={activeTab}
      onSelectNavItem={(id) => setActiveTab(id as any)}
    >
      <div className="space-y-6">
        {/* Top Banner / Welcome */}
        <div className="bg-[#104F57] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700">
              <Users className="w-3.5 h-3.5 text-teal-300" />
              <span>VOLUNTEER PORTAL</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-teal-100/90 max-w-xl">
              Track your volunteer applications, verify service hours, complete safeguarding credentials, and support immigrant families across Minnesota.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-amber-300">{totalVerifiedHours} hrs</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Verified Service</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-white">{applications.length}</div>
              <div className="text-[10px] text-teal-200 mt-0.5">Applications</div>
            </div>
          </div>
        </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Quick Stats & Active Assignment */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Assignment Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
                    Active Placement
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mt-2">
                    Bilingual Youth Mentor & Tutor
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Program: Youth & Sisterhood Mentorship Circles · Lead Coordinator: Amina Yusuf
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700">Next Circle:</span>
                  <div className="text-xs text-emerald-700 font-bold">Thursday, 5:30 PM CST</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500">Weekly Commitment</div>
                  <div className="font-semibold text-slate-800 mt-0.5">2.0 Hours / Week</div>
                </div>
                <div>
                  <div className="text-slate-500">Current Mentees</div>
                  <div className="font-semibold text-slate-800 mt-0.5">2 Immigrant High Schoolers</div>
                </div>
                <div>
                  <div className="text-slate-500">Screening Status</div>
                  <div className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cleared & Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Volunteer Hours Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Service Hours History
                </h3>
                <button
                  onClick={() => setActiveTab('log_hours')}
                  className="text-xs font-semibold text-[#104F57] hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log New Hours</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Activity</th>
                      <th className="py-2.5 px-3 font-semibold">Hours</th>
                      <th className="py-2.5 px-3 font-semibold">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hours.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{h.date}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800">{h.opportunityTitle}</div>
                          <div className="text-[11px] text-slate-500">{h.activityDescription}</div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{h.hours} hrs</td>
                        <td className="py-2.5 px-3">
                          {h.verified ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified by {h.verifiedBy}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              Pending Review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Orientation & Credentials */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Safeguarding Credentials</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Phumulani requires all volunteers to maintain annual trauma-informed safeguarding certification before accessing community spaces.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-900">Survivor Confidentiality</div>
                    <div className="text-[11px] text-emerald-700">Valid through Oct 2027</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-900">Criminal Background Check</div>
                    <div className="text-[11px] text-emerald-700">BCA Minnesota Cleared</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-teal-950">Youth Mentorship Training</div>
                    <div className="text-[11px] text-teal-700">Completed 4-Hour Cohort</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
              </div>
            </div>

            {/* Mentor Toolkit Link */}
            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl p-6 border border-purple-200/80 space-y-3">
              <div className="font-serif font-bold text-sm text-[#633C69] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Volunteer Learning Toolkit</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access culturally adapted curriculum guides, trauma-informed conversation starters, and Minnesota resource directories.
              </p>
              <button
                onClick={() => setActiveTab('training')}
                className="text-xs font-bold text-[#104F57] hover:underline flex items-center gap-1"
              >
                <span>Access Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEMBER PROFILE (M30.06) */}
      {activeTab === 'member_profile' && (
        <div className="max-w-3xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Community Member Profile & Preferences
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your identity, communication preferences, and accessibility requirements.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#104F57] bg-teal-50 px-2.5 py-1 rounded">
              ID: {currentUser.id}
            </span>
          </div>

          {profileSavedFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{profileSavedFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal / Preferred Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Managed via core identity register</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Account authentication login</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Safe Contact Phone Number</label>
              <input
                type="tel"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                placeholder="+1 (612) 555-0149"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#104F57]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={memberLanguage}
                onChange={(e) => setMemberLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:border-[#104F57]"
              >
                <option value="English">English</option>
                <option value="Somali">Somali (Af-Soomaali)</option>
                <option value="Oromo">Oromo (Afaan Oromoo)</option>
                <option value="Amharic">Amharic (አማርኛ)</option>
                <option value="Karen">Karen (S'gaw)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Safe Contact Preference</label>
              <select
                value={memberContactPref}
                onChange={(e) => setMemberContactPref(e.target.value as 'email' | 'phone' | 'signal')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:border-[#104F57]"
              >
                <option value="email">Email Only (Safe encrypted address)</option>
                <option value="phone">Phone Call (Daytime 9am-5pm)</option>
                <option value="signal">Signal / Secure Messaging</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accessibility & Accommodations</label>
              <input
                type="text"
                value={memberAccommodations}
                onChange={(e) => setMemberAccommodations(e.target.value)}
                placeholder="e.g. Wheelchair access, ASL interpreter, large print materials"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#104F57]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Changes update your persistent community record immediately.
            </span>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-5 py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
            >
              Save Profile Updates
            </button>
          </div>
        </div>
      )}

      {/* TAB: GENERAL SERVICE REQUESTS (M30.06) */}
      {activeTab === 'service_requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Request Community Services & Support
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect with culturally responsive navigation, educational resources, career circles, or material aid.
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] max-w-sm">
                <strong>Emergency Notice:</strong> If you are in immediate physical danger, please call <strong>911</strong> or the <strong>Minnesota Day One Crisis Hotline at 1-866-223-1111</strong>.
              </div>
            </div>

            {serviceRequestFeedback && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{serviceRequestFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateServiceRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Program Need</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="COMMUNITY_RESOURCE">Community Resource & Essentials</option>
                    <option value="EMPLOYMENT_ASSISTANCE">Career & Employment Pathways</option>
                    <option value="HOUSING_REFERRAL">Housing Support & Navigation</option>
                    <option value="OTHER">General Mentorship & Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Spoken Language</label>
                  <select
                    value={serviceLanguage}
                    onChange={(e) => setServiceLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Somali">Somali</option>
                    <option value="Oromo">Oromo</option>
                    <option value="Amharic">Amharic</option>
                    <option value="Karen">Karen</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safest Time for Contact</label>
                  <select
                    value={serviceSafeTime}
                    onChange={(e) => setServiceSafeTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Mornings (9am - 12pm)">Mornings (9am - 12pm)</option>
                    <option value="Afternoons (12pm - 4pm)">Afternoons (12pm - 4pm)</option>
                    <option value="Evenings (4pm - 7pm)">Evenings (4pm - 7pm)</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details & Specific Requests</label>
                <textarea
                  rows={3}
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Describe the support you are seeking or any questions for our advocates..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Protected under Phumulani's Trauma-Informed Privacy Shield.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  Submit Service Request
                </button>
              </div>
            </form>
          </div>

          {/* Past / Active Requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-900">
              Your Submitted Requests ({memberServiceRequests.length})
            </h4>

            {memberServiceRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No active service requests recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {memberServiceRequests.map((req) => (
                  <div key={req.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="font-semibold text-xs text-slate-900">{req.category}</span>
                      </div>
                      <p className="text-xs text-slate-600">{req.notes}</p>
                      <div className="text-[10px] text-slate-400">
                        Language: {req.preferredLanguage} · Safe Contact: {req.safeContactTime} · Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-teal-50 text-[#104F57] border border-teal-200">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROGRAM ENROLLMENTS (M30.06) */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Community Program Directory & Cohorts
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enroll in our community-led initiatives, workshops, and mentorship cohorts.
                </p>
              </div>
              <span className="text-xs font-bold text-[#104F57] bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                {enrolledProgramIds.length} Enrolled
              </span>
            </div>

            {enrollmentNotice && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-[#104F57] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>{enrollmentNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {programs.map((prog) => {
                const isEnrolled = enrolledProgramIds.includes(prog.id);
                return (
                  <div
                    key={prog.id}
                    className={`p-5 rounded-xl border transition-all space-y-3 ${
                      isEnrolled ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        {prog.slug}
                      </span>
                      {isEnrolled && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Enrolled
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-sm text-slate-900">{prog.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
                      <div><strong>Lead Coordinator:</strong> {prog.leadCoordinator}</div>
                      <div><strong>Focus:</strong> {prog.tagline}</div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleToggleEnrollment(prog.id, prog.name)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isEnrolled
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-[#104F57] hover:bg-[#0c3e44] text-white'
                        }`}
                      >
                        {isEnrolled ? 'Withdraw from Program' : 'Enroll in Next Cohort'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRIVACY, CONSENT & DATA RIGHTS (M30.06) */}
      {activeTab === 'privacy_consent' && (
        <div className="max-w-3xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Data Rights, Consents & Privacy Safeguards
            </h3>
            <p className="text-xs text-slate-500">
              Manage how Phumulani uses your information and download your complete personal data record.
            </p>
          </div>

          {dataExportStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{dataExportStatus}</span>
            </div>
          )}

          {/* VAWA 1367 Certification Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#104F57]">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Statutory Privacy Certification (VAWA Section 1367)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Phumulani maintains an absolute quarantine firewall for all beneficiary intake records and sensitive case files. AI workforce agents, third-party analytics, and unauthorized personnel possess zero access to survivor identities or case narratives under 8 U.S.C. § 1367.
            </p>
          </div>

          {/* Consent Toggles */}
          <div className="space-y-4 text-xs pt-2">
            <div className="flex items-start justify-between gap-4 p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-bold text-slate-900">Anonymized Impact & Outcome Research</div>
                <p className="text-slate-500 mt-0.5">
                  Allow Phumulani to include aggregated, non-personally identifiable program graduation numbers in philanthropic grant reports.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consentOutcomeResearch}
                onChange={(e) => setConsentOutcomeResearch(e.target.checked)}
                className="w-4 h-4 mt-1 accent-[#104F57] cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-bold text-slate-900">Cohort Scheduling & Urgent Service SMS</div>
                <p className="text-slate-500 mt-0.5">
                  Receive SMS reminders for upcoming mentorship meetings, tutoring sessions, and program updates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consentNotifications}
                onChange={(e) => setConsentNotifications(e.target.checked)}
                className="w-4 h-4 mt-1 accent-[#104F57] cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 border border-slate-200 rounded-lg">
              <div>
                <div className="font-bold text-slate-900">Community Monthly Newsletter</div>
                <p className="text-slate-500 mt-0.5">
                  Receive our monthly community bulletin featuring cultural celebrations, new program launches, and donor highlights.
                </p>
              </div>
              <input
                type="checkbox"
                checked={consentNewsletter}
                onChange={(e) => setConsentNewsletter(e.target.checked)}
                className="w-4 h-4 mt-1 accent-[#104F57] cursor-pointer"
              />
            </div>
          </div>

          {/* Data Export & Portability */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900">Personal Data Portability Archive</div>
              <p className="text-[11px] text-slate-500">Download a verified JSON copy of your profile, requests, and enrollments.</p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export My Data Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS TRACKING & 15-STAGE LIFECYCLE (M30.07) */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-8">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Volunteer Lifecycle & Application Management (M30.07)
            </h3>
            <p className="text-xs text-slate-500">
              End-to-end 15-stage workflow governing recruitment, AI matching, safeguarding clearance, deployment, and service hour certification.
            </p>
          </div>

          {/* 15-Stage Master Lifecycle Flow Diagram */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Phumulani 15-Stage Volunteer Operational Pipeline
              </span>
              <span className="text-[11px] font-mono text-[#104F57] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Standard M30.07 Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-[11px]">
              {[
                { num: '01', name: 'Discovery & Intake', desc: 'Web form submission & deduplication' },
                { num: '02', name: 'Identity & Legal', desc: 'Contact info & consent registration' },
                { num: '03', name: 'Skills & Language', desc: 'Multilingual fluency audit' },
                { num: '04', name: 'AI Match Evaluation', desc: 'Agent A04 skill recommendation' },
                { num: '05', name: 'Coordinator Review', desc: 'Human-in-the-loop screening' },
                { num: '06', name: 'Staff Interview', desc: 'Trauma-informed values interview' },
                { num: '07', name: 'Reference Audits', desc: 'Community peer references verified' },
                { num: '08', name: 'Criminal Background', desc: 'BCA & child protection check' },
                { num: '09', name: 'Safeguarding Module', desc: 'VAWA 1367 & confidentiality' },
                { num: '10', name: 'Staff Authorization', desc: 'Director credentialing approval' },
                { num: '11', name: 'Program Placement', desc: 'Assignment to youth or advocacy' },
                { num: '12', name: 'Shift Scheduling', desc: 'Calendar sync & slot reservation' },
                { num: '13', name: 'Hours Auditing', desc: 'Supervisor verification queue' },
                { num: '14', name: 'Quarterly Check-In', desc: 'Feedback & support review' },
                { num: '15', name: 'Milestone / Renewal', desc: 'Impact awards & annual recert' },
              ].map((stage) => (
                <div
                  key={stage.num}
                  className="p-2.5 rounded-lg border bg-white border-slate-200 space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-[#104F57] text-white flex items-center justify-center text-[9px] font-mono">
                      {stage.num}
                    </span>
                    <span className="truncate">{stage.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Volunteer Applications */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-900">
              Active Application Records ({applications.length})
            </h4>

            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#104F57] bg-teal-50 px-2 py-0.5 rounded">
                        {app.trackingId}
                      </span>
                      <h4 className="font-serif font-bold text-base text-slate-900">
                        {app.opportunityTitle}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Applicant: <strong>{app.fullName}</strong> ({app.email}) · Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      app.status === 'approved_active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'screening_review'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Workflow B Step Indicator */}
                <div className="bg-slate-50 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span className={app.submittedAt ? 'font-bold text-emerald-700' : ''}>1. Application Received ✓</span>
                  <span>→</span>
                  <span className={app.aiSuggestedMatchNotes ? 'font-bold text-emerald-700' : ''}>2. AI Match Evaluated ✓</span>
                  <span>→</span>
                  <span className={app.status !== 'submitted' ? 'font-bold text-emerald-700' : 'text-slate-400'}>3. Coordinator Screening</span>
                  <span>→</span>
                  <span className={app.safeguardingAcknowledged ? 'font-bold text-emerald-700' : 'text-slate-400'}>4. Safeguarding Orientation</span>
                  <span>→</span>
                  <span className={app.status === 'approved_active' ? 'font-bold text-emerald-700' : 'text-slate-400'}>5. Placement Approved</span>
                </div>

                {app.aiSuggestedMatchNotes && (
                  <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-[#104F57] flex items-center gap-1.5">
                      <span>Agent A04 (Volunteer Recruiter) Advisory Assessment:</span>
                    </div>
                    <p className="text-slate-700">{app.aiSuggestedMatchNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOG SERVICE HOURS */}
      {activeTab === 'log_hours' && (
        <div className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Log Volunteer Service Hours
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Service hours are verified by program coordinators for community impact reporting and volunteer milestone recognition.
            </p>
          </div>

          {hoursFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{hoursFeedback}</span>
            </div>
          )}

          <form onSubmit={handleLogHoursSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={logHours}
                  onChange={(e) => setLogHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Program / Activity Assignment</label>
              <select
                value={logOpportunityTitle}
                onChange={(e) => setLogOpportunityTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs"
              >
                {opportunities.map((o) => (
                  <option key={o.id} value={o.title}>
                    {o.title} ({o.programName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brief Description of Activities Completed</label>
              <textarea
                rows={4}
                required
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
                placeholder="e.g. Conducted 1-on-1 geometry tutoring, reviewed high school graduation requirements, assisted student with college scholarship search."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold transition-colors cursor-pointer"
            >
              Submit Service Record
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: TRAINING & SAFEGUARDING */}
      {activeTab === 'training' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Trauma-Informed Safeguarding & Orientation Curriculum
            </h3>
            <p className="text-xs text-slate-500">
              Mandatory orientation governed by Phumulani Safeguarding Lead Sister Miriam K.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Module 1: Cultural Humility & Survivor Privacy
                </h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understanding Minnesota immigrant community dynamics, trauma triggers, language access rights, and the absolute prohibition on sharing beneficiary identities or locations.
              </p>
              <div className="text-[11px] text-slate-400">Duration: 45 Minutes · Verified</div>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Module 2: Mandatory Escalation & Emergency Protocols
                </h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                How to recognize imminent threat indicators, Minnesota mandated reporting obligations for vulnerable adults and children, and immediate escalation channels to designated officers.
              </p>
              <div className="text-[11px] text-slate-400">Duration: 60 Minutes · Verified</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OPPORTUNITIES DIRECTORY */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                placeholder="Search volunteer opportunities..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpps.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-[#104F57] bg-teal-50 px-2 py-0.5 rounded">
                    {o.commitment}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{o.openSlots} openings</span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900">{o.title}</h4>
                <p className="text-xs text-slate-600">{o.description}</p>
                <div className="pt-2 text-[11px] text-slate-500 space-y-1 border-t border-slate-100">
                  <div><strong>Location:</strong> {o.location}</div>
                  <div><strong>Languages:</strong> {o.languagesNeeded.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </PortalLayout>
  );
};
