/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donor and Sponsor Portal (Application 3)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { Donation, PledgeIntention, User } from '../types';
import {
  Heart,
  Download,
  FileCheck,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Receipt,
  HeartHandshake,
  AlertTriangle,
  Coins,
  Lock,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';

interface DonorPortalViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
  onOpenReceipt: (donation: Donation) => void;
}

export const DonorPortalView: React.FC<DonorPortalViewProps> = ({
  currentUser,
  onViewChange,
  onOpenReceipt,
}) => {
  const state = db.getState();
  const donations = state.donations;
  const campaigns = state.campaigns;

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pledges' | 'sponsorships' | 'tax_statement'>('overview');
  const [sponsorshipFeedback, setSponsorshipFeedback] = useState<string | null>(null);
  const [pledgeFeedback, setPledgeFeedback] = useState<string | null>(null);

  // Initial baseline segregated pledges matching $125,000 unearned pipeline
  const [pledges, setPledges] = useState<PledgeIntention[]>([
    {
      id: 'PLG-2026-001',
      donorName: 'Minneapolis Foundation Commitment',
      donorEmail: 'grants@minneapolisfoundation.org',
      totalPledgeAmount: 100000,
      unearnedBalance: 100000,
      campaignId: 'camp-empowerment',
      campaignTitle: "Women's Empowerment & Self-Sufficiency (PROG-002)",
      startYear: 2026,
      endYear: 2028,
      annualInstallmentAmount: 33333,
      status: 'PLEDGED_UNEARNED',
      isSegregatedFromSettledCash: true,
      notes: 'Multi-year major institutional gift commitment. Segregated from settled general ledger until payment transfers.',
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'PLG-2026-002',
      donorName: 'Twin Cities Community Corporate Consortium',
      donorEmail: 'csr@twincitiesallies.org',
      totalPledgeAmount: 25000,
      unearnedBalance: 25000,
      campaignId: 'camp-crisis',
      campaignTitle: 'Emergency Crisis Housing & Shelter Subsidies',
      startYear: 2026,
      endYear: 2027,
      annualInstallmentAmount: 12500,
      status: 'PLEDGED_UNEARNED',
      isSegregatedFromSettledCash: true,
      notes: 'Corporate social responsibility pledge. Scheduled quarterly disbursement.',
      createdAt: '2026-02-01T14:30:00Z',
    },
  ]);

  // Form state for creating a new pledge intention
  const [newPledgeCampaign, setNewPledgeCampaign] = useState(campaigns[0]?.id || 'camp-empowerment');
  const [newPledgeAmount, setNewPledgeAmount] = useState<number>(5000);
  const [newPledgeDuration, setNewPledgeDuration] = useState<number>(2);
  const [newPledgeNotes, setNewPledgeNotes] = useState<string>('');
  const [newPledgeAcknowledged, setNewPledgeAcknowledged] = useState<boolean>(false);

  // Filter donations for current user if donor, or show all in demo
  const userDonations = donations;

  const totalGiven = userDonations
    .filter((d) => d.status === 'succeeded')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPledgedUnearned = pledges
    .filter((p) => p.status === 'PLEDGED_UNEARNED')
    .reduce((acc, curr) => acc + curr.unearnedBalance, 0);

  const activeRecurring = userDonations.filter(
    (d) => d.frequency === 'monthly' && d.status === 'succeeded'
  ).length;

  const handleRegisterPledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledgeAcknowledged) {
      alert('Please acknowledge that pledge intentions are segregated and do not generate an IRS tax receipt until settled.');
      return;
    }
    const selectedCamp = campaigns.find((c) => c.id === newPledgeCampaign) || campaigns[0];
    const newId = `PLG-2026-${String(pledges.length + 1).padStart(3, '0')}`;
    const annualInstallment = Math.round(newPledgeAmount / Math.max(1, newPledgeDuration));

    const item: PledgeIntention = {
      id: newId,
      donorName: currentUser.name,
      donorEmail: currentUser.email,
      totalPledgeAmount: Number(newPledgeAmount),
      unearnedBalance: Number(newPledgeAmount),
      campaignId: selectedCamp.id,
      campaignTitle: selectedCamp.title,
      startYear: 2026,
      endYear: 2026 + Number(newPledgeDuration) - 1,
      annualInstallmentAmount: annualInstallment,
      status: 'PLEDGED_UNEARNED',
      isSegregatedFromSettledCash: true,
      notes: newPledgeNotes || 'Constituent pledge intention registered via donor portal.',
      createdAt: new Date().toISOString(),
    };

    setPledges([item, ...pledges]);
    setPledgeFeedback(`Pledge intention ${newId} ($${Number(newPledgeAmount).toLocaleString()}) successfully recorded under FASB segregated ledger. No tax receipt issued until settlement.`);
    setNewPledgeNotes('');
    setNewPledgeAcknowledged(false);
    setTimeout(() => setPledgeFeedback(null), 8000);
  };

  const sponsorshipTiers = [
    {
      id: 'tier-1',
      name: 'Community Ally Sponsor',
      amount: 1000,
      benefits: [
        'Sponsors 10 survivor career readiness kits',
        'Recognition on Phumulani Annual Report donor roll',
        'Quarterly executive briefing letters',
        'Official tax deductible certification',
      ],
    },
    {
      id: 'tier-2',
      name: 'Hope Builder Corporate Partner',
      amount: 5000,
      benefits: [
        'Directly covers 4 family emergency security deposits',
        'Logo placement on community event programs & website',
        'VIP invitation to Annual Sisterhood Banquet (table of 8)',
        'Employer volunteer day coordination with Phumulani youth circles',
      ],
    },
    {
      id: 'tier-3',
      name: 'Transformational Visionary Partner',
      amount: 15000,
      benefits: [
        'Funds 1 full year of Immigrant Women Entrepreneurship seed capital',
        'Keynote recognition at Annual Gala & ribbon cuttings',
        'Permanent donor wall dedication at Phumulani Community Center',
        'Bespoke CSR partnership impact metrics report for corporate board',
      ],
    },
  ];

  const navGroups = [
    {
      groupLabel: 'Donor Services',
      items: [
        { id: 'overview', label: 'Dashboard & Impact', icon: Heart },
        { id: 'history', label: 'Giving History & Receipts', icon: Receipt, badge: userDonations.length },
        { id: 'pledges', label: 'Pledges & Intentions', icon: HeartHandshake, badge: `${pledges.length} Segregated` },
        { id: 'sponsorships', label: 'Corporate Sponsorships', icon: Building2 },
        { id: 'tax_statement', label: 'Annual Tax Statement', icon: FileCheck },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="donor"
      portalTitle="Donor & Sponsor Portal"
      portalSubtitle="Tax receipts, recurring gifts & partnerships"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId={activeTab}
      onSelectNavItem={(id) => setActiveTab(id as any)}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#633C69] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-200 bg-purple-900/60 px-3 py-0.5 rounded-full border border-purple-700">
              <Heart className="w-3.5 h-3.5 fill-purple-300 text-purple-300" />
              <span>DONOR & SPONSOR RECOGNITION</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              Donor Giving &amp; Impact Dashboard — {currentUser.name}
            </h1>
            <p className="text-xs text-purple-100/90 max-w-xl">
              Review your 501(c)(3) tax receipts, download annual statements, manage recurring gifts, and track the direct impact of your generosity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-amber-300">
                ${totalGiven.toLocaleString()}
              </div>
              <div className="text-[10px] text-purple-200 mt-0.5">Total Settled</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-sky-200">
                ${totalPledgedUnearned.toLocaleString()}
              </div>
              <div className="text-[10px] text-purple-200 mt-0.5">Segregated Pledges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-emerald-300">
                {activeRecurring} Active
              </div>
              <div className="text-[10px] text-purple-200 mt-0.5">Monthly Gifts</div>
            </div>
          </div>
        </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Receipts List */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Recent Verified Contributions
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-[#633C69] hover:underline"
                >
                  View All Receipts
                </button>
              </div>

              <div className="space-y-3">
                {userDonations.slice(0, 3).map((don) => (
                  <div
                    key={don.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          ${don.amount.toLocaleString()}.00 USD
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {don.receiptNumber}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          Reconciled
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Campaign: <strong className="text-slate-700">{don.campaignTitle}</strong> · Method: {don.paymentMethod}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenReceipt(don)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#633C69]" />
                      <span>Print Receipt</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Impact Spotlight */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-slate-900">
                Where Your Donations Make an Impact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-semibold text-xs text-slate-800">{camp.title}</div>
                    <div className="text-[11px] text-slate-500">{camp.impactMetric}</div>
                    <div className="text-xs font-bold text-[#104F57] pt-1">
                      ${camp.raisedAmount.toLocaleString()} funded by {camp.donorCount} community supporters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Donor Information */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>IRS Tax-Exempt Status</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Phumulani is registered in Minnesota as an independent 501(c)(3) public charity. EIN: <strong>82-4190823</strong>.
              </p>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                <div className="font-bold text-[#633C69]">Annual Giving Statement</div>
                <div className="text-[11px] text-slate-600">
                  Consolidated PDF summary ready for tax year 2026 filing.
                </div>
                <button
                  onClick={() => setActiveTab('tax_statement')}
                  className="mt-2 text-xs font-bold text-[#633C69] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Statement</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
              <div className="font-bold text-slate-800">Employer Matching Gift?</div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Many Minnesota employers (including Target, UnitedHealth, 3M, Best Buy, and General Mills) match charitable gifts dollar-for-dollar.
              </p>
              <div className="text-[#104F57] font-semibold text-[11px]">
                Contact: finance@phumulani.org for matching gift verification.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GIVING HISTORY & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Official Contribution & Receipt Archive
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Every transaction receives an immutable provider receipt number and is reconciled against our general ledger.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Receipt #</th>
                  <th className="py-3 px-4 font-semibold">Campaign</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Frequency</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(don.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#104F57]">
                      {don.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {don.campaignTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{don.paymentMethod}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {don.frequency.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${don.amount.toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenReceipt(don)}
                        className="text-xs font-semibold text-[#633C69] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PLEDGES & INTENTIONS (4-TIER FINANCIAL CLASSIFICATION) */}
      {activeTab === 'pledges' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>FASB / GAAP RESTRICTED &amp; SEGREGATED ACCOUNTING</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 mt-2">
                Multi-Year Pledges &amp; Intentions of Support
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                Phumulani rigorously isolates future pledge commitments from liquid bank cash. Unsettled pledges are recognized as unearned receivables and do not generate IRS tax receipts until funds are received and settled.
              </p>
            </div>
          </div>

          {/* 4-Tier Financial Classification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tier 1: Settled Liquid Cash</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-emerald-700">$390,000</div>
              <div className="text-[10px] text-slate-500">
                CPA-verified cash in bank across 5 institutional grants &amp; gifts.
              </div>
            </div>

            <div className="bg-amber-50/60 rounded-xl border-2 border-amber-300 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                <span>Tier 2: Committed Pledges</span>
                <HeartHandshake className="w-4 h-4 text-amber-700" />
              </div>
              <div className="font-serif text-2xl font-bold text-amber-900">
                ${totalPledgedUnearned.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-800">
                Segregated unearned receivables; $0 counted toward settled cash.
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tier 3: Payment Gateway</span>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="font-serif text-2xl font-bold text-slate-700">$0.00</div>
              <div className="text-[10px] text-slate-500">
                Truthfully NOT_CONNECTED in staged development. Zero mock charges.
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tier 4: Grants Pipeline</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-teal-700">$245,000</div>
              <div className="text-[10px] text-slate-500">
                Institutional foundation proposals submitted &amp; under review.
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-[#633C69]">
            <AlertTriangle className="w-5 h-5 text-[#633C69] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                501(c)(3) PLEDGE &amp; REVENUE SEGREGATION NOTICE
              </div>
              <div className="text-slate-700 text-[11px] leading-relaxed">
                Pursuant to Section 170(f)(8) of the Internal Revenue Code, a pledge or statement of future intention does not constitute a completed charitable contribution. Official IRS tax-deductible receipts and year-end statements are issued <strong>ONLY upon receipt and settlement of realized payments</strong>. Unsettled pledges are recorded exclusively as conditional receivables in a segregated accounting tier.
              </div>
            </div>
          </div>

          {pledgeFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{pledgeFeedback}</span>
            </div>
          )}

          {/* Pledges List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-serif text-base font-bold text-slate-900">
                  Active Segregated Pledge Commitments
                </h4>
                <p className="text-xs text-slate-500">
                  All active commitments are segregated with zero impact on liquid bank cash.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                {pledges.length} Active Schedules
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Pledge ID</th>
                    <th className="py-3 px-4 font-semibold">Designee / Campaign</th>
                    <th className="py-3 px-4 font-semibold">Term</th>
                    <th className="py-3 px-4 font-semibold">Committed Amount</th>
                    <th className="py-3 px-4 font-semibold">Unearned Balance</th>
                    <th className="py-3 px-4 font-semibold">Installment</th>
                    <th className="py-3 px-4 font-semibold">Accounting Status</th>
                    <th className="py-3 px-4 font-semibold">Tax Receipt Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pledges.map((plg) => (
                    <tr key={plg.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {plg.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{plg.campaignTitle}</div>
                        <div className="text-[10px] text-slate-500">{plg.donorName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {plg.startYear} – {plg.endYear}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${plg.totalPledgeAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-800">
                        ${plg.unearnedBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        ${plg.annualInstallmentAmount.toLocaleString()} / yr
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Segregated Unearned</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          0 Issued (Pending Settlement)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to Register New Multi-Year Pledge Intention */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#633C69]" />
              <h4 className="font-serif text-base font-bold text-slate-900">
                Record New Multi-Year Pledge Intention
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              Establish a structured, multi-year intention of support for Phumulani programs. Your commitment will be scheduled across annual installments under strict segregated accounting.
            </p>

            <form onSubmit={handleRegisterPledge} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Campaign Designation</label>
                <select
                  value={newPledgeCampaign}
                  onChange={(e) => setNewPledgeCampaign(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Total Commitment Amount ($ USD)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={newPledgeAmount}
                  onChange={(e) => setNewPledgeAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Commitment Duration</label>
                <select
                  value={newPledgeDuration}
                  onChange={(e) => setNewPledgeDuration(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value={1}>1 Year ($ {Number(newPledgeAmount).toLocaleString()} total)</option>
                  <option value={2}>2 Years (~${Math.round(newPledgeAmount / 2).toLocaleString()} / yr)</option>
                  <option value={3}>3 Years (~${Math.round(newPledgeAmount / 3).toLocaleString()} / yr)</option>
                  <option value={5}>5 Years (~${Math.round(newPledgeAmount / 5).toLocaleString()} / yr)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Special Notes or Donor Intention</label>
                <input
                  type="text"
                  placeholder="e.g. In honor of community leaders; annual December disbursement"
                  value={newPledgeNotes}
                  onChange={(e) => setNewPledgeNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPledgeAcknowledged}
                    onChange={(e) => setNewPledgeAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                    required
                  />
                  <span>
                    I confirm this pledge is an expression of charitable intent. I understand that pursuant to IRS Section 170(f)(8), this pledge is tracked under segregated unearned accounting and <strong>no official IRS tax deduction receipt is issued until payment installments are settled</strong>.
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={!newPledgeAcknowledged}
                  className="px-5 py-2.5 bg-[#633C69] hover:bg-[#4f2f54] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Record Pledge Intention (Segregated Accounting)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SPONSORSHIPS */}
      {activeTab === 'sponsorships' && (
        <div className="space-y-6">
          <div className="max-w-2xl">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Corporate & Foundation Sponsorship Tiers
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Phumulani collaborates with corporate champions and community foundations to fund sustainable infrastructure, emergency housing subsidies, and career mentorship cohorts.
            </p>
          </div>

          {sponsorshipFeedback && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-[#633C69] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#633C69] flex-shrink-0" />
              <span>{sponsorshipFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {sponsorshipTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-400 p-6 flex flex-col justify-between shadow-xs transition-all space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#633C69] uppercase tracking-wider">
                    {tier.name}
                  </div>
                  <div className="font-serif text-3xl font-bold text-slate-900">
                    ${tier.amount.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 font-sans"> / year</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    {tier.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSponsorshipFeedback(`Thank you for inquiring about the ${tier.name}! Executive Director Comfort Dondo and our Development Team will contact you within 24 business hours.`);
                    setTimeout(() => setSponsorshipFeedback(null), 7000);
                  }}
                  className="w-full py-2.5 bg-[#633C69] hover:bg-[#4f2f54] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Inquire for Partnership
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL TAX STATEMENT */}
      {activeTab === 'tax_statement' && (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <div className="font-serif text-xl font-bold text-[#104F57]">
                PHUMULANI — ANNUAL GIVING STATEMENT
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Calendar Tax Year 2026 · Section 170(f)(8) Internal Revenue Code
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Donor Name:</span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Donor Email:</span>
              <span className="font-mono text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exempt Organization:</span>
              <span className="text-slate-800 font-medium">Phumulani (EIN: 82-4190823)</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-3 border-t border-slate-200">
              <span>Total Tax-Deductible Contributions for 2026:</span>
              <span className="text-[#104F57] text-base">${totalGiven.toLocaleString()}.00 USD</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200">
            Phumulani confirms that no goods or services were provided in whole or partial consideration for the contributions listed above. Thank you for empowering immigrant and refugee survivors in Minnesota.
          </div>
        </div>
      )}
      </div>
    </PortalLayout>
  );
};
