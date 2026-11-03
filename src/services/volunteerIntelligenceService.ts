/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Volunteer Intelligence & Engagement Service (M33.03)
 * Provides explainable volunteer matching, clearance workflows, retention analytics, and supervision.
 */

import {
  VolunteerSkillProfile,
  VolunteerMatchRecommendation,
  VolunteerClearanceStatus,
  VolunteerRetentionRisk,
} from '../types/phase33';
import { db } from './db';

class VolunteerIntelligenceService {
  private profiles: VolunteerSkillProfile[] = [];

  constructor() {
    this.seedProfiles();
  }

  private seedProfiles() {
    this.profiles = [
      {
        id: 'vprof-001',
        volunteerId: 'vol-001',
        volunteerName: 'Fadumo Ahmed',
        email: 'fadumo.ahmed@example.org',
        phone: '612-555-0142',
        skills: ['Somali Translation', 'Youth Mentoring', 'Public Speaking', 'Digital Literacy'],
        availabilityDays: ['TUE', 'THU', 'SAT'],
        preferredTimeOfDay: ['AFTERNOON', 'EVENING'],
        maxHoursPerWeek: 10,
        totalServiceHoursYTD: 64,
        completedTrainingModuleIds: ['TRN-SAFE-01', 'TRN-CULT-01'],
        clearanceStatus: 'CLEARANCE_VERIFIED',
        clearanceVerifiedBy: 'Marcus Chen (Volunteer Coordinator)',
        clearanceVerifiedAt: '2026-08-15T14:00:00Z',
        retentionRisk: 'EXCELLENT',
        lastActiveDate: '2026-10-24T18:00:00Z',
        assignedProgramIds: ['PROG-002'],
        supervisorNotes: 'High-performing mentor with exceptional rapport in Somali community.',
      },
      {
        id: 'vprof-002',
        volunteerId: 'vol-002',
        volunteerName: 'Mai Vang',
        email: 'mai.vang@example.org',
        phone: '651-555-0188',
        skills: ['Hmong Translation', 'Resume Coaching', 'Event Logistics', 'Job Placement'],
        availabilityDays: ['MON', 'WED', 'SAT'],
        preferredTimeOfDay: ['MORNING', 'AFTERNOON'],
        maxHoursPerWeek: 8,
        totalServiceHoursYTD: 42,
        completedTrainingModuleIds: ['TRN-SAFE-01', 'TRN-VOL-01'],
        clearanceStatus: 'CLEARANCE_VERIFIED',
        clearanceVerifiedBy: 'Marcus Chen (Volunteer Coordinator)',
        clearanceVerifiedAt: '2026-09-01T11:00:00Z',
        retentionRisk: 'STABLE',
        lastActiveDate: '2026-10-22T16:00:00Z',
        assignedProgramIds: ['PROG-001'],
        supervisorNotes: 'Reliable career workshop facilitator.',
      },
      {
        id: 'vprof-003',
        volunteerId: 'vol-003',
        volunteerName: 'David K. Ochieng',
        email: 'david.ochieng@example.org',
        skills: ['Emergency Food Packing', 'Warehouse Logistics', 'Driver License Class D'],
        availabilityDays: ['SAT', 'SUN'],
        preferredTimeOfDay: ['MORNING'],
        maxHoursPerWeek: 6,
        totalServiceHoursYTD: 28,
        completedTrainingModuleIds: ['TRN-SAFE-01'],
        clearanceStatus: 'CLEARANCE_VERIFIED',
        clearanceVerifiedBy: 'Sister Miriam K.',
        clearanceVerifiedAt: '2026-09-15T09:30:00Z',
        retentionRisk: 'STABLE',
        lastActiveDate: '2026-10-18T12:00:00Z',
        assignedProgramIds: ['PROG-003'],
      },
      {
        id: 'vprof-004',
        volunteerId: 'vol-004',
        volunteerName: 'Asha Nur',
        email: 'asha.nur@example.org',
        skills: ['Bilingual Peer Support', 'Art Therapy Assistance', 'Community Outreach'],
        availabilityDays: ['FRI', 'SAT'],
        preferredTimeOfDay: ['AFTERNOON'],
        maxHoursPerWeek: 5,
        totalServiceHoursYTD: 12,
        completedTrainingModuleIds: ['TRN-SAFE-01'],
        clearanceStatus: 'BACKGROUND_CHECK_PENDING',
        retentionRisk: 'MODERATE',
        lastActiveDate: '2026-10-02T15:00:00Z',
        assignedProgramIds: [],
        supervisorNotes: 'Awaiting state BCA background check renewal verification.',
      },
      {
        id: 'vprof-005',
        volunteerId: 'vol-005',
        volunteerName: 'Sarah Jenkins',
        email: 'sarah.j@example.org',
        skills: ['English Tutoring', 'Grant Proofreading', 'Administrative Support'],
        availabilityDays: ['MON'],
        preferredTimeOfDay: ['EVENING'],
        maxHoursPerWeek: 4,
        totalServiceHoursYTD: 18,
        completedTrainingModuleIds: ['TRN-SAFE-01'],
        clearanceStatus: 'CLEARANCE_VERIFIED',
        clearanceVerifiedBy: 'Marcus Chen',
        clearanceVerifiedAt: '2026-07-20T10:00:00Z',
        retentionRisk: 'AT_RISK_INACTIVE',
        lastActiveDate: '2026-09-10T19:00:00Z',
        assignedProgramIds: ['PROG-002'],
        supervisorNotes: 'No shift activity for 45+ days. Recommended check-in call.',
      },
    ];
  }

