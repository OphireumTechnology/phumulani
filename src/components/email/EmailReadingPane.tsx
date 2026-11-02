/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email Reading Pane (Area D)
 * Redesigned for Phase 60.1 Staff-First Workspace
 * Features clean reading view with 5 collapsible accordions (CRM, Workflow, Notes, Tech, Audit)
 */

import React, { useState } from 'react';
import {
  EnterpriseEmailThread,
  EnterpriseEmailMessage,
  EmailClassificationCategory,
  EmailFolder,
  EmailAIRewriteAction,
  ResponseToneStyle,
  EMAIL_CATEGORY_METADATA,
  PRIORITY_CONFIG,
  EMAIL_STAFF_MEMBERS,
} from '../../types/emailEnterprise';
import { User } from '../../types';
import { db } from '../../services/db';
import {
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Mail,
  Eye,
  CheckSquare,
  Users,
  UserPlus,
  Paperclip,
  FileText,
  Lock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ThumbsUp,
  RotateCcw,
  FileCheck,
  ThumbsDown,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Clock,
  DollarSign,
  Tag,
  ArrowLeft,
  ExternalLink,
  History,
  Activity,
  Plus,
} from 'lucide-react';

interface EmailReadingPaneProps {
  thread: EnterpriseEmailThread | null;
  currentUser: User;
  onBackToList?: () => void;
  onReply: (thread: EnterpriseEmailThread, replyAll?: boolean) => void;
  onForward: (thread: EnterpriseEmailThread) => void;
  onToggleRead: (threadId: string, currentRead: boolean) => void;
  onToggleArchive: (threadId: string, currentArchived: boolean) => void;
  onChangeFolder: (threadId: string, folder: EmailFolder) => void;
  onAssignStaff: (threadId: string, staffId: string, staffName: string) => void;
  onOpenCrmLinkModal: (thread: EnterpriseEmailThread) => void;
  onOpenNewTaskModal: (thread: EnterpriseEmailThread) => void;
  onReclassify: (thread: EnterpriseEmailThread) => void;
  onAddInternalNote: (threadId: string, text: string) => void;
  onGenerateDraft: (thread: EnterpriseEmailThread, tone: ResponseToneStyle) => void;
  onAIRewrite: (action: EmailAIRewriteAction) => void;
  onInsertTemplate: () => void;
  onSaveDraft: (threadId: string, updatedBody: string) => void;
  onApproveDraft: (threadId: string) => void;
  onRequestChanges: (threadId: string) => void;
  onReturnToDraft: (threadId: string) => void;
  onRejectDraft: (threadId: string) => void;
  onSendApprovedEmail: (threadId: string) => void;
  onIngestFundraising?: (thread: EnterpriseEmailThread, message: EnterpriseEmailMessage) => void;
  onOpenFundraisingCRM?: (tab: string, id: string) => void;
}

