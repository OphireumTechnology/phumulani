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
  clientNotificationService,
  type ScopedInAppNotification,
  type UserNotificationPreferences,
} from '../services/clientNotificationService';
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

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await clientNotificationService.getNotificationsForUser({
        role: currentUser.role,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        unreadOnly,
      });
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
      const prefs = await clientNotificationService.getNotificationPreferences();
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
      const res = await clientNotificationService.markNotificationRead(notifId);
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
      const res = await clientNotificationService.archiveNotification(notifId);
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
      const res = await clientNotificationService.updateNotificationPreferences(updates);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-phumulani-charcoal/15 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-phumulani-charcoal text-white p-4 sm:p-5 flex items-center justify-between border-b border-phumulani-gold/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-phumulani-earth rounded-xl relative border border-phumulani-gold/30">
              <Bell className="w-5 h-5 text-phumulani-gold" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-phumulani-gold text-phumulani-charcoal text-[10px] font-bold tabular-nums px-1.5 py-0.2 rounded-md ring-2 ring-phumulani-charcoal">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 id="notification-center-title" className="text-base sm:text-lg font-bold font-heading leading-tight">
                {clientNotificationService.localizeKey('notif.center.title', langCode) || 'Notification Center'}
              </h2>
              <p className="text-xs text-phumulani-cream font-sans tabular-nums">
                {unreadCount} unread · {currentUser.name} ({currentUser.role.replace('_', ' ')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-phumulani-charcoal text-white transition-colors cursor-pointer"
              title="Refresh notifications"
              aria-label="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-phumulani-charcoal text-white transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-phumulani-charcoal/12 bg-phumulani-cream px-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-4 text-xs font-bold font-heading border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-phumulani-earth text-phumulani-earth'
                : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="tabular-nums">Notifications ({notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-4 text-xs font-bold font-heading border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-phumulani-earth text-phumulani-earth'
                : 'border-transparent text-phumulani-charcoal hover:text-phumulani-earth'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Communication Preferences</span>
          </button>
        </div>

        {/* Notification Tab Content */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-3 bg-phumulani-cream/60 border-b border-phumulani-charcoal/12 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <Filter className="w-3.5 h-3.5 text-phumulani-earth shrink-0" />
                {['ALL', 'MEMBER', 'CASEWORKER', 'PROGRAM', 'VOLUNTEER', 'DONOR', 'REPORTING', 'SECURITY'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-phumulani-earth text-white shadow-2xs'
                          : 'bg-white text-phumulani-charcoal hover:bg-phumulani-gold/25 border border-phumulani-charcoal/15'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-phumulani-charcoal font-medium cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth"
                />
                Unread only
              </label>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-phumulani-cream">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-phumulani-charcoal">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-phumulani-earth" />
                  <p className="text-sm font-medium">No notifications in this view.</p>
                  <p className="text-xs text-phumulani-charcoal mt-1">You are all caught up on operational activities.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.readAt;
                  const localizedTitle = clientNotificationService.localizeKey(
                    notif.titleKey,
                    langCode,
                    notif.interpolationParams
                  );
                  const localizedMessage = clientNotificationService.localizeKey(
                    notif.messageKey,
                    langCode,
                    notif.interpolationParams
                  );

                  return (
                    <div
                      key={notif.notificationId}
                      className={`p-3.5 rounded-xl transition-all ${
                        isUnread
                          ? 'bg-phumulani-cream border border-phumulani-gold/40 shadow-2xs'
                          : 'bg-white hover:bg-phumulani-cream/60 border border-phumulani-charcoal/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {isUnread ? (
                            <span className="w-2 h-2 mt-1.5 rounded-full bg-phumulani-orange shrink-0" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 mt-1 text-phumulani-green shrink-0" />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold font-heading text-phumulani-charcoal leading-tight">
                                {localizedTitle}
                              </span>
                              <span className="text-[11px] font-semibold text-phumulani-earth">
                                · {notif.category}
                              </span>
                              {notif.confidentialityLevel === 'SAFEGUARDING_RESTRICTED' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-phumulani-earth text-white inline-flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" /> RESTRICTED
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-phumulani-charcoal mt-1 leading-relaxed">
                              {localizedMessage}
                            </p>

                            <div className="flex items-center gap-3 mt-2 text-[10px] text-phumulani-charcoal">
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
                                  <span className="text-phumulani-charcoal italic">
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
                              className="p-1.5 text-xs text-phumulani-charcoal hover:text-phumulani-charcoal hover:bg-phumulani-green rounded-lg transition-colors cursor-pointer"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleArchive(notif.notificationId)}
                            className="p-1.5 text-xs text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream rounded-lg transition-colors cursor-pointer"
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
            <div className="p-3.5 bg-phumulani-cream rounded-xl border border-phumulani-charcoal/12 text-xs text-phumulani-charcoal leading-relaxed">
              <strong className="font-bold font-heading block mb-1 text-phumulani-earth">Strict Policy Invariant</strong>
              Mandatory operational and security notices (direct case assignments, safeguarding crisis alerts,
              and security policy violations) cannot be suppressed by communication preferences.
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-phumulani-green/15 rounded-xl border border-phumulani-green text-xs text-phumulani-charcoal font-semibold">
                {feedbackMsg}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold font-heading text-phumulani-earth uppercase tracking-wider">
                Optional Notification Categories
              </h3>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-phumulani-charcoal/12 hover:bg-phumulani-cream/60 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-phumulani-charcoal">Community Program Updates</div>
                  <div className="text-[11px] text-phumulani-charcoal">
                    Notifications about new workshops, capacity updates, and event reminders.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.programUpdates}
                  onChange={(e) => handleSavePreferences({ programUpdates: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-phumulani-charcoal/12 hover:bg-phumulani-cream/60 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-phumulani-charcoal">Volunteer Opportunities &amp; Shifts</div>
                  <div className="text-[11px] text-phumulani-charcoal">
                    Notifications about available volunteer shifts, orientations, and community projects.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.volunteerUpdates}
                  onChange={(e) => handleSavePreferences({ volunteerUpdates: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-phumulani-charcoal/12 hover:bg-phumulani-cream/60 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-phumulani-charcoal">Fundraising &amp; Campaign News</div>
                  <div className="text-[11px] text-phumulani-charcoal">
                    Quarterly impact statements, donor stewardship letters, and capital campaign updates.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.fundraisingCommunications}
                  onChange={(e) => handleSavePreferences({ fundraisingCommunications: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-phumulani-charcoal/12 hover:bg-phumulani-cream/60 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-phumulani-charcoal">General Community Announcements</div>
                  <div className="text-[11px] text-phumulani-charcoal">
                    Phumulani organizational announcements and holiday operational schedule.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.generalAnnouncements}
                  onChange={(e) => handleSavePreferences({ generalAnnouncements: e.target.checked })}
                  disabled={savingPrefs}
                  className="rounded text-phumulani-earth focus:ring-phumulani-earth w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-phumulani-cream border-t border-phumulani-charcoal/12 p-3 px-5 flex items-center justify-between text-xs text-phumulani-charcoal">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-phumulani-earth" />
            VAWA § 1367 Safeguarding Protected · Zero PII in Notifications
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
