/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Communications, Brand Manual, Safeguarding & Social Governance Service
 * Grounded in: Phumulani Social Media Policy, Guidelines & Brand Manual — Working Draft v1.0
 */

import crypto from 'crypto';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import {
  AnalyticsSourceClassification,
  BRAND_MANUAL_STATUS,
  CommunicationsGovernanceSnapshot,
  ConsentRecord,
  ConsentScope,
  CONTENT_PILLARS,
  ContentPillarId,
  EditorialWorkflowStage,
  EDITORIAL_WORKFLOW_STAGES,
  EscalationTier,
  ModerationIncident,
  PLATFORM_SPECIFICATIONS,
  SensitiveContentCategory,
  SocialAccountGovernanceRecord,
  SocialAnalyticsRecord,
  SocialApprovalAuditEntry,
  SocialEditorialItem,
  SocialPlatform,
} from '../types/communications';

export interface GovernanceActor {
  userId: string;
  name: string;
  email?: string;
  role: string;
}

export const SENSITIVE_CATEGORIES: ReadonlySet<SensitiveContentCategory> = new Set([
  'SURVIVOR_STORY',
  'CRISIS_RESOURCE',
  'MINOR_RELATED',
  'PARTNER_GOVERNMENT_STATEMENT',
  'FUNDRAISING_CLAIM',
  'CRISIS_MODERATION_RESPONSE',
]);

export const APPROVED_RESPONSE_TEMPLATES = [
  {
    id: 'TPL-DAY-ONE-CRISIS',
    tier: 'RED' as EscalationTier,
    title: '24/7 Confidential Crisis & Safe Exit Routing',
    body: 'For immediate 24/7 confidential domestic violence support in Minnesota, please call or text the Minnesota Day One Crisis Line at 1-866-223-1111, or contact Phumulani office line 612-251-9421 / info@phumulani.org. Please do not share personal details in public comments.',
  },
  {
    id: 'TPL-PROGRAM-REFERRAL',
    tier: 'YELLOW' as EscalationTier,
    title: 'General Program Inquiry & Private Routing',
    body: 'Thank you for reaching out to Phumulani. To connect confidentially with our program team about healing circles, housing advocacy, or career workshops, please email info@phumulani.org or call 612-251-9421.',
  },
  {
    id: 'TPL-ORANGE-MISINFO-HOLD',
    tier: 'ORANGE' as EscalationTier,
    title: 'Institutional Accuracy & Executive Review Statement',
    body: 'Thank you for raising this question. Phumulani takes organizational accountability and survivor privacy seriously. Please visit phumulani.org or contact info@phumulani.org so leadership can share verified documentation directly.',
  },
  {
    id: 'TPL-GREEN-GRATITUDE',
    tier: 'GREEN' as EscalationTier,
    title: 'Community Appreciation & Resource Share',
    body: 'Thank you for standing with Phumulani in building safe, culturally rooted pathways to healing and economic independence across Minnesota.',
  },
] as const;

const KNOWN_PUBLIC_ANCHORS = new Set([
  '/',
  '/#founder-section',
  '/#programs-section',
  '/#get-involved-section',
  '/#about-section',
  '/#events-section',
  '/#contact-section',
  '/#get-help-section',
  '/#donate-section',
  '/#mission-section',
  '/#leadership-section',
  '/#volunteer-section',
  '/#partnerships-section',
  '/#news-section',
  '/#resources-section',
  '/#privacy-section',
  '/#accessibility-section',
]);

