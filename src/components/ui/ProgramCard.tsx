/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ProgramCard — Reusable Authentic Program Component
 * Grounded in phumulani.org verified service areas
 */

import React from 'react';
import {
  Shield,
  Briefcase,
  TrendingUp,
  HeartHandshake,
  Home,
  Sparkles,
  Users,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { SafeImage } from '../SafeImage';

export interface ProgramItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  keyServices: string[];
  beneficiariesCount?: number;
  imageSrc?: string;
  fallbackSrc?: string;
  isFundingDependent?: boolean;
  fundingNotice?: string;
}

export interface ProgramCardProps {
  program: ProgramItem;
  onSelect?: (program: ProgramItem) => void;
  className?: string;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onSelect,
  className = '',
}) => {
  const getIcon = (slug: string) => {
    switch (slug) {
      case 'advocacy':
        return <Shield className="w-4 h-4 text-[#006D6F]" />;
      case 'workforce':
        return <Briefcase className="w-4 h-4 text-[#006D6F]" />;
      case 'financial_literacy':
        return <TrendingUp className="w-4 h-4 text-[#006D6F]" />;
      case 'mentorship':
        return <HeartHandshake className="w-4 h-4 text-[#006D6F]" />;
      case 'housing':
        return <Home className="w-4 h-4 text-[#006D6F]" />;
      case 'entrepreneurship':
        return <Sparkles className="w-4 h-4 text-[#006D6F]" />;
      case 'community_outreach':
        return <Users className="w-4 h-4 text-[#006D6F]" />;
      case 'wellness':
        return <Heart className="w-4 h-4 text-[#006D6F]" />;
      default:
        return <Shield className="w-4 h-4 text-[#006D6F]" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-[#006D6F] hover:shadow-lg transition-all group ${className}`}
    >
      {program.imageSrc && (
        <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100 relative">
          <SafeImage
            src={program.imageSrc}
            fallbackSrc={program.fallbackSrc || '/images/programs/community-wellness.svg'}
            fallbackType="program"
            fallbackText={program.name}
            alt={program.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {program.isFundingDependent && (
            <div className="absolute top-2.5 right-2.5 bg-amber-500/95 text-white px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold shadow-xs">
              Funding-Dependent
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#006D6F] text-xs font-bold font-heading uppercase tracking-wider">
            {getIcon(program.slug)}
            <span className="truncate">{program.tagline || 'Core Program'}</span>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-[#006D6F] transition-colors leading-snug">
              {program.name}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
              {program.description}
            </p>
          </div>

          {program.isFundingDependent && program.fundingNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{program.fundingNotice}</span>
            </div>
          )}

          {program.keyServices && program.keyServices.length > 0 && (
            <div className="pt-2 space-y-1.5 border-t border-slate-100">
              <div className="text-[11px] font-semibold font-heading text-slate-700">
                Key Services:
              </div>
              <ul className="text-[11px] text-slate-500 space-y-1 font-sans">
                {program.keyServices.slice(0, 3).map((service, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#7A9B29] shrink-0" />
                    <span className="truncate">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(program)}
            className="w-full mt-2 py-2.5 px-3 bg-[#FFF7E6] hover:bg-[#006D6F] text-[#006D6F] hover:text-white border border-amber-200 hover:border-[#006D6F] rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Learn More &amp; Access Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgramCard;
