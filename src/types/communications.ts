/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Communications, Brand Manual, Social Media & Safeguarding Governance Types
 * Grounded in: Phumulani Social Media Policy, Guidelines & Brand Manual — Working Draft v1.0
 */

export const BRAND_MANUAL_STATUS = {
  documentTitle: 'Phumulani Social Media Policy, Guidelines & Brand Manual',
  version: 'Working Draft v1.0',
  approvalStatus: 'PENDING_EXECUTIVE_APPROVAL' as const,
  formallyAdopted: false,
  notice:
    'Working Draft v1.0 — Pending Executive Leadership Approval. Do not represent as formally adopted policy until Executive Director sign-off is recorded.',
  lastReviewedAt: '2026-11-17',
} as const;

export const OFFICIAL_BRAND_PALETTE = [
  { id: 'peace-orange', name: 'Peace Orange', hex: '#EF5C2C', role: 'Primary brand highlight, borders, geometric accents (pair large text/icons carefully)' },
  { id: 'deep-earth', name: 'Deep Earth Orange/Brown', hex: '#B3340F', role: 'Primary headings, accessible CTAs (6.15:1 on white), primary links' },
  { id: 'healing-teal', name: 'Healing Teal', hex: '#62C4B4', role: 'Supportive secondary surfaces, icons, status badges with Charcoal text (6.06:1)' },
  { id: 'ancestral-gold', name: 'Ancestral Gold', hex: '#F7B24A', role: 'Restrained highlights, warm honors badges with Charcoal text (6.87:1)' },
  { id: 'soft-cream', name: 'Soft Cream', hex: '#EFEBD1', role: 'Primary light page canvas, subtle section backdrops, document callouts' },
  { id: 'leaf-green', name: 'Leaf Green', hex: '#6AAD7C', role: 'Growth, community indicators, verified badges with Charcoal text (4.74:1)' },
  { id: 'charcoal', name: 'Charcoal', hex: '#333333', role: 'Primary body typography (12.63:1 on white / 10.52:1 on Soft Cream), dark navigation bar' },
  { id: 'white', name: 'White (Neutral Surface)', hex: '#FFFFFF', role: 'Neutral elevated cards, logo clear-space surface, accessibility contrast' },
] as const;

export type ContentPillarId =
  | 'SAFETY_AND_RESOURCES'
  | 'HEALING_AND_WHOLENESS'
  | 'EDUCATION_AND_AWARENESS'
  | 'COMMUNITY_AND_CULTURE'
  | 'PROGRAMS_AND_EVENTS'
  | 'IMPACT_AND_FUNDRAISING'
  | 'TEAM_AND_PARTNERS';

export const CONTENT_PILLARS: Array<{
  id: ContentPillarId;
  label: string;
  description: string;
  defaultTone: string;
}> = [
  {
    id: 'SAFETY_AND_RESOURCES',
    label: 'Safety & Resources',
    description: 'Day One Crisis Line, Safe Exit info, legal/housing rights guides, confidential support pathways.',
    defaultTone: 'Calm, protective, dignified, trauma-informed',
  },
  {
    id: 'HEALING_AND_WHOLENESS',
    label: 'Healing & Wholeness',
    description: 'Tea Healing Circles, culturally rooted wellness, emotional restoration, sisterhood resilience.',
    defaultTone: 'Warm, restorative, culturally affirming',
  },
  {
    id: 'EDUCATION_AND_AWARENESS',
    label: 'Education & Awareness',
    description: 'Immigrant survivor rights, financial abuse literacy, healthy relationship education, statute guides.',
    defaultTone: 'Clear, empowering, accessible',
  },
  {
    id: 'COMMUNITY_AND_CULTURE',
    label: 'Community & Culture',
    description: 'African & immigrant heritage, Ubuntu community gatherings, multilingual inclusion, cultural dignity.',
    defaultTone: 'Celebratory, respectful, community-rooted',
  },
  {
    id: 'PROGRAMS_AND_EVENTS',
    label: 'Programs & Events',
    description: '6 core programs, workshops, job labs, youth mentoring, RSVP calendars (venue safety checked).',
    defaultTone: 'Welcoming, practical, action-oriented',
  },
  {
    id: 'IMPACT_AND_FUNDRAISING',
    label: 'Impact & Fundraising',
    description: 'Verified impact milestones, 501(c)(3) campaigns, grant partnerships, honest funding-dependent disclosures.',
    defaultTone: 'Transparent, accountable, grateful',
  },
  {
    id: 'TEAM_AND_PARTNERS',
    label: 'Team & Partners',
    description: 'Comfort Dondo leadership reflections, staff spotlights, vetted MOU partners, volunteers (verified consent).',
    defaultTone: 'Collaborative, institutional, appreciative',
  },
];

