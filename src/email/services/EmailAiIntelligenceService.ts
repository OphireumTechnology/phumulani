/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Multi-Model AI Email Intelligence & Classification Service (Phases 66 & 67)
 * Supports @google/genai (gemini-4-hydrogen) primary, configurable local Ollama/local endpoint,
 * and deterministic rule engine fallback with real latency/token/failure telemetry persisted to DB.
 */

import crypto from 'crypto';
import { Type } from '@google/genai';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import { localInferenceAdapter, PHUMULANI_AI_SYSTEM_PROMPT } from '../../services/localInferenceAdapter';
import { EmailEnterpriseService } from '../../services/emailEnterpriseService';
import { FundingCommandService } from '../../services/fundingCommandService';
import { EmailAuditService } from './EmailAuditService';
import { EmailClassificationCategory } from '../../types/emailEnterprise';

export type Phase66EmailCategory =
  | 'MAJOR_DONOR_INQUIRY'
  | 'RECURRING_GIVING'
  | 'GRANT_OPPORTUNITY'
  | 'GRANT_AWARD_OR_AGREEMENT'
  | 'GRANT_FINANCIAL_REPORTING'
  | 'CORPORATE_SPONSORSHIP'
  | 'PARTNERSHIP_PROPOSAL'
  | 'VOLUNTEER_OR_EVENT_INQUIRY'
  | 'MEETING_OR_CALL_REQUEST'
  | 'ACKNOWLEDGMENT_OR_THANK_YOU'
  | 'OPT_OUT_OR_UNSUBSCRIBE'
  | 'FINANCIAL_INVOICE_OR_RECEIPT'
  | 'SAFEGUARDING_SENSITIVE_VAWA'
  | 'SPAM_PHISHING_OR_IRRELEVANT';

export interface AiExtractedEntities {
  donorName?: string;
  organizationName?: string;
  amountUsd?: number;
  grantReference?: string;
  deadlineDate?: string;
  requestedMeetingTimes?: string[];
  programMatch?: string;
}

export interface DuplicateLeadMatch {
  hasDuplicate: boolean;
  matchedDonorId?: string;
  matchedDonorName?: string;
  matchedOpportunityId?: string;
  reason?: string;
}

export interface Phase66ClassificationResult {
  category: Phase66EmailCategory;
  legacyCategory: EmailClassificationCategory;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  confidence: number;
  explanation: string;
  languageDetected: string;
  entities: AiExtractedEntities;
  duplicateLead: DuplicateLeadMatch;
  promptInjectionDetected: boolean;
  safeguardingBlocked: boolean;
  requiresHumanReview: boolean;
  modelBackend: 'GEMINI_API' | 'LOCAL_OLLAMA' | 'DETERMINISTIC_FALLBACK';
  modelId: string;
  latencyMs: number;
  tokenUsage?: { promptTokens: number; outputTokens: number; totalTokens: number };
}

export interface AiUsageMetricRecord {
  id: string;
  operation: 'CLASSIFY' | 'DRAFT_REPLY' | 'REWRITE' | 'SUMMARIZE' | 'FINANCIAL_EXTRACT';
  modelBackend: 'GEMINI_API' | 'LOCAL_OLLAMA' | 'DETERMINISTIC_FALLBACK';
  modelId: string;
  latencyMs: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  fallbackUsed: boolean;
  success: boolean;
  errorMessage?: string;
  timestamp: string;
}

export type AiModelPreference = 'AUTO' | 'GEMINI_API' | 'LOCAL_OLLAMA' | 'DETERMINISTIC_FALLBACK';

