/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Milestone M41.10 Data Types
 * Seven-Language Community User Acceptance Testing, Localization & Parity Engine
 */

import { SupportedLanguageCode } from './phase33';

export type LinguisticReviewCategory =
  | 'meaning_accuracy'
  | 'natural_phrasing'
  | 'cultural_appropriateness'
  | 'terminology_consistency'
  | 'reading_clarity'
  | 'form_instructions'
  | 'error_message_clarity'
  | 'safeguarding_terminology'
  | 'emergency_instructions'
  | 'financial_terminology'
  | 'accessibility_language';

export type TranslationReviewStatus =
  | 'NOT_REVIEWED'
  | 'REVIEW_PENDING'
  | 'REVIEWED_WITH_ISSUES'
  | 'APPROVED_BY_HUMAN_REVIEWER'
  | 'REJECTED';

export type UatParticipantRole =
  | 'COMMUNITY_MEMBER'
  | 'VOLUNTEER'
  | 'DONOR'
  | 'CASEWORKER'
  | 'PROGRAM_COORDINATOR'
  | 'MULTILINGUAL_REVIEWER'
  | 'ACCESSIBILITY_REVIEWER';

export type UatTaskOutcome = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'ABANDONED' | 'BLOCKED';

export type UatDefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type UatDefectResolutionStatus = 'OPEN' | 'RESOLVED' | 'WONTFIX' | 'DOCUMENTED_LIMITATION';

export type LanguageUatAcceptanceStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED_WITH_ISSUES'
  | 'HUMAN_APPROVED'
  | 'BLOCKED';

export interface UatSessionRecord {
  id: string;
  sessionId: string;
  participantCode: string;
  participantRole: UatParticipantRole;
  languageCode: SupportedLanguageCode;
  deviceType: 'DESKTOP' | 'MOBILE_PHONE' | 'TABLET';
  scenarioId: string;
  startedAt: string;
  completedAt?: string;
  consentRecorded: boolean;
  taskOutcome: UatTaskOutcome;
  difficultyRating: number; // 1 to 5 scale
  feedbackReference?: string;
  reviewStatus: TranslationReviewStatus;
  notes?: string;
  verifiedSafeNoPii: boolean;
}

export interface UatDefectRecord {
  id: string;
  defectId: string;
  languageCode: SupportedLanguageCode;
  scenarioId: string;
  severity: UatDefectSeverity;
  description: string;
  expectedBehavior: string;
  actualBehavior: string;
  reportedBy: string;
  reportedAt: string;
  resolutionStatus: UatDefectResolutionStatus;
  resolutionEvidence?: string;
}

export interface LanguageReviewStatusItem {
  languageCode: SupportedLanguageCode;
  languageName: string;
  localName: string;
  status: TranslationReviewStatus;
  reviewedKeysCount: number;
  totalKeysCount: number;
  openDefectsCount: number;
  resolvedDefectsCount: number;
  humanReviewerAssigned?: string;
  approvalDate?: string;
  notes: string;
}

export interface LanguageAuditParityResult {
  totalKeys: number;
  parityCompliant: boolean;
  missingKeysSummary: Record<SupportedLanguageCode, string[]>;
  placeholderMismatches: {
    key: string;
    lang: SupportedLanguageCode;
    expectedTokens: string[];
    foundTokens: string[];
  }[];
  scriptValidity: Record<SupportedLanguageCode, boolean>;
  antiInjectionPassed: boolean;
  languages: {
    code: SupportedLanguageCode;
    name: string;
    localName: string;
    totalKeys: number;
    translatedCount: number;
    missingCount: number;
    parityPercentage: number;
    scriptRenderingValid: boolean;
    coverageStatus: string;
  }[];
}

export interface ScenarioStepResult {
  step: number;
  name: string;
  language: SupportedLanguageCode;
  domain: string;
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ScenarioExecutionSummary {
  scenarioId: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  success: boolean;
  durationMs: number;
  stepResults: ScenarioStepResult[];
  error?: string;
}
