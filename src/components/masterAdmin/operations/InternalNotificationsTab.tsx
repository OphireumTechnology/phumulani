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
        return <FileCheck2 className="w-4 h-4 text-amber-600" />;
      case 'TASK_ASSIGNED':
      case 'TASK_OVERDUE':
        return <CheckSquare className="w-4 h-4 text-teal-600" />;
      case 'PROGRAM_MILESTONE_DUE':
      case 'GRANT_DEADLINE_APPROACHING':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'OPERATIONAL_INCIDENT':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'DATA_QUALITY_ALERT':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
              M27.05 Internal Notifications
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
              External Email Deferred (OAuth Pending)
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Internal Notification Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time delivery of task assignments, executive approvals, milestone alerts, and incident notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-48 sm:w-64"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="APPROVAL_REQUESTED">Approval Requests</option>
            <option value="APPROVAL_COMPLETED">Approval Decisions</option>
            <option value="TASK_ASSIGNED">Task Assignments</option>
            <option value="GRANT_DEADLINE_APPROACHING">Grant Deadlines</option>
            <option value="OPERATIONAL_INCIDENT">Operational Incidents</option>
            <option value="DATA_QUALITY_ALERT">Data Quality Alerts</option>
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium ml-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Unread Only ({unreadCount})</span>
          </label>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing {filteredNotifications.length} of {notifications.length} notices
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No notifications match your current filter</p>
            <p className="mt-1">All organizational alerts and operational notices will appear here.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 border rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.isRead ? 'bg-white border-slate-200' : 'bg-teal-50/50 border-teal-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{n.id}</span>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-white border px-1.5 py-0.2 rounded">
                      {n.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        n.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : n.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n.priority}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" title="Unread" />
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
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
                    className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 rounded transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                {n.relatedRecordId && onNavigateToRecord && (
                  <button
                    onClick={() => onNavigateToRecord(n.relatedRecordType || 'WORKFLOW', n.relatedRecordId!)}
                    className="p-1 text-slate-400 hover:text-slate-700"
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