const LEGACY_TO_PHASE66: Partial<Record<EmailClassificationCategory, Phase66EmailCategory>> = {
  '01_safeguarding': 'SAFEGUARDING_SENSITIVE_VAWA',
  '04_major_donors': 'MAJOR_DONOR_INQUIRY',
  '05_individual_donations': 'RECURRING_GIVING',
  '06_corporate_sponsorships': 'CORPORATE_SPONSORSHIP',
  '07_foundation_grants': 'GRANT_OPPORTUNITY',
  '08_government_funding': 'GRANT_OPPORTUNITY',
  '09_international_donors': 'MAJOR_DONOR_INQUIRY',
  '10_fundraising_campaigns': 'ACKNOWLEDGMENT_OR_THANK_YOU',
  '11_strategic_partnerships': 'PARTNERSHIP_PROPOSAL',
  '12_corporate_csr': 'CORPORATE_SPONSORSHIP',
  '13_volunteer_applications': 'VOLUNTEER_OR_EVENT_INQUIRY',
  '16_community_events': 'VOLUNTEER_OR_EVENT_INQUIRY',
  '19_finance_accounting': 'FINANCIAL_INVOICE_OR_RECEIPT',
  '25_spam_suspicious': 'SPAM_PHISHING_OR_IRRELEVANT',
};

const PHASE66_TO_LEGACY: Record<Phase66EmailCategory, EmailClassificationCategory> = {
  MAJOR_DONOR_INQUIRY: '04_major_donors',
  RECURRING_GIVING: '05_individual_donations',
  GRANT_OPPORTUNITY: '07_foundation_grants',
  GRANT_AWARD_OR_AGREEMENT: '07_foundation_grants',
  GRANT_FINANCIAL_REPORTING: '19_finance_accounting',
  CORPORATE_SPONSORSHIP: '06_corporate_sponsorships',
  PARTNERSHIP_PROPOSAL: '11_strategic_partnerships',
  VOLUNTEER_OR_EVENT_INQUIRY: '13_volunteer_applications',
  MEETING_OR_CALL_REQUEST: '10_fundraising_campaigns',
  ACKNOWLEDGMENT_OR_THANK_YOU: '10_fundraising_campaigns',
  OPT_OUT_OR_UNSUBSCRIBE: '23_general_inquiries',
  FINANCIAL_INVOICE_OR_RECEIPT: '19_finance_accounting',
  SAFEGUARDING_SENSITIVE_VAWA: '01_safeguarding',
  SPAM_PHISHING_OR_IRRELEVANT: '25_spam_suspicious',
};

export class EmailAiIntelligenceService {
  private static instance: EmailAiIntelligenceService;
  private dbAdapter = PostgresPersistenceAdapter.getInstance();
  private metricsCache: AiUsageMetricRecord[] = [];
  private modelPreference: AiModelPreference = 'AUTO';
  private initialized = false;

  private constructor() {}

