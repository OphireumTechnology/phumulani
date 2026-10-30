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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="bg-[#104F57] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center border border-teal-600">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold">
                Phumulani Media Preservation &amp; Safeguarding Registry
              </h3>
              <p className="text-xs text-teal-200">
                Audited visual assets, SHA-256 checksums &amp; survivor protection clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-800 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toolbar: Search, Filters & Export Manifest */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, caption, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#104F57]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#104F57] text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyManifest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-teal-50 text-[#104F57] border border-teal-300 rounded-lg font-bold transition-colors cursor-pointer"
          >
            {copiedId === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'manifest' ? 'Manifest Copied!' : 'Copy JSON Manifest'}</span>
          </button>
        </div>

        {/* Safeguarding Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Section 6 Safeguarding Protocol:</strong> Only assets with confirmed consent &amp; cleared safeguarding review are published to the public website.
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-800 font-bold hidden sm:inline">
            Local Backup: D:\Phumulani\Backups\MediaArchive
          </span>
        </div>

        {/* Media Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className={`rounded-xl border p-4 space-y-3 flex flex-col justify-between ${
                asset.safeguardingReviewStatus === 'cleared_for_public_web'
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-rose-50/50 border-rose-300 shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                {/* Media Preview or Icon */}
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center relative">
                  {asset.mediaType === 'video_embed' ? (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Video Stream</span>
                      <span className="text-xs text-white font-bold mt-1">{asset.title}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Provider: {asset.videoMetadata?.provider}</span>
                    </div>
                  ) : (
                    <SafeImage
                      src={asset.localPath}
                      alt={asset.altText}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      asset.safeguardingReviewStatus === 'cleared_for_public_web'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {asset.safeguardingReviewStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{asset.id}</span>
                    <span className="capitalize">{asset.category}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 mt-0.5 leading-snug">
                    {asset.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {asset.caption}
                  </p>
                </div>
              </div>

              {/* Technical & Audit Details */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500 font-mono">
                <div className="truncate">Owner: {asset.copyrightOwner}</div>
                <div className="truncate">Checksum: {asset.checksumSha256.slice(0, 20)}...</div>
                <div className="flex justify-between items-center pt-1 font-sans">
                  <span className="text-[10px] text-[#104F57] font-semibold">
                    Usage: {asset.usageAuthorization.slice(0, 32)}...
                  </span>
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#104F57] hover:underline flex items-center gap-0.5"
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
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-600">
            Total Preserved Assets: <strong>{PHUMULANI_MEDIA_INVENTORY.length}</strong> (All verified &amp; checksummed)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#104F57] hover:bg-[#0c3e44] text-white rounded-lg font-bold cursor-pointer"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
