/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Advanced Community Program Management Service (M33.04)
 * Handles program lifecycle, eligibility rules, waitlist queuing, capacity tracking, and milestone outcomes.
 */

import {
  EnhancedCommunityProgramDetail,
  ProgramEligibilityRule,
  ProgramWaitlistEntry,
} from '../types/phase33';
import { db } from './db';

class AdvancedProgramManagementService {
  private programs: EnhancedCommunityProgramDetail[] = [];
  private waitlist: ProgramWaitlistEntry[] = [];

  constructor() {
    this.seedPrograms();
  }

  private seedPrograms() {
    this.programs = [
      {
        programId: 'PROG-001',
        eligibilityRule: {
          id: 'ELIG-001',
          name: 'Workforce Development & Career Pathways Criteria',
          description: 'Immigrant and refugee job seekers residing in Hennepin or Ramsey counties seeking living-wage employment.',
          requiredCriteria: [
            'Immigrant, refugee, or first-generation status',
            'Age 18 or older',
            'Resident of Hennepin or Ramsey County, MN',
            'Work authorization or enrollment in state career bridge pathway',
          ],
          allowedGeographies: ['Hennepin County, MN', 'Ramsey County, MN', 'Anoka County, MN'],
          documentationRequired: ['Photo ID or municipal card', 'Proof of residency'],
          allowExceptionsWithExecutiveApproval: true,
        },
        maxEnrollmentCapacity: 35,
        currentEnrolledCount: 28,
        waitlistedCount: 4,
        schedulesSummary: [
          'Cohort A: Tuesdays 6:00 PM - 8:00 PM (In-Person Computer Lab)',
          'Cohort B: Thursdays 6:00 PM - 8:00 PM (Bilingual Virtual Coaching)',
          'Saturday Mock Interview Clinics: Monthly 10:00 AM - 1:00 PM',
        ],
        requiredStaffRoles: ['Program Manager', 'Bilingual Career Coach', 'Volunteer Mentor'],
        leadProgramManager: {
          id: 'staff-002',
          name: 'Amina Yusuf',
          email: 'amina.yusuf@phumulani.org',
        },
        keyMilestones: [
          {
            id: 'ms-001',
            title: 'Cohort Orientation & Digital Baseline Assessment',
            targetDate: '2026-09-15',
            isCompleted: true,
            outcomeSummary: '28 participants completed baseline digital assessments.',
          },
          {
            id: 'ms-002',
            title: 'Resume Portfolio & LinkedIn Finalization',
            targetDate: '2026-10-30',
            isCompleted: true,
            outcomeSummary: '24 resumes certified by lead coaches.',
          },
          {
            id: 'ms-003',
            title: 'Regional Employer Hiring Day & Placement Interviews',
            targetDate: '2026-11-20',
            isCompleted: false,
          },
        ],
      },
      {
        programId: 'PROG-002',
        eligibilityRule: {
          id: 'ELIG-002',
          name: 'Youth Mentorship & Sisterhood Circles Criteria',
          description: 'Youth ages 12–19 from immigrant and refugee households.',
          requiredCriteria: [
            'Age 12–19 years',
            'Enrolled in Twin Cities public or charter school',
            'Parental/guardian consent on file',
          ],
          allowedGeographies: ['Twin Cities Metro Area'],
          documentationRequired: ['School enrollment verification', 'Parent/Guardian Consent'],
          allowExceptionsWithExecutiveApproval: true,
        },
        maxEnrollmentCapacity: 30,
        currentEnrolledCount: 26,
        waitlistedCount: 6,
        schedulesSummary: [
          'Weekly Sisterhood Circle: Wednesdays 4:30 PM - 6:30 PM',
          'Saturday Academic STEM Tutoring: 10:00 AM - 12:30 PM',
        ],
        requiredStaffRoles: ['Youth Coordinator', 'Bilingual Academic Mentors'],
        leadProgramManager: {
          id: 'staff-002',
          name: 'Amina Yusuf',
          email: 'amina.yusuf@phumulani.org',
        },
        keyMilestones: [
          {
            id: 'ms-004',
            title: 'Fall Semester Academic Match Launch',
            targetDate: '2026-09-20',
            isCompleted: true,
            outcomeSummary: '26 matched mentor-mentee pairs established.',
          },
          {
            id: 'ms-005',
            title: 'College Discovery & Financial Aid Night',
            targetDate: '2026-11-12',
            isCompleted: false,
          },
        ],
      },
      {
        programId: 'PROG-003',
        eligibilityRule: {
          id: 'ELIG-003',
          name: 'Culturally Attuned Food Security & Staples Pantry',
          description: 'Open to any low-income community family needing nutritious staples.',
          requiredCriteria: ['Self-attestation of need in Minnesota'],
          allowedGeographies: ['State of Minnesota'],
          documentationRequired: ['Self-declaration form'],
          allowExceptionsWithExecutiveApproval: true,
        },
        maxEnrollmentCapacity: 150,
        currentEnrolledCount: 120,
        waitlistedCount: 0,
        schedulesSummary: ['Bi-weekly Friday Depot Distribution: 1:00 PM - 5:00 PM'],
        requiredStaffRoles: ['Logistics Coordinator', 'Food Prep Volunteers'],
        leadProgramManager: {
          id: 'staff-003',
          name: 'Marcus Chen',
          email: 'marcus.chen@phumulani.org',
        },
        keyMilestones: [
          {
            id: 'ms-006',
            title: 'Winter Food Security Logistics Sourcing',
            targetDate: '2026-10-15',
            isCompleted: true,
            outcomeSummary: 'Partnership with local halal & Asian distributors finalized.',
          },
        ],
      },
    ];

    this.waitlist = [
      {
        id: 'wait-001',
        programId: 'PROG-001',
        applicantIdentifier: 'APP-REF-8842',
        requestedCategory: 'Digital Skills & Resume Track',
        position: 1,
        dateAdded: '2026-10-12',
        priorityScore: 92,
        status: 'WAITING',
      },
      {
        id: 'wait-002',
        programId: 'PROG-001',
        applicantIdentifier: 'APP-REF-8845',
        requestedCategory: 'Bilingual Career Coaching',
        position: 2,
        dateAdded: '2026-10-18',
        priorityScore: 85,
        status: 'WAITING',
      },
      {
        id: 'wait-003',
        programId: 'PROG-002',
        applicantIdentifier: 'APP-REF-9011',
        requestedCategory: 'STEM High School Mentorship',
        position: 1,
        dateAdded: '2026-10-05',
        priorityScore: 95,
        status: 'WAITING',
      },
    ];
  }

