/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Community Engagement Service (M33.09)
 * Manages moderated community announcements, privacy-conscious community feedback,
 * event registrations, and community outreach communication.
 */

import {
  CommunityAnnouncement,
  CommunityFeedbackEntry,
} from '../types/phase33';
import { db } from './db';

export interface EventRegistrationItem {
  id: string;
  eventId: string;
  eventTitle: string;
  attendeeIdentifier: string; // obfuscated token or email
  attendeeName: string;
  numberOfGuests: number;
  dietaryRestrictions?: string;
  attended: boolean;
  registeredAt: string;
}

class CommunityEngagementService {
  private announcements: CommunityAnnouncement[] = [];
  private feedbackEntries: CommunityFeedbackEntry[] = [];
  private registrations: EventRegistrationItem[] = [];

  constructor() {
    this.seedEngagementData();
  }

  private seedEngagementData() {
    this.announcements = [
      {
        id: 'ANN-2026-001',
        title: 'Fall 2026 Bilingual Workforce & Career Clinics Announced',
        summary: 'Free resume coaching, mock interviews, and digital skills labs held every Tuesday and Thursday.',
        content: 'Phumulani is pleased to open registrations for our Fall Career Pathways cohort. Sessions are held at our St. Paul center with bilingual Somali and Hmong coaches available.',
        targetAudience: 'ALL_COMMUNITY',
        category: 'PROGRAM_UPDATE',
        publishStatus: 'PUBLISHED',
        publishedAt: '2026-10-15T10:00:00Z',
        moderatedByStaffName: 'Comfort Dondo',
        isPubliclyVisible: true,
      },
      {
        id: 'ANN-2026-002',
        title: 'Winter Food Security Hamper Distribution Schedule',
        summary: 'Nutritious halal staples, fresh produce, and culturally attuned essentials available bi-weekly.',
        content: 'Our food pantry distribution takes place every other Friday from 1:00 PM to 5:00 PM. No appointment needed. Free parking and transit passes provided upon request.',
        targetAudience: 'ALL_COMMUNITY',
        category: 'WORKSHOP',
        publishStatus: 'PUBLISHED',
        publishedAt: '2026-10-20T12:00:00Z',
        moderatedByStaffName: 'Marcus Chen',
        isPubliclyVisible: true,
      },
      {
        id: 'ANN-2026-003',
        title: 'Annual Healing, Sisterhood & Resilience Banquet Save-the-Date',
        summary: 'Join community leaders, partners, and supporters for an inspiring celebration of survivor empowerment.',
        content: 'Draft announcement undergoing review by Communications Committee. Keynote speakers and venue details will be finalized shortly.',
        targetAudience: 'DONORS',
        category: 'EVENT',
        publishStatus: 'PENDING_MODERATION',
        isPubliclyVisible: false,
      },
    ];

    this.feedbackEntries = [
      {
        id: 'FB-2026-01',
        category: 'PROGRAM_QUALITY',
        rating: 5,
        feedbackText: 'The resume clinic was life-changing! Amina and the volunteer coach helped me translate my overseas healthcare experience into Minnesota hospital qualifications.',
        isAnonymous: true,
        triagedStatus: 'RESOLVED',
        assignedDepartmentId: 'DEPT-COMM',
        actionTakenNotes: 'Shared with workforce coaching staff during weekly debrief.',
        submittedAt: '2026-10-22T14:15:00Z',
      },
      {
        id: 'FB-2026-02',
        category: 'ACCESSIBILITY',
        rating: 4,
        feedbackText: 'Would love weekend or late evening hours for computer lab access, as some of us work day shifts.',
        isAnonymous: false,
        submitterEmail: 'community.member@example.org',
        triagedStatus: 'REVIEWED',
        assignedDepartmentId: 'DEPT-COMM',
        actionTakenNotes: 'Proposal to add Saturday morning 10am-1pm lab session submitted to Program Manager.',
        submittedAt: '2026-10-24T09:45:00Z',
      },
    ];

    this.registrations = [
      {
        id: 'REG-001',
        eventId: 'EVT-001',
        eventTitle: 'Immigrant Women Career Pathways Showcase',
        attendeeIdentifier: 'tok-usr-412',
        attendeeName: 'Halima G.',
        numberOfGuests: 1,
        dietaryRestrictions: 'Halal',
        attended: true,
        registeredAt: '2026-10-18T11:20:00Z',
      },
      {
        id: 'REG-002',
        eventId: 'EVT-001',
        eventTitle: 'Immigrant Women Career Pathways Showcase',
        attendeeIdentifier: 'tok-usr-415',
        attendeeName: 'Pao Yang',
        numberOfGuests: 2,
        attended: true,
        registeredAt: '2026-10-19T16:00:00Z',
      },
    ];
  }

