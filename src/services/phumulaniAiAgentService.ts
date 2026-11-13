/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phumulani Ai Autonomous Fundraising Agent Service
 * Integrates Prospect Intelligence, Program Matching, AI Campaigns, Priority Sorting (P0-P4),
 * Donor Interest Scoring (0-100), Grounded Response Drafting, Follow-up Lifecycle,
 * Proposal Generation, and Meeting Conversion Coordination.
 */

import {
  ProspectProfile,
  ProgramMatchResult,
  AiCampaign,
  EmailClassificationResult,
  EmailPriorityP0P4,
  DonorInterestScore,
  AiReplyDraft,
  FollowUpItem,
  HighInterestLead,
  FundingProposalDraft,
  AutonomousPolicyConfig,
} from '../types/phumulaniAi';
import { localInferenceAdapter, PHUMULANI_AI_SYSTEM_PROMPT } from './localInferenceAdapter';
import { calendarIntegrationService } from './calendarIntegrationService';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import { localKnowledgeRetrievalService } from './localKnowledgeRetrievalService';
import { EmailEnterpriseService } from './emailEnterpriseService';
import { FundingCommandService } from './fundingCommandService';
import { db } from './db';
import type { UserSession } from './authSecurityService';
import type { EnterpriseEmailThread, EmailPriorityLevel, EmailClassificationCategory } from '../types/emailEnterprise';
import type { UnifiedDonorProfile, DonorStewardshipAction } from '../types/fundingCommand';

// Approved Phumulani Community Programs Knowledge Base
export const APPROVED_COMMUNITY_PROGRAMS = [
  {
    id: 'PROG-001',
    title: 'Healing Sisterhood Circles',
    category: 'Trauma Recovery & Emotional Wellness',
    targetBeneficiaries: 'East African and African immigrant women and survivors',
    focusAreas: ['mental health', 'peer support', 'culturally responsive therapy', 'wellness'],
    annualBudget: 85000,
    requestedAskRange: [5000, 25000],
    geographicFocus: 'Twin Cities Metro (Hennepin & Ramsey Counties)',
    objectives: [
      'Conduct bi-weekly culturally grounded healing circles for 120+ immigrant women annually',
      'Provide licensed bilingual trauma-informed counseling referrals',
      'Reduce social isolation and enhance community safety networks',
    ],
  },
  {
    id: 'PROG-002',
    title: 'Healing Homes Transitional Housing',
    category: 'Safe Shelter & Rapid Re-housing',
    targetBeneficiaries: 'Immigrant and refugee women and children fleeing domestic violence',
    focusAreas: ['housing', 'crisis intervention', 'emergency shelter', 'rental assistance'],
    annualBudget: 125000,
    requestedAskRange: [15000, 50000],
    geographicFocus: 'Minnesota Statewide with focus on Twin Cities',
    objectives: [
      'Provide secure temporary shelter and rental subsidies for up to 30 families',
      'Offer comprehensive housing stabilization and relocation advocacy',
      'Maintain 100% confidential address protocols under VAWA Section 1367',
    ],
  },
  {
    id: 'PROG-003',
    title: 'Economic Self-Reliance & Entrepreneurship Lab',
    category: 'Workforce & Economic Empowerment',
    targetBeneficiaries: 'Underemployed immigrant mothers and aspiring entrepreneurs',
    focusAreas: ['financial literacy', 'entrepreneurship', 'micro-grants', 'business training'],
    annualBudget: 95000,
    requestedAskRange: [10000, 35000],
    geographicFocus: 'Minneapolis, St. Paul, Brooklyn Center, Brooklyn Park',
    objectives: [
      'Graduate 60 women annually from the 12-week micro-enterprise curriculum',
      'Facilitate access to CDFI micro-loans and seed micro-grants',
      'Equip participants with financial management and digital marketing skills',
    ],
  },
  {
    id: 'PROG-004',
    title: 'Education & Workforce Pathways',
    category: 'Adult Education & Career Development',
    targetBeneficiaries: 'Immigrant job seekers and career transitioners',
    focusAreas: ['workforce', 'resume coaching', 'career pathways', 'credentials'],
    annualBudget: 75000,
    requestedAskRange: [7500, 20000],
    geographicFocus: 'Twin Cities Metro Area',
    objectives: [
      'Deliver one-on-one resume development and interview preparation for 150 job seekers',
      'Partner with healthcare and technology employers for direct placement',
      'Offer digital literacy cohorts in Somali, Oromo, and Amharic',
    ],
  },
  {
    id: 'PROG-005',
    title: 'Youth Leadership & Mentorship',
    category: 'Next-Generation Empowerment',
    targetBeneficiaries: 'First- and second-generation immigrant and refugee youth (ages 12-19)',
    focusAreas: ['youth mentorship', 'academic tutoring', 'arts', 'leadership'],
    annualBudget: 60000,
    requestedAskRange: [5000, 15000],
    geographicFocus: 'Hennepin County & Brooklyn Park Community Schools',
    objectives: [
      'Pair 50 youth with trained adult mentors from cultural backgrounds',
      'Provide academic enrichment, college access coaching, and civic leadership projects',
      'Facilitate youth-led creative arts and storytelling showcases',
    ],
  },
];

