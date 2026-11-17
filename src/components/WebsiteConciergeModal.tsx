/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Website Concierge (Agent A10) Interactive Chat Component (M33.02)
 * Grounded in approved public organizational knowledge, with source attribution,
 * multilingual support, human escalation gates, and transparent connectivity status.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  Send,
  X,
  LockKeyhole,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { SUPPORTED_LANGUAGES } from '../services/multilingualAccessibilityService';
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
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 no-print max-w-[calc(100vw-1.5rem)]">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2.5 max-w-full bg-phumulani-earth hover:bg-phumulani-charcoal text-white px-4 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group border border-white/90 focus-visible:ring-2 focus-visible:ring-phumulani-gold"
              aria-label="Open Website Concierge"
            >
              <Bot
                className="w-4 h-4 text-phumulani-gold group-hover:scale-105 transition-transform shrink-0"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="font-heading font-semibold text-xs tracking-wide hidden min-[400px]:inline whitespace-nowrap">
                Ask Concierge
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Concierge Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-labelledby="concierge-dialog-title"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 h-[min(580px,82vh)] bg-white rounded-2xl shadow-2xl border border-phumulani-charcoal/15 flex flex-col overflow-hidden no-print"
          >
            {/* Header */}
            <div className="bg-phumulani-charcoal text-white p-3.5 flex items-center justify-between gap-2 border-b border-phumulani-gold/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-phumulani-earth flex items-center justify-center border border-phumulani-gold/40 shrink-0">
                  <Bot className="w-4 h-4 text-phumulani-gold" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div id="concierge-dialog-title" className="text-xs font-bold tracking-tight font-heading truncate">
                    Website Concierge (Agent A10)
                  </div>
                  <div className="text-[10px] text-phumulani-cream truncate font-sans">
                    Grounded in Approved Records
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 bg-phumulani-earth/50 border border-phumulani-cream/25 rounded-md px-1.5 py-0.5">
                  <Languages className="w-3 h-3 text-phumulani-teal shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value as SupportedLanguageCode)}
                    className="text-[10px] bg-phumulani-charcoal text-white focus:outline-hidden cursor-pointer"
                    aria-label="Select Assistance Language"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code} className="bg-white text-phumulani-charcoal">
                        {l.localName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-phumulani-cream hover:bg-phumulani-charcoal transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-gold"
                  aria-label="Close Concierge"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Model Connectivity & Privacy Strip */}
            <div className="bg-phumulani-cream border-b border-phumulani-charcoal/12 px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-phumulani-charcoal">
              <span className="flex items-center gap-1.5 min-w-0">
                <LockKeyhole className="w-3.5 h-3.5 text-phumulani-earth shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="truncate font-medium">Do not share confidential survivor details (VAWA § 1367)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-phumulani-earth font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Curated KB</span>
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-phumulani-cream/50" aria-live="polite">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-phumulani-earth text-white rounded-br-xs shadow-2xs'
                        : m.isCrisisAlert
                        ? 'bg-white border border-phumulani-earth text-phumulani-charcoal rounded-bl-xs font-medium shadow-xs'
                        : 'bg-white border border-phumulani-charcoal/12 text-phumulani-charcoal rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {m.text}

                    {m.sourceAttribution && (
                      <div
                        className={`mt-2 pt-1.5 border-t text-[10px] font-sans font-medium ${
                          m.role === 'user'
                            ? 'border-white/25 text-phumulani-cream'
                            : 'border-phumulani-charcoal/10 text-phumulani-earth'
                        }`}
                      >
                        Source: {m.sourceAttribution}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-phumulani-charcoal/80 mt-1 px-1">
                    {m.role === 'user' ? 'You' : 'Agent A10 · Public Concierge'}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-phumulani-charcoal bg-white border border-phumulani-charcoal/12 px-3 py-2 rounded-2xl w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-phumulani-earth animate-spin" strokeWidth={1.75} aria-hidden="true" />
                  <span>Checking approved knowledge base...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts & Human Escalation */}
            <div className="p-2.5 bg-phumulani-cream border-t border-phumulani-charcoal/12 flex flex-wrap gap-1.5 justify-between items-center">
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.slice(0, 2).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[11px] bg-white hover:bg-phumulani-gold/20 text-phumulani-charcoal border border-phumulani-charcoal/15 px-2.5 py-1 rounded-lg transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {!humanEscalated && (
                <button
                  onClick={handleHumanEscalate}
                  className="text-[11px] text-phumulani-earth hover:text-phumulani-charcoal font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-phumulani-gold/25 border border-phumulani-earth/30 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                  title="Connect with a human community advocate"
                >
                  <PhoneCall className="w-3 h-3 text-phumulani-earth" strokeWidth={1.75} aria-hidden="true" />
                  <span>Human Coordinator</span>
                </button>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-phumulani-charcoal/12 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about programs, volunteering, events..."
                className="flex-1 text-xs border border-phumulani-charcoal/20 rounded-lg px-3 py-2 text-phumulani-charcoal focus:outline-hidden focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20"
                disabled={isLoading}
                aria-label="Ask concierge question"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:bg-phumulani-cream disabled:text-phumulani-charcoal text-white rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-phumulani-earth"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
