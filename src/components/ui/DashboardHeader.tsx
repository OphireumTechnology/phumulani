/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DashboardHeader — Restrained Professional Dashboard Header Component
 * Design Tokens: Deep Teal (#006D6F), Neutral Slate, Restrained Clean Lines
 */

import React from 'react';
import { ArrowLeft, Bell, ExternalLink, ChevronDown, LucideIcon } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface DashboardHeaderProps {
  portalTitle: string;
  activeItemLabel: string;
  userName: string;
  userRole: string;
  unreadCount?: number;
  onViewChange: (view: string) => void;
  onOpenNotifications?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  portals?: { id: string; label: string; icon?: LucideIcon }[];
  activePortalId?: string;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  portalTitle,
  activeItemLabel,
  userName,
  userRole,
  unreadCount = 0,
  onViewChange,
  onOpenNotifications,
  onToggleSidebar,
  isSidebarCollapsed,
  portals,
  activePortalId,
  className = '',
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleSafeExit = () => {
    window.location.replace('https://weather.com');
  };

  return (
    <header className={`bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between z-30 sticky top-0 shadow-2xs ${className}`}>
      {/* Left: Breadcrumbs & Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onViewChange('public')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#006D6F] font-heading font-medium"
          title="Return to Public Website"
        >
          <BrandLogo variant="mark" size={24} className="shrink-0" />
          <span className="hidden sm:inline">Phumulani</span>
        </button>

        <span className="text-slate-300 hidden sm:inline">/</span>

        <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 truncate">
          {portalTitle}
        </span>

        <span className="text-slate-300 hidden md:inline">/</span>

        <span className="font-heading font-bold text-xs text-[#006D6F] hidden md:inline truncate">
          {activeItemLabel}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => onViewChange('public')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-heading font-semibold text-slate-600 hover:text-[#006D6F] px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Website</span>
        </button>

        {portals && portals.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-heading font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>Portals</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-heading uppercase font-bold text-slate-400">
                  Switch Portal
                </div>
                {portals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onViewChange(p.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      p.id === activePortalId
                        ? 'font-bold text-[#006D6F] bg-teal-50'
                        : 'text-slate-700 font-sans'
                    }`}
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Notification Center"
            aria-label="Notification Center"
          >
            <Bell className="w-4 h-4 text-[#006D6F]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F05A28] text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={handleSafeExit}
          className="bg-[#C62828] hover:bg-[#a51d1d] text-white font-heading font-bold px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          title="Instant safe exit to Weather.com (replaces browser history)"
        >
          <span>SAFE EXIT</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
