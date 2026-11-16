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
      className={`bg-phumulani-cream pt-8 sm:pt-12 pb-12 sm:pb-16 border-b border-phumulani-gold ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: Mission & Primary Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center text-xs font-semibold text-phumulani-earth bg-white border border-phumulani-earth px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="font-heading tracking-wide uppercase text-[11px]">
                MINNESOTA 501(C)(3) · THE VOICE OF IMMIGRANTS &amp; REFUGEES
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-phumulani-earth tracking-tight leading-[1.08] text-[clamp(2.15rem,4vw,3.75rem)] max-w-[1050px] m-0">
              <span className="block">{headline}</span>
              <span className="block text-phumulani-orange mt-1 sm:mt-2 text-[clamp(1.6rem,3vw,2.75rem)]">
                {supportingHeadline}
              </span>
            </h1>

            <div className="border-l-4 border-phumulani-orange pl-4 py-2 bg-white rounded-r-lg">
              <p className="text-base sm:text-lg text-phumulani-charcoal leading-relaxed font-sans font-normal max-w-2xl">
                {description}
              </p>
            </div>

            {/* Standardized 3 Action Pathways with Accessible Targets */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onDonateClick}
                className="min-h-[44px] h-12 bg-phumulani-earth hover:bg-phumulani-orange text-white px-5 rounded-lg text-xs sm:text-sm font-heading font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <Heart className="w-4 h-4" />
                <span>Support Our Mission</span>
              </button>

              <button
                onClick={onVolunteerClick}
                className="min-h-[44px] h-12 bg-white hover:bg-phumulani-cream text-phumulani-earth border-2 border-phumulani-earth px-5 rounded-lg text-xs sm:text-sm font-heading font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <Users className="w-4 h-4 text-phumulani-earth" />
                <span>Become a Volunteer or Mentor</span>
              </button>

              <button
                onClick={onHelpClick}
                className="min-h-[44px] h-12 bg-white hover:bg-phumulani-gold text-phumulani-earth hover:text-phumulani-charcoal border-2 border-phumulani-earth px-4 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Need Help? Safe Routing</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Official Community Hero Photography */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-phumulani-earth shadow-xl overflow-hidden relative space-y-4">
              <div className="relative aspect-[16/10] bg-phumulani-cream overflow-hidden border-b border-phumulani-cream group">
                <SafeImage
                  src={imageSrc}
                  fallbackSrc={fallbackImageSrc}
                  fallbackType="hero"
                  alt={imageAlt}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute bottom-2.5 left-2.5 bg-phumulani-charcoal text-white px-3 py-1 rounded-full text-[10px] font-heading font-bold border border-phumulani-gold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-phumulani-green animate-pulse" />
                  <span>Culturally Grounded Sanctuary</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={FOUNDER_IMAGE}
                      fallbackType="founder"
                      fallbackText="Comfort Dondo"
                      initials="CD"
                      alt="Phumulani Foundation Founder — Official Corporate Portrait"
                      className="w-12 h-12 rounded-full object-contain bg-white border-2 border-phumulani-earth shadow-xs"
                      loading="lazy"
                      decoding="async"
                      width={1254}
                      height={1254}
                    />
                    <div>
                      <div className="font-heading font-bold text-sm text-phumulani-charcoal leading-tight">
                        Comfort Dondo
                      </div>
                      <div className="text-[11px] text-phumulani-earth font-heading font-semibold">
                        Founder &amp; Executive Director
                      </div>
                      <div className="text-[10px] text-phumulani-charcoal font-sans">
                        Author of &quot;Saving Myself&quot;
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-phumulani-cream text-phumulani-earth border border-phumulani-gold rounded-full text-[10px] font-heading font-bold">
                      Est. 2017 · MN 501(c)(3)
                    </span>
                  </div>
                </div>

                <div className="bg-phumulani-cream rounded-xl p-3 border border-phumulani-gold">
                  <p className="font-quote italic text-xs text-phumulani-charcoal leading-relaxed">
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