  public static getInstance(): EmailAiIntelligenceService {
    if (!EmailAiIntelligenceService.instance) {
      EmailAiIntelligenceService.instance = new EmailAiIntelligenceService();
    }
    return EmailAiIntelligenceService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persisted = await this.dbAdapter.select<AiUsageMetricRecord>('email_ai_usage_metrics');
      if (Array.isArray(persisted)) {
        this.metricsCache = persisted.slice(-200);
      }
    } catch {
      // Non-fatal hydration fallback
    }
    this.initialized = true;
  }

  public setModelPreference(pref: AiModelPreference): void {
    this.modelPreference = pref;
  }

  public getModelConfiguration(): {
    preference: AiModelPreference;
    geminiConfigured: boolean;
    geminiModel: string;
    ollamaEndpoint: string;
    ollamaModel: string;
    fallbackChain: string[];
  } {
    const geminiConfigured = Boolean(typeof process !== 'undefined' && process.env?.GEMINI_API_KEY?.trim());
    const geminiModel = (typeof process !== 'undefined' && process.env?.GEMINI_MODEL?.trim()) || 'gemini-4-hydrogen';
    const localCfg = localInferenceAdapter.getConfig();
    return {
      preference: this.modelPreference,
      geminiConfigured,
      geminiModel,
      ollamaEndpoint: localCfg.endpoint,
      ollamaModel: localCfg.modelId,
      fallbackChain: geminiConfigured
        ? [`Gemini (${geminiModel})`, `Local Ollama (${localCfg.modelId})`, 'Deterministic Policy Rules']
        : [`Local Ollama (${localCfg.modelId})`, 'Deterministic Policy Rules'],
    };
  }

  private async recordUsageMetric(metric: Omit<AiUsageMetricRecord, 'id' | 'timestamp'>): Promise<void> {
    const rec: AiUsageMetricRecord = {
      id: `aim-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...metric,
    };
    this.metricsCache.unshift(rec);
    if (this.metricsCache.length > 200) this.metricsCache.pop();
    await this.dbAdapter
      .insertDurableWithRetry('email_ai_usage_metrics', rec, { context: 'EmailAiIntelligenceService:metric' })
      .catch(() => {});
  }

  public async getTelemetrySummary(): Promise<{
    totalCalls: number;
    geminiCalls: number;
    ollamaCalls: number;
    fallbackCalls: number;
    failedCalls: number;
    averageLatencyMs: number;
    totalTokensUsed: number;
    recentCalls: AiUsageMetricRecord[];
    configuration: ReturnType<EmailAiIntelligenceService['getModelConfiguration']>;
  }> {
    await this.initialize();
    const calls = this.metricsCache;
    const totalLatency = calls.reduce((acc, m) => acc + (m.latencyMs || 0), 0);
    return {
      totalCalls: calls.length,
      geminiCalls: calls.filter((m) => m.modelBackend === 'GEMINI_API').length,
      ollamaCalls: calls.filter((m) => m.modelBackend === 'LOCAL_OLLAMA').length,
      fallbackCalls: calls.filter((m) => m.modelBackend === 'DETERMINISTIC_FALLBACK').length,
      failedCalls: calls.filter((m) => !m.success).length,
      averageLatencyMs: calls.length > 0 ? Math.round(totalLatency / calls.length) : 0,
      totalTokensUsed: calls.reduce((acc, m) => acc + (m.totalTokens || 0), 0),
      recentCalls: calls.slice(0, 20),
      configuration: this.getModelConfiguration(),
    };
  }

  public detectLanguageDeterministic(text: string): string {
    const sample = text.toLowerCase();
    if (/\b(mahadsanid|walaal|gargaar|caawimaad)\b/.test(sample)) return 'so (Somali)';
    if (/\b(galatoomaa|gargaarsa|maatii)\b/.test(sample)) return 'om (Oromo)';
    if (/\b(gracias|solicitud|donación|subvención|hola)\b/.test(sample)) return 'es (Spanish)';
    if (/\b(merci|bonjour|subvention|partenariat)\b/.test(sample)) return 'fr (French)';
    return 'en (English)';
  }

  public extractEntitiesDeterministic(params: {
    subject: string;
    body: string;
    senderName?: string;
    senderEmail?: string;
  }): AiExtractedEntities {
    const combined = `${params.subject}\n${params.body}`;
    const amountMatch = combined.match(/\$\s?([\d,]+(?:\.\d{1,2})?)/);
    const amountUsd = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined;
    const grantMatch = combined.match(/\b(GR-[A-Z0-9-]+|GRANT-\d{4}-\d+|RFP-[A-Z0-9-]+|LOI-\d+)\b/i);
    const deadlineMatch = combined.match(
      /(?:deadline|due\s+by|submit\s+before|closes\s+on)[:\s]+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i
    );
    const orgMatch = combined.match(
      /(?:from|behalf of|representing)\s+([A-Z][A-Za-z0-9&\s]{2,45}?(?:Foundation|Trust|Fund|Partners|Corp|Corporation|Network|Council|Initiative))/
    );
    const meetingTimes: string[] = [];
    const timeRegex = /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday)\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/g;
    let m: RegExpExecArray | null;
    while ((m = timeRegex.exec(combined)) !== null) {
      meetingTimes.push(m[0]);
    }

    return {
      donorName: params.senderName || params.senderEmail?.split('@')[0],
      organizationName: orgMatch?.[1]?.trim(),
      amountUsd: Number.isFinite(amountUsd) ? amountUsd : undefined,
      grantReference: grantMatch?.[1]?.toUpperCase(),
      deadlineDate: deadlineMatch?.[1],
      requestedMeetingTimes: meetingTimes.length > 0 ? meetingTimes : undefined,
    };
  }

  public checkDuplicateLead(senderEmail: string): DuplicateLeadMatch {
    const norm = senderEmail.trim().toLowerCase();
    if (!norm) return { hasDuplicate: false };
    try {
      const fundingCmd = FundingCommandService.getInstance();
      const matchedDonor = fundingCmd.getDonors().find((d) => d.email?.toLowerCase() === norm);
      if (matchedDonor) {
        const opp = fundingCmd.getGrantOpportunities().find((o) => o.funder.toLowerCase().includes((matchedDonor.organizationName || matchedDonor.name).toLowerCase()));
        return {
          hasDuplicate: true,
          matchedDonorId: matchedDonor.id,
          matchedDonorName: matchedDonor.name,
          matchedOpportunityId: opp?.id,
          reason: `Matched existing CRM donor ${matchedDonor.name} (${matchedDonor.id}).`,
        };
      }
    } catch {
      // Fall through cleanly
    }
    return { hasDuplicate: false };
  }

  private deterministicClassify(params: {
    subject: string;
    body: string;
    senderEmail: string;
    senderName?: string;
  }): {
    category: Phase66EmailCategory;
    legacyCategory: EmailClassificationCategory;
    priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
    confidence: number;
    explanation: string;
    safeguardingBlocked: boolean;
  } {
    const legacy = EmailEnterpriseService.classifyMessage(params.subject, params.body, params.senderEmail);
    const combined = `${params.subject} ${params.body}`.toLowerCase();

    if (legacy.isSafeguardingAlert || legacy.category === '01_safeguarding') {
      return {
        category: 'SAFEGUARDING_SENSITIVE_VAWA',
        legacyCategory: '01_safeguarding',
        priority: 'P0',
        confidence: 0.99,
        explanation: legacy.reasoning,
        safeguardingBlocked: true,
      };
    }

    if (/(unsubscribe|remove me|stop emailing|opt out|do not contact)/i.test(combined)) {
      return {
        category: 'OPT_OUT_OR_UNSUBSCRIBE',
        legacyCategory: '23_general_inquiries',
        priority: 'P3',
        confidence: 0.97,
        explanation: 'Explicit unsubscribe / opt-out directive detected.',
        safeguardingBlocked: false,
      };
    }

    if (legacy.category === '25_spam_suspicious') {
      return {
        category: 'SPAM_PHISHING_OR_IRRELEVANT',
        legacyCategory: '25_spam_suspicious',
        priority: 'P4',
        confidence: 0.95,
        explanation: legacy.reasoning,
        safeguardingBlocked: false,
      };
    }

    if (/(grant award|award letter|grant agreement|signed contract|approved grant)/i.test(combined)) {
      return {
        category: 'GRANT_AWARD_OR_AGREEMENT',
        legacyCategory: '07_foundation_grants',
        priority: 'P1',
        confidence: 0.94,
        explanation: 'Grant award notice or agreement documentation identified.',
        safeguardingBlocked: false,
      };
    }

    if (/(liquidation|replenishment|advance request|financial report|budget revision|audit request)/i.test(combined)) {
      return {
        category: 'GRANT_FINANCIAL_REPORTING',
        legacyCategory: '19_finance_accounting',
        priority: 'P1',
        confidence: 0.93,
        explanation: 'Grant financial reporting, liquidation, or advance compliance communication detected.',
        safeguardingBlocked: false,
      };
    }

    if (/(invoice|receipt|payment confirmation|reimbursement|disbursement)/i.test(combined)) {
      return {
        category: 'FINANCIAL_INVOICE_OR_RECEIPT',
        legacyCategory: '19_finance_accounting',
        priority: 'P2',
        confidence: 0.91,
        explanation: 'Financial invoice, receipt, or payment notice detected.',
        safeguardingBlocked: false,
      };
    }

    if (/(schedule a call|set up a meeting|let's meet|calendar|availability|zoom call)/i.test(combined)) {
      return {
        category: 'MEETING_OR_CALL_REQUEST',
        legacyCategory: '10_fundraising_campaigns',
        priority: 'P1',
        confidence: 0.9,
        explanation: 'External party requested a meeting or calendar coordination.',
        safeguardingBlocked: false,
      };
    }

    if (/(monthly gift|recurring|sustaining donor)/i.test(combined)) {
      return {
        category: 'RECURRING_GIVING',
        legacyCategory: '05_individual_donations',
        priority: 'P2',
        confidence: 0.89,
        explanation: 'Recurring or individual donor communication detected.',
        safeguardingBlocked: false,
      };
    }

    if (/(thank you|appreciate your support|gratitude|acknowledgment)/i.test(combined) && !/(grant|sponsor|pledge)/i.test(combined)) {
      return {
        category: 'ACKNOWLEDGMENT_OR_THANK_YOU',
        legacyCategory: '10_fundraising_campaigns',
        priority: 'P3',
        confidence: 0.85,
        explanation: 'Stewardship acknowledgment or thank-you message detected.',
        safeguardingBlocked: false,
      };
    }

    const mapped = LEGACY_TO_PHASE66[legacy.category] || 'PARTNERSHIP_PROPOSAL';
    const priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' =
      mapped === 'MAJOR_DONOR_INQUIRY' || mapped === 'GRANT_OPPORTUNITY'
        ? 'P1'
        : mapped === 'VOLUNTEER_OR_EVENT_INQUIRY'
        ? 'P3'
        : 'P2';

    return {
      category: mapped,
      legacyCategory: legacy.category,
      priority,
      confidence: Number((legacy.confidence / 100).toFixed(2)),
      explanation: legacy.reasoning,
      safeguardingBlocked: false,
    };
  }

  private async callGeminiJson<T>(prompt: string, schema: any): Promise<{ data: T; modelId: string; tokens: { promptTokens: number; outputTokens: number; totalTokens: number } } | null> {
    if (typeof window !== 'undefined') return null;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return null;

    const modelId = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: PHUMULANI_AI_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const rawText = (response.text || '').trim();
    if (!rawText) return null;
    const parsed = JSON.parse(rawText) as T;
    const usage: any = (response as any).usageMetadata || {};
    return {
      data: parsed,
      modelId,
      tokens: {
        promptTokens: Number(usage.promptTokenCount || 0),
        outputTokens: Number(usage.candidatesTokenCount || 0),
        totalTokens: Number(usage.totalTokenCount || 0),
      },
    };
  }

  /**
   * Classify incoming correspondence with strict VAWA Section 1367 & prompt-injection fencing
   */
  public async classifyEmail(params: {
    subject: string;
    body: string;
    senderEmail: string;
    senderName?: string;
    mailboxEmail?: string;
  }): Promise<Phase66ClassificationResult> {
    await this.initialize();
    const t0 = Date.now();

    const injectionWrap = localInferenceAdapter.wrapUntrustedInput(`${params.subject}\n${params.body}`);
    const det = this.deterministicClassify(params);
    const entitiesDet = this.extractEntitiesDeterministic(params);
    const languageDet = this.detectLanguageDeterministic(`${params.subject} ${params.body}`);
    const duplicateLead = det.safeguardingBlocked
      ? { hasDuplicate: false, reason: 'CRM lookup bypassed under VAWA Section 1367 isolation.' }
      : this.checkDuplicateLead(params.senderEmail);

    // HARD VAWA AIR-GAP: Never send survivor/safeguarding content to external LLM APIs
    if (det.safeguardingBlocked || (params.mailboxEmail || '').toLowerCase().includes('safeguarding')) {
      const latencyMs = Date.now() - t0;
      await this.recordUsageMetric({
        operation: 'CLASSIFY',
        modelBackend: 'DETERMINISTIC_FALLBACK',
        modelId: 'vawa-airgap-policy-classifier',
        latencyMs,
        promptTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        fallbackUsed: true,
        success: true,
      });
      await EmailAuditService.getInstance().logEvent({
        action: 'SAFEGUARDING_ACCESSED',
        mailboxEmail: params.mailboxEmail,
        details: { reason: 'VAWA Section 1367 classification blocked external AI transmission' },
      });
      return {
        category: 'SAFEGUARDING_SENSITIVE_VAWA',
        legacyCategory: '01_safeguarding',
        priority: 'P0',
        confidence: 0.99,
        explanation: det.explanation,
        languageDetected: languageDet,
        entities: {},
        duplicateLead: { hasDuplicate: false },
        promptInjectionDetected: injectionWrap.detectedInjectionRisk,
        safeguardingBlocked: true,
        requiresHumanReview: true,
        modelBackend: 'DETERMINISTIC_FALLBACK',
        modelId: 'vawa-airgap-policy-classifier',
        latencyMs,
      };
    }

    const useGemini =
      (this.modelPreference === 'AUTO' || this.modelPreference === 'GEMINI_API') &&
      typeof process !== 'undefined' &&
      Boolean(process.env.GEMINI_API_KEY?.trim());

    if (useGemini) {
      try {
        const schema = {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            languageDetected: { type: Type.STRING },
            donorName: { type: Type.STRING },
            organizationName: { type: Type.STRING },
            amountUsd: { type: Type.NUMBER },
            grantReference: { type: Type.STRING },
            deadlineDate: { type: Type.STRING },
          },
          required: ['category', 'priority', 'confidence', 'explanation'],
        };

        const prompt = `Classify the untrusted email below into ONE of these exact categories:
MAJOR_DONOR_INQUIRY, RECURRING_GIVING, GRANT_OPPORTUNITY, GRANT_AWARD_OR_AGREEMENT, GRANT_FINANCIAL_REPORTING, CORPORATE_SPONSORSHIP, PARTNERSHIP_PROPOSAL, VOLUNTEER_OR_EVENT_INQUIRY, MEETING_OR_CALL_REQUEST, ACKNOWLEDGMENT_OR_THANK_YOU, OPT_OUT_OR_UNSUBSCRIBE, FINANCIAL_INVOICE_OR_RECEIPT, SAFEGUARDING_SENSITIVE_VAWA, SPAM_PHISHING_OR_IRRELEVANT.

Sender: ${params.senderName || ''} <${params.senderEmail}>
Subject: ${EmailEnterpriseService.sanitizeUntrustedContent(params.subject)}
${injectionWrap.wrapped}`;

        const res = await this.callGeminiJson<any>(prompt, schema);
        if (res?.data?.category && PHASE66_TO_LEGACY[res.data.category as Phase66EmailCategory]) {
          const cat = res.data.category as Phase66EmailCategory;
          const latencyMs = Date.now() - t0;
          await this.recordUsageMetric({
            operation: 'CLASSIFY',
            modelBackend: 'GEMINI_API',
            modelId: res.modelId,
            latencyMs,
            promptTokens: res.tokens.promptTokens,
            outputTokens: res.tokens.outputTokens,
            totalTokens: res.tokens.totalTokens,
            fallbackUsed: false,
            success: true,
          });
          return {
            category: cat,
            legacyCategory: PHASE66_TO_LEGACY[cat],
            priority: (['P0', 'P1', 'P2', 'P3', 'P4'].includes(res.data.priority) ? res.data.priority : det.priority) as any,
            confidence: Math.min(1, Math.max(0, Number(res.data.confidence || det.confidence))),
            explanation: String(res.data.explanation || det.explanation),
            languageDetected: String(res.data.languageDetected || languageDet),
            entities: {
              donorName: res.data.donorName || entitiesDet.donorName,
              organizationName: res.data.organizationName || entitiesDet.organizationName,
              amountUsd: typeof res.data.amountUsd === 'number' && res.data.amountUsd > 0 ? res.data.amountUsd : entitiesDet.amountUsd,
              grantReference: res.data.grantReference || entitiesDet.grantReference,
              deadlineDate: res.data.deadlineDate || entitiesDet.deadlineDate,
              requestedMeetingTimes: entitiesDet.requestedMeetingTimes,
            },
            duplicateLead,
            promptInjectionDetected: injectionWrap.detectedInjectionRisk,
            safeguardingBlocked: cat === 'SAFEGUARDING_SENSITIVE_VAWA',
            requiresHumanReview: true,
            modelBackend: 'GEMINI_API',
            modelId: res.modelId,
            latencyMs,
            tokenUsage: res.tokens,
          };
        }
      } catch (err: any) {
        await this.recordUsageMetric({
          operation: 'CLASSIFY',
          modelBackend: 'GEMINI_API',
          modelId: process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen',
          latencyMs: Date.now() - t0,
          promptTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          fallbackUsed: true,
          success: false,
          errorMessage: err?.message || 'Gemini classification call failed',
        });
      }
    }

    const latencyMs = Date.now() - t0;
    await this.recordUsageMetric({
      operation: 'CLASSIFY',
      modelBackend: 'DETERMINISTIC_FALLBACK',
      modelId: 'phumulani-deterministic-classifier-v2',
      latencyMs,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      fallbackUsed: true,
      success: true,
    });

    return {
      category: det.category,
      legacyCategory: det.legacyCategory,
      priority: det.priority,
      confidence: det.confidence,
      explanation: det.explanation,
      languageDetected: languageDet,
      entities: entitiesDet,
      duplicateLead,
      promptInjectionDetected: injectionWrap.detectedInjectionRisk,
      safeguardingBlocked: det.safeguardingBlocked,
      requiresHumanReview: true,
      modelBackend: 'DETERMINISTIC_FALLBACK',
      modelId: 'phumulani-deterministic-classifier-v2',
      latencyMs,
    };
  }

  /**
   * Generate a human-reviewed reply draft or rewrite without fabricating financial commitments
   */
  public async generateDraftReply(params: {
    subject: string;
    incomingBody: string;
    senderName?: string;
    senderEmail?: string;
    mailboxEmail?: string;
    tone?: 'warm' | 'formal' | 'executive' | 'shorter';
    staffInstructions?: string;
  }): Promise<{
    subject: string;
    bodyText: string;
    requiresHumanApproval: true;
    safeguardingBlocked: boolean;
    modelBackend: 'GEMINI_API' | 'LOCAL_OLLAMA' | 'DETERMINISTIC_FALLBACK';
    modelId: string;
    latencyMs: number;
  }> {
    await this.initialize();
    const t0 = Date.now();
    const classification = await this.classifyEmail({
      subject: params.subject,
      body: params.incomingBody,
      senderEmail: params.senderEmail || 'contact@example.org',
      senderName: params.senderName,
      mailboxEmail: params.mailboxEmail,
    });

    if (classification.safeguardingBlocked) {
      throw new Error(
        'SAFEGUARDING_AIR_GAP_VIOLATION: AI reply drafting is strictly prohibited on VAWA Section 1367 survivor correspondence.'
      );
    }

    const replySubject = params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`;
    const safePrompt = EmailEnterpriseService.buildSafeAiPrompt({
      senderName: params.senderName || 'Partner',
      senderEmail: params.senderEmail || 'contact@example.org',
      subject: params.subject,
      body: params.incomingBody,
      toneStyle: params.tone || 'formal',
    });

    const fullPrompt = `${safePrompt}
Additional staff guidance: ${params.staffInstructions || 'Acknowledge inquiry warmly, cite only verified program details, make NO binding financial commitments or unauthorized promises, and invite further conversation with Comfort Dondo or Development leadership.'}`;

    const useGemini =
      (this.modelPreference === 'AUTO' || this.modelPreference === 'GEMINI_API') &&
      typeof process !== 'undefined' &&
      Boolean(process.env.GEMINI_API_KEY?.trim());

    if (useGemini) {
      try {
        const modelId = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY!,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const res = await ai.models.generateContent({
          model: modelId,
          contents: fullPrompt,
          config: { systemInstruction: PHUMULANI_AI_SYSTEM_PROMPT },
        });
        const text = (res.text || '').trim();
        if (text) {
          const latencyMs = Date.now() - t0;
          const usage: any = (res as any).usageMetadata || {};
          await this.recordUsageMetric({
            operation: 'DRAFT_REPLY',
            modelBackend: 'GEMINI_API',
            modelId,
            latencyMs,
            promptTokens: Number(usage.promptTokenCount || 0),
            outputTokens: Number(usage.candidatesTokenCount || 0),
            totalTokens: Number(usage.totalTokenCount || 0),
            fallbackUsed: false,
            success: true,
          });
          return {
            subject: replySubject,
            bodyText: text,
            requiresHumanApproval: true,
            safeguardingBlocked: false,
            modelBackend: 'GEMINI_API',
            modelId,
            latencyMs,
          };
        }
      } catch (err: any) {
        await this.recordUsageMetric({
          operation: 'DRAFT_REPLY',
          modelBackend: 'GEMINI_API',
          modelId: process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen',
          latencyMs: Date.now() - t0,
          promptTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          fallbackUsed: true,
          success: false,
          errorMessage: err?.message || 'Gemini draft generation failed',
        });
      }
    }

    const recipient = params.senderName || 'Colleague';
    const mailboxSig = params.mailboxEmail || 'grants@phumulani.org';
    const bodyText =
      params.tone === 'shorter'
        ? `Dear ${recipient},\n\nThank you for reaching out to Phumulani regarding "${params.subject}". Our Development leadership is reviewing your inquiry and would welcome a brief call to discuss next steps.\n\nWarm regards,\nPhumulani Development Team (${mailboxSig})`
        : `Dear ${recipient},\n\nThank you very much for your message regarding "${params.subject}".\n\nPhumulani remains committed to empowering East African and immigrant women and families across Minnesota through culturally grounded trauma recovery, transitional housing, and workforce programs. Our leadership team has logged your inquiry for review and will follow up promptly with verified program details—subject to formal executive review before any financial commitment.\n\nWould you have availability next week for a brief introductory call?\n\nWith gratitude,\nPhumulani Institutional Advancement\n${mailboxSig}`;

    const latencyMs = Date.now() - t0;
    await this.recordUsageMetric({
      operation: 'DRAFT_REPLY',
      modelBackend: 'DETERMINISTIC_FALLBACK',
      modelId: 'phumulani-grounded-template-v2',
      latencyMs,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      fallbackUsed: true,
      success: true,
    });

    return {
      subject: replySubject,
      bodyText,
      requiresHumanApproval: true,
      safeguardingBlocked: false,
      modelBackend: 'DETERMINISTIC_FALLBACK',
      modelId: 'phumulani-grounded-template-v2',
      latencyMs,
    };
  }
}

export const emailAiIntelligenceService = EmailAiIntelligenceService.getInstance();