export const PLANNING_MILESTONES = [
  {
    id: 'MS-25',
    cadence: 'MONTHLY',
    dayLabel: '25th of Month',
    title: 'Gather Program, Event & Fundraising Inputs',
    ownerRole: 'Communications Lead + Program Directors',
  },
  {
    id: 'MS-27',
    cadence: 'MONTHLY',
    dayLabel: '27th of Month',
    title: 'Draft Next Month Editorial Calendar Across All 7 Pillars',
    ownerRole: 'Communications Lead',
  },
  {
    id: 'MS-30',
    cadence: 'MONTHLY',
    dayLabel: '30th of Month',
    title: 'Review & Escalate Sensitive Categories to Executive Director',
    ownerRole: 'Communications Lead -> Executive Director',
  },
  {
    id: 'MS-FRI',
    cadence: 'WEEKLY',
    dayLabel: 'Every Friday',
    title: 'Confirm Upcoming Week Queue, Captions, Alt-Text & Consent Links',
    ownerRole: 'Communications Lead + Safeguarding Review',
  },
  {
    id: 'MS-DAY',
    cadence: 'POSTING_DAY',
    dayLabel: 'Posting Day',
    title: 'Final Verification, Manual/Export Publishing (Fail-Closed Auto), Monitor & Log',
    ownerRole: 'Communications Lead',
  },
] as const;

export type EditorialWorkflowStage =
  | 'BRIEF'
  | 'DRAFT'
  | 'DESIGN'
  | 'REVIEW'
  | 'FINAL_APPROVAL_REQUIRED'
  | 'SCHEDULE'
  | 'PUBLISH'
  | 'MONITOR'
  | 'LOG';

export const EDITORIAL_WORKFLOW_STAGES: EditorialWorkflowStage[] = [
  'BRIEF',
  'DRAFT',
  'DESIGN',
  'REVIEW',
  'FINAL_APPROVAL_REQUIRED',
  'SCHEDULE',
  'PUBLISH',
  'MONITOR',
  'LOG',
];

export type SocialPlatform =
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'X_TWITTER'
  | 'TIKTOK_REELS'
  | 'WEBSITE_BLOG'
  | 'EMAIL_NEWSLETTER';

export interface PlatformSpecification {
  id: SocialPlatform;
  label: string;
  shortCode: string;
  recommendedDimensions: string;
  aspectRatio: string;
  minSocialBodyFontPx: number;
  maxRecommendedChars: number;
  defaultHashtags: string[];
  linkPolicy: string;
}