  public getAnnouncements(includeUnpublished = false): CommunityAnnouncement[] {
    if (includeUnpublished) return [...this.announcements];
    return this.announcements.filter((a) => a.publishStatus === 'PUBLISHED');
  }

  public publishAnnouncement(
    announcementId: string,
    moderatorName: string
  ): CommunityAnnouncement {
    const ann = this.announcements.find((a) => a.id === announcementId);
    if (!ann) throw new Error(`Announcement ${announcementId} not found.`);

    ann.publishStatus = 'PUBLISHED';
    ann.publishedAt = new Date().toISOString();
    ann.moderatedByStaffName = moderatorName;
    ann.isPubliclyVisible = true;

    db.logAudit({
      actor: moderatorName,
      action: 'ANNOUNCEMENT_PUBLISHED',
      details: `Published moderated announcement: "${ann.title}" (${ann.id})`,
      classification: 'PUBLIC',
    });

    return ann;
  }

  public submitFeedback(data: {
    category: CommunityFeedbackEntry['category'];
    rating: number;
    feedbackText: string;
    isAnonymous: boolean;
    submitterEmail?: string;
  }): CommunityFeedbackEntry {
    if (!data.feedbackText.trim()) throw new Error('Feedback text is required.');
    if (data.rating < 1 || data.rating > 5) throw new Error('Rating must be between 1 and 5.');

    const newFeedback: CommunityFeedbackEntry = {
      id: `FB-2026-${String(this.feedbackEntries.length + 1).padStart(2, '0')}`,
      category: data.category,
      rating: data.rating,
      feedbackText: data.feedbackText.trim(),
      isAnonymous: data.isAnonymous,
      submitterEmail: data.isAnonymous ? undefined : data.submitterEmail,
      triagedStatus: 'NEW',
      submittedAt: new Date().toISOString(),
    };

    this.feedbackEntries.push(newFeedback);
    db.logAudit({
      actor: data.isAnonymous ? 'ANONYMOUS_COMMUNITY_MEMBER' : 'COMMUNITY_MEMBER',
      action: 'COMMUNITY_FEEDBACK_RECEIVED',
      details: `Feedback received in category ${data.category} (Rating: ${data.rating}/5)`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return newFeedback;
  }

  public getFeedbackEntries(): CommunityFeedbackEntry[] {
    return [...this.feedbackEntries];
  }

  public registerForEvent(
    eventId: string,
    eventTitle: string,
    attendeeName: string,
    numberOfGuests: number,
    dietaryRestrictions?: string
  ): EventRegistrationItem {
    const reg: EventRegistrationItem = {
      id: `REG-${Date.now()}`,
      eventId,
      eventTitle,
      attendeeIdentifier: `tok-${Math.random().toString(36).substring(2, 9)}`,
      attendeeName,
      numberOfGuests,
      dietaryRestrictions,
      attended: false,
      registeredAt: new Date().toISOString(),
    };

    this.registrations.push(reg);
    return reg;
  }

  public getEventRegistrations(eventId?: string): EventRegistrationItem[] {
    if (eventId) return this.registrations.filter((r) => r.eventId === eventId);
    return [...this.registrations];
  }
}

export const communityEngagementService = new CommunityEngagementService();
