/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 62 Email Thread Types
 */

import { NormalizedEmailMessage } from './EmailMessage';

export interface EmailThreadParticipant {
  email: string;
  name: string;
  role?: 'CONSTITUENT' | 'DONOR' | 'PARTNER' | 'STAFF' | 'VOLUNTEER';
  isInternalStaff?: boolean;
}

export interface EmailStaffNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isConfidential?: boolean;
}

export interface EmailThread {
  id: string;
  connectionId: string;
  subject: string;
  firstMessageAt: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
  participants: EmailThreadParticipant[];
  messages: NormalizedEmailMessage[];
  assignedStaffId?: string;
  assignedDepartmentId?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_REPLY' | 'AWAITING_APPROVAL' | 'RESOLVED' | 'ARCHIVED';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  crmContactId?: string;
  crmDonorId?: string;
  isSafeguarded?: boolean;
  tags: string[];
  staffNotes: EmailStaffNote[];
}
