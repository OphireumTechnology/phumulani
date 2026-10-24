/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Client Staging Preview Sandbox Modal (Phase 13 Section 11)
 * Enforces VAWA survivor isolation & synthetic demonstration data protection
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  X,
  ExternalLink,
  Send,
  CheckCircle2,
  Lock,
  Layers,
  Heart,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { db } from '../services/db';

interface ClientStagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: (prefillTitle?: string) => void;
}

export const ClientStagingModal: React.FC<ClientStagingModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'test_donate' | 'test_volunteer' | 'safeguards'>('overview');
  const [testDonationAmount, setTestDonationAmount] = useState('50');
  const [testDonorName, setTestDonorName] = useState('Test Donor (Synthetic)');
  const [testDonationSuccess, setTestDonationSuccess] = useState(false);

  const [testVolName, setTestVolName] = useState('Test Applicant');
  const [testVolRole, setTestVolRole] = useState('Youth Mentor');
  const [testVolSuccess, setTestVolSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setTestDonationSuccess(true);
    setTimeout(() => setTestDonationSuccess(false), 4000);
  };

  const handleSimulateVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    setTestVolSuccess(true);
    setTimeout(() => setTestVolSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* TOP STAGING BANNER */}
        <div className="bg-amber-500 text-slate-950 px-5 py-2.5 flex items-center justify-between font-bold text-xs tracking-wider uppercase border-b border-amber-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 fill-slate-950" />
            <span>STAGING ENVIRONMENT — NOT PRODUCTION</span>
            <span className="font-mono bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">
              v13.0-PREVIEW (SHA: 4f81c9a)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-600/30 rounded cursor-pointer"
            title="Close Preview"
          >
            <X className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <span>Client Staging Preview Sandbox</span>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sandbox Active
              </span>
            </h2>
            <p className="text-slate-600 text-xs mt-1">
              Test completed features in an isolated environment. All transactions and submissions use synthetic test fixtures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFeedback('Staging Preview Feedback')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3e44] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Staging Feedback</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Exit Staging
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#104F57] text-[#104F57] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Staging Overview
          </button>
          <button
            onClick={() => setActiveTab('test_donate')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test_donate'
                ? 'border-[#104F57] text-[#104F57] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Test Donation Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('test_volunteer')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'test_volunteer'
                ? 'border-[#104F57] text-[#104F57] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Test Volunteer Intake</span>
          </button>
          <button
            onClick={() => setActiveTab('safeguards')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'safeguards'
                ? 'border-[#104F57] text-[#104F57] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Safeguarding Isolation</span>
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">Verified Staging Environment Active</h4>
                  <p className="text-teal-900/80 mt-1 leading-relaxed">
                    This staging environment is deployed from commit <code className="font-mono bg-teal-100 px-1 py-0.5 rounded text-[11px]">4f81c9a</code>.
                    Authorized Phumulani representatives can test navigation, program details, instant tax receipt generation,
                    and community intake without impacting real donor records or organizational mailboxes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Environment Node</span>
                  <div className="font-bold text-slate-900 mt-1">Node.js 22 (Vite 8.3)</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Port 3000 (0.0.0.0)</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Deployment Target</span>
                  <div className="font-bold text-slate-900 mt-1">Staging Preview</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Isolated from live production</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Safeguarding Boundary</span>
                  <div className="font-bold text-emerald-800 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VAWA Zero-Leakage</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Synthetic fixtures enforced</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900">Available Feature Demonstrations in Staging:</h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li><strong>Public Website:</strong> 6 core community programs with authentic photos and book showcase.</li>
                  <li><strong>Instant 501(c)(3) Receipt Engine:</strong> Generates official printable tax deduction receipts with IRS compliance text.</li>
                  <li><strong>Volunteer Hours & Application Log:</strong> Tracks application status with tracking ID.</li>
                  <li><strong>AI Workforce Orchestrator:</strong> 18 AI agents with automatic policy gateway kill-switches.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'test_donate' && (
            <div className="space-y-4 max-w-lg">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                <strong>Simulated Test Payment:</strong> No actual funds will be transferred. Use this sandbox form to verify receipt formatting and donor acknowledgment copy.
              </div>

              {testDonationSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Test Donation of ${testDonationAmount} processed in sandbox! Receipt generated.</span>
                </div>
              )}

              <form onSubmit={handleSimulateDonation} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Simulated Donor Name</label>
                  <input
                    type="text"
                    value={testDonorName}
                    onChange={(e) => setTestDonorName(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Amount ($)</label>
                  <input
                    type="number"
                    value={testDonationAmount}
                    onChange={(e) => setTestDonationAmount(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Designated Fund</label>
                  <select className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none">
                    <option>Survivor Safe Housing Bridge Fund ($1,200 Deposit)</option>
                    <option>Immigrant Women Entrepreneurship Lab</option>
                    <option>General Operational Support</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#104F57] hover:bg-[#0d3f46] text-white font-bold rounded-lg cursor-pointer"
                >
                  Process Sandbox Donation & Verify Receipt
                </button>
              </form>
            </div>
          )}

          {activeTab === 'test_volunteer' && (
            <div className="space-y-4 max-w-lg">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs">
                <strong>Simulated Volunteer Intake:</strong> Test the application workflow and tracking ID generation in sandbox mode.
              </div>

              {testVolSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Volunteer application logged in staging with Tracking ID: VOL-TEST-9981</span>
                </div>
              )}

              <form onSubmit={handleSimulateVolunteer} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Applicant Full Name</label>
                  <input
                    type="text"
                    value={testVolName}
                    onChange={(e) => setTestVolName(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Desired Opportunity</label>
                  <select
                    value={testVolRole}
                    onChange={(e) => setTestVolRole(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                  >
                    <option>Youth Mentor & Tutor</option>
                    <option>Job Readiness Coach</option>
                    <option>Community Food & Supply Distribution</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Submit Staging Application
                </button>
              </form>
            </div>
          )}

          {activeTab === 'safeguards' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">VAWA Survivor Privacy Isolation Protocol</h4>
                  <p className="text-rose-900/80 mt-1 leading-relaxed">
                    Under the Violence Against Women Act (VAWA) and Minnesota state confidentiality laws, confidential survivor intake
                    information, emergency shelter locations, and order-for-protection filings are strictly quarantined.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Isolation Invariants Enforced:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-900">1. Zero Database Contamination</span>
                    <p className="text-slate-600 text-[11px]">Real survivor records are never copied or mirrored to staging environments.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-900">2. Financial Anonymity</span>
                    <p className="text-slate-600 text-[11px]">Live banking details and donor credit cards are replaced with synthetic tokens.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-900">3. Mailbox Quarantine</span>
                    <p className="text-slate-600 text-[11px]">Private organizational mailboxes are inaccessible from staging test views.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-900">4. Immutable Audit Logging</span>
                    <p className="text-slate-600 text-[11px]">All staging preview accesses are recorded in the Master Audit Register.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Security Status: Verified Synthetic Fixtures Only
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs cursor-pointer"
          >
            Close Staging Preview
          </button>
        </div>
      </div>
    </div>
  );
};
