/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Training & Organizational Knowledge Service (M33.10)
 * Manages staff/volunteer training modules, assignments, completion tracking, certifications, and SOP knowledge articles.
 * AI is strictly barred from certifying human training or clearance.
 */

import {
  TrainingModuleRecord,
  TrainingAssignmentRecord,
  KnowledgeArticleRecord,
} from '../types/phase33';
import { db } from './db';

class TrainingKnowledgeService {
  private modules: TrainingModuleRecord[] = [];
  private assignments: TrainingAssignmentRecord[] = [];
  private articles: KnowledgeArticleRecord[] = [];

  constructor() {
    this.seedTrainingAndKnowledge();
  }

  private seedTrainingAndKnowledge() {
    this.modules = [
      {
        id: 'TRN-SAFE-01',
        title: 'Statutory Safeguarding, Mandatory Reporting & VAWA § 1367 Compliance',
        track: 'SAFEGUARDING_COMPLIANCE',
        description: 'Covers federal VAWA confidentiality mandates, survivor privacy, state reporting standards, and double-ESC emergency escape protocols.',
        durationMinutes: 45,
        isMandatoryForClearance: true,
        passingScorePercent: 85,
        version: 'v2026.2',
        authorStaffName: 'Sister Miriam K. (Safeguarding Lead)',
        reviewedDate: '2026-08-10',
      },
      {
        id: 'TRN-CULT-01',
        track: 'CULTURAL_COMPETENCE',
        title: 'Trauma-Informed Care & Immigrant Cultural Attunement in Minnesota',
        description: 'Culturally attuned communication guidelines for working with East African, Southeast Asian, and Latin American immigrant communities.',
        durationMinutes: 60,
        isMandatoryForClearance: true,
        passingScorePercent: 80,
        version: 'v2026.1',
        authorStaffName: 'Comfort Dondo',
        reviewedDate: '2026-07-22',
      },
      {
        id: 'TRN-VOL-01',
        track: 'VOLUNTEER_ONBOARDING',
        title: 'Phumulani Volunteer Operational Standards & Code of Ethics',
        description: 'Guidelines on attendance, shift check-ins, boundaries, privacy, and incident reporting.',
        durationMinutes: 30,
        isMandatoryForClearance: true,
        passingScorePercent: 80,
        version: 'v2026.1',
        authorStaffName: 'Marcus Chen',
        reviewedDate: '2026-08-01',
      },
      {
        id: 'TRN-DATA-01',
        track: 'STAFF_ONBOARDING',
        title: 'Data Privacy, Role-Based Access & Anti-Contamination Protocols',
        description: 'Enforces strict separation of donor, volunteer, and operations data; zero commercial tax preparation contamination rules.',
        durationMinutes: 40,
        isMandatoryForClearance: true,
        passingScorePercent: 90,
        version: 'v2026.3',
        authorStaffName: 'IT Governance Officer',
        reviewedDate: '2026-09-05',
      },
    ];

    this.assignments = [
      {
        id: 'ASG-001',
        moduleId: 'TRN-SAFE-01',
        moduleTitle: 'Statutory Safeguarding, Mandatory Reporting & VAWA § 1367 Compliance',
        userId: 'vol-001',
        userName: 'Fadumo Ahmed',
        userRole: 'volunteer',
        status: 'COMPLETED',
        scoreAchieved: 95,
        completedAt: '2026-08-14T16:00:00Z',
        certifiedByStaffId: 'staff-003',
        certificateNumber: 'CERT-SAFE-2026-014',
      },
      {
        id: 'ASG-002',
        moduleId: 'TRN-CULT-01',
        moduleTitle: 'Trauma-Informed Care & Immigrant Cultural Attunement in Minnesota',
        userId: 'vol-001',
        userName: 'Fadumo Ahmed',
        userRole: 'volunteer',
        status: 'COMPLETED',
        scoreAchieved: 92,
        completedAt: '2026-08-15T11:00:00Z',
        certifiedByStaffId: 'staff-003',
        certificateNumber: 'CERT-CULT-2026-009',
      },
      {
        id: 'ASG-003',
        moduleId: 'TRN-SAFE-01',
        moduleTitle: 'Statutory Safeguarding, Mandatory Reporting & VAWA § 1367 Compliance',
        userId: 'vol-004',
        userName: 'Asha Nur',
        userRole: 'volunteer',
        status: 'IN_PROGRESS',
        scoreAchieved: 75,
      },
    ];

    this.articles = [
      {
        id: 'KNOW-001',
        articleCode: 'SOP-SAFE-01',
        title: 'Immediate Crisis Triage & Human Escalation Standard Operating Procedure',
        category: 'SAFEGUARDING_PROCEDURE',
        summary: 'Step-by-step instructions for responding to distress indicators or physical danger disclosures.',
        content: `1. Immediate Safety First: If imminent physical harm is present, call 911 or connect survivor to Minnesota Day One (1-866-223-1111).
2. Confidentiality: Never record survivor residential address or PII in general ticketing systems. Use secure SAFE-MN protocol.
3. Warm Handoff: Escalate directly to Sister Miriam K. (Safeguarding Lead) or Executive Director Comfort Dondo.`,
        targetRoleAccess: ['STAFF', 'DEPARTMENT_MANAGER', 'EXECUTIVE', 'MASTER_ADMIN'],
        version: 3,
        lastUpdatedDate: '2026-08-12',
        approvedByDirector: true,
      },
      {
        id: 'KNOW-002',
        articleCode: 'POL-FIN-02',
        title: '501(c)(3) Donor Gift Acceptance, Pledges & Anti-Commercial Contamination Policy',
        category: 'POLICY',
        summary: 'Governs restricted vs unrestricted donations, IRS acknowledgment issuance, and strict prohibition of commercial tax software.',
        content: `1. Gift Classification: Donations must be classified immediately as Unrestricted or Restricted.
2. Pledges: Pledges are recorded in pipeline and NEVER recognized as settled cash until received.
3. Separation: Phumulani maintains 0% commercial tax preparation or TaxGuard software within its systems.`,
        targetRoleAccess: ['STAFF', 'DEPARTMENT_MANAGER', 'EXECUTIVE', 'BOARD_MEMBER', 'MASTER_ADMIN'],
        version: 2,
        lastUpdatedDate: '2026-09-01',
        approvedByDirector: true,
      },
    ];
  }

