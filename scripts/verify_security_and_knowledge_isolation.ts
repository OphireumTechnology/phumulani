/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Security & Knowledge Isolation Verification Suite
 * 
 * Tests:
 * 1. Unauthorized knowledge access & RBAC enforcement (PUBLIC, DONOR_FACING, INTERNAL_CONFIDENTIAL, VAWA)
 * 2. Browser bundle leakage prevention (no fs/path or server service imports in client components)
 * 3. Institutional source approval audit (provisional benchmark labeling, no unearned authentic claims)
 * 4. Stale financial records & expiration detection (reviewExpirationDate lifecycle)
 * 5. Anti-hallucination & fabricated funding refusal
 * 6. Browser startup safety & isomorphic resilience (no process.cwd exceptions)
 * 7. Non-delegable donor safeguards (fail-closed, 15% indirect cap, opt-out enforcement)
 */

import * as fs from 'fs';
import * as path from 'path';
import { localKnowledgeRetrievalService } from '../src/services/localKnowledgeRetrievalService';
import { phumulaniAiAgentService } from '../src/services/phumulaniAiAgentService';
import { SourceApprovalStatus, AccessClassification } from '../src/types/verifiedKnowledge';

interface TestResult {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const testResults: TestResult[] = [];

function assertTest(id: string, category: string, name: string, condition: boolean, details: string) {
  testResults.push({ id, category, name, passed: condition, details });
  const mark = condition ? '✓ PASS' : '✗ FAIL';
  console.log(`[${mark}] ${id}: ${name}`);
  if (!condition) {
    console.error(`      Details: ${details}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================================');
  console.log(' PHUMULANI AI — SECURITY, RBAC & KNOWLEDGE ISOLATION TEST SUITE');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // TEST GROUP 1: Role-Based Access Control (RBAC) & Knowledge Security
  // -------------------------------------------------------------------------
  console.log('--- 1. RBAC & Knowledge Classification Enforcement ---');

  // 1.1 Public role should receive ONLY PUBLIC documents
  const publicDocs = localKnowledgeRetrievalService.getAuthorizedDocuments('public');
  const nonPublicInPublic = publicDocs.filter(d => d.metadata.accessClassification !== 'PUBLIC');
  assertTest(
    'SEC-RBAC-01',
    'RBAC',
    'Public role restricted strictly to PUBLIC classified knowledge',
    nonPublicInPublic.length === 0 && publicDocs.length > 0,
    `Found ${nonPublicInPublic.length} non-public documents accessible to public role.`
  );

  // 1.2 Staff role receives PUBLIC and DONOR_FACING, but NOT INTERNAL_CONFIDENTIAL
  const staffDocs = localKnowledgeRetrievalService.getAuthorizedDocuments('staff');
  const confidentialInStaff = staffDocs.filter(d => d.metadata.accessClassification === 'INTERNAL_CONFIDENTIAL');
  const donorFacingInStaff = staffDocs.filter(d => d.metadata.accessClassification === 'DONOR_FACING');
  assertTest(
    'SEC-RBAC-02',
    'RBAC',
    'Staff role cannot access INTERNAL_CONFIDENTIAL records',
    confidentialInStaff.length === 0 && donorFacingInStaff.length > 0,
    `Found ${confidentialInStaff.length} confidential documents leaked to staff role.`
  );

  // 1.3 Executive/Admin role can access INTERNAL_CONFIDENTIAL
  const execDocs = localKnowledgeRetrievalService.getAuthorizedDocuments('executive');
  const confidentialInExec = execDocs.filter(d => d.metadata.accessClassification === 'INTERNAL_CONFIDENTIAL');
  assertTest(
    'SEC-RBAC-03',
    'RBAC',
    'Executive role can access INTERNAL_CONFIDENTIAL records',
    confidentialInExec.length > 0,
    `Executive role retrieved 0 confidential documents.`
  );

  // 1.4 VAWA_PROTECTED_RESTRICTED records are completely blocked from general queries
  const vawaQuery = localKnowledgeRetrievalService.retrieveRelevantKnowledge({
    query: 'safehouse emergency shelter client domestic violence confidential location',
    userRole: 'executive',
  });
  const hasVawaLeaked = vawaQuery.documents.some(
    d => d.metadata.accessClassification === ('VAWA_PROTECTED_RESTRICTED' as AccessClassification)
  );
  assertTest(
    'SEC-RBAC-04',
    'RBAC',
    'VAWA_PROTECTED_RESTRICTED documents blocked from general retrieval queries',
    !hasVawaLeaked,
    `VAWA restricted record was returned in general retrieval query.`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 2: Browser Bundle Isolation & Server Service Separation
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Browser Bundle Isolation & Leakage Prevention ---');

  const clientComponentPath = path.resolve(
    process.cwd(),
    'src/components/email/PhumulaniAiFundraisingCenter.tsx'
  );
  const clientContent = fs.readFileSync(clientComponentPath, 'utf8');

  // 2.1 UI Component must not import Node 'fs' or 'path'
  const hasNodeFs = /import\s+.*\s+from\s+['"]fs['"]/.test(clientContent);
  const hasNodePath = /import\s+.*\s+from\s+['"]path['"]/.test(clientContent);
  assertTest(
    'SEC-BUNDLE-01',
    'BundleIsolation',
    'Client UI component does not import Node fs or path modules',
    !hasNodeFs && !hasNodePath,
    `Found Node built-ins: fs=${hasNodeFs}, path=${hasNodePath}`
  );

  // 2.2 UI Component must not directly import server services
  const hasDirectAgentImport = /import\s+.*phumulaniAiAgentService.*from/.test(clientContent);
  const hasDirectRetrievalImport = /import\s+.*localKnowledgeRetrievalService.*from/.test(clientContent);
  assertTest(
    'SEC-BUNDLE-02',
    'BundleIsolation',
    'Client UI does not import server-side agent or retrieval services directly',
    !hasDirectAgentImport && !hasDirectRetrievalImport,
    `Direct server imports found: agent=${hasDirectAgentImport}, retrieval=${hasDirectRetrievalImport}`
  );

  // 2.3 UI Component uses phumulaniApiClient exclusively
  const usesApiClient = /import\s+.*phumulaniApiClient.*from/.test(clientContent);
  assertTest(
    'SEC-BUNDLE-03',
    'BundleIsolation',
    'Client UI utilizes phumulaniApiClient for all server communications',
    usesApiClient,
    'phumulaniApiClient import missing from client component.'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 3: Institutional Source Approval Verification
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Institutional Source Approval Audit ---');

  const auditReport = localKnowledgeRetrievalService.getSourceApprovalAuditReport();
  const items = auditReport.items || auditReport.auditItems;

  // 3.1 All seeded development records must be labeled PROVISIONAL_DEVELOPMENT_BENCHMARK
  assertTest(
    'SEC-SRC-01',
    'SourceApproval',
    'Seed data flagged as PROVISIONAL_DEVELOPMENT_BENCHMARK (not unearned authentic)',
    auditReport.provisionalBenchmarkCount >= 7,
    `Provisional benchmark count: ${auditReport.provisionalBenchmarkCount} (expected >= 7)`
  );

  // 3.2 None of the unratified development seed items are falsely marked BOARD_VERIFIED_AUTHENTIC
  const unverifiedMarkedAuthentic = items.filter(
    i => i.isProvisionalBenchmark && i.sourceApprovalStatus === 'BOARD_VERIFIED_AUTHENTIC'
  );
  assertTest(
    'SEC-SRC-02',
    'SourceApproval',
    'No provisional benchmark records falsely claim BOARD_VERIFIED_AUTHENTIC',
    unverifiedMarkedAuthentic.length === 0,
    `Found ${unverifiedMarkedAuthentic.length} provisional items claiming board verification.`
  );

  // 3.3 Audit report includes explicit ratification guidelines
  const hasPolicyText = (auditReport.summary && auditReport.summary.includes('Provisional Development Benchmarks')) &&
    (auditReport.verificationPolicy && auditReport.verificationPolicy.length > 0);
  assertTest(
    'SEC-SRC-03',
    'SourceApproval',
    'Source approval audit report provides institutional verification policy',
    Boolean(hasPolicyText),
    `Verification policy text missing or malformed in audit report.`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 4: Stale Financial Records & Expiration Tracking
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Stale Financial Records & Expiration Tracking ---');

  // Check audit items for expiration flags
  const expiredItems = items.filter(i => i.isExpired);
  assertTest(
    'SEC-EXP-01',
    'ExpirationTracking',
    'Records past reviewExpirationDate are identified as expired',
    expiredItems.length > 0,
    `Found ${expiredItems.length} expired items (at least 1 test item was backdated).`
  );

  const reverificationRequiredItems = items.filter(i => i.requiresReverification);
  assertTest(
    'SEC-EXP-02',
    'ExpirationTracking',
    'Expired records require institutional re-verification prior to final submission',
    reverificationRequiredItems.length === expiredItems.length && expiredItems.length > 0,
    `Mismatch: ${expiredItems.length} expired vs ${reverificationRequiredItems.length} requiring reverification.`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 5: Anti-Hallucination & Fabricated Funding Refusal
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Anti-Hallucination & Fabricated Funding Refusal ---');

  // Query for non-existent / fabricated grant amounts
  const hallucinationQuery = localKnowledgeRetrievalService.retrieveRelevantKnowledge({
    query: 'Unapproved $5,000,000 corporate yacht endowment purchase',
    userRole: 'staff',
  });
  assertTest(
    'SEC-ANTI-01',
    'AntiFabrication',
    'Unverified / non-existent funding claims return no direct source match',
    !hallucinationQuery.hasVerifiedFacts || hallucinationQuery.documents.length === 0,
    `Direct source match erroneously returned for unapproved yacht purchase.`
  );

  // Verify anti-hallucination warning present when sources lack grounding
  const hasGroundingNotice = Boolean(
    hallucinationQuery.missingFactNotice ||
    hallucinationQuery.contextText.includes('RULE: You must state that verified information is not available')
  );
  assertTest(
    'SEC-ANTI-02',
    'AntiFabrication',
    'Knowledge retrieval results include institutional source verification notice',
    hasGroundingNotice,
    `Missing source verification notice in query result.`
  );

  // Direct and indirect cost calculation must enforce 15% MTDC cap
  const proposal = await phumulaniAiAgentService.generateFundingProposal({
    targetGrantmaker: 'The Saint Paul & Minnesota Foundation',
    programId: 'PROG-002',
    requestedAmount: 50000,
    author: 'Development Director',
  });
  const directItem = proposal.budgetBreakdown.find(b => b.item.startsWith('Direct Programmatic'));
  const indirectItem = proposal.budgetBreakdown.find(b => !b.isDirect);
  const directCosts = directItem?.amount || 0;
  const indirectCosts = indirectItem?.amount || 0;
  const computedIndirectRate = directCosts > 0 ? (indirectCosts / directCosts) : 1;
  const indirectIsCompliant =
    computedIndirectRate <= 0.1501 &&
    proposal.complianceNotes.includes('15% cap verified');
  assertTest(
    'SEC-ANTI-03',
    'NonDelegableSafeguard',
    'Proposal budget adheres strictly to 15% MTDC indirect cost ceiling',
    indirectIsCompliant,
    `Indirect cost rate is ${computedIndirectRate.toFixed(4)} (Direct: $${directCosts}, Indirect: $${indirectCosts})`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 6: Browser Startup Safety & Isomorphic Resilience
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Browser Startup Safety & Isomorphic Resilience ---');

  let threwException = false;
  try {
    const originalCwd = process.cwd;
    // Mock browser environment where process.cwd is undefined
    (process as any).cwd = undefined;
    
    // Call refreshLocalIndex under mock non-Node environment
    localKnowledgeRetrievalService.refreshLocalIndex();

    // Restore cwd
    process.cwd = originalCwd;
  } catch (err) {
    threwException = true;
    console.error('Caught exception during browser-like simulation:', err);
  }

  assertTest(
    'SEC-ISO-01',
    'IsomorphicSafety',
    'Service handles missing process.cwd without throwing browser runtime exception',
    !threwException,
    'Calling refreshLocalIndex threw an exception when process.cwd was absent.'
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 7: Email Command Center Safeguards
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Email Command Center Safeguards ---');

  // Opt-out halting test
  const existingProspect = phumulaniAiAgentService.getProspects()[0];
  const testProspectId = existingProspect ? existingProspect.id : 'PROSP-001';
  await phumulaniAiAgentService.scheduleFollowUp({
    prospectId: testProspectId,
    programId: 'PROG-001',
    sequenceStep: 1,
    delayDays: 3,
  });
  const halted = phumulaniAiAgentService.haltAllFollowUpsOnOptOut(testProspectId);
  const remainingScheduled = phumulaniAiAgentService
    .getFollowUps()
    .filter(f => f.prospectId === testProspectId && f.status === 'scheduled');
  assertTest(
    'SEC-SAFE-01',
    'NonDelegableSafeguard',
    'Immediate follow-up halt upon donor opt-out notification',
    halted >= 1 && remainingScheduled.length === 0,
    `Halted count: ${halted}, Remaining scheduled follow-ups: ${remainingScheduled.length}`
  );

  // Policy invariant: allowUnattendedSending must be false
  const policy = phumulaniAiAgentService.getPolicyConfig();
  assertTest(
    'SEC-SAFE-02',
    'NonDelegableSafeguard',
    'Section 7 Non-delegable policy invariant: allowUnattendedSending === false',
    policy.allowUnattendedSending === false &&
      policy.requireHumanCampaignApproval === true &&
      policy.requireProposalDirectorApproval === true,
    `Policy violated: allowUnattendedSending=${policy.allowUnattendedSending}, requireHumanCampaignApproval=${policy.requireHumanCampaignApproval}`
  );

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error in security test runner:', err);
  process.exit(1);
});
