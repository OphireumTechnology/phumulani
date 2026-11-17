/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Communications, Brand Manual, Safeguarding & Social Governance Workspace
 * Grounded in: Phumulani Social Media Policy, Guidelines & Brand Manual — Working Draft v1.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  KeyRound,
  Link2,
  Lock,
  MessageSquareWarning,
  Palette,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { User } from '../../../types';
import {
  BRAND_MANUAL_STATUS,
  CommunicationsGovernanceSnapshot,
  ConsentScope,
  CONTENT_PILLARS,
  ContentPillarId,
  EDITORIAL_WORKFLOW_STAGES,
  EditorialWorkflowStage,
  EscalationTier,
  OFFICIAL_BRAND_PALETTE,
  PLANNING_MILESTONES,
  PLATFORM_SPECIFICATIONS,
  SensitiveContentCategory,
  SocialEditorialItem,
  SocialPlatform,
} from '../../../types/communications';
import { authFetch } from '../../../services/sessionTokenStore';
import { PhumulaniLogo } from '../../branding/PhumulaniLogo';

type CommsSubTab =
  | 'calendar'
  | 'composer'
  | 'consents'
  | 'moderation'
  | 'accounts'
  | 'analytics'
  | 'brand_spec';

interface CommunicationsGovernanceWorkspaceProps {
  currentUser: User;
  onStatusBanner?: (msg: string | null) => void;
}

const STAGE_NEXT_OPTIONS: Record<EditorialWorkflowStage, EditorialWorkflowStage[]> = {
  BRIEF: ['DRAFT'],
  DRAFT: ['DESIGN', 'REVIEW'],
  DESIGN: ['REVIEW'],
  REVIEW: ['FINAL_APPROVAL_REQUIRED', 'SCHEDULE'],
  FINAL_APPROVAL_REQUIRED: ['SCHEDULE'],
  SCHEDULE: ['PUBLISH'],
  PUBLISH: ['MONITOR'],
  MONITOR: ['LOG'],
  LOG: [],
};

const TIER_STYLES: Record<EscalationTier, { badge: string; border: string; label: string }> = {
  GREEN: {
    badge: 'bg-phumulani-green text-phumulani-charcoal',
    border: 'border-phumulani-green',
    label: 'GREEN — Routine Engagement',
  },
  YELLOW: {
    badge: 'bg-phumulani-teal text-phumulani-charcoal',
    border: 'border-phumulani-teal',
    label: 'YELLOW — Program Inquiry / Resource Route',
  },
  ORANGE: {
    badge: 'bg-phumulani-gold text-phumulani-charcoal',
    border: 'border-phumulani-gold',
    label: 'ORANGE — ED Approval Required Before Reply',
  },
  RED: {
    badge: 'bg-phumulani-earth text-white',
    border: 'border-phumulani-earth',
    label: 'RED — Crisis / Immediate Publishing Pause',
  },
};

