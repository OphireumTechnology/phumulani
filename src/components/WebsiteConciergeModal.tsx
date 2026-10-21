/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Website Concierge (Agent A10) Interactive Chat Component
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { aiOrchestrator } from '../services/aiOrchestrator';

export const WebsiteConciergeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string; isCrisisAlert?: boolean }>>([
    {
      role: 'model',
      text: 'Hello! I am Phumulani’s Website Concierge (Agent A10). I can help answer questions about our community programs, volunteer opportunities, upcoming workshops, and donation paths from our approved public records. How can I assist you today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSend = async (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiOrchestrator.queryWebsiteConcierge(question);
      const isCrisis = response.includes('Minnesota Day One Crisis Line') || response.includes('911');
      setMessages((prev) => [...prev, { role: 'model', text: response, isCrisisAlert: isCrisis }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Thank you for your question. You can connect directly with our community coordinators at info@phumulani.org or call during business hours.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#104F57] hover:bg-[#0c3e44] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-white"
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
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 no-print">
          {/* Header */}
          <div className="bg-[#104F57] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-800/80 flex items-center justify-center border border-teal-600">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">Website Concierge (A10)</div>
                <div className="text-[10px] text-teal-200 flex items-center gap-1">
                  <span>Grounded in Curated Public Knowledge</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Note */}
          <div className="bg-amber-50 border-b border-amber-200/60 px-3 py-1.5 text-[11px] text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Do not share sensitive personal identifiers or private case details here.</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FA]">
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

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="p-2 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-[11px] bg-white hover:bg-teal-50 text-slate-700 hover:text-[#104F57] border border-slate-200 hover:border-teal-300 px-2.5 py-1 rounded-md transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about programs, events, donating..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#104F57]"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-[#104F57] hover:bg-[#0c3e44] disabled:bg-slate-300 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