  public getModules(): TrainingModuleRecord[] {
    return [...this.modules];
  }

  public getAssignments(userId?: string): TrainingAssignmentRecord[] {
    if (userId) return this.assignments.filter((a) => a.userId === userId);
    return [...this.assignments];
  }

  public getArticles(userRoleFamily?: string): KnowledgeArticleRecord[] {
    if (!userRoleFamily) return [...this.articles];
    return this.articles.filter((a) =>
      a.targetRoleAccess.includes(userRoleFamily as any) || a.targetRoleAccess.includes('STAFF' as any)
    );
  }

  /**
   * Human Staff Certification of Training Module Completion
   * AI cannot certify training.
   */
  public certifyCompletion(
    assignmentId: string,
    score: number,
    certifyingStaffName: string,
    certifyingStaffId: string
  ): TrainingAssignmentRecord {
    const asg = this.assignments.find((a) => a.id === assignmentId);
    if (!asg) throw new Error(`Training assignment ${assignmentId} not found.`);

    const module = this.modules.find((m) => m.id === asg.moduleId);
    if (!module) throw new Error(`Module ${asg.moduleId} not found.`);

    if (score < module.passingScorePercent) {
      throw new Error(`Score ${score}% is below required passing threshold (${module.passingScorePercent}%).`);
    }

    asg.status = 'COMPLETED';
    asg.scoreAchieved = score;
    asg.completedAt = new Date().toISOString();
    asg.certifiedByStaffId = certifyingStaffId;
    asg.certificateNumber = `CERT-${module.id.slice(4)}-2026-${String(this.assignments.length + 10).padStart(3, '0')}`;

    db.logAudit({
      actor: certifyingStaffName,
      action: 'TRAINING_COMPLETION_CERTIFIED',
      details: `Certified training completion for ${asg.userName} on module ${asg.moduleTitle} with score ${score}%. Certificate: ${asg.certificateNumber}`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return asg;
  }
}

export const trainingKnowledgeService = new TrainingKnowledgeService();
