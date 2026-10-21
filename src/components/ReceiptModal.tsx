/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official 501(c)(3) Donation Receipt & Tax Acknowledgment Component
 */

import React from 'react';
import { Donation } from '../types';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

interface ReceiptModalProps {
  donation: Donation | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Actions Bar */}
        <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#104F57]" />
            <span>Verified 501(c)(3) Tax Receipt #{donation.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Printable Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="font-serif text-2xl font-bold text-[#104F57]">PHUMULANI</div>
              <div className="text-xs text-slate-500 mt-1">
                A 501(c)(3) Non-Profit Public Charity Organization<br />
                EIN: 82-4190823 · Minnesota, USA<br />
                info@phumulani.org · https://phumulani.org
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>TAX-DEDUCTIBLE GIFT</span>
              </span>
              <div className="text-xs text-slate-500 mt-2">
                Receipt Date: {new Date(donation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Receipt Number:</span>
              <span className="font-mono font-bold text-slate-800">{donation.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Transaction ID (Provider Verified):</span>
              <span className="font-mono text-slate-700">{donation.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Donor Name:</span>
              <span className="font-semibold text-slate-800">
                {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Donor Email:</span>
              <span className="text-slate-700">{donation.donorEmail}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Designated Campaign:</span>
              <span className="font-medium text-[#104F57]">{donation.campaignTitle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Payment Method:</span>
              <span className="text-slate-700">{donation.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Giving Frequency:</span>
              <span className="capitalize text-slate-800">{donation.frequency.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-slate-800">Total Gift Amount:</span>
              <span className="text-xl font-bold text-[#104F57]">${donation.amount.toLocaleString()}.00 USD</span>
            </div>
          </div>

          {/* Legal / IRS Declaration */}
          <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-4 space-y-2">
            <p>
              Thank you for your generous contribution to Phumulani. No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits.
            </p>
            <p>
              Phumulani is recognized as a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code. Contributions are tax-deductible to the fullest extent permitted by federal and Minnesota law. Please retain this receipt for your tax records.
            </p>
          </div>

          {/* Signature line */}
          <div className="pt-4 flex justify-between items-end text-xs">
            <div>
              <div className="font-serif italic text-lg text-slate-700">Comfort Dondo</div>
              <div className="text-[11px] text-slate-500">Founder & Executive Director, Phumulani</div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              Reconciled: {donation.reconciled ? 'Verified in Financial Ledger' : 'Pending settlement'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
