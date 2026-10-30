/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unified Portal Layout with Collapsible Role-Aware Left Sidebar (Section 8)
 */

import React, { useState } from 'react';
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
import { operationalEventService } from '../services/operationalEventService';

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

  React.useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const session = {
          sessionId: `sess-${currentUser.id}`,
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
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
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col">
      {/* Top Portal Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar trigger */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Navigation Sidebar"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onViewChange('public')}
              className="text-slate-500 hover:text-[#104F57] font-medium hidden sm:inline"
            >
              Phumulani
            </button>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="font-semibold text-slate-700">{portalTitle}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-[#104F57]">{activeItemLabel}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Return to Public Website */}
          <button
            onClick={() => onViewChange('public')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#104F57] px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>

          {/* Portal Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPortalsDropdownOpen(!portalsDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>Portals</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {portalsDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Switch Portal
                </div>
                {portals.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onViewChange(p.id);
                        setPortalsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                        p.id === portalId ? 'font-bold text-[#104F57] bg-teal-50/70' : 'text-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
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
            className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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

          {/* Safe Exit */}
          <button
            onClick={handleSafeExit}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
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
          className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none ${
            isSidebarCollapsed ? 'w-18' : 'w-64'
          }`}
        >
          {/* Sidebar Top: Portal Identity */}
          <div className="p-4 border-b border-slate-100">
            {!isSidebarCollapsed ? (
              <div>
                <div className="font-serif font-bold text-sm text-[#104F57] leading-tight">
                  {portalTitle}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {portalSubtitle}
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#104F57] text-white flex items-center justify-center font-serif text-sm font-bold mx-auto">
                P
              </div>
            )}
          </div>

          {/* Nav Items List */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!isSidebarCollapsed && group.groupLabel && (
                  <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-[#104F57] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && <Icon className="w-4 h-4 shrink-0" />}
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#104F57]/10 text-[#104F57] flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize truncate">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#104F57]/10 text-[#104F57] flex items-center justify-center font-bold text-xs mx-auto">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col z-10">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#104F57]">
                    {portalTitle}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentUser.name} ({currentUser.role})
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    {group.groupLabel && (
                      <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                            isActive
                              ? 'bg-[#104F57] text-white'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PORTAL MAIN CONTENT VIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Cross-Portal Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationModalOpen}
        onClose={() => {
          setNotificationModalOpen(false);
          const session = {
            sessionId: `sess-${currentUser.id}`,
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
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
        currentLang="en"
      />
    </div>
  );
};
