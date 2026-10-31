/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Notification Center Modal & Drawer
 * Multi-role in-app notification center, unread badge indicator, category filtering,
 * read status synchronization, multilingual rendering, and notification preferences.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Filter,
  ShieldAlert,
  Settings,
  Archive,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  operationalEventService,
  ScopedInAppNotification,
  UserNotificationPreferences,
} from '../services/operationalEventService';
import type { User } from '../types';
import type { SupportedLanguageCode } from '../types/phase33';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentLang: string;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<ScopedInAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const langCode = (['en', 'so', 'es', 'hmn', 'kar', 'orm', 'am'].includes(currentLang)
    ? currentLang
    : 'en') as SupportedLanguageCode;

  const userSession = {
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

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await operationalEventService.getNotificationsForUser(userSession, {
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        unreadOnly,
      });
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
      const prefs = await operationalEventService.getNotificationPreferences(currentUser.id);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedCategory, unreadOnly, currentUser.id]);

  const handleMarkRead = async (notifId: string) => {
    try {
      const res = await operationalEventService.markNotificationRead(notifId, userSession);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === notifId ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleArchive = async (notifId: string) => {
    try {
      const res = await operationalEventService.archiveNotification(notifId, userSession);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== notifId));
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  const handleSavePreferences = async (updates: Partial<UserNotificationPreferences>) => {
    if (!preferences) return;
    setSavingPrefs(true);
    try {
      const res = await operationalEventService.updateNotificationPreferences(
        currentUser.id,
        updates,
        userSession
      );
      if (res.success && res.preferences) {
        setPreferences(res.preferences);
        setFeedbackMsg('Preferences saved successfully.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#104F57] to-[#176B76] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl relative">
              <Bell className="w-5 h-5 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#104F57]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 id="notification-center-title" className="text-base sm:text-lg font-bold font-serif leading-tight">
                {operationalEventService.localizeKey('notif.center.title', langCode) || 'Notification Center'}
              </h2>
              <p className="text-xs text-emerald-100 font-sans">
                {unreadCount} unread • {currentUser.name} ({currentUser.role.replace('_', ' ')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
              title="Refresh notifications"
              aria-label="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-[#104F57] text-[#104F57]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'preferences'
                ? 'border-[#104F57] text-[#104F57]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Communication Preferences
          </button>
        </div>

        {/* Notification Tab Content */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {['ALL', 'MEMBER', 'CASEWORKER', 'PROGRAM', 'VOLUNTEER', 'DONOR', 'REPORTING', 'SECURITY'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#104F57] text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-[#104F57] focus:ring-[#104F57]"
                />
                Unread only
              </label>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-sm font-medium">No notifications in this view.</p>
                  <p className="text-xs text-slate-400 mt-1">You are all caught up on operational activities.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.readAt;
                  const localizedTitle = operationalEventService.localizeKey(
                    notif.titleKey,
                    langCode,
                    notif.interpolationParams
                  );
                  const localizedMessage = operationalEventService.localizeKey(
                    notif.messageKey,
                    langCode,
                    notif.interpolationParams
                  );

                  return (
                    <div
                      key={notif.notificationId}
                      className={`pt-3 first:pt-0 p-3 rounded-xl transition-all ${
                        isUnread
                          ? 'bg-amber-50/60 border border-amber-200/80 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {isUnread ? (
                            <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0 ring-4 ring-amber-100" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 mt-1 text-slate-300 shrink-0" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 leading-tight">
                                {localizedTitle}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                {notif.category}
                              </span>
                              {notif.confidentialityLevel === 'SAFEGUARDING_RESTRICTED' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" /> RESTRICTED
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {localizedMessage}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span>•</span>
                              <span>Ref: {notif.relatedEntityType}</span>
                              {notif.externalDeliveryStatus && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 italic">
                                    Delivery: Staged (OAuth Deferred)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkRead(notif.notificationId)}
                              className="p-1.5 text-xs text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleArchive(notif.notificationId)}
                            className="p-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Archive notification"
                            aria-label="Archive notification"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab Content */}
        {activeTab === 'preferences' && preferences && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold block mb-1">Strict Policy Invariant:</strong>
              Mandatory operational and security notices (direct case assignments, safeguarding crisis alerts,
              and security policy violations) cannot be suppressed by communication preferences.
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                {feedbackMsg}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Optional Notification Categories
              </h3>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Community Program Updates</div>
                  <div className="text-[11px] text-slate-500">
                    Notifications about new workshops, capacity updates, and event reminders.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.programUpdates}
                  onChange={(e) => handleSavePreferences({ programUpdates: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-[#104F57] focus:ring-[#104F57] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Volunteer Opportunities & Shifts</div>
                  <div className="text-[11px] text-slate-500">
                    Notifications about available volunteer shifts, orientations, and community projects.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.volunteerUpdates}
                  onChange={(e) => handleSavePreferences({ volunteerUpdates: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-[#104F57] focus:ring-[#104F57] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Fundraising & Campaign News</div>
                  <div className="text-[11px] text-slate-500">
                    Quarterly impact statements, donor stewardship letters, and capital campaign updates.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.fundraisingCommunications}
                  onChange={(e) => handleSavePreferences({ fundraisingCommunications: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-[#104F57] focus:ring-[#104F57] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">General Community Announcements</div>
                  <div className="text-[11px] text-slate-500">
                    Phumulani organizational announcements and holiday operational schedule.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.generalAnnouncements}
                  onChange={(e) => handleSavePreferences({ generalAnnouncements: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-[#104F57] focus:ring-[#104F57] w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            VAWA §1367 Safeguarding Protected • Zero PII in Notifications
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
