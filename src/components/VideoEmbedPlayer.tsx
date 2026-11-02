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
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
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

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <a
          href={FOUNDER_VIMEO_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-400 hover:text-teal-300 underline font-medium inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:rounded"
        >
          <span>Watch the interview on Vimeo</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
        <span className="text-slate-500 text-[11px]">Twin Cities Community Media</span>
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
      className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white flex flex-col w-full"
    >
      {/* 1. Header Attribution & Safeguarding Indicator */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-xs border-b border-slate-800 min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-full">
          <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <h4 className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
            {media.title}
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
          {videoMeta?.hasCaptions && (
            <span className="inline-flex items-center gap-1 bg-teal-900/80 text-teal-200 border border-teal-700 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              <Subtitles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" aria-hidden="true" />
              <span>CC<span className="hidden min-[360px]:inline"> / CAPTIONS</span></span>
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
            <span className="hidden min-[360px]:inline">VERIFIED </span>PRESERVATION
          </span>
        </div>
      </div>

      {/* 2. Responsive 16:9 Native Video Canvas (No simulated overlay blocking controls) */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
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
      <div className="bg-slate-950/90 px-4 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-start sm:items-center gap-2 text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <div>
            <span className="text-slate-200 font-medium">Video unavailable here? </span>
            <a
              href={FOUNDER_VIMEO_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 font-semibold underline inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:rounded"
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
          className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
          title="Toggle authorized embed source with unlisted security hash"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" aria-hidden="true" />
          <span>{useHashUrl ? 'Standard Embed' : 'Trouble playing? Try authorized stream'}</span>
        </button>
      </div>

      {/* 4. Attribution Bar & Transcript Toggle */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div className="space-y-0.5 text-slate-400 text-[11px]">
          <div>
            <strong className="text-slate-300">Producer / Copyright:</strong> {media.copyrightOwner}
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
            <span>SHA-256 Checksum:</span>
            <span className="truncate max-w-[200px]">{media.checksumSha256}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {videoMeta?.transcriptSummary && (
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{showTranscript ? 'Hide Summary' : 'Read Summary'}</span>
              {showTranscript ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          )}

          <a
            href={FOUNDER_VIMEO_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 underline font-medium px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:rounded"
          >
            <span>Watch on Vimeo</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* 5. Accessible Summary / Transcript Drawer */}
      {showTranscript && videoMeta?.transcriptSummary && (
        <div className="bg-slate-900 border-t border-slate-800 p-4 text-xs text-slate-300 space-y-2 animate-in fade-in">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Preserved Video Transcript &amp; Editorial Summary</span>
          </div>
          <p className="leading-relaxed bg-black/40 p-3.5 rounded-xl border border-slate-800/80 font-sans text-slate-300">
            {videoMeta.transcriptSummary}
          </p>
        </div>
      )}
    </section>
  );
};

