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
      <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-teal bg-phumulani-charcoal px-3 py-0.5 rounded-full border border-phumulani-teal mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-phumulani-teal" />
            <span>COMMUNITY ENGAGEMENT & FEEDBACK</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Community Engagement Hub</h2>
          <p className="text-xs text-phumulani-cream max-w-2xl mt-1">
            Manages moderated public announcements, privacy-protected community feedback triage, and event participation records.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'announcements' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'feedback' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Feedback Triage ({feedback.length})
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-phumulani-charcoal">Moderated Announcements & Bulletins</h3>
              <p className="text-xs text-phumulani-charcoal">Every announcement requires authorized staff moderation before public display.</p>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                        {ann.id}
                      </span>
                      <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                        Audience: {ann.targetAudience}
                      </span>
                      <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                        Category: {ann.category}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-phumulani-charcoal mt-1">{ann.title}</h4>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      ann.publishStatus === 'PUBLISHED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                        : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                    }`}
                  >
                    {ann.publishStatus}
                  </span>
                </div>

                <p className="text-xs text-phumulani-charcoal font-medium">{ann.summary}</p>
                <p className="text-xs text-phumulani-charcoal bg-phumulani-cream p-3 rounded-lg border border-phumulani-cream">{ann.content}</p>

                <div className="pt-2 border-t border-phumulani-cream flex justify-between items-center text-xs text-phumulani-charcoal">
                  <span>
                    {ann.publishedAt ? `Published on ${new Date(ann.publishedAt).toLocaleDateString()} by ${ann.moderatedByStaffName}` : 'Awaiting moderation sign-off'}
                  </span>

                  {ann.publishStatus === 'PENDING_MODERATION' && (
                    <button
                      onClick={() => handlePublish(ann.id)}
                      className="px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-semibold rounded-lg text-xs transition-colors"
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
          <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
            <h3 className="font-serif font-bold text-sm text-phumulani-charcoal">Community Feedback & Experience Pipeline</h3>
            <p className="text-xs text-phumulani-charcoal">Privacy-conscious feedback with anonymous submission support and departmental triage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                      {item.id}
                    </span>
                    <div className="text-xs font-semibold text-phumulani-charcoal mt-1">{item.category}</div>
                  </div>

                  <div className="flex items-center gap-1 bg-phumulani-cream border border-phumulani-gold px-2 py-0.5 rounded text-phumulani-charcoal text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-phumulani-gold text-phumulani-earth" />
                    <span>{item.rating} / 5</span>
                  </div>
                </div>

                <div className="text-xs text-phumulani-charcoal bg-phumulani-cream p-3 rounded-lg border border-phumulani-cream italic">
                  "{item.feedbackText}"
                </div>

                {item.actionTakenNotes && (
                  <div className="text-[11px] text-phumulani-earth bg-phumulani-cream p-2 rounded border border-phumulani-cream">
                    <span className="font-semibold">Action Taken: </span>
                    {item.actionTakenNotes}
                  </div>
                )}

                <div className="pt-2 border-t border-phumulani-cream flex justify-between items-center text-[11px] text-phumulani-charcoal">
                  <span>Source: {item.isAnonymous ? 'Anonymous Community Member' : item.submitterEmail}</span>
                  <span className="font-semibold text-phumulani-charcoal">{item.triagedStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
