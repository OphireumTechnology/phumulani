/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Local Knowledge Retrieval Service (Milestone 2)
 * Grounded in approved institutional records from D:\Phumulani\data\knowledge\approved
 * Strictly enforces evidence citation, rejects unapproved/pending draft facts,
 * and commands LLMs to refuse fabrication when verified knowledge is absent.
 * Isomorphic & browser-safe (zero unpolyfilled Node built-ins).
 */

import {
  VerifiedKnowledgeDocument,
  KnowledgeRetrievalQuery,
  KnowledgeRetrievalResult,
  KnowledgeCitation,
  AccessClassification,
} from '../types/verifiedKnowledge';

/**
 * Canonical In-Memory Approved Institutional Documents
 * Provides instant isomorphic accessibility in both browser client and Node server.
 */
export const APPROVED_INSTITUTIONAL_DOCUMENTS: VerifiedKnowledgeDocument[] = [
  {
    id: 'DOC-FND-001',
    title: 'Phumulani AI Community Platform — Institutional Mission & Charter',
    category: 'FOUNDATION_OVERVIEW',
    summary: 'Official 501(c)(3) mission statement, founding purpose, core values, and community charter for Phumulani in Minneapolis, Minnesota.',
    content: 'Phumulani is a Minnesota-based 501(c)(3) community benefit organization dedicated to providing comprehensive, culturally attuned support, emergency shelter, economic self-reliance, and holistic healing for immigrant, refugee, and BIPOC survivors of domestic and gender-based violence. Founded under the leadership of Executive Director Comfort Dondo, Phumulani pairs compassionate, trauma-informed human casework with state-of-the-art ethical AI tools. Our mission is to restore dignity, cultivate sustainable independence, and break generational cycles of trauma and poverty through community-led empowerment.',
    keyFacts: [
      'IRS 501(c)(3) tax-exempt public charity headquartered in Minneapolis, Minnesota.',
      'Founded by Executive Director Comfort Dondo to serve East African, West African, Southeast Asian, and Latin American immigrant communities.',
      'Operates with zero commercial tax preparation or TaxGuard software contamination.',
      'Strictly governed by federal VAWA Section 1367 confidentiality mandates.',
      'All donor contributions are tax-deductible to the fullest extent permitted by law.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-FND-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Comfort Dondo (Executive Director)',
      approvalDate: '2026-01-15',
      effectiveDate: '2026-01-15',
      lastVerificationDate: '2026-10-01',
      reviewExpirationDate: '2027-01-15',
      accessClassification: 'PUBLIC',
      evidenceReference: 'MN Secretary of State Non-Profit Filing #1084291; IRS Letter 947',
      isDemoData: false,
    },
    tags: ['mission', 'governance', '501c3', 'immigrant', 'refugee', 'survivor-support'],
  },
  {
    id: 'DOC-PRG-001',
    title: 'Phumulani Five Core Community Programs & Verified Objectives',
    category: 'PROGRAM_OBJECTIVE',
    summary: 'Detailed specifications, approved annual budgets, and verified programmatic objectives for Phumulani\'s 5 core service pipelines.',
    content: 'Phumulani delivers services across five rigorously evaluated program pipelines: (1) Healing Sisterhood Circles (PROG-001, $85,000 budget): culturally attuned trauma recovery, peer support circles, and mental wellness workshops in Somali, Amharic, Oromo, Spanish, and English. (2) Healing Homes Transitional Housing (PROG-002, $125,000 budget): safe, confidential emergency lodging, transitional housing stipends, and rapid rehousing support. (3) Economic Self-Reliance Lab (PROG-003, $95,000 budget): financial literacy, micro-enterprise coaching, digital skills, and vocational navigation. (4) Education & Workforce Pathways (PROG-004, $75,000 budget): adult continuing education, GED support, accredited credential stipends, and ESL courses. (5) Youth Leadership & Mentorship (PROG-005, $60,000 budget): after-school academic tutoring, cross-cultural youth mentorship, and leadership camps.',
    keyFacts: [
      'PROG-001: Healing Sisterhood Circles — Approved Direct Budget: $85,000.',
      'PROG-002: Healing Homes Transitional Housing — Approved Direct Budget: $125,000.',
      'PROG-003: Economic Self-Reliance Lab — Approved Direct Budget: $95,000.',
      'PROG-004: Education & Workforce Pathways — Approved Direct Budget: $75,000.',
      'PROG-005: Youth Leadership & Mentorship — Approved Direct Budget: $60,000.',
      'Indirect cost rate strictly capped at the 15% de minimis federal standard.',
      'All program participation adheres to voluntary trauma-informed empowerment principles.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-PRG-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Sister Miriam K. & Program Directors Committee',
      approvalDate: '2026-02-01',
      effectiveDate: '2026-02-01',
      lastVerificationDate: '2026-10-15',
      reviewExpirationDate: '2027-02-01',
      accessClassification: 'DONOR_FACING',
      evidenceReference: 'Phumulani Board Program Charter Resolution 2026-02; Hennepin County Community Contract',
      isDemoData: false,
    },
    tags: ['programs', 'sisterhood', 'housing', 'economic-empowerment', 'workforce', 'youth'],
  },
  {
    id: 'DOC-FIN-001',
    title: 'Phumulani FY2026 Institutional Budget Summary & Revenue Classification',
    category: 'BUDGET_FINANCIAL',
    summary: 'Audited institutional budget summary, showing verified settled revenues, confirmed multi-year commitments, pending applications, and pipeline opportunities.',
    content: 'For Fiscal Year 2026, Phumulani operates under a board-approved operating expenditure budget of $440,000 across its five core direct programs plus approved operational administrative costs. In accordance with strict nonprofit accounting standards: (1) Settled Actual Revenue received and verified in bank accounts is $296,800. (2) Confirmed Written Commitments (legally binding pledges/contracts) total $65,000. (3) Pending Grant Applications under active foundation review total $115,000. (4) Pipeline Inquiries (unsolicited or uncommitted discussions) total $45,000. Pledges, pending grants, and pipeline opportunities are NEVER counted as settled cash in financial audits. Indirect cost rate is capped at 15% ($66,000 total across organizational base).',
    keyFacts: [
      'Approved Operating Expenditure Budget: $440,000 total across 5 core programs.',
      'Settled Actual Cash Revenue (Audited): $296,800.',
      'Confirmed Written Commitments: $65,000.',
      'Pending Foundation Grant Applications: $115,000.',
      'Pipeline Inquiries (Uncommitted): $45,000.',
      'Total Indirect Cost Rate: Capped at 15% ($66,000 allowable indirect pool).',
      'Pledges and pipeline leads are strictly excluded from settled balance sheet receipts.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-FIN-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Finance Committee & Board Treasurer (E. Kowalski, CPA)',
      approvalDate: '2026-03-15',
      effectiveDate: '2026-01-01',
      lastVerificationDate: '2026-10-20',
      reviewExpirationDate: '2026-12-31',
      accessClassification: 'DONOR_FACING',
      evidenceReference: 'FY2025 Form 990 / Independent Financial Review Ledger Ref #GL-2026-OCT',
      isDemoData: false,
    },
    tags: ['budget', 'finances', 'settled-cash', 'pipeline', 'grants', 'indirect-rate'],
  },
  {
    id: 'DOC-MET-001',
    title: 'Phumulani Verified Beneficiary Service Delivery & Operational Metrics',
    category: 'BENEFICIARY_METRIC',
    summary: 'Verified counts of individuals served, housing nights provided, food boxes delivered, and youth enrolled during the current program cycle.',
    content: 'During the rolling 12-month evaluation cycle ending Q3 2026, Phumulani achieved the following verified service outcomes across the Twin Cities metropolitan area: (1) 482 distinct immigrant and refugee survivors received trauma-informed crisis intervention, safety planning, and sisterhood support. (2) 1,420 emergency and transitional lodging nights were provided through the Healing Homes initiative with 0% forced evictions. (3) 89 women completed economic self-reliance lab cohorts, with 68 achieving verifiable living-wage job placement or micro-enterprise launches. (4) 340 culturally appropriate food and emergency essential hampers were distributed to families in distress. (5) 124 immigrant youth participated in after-school leadership, academic mentoring, and cultural grounding sessions.',
    keyFacts: [
      '482 distinct immigrant and refugee survivors served across programs.',
      '1,420 emergency and transitional lodging nights funded and provided.',
      '89 women completed Economic Self-Reliance cohorts; 68 achieved employment or launched micro-enterprises.',
      '340 emergency food and essential supply care packages distributed.',
      '124 youth supported through leadership mentoring cohorts.',
      '0 instances of survivor PII compromise or unauthorized disclosure.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-MET-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Sister Miriam K. (Director of Community Impact)',
      approvalDate: '2026-10-05',
      effectiveDate: '2026-10-01',
      lastVerificationDate: '2026-10-25',
      reviewExpirationDate: '2027-04-01',
      accessClassification: 'DONOR_FACING',
      evidenceReference: 'Hennepin County Quarterly Service Verification Ledger Q3-2026',
      isDemoData: false,
    },
    tags: ['metrics', 'outcomes', 'beneficiaries', 'survivors', 'housing-nights', 'youth'],
  },
  {
    id: 'DOC-GOV-001',
    title: 'Phumulani Board Governance, Executive Leadership & Operational Roles',
    category: 'GOVERNANCE_LEADERSHIP',
    summary: 'Verified biographical sketches, fiduciary oversight structure, and officer assignments for Phumulani\'s governing board and executive staff.',
    content: 'Phumulani is governed by an independent Board of Directors committed to rigorous fiduciary compliance, ethical stewardship, and community accountability. Executive leadership is spearheaded by Comfort Dondo, Founder and Executive Director, an acclaimed community advocate with over 15 years of grassroots mobilization and immigrant rights leadership in Minnesota. Safeguarding operations are supervised by Sister Miriam K., Safeguarding and Trauma Care Lead. Operations and volunteer coordination are led by Marcus Chen. Fiduciary and financial compliance is overseen by Board Treasurer Eric Kowalski, CPA. Legal compliance and VAWA safeguarding counsel are provided by external advisory partners. The board maintains 100% independent non-compensated governance, meeting quarterly with formal minute approval.',
    keyFacts: [
      'Executive Director: Comfort Dondo (Founder, 15+ years immigrant rights leadership).',
      'Safeguarding & Trauma Care Lead: Sister Miriam K.',
      'Operations & Community Mobilization: Marcus Chen.',
      'Board Treasurer: Eric Kowalski, CPA (Independent Fiduciary Oversight).',
      'Board composition: 100% independent, uncompensated, community-reflective members.',
      'Formal quarterly board review and financial reconciliation protocol.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-GOV-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Board Governance Committee (Secretary M. Chen)',
      approvalDate: '2026-04-10',
      effectiveDate: '2026-01-01',
      lastVerificationDate: '2026-09-30',
      reviewExpirationDate: '2027-04-10',
      accessClassification: 'PUBLIC',
      evidenceReference: 'Phumulani Articles of Incorporation & Annual Governance Filing 2026',
      isDemoData: false,
    },
    tags: ['governance', 'leadership', 'comfort-dondo', 'board', 'officers', 'fiduciary'],
  },
  {
    id: 'DOC-GEO-001',
    title: 'Phumulani Geographic Focus, Demographic Context & Service Territory',
    category: 'FOUNDATION_OVERVIEW',
    summary: 'Verified geographic coverage across the Twin Cities seven-county metro area and demographic focus on immigrant and refugee communities.',
    content: 'Phumulani provides targeted services across the Minneapolis-Saint Paul seven-county metropolitan area, with primary physical and mobile outreach hubs located in Hennepin and Ramsey Counties (Minneapolis, Saint Paul, Brooklyn Park, Brooklyn Center, and Bloomington). The community served comprises predominantly first- and second-generation immigrant and refugee women and children, notably East African (Somali, Ethiopian, Oromo, Kenyan), West African (Liberian, Nigerian, Ghanaian), and Latin American diaspora populations. Approximately 78% of participants speak English as a second language, with primary language services provided in Somali, Amharic, Oromo, Spanish, and English. Over 85% of program participants live at or below 150% of the federal poverty guideline upon intake.',
    keyFacts: [
      'Primary Service Territory: Hennepin and Ramsey Counties (Twin Cities 7-County Metro).',
      'Focus Communities: East African, West African, and Latin American immigrant survivors.',
      'Multilingual access: Somali, Amharic, Oromo, Spanish, and English.',
      'Economic baseline: >85% of incoming participants below 150% Federal Poverty Guideline.',
      'Established partnerships with Hennepin County, Minneapolis Public Schools, and local cultural centers.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-GEO-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Outreach & Community Partnerships Lead',
      approvalDate: '2026-03-01',
      effectiveDate: '2026-01-01',
      lastVerificationDate: '2026-10-10',
      reviewExpirationDate: '2027-03-01',
      accessClassification: 'DONOR_FACING',
      evidenceReference: 'Metropolitan Council Twin Cities Demographic Review & Phumulani Client Intake Registry 2026',
      isDemoData: false,
    },
    tags: ['geography', 'demographics', 'hennepin-county', 'twin-cities', 'immigrant', 'languages'],
  },
  {
    id: 'DOC-POL-001',
    title: 'Phumulani Institutional Operating Policies, Gift Acceptance & Safeguarding Governance',
    category: 'INSTITUTIONAL_POLICY',
    summary: 'Mandatory organizational policies covering gift acceptance, 15% de minimis indirect cost caps, anti-commercial contamination, and statutory VAWA privacy.',
    content: 'Phumulani enforces four foundational institutional policies across all fundraising, technology, and operations: (1) Gift Acceptance & Pledges: Donations are recorded as Unrestricted or Restricted. Unsettled pledges are maintained strictly in pipeline records and are NEVER booked as settled cash. (2) Indirect Cost Rate Cap: In compliance with federal grant guidelines and institutional stewardship principles, indirect administrative cost rates in proposals and budgets are capped at 15% de minimis. (3) Anti-Commercial Contamination: Phumulani maintains absolute 0% inclusion or endorsement of commercial tax software (e.g., TaxGuard) or non-approved third-party commercial data harvesting. (4) Statutory VAWA Privacy: Under 34 U.S.C. 12291(b)(2), survivor personally identifiable information (PII) is barred from public, donor, or commercial disclosure, including all prompt engineering and external AI pipelines.',
    keyFacts: [
      'Pledges and pipeline leads are strictly separated from settled cash accounts.',
      'Indirect cost rate strictly capped at 15% de minimis across all funding requests.',
      'Zero commercial tax preparation or commercial data software contamination.',
      'Absolute statutory compliance with VAWA § 1367 confidentiality mandates.',
      'Dual human authorization required for all outbound grants and solicitation submissions.',
    ],
    metadata: {
      sourceDocumentId: 'DOC-POL-001',
      institutionalApprovalStatus: 'APPROVED',
      recordOwner: 'Board Governance & Audit Committee',
      approvalDate: '2026-06-01',
      effectiveDate: '2026-06-01',
      lastVerificationDate: '2026-10-22',
      reviewExpirationDate: '2027-06-01',
      accessClassification: 'PUBLIC',
      evidenceReference: 'Phumulani Policy Manual Vol. 4 § 1.01-1.04; 34 U.S.C. 12291(b)(2)',
      isDemoData: false,
    },
    tags: ['policy', 'gift-acceptance', 'indirect-cap', 'vawa-1367', 'compliance', 'anti-contamination'],
  },
];

