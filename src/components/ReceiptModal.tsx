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
      <div className="bg-white rounded-2xl max-w-xl w-full border border-phumulani-earth shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Actions Bar */}
        <div className="bg-phumulani-cream p-3 flex items-center justify-between border-b border-phumulani-gold no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-phumulani-earth">
            <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
            <span className="font-heading">Verified 501(c)(3) Tax Receipt #{donation.receiptNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-phumulani-gold text-phumulani-charcoal border border-phumulani-earth rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Printable Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-phumulani-charcoal">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-phumulani-cream pb-6">
            <div>
              <PhumulaniLogo variant="full" className="h-10 w-auto mb-2" />
              <div className="text-xs text-phumulani-charcoal mt-1">
                A 501(c)(3) Non-Profit Public Charity Organization<br />
                EIN: 82-4190823 · Minnesota, USA<br />
                info@phumulani.org · https://phumulani.org
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-phumulani-charcoal bg-phumulani-green border border-phumulani-charcoal px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-charcoal" />
                <span className="font-heading">TAX-DEDUCTIBLE GIFT</span>
              </span>
              <div className="text-xs text-phumulani-charcoal mt-2">
                Receipt Date: {new Date(donation.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-phumulani-cream rounded-xl p-5 border border-phumulani-earth space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Receipt Number:</span>
              <span className="font-mono font-bold text-phumulani-charcoal">{donation.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Transaction ID (Provider Verified):</span>
              <span className="font-mono text-phumulani-charcoal">{donation.transactionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Donor Name:</span>
              <span className="font-semibold text-phumulani-charcoal">
                {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Donor Email:</span>
              <span className="text-phumulani-charcoal">{donation.donorEmail}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Designated Campaign:</span>
              <span className="font-medium text-phumulani-earth">{donation.campaignTitle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Payment Method:</span>
              <span className="text-phumulani-charcoal">{donation.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white">
              <span className="text-phumulani-charcoal">Giving Frequency:</span>
              <span className="capitalize text-phumulani-charcoal">{donation.frequency.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-phumulani-charcoal font-heading">Total Gift Amount:</span>
              <span className="text-xl font-extrabold text-phumulani-earth font-heading">${donation.amount.toLocaleString()}.00 USD</span>
            </div>
          </div>

          {/* Legal / IRS Declaration */}
          <div className="text-[11px] text-phumulani-charcoal leading-relaxed border-t border-phumulani-cream pt-4 space-y-2">
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
              <div className="font-serif italic text-lg text-phumulani-earth">Comfort Dondo</div>
              <div className="text-[11px] text-phumulani-charcoal">Founder & Executive Director, Phumulani</div>
            </div>
            <div className="text-right text-[10px] text-phumulani-charcoal font-mono">
              Reconciled: {donation.reconciled ? 'Verified in Financial Ledger' : 'Pending settlement'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
