/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Unified Donor CRM & Stewardship (M26.10, M26.14)
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  Building2,
  FileText,
  Clock,
  Plus,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import { UnifiedDonorProfile, DonorStewardshipAction } from '../../../types/fundingCommand';

interface DonorCrmCommandTabProps {
  currentUser: any;
}

export const DonorCrmCommandTab: React.FC<DonorCrmCommandTabProps> = ({ currentUser }) => {
  const fundingService = FundingCommandService.getInstance();
  const [donors, setDonors] = useState<UnifiedDonorProfile[]>(fundingService.getDonors());
  const [stewardshipActions, setStewardshipActions] = useState<DonorStewardshipAction[]>(
    fundingService.getStewardshipActions()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // New Donor Modal State
  const [isNewDonorOpen, setIsNewDonorOpen] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorOrg, setDonorOrg] = useState('');
  const [donorCategory, setDonorCategory] = useState<UnifiedDonorProfile['category']>('INDIVIDUAL');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorNotes, setDonorNotes] = useState('');
  const [crmError, setCrmError] = useState<string | null>(null);

  // Tax Letter Modal State
  const [selectedDonorForLetter, setSelectedDonorForLetter] = useState<UnifiedDonorProfile | null>(null);
  const [letterAmount, setLetterAmount] = useState(1000);
  const [letterResult, setLetterResult] = useState<DonorStewardshipAction | null>(null);

  const filtered = donors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.organizationName && d.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateDonor = () => {
    setCrmError(null);
    try {
      const created = fundingService.createDonor(
        {
          name: donorName,
          organizationName: donorOrg || undefined,
          category: donorCategory,
          email: donorEmail,
          city: 'Minneapolis',
          state: 'MN',
          country: 'USA',
          relationshipOwner: currentUser?.name || 'Development Officer',
          stage: 'PROSPECT',
          lifetimeGiving: 0,
          largestGift: 0,
          giftCount: 0,
          givingTier: 'COMMUNITY',
          programInterests: ['PROG-001'],
          consentStatus: 'OPTED_IN',
          vawaSafeguardingCertified: true,
          notes: donorNotes,
          tags: ['New Prospect'],
        },
        currentUser
      );
      setDonors(fundingService.getDonors());
      setIsNewDonorOpen(false);
      setDonorName('');
      setDonorOrg('');
      setDonorEmail('');
      setDonorNotes('');
    } catch (err: any) {
      setCrmError(err.message || 'Failed to create donor.');
    }
  };

  const handleGenerateLetter = () => {
    if (!selectedDonorForLetter) return;
    try {
      const action = fundingService.generateTaxAcknowledgmentLetter(
        `TX-${Date.now()}`,
        selectedDonorForLetter,
        letterAmount,
        currentUser
      );
      setLetterResult(action);
      setStewardshipActions(fundingService.getStewardshipActions());
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">
              M26.10 Unified Donor CRM
            </span>
            <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
              M26.14 Staged Tax Letters
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Unified Donor Intelligence & Stewardship Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual, Major, Corporate, Foundation & Faith-based donor relationships. Zero survivor data contamination enforced.
          </p>
        </div>

        <button
          onClick={() => setIsNewDonorOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Donor Profile
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donors by name, organization, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="INDIVIDUAL">Individual Donors</option>
            <option value="MAJOR_DONOR">Major Donors</option>
            <option value="CORPORATE">Corporate Partners</option>
            <option value="PRIVATE_FOUNDATION">Foundations</option>
            <option value="FAITH_BASED">Faith-Based Anchors</option>
          </select>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((donor) => (
          <div
            key={donor.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {donor.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {donor.givingTier}
                </span>
              </div>

              <h3 className="text-base font-serif font-bold text-slate-900">
                {donor.name}
              </h3>
              {donor.organizationName && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3" />
                  {donor.organizationName}
                </p>
              )}

              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                {donor.notes}
              </p>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg mt-3 text-[11px]">
                <div>
                  <span className="text-slate-400">Lifetime Giving:</span>
                  <p className="font-bold text-slate-900 font-mono">
                    ${donor.lifetimeGiving.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Stage / Owner:</span>
                  <p className="font-bold text-slate-900 truncate">
                    {donor.stage} • {donor.relationshipOwner.split(' ')[0]}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VAWA Certified
              </span>
              <button
                onClick={() => {
                  setSelectedDonorForLetter(donor);
                  setLetterResult(null);
                }}
                className="text-teal-800 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Draft Tax Letter
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stewardship Actions Queue Preview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-700" />
            Staged Tax Acknowledgment & Stewardship Queue ({stewardshipActions.length})
          </h3>
          <span className="text-[11px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
            Google Workspace OAuth: Deferred
          </span>
        </div>

        <div className="space-y-2">
          {stewardshipActions.map((act) => (
            <div
              key={act.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {act.actionType} for {act.donorName} (${act.giftAmount.toLocaleString()})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tax Year {act.taxYear} • IRS Section 170(f)(8) disclaimer verified.
                </p>
              </div>
              <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded self-start md:self-auto">
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* New Donor Modal */}
      {isNewDonorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-900">
                Register Unified Donor Profile
              </h3>
              <button onClick={() => setIsNewDonorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {crmError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{crmError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Name:</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Amina Mohamed"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organization (Optional):</label>
                <input
                  type="text"
                  value={donorOrg}
                  onChange={(e) => setDonorOrg(e.target.value)}
                  placeholder="e.g. Twin Cities Diaspora Foundation"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={donorCategory}
                    onChange={(e) => setDonorCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="MAJOR_DONOR">Major Donor</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="PRIVATE_FOUNDATION">Foundation</option>
                    <option value="FAITH_BASED">Faith-Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="donor@example.org"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Background:</label>
                <textarea
                  rows={2}
                  value={donorNotes}
                  onChange={(e) => setDonorNotes(e.target.value)}
                  placeholder="Program interests and relationship history..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <strong>VAWA Section 1367 Notice:</strong> Prohibits entering survivor case files, restraining order references, or confidential shelter addresses.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewDonorOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDonor}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Letter Drafting Modal */}
      {selectedDonorForLetter && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-900">
                Draft 501(c)(3) Tax Acknowledgment: {selectedDonorForLetter.name}
              </h3>
              <button onClick={() => setSelectedDonorForLetter(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gift Amount ($):</label>
                <input
                  type="number"
                  value={letterAmount}
                  onChange={(e) => setLetterAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              {letterResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
                  <p className="font-bold text-emerald-900">
                    Tax letter generated and queued in Staged Email Queue!
                  </p>
                  <pre className="p-3 bg-white border border-emerald-200 rounded text-[11px] whitespace-pre-wrap font-sans text-slate-800">
                    {letterResult.letterText}
                  </pre>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    Status: {letterResult.status} (Will send when Google Workspace OAuth is authorized)
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  Includes mandatory IRS Section 170(f)(8) statutory disclaimer: "No goods or services were provided in consideration of this contribution."
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDonorForLetter(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Close
              </button>
              {!letterResult && (
                <button
                  onClick={handleGenerateLetter}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Generate & Stage Letter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