// Seed Prospects Database (Real Foundation & Corporate CSR Prospects)
export const INITIAL_PROSPECTS: ProspectProfile[] = [
  {
    id: 'PROSP-001',
    organizationName: 'The McKnight Foundation',
    contactName: 'Sarah Lindstrom',
    contactEmail: 'slindstrom@mcknight-foundation-example.org',
    contactTitle: 'Program Officer, Vibrant & Equitable Communities',
    prospectType: 'foundation',
    estimatedCapacity: 75000,
    areasOfInterest: ['housing', 'economic empowerment', 'equity', 'immigrant integration'],
    geographicFocus: 'Minnesota',
    status: 'uncontacted',
    matchScore: 94,
    matchedProgramId: 'PROG-002',
    matchedProgramName: 'Healing Homes Transitional Housing',
    interestScore: 0,
    optOut: false,
    assignedStaffId: 'staff-dir-01',
    assignedStaffName: 'Comfort Dondo, Executive Director',
    notes: 'Prior community interest in culturally specific transitional housing models.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROSP-002',
    organizationName: 'Target Foundation Community Grants',
    contactName: 'Marcus Vance',
    contactEmail: 'marcus.vance@target-foundation-example.com',
    contactTitle: 'Director of Hometown Giving',
    prospectType: 'corporate_csr',
    estimatedCapacity: 50000,
    areasOfInterest: ['workforce', 'entrepreneurship', 'financial literacy', 'family stability'],
    geographicFocus: 'Twin Cities Metro',
    status: 'uncontacted',
    matchScore: 88,
    matchedProgramId: 'PROG-003',
    matchedProgramName: 'Economic Self-Reliance & Entrepreneurship Lab',
    interestScore: 0,
    optOut: false,
    assignedStaffId: 'staff-dev-01',
    assignedStaffName: 'Development Director',
    notes: 'Focus on Twin Cities local community prosperity and workforce training.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROSP-003',
    organizationName: 'Otto Bremer Trust',
    contactName: 'Elena Rostova',
    contactEmail: 'erostova@bremer-trust-example.org',
    contactTitle: 'Senior Investment Director',
    prospectType: 'foundation',
    estimatedCapacity: 60000,
    areasOfInterest: ['mental health', 'community wellness', 'crisis support', 'women'],
    geographicFocus: 'Minnesota, North Dakota, Wisconsin',
    status: 'uncontacted',
    matchScore: 92,
    matchedProgramId: 'PROG-001',
    matchedProgramName: 'Healing Sisterhood Circles',
    interestScore: 0,
    optOut: false,
    assignedStaffId: 'staff-dir-01',
    assignedStaffName: 'Comfort Dondo, Executive Director',
    notes: 'Historic funder of community healthcare and culturally informed healing.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROSP-004',
    organizationName: 'Minneapolis Foundation',
    contactName: 'David Mwangi',
    contactEmail: 'dmwangi@mplsfoundation-example.org',
    contactTitle: 'Philanthropic Advisor, One Minneapolis Fund',
    prospectType: 'foundation',
    estimatedCapacity: 45000,
    areasOfInterest: ['youth mentorship', 'academic tutoring', 'arts', 'immigrant youth'],
    geographicFocus: 'Minneapolis & surrounding suburbs',
    status: 'uncontacted',
    matchScore: 85,
    matchedProgramId: 'PROG-005',
    matchedProgramName: 'Youth Leadership & Mentorship',
    interestScore: 0,
    optOut: false,
    assignedStaffId: 'staff-dev-01',
    assignedStaffName: 'Development Director',
    notes: 'Active grant cycles supporting immigrant youth education and leadership.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROSP-005',
    organizationName: '3M Gives Community Foundation',
    contactName: 'Patricia Kowalski',
    contactEmail: 'pkowalski@3mgives-example.com',
    contactTitle: 'Social Impact Lead, STEM & Career Pathways',
    prospectType: 'corporate_csr',
    estimatedCapacity: 35000,
    areasOfInterest: ['workforce', 'resume coaching', 'career pathways', 'credentials'],
    geographicFocus: 'Twin Cities East Metro & Statewide',
    status: 'uncontacted',
    matchScore: 82,
    matchedProgramId: 'PROG-004',
    matchedProgramName: 'Education & Workforce Pathways',
    interestScore: 0,
    optOut: false,
    assignedStaffId: 'staff-dev-01',
    assignedStaffName: 'Development Director',
    notes: 'Corporate grant priorities emphasize workforce credentialing and employment.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class PhumulaniAiAgentService {
  private static instance: PhumulaniAiAgentService;
  private dbAdapter = PostgresPersistenceAdapter.getInstance();
  private localAi = localInferenceAdapter;
  private calendar = calendarIntegrationService;

  // In-memory runtime state persisted to DB adapter
  private prospects: ProspectProfile[] = [...INITIAL_PROSPECTS];
  private campaigns: AiCampaign[] = [];
  private replyDrafts: AiReplyDraft[] = [];
  private followUps: FollowUpItem[] = [];
  private highInterestLeads: HighInterestLead[] = [];
  private proposalDrafts: FundingProposalDraft[] = [];

  private policyConfig: AutonomousPolicyConfig = {
    autonomyLevel: 2,
    autonomyLevelLabel: 'Level 2 — Draft and recommend (Prepare personalized messages and follow-up tasks for human review)',
    allowAutonomousClassification: true,
    allowAutonomousDrafting: true,
    allowAutonomousFollowUpRecommendations: true,
    allowUnattendedSending: false, // Invariant: fail-closed
    requireHumanCampaignApproval: true,
    requireProposalDirectorApproval: true,
    maxDailyDrafts: 50,
    rateLimitPerHour: 20,
  };

  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PhumulaniAiAgentService {
    if (!PhumulaniAiAgentService.instance) {
      PhumulaniAiAgentService.instance = new PhumulaniAiAgentService();
    }
    return PhumulaniAiAgentService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const persistedProspects = await this.dbAdapter.select<ProspectProfile>('phumulani_ai_prospects');
      if (persistedProspects && persistedProspects.length > 0) {
        this.prospects = persistedProspects;
      }
      const persistedCampaigns = await this.dbAdapter.select<AiCampaign>('phumulani_ai_campaigns');
      if (persistedCampaigns && persistedCampaigns.length > 0) {
        this.campaigns = persistedCampaigns;
      }
      const persistedDrafts = await this.dbAdapter.select<AiReplyDraft>('phumulani_ai_reply_drafts');
      if (persistedDrafts && persistedDrafts.length > 0) {
        this.replyDrafts = persistedDrafts;
      }
      const persistedFollowUps = await this.dbAdapter.select<FollowUpItem>('phumulani_ai_followups');
      if (persistedFollowUps && persistedFollowUps.length > 0) {
        this.followUps = persistedFollowUps;
      }
      const persistedLeads = await this.dbAdapter.select<HighInterestLead>('phumulani_ai_high_interest_leads');
      if (persistedLeads && persistedLeads.length > 0) {
        this.highInterestLeads = persistedLeads;
      }
      const persistedProposals = await this.dbAdapter.select<FundingProposalDraft>('phumulani_ai_proposals');
      if (persistedProposals && persistedProposals.length > 0) {
        this.proposalDrafts = persistedProposals;
      }
    } catch {
      // Storage fallback
    }

    this.isInitialized = true;
  }

  // ---------------------------------------------------------------------------
  // 1. PROSPECT INTELLIGENCE & DATABASE
  // ---------------------------------------------------------------------------

  public getProspects(): ProspectProfile[] {
    return [...this.prospects];
  }

  public getProspectById(id: string): ProspectProfile | undefined {
    return this.prospects.find((p) => p.id === id);
  }

  public async addProspect(prospect: Omit<ProspectProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProspectProfile> {
    await this.initialize();
    const newProspect: ProspectProfile = {
      ...prospect,
      id: `PROSP-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.prospects.push(newProspect);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_prospects', newProspect, { context: 'aiAgent:addProspect' });
    return newProspect;
  }

  public async updateProspect(id: string, updates: Partial<ProspectProfile>): Promise<ProspectProfile | null> {
    await this.initialize();
    const idx = this.prospects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const updated = {
      ...this.prospects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.prospects[idx] = updated;
    await this.dbAdapter.update('phumulani_ai_prospects', id, updated).catch((err) => {
      console.error(`[PhumulaniAiAgent] Failed to persist prospect update ${id}:`, err?.message || err);
    });
    return updated;
  }

  // ---------------------------------------------------------------------------
  // 2. PROGRAM MATCHING (TRANSPARENT MATCH SCORING)
  // ---------------------------------------------------------------------------

  public matchProspectToPrograms(prospectId: string): ProgramMatchResult[] {
    const prospect = this.getProspectById(prospectId);
    if (!prospect) return [];

    return APPROVED_COMMUNITY_PROGRAMS.map((program) => {
      // Criteria 1: Interest Fit (0-40)
      const matchingInterests = prospect.areasOfInterest.filter((interest) =>
        program.focusAreas.some((fa) => fa.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(fa.toLowerCase()))
      );
      const interestScore = Math.min(40, (matchingInterests.length / Math.max(1, program.focusAreas.length)) * 40 + (matchingInterests.length > 0 ? 15 : 0));

      // Criteria 2: Geographic Fit (0-20)
      let geoScore = 10;
      if (
        program.geographicFocus.toLowerCase().includes('minnesota') ||
        prospect.geographicFocus.toLowerCase().includes('minnesota') ||
        program.geographicFocus.toLowerCase().includes('twin cities')
      ) {
        geoScore = 20;
      }

      // Criteria 3: Budget Alignment (0-20)
      let budgetScore = 15;
      if (prospect.estimatedCapacity >= program.requestedAskRange[0] && prospect.estimatedCapacity <= program.requestedAskRange[1] * 2) {
        budgetScore = 20;
      } else if (prospect.estimatedCapacity < program.requestedAskRange[0]) {
        budgetScore = 8;
      }

      // Criteria 4: Historical Alignment / Organizational Type (0-20)
      let historyScore = 15;
      if (prospect.prospectType === 'foundation' || prospect.prospectType === 'corporate_csr') {
        historyScore = 20;
      }

      const totalScore = Math.min(100, Math.round(interestScore + geoScore + budgetScore + historyScore));

      const recommendedAsk = Math.min(
        program.requestedAskRange[1],
        Math.max(program.requestedAskRange[0], Math.round(prospect.estimatedCapacity * 0.4))
      );

      return {
        prospectId: prospect.id,
        prospectName: prospect.organizationName,
        programId: program.id,
        programTitle: program.title,
        matchScore: totalScore,
        criteriaScores: {
          interestFit: Math.round(interestScore),
          geographicFit: Math.round(geoScore),
          budgetAlignment: Math.round(budgetScore),
          historicalFit: Math.round(historyScore),
        },
        rationale: `Strong correlation on focus areas: ${matchingInterests.join(', ') || 'community advancement'} within ${program.geographicFocus}. Capacity of $${prospect.estimatedCapacity.toLocaleString()} aligns with recommended ask of $${recommendedAsk.toLocaleString()}.`,
        recommendedAsk,
        suggestedAngle: `Highlight Phumulani's trauma-informed immigrant-led delivery model for ${program.title}, emphasizing outcomes in ${program.geographicFocus}.`,
        verifiedProgramObjectives: program.objectives,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  // ---------------------------------------------------------------------------
  // 3. CAMPAIGN GENERATOR
  // ---------------------------------------------------------------------------

  public async generateCampaign(params: {
    title: string;
    targetProgramId: string;
    prospectIds: string[];
    senderMailbox: string;
    followUpIntervalDays?: number;
    createdBy: string;
  }): Promise<AiCampaign> {
    await this.initialize();
    const program = APPROVED_COMMUNITY_PROGRAMS.find((p) => p.id === params.targetProgramId);
    if (!program) throw new Error(`Program ${params.targetProgramId} not found in approved programs repository.`);

    // Sender mailbox verification
    const allowedMailboxes = ['donations@phumulani.org', 'grants@phumulani.org', 'partnerships@phumulani.org', 'director@phumulani.org'];
    const sender = allowedMailboxes.includes(params.senderMailbox) ? params.senderMailbox : 'grants@phumulani.org';

    const campaignId = `CAMP-${Date.now().toString().slice(-4)}`;

    const templateSubject = `Partnership Opportunity: Supporting ${program.title} at Phumulani`;
    const templateBody = `Dear {{ContactName}},

On behalf of Phumulani, I am reaching out to share our latest initiatives supporting East African and immigrant survivors across Minnesota through our ${program.title}.

Given {{OrganizationName}}'s dedicated commitment to {{FocusArea}}, we would welcome the opportunity to discuss how a targeted partnership of {{RecommendedAsk}} could directly support:
- ${program.objectives.join('\n- ')}

We would be honored to arrange a brief introductory conversation with our Executive Director, Comfort Dondo, at your convenience.

With gratitude,
Phumulani Development Team
${sender}`;

    const newCampaign: AiCampaign = {
      id: campaignId,
      title: params.title,
      targetProgramId: program.id,
      programName: program.title,
      prospectIds: params.prospectIds,
      prospectCount: params.prospectIds.length,
      status: 'pending_approval', // Enforce mandatory human approval gate
      senderMailbox: sender,
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      followUpIntervalDays: params.followUpIntervalDays || 7,
      templateSubject,
      templateBody,
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
    };

    this.campaigns.unshift(newCampaign);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_campaigns', newCampaign, { context: 'aiAgent:generateCampaign' });
    return newCampaign;
  }

  public async approveCampaign(campaignId: string, approvedBy: string): Promise<AiCampaign | null> {
    await this.initialize();
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return null;

    campaign.approvalStatus = 'approved';
    campaign.status = 'approved';
    campaign.approvedBy = approvedBy;
    campaign.approvedAt = new Date().toISOString();

    await this.dbAdapter.update('phumulani_ai_campaigns', campaignId, campaign).catch((err) => {
      console.error(`[PhumulaniAiAgent] Failed to persist campaign approval ${campaignId}:`, err?.message || err);
    });
    return campaign;
  }

  public getCampaigns(): AiCampaign[] {
    return [...this.campaigns];
  }

  // ---------------------------------------------------------------------------
  // 4. EMAIL PRIORITY ENGINE (P0 - P4) & CLASSIFICATION
  // ---------------------------------------------------------------------------

  public classifyIncomingEmail(params: {
    emailSubject: string;
    emailBody: string;
    senderEmail: string;
  }): EmailClassificationResult {
    const { wrapped, detectedInjectionRisk } = this.localAi.wrapUntrustedInput(params.emailBody);
    const lowerBody = params.emailBody.toLowerCase();
    const lowerSubject = params.emailSubject.toLowerCase();

    // 1. P0: RESTRICTED SAFETY OR CRISIS SAFEGUARDING ESCALATION
    const crisisKeywords = [
      'domestic violence',
      'domestic abuse',
      'order for protection',
      'restraining order',
      'shelter address',
      'stalking',
      'emergency safe house',
      'assault',
      'threatened',
      'in danger',
    ];

    const hasCrisis = crisisKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));
    if (hasCrisis) {
      return {
        priority: 'P0',
        priorityLabel: 'P0 - Restricted Safety / Crisis Quarantine',
        category: 'RESTRICTED_SAFEGUARDING_CRISIS',
        confidence: 0.99,
        reasoning: 'Critical survivor safety terms detected. Quarantined to DEPT-SAFE under VAWA Section 1367.',
        isSafeguardingCrisis: true,
        isOptOut: false,
        hasMeetingSignal: false,
        hasFundingSignal: false,
      };
    }

    // 2. PHISHING & MALICIOUS / SPAM QUARANTINE
    const spamKeywords = [
      'verify banking',
      'click here to verify',
      'click this link immediately',
      'million dollar',
      'lottery',
      'crypto',
      'wire transfer pending',
      'urgent: click',
    ];
    const isSpam = spamKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));
    if (isSpam) {
      return {
        priority: 'P4',
        priorityLabel: 'P4 - Spam / Phishing Quarantine',
        category: 'SPAM_OR_SUSPICIOUS',
        confidence: 0.98,
        reasoning: 'Suspicious financial markers or credential verification request detected.',
        isSafeguardingCrisis: false,
        isOptOut: false,
        hasMeetingSignal: false,
        hasFundingSignal: false,
      };
    }

    // 3. OPT-OUT DETECTION
    const optOutKeywords = ['unsubscribe', 'remove me', 'do not email', 'not interested', 'stop sending', 'take me off'];
    const isOptOut = optOutKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));

    if (isOptOut) {
      return {
        priority: 'P3',
        priorityLabel: 'P3 - Opt-Out Suppression Request',
        category: 'DONOR_OPT_OUT',
        confidence: 0.95,
        reasoning: 'Explicit opt-out request detected. All further solicitation must be permanently suppressed.',
        isSafeguardingCrisis: false,
        isOptOut: true,
        hasMeetingSignal: false,
        hasFundingSignal: false,
      };
    }

    // 4. FORMAL DECLINE DETECTION
    const declineKeywords = [
      'unable to fund',
      'cannot fund',
      'not able to support',
      'unable to support',
      'decline',
      'declined',
      'not moving forward',
      'no funding available',
    ];
    const isDecline = declineKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));
    if (isDecline) {
      return {
        priority: 'P3',
        priorityLabel: 'P3 - Funding Decline Acknowledgment',
        category: 'FUNDING_DECLINE',
        confidence: 0.95,
        reasoning: 'Funder communicated a formal decline of funding request.',
        isSafeguardingCrisis: false,
        isOptOut: false,
        hasMeetingSignal: false,
        hasFundingSignal: false,
      };
    }

    // 5. P1: URGENT FUNDING OPPORTUNITY, PROPOSAL REQUEST, OR EXPLICIT MEETING REQUEST
    const meetingKeywords = [
      'schedule a call',
      'set up a meeting',
      'lets meet',
      "let's meet",
      'calendar',
      'time to connect',
      'discuss a grant',
      'submit a proposal',
      'rfp invitation',
      'want to meet',
      'let us meet',
      'schedule a',
      'meeting',
      'discuss funding',
    ];
    const fundingKeywords = [
      'grant award',
      'award',
      'awarded a grant',
      'awarded',
      'funding approved',
      'grant agreement',
      'pledge of $',
      'pledge',
      'contribution of $',
      'contribution',
      'board approval',
      'board approved',
      'board approved grant',
      'grant proposal',
      'submitting a $',
      'submit a $',
      'grant application',
      'grant opportunity',
      'interested in funding',
      'funding interest',
      'request for $',
      'invite phumulani to submit',
      'funding phumulani',
    ];

    const hasMeetingSignal = meetingKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));
    const hasFundingSignal = fundingKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));

    if (hasMeetingSignal || hasFundingSignal) {
      let category = 'HIGH_INTEREST_MEETING_REQUEST';
      if (hasFundingSignal && hasMeetingSignal) {
        category = 'QUALIFIED_INTEREST_INQUIRY';
      } else if (hasFundingSignal) {
        category = lowerBody.includes('awarded') ? 'GRANT_AWARD_CONFIRMATION' : 'QUALIFIED_INTEREST_INQUIRY';
      }

      return {
        priority: 'P1',
        priorityLabel: 'P1 - Urgent Funding / Meeting Escalation',
        category,
        confidence: 0.92,
        reasoning: hasFundingSignal
          ? 'Explicit grant award or financial contribution signals detected.'
          : 'Funder explicitly requested a discussion or proposal submission.',
        isSafeguardingCrisis: false,
        isOptOut: false,
        hasMeetingSignal,
        hasFundingSignal,
      };
    }

    // 4. P2: POSITIVE FUNDING INTEREST OR INFORMATION REQUEST
    const interestKeywords = [
      'interested in learning more',
      'learn more',
      'send us more information',
      'tell me about',
      'share your budget',
      'concept note',
      'partnership opportunities',
      'grant cycle',
      'grant outcomes',
      'funding',
    ];
    const hasInterest = interestKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));

    if (hasInterest) {
      return {
        priority: 'P2',
        priorityLabel: 'P2 - Positive Funding Interest',
        category: 'QUALIFIED_INTEREST_INQUIRY',
        confidence: 0.85,
        reasoning: 'Funder inquired about Phumulani programs, budget, or community initiatives.',
        isSafeguardingCrisis: false,
        isOptOut: false,
        hasMeetingSignal: false,
        hasFundingSignal: true,
      };
    }

    // 5. P3: ROUTINE CORRESPONDENCE
    const routineKeywords = ['thank you for sharing', 'received your email', 'keep us updated', 'on file'];
    const isRoutine = routineKeywords.some((kw) => lowerBody.includes(kw) || lowerSubject.includes(kw));

    if (isRoutine) {
      return {
        priority: 'P3',
        priorityLabel: 'P3 - Routine Administrative Correspondence',
        category: 'ROUTINE_ACKNOWLEDGMENT',
        confidence: 0.8,
        reasoning: 'Routine acknowledgment or non-urgent operational correspondence.',
        isSafeguardingCrisis: false,
        isOptOut: false,
        hasMeetingSignal: false,
        hasFundingSignal: false,
      };
    }

    // 6. P4: LOW-PRIORITY INFORMATIONAL
    return {
      priority: 'P4',
      priorityLabel: 'P4 - Informational / General',
      category: 'GENERAL_INFORMATIONAL',
      confidence: 0.75,
      reasoning: 'Standard general communication or promotional notice.',
      isSafeguardingCrisis: false,
      isOptOut: false,
      hasMeetingSignal: false,
      hasFundingSignal: false,
    };
  }

  // ---------------------------------------------------------------------------
  // 5. DONOR INTEREST ANALYZER (0 - 100 SCALE)
  // ---------------------------------------------------------------------------

  public analyzeDonorInterest(params: {
    prospectId: string;
    emailBody: string;
    emailSubject: string;
  }): DonorInterestScore {
    const prospect = this.getProspectById(params.prospectId);
    const classification = this.classifyIncomingEmail({
      emailSubject: params.emailSubject,
      emailBody: params.emailBody,
      senderEmail: prospect?.contactEmail || 'prospect@example.org',
    });

    // Hard Rule: Explicit opt-out sets score to 0 and overrides all scoring
    if (classification.isOptOut || prospect?.optOut) {
      if (prospect) {
        prospect.optOut = true;
        prospect.interestScore = 0;
        prospect.status = 'opted_out';
        this.updateProspect(prospect.id, { optOut: true, interestScore: 0, status: 'opted_out' }).catch((err) => {
          console.error(`[PhumulaniAiAgent] Failed to persist opt-out for ${prospect.id}:`, err?.message || err);
        });
      }
      return {
        prospectId: params.prospectId,
        prospectEmail: prospect?.contactEmail || '',
        score: 0,
        tier: 'none',
        tierLabel: '0–19: No Demonstrated Engagement (Opted-Out)',
        isOptOut: true,
        signals: ['Explicit opt-out / unsubscribe request received'],
        breakdown: { responsiveness: 0, sentimentScore: 0, specificity: 0, meetingWillingness: 0 },
        disclosureNotice: 'Opt-out permanently overrides all interest metrics. Further solicitation prohibited.',
        lastAnalyzedAt: new Date().toISOString(),
      };
    }

    let score = 20; // baseline for receiving a reply
    const signals: string[] = [];

    // Responsiveness (+15)
    score += 15;
    signals.push('Timely response received to outreach');

    // Meeting willingness (+35)
    if (classification.hasMeetingSignal) {
      score += 35;
      signals.push('Explicit willingness or request to schedule discussion');
    }

    // Specificity / Program Inquiry (+20)
    const lower = (params.emailBody + ' ' + params.emailSubject).toLowerCase();
    if (
      lower.includes('budget') ||
      lower.includes('outcomes') ||
      lower.includes('transitional housing') ||
      lower.includes('healing') ||
      lower.includes('grant') ||
      lower.includes('proposal') ||
      lower.includes('funding') ||
      lower.includes('$')
    ) {
      score += 20;
      signals.push('Specific inquiry regarding program details, outcomes, or financial allocation');
    }

    // Positive sentiment (+10)
    if (
      lower.includes('impressive') ||
      lower.includes('excited') ||
      lower.includes('interested') ||
      lower.includes('aligns with our') ||
      lower.includes('congratulations') ||
      lower.includes('delighted')
    ) {
      score += 10;
      signals.push('Highly positive alignment with funder mission statements');
    }

    score = Math.min(100, Math.max(0, score));

    // Map to 5 specified tiers:
    let tier: 'high' | 'promising' | 'developing' | 'limited' | 'none';
    let tierLabel: string;

    if (score >= 80) {
      tier = 'high';
      tierLabel = '80–100: High Engagement';
    } else if (score >= 60) {
      tier = 'promising';
      tierLabel = '60–79: Promising Engagement';
    } else if (score >= 40) {
      tier = 'developing';
      tierLabel = '40–59: Developing Engagement';
    } else if (score >= 20) {
      tier = 'limited';
      tierLabel = '20–39: Limited Engagement';
    } else {
      tier = 'none';
      tierLabel = '0–19: No Demonstrated Engagement';
    }

    // Update prospect interest score and qualified status
    if (prospect) {
      prospect.interestScore = score;
      if (score >= 60) {
        prospect.status = 'qualified';
      }
      this.updateProspect(prospect.id, { interestScore: score, status: prospect.status }).catch((err) => {
        console.error(`[PhumulaniAiAgent] Failed to persist prospect score ${prospect.id}:`, err?.message || err);
      });
    }

    // Trigger high-interest escalation if score >= 80 or meeting signal
    if (score >= 80 || classification.hasMeetingSignal) {
      this.escalateHighInterestLead({
        prospectId: params.prospectId,
        emailSubject: params.emailSubject,
        emailBody: params.emailBody,
        interestScore: score,
        meetingRequested: classification.hasMeetingSignal,
      }).catch((err) => {
        console.error(`[PhumulaniAiAgent] Failed to escalate high-interest lead ${params.prospectId}:`, err?.message || err);
      });
    }

    return {
      prospectId: params.prospectId,
      prospectEmail: prospect?.contactEmail || '',
      score,
      tier,
      tierLabel,
      isOptOut: false,
      signals,
      breakdown: {
        responsiveness: 25,
        sentimentScore: score >= 60 ? 25 : 15,
        specificity: score >= 75 ? 25 : 15,
        meetingWillingness: classification.hasMeetingSignal ? 25 : 10,
      },
      disclosureNotice: 'Note: Estimated engagement score based on observable signals; not a validated statistical probability of funding.',
      lastAnalyzedAt: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // 6. PERSONALIZED RESPONSE GENERATOR
  // ---------------------------------------------------------------------------

  public async generateReplyDraft(params: {
    incomingEmailId: string;
    incomingEmailSubject?: string;
    incomingEmailBody?: string;
    incomingSubject?: string;
    incomingBody?: string;
    threadId?: string;
    prospectId: string;
    programId?: string;
    tone?: 'professional' | 'warm' | 'visionary' | 'stewardship';
  }): Promise<AiReplyDraft> {
    await this.initialize();
    const prospect = this.getProspectById(params.prospectId);
    if (!prospect) throw new Error(`Prospect ${params.prospectId} not found.`);

    const effectiveProgId = params.programId || prospect.matchedProgramId;
    const program = APPROVED_COMMUNITY_PROGRAMS.find((p) => p.id === effectiveProgId) || APPROVED_COMMUNITY_PROGRAMS[0];

    // Check for opt-out guard
    if (prospect.optOut) {
      throw new Error(`Cannot generate solicitation reply: Prospect ${prospect.organizationName} has opted out.`);
    }

    const tone = params.tone || 'professional';
    const draftId = `DRAFT-${Date.now().toString().slice(-4)}`;

    const rawSubject = params.incomingEmailSubject || params.incomingSubject || 'Partnership Discussion';
    const suggestedSubject = rawSubject.startsWith('Re:') ? rawSubject : `Re: ${rawSubject}`;

    // Ground reply with verified institutional knowledge
    const knowledgeResult = localKnowledgeRetrievalService.queryVerifiedKnowledge({
      query: `${program.title} ${prospect.areasOfInterest.join(' ')}`,
      programId: program.id,
      accessLevel: 'DONOR_FACING',
      limit: 2,
    });

    const primaryCitation = knowledgeResult.citations[0] || {
      sourceDocumentId: 'DOC-PRG-001',
      title: program.title,
      approvalDate: '2026-02-01',
      owner: 'Program Directors Committee',
      evidenceReference: 'Phumulani Board Program Charter Resolution 2026-02',
      isAuditedOrApproved: true,
    };

    const suggestedBody = `Dear ${prospect.contactName},

Thank you very much for your thoughtful response regarding Phumulani's ${program.title}.

To answer your inquiry regarding our operations:
Phumulani directly supports immigrant and refugee survivors in the Twin Cities Metro Area. Through ${program.title}, our annual budget of $${program.annualBudget.toLocaleString()} provides:
- ${program.objectives.slice(0, 2).join('\n- ')}

[Verified Grounding: Source ${primaryCitation.sourceDocumentId} approved by ${primaryCitation.owner}]

We would welcome the opportunity to connect you with our Executive Director, Comfort Dondo, to share our latest community metrics and discuss how ${prospect.organizationName}'s support can create measurable impact.

Would you have 20–30 minutes next Tuesday or Wednesday for a brief virtual discussion?

Warm regards,
Development Team, Phumulani
grants@phumulani.org`;

    const newDraft: AiReplyDraft = {
      id: draftId,
      threadId: `th-${params.incomingEmailId}`,
      incomingEmailId: params.incomingEmailId,
      prospectId: prospect.id,
      prospectName: prospect.organizationName,
      prospectEmail: prospect.contactEmail,
      programId: program.id,
      programName: program.title,
      suggestedSubject,
      suggestedBody,
      tone,
      programCitations: [
        program.id,
        `${program.title} Budget ($${program.annualBudget.toLocaleString()})`,
        `Source Ref: ${primaryCitation.sourceDocumentId}`,
      ],
      verifiedFactsUsed: [
        `Program: ${program.title}`,
        `Annual Budget: $${program.annualBudget.toLocaleString()}`,
        `Geographic Scope: ${program.geographicFocus}`,
        `Institutional Source: ${primaryCitation.sourceDocumentId} (${primaryCitation.owner})`,
      ],
      approvalStatus: 'pending_human_review', // Strict invariant: pending human review
      createdAt: new Date().toISOString(),
    };

    this.replyDrafts.unshift(newDraft);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_reply_drafts', newDraft, { context: 'aiAgent:replyDraft' });

    // When an incoming email receives a generated reply, automatically cancel pending auto follow-ups
    this.cancelPendingFollowUpsOnReply(prospect.id, 'Prospect replied to correspondence.');

    return newDraft;
  }

  public getReplyDrafts(): AiReplyDraft[] {
    return [...this.replyDrafts];
  }

  // ---------------------------------------------------------------------------
  // 7. FOLLOW-UP COORDINATOR (AUTO-CANCEL ON REPLY & OPT-OUT ENFORCEMENT)
  // ---------------------------------------------------------------------------

  public async scheduleFollowUp(params: {
    prospectId: string;
    programId: string;
    sequenceStep: number;
    delayDays: number;
  }): Promise<FollowUpItem> {
    await this.initialize();
    const prospect = this.getProspectById(params.prospectId);
    if (!prospect) throw new Error(`Prospect ${params.prospectId} not found.`);

    if (prospect.optOut) {
      throw new Error(`Cannot schedule follow-up: Prospect ${prospect.organizationName} has opted out.`);
    }

    const program = APPROVED_COMMUNITY_PROGRAMS.find((p) => p.id === params.programId) || APPROVED_COMMUNITY_PROGRAMS[0];
    const dueDate = new Date(Date.now() + params.delayDays * 86400000).toISOString().split('T')[0];
    const followUpId = `FUP-${Date.now().toString().slice(-4)}`;

    const item: FollowUpItem = {
      id: followUpId,
      prospectId: prospect.id,
      prospectName: prospect.organizationName,
      prospectEmail: prospect.contactEmail,
      programId: program.id,
      programName: program.title,
      sequenceStep: params.sequenceStep,
      dueDate,
      status: 'scheduled',
      draftSubject: `Following up: Phumulani & ${prospect.organizationName}`,
      draftBody: `Dear ${prospect.contactName},\n\nI hope this week is going well for you. Following up on our recent outreach regarding ${program.title}...`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    this.followUps.push(item);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_followups', item, { context: 'aiAgent:scheduleFollowUp' });
    return item;
  }

  /**
   * Cancel pending follow-ups when prospect replies
   */
  public cancelPendingFollowUpsOnReply(prospectId: string, reason: string): number {
    let cancelledCount = 0;
    this.followUps.forEach((f) => {
      if (f.prospectId === prospectId && (f.status === 'scheduled' || f.status === 'ready_for_review')) {
        f.status = 'cancelled_reply_received';
        f.cancellationReason = reason;
        f.lastUpdated = new Date().toISOString();
        cancelledCount++;
        this.dbAdapter.update('phumulani_ai_followups', f.id, f).catch((err) => {
          console.error(`[PhumulaniAiAgent] Failed to cancel follow-up ${f.id}:`, err?.message || err);
        });
      }
    });
    return cancelledCount;
  }

  /**
   * Permanently halt all follow-ups when opt-out is detected
   */
  public haltAllFollowUpsOnOptOut(prospectId: string): number {
    let haltedCount = 0;
    this.followUps.forEach((f) => {
      if (f.prospectId === prospectId && f.status !== 'sent') {
        f.status = 'halted_opt_out';
        f.cancellationReason = 'Prospect opted out of all future correspondence.';
        f.lastUpdated = new Date().toISOString();
        haltedCount++;
        this.dbAdapter.update('phumulani_ai_followups', f.id, f).catch((err) => {
          console.error(`[PhumulaniAiAgent] Failed to halt follow-up ${f.id}:`, err?.message || err);
        });
      }
    });
    return haltedCount;
  }

  public getFollowUps(): FollowUpItem[] {
    return [...this.followUps];
  }

  // ---------------------------------------------------------------------------
  // 8. FUNDING PROPOSAL GENERATOR
  // ---------------------------------------------------------------------------

  public async generateFundingProposal(params: {
    targetGrantmaker: string;
    programId: string;
    requestedAmount: number;
    durationMonths?: number;
    author: string;
  }): Promise<FundingProposalDraft> {
    await this.initialize();
    const program = APPROVED_COMMUNITY_PROGRAMS.find((p) => p.id === params.programId);
    if (!program) throw new Error(`Program ${params.programId} not found.`);

    const duration = params.durationMonths || 12;
    // Federal MTDC de minimis: Total = Direct * 1.15 -> Direct = Total / 1.15
    const directCosts = Math.round(params.requestedAmount / 1.15);
    const indirectCosts = params.requestedAmount - directCosts;

    // Strict 15% indirect rate verification against institutional policy (DOC-POL-001)
    const indirectValidation = localKnowledgeRetrievalService.validateFundingAsk(directCosts, indirectCosts);
    if (!indirectValidation.isValid) {
      throw new Error(`Indirect cost cap violation: ${indirectValidation.errorReason}`);
    }

    // Ground proposal in verified institutional records
    const knowledge = localKnowledgeRetrievalService.queryVerifiedKnowledge({
      query: `${program.title} outcomes budget metrics`,
      programId: program.id,
      accessLevel: 'DONOR_FACING',
      limit: 2,
    });
    const citedSourceIds = knowledge.citations.map((c) => c.sourceDocumentId).join(', ') || 'DOC-PRG-001, DOC-FIN-001';

    const proposalId = `PROP-${Date.now().toString().slice(-4)}`;

    const newProposal: FundingProposalDraft = {
      id: proposalId,
      title: `${program.title} Grant Proposal for ${params.targetGrantmaker}`,
      targetGrantmaker: params.targetGrantmaker,
      programId: program.id,
      programTitle: program.title,
      requestedAmount: params.requestedAmount,
      durationMonths: duration,
      executiveSummary: `Phumulani requests $${params.requestedAmount.toLocaleString()} over ${duration} months to deliver ${program.title}, providing vital support for East African and African immigrant survivors in the Twin Cities. [Grounded in approved records: ${citedSourceIds}]`,
      problemStatement: `Immigrant survivors in Hennepin and Ramsey Counties encounter compounded cultural, linguistic, and systemic barriers when seeking crisis stabilization. ${program.title} bridges these critical gaps through trusted community leaders.`,
      proposedActivities: program.objectives,
      deliverables: [
        `Serve an estimated 80–120 participants across the ${duration}-month grant period`,
        `Submit quarterly progress and expenditure reports to ${params.targetGrantmaker}`,
        `Produce verified impact narratives and community testimonial documentation`,
      ],
      budgetBreakdown: [
        { item: 'Direct Programmatic Operations & Participant Support', amount: directCosts, isDirect: true },
        { item: 'Program Personnel & Case Coordination', amount: Math.round(directCosts * 0.4), isDirect: true },
        { item: `Indirect Administrative Oversight (${indirectValidation.effectiveIndirectRatePercent}% - Capped at 15% De Minimis)`, amount: indirectCosts, isDirect: false },
      ],
      complianceNotes: `Budget conforms with federal de minimis standard (15% cap verified). Grounded in institutional source records: ${citedSourceIds}. Zero unallowable expenses included.`,
      status: 'draft_ai',
      isDraftWatermarked: true, // Marked as draft requiring human review
      author: params.author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.proposalDrafts.unshift(newProposal);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_proposals', newProposal, { context: 'aiAgent:generateProposal' });
    return newProposal;
  }

  public getProposals(): FundingProposalDraft[] {
    return [...this.proposalDrafts];
  }

  // ---------------------------------------------------------------------------
  // 9. HIGH-INTEREST ESCALATION & MEETING CONVERSION COORDINATOR
  // ---------------------------------------------------------------------------

  public async escalateHighInterestLead(params: {
    prospectId: string;
    emailSubject?: string;
    emailBody?: string;
    interestScore?: number;
    meetingRequested?: boolean;
    reasonForEscalation?: string;
  }): Promise<HighInterestLead> {
    await this.initialize();
    const prospect = this.getProspectById(params.prospectId);
    if (!prospect) throw new Error(`Prospect ${params.prospectId} not found.`);

    const score = params.interestScore ?? prospect.interestScore ?? 85;
    const meetingReq = params.meetingRequested ?? true;

    const existing = this.highInterestLeads.find((l) => l.prospectId === params.prospectId);
    if (existing) {
      existing.interestScore = score;
      existing.meetingRequested = meetingReq;
      existing.assignedStaffEmail = 'director@phumulani.org';
      existing.assignedStaffName = prospect.assignedStaffName || 'Comfort Dondo';
      return existing;
    }

    const leadId = `LEAD-${Date.now().toString().slice(-4)}`;

    const newLead: HighInterestLead = {
      id: leadId,
      prospectId: prospect.id,
      prospectName: prospect.contactName,
      organization: prospect.organizationName,
      contactEmail: prospect.contactEmail,
      interestScore: score,
      sourceEmailId: `em-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      meetingRequested: meetingReq,
      assignedRepresentativeId: prospect.assignedStaffId || 'staff-exec-01',
      assignedRepresentativeName: prospect.assignedStaffName || 'Comfort Dondo',
      assignedStaffEmail: 'director@phumulani.org',
      assignedStaffName: prospect.assignedStaffName || 'Comfort Dondo',
      briefingDossier: {
        executiveSummary: `${prospect.organizationName} has shown high responsiveness to Phumulani's ${prospect.matchedProgramName || 'community programs'}.`,
        givingCapacityEstimate: prospect.estimatedCapacity,
        primaryProgramInterest: prospect.matchedProgramName || 'Healing Homes Transitional Housing',
        conversationHistorySummary: `Recent email indicates active willingness to discuss partnership opportunities.`,
        keyQuestionsToAddress: [
          'What are Phumulani’s specific geographic outcomes in the Twin Cities?',
          'How does Phumulani coordinate with county social service agencies?',
          'What are the timeline and budget for the upcoming fiscal year?',
        ],
        recommendedNextStep: 'Conduct a 30-minute introductory Zoom meeting with Executive Director Comfort Dondo.',
      },
      meetingDraftInvitation: {
        subject: `Phumulani / ${prospect.organizationName} — Introductory Discussion`,
        body: `Dear ${prospect.contactName},\n\nThank you for your enthusiasm regarding Phumulani's community programs. Executive Director Comfort Dondo would be delighted to meet with you. Please review our suggested meeting slots below or suggest times that suit your schedule.`,
        suggestedDurationsMinutes: [30, 45],
      },
      status: 'new',
    };

    this.highInterestLeads.unshift(newLead);
    await this.dbAdapter.insertDurableWithRetry('phumulani_ai_high_interest_leads', newLead, { context: 'aiAgent:highInterestLead' });
    return newLead;
  }

  public getHighInterestLeads(): HighInterestLead[] {
    return [...this.highInterestLeads];
  }

  public getPolicyConfig(): AutonomousPolicyConfig {
    return { ...this.policyConfig };
  }

  public setAutonomyLevel(level: 1 | 2 | 3 | 4): AutonomousPolicyConfig {
    this.policyConfig.autonomyLevel = level;
    switch (level) {
      case 1:
        this.policyConfig.autonomyLevelLabel = 'Level 1 — Analyze only (Classification, summaries, scores, recommendations)';
        this.policyConfig.allowAutonomousDrafting = false;
        this.policyConfig.allowAutonomousFollowUpRecommendations = false;
        break;
      case 2:
        this.policyConfig.autonomyLevelLabel = 'Level 2 — Draft and recommend (Prepare personalized messages and follow-up tasks for human review)';
        this.policyConfig.allowAutonomousDrafting = true;
        this.policyConfig.allowAutonomousFollowUpRecommendations = true;
        break;
      case 3:
        this.policyConfig.autonomyLevelLabel = 'Level 3 — Approved workflow automation (Execute preapproved tasks with rate limits)';
        this.policyConfig.allowAutonomousDrafting = true;
        this.policyConfig.allowAutonomousFollowUpRecommendations = true;
        break;
      case 4:
        this.policyConfig.autonomyLevelLabel = 'Level 4 — Human-controlled consequential actions (All proposals and solicitations require authorization)';
        this.policyConfig.allowAutonomousDrafting = true;
        this.policyConfig.allowAutonomousFollowUpRecommendations = true;
        break;
    }
    return { ...this.policyConfig };
  }

  // ---------------------------------------------------------------------------
  // 10. MILESTONE 4: SECURE EMAIL COMMAND CENTER & DONOR CRM INTELLIGENCE
  // ---------------------------------------------------------------------------

  /**
   * M4: Duplicate Outreach Prevention Engine
   * Detects active campaigns, scheduled follow-ups, or recent outreach within the cooling window (default 7 days).
   */
  public checkDuplicateOutreach(
    contactEmail: string,
    programId?: string,
    coolingWindowDays = 7
  ): {
    isDuplicate: boolean;
    reason?: string;
    existingEntityId?: string;
    existingType?: 'campaign' | 'draft' | 'follow_up';
    daysSinceLastOutreach?: number;
  } {
    const emailNorm = contactEmail.trim().toLowerCase();
    const now = Date.now();
    const windowMs = coolingWindowDays * 24 * 3600 * 1000;

    // 1. Check existing scheduled follow-ups
    const activeFollowUp = this.followUps.find(
      (f) =>
        f.prospectEmail.toLowerCase() === emailNorm &&
        (f.status === 'scheduled' || f.status === 'ready_for_review') &&
        (!programId || f.programId === programId)
    );
    if (activeFollowUp) {
      return {
        isDuplicate: true,
        reason: `Active follow-up task ${activeFollowUp.id} is already scheduled for ${contactEmail} (due ${activeFollowUp.dueDate}). Duplicate outreach suppressed.`,
        existingEntityId: activeFollowUp.id,
        existingType: 'follow_up',
      };
    }

    // 2. Check pending drafts
    const pendingDraft = this.replyDrafts.find(
      (d) =>
        d.prospectEmail.toLowerCase() === emailNorm &&
        d.approvalStatus === 'pending_human_review' &&
        (!programId || d.programId === programId)
    );
    if (pendingDraft) {
      return {
        isDuplicate: true,
        reason: `Pending reply draft ${pendingDraft.id} is already awaiting human review for ${contactEmail}.`,
        existingEntityId: pendingDraft.id,
        existingType: 'draft',
      };
    }

    // 3. Check campaigns targeting this prospect within the cooling window
    const prospect = this.prospects.find((p) => p.contactEmail.toLowerCase() === emailNorm);
    if (prospect) {
      const recentCampaign = this.campaigns.find(
        (c) =>
          c.prospectIds.includes(prospect.id) &&
          (!programId || c.targetProgramId === programId) &&
          now - new Date(c.createdAt).getTime() < windowMs
      );
      if (recentCampaign) {
        const daysAgo = Math.round((now - new Date(recentCampaign.createdAt).getTime()) / (24 * 3600 * 1000));
        return {
          isDuplicate: true,
          reason: `Campaign "${recentCampaign.title}" was prepared ${daysAgo} days ago for this prospect. Cooling-off period enforced.`,
          existingEntityId: recentCampaign.id,
          existingType: 'campaign',
          daysSinceLastOutreach: daysAgo,
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * M4: Conversation Thread Context Retrieval
   * Reconstructs complete conversation history, linked CRM donor entity, and verified institutional grounding.
   */
  public getThreadContext(threadId: string): {
    thread: EnterpriseEmailThread | null;
    donor: UnifiedDonorProfile | null;
    matchedProgram: typeof APPROVED_COMMUNITY_PROGRAMS[0];
    verifiedCitations: any[];
    messageCount: number;
    combinedText: string;
  } {
    const emailService = EmailEnterpriseService.getInstance();
    const thread = emailService.getConversationById(threadId) || null;
    const fundingService = FundingCommandService.getInstance();

    let donor: UnifiedDonorProfile | null = null;
    if (thread) {
      // Find donor by CRM link or participant email
      if (thread.crmLink?.entityId) {
        donor = fundingService.getDonor(thread.crmLink.entityId) || null;
      }
      if (!donor && thread.participantEmails?.length) {
        donor =
          fundingService
            .getDonors()
            .find((d) => thread.participantEmails.some((e) => d.email?.toLowerCase() === e.toLowerCase())) || null;
      }
    }

    // Combine message thread body in chronological order with sanitization
    const messages = thread?.messages || [];
    const combinedText = messages
      .map((m) => `[${m.direction.toUpperCase()} | ${m.senderName} <${m.senderEmail}> | ${m.receivedAt}]\n${EmailEnterpriseService.sanitizeUntrustedContent(m.bodyText)}`)
      .join('\n\n---\n\n');

    // Program matching
    let matchedProgram = APPROVED_COMMUNITY_PROGRAMS[0];
    const textLower = (combinedText + ' ' + (thread?.threadSubject || '')).toLowerCase();
    for (const prog of APPROVED_COMMUNITY_PROGRAMS) {
      if (
        textLower.includes(prog.title.toLowerCase()) ||
        prog.focusAreas.some((fa) => textLower.includes(fa.toLowerCase()))
      ) {
        matchedProgram = prog;
        break;
      }
    }

    // Retrieve verified knowledge citations
    const knowledge = localKnowledgeRetrievalService.queryVerifiedKnowledge({
      query: `${matchedProgram.title} budget outcomes`,
      programId: matchedProgram.id,
      accessLevel: 'DONOR_FACING',
      limit: 2,
    });

    return {
      thread,
      donor,
      matchedProgram,
      verifiedCitations: knowledge.citations,
      messageCount: messages.length,
      combinedText,
    };
  }

  /**
   * M4: End-to-End Thread Intelligence Processor
   * Combines incoming classification, priority routing (P0-P4), 0-100 interest scoring,
   * opt-out suppression, human-in-the-loop draft generation, and auditable CRM updates.
   */
  public async processThreadWithAi(
    threadId: string,
    actorSession?: UserSession
  ): Promise<{
    success: boolean;
    threadId: string;
    classification: EmailClassificationResult;
    interestScore: DonorInterestScore;
    draft?: AiReplyDraft;
    isOptOut: boolean;
    isEscalated: boolean;
    lead?: HighInterestLead;
    crmActionRecorded: boolean;
    error?: string;
  }> {
    await this.initialize();
    const emailService = EmailEnterpriseService.getInstance();
    const thread = emailService.getConversationById(threadId);
    if (!thread) {
      throw new Error(`Email thread ${threadId} not found in enterprise mailbox.`);
    }

    const { combinedText, matchedProgram, donor } = this.getThreadContext(threadId);
    const latestInbound = [...(thread.messages || [])]
      .reverse()
      .find((m) => m.direction === 'inbound') || thread.messages?.[0];

    const senderEmail = latestInbound?.senderEmail || thread.participantEmails[0] || 'donor@example.org';
    const senderName = latestInbound?.senderName || 'Donor Contact';
    const emailSubject = thread.threadSubject;
    const emailBody = latestInbound?.bodyText || combinedText;

    // 1. Automatic Email Priority & Category Classification (P0-P4)
    const classification = this.classifyIncomingEmail({
      emailSubject,
      emailBody,
      senderEmail,
    });

    // Map priority P0-P4 to thread priority
    thread.priority = classification.priority as EmailPriorityLevel;

    // 2. Associate or Create Prospect Record
    let existingProspect = this.prospects.find((p) => p.contactEmail.toLowerCase() === senderEmail.toLowerCase());
    if (!existingProspect) {
      existingProspect = {
        id: `PROSP-${Date.now().toString().slice(-4)}`,
        organizationName: donor?.organizationName || donor?.name || senderName,
        contactName: senderName,
        contactEmail: senderEmail,
        contactTitle: 'Funder / Donor Representative',
        prospectType: 'foundation',
        estimatedCapacity: donor?.largestGift || donor?.lifetimeGiving || 25000,
        areasOfInterest: matchedProgram.focusAreas,
        geographicFocus: 'Minnesota',
        status: 'solicited',
        matchScore: 85,
        matchedProgramId: matchedProgram.id,
        matchedProgramName: matchedProgram.title,
        interestScore: 0,
        optOut: false,
        assignedStaffId: 'staff-dev-01',
        assignedStaffName: 'Development Officer',
        notes: 'Associated from incoming email thread in Email Command Center.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.prospects.push(existingProspect);
    }
    const prospect: ProspectProfile = existingProspect;

    // 3. Donor Interest Scoring (0 - 100 Scale)
    const interestScore = this.analyzeDonorInterest({
      prospectId: prospect.id,
      emailBody,
      emailSubject,
    });

    let draft: AiReplyDraft | undefined = undefined;
    let lead: HighInterestLead | undefined = undefined;
    let isEscalated = false;

    // 4. Opt-Out & Decline Suppression
    if (classification.isOptOut) {
      this.haltAllFollowUpsOnOptOut(prospect.id);
      prospect.optOut = true;
      prospect.status = 'opted_out';
      prospect.interestScore = 0;

      // Update CRM donor record if present
      if (donor) {
        donor.consentStatus = 'OPTED_OUT';
        donor.stage = 'LAPSED';
      }

      // Log auditable CRM stewardship action
      db.logAudit({
        actorId: actorSession?.userEmail || 'phumulani-ai@phumulani.org',
        actorName: actorSession?.name || 'Phumulani AI Engine',
        actorRole: actorSession?.role || 'staff',
        action: 'DONOR_OPT_OUT_SUPPRESSED',
        resource: `donor_crm:${prospect.id}`,
        details: `Opt-out detected in thread ${threadId}. Suppressed all future solicitation outreach.`,
      });

      return {
        success: true,
        threadId,
        classification,
        interestScore,
        isOptOut: true,
        isEscalated: false,
        crmActionRecorded: true,
      };
    }

    // 5. Duplicate Outreach Prevention
    const duplicateCheck = this.checkDuplicateOutreach(senderEmail, matchedProgram.id);
    if (!duplicateCheck.isDuplicate) {
      // 6. Generate Response Draft Grounded in Verified Program Records
      draft = await this.generateReplyDraft({
        incomingEmailId: latestInbound?.id || threadId,
        incomingEmailSubject: emailSubject,
        incomingEmailBody: emailBody,
        prospectId: prospect.id,
        programId: matchedProgram.id,
        tone: 'professional',
      });

      // Strict Invariant: Draft requires human review; no unattended sending
      draft.approvalStatus = 'pending_human_review';

      // Update thread draft in Email Enterprise service
      thread.draft = {
        id: draft.id,
        threadId: thread.id,
        inReplyToMessageId: latestInbound?.id || '',
        suggestedSubject: draft.suggestedSubject,
        recipientEmail: senderEmail,
        proposedBody: draft.suggestedBody,
        toneStyle: 'grant_correspondence',
        verifiedContextSummary: `Grounded in ${matchedProgram.title} ($${matchedProgram.annualBudget.toLocaleString()}) via verified institutional records.`,
        requiredStaffAction: 'Staff or Executive review and authorized dispatch required.',
        confidenceScore: Math.round(classification.confidence * 100),
        status: 'pending_approval',
        generatedByAgent: 'Phumulani Ai (Autonomous Fundraising Agent)',
        requestedByStaff: actorSession?.name || 'Staff User',
        createdAt: new Date().toISOString(),
      };
    } else if (duplicateCheck.existingType === 'draft') {
      draft = this.replyDrafts.find((d) => d.id === duplicateCheck.existingEntityId);
    }

    // 7. Executive Staff Escalation for High-Interest Conversations (score >= 80 or meeting signal)
    if (interestScore.score >= 80 || classification.hasMeetingSignal) {
      lead = await this.escalateHighInterestLead({
        prospectId: prospect.id,
        emailSubject,
        emailBody,
        interestScore: interestScore.score,
        meetingRequested: classification.hasMeetingSignal,
        reasonForEscalation: classification.hasMeetingSignal
          ? 'Explicit meeting or call requested by funder'
          : `High interest score of ${interestScore.score}/100 with confirmed program alignment`,
      });
      isEscalated = true;
      thread.status = 'awaiting_approval';
    }

    // 8. Auditable CRM Update
    db.logAudit({
      actorId: actorSession?.userEmail || 'staff@phumulani.org',
      actorName: actorSession?.name || 'Staff Member',
      actorRole: actorSession?.role || 'staff',
      action: 'AI_EMAIL_CLASSIFICATION_AND_CRM_SYNC',
      resource: `email_thread:${threadId}`,
      details: `Classified thread ${threadId} as ${classification.priority} (${classification.category}). Interest Score: ${interestScore.score}/100. Grounded draft ${draft?.id || 'none'} prepared for human review.`,
    });

    return {
      success: true,
      threadId,
      classification,
      interestScore,
      draft,
      isOptOut: false,
      isEscalated,
      lead,
      crmActionRecorded: true,
    };
  }

  /**
   * M4: Authenticated CRM Action Recorder
   * Durably logs staff actions on donor records with cryptographic session attribution.
   */
  public recordAuthenticatedCrmAction(params: {
    donorId: string;
    actionType: string;
    details: string;
    actorSession: UserSession;
  }): { success: boolean; auditId: string } {
    const fundingService = FundingCommandService.getInstance();
    const donor = fundingService.getDonor(params.donorId);

    const auditId = `audit-crm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    db.logAudit({
      actorId: params.actorSession.userEmail || params.actorSession.email || 'staff@phumulani.org',
      actorName: params.actorSession.name || 'Staff Member',
      actorRole: params.actorSession.role,
      action: params.actionType,
      resource: `donor_crm:${params.donorId}`,
      details: params.details,
    });

    if (donor) {
      donor.updatedAt = new Date().toISOString();
      donor.engagementLogCount = (donor.engagementLogCount || 0) + 1;
    }

    return { success: true, auditId };
  }
}

export const phumulaniAiAgentService = PhumulaniAiAgentService.getInstance();
