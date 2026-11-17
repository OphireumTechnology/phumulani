/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PageHero — Official Reusable Balanced Two-Column Hero Component
 * Authentic visual presentation with official branding tokens
 */

import React from 'react';
import { Heart, Users, LifeBuoy } from 'lucide-react';
import { SafeImage } from '../SafeImage';

const FOUNDER_IMAGE = '/images/leadership/phumulani-founder-official.png';

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
  imageSrc = '/images/home/phumulani-homepage-hero.webp',
  fallbackImageSrc = '/media/homepage/phumulani-homepage-hero.webp',
  imageAlt = 'Three empowered women from diverse immigrant and refugee backgrounds standing in solidarity in a sunlit community center overlooking the Minneapolis skyline',
  className = '',
}) => {
  return (
    <section
      className={`bg-phumulani-cream pt-10 sm:pt-14 pb-12 sm:pb-16 border-b border-phumulani-charcoal/12 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Mission & Primary Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="font-heading text-[11px] font-bold tracking-[0.14em] uppercase text-phumulani-earth">
              Minnesota 501(c)(3) · Hope · Empower · Transform
            </div>

            <h1 className="font-heading font-extrabold text-phumulani-earth tracking-tight leading-[1.08] text-[clamp(2.15rem,4vw,3.75rem)] max-w-[1050px] m-0">
              <span className="block">{headline}</span>
              <span className="block text-phumulani-charcoal mt-1.5 sm:mt-2 text-[clamp(1.5rem,2.8vw,2.5rem)] font-bold">
                {supportingHeadline}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-phumulani-charcoal leading-relaxed font-normal max-w-2xl">
              {description}
            </p>

            {/* Standardized 3 Action Pathways with Accessible Targets */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onDonateClick}
                className="min-h-[44px] h-12 bg-phumulani-earth hover:bg-phumulani-charcoal text-white px-5 rounded-lg text-xs sm:text-sm font-heading font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <Heart className="w-4 h-4 shrink-0" />
                <span>Support Our Mission</span>
              </button>

              <button
                onClick={onVolunteerClick}
                className="min-h-[44px] h-12 bg-white hover:bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/40 px-5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <Users className="w-4 h-4 text-phumulani-earth shrink-0" />
                <span>Become a Volunteer or Mentor</span>
              </button>

              <button
                onClick={onHelpClick}
                className="min-h-[44px] h-12 bg-white hover:bg-phumulani-gold text-phumulani-earth hover:text-phumulani-charcoal border border-phumulani-charcoal/20 px-4 rounded-lg text-xs sm:text-sm font-heading font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <LifeBuoy className="w-4 h-4 shrink-0" />
                <span>Need Help? Safe Routing</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Official Community Hero Photography */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-phumulani-charcoal/15 shadow-lg overflow-hidden relative">
              <div className="relative aspect-[16/10] bg-phumulani-cream overflow-hidden border-b border-phumulani-cream group">
                <SafeImage
                  src={imageSrc}
                  fallbackSrc={fallbackImageSrc}
                  fallbackType="hero"
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-phumulani-cream pb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <SafeImage
                      src={FOUNDER_IMAGE}
                      fallbackType="founder"
                      fallbackText="Comfort Dondo"
                      initials="CD"
                      alt="Phumulani Foundation Founder — Official Corporate Portrait"
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-phumulani-charcoal/15 shrink-0"
                      loading="lazy"
                      decoding="async"
                      width={1254}
                      height={1254}
                    />
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-sm text-phumulani-charcoal leading-tight truncate">
                        Comfort Dondo
                      </div>
                      <div className="text-[11px] text-phumulani-earth font-heading font-semibold truncate">
                        Founder &amp; Executive Director
                      </div>
                      <div className="text-[11px] text-phumulani-charcoal/80 truncate">
                        Author of &quot;Facing the Giants&quot;
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-heading font-semibold text-phumulani-earth">
                      Est. 2017 · MN
                    </span>
                  </div>
                </div>

                <p className="font-quote italic text-xs text-phumulani-charcoal leading-relaxed">
                  &ldquo;Phumulani is a Zulu word meaning &apos;lover of peace&apos;. We built this foundation to ensure no immigrant woman walks the path of healing alone.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHero;
