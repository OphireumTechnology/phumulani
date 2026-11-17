/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Authentic Founder Legacy & Publications Component
 * Preserving Comfort Dondo's authentic journey, publications, and original videos.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Film,
  HeartHandshake,
  ShieldCheck,
  Award,
  Sprout,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Quote,
  ExternalLink,
} from 'lucide-react';
import { PHUMULANI_MEDIA_INVENTORY, getMediaById } from '../services/mediaInventory';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';
import { SafeImage } from './SafeImage';
import { RevealSection, RevealItem } from './ui/MotionPrimitives';
import { CulturalGeometricAccent } from './branding/CulturalGeometricAccent';

const FOUNDER_IMAGE = '/images/leadership/phumulani-founder-official.png';

export const FounderSection: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<'facing' | 'sacred' | 'gift' | null>(null);

  const founderVideo =
    getMediaById('med-vid-001') || PHUMULANI_MEDIA_INVENTORY.find((m) => m.category === 'videos')!;
  const newsVideo = getMediaById('med-vid-002');

  const publications = [
    {
      id: 'facing' as const,
      title: 'Facing the Giants',
      subtitle: 'A Journey to Freedom from Domestic Abuse',
      year: '2021',
      cover: '/images/publications/facing-the-giants-cover.svg',
      legacyCover: '/media/publications/facing-the-giants-cover.svg',
      editorialImage: '/images/publications/facing-the-giants-editorial.webp',
      tag: 'Solo Memoir & Survivor Guide',
      synopsis:
        'In "Facing the Giants", Comfort Dondo recounts her personal journey moving from Zimbabwe to the United States at age 17, surviving childhood trauma and domestic violence, and confronting the towering "giants" of systemic isolation, legal intimidation, and cultural silence. The memoir provides a compassionate, practical roadmap for women seeking autonomy, safety, and renewed spiritual faith.',
      excerpts: [
        '"The giants we face are not only the individuals who hurt us, but the silence, the stigma, and the systemic barriers that tell immigrant women we have nowhere to run."',
        '"Rest is not passive; rest is the fierce reclamation of your spirit. When we give a survivor a safe room, warm tea, and unwavering sisterhood, we restore her power."',
      ],
      attribution: 'Authored by Comfort Dondo. Proceeds support Phumulani emergency safe housing deposits.',
    },
    {
      id: 'sacred' as const,
      title: 'Sacred Promise: An Anthology',
      subtitle: 'Stories of Resilience and Communal Awakening',
      year: '2023',
      cover: '/images/publications/sacred-promise-cover.svg',
      legacyCover: '/media/publications/sacred-promise-cover.svg',
      editorialImage: '/images/publications/sacred-promise-editorial.webp',
      tag: 'International Bestseller',
      synopsis:
        'Compiled by global educator Dr. Tererai Trent and published by Women Changing the World Press, "Sacred Promise" gathers authentic accounts from visionary women worldwide. Comfort Dondo’s chapter details the foundational promise she made to herself while rebuilding her life in Minnesota—a promise that blossomed into Phumulani: Minnesota African Women Against Violence.',
      excerpts: [
        '"A sacred promise is the quiet covenant you forge in the darkest night—that your pain will not be wasted, and that every door opened for you will be held open for ten more sisters."',
        '"Culturally responsive care recognizes that a woman’s heritage is not an obstacle to her healing, but the very soil in which her resilience blooms."',
      ],
      attribution: 'Compiled by Dr. Tererai Trent · Contributing Author: Comfort Dondo.',
    },
    {
      id: 'gift' as const,
      title: 'The Gift in Pain',
      subtitle: 'Transforming Trauma into Communal Power',
      year: 'Forthcoming',
      cover: '/images/publications/the-gift-in-pain-cover.svg',
      legacyCover: '/media/publications/the-gift-in-pain-cover.svg',
      editorialImage: '/images/publications/the-gift-in-pain-editorial.webp',
      tag: 'Advance Announcement',
      synopsis:
        'Comfort Dondo’s forthcoming work explores post-traumatic growth, community-led shelter innovations, and the structural methodology behind Phumulani’s six core programs. It examines how collective healing circles and economic independence break the intergenerational cycle of gender-based violence in immigrant diaspora communities.',
      excerpts: [
        '"When trauma is processed in sacred community, the survivor moves from asking \'Why did this happen to me?\' to declaring \'How will this protect the ones who follow?\'"',
      ],
      attribution: 'Authored by Comfort Dondo · Forthcoming publication announcement.',
    },
  ];

  return (
    <section
      id="founder-section"
      className="space-y-16 py-16 border-t border-phumulani-charcoal/12 bg-white scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Header with Brand Crest */}
        <RevealSection className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-earth tracking-wider uppercase font-heading">
            <span>Organizational Founder &amp; Authentic Heritage</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-phumulani-earth leading-tight">
            Comfort Dondo — Founder of Phumulani
          </h2>
          <CulturalGeometricAccent variant="section-crest" className="pt-1" />
          <p className="text-phumulani-charcoal text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Survivor, community builder, author, and public policy advocate dedicated to ensuring that no African immigrant or refugee woman walks the path of healing alone.
          </p>
        </RevealSection>

        {/* 2. Main Founder Spotlight (Portrait + Founding Story) */}
        <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Authentic Executive Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative max-w-[520px] w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-phumulani-charcoal/15 bg-white group">
                <SafeImage
                  src={FOUNDER_IMAGE}
                  fallbackType="founder"
                  initials="CD"
                  alt="Phumulani Foundation Founder — Official Corporate Portrait"
                  className="founder-portrait w-full h-auto object-contain rounded-t-2xl transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  loading="lazy"
                  decoding="async"
                  width={1254}
                  height={1254}
                />
                <div className="p-4 sm:p-5 bg-phumulani-cream border-t border-phumulani-charcoal/12 text-center">
                  <div className="font-heading font-bold text-base text-phumulani-earth">
                    Comfort Dondo
                  </div>
                  <div className="text-xs text-phumulani-charcoal font-semibold mt-0.5">
                    Founder &amp; Executive Director · Phumulani
                  </div>
                  <div className="text-[11px] text-phumulani-charcoal mt-1">
                    Zimbabwean-born · Minneapolis, MN · Est. 2017
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Authentic Founding Story & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-phumulani-cream border border-phumulani-charcoal/12 p-5 sm:p-6 rounded-xl shadow-2xs">
              <Quote className="w-6 h-6 text-phumulani-earth mb-2" strokeWidth={1.75} aria-hidden="true" />
              <p className="font-display-serif text-base sm:text-lg text-phumulani-charcoal italic leading-relaxed">
                &ldquo;In Zulu, <em>Phumulani</em> means &lsquo;to rest&rsquo; or &lsquo;peace&rsquo;. When I fled violence as an immigrant mother in Minnesota, I realized that surviving is not enough. Survivors need a place of true spiritual rest, familiar meals, cultural sisterhood, and real economic keys to rebuild their lives.&rdquo;
              </p>
              <div className="text-xs font-bold text-phumulani-earth font-heading mt-3 tracking-wide">
                — Comfort Dondo, Founder
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans max-w-prose">
              <p>
                Comfort Dondo arrived in the United States from Zimbabwe at age 17. After experiencing childhood trauma and domestic violence, she turned to mainstream shelter systems—only to find profound cultural and linguistic gaps. Traditional crisis facilities often lacked familiar foods, cultural understanding of immigration dependencies, or trauma support that honored the sacred traditions of African women.
              </p>
              <p>
                In 2017, Comfort established <strong>Phumulani: Minnesota African Women Against Violence</strong> as a grassroots 501(c)(3) nonprofit in Brooklyn Park. Under her guidance, Phumulani pioneered culturally specific <em>Healing Homes</em>, weekly <em>Tea Healing Circles</em>, Order for Protection court accompaniment, and the <em>Immigrant Women Entrepreneurship Lab</em>.
              </p>
              <p>
                Today, Phumulani has walked beside over <strong className="tabular-nums">1,450 survivors and families</strong> across Hennepin, Ramsey, and surrounding Minnesota counties, distributing more than <span className="tabular-nums font-semibold">$480,000</span> in emergency rental aid and lease bridge funding.
              </p>
            </div>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-phumulani-cream p-4 rounded-xl border border-phumulani-charcoal/12 text-center hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
                <ShieldCheck className="w-5 h-5 text-phumulani-earth mx-auto mb-1.5" strokeWidth={1.75} aria-hidden="true" />
                <div className="font-heading font-bold text-xs text-phumulani-earth">Rest &amp; Refuge</div>
                <div className="text-[11px] text-phumulani-charcoal mt-0.5">Culturally safe shelter</div>
              </div>
              <div className="bg-phumulani-cream p-4 rounded-xl border border-phumulani-charcoal/12 text-center hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
                <HeartHandshake className="w-5 h-5 text-phumulani-green mx-auto mb-1.5" strokeWidth={1.75} aria-hidden="true" />
                <div className="font-heading font-bold text-xs text-phumulani-earth">Sisterhood</div>
                <div className="text-[11px] text-phumulani-charcoal mt-0.5">Tea Healing Circles</div>
              </div>
              <div className="bg-phumulani-cream p-4 rounded-xl border border-phumulani-charcoal/12 text-center hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
                <Award className="w-5 h-5 text-phumulani-orange mx-auto mb-1.5" strokeWidth={1.75} aria-hidden="true" />
                <div className="font-heading font-bold text-xs text-phumulani-earth">Autonomy</div>
                <div className="text-[11px] text-phumulani-charcoal mt-0.5">Workforce &amp; LLC grants</div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* 2.5 Executive Leadership in Action & Policy Advocacy */}
        <RevealSection className="bg-phumulani-cream rounded-2xl border border-phumulani-charcoal/12 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:h-full bg-phumulani-cream overflow-hidden">
            <SafeImage
              src="/media/phumulani/founder-legacy/leadership.jpg"
              fallbackSrc="/media/founder/comfort-dondo-community-circle.svg"
              fallbackType="leadership"
              alt="Comfort Dondo leading community organizers and advocates around a conference table in Minneapolis"
              className="w-full h-full object-cover min-h-[280px]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-4 flex flex-col justify-center">
            <div className="text-xs font-bold text-phumulani-earth font-heading uppercase tracking-wider">
              Community Leadership in Action
            </div>
            <h3 className="font-heading text-2xl font-bold text-phumulani-earth leading-snug">
              Grassroots Advocacy &amp; Systemic Reform
            </h3>
            <p className="text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans">
              Beyond direct crisis intervention, Comfort Dondo mobilizes grassroots leaders, faith coalitions, and civic partners across the Twin Cities to dismantle barriers in domestic violence statutes and expand culturally specific protections.
            </p>
            <div className="space-y-2 pt-3 border-t border-phumulani-charcoal/12 text-xs text-phumulani-charcoal">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-phumulani-green shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Minnesota Coalition for Battered Women &amp; Violence Free MN</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-phumulani-green shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Hennepin County Immigrant Domestic Violence Taskforce</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-phumulani-green shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Bilingual advocacy training for community ambassadors</span>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* 3. Original Video Preservation: Founder Interview */}
        <RevealSection className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-phumulani-charcoal/12 pb-3">
            <div>
              <div className="text-xs font-bold text-phumulani-earth font-heading tracking-wider uppercase">
                Authentic Video Archive
              </div>
              <h3 className="font-heading text-2xl font-bold text-phumulani-earth">
                The Phumulani Story: From Survival to Rest &amp; Sisterhood
              </h3>
            </div>
            <span className="text-xs text-phumulani-charcoal font-sans">
              Preserved original media embed · Responsive playback
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <VideoEmbedPlayer media={founderVideo} />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-phumulani-cream p-5 rounded-2xl border border-phumulani-charcoal/12 space-y-3">
                <div className="font-heading font-bold text-base text-phumulani-earth flex items-center gap-2">
                  <Film className="w-4 h-4 text-phumulani-orange" strokeWidth={1.75} aria-hidden="true" />
                  <span>About This Interview</span>
                </div>
                <p className="text-xs text-phumulani-charcoal leading-relaxed font-sans">
                  In this foundational interview, Comfort Dondo details how cultural meals, linguistic safety, and holistic healing allow survivors to release trauma. She explains the essential role of community partnerships in Minnesota and why dignified housing must precede workforce transitions.
                </p>
                <div className="text-[11px] text-phumulani-charcoal space-y-1 pt-2 border-t border-phumulani-charcoal/12">
                  <div>
                    <strong>Speaker:</strong> Comfort Dondo (Founder)
                  </div>
                  <div>
                    <strong>Location:</strong> Brooklyn Park, Minnesota
                  </div>
                  <div>
                    <strong>Producer:</strong> Twin Cities Community Media
                  </div>
                </div>
              </div>

              {newsVideo && (
                <div className="bg-phumulani-cream p-4 rounded-xl border border-phumulani-charcoal/12 text-xs text-phumulani-charcoal space-y-2">
                  <div className="font-bold text-phumulani-earth font-heading flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-phumulani-green" strokeWidth={1.75} aria-hidden="true" />
                    <span>Also Featured On CCX Media News</span>
                  </div>
                  <p className="text-[11px] text-phumulani-charcoal font-sans">
                    Phumulani’s Healing Homes program was spotlighted by CCX News as a regional leader in culturally specific domestic abuse recovery.
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=kU7ZqL6Jz7E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-phumulani-earth hover:text-phumulani-orange hover:underline underline-offset-4"
                  >
                    <span>Watch CCX News Spotlight</span>
                    <ExternalLink className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </RevealSection>

        {/* 4. Authentic Publications by Comfort Dondo */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-phumulani-charcoal/12 pb-3">
            <div>
              <div className="text-xs font-bold text-phumulani-earth font-heading tracking-wider uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                <span>Authored Works &amp; Publications</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-phumulani-earth">
                Books by Founder Comfort Dondo
              </h3>
            </div>
            <span className="text-xs text-phumulani-charcoal font-sans">
              Approved literary works advancing survivor resilience
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publications.map((book, idx) => (
              <RevealItem key={book.id} index={idx} className="flex">
                <div className="bg-white rounded-2xl border border-phumulani-charcoal/12 hover:border-phumulani-earth/40 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col w-full group">
                  {/* Editorial Showcase Frame: Editorial Photographic Environment + 3D Hardcover Book Mockup */}
                  <div className="relative h-80 sm:h-88 md:h-80 lg:h-88 overflow-hidden bg-phumulani-charcoal flex items-center justify-center p-4 select-none">
                    {/* Editorial Background Photography */}
                    <SafeImage
                      src={book.editorialImage}
                      fallbackSrc={book.cover}
                      fallbackType="publication"
                      alt={`${book.title} Editorial Atmosphere`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.72] group-hover:brightness-[0.82]"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Cinematic Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal/90 via-phumulani-charcoal/30 to-phumulani-charcoal/20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-phumulani-charcoal/40 via-transparent to-phumulani-charcoal/80 pointer-events-none" />

                    {/* 3D Hardcover Book Mockup */}
                    <div className="relative z-10 w-36 sm:w-40 md:w-36 lg:w-40 aspect-[2/3] transition-all duration-300 ease-out transform group-hover:-translate-y-1.5 group-hover:scale-103 group-hover:rotate-1">
                      <div className="absolute -bottom-3 left-2 right-2 h-4 bg-phumulani-charcoal/80 blur-md rounded-full transform scale-x-95" />

                      <div className="relative w-full h-full rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border-t border-b border-r border-phumulani-gold bg-phumulani-charcoal flex">
                        <div className="w-2.5 shrink-0 bg-gradient-to-r from-phumulani-charcoal/80 via-white to-phumulani-charcoal/60 border-r border-phumulani-charcoal/60 z-10" />

                        <div className="flex-1 relative overflow-hidden bg-phumulani-charcoal">
                          <SafeImage
                            src={book.cover}
                            fallbackSrc={book.legacyCover}
                            fallbackType="publication"
                            fallbackText={book.title}
                            alt={`${book.title} Official Publication Cover`}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-phumulani-gold/10 pointer-events-none" />
                        </div>

                        <div className="w-1 shrink-0 bg-phumulani-cream border-l border-phumulani-charcoal" />
                      </div>
                    </div>
                  </div>

                  {/* Subtle Gold Hairline Accent */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-phumulani-gold to-transparent" />

                  {/* Publication Details */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-heading">
                        <span className="text-phumulani-earth font-semibold">{book.tag}</span>
                        <span aria-hidden="true" className="text-phumulani-charcoal/40">·</span>
                        <span className="text-phumulani-charcoal tabular-nums">{book.year}</span>
                      </div>
                      <h4 className="font-heading text-lg font-bold text-phumulani-earth group-hover:text-phumulani-orange transition-colors leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-xs text-phumulani-charcoal font-medium font-heading">
                        {book.subtitle}
                      </p>
                      <p className="text-xs text-phumulani-charcoal line-clamp-3 leading-relaxed pt-1 font-sans">
                        {book.synopsis}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-phumulani-charcoal/10 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedBook(book.id)}
                        className="text-xs font-bold text-phumulani-earth hover:text-phumulani-orange flex items-center gap-1 cursor-pointer font-heading group/btn focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded"
                      >
                        <span>Read Excerpts &amp; Details</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" strokeWidth={1.75} aria-hidden="true" />
                      </button>
                      <span className="text-[11px] text-phumulani-charcoal font-medium">Comfort Dondo</span>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* 5. Authentic Community Circle Spotlight — The Tea Healing Circle Model */}
        <RevealSection className="bg-phumulani-cream rounded-2xl border border-phumulani-charcoal/12 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 rounded-xl overflow-hidden shadow-xs border border-phumulani-charcoal/12 bg-white aspect-[16/9] relative">
            <SafeImage
              src="/images/programs/tea-healing-circle-premium.webp"
              fallbackSrc="/images/homepage/community-hero.svg"
              fallbackType="hero"
              alt="Illustrative scene of women sharing tea and supportive conversation in a welcoming community space."
              className="w-full h-full object-cover"
              loading="lazy"
              width={1376}
              height={768}
            />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-phumulani-earth uppercase tracking-wider font-heading">
              <Sprout className="w-3.5 h-3.5 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
              <span>Cultural Healing Methodology</span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-phumulani-earth">
              The Tea Healing Circle Model
            </h3>
            <p className="text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans">
              Originated by Comfort Dondo at Phumulani, weekly Tea Healing Circles create a confidential sanctuary where African immigrant women gather to drink spiced tea, decompress from chronic survival stress, and share experiences without judgment.
            </p>
            <div className="p-4 bg-white rounded-xl border border-phumulani-charcoal/12 text-xs text-phumulani-charcoal space-y-1">
              <div className="font-bold text-phumulani-earth font-heading">Weekly Facilitation</div>
              <div className="font-sans">Certified trauma advocates &amp; intergenerational peer mentors.</div>
            </div>
          </div>
        </RevealSection>
      </div>

      {/* Book Excerpt Modal */}
      {selectedBook && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBook(null);
          }}
          className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-phumulani-charcoal/15 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {(() => {
              const book = publications.find((b) => b.id === selectedBook)!;
              return (
                <>
                  <div className="flex justify-between items-start border-b border-phumulani-charcoal/12 pb-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-phumulani-earth uppercase tracking-wider font-heading tabular-nums">
                        {book.tag} · {book.year}
                      </span>
                      <h3 className="font-heading text-2xl font-bold text-phumulani-earth">{book.title}</h3>
                      <p className="text-xs text-phumulani-charcoal font-semibold">{book.subtitle}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBook(null)}
                      aria-label="Close excerpt dialog"
                      className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold p-1.5 cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    <div className="sm:col-span-4 flex justify-center">
                      <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-xl overflow-hidden p-3 bg-phumulani-charcoal flex items-center justify-center border border-phumulani-charcoal/15 shadow-lg">
                        <SafeImage
                          src={book.editorialImage}
                          fallbackSrc={book.cover}
                          fallbackType="publication"
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-phumulani-charcoal/90 via-phumulani-charcoal/40 to-transparent" />
                        <div className="relative z-10 w-28 aspect-[2/3] rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border border-phumulani-gold bg-phumulani-charcoal flex">
                          <div className="w-2 shrink-0 bg-gradient-to-r from-phumulani-charcoal/80 via-white to-phumulani-charcoal/60 border-r border-phumulani-charcoal/60" />
                          <div className="flex-1 relative overflow-hidden bg-phumulani-charcoal">
                            <SafeImage
                              src={book.cover}
                              fallbackSrc={book.legacyCover}
                              fallbackType="publication"
                              fallbackText={book.title}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-1 shrink-0 bg-phumulani-cream border-l border-phumulani-charcoal" />
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-8 space-y-3 text-xs sm:text-sm text-phumulani-charcoal leading-relaxed font-sans">
                      <p>{book.synopsis}</p>
                      <p className="text-[11px] text-phumulani-charcoal italic bg-phumulani-cream p-3 rounded-lg border border-phumulani-charcoal/12">
                        {book.attribution}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-phumulani-charcoal/12">
                    <div className="text-xs font-bold text-phumulani-earth uppercase tracking-wide font-heading">
                      Selected Excerpt
                    </div>
                    {book.excerpts.map((excerpt, i) => (
                      <div
                        key={i}
                        className="p-4 bg-phumulani-cream border border-phumulani-charcoal/12 rounded-xl text-xs sm:text-sm italic font-display-serif text-phumulani-charcoal leading-relaxed"
                      >
                        {excerpt}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="px-5 py-2.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-bold cursor-pointer font-heading shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                    >
                      Close Window
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};