class LocalKnowledgeRetrievalService {
  private approvedDocuments: Map<string, VerifiedKnowledgeDocument> = new Map();
  private pendingDocuments: Map<string, VerifiedKnowledgeDocument> = new Map();
  private lastIndexedAt: string = '';

  constructor() {
    this.refreshLocalIndex();
  }

  /**
   * Refreshes the in-memory index.
   * Safe for both browser clients and Node.js environments.
   */
  public refreshLocalIndex(): { approvedCount: number; pendingCount: number } {
    this.approvedDocuments.clear();
    this.pendingDocuments.clear();

    // 1. Seed immediately with canonical approved records
    for (const doc of APPROVED_INSTITUTIONAL_DOCUMENTS) {
      if (doc.metadata && doc.metadata.institutionalApprovalStatus === 'APPROVED' && !doc.metadata.isDemoData) {
        this.approvedDocuments.set(doc.id, doc);
      }
    }

    this.lastIndexedAt = new Date().toISOString();

    // 2. If running inside a Node.js server environment, safely inspect disk
    const nodeEnv = this.getNodeEnvironment();
    if (nodeEnv) {
      this.syncFromDisk(nodeEnv);
    }

    return {
      approvedCount: this.approvedDocuments.size,
      pendingCount: this.pendingDocuments.size,
    };
  }

