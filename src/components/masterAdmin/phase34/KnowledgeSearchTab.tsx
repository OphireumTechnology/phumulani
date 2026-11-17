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
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                M34.08
              </span>
              <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
                AI-Assisted Organizational Knowledge Search
              </h2>
            </div>
            <p className="text-sm text-phumulani-charcoal max-w-2xl">
              Role-authorized document search across approved SOPs, crisis protocols, and governance charters with explicit citations and stale document warnings.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-phumulani-charcoal" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a policy question or search citations (e.g. background check, crisis de-escalation, VAWA)..."
              className="w-full pl-10 pr-4 py-2 bg-phumulani-cream border border-phumulani-cream rounded-lg text-sm text-phumulani-charcoal focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            Search Knowledge
          </button>
        </form>
      </div>

      {/* Answer Synthesis if searched */}
      {searchResponse && (
        <div className="bg-white p-6 rounded-xl border border-phumulani-teal shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-phumulani-earth uppercase tracking-wider">
            <Quote className="w-4 h-4" />
            <span>Verified Knowledge Synthesis (Mode: {searchResponse.retrievalMode})</span>
          </div>
          <p className="text-sm text-phumulani-charcoal leading-relaxed bg-phumulani-cream p-4 rounded-lg border border-phumulani-cream">
            {searchResponse.synthesizedAnswer}
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal mb-2">
              Source Citations & Matched Documents ({searchResponse.matchedDocuments.length})
            </h4>
            <div className="space-y-3">
              {searchResponse.matchedDocuments.map((m) => (
                <div key={m.documentId} className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-bold text-phumulani-charcoal">
                    <span>{m.title} (v{m.version})</span>
                    <span className="text-phumulani-earth font-mono">Relevance: {m.relevanceScore}%</span>
                  </div>
                  <p className="text-phumulani-charcoal">{m.snippet}</p>
                  <div className="pt-1">
                    <span className="font-semibold text-phumulani-charcoal">Citations:</span>
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-phumulani-charcoal">
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
      <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-phumulani-cream bg-phumulani-cream">
          <h3 className="text-sm font-bold font-serif text-phumulani-charcoal">Approved Organizational Document Index</h3>
        </div>
        <div className="divide-y divide-phumulani-cream">
          {docs.map((d) => (
            <div key={d.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                    {d.id}
                  </span>
                  <h4 className="font-bold text-phumulani-charcoal text-sm">{d.title}</h4>
                  <span className="text-[10px] bg-phumulani-cream text-phumulani-charcoal font-bold px-1.5 py-0.2 rounded">
                    v{d.version}
                  </span>
                </div>
                <p className="text-xs text-phumulani-charcoal">{d.contentSummary}</p>
                <div className="text-[11px] text-phumulani-charcoal">
                  Approved by {d.approvedBy} • Review Frequency: Every {d.reviewFrequencyMonths} months
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  d.isStale ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
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
