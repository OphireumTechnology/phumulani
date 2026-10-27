/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Community Engagement Tab (M33.09)
 * Moderated community bulletins, privacy-conscious feedback triage, and event registrations.
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import {
  communityEngagementService,
} from '../../services/communityEngagementService';
import {
  CommunityAnnouncement,
  CommunityFeedbackEntry,
} from '../../types/phase33';
import { User } from '../../types';

interface CommunityEngagementTabProps {
  currentUser: User;
}

export const CommunityEngagementTab: React.FC<CommunityEngagementTabProps> = ({
  currentUser,
}) => {
  const [announcements, setAnnouncements] = useState<CommunityAnnouncement[]>(
    communityEngagementService.getAnnouncements(true)
  );
  const [feedback, setFeedback] = useState<CommunityFeedbackEntry[]>(
    communityEngagementService.getFeedbackEntries()
  );
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'feedback' | 'registrations'>('announcements');

  const handlePublish = (id: string) => {
    communityEngagementService.publishAnnouncement(id, currentUser.name);
    setAnnouncements(communityEngagementService.getAnnouncements(true));
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-[#104F57] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-teal-300" />
            <span>COMMUNITY ENGAGEMENT & FEEDBACK</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Community Engagement Hub</h2>
          <p className="text-xs text-teal-100 max-w-2xl mt-1">
            Manages moderated public announcements, privacy-protected community feedback triage, and event participation records.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'announcements' ? 'bg-amber-400 text-slate-900' : 'bg-teal-800 text-white hover:bg-teal-700'
            }`}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'feedback' ? 'bg-amber-400 text-slate-900' : 'bg-teal-800 text-white hover:bg-teal-700'
            }`}
          >
            Feedback Triage ({feedback.length})
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900">Moderated Announcements & Bulletins</h3>
              <p className="text-xs text-slate-500">Every announcement requires authorized staff moderation before public display.</p>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {ann.id}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Audience: {ann.targetAudience}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Category: {ann.category}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-slate-900 mt-1">{ann.title}</h4>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ann.publishStatus === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {ann.publishStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">{ann.summary}</p>
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">{ann.content}</p>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>
                    {ann.publishedAt ? `Published on ${new Date(ann.publishedAt).toLocaleDateString()} by ${ann.moderatedByStaffName}` : 'Awaiting moderation sign-off'}
                  </span>

                  {ann.publishStatus === 'PENDING_MODERATION' && (
                    <button
                      onClick={() => handlePublish(ann.id)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-colors"
                    >
                      Approve & Publish to Community
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK TRIAGE */}
      {activeSubTab === 'feedback' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-serif font-bold text-sm text-slate-900">Community Feedback & Experience Pipeline</h3>
            <p className="text-xs text-slate-500">Privacy-conscious feedback with anonymous submission support and departmental triage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {item.id}
                    </span>
                    <div className="text-xs font-semibold text-slate-700 mt-1">{item.category}</div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-800 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{item.rating} / 5</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{item.feedbackText}"
                </div>

                {item.actionTakenNotes && (
                  <div className="text-[11px] text-teal-900 bg-teal-50 p-2 rounded border border-teal-100">
                    <span className="font-semibold">Action Taken: </span>
                    {item.actionTakenNotes}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Source: {item.isAnonymous ? 'Anonymous Community Member' : item.submitterEmail}</span>
                  <span className="font-semibold text-slate-600">{item.triagedStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
