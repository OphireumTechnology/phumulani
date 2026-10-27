/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Restricted Funds & Allocation Control (M26.09)
 */

import React, { useState } from 'react';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Building2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import { RestrictedFundRecord } from '../../../types/fundingCommand';

interface RestrictedFundsTabProps {
  currentUser: any;
}

export const RestrictedFundsTab: React.FC<RestrictedFundsTabProps> = ({ currentUser }) => {
  const fundingService = FundingCommandService.getInstance();
  const [funds, setFunds] = useState<RestrictedFundRecord[]>(fundingService.getRestrictedFunds());

  // Record Expenditure Modal State
  const [selectedFund, setSelectedFund] = useState<RestrictedFundRecord | null>(null);
  const [expenditureProgramId, setExpenditureProgramId] = useState('PROG-001');
  const [expenditureAmount, setExpenditureAmount] = useState(2500);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenditureError, setExpenditureError] = useState<string | null>(null);
  const [expenditureSuccess, setExpenditureSuccess] = useState<string | null>(null);

  const totalRestrictedAwarded = funds.reduce((sum, f) => sum + f.totalRestrictedAmount, 0);
  const totalExpended = funds.reduce((sum, f) => sum + f.expendedAmount, 0);
  const totalRemainingBalance = funds.reduce((sum, f) => sum + f.remainingBalance, 0);

  const handleOpenExpenditureModal = (fund: RestrictedFundRecord) => {
    setSelectedFund(fund);
    setExpenditureProgramId(fund.allocatedProgramId);
    setExpenditureError(null);
    setExpenditureSuccess(null);
    setExpenseCategory('Program Supplies & Materials');
  };

  const handleRecordExpenditure = () => {
    if (!selectedFund) return;
    setExpenditureError(null);
    try {
      const updated = fundingService.recordRestrictedAllocation(
        selectedFund.id,
        expenditureProgramId,
        expenditureAmount,
        expenseCategory,
        currentUser
      );
      setExpenditureSuccess(`Recorded $${expenditureAmount.toLocaleString()} against ${updated.allocatedProgramId}. Remaining balance: $${updated.remainingBalance.toLocaleString()}.`);
      setFunds(fundingService.getRestrictedFunds());
      setTimeout(() => setSelectedFund(null), 1500);
    } catch (err: any) {
      setExpenditureError(err.message || 'Expenditure failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
              M26.09 Fiduciary Compliance
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded uppercase">
              Anti-Commingling Ledger
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Restricted Funds & Program Allocation Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict program isolation for grants and restricted gifts. Prohibits commingling restricted funds with general operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
            <span className="text-amber-800 font-medium">Unexpended Restricted Balance:</span>
            <p className="text-lg font-bold font-mono text-amber-950 mt-0.5">
              ${totalRemainingBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Restricted Awarded</span>
          <p className="text-xl font-serif font-bold text-slate-900 mt-1">
            ${totalRestrictedAwarded.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {funds.length} program allocations</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Expended to Date</span>
          <p className="text-xl font-serif font-bold text-teal-800 mt-1">
            ${totalExpended.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified program disbursements</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Anti-Commingling Firewall</span>
          <p className="text-xl font-serif font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            100% Enforced
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero cross-program fund commingling</p>
        </div>
      </div>

      {/* Restricted Funds List */}
      <div className="space-y-4">
        {funds.map((fund) => {
          const percentSpent = Math.min(100, Math.round((fund.expendedAmount / fund.totalRestrictedAmount) * 100));
          return (
            <div
              key={fund.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {fund.id}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {fund.allocatedProgramId}: {fund.allocatedProgramName}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {fund.spendDownStatus}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    {fund.sourceFunderOrDonor}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                    {fund.restrictionTerms}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenExpenditureModal(fund)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Record Program Spend
                </button>
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">
                    Expended: ${fund.expendedAmount.toLocaleString()} ({percentSpent}%)
                  </span>
                  <span className="text-slate-900 font-bold">
                    Remaining: ${fund.remainingBalance.toLocaleString()} of ${fund.totalRestrictedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentSpent}%` }}
                  />
                </div>
              </div>

              {/* Prohibited unallowable expenses */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs flex flex-wrap items-center gap-2 text-rose-900">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-semibold">Unallowable Funder Expenses:</span>
                {fund.unallowableExpenses.map((u) => (
                  <span key={u} className="bg-rose-100 px-1.5 py-0.2 rounded font-mono text-[10px]">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Expenditure Modal */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-slate-900">
                Record Restricted Program Expenditure
              </h3>
              <button onClick={() => setSelectedFund(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p><strong>Fund:</strong> {selectedFund.id} ({selectedFund.sourceFunderOrDonor})</p>
              <p><strong>Authorized Program:</strong> {selectedFund.allocatedProgramId} ({selectedFund.allocatedProgramName})</p>
              <p><strong>Available Balance:</strong> ${selectedFund.remainingBalance.toLocaleString()}</p>
            </div>

            {expenditureError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{expenditureError}</span>
              </div>
            )}

            {expenditureSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{expenditureSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Community Program:
                </label>
                <select
                  value={expenditureProgramId}
                  onChange={(e) => setExpenditureProgramId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="PROG-001">PROG-001: Youth Mentorship & Violence Prevention</option>
                  <option value="PROG-002">PROG-002: Immigrant Family Economic Self-Sufficiency</option>
                  <option value="PROG-003">PROG-003: Healing Circles & Trauma Recovery</option>
                  <option value="PROG-004">PROG-004: Health Navigator & Wellness Access</option>
                  <option value="PROG-005">PROG-005: Legal Rights & System Advocacy</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Anti-commingling rule will automatically block disbursement if program does not match legal restriction.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disbursement Amount ($):
                </label>
                <input
                  type="number"
                  value={expenditureAmount}
                  onChange={(e) => setExpenditureAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Description & Category:
                </label>
                <input
                  type="text"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="e.g. Bilingual educational curriculum printing"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFund(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordExpenditure}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Validate & Disburse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
