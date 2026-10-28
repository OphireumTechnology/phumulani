/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Clean 3-Level Header & Navigation Architecture
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  ShieldAlert,
  Globe,
  LifeBuoy,
  Menu,
  X,
  ExternalLink,
  Bot,
  Users,
  Heart,
  Briefcase,
  Layers,
  ChevronDown,
  LogIn,
  ShieldCheck,
  Activity,
} from 'lucide-react';

import { SUPPORTED_LANGUAGES } from '../services/multilingualAccessibilityService';

interface HeaderProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  onViewChange,
  currentLang,
  onLangChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);

  // Safe Exit function: replaces browser history and opens neutral destination
  const handleSafeExit = () => {
    window.location.replace('https://weather.com');
  };

  // Keyboard shortcut listener: ESC key pressed twice triggers immediate Safe Exit
  useEffect(() => {
    let lastEscTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscTime < 600) {
          handleSafeExit();
        }
        lastEscTime = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const languages = SUPPORTED_LANGUAGES.map((l) => ({
    code: l.code,
    label: `${l.name} (${l.localName})`,
  }));

  const portals = [
    { id: 'public', label: 'Public Website & CMS', icon: Globe, desc: 'Public community pages, mission, and giving' },
    { id: 'master-admin', label: 'Master Administrator (/admin/master)', icon: ShieldCheck, desc: 'Centralized enterprise control across all 15 operational modules' },
    { id: 'production-status', label: 'Live Production Status (Sec 16)', icon: Activity, desc: 'Real-time health probes & component verification grid' },
    { id: 'community', label: 'Community & Volunteer Hub', icon: Users, desc: 'Applications, hours, mentorship & training' },
    { id: 'donor', label: 'Donor & Sponsor Portal', icon: Heart, desc: 'Giving history, receipts, sponsorship tiers' },
    { id: 'staff', label: 'Staff Command Center', icon: Briefcase, desc: 'Unified inbox, AI review, CRM, volunteer screening' },
    { id: 'governance', label: 'Executive & Board Portal', icon: Layers, desc: 'Budgets, board resolutions, grants, risk register' },
    { id: 'ai-workforce', label: 'AI Command Center (18 Agents)', icon: Bot, desc: 'Agent registry, policy gateway, evaluations' },
  ];

  const currentPortalLabel = portals.find((p) => p.id === activeView)?.label || 'Public Website';

  const navigateToSection = (sectionId: string) => {
    if (activeView !== 'public') {
      onViewChange('public');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* ========================================================
          LEVEL 2: SAFETY & ACCESSIBILITY BAR
          Compact, non-overlapping, with prominent Safe Exit
          ======================================================== */}
      <div className="bg-[#104F57] text-white py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[11px] text-slate-100 truncate sm:overflow-visible">
              For your safety, browser history on this device cannot be completely erased. Use <strong>Safe Exit</strong> or press <kbd className="bg-teal-900 px-1 py-0.2 rounded text-[10px] border border-teal-700">ESC</kbd> twice.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-medium text-teal-100 hover:text-white transition-colors cursor-pointer"
                title="Select Language"
              >
                <Globe className="w-3 h-3 text-teal-300" />
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-2.5 h-2.5 text-teal-300" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-slate-800">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLangChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors ${
                        currentLang === l.code ? 'font-bold text-[#104F57] bg-teal-50' : ''
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-teal-700">|</span>

            {/* Quick Safe Exit Button */}
            <button
              onClick={handleSafeExit}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              title="Instant safe exit to Weather.com (replaces browser history)"
            >
              <span>SAFE EXIT</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          LEVEL 3: MAIN WEBSITE NAVIGATION
          Height: 76px, Max-width: 1280px (max-w-7xl)
          Left: Logo | Center: Navigation | Right: Actions
          ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-19">
          {/* LEFT: Official Phumulani Logo */}
          <button
            onClick={() => {
              onViewChange('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#104F57]"
          >
            <img
              src="/media/branding/phumulani-logo-primary.svg"
              alt="Phumulani Logo Emblem"
              className="w-10 h-10 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <div className="font-serif text-xl font-bold text-[#104F57] tracking-tight group-hover:text-[#633C69] transition-colors leading-none">
                PHUMULANI
              </div>
              <div className="text-[10px] tracking-wider uppercase text-slate-500 font-semibold mt-1">
                MN African Women Against Violence
              </div>
            </div>
          </button>

          {/* CENTER: Main Website Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 text-[13px] font-semibold text-slate-700">
            <button
              onClick={() => {
                onViewChange('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#104F57] transition-colors cursor-pointer pb-0.5 ${
                activeView === 'public' ? 'text-[#104F57] border-b-2 border-[#104F57]' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('founder-section')}
              className="hover:text-[#104F57] text-[#633C69] font-bold transition-colors cursor-pointer"
            >
              Founder &amp; Legacy
            </button>
            <button
              onClick={() => navigateToSection('programs-section')}
              className="hover:text-[#104F57] transition-colors cursor-pointer"
            >
              Programs
            </button>
            <button
              onClick={() => navigateToSection('get-involved-section')}
              className="hover:text-[#104F57] transition-colors cursor-pointer"
            >
              Get Involved
            </button>
            <button
              onClick={() => navigateToSection('about-section')}
              className="hover:text-[#104F57] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => navigateToSection('events-section')}
              className="hover:text-[#104F57] transition-colors cursor-pointer"
            >
              Events
            </button>
            <button
              onClick={() => navigateToSection('get-help-section')}
              className="hover:text-[#104F57] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* RIGHT: Primary Action Group */}
          <div className="flex items-center gap-2.5">
            {/* Get Help Accent Button */}
            <button
              onClick={() => navigateToSection('get-help-section')}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Discreet support routing & emergency help"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
              <span>Get Help</span>
            </button>

            {/* Donate CTA Button */}
            <button
              onClick={() => navigateToSection('donate-section')}
              className="flex items-center gap-1.5 bg-[#D67C35] hover:bg-[#c26d2c] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white/20" />
              <span>Donate</span>
            </button>

            {/* Portal Switcher / Login Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Access Portals & Staff Command"
              >
                <LogIn className="w-3.5 h-3.5 text-[#104F57]" />
                <span className="hidden sm:inline">Portals</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Application Portals
                  </div>
                  {portals.map((portal) => {
                    const Icon = portal.icon;
                    const isActive = activeView === portal.id;
                    return (
                      <button
                        key={portal.id}
                        onClick={() => {
                          onViewChange(portal.id);
                          setPortalsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                          isActive ? 'bg-teal-50 border-l-2 border-[#104F57]' : ''
                        }`}
                      >
                        <div className={`p-1 rounded mt-0.5 ${isActive ? 'bg-[#104F57] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isActive ? 'text-[#104F57]' : 'text-slate-800'}`}>
                            {portal.label}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{portal.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="font-bold text-xs text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onViewChange('public');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('programs-section')}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              Programs
            </button>
            <button
              onClick={() => navigateToSection('get-involved-section')}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              Get Involved
            </button>
            <button
              onClick={() => navigateToSection('about-section')}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              About
            </button>
            <button
              onClick={() => navigateToSection('events-section')}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              Events
            </button>
            <button
              onClick={() => navigateToSection('get-help-section')}
              className="text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800"
            >
              Contact
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 font-bold text-xs text-slate-400 uppercase tracking-wider">
            Connected Applications
          </div>
          <div className="space-y-1">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onViewChange(p.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                    activeView === p.id ? 'bg-[#104F57] text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
