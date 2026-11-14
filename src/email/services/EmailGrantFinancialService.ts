/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email-to-Grant Financial Documentation Service (Phase 71)
 * Supports 14 financial document types, structured extraction, grant/budget linking,
 * missing documentation checks, human Finance/Executive approval gate, audit history,
 * and strict prohibition of invoice creation for grant advances when liquidation/replenishment applies.
 */

import crypto from 'crypto';
import { FinancialDocumentClassification } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import { FundingCommandService } from '../../services/fundingCommandService';
import { EmailAuditService } from './EmailAuditService';

export interface FinancialDocumentRecord {
  id: string;
  threadId: string;
  messageId: string;
  mailboxEmail: string;
  senderEmail: string;
  subject: string;
  classification: FinancialDocumentClassification;
  confidence: number;
  extractedFields: {
    amountUsd?: number;
    currency: string;
    grantReference?: string;
    grantOpportunityId?: string;
    grantTitle?: string;
    budgetLineItem?: string;
    periodStart?: string;
    periodEnd?: string;
    vendorOrFunderName?: string;
    invoiceOrReferenceNumber?: string;
    isGrantAdvance: boolean;
    requiresLiquidationOrReplenishment: boolean;
    attachmentFilenames: string[];
  };
  validationStatus: 'COMPLETE_FOR_REVIEW' | 'MISSING_REQUIRED_DOCS' | 'FLAGGED_UNALLOWABLE' | 'APPROVED' | 'REJECTED';
  missingFields: string[];
  approvalStatus: 'PENDING_FINANCE_REVIEW' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  reviewedBy?: string;
  reviewedByRole?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

const UNALLOWABLE_TERMS = [
  'alcohol',
  'lobbying',
  'political campaign',
  'entertainment',
  'personal gift',
  'contingency reserve',
];

export class EmailGrantFinancialService {
  private static instance: EmailGrantFinancialService;
  private dbAdapter = PostgresPersistenceAdapter.getInstance();
  private records: Map<string, FinancialDocumentRecord> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): EmailGrantFinancialService {
    if (!EmailGrantFinancialService.instance) {
      EmailGrantFinancialService.instance = new EmailGrantFinancialService();
    }
    return EmailGrantFinancialService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persisted = await this.dbAdapter.select<FinancialDocumentRecord>('email_financial_documents');
      for (const r of persisted) {
        this.records.set(r.id, r);
      }
    } catch {
      // Non-fatal hydration fallback
    }
    this.initialized = true;
  }

  public classifyFinancialDocument(subject: string, bodyText: string, attachmentFilenames: string[] = []): {
    classification: FinancialDocumentClassification;
    confidence: number;
  } {
    const text = `${subject} ${bodyText} ${attachmentFilenames.join(' ')}`.toLowerCase();

    if (UNALLOWABLE_TERMS.some((t) => text.includes(t))) {
      return { classification: 'UNALLOWABLE_EXPENSE_FLAG', confidence: 0.96 };
    }
    if (/(grant\s+advance|cash\s+advance|advance\s+request|initial\s+drawdown)/i.test(text)) {
      return { classification: 'ADVANCE_REQUEST', confidence: 0.95 };
    }
    if (/(liquidation\s+report|liquidate\s+advance|advance\s+liquidation|expenditure\s+liquidation)/i.test(text)) {
      return { classification: 'LIQUIDATION_REPORT', confidence: 0.96 };
    }
    if (/(replenishment\s+request|imprest\s+replenishment|tranche\s+replenishment)/i.test(text)) {
      return { classification: 'REPLENISHMENT_REQUEST', confidence: 0.95 };
    }
    if (/(grant\s+award\s+notice|notice\s+of\s+award|noa\b|award\s+letter)/i.test(text)) {
      return { classification: 'GRANT_AWARD_NOTICE', confidence: 0.94 };
    }
    if (/(grant\s+agreement|subrecipient\s+agreement|executed\s+contract)/i.test(text)) {
      return { classification: 'GRANT_AGREEMENT', confidence: 0.94 };
    }
    if (/(budget\s+revision|budget\s+modification|line\s+item\s+transfer)/i.test(text)) {
      return { classification: 'BUDGET_REVISION', confidence: 0.93 };
    }
    if (/(financial\s+audit|single\s+audit|form\s+990\s+review|audit\s+request)/i.test(text)) {
      return { classification: 'FINANCIAL_AUDIT_REQUEST', confidence: 0.93 };
    }
    if (/(disbursement\s+confirmation|ach\s+transfer\s+sent|wire\s+settled)/i.test(text)) {
      return { classification: 'DISBURSEMENT_CONFIRMATION', confidence: 0.92 };
    }
    if (/(invoice\s+adjustment|credit\s+memo|revised\s+invoice)/i.test(text)) {
      return { classification: 'INVOICE_ADJUSTMENT', confidence: 0.92 };
    }
    if (/(reimbursement\s+claim|expense\s+reimbursement)/i.test(text)) {
      return { classification: 'REIMBURSEMENT_CLAIM', confidence: 0.92 };
    }
    if (/(payment\s+receipt|receipt\s+#|paid\s+in\s+full)/i.test(text)) {
      return { classification: 'PAYMENT_RECEIPT', confidence: 0.9 };
    }
    if (/(invoice|billing\s+statement|amount\s+due)/i.test(text)) {
      return { classification: 'EXPENSE_INVOICE', confidence: 0.9 };
    }
    return { classification: 'NON_FINANCIAL_GENERAL', confidence: 0.85 };
  }

  public async ingestAndExtractDocument(params: {
    threadId: string;
    messageId: string;
    mailboxEmail: string;
    senderEmail: string;
    subject: string;
    bodyText: string;
    attachmentFilenames?: string[];
    actorId: string;
    grantOpportunityId?: string;
    budgetLineItem?: string;
  }): Promise<FinancialDocumentRecord> {
    await this.initialize();
    const combined = `${params.subject}\n${params.bodyText}`;
    const attachments = params.attachmentFilenames || [];
    const { classification, confidence } = this.classifyFinancialDocument(params.subject, params.bodyText, attachments);

    const amountMatch = combined.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);
    const amountUsd = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined;
    const grantRefMatch = combined.match(/\b(GR-[A-Z0-9-]+|GRANT-\d{4}-\d+)\b/i);
    const invRefMatch = combined.match(/\b(INV-[A-Z0-9-]+|REC-[A-Z0-9-]+|LIQ-[A-Z0-9-]+)\b/i);
    const periodMatch = combined.match(/(\d{4}-\d{2}-\d{2})\s+(?:to|through|-)\s+(\d{4}-\d{2}-\d{2})/i);

    const fundingCmd = FundingCommandService.getInstance();
    const matchedGrant =
      (params.grantOpportunityId && fundingCmd.getGrantOpportunity(params.grantOpportunityId)) ||
      fundingCmd.getGrantOpportunities().find(
        (g) =>
          (grantRefMatch && g.id.toLowerCase() === grantRefMatch[1].toLowerCase()) ||
          combined.toLowerCase().includes(g.funder.toLowerCase()) ||
          combined.toLowerCase().includes(g.opportunityTitle.toLowerCase())
      );

    const isGrantAdvance =
      classification === 'ADVANCE_REQUEST' ||
      classification === 'LIQUIDATION_REPORT' ||
      classification === 'REPLENISHMENT_REQUEST' ||
      /grant\s+advance|liquidation|replenishment/i.test(combined);

    const requiresLiquidationOrReplenishment =
      classification === 'ADVANCE_REQUEST' ||
      classification === 'LIQUIDATION_REPORT' ||
      classification === 'REPLENISHMENT_REQUEST' ||
      /liquidation|replenishment/i.test(combined);

    const missingFields: string[] = [];
    if (classification !== 'NON_FINANCIAL_GENERAL') {
      if (!amountUsd || amountUsd <= 0) missingFields.push('amountUsd');
      if (!matchedGrant && !grantRefMatch) missingFields.push('grantReference');
      if (
        ['EXPENSE_INVOICE', 'LIQUIDATION_REPORT', 'REIMBURSEMENT_CLAIM', 'GRANT_AGREEMENT'].includes(classification) &&
        attachments.length === 0
      ) {
        missingFields.push('supportingAttachment');
      }
      if (['LIQUIDATION_REPORT', 'REPLENISHMENT_REQUEST'].includes(classification) && !periodMatch) {
        missingFields.push('reportingPeriod');
      }
    }

    const validationStatus: FinancialDocumentRecord['validationStatus'] =
      classification === 'UNALLOWABLE_EXPENSE_FLAG'
        ? 'FLAGGED_UNALLOWABLE'
        : missingFields.length > 0
        ? 'MISSING_REQUIRED_DOCS'
        : 'COMPLETE_FOR_REVIEW';

    const now = new Date().toISOString();
    const record: FinancialDocumentRecord = {
      id: `fdoc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      threadId: params.threadId,
      messageId: params.messageId,
      mailboxEmail: params.mailboxEmail,
      senderEmail: params.senderEmail,
      subject: params.subject,
      classification,
      confidence,
      extractedFields: {
        amountUsd,
        currency: 'USD',
        grantReference: grantRefMatch?.[1]?.toUpperCase() || matchedGrant?.id,
        grantOpportunityId: matchedGrant?.id,
        grantTitle: matchedGrant?.opportunityTitle,
        budgetLineItem: params.budgetLineItem || (isGrantAdvance ? 'Grant Advance / Liquidation Ledger' : 'Program Operations'),
        periodStart: periodMatch?.[1],
        periodEnd: periodMatch?.[2],
        vendorOrFunderName: matchedGrant?.funder || params.senderEmail,
        invoiceOrReferenceNumber: invRefMatch?.[1]?.toUpperCase(),
        isGrantAdvance,
        requiresLiquidationOrReplenishment,
        attachmentFilenames: attachments,
      },
      validationStatus,
      missingFields,
      approvalStatus: 'PENDING_FINANCE_REVIEW',
      createdBy: params.actorId,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(record.id, record);
    await this.dbAdapter.insertDurableWithRetry('email_financial_documents', record, {
      context: 'EmailGrantFinancialService:ingest',
    });

    await EmailAuditService.getInstance().logEvent({
      action: 'GRANT_FINANCIAL_DOCUMENT_INGESTED',
      actor: params.actorId,
      mailboxEmail: params.mailboxEmail,
      details: {
        documentId: record.id,
        classification: record.classification,
        validationStatus: record.validationStatus,
        missingFields: record.missingFields,
        isGrantAdvance,
        requiresLiquidationOrReplenishment,
      },
    });

    return record;
  }

  public async linkToGrantAndBudget(
    documentId: string,
    grantOpportunityId: string,
    budgetLineItem: string,
    actorId: string
  ): Promise<FinancialDocumentRecord> {
    await this.initialize();
    const doc = this.records.get(documentId);
    if (!doc) throw new Error(`Financial document ${documentId} not found.`);

    const opp = FundingCommandService.getInstance().getGrantOpportunity(grantOpportunityId);
    if (!opp) throw new Error(`Grant opportunity ${grantOpportunityId} not found.`);

    doc.extractedFields.grantOpportunityId = opp.id;
    doc.extractedFields.grantReference = opp.id;
    doc.extractedFields.grantTitle = opp.opportunityTitle;
    doc.extractedFields.budgetLineItem = budgetLineItem;
    doc.missingFields = doc.missingFields.filter((f) => f !== 'grantReference');
    if (doc.missingFields.length === 0 && doc.validationStatus === 'MISSING_REQUIRED_DOCS') {
      doc.validationStatus = 'COMPLETE_FOR_REVIEW';
    }
    doc.updatedAt = new Date().toISOString();

    await this.dbAdapter.insertDurableWithRetry('email_financial_documents', doc, {
      context: 'EmailGrantFinancialService:linkGrant',
    });
    await EmailAuditService.getInstance().logEvent({
      action: 'GRANT_FINANCIAL_DOCUMENT_LINKED',
      actor: actorId,
      details: { documentId, grantOpportunityId, budgetLineItem },
    });
    return doc;
  }

  public async approveFinancialDocument(params: {
    documentId: string;
    reviewerId: string;
    reviewerRole: string;
    decision: 'APPROVED' | 'REJECTED';
    notes?: string;
  }): Promise<FinancialDocumentRecord> {
    await this.initialize();
    const doc = this.records.get(params.documentId);
    if (!doc) throw new Error(`Financial document ${params.documentId} not found.`);

    // Anti-AI and maker-checker enforcement
    const revLower = params.reviewerId.toLowerCase();
    const roleLower = params.reviewerRole.toLowerCase();
    if (revLower.startsWith('ai-') || revLower.startsWith('agent-') || roleLower.includes('ai_')) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve grant financial documentation.');
    }
    if (doc.createdBy && doc.createdBy.toLowerCase() === revLower) {
      throw new Error(
        `MAKER_CHECKER_VIOLATION: Submitter (${doc.createdBy}) cannot approve their own financial document.`
      );
    }
    if (!['executive_director', 'finance_director', 'admin', 'master_admin'].includes(roleLower)) {
      throw new Error(`RBAC_FORBIDDEN: Role ${params.reviewerRole} is not authorized to approve grant financial records.`);
    }

    if (params.decision === 'APPROVED' && doc.validationStatus === 'FLAGGED_UNALLOWABLE') {
      throw new Error('COMPLIANCE_BLOCK: Document flagged for unallowable cost indicators cannot be approved.');
    }
    if (params.decision === 'APPROVED' && doc.missingFields.length > 0) {
      throw new Error(
        `MISSING_DOCUMENTATION: Cannot approve financial document while required fields are missing (${doc.missingFields.join(', ')}).`
      );
    }

    doc.approvalStatus = params.decision;
    doc.validationStatus = params.decision;
    doc.reviewedBy = params.reviewerId;
    doc.reviewedByRole = params.reviewerRole;
    doc.reviewNotes = params.notes;
    doc.reviewedAt = new Date().toISOString();
    doc.updatedAt = doc.reviewedAt;

    await this.dbAdapter.insertDurableWithRetry('email_financial_documents', doc, {
      context: 'EmailGrantFinancialService:approve',
    });
    await EmailAuditService.getInstance().logEvent({
      action: `GRANT_FINANCIAL_${params.decision}`,
      actor: params.reviewerId,
      actorRole: params.reviewerRole,
      details: { documentId: doc.id, classification: doc.classification, notes: params.notes },
    });

    return doc;
  }

  /**
   * CRITICAL PHASE 71 ACCOUNTING GUARD:
   * Never create an invoice for a grant advance when liquidation or replenishment accounting applies.
   */
  public async createInvoiceFromDocument(
    documentId: string,
    actorId: string
  ): Promise<{ success: true; invoiceId: string; document: FinancialDocumentRecord }> {
    await this.initialize();
    const doc = this.records.get(documentId);
    if (!doc) throw new Error(`Financial document ${documentId} not found.`);

    const blockedClassifications: FinancialDocumentClassification[] = [
      'ADVANCE_REQUEST',
      'LIQUIDATION_REPORT',
      'REPLENISHMENT_REQUEST',
    ];
    if (
      blockedClassifications.includes(doc.classification) ||
      doc.extractedFields.isGrantAdvance ||
      doc.extractedFields.requiresLiquidationOrReplenishment
    ) {
      await EmailAuditService.getInstance().logEvent({
        action: 'INVOICE_CREATION_BLOCKED_ADVANCE_POLICY',
        actor: actorId,
        details: {
          documentId: doc.id,
          classification: doc.classification,
          reason: 'Grant advance liquidation/replenishment accounting applies; invoice generation prohibited.',
        },
      });
      throw new Error(
        `ACCOUNTING_RULE_BLOCKED: Cannot create an invoice for a grant advance (${doc.classification}) when liquidation or replenishment accounting applies. Record as an advance liquidation/replenishment entry instead.`
      );
    }

    if (doc.approvalStatus !== 'APPROVED') {
      throw new Error('APPROVAL_REQUIRED: Financial document must be human Finance/Executive approved before creating an invoice.');
    }

    const invoiceId = `INV-GR-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    doc.invoiceId = invoiceId;
    doc.updatedAt = new Date().toISOString();

    await this.dbAdapter.insertDurableWithRetry('email_financial_documents', doc, {
      context: 'EmailGrantFinancialService:createInvoice',
    });
    await EmailAuditService.getInstance().logEvent({
      action: 'GRANT_INVOICE_CREATED',
      actor: actorId,
      details: { documentId: doc.id, invoiceId, amountUsd: doc.extractedFields.amountUsd },
    });

    return { success: true, invoiceId, document: doc };
  }

  public async listDocuments(filter?: {
    classification?: FinancialDocumentClassification;
    approvalStatus?: FinancialDocumentRecord['approvalStatus'];
  }): Promise<FinancialDocumentRecord[]> {
    await this.initialize();
    let list = Array.from(this.records.values());
    if (filter?.classification) {
      list = list.filter((d) => d.classification === filter.classification);
    }
    if (filter?.approvalStatus) {
      list = list.filter((d) => d.approvalStatus === filter.approvalStatus);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getDocument(id: string): Promise<FinancialDocumentRecord | undefined> {
    await this.initialize();
    return this.records.get(id);
  }
}

export const emailGrantFinancialService = EmailGrantFinancialService.getInstance();
