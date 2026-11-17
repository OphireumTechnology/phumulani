/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Clean Sticky Header & Navigation Architecture
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from '../types';
import { PhumulaniLogo } from './branding/PhumulaniLogo';
import {
  ShieldCheck,
  Languages,
  LifeBuoy,
  Menu,
  X,
  ExternalLink,
  Bot,
  UsersRound,
  Heart,
  Briefcase,
  Layers3,
  ChevronDown,
  Bell,
  Globe,
  Activity,
} from 'lucide-react';

import { SUPPORTED_LANGUAGES } from '../services/multilingualAccessibilityService';
import { NotificationCenterModal } from './NotificationCenterModal';
import { clientNotificationService } from '../services/clientNotificationService';

interface HeaderProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

const PUBLIC_NAV_ITEMS = [
  { id: 'home', label: 'Home', sectionId: null },
  { id: 'founder-section', label: 'Founder & Legacy', sectionId: 'founder-section' },
  { id: 'programs-section', label: 'Programs', sectionId: 'programs-section' },
  { id: 'get-involved-section', label: 'Get Involved', sectionId: 'get-involved-section' },
  { id: 'about-section', label: 'About', sectionId: 'about-section' },
  { id: 'events-section', label: 'Events', sectionId: 'events-section' },
  { id: 'contact-section', label: 'Contact', sectionId: 'contact-section' },
] as const;

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  onViewChange,
  currentLang,
  onLangChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const portalsDropdownRef = useRef<HTMLDivElement>(null);

  // Subtle elevation + active section scroll-spy on public website
  useEffect(() => {
    const updateScrollState = () => {
      const y = window.scrollY;
      setIsScrolled(y > 12);

      if (activeView !== 'public') return;
      if (y < 200) {
        setActiveSection('home');
        return;
      }

      const sectionIds = [
        'contact-section',
        'events-section',
        'get-involved-section',
        'about-section',
        'programs-section',
        'founder-section',
      ];
      const offset = 150;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= offset) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection('home');
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [activeView]);

  // Close portals dropdown on outside click or Escape
  useEffect(() => {
    if (!portalsDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (portalsDropdownRef.current && !portalsDropdownRef.current.contains(e.target as Node)) {
        setPortalsDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPortalsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [portalsDropdownOpen]);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await clientNotificationService.getNotificationsForUser({
          role: currentUser.role,
          unreadOnly: true,
        });
        if (isMounted && res.success) {
          setUnreadCount(res.unreadCount);
        }
      } catch {
        // Ignore when unauthenticated or offline
      }
    };
    fetchUnread();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.role]);

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
    { id: 'community', label: 'Community & Volunteer Hub', icon: UsersRound, desc: 'Applications, hours, mentorship & training' },
    { id: 'donor', label: 'Donor & Sponsor Portal', icon: Heart, desc: 'Giving history, receipts, sponsorship tiers' },
    { id: 'staff', label: 'Staff Command Center', icon: Briefcase, desc: 'Unified inbox, AI review, CRM, volunteer screening' },
    { id: 'governance', label: 'Executive & Board Portal', icon: Layers3, desc: 'Budgets, board resolutions, grants, risk register' },
    { id: 'ai-workforce', label: 'AI Command Center (18 Agents)', icon: Bot, desc: 'Agent registry, policy gateway, evaluations' },
  ];

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
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
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      {/* ========================================================
          LEVEL 2: SAFETY & ACCESSIBILITY BAR
          ======================================================== */}
      <div className="bg-phumulani-charcoal text-phumulani-cream py-1.5 px-2 min-[400px]:px-4 text-xs max-w-full overflow-hidden border-b border-phumulani-charcoal">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 min-[400px]:gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 min-[400px]:gap-2 min-w-0 flex-1 overflow-hidden">
            <ShieldCheck className="w-3.5 h-3.5 text-phumulani-gold shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] text-phumulani-cream truncate">
              Confidential Support &amp; Safety: Use <strong>Safe Exit</strong> or press{' '}
              <kbd className="bg-phumulani-earth text-white px-1.5 py-0.5 rounded text-[10px] border border-phumulani-gold font-mono">
                ESC
              </kbd>{' '}
              twice.
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-[400px]:gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 min-[400px]:gap-1.5">
              <Languages className="w-3.5 h-3.5 text-phumulani-teal shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <label htmlFor="header-lang-select" className="sr-only">
                Select Language
              </label>
              <select
                id="header-lang-select"
                aria-label="Select Language"
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value)}
                className="bg-phumulani-charcoal border border-phumulani-cream/40 text-white rounded-md px-1.5 min-[400px]:px-2 py-0.5 text-[11px] font-medium max-w-[105px] min-[400px]:max-w-[155px] sm:max-w-none focus:ring-1 focus:ring-phumulani-gold outline-none cursor-pointer transition-colors"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-phumulani-charcoal">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-phumulani-cream/40" aria-hidden="true">
              |
            </span>

            {/* Quick Safe Exit Button */}
            <button
              onClick={handleSafeExit}
              className="bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-bold px-2.5 py-1 rounded-md text-[11px] transition-colors duration-150 flex items-center gap-1 cursor-pointer font-heading tracking-wide whitespace-nowrap focus-visible:ring-2 focus-visible:ring-phumulani-gold"
              title="Instant safe exit to Weather.com (replaces browser history)"
            >
              <span>SAFE EXIT</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          LEVEL 3: MAIN WEBSITE NAVIGATION
          ======================================================== */}
      <div className="bg-white border-b border-phumulani-charcoal/15">
        <div className="max-w-7xl mx-auto px-2 min-[400px]:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1 min-[400px]:gap-2 lg:gap-4 h-[68px] sm:h-20 min-w-0 w-full">
            {/* LEFT: Official Phumulani Logo */}
            <button
              onClick={() => {
                setActiveSection('home');
                onViewChange('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center shrink min-w-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded-lg py-1 text-left group"
              aria-label="Phumulani Home"
            >
              <PhumulaniLogo
                variant="full"
                className="h-9 min-[400px]:h-11 sm:h-12 w-auto max-w-[100px] min-[400px]:max-w-[145px] min-[480px]:max-w-[205px] sm:max-w-[240px] object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                alt="Phumulani — The voice of immigrants and refugees in America"
              />
            </button>

            {/* CENTER: Main Website Navigation (Desktop) */}
            <nav
              aria-label="Primary website navigation"
              className="hidden xl:flex items-center gap-5 2xl:gap-7 text-[13px] font-medium text-phumulani-charcoal font-heading whitespace-nowrap"
            >
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive = activeView === 'public' && activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => {
                      if (item.sectionId) {
                        navigateToSection(item.sectionId);
                      } else {
                        setActiveSection('home');
                        onViewChange('public');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`nav-link-underline hover:text-phumulani-earth transition-colors duration-150 cursor-pointer py-1.5 focus-visible:ring-2 focus-visible:ring-phumulani-earth rounded ${
                      isActive ? 'text-phumulani-earth font-bold' : 'text-phumulani-charcoal'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* RIGHT: Primary Action Group with Uniform Height */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Get Help Accent Button */}
              <button
                onClick={() => navigateToSection('get-help-section')}
                className="hidden min-[400px]:flex h-9 sm:h-10 min-w-[38px] items-center justify-center gap-1.5 bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-earth hover:text-phumulani-charcoal border border-phumulani-earth/25 px-2.5 sm:px-3.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer font-heading whitespace-nowrap focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                title="Discreet support routing & emergency help"
                aria-label="Get Help"
              >
                <LifeBuoy className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden sm:inline">Get Help</span>
              </button>

              {/* Donate CTA Button */}
              <button
                onClick={() => navigateToSection('donate-section')}
                className="h-9 sm:h-10 min-w-[38px] flex items-center justify-center gap-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white px-2.5 min-[400px]:px-3 sm:px-4 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer font-heading tracking-wide shadow-xs whitespace-nowrap focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                aria-label="Donate"
              >
                <Heart className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden xs:inline">Donate</span>
              </button>

              {/* Portal Switcher Dropdown */}
              <div className="relative hidden sm:block" ref={portalsDropdownRef}>
                <button
                  onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
                  aria-haspopup="menu"
                  aria-expanded={portalsDropdownOpen}
                  className="h-9 sm:h-10 flex items-center gap-1.5 text-xs font-semibold px-3 rounded-lg bg-white hover:bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/20 transition-all duration-150 cursor-pointer font-heading whitespace-nowrap focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                  title="Access Portals &amp; Staff Command"
                >
                  <Layers3 className="w-3.5 h-3.5 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                  <span>Portals</span>
                  <ChevronDown
                    className={`w-3 h-3 text-phumulani-charcoal transition-transform duration-150 ${
                      portalsDropdownOpen ? 'rotate-180' : ''
                    }`}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {portalsDropdownOpen && (
                    <motion.div
                      role="menu"
                      aria-label="Application Portals"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-phumulani-charcoal/15 py-2 z-50"
                    >
                      <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-phumulani-earth border-b border-phumulani-cream mb-1">
                        Application Portals
                      </div>
                      {portals.map((portal) => {
                        const Icon = portal.icon;
                        const isActive = activeView === portal.id;
                        return (
                          <button
                            key={portal.id}
                            role="menuitem"
                            onClick={() => {
                              onViewChange(portal.id);
                              setPortalsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-phumulani-cream transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth ${
                              isActive ? 'bg-phumulani-cream font-semibold' : ''
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-lg mt-0.5 ${
                                isActive ? 'bg-phumulani-earth text-white' : 'bg-phumulani-cream text-phumulani-earth'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-heading font-semibold ${isActive ? 'text-phumulani-earth' : 'text-phumulani-charcoal'}`}>
                                {portal.label}
                              </div>
                              <div className="text-[11px] text-phumulani-charcoal/80 line-clamp-1">{portal.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* In-App Notification Center Bell */}
              <button
                onClick={() => setNotificationModalOpen(true)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 relative items-center justify-center rounded-lg bg-white hover:bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/20 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                title="Open Notification Center"
                aria-label="Open Notification Center"
              >
                <Bell className="w-4 h-4 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-phumulani-earth text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full ring-2 ring-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Drawer Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden h-9 w-9 sm:h-10 sm:w-10 shrink-0 flex items-center justify-center text-phumulani-charcoal hover:text-phumulani-earth rounded-lg hover:bg-phumulani-cream border border-phumulani-charcoal/15 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="public-mobile-navigation"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="public-mobile-navigation"
            aria-label="Mobile website and portal navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="xl:hidden w-full max-w-full overflow-x-hidden border-t border-phumulani-cream bg-white px-3 min-[400px]:px-4 pt-3 pb-6 space-y-4 shadow-xl"
          >
            <div className="font-bold text-xs text-phumulani-earth uppercase tracking-wider font-heading">
              Main Navigation
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold min-w-0 font-heading">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive = activeView === 'public' && activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.sectionId) {
                        navigateToSection(item.sectionId);
                      } else {
                        setActiveSection('home');
                        onViewChange('public');
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`min-h-[44px] min-w-0 flex items-center px-3 py-2 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth text-left ${
                      isActive
                        ? 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/40 font-bold'
                        : 'hover:bg-phumulani-cream text-phumulani-charcoal'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => navigateToSection('get-help-section')}
                className="min-h-[44px] min-w-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/30 font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth text-left"
              >
                <LifeBuoy className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="truncate">Get Help (Safe)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-phumulani-cream font-bold text-xs text-phumulani-earth uppercase tracking-wider font-heading">
              Connected Applications
            </div>
            <div className="space-y-1 min-w-0">
              {portals.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onViewChange(p.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`min-h-[44px] w-full min-w-0 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth ${
                      activeView === p.id ? 'bg-phumulani-earth text-white' : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span className="truncate min-w-0 flex-1">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Cross-Portal Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          clientNotificationService
            .getNotificationsForUser({ role: currentUser.role, unreadOnly: true })
            .then((res) => {
              if (res.success) setUnreadCount(res.unreadCount);
            });
        }}
        currentUser={currentUser}
        currentLang={currentLang}
      />
    </header>
  );
};