// Fail-closed patterns blocking VAWA § 1367 survivor PII, shelter addresses, immigration numbers, medical/legal advice
const CONFIDENTIAL_PII_PATTERNS: Array<{ code: string; label: string; regex: RegExp }> = [
  { code: 'SSN_OR_TAX_ID', label: 'Social Security Number', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  {
    code: 'IMMIGRATION_A_NUMBER',
    label: 'USCIS Alien / A-Number or Petition Identifier',
    regex: /\b(?:A-?\d{8,9}|EAC\d{10}|WAC\d{10}|LIN\d{10}|SRC\d{10}|IOE\d{10}|I-360|I-918)\b/i,
  },
  {
    code: 'SHELTER_ADDRESS_EXPOSURE',
    label: 'Potential Shelter or Safe-House Street Address',
    regex: /\b\d{2,5}\s+[A-Za-z0-9.\s]{2,30}\b(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Ln|Lane|Ct)\b[^.\n]{0,40}\b(?:shelter|safe\s*house|healing\s*home|confidential\s*address)\b|\b(?:shelter|safe\s*house|healing\s*home)\b[^.\n]{0,40}\b\d{2,5}\s+[A-Za-z0-9.\s]{2,30}\b(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Ln|Lane|Ct)\b/i,
  },
  {
    code: 'COURT_DOCKET_NUMBER',
    label: 'Confidential Case / Court Docket Number',
    regex: /\b(?:OFP-\d{2,6}|27-FA-\d{2,}|62-FA-\d{2,}|CASE#\s*[A-Z0-9-]{4,}|RESTRICTED-INTAKE-[A-Z0-9-]+)\b/i,
  },
  {
    code: 'CONSENT_FORM_LEAK',
    label: 'Media Consent Record Dump Inside Public Draft',
    regex: /\b(?:CONSENT-SIGNED-BY|GUARDIAN_SIGNATURE|MEDIA_CONSENT_VAULT_EXPORT)\b/i,
  },
];

const CLINICAL_LEGAL_COUNSEL_PATTERNS: Array<{ code: string; label: string; regex: RegExp }> = [
  {
    code: 'INDIVIDUAL_LEGAL_ADVICE',
    label: 'Individualized Legal or Immigration Representation',
    regex: /\b(?:you\s+should\s+file\s+(?:an\s+OFP|form\s+I-\d+)|legal\s+opinion\s+on\s+your\s+case|as\s+your\s+attorney|immigration\s+case\s+strategy\s+for)\b/i,
  },
  {
    code: 'INDIVIDUAL_CLINICAL_OR_MEDICAL',
    label: 'Individual Clinical Diagnosis or Medical Advice',
    regex: /\b(?:clinical\s+diagnosis|prescribe\s+medication|dosage\s+recommendation|trauma\s+diagnosis\s+for)\b/i,
  },
  {
    code: 'PERSONALIZED_SAFETY_PLAN',
    label: 'Individualized Crisis Safety Plan Generation',
    regex: /\b(?:personal(?:ized)?\s+safety\s+plan\s+for\s+(?:survivor|client|her|him)|escape\s+route\s+from\s+\d+)\b/i,
  },
];

const MATERIAL_FIELDS: Array<keyof SocialEditorialItem> = [
  'title',
  'pillar',
  'platform',
  'contentType',
  'sensitiveCategory',
  'consentRequired',
  'consentRecordId',
  'captionHook',
  'captionContext',
  'captionValue',
  'captionConnection',
  'captionCta',
  'targetUrl',
  'assetFilename',
  'assetDimensions',
  'socialBodyFontSizePx',
  'altText',
  'videoCaptionsVerified',
];

function computeSha256(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function generateCompliantAssetFilename(params: {
  date: string;
  platform: SocialPlatform;
  contentType: SocialEditorialItem['contentType'];
  topic: string;
  version: number;
}): string {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : new Date().toISOString().slice(0, 10);
  const shortCode = PLATFORM_SPECIFICATIONS[params.platform]?.shortCode || 'SOCIAL';
  const cleanTopic =
    params.topic
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('') || 'CommunityUpdate';
  const safeVersion = Math.max(1, Number(params.version) || 1);
  return `${safeDate}_${shortCode}_${params.contentType}_${cleanTopic}_v${safeVersion}`;
}

export function isCompliantAssetFilename(filename: string): boolean {
  return /^\d{4}-\d{2}-\d{2}_[A-Z]+_[A-Za-z]+_[A-Za-z0-9]+_v\d+$/.test((filename || '').trim());
}

export function scanTextForConfidentialPii(text: string): { safe: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const rule of CONFIDENTIAL_PII_PATTERNS) {
    if (rule.regex.test(text)) {
      violations.push(`${rule.code}: ${rule.label}`);
    }
  }
  return { safe: violations.length === 0, violations };
}

export function scanAiPromptSafety(text: string): { allowed: boolean; violations: string[] } {
  const pii = scanTextForConfidentialPii(text);
  const violations = [...pii.violations];
  for (const rule of CLINICAL_LEGAL_COUNSEL_PATTERNS) {
    if (rule.regex.test(text)) {
      violations.push(`${rule.code}: ${rule.label}`);
    }
  }
  return { allowed: violations.length === 0, violations };
}

export function normalizeRoleCapability(roleRaw: string): {
  canViewWorkspace: boolean;
  canCreateOrEditDraft: boolean;
  canAdvanceStandardReview: boolean;
  canApproveNonSensitiveSchedule: boolean;
  canApproveSensitiveExecutive: boolean;
  canManageConsentVault: boolean;
  canViewConsentVault: boolean;
  canManageModerationTiers: EscalationTier[];
  canApproveOrangeModeration: boolean;
  canResolveRedPause: boolean;
  canEditAccountGovernance: boolean;
  canUseAiAssist: boolean;
  isReadOnly: boolean;
} {
  const r = String(roleRaw || '').toLowerCase();

  if (['master_admin', 'platform_super_admin', 'super_admin', 'executive_director', 'executive'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: true,
      canAdvanceStandardReview: true,
      canApproveNonSensitiveSchedule: true,
      canApproveSensitiveExecutive: true,
      canManageConsentVault: true,
      canViewConsentVault: true,
      canManageModerationTiers: ['GREEN', 'YELLOW', 'ORANGE', 'RED'],
      canApproveOrangeModeration: true,
      canResolveRedPause: true,
      canEditAccountGovernance: true,
      canUseAiAssist: true,
      isReadOnly: false,
    };
  }

  if (['safeguarding_lead', 'safeguarding_officer'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: true,
      canAdvanceStandardReview: true,
      canApproveNonSensitiveSchedule: false,
      canApproveSensitiveExecutive: false,
      canManageConsentVault: true,
      canViewConsentVault: true,
      canManageModerationTiers: ['GREEN', 'YELLOW', 'ORANGE', 'RED'],
      canApproveOrangeModeration: false,
      canResolveRedPause: true,
      canEditAccountGovernance: false,
      canUseAiAssist: true,
      isReadOnly: false,
    };
  }

  if (['communications_lead', 'communications_officer', 'staff'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: true,
      canAdvanceStandardReview: true,
      canApproveNonSensitiveSchedule: true,
      canApproveSensitiveExecutive: false,
      canManageConsentVault: true,
      canViewConsentVault: true,
      canManageModerationTiers: ['GREEN', 'YELLOW'],
      canApproveOrangeModeration: false,
      canResolveRedPause: false,
      canEditAccountGovernance: true,
      canUseAiAssist: true,
      isReadOnly: false,
    };
  }

  if (['program_director', 'programs_director', 'program_manager', 'development_director', 'grants_director', 'department_manager', 'volunteer_coordinator'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: true,
      canAdvanceStandardReview: true,
      canApproveNonSensitiveSchedule: false,
      canApproveSensitiveExecutive: false,
      canManageConsentVault: false,
      canViewConsentVault: true,
      canManageModerationTiers: ['GREEN', 'YELLOW'],
      canApproveOrangeModeration: false,
      canResolveRedPause: false,
      canEditAccountGovernance: false,
      canUseAiAssist: true,
      isReadOnly: false,
    };
  }

  if (['intern_content_assistant', 'intern'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: true,
      canAdvanceStandardReview: false,
      canApproveNonSensitiveSchedule: false,
      canApproveSensitiveExecutive: false,
      canManageConsentVault: false,
      canViewConsentVault: false,
      canManageModerationTiers: ['GREEN'],
      canApproveOrangeModeration: false,
      canResolveRedPause: false,
      canEditAccountGovernance: false,
      canUseAiAssist: true,
      isReadOnly: false,
    };
  }

  if (['board_advisor_partner', 'board_member', 'governance_officer', 'finance_director', 'finance_officer'].includes(r)) {
    return {
      canViewWorkspace: true,
      canCreateOrEditDraft: false,
      canAdvanceStandardReview: false,
      canApproveNonSensitiveSchedule: false,
      canApproveSensitiveExecutive: false,
      canManageConsentVault: false,
      canViewConsentVault: false,
      canManageModerationTiers: [],
      canApproveOrangeModeration: false,
      canResolveRedPause: false,
      canEditAccountGovernance: false,
      canUseAiAssist: false,
      isReadOnly: true,
    };
  }

  return {
    canViewWorkspace: false,
    canCreateOrEditDraft: false,
    canAdvanceStandardReview: false,
    canApproveNonSensitiveSchedule: false,
    canApproveSensitiveExecutive: false,
    canManageConsentVault: false,
    canViewConsentVault: false,
    canManageModerationTiers: [],
    canApproveOrangeModeration: false,
    canResolveRedPause: false,
    canEditAccountGovernance: false,
    canUseAiAssist: false,
    isReadOnly: true,
  };
}

export class CommunicationsGovernanceService {
  private static instance: CommunicationsGovernanceService;
  private db: PostgresPersistenceAdapter;
  private initialized = false;

  private constructor() {
    this.db = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): CommunicationsGovernanceService {
    if (!CommunicationsGovernanceService.instance) {
      CommunicationsGovernanceService.instance = new CommunicationsGovernanceService();
    }
    return CommunicationsGovernanceService.instance;
  }

  public async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await this.db.initialize();

    const existingItems = await this.db.select<SocialEditorialItem>('social_editorial_items');
    if (existingItems.length === 0) {
      await this.seedInitialRecords();
    }
    this.initialized = true;
  }

  private async seedInitialRecords(): Promise<void> {
    const now = '2026-11-15T10:00:00.000Z';

    const consents: ConsentRecord[] = [
      {
        id: 'CNS-2026-001',
        subjectAlias: 'Community Participant Alias A-14',
        subjectType: 'COMMUNITY_PARTNER',
        allowedScopes: ['PUBLIC_WEB', 'SOCIAL_MEDIA', 'NEWSLETTER'],
        consentStatus: 'GRANTED',
        guardianConsentVerified: true,
        bestInterestsReviewCompleted: true,
        obtainedAt: '2026-10-12T14:00:00Z',
        takedownRequired: false,
        restrictedAccessTier: 'SAFEGUARDING_AND_COMMS_LEADS_ONLY',
        verificationSummary: 'Written adult release on file for Sisterhood Tea Healing Circle outreach photography.',
      },
      {
        id: 'CNS-2026-002',
        subjectAlias: 'Youth Mentorship Participant M-07',
        subjectType: 'MINOR',
        allowedScopes: ['PUBLIC_WEB', 'SOCIAL_MEDIA'],
        consentStatus: 'PENDING',
        guardianConsentVerified: true,
        bestInterestsReviewCompleted: false,
        guardianReviewerName: 'Sister Miriam K. (Safeguarding Lead)',
        obtainedAt: '2026-11-08T16:30:00Z',
        takedownRequired: false,
        restrictedAccessTier: 'SAFEGUARDING_AND_COMMS_LEADS_ONLY',
        verificationSummary: 'Parent/guardian signed form recorded; awaiting best-interests safeguarding clearance before public/social release.',
      },
      {
        id: 'CNS-2026-003',
        subjectAlias: 'Leadership Speaker S-01 (Comfort Dondo)',
        subjectType: 'STAFF',
        allowedScopes: ['PUBLIC_WEB', 'SOCIAL_MEDIA', 'NEWSLETTER', 'FUNDRAISING', 'VIDEO_STORY'],
        consentStatus: 'GRANTED',
        guardianConsentVerified: true,
        bestInterestsReviewCompleted: true,
        obtainedAt: '2026-09-01T09:00:00Z',
        takedownRequired: false,
        restrictedAccessTier: 'SAFEGUARDING_AND_COMMS_LEADS_ONLY',
        verificationSummary: 'Standing executive leadership media release approved.',
      },
    ];

    const editorialItemsSeed: SocialEditorialItem[] = [
      {
        id: 'SOC-2026-001',
        title: 'Day One Crisis Line & Safe Exit 24/7 Resource Carousel',
        pillar: 'SAFETY_AND_RESOURCES',
        platform: 'INSTAGRAM',
        contentType: 'Carousel',
        scheduledDate: '2026-11-22',
        milestoneTag: 'MS-FRI',
        stage: 'FINAL_APPROVAL_REQUIRED',
        approvalStatus: 'FINAL_APPROVAL_REQUIRED',
        version: 1,
        sensitiveCategory: 'CRISIS_RESOURCE',
        requiresExecutiveApproval: true,
        consentRequired: false,
        captionHook: 'No woman should navigate crisis alone or without a safe exit plan.',
        captionContext: 'Minnesota families facing domestic violence can access free, confidential, multilingual advocacy 24/7.',
        captionValue: 'Save our verified support card: Day One Crisis Line (1-866-223-1111) and Phumulani confidential intake routing.',
        captionConnection: 'Every Phumulani call connects directly with trauma-informed immigrant advocates — never bots or unvetted hotlines.',
        captionCta: 'Share this resource card or reach phumulani.org for Safe Exit protected help.',
        hashtags: ['#Phumulani', '#SafeHealing', '#ImmigrantSurvivors', '#MinnesotaNonprofit'],
        targetUrl: 'https://phumulani.org/#get-help-section',
        linkVerified: true,
        assetFilename: '2026-11-22_IG_Carousel_DayOneCrisisResources_v1',
        assetState: 'DRAFT',
        assetDimensions: '1080x1350',
        socialBodyFontSizePx: 32,
        altText: 'Soft Cream and Deep Earth Carousel card listing Day One Crisis Line 1-866-223-1111 and Phumulani confidential support hours.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Amina Yusuf',
        createdByRole: 'communications_lead',
        lastEditedBy: 'Amina Yusuf',
        lastEditedAt: now,
        reviewedBy: 'Amina Yusuf',
        reviewedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-002',
        title: 'Winter Tea Healing Circle Community Gathering',
        pillar: 'HEALING_AND_WHOLENESS',
        platform: 'FACEBOOK',
        contentType: 'SingleGraphic',
        scheduledDate: '2026-11-24',
        milestoneTag: 'MS-30',
        stage: 'SCHEDULE',
        approvalStatus: 'APPROVED_FOR_EXPORT',
        version: 2,
        sensitiveCategory: 'NONE',
        requiresExecutiveApproval: false,
        consentRequired: true,
        consentRecordId: 'CNS-2026-001',
        captionHook: 'Healing happens in trusted sisterhood, warmth, and shared cultural dignity.',
        captionContext: 'Our Tea Healing Circles bring women together in a confidential, community-led space grounded in Ubuntu.',
        captionValue: 'Guided trauma-informed conversation, herbal tea, and peer encouragement in English, Somali, and Oromo.',
        captionConnection: 'Facilitated by Comfort Dondo and trained Phumulani peer leaders across the Twin Cities.',
        captionCta: 'RSVP through the Community Hub at phumulani.org/#events-section.',
        hashtags: ['#PhumulaniMN', '#CommunityHealing', '#TeaHealingCircle'],
        targetUrl: 'https://phumulani.org/#events-section',
        linkVerified: true,
        assetFilename: '2026-11-24_FB_SingleGraphic_TeaHealingCircle_v2',
        assetState: 'FINAL_APPROVED',
        assetDimensions: '1080x1080',
        socialBodyFontSizePx: 30,
        altText: 'Warm portrait-framed graphic on Soft Cream inviting women to the November Tea Healing Circle with Phumulani logo on a white header strip.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Communications Intern',
        createdByRole: 'intern_content_assistant',
        lastEditedBy: 'Amina Yusuf',
        lastEditedAt: now,
        reviewedBy: 'Amina Yusuf',
        reviewedAt: now,
        finalApprovedBy: 'Amina Yusuf',
        finalApprovedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-003',
        title: 'Minnesota Safe Lease Termination Statute 504B.206 Explainer',
        pillar: 'EDUCATION_AND_AWARENESS',
        platform: 'LINKEDIN',
        contentType: 'Carousel',
        scheduledDate: '2026-11-26',
        milestoneTag: 'MS-27',
        stage: 'REVIEW',
        approvalStatus: 'IN_REVIEW',
        version: 1,
        sensitiveCategory: 'NONE',
        requiresExecutiveApproval: false,
        consentRequired: false,
        captionHook: 'Did you know Minnesota law protects domestic abuse survivors breaking a lease for safety?',
        captionContext: 'Many immigrant tenants fear eviction records or financial penalties when fleeing unsafe housing.',
        captionValue: 'Under Minn. Stat. § 504B.206, survivors may terminate a residential lease with qualifying documentation and deposit protection.',
        captionConnection: 'Phumulani housing advocates accompany women step-by-step with culturally attuned legal referrals.',
        captionCta: 'Download the Safe Lease Toolkit at phumulani.org/#resources-section.',
        hashtags: ['#NonprofitLeadership', '#Phumulani', '#Minnesota501c3', '#HousingJustice'],
        targetUrl: 'https://phumulani.org/#resources-section',
        linkVerified: true,
        assetFilename: '2026-11-26_LI_Carousel_SafeLeaseRights_v1',
        assetState: 'DRAFT',
        assetDimensions: '1200x628',
        socialBodyFontSizePx: 29,
        altText: 'LinkedIn slide deck summarizing Minnesota Statute 504B.206 survivor lease termination protections.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Grace Nakabugo, MSW',
        createdByRole: 'program_director',
        lastEditedBy: 'Grace Nakabugo, MSW',
        lastEditedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-004',
        title: 'Ubuntu Cultural Heritage & Multilingual Inclusion Reel',
        pillar: 'COMMUNITY_AND_CULTURE',
        platform: 'TIKTOK_REELS',
        contentType: 'ReelVideo',
        scheduledDate: '2026-11-28',
        milestoneTag: 'MS-27',
        stage: 'DESIGN',
        approvalStatus: 'DRAFT_IN_PROGRESS',
        version: 1,
        sensitiveCategory: 'NONE',
        requiresExecutiveApproval: false,
        consentRequired: true,
        consentRecordId: 'CNS-2026-003',
        captionHook: 'I am because we are — celebrating multilingual resilience across the Twin Cities.',
        captionContext: 'Language access is safety access when families seek housing, healthcare, and legal advocacy.',
        captionValue: 'Inside our community resource guides in English, Somali, Oromo, Hmong, and Spanish.',
        captionConnection: 'Phumulani centers African & immigrant cultural dignity in every workshop.',
        captionCta: 'Explore our multilingual portal using the header language switcher at phumulani.org.',
        hashtags: ['#Phumulani', '#Ubuntu', '#CulturalDignity'],
        targetUrl: 'https://phumulani.org/',
        linkVerified: true,
        assetFilename: '2026-11-28_REEL_ReelVideo_UbuntuMultilingual_v1',
        assetState: 'DRAFT',
        assetDimensions: '1080x1920',
        socialBodyFontSizePx: 34,
        altText: 'Vertical Reel with large high-contrast Charcoal captions on Soft Cream band introducing Phumulani multilingual guides.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Amina Yusuf',
        createdByRole: 'communications_lead',
        lastEditedBy: 'Amina Yusuf',
        lastEditedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-005',
        title: 'Youth Leadership Mentorship Cohort Enrollment Notice',
        pillar: 'PROGRAMS_AND_EVENTS',
        platform: 'INSTAGRAM',
        contentType: 'SingleGraphic',
        scheduledDate: '2026-11-29',
        milestoneTag: 'MS-25',
        stage: 'DRAFT',
        approvalStatus: 'DRAFT_IN_PROGRESS',
        version: 1,
        sensitiveCategory: 'MINOR_RELATED',
        requiresExecutiveApproval: true,
        consentRequired: true,
        consentRecordId: 'CNS-2026-002',
        captionHook: 'Investing in confident young leaders across immigrant families in Minnesota.',
        captionContext: 'Our Youth Leadership cohort builds academic mentorship, financial habits, and culturally proud peer support.',
        captionValue: 'Small-group coaching hosted in vetted community hubs with guardian-approved enrollment.',
        captionConnection: 'Supported by Phumulani youth mentors and Community Engagement educators.',
        captionCta: 'Inquire privately at phumulani.org/#programs-section (minor safeguards active).',
        hashtags: ['#Phumulani', '#YouthMentorship', '#MinnesotaCommunity'],
        targetUrl: 'https://phumulani.org/#programs-section',
        linkVerified: true,
        assetFilename: '2026-11-29_IG_SingleGraphic_YouthMentorship_v1',
        assetState: 'DRAFT',
        assetDimensions: '1080x1350',
        socialBodyFontSizePx: 30,
        altText: 'Graphic announcing the Youth Leadership Mentorship inquiry window with geometric heritage border.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Amina Yusuf',
        createdByRole: 'communications_lead',
        lastEditedBy: 'Amina Yusuf',
        lastEditedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-006',
        title: 'Year-End 501(c)(3) Safe Housing & Entrepreneurship Matching Appeal',
        pillar: 'IMPACT_AND_FUNDRAISING',
        platform: 'EMAIL_NEWSLETTER',
        contentType: 'Newsletter',
        scheduledDate: '2026-12-01',
        milestoneTag: 'MS-30',
        stage: 'FINAL_APPROVAL_REQUIRED',
        approvalStatus: 'FINAL_APPROVAL_REQUIRED',
        version: 1,
        sensitiveCategory: 'FUNDRAISING_CLAIM',
        requiresExecutiveApproval: true,
        consentRequired: false,
        captionHook: 'Every restricted dollar directly funds safe housing stabilization and survivor career training.',
        captionContext: 'As winter approaches, immigrant mothers rebuilding after crisis face urgent rent and workforce barriers.',
        captionValue: '100% tax-deductible 501(c)(3) gifts fund direct advocacy and funding-dependent entrepreneurship micro-grants.',
        captionConnection: 'Audited stewardship led by Comfort Dondo and David Mwangi, CPA.',
        captionCta: 'Partner with us at phumulani.org/#donate-section.',
        hashtags: ['#Minnesota501c3', '#EconomicIndependence'],
        targetUrl: 'https://phumulani.org/#donate-section',
        linkVerified: true,
        assetFilename: '2026-12-01_EMAIL_Newsletter_YearEndAppeal_v1',
        assetState: 'DRAFT',
        assetDimensions: '1200x600',
        socialBodyFontSizePx: 18,
        altText: 'Phumulani year-end 501(c)(3) stewardship banner showing safe housing and economic independence impact pillars.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'David Mwangi, CPA',
        createdByRole: 'finance_director',
        lastEditedBy: 'David Mwangi, CPA',
        lastEditedAt: now,
        reviewedBy: 'Amina Yusuf',
        reviewedAt: now,
        exportPackageOnly: true,
      },
      {
        id: 'SOC-2026-007',
        title: 'Comfort Dondo & Legal Aid Partners Community Alliance Reflection',
        pillar: 'TEAM_AND_PARTNERS',
        platform: 'LINKEDIN',
        contentType: 'Article',
        scheduledDate: '2026-12-03',
        milestoneTag: 'MS-30',
        stage: 'FINAL_APPROVAL_REQUIRED',
        approvalStatus: 'FINAL_APPROVAL_REQUIRED',
        version: 1,
        sensitiveCategory: 'PARTNER_GOVERNMENT_STATEMENT',
        requiresExecutiveApproval: true,
        consentRequired: true,
        consentRecordId: 'CNS-2026-003',
        captionHook: 'Systems change requires trusted cross-sector alliances between grassroots leaders and legal aid.',
        captionContext: 'Immigrant survivors navigate overlapping housing, family court, and workforce systems simultaneously.',
        captionValue: 'How Phumulani MOU partnerships reduce survivor re-traumatization and strengthen language justice.',
        captionConnection: 'Reflections from Founder & Executive Director Comfort Dondo.',
        captionCta: 'Explore organizational partnerships at phumulani.org/#partnerships-section.',
        hashtags: ['#Phumulani', '#SystemsChange', '#NonprofitLeadership'],
        targetUrl: 'https://phumulani.org/#partnerships-section',
        linkVerified: true,
        assetFilename: '2026-12-03_LI_Article_PartnerAllianceReflection_v1',
        assetState: 'DRAFT',
        assetDimensions: '1200x628',
        socialBodyFontSizePx: 28,
        altText: 'Institutional partnership portrait header with Phumulani logo on white clear-space band.',
        videoCaptionsVerified: true,
        contentHashSha256: '',
        createdBy: 'Amina Yusuf',
        createdByRole: 'communications_lead',
        lastEditedBy: 'Amina Yusuf',
        lastEditedAt: now,
        reviewedBy: 'Amina Yusuf',
        reviewedAt: now,
        exportPackageOnly: true,
      },
    ];
    const editorialItems: SocialEditorialItem[] = editorialItemsSeed.map((item) => ({
      ...item,
      contentHashSha256: computeSha256({
        title: item.title,
        pillar: item.pillar,
        platform: item.platform,
        captionHook: item.captionHook,
        captionCta: item.captionCta,
        assetFilename: item.assetFilename,
      }),
    }));

    const incidents: ModerationIncident[] = [
      {
        id: 'MOD-2026-001',
        platform: 'INSTAGRAM',
        tier: 'GREEN',
        summary: 'Routine community appreciation comment on Tea Healing Circle announcement.',
        commentExcerptRedacted: 'Thank you Phumulani for making healing spaces accessible for mothers in St. Paul!',
        status: 'RESOLVED_LOGGED',
        ownerRoleRequired: 'communications_lead',
        requiresExecutiveApprovalBeforeReply: false,
        relatedPublishingPaused: false,
        suggestedTemplateId: 'TPL-GREEN-GRATITUDE',
        draftReply: APPROVED_RESPONSE_TEMPLATES[3].body,
        loggedAt: '2026-11-12T15:00:00Z',
        updatedAt: '2026-11-12T16:10:00Z',
      },
      {
        id: 'MOD-2026-002',
        platform: 'FACEBOOK',
        tier: 'YELLOW',
        summary: 'Question asking whether housing workshops require specific immigration documentation.',
        commentExcerptRedacted: 'Do participants need specific immigration paperwork to attend Friday housing clinic?',
        status: 'IN_PROGRAM_REVIEW',
        ownerRoleRequired: 'program_director',
        requiresExecutiveApprovalBeforeReply: false,
        relatedPublishingPaused: false,
        suggestedTemplateId: 'TPL-PROGRAM-REFERRAL',
        draftReply: APPROVED_RESPONSE_TEMPLATES[1].body,
        loggedAt: '2026-11-14T11:20:00Z',
        updatedAt: '2026-11-14T11:45:00Z',
      },
      {
        id: 'MOD-2026-003',
        platform: 'LINKEDIN',
        tier: 'ORANGE',
        summary: 'Public comment questioning 501(c)(3) fund allocation percentages; requires Executive Director sign-off before reply.',
        commentExcerptRedacted: 'Can Phumulani verify how restricted grant funds are audited before end-of-year gifts?',
        status: 'PENDING_ED_APPROVAL',
        ownerRoleRequired: 'executive_director',
        requiresExecutiveApprovalBeforeReply: true,
        relatedPublishingPaused: false,
        suggestedTemplateId: 'TPL-ORANGE-MISINFO-HOLD',
        draftReply: APPROVED_RESPONSE_TEMPLATES[2].body,
        loggedAt: '2026-11-15T09:15:00Z',
        updatedAt: '2026-11-15T09:15:00Z',
      },
    ];

    const accounts: SocialAccountGovernanceRecord[] = [
      {
        id: 'ACC-IG-01',
        platform: 'INSTAGRAM',
        handle: '@phumulani_mn',
        displayName: 'Phumulani Official Instagram',
        adminCount: 2,
        designatedAdmins: ['Comfort Dondo (executive_director)', 'Amina Yusuf (communications_lead)'],
        twoAdminRuleSatisfied: true,
        mfaEnabled: true,
        lastAccessAuditAt: '2026-11-10T10:00:00Z',
        departedStaffRevocationPending: false,
        lastDepartureRevokedWithin24h: true,
        sensitiveSettingsWrittenApprovalRef: 'EXEC-MEMO-2026-IG-01',
        liveAutoPublishingEnabled: false,
        publishingControlMode: 'MANUAL_EXPORT_ONLY',
      },
      {
        id: 'ACC-FB-01',
        platform: 'FACEBOOK',
        handle: 'PhumulaniMAWAV',
        displayName: 'Phumulani Community Page',
        adminCount: 2,
        designatedAdmins: ['Comfort Dondo (executive_director)', 'Amina Yusuf (communications_lead)'],
        twoAdminRuleSatisfied: true,
        mfaEnabled: true,
        lastAccessAuditAt: '2026-11-10T10:05:00Z',
        departedStaffRevocationPending: false,
        lastDepartureRevokedWithin24h: true,
        sensitiveSettingsWrittenApprovalRef: 'EXEC-MEMO-2026-FB-01',
        liveAutoPublishingEnabled: false,
        publishingControlMode: 'MANUAL_EXPORT_ONLY',
      },
      {
        id: 'ACC-LI-01',
        platform: 'LINKEDIN',
        handle: 'company/phumulani-mn',
        displayName: 'Phumulani LinkedIn Organization',
        adminCount: 2,
        designatedAdmins: ['Comfort Dondo (executive_director)', 'David Mwangi, CPA (finance_director)'],
        twoAdminRuleSatisfied: true,
        mfaEnabled: true,
        lastAccessAuditAt: '2026-11-10T10:10:00Z',
        departedStaffRevocationPending: false,
        lastDepartureRevokedWithin24h: true,
        sensitiveSettingsWrittenApprovalRef: 'EXEC-MEMO-2026-LI-01',
        liveAutoPublishingEnabled: false,
        publishingControlMode: 'MANUAL_EXPORT_ONLY',
      },
      {
        id: 'ACC-REEL-01',
        platform: 'TIKTOK_REELS',
        handle: '@phumulani.healing',
        displayName: 'Phumulani Community Reels',
        adminCount: 2,
        designatedAdmins: ['Comfort Dondo (executive_director)', 'Amina Yusuf (communications_lead)'],
        twoAdminRuleSatisfied: true,
        mfaEnabled: true,
        lastAccessAuditAt: '2026-11-10T10:15:00Z',
        lastDepartureRevokedWithin24h: true,
        departedStaffRevocationPending: false,
        sensitiveSettingsWrittenApprovalRef: 'EXEC-MEMO-2026-TT-01',
        liveAutoPublishingEnabled: false,
        publishingControlMode: 'MANUAL_EXPORT_ONLY',
      },
    ];

    const analytics: SocialAnalyticsRecord[] = [
      {
        id: 'ANL-2026-001',
        periodLabel: '2026-10 (Staged Baseline)',
        platform: 'INSTAGRAM',
        pillar: 'SAFETY_AND_RESOURCES',
        sourceClassification: 'DEMO_STAGED',
        reach: 1420,
        engagementCount: 184,
        linkClicks: 62,
        savesOrShares: 49,
        recordedBy: 'Communications Benchmark Seed',
        recordedAt: '2026-11-01T09:00:00Z',
        notes: 'Illustrative baseline metric — clearly labeled DEMO_STAGED (not live social provider API).',
      },
      {
        id: 'ANL-2026-002',
        periodLabel: '2026-11 Week 1',
        platform: 'LINKEDIN',
        pillar: 'IMPACT_AND_FUNDRAISING',
        sourceClassification: 'MANUAL_ENTRY',
        reach: 865,
        engagementCount: 94,
        linkClicks: 41,
        savesOrShares: 18,
        recordedBy: 'Amina Yusuf',
        recordedAt: '2026-11-10T17:00:00Z',
        notes: 'Manually transcribed from native LinkedIn analytics export; verified against screenshot.',
      },
    ];

    const seedAudit: SocialApprovalAuditEntry = {
      id: 'AUD-COMMS-INIT-001',
      entityType: 'EDITORIAL_ITEM',
      entityId: 'SYSTEM',
      action: 'GOVERNANCE_WORKSPACE_INITIALIZED',
      actorName: 'System Bootstrapper',
      actorRole: 'master_admin',
      decisionNotes: 'Initialized 7-pillar editorial workspace under Brand Manual Working Draft v1.0 (Pending Executive Leadership Approval).',
      timestamp: now,
      sha256Signature: computeSha256({ event: 'GOVERNANCE_WORKSPACE_INITIALIZED', now }),
    };

    for (const c of consents) await this.db.insert('media_consent_records', c);
    for (const item of editorialItems) await this.db.insert('social_editorial_items', item);
    for (const inc of incidents) await this.db.insert('moderation_incidents', inc);
    for (const acc of accounts) await this.db.insert('social_account_governance', acc);
    for (const anl of analytics) await this.db.insert('social_analytics_records', anl);
    await this.db.insert('social_approval_audit', seedAudit);
  }

  private async appendAudit(entry: Omit<SocialApprovalAuditEntry, 'id' | 'timestamp' | 'sha256Signature'>): Promise<SocialApprovalAuditEntry> {
    const timestamp = new Date().toISOString();
    const id = `AUD-COMMS-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const full: SocialApprovalAuditEntry = {
      ...entry,
      id,
      timestamp,
      sha256Signature: computeSha256({ ...entry, id, timestamp }),
    };
    await this.db.insertDurableWithRetry('social_approval_audit', full, { context: entry.action });
    return full;
  }

  public async getSnapshot(actor: GovernanceActor): Promise<CommunicationsGovernanceSnapshot> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canViewWorkspace) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is not permitted to access communications governance.`);
    }

    const [editorialItems, auditTrail, consents, moderationIncidents, accountGovernance, analyticsRecords] =
      await Promise.all([
        this.db.select<SocialEditorialItem>('social_editorial_items'),
        this.db.select<SocialApprovalAuditEntry>('social_approval_audit'),
        this.db.select<ConsentRecord>('media_consent_records'),
        this.db.select<ModerationIncident>('moderation_incidents'),
        this.db.select<SocialAccountGovernanceRecord>('social_account_governance'),
        this.db.select<SocialAnalyticsRecord>('social_analytics_records'),
      ]);

    const globalPublishingPaused = moderationIncidents.some(
      (inc) => inc.tier === 'RED' && inc.relatedPublishingPaused && inc.status !== 'RESOLVED_LOGGED'
    );

    return {
      manualStatus: BRAND_MANUAL_STATUS,
      editorialItems: [...editorialItems].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
      auditTrail: [...auditTrail].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 120),
      consentRecordsCount: consents.length,
      consentAccessGranted: caps.canViewConsentVault,
      consentRecords: caps.canViewConsentVault ? consents : [],
      moderationIncidents: [...moderationIncidents].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)),
      accountGovernance,
      analyticsRecords: [...analyticsRecords].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
      globalPublishingPaused,
    };
  }

  private assertEditorialPayloadSafe(payload: Partial<SocialEditorialItem>): void {
    const combinedText = [
      payload.title,
      payload.captionHook,
      payload.captionContext,
      payload.captionValue,
      payload.captionConnection,
      payload.captionCta,
      payload.altText,
      ...(payload.hashtags || []),
    ]
      .filter(Boolean)
      .join('\n');

    const pii = scanTextForConfidentialPii(combinedText);
    if (!pii.safe) {
      throw new Error(`SAFEGUARDING_PII_BLOCKED: ${pii.violations.join('; ')}`);
    }

    const aiSafe = scanAiPromptSafety(combinedText);
    if (!aiSafe.allowed) {
      throw new Error(`SAFEGUARDING_POLICY_BLOCKED: ${aiSafe.violations.join('; ')}`);
    }
  }

  private async validateConsentBinding(item: SocialEditorialItem): Promise<{ valid: boolean; reason?: string }> {
    if (!item.consentRequired) return { valid: true };
    if (!item.consentRecordId) {
      return { valid: false, reason: 'Consent record linkage is required before scheduling or exporting.' };
    }
    const consents = await this.db.select<ConsentRecord>('media_consent_records');
    const consent = consents.find((c) => c.id === item.consentRecordId);
    if (!consent) {
      return { valid: false, reason: `Linked consent record ${item.consentRecordId} does not exist.` };
    }
    if (consent.consentStatus !== 'GRANTED' || consent.takedownRequired) {
      return {
        valid: false,
        reason: `Consent record ${consent.id} status is ${consent.consentStatus}${consent.takedownRequired ? ' (TAKEDOWN REQUIRED)' : ''}.`,
      };
    }

    const neededScope: ConsentScope =
      item.platform === 'WEBSITE_BLOG'
        ? 'PUBLIC_WEB'
        : item.platform === 'EMAIL_NEWSLETTER'
        ? 'NEWSLETTER'
        : item.contentType === 'ReelVideo'
        ? 'VIDEO_STORY'
        : 'SOCIAL_MEDIA';

    if (!consent.allowedScopes.includes(neededScope) && !consent.allowedScopes.includes('SOCIAL_MEDIA')) {
      return {
        valid: false,
        reason: `Consent ${consent.id} scope [${consent.allowedScopes.join(', ')}] does not cover ${neededScope}.`,
      };
    }

    if (consent.subjectType === 'MINOR' || item.sensitiveCategory === 'MINOR_RELATED') {
      if (!consent.guardianConsentVerified || !consent.bestInterestsReviewCompleted) {
        return {
          valid: false,
          reason: `Minor-related consent ${consent.id} requires BOTH guardian consent verification AND best-interests safeguarding clearance.`,
        };
      }
    }

    return { valid: true };
  }

  public async createEditorialItem(
    input: {
      title: string;
      pillar: ContentPillarId;
      platform: SocialPlatform;
      contentType: SocialEditorialItem['contentType'];
      scheduledDate: string;
      milestoneTag?: SocialEditorialItem['milestoneTag'];
      sensitiveCategory?: SensitiveContentCategory;
      consentRequired?: boolean;
      consentRecordId?: string;
      captionHook: string;
      captionContext: string;
      captionValue: string;
      captionConnection: string;
      captionCta: string;
      hashtags?: string[];
      targetUrl: string;
      assetDimensions?: string;
      socialBodyFontSizePx?: number;
      altText: string;
      videoCaptionsVerified?: boolean;
    },
    actor: GovernanceActor
  ): Promise<SocialEditorialItem> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canCreateOrEditDraft) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is read-only and cannot create editorial briefs or drafts.`);
    }

    this.assertEditorialPayloadSafe(input);

    const spec = PLATFORM_SPECIFICATIONS[input.platform];
    if (!spec) {
      throw new Error(`Unsupported platform "${input.platform}".`);
    }
    if (!CONTENT_PILLARS.some((p) => p.id === input.pillar)) {
      throw new Error(`Unsupported content pillar "${input.pillar}".`);
    }

    const sensitiveCategory: SensitiveContentCategory = input.sensitiveCategory || 'NONE';
    const requiresExecutiveApproval = SENSITIVE_CATEGORIES.has(sensitiveCategory);
    const now = new Date().toISOString();
    const id = `SOC-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const filename = generateCompliantAssetFilename({
      date: input.scheduledDate,
      platform: input.platform,
      contentType: input.contentType,
      topic: input.title,
      version: 1,
    });

    const item: SocialEditorialItem = {
      id,
      title: input.title.trim(),
      pillar: input.pillar,
      platform: input.platform,
      contentType: input.contentType,
      scheduledDate: input.scheduledDate,
      milestoneTag: input.milestoneTag || 'MS-27',
      stage: 'DRAFT',
      approvalStatus: 'DRAFT_IN_PROGRESS',
      version: 1,
      sensitiveCategory,
      requiresExecutiveApproval,
      consentRequired: Boolean(input.consentRequired || sensitiveCategory === 'MINOR_RELATED' || sensitiveCategory === 'SURVIVOR_STORY'),
      consentRecordId: input.consentRecordId,
      captionHook: input.captionHook.trim(),
      captionContext: input.captionContext.trim(),
      captionValue: input.captionValue.trim(),
      captionConnection: input.captionConnection.trim(),
      captionCta: input.captionCta.trim(),
      hashtags: input.hashtags && input.hashtags.length > 0 ? input.hashtags : spec.defaultHashtags,
      targetUrl: input.targetUrl.trim(),
      linkVerified: KNOWN_PUBLIC_ANCHORS.has(input.targetUrl.trim().replace(/^https?:\/\/phumulani\.org/, '')),
      assetFilename: filename,
      assetState: 'DRAFT',
      assetDimensions: input.assetDimensions || spec.recommendedDimensions,
      socialBodyFontSizePx: Number(input.socialBodyFontSizePx ?? spec.minSocialBodyFontPx),
      altText: input.altText.trim(),
      videoCaptionsVerified: input.contentType === 'ReelVideo' ? Boolean(input.videoCaptionsVerified) : true,
      contentHashSha256: '',
      createdBy: actor.name,
      createdByRole: actor.role,
      lastEditedBy: actor.name,
      lastEditedAt: now,
      exportPackageOnly: true,
    };

    item.contentHashSha256 = computeSha256(item);
    await this.db.insertDurableWithRetry('social_editorial_items', item, { context: `createEditorialItem:${id}` });

    await this.appendAudit({
      entityType: 'EDITORIAL_ITEM',
      entityId: id,
      action: 'CREATE_EDITORIAL_DRAFT',
      actorName: actor.name,
      actorRole: actor.role,
      newStage: item.stage,
      version: item.version,
      decisionNotes: `Created ${item.platform} (${item.pillar}) draft; asset filename ${item.assetFilename}.`,
    });

    return item;
  }

  public async updateEditorialItem(
    id: string,
    patch: Partial<SocialEditorialItem>,
    actor: GovernanceActor
  ): Promise<{ item: SocialEditorialItem; approvalInvalidated: boolean }> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canCreateOrEditDraft) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is read-only and cannot edit editorial items.`);
    }

    const items = await this.db.select<SocialEditorialItem>('social_editorial_items');
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      throw new Error(`Editorial item "${id}" not found.`);
    }

    // Intern cannot edit after item has passed into EXECUTIVE approval or FINAL_APPROVED state without bumping a draft
    if (String(actor.role).toLowerCase().includes('intern') && existing.stage !== 'BRIEF' && existing.stage !== 'DRAFT' && existing.stage !== 'DESIGN') {
      throw new Error('FORBIDDEN: Content interns cannot alter items beyond DESIGN stage.');
    }

    const candidate: SocialEditorialItem = {
      ...existing,
      ...patch,
      id: existing.id,
      exportPackageOnly: true,
    };
    this.assertEditorialPayloadSafe(candidate);

    const materialChanged = MATERIAL_FIELDS.some(
      (field) => JSON.stringify(existing[field]) !== JSON.stringify(candidate[field])
    );

    const wasReviewedOrApproved = ['REVIEW', 'FINAL_APPROVAL_REQUIRED', 'SCHEDULE', 'PUBLISH', 'MONITOR', 'LOG'].includes(
      existing.stage
    );
    const approvalInvalidated = materialChanged && (wasReviewedOrApproved || existing.assetState === 'FINAL_APPROVED');

    const nextVersion = materialChanged ? existing.version + 1 : existing.version;
    const sensitiveCategory = candidate.sensitiveCategory || 'NONE';
    const requiresExecutiveApproval = SENSITIVE_CATEGORIES.has(sensitiveCategory);

    // Block 16: FINAL_APPROVED assets are immutable; edits automatically produce new DRAFT version filename
    const nextFilename =
      existing.assetState === 'FINAL_APPROVED' || materialChanged
        ? generateCompliantAssetFilename({
            date: candidate.scheduledDate,
            platform: candidate.platform,
            contentType: candidate.contentType,
            topic: candidate.title,
            version: nextVersion,
          })
        : candidate.assetFilename;

    const updated: SocialEditorialItem = {
      ...candidate,
      version: nextVersion,
      requiresExecutiveApproval,
      assetFilename: nextFilename,
      assetState: approvalInvalidated ? 'DRAFT' : candidate.assetState,
      stage: approvalInvalidated ? 'DRAFT' : candidate.stage,
      approvalStatus: approvalInvalidated ? 'REAPPROVAL_REQUIRED' : candidate.approvalStatus,
      reviewedBy: approvalInvalidated ? undefined : candidate.reviewedBy,
      reviewedAt: approvalInvalidated ? undefined : candidate.reviewedAt,
      finalApprovedBy: approvalInvalidated ? undefined : candidate.finalApprovedBy,
      finalApprovedAt: approvalInvalidated ? undefined : candidate.finalApprovedAt,
      invalidationReason: approvalInvalidated
        ? `Material edit by ${actor.name} (${actor.role}) invalidated prior approval (v${existing.version} -> v${nextVersion}).`
        : existing.invalidationReason,
      lastEditedBy: actor.name,
      lastEditedAt: new Date().toISOString(),
      contentHashSha256: '',
    };
    updated.contentHashSha256 = computeSha256(updated);

    await this.db.update('social_editorial_items', id, updated);

    await this.appendAudit({
      entityType: 'EDITORIAL_ITEM',
      entityId: id,
      action: approvalInvalidated ? 'MATERIAL_EDIT_INVALIDATED_APPROVAL' : 'UPDATE_EDITORIAL_DRAFT',
      actorName: actor.name,
      actorRole: actor.role,
      previousStage: existing.stage,
      newStage: updated.stage,
      version: updated.version,
      decisionNotes: approvalInvalidated
        ? `Prior approval invalidated due to material edit; asset reset to DRAFT (${updated.assetFilename}).`
        : `Updated editorial draft fields at stage ${updated.stage}.`,
    });

    return { item: updated, approvalInvalidated };
  }

  public async transitionEditorialStage(
    id: string,
    targetStage: EditorialWorkflowStage,
    actor: GovernanceActor,
    decisionNotes?: string
  ): Promise<SocialEditorialItem> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!EDITORIAL_WORKFLOW_STAGES.includes(targetStage)) {
      throw new Error(`Invalid workflow stage "${targetStage}".`);
    }
    if (caps.isReadOnly) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is read-only and cannot change workflow stage.`);
    }

    const items = await this.db.select<SocialEditorialItem>('social_editorial_items');
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      throw new Error(`Editorial item "${id}" not found.`);
    }

    if (existing.approvalStatus === 'TAKEDOWN_REQUIRED' && ['SCHEDULE', 'PUBLISH', 'MONITOR', 'LOG'].includes(targetStage)) {
      throw new Error('CONSENT_WITHDRAWN_TAKEDOWN_ACTIVE: Cannot schedule or publish item with withdrawn consent / pending takedown.');
    }

    // Check active RED publishing pause
    const incidents = await this.db.select<ModerationIncident>('moderation_incidents');
    const redPauseActive = incidents.some(
      (inc) => inc.tier === 'RED' && inc.relatedPublishingPaused && inc.status !== 'RESOLVED_LOGGED'
    );
    if (redPauseActive && ['SCHEDULE', 'PUBLISH'].includes(targetStage)) {
      throw new Error(
        'RED_CRISIS_PUBLISHING_PAUSE: Publishing and scheduling are frozen due to an active RED crisis moderation incident.'
      );
    }

    // Role gates per workflow stage
    if (['REVIEW', 'FINAL_APPROVAL_REQUIRED'].includes(targetStage) && !caps.canAdvanceStandardReview) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" cannot promote items into approval gates.`);
    }

    if (['SCHEDULE', 'PUBLISH', 'MONITOR', 'LOG'].includes(targetStage)) {
      if (existing.requiresExecutiveApproval || existing.sensitiveCategory !== 'NONE') {
        if (!caps.canApproveSensitiveExecutive) {
          throw new Error(
            `EXECUTIVE_APPROVAL_REQUIRED: Category "${existing.sensitiveCategory}" requires Executive Director sign-off before scheduling/export.`
          );
        }
      } else if (!caps.canApproveNonSensitiveSchedule) {
        throw new Error(
          `FORBIDDEN: Role "${actor.role}" is not authorized to approve scheduling/export. Requires Communications Lead or Executive Director.`
        );
      }

      // Enforce Brand Manual typography, alt-text, video caption, and filename gates
      const spec = PLATFORM_SPECIFICATIONS[existing.platform];
      if (!existing.altText || existing.altText.trim().length < 10) {
        throw new Error('ACCESSIBILITY_GATE_BLOCKED: Descriptive alt-text (>= 10 characters) is required before scheduling.');
      }
      if (existing.socialBodyFontSizePx < spec.minSocialBodyFontPx) {
        throw new Error(
          `TYPOGRAPHY_GATE_BLOCKED: Social graphic body font (${existing.socialBodyFontSizePx}px) is below ${spec.label} minimum of ${spec.minSocialBodyFontPx}px.`
        );
      }
      if (existing.contentType === 'ReelVideo' && !existing.videoCaptionsVerified) {
        throw new Error('ACCESSIBILITY_GATE_BLOCKED: Closed captions must be verified for video/reel assets before scheduling.');
      }
      if (!isCompliantAssetFilename(existing.assetFilename)) {
        throw new Error(
          `ASSET_NAMING_BLOCKED: Asset filename "${existing.assetFilename}" must match YYYY-MM-DD_Platform_ContentType_ShortTopic_Version.`
        );
      }

      const consentCheck = await this.validateConsentBinding(existing);
      if (!consentCheck.valid) {
        throw new Error(`CONSENT_SAFEGUARDING_GATE_BLOCKED: ${consentCheck.reason}`);
      }
    }

    const now = new Date().toISOString();
    const isFinalGrant = ['SCHEDULE', 'PUBLISH'].includes(targetStage);
    const nextApprovalStatus: SocialEditorialItem['approvalStatus'] =
      targetStage === 'REVIEW'
        ? 'IN_REVIEW'
        : targetStage === 'FINAL_APPROVAL_REQUIRED'
        ? 'FINAL_APPROVAL_REQUIRED'
        : isFinalGrant
        ? 'APPROVED_FOR_EXPORT'
        : targetStage === 'MONITOR' || targetStage === 'LOG'
        ? 'LOGGED'
        : 'DRAFT_IN_PROGRESS';

    const updated: SocialEditorialItem = {
      ...existing,
      stage: targetStage,
      approvalStatus: nextApprovalStatus,
      assetState: isFinalGrant || targetStage === 'LOG' || targetStage === 'MONITOR' ? 'FINAL_APPROVED' : existing.assetState,
      reviewedBy: targetStage === 'REVIEW' || isFinalGrant ? existing.reviewedBy || actor.name : existing.reviewedBy,
      reviewedAt: targetStage === 'REVIEW' || isFinalGrant ? existing.reviewedAt || now : existing.reviewedAt,
      finalApprovedBy: isFinalGrant ? actor.name : existing.finalApprovedBy,
      finalApprovedAt: isFinalGrant ? now : existing.finalApprovedAt,
      invalidationReason: isFinalGrant ? undefined : existing.invalidationReason,
      lastEditedBy: actor.name,
      lastEditedAt: now,
      contentHashSha256: '',
    };
    updated.contentHashSha256 = computeSha256(updated);

    await this.db.update('social_editorial_items', id, updated);

    await this.appendAudit({
      entityType: 'EDITORIAL_ITEM',
      entityId: id,
      action: `STAGE_TRANSITION_${targetStage}`,
      actorName: actor.name,
      actorRole: actor.role,
      previousStage: existing.stage,
      newStage: targetStage,
      version: updated.version,
      decisionNotes: decisionNotes || `Transitioned item to ${targetStage} (${nextApprovalStatus}).`,
    });

    return updated;
  }

  public async verifyItemLink(id: string, actor: GovernanceActor): Promise<{ item: SocialEditorialItem; verified: boolean; details: string }> {
    await this.ensureInitialized();
    const items = await this.db.select<SocialEditorialItem>('social_editorial_items');
    const existing = items.find((i) => i.id === id);
    if (!existing) throw new Error(`Editorial item "${id}" not found.`);

    const url = existing.targetUrl.trim();
    let verified = false;
    let details = '';

    const normalizedPath = url.replace(/^https?:\/\/phumulani\.org/i, '') || '/';
    if (KNOWN_PUBLIC_ANCHORS.has(normalizedPath)) {
      verified = true;
      details = `Verified against public application section registry (${normalizedPath}).`;
    } else if (/^https:\/\/(www\.)?phumulani\.org(\/|$)/i.test(url)) {
      verified = true;
      details = 'Verified canonical Phumulani domain HTTPS target.';
    } else if (/^https:\/\//i.test(url) && !/^https:\/\/(127\.|10\.|192\.168\.|169\.254\.|localhost)/i.test(url)) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timer);
        verified = res.ok;
        details = `Live HEAD probe returned HTTP ${res.status}.`;
      } catch (err: any) {
        verified = false;
        details = `External link verification failed (${err?.message || 'network unreachable'}).`;
      }
    } else {
      verified = false;
      details = 'Blocked insecure or private-network URL target.';
    }

    const updated: SocialEditorialItem = {
      ...existing,
      linkVerified: verified,
      lastEditedBy: actor.name,
      lastEditedAt: new Date().toISOString(),
    };
    await this.db.update('social_editorial_items', id, updated);

    await this.appendAudit({
      entityType: 'EDITORIAL_ITEM',
      entityId: id,
      action: 'LINK_VERIFICATION',
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `${verified ? 'PASSED' : 'FAILED'}: ${url} — ${details}`,
    });

    return { item: updated, verified, details };
  }

  public async createConsentRecord(
    input: {
      subjectAlias: string;
      subjectType: ConsentRecord['subjectType'];
      allowedScopes: ConsentScope[];
      guardianConsentVerified?: boolean;
      bestInterestsReviewCompleted?: boolean;
      verificationSummary: string;
    },
    actor: GovernanceActor
  ): Promise<ConsentRecord> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canManageConsentVault) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is not permitted to create media consent records.`);
    }

    const pii = scanTextForConfidentialPii(`${input.subjectAlias}\n${input.verificationSummary}`);
    if (!pii.safe) {
      throw new Error(`SAFEGUARDING_PII_BLOCKED: Consent alias/summary must remain pseudonymous (${pii.violations.join('; ')}).`);
    }

    const isMinor = input.subjectType === 'MINOR';
    const guardianOk = isMinor ? Boolean(input.guardianConsentVerified) : true;
    const bestInterestsOk = isMinor ? Boolean(input.bestInterestsReviewCompleted) : true;
    const consentStatus: ConsentRecord['consentStatus'] = guardianOk && bestInterestsOk ? 'GRANTED' : 'PENDING';

    const record: ConsentRecord = {
      id: `CNS-${new Date().getFullYear()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      subjectAlias: input.subjectAlias.trim(),
      subjectType: input.subjectType,
      allowedScopes: input.allowedScopes.length > 0 ? input.allowedScopes : ['SOCIAL_MEDIA'],
      consentStatus,
      guardianConsentVerified: guardianOk,
      bestInterestsReviewCompleted: bestInterestsOk,
      guardianReviewerName: guardianOk ? actor.name : undefined,
      bestInterestsReviewerName: bestInterestsOk ? actor.name : undefined,
      obtainedAt: new Date().toISOString(),
      takedownRequired: false,
      restrictedAccessTier: 'SAFEGUARDING_AND_COMMS_LEADS_ONLY',
      verificationSummary: input.verificationSummary.trim(),
    };

    await this.db.insertDurableWithRetry('media_consent_records', record, { context: `createConsent:${record.id}` });
    await this.appendAudit({
      entityType: 'CONSENT_RECORD',
      entityId: record.id,
      action: 'CREATE_CONSENT_RECORD',
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `Recorded ${record.subjectType} consent (${record.consentStatus}) for scopes [${record.allowedScopes.join(', ')}].`,
    });

    return record;
  }

  public async withdrawConsentAndTriggerTakedown(
    consentId: string,
    reason: string,
    actor: GovernanceActor
  ): Promise<{ consent: ConsentRecord; flaggedItems: string[] }> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canManageConsentVault) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is not permitted to withdraw consent or issue takedowns.`);
    }

    const consents = await this.db.select<ConsentRecord>('media_consent_records');
    const existing = consents.find((c) => c.id === consentId);
    if (!existing) throw new Error(`Consent record "${consentId}" not found.`);

    const now = new Date().toISOString();
    const updatedConsent: ConsentRecord = {
      ...existing,
      consentStatus: 'WITHDRAWN',
      withdrawnAt: now,
      takedownRequired: true,
      verificationSummary: `${existing.verificationSummary} | WITHDRAWN (${now}): ${reason || 'Subject/Guardian requested withdrawal'}`,
    };
    await this.db.update('media_consent_records', consentId, updatedConsent);

    const items = await this.db.select<SocialEditorialItem>('social_editorial_items');
    const flaggedItems: string[] = [];
    for (const item of items) {
      if (item.consentRecordId === consentId) {
        const flagged: SocialEditorialItem = {
          ...item,
          approvalStatus: 'TAKEDOWN_REQUIRED',
          assetState: 'DRAFT',
          stage: 'DRAFT',
          finalApprovedBy: undefined,
          finalApprovedAt: undefined,
          invalidationReason: `CONSENT_WITHDRAWN (${consentId}): Immediate takedown / archive required.`,
          lastEditedBy: actor.name,
          lastEditedAt: now,
        };
        await this.db.update('social_editorial_items', item.id, flagged);
        flaggedItems.push(item.id);
      }
    }

    await this.appendAudit({
      entityType: 'CONSENT_RECORD',
      entityId: consentId,
      action: 'CONSENT_WITHDRAWN_TAKEDOWN_TRIGGERED',
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `Consent ${consentId} withdrawn (${reason}); flagged ${flaggedItems.length} linked editorial items (${flaggedItems.join(', ') || 'none'}).`,
    });

    return { consent: updatedConsent, flaggedItems };
  }

  public async createModerationIncident(
    input: {
      platform: SocialPlatform;
      tier: EscalationTier;
      summary: string;
      commentExcerptRedacted: string;
      draftReply?: string;
    },
    actor: GovernanceActor
  ): Promise<ModerationIncident> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (caps.isReadOnly) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is read-only and cannot log moderation incidents.`);
    }

    const pii = scanTextForConfidentialPii(`${input.summary}\n${input.commentExcerptRedacted}\n${input.draftReply || ''}`);
    if (!pii.safe) {
      throw new Error(`SAFEGUARDING_PII_BLOCKED: Redact identifying/shelter/case details before logging (${pii.violations.join('; ')}).`);
    }

    const now = new Date().toISOString();
    const isRed = input.tier === 'RED';
    const isOrange = input.tier === 'ORANGE';
    const template = APPROVED_RESPONSE_TEMPLATES.find((t) => t.tier === input.tier) || APPROVED_RESPONSE_TEMPLATES[0];

    const incident: ModerationIncident = {
      id: `MOD-${new Date().getFullYear()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      platform: input.platform,
      tier: input.tier,
      summary: input.summary.trim(),
      commentExcerptRedacted: input.commentExcerptRedacted.trim(),
      status: isRed
        ? 'PUBLISHING_PAUSED'
        : isOrange
        ? 'PENDING_ED_APPROVAL'
        : input.tier === 'YELLOW'
        ? 'IN_PROGRAM_REVIEW'
        : 'OPEN',
      ownerRoleRequired: isRed || isOrange ? 'executive_director' : input.tier === 'YELLOW' ? 'program_director' : 'communications_lead',
      requiresExecutiveApprovalBeforeReply: isRed || isOrange,
      relatedPublishingPaused: isRed,
      suggestedTemplateId: template.id,
      draftReply: input.draftReply?.trim() || template.body,
      loggedAt: now,
      updatedAt: now,
    };

    await this.db.insertDurableWithRetry('moderation_incidents', incident, { context: `createModeration:${incident.id}` });
    await this.appendAudit({
      entityType: 'MODERATION_INCIDENT',
      entityId: incident.id,
      action: `LOG_MODERATION_${incident.tier}`,
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: isRed
        ? 'RED crisis escalation logged — automatic publishing pause activated.'
        : isOrange
        ? 'ORANGE sensitive escalation logged — Executive Director approval required before reply.'
        : `Logged ${incident.tier} moderation event.`,
    });

    return incident;
  }

  public async decideModerationIncident(
    id: string,
    decision: 'APPROVE_REPLY' | 'RESOLVE_AND_UNPAUSE' | 'ESCALATE_RED',
    actor: GovernanceActor,
    draftReply?: string
  ): Promise<ModerationIncident> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    const incidents = await this.db.select<ModerationIncident>('moderation_incidents');
    const existing = incidents.find((m) => m.id === id);
    if (!existing) throw new Error(`Moderation incident "${id}" not found.`);

    if (draftReply) {
      const pii = scanAiPromptSafety(draftReply);
      if (!pii.allowed) {
        throw new Error(`SAFEGUARDING_POLICY_BLOCKED: Reply violates confidentiality or non-clinical guidance (${pii.violations.join('; ')}).`);
      }
    }

    if (decision === 'APPROVE_REPLY') {
      if ((existing.tier === 'ORANGE' || existing.tier === 'RED' || existing.requiresExecutiveApprovalBeforeReply) && !caps.canApproveOrangeModeration) {
        throw new Error(
          `EXECUTIVE_APPROVAL_REQUIRED: Role "${actor.role}" cannot approve ${existing.tier} moderation replies. Executive Director approval required.`
        );
      }
    }

    if (decision === 'RESOLVE_AND_UNPAUSE') {
      if (existing.tier === 'RED' && !caps.canResolveRedPause) {
        throw new Error(
          `EXECUTIVE_OR_SAFEGUARDING_REQUIRED: Role "${actor.role}" cannot lift a RED crisis publishing pause.`
        );
      }
      if (existing.tier === 'ORANGE' && !caps.canApproveOrangeModeration) {
        throw new Error(`EXECUTIVE_APPROVAL_REQUIRED: Executive Director must close ORANGE escalations.`);
      }
      if (!caps.canManageModerationTiers.includes(existing.tier)) {
        throw new Error(`FORBIDDEN: Role "${actor.role}" cannot resolve ${existing.tier} moderation incidents.`);
      }
    }

    const now = new Date().toISOString();
    const updated: ModerationIncident = {
      ...existing,
      tier: decision === 'ESCALATE_RED' ? 'RED' : existing.tier,
      requiresExecutiveApprovalBeforeReply: decision === 'ESCALATE_RED' ? true : existing.requiresExecutiveApprovalBeforeReply,
      relatedPublishingPaused:
        decision === 'ESCALATE_RED'
          ? true
          : decision === 'RESOLVE_AND_UNPAUSE'
          ? false
          : existing.relatedPublishingPaused,
      status:
        decision === 'ESCALATE_RED'
          ? 'PUBLISHING_PAUSED'
          : decision === 'APPROVE_REPLY'
          ? 'RESPONSE_APPROVED'
          : 'RESOLVED_LOGGED',
      draftReply: draftReply?.trim() || existing.draftReply,
      approvedByExecutiveName:
        decision === 'APPROVE_REPLY' || decision === 'RESOLVE_AND_UNPAUSE' ? actor.name : existing.approvedByExecutiveName,
      approvedByExecutiveAt:
        decision === 'APPROVE_REPLY' || decision === 'RESOLVE_AND_UNPAUSE' ? now : existing.approvedByExecutiveAt,
      updatedAt: now,
    };

    await this.db.update('moderation_incidents', id, updated);
    await this.appendAudit({
      entityType: 'MODERATION_INCIDENT',
      entityId: id,
      action: `MODERATION_${decision}`,
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `Incident ${id} updated to ${updated.status} (tier ${updated.tier}, paused=${updated.relatedPublishingPaused}).`,
    });

    return updated;
  }

  public async auditSocialAccount(
    id: string,
    patch: {
      designatedAdmins?: string[];
      mfaEnabled?: boolean;
      departedStaffRevocationPending?: boolean;
      lastDepartureRevokedWithin24h?: boolean;
      sensitiveSettingsWrittenApprovalRef?: string;
    },
    actor: GovernanceActor
  ): Promise<SocialAccountGovernanceRecord> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canEditAccountGovernance) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" cannot update account security governance.`);
    }

    const rawJson = JSON.stringify(patch);
    if (/(?:password|secret|private_key|oauth_token|access_token)/i.test(rawJson)) {
      throw new Error('SECURITY_POLICY_BLOCKED: Plaintext credentials or tokens must NEVER be submitted to account governance.');
    }

    const accounts = await this.db.select<SocialAccountGovernanceRecord>('social_account_governance');
    const existing = accounts.find((a) => a.id === id);
    if (!existing) throw new Error(`Account governance record "${id}" not found.`);

    const admins = patch.designatedAdmins && patch.designatedAdmins.length > 0 ? patch.designatedAdmins : existing.designatedAdmins;
    const updated: SocialAccountGovernanceRecord = {
      ...existing,
      designatedAdmins: admins,
      adminCount: admins.length,
      twoAdminRuleSatisfied: admins.length >= 2,
      mfaEnabled: patch.mfaEnabled ?? existing.mfaEnabled,
      departedStaffRevocationPending: patch.departedStaffRevocationPending ?? existing.departedStaffRevocationPending,
      lastDepartureRevokedWithin24h: patch.lastDepartureRevokedWithin24h ?? existing.lastDepartureRevokedWithin24h,
      sensitiveSettingsWrittenApprovalRef:
        patch.sensitiveSettingsWrittenApprovalRef?.trim() || existing.sensitiveSettingsWrittenApprovalRef,
      lastAccessAuditAt: new Date().toISOString(),
      // Fail-closed permanently enforced
      liveAutoPublishingEnabled: false,
      publishingControlMode: 'MANUAL_EXPORT_ONLY',
    };

    await this.db.update('social_account_governance', id, updated);
    await this.appendAudit({
      entityType: 'ACCOUNT_GOVERNANCE',
      entityId: id,
      action: 'SECURITY_ACCESS_AUDIT',
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `Audited ${updated.platform} (${updated.handle}): 2-admin=${updated.twoAdminRuleSatisfied}, MFA=${updated.mfaEnabled}, fail-closed MANUAL_EXPORT_ONLY.`,
    });

    return updated;
  }

  public async recordAnalyticsEntry(
    input: {
      periodLabel: string;
      platform: SocialPlatform;
      pillar: ContentPillarId;
      sourceClassification: AnalyticsSourceClassification;
      reach: number;
      engagementCount: number;
      linkClicks: number;
      savesOrShares: number;
      notes: string;
    },
    actor: GovernanceActor
  ): Promise<SocialAnalyticsRecord> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (caps.isReadOnly) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is read-only and cannot log analytics metrics.`);
    }

    const record: SocialAnalyticsRecord = {
      id: `ANL-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      periodLabel: input.periodLabel.trim(),
      platform: input.platform,
      pillar: input.pillar,
      sourceClassification: input.sourceClassification || 'MANUAL_ENTRY',
      reach: Math.max(0, Number(input.reach) || 0),
      engagementCount: Math.max(0, Number(input.engagementCount) || 0),
      linkClicks: Math.max(0, Number(input.linkClicks) || 0),
      savesOrShares: Math.max(0, Number(input.savesOrShares) || 0),
      recordedBy: actor.name,
      recordedAt: new Date().toISOString(),
      notes: input.notes.trim(),
    };

    await this.db.insertDurableWithRetry('social_analytics_records', record, { context: `recordAnalytics:${record.id}` });
    return record;
  }

  public async runAiAssist(
    input: {
      task: 'DRAFT_CAPTION' | 'ALT_TEXT' | 'SENSITIVITY_SCAN' | 'CALENDAR_SUMMARY' | 'MODERATION_SUGGESTION';
      topic: string;
      pillar: ContentPillarId;
      platform: SocialPlatform;
      notes?: string;
    },
    actor: GovernanceActor,
    generateWithModel?: (prompt: string) => Promise<string | null>
  ): Promise<{
    outputLabel: 'HUMAN_REVIEWED_DRAFT_ONLY';
    requiresHumanApproval: true;
    safetyBlocked: boolean;
    warnings: string[];
    draft: {
      captionHook: string;
      captionContext: string;
      captionValue: string;
      captionConnection: string;
      captionCta: string;
      altText: string;
      suggestedSensitiveCategory: SensitiveContentCategory;
      summary: string;
    };
  }> {
    await this.ensureInitialized();
    const caps = normalizeRoleCapability(actor.role);
    if (!caps.canUseAiAssist) {
      throw new Error(`FORBIDDEN: Role "${actor.role}" is not permitted to invoke Communications AI Assist.`);
    }

    const combinedPrompt = `${input.topic}\n${input.notes || ''}`;
    const safety = scanAiPromptSafety(combinedPrompt);
    if (!safety.allowed) {
      await this.appendAudit({
        entityType: 'AI_ASSIST',
        entityId: input.platform,
        action: 'AI_ASSIST_BLOCKED_SAFEGUARDING',
        actorName: actor.name,
        actorRole: actor.role,
        decisionNotes: `Blocked unsafe AI assist request: ${safety.violations.join('; ')}`,
      });
      throw new Error(`AI_SAFEGUARDING_BLOCKED: ${safety.violations.join('; ')}`);
    }

    const pillarMeta = CONTENT_PILLARS.find((p) => p.id === input.pillar) || CONTENT_PILLARS[0];
    const warnings: string[] = [
      'HUMAN_REVIEWED_DRAFT_ONLY: Never publish AI output without Communications Lead review (and Executive Director sign-off for sensitive categories).',
      'Policy Manual Status: Working Draft v1.0 — Pending Executive Leadership Approval.',
    ];

    const lower = combinedPrompt.toLowerCase();
    let suggestedSensitiveCategory: SensitiveContentCategory = 'NONE';
    if (/(crisis|hotline|day one|violence|emergency|safe exit)/.test(lower)) {
      suggestedSensitiveCategory = 'CRISIS_RESOURCE';
      warnings.push('Flagged CRISIS_RESOURCE: Executive Director final approval mandatory.');
    } else if (/(minor|youth|child|teen)/.test(lower)) {
      suggestedSensitiveCategory = 'MINOR_RELATED';
      warnings.push('Flagged MINOR_RELATED: Guardian consent AND best-interests review mandatory.');
    } else if (/(survivor|story|testimony)/.test(lower)) {
      suggestedSensitiveCategory = 'SURVIVOR_STORY';
      warnings.push('Flagged SURVIVOR_STORY: Consent record + zero identifying details + ED approval mandatory.');
    } else if (/(donate|fundrais|grant|501\(c\)|giving|match)/.test(lower)) {
      suggestedSensitiveCategory = 'FUNDRAISING_CLAIM';
      warnings.push('Flagged FUNDRAISING_CLAIM: Executive Director financial claim verification required.');
    }

    // Attempt live server Gemini generation if wired, always keeping deterministic trauma-informed fallback
    let modelSummary: string | null = null;
    if (generateWithModel) {
      try {
        const promptText = `You are drafting a brief, dignified, non-clinical social communications summary for Phumulani (a Minnesota 501(c)(3) immigrant & refugee women support nonprofit). Pillar: ${pillarMeta.label}. Platform: ${input.platform}. Topic: ${input.topic}. Context: ${input.notes || 'None'}. Never invent statistics, never provide legal/medical/clinical advice, never include survivor identifying details. Keep under 90 words.`;
        modelSummary = await generateWithModel(promptText);
      } catch {
        modelSummary = null;
      }
    }

    const draft = {
      captionHook: `${input.topic.trim()}: Dignified community support rooted in cultural strength.`,
      captionContext: `${pillarMeta.description} (${pillarMeta.defaultTone}).`,
      captionValue:
        modelSummary?.trim() ||
        `Phumulani walks alongside immigrant women and families in Minnesota with trauma-informed advocacy, housing pathways, and practical workshops.`,
      captionConnection: 'Guided by Founder Comfort Dondo and culturally attuned community leaders — zero third-party tracking.',
      captionCta: 'Learn more or connect privately at phumulani.org | 24/7 Day One Crisis Line: 1-866-223-1111.',
      altText: `Phumulani ${input.platform} graphic on Soft Cream featuring Deep Earth typography highlighting "${input.topic.trim()}" with protected brand logo on white space.`,
      suggestedSensitiveCategory,
      summary:
        modelSummary?.trim() ||
        `Draft prepared for ${pillarMeta.label} on ${input.platform}. Requires human editorial verification before REVIEW stage.`,
    };

    await this.appendAudit({
      entityType: 'AI_ASSIST',
      entityId: input.platform,
      action: `AI_ASSIST_${input.task}`,
      actorName: actor.name,
      actorRole: actor.role,
      decisionNotes: `Generated HUMAN_REVIEWED_DRAFT_ONLY assist for "${input.topic}" (${input.pillar}). Sensitive flag: ${suggestedSensitiveCategory}.`,
    });

    return {
      outputLabel: 'HUMAN_REVIEWED_DRAFT_ONLY',
      requiresHumanApproval: true,
      safetyBlocked: false,
      warnings,
      draft,
    };
  }
}

export const communicationsGovernanceService = CommunicationsGovernanceService.getInstance();
