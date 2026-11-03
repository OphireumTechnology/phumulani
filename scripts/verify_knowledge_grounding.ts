/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Knowledge Grounding & Truth Verification Test Suite
 * Validates Milestones 1 & 2:
 * 1. Approved Document Ingestion & Citation Generation
 * 2. Strict Isolation of Pending-Review / Simulated Records
 * 3. Anti-Fabrication Refusal when Facts are Missing
 * 4. Audited Settled Revenue vs Pledges/Pipeline Distinction
 * 5. 15% De Minimis Indirect Cost Enforcement
 * 6. Proposal & Reply Draft Grounding
 * 7. Windows Index File & PowerShell Scripts
 */

import { localKnowledgeRetrievalService } from '../src/services/localKnowledgeRetrievalService';
import { phumulaniAiAgentService, APPROVED_COMMUNITY_PROGRAMS } from '../src/services/phumulaniAiAgentService';
import { fundraisingIntelligenceService } from '../src/services/fundraisingIntelligenceService';
import fs from 'fs';
import path from 'path';

interface TestCase {
  id: string;
  name: string;
  run: () => Promise<boolean> | boolean;
}

const tests: TestCase[] = [
  {
    id: 'KG-01',
    name: 'Approved knowledge documents loaded into local retrieval service',
    run: () => {
      const status = localKnowledgeRetrievalService.getKnowledgeStatus();
      if (status.approvedDocumentsCount < 7) {
        throw new Error(`Expected at least 7 approved docs, got ${status.approvedDocumentsCount}`);
      }
      return true;
    },
  },
  {
    id: 'KG-02',
    name: 'Pending-review draft documents are strictly quarantined from approved retrieval',
    run: () => {
      // Query specifically for the capital expansion mentioned in DOC-FIN-PENDING-001
      const res = localKnowledgeRetrievalService.queryVerifiedKnowledge({
        query: 'capital expansion $1.2M permanent building',
        accessLevel: 'DONOR_FACING',
      });
      // The pending document DOC-FIN-PENDING-001 must NOT be in the results
      const hasPending = res.documents.some((d) => d.id === 'DOC-FIN-PENDING-001');
      if (hasPending) {
        throw new Error('LEAK DETECTED: Pending-review document was returned in donor-facing retrieval!');
      }
      return true;
    },
  },
  {
    id: 'KG-03',
    name: 'Evidence citations contain source ID, owner, approval date, and evidence reference',
    run: () => {
      const res = localKnowledgeRetrievalService.queryVerifiedKnowledge({
        query: 'Healing Sisterhood Circles trauma recovery',
        accessLevel: 'DONOR_FACING',
      });
      if (!res.hasVerifiedFacts || res.citations.length === 0) {
        throw new Error('Expected citations for Healing Sisterhood query');
      }
      const cit = res.citations[0];
      if (!cit.sourceDocumentId || !cit.owner || !cit.approvalDate || !cit.evidenceReference) {
        throw new Error(`Incomplete citation fields: ${JSON.stringify(cit)}`);
      }
      return true;
    },
  },
  {
    id: 'KG-04',
    name: 'Anti-fabrication refusal when verified knowledge is absent',
    run: () => {
      const res = localKnowledgeRetrievalService.queryVerifiedKnowledge({
        query: 'quantum crypto cloud blockchain space station',
        accessLevel: 'DONOR_FACING',
      });
      if (res.hasVerifiedFacts) {
        throw new Error('Should not have verified facts for unrelated inquiry');
      }
      if (!res.missingFactNotice || !res.contextText.includes('state that verified information is not available')) {
        throw new Error(`Expected missing-fact refusal notice, got: ${res.contextText}`);
      }
      return true;
    },
  },
  {
    id: 'KG-05',
    name: 'Audited financial breakdown strictly isolates settled cash from pipeline',
    run: () => {
      const fin = localKnowledgeRetrievalService.getAuditedFinancialBreakdown();
      if (fin.settledActualRevenue !== 296800) {
        throw new Error(`Expected settled actual revenue $296,800, got ${fin.settledActualRevenue}`);
      }
      if (fin.confirmedWrittenCommitments !== 65000) {
        throw new Error(`Expected confirmed commitments $65,000, got ${fin.confirmedWrittenCommitments}`);
      }
      if (fin.pipelineOpportunities !== 45000) {
        throw new Error(`Expected pipeline opportunities $45,000, got ${fin.pipelineOpportunities}`);
      }
      return true;
    },
  },
  {
    id: 'KG-06',
    name: '15% de minimis indirect rate validator allows compliant funding requests',
    run: () => {
      // Direct $100,000, Indirect $15,000 (15%) -> Valid
      const check = localKnowledgeRetrievalService.validateFundingAsk(100000, 15000);
      if (!check.isValid || check.effectiveIndirectRatePercent !== 15) {
        throw new Error(`Expected valid 15% check, got: ${JSON.stringify(check)}`);
      }
      return true;
    },
  },
  {
    id: 'KG-07',
    name: '15% de minimis indirect rate validator rejects excessive indirect overhead',
    run: () => {
      // Direct $100,000, Indirect $25,000 (25%) -> Invalid
      const check = localKnowledgeRetrievalService.validateFundingAsk(100000, 25000);
      if (check.isValid) {
        throw new Error('Expected 25% indirect ask to be rejected under 15% cap');
      }
      if (!check.errorReason?.includes('15% de minimis cap')) {
        throw new Error(`Expected cap error notice, got: ${check.errorReason}`);
      }
      return true;
    },
  },
  {
    id: 'KG-08',
    name: 'Funding proposals are grounded in verified sources and enforce 15% indirect cap',
    run: async () => {
      await phumulaniAiAgentService.initialize();
      const proposal = await phumulaniAiAgentService.generateFundingProposal({
        targetGrantmaker: 'Bush Foundation',
        programId: 'PROG-002',
        requestedAmount: 50000,
        author: 'Development Lead',
      });
      if (!proposal.complianceNotes.includes('15% cap verified') || !proposal.complianceNotes.includes('DOC-')) {
        throw new Error(`Proposal compliance notes missing cap verification or source citation: ${proposal.complianceNotes}`);
      }
      if (!proposal.isDraftWatermarked) {
        throw new Error('Proposal must be watermarked as draft requiring review');
      }
      return true;
    },
  },
  {
    id: 'KG-09',
    name: 'Reply drafts ground operations with verified source citation',
    run: async () => {
      await phumulaniAiAgentService.initialize();
      const draft = await phumulaniAiAgentService.generateReplyDraft({
        incomingEmailId: 'test-kg-inbox-01',
        incomingEmailSubject: 'Partnership Inquiry for Healing Homes',
        prospectId: 'PROSP-001',
        programId: 'PROG-002',
      });
      if (!draft.suggestedBody.includes('[Verified Grounding: Source DOC-') && !draft.verifiedFactsUsed.some((f) => f.includes('Institutional Source'))) {
        throw new Error('Reply draft missing institutional grounding citation');
      }
      return true;
    },
  },
  {
    id: 'KG-10',
    name: 'Compiled index file exists and is valid JSON',
    run: () => {
      const indexPath = path.join(process.cwd(), 'data', 'knowledge', 'index', 'approved_knowledge_index.json');
      if (!fs.existsSync(indexPath)) {
        throw new Error(`Compiled index file not found at ${indexPath}`);
      }
      const raw = fs.readFileSync(indexPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.totalApprovedRecords < 7) {
        throw new Error(`Expected at least 7 records in compiled index, got ${parsed.totalApprovedRecords}`);
      }
      return true;
    },
  },
  {
    id: 'KG-11',
    name: 'Windows PowerShell operational scripts exist under scripts/windows/',
    run: () => {
      const requiredScripts = [
        'Index-Knowledge.ps1',
        'Search-Knowledge.ps1',
        'Setup-KnowledgeTask.ps1',
        'Ask-Phumulani.ps1',
        'Sync-Phumulani.ps1',
        'install-phumulani-ai.ps1',
      ];
      for (const s of requiredScripts) {
        const full = path.join(process.cwd(), 'scripts', 'windows', s);
        if (!fs.existsSync(full)) {
          throw new Error(`Missing required PowerShell script: ${s}`);
        }
      }
      return true;
    },
  },
  {
    id: 'KG-12',
    name: 'FundraisingIntelligenceService forecasts and grants have verified source IDs',
    run: () => {
      const forecasts = fundraisingIntelligenceService.getFundraisingForecasts();
      for (const f of forecasts) {
        if (!f.sourceDocumentId || f.isPledgeIncludedAsSettled !== false) {
          throw new Error(`Forecast ${f.id} missing sourceDocumentId or improperly includes pledges as settled`);
        }
      }
      const grants = fundraisingIntelligenceService.getPrioritizedGrants();
      for (const g of grants) {
        if (!g.sourceDocumentId || !g.institutionalApprovalStatus) {
          throw new Error(`Grant ${g.grantOpportunityId} missing sourceDocumentId or approval status`);
        }
      }
      return true;
    },
  },
];

async function runAll() {
  console.log('=================================================================');
  console.log(' PHUMULANI AI — KNOWLEDGE GROUNDING & TRUTH TEST SUITE');
  console.log(' Milestones 1 & 2 Execution Verification');
  console.log('=================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await t.run();
      if (res) {
        console.log(`[PASS] [${t.id}] ${t.name}`);
        passed++;
      } else {
        console.log(`[FAIL] [${t.id}] ${t.name}: returned falsy`);
        failed++;
      }
    } catch (err: any) {
      console.log(`[FAIL] [${t.id}] ${t.name}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n-----------------------------------------------------------------');
  console.log(` Results: ${passed} / ${tests.length} PASSED (${Math.round((passed / tests.length) * 100)}%)`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
