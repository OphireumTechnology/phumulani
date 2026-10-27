/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.08 Organizational Knowledge Search Tab
 */

import React, { useState } from 'react';
import { Search, FileText, CheckCircle2, Clock, AlertTriangle, BookOpen, Quote } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { ApprovedKnowledgeDocument, KnowledgeSearchQueryResponse } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const KnowledgeSearchTab: React.FC<Props> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [searchResponse, setSearchResponse] = useState<KnowledgeSearchQueryResponse | null>(null);
  const docs = phase34Service.getApprovedKnowledgeDocuments(currentUser.role);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = phase34Service.searchKnowledge(query, currentUser.role);
    setSearchResponse(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                M34.08
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                AI-Assisted Organizational Knowledge Search
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">
              Role-authorized document search across approved SOPs, crisis protocols, and governance charters with explicit citations and stale document warnings.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a policy question or search citations (e.g. background check, crisis de-escalation, VAWA)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            Search Knowledge
          </button>
        </form>
      </div>

      {/* Answer Synthesis if searched */}
      {searchResponse && (
        <div className="bg-white p-6 rounded-xl border border-teal-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
            <Quote className="w-4 h-4" />
            <span>Verified Knowledge Synthesis (Mode: {searchResponse.retrievalMode})</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed bg-teal-50/50 p-4 rounded-lg border border-teal-100">
            {searchResponse.synthesizedAnswer}
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Source Citations & Matched Documents ({searchResponse.matchedDocuments.length})
            </h4>
            <div className="space-y-3">
              {searchResponse.matchedDocuments.map((m) => (
                <div key={m.documentId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{m.title} (v{m.version})</span>
                    <span className="text-teal-800 font-mono">Relevance: {m.relevanceScore}%</span>
                  </div>
                  <p className="text-slate-600">{m.snippet}</p>
                  <div className="pt-1">
                    <span className="font-semibold text-slate-700">Citations:</span>
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-500">
                      {m.exactCitations.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Library Roster */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold font-serif text-slate-900">Approved Organizational Document Index</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {docs.map((d) => (
            <div key={d.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {d.id}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{d.title}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                    v{d.version}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{d.contentSummary}</p>
                <div className="text-[11px] text-slate-400">
                  Approved by {d.approvedBy} • Review Frequency: Every {d.reviewFrequencyMonths} months
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  d.isStale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {d.isStale ? 'Review Due' : 'Active Approved'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
