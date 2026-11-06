/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Clean 3-Level Header & Navigation Architecture
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { SafeImage } from './SafeImage';
import { PhumulaniLogo } from './branding/PhumulaniLogo';
import { BrandPatternDivider } from './branding/BrandPatternDivider';
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
  Bell,
} from 'lucide-react';

import { SUPPORTED_LANGUAGES } from '../services/multilingualAccessibilityService';
import { NotificationCenterModal } from './NotificationCenterModal';
import { operationalEventService } from '../services/operationalEventService';

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
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const session = {
          sessionId: `sess-${currentUser.id}`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          departmentId: currentUser.department || '',
          department: currentUser.department,
          token: `tok-${currentUser.id}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        };
        const res = await operationalEventService.getNotificationsForUser(session, { unreadOnly: true });
        if (isMounted && res.success) {
          setUnreadCount(res.unreadCount);
        }
      } catch {
        // Safe development fallback
      }
    };
    fetchUnread();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

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
      <div className="bg-[#006D6F] text-white py-1.5 px-4 text-xs max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[11px] text-teal-50 truncate font-lato">
              For your safety: Use <strong>Safe Exit</strong> or press <kbd className="bg-teal-900 px-1 py-0.2 rounded text-[10px] border border-teal-700">ESC</kbd> twice.
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-300" />
              <label htmlFor="header-lang-select" className="sr-only">Select Language</label>
              <select
                id="header-lang-select"
                aria-label="Select Language"
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-teal-900 border border-teal-700 text-teal-100 rounded px-1.5 py-0.5 text-[11px] font-medium focus:ring-1 focus:ring-teal-300 outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-slate-800">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-teal-700">|</span>

            {/* Quick Safe Exit Button */}
            <button
              onClick={handleSafeExit}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-2.5 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer font-heading"
              title="Instant safe exit to Weather.com (replaces browser history)"
            >
              <span>SAFE EXIT</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* African Geometric Mosaic Pattern Accent Ribbon */}
      <BrandPatternDivider height={4} />

      {/* ========================================================
          LEVEL 3: MAIN WEBSITE NAVIGATION
          Height: 76px, Max-width: 1280px (max-w-7xl)
          Left: Logo | Center: Navigation | Right: Actions
          ======================================================== */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-1 sm:gap-3 h-19 min-w-0 w-full">
          {/* LEFT: Official Phumulani Mosaic USA Logo */}
          <button
            onClick={() => {
              onViewChange('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 xl:flex-none text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#006D6F] py-1"
            aria-label="Phumulani Home"
          >
            <PhumulaniLogo
              variant="full"
              className="h-10 sm:h-12 w-auto max-w-full min-w-0 max-w-[120px] min-[400px]:max-w-[170px] sm:max-w-[230px] xl:max-w-[210px] 2xl:max-w-[260px] object-contain transition-transform group-hover:scale-[1.02]"
              alt="Phumulani — The voice of immigrants and refugees in America"
            />
          </button>

          {/* CENTER: Main Website Navigation (Desktop) */}
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-5 text-[12px] 2xl:text-[13px] font-semibold text-slate-700 font-heading whitespace-nowrap">
            <button
              onClick={() => {
                onViewChange('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#006D6F] transition-colors cursor-pointer pb-0.5 ${
                activeView === 'public' ? 'text-[#006D6F] border-b-2 border-[#006D6F]' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateToSection('founder-section')}
              className="hover:text-[#006D6F] text-[#F05A28] font-bold transition-colors cursor-pointer"
            >
              Founder &amp; Legacy
            </button>
            <button
              onClick={() => navigateToSection('programs-section')}
              className="hover:text-[#006D6F] transition-colors cursor-pointer"
            >
              Programs
            </button>
            <button
              onClick={() => navigateToSection('get-involved-section')}
              className="hover:text-[#006D6F] transition-colors cursor-pointer"
            >
              Get Involved
            </button>
            <button
              onClick={() => navigateToSection('about-section')}
              className="hover:text-[#006D6F] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => navigateToSection('events-section')}
              className="hover:text-[#006D6F] transition-colors cursor-pointer"
            >
              Events
            </button>
            <button
              onClick={() => navigateToSection('contact-section')}
              className="hover:text-[#006D6F] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* RIGHT: Primary Action Group */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Get Help Accent Button */}
            <button
              onClick={() => navigateToSection('get-help-section')}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer font-heading"
              title="Discreet support routing & emergency help"
              aria-label="Get Help"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden xs:inline">Get Help</span>
            </button>

            {/* Donate CTA Button in Ubuntu Orange */}
            <button
              onClick={() => navigateToSection('donate-section')}
              className="flex items-center gap-1 bg-[#F05A28] hover:bg-[#d94819] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer font-heading tracking-wide"
              aria-label="Donate"
            >
              <Heart className="w-3.5 h-3.5 fill-white/20" />
              <span className="hidden min-[360px]:inline">Donate</span>
            </button>

            {/* Portal Switcher / Login Dropdown (Desktop / Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Access Portals & Staff Command"
              >
                <LogIn className="w-3.5 h-3.5 text-[#104F57]" />
                <span>Portals</span>
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

            {/* In-App Notification Center Bell */}
            <button
              onClick={() => setNotificationModalOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Open Notification Center"
              aria-label="Open Notification Center"
            >
              <Bell className="w-4 h-4 text-[#104F57]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <nav id="public-mobile-navigation" aria-label="Mobile website and portal navigation" className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
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
              onClick={() => navigateToSection('contact-section')}
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
        </nav>
      )}

      {/* Cross-Portal Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          // Refresh unread count on modal close
          const session = {
            sessionId: `sess-${currentUser.id}`,
            userId: currentUser.id,
            userEmail: currentUser.email,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            departmentId: currentUser.department || '',
            department: currentUser.department,
            token: `tok-${currentUser.id}`,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          };
          operationalEventService.getNotificationsForUser(session, { unreadOnly: true }).then((res) => {
            if (res.success) setUnreadCount(res.unreadCount);
          });
        }}
        currentUser={currentUser}
        currentLang={currentLang}
      />
    </header>
  );
};
