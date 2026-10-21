/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donor and Sponsor Portal (Application 3)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { Donation, User } from '../types';
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

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'sponsorships' | 'tax_statement'>('overview');

  // Filter donations for current user if donor, or show all in demo
  const userDonations = donations;

  const totalGiven = userDonations
    .filter((d) => d.status === 'succeeded')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeRecurring = userDonations.filter(
    (d) => d.frequency === 'monthly' && d.status === 'succeeded'
  ).length;

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
              Thank you for your partnership, {currentUser.name}
            </h1>
            <p className="text-xs text-purple-100/90 max-w-xl">
              Review your 501(c)(3) tax receipts, download annual statements, manage recurring gifts, and track the direct impact of your generosity.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[120px]">
              <div className="font-serif text-xl font-bold text-amber-300">
                ${totalGiven.toLocaleString()}
              </div>
              <div className="text-[10px] text-purple-200 mt-0.5">Total Contributions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[120px]">
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
                    alert(`Thank you for your interest in the ${tier.name}! Our Executive Director, Comfort Dondo, and Development Team will connect with you.`);
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