export const PLATFORM_SPECIFICATIONS: Record<SocialPlatform, PlatformSpecification> = {
  INSTAGRAM: {
    id: 'INSTAGRAM',
    label: 'Instagram (Feed / Carousel)',
    shortCode: 'IG',
    recommendedDimensions: '1080x1350',
    aspectRatio: '4:5 Portrait (or 1080x1080 1:1)',
    minSocialBodyFontPx: 28,
    maxRecommendedChars: 2200,
    defaultHashtags: ['#Phumulani', '#SafeHealing', '#ImmigrantSurvivors', '#MinnesotaNonprofit', '#Ubuntu'],
    linkPolicy: 'Use bio link or Linktree label; include Day One Crisis Line (1-866-223-1111) for safety posts.',
  },
  FACEBOOK: {
    id: 'FACEBOOK',
    label: 'Facebook Community Page',
    shortCode: 'FB',
    recommendedDimensions: '1080x1080',
    aspectRatio: '1:1 Square or 1200x628 Link Card',
    minSocialBodyFontPx: 28,
    maxRecommendedChars: 1500,
    defaultHashtags: ['#PhumulaniMN', '#CommunityHealing', '#EndingGenderBasedViolence'],
    linkPolicy: 'Direct verified phumulani.org URL only after broken-link check.',
  },
  LINKEDIN: {
    id: 'LINKEDIN',
    label: 'LinkedIn Institutional',
    shortCode: 'LI',
    recommendedDimensions: '1200x628',
    aspectRatio: '1.91:1 Landscape',
    minSocialBodyFontPx: 28,
    maxRecommendedChars: 3000,
    defaultHashtags: ['#NonprofitLeadership', '#Phumulani', '#Minnesota501c3', '#EconomicIndependence'],
    linkPolicy: 'Institutional metrics & grant acknowledgments require source verification.',
  },
  X_TWITTER: {
    id: 'X_TWITTER',
    label: 'X (Twitter)',
    shortCode: 'X',
    recommendedDimensions: '1200x628',
    aspectRatio: '16:9 / 1.91:1',
    minSocialBodyFontPx: 28,
    maxRecommendedChars: 280,
    defaultHashtags: ['#Phumulani', '#SurvivorSupport'],
    linkPolicy: 'Shortened verified phumulani.org anchor only; no tracking pixels.',
  },
  TIKTOK_REELS: {
    id: 'TIKTOK_REELS',
    label: 'TikTok / Reels / Vertical Video',
    shortCode: 'REEL',
    recommendedDimensions: '1080x1920',
    aspectRatio: '9:16 Vertical',
    minSocialBodyFontPx: 28,
    maxRecommendedChars: 1000,
    defaultHashtags: ['#Phumulani', '#HealingCircles', '#Empowerment'],
    linkPolicy: 'Requires closed captions, transcript summary, and verified participant consent before design sign-off.',
  },
  WEBSITE_BLOG: {
    id: 'WEBSITE_BLOG',
    label: 'Website News & Blog',
    shortCode: 'WEB',
    recommendedDimensions: '1920x1080',
    aspectRatio: '16:9 Hero',
    minSocialBodyFontPx: 16,
    maxRecommendedChars: 12000,
    defaultHashtags: [],
    linkPolicy: 'Canonical phumulani.org URL + SEO title/description + alt text required.',
  },
  EMAIL_NEWSLETTER: {
    id: 'EMAIL_NEWSLETTER',
    label: 'Email Newsletter Dispatch',
    shortCode: 'EMAIL',
    recommendedDimensions: '1200x600',
    aspectRatio: '2:1 Header Banner',
    minSocialBodyFontPx: 16,
    maxRecommendedChars: 8000,
    defaultHashtags: [],
    linkPolicy: 'Sent only via human-approved Email Command Center flow; never auto-dispatched.',
  },
};

export type CommunicationsRole =
  | 'intern_content_assistant'
  | 'communications_lead'
  | 'program_director'
  | 'safeguarding_lead'
  | 'executive_director'
  | 'board_advisor_partner'
  | 'master_admin';

export type SensitiveContentCategory =
  | 'NONE'
  | 'SURVIVOR_STORY'
  | 'CRISIS_RESOURCE'
  | 'MINOR_RELATED'
  | 'PARTNER_GOVERNMENT_STATEMENT'
  | 'FUNDRAISING_CLAIM'
  | 'CRISIS_MODERATION_RESPONSE';

export type AssetStorageState = 'DRAFT' | 'FINAL_APPROVED';

export interface SocialEditorialItem {
  id: string;
  title: string;
  pillar: ContentPillarId;
  platform: SocialPlatform;
  contentType: 'Carousel' | 'SingleGraphic' | 'ReelVideo' | 'Article' | 'Newsletter' | 'EventNotice';
  scheduledDate: string; // YYYY-MM-DD
  milestoneTag: 'MS-25' | 'MS-27' | 'MS-30' | 'MS-FRI' | 'MS-DAY';
  stage: EditorialWorkflowStage;
  approvalStatus: 'DRAFT_IN_PROGRESS' | 'IN_REVIEW' | 'FINAL_APPROVAL_REQUIRED' | 'APPROVED_FOR_EXPORT' | 'REAPPROVAL_REQUIRED' | 'TAKEDOWN_REQUIRED' | 'LOGGED';
  version: number;
  sensitiveCategory: SensitiveContentCategory;
  requiresExecutiveApproval: boolean;
  consentRequired: boolean;
  consentRecordId?: string;
  // Block 11 structured caption
  captionHook: string;
  captionContext: string;
  captionValue: string;
  captionConnection: string;
  captionCta: string;
  hashtags: string[];
  targetUrl: string;
  linkVerified: boolean;
  // Block 5 & 16 asset metadata
  assetFilename: string;
  assetState: AssetStorageState;
  assetDimensions: string;
  socialBodyFontSizePx: number;
  altText: string;
  videoCaptionsVerified: boolean;
  contentHashSha256: string;
  createdBy: string;
  createdByRole: string;
  lastEditedBy: string;
  lastEditedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  finalApprovedBy?: string;
  finalApprovedAt?: string;
  invalidationReason?: string;
  exportPackageOnly: true; // Fail-closed: no autonomous live external publishing
}

