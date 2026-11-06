/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PageHero — Official Reusable Balanced Two-Column Hero Component
 * Authentic visual presentation with official branding tokens
 */

import React from 'react';
import { Heart, Users, LifeBuoy } from 'lucide-react';
import { SafeImage } from '../SafeImage';

export interface PageHeroProps {
  headline?: string;
  supportingHeadline?: string;
  description?: string;
  onDonateClick?: () => void;
  onVolunteerClick?: () => void;
  onHelpClick?: () => void;
  imageSrc?: string;
  fallbackImageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  headline = 'Restoring Dignity, Safety, and Wholeness',
  supportingHeadline = 'For Immigrant and Refugee Survivors of Violence',
  description = 'Empowering survivors to heal, achieve economic independence, and build brighter futures.',
  onDonateClick,
  onVolunteerClick,
  onHelpClick,
  imageSrc = '/images/branding/phumulani-hero-family.png',
  fallbackImageSrc = '/images/homepage/community-hero.svg',
  imageAlt = 'Joyful African mother in traditional headwrap smiling warmly and embracing her two children against the Minneapolis skyline and Stone Arch Bridge',
  className = '',
}) => {
  return (
    <section
      className={`bg-gradient-to-b from-[#FFF7E6] via-white to-[#FFF7E6]/40 pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-teal-100/80 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Mission & Primary Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center text-xs font-semibold text-[#006D6F] bg-white border border-teal-200 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="font-heading tracking-wide uppercase text-[11px]">
                MINNESOTA 501(C)(3) · THE VOICE OF IMMIGRANTS &amp; REFUGEES
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-[#006D6F] tracking-tight leading-[1.08] text-[clamp(2.15rem,4vw,3.75rem)] max-w-[1050px] m-0">
              <span className="block">{headline}</span>
              <span className="block text-[#F05A28] mt-1 sm:mt-2 text-[clamp(1.6rem,3vw,2.75rem)]">
                {supportingHeadline}
              </span>
            </h1>

            <div className="border-l-4 border-[#F05A28] pl-4 py-1 bg-white/70 rounded-r-lg">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans font-normal max-w-2xl">
                {description}
              </p>
            </div>

            {/* Standardized 3 Action Pathways with Accessible Targets */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onDonateClick}
                className="min-h-[44px] h-12 bg-[#F05A28] hover:bg-[#d94819] text-white px-5 rounded-lg text-xs sm:text-sm font-heading font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F05A28]"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                <span>Support Our Mission</span>
              </button>

              <button
                onClick={onVolunteerClick}
                className="min-h-[44px] h-12 bg-white hover:bg-[#FFF7E6] text-[#006D6F] border-2 border-[#006D6F] px-5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006D6F]"
              >
                <Users className="w-4 h-4 text-[#006D6F]" />
                <span>Become a Volunteer or Mentor</span>
              </button>

              <button
                onClick={onHelpClick}
                className="min-h-[44px] h-12 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-4 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
              >
                <LifeBuoy className="w-4 h-4 text-rose-600" />
                <span>Need Help? Safe Routing</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Official Community Hero Photography */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-teal-200/90 shadow-xl overflow-hidden relative space-y-4">
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-teal-100 group">
                <SafeImage
                  src={imageSrc}
                  fallbackSrc={fallbackImageSrc}
                  fallbackType="hero"
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-[#006D6F]/90 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-heading font-bold border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#7A9B29] animate-pulse" />
                  <span>Culturally Grounded Sanctuary</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src="/images/leadership/comfort-dondo.svg"
                      fallbackSrc="/media/founder/comfort-dondo-official-portrait.svg"
                      fallbackType="founder"
                      fallbackText="Comfort Dondo"
                      alt="Comfort Dondo, Executive Director & Founder of Phumulani"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#006D6F] shadow-xs"
                    />
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
                        Comfort Dondo
                      </div>
                      <div className="text-[11px] text-[#006D6F] font-heading font-semibold">
                        Founder &amp; Executive Director
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        Author of &quot;Saving Myself&quot;
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-[#FFF7E6] text-[#006D6F] border border-amber-300 rounded-full text-[10px] font-heading font-bold">
                      Est. 2017 · MN 501(c)(3)
                    </span>
                  </div>
                </div>

                <div className="bg-[#FFF7E6]/70 rounded-xl p-3 border border-amber-200/80">
                  <p className="font-quote italic text-xs text-slate-700 leading-relaxed">
                    &ldquo;Phumulani is a Zulu word meaning &apos;lover of peace&apos;. We built this foundation to ensure no immigrant woman walks the path of healing alone.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHero;
