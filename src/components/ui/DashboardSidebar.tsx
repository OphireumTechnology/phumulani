/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DashboardSidebar — Restrained Professional Responsive Sidebar Component
 * Active Token: Deep Teal (#006D6F), Clear Hierarchy, Accessible Contrast
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface SidebarGroup {
  groupLabel?: string;
  items: SidebarItem[];
}

export interface DashboardSidebarProps {
  portalTitle: string;
  portalSubtitle?: string;
  groups: SidebarGroup[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  userRole?: string;
  className?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  portalTitle,
  portalSubtitle,
  groups,
  activeItemId,
  onSelectItem,
  isCollapsed = false,
  onToggleCollapse,
  userName,
  userRole,
  className = '',
}) => {
  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      } ${className}`}
    >
      {/* Header / Brand */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo variant="mark" size={32} className="shrink-0" />
            <div className="min-w-0">
              <div className="font-heading font-bold text-sm text-[#006D6F] truncate leading-tight">
                {portalTitle}
              </div>
              {portalSubtitle && (
                <div className="text-[10px] text-slate-500 font-sans truncate mt-0.5">
                  {portalSubtitle}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto" title={portalTitle}>
            <BrandLogo variant="mark" size={32} />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && group.groupLabel && (
              <div className="px-2 text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider">
                {group.groupLabel}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activeItemId === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className={`w-full flex items-center rounded-lg text-xs font-heading font-semibold transition-colors cursor-pointer ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-[#006D6F] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {Icon && <Icon className="w-4 h-4 shrink-0" />}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
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

      {/* Footer / User Profile */}
      {userName && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#006D6F]/10 text-[#006D6F] flex items-center justify-center font-heading font-bold text-xs shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-heading font-bold text-slate-800 truncate leading-tight">
                  {userName}
                </div>
                {userRole && (
                  <div className="text-[10px] text-slate-500 font-sans capitalize truncate">
                    {userRole.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#006D6F]/10 text-[#006D6F] flex items-center justify-center font-heading font-bold text-xs mx-auto">
              {userName.charAt(0)}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