export interface SocialApprovalAuditEntry {
  id: string;
  entityType: 'EDITORIAL_ITEM' | 'CONSENT_RECORD' | 'MODERATION_INCIDENT' | 'ACCOUNT_GOVERNANCE' | 'AI_ASSIST';
  entityId: string;
  action: string;
  actorName: string;
  actorRole: string;
  previousStage?: string;
  newStage?: string;
  version?: number;
  decisionNotes?: string;
  timestamp: string;
  sha256Signature: string;
}

export type ConsentScope = 'PUBLIC_WEB' | 'SOCIAL_MEDIA' | 'NEWSLETTER' | 'FUNDRAISING' | 'VIDEO_STORY';

export interface ConsentRecord {
  id: string;
  subjectAlias: string; // Strictly pseudonymous / non-identifying operational alias
  subjectType: 'ADULT' | 'MINOR' | 'STAFF' | 'COMMUNITY_PARTNER';
  allowedScopes: ConsentScope[];
  consentStatus: 'GRANTED' | 'PENDING' | 'WITHDRAWN' | 'EXPIRED';
  guardianConsentVerified: boolean;
  bestInterestsReviewCompleted: boolean;
  guardianReviewerName?: string;
  bestInterestsReviewerName?: string;
  obtainedAt: string;
  expiresAt?: string;
  withdrawnAt?: string;
  takedownRequired: boolean;
  takedownCompletedAt?: string;
  restrictedAccessTier: 'SAFEGUARDING_AND_COMMS_LEADS_ONLY';
  verificationSummary: string;
}

export type EscalationTier = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface ModerationIncident {
  id: string;
  platform: SocialPlatform;
  tier: EscalationTier;
  summary: string;
  commentExcerptRedacted: string;
  status: 'OPEN' | 'IN_PROGRAM_REVIEW' | 'PENDING_ED_APPROVAL' | 'RESPONSE_APPROVED' | 'PUBLISHING_PAUSED' | 'RESOLVED_LOGGED';
  ownerRoleRequired: string;
  requiresExecutiveApprovalBeforeReply: boolean;
  relatedPublishingPaused: boolean;
  suggestedTemplateId?: string;
  draftReply?: string;
  approvedByExecutiveName?: string;
  approvedByExecutiveAt?: string;
  loggedAt: string;
  updatedAt: string;
}

export interface SocialAccountGovernanceRecord {
  id: string;
  platform: SocialPlatform;
  handle: string;
  displayName: string;
  adminCount: number;
  designatedAdmins: string[]; // Names & roles only — NEVER credentials
  twoAdminRuleSatisfied: boolean;
  mfaEnabled: boolean;
  lastAccessAuditAt: string;
  departedStaffRevocationPending: boolean;
  lastDepartureRevokedWithin24h: boolean;
  sensitiveSettingsWrittenApprovalRef: string;
  liveAutoPublishingEnabled: false; // Strictly disabled / fail-closed
  publishingControlMode: 'MANUAL_EXPORT_ONLY';
}

export type AnalyticsSourceClassification = 'VERIFIED_PROVIDER' | 'MANUAL_ENTRY' | 'DEMO_STAGED';

export interface SocialAnalyticsRecord {
  id: string;
  periodLabel: string;
  platform: SocialPlatform;
  pillar: ContentPillarId;
  sourceClassification: AnalyticsSourceClassification;
  reach: number;
  engagementCount: number;
  linkClicks: number;
  savesOrShares: number;
  recordedBy: string;
  recordedAt: string;
  notes: string;
}

export interface CommunicationsGovernanceSnapshot {
  manualStatus: typeof BRAND_MANUAL_STATUS;
  editorialItems: SocialEditorialItem[];
  auditTrail: SocialApprovalAuditEntry[];
  consentRecordsCount: number;
  consentAccessGranted: boolean;
  consentRecords: ConsentRecord[];
  moderationIncidents: ModerationIncident[];
  accountGovernance: SocialAccountGovernanceRecord[];
  analyticsRecords: SocialAnalyticsRecord[];
  globalPublishingPaused: boolean;
}
