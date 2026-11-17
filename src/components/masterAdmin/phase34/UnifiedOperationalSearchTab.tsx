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
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                M34.01
              </span>
              <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
                Unified Operational Search Engine
              </h2>
            </div>
            <p className="text-sm text-phumulani-charcoal max-w-2xl">
              Cross-domain operational intelligence with record-level authorization checks and strict VAWA Section 1367 safeguarding firewalls.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-phumulani-charcoal bg-phumulani-cream px-3 py-2 rounded-lg border border-phumulani-cream">
            <ShieldAlert className="w-4 h-4 text-phumulani-earth" />
            <span>Safeguarding Quarantine Active</span>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-phumulani-charcoal" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across programs, service requests, volunteer shifts, grants, and approved SOPs..."
              className="w-full pl-11 pr-4 py-2.5 bg-phumulani-cream border border-phumulani-cream rounded-lg text-sm text-phumulani-charcoal focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth focus:border-phumulani-earth"
            />
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as SearchDomain)}
            className="px-3.5 py-2.5 bg-phumulani-cream border border-phumulani-cream rounded-lg text-sm text-phumulani-charcoal font-medium focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth"
          >
            {domainOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Safeguarding Alert Notification if Blocked */}
      {searchResults.blockedSafeguardingCount > 0 && (
        <div className="p-4 bg-phumulani-cream border border-phumulani-gold rounded-xl text-phumulani-charcoal text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-phumulani-earth shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-phumulani-charcoal">Statutory Safeguarding Boundary Enforced</h4>
            <p className="mt-1 text-xs text-phumulani-charcoal">
              Your search term contained restricted confidential survivor references (e.g., SAFE-MN or shelter identifiers). In strict compliance with VAWA Section 1367 and Phumulani safeguarding invariants, restricted records are isolated from general search indexes and cannot be leaked.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched ? (
        <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-phumulani-cream bg-phumulani-cream flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal">
              Found {searchResults.totalFound} authorized {searchResults.totalFound === 1 ? 'record' : 'records'}
            </span>
            <span className="text-xs text-phumulani-charcoal">
              Requester: {currentUser.name} ({currentUser.role})
            </span>
          </div>

          {searchResults.results.length === 0 ? (
            <div className="p-12 text-center text-phumulani-charcoal">
              <Search className="w-10 h-10 mx-auto text-phumulani-charcoal mb-3" />
              <p className="font-medium">No authorized operational records matched your query.</p>
              <p className="text-xs text-phumulani-charcoal mt-1">
                Try broadening your search terms or checking a different domain filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-phumulani-cream">
              {searchResults.results.map((item) => (
                <div key={item.id} className="p-5 hover:bg-phumulani-cream transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded border border-phumulani-cream">
                          {item.domain}
                        </span>
                        <span className="text-xs font-medium text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                          {item.department}
                        </span>
                        <span className="text-xs font-mono text-phumulani-earth bg-phumulani-cream px-1.5 py-0.5 rounded font-semibold">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-phumulani-charcoal hover:text-phumulani-earth transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-phumulani-charcoal line-clamp-2">{item.snippet}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-1 rounded">
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
        <div className="p-12 bg-white rounded-xl border border-dashed border-phumulani-cream text-center text-phumulani-charcoal">
          <Search className="w-12 h-12 mx-auto text-phumulani-charcoal mb-3" />
          <h3 className="font-bold text-phumulani-charcoal text-base">Ready for Operational Search</h3>
          <p className="text-xs text-phumulani-charcoal max-w-md mx-auto mt-1">
            Type any program keyword, grant title, volunteer position, or SOP topic to query all verified organizational records.
          </p>
        </div>
      )}
    </div>
  );
};
