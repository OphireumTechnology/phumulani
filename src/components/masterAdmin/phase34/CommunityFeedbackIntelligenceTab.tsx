/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.12 Community Feedback Intelligence Tab
 */

import React, { useState } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, Plus, Tag } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { CommunityFeedbackItem } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const CommunityFeedbackIntelligenceTab: React.FC<Props> = ({ currentUser }) => {
  const [feedbackList, setFeedbackList] = useState<CommunityFeedbackItem[]>(phase34Service.getCommunityFeedback());
  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState<any>('PROGRAM_QUALITY');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const created = phase34Service.submitCommunityFeedback({
      category,
      isAnonymous,
      sentimentScore: 'POSITIVE',
      feedbackText,
      identifiedThemes: ['Direct Feedback', 'Community Voice'],
      actionItemGenerated: 'Logged for supervisor review during weekly program debrief.',
    });

    setFeedbackList([...phase34Service.getCommunityFeedback()]);
    setFeedbackText('');
    setNotice(
      created.isSafeguardingQuarantine
        ? 'CRITICAL: Sensitive safety indicator detected. Feedback quarantined immediately to DEPT-SAFE.'
        : 'Feedback logged securely with anonymous constituent identity protection.'
    );
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              M34.12
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Community Feedback Intelligence
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Thematic constituent sentiment analysis, anonymous privacy protections, automated crisis quarantine, and traceable action item generation.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs font-semibold">
          {notice}
        </div>
      )}

      {/* Feedback Intake Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Submit Anonymous Community Feedback</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-800"
              >
                <option value="PROGRAM_QUALITY">Program Quality & Experience</option>
                <option value="FACILITY_ACCESSIBILITY">Facility & Language Accessibility</option>
                <option value="COMMUNICATION">Staff Communication</option>
                <option value="STAFF_APPRECIATION">Staff Appreciation</option>
                <option value="SERVICE_SUGGESTION">New Service / Schedule Suggestion</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-teal-700 focus:ring-teal-700"
                />
                <span>Maintain Complete Anonymous Protection (No PII Stored)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Feedback Observations</label>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide constructive feedback, praise, or program improvement suggestions..."
              className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-bold cursor-pointer"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Items Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-slate-900">
            Constituent Feedback & Action Item Tracking
          </h3>
          <span className="text-xs text-slate-500">
            VAWA Crisis Interceptor Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {feedbackList.map((item) => (
            <div key={item.id} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.isAnonymous ? 'Anonymous Constituent' : item.constituentIdentifier}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.sentimentScore === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.sentimentScore}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.responseStatus === 'CLOSED_IMPLEMENTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.responseStatus}
                </span>
              </div>

              <p className="text-xs text-slate-700">{item.feedbackText}</p>

              {/* Identified Themes */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Themes:</span>
                {item.identifiedThemes.map((th, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {th}
                  </span>
                ))}
              </div>

              {item.actionItemGenerated && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-800 border border-slate-100">
                  <strong className="text-teal-900">Action Item:</strong> {item.actionItemGenerated}
                  {item.reviewedByStaff && <span className="text-slate-400 block mt-0.5">Reviewed by: {item.reviewedByStaff}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
