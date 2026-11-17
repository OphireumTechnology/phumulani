/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Authentic Media Library & Safeguarding Inventory Modal
 */

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, FileText, Download, CheckCircle2, Lock, ExternalLink, Filter, Search, Copy, Check } from 'lucide-react';
import { PHUMULANI_MEDIA_INVENTORY, MediaAsset } from '../services/mediaInventory';
import { SafeImage } from './SafeImage';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredMedia = PHUMULANI_MEDIA_INVENTORY.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(JSON.stringify(PHUMULANI_MEDIA_INVENTORY, null, 2));
    setCopiedId('manifest');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'branding', label: 'Branding' },
    { id: 'founder', label: 'Founder' },
    { id: 'videos', label: 'Videos' },
    { id: 'publications', label: 'Publications' },
    { id: 'programs', label: 'Programs' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'events', label: 'Events' },
    { id: 'homepage', label: 'Homepage' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-phumulani-charcoal/15 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="bg-phumulani-charcoal text-white p-5 flex items-center justify-between border-b border-phumulani-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-phumulani-earth flex items-center justify-center border border-phumulani-gold/40">
              <ShieldCheck className="w-5 h-5 text-phumulani-gold" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                Phumulani Media Preservation &amp; Safeguarding Registry
              </h3>
              <p className="text-xs text-phumulani-cream">
                Audited visual assets, SHA-256 checksums &amp; survivor protection clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close registry"
            className="p-2 text-phumulani-cream hover:bg-phumulani-charcoal rounded-lg cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Toolbar: Search, Filters & Export Manifest */}
        <div className="p-4 bg-phumulani-cream border-b border-phumulani-charcoal/12 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-phumulani-charcoal shrink-0" />
            <input
              type="text"
              placeholder="Search title, caption, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-phumulani-charcoal/20 rounded-lg px-3 py-1.5 outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 text-phumulani-charcoal"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-phumulani-earth text-white'
                    : 'bg-white text-phumulani-charcoal hover:bg-phumulani-gold/25 border border-phumulani-charcoal/15'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyManifest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-phumulani-gold/20 text-phumulani-earth border border-phumulani-earth/30 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            {copiedId === 'manifest' ? <Check className="w-3.5 h-3.5 text-phumulani-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'manifest' ? 'Manifest Copied!' : 'Copy JSON Manifest'}</span>
          </button>
        </div>

        {/* Safeguarding Notice Banner */}
        <div className="bg-phumulani-cream/80 border-b border-phumulani-charcoal/12 px-4 py-2 text-[11px] text-phumulani-charcoal flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-phumulani-earth shrink-0" />
            <span>
              <strong className="font-heading text-phumulani-earth">Section 6 Safeguarding Protocol:</strong> Only assets with confirmed consent &amp; cleared safeguarding review are published to the public website.
            </span>
          </div>
          <span className="font-mono text-[10px] text-phumulani-charcoal font-semibold hidden sm:inline">
            Archive: MediaArchive
          </span>
        </div>

        {/* Media Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className={`rounded-xl border border-phumulani-charcoal/12 p-4 space-y-3 flex flex-col justify-between shadow-2xs ${
                asset.safeguardingReviewStatus === 'cleared_for_public_web'
                  ? 'bg-white'
                  : 'bg-phumulani-cream/70'
              }`}
            >
              <div className="space-y-2.5">
                {/* Media Preview or Icon */}
                <div className="aspect-video bg-phumulani-cream rounded-lg overflow-hidden border border-phumulani-charcoal/12 flex items-center justify-center relative">
                  {asset.mediaType === 'video_embed' ? (
                    <div className="w-full h-full bg-phumulani-charcoal flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-[10px] text-phumulani-gold font-bold uppercase tracking-wider">Video Stream</span>
                      <span className="text-xs text-white font-bold mt-1">{asset.title}</span>
                      <span className="text-[10px] text-phumulani-cream mt-1">Provider: {asset.videoMetadata?.provider}</span>
                    </div>
                  ) : (
                    <SafeImage
                      src={asset.localPath}
                      alt={asset.altText}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 text-[10px] text-phumulani-charcoal font-mono">
                    <span className="tabular-nums">{asset.id} · {asset.category}</span>
                    <span
                      className={`font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        asset.safeguardingReviewStatus === 'cleared_for_public_web'
                          ? 'bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green'
                          : 'bg-phumulani-earth text-white'
                      }`}
                    >
                      {asset.safeguardingReviewStatus === 'cleared_for_public_web' ? 'Cleared' : 'Restricted'}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-sm text-phumulani-earth mt-1 leading-snug">
                    {asset.title}
                  </h4>
                  <p className="text-[11px] text-phumulani-charcoal mt-1 line-clamp-2">
                    {asset.caption}
                  </p>
                </div>
              </div>

              {/* Technical & Audit Details */}
              <div className="pt-2.5 border-t border-phumulani-charcoal/10 space-y-1 text-[10px] text-phumulani-charcoal font-mono">
                <div className="truncate">Owner: {asset.copyrightOwner}</div>
                <div className="truncate tabular-nums">Checksum: {asset.checksumSha256.slice(0, 20)}...</div>
                <div className="flex justify-between items-center pt-1 font-sans">
                  <span className="text-[10px] text-phumulani-earth font-semibold truncate">
                    Usage: {asset.usageAuthorization.slice(0, 30)}...
                  </span>
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-phumulani-earth hover:text-phumulani-orange hover:underline flex items-center gap-0.5 shrink-0"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-phumulani-cream border-t border-phumulani-charcoal/12 flex justify-between items-center text-xs">
          <span className="text-phumulani-charcoal tabular-nums">
            Total Preserved Assets: <strong>{PHUMULANI_MEDIA_INVENTORY.length}</strong> (Verified &amp; Checksummed)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg font-bold cursor-pointer transition-colors"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
