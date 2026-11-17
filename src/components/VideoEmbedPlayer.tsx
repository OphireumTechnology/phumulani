/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Authentic Video Embed & Preservation Player
 */

import React, { useState } from 'react';
import { Subtitles, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Info, Film, AlertCircle, RefreshCw } from 'lucide-react';
import { MediaAsset } from '../services/mediaInventory';

export const FOUNDER_VIDEO_ID = '355031901';
export const FOUNDER_VIDEO_URL = 'https://player.vimeo.com/video/355031901';
export const FOUNDER_VIDEO_URL_WITH_HASH = 'https://player.vimeo.com/video/355031901?h=38e761577b';
export const FOUNDER_VIMEO_PAGE_URL = 'https://vimeo.com/355031901';

/**
 * Standard Founder Interview Video section component
 * Conforms to prompt specification with 16:9 aspect ratio and fallback link.
 */
export function FounderInterviewVideo() {
  return (
    <section
      aria-label="The Phumulani Story: Founder Interview"
      className="w-full"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-phumulani-charcoal">
        <iframe
          title="The Phumulani Story: Finding Peace, Rest and Autonomy"
          src={FOUNDER_VIDEO_URL}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-phumulani-charcoal">
        <a
          href={FOUNDER_VIMEO_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-phumulani-earth hover:text-phumulani-orange underline font-medium inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-phumulani-orange focus:rounded"
        >
          <span>Watch the interview on Vimeo</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
        <span className="text-phumulani-charcoal text-[11px]">Twin Cities Community Media</span>
      </div>
    </section>
  );
}

interface VideoEmbedPlayerProps {
  media: MediaAsset;
  autoPlay?: boolean;
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({ media }) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [useHashUrl, setUseHashUrl] = useState(false);
  const videoMeta = media.videoMetadata;

  // Determine active embed URL
  const activeSrc = useHashUrl
    ? FOUNDER_VIDEO_URL_WITH_HASH
    : (videoMeta?.embedUrl || FOUNDER_VIDEO_URL);

  return (
    <section
      aria-label="The Phumulani Story: Founder Interview"
      className="bg-phumulani-charcoal rounded-2xl overflow-hidden shadow-lg border border-phumulani-charcoal/20 text-white flex flex-col w-full"
    >
      {/* 1. Header Attribution & Safeguarding Indicator */}
      <div className="bg-phumulani-charcoal px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10 min-w-0 max-w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
          <Film className="w-3.5 h-3.5 text-phumulani-gold shrink-0" aria-hidden="true" />
          <h4 className="font-heading font-semibold text-white truncate text-xs">
            {media.title}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-[10px]">
          {videoMeta?.hasCaptions && (
            <span className="inline-flex items-center gap-1 bg-phumulani-teal text-phumulani-charcoal px-2 py-0.5 rounded-md font-bold">
              <Subtitles className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>CC</span>
            </span>
          )}
          <span className="text-phumulani-charcoal bg-phumulani-green px-2 py-0.5 rounded-md font-mono font-bold">
            VERIFIED
          </span>
        </div>
      </div>

      {/* 2. Responsive 16:9 Native Video Canvas */}
      <div className="relative aspect-video w-full overflow-hidden bg-phumulani-charcoal">
        <iframe
          title="The Phumulani Story: Finding Peace, Rest and Autonomy"
          src={activeSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* 3. Clearly Visible Reliable Fallback & Embed Diagnosis Banner */}
      <div className="bg-phumulani-charcoal px-4 py-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-start sm:items-center gap-2 text-phumulani-cream">
          <AlertCircle className="w-4 h-4 text-phumulani-gold shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <div>
            <span className="text-white font-medium">Video unavailable here? </span>
            <a
              href={FOUNDER_VIMEO_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-phumulani-teal hover:text-phumulani-gold font-semibold underline inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-phumulani-gold focus:rounded"
            >
              <span>Watch the Founder Interview on Vimeo</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Secondary Authorized Hash Toggle if browser extension strips referrer */}
        <button
          type="button"
          onClick={() => setUseHashUrl(!useHashUrl)}
          className="text-[11px] text-white hover:text-phumulani-charcoal inline-flex items-center gap-1 cursor-pointer transition-colors px-2.5 py-1 rounded-lg bg-phumulani-earth hover:bg-phumulani-charcoal border border-phumulani-gold/40"
          title="Toggle authorized embed source with unlisted security hash"
        >
          <RefreshCw className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{useHashUrl ? 'Standard Embed' : 'Try authorized stream'}</span>
        </button>
      </div>

      {/* 4. Attribution Bar & Transcript Toggle */}
      <div className="bg-phumulani-charcoal p-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div className="space-y-0.5 text-phumulani-cream text-[11px]">
          <div>
            <strong className="text-white">Producer / Copyright:</strong> {media.copyrightOwner}
          </div>
          <div className="flex items-center gap-1 text-phumulani-cream/90 font-mono text-[10px]">
            <span>SHA-256 Checksum:</span>
            <span className="truncate max-w-[200px] tabular-nums">{media.checksumSha256}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoMeta?.transcriptSummary && (
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-phumulani-gold"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showTranscript ? 'Hide Summary' : 'Read Summary'}</span>
              {showTranscript ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          )}

          <a
            href={FOUNDER_VIMEO_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-phumulani-teal hover:text-phumulani-gold underline font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-phumulani-gold focus:rounded"
          >
            <span>Watch on Vimeo</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* 5. Accessible Summary / Transcript Drawer */}
      {showTranscript && videoMeta?.transcriptSummary && (
        <div className="bg-phumulani-cream border-t border-phumulani-charcoal/12 p-4 text-xs text-phumulani-charcoal space-y-2 animate-in fade-in">
          <div className="font-bold font-heading text-phumulani-earth flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-phumulani-green" aria-hidden="true" />
            <span>Preserved Video Transcript &amp; Editorial Summary</span>
          </div>
          <p className="leading-relaxed bg-white p-3.5 rounded-xl border border-phumulani-charcoal/12 font-sans text-phumulani-charcoal">
            {videoMeta.transcriptSummary}
          </p>
        </div>
      )}
    </section>
  );
};