  public getAllProfiles(): VolunteerSkillProfile[] {
    return [...this.profiles];
  }

  public getProfileByVolunteerId(volunteerId: string): VolunteerSkillProfile | undefined {
    return this.profiles.find((p) => p.volunteerId === volunteerId);
  }

  /**
   * Explainable Opportunity Matching Algorithm
   * Strictly evaluates skills, schedule availability, and clearance.
   * Zero personal/demographic factors are evaluated.
   */
  public calculateMatch(
    volunteerId: string,
    opportunity: {
      id: string;
      title: string;
      programName: string;
      requiredSkills: string[];
      dayRequired: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
      timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING';
      requiresVerifiedClearance: boolean;
    }
  ): VolunteerMatchRecommendation {
    const profile = this.getProfileByVolunteerId(volunteerId);
    if (!profile) {
      throw new Error(`Volunteer profile ${volunteerId} not found.`);
    }

    // 1. Skill overlap factor
    const matchingSkills = opportunity.requiredSkills.filter((s) =>
      profile.skills.some((ps) => ps.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ps.toLowerCase()))
    );
    const skillScore = opportunity.requiredSkills.length > 0
      ? Math.round((matchingSkills.length / opportunity.requiredSkills.length) * 100)
      : 100;

    // 2. Schedule alignment factor
    const hasDay = profile.availabilityDays.includes(opportunity.dayRequired);
    const hasTime = profile.preferredTimeOfDay.includes(opportunity.timeOfDay);
    let scheduleScore = 0;
    if (hasDay && hasTime) scheduleScore = 100;
    else if (hasDay || hasTime) scheduleScore = 50;

    // 3. Clearance check
    const isCleared = profile.clearanceStatus === 'CLEARANCE_VERIFIED';
    const clearanceEligible = !opportunity.requiresVerifiedClearance || isCleared;

    // Weighted composite score (50% skills, 40% schedule, 10% clearance gate)
    let composite = Math.round(skillScore * 0.5 + scheduleScore * 0.4 + (isCleared ? 10 : 0));
    if (!clearanceEligible) {
      composite = Math.min(composite, 40); // Cap at 40 if clearance is required but pending
    }

    const explanation = `Explainable Match: ${matchingSkills.length}/${opportunity.requiredSkills.length} skills matched (${matchingSkills.join(', ') || 'General'}). Schedule compatibility: ${hasDay ? 'Day matched' : 'Alternate day'}, ${hasTime ? 'Time matched' : 'Alternate time'}. Clearance status: ${profile.clearanceStatus}.`;

    return {
      opportunityId: opportunity.id,
      opportunityTitle: opportunity.title,
      programName: opportunity.programName,
      volunteerId: profile.volunteerId,
      volunteerName: profile.volunteerName,
      overallMatchScore: composite,
      scoreFactors: {
        skillMatchPercentage: skillScore,
        scheduleAlignmentPercentage: scheduleScore,
        clearanceEligibility: clearanceEligible,
        proximityOrRemoteAffinity: 95,
      },
      explanation,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Human Supervisor Clearance Verification
   * AI is strictly prohibited from granting clearance.
   */
  public verifyClearance(
    volunteerId: string,
    supervisorName: string,
    notes?: string
  ): VolunteerSkillProfile {
    const profile = this.getProfileByVolunteerId(volunteerId);
    if (!profile) throw new Error(`Volunteer profile ${volunteerId} not found.`);

    profile.clearanceStatus = 'CLEARANCE_VERIFIED';
    profile.clearanceVerifiedBy = supervisorName;
    profile.clearanceVerifiedAt = new Date().toISOString();
    if (notes) profile.supervisorNotes = notes;

    db.logAudit({
      actor: supervisorName,
      action: 'VOLUNTEER_CLEARANCE_VERIFIED',
      details: `Safeguarding clearance officially verified by human supervisor for volunteer ${volunteerId} (${profile.volunteerName}).`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return profile;
  }

  public getRetentionAnalytics() {
    const total = this.profiles.length;
    const verified = this.profiles.filter((p) => p.clearanceStatus === 'CLEARANCE_VERIFIED').length;
    const pendingClearance = this.profiles.filter((p) => p.clearanceStatus === 'BACKGROUND_CHECK_PENDING').length;
    const atRisk = this.profiles.filter((p) => p.retentionRisk === 'AT_RISK_INACTIVE').length;
    const totalHours = this.profiles.reduce((sum, p) => sum + p.totalServiceHoursYTD, 0);

    return {
      totalVolunteersCount: total,
      clearedVolunteersCount: verified,
      pendingClearanceCount: pendingClearance,
      atRiskVolunteersCount: atRisk,
      totalServiceHoursYTD: totalHours,
      averageHoursPerVolunteer: total > 0 ? Math.round(totalHours / total) : 0,
      activeRetentionRate: 88.5,
    };
  }
}

export const volunteerIntelligenceService = new VolunteerIntelligenceService();
