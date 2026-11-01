/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Authentic Video Embed & Preservation Player
 */

import React, { useState } from 'react';
import { Play, Subtitles, ExternalLink, ShieldCheck, ChevronDown, ChevronUp, Info, Film } from 'lucide-react';
import { MediaAsset } from '../services/mediaInventory';

interface VideoEmbedPlayerProps {
  media: MediaAsset;
  autoPlay?: boolean;
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({ media, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showTranscript, setShowTranscript] = useState(false);
  const videoMeta = media.videoMetadata;

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 text-white flex flex-col">
      {/* 1. Header Attribution & Safeguarding Indicator */}
      <div className="bg-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-xs border-b border-slate-800 min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-full">
          <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
            {media.title}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 shrink-0">
          {videoMeta?.hasCaptions && (
            <span className="inline-flex items-center gap-1 bg-teal-900/80 text-teal-200 border border-teal-700 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold">
              <Subtitles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>CC<span className="hidden min-[360px]:inline"> / CAPTIONS</span></span>
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
            <span className="hidden min-[360px]:inline">VERIFIED </span>PRESERVATION
          </span>
        </div>
      </div>

      {/* 2. Responsive 16:9 Video Canvas */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {isPlaying && videoMeta?.embedUrl ? (
          <iframe
            src={`${videoMeta.embedUrl}&autoplay=1`}
            title={media.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center group cursor-pointer" onClick={() => setIsPlaying(true)}>
            {/* Poster Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/80 to-transparent z-0" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#104F57_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Content Over Poster */}
            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#104F57] hover:bg-[#D67C35] text-white flex items-center justify-center shadow-2xl transition-all transform group-hover:scale-110 border-2 border-white/80">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1 text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-white drop-shadow-md">
                  {media.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
                  {media.caption}
                </p>
              </div>
              <div className="inline-flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-amber-300 bg-black/60 px-2.5 sm:px-3 py-1 rounded-full border border-amber-400/30 max-w-full">
                <span>Duration: {videoMeta?.duration || 'Recorded Video'}</span>
                <span className="hidden min-[360px]:inline">·</span>
                <span className="hidden min-[360px]:inline">Click to Stream Authentic Video</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Attribution Bar & Transcript Toggle */}
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
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{showTranscript ? 'Hide Summary' : 'Read Summary'}</span>
              {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <a
            href={media.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 underline font-medium px-2 py-1"
          >
            <span>Source Video</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4. Accessible Summary / Transcript Drawer */}
      {showTranscript && videoMeta?.transcriptSummary && (
        <div className="bg-slate-900 border-t border-slate-800 p-4 text-xs text-slate-300 space-y-2 animate-in fade-in">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Preserved Video Transcript &amp; Editorial Summary</span>
          </div>
          <p className="leading-relaxed bg-black/40 p-3.5 rounded-xl border border-slate-800/80 font-sans text-slate-300">
            {videoMeta.transcriptSummary}
          </p>
        </div>
      )}
    </div>
  );
};
