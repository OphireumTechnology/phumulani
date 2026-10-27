/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 AI Program Intelligence Modal
 * M25.10: AI Planning Assistance, Checklists, Safeguarding Firewalls & Human Sign-off Policy
 */

import React, { useState } from 'react';
import { AIProgramActionType, AIProgramRecommendation } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Bot,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  Award,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  currentUserRole: string;
}

export const ProgramAiIntelligenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  programId = 'PROG-001',
  currentUserRole,
}) => {
  const commService = CommunityProgramsService.getInstance();
  const [actionType, setActionType] = useState<AIProgramActionType>('PLANNING_ASSISTANCE');
  const [contextNotes, setContextNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<AIProgramRecommendation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = commService.generateProgramAiAssist(actionType, programId, contextNotes, currentUserRole);
      if (res.success && res.recommendation) {
        setRecommendation(res.recommendation);
      } else {
        setErrorMessage(res.error || 'Failed to generate recommendation.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (recommendation) {
      navigator.clipboard.writeText(recommendation.recommendationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Bot className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-teal-800 font-bold uppercase">
                M25.10 · AI PROGRAM INTELLIGENCE
              </span>
              <h3 className="text-base font-bold text-slate-900">Community Program Assistant</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-base">
            ✕
          </button>
        </div>

        {/* POLICY STATEMENT */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-950 text-[11px] flex items-start gap-2 leading-relaxed">
          <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <span>
            <strong>Human Oversight Mandate:</strong> AI recommendations provide planning frameworks and pre-event checklists based on verified data. AI <strong>cannot unilaterally approve programs</strong>, authorize funding, or modify volunteer screenings.
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PROMPT & ACTION TYPE FORM */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Assistance Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActionType('PLANNING_ASSISTANCE')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  actionType === 'PLANNING_ASSISTANCE'
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 mb-1" />
                <span className="block text-[11px]">Roadmap Plan</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('EVENT_CHECKLIST')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  actionType === 'EVENT_CHECKLIST'
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 mb-1" />
                <span className="block text-[11px]">Event Checklist</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('RESOURCE_ESTIMATION')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  actionType === 'RESOURCE_ESTIMATION'
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 mb-1" />
                <span className="block text-[11px]">Supply Model</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType('IMPACT_NARRATIVE')}
                className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  actionType === 'IMPACT_NARRATIVE'
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5 mb-1" />
                <span className="block text-[11px]">Impact Draft</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Context Notes & Community Goals (Non-Confidential Only)
            </label>
            <textarea
              rows={3}
              placeholder="Provide general program parameters, venue details, or target community reach (zero survivor details)..."
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Analyzing Community Data...' : 'Generate Verified Recommendation'}</span>
            </button>
          </div>
        </form>

        {/* AI OUTPUT CONTAINER */}
        {recommendation && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{recommendation.id}</span>
                <h4 className="font-bold text-slate-900 text-xs">{recommendation.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Human Sign-off Required
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                  title="Copy recommendation"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <pre className="font-sans text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 max-h-60 overflow-y-auto">
              {recommendation.recommendationText}
            </pre>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>Source: {recommendation.sourceDataSource}</span>
              <span>Confidence: {(recommendation.confidenceScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
