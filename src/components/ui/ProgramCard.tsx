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
        return <Shield className="w-4 h-4 text-phumulani-earth" />;
      case 'workforce':
        return <Briefcase className="w-4 h-4 text-phumulani-earth" />;
      case 'financial_literacy':
        return <TrendingUp className="w-4 h-4 text-phumulani-earth" />;
      case 'mentorship':
        return <HeartHandshake className="w-4 h-4 text-phumulani-earth" />;
      case 'housing':
        return <Home className="w-4 h-4 text-phumulani-earth" />;
      case 'entrepreneurship':
        return <Sparkles className="w-4 h-4 text-phumulani-earth" />;
      case 'community_outreach':
        return <Users className="w-4 h-4 text-phumulani-earth" />;
      case 'wellness':
        return <Heart className="w-4 h-4 text-phumulani-earth" />;
      default:
        return <Shield className="w-4 h-4 text-phumulani-earth" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-phumulani-charcoal/12 overflow-hidden flex flex-col justify-between hover:border-phumulani-earth/40 hover:shadow-md transition-all group ${className}`}
    >
      {program.imageSrc && (
        <div className="aspect-[4/3] w-full bg-phumulani-cream overflow-hidden border-b border-phumulani-cream relative">
          <SafeImage
            src={program.imageSrc}
            fallbackSrc={program.fallbackSrc || '/images/programs/community-wellness.svg'}
            fallbackType="program"
            fallbackText={program.name}
            alt={program.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-phumulani-earth text-[11px] font-bold font-heading uppercase tracking-wider min-w-0">
              {getIcon(program.slug)}
              <span className="truncate">{program.tagline || 'Core Program'}</span>
            </div>
            {program.isFundingDependent && (
              <span className="text-[10px] font-heading font-semibold text-phumulani-earth shrink-0">
                Funding-Dependent
              </span>
            )}
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold text-phumulani-charcoal group-hover:text-phumulani-earth transition-colors leading-snug">
              {program.name}
            </h3>
            <p className="text-xs text-phumulani-charcoal/90 mt-2 leading-relaxed">
              {program.description}
            </p>
          </div>

          {program.isFundingDependent && program.fundingNotice && (
            <div className="bg-phumulani-cream border border-phumulani-gold/60 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-phumulani-charcoal">
              <AlertCircle className="w-3.5 h-3.5 text-phumulani-earth shrink-0 mt-0.5" />
              <span>{program.fundingNotice}</span>
            </div>
          )}

          {program.keyServices && program.keyServices.length > 0 && (
            <div className="pt-2.5 space-y-1.5 border-t border-phumulani-cream">
              <div className="text-[11px] font-semibold font-heading text-phumulani-charcoal">
                Key Services:
              </div>
              <ul className="text-[11px] text-phumulani-charcoal space-y-1">
                {program.keyServices.slice(0, 3).map((service, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-phumulani-green shrink-0" />
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
            className="w-full mt-2 py-2.5 px-3 bg-phumulani-cream hover:bg-phumulani-earth text-phumulani-earth hover:text-white border border-phumulani-earth/30 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
