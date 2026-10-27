/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.01 Unified Operational Search Tab
 */

import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, ArrowRight, CheckCircle2, FileText, Calendar, Users, Award, Shield } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { SearchDomain, SearchResultItem } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const UnifiedOperationalSearchTab: React.FC<Props> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<SearchDomain>('ALL');
  const [searchResults, setSearchResults] = useState<{
    results: SearchResultItem[];
    totalFound: number;
    blockedSafeguardingCount: number;
  }>({ results: [], totalFound: 0, blockedSafeguardingCount: 0 });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const res = phase34Service.searchOperationalRecords(
      { query, domain: selectedDomain },
      currentUser.role,
      currentUser.id
    );
    setSearchResults(res);
    setHasSearched(true);
  };

  const domainOptions: { label: string; value: SearchDomain; icon: any }[] = [
    { label: 'All Domains', value: 'ALL', icon: Filter },
    { label: 'Programs', value: 'COMMUNITY_PROGRAMS', icon: Award },
    { label: 'Service Requests', value: 'SERVICE_REQUESTS', icon: Shield },
    { label: 'Volunteers', value: 'VOLUNTEER_OPPORTUNITIES', icon: Users },
    { label: 'Grants & Campaigns', value: 'GRANTS', icon: FileText },
    { label: 'Documents & SOPs', value: 'ORGANIZATIONAL_DOCUMENTS', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                M34.01
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Unified Operational Search Engine
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">
              Cross-domain operational intelligence with record-level authorization checks and strict VAWA Section 1367 safeguarding firewalls.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Safeguarding Quarantine Active</span>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across programs, service requests, volunteer shifts, grants, and approved SOPs..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as SearchDomain)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
          >
            {domainOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Safeguarding Alert Notification if Blocked */}
      {searchResults.blockedSafeguardingCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">Statutory Safeguarding Boundary Enforced</h4>
            <p className="mt-1 text-xs text-amber-800">
              Your search term contained restricted confidential survivor references (e.g., SAFE-MN or shelter identifiers). In strict compliance with VAWA Section 1367 and Phumulani safeguarding invariants, restricted records are isolated from general search indexes and cannot be leaked.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Found {searchResults.totalFound} authorized {searchResults.totalFound === 1 ? 'record' : 'records'}
            </span>
            <span className="text-xs text-slate-500">
              Requester: {currentUser.name} ({currentUser.role})
            </span>
          </div>

          {searchResults.results.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-medium">No authorized operational records matched your query.</p>
              <p className="text-xs text-slate-400 mt-1">
                Try broadening your search terms or checking a different domain filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {searchResults.results.map((item) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {item.domain}
                        </span>
                        <span className="text-xs font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {item.department}
                        </span>
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 hover:text-teal-900 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.snippet}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        Score {item.relevanceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
          <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Ready for Operational Search</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Type any program keyword, grant title, volunteer position, or SOP topic to query all verified organizational records.
          </p>
        </div>
      )}
    </div>
  );
};
