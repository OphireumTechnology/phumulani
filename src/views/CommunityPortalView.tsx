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
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';

interface CommunityPortalViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export const CommunityPortalView: React.FC<CommunityPortalViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const state = db.getState();
  const applications = state.applications;
  const hours = state.volunteerHours;
  const opportunities = state.opportunities;

  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'log_hours' | 'training' | 'opportunities'>('overview');

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
      groupLabel: 'Volunteer Workspace',
      items: [
        { id: 'overview', label: 'My Dashboard', icon: Users },
        { id: 'applications', label: 'Application Tracking', icon: FileText, badge: applications.length },
        { id: 'log_hours', label: 'Log Service Hours', icon: Clock },
        { id: 'training', label: 'Safeguarding & Orientation', icon: ShieldCheck },
        { id: 'opportunities', label: 'Available Opportunities', icon: Award, badge: opportunities.length },
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

      {/* TAB 2: APPLICATIONS TRACKING */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Volunteer Applications Register (Workflow B)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Applicants move through tracking, AI role matching suggestions, human coordinator review, and staff placement approval.
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
