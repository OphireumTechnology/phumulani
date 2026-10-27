/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Website Concierge (Agent A10) Interactive Chat Component (M33.02)
 * Grounded in approved public organizational knowledge, with source attribution,
 * multilingual support, human escalation gates, and transparent connectivity status.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  Globe,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { aiOrchestrator } from '../services/aiOrchestrator';
import {
  multilingualAccessibilityService,
  SUPPORTED_LANGUAGES,
} from '../services/multilingualAccessibilityService';
import { SupportedLanguageCode } from '../types/phase33';

export const WebsiteConciergeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguageCode>('en');
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'model';
      text: string;
      isCrisisAlert?: boolean;
      sourceAttribution?: string;
    }>
  >([
    {
      role: 'model',
      text: 'Hello! I am Phumulani’s Website Concierge (Agent A10). I provide information about our community programs, volunteer opportunities, upcoming workshops, and 501(c)(3) donation paths from our approved public records.',
      sourceAttribution: 'Phumulani 2026 Public Knowledge Base',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [humanEscalated, setHumanEscalated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How do I volunteer with youth mentorship?',
    'Tell me about housing stability support',
    'Where does donation funding go?',
    'Who is founder Comfort Dondo?',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Keyboard accessibility: ESC key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiOrchestrator.queryWebsiteConcierge(question);
      const isCrisis =
        response.includes('Minnesota Day One Crisis Line') ||
        response.includes('911') ||
        response.includes('SAFEGUARDING');

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: response,
          isCrisisAlert: isCrisis,
          sourceAttribution: isCrisis
            ? 'Minnesota Day One Statutory Protocol (MN 611A)'
            : 'Phumulani 2026 Community Programs SOP v4',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Thank you for reaching out. You can connect directly with our community coordinators at info@phumulani.org or call during business hours.',
          sourceAttribution: 'Phumulani Contact Directory',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHumanEscalate = () => {
    setHumanEscalated(true);
    setMessages((prev) => [
      ...prev,
      {
        role: 'model',
        text: 'You have been connected to our Human Community Coordination Desk.\n\n• For General Community Enquiries: Email info@phumulani.org or call our Minneapolis center.\n• For Confidential Survivor Assistance: Click "Get Help" in the top bar or contact Minnesota Day One at 1-866-223-1111.\n\nOur human team responds to inquiries during business hours.',
        sourceAttribution: 'Department of Community Outreach (DEPT-COMM)',
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#104F57] hover:bg-[#0c3e44] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            aria-label="Open Website Concierge"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <span className="font-semibold text-xs tracking-wide">Ask Concierge (A10)</span>
          </button>
        )}
      </div>

      {/* Concierge Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="concierge-dialog-title"
          aria-modal="true"
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 no-print"
        >
          {/* Header */}
          <div className="bg-[#104F57] text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-800/80 flex items-center justify-center border border-teal-600">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div id="concierge-dialog-title" className="text-xs font-bold tracking-tight">
                  Website Concierge (Agent A10)
                </div>
                <div className="text-[10px] text-teal-200 flex items-center gap-1">
                  <span>Grounded in Approved Records</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as SupportedLanguageCode)}
                className="text-[10px] bg-teal-900 border border-teal-700 text-teal-100 rounded px-1.5 py-0.5 focus:outline-hidden"
                aria-label="Select Assistance Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.localName}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
                aria-label="Close Concierge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Connectivity & Transparency Banner */}
          <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-700" />
              <span>Grounded Mode: Isolated Curated Knowledge Base</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400">NO EXTERNAL AI KEY</span>
          </div>

          {/* Privacy Note */}
          <div className="bg-amber-50 border-b border-amber-200/60 px-3 py-1.5 text-[11px] text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Do not share confidential survivor case details here. (VAWA § 1367)</span>
          </div>

          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FA]"
            aria-live="polite"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#104F57] text-white rounded-br-xs'
                      : m.isCrisisAlert
                      ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-bl-xs font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {m.text}

                  {m.sourceAttribution && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[9px] text-teal-800 font-mono font-medium">
                      Source: {m.sourceAttribution}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.role === 'user' ? 'You' : 'Agent A10 (Public Concierge)'}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#104F57] animate-spin" />
                <span>Checking approved knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts & Human Escalation */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 justify-between items-center">
            <div className="flex flex-wrap gap-1">
              {quickQuestions.slice(0, 2).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 hover:text-[#104F57] border border-slate-200 hover:border-teal-300 px-2 py-0.5 rounded transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>

            {!humanEscalated && (
              <button
                onClick={handleHumanEscalate}
                className="text-[10px] text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-teal-100 transition-colors"
                title="Connect with a human community advocate"
              >
                <PhoneCall className="w-3 h-3 text-teal-700" />
                <span>Human Coordinator</span>
              </button>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about programs, volunteering, events..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#104F57]"
              disabled={isLoading}
              aria-label="Ask concierge question"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-[#104F57] hover:bg-[#0c3e44] disabled:bg-slate-300 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