export const EmailReadingPane: React.FC<EmailReadingPaneProps> = ({
  thread,
  currentUser,
  onBackToList,
  onReply,
  onForward,
  onToggleRead,
  onToggleArchive,
  onChangeFolder,
  onAssignStaff,
  onOpenCrmLinkModal,
  onOpenNewTaskModal,
  onReclassify,
  onAddInternalNote,
  onGenerateDraft,
  onAIRewrite,
  onInsertTemplate,
  onSaveDraft,
  onApproveDraft,
  onRequestChanges,
  onReturnToDraft,
  onRejectDraft,
  onSendApprovedEmail,
  onIngestFundraising,
  onOpenFundraisingCRM,
}) => {
  // Accordion states: all collapsed by default for clean staff experience
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Draft editing state
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftEditContent, setDraftEditContent] = useState('');
  const [selectedDraftTone, setSelectedDraftTone] = useState<ResponseToneStyle>('professional');

  // Internal note state
  const [newInternalNote, setNewInternalNote] = useState('');

  if (!thread) {
    return (
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
          <Mail className="w-8 h-8 text-slate-300 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No message selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select an email conversation from the list to view the message history, compose responses, or inspect CRM details.
        </p>
      </div>
    );
  }

  const latestMsg = thread.messages[thread.messages.length - 1] || thread.messages[0];
  const firstMsg = thread.messages[0] || latestMsg;
  const isP0orP1 = thread.priority === 'P0' || thread.priority === 'P1';

  // CRM donor lookup
  const senderEmail = (latestMsg?.senderEmail || '').trim().toLowerCase();
  const fundraisingDonors = db.getFundraisingDonors();
  const matchedDonor = fundraisingDonors.find((d) => d.email.toLowerCase() === senderEmail);
  const linkedOpps = matchedDonor ? db.getFundraisingOpportunities().filter((o) => o.donorId === matchedDonor.id) : [];

  const handleNoteSubmit = () => {
    if (!newInternalNote.trim()) return;
    onAddInternalNote(thread.id, newInternalNote.trim());
    setNewInternalNote('');
  };

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xs overflow-hidden h-full">
      {/* 1. Header Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {onBackToList && (
              <button
                onClick={onBackToList}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
                title="Back to email list"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {isP0orP1 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  thread.priority === 'P0'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {thread.priority} Urgent
              </span>
            )}

            <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">
              {EMAIL_CATEGORY_METADATA[thread.classification as EmailClassificationCategory]?.label || thread.classification}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onReply(thread, false)}
              className="px-2.5 py-1 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-white bg-white/70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title="Reply to sender"
            >
              <Reply className="w-3.5 h-3.5 text-teal-800" />
              <span className="hidden sm:inline">Reply</span>
            </button>
            <button
              onClick={() => onReply(thread, true)}
              className="px-2.5 py-1 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-white bg-white/70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title="Reply all"
            >
              <ReplyAll className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">All</span>
            </button>
            <button
              onClick={() => onForward(thread)}
              className="px-2.5 py-1 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-white bg-white/70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title="Forward message"
            >
              <Forward className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Fwd</span>
            </button>
            <button
              onClick={() => onToggleArchive(thread.id, thread.isArchived ?? false)}
              className="p-1.5 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-white bg-white/70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title={thread.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-3.5 h-3.5 text-slate-600" />
              <span className="sr-only">Archive</span>
            </button>
            <button
              onClick={() => onToggleRead(thread.id, thread.isRead ?? true)}
              className="p-1.5 text-slate-700 hover:text-teal-900 border border-slate-200 hover:bg-white bg-white/70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title={thread.isRead ? 'Mark as Unread' : 'Mark as Read'}
            >
              {thread.isRead ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <Mail className="w-3.5 h-3.5 text-teal-700" />}
              <span className="sr-only">Toggle read</span>
            </button>
            <button
              onClick={() => onOpenNewTaskModal(thread)}
              className="px-2 py-1 text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              title="Create linked follow-up task"
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden md:inline">Task</span>
            </button>
          </div>
        </div>

        {/* Subject & Core Meta */}
        <h2 className="text-base font-bold text-slate-900 leading-snug">{thread.threadSubject}</h2>
        <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-3 text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{latestMsg?.senderName || 'Sender'}</span>
            <span className="text-slate-400 font-mono text-[11px]">&lt;{latestMsg?.senderEmail}&gt;</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <span>{new Date(latestMsg?.receivedAt || thread.lastMessageAt).toLocaleString()}</span>
            <span>·</span>
            <span>Mailbox: <strong className="text-slate-700">{thread.mailboxEmail}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Critical Safeguarding Warning Banner (If Category 01) */}
      {thread.classification === '01_safeguarding' && (
        <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
              CRITICAL SAFEGUARDING & SURVIVOR ISOLATION BOUNDARY ACTIVE
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              This correspondence involves potential domestic danger or confidential survivor support. General AI auto-replies and automated external drafts are strictly withheld per Architecture Principle 1.4. This record is escalated to Safeguarding Lead Sister Miriam K. for human trauma-informed protocol.
            </p>
          </div>
        </div>
      )}

      {/* 3. Scrollable Message Body Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {thread.messages.map((msg: EnterpriseEmailMessage) => {
          const isInbound = msg.direction === 'inbound';
          return (
            <div
              key={msg.id}
              className={`rounded-2xl p-4 border transition-all ${
                isInbound
                  ? 'bg-white border-slate-200 shadow-2xs mr-4 sm:mr-8'
                  : 'bg-teal-50/40 border-teal-200 shadow-2xs ml-4 sm:ml-8'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-slate-900 truncate">{msg.senderName}</span>
                  <span className="text-slate-400 font-mono text-[11px] truncate">&lt;{msg.senderEmail}&gt;</span>
                  {msg.isAutoResponse && (
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-mono">
                      Auto-Response ({msg.autoResponderRuleId})
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[11px] font-mono shrink-0 ml-2">
                  {new Date(msg.receivedAt).toLocaleString()}
                </span>
              </div>

              {/* Message Body Content */}
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {thread.classification === '01_safeguarding' &&
                currentUser.id !== 'usr-002' &&
                (currentUser.role as string) !== 'safeguarding_lead' &&
                (currentUser.role as string) !== 'safeguarding_officer' ? (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-900">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>CONFIDENTIAL SAFEGUARDING INTAKE — VAWA ISOLATED</span>
                    </div>
                    <p className="text-[11px] text-rose-800">
                      Communication restricted to Sister Miriam K. (DEPT-SAFE). Body text has been redacted pursuant to Phumulani safeguarding invariants.
                    </p>
                    <div className="font-mono text-[11px] text-rose-700 bg-rose-100/60 p-2 rounded border border-rose-200 mt-1">
                      [REDACTED PURSUANT TO VAWA SAFEGUARDING PROTOCOLS — AUTHORIZED OFFICER ACCESS ONLY]
                    </div>
                  </div>
                ) : (
                  msg.bodyText
                )}
              </div>

              {/* Secure Attachments */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    Secure Attachments ({msg.attachments.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.attachments.map((att: any) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-teal-800 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{att.filename}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {(att.sizeBytes / 1024).toFixed(1)} KB · {att.mimeType}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            att.scanStatus === 'clean' || !att.isQuarantined
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.scanStatus === 'clean' || !att.isQuarantined ? 'Scanned Safe' : 'Quarantined'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. AI Response Engine & Quad-Action Approval Bar */}
      {thread.classification !== '01_safeguarding' && (
        <div className="border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-slate-900">AI Response Engine (A02 Email Manager)</span>
              {thread.draft && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    thread.draft.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : thread.draft.status === 'sent'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  Status: {thread.draft.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {/* Tone Selector & Draft Button */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Tone:</span>
              <select
                value={selectedDraftTone}
                onChange={(e) => setSelectedDraftTone(e.target.value as ResponseToneStyle)}
                className="bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <option value="professional">Professional</option>
                <option value="formal">Formal</option>
                <option value="warm_welcoming">Warm & Welcoming</option>
                <option value="executive">Executive</option>
                <option value="donor_appreciation">Donor Appreciation</option>
                <option value="partnership_development">Partnership Development</option>
                <option value="grant_correspondence">Grant Correspondence</option>
                <option value="volunteer_coordination">Volunteer Coordination</option>
                <option value="community_engagement">Community Engagement</option>
              </select>
              <button
                onClick={() => onGenerateDraft(thread, selectedDraftTone)}
                className="px-2.5 py-1 bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3 text-teal-700" />
                <span>{thread.draft ? 'Regenerate' : 'Generate Draft'}</span>
              </button>
            </div>
          </div>

          {/* AI Rewrite Actions Toolbar */}
          {thread.draft && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-teal-50/70 border border-teal-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-800" />
                <span className="font-bold text-teal-950 text-[11px]">AI Rewrite:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { action: 'shorten', label: 'Shorten' },
                    { action: 'expand', label: 'Expand' },
                    { action: 'formal', label: 'Formal' },
                    { action: 'warm', label: 'Warm Sisterhood' },
                    { action: 'executive', label: 'Executive' },
                    { action: 'clarity', label: 'Fix Clarity' },
                  ].map((btn) => (
                    <button
                      key={btn.action}
                      type="button"
                      onClick={() => onAIRewrite(btn.action as EmailAIRewriteAction)}
                      className="px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900 hover:bg-teal-100 text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onInsertTemplate}
                className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              >
                <FileText className="w-3 h-3 text-indigo-600" />
                <span>Insert Template...</span>
              </button>
            </div>
          )}

          {/* Active Draft Box with Watermark */}
          {thread.draft && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              {thread.draft.status !== 'approved' && thread.draft.status !== 'sent' && (
                <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-lg p-2 text-xs font-mono font-bold flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>AI_DRAFT — NOT APPROVED — NOT SENT</span>
                  </div>
                  <span className="text-[10px] font-sans uppercase font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                    Requires Human Co-Signature
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                <div>
                  <span className="font-semibold text-slate-700">Recipient:</span>{' '}
                  <span className="font-mono text-slate-900">{thread.draft.recipientEmail}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Confidence: <span className="font-bold text-teal-800">{thread.draft.confidenceScore}%</span> · Tone: <span className="font-semibold capitalize">{thread.draft.toneStyle.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Verified Context Summary */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded px-2.5 py-1.5 text-[11px] text-emerald-900 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span><strong>Verified Context Grounding:</strong> {thread.draft.verifiedContextSummary}</span>
              </div>

              {/* Draft Content (View / Edit) */}
              {isEditingDraft ? (
                <textarea
                  rows={6}
                  value={draftEditContent}
                  onChange={(e) => setDraftEditContent(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 bg-white border border-teal-500 rounded-lg focus:outline-hidden"
                />
              ) : (
                <div className="text-xs text-slate-800 whitespace-pre-wrap bg-white p-3 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {thread.draft.proposedBody}
                </div>
              )}

              {/* Quad-Action Approval Controls & Send */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isEditingDraft ? (
                    <button
                      onClick={() => {
                        onSaveDraft(thread.id, draftEditContent);
                        setIsEditingDraft(false);
                      }}
                      className="px-3 py-1 bg-teal-800 text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setDraftEditContent(thread.draft?.proposedBody || '');
                        setIsEditingDraft(true);
                      }}
                      className="px-3 py-1 border border-slate-200 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Draft</span>
                    </button>
                  )}

                  {thread.draft.status !== 'approved' && thread.draft.status !== 'sent' && (
                    <>
                      <button
                        onClick={() => onApproveDraft(thread.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Approve draft and bind to current version"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Approve Draft</span>
                      </button>
                      <button
                        onClick={() => onRequestChanges(thread.id)}
                        className="px-2.5 py-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Request staff modifications before re-review"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Request Changes</span>
                      </button>
                      <button
                        onClick={() => onReturnToDraft(thread.id)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Return to drafting stage"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Return to Draft</span>
                      </button>
                      <button
                        onClick={() => onRejectDraft(thread.id)}
                        className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
                        title="Reject proposed draft"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>

                <div>
                  {thread.draft.status === 'approved' ? (
                    <button
                      onClick={() => onSendApprovedEmail(thread.id)}
                      className="px-4 py-1.5 bg-[#104F57] hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SEND APPROVED EMAIL</span>
                    </button>
                  ) : thread.draft.status === 'sent' ? (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dispatched to Recipient</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      Human approval required before sending
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Collapsible Accordions (Staff-First Organization) */}
      <div className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
        {/* Accordion 1: CRM & Donor Details */}
        <div className="p-3">
          <button
            onClick={() => setIsCrmOpen(!isCrmOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>CRM & Donor Details</span>
              {matchedDonor ? (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {matchedDonor.name} · {matchedDonor.givingTier}
                </span>
              ) : thread.crmLink ? (
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  Linked: {thread.crmLink.entityName}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">Unlinked</span>
              )}
            </div>
            {isCrmOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isCrmOpen && (
            <div className="mt-3 p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2 text-xs">
              {matchedDonor ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      {matchedDonor.name} ({matchedDonor.category.replace(/_/g, ' ')})
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Lifetime Giving: <strong className="text-teal-900">${matchedDonor.lifetimeGiving.toLocaleString()}</strong> · Relationship Owner: <strong>{matchedDonor.relationshipOwner}</strong>
                    </p>
                    {linkedOpps.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedOpps.map((opp) => (
                          <span key={opp.id} className="text-[10px] bg-white border border-teal-200 text-teal-950 px-2 py-0.5 rounded">
                            {opp.title} (${opp.targetAmount.toLocaleString()} · {opp.status.replace(/_/g, ' ')})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {onOpenFundraisingCRM && (
                    <button
                      onClick={() => onOpenFundraisingCRM('donors', matchedDonor.id)}
                      className="px-3 py-1.5 bg-[#104F57] hover:bg-[#0c3d43] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>View in CRM</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 text-[11px]">
                    No CRM record directly matched for <strong className="text-slate-800">{latestMsg?.senderEmail}</strong>.
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenCrmLinkModal(thread)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium cursor-pointer"
                    >
                      Manual Link
                    </button>
                    {onIngestFundraising && (
                      <button
                        onClick={() => onIngestFundraising(thread, latestMsg)}
                        className="px-2.5 py-1 bg-[#104F57] hover:bg-[#0c3d43] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ingest as Donor</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 2: Assignment & Workflow */}
        <div className="p-3">
          <button
            onClick={() => setIsWorkflowOpen(!isWorkflowOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-700" />
              <span>Assignment & Workflow</span>
              <span className="text-[10px] font-medium text-slate-500">
                Assigned: <strong className="text-slate-700">{thread.assignedStaffName || 'Unassigned'}</strong> · Folder: <strong className="text-slate-700">{thread.folder || 'INBOX'}</strong>
              </span>
            </div>
            {isWorkflowOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isWorkflowOpen && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assign Staff</label>
                <select
                  value={thread.assignedStaffName || 'Unassigned'}
                  onChange={(e) => {
                    const st = EMAIL_STAFF_MEMBERS.find((s) => s.name === e.target.value);
                    if (st) {
                      onAssignStaff(thread.id, st.id, st.name);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                >
                  <option value="Unassigned">Unassigned</option>
                  {EMAIL_STAFF_MEMBERS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Folder Move</label>
                <select
                  value={thread.folder || 'INBOX'}
                  onChange={(e) => onChangeFolder(thread.id, e.target.value as EmailFolder)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800"
                >
                  <option value="INBOX">INBOX</option>
                  <option value="SENT">SENT</option>
                  <option value="ARCHIVE">ARCHIVE</option>
                  <option value="TRASH">TRASH</option>
                  <option value="SPAM">SPAM</option>
                  <option value="DRAFTS">DRAFTS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Classification & SLA</label>
                <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-1.5">
                  <span className="truncate text-slate-700 font-mono text-[11px]">
                    {EMAIL_CATEGORY_METADATA[thread.classification as EmailClassificationCategory]?.code || '00'} · {thread.priority}
                  </span>
                  <button
                    onClick={() => onReclassify(thread)}
                    className="text-[11px] text-teal-800 underline font-semibold cursor-pointer shrink-0 ml-1"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Internal Collaboration (Private Staff Notes) */}
        <div className="p-3">
          <button
            onClick={() => setIsCollaborationOpen(!isCollaborationOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Internal Collaboration</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {thread.internalNotes?.length || 0} Staff Notes
              </span>
            </div>
            {isCollaborationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isCollaborationOpen && (
            <div className="mt-3 p-3 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="text-[11px] text-amber-900 font-medium">
                Confidential staff-only comments. Never included in external replies or autoresponders.
              </div>

              {thread.internalNotes && thread.internalNotes.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {thread.internalNotes.map((note: any) => (
                    <div key={note.id} className="bg-white border border-amber-200 rounded p-2.5 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span className="font-bold text-slate-900">{note.authorName}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add confidential note for caseworkers or team..."
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleNoteSubmit();
                    }
                  }}
                  className="flex-1 bg-white border border-amber-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-amber-800/40 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleNoteSubmit}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  Add Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Technical Details */}
        <div className="p-3">
          <button
            onClick={() => setIsTechOpen(!isTechOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500" />
              <span>Technical Details & Headers</span>
              <span className="text-[10px] font-mono text-slate-400">
                {thread.providerMessageId || 'msg-auto'}
              </span>
            </div>
            {isTechOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isTechOpen && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Thread ID:</span>
                  <span className="text-slate-800 break-all">{thread.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Provider Message ID:</span>
                  <span className="text-slate-800 break-all">{thread.providerMessageId || latestMsg?.providerMessageId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ingest Connector:</span>
                  <span className="text-slate-800">{thread.isHistorical ? 'HISTORICAL_IMPORT' : 'MS_GRAPH_OAUTH / GOOGLE_WORKSPACE'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">SLA Deadline:</span>
                  <span className="text-slate-800">{new Date(thread.slaDeadline).toISOString()}</span>
                </div>
              </div>

              {thread.labels && thread.labels.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-1">Message Labels:</span>
                  <div className="flex flex-wrap gap-1">
                    {thread.labels.map((lbl: string) => (
                      <span key={lbl} className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 5: Audit History */}
        <div className="p-3">
          <button
            onClick={() => setIsAuditOpen(!isAuditOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit History</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Immutable event trail
              </span>
            </div>
            {isAuditOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isAuditOpen && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 border-b border-slate-200 pb-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-700" />
                <span>Verification trail for compliance with non-profit donor governance</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-start justify-between text-slate-600">
                  <span>· Received & Scanned by Connector Gateway</span>
                  <span className="text-slate-400">{new Date(firstMsg?.receivedAt || thread.lastMessageAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-start justify-between text-slate-600">
                  <span>· Classified as Category {EMAIL_CATEGORY_METADATA[thread.classification as EmailClassificationCategory]?.code || '00'} ({thread.classification})</span>
                  <span className="text-slate-400">{thread.priority}</span>
                </div>
                {thread.draft && (
                  <div className="flex items-start justify-between text-slate-600">
                    <span>· AI Response Draft Generated ({thread.draft.status})</span>
                    <span className="text-slate-400">{thread.draft.confidenceScore}% conf</span>
                  </div>
                )}
                {thread.assignedStaffName && (
                  <div className="flex items-start justify-between text-slate-600">
                    <span>· Assigned to {thread.assignedStaffName}</span>
                    <span className="text-slate-400">Active</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
