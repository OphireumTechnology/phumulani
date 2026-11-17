/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Global Public Footer Component
 */

import React from 'react';
import {
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  Layers3,
  BookOpen,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { PhumulaniLogo } from './branding/PhumulaniLogo';
import { BrandPatternDivider } from './branding/BrandPatternDivider';

interface FooterProps {
  onViewChange: (view: string) => void;
  onOpenMediaRegistry?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange, onOpenMediaRegistry }) => {
  return (
    <footer className="bg-phumulani-charcoal text-phumulani-cream text-xs no-print">
      {/* Cultural Geometric Divider Trim */}
      <BrandPatternDivider variant="ribbon" height={5} />

      {/* Emergency Hotline Bar */}
      <div className="bg-phumulani-earth text-white py-3.5 px-4 border-b border-phumulani-charcoal/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-heading">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <PhoneCall className="w-4 h-4 text-phumulani-gold shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="font-semibold text-white break-words">Immediate Domestic Violence Support:</span>
            <span className="text-phumulani-cream min-w-0 break-words">
              Minnesota Day One Crisis Line:{' '}
              <strong className="text-white tabular-nums">1-866-223-1111</strong> (Call or Text 24/7)
            </span>
          </div>
          <button
            onClick={() => window.location.replace('https://weather.com')}
            className="text-[11px] bg-phumulani-charcoal hover:bg-phumulani-earth text-white border border-phumulani-cream/40 px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-colors duration-150 shadow-xs focus-visible:ring-2 focus-visible:ring-phumulani-gold"
          >
            <span>Safe Exit</span>
            <ExternalLink className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-xs border border-phumulani-cream/50">
              <PhumulaniLogo
                variant="full"
                className="h-10 w-auto max-w-[220px]"
                alt="Phumulani — The voice of immigrants and refugees in America"
              />
            </div>
            <p className="text-phumulani-cream/90 text-xs leading-relaxed">
              Phumulani is a Zulu word meaning &quot;lover of peace&quot;. Empowering immigrant and refugee survivors through trauma-informed healing, culturally grounded advocacy, stable housing, and economic independence.
            </p>
            <div className="space-y-1.5 text-[11px] text-phumulani-cream pt-1">
              <div className="text-phumulani-gold font-semibold font-heading">
                Comfort Dondo, Founder &amp; Executive Director
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-phumulani-teal shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <a href="tel:6122519421" className="text-white hover:underline underline-offset-2 tabular-nums">
                  612-251-9421
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-phumulani-teal shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <a href="mailto:info@phumulani.org" className="text-white hover:underline underline-offset-2">
                  info@phumulani.org
                </a>
              </div>
              <div>Minneapolis–Saint Paul, Minnesota</div>
            </div>
          </div>

          {/* Col 2: Verified Programs */}
          <div>
            <div className="text-phumulani-gold font-bold mb-3.5 tracking-wider uppercase text-[11px] font-heading flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-phumulani-gold shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Verified Programs</span>
            </div>
            <ul className="space-y-2 text-phumulani-cream/90 leading-snug">
              <li>Trauma-Informed Healing &amp; Wellness</li>
              <li>Case Management &amp; Legal Advocacy</li>
              <li>Safe Housing &amp; The Healing Home</li>
              <li>Workforce &amp; Career Pathways</li>
              <li>Financial Literacy &amp; Coaching</li>
              <li>Women Entrepreneurship (Funding-Dependent Microloans)</li>
              <li>Youth Leadership &amp; Mentoring</li>
              <li>Community Outreach &amp; Ubuntu Support</li>
            </ul>
          </div>

          {/* Col 3: Connected Applications */}
          <div>
            <div className="text-white font-semibold mb-3.5 tracking-wider uppercase text-[11px] font-heading flex items-center gap-1.5">
              <Layers3 className="w-3.5 h-3.5 text-phumulani-teal shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Platform Applications</span>
            </div>
            <ul className="space-y-2.5">
              {[
                { id: 'community', label: 'Community & Volunteer Hub' },
                { id: 'donor', label: 'Donor & Sponsor Portal' },
                { id: 'staff', label: 'Staff Command Center' },
                { id: 'governance', label: 'Executive & Board Governance' },
                { id: 'ai-workforce', label: 'AI Workforce Center (18 Agents)' },
                { id: 'readiness', label: 'Production Readiness (12 Gates)' },
              ].map((portal) => (
                <li key={portal.id}>
                  <button
                    onClick={() => onViewChange(portal.id)}
                    className="hover:text-phumulani-gold hover:underline underline-offset-4 transition-colors duration-150 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-gold rounded"
                  >
                    {portal.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3.5">
            <div className="text-white font-semibold mb-3.5 tracking-wider uppercase text-[11px] font-heading flex items-center gap-1.5">
              <LockKeyhole className="w-3.5 h-3.5 text-phumulani-green shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Trust &amp; Confidentiality</span>
            </div>
            <div className="flex items-start gap-2.5 text-white bg-phumulani-charcoal p-3.5 rounded-xl border border-phumulani-teal/40">
              <ShieldCheck className="w-4 h-4 text-phumulani-green shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
              <span className="leading-relaxed">
                Isolated survivor boundary with zero general AI retrieval (VAWA § 1367).
              </span>
            </div>
            <p className="text-[11px] text-phumulani-cream/90 leading-relaxed">
              Phumulani is a recognized 501(c)(3) nonprofit charity. Contributions are tax-deductible. Target accessibility: WCAG 2.2 AA compliant.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-phumulani-cream/15 flex flex-wrap items-center justify-between text-phumulani-cream/90 gap-3">
          <div>
            © {new Date().getFullYear()} Phumulani (Minnesota African Women Against Violence). All rights reserved. Registered 501(c)(3) public charity.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            {onOpenMediaRegistry && (
              <button
                onClick={onOpenMediaRegistry}
                className="text-phumulani-gold hover:text-white font-semibold underline underline-offset-4 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-gold rounded"
              >
                <span>Media Preservation Registry</span>
              </button>
            )}
            <span>Safe Exit Protected</span>
            <span aria-hidden="true">·</span>
            <span>Zero Tracking on Safe Pages</span>
            <span aria-hidden="true">·</span>
            <span>Human-Supervised AI Workforce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