  public getPrograms(): EnhancedCommunityProgramDetail[] {
    return [...this.programs];
  }

  public getProgramDetail(programId: string): EnhancedCommunityProgramDetail | undefined {
    return this.programs.find((p) => p.programId === programId);
  }

  public getWaitlistForProgram(programId: string): ProgramWaitlistEntry[] {
    return this.waitlist
      .filter((w) => w.programId === programId)
      .sort((a, b) => a.position - b.position);
  }

  public enrollApplicantFromWaitlist(
    waitlistId: string,
    authorizedManagerName: string
  ): { program: EnhancedCommunityProgramDetail; waitlistEntry: ProgramWaitlistEntry } {
    const entry = this.waitlist.find((w) => w.id === waitlistId);
    if (!entry) throw new Error(`Waitlist entry ${waitlistId} not found.`);

    const program = this.getProgramDetail(entry.programId);
    if (!program) throw new Error(`Program ${entry.programId} not found.`);

    if (program.currentEnrolledCount >= program.maxEnrollmentCapacity) {
      throw new Error(`Program ${program.programId} is at maximum capacity (${program.maxEnrollmentCapacity}). Cannot enroll without increasing capacity.`);
    }

    entry.status = 'ENROLLED';
    program.currentEnrolledCount += 1;
    program.waitlistedCount = Math.max(0, program.waitlistedCount - 1);

    // Reorder remaining waitlist entries
    const remaining = this.getWaitlistForProgram(entry.programId).filter((w) => w.status === 'WAITING');
    remaining.forEach((item, idx) => {
      item.position = idx + 1;
    });

    db.logAudit({
      actor: authorizedManagerName,
      action: 'PROGRAM_ENROLLMENT_CONFIRMED',
      details: `Enrolled applicant ${entry.applicantIdentifier} into ${program.programId} from waitlist. Capacity now ${program.currentEnrolledCount}/${program.maxEnrollmentCapacity}.`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return { program, waitlistEntry: entry };
  }

  public updateProgramCapacity(
    programId: string,
    newCapacity: number,
    authorizedManagerName: string
  ): EnhancedCommunityProgramDetail {
    const program = this.getProgramDetail(programId);
    if (!program) throw new Error(`Program ${programId} not found.`);

    if (newCapacity < program.currentEnrolledCount) {
      throw new Error(`New capacity (${newCapacity}) cannot be less than currently enrolled count (${program.currentEnrolledCount}).`);
    }

    const oldCapacity = program.maxEnrollmentCapacity;
    program.maxEnrollmentCapacity = newCapacity;

    db.logAudit({
      actor: authorizedManagerName,
      action: 'PROGRAM_CAPACITY_UPDATED',
      details: `Updated capacity for ${programId} from ${oldCapacity} to ${newCapacity}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return program;
  }
}

export const advancedProgramManagementService = new AdvancedProgramManagementService();
