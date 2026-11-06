import React from 'react';
import { ShieldCheck, Heart, Phone, ExternalLink, LifeBuoy } from 'lucide-react';
import { PhumulaniLogo } from './branding/PhumulaniLogo';
import { BrandPatternDivider } from './branding/BrandPatternDivider';

interface FooterProps {
  onViewChange: (view: string) => void;
  onOpenMediaRegistry?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange, onOpenMediaRegistry }) => {
  return (
    <footer className="bg-[#004A4C] text-slate-200 border-t border-[#00383A] text-xs no-print font-lato">
      {/* African Geometric Mosaic Pattern Accent Ribbon */}
      <BrandPatternDivider height={6} />

      {/* Emergency Hotline Bar */}
      <div className="bg-[#003D3F] text-white py-3 px-4 border-b border-[#003234]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-heading">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Phone className="w-4 h-4 text-[#F4B400]" />
            <span className="font-semibold text-white break-words">Immediate Domestic Violence Support:</span>
            <span className="text-teal-100 min-w-0 break-words">Minnesota Day One Crisis Line: <strong className="text-white">1-866-223-1111</strong> (Call or Text 24/7)</span>
          </div>
          <button
            onClick={() => window.location.replace('https://weather.com')}
            className="text-[11px] bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <span>Safe Exit</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="bg-white/95 p-2 rounded-xl inline-block shadow-xs border border-white/20">
              <PhumulaniLogo
                variant="full"
                className="h-10 w-auto max-w-[220px]"
                alt="Phumulani — The voice of immigrants and refugees in America"
              />
            </div>
            <p className="text-teal-100/90 text-xs leading-relaxed font-sans">
              Phumulani is a Zulu word meaning &quot;lover of peace&quot;. Empowering immigrant and refugee survivors through trauma-informed healing, culturally grounded advocacy, stable housing, and economic independence.
            </p>
            <div className="space-y-1 text-[11px] text-teal-100/90 font-sans">
              <div className="text-[#F4B400] font-semibold font-heading">
                Comfort Dondo, Founder &amp; Executive Director
              </div>
              <div>Phone: <a href="tel:6122519421" className="text-white hover:underline">612-251-9421</a></div>
              <div>Inquiries: <a href="mailto:info@phumulani.org" className="text-white hover:underline">info@phumulani.org</a></div>
              <div>Minneapolis–Saint Paul, Minnesota</div>
            </div>
          </div>

          {/* Col 2: Programs from phumulani.org */}
          <div>
            <div className="text-[#F4B400] font-bold mb-3 tracking-wider uppercase text-[11px] font-heading">
              Verified Programs
            </div>
            <ul className="space-y-2 text-teal-100/85 font-sans">
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
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Platform Applications
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onViewChange('community')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Community & Volunteer Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('donor')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Donor & Sponsor Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('staff')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Staff Command Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('governance')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Executive & Board Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('ai-workforce')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  AI Workforce Center (18 Agents)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange('readiness')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Production Readiness (12 Gates)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Trust & Confidentiality
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Isolated survivor boundary with zero general AI retrieval</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Phumulani is a recognized 501(c)(3) nonprofit charity. Contributions are tax-deductible. Target accessibility: WCAG 2.2 AA compliant.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between text-slate-400 gap-3">
          <div>
            © {new Date().getFullYear()} Phumulani (Minnesota African Women Against Violence). All rights reserved. Registered 501(c)(3) public charity.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            {onOpenMediaRegistry && (
              <button
                onClick={onOpenMediaRegistry}
                className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>Media Preservation Registry</span>
              </button>
            )}
            <span>Safe Exit Protected</span>
            <span>·</span>
            <span>Zero Tracking on Safe Pages</span>
            <span>·</span>
            <span>Human-Supervised AI Workforce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