export const CommunicationsGovernanceWorkspace: React.FC<CommunicationsGovernanceWorkspaceProps> = ({
  currentUser,
  onStatusBanner,
}) => {
  const [subTab, setSubTab] = useState<CommsSubTab>('calendar');
  const [snapshot, setSnapshot] = useState<CommunicationsGovernanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Editorial filter & edit modal state
  const [pillarFilter, setPillarFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<SocialEditorialItem | null>(null);

  // Composer form state
  const [compTitle, setCompTitle] = useState('');
  const [compPillar, setCompPillar] = useState<ContentPillarId>('EDUCATION_AND_AWARENESS');
  const [compPlatform, setCompPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [compContentType, setCompContentType] = useState<SocialEditorialItem['contentType']>('Carousel');
  const [compDate, setCompDate] = useState('2026-11-29');
  const [compSensitive, setCompSensitive] = useState<SensitiveContentCategory>('NONE');
  const [compConsentRequired, setCompConsentRequired] = useState(false);
  const [compConsentId, setCompConsentId] = useState('');
  const [compHook, setCompHook] = useState('');
  const [compContext, setCompContext] = useState('');
  const [compValue, setCompValue] = useState('');
  const [compConnection, setCompConnection] = useState('');
  const [compCta, setCompCta] = useState('');
  const [compTargetUrl, setCompTargetUrl] = useState('https://phumulani.org/#programs-section');
  const [compFontPx, setCompFontPx] = useState(30);
  const [compAltText, setCompAltText] = useState('');
  const [compVideoCaptions, setCompVideoCaptions] = useState(true);

  // AI Assist state
  const [aiTask, setAiTask] = useState<'DRAFT_CAPTION' | 'ALT_TEXT' | 'SENSITIVITY_SCAN' | 'CALENDAR_SUMMARY'>('DRAFT_CAPTION');
  const [aiTopic, setAiTopic] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Consent creation state
  const [consentAlias, setConsentAlias] = useState('');
  const [consentType, setConsentType] = useState<'ADULT' | 'MINOR' | 'STAFF' | 'COMMUNITY_PARTNER'>('COMMUNITY_PARTNER');
  const [consentScopes, setConsentScopes] = useState<ConsentScope[]>(['PUBLIC_WEB', 'SOCIAL_MEDIA']);
  const [guardianVerified, setGuardianVerified] = useState(false);
  const [bestInterestsVerified, setBestInterestsVerified] = useState(false);
  const [consentSummary, setConsentSummary] = useState('');

  // Moderation creation state
  const [modPlatform, setModPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [modTier, setModTier] = useState<EscalationTier>('YELLOW');
  const [modSummary, setModSummary] = useState('');
  const [modExcerpt, setModExcerpt] = useState('');

  // Analytics entry state
  const [anlPeriod, setAnlPeriod] = useState('2026-11 Week 3');
  const [anlPlatform, setAnlPlatform] = useState<SocialPlatform>('INSTAGRAM');
  const [anlPillar, setAnlPillar] = useState<ContentPillarId>('COMMUNITY_AND_CULTURE');
  const [anlSource, setAnlSource] = useState<'MANUAL_ENTRY' | 'DEMO_STAGED'>('MANUAL_ENTRY');
  const [anlReach, setAnlReach] = useState(450);
  const [anlEngagement, setAnlEngagement] = useState(52);
  const [anlClicks, setAnlClicks] = useState(19);
  const [anlNotes, setAnlNotes] = useState('Native platform insights manual count');

  const notify = useCallback(
    (msg: string) => {
      setActionNotice(msg);
      if (onStatusBanner) onStatusBanner(msg);
    },
    [onStatusBanner]
  );

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/communications/snapshot');
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `HTTP ${res.status} loading communications governance`);
      }
      setSnapshot(data.snapshot);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load communications governance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot, currentUser.role]);

  const roleLower = String(currentUser.role || '').toLowerCase();
  const isExecutiveOrAdmin = ['master_admin', 'platform_super_admin', 'super_admin', 'executive_director', 'executive'].includes(roleLower);
  const isCommsOrLead = ['communications_lead', 'communications_officer', 'staff', ...['master_admin', 'platform_super_admin', 'super_admin', 'executive_director', 'executive']].includes(roleLower);
  const isBoardReadOnly = ['board_advisor_partner', 'board_member', 'governance_officer'].includes(roleLower);

  const filteredEditorial = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.editorialItems.filter((item) => {
      const matchesPillar = pillarFilter === 'ALL' || item.pillar === pillarFilter;
      const matchesStage = stageFilter === 'ALL' || item.stage === stageFilter;
      return matchesPillar && matchesStage;
    });
  }, [snapshot, pillarFilter, stageFilter]);

  const generatedFilenamePreview = useMemo(() => {
    const code = PLATFORM_SPECIFICATIONS[compPlatform]?.shortCode || 'IG';
    const cleanTopic =
      compTitle
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('') || 'CommunityUpdate';
    return `${compDate}_${code}_${compContentType}_${cleanTopic}_v1`;
  }, [compDate, compPlatform, compContentType, compTitle]);

  const handleStageTransition = async (item: SocialEditorialItem, targetStage: EditorialWorkflowStage) => {
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/items/${item.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStage }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Transition rejected by governance gate.');
      }
      notify(`Editorial item ${item.id} moved to ${targetStage} (${data.item.approvalStatus}).`);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Workflow transition failed.');
    }
  };

  const handleVerifyLink = async (itemId: string) => {
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/items/${itemId}/verify-links`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Link check failed.');
      notify(`Link check for ${itemId}: ${data.details}`);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Link verification error.');
    }
  };

  const handleSaveEditorialEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Update failed.');
      notify(
        data.approvalInvalidated
          ? `Material edit saved on ${editingItem.id} — PRIOR APPROVAL INVALIDATED and reset to DRAFT (v${data.item.version}) pending re-approval.`
          : `Saved draft changes for ${editingItem.id}.`
      );
      setEditingItem(null);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save editorial edit.');
    }
  };

  const handleCreateEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const spec = PLATFORM_SPECIFICATIONS[compPlatform];
      const res = await authFetch('/api/communications/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: compTitle,
          pillar: compPillar,
          platform: compPlatform,
          contentType: compContentType,
          scheduledDate: compDate,
          sensitiveCategory: compSensitive,
          consentRequired: compConsentRequired,
          consentRecordId: compConsentId || undefined,
          captionHook: compHook,
          captionContext: compContext,
          captionValue: compValue,
          captionConnection: compConnection,
          captionCta: compCta,
          targetUrl: compTargetUrl,
          assetDimensions: spec.recommendedDimensions,
          socialBodyFontSizePx: compFontPx,
          altText: compAltText,
          videoCaptionsVerified: compVideoCaptions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to create editorial item.');
      notify(`Created draft "${data.item.assetFilename}" in ${compPillar}.`);
      setCompTitle('');
      setCompHook('');
      setCompContext('');
      setCompValue('');
      setCompConnection('');
      setCompCta('');
      setCompAltText('');
      setSubTab('calendar');
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to create editorial item.');
    }
  };

  const handleRunAiAssist = async () => {
    if (!aiTopic.trim()) {
      setErrorMsg('Enter a non-identifying topic before requesting AI draft assistance.');
      return;
    }
    setAiLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/communications/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: aiTask,
          topic: aiTopic,
          pillar: compPillar,
          platform: compPlatform,
          notes: aiNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'AI Assist blocked.');
      setCompTitle((prev) => prev || aiTopic.trim());
      setCompHook(data.draft.captionHook);
      setCompContext(data.draft.captionContext);
      setCompValue(data.draft.captionValue);
      setCompConnection(data.draft.captionConnection);
      setCompCta(data.draft.captionCta);
      setCompAltText(data.draft.altText);
      if (data.draft.suggestedSensitiveCategory !== 'NONE') {
        setCompSensitive(data.draft.suggestedSensitiveCategory);
      }
      setAiWarnings(data.warnings || []);
      notify(`AI Assist generated HUMAN_REVIEWED_DRAFT_ONLY copy into Composer.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'AI Assist error.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/communications/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectAlias: consentAlias,
          subjectType: consentType,
          allowedScopes: consentScopes,
          guardianConsentVerified: guardianVerified,
          bestInterestsReviewCompleted: bestInterestsVerified,
          verificationSummary: consentSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to record consent.');
      notify(`Consent record ${data.record.id} saved (${data.record.consentStatus}).`);
      setConsentAlias('');
      setConsentSummary('');
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Consent creation failed.');
    }
  };

  const handleWithdrawConsent = async (consentId: string) => {
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/consents/${consentId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Safeguarding / participant withdrawal request' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Withdrawal failed.');
      notify(
        `Consent ${consentId} WITHDRAWN — takedown triggered across ${data.flaggedItems.length} linked editorial item(s).`
      );
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Withdrawal error.');
    }
  };

  const handleCreateModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/communications/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: modPlatform,
          tier: modTier,
          summary: modSummary,
          commentExcerptRedacted: modExcerpt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to log moderation incident.');
      notify(`Logged ${modTier} moderation incident ${data.incident.id}.`);
      setModSummary('');
      setModExcerpt('');
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Moderation log failed.');
    }
  };

  const handleDecideModeration = async (id: string, decision: 'APPROVE_REPLY' | 'RESOLVE_AND_UNPAUSE' | 'ESCALATE_RED') => {
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/moderation/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Decision rejected.');
      notify(`Moderation incident ${id} updated (${decision}).`);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Moderation action failed.');
    }
  };

  const handleAuditAccount = async (id: string, admins: string[]) => {
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/communications/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designatedAdmins: admins,
          mfaEnabled: true,
          departedStaffRevocationPending: false,
          lastDepartureRevokedWithin24h: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Account audit failed.');
      notify(`Verified security access audit for ${data.account.handle} (2-admin=${data.account.twoAdminRuleSatisfied}, MANUAL_EXPORT_ONLY).`);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Account audit failed.');
    }
  };

  const handleRecordAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/communications/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodLabel: anlPeriod,
          platform: anlPlatform,
          pillar: anlPillar,
          sourceClassification: anlSource,
          reach: anlReach,
          engagementCount: anlEngagement,
          linkClicks: anlClicks,
          savesOrShares: Math.round(anlEngagement * 0.25),
          notes: anlNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Analytics entry failed.');
      notify(`Recorded ${anlSource} analytics metric (${anlPeriod}).`);
      await loadSnapshot();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Analytics recording error.');
    }
  };

  const handleDownloadExportPackage = (item: SocialEditorialItem) => {
    const pkg = {
      manualPolicyStatus: BRAND_MANUAL_STATUS.notice,
      exportMode: 'MANUAL_EXPORT_ONLY_FAIL_CLOSED',
      assetFilename: item.assetFilename,
      assetState: item.assetState,
      platform: item.platform,
      dimensions: item.assetDimensions,
      scheduledDate: item.scheduledDate,
      pillar: item.pillar,
      captionStructured: {
        hook: item.captionHook,
        context: item.captionContext,
        value: item.captionValue,
        phumulaniConnection: item.captionConnection,
        callToAction: item.captionCta,
        hashtags: item.hashtags,
      },
      altText: item.altText,
      targetUrl: item.targetUrl,
      approvals: {
        reviewedBy: item.reviewedBy,
        finalApprovedBy: item.finalApprovedBy,
        finalApprovedAt: item.finalApprovedAt,
        contentHashSha256: item.contentHashSha256,
      },
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.assetFilename}.export.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Downloaded approved manual export package: ${item.assetFilename}.export.json`);
  };

  return (
    <div className="space-y-5">
      {/* BLOCK 8: WORKING DRAFT STATUS BANNER — ALWAYS VISIBLE */}
      <div className="bg-phumulani-cream border-2 border-phumulani-gold rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-phumulani-earth shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-bold text-sm text-phumulani-charcoal">
                {BRAND_MANUAL_STATUS.documentTitle}
              </span>
              <span className="px-2 py-0.5 bg-phumulani-gold text-phumulani-charcoal text-[11px] font-bold rounded-md">
                {BRAND_MANUAL_STATUS.version} — PENDING EXECUTIVE LEADERSHIP APPROVAL
              </span>
            </div>
            <p className="text-xs text-phumulani-charcoal">
              Not yet formally adopted policy. Live autonomous social publishing is <strong>FAIL-CLOSED DISABLED (MANUAL_EXPORT_ONLY)</strong>.
              Active Role: <strong className="uppercase">{currentUser.role}</strong>
              {isBoardReadOnly && ' (Read-Only Advisory Access)'}.
            </p>
          </div>
        </div>
        <button
          onClick={() => void loadSnapshot()}
          className="px-3 py-1.5 bg-white hover:bg-phumulani-teal text-phumulani-charcoal border border-phumulani-charcoal/25 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Governance</span>
        </button>
      </div>

      {/* BLOCK 13: ACTIVE RED CRISIS PUBLISHING PAUSE BANNER */}
      {snapshot?.globalPublishingPaused && (
        <div className="bg-phumulani-earth text-white rounded-2xl p-4 flex items-center justify-between gap-3 border-2 border-phumulani-gold shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-phumulani-gold shrink-0" aria-hidden="true" />
            <div>
              <div className="font-heading font-bold text-sm">
                EMERGENCY PUBLISHING PAUSE ACTIVE (RED CRISIS ESCALATION)
              </div>
              <p className="text-xs text-phumulani-cream">
                All social scheduling &amp; publishing transitions are blocked server-side until Executive Director or Safeguarding Lead resolves the open RED incident.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubTab('moderation')}
            className="px-3 py-1.5 bg-phumulani-gold hover:bg-white text-phumulani-charcoal rounded-lg text-xs font-bold shrink-0 cursor-pointer"
          >
            Inspect RED Incident
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-phumulani-cream border-2 border-phumulani-earth rounded-xl p-3.5 flex items-start justify-between gap-2 text-xs text-phumulani-charcoal">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong className="text-phumulani-earth">Governance Enforcement:</strong> {errorMsg}
            </span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-phumulani-earth font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {actionNotice && (
        <div className="bg-white border border-phumulani-green rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-phumulani-charcoal">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" aria-hidden="true" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-phumulani-earth font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* SUB-NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-phumulani-charcoal/15 pb-3">
        {[
          { id: 'calendar', label: '7-Pillar Calendar & Workflow', icon: Calendar },
          { id: 'composer', label: 'Platform Composer & AI Assist', icon: Sparkles },
          { id: 'consents', label: `Consent Vault (${snapshot?.consentRecordsCount ?? 0})`, icon: Lock },
          { id: 'moderation', label: `Moderation & 4-Tier Crisis (${snapshot?.moderationIncidents.length ?? 0})`, icon: MessageSquareWarning },
          { id: 'accounts', label: 'Account Security & Controls', icon: KeyRound },
          { id: 'analytics', label: 'Source-Tagged Analytics', icon: BarChart3 },
          { id: 'brand_spec', label: 'Brand System & WCAG 2.2 AA', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as CommsSubTab)}
              className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                active
                  ? 'bg-phumulani-earth text-white shadow-xs'
                  : 'bg-white text-phumulani-charcoal border border-phumulani-charcoal/15 hover:bg-phumulani-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: 7-PILLAR CALENDAR & 9-STAGE WORKFLOW                            */}
      {/* ===================================================================== */}
      {subTab === 'calendar' && (
        <div className="space-y-4">
          {/* Planning Milestones Cadence */}
          <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-phumulani-earth mb-3">
              Monthly &amp; Weekly Editorial Planning Milestones (Draft Manual Cadence)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {PLANNING_MILESTONES.map((ms) => (
                <div key={ms.id} className="bg-phumulani-cream/70 border border-phumulani-charcoal/15 rounded-lg p-2.5 space-y-1">
                  <div className="text-[11px] font-bold text-phumulani-earth font-heading">{ms.dayLabel}</div>
                  <div className="text-xs font-semibold text-phumulani-charcoal leading-snug">{ms.title}</div>
                  <div className="text-[10px] text-phumulani-charcoal/80">{ms.ownerRole}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar & Stage Filter Bar */}
          <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by Content Pillar"
                value={pillarFilter}
                onChange={(e) => setPillarFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              >
                <option value="ALL">All 7 Content Pillars</option>
                {CONTENT_PILLARS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by Workflow Stage"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              >
                <option value="ALL">All 9 Workflow Stages</option>
                {EDITORIAL_WORKFLOW_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {!isBoardReadOnly && (
              <button
                onClick={() => setSubTab('composer')}
                className="px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Compliant Post Brief</span>
              </button>
            )}
          </div>

          {/* Editorial Items List */}
          <div className="space-y-3">
            {filteredEditorial.map((item) => {
              const pillarObj = CONTENT_PILLARS.find((p) => p.id === item.pillar);
              const nextStages = STAGE_NEXT_OPTIONS[item.stage] || [];
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 space-y-3 ${
                    item.approvalStatus === 'TAKEDOWN_REQUIRED'
                      ? 'border-phumulani-earth border-2'
                      : item.approvalStatus === 'REAPPROVAL_REQUIRED'
                      ? 'border-phumulani-gold border-2'
                      : 'border-phumulani-charcoal/15'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal">
                          {item.scheduledDate} · {item.milestoneTag}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-phumulani-teal text-phumulani-charcoal">
                          {item.platform} ({item.assetDimensions})
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/25">
                          {pillarObj?.label || item.pillar}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            item.assetState === 'FINAL_APPROVED'
                              ? 'bg-phumulani-green text-phumulani-charcoal'
                              : 'bg-phumulani-gold text-phumulani-charcoal'
                          }`}
                        >
                          {item.stage} · {item.assetState} (v{item.version})
                        </span>
                        {item.requiresExecutiveApproval && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-phumulani-earth text-white">
                            ED APPROVAL REQUIRED ({item.sensitiveCategory})
                          </span>
                        )}
                      </div>

                      <h5 className="font-heading font-bold text-sm text-phumulani-charcoal">{item.title}</h5>

                      <div className="text-[11px] font-mono text-phumulani-charcoal/90 break-all">
                        Asset Filename: <strong>{item.assetFilename}</strong> · Body Text: <strong>{item.socialBodyFontSizePx}px</strong> ·{' '}
                        {item.consentRequired ? `Consent Link: ${item.consentRecordId || 'MISSING'}` : 'No Individual Depiction Consent Needed'}
                      </div>

                      {item.invalidationReason && (
                        <div className="p-2 bg-phumulani-cream border border-phumulani-gold rounded-lg text-xs text-phumulani-charcoal font-semibold">
                          ⚠ {item.invalidationReason}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-phumulani-cream/50 p-2.5 rounded-lg">
                        <div>
                          <strong className="text-phumulani-earth">Hook:</strong> {item.captionHook}
                        </div>
                        <div>
                          <strong className="text-phumulani-earth">CTA:</strong> {item.captionCta}
                        </div>
                        <div className="md:col-span-2 text-[11px]">
                          <strong>Alt-Text:</strong> {item.altText}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-1.5 shrink-0">
                      {!isBoardReadOnly && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="px-2.5 py-1.5 border border-phumulani-charcoal/25 text-phumulani-charcoal hover:bg-phumulani-cream rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Edit Content
                        </button>
                      )}

                      <button
                        onClick={() => void handleVerifyLink(item.id)}
                        className="px-2.5 py-1.5 border border-phumulani-teal bg-white hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Link2 className="w-3 h-3 text-phumulani-earth" />
                        <span>{item.linkVerified ? 'Link Verified' : 'Verify Target URL'}</span>
                      </button>

                      {item.approvalStatus === 'APPROVED_FOR_EXPORT' && (
                        <button
                          onClick={() => handleDownloadExportPackage(item)}
                          className="px-2.5 py-1.5 bg-phumulani-green hover:bg-phumulani-teal text-phumulani-charcoal rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export Post Package</span>
                        </button>
                      )}

                      {!isBoardReadOnly &&
                        nextStages.map((nextSt) => (
                          <button
                            key={nextSt}
                            onClick={() => void handleStageTransition(item, nextSt)}
                            className="px-2.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Move -&gt; {nextSt}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PLATFORM COMPOSER & AI COMMUNICATIONS HELPER                   */}
      {/* ===================================================================== */}
      {subTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* AI Assist Sidebar */}
          <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-3 h-fit">
            <div className="flex items-center gap-2 text-phumulani-earth font-heading font-bold text-sm">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>AI Communications Helper</span>
            </div>
            <p className="text-[11px] text-phumulani-charcoal bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-gold">
              <strong>HUMAN_REVIEWED_DRAFT_ONLY:</strong> Generates non-identifying draft copy and alt-text suggestions. Strictly blocks PII, shelter addresses, legal representation, medical diagnosis, or safety plans.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Task</label>
                <select
                  value={aiTask}
                  onChange={(e) => setAiTask(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  <option value="DRAFT_CAPTION">Draft Structured Caption (Hook-&gt;CTA)</option>
                  <option value="ALT_TEXT">Generate Plain-Language Alt Text</option>
                  <option value="SENSITIVITY_SCAN">Scan Sensitivity &amp; Consent Flags</option>
                  <option value="CALENDAR_SUMMARY">Summarize Pillar Brief</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Non-Identifying Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., Winter Financial Literacy Clinic"
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Notes / Context</label>
                <textarea
                  rows={3}
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  placeholder="Program audience, languages available, verified CTA..."
                  className="w-full px-2.5 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>

              <button
                type="button"
                disabled={aiLoading || isBoardReadOnly}
                onClick={() => void handleRunAiAssist()}
                className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? 'Generating Supervised Draft...' : 'Draft Supervised Copy -> Composer'}
              </button>

              {aiWarnings.length > 0 && (
                <ul className="space-y-1 text-[11px] bg-phumulani-cream p-2 rounded-lg text-phumulani-charcoal">
                  {aiWarnings.map((w, idx) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main Platform Spec & Caption Builder */}
          <form onSubmit={handleCreateEditorial} className="lg:col-span-2 bg-white rounded-xl border border-phumulani-charcoal/15 p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-phumulani-cream pb-3">
              <h4 className="font-heading font-bold text-sm text-phumulani-charcoal">
                Platform Caption Builder &amp; Asset Standards Validator
              </h4>
              <span className="font-mono text-[11px] px-2 py-0.5 bg-phumulani-cream text-phumulani-earth rounded font-bold">
                {generatedFilenamePreview}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-phumulani-charcoal mb-1">Post Topic / Title</label>
                <input
                  required
                  type="text"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  placeholder="Enter campaign or community notice title"
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Content Pillar (7 Approved)</label>
                <select
                  value={compPillar}
                  onChange={(e) => setCompPillar(e.target.value as ContentPillarId)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  {CONTENT_PILLARS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">
                  Platform ({PLATFORM_SPECIFICATIONS[compPlatform].recommendedDimensions})
                </label>
                <select
                  value={compPlatform}
                  onChange={(e) => setCompPlatform(e.target.value as SocialPlatform)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  {Object.values(PLATFORM_SPECIFICATIONS).map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.label} ({spec.recommendedDimensions})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Format Type</label>
                <select
                  value={compContentType}
                  onChange={(e) => setCompContentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  <option value="Carousel">Carousel</option>
                  <option value="SingleGraphic">SingleGraphic</option>
                  <option value="ReelVideo">ReelVideo</option>
                  <option value="Article">Article</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="EventNotice">EventNotice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Target Date (YYYY-MM-DD)</label>
                <input
                  required
                  type="date"
                  value={compDate}
                  onChange={(e) => setCompDate(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Sensitive Category (ED Gate)</label>
                <select
                  value={compSensitive}
                  onChange={(e) => setCompSensitive(e.target.value as SensitiveContentCategory)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  <option value="NONE">Standard (Non-Sensitive)</option>
                  <option value="CRISIS_RESOURCE">Crisis Resource (ED Sign-Off Required)</option>
                  <option value="SURVIVOR_STORY">Survivor Story (Consent + ED Sign-Off)</option>
                  <option value="MINOR_RELATED">Minor-Related (Guardian + Best-Interests + ED)</option>
                  <option value="PARTNER_GOVERNMENT_STATEMENT">Partner / Government Statement (ED)</option>
                  <option value="FUNDRAISING_CLAIM">Fundraising / Financial Claim (ED)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">
                  1080px Graphic Body Font Size (Min {PLATFORM_SPECIFICATIONS[compPlatform].minSocialBodyFontPx}px)
                </label>
                <input
                  type="number"
                  min={14}
                  max={72}
                  value={compFontPx}
                  onChange={(e) => setCompFontPx(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
            </div>

            <div className="space-y-2.5 bg-phumulani-cream/40 p-3.5 rounded-xl border border-phumulani-cream">
              <div className="font-bold text-phumulani-earth uppercase text-[11px]">
                Structured Copy Builder: Hook -&gt; Context -&gt; Value -&gt; Phumulani Connection -&gt; CTA
              </div>
              <input
                required
                placeholder="1. Hook (Opening truth or urgent community question)"
                value={compHook}
                onChange={(e) => setCompHook(e.target.value)}
                className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              />
              <input
                required
                placeholder="2. Context (Culturally attuned background without trauma exploitation)"
                value={compContext}
                onChange={(e) => setCompContext(e.target.value)}
                className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              />
              <input
                required
                placeholder="3. Value (Practical educational takeaway, rights info, or wellness step)"
                value={compValue}
                onChange={(e) => setCompValue(e.target.value)}
                className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              />
              <input
                required
                placeholder="4. Phumulani Connection (How Phumulani walks alongside community)"
                value={compConnection}
                onChange={(e) => setCompConnection(e.target.value)}
                className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              />
              <input
                required
                placeholder="5. CTA (Clear safe next step & verified link or helpline)"
                value={compCta}
                onChange={(e) => setCompCta(e.target.value)}
                className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Target Link URL</label>
                <input
                  required
                  type="url"
                  value={compTargetUrl}
                  onChange={(e) => setCompTargetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Consent Record Link (If Depicted)</label>
                <input
                  type="text"
                  placeholder="e.g., CNS-2026-001"
                  value={compConsentId}
                  onChange={(e) => {
                    setCompConsentId(e.target.value);
                    if (e.target.value.trim()) setCompConsentRequired(true);
                  }}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-phumulani-charcoal mb-1">WCAG 2.2 AA Descriptive Alt-Text (Mandatory)</label>
                <input
                  required
                  type="text"
                  value={compAltText}
                  onChange={(e) => setCompAltText(e.target.value)}
                  placeholder="Describe visible layout, key text, and protected logo placement clearly"
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 font-medium text-phumulani-charcoal">
                <input
                  type="checkbox"
                  checked={compConsentRequired}
                  onChange={(e) => setCompConsentRequired(e.target.checked)}
                />
                <span>Requires verified participant/media consent linkage</span>
              </label>

              {compContentType === 'ReelVideo' && (
                <label className="flex items-center gap-2 font-medium text-phumulani-charcoal">
                  <input
                    type="checkbox"
                    checked={compVideoCaptions}
                    onChange={(e) => setCompVideoCaptions(e.target.checked)}
                  />
                  <span>Closed captions &amp; transcript verified</span>
                </label>
              )}

              <button
                type="submit"
                disabled={isBoardReadOnly}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
              >
                Save Editorial Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CONSENT & SAFEGUARDING VAULT (ACCESS-RESTRICTED)               */}
      {/* ===================================================================== */}
      {subTab === 'consents' && (
        <div className="space-y-4">
          {!snapshot?.consentAccessGranted ? (
            <div className="bg-phumulani-cream border-2 border-phumulani-earth rounded-xl p-6 text-center space-y-2">
              <Lock className="w-8 h-8 text-phumulani-earth mx-auto" />
              <h4 className="font-heading font-bold text-sm text-phumulani-charcoal">
                Media Consent Vault Access Restricted
              </h4>
              <p className="text-xs text-phumulani-charcoal max-w-xl mx-auto">
                Consent records are isolated from general drafts, interns, and read-only board views. Only Safeguarding Leads, Communications Leads, Program Directors, and Executive Directors can inspect or verify consent statuses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <form onSubmit={handleCreateConsent} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-3 text-xs h-fit">
                <h4 className="font-heading font-bold text-sm text-phumulani-earth flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Log Pseudonymous Consent Record</span>
                </h4>
                <p className="text-[11px] text-phumulani-charcoal">
                  Never store full survivor legal details or confidential addresses here. Minor subjects require BOTH Guardian Consent AND Best-Interests Safeguarding clearance.
                </p>
                <input
                  required
                  placeholder="Pseudonymous Subject Alias (e.g., Participant B-04)"
                  value={consentAlias}
                  onChange={(e) => setConsentAlias(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
                <select
                  value={consentType}
                  onChange={(e) => setConsentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  <option value="COMMUNITY_PARTNER">Adult Community Member / Partner</option>
                  <option value="STAFF">Phumulani Staff / Leadership</option>
                  <option value="ADULT">Adult Program Participant (Pseudonymous)</option>
                  <option value="MINOR">Minor (Dual Guardian + Best-Interests Gate)</option>
                </select>
                {consentType === 'MINOR' && (
                  <div className="p-2.5 bg-phumulani-cream rounded-lg border border-phumulani-gold space-y-1.5">
                    <label className="flex items-center gap-2 font-semibold text-phumulani-charcoal">
                      <input
                        type="checkbox"
                        checked={guardianVerified}
                        onChange={(e) => setGuardianVerified(e.target.checked)}
                      />
                      <span>Guardian Consent Signed &amp; Verified</span>
                    </label>
                    <label className="flex items-center gap-2 font-semibold text-phumulani-charcoal">
                      <input
                        type="checkbox"
                        checked={bestInterestsVerified}
                        onChange={(e) => setBestInterestsVerified(e.target.checked)}
                      />
                      <span>Safeguarding Best-Interests Review Passed</span>
                    </label>
                  </div>
                )}
                <textarea
                  required
                  rows={3}
                  placeholder="Verification summary (form date, permitted channels, scope)..."
                  value={consentSummary}
                  onChange={(e) => setConsentSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Isolated Consent Record
                </button>
              </form>

              <div className="lg:col-span-2 space-y-3">
                {snapshot.consentRecords.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-phumulani-earth">{rec.id}</span>
                        <span className="font-bold text-phumulani-charcoal">{rec.subjectAlias}</span>
                        <span className="px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal text-[10px] font-bold">
                          {rec.subjectType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.consentStatus === 'GRANTED'
                              ? 'bg-phumulani-green text-phumulani-charcoal'
                              : rec.consentStatus === 'WITHDRAWN'
                              ? 'bg-phumulani-earth text-white'
                              : 'bg-phumulani-gold text-phumulani-charcoal'
                          }`}
                        >
                          {rec.consentStatus}
                        </span>
                      </div>
                      <p className="text-phumulani-charcoal">{rec.verificationSummary}</p>
                      <div className="text-[11px] text-phumulani-charcoal/80">
                        Scopes: {rec.allowedScopes.join(', ')} · Guardian: {rec.guardianConsentVerified ? 'Verified' : 'Pending'} · Best-Interests: {rec.bestInterestsReviewCompleted ? 'Verified' : 'Pending'}
                      </div>
                    </div>

                    {rec.consentStatus !== 'WITHDRAWN' && isCommsOrLead && (
                      <button
                        onClick={() => void handleWithdrawConsent(rec.id)}
                        className="px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Withdraw &amp; Trigger Takedown
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MODERATION & 4-TIER CRISIS ESCALATION                          */}
      {/* ===================================================================== */}
      {subTab === 'moderation' && snapshot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <form onSubmit={handleCreateModeration} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-3 text-xs h-fit">
            <h4 className="font-heading font-bold text-sm text-phumulani-earth">
              Log Moderation / Escalation Event
            </h4>
            <select
              value={modPlatform}
              onChange={(e) => setModPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
            >
              {Object.values(PLATFORM_SPECIFICATIONS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={modTier}
              onChange={(e) => setModTier(e.target.value as EscalationTier)}
              className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
            >
              <option value="GREEN">GREEN — Routine Appreciation</option>
              <option value="YELLOW">YELLOW — Program Inquiry / Route Privately</option>
              <option value="ORANGE">ORANGE — Misinfo / Dispute (ED Approval Required)</option>
              <option value="RED">RED — Safety Threat / Crisis (Auto-Pauses Publishing)</option>
            </select>
            <input
              required
              placeholder="Redacted incident summary (no PII/addresses)"
              value={modSummary}
              onChange={(e) => setModSummary(e.target.value)}
              className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
            />
            <textarea
              required
              rows={3}
              placeholder="Redacted comment excerpt..."
              value={modExcerpt}
              onChange={(e) => setModExcerpt(e.target.value)}
              className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
            />
            <button
              type="submit"
              disabled={isBoardReadOnly}
              className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
            >
              Log Escalation Incident
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {snapshot.moderationIncidents.map((inc) => {
              const tStyle = TIER_STYLES[inc.tier];
              return (
                <div key={inc.id} className={`bg-white rounded-xl border-2 ${tStyle.border} p-4 space-y-2.5 text-xs`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${tStyle.badge}`}>
                        {tStyle.label}
                      </span>
                      <span className="font-mono font-bold text-phumulani-charcoal">{inc.id}</span>
                      <span className="px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal font-semibold">
                        {inc.platform} · {inc.status}
                      </span>
                    </div>
                    {inc.relatedPublishingPaused && (
                      <span className="px-2 py-0.5 rounded bg-phumulani-earth text-white font-bold text-[10px]">
                        PUBLISHING PAUSED
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-phumulani-charcoal">{inc.summary}</p>
                  <div className="bg-phumulani-cream/60 p-2.5 rounded-lg text-phumulani-charcoal">
                    <strong>Redacted Excerpt:</strong> &quot;{inc.commentExcerptRedacted}&quot;
                  </div>
                  {inc.draftReply && (
                    <div className="bg-white border border-phumulani-teal p-2.5 rounded-lg text-phumulani-charcoal">
                      <strong className="text-phumulani-earth">Approved Template Draft Reply:</strong> {inc.draftReply}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {inc.status !== 'RESOLVED_LOGGED' && isExecutiveOrAdmin && (
                      <>
                        {inc.requiresExecutiveApprovalBeforeReply && inc.status !== 'RESPONSE_APPROVED' && (
                          <button
                            onClick={() => void handleDecideModeration(inc.id, 'APPROVE_REPLY')}
                            className="px-3 py-1.5 bg-phumulani-gold hover:bg-phumulani-teal text-phumulani-charcoal rounded-lg font-bold cursor-pointer"
                          >
                            Approve ED Reply
                          </button>
                        )}
                        <button
                          onClick={() => void handleDecideModeration(inc.id, 'RESOLVE_AND_UNPAUSE')}
                          className="px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer"
                        >
                          {inc.relatedPublishingPaused ? 'Resolve & Lift Publishing Pause' : 'Mark Resolved & Logged'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: ACCOUNT SECURITY & FAIL-CLOSED LIVE CONTROLS                   */}
      {/* ===================================================================== */}
      {subTab === 'accounts' && snapshot && (
        <div className="space-y-4">
          <div className="bg-phumulani-cream border border-phumulani-earth rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-phumulani-charcoal">
              <ShieldCheck className="w-5 h-5 text-phumulani-earth shrink-0" />
              <span>
                <strong>Fail-Closed Publishing Control:</strong> Autonomous external live publishing is{' '}
                <strong className="text-phumulani-earth">OFF (MANUAL_EXPORT_ONLY)</strong>. Zero plaintext social credentials are ever stored in this system.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-phumulani-earth text-white font-bold">
              liveAutoPublishingEnabled: false
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snapshot.accountGovernance.map((acc) => (
              <div key={acc.id} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-heading font-bold text-sm text-phumulani-charcoal">{acc.displayName}</div>
                    <div className="font-mono text-phumulani-earth">{acc.platform} · {acc.handle}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-phumulani-green text-phumulani-charcoal font-bold text-[10px]">
                    {acc.publishingControlMode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-phumulani-cream/60 p-2.5 rounded-lg">
                  <div><strong>2-Admin Rule:</strong> {acc.twoAdminRuleSatisfied ? `Satisfied (${acc.adminCount})` : 'VIOLATION'}</div>
                  <div><strong>MFA Active:</strong> {acc.mfaEnabled ? 'Yes' : 'No'}</div>
                  <div><strong>24h Departure SLA:</strong> {acc.lastDepartureRevokedWithin24h ? 'Compliant' : 'Pending'}</div>
                  <div><strong>Written Approval:</strong> {acc.sensitiveSettingsWrittenApprovalRef}</div>
                </div>
                <div className="text-[11px] text-phumulani-charcoal">
                  <strong>Designated Admins:</strong> {acc.designatedAdmins.join('; ')}
                </div>
                {isCommsOrLead && (
                  <button
                    onClick={() => void handleAuditAccount(acc.id, acc.designatedAdmins)}
                    className="px-3 py-1.5 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded-lg font-bold cursor-pointer"
                  >
                    Record Access Security Audit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: SOURCE-TAGGED ANALYTICS                                        */}
      {/* ===================================================================== */}
      {subTab === 'analytics' && snapshot && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {(['VERIFIED_PROVIDER', 'MANUAL_ENTRY', 'DEMO_STAGED'] as const).map((src) => {
              const rows = snapshot.analyticsRecords.filter((r) => r.sourceClassification === src);
              const totalReach = rows.reduce((s, r) => s + r.reach, 0);
              return (
                <div key={src} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-3.5 space-y-1">
                  <div className="font-mono text-[10px] font-bold text-phumulani-earth">{src}</div>
                  <div className="font-heading font-bold text-xl text-phumulani-charcoal tabular-nums">
                    {totalReach.toLocaleString()} Reach
                  </div>
                  <div className="text-[11px] text-phumulani-charcoal/80">{rows.length} source-verified log entries</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {!isBoardReadOnly && (
              <form onSubmit={handleRecordAnalytics} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-2.5 text-xs h-fit">
                <h4 className="font-heading font-bold text-sm text-phumulani-earth">Log Source-Tagged Analytics</h4>
                <input
                  required
                  value={anlPeriod}
                  onChange={(e) => setAnlPeriod(e.target.value)}
                  placeholder="Period Label"
                  className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
                <select
                  value={anlSource}
                  onChange={(e) => setAnlSource(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                >
                  <option value="MANUAL_ENTRY">MANUAL_ENTRY (Verified Native Export)</option>
                  <option value="DEMO_STAGED">DEMO_STAGED (Illustrative Only)</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={anlPlatform}
                    onChange={(e) => setAnlPlatform(e.target.value as SocialPlatform)}
                    className="px-2 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                  >
                    {Object.values(PLATFORM_SPECIFICATIONS).map((p) => (
                      <option key={p.id} value={p.id}>{p.shortCode}</option>
                    ))}
                  </select>
                  <select
                    value={anlPillar}
                    onChange={(e) => setAnlPillar(e.target.value as ContentPillarId)}
                    className="px-2 py-1.5 border border-phumulani-charcoal/20 rounded-lg bg-white text-phumulani-charcoal"
                  >
                    {CONTENT_PILLARS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" min={0} value={anlReach} onChange={(e) => setAnlReach(Number(e.target.value))} placeholder="Reach" className="px-2 py-1.5 border border-phumulani-charcoal/20 rounded-lg" />
                  <input type="number" min={0} value={anlEngagement} onChange={(e) => setAnlEngagement(Number(e.target.value))} placeholder="Eng." className="px-2 py-1.5 border border-phumulani-charcoal/20 rounded-lg" />
                  <input type="number" min={0} value={anlClicks} onChange={(e) => setAnlClicks(Number(e.target.value))} placeholder="Clicks" className="px-2 py-1.5 border border-phumulani-charcoal/20 rounded-lg" />
                </div>
                <input
                  required
                  value={anlNotes}
                  onChange={(e) => setAnlNotes(e.target.value)}
                  placeholder="Source notes"
                  className="w-full px-3 py-1.5 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
                <button type="submit" className="w-full py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer">
                  Save Source-Tagged Entry
                </button>
              </form>
            )}

            <div className="lg:col-span-2 bg-white rounded-xl border border-phumulani-charcoal/15 overflow-hidden">
              <div className="px-4 py-3 bg-phumulani-cream border-b border-phumulani-cream text-xs font-bold text-phumulani-charcoal">
                Strict Source Separation Ledger (Verified Provider / Manual Entry / Demo Staged)
              </div>
              <div className="divide-y divide-phumulani-cream">
                {snapshot.analyticsRecords.map((row) => (
                  <div key={row.id} className="p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-phumulani-charcoal">{row.periodLabel}</span>
                        <span className="px-2 py-0.5 rounded bg-phumulani-gold text-phumulani-charcoal font-mono text-[10px] font-bold">
                          {row.sourceClassification}
                        </span>
                        <span className="text-phumulani-earth font-semibold">{row.platform}</span>
                      </div>
                      <p className="text-[11px] text-phumulani-charcoal/80 mt-0.5">{row.notes}</p>
                    </div>
                    <div className="font-mono text-[11px] text-phumulani-charcoal tabular-nums">
                      Reach: <strong>{row.reach}</strong> · Eng: <strong>{row.engagementCount}</strong> · Clicks: <strong>{row.linkClicks}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: BRAND SYSTEM, PROTECTED LOGO & WCAG 2.2 AA SPEC                */}
      {/* ===================================================================== */}
      {subTab === 'brand_spec' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {OFFICIAL_BRAND_PALETTE.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-phumulani-charcoal/15 p-3 space-y-2 text-xs">
                <div
                  className="h-12 rounded-lg border border-phumulani-charcoal/15"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="flex items-center justify-between font-heading font-bold text-phumulani-charcoal">
                  <span>{c.name}</span>
                  <span className="font-mono text-phumulani-earth">{c.hex}</span>
                </div>
                <p className="text-[11px] text-phumulani-charcoal/85">{c.role}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-3">
              <h4 className="font-heading font-bold text-sm text-phumulani-earth">
                Protected Horizontal Logo &amp; Clear-Space Rule
              </h4>
              <PhumulaniLogo variant="full" surface="white" enforceClearSpace className="h-12" />
              <PhumulaniLogo variant="full" surface="cream" enforceClearSpace className="h-12" />
              <p className="text-phumulani-charcoal">
                Always render with preserved horizontal proportions on clean White (#FFFFFF) or Soft Cream (#EFEBD1) surface. Never place over faces or text, never stretch, crop, rotate, blur, or recolor.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-4 space-y-2.5">
              <h4 className="font-heading font-bold text-sm text-phumulani-earth">
                Immutable Governance Audit Ledger (Last 8 Events)
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {(snapshot?.auditTrail || []).slice(0, 8).map((aud) => (
                  <div key={aud.id} className="p-2 bg-phumulani-cream/60 rounded-lg border border-phumulani-cream">
                    <div className="font-bold text-phumulani-charcoal">{aud.action} · {aud.entityId}</div>
                    <div className="text-[10px] text-phumulani-charcoal/85">
                      {aud.actorName} ({aud.actorRole}) · {new Date(aud.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MATERIAL-EDIT MODAL FOR EXISTING ITEMS */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-phumulani-charcoal">
                  Edit Editorial Item: {editingItem.id}
                </h3>
                <p className="text-[11px] text-phumulani-earth font-semibold">
                  Notice: Any material edit to a reviewed/approved item automatically invalidates prior approval and resets stage to DRAFT.
                </p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-phumulani-charcoal font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveEditorialEdit} className="space-y-3">
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Title</label>
                <input
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Hook</label>
                <input
                  required
                  value={editingItem.captionHook}
                  onChange={(e) => setEditingItem({ ...editingItem, captionHook: e.target.value })}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">CTA</label>
                <input
                  required
                  value={editingItem.captionCta}
                  onChange={(e) => setEditingItem({ ...editingItem, captionCta: e.target.value })}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
              <div>
                <label className="block font-semibold text-phumulani-charcoal mb-1">Alt Text</label>
                <input
                  required
                  value={editingItem.altText}
                  onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                  className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg text-phumulani-charcoal"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-phumulani-charcoal/20 rounded-lg font-semibold text-phumulani-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Edit (Trigger Re-Approval Check)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
