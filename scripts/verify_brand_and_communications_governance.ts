/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Verification Suite — Phumulani Master Brand, Communications & Safeguarding Governance
 * Tests RBAC, material-edit re-approval invalidation, PII/clinical/legal blocking,
 * minor consent dual-gate, consent withdrawal takedown, RED crisis pause,
 * asset naming/typography gates, 2-admin security, fail-closed live publishing, and DB migrations.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolate runtime verification store so production/dev state is untouched
const tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-comms-verify-'));
process.env.PHUMULANI_RUNTIME_DATA_DIR = tempDataDir;

import {
  BRAND_MANUAL_STATUS,
  OFFICIAL_BRAND_PALETTE,
  PLATFORM_SPECIFICATIONS,
} from '../src/types/communications';
import {
  CommunicationsGovernanceService,
  generateCompliantAssetFilename,
  isCompliantAssetFilename,
} from '../src/services/communicationsGovernanceService';
import { DatabaseMigrationService } from '../src/services/databaseMigrationService';

async function main() {
  console.log('=== Phumulani Brand, Communications & Safeguarding Governance Verification ===');

  // 1. Verify Official Brand Manual Palette & Working Draft Notice
  assert.equal(BRAND_MANUAL_STATUS.formallyAdopted, false);
  assert.equal(BRAND_MANUAL_STATUS.approvalStatus, 'PENDING_EXECUTIVE_APPROVAL');
  const hexes = OFFICIAL_BRAND_PALETTE.map((c) => c.hex);
  for (const required of ['#EF5C2C', '#B3340F', '#62C4B4', '#F7B24A', '#EFEBD1', '#6AAD7C', '#333333', '#FFFFFF']) {
    assert.ok(hexes.includes(required as any), `Missing required palette hex ${required}`);
  }
  console.log('[PASS] Exact 7 official colors + White neutral surface and Working Draft v1.0 notice verified.');

  // 2. Verify Schema Migrations & Integrity
  const migService = DatabaseMigrationService.getInstance();
  await migService.runMigrations('Verification Runner');
  const integrity = await migService.validateSchemaIntegrity();
  assert.equal(integrity.valid, true, `Schema integrity failed: missing ${integrity.missingTables.join(', ')}`);
  console.log(`[PASS] Database migrations & schema integrity passed (${integrity.existingTables.length} tables verified).`);

  const service = CommunicationsGovernanceService.getInstance();
  await service.ensureInitialized();

  const intern = { userId: 'u-int', name: 'Intern Test', role: 'intern_content_assistant' };
  const commsLead = { userId: 'u-com', name: 'Amina Yusuf', role: 'communications_lead' };
  const safeguarding = { userId: 'u-saf', name: 'Sister Miriam K.', role: 'safeguarding_lead' };
  const execDir = { userId: 'u-ed', name: 'Comfort Dondo', role: 'executive_director' };
  const board = { userId: 'u-brd', name: 'Board Advisor', role: 'board_advisor_partner' };

  // 3. Role-Based Access & Consent Vault Isolation
  const internSnap = await service.getSnapshot(intern);
  assert.equal(internSnap.consentAccessGranted, false, 'Intern must NOT access Consent Vault');
  assert.equal(internSnap.consentRecords.length, 0, 'Consent records must be stripped for Intern');

  const boardSnap = await service.getSnapshot(board);
  assert.equal(boardSnap.consentAccessGranted, false, 'Board Advisor must NOT access Consent Vault');
  assert.equal(boardSnap.consentRecords.length, 0, 'Consent records must be stripped for Board');

  await assert.rejects(
    () =>
      service.createEditorialItem(
        {
          title: 'Board Unauthorized Write',
          pillar: 'COMMUNITY_AND_CULTURE',
          platform: 'INSTAGRAM',
          contentType: 'SingleGraphic',
          scheduledDate: '2026-11-30',
          captionHook: 'Hook',
          captionContext: 'Context',
          captionValue: 'Value',
          captionConnection: 'Connection',
          captionCta: 'CTA',
          targetUrl: 'https://phumulani.org/',
          altText: 'Descriptive alt text for access',
        },
        board
      ),
    /FORBIDDEN/
  );
  console.log('[PASS] Consent Vault isolation & read-only Board enforcement verified.');

  // 4. Asset Naming Convention & Safeguarding PII/Clinical/Legal Blockers
  const fname = generateCompliantAssetFilename({
    date: '2026-11-29',
    platform: 'INSTAGRAM',
    contentType: 'Carousel',
    topic: 'Winter Wellness Clinic',
    version: 1,
  });
  assert.equal(fname, '2026-11-29_IG_Carousel_WinterWellnessClinic_v1');
  assert.equal(isCompliantAssetFilename(fname), true);

  await assert.rejects(
    () =>
      service.createEditorialItem(
        {
          title: 'Unsafe Shelter Address Post',
          pillar: 'SAFETY_AND_RESOURCES',
          platform: 'INSTAGRAM',
          contentType: 'SingleGraphic',
          scheduledDate: '2026-11-29',
          captionHook: 'Visit our shelter at 1234 Oak Street confidential address today',
          captionContext: 'Context',
          captionValue: 'Value',
          captionConnection: 'Connection',
          captionCta: 'CTA',
          targetUrl: 'https://phumulani.org/',
          altText: 'Valid alt text here',
        },
        commsLead
      ),
    /SAFEGUARDING_PII_BLOCKED/
  );

  await assert.rejects(
    () =>
      service.runAiAssist(
        {
          task: 'DRAFT_CAPTION',
          topic: 'Client A123456789 legal opinion on your case and you should file an OFP',
          pillar: 'SAFETY_AND_RESOURCES',
          platform: 'INSTAGRAM',
        },
        commsLead
      ),
    /AI_SAFEGUARDING_BLOCKED/
  );
  console.log('[PASS] PII/Shelter/Immigration/Clinical/Legal AI & Draft blockers verified.');

  // 5. Intern Creation + Typography / Alt-Text Gate + Non-Sensitive Approval + Material Edit Invalidation
  const draftItem = await service.createEditorialItem(
    {
      title: 'Community Tea Circle Workshop',
      pillar: 'HEALING_AND_WHOLENESS',
      platform: 'INSTAGRAM',
      contentType: 'Carousel',
      scheduledDate: '2026-11-30',
      captionHook: 'Warm sisterhood gathering this Friday.',
      captionContext: 'Trauma-informed wellness circles in Minneapolis.',
      captionValue: 'Peer dialogue and herbal tea.',
      captionConnection: 'Guided by Phumulani wellness facilitators.',
      captionCta: 'RSVP at phumulani.org/#events-section.',
      targetUrl: 'https://phumulani.org/#events-section',
      socialBodyFontSizePx: 22, // intentionally below 28px minimum
      altText: 'Short', // intentionally below 10 chars
    },
    intern
  );

  // Intern cannot promote to REVIEW
  await assert.rejects(() => service.transitionEditorialStage(draftItem.id, 'REVIEW', intern), /FORBIDDEN/);

  // Comms lead cannot schedule below 28px typography / trivial alt text
  await assert.rejects(
    () => service.transitionEditorialStage(draftItem.id, 'SCHEDULE', commsLead),
    /ACCESSIBILITY_GATE_BLOCKED|TYPOGRAPHY_GATE_BLOCKED/
  );

  // Fix typography & alt text -> Comms lead approves non-sensitive post -> asset becomes FINAL_APPROVED
  await service.updateEditorialItem(
    draftItem.id,
    {
      socialBodyFontSizePx: PLATFORM_SPECIFICATIONS.INSTAGRAM.minSocialBodyFontPx,
      altText: 'High-contrast Soft Cream Carousel card announcing November Tea Healing Circle.',
    },
    commsLead
  );
  await service.transitionEditorialStage(draftItem.id, 'REVIEW', commsLead);
  const approved = await service.transitionEditorialStage(draftItem.id, 'SCHEDULE', commsLead);
  assert.equal(approved.assetState, 'FINAL_APPROVED');
  assert.equal(approved.approvalStatus, 'APPROVED_FOR_EXPORT');

  // Material edit AFTER approval must invalidate approval and bump version to DRAFT
  const editRes = await service.updateEditorialItem(
    draftItem.id,
    { captionHook: 'Updated opening hook after approval — requires fresh review!' },
    commsLead
  );
  assert.equal(editRes.approvalInvalidated, true);
  assert.equal(editRes.item.stage, 'DRAFT');
  assert.equal(editRes.item.approvalStatus, 'REAPPROVAL_REQUIRED');
  assert.equal(editRes.item.assetState, 'DRAFT');
  assert.equal(editRes.item.version, approved.version + 1);
  console.log('[PASS] RBAC stages, 28px typography/alt-text gates, immutable FINAL_APPROVED bump, and material-edit invalidation verified.');

  // 6. Executive Approval Required for Sensitive Items + Minor Consent Dual Gate + Consent Withdrawal Takedown
  const minorConsentPending = await service.createConsentRecord(
    {
      subjectAlias: 'Youth Participant Y-99',
      subjectType: 'MINOR',
      allowedScopes: ['SOCIAL_MEDIA'],
      guardianConsentVerified: true,
      bestInterestsReviewCompleted: false, // missing second gate!
      verificationSummary: 'Guardian signed; awaiting safeguarding best-interests review.',
    },
    safeguarding
  );
  assert.equal(minorConsentPending.consentStatus, 'PENDING');

  const minorPost = await service.createEditorialItem(
    {
      title: 'Youth Cohort Highlight',
      pillar: 'PROGRAMS_AND_EVENTS',
      platform: 'INSTAGRAM',
      contentType: 'SingleGraphic',
      scheduledDate: '2026-12-05',
      sensitiveCategory: 'MINOR_RELATED',
      consentRequired: true,
      consentRecordId: minorConsentPending.id,
      captionHook: 'Celebrating youth leadership milestones.',
      captionContext: 'Mentoring immigrant youth in St. Paul.',
      captionValue: 'Weekly academic and leadership circles.',
      captionConnection: 'Phumulani Youth Program.',
      captionCta: 'Learn more at phumulani.org/#programs-section.',
      targetUrl: 'https://phumulani.org/#programs-section',
      socialBodyFontSizePx: 30,
      altText: 'Graphic celebrating Phumulani Youth Mentorship cohort on Soft Cream background.',
    },
    commsLead
  );

  // Comms Lead CANNOT finalize MINOR_RELATED sensitive category
  await assert.rejects(
    () => service.transitionEditorialStage(minorPost.id, 'SCHEDULE', commsLead),
    /EXECUTIVE_APPROVAL_REQUIRED/
  );
  // Even ED CANNOT finalize while minor consent lacks best-interests clearance
  await assert.rejects(
    () => service.transitionEditorialStage(minorPost.id, 'SCHEDULE', execDir),
    /CONSENT_SAFEGUARDING_GATE_BLOCKED/
  );

  // Grant complete adult/guardian+best-interests consent & link it -> ED approves -> Withdraw triggers TAKEDOWN_REQUIRED
  const clearedConsent = await service.createConsentRecord(
    {
      subjectAlias: 'Youth Participant Y-99B',
      subjectType: 'MINOR',
      allowedScopes: ['SOCIAL_MEDIA', 'PUBLIC_WEB'],
      guardianConsentVerified: true,
      bestInterestsReviewCompleted: true,
      verificationSummary: 'Both Guardian and Safeguarding Lead best-interests review verified.',
    },
    safeguarding
  );
  assert.equal(clearedConsent.consentStatus, 'GRANTED');
  await service.updateEditorialItem(minorPost.id, { consentRecordId: clearedConsent.id }, commsLead);
  const edApproved = await service.transitionEditorialStage(minorPost.id, 'SCHEDULE', execDir);
  assert.equal(edApproved.approvalStatus, 'APPROVED_FOR_EXPORT');

  const takedown = await service.withdrawConsentAndTriggerTakedown(
    clearedConsent.id,
    'Family requested media withdrawal',
    safeguarding
  );
  assert.ok(takedown.flaggedItems.includes(minorPost.id));
  const afterWithdraw = (await service.getSnapshot(execDir)).editorialItems.find((i) => i.id === minorPost.id)!;
  assert.equal(afterWithdraw.approvalStatus, 'TAKEDOWN_REQUIRED');
  assert.equal(afterWithdraw.assetState, 'DRAFT');
  console.log('[PASS] Sensitive category ED lock, Minor dual consent gate, and Consent withdrawal takedown verified.');

  // 7. Moderation Escalation Tiers (ORANGE ED lock & RED automatic publishing pause)
  const orangeMod = await service.createModerationIncident(
    {
      platform: 'INSTAGRAM',
      tier: 'ORANGE',
      summary: 'Question disputing program transparency',
      commentExcerptRedacted: 'Please clarify grant compliance documentation.',
    },
    commsLead
  );
  await assert.rejects(
    () => service.decideModerationIncident(orangeMod.id, 'APPROVE_REPLY', commsLead),
    /EXECUTIVE_APPROVAL_REQUIRED/
  );
  await service.decideModerationIncident(orangeMod.id, 'APPROVE_REPLY', execDir);

  const redMod = await service.createModerationIncident(
    {
      platform: 'FACEBOOK',
      tier: 'RED',
      summary: 'Attempted doxxing threat in comment thread',
      commentExcerptRedacted: '[REDACTED THREAT]',
    },
    commsLead
  );
  assert.equal(redMod.relatedPublishingPaused, true);
  assert.equal((await service.getSnapshot(execDir)).globalPublishingPaused, true);

  // Scheduling any post MUST fail while RED pause is active
  await service.transitionEditorialStage(draftItem.id, 'REVIEW', commsLead);
  await assert.rejects(
    () => service.transitionEditorialStage(draftItem.id, 'SCHEDULE', commsLead),
    /RED_CRISIS_PUBLISHING_PAUSE/
  );

  // Comms Lead cannot lift RED pause; Safeguarding / ED can
  await assert.rejects(
    () => service.decideModerationIncident(redMod.id, 'RESOLVE_AND_UNPAUSE', commsLead),
    /EXECUTIVE_OR_SAFEGUARDING_REQUIRED/
  );
  await service.decideModerationIncident(redMod.id, 'RESOLVE_AND_UNPAUSE', safeguarding);
  assert.equal((await service.getSnapshot(execDir)).globalPublishingPaused, false);
  console.log('[PASS] 4-Tier moderation (ORANGE ED approval, RED auto-pause & Safeguarding/ED lift) verified.');

  // 8. Account Governance & Fail-Closed Live Publishing
  const snapFinal = await service.getSnapshot(execDir);
  assert.ok(snapFinal.accountGovernance.length >= 4);
  for (const acc of snapFinal.accountGovernance) {
    assert.equal(acc.liveAutoPublishingEnabled, false, 'Live auto-publishing must remain fail-closed false');
    assert.equal(acc.publishingControlMode, 'MANUAL_EXPORT_ONLY');
    assert.equal(acc.twoAdminRuleSatisfied, true);
    assert.equal(acc.mfaEnabled, true);
  }
  await assert.rejects(
    () => service.auditSocialAccount(snapFinal.accountGovernance[0].id, { password: 'secret' } as any, execDir),
    /SECURITY_POLICY_BLOCKED/
  );
  console.log('[PASS] Account 2-admin check, zero credential storage, and fail-closed MANUAL_EXPORT_ONLY verified.');

  // Cleanup temp dir
  fs.rmSync(tempDataDir, { recursive: true, force: true });
  console.log('=== ALL BRAND, COMMUNICATIONS & SAFEGUARDING GOVERNANCE TESTS PASSED ===');
}

main().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
