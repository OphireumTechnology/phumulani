/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unified Portal Layout with Collapsible Role-Aware Left Sidebar (Section 8)
 */

import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import {
  Globe,
  Users,
  Heart,
  Briefcase,
  Layers,
  Bot,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  Shield,
  Bell,
} from 'lucide-react';

import { NotificationCenterModal } from './NotificationCenterModal';
import { clientNotificationService } from '../services/clientNotificationService';
import { PhumulaniLogo } from './branding/PhumulaniLogo';

export interface PortalNavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface PortalNavGroup {
  groupLabel?: string;
  items: PortalNavItem[];
}

interface PortalLayoutProps {
  portalId: 'community' | 'donor' | 'staff' | 'governance' | 'ai-workforce' | 'readiness';
  portalTitle: string;
  portalSubtitle: string;
  currentUser: User;
  onViewChange: (view: string) => void;
  navGroups: PortalNavGroup[];
  activeItemId: string;
  onSelectNavItem: (id: string) => void;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  portalId,
  portalTitle,
  portalSubtitle,
  currentUser,
  onViewChange,
  navGroups,
  activeItemId,
  onSelectNavItem,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const portalsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!portalsDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (portalsDropdownRef.current && !portalsDropdownRef.current.contains(e.target as Node)) {
        setPortalsDropdownOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPortalsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [portalsDropdownOpen]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileSidebarOpen]);

  React.useEffect(() => {
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

  const portals = [
    { id: 'public', label: 'Public Website', icon: Globe },
    { id: 'community', label: 'Community & Volunteer Hub', icon: Users },
    { id: 'donor', label: 'Donor & Sponsor Portal', icon: Heart },
    { id: 'staff', label: 'Staff Command Center', icon: Briefcase },
    { id: 'governance', label: 'Executive & Governance', icon: Layers },
    { id: 'ai-workforce', label: 'AI Command Center', icon: Bot },
    { id: 'readiness', label: '12 Release Gates', icon: UserCheck },
  ];

  const handleSafeExit = () => {
    window.location.replace('https://weather.com');
  };

  const activeItemLabel =
    navGroups
      .flatMap((g) => g.items)
      .find((i) => i.id === activeItemId)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-phumulani-cream flex flex-col">
      {/* Top Portal Header Bar */}
      <div className="bg-white border-b border-phumulani-charcoal/12 px-4 sm:px-6 h-14 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile sidebar trigger */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-phumulani-charcoal hover:bg-phumulani-cream cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
            aria-expanded={mobileSidebarOpen}
            aria-controls="portal-mobile-sidebar"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-heading min-w-0">
            <button
              onClick={() => onViewChange('public')}
              className="text-phumulani-charcoal hover:text-phumulani-earth font-medium hidden sm:inline cursor-pointer"
            >
              Phumulani
            </button>
            <span className="text-phumulani-charcoal/40 hidden sm:inline">/</span>
            <span className="font-semibold text-phumulani-charcoal truncate">{portalTitle}</span>
            <span className="text-phumulani-charcoal/40">/</span>
            <span className="font-bold text-phumulani-earth truncate">{activeItemLabel}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Return to Public Website */}
          <button
            onClick={() => onViewChange('public')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-heading font-semibold text-phumulani-charcoal hover:text-phumulani-earth px-2.5 py-1 rounded-md hover:bg-phumulani-cream transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>

          {/* Portal Switcher Dropdown */}
          <div className="relative" ref={portalsDropdownRef}>
            <button
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              aria-haspopup="menu"
              aria-expanded={portalsDropdownOpen}
              className="flex items-center gap-1.5 text-xs font-heading font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/20 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth whitespace-nowrap"
            >
              <span>Portals</span>
              <ChevronDown className={`w-3 h-3 text-phumulani-charcoal transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {portalsDropdownOpen && (
              <div
                role="menu"
                aria-label="Switch Portal"
                className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-phumulani-charcoal/15 py-1.5 z-50 animate-fadeIn"
              >
                <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-phumulani-earth border-b border-phumulani-cream mb-1">
                  Switch Portal
                </div>
                {portals.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      role="menuitem"
                      onClick={() => {
                        onViewChange(p.id);
                        setPortalsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 hover:bg-phumulani-cream transition-colors cursor-pointer ${
                        p.id === portalId ? 'font-bold text-phumulani-earth bg-phumulani-cream font-heading' : 'text-phumulani-charcoal'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* In-App Notification Center Bell */}
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="relative p-1.5 rounded-lg bg-white hover:bg-phumulani-cream border border-phumulani-charcoal/20 text-phumulani-charcoal transition-colors cursor-pointer"
            title="Open Notification Center"
            aria-label="Open Notification Center"
          >
            <Bell className="w-4 h-4 text-phumulani-earth" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-phumulani-earth text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full ring-2 ring-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Safe Exit */}
          <button
            onClick={handleSafeExit}
            className="bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-heading font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
            title="Instant safe exit to Weather.com (replaces browser history)"
          >
            <span>SAFE EXIT</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Main Portal View Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-phumulani-charcoal/12 transition-all duration-200 select-none ${
            isSidebarCollapsed ? 'w-18' : 'w-64'
          }`}
        >
          {/* Sidebar Top: Portal Identity */}
          <div className="p-4 border-b border-phumulani-cream">
            {!isSidebarCollapsed ? (
              <div className="flex items-start gap-2.5">
                <PhumulaniLogo variant="mark" size={32} className="shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-sm text-phumulani-earth leading-tight truncate">
                    {portalTitle}
                  </div>
                  <div className="text-[11px] text-phumulani-charcoal/75 truncate mt-0.5">
                    {portalSubtitle}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center" title={portalTitle}>
                <PhumulaniLogo variant="mark" size={32} />
              </div>
            )}
          </div>

          {/* Nav Items List */}
          <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && group.groupLabel && (
                  <div className="px-2.5 text-[10px] font-bold text-phumulani-earth uppercase tracking-wider">
                    {group.groupLabel}
                  </div>
                )}
                {group.items.map((item) => {
                  const isActive = activeItemId === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectNavItem(item.id)}
                      className={`w-full flex items-center rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer ${
                        isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-phumulani-earth text-white shadow-xs'
                          : 'text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && <Icon className="w-4 h-4 shrink-0" />}
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums shrink-0 ${
                            isActive ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Active User & Security Status */}
          <div className="p-3.5 border-t border-phumulani-cream bg-phumulani-cream/60">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-phumulani-earth text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-heading font-bold text-phumulani-charcoal truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-phumulani-charcoal/80 capitalize truncate">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-phumulani-earth text-white flex items-center justify-center font-bold text-xs mx-auto">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-phumulani-charcoal/80 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <nav id="portal-mobile-sidebar" aria-label="Mobile portal navigation" className="relative w-72 max-w-[calc(100vw-1rem)] bg-white h-full shadow-2xl flex flex-col z-10">
              <div className="p-4 border-b border-phumulani-cream flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhumulaniLogo variant="mark" size={28} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="font-heading font-bold text-sm text-phumulani-earth truncate">
                      {portalTitle}
                    </div>
                    <div className="text-[10px] text-phumulani-charcoal truncate">
                      {currentUser.name} ({currentUser.role})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-phumulani-charcoal"
                  aria-label="Close mobile portal navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Return to Public Website */}
              <div className="p-3 border-b border-phumulani-cream">
                <button
                  onClick={() => {
                    onViewChange('public');
                    setMobileSidebarOpen(false);
                  }}
                  className="min-h-[44px] w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-earth hover:text-phumulani-charcoal font-heading font-semibold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>Return to Public Website</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    {group.groupLabel && (
                      <div className="px-2 text-[10px] font-bold text-phumulani-earth uppercase tracking-wider">
                        {group.groupLabel}
                      </div>
                    )}
                    {group.items.map((item) => {
                      const isActive = activeItemId === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectNavItem(item.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-phumulani-earth text-white shadow-xs'
                              : 'text-phumulani-charcoal hover:bg-phumulani-cream'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4 shrink-0" />}
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold tabular-nums ${isActive ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* PORTAL MAIN CONTENT VIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

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
        currentLang="en"
      />
    </div>
  );
};
