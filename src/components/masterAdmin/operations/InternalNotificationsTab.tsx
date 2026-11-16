/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Internal Notification Center Tab
 * Grounded in Master Directive Phase 27: M27.05 Internal Notification Center
 */

import React, { useState, useEffect } from 'react';
import { operationsService } from '../../../services/operationsService';
import { InternalNotification, NotificationCategory } from '../../../types/operations';
import { User } from '../../../types';
import {
  Bell,
  FileCheck2,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Shield,
  Search,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface InternalNotificationsTabProps {
  currentUser: User;
  onNavigateToRecord?: (type: string, id: string) => void;
}

export const InternalNotificationsTab: React.FC<InternalNotificationsTabProps> = ({
  currentUser,
  onNavigateToRecord,
}) => {
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const refreshNotifications = () => {
    setNotifications(operationsService.getNotifications(currentUser.id));
  };

  useEffect(() => {
    refreshNotifications();
  }, [currentUser]);

  const handleMarkAsRead = (id: string) => {
    operationsService.markNotificationAsRead(id, currentUser.id);
    refreshNotifications();
  };

  const handleMarkAllAsRead = () => {
    operationsService.markAllNotificationsAsRead(currentUser.id);
    refreshNotifications();
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    const matchesUnread = !showUnreadOnly || !n.isRead;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesUnread && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'APPROVAL_REQUESTED':
      case 'APPROVAL_COMPLETED':
        return <FileCheck2 className="w-4 h-4 text-phumulani-earth" />;
      case 'TASK_ASSIGNED':
      case 'TASK_OVERDUE':
        return <CheckSquare className="w-4 h-4 text-phumulani-earth" />;
      case 'PROGRAM_MILESTONE_DUE':
      case 'GRANT_DEADLINE_APPROACHING':
        return <Calendar className="w-4 h-4 text-phumulani-earth" />;
      case 'OPERATIONAL_INCIDENT':
        return <AlertTriangle className="w-4 h-4 text-phumulani-earth" />;
      case 'DATA_QUALITY_ALERT':
        return <Shield className="w-4 h-4 text-phumulani-earth" />;
      default:
        return <Bell className="w-4 h-4 text-phumulani-charcoal" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-phumulani-cream rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal">
              M27.05 Internal Notifications
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold">
              External Email Deferred (OAuth Pending)
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-phumulani-charcoal">Internal Notification Center</h2>
          <p className="text-xs text-phumulani-charcoal mt-0.5">
            Real-time delivery of task assignments, executive approvals, milestone alerts, and incident notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-phumulani-cream rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-phumulani-charcoal absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-phumulani-cream rounded-lg focus:outline-none focus:ring-1 focus:ring-phumulani-cream w-48 sm:w-64"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-phumulani-cream rounded-lg px-2.5 py-1.5 bg-white text-phumulani-charcoal font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="APPROVAL_REQUESTED">Approval Requests</option>
            <option value="APPROVAL_COMPLETED">Approval Decisions</option>
            <option value="TASK_ASSIGNED">Task Assignments</option>
            <option value="GRANT_DEADLINE_APPROACHING">Grant Deadlines</option>
            <option value="OPERATIONAL_INCIDENT">Operational Incidents</option>
            <option value="DATA_QUALITY_ALERT">Data Quality Alerts</option>
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-phumulani-charcoal font-medium ml-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded text-phumulani-earth focus:ring-phumulani-cream"
            />
            <span>Unread Only ({unreadCount})</span>
          </label>
        </div>

        <div className="text-phumulani-charcoal font-mono text-[11px]">
          Showing {filteredNotifications.length} of {notifications.length} notices
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-phumulani-cream rounded-xl p-12 text-center text-phumulani-charcoal text-xs">
            <Bell className="w-8 h-8 text-phumulani-charcoal mx-auto mb-2" />
            <p className="font-semibold text-phumulani-charcoal">No notifications match your current filter</p>
            <p className="mt-1">All organizational alerts and operational notices will appear here.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.isRead ? 'bg-white border-phumulani-cream' : 'bg-phumulani-cream border-phumulani-teal shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-phumulani-cream shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-phumulani-charcoal">{n.id}</span>
                    <span className="font-mono text-[10px] uppercase font-bold text-phumulani-charcoal bg-white border px-1.5 py-0.2 rounded">
                      {n.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        n.priority === 'CRITICAL'
                          ? 'bg-phumulani-cream text-phumulani-earth'
                          : n.priority === 'HIGH'
                          ? 'bg-phumulani-cream text-phumulani-charcoal'
                          : 'bg-phumulani-cream text-phumulani-charcoal'
                      }`}
                    >
                      {n.priority}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-phumulani-earth shrink-0" title="Unread" />
                    )}
                  </div>
                  <h4 className="font-semibold text-phumulani-charcoal text-sm">{n.title}</h4>
                  <p className="text-xs text-phumulani-charcoal mt-0.5">{n.message}</p>
                  <div className="text-[11px] text-phumulani-charcoal mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    <span>• Status: {n.deliveryStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-teal rounded transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                {n.relatedRecordId && onNavigateToRecord && (
                  <button
                    onClick={() => onNavigateToRecord(n.relatedRecordType || 'WORKFLOW', n.relatedRecordId!)}
                    className="p-1 text-phumulani-charcoal hover:text-phumulani-earth"
                    title="View related record"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
