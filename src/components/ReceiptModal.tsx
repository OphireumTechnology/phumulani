/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official 501(c)(3) Donation Receipt & Tax Acknowledgment Component
 */

import React from 'react';
import { Donation } from '../types';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { PhumulaniLogo } from './branding/PhumulaniLogo';
import { BrandPatternDivider } from './branding/BrandPatternDivider';

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
    <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-phumulani-charcoal/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Actions Bar */}
        <div className="bg-phumulani-cream p-3.5 flex items-center justify-between border-b border-phumulani-charcoal/12 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-phumulani-earth">
            <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
            <span className="font-heading tabular-nums">Verified 501(c)(3) Tax Receipt #{donation.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-phumulani-gold/25 text-phumulani-charcoal border border-phumulani-charcoal/15 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close receipt dialog"
              className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Printable Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-phumulani-charcoal">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-phumulani-charcoal/12 pb-6">
            <div>
              <PhumulaniLogo variant="full" className="h-10 w-auto mb-2" />
              <div className="text-xs text-phumulani-charcoal mt-1 leading-relaxed">
                A 501(c)(3) Non-Profit Public Charity Organization<br />
                EIN: <span className="tabular-nums">82-4190823</span> · Minnesota, USA<br />
                info@phumulani.org · https://phumulani.org
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-phumulani-charcoal bg-phumulani-green/15 border border-phumulani-green px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-charcoal" />
                <span className="font-heading">Tax-Deductible Gift</span>
              </span>
              <div className="text-xs text-phumulani-charcoal mt-2 tabular-nums">
                Receipt Date: {new Date(donation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-phumulani-cream/70 rounded-xl p-5 border border-phumulani-charcoal/12 space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Receipt Number</span>
              <span className="font-mono font-bold tabular-nums text-phumulani-charcoal">{donation.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Transaction ID (Provider Verified)</span>
              <span className="font-mono tabular-nums text-phumulani-charcoal">{donation.transactionId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Donor Name</span>
              <span className="font-semibold text-phumulani-charcoal">
                {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Donor Email</span>
              <span className="text-phumulani-charcoal">{donation.donorEmail}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Designated Campaign</span>
              <span className="font-medium text-phumulani-earth">{donation.campaignTitle}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Payment Method</span>
              <span className="text-phumulani-charcoal">{donation.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-phumulani-charcoal/10">
              <span className="text-phumulani-charcoal">Giving Frequency</span>
              <span className="capitalize text-phumulani-charcoal">{donation.frequency.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-phumulani-charcoal font-heading">Total Gift Amount</span>
              <span className="text-xl font-extrabold text-phumulani-earth font-heading tabular-nums">${donation.amount.toLocaleString()}.00 USD</span>
            </div>
          </div>

          {/* Legal / IRS Declaration */}
          <div className="text-[11px] text-phumulani-charcoal leading-relaxed border-t border-phumulani-charcoal/12 pt-4 space-y-2">
            <p>
              Thank you for your generous contribution to Phumulani. No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits.
            </p>
            <p>
              Phumulani is recognized as a tax-exempt organization under Section 501(c)(3) of the Internal Revenue Code. Contributions are tax-deductible to the fullest extent permitted by federal and Minnesota law. Please retain this receipt for your tax records.
            </p>
          </div>

          {/* Signature line */}
          <div className="pt-4 flex flex-wrap justify-between items-end gap-4 text-xs">
            <div>
              <div className="font-display-serif italic text-lg text-phumulani-earth">Comfort Dondo</div>
              <div className="text-[11px] text-phumulani-charcoal">Founder &amp; Executive Director, Phumulani</div>
            </div>
            <div className="text-right text-[10px] text-phumulani-charcoal font-mono tabular-nums">
              Reconciled: {donation.reconciled ? 'Verified in Financial Ledger' : 'Pending settlement'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
