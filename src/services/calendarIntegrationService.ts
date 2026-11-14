/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Live Calendar, Appointments & Follow-Up Automation Service (Phase 72)
 * Connects with Google Calendar REST v3 and Microsoft Graph /me/events using vaulted OAuthService tokens.
 * Never fabricates confirmed provider events without an authorized provider response returning an event ID.
 */

import crypto from 'crypto';
import { CalendarMeetingSlot, CalendarMeetingBooking } from '../types/phumulaniAi';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import { oAuthService } from '../email/services/OAuthService';
import { EmailAuditService } from '../email/services/EmailAuditService';
import { db } from './db';

export interface CalendarConnectionStatus {
  provider: 'google' | 'microsoft';
  connected: boolean;
  userEmail?: string;
  scopeGranted: boolean;
  lastChecked: string;
  requiresConnection: boolean;
  details: string;
}

export interface CalendarReminderRecord {
  id: string;
  bookingId: string;
  prospectEmail: string;
  staffEmail: string;
  remindAt: string;
  channel: 'INTERNAL_NOTIFICATION' | 'EMAIL_DRAFT_APPROVAL';
  status: 'PENDING' | 'DISPATCHED' | 'CANCELLED';
  dispatchedAt?: string;
  createdAt: string;
}

export class CalendarIntegrationService {
  private static instance: CalendarIntegrationService;
  private dbAdapter = PostgresPersistenceAdapter.getInstance();
  private bookings: CalendarMeetingBooking[] = [];
  private reminders: CalendarReminderRecord[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): CalendarIntegrationService {
    if (!CalendarIntegrationService.instance) {
      CalendarIntegrationService.instance = new CalendarIntegrationService();
    }
    return CalendarIntegrationService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const persisted = await this.dbAdapter.select<CalendarMeetingBooking>('calendar_bookings');
      if (Array.isArray(persisted) && persisted.length > 0) {
        this.bookings = persisted;
      }
      const persistedReminders = await this.dbAdapter.select<CalendarReminderRecord>('email_calendar_reminders');
      if (Array.isArray(persistedReminders) && persistedReminders.length > 0) {
        this.reminders = persistedReminders;
      }
    } catch {
      // Storage fallback
    }
    this.isInitialized = true;
  }

  private getVaultedToken(provider: 'google' | 'microsoft', staffEmail?: string): { token: string; email?: string } | null {
    const candidateKeys =
      provider === 'google'
        ? [
            ...(staffEmail ? [staffEmail, `conn-google-${staffEmail.replace(/[^a-zA-Z0-9]/g, '_')}`] : []),
            'director@phumulani.org',
            'donations@phumulani.org',
            'grants@phumulani.org',
            'executive@phumulani.org',
            'conn-google-donations_phumulani_org',
            'conn-google-director_phumulani_org',
          ]
        : [
            ...(staffEmail ? [staffEmail, `conn-msft-${staffEmail.replace(/[^a-zA-Z0-9]/g, '_')}`] : []),
            'outreach@phumulani.org',
            'partnerships@phumulani.org',
            'conn-msft-outreach_phumulani_org',
          ];

    for (const key of candidateKeys) {
      const tokens = oAuthService.getDecryptedTokens(key);
      if (tokens?.accessToken && tokens.accessToken !== '[VAULTED_OAUTH_TOKEN]') {
        return { token: tokens.accessToken, email: tokens.verifiedEmail || staffEmail };
      }
    }

    const envToken =
      provider === 'google'
        ? process.env.GOOGLE_WORKSPACE_CALENDAR_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN
        : process.env.MICROSOFT_GRAPH_CALENDAR_TOKEN || process.env.MS365_OAUTH_TOKEN;
    if (envToken?.trim()) {
      return { token: envToken.trim(), email: staffEmail };
    }

    return null;
  }

  /**
   * Check connection status of Google Workspace and Microsoft 365 calendar integrations
   */
  public async getConnectionStatus(provider: 'google' | 'microsoft', staffEmail?: string): Promise<CalendarConnectionStatus> {
    const vaulted = this.getVaultedToken(provider, staffEmail);
    const hasAuth = Boolean(vaulted?.token);

    if (provider === 'google') {
      return {
        provider: 'google',
        connected: hasAuth,
        userEmail: hasAuth ? vaulted?.email || 'director@phumulani.org' : undefined,
        scopeGranted: hasAuth,
        lastChecked: new Date().toISOString(),
        requiresConnection: !hasAuth,
        details: hasAuth
          ? 'Google Calendar API v3 authorized via vaulted OAuth 2.0 Bearer credentials.'
          : 'Google Calendar integration requires OAuth 2.0 authorization (calendar.events scope).',
      };
    }

    return {
      provider: 'microsoft',
      connected: hasAuth,
      userEmail: hasAuth ? vaulted?.email || 'outreach@phumulani.org' : undefined,
      scopeGranted: hasAuth,
      lastChecked: new Date().toISOString(),
      requiresConnection: !hasAuth,
      details: hasAuth
        ? 'Microsoft Graph Calendar API authorized via vaulted OAuth 2.0 Bearer credentials.'
        : 'Microsoft 365 Calendar integration requires Graph API OAuth permissions (Calendars.ReadWrite).',
    };
  }

  /**
   * Generates available meeting slots checking local bookings & live provider free/busy when connected
   */
  public async getAvailableSlots(params: {
    staffEmail: string;
    staffName: string;
    startDate: string;
    daysCount: number;
    durationMinutes: number;
    timeZone?: string;
    provider?: 'google' | 'microsoft';
  }): Promise<CalendarMeetingSlot[]> {
    await this.initialize();
    const timeZone = params.timeZone || 'America/Chicago';
    const slots: CalendarMeetingSlot[] = [];

    const baseDate = new Date(params.startDate);
    const days = Math.min(Math.max(params.daysCount, 1), 7);

    // Optional live free/busy windows when provider OAuth token is present
    const providerBusyWindows: Array<{ start: number; end: number }> = [];
    const provider = params.provider || 'google';
    const vaulted = this.getVaultedToken(provider, params.staffEmail);
    if (vaulted?.token) {
      const rangeEnd = new Date(baseDate.getTime() + days * 86400000).toISOString();
      try {
        if (provider === 'google') {
          const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vaulted.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timeMin: baseDate.toISOString(),
              timeMax: rangeEnd,
              timeZone,
              items: [{ id: params.staffEmail || 'primary' }],
            }),
          });
          if (fbRes.ok) {
            const data: any = await fbRes.json().catch(() => null);
            const busyList = data?.calendars?.[params.staffEmail || 'primary']?.busy || data?.calendars?.primary?.busy || [];
            for (const b of busyList) {
              if (b.start && b.end) {
                providerBusyWindows.push({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() });
              }
            }
          }
        } else {
          const schedRes = await fetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vaulted.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              schedules: [params.staffEmail],
              startTime: { dateTime: baseDate.toISOString(), timeZone },
              endTime: { dateTime: rangeEnd, timeZone },
            }),
          });
          if (schedRes.ok) {
            const data: any = await schedRes.json().catch(() => null);
            const items = data?.value?.[0]?.scheduleItems || [];
            for (const item of items) {
              if (item.start?.dateTime && item.end?.dateTime) {
                providerBusyWindows.push({
                  start: new Date(item.start.dateTime).getTime(),
                  end: new Date(item.end.dateTime).getTime(),
                });
              }
            }
          }
        }
      } catch {
        // Provider free/busy check failure leaves local conflict guard intact
      }
    }

    for (let d = 0; d < days; d++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + d);

      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const hourOffsets = [10, 11.5, 14, 15.5];
      for (const hour of hourOffsets) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + params.durationMinutes * 60000);
        const slotId = `slot-${slotStart.getTime()}-${params.staffEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const sStart = slotStart.getTime();
        const sEnd = slotEnd.getTime();

        const localConflict = this.bookings.some((b) => {
          if (b.staffEmail !== params.staffEmail || b.status === 'cancelled') return false;
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          return sStart < bEnd && sEnd > bStart;
        });

        const remoteConflict = providerBusyWindows.some((w) => sStart < w.end && sEnd > w.start);
        const isConflict = localConflict || remoteConflict;

        slots.push({
          slotId,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          staffName: params.staffName,
          staffEmail: params.staffEmail,
          isAvailable: !isConflict,
          reasonIfUnavailable: isConflict
            ? remoteConflict
              ? 'Conflicting event on remote calendar'
              : 'Conflicting appointment booked'
            : undefined,
        });
      }
    }

    return slots;
  }

  /**
   * Schedule a meeting via live Google Calendar v3 or MS Graph /me/events when authorized.
   * Fail-closed invariant: never mark `confirmed` unless provider returned an actual event ID.
   */
  public async scheduleMeeting(params: {
    prospectId: string;
    prospectName: string;
    prospectEmail: string;
    staffEmail: string;
    staffName: string;
    provider: 'google' | 'microsoft';
    title: string;
    startTime: string;
    endTime: string;
    timeZone?: string;
    reminderMinutesBefore?: number;
  }): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    await this.initialize();

    const sStart = new Date(params.startTime).getTime();
    const sEnd = new Date(params.endTime).getTime();
    if (isNaN(sStart) || isNaN(sEnd) || sEnd <= sStart) {
      return { success: false, error: 'Invalid meeting time window specified.' };
    }

    const hasConflict = this.bookings.some((b) => {
      if (b.staffEmail !== params.staffEmail || b.status === 'cancelled') return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return sStart < bEnd && sEnd > bStart;
    });

    if (hasConflict) {
      return {
        success: false,
        error: `Cannot book appointment: Double-booking detected for ${params.staffName} at the specified time window.`,
      };
    }

    const timeZone = params.timeZone || 'America/Chicago';
    const vaulted = this.getVaultedToken(params.provider, params.staffEmail);
    let providerConfirmed = false;
    let providerEventId: string | undefined;
    let providerMeetingLink: string | undefined;
    let providerError: string | undefined;

    if (vaulted?.token) {
      try {
        if (params.provider === 'google') {
          const res = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${vaulted.token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: params.title,
                description: `Phumulani Partner Meeting with ${params.prospectName} (${params.prospectEmail})`,
                start: { dateTime: params.startTime, timeZone },
                end: { dateTime: params.endTime, timeZone },
                attendees: [{ email: params.prospectEmail }, { email: params.staffEmail }],
              }),
            }
          );
          if (res.ok) {
            const ev: any = await res.json().catch(() => null);
            if (ev?.id) {
              providerConfirmed = true;
              providerEventId = String(ev.id);
              providerMeetingLink = ev.hangoutLink || ev.htmlLink;
            }
          } else {
            providerError = `Google Calendar API rejected event creation (HTTP ${res.status}).`;
          }
        } else {
          const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vaulted.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: params.title,
              body: {
                contentType: 'Text',
                content: `Phumulani Partner Meeting with ${params.prospectName} (${params.prospectEmail})`,
              },
              start: { dateTime: params.startTime, timeZone },
              end: { dateTime: params.endTime, timeZone },
              attendees: [
                { emailAddress: { address: params.prospectEmail, name: params.prospectName }, type: 'required' },
              ],
              isOnlineMeeting: true,
            }),
          });
          if (res.ok) {
            const ev: any = await res.json().catch(() => null);
            if (ev?.id) {
              providerConfirmed = true;
              providerEventId = String(ev.id);
              providerMeetingLink = ev.onlineMeeting?.joinUrl || ev.webLink;
            }
          } else {
            providerError = `Microsoft Graph /me/events rejected event creation (HTTP ${res.status}).`;
          }
        }
      } catch (err: any) {
        providerError = `Calendar provider request failed: ${err?.message || 'network error'}`;
      }
    }

    const bookingId = `book-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const newBooking: CalendarMeetingBooking = {
      id: bookingId,
      prospectId: params.prospectId,
      prospectName: params.prospectName,
      prospectEmail: params.prospectEmail,
      staffEmail: params.staffEmail,
      staffName: params.staffName,
      provider: params.provider,
      title: params.title,
      startTime: params.startTime,
      endTime: params.endTime,
      timeZone,
      status: providerConfirmed ? 'confirmed' : 'pending_confirmation',
      calendarEventId: providerConfirmed ? providerEventId : undefined,
      meetingLink: providerConfirmed ? providerMeetingLink : undefined,
      confirmationAuditToken: `AUDIT-CAL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    this.bookings.push(newBooking);
    await this.dbAdapter.insertDurableWithRetry('calendar_bookings', newBooking, {
      context: 'calendarIntegration:booking',
    });

    // Create reminder record
    const leadMin = params.reminderMinutesBefore ?? 60;
    const remindAt = new Date(sStart - leadMin * 60000).toISOString();
    const reminder: CalendarReminderRecord = {
      id: `rem-${bookingId}`,
      bookingId,
      prospectEmail: params.prospectEmail,
      staffEmail: params.staffEmail,
      remindAt,
      channel: 'INTERNAL_NOTIFICATION',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.reminders.push(reminder);
    await this.dbAdapter.insertDurableWithRetry('email_calendar_reminders', reminder, {
      context: 'calendarIntegration:reminder',
    });

    // Log CRM activity record
    try {
      db.addDonorEngagementActivity({
        donorId: params.prospectId,
        donorName: params.prospectName,
        activityType: 'MEETING_SCHEDULED' as any,
        title: `Meeting ${providerConfirmed ? 'Confirmed' : 'Proposed'}: ${params.title}`,
        summary: `${params.provider.toUpperCase()} calendar slot ${params.startTime} (${timeZone}) — status: ${newBooking.status}`,
        staffActor: params.staffName,
        requiresFollowUp: !providerConfirmed,
        followUpDate: params.startTime,
      });
    } catch {}

    await EmailAuditService.getInstance().logEvent({
      action: providerConfirmed ? 'CALENDAR_EVENT_CONFIRMED' : 'CALENDAR_EVENT_STAGED',
      actor: params.staffEmail,
      details: {
        bookingId,
        provider: params.provider,
        calendarEventId: newBooking.calendarEventId,
        status: newBooking.status,
      },
    });

    return {
      success: true,
      booking: newBooking,
      error: !providerConfirmed
        ? providerError ||
          'Meeting invitation staged locally as pending_confirmation. Live calendar confirmation requires authorized Google or Microsoft 365 OAuth credentials.'
        : undefined,
    };
  }

  public async rescheduleMeeting(
    bookingId: string,
    newStartTime: string,
    newEndTime: string,
    actorId: string
  ): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    await this.initialize();
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: `Booking ${bookingId} not found.` };
    if (booking.status === 'cancelled') {
      return { success: false, error: 'Cannot reschedule a cancelled meeting.' };
    }

    const sStart = new Date(newStartTime).getTime();
    const sEnd = new Date(newEndTime).getTime();
    if (isNaN(sStart) || isNaN(sEnd) || sEnd <= sStart) {
      return { success: false, error: 'Invalid new time window.' };
    }

    const conflict = this.bookings.some((b) => {
      if (b.id === bookingId || b.staffEmail !== booking.staffEmail || b.status === 'cancelled') return false;
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return sStart < bEnd && sEnd > bStart;
    });
    if (conflict) {
      return { success: false, error: 'Double-booking conflict at requested reschedule window.' };
    }

    if (booking.calendarEventId && booking.status === 'confirmed') {
      const vaulted = this.getVaultedToken(booking.provider, booking.staffEmail);
      if (vaulted?.token) {
        try {
          if (booking.provider === 'google') {
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(booking.calendarEventId)}`,
              {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${vaulted.token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  start: { dateTime: newStartTime, timeZone: booking.timeZone },
                  end: { dateTime: newEndTime, timeZone: booking.timeZone },
                }),
              }
            );
          } else {
            await fetch(
              `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(booking.calendarEventId)}`,
              {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${vaulted.token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  start: { dateTime: newStartTime, timeZone: booking.timeZone },
                  end: { dateTime: newEndTime, timeZone: booking.timeZone },
                }),
              }
            );
          }
        } catch {
          // Recorded locally even if remote sync requires retry
        }
      }
    }

    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    await this.dbAdapter.insertDurableWithRetry('calendar_bookings', booking, {
      context: 'calendarIntegration:reschedule',
    });

    await EmailAuditService.getInstance().logEvent({
      action: 'CALENDAR_EVENT_RESCHEDULED',
      actor: actorId,
      details: { bookingId, newStartTime, newEndTime },
    });

    return { success: true, booking };
  }

  public async cancelMeeting(
    bookingId: string,
    actorId: string,
    reason?: string
  ): Promise<{ success: boolean; booking?: CalendarMeetingBooking; error?: string }> {
    await this.initialize();
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: `Booking ${bookingId} not found.` };

    if (booking.calendarEventId && booking.status === 'confirmed') {
      const vaulted = this.getVaultedToken(booking.provider, booking.staffEmail);
      if (vaulted?.token) {
        try {
          if (booking.provider === 'google') {
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(booking.calendarEventId)}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${vaulted.token}` },
              }
            );
          } else {
            await fetch(
              `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(booking.calendarEventId)}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${vaulted.token}` },
              }
            );
          }
        } catch {
          // Proceed with local cancellation
        }
      }
    }

    booking.status = 'cancelled';
    await this.dbAdapter.insertDurableWithRetry('calendar_bookings', booking, {
      context: 'calendarIntegration:cancel',
    });

    for (const rem of this.reminders) {
      if (rem.bookingId === bookingId && rem.status === 'PENDING') {
        rem.status = 'CANCELLED';
        await this.dbAdapter.insertDurableWithRetry('email_calendar_reminders', rem, {
          context: 'calendarIntegration:cancelReminder',
        });
      }
    }

    await EmailAuditService.getInstance().logEvent({
      action: 'CALENDAR_EVENT_CANCELLED',
      actor: actorId,
      details: { bookingId, reason },
    });

    return { success: true, booking };
  }

  public async processDueReminders(): Promise<{ processed: number; dispatched: number }> {
    await this.initialize();
    const now = Date.now();
    const due = this.reminders.filter((r) => r.status === 'PENDING' && new Date(r.remindAt).getTime() <= now);
    for (const r of due) {
      r.status = 'DISPATCHED';
      r.dispatchedAt = new Date().toISOString();
      await this.dbAdapter.insertDurableWithRetry('email_calendar_reminders', r, {
        context: 'calendarIntegration:dispatchReminder',
      });
    }
    return { processed: due.length, dispatched: due.length };
  }

  public getBookings(prospectId?: string): CalendarMeetingBooking[] {
    if (prospectId) {
      return this.bookings.filter((b) => b.prospectId === prospectId);
    }
    return [...this.bookings];
  }

  public async listReminders(): Promise<CalendarReminderRecord[]> {
    await this.initialize();
    return [...this.reminders];
  }
}

export const calendarIntegrationService = CalendarIntegrationService.getInstance();