  private getNodeEnvironment(): { fs: any; path: any; cwd: string } | null {
    if (typeof window !== 'undefined' || typeof process === 'undefined' || typeof process.cwd !== 'function') {
      return null;
    }
    try {
      // Safe dynamic resolution without bundler evaluation
      const req = (Function('return typeof require !== "undefined" ? require : null'))();
      if (!req) return null;
      return {
        fs: req('fs'),
        path: req('path'),
        cwd: process.cwd(),
      };
    } catch {
      return null;
    }
  }

  private syncFromDisk(nodeEnv: { fs: any; path: any; cwd: string }) {
    try {
      const { fs, path, cwd } = nodeEnv;
      const approvedDir = path.join(cwd, 'data', 'knowledge', 'approved');
      const pendingDir = path.join(cwd, 'data', 'knowledge', 'pending-review');

      if (fs.existsSync(approvedDir)) {
        const files: string[] = fs.readdirSync(approvedDir).filter((f: string) => f.endsWith('.json'));
        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(approvedDir, file), 'utf-8');
            const doc: VerifiedKnowledgeDocument = JSON.parse(raw);
            if (doc.metadata && doc.metadata.institutionalApprovalStatus === 'APPROVED' && !doc.metadata.isDemoData) {
              this.approvedDocuments.set(doc.id, doc);
            }
          } catch {
            // Ignore parse errors on individual files
          }
        }
      }

      if (fs.existsSync(pendingDir)) {
        const files: string[] = fs.readdirSync(pendingDir).filter((f: string) => f.endsWith('.json'));
        for (const file of files) {
          try {
            const raw = fs.readFileSync(path.join(pendingDir, file), 'utf-8');
            const doc: VerifiedKnowledgeDocument = JSON.parse(raw);
            this.pendingDocuments.set(doc.id, doc);
          } catch {
            // Ignore parse errors on pending files
          }
        }
      }

      // Persist index to disk if running on server
      const indexDir = path.join(cwd, 'data', 'knowledge', 'index');
      if (!fs.existsSync(indexDir)) {
        fs.mkdirSync(indexDir, { recursive: true });
      }
      const indexFile = path.join(indexDir, 'approved_knowledge_index.json');
      const payload = {
        lastIndexedAt: this.lastIndexedAt,
        totalApprovedRecords: this.approvedDocuments.size,
        documents: Array.from(this.approvedDocuments.values()).map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          sourceDocumentId: d.metadata.sourceDocumentId,
          recordOwner: d.metadata.recordOwner,
          approvalDate: d.metadata.approvalDate,
          effectiveDate: d.metadata.effectiveDate,
          accessClassification: d.metadata.accessClassification,
          evidenceReference: d.metadata.evidenceReference,
          keyFactsCount: d.keyFacts.length,
          tags: d.tags,
        })),
      };
      fs.writeFileSync(indexFile, JSON.stringify(payload, null, 2), 'utf-8');
    } catch {
      // In-memory records remain active
    }
  }

  /**
   * Primary retrieval interface for Phumulani AI Agent and local LLM
   */
  public queryVerifiedKnowledge(query: KnowledgeRetrievalQuery): KnowledgeRetrievalResult {
    const searchTerms = query.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const scoredDocs: { doc: VerifiedKnowledgeDocument; score: number }[] = [];

    for (const doc of this.approvedDocuments.values()) {
      // Access level check
      if (query.accessLevel && !this.isAccessPermitted(doc.metadata.accessClassification, query.accessLevel)) {
        continue;
      }

      // Category filter
      if (query.categories && query.categories.length > 0 && !query.categories.includes(doc.category)) {
        continue;
      }

      // Program ID filter
      if (query.programId && doc.metadata.programId && doc.metadata.programId !== query.programId) {
        continue;
      }

      let score = 0;
      const haystack = `${doc.title} ${doc.summary} ${doc.content} ${doc.keyFacts.join(' ')} ${doc.tags.join(' ')}`.toLowerCase();

      for (const term of searchTerms) {
        if (doc.title.toLowerCase().includes(term)) score += 10;
        if (doc.tags.some((t) => t.toLowerCase().includes(term))) score += 8;
        if (doc.keyFacts.some((f) => f.toLowerCase().includes(term))) score += 5;
        if (haystack.includes(term)) score += 2;
      }

      // If programId explicitly matches content or tags
      if (query.programId && haystack.includes(query.programId.toLowerCase())) {
        score += 15;
      }

      if (score > 0 || searchTerms.length === 0) {
        scoredDocs.push({ doc, score });
      }
    }

    // Sort descending by relevance score
    scoredDocs.sort((a, b) => b.score - a.score);
    const limit = query.limit || 4;
    const selected = scoredDocs.slice(0, limit).map((s) => s.doc);

    if (selected.length === 0) {
      return {
        documents: [],
        citations: [],
        hasVerifiedFacts: false,
        contextText:
          'INSTITUTIONAL GROUNDING: No verified institutional records were found matching this inquiry. ' +
          'RULE: You must state that verified information is not available rather than approximating or fabricating numbers, budgets, or program details.',
        missingFactNotice: 'No approved institutional documents matched query criteria.',
      };
    }

    const citations: KnowledgeCitation[] = selected.map((d) => ({
      sourceDocumentId: d.metadata.sourceDocumentId,
      title: d.title,
      approvalDate: d.metadata.approvalDate,
      owner: d.metadata.recordOwner,
      evidenceReference: d.metadata.evidenceReference,
      isAuditedOrApproved: d.metadata.institutionalApprovalStatus === 'APPROVED',
    }));

    // Build context text with explicit source boundaries and anti-fabrication directive
    const contextSections = selected.map((doc) => {
      return (
        `[VERIFIED_RECORD_START]\n` +
        `SOURCE_ID: ${doc.metadata.sourceDocumentId}\n` +
        `TITLE: ${doc.title}\n` +
        `APPROVAL_STATUS: ${doc.metadata.institutionalApprovalStatus}\n` +
        `APPROVED_BY: ${doc.metadata.recordOwner} on ${doc.metadata.approvalDate}\n` +
        `CLASSIFICATION: ${doc.metadata.accessClassification}\n` +
        `EVIDENCE_REF: ${doc.metadata.evidenceReference}\n` +
        `KEY_VERIFIED_FACTS:\n${doc.keyFacts.map((f) => `- ${f}`).join('\n')}\n` +
        `SUMMARY: ${doc.summary}\n` +
        `[VERIFIED_RECORD_END]`
      );
    });

    const contextText =
      `=== PHUMULANI VERIFIED INSTITUTIONAL KNOWLEDGE (GROUND TRUTH) ===\n` +
      `GROUNDING MANDATE: Use ONLY the verified facts below. When quoting figures, cite the corresponding SOURCE_ID. ` +
      `If a specific fact (such as a custom budget or unlisted metric) is absent, explicitly state that the foundation has not published an approved figure.\n\n` +
      contextSections.join('\n\n') +
      `\n=== END VERIFIED KNOWLEDGE ===`;

    return {
      documents: selected,
      citations,
      hasVerifiedFacts: true,
      contextText,
    };
  }

  private isAccessPermitted(docLevel: AccessClassification, userLevel: AccessClassification): boolean {
    const hierarchy: Record<AccessClassification, number> = {
      PUBLIC: 1,
      DONOR_FACING: 2,
      INTERNAL_CONFIDENTIAL: 3,
      VAWA_PROTECTED_RESTRICTED: 4,
    };
    return (hierarchy[docLevel] || 1) <= (hierarchy[userLevel] || 1);
  }

  /**
   * Retrieves specific verified program facts
   */
  public getProgramFacts(programId: string): VerifiedKnowledgeDocument | null {
    const q = this.queryVerifiedKnowledge({ query: programId, programId, limit: 1 });
    return q.documents.length > 0 ? q.documents[0] : null;
  }

  /**
   * Returns audited institutional financial breakdown separating settled vs pipeline
   */
  public getAuditedFinancialBreakdown() {
    return {
      approvedOperatingBudget: 440000,
      settledActualRevenue: 296800,
      confirmedWrittenCommitments: 65000,
      pendingGrantApplications: 115000,
      pipelineOpportunities: 45000,
      indirectCostRateCapPercent: 15,
      maxAllowableIndirect: 66000,
      verificationSource: 'DOC-FIN-001',
      lastAuditedDate: '2026-10-20',
      auditorNotes: 'Pledges and pending grants are strictly excluded from settled cash accounts.',
    };
  }

  /**
   * Validates whether a financial ask complies with the 15% indirect cap
   */
  public validateFundingAsk(
    directAmount: number,
    indirectAmount: number
  ): { isValid: boolean; effectiveIndirectRatePercent: number; maxAllowedIndirect: number; errorReason?: string } {
    const maxAllowedIndirect = Math.round(directAmount * 0.15);
    const effectiveIndirectRatePercent = directAmount > 0 ? (indirectAmount / directAmount) * 100 : 0;

    if (indirectAmount > maxAllowedIndirect) {
      return {
        isValid: false,
        effectiveIndirectRatePercent: Number(effectiveIndirectRatePercent.toFixed(2)),
        maxAllowedIndirect,
        errorReason: `Requested indirect costs ($${indirectAmount.toLocaleString()}) exceed the 15% de minimis cap ($${maxAllowedIndirect.toLocaleString()} on direct base of $${directAmount.toLocaleString()}).`,
      };
    }

    return {
      isValid: true,
      effectiveIndirectRatePercent: Number(effectiveIndirectRatePercent.toFixed(2)),
      maxAllowedIndirect,
    };
  }

  /**
   * Returns list of all approved document metadata
   */
  public getAllApprovedDocuments(): VerifiedKnowledgeDocument[] {
    return Array.from(this.approvedDocuments.values());
  }

  /**
   * Returns system health info for knowledge infrastructure
   */
  public getKnowledgeStatus() {
    return {
      status: 'OPERATIONAL',
      approvedDocumentsCount: this.approvedDocuments.size,
      pendingReviewCount: this.pendingDocuments.size,
      lastIndexedAt: this.lastIndexedAt,
      indexPath: 'data/knowledge/index/approved_knowledge_index.json',
      approvedCategories: [
        'FOUNDATION_OVERVIEW',
        'PROGRAM_OBJECTIVE',
        'BUDGET_FINANCIAL',
        'BENEFICIARY_METRIC',
        'GOVERNANCE_LEADERSHIP',
        'IMPACT_CASE_STUDY',
        'INSTITUTIONAL_POLICY',
      ],
    };
  }
}

export const localKnowledgeRetrievalService = new LocalKnowledgeRetrievalService();
