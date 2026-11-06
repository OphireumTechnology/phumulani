/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Authentic Founder Legacy & Publications Component
 * Preserving Comfort Dondo's authentic journey, publications, and original videos.
 */

import React, { useState } from 'react';
import { BookOpen, Film, Heart, Shield, Award, Sparkles, ChevronRight, CheckCircle2, Quote, ExternalLink } from 'lucide-react';
import { PHUMULANI_MEDIA_INVENTORY, getMediaById } from '../services/mediaInventory';
import { VideoEmbedPlayer } from './VideoEmbedPlayer';
import { SafeImage } from './SafeImage';
import { BrandPatternDivider } from './branding/BrandPatternDivider';

export const FounderSection: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<'facing' | 'sacred' | 'gift' | null>(null);

  const founderVideo = getMediaById('med-vid-001') || PHUMULANI_MEDIA_INVENTORY.find((m) => m.category === 'videos')!;
  const newsVideo = getMediaById('med-vid-002');

  const publications = [
    {
      id: 'facing' as const,
      title: 'Facing the Giants',
      subtitle: 'A Journey to Freedom from Domestic Abuse',
      year: '2021',
      cover: '/images/publications/facing-the-giants-cover.svg',
      legacyCover: '/media/publications/facing-the-giants-cover.svg',
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
    <section id="founder-section" className="space-y-16 py-12 border-t border-teal-100 bg-white">
      <BrandPatternDivider height={8} className="mb-8" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 1. Header with Brand Badge */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#006D6F] bg-[#FFF7E6] px-3.5 py-1.5 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
            <span className="font-heading font-semibold uppercase tracking-wider text-[11px]">ORGANIZATIONAL FOUNDER &amp; AUTHENTIC HERITAGE</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#006D6F]">
            Comfort Dondo — Founder of Phumulani
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
            Survivor, community builder, author, and public policy advocate dedicated to ensuring that no African immigrant or refugee woman walks the path of healing alone.
          </p>
        </div>

        {/* 2. Main Founder Spotlight (Portrait + Founding Story) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Authentic Executive Portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#006D6F] via-[#7A9B29] to-[#F05A28] rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-200/90 bg-white">
                <SafeImage
                  src="/images/leadership/comfort-dondo.svg"
                  fallbackSrc="/media/founder/comfort-dondo-official-portrait.svg"
                  fallbackType="founder"
                  initials="CD"
                  alt="Comfort Dondo, Founder and Executive Director of Phumulani"
                  className="w-full h-auto object-cover aspect-[4/5] transform hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="p-4 bg-[#FFF7E6]/70 border-t border-amber-200/60 text-center">
                  <div className="font-heading font-bold text-base text-slate-900">Comfort Dondo</div>
                  <div className="text-xs text-[#006D6F] font-semibold mt-0.5">
                    Founder &amp; Executive Director · Phumulani
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Zimbabwean-born · Minneapolis, MN · Est. 2017
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Authentic Founding Story & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#FFF7E6] border-l-4 border-[#006D6F] p-5 rounded-r-xl shadow-2xs">
              <Quote className="w-6 h-6 text-[#006D6F] mb-2 opacity-60" />
              <p className="font-quote text-base sm:text-lg text-slate-800 italic leading-relaxed">
                "In Zulu, <em>Phumulani</em> means 'to rest' or 'peace'. When I fled violence as an immigrant mother in Minnesota, I realized that surviving is not enough. Survivors need a place of true spiritual rest, familiar meals, cultural sisterhood, and real economic keys to rebuild their lives."
              </p>
              <div className="text-xs font-bold text-[#006D6F] font-heading mt-3 tracking-wide">
                — Comfort Dondo, Founder
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <p>
                Comfort Dondo arrived in the United States from Zimbabwe at age 17. After experiencing childhood trauma and domestic violence, she turned to mainstream shelter systems—only to find profound cultural and linguistic gaps. Traditional crisis facilities often lacked familiar foods, cultural understanding of immigration dependencies, or trauma support that honored the sacred traditions of African women.
              </p>
              <p>
                In 2017, Comfort established <strong>Phumulani: Minnesota African Women Against Violence</strong> as a grassroots 501(c)(3) nonprofit in Brooklyn Park. Under her guidance, Phumulani pioneered culturally specific <em>Healing Homes</em>, weekly <em>Tea Healing Circles</em>, Order for Protection court accompaniment, and the <em>Immigrant Women Entrepreneurship Lab</em>.
              </p>
              <p>
                Today, Phumulani has walked beside over <strong>1,450 survivors and families</strong> across Hennepin, Ramsey, and surrounding Minnesota counties, distributing more than $480,000 in emergency rental aid and lease bridge funding.
              </p>
            </div>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#FFF7E6]/60 p-3.5 rounded-xl border border-amber-200/70 text-center">
                <Shield className="w-5 h-5 text-[#006D6F] mx-auto mb-1.5" />
                <div className="font-heading font-bold text-xs text-slate-900">Rest &amp; Refuge</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Culturally safe shelter</div>
              </div>
              <div className="bg-[#FFF7E6]/60 p-3.5 rounded-xl border border-amber-200/70 text-center">
                <Heart className="w-5 h-5 text-[#7A9B29] mx-auto mb-1.5" />
                <div className="font-heading font-bold text-xs text-slate-900">Sisterhood</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Tea Healing Circles</div>
              </div>
              <div className="bg-[#FFF7E6]/60 p-3.5 rounded-xl border border-amber-200/70 text-center">
                <Award className="w-5 h-5 text-[#F05A28] mx-auto mb-1.5" />
                <div className="font-heading font-bold text-xs text-slate-900">Autonomy</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Workforce &amp; LLC grants</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2.5 Executive Leadership in Action & Policy Advocacy */}
        <div className="bg-slate-50 rounded-2xl border border-teal-100 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:h-full bg-slate-100 overflow-hidden">
            <SafeImage
              src="/media/phumulani/founder-legacy/leadership.jpg"
              fallbackSrc="/media/founder/comfort-dondo-community-circle.svg"
              fallbackType="leadership"
              alt="Comfort Dondo leading community organizers and advocates around a conference table in Minneapolis"
              className="w-full h-full object-cover min-h-[280px]"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-4">
            <div className="text-xs font-bold text-[#006D6F] font-heading uppercase tracking-wider">
              Community Leadership in Action
            </div>
            <h3 className="font-heading text-2xl font-bold text-slate-900 leading-snug">
              Grassroots Advocacy &amp; Systemic Reform
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Beyond direct crisis intervention, Comfort Dondo mobilizes grassroots leaders, faith coalitions, and civic partners across the Twin Cities to dismantle barriers in domestic violence statutes and expand culturally specific protections.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A9B29] shrink-0" />
                <span>Minnesota Coalition for Battered Women &amp; Violence Free MN</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A9B29] shrink-0" />
                <span>Hennepin County Immigrant Domestic Violence Taskforce</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A9B29] shrink-0" />
                <span>Bilingual advocacy training for community ambassadors</span>
              </div>
            </div>
          </div>
        </div>
        {/* 3. Original Video Preservation: Founder Interview */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-teal-100 pb-3">
            <div>
              <div className="text-xs font-bold text-[#006D6F] font-heading tracking-wider uppercase">Authentic Video Archive</div>
              <h3 className="font-heading text-2xl font-bold text-slate-900">
                The Phumulani Story: From Survival to Rest &amp; Sisterhood
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-sans">
              Preserved original media embed · Responsive playback
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <VideoEmbedPlayer media={founderVideo} />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#FFF7E6]/50 p-5 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="font-heading font-bold text-base text-[#006D6F] flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#F05A28]" />
                  <span>About This Interview</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  In this foundational interview, Comfort Dondo details how cultural meals, linguistic safety, and holistic healing allow survivors to release trauma. She explains the essential role of community partnerships in Minnesota and why dignified housing must precede workforce transitions.
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-amber-200/60">
                  <div><strong>Speaker:</strong> Comfort Dondo (Founder)</div>
                  <div><strong>Location:</strong> Brooklyn Park, Minnesota</div>
                  <div><strong>Producer:</strong> Twin Cities Community Media</div>
                </div>
              </div>

              {newsVideo && (
                <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-[#006D6F] font-heading flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7A9B29]" />
                    <span>Also Featured On CCX Media News</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Phumulani’s Healing Homes program was spotlighted by CCX News as a regional leader in culturally specific domestic abuse recovery.
                  </p>
                  <a
                    href="https://www.youtube.com/watch?v=kU7ZqL6Jz7E"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#006D6F] hover:text-[#004A4C] hover:underline"
                  >
                    <span>Watch CCX News Spotlight</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Authentic Publications by Comfort Dondo */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-teal-100 pb-3">
            <div>
              <div className="text-xs font-bold text-[#F05A28] font-heading tracking-wider uppercase">Authored Works &amp; Publications</div>
              <h3 className="font-heading text-2xl font-bold text-slate-900">
                Books by Founder Comfort Dondo
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-sans">
              Approved literary works advancing survivor resilience
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publications.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col group"
              >
                {/* Book Cover Frame */}
                <div className="relative bg-slate-900 aspect-[2/3] overflow-hidden flex items-center justify-center p-3">
                  <SafeImage
                    src={book.cover}
                    fallbackSrc={book.legacyCover}
                    fallbackType="publication"
                    fallbackText={book.title}
                    alt={book.title}
                    className="w-full h-full object-contain rounded-md shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-xs text-[#F4B400] px-2.5 py-1 rounded text-[10px] font-bold border border-[#F4B400]/40 font-heading">
                    {book.tag}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {book.year} Publication
                    </span>
                    <h4 className="font-heading text-lg font-bold text-slate-900 group-hover:text-[#006D6F] transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#7A9B29] font-medium font-heading">
                      {book.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1 font-sans">
                      {book.synopsis}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedBook(book.id)}
                      className="text-xs font-bold text-[#006D6F] hover:text-[#004A4C] flex items-center gap-1 cursor-pointer font-heading"
                    >
                      <span>Read Excerpts &amp; Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400">By Comfort Dondo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Authentic Community Circle Spotlight */}
        <div className="bg-[#FFF7E6]/70 rounded-2xl border border-amber-200/80 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 rounded-xl overflow-hidden shadow-lg border border-amber-200 bg-white">
            <SafeImage
              src="/images/homepage/community-hero.svg"
              fallbackSrc="/media/founder/comfort-dondo-community-circle.svg"
              fallbackType="hero"
              alt="Comfort Dondo facilitating authentic community healing circle in Brooklyn Park"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[11px] font-bold text-[#006D6F] bg-white border border-teal-200 px-3 py-1 rounded-full uppercase tracking-wider font-heading">
              Cultural Healing Methodology
            </span>
            <h3 className="font-heading text-2xl font-bold text-slate-900">
              The Tea Healing Circle Model
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              Originated by Comfort Dondo at Phumulani, weekly Tea Healing Circles create a confidential sanctuary where African immigrant women gather to drink spiced tea, decompress from chronic survival stress, and share experiences without judgment.
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-[#006D6F] font-heading">Weekly Facilitation:</div>
              <div className="font-sans">Certified trauma advocates &amp; intergenerational peer mentors.</div>
            </div>
          </div>
        </div>
      </div>

      <BrandPatternDivider height={8} className="mt-8" />

      {/* Book Excerpt Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {(() => {
              const book = publications.find((b) => b.id === selectedBook)!;
              return (
                <>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#F05A28] uppercase tracking-wider font-heading">
                        {book.tag} · {book.year}
                      </span>
                      <h3 className="font-heading text-2xl font-bold text-slate-900">{book.title}</h3>
                      <p className="text-xs text-[#006D6F] font-semibold">{book.subtitle}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                    <div className="sm:col-span-4 flex justify-center">
                      <SafeImage
                        src={book.cover}
                        fallbackSrc={book.legacyCover}
                        fallbackType="publication"
                        fallbackText={book.title}
                        alt={book.title}
                        className="w-40 h-auto rounded-lg shadow-md"
                      />
                    </div>
                    <div className="sm:col-span-8 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      <p>{book.synopsis}</p>
                      <p className="text-[11px] text-slate-500 italic bg-[#FFF7E6] p-3 rounded-lg border border-amber-200">
                        {book.attribution}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wide font-heading">
                      Selected Excerpt:
                    </div>
                    {book.excerpts.map((excerpt, i) => (
                      <div key={i} className="p-4 bg-[#FFF7E6] border-l-4 border-[#006D6F] rounded-r-xl text-xs sm:text-sm italic font-quote text-slate-800 leading-relaxed">
                        {excerpt}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="px-5 py-2.5 bg-[#006D6F] hover:bg-[#004A4C] text-white rounded-lg text-xs font-bold cursor-pointer font-heading shadow-sm"
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
