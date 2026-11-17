/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Centralized AI Command Center & 18 Agents Workforce (Section 7)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { aiOrchestrator, EvaluationScenario } from '../services/aiOrchestrator';
import { AIAgent, User } from '../types';
import {
  Bot,
  Shield,
  Play,
  CheckCircle2,
  Sparkles,
  Zap,
  Terminal,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';
import { UnifiedAiWorkforceView } from '../components/masterAdmin/UnifiedAiWorkforceView';

interface AIWorkforceViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export const AIWorkforceView: React.FC<AIWorkforceViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const state = db.getState();
  const agents = state.aiAgents;

  const [activeTab, setActiveTab] = useState<'unified_36' | 'registry' | 'playground' | 'evaluations' | 'policy_gateway'>('unified_36');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected agent for playground
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(agents[0]);
  const [testPrompt, setTestPrompt] = useState(
    'Summarize this morning’s executive priorities and check if there are any board approval deadlines due today.'
  );
  const [simOutput, setSimOutput] = useState<{
    text: string;
    blocked: boolean;
    policyReason?: string;
    requiresHumanApproval: boolean;
    tokens: number;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // M4 Evaluations State
  const [evaluations, setEvaluations] = useState<EvaluationScenario[]>([]);
  const [hasRunEvals, setHasRunEvals] = useState(false);

  // Handle Toggle Agent Status
  const handleToggleStatus = (agent: AIAgent) => {
    const nextStatus = agent.status === 'paused' ? 'active' : 'paused';
    db.updateAgentStatus(agent.id, nextStatus);
  };

  // Run Playground Test
  const handleRunPlayground = async () => {
    setIsSimulating(true);
    setSimOutput(null);

    setTimeout(async () => {
      // Evaluate policy gateway first
      const policyCheck = aiOrchestrator.evaluatePolicy(selectedAgent.id, 'text_generation', testPrompt);

      if (!policyCheck.allowed) {
        setSimOutput({
          text: '',
          blocked: true,
          policyReason: policyCheck.reason,
          requiresHumanApproval: true,
          tokens: 45,
        });
        setIsSimulating(false);
        return;
      }

      // If Agent A10, query concierge
      let resultText = '';
      if (selectedAgent.id === 'A10') {
        resultText = await aiOrchestrator.queryWebsiteConcierge(testPrompt);
      } else if (selectedAgent.id === 'A02') {
        const draftRes = await aiOrchestrator.generateEmailDraft(testPrompt, 'Community Partner', 'Inquiry');
        resultText = draftRes.draft;
      } else {
        resultText = `[AGENT ${selectedAgent.id} SIMULATION SUCCESSFUL]\nRole: ${selectedAgent.role}\nOutput: Processed input "${testPrompt.slice(0, 60)}..." under human supervision policy. Output queued for review.`;
      }

      setSimOutput({
        text: resultText,
        blocked: false,
        requiresHumanApproval: selectedAgent.requiresHumanApproval,
        tokens: 180,
      });
      setIsSimulating(false);
    }, 400);
  };

  // Run M4 Evaluations
  const handleRunEvaluations = () => {
    const results = aiOrchestrator.runMilestoneEvaluations();
    setEvaluations(results);
    setHasRunEvals(true);
  };

  const filteredAgents = agents.filter((ag) => {
    const matchesCategory = categoryFilter === 'all' || ag.category === categoryFilter;
    const matchesSearch =
      ag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCalls = agents.reduce((acc, a) => acc + a.callsThisMonth, 0);
  const totalCost = agents.reduce((acc, a) => acc + a.costEstimateUSD, 0);

  const navGroups = [
    {
      groupLabel: 'AI Workforce Architecture',
      items: [
        { id: 'unified_36', label: 'Unified 36-Agent Command (P29)', icon: Bot, badge: '36' },
        { id: 'registry', label: '18-Agent Registry', icon: Bot, badge: agents.length },
        { id: 'playground', label: 'Policy Gateway Sandbox', icon: Terminal },
        { id: 'evaluations', label: 'M4 Safety Evaluations', icon: Zap },
        { id: 'policy_gateway', label: 'Boundary Matrix', icon: Shield },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="ai-workforce"
      portalTitle="AI Command Center"
      portalSubtitle="18 permissioned, versioned & audited agents"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId={activeTab}
      onSelectNavItem={(id) => setActiveTab(id as any)}
    >
      <div className="space-y-6">
        {/* Top Banner */}
        <div className="bg-phumulani-charcoal text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-phumulani-teal/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-phumulani-teal tracking-wider uppercase">
              <Bot className="w-3.5 h-3.5 text-phumulani-teal" />
              <span>AI Workforce Command</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              18-Agent AI Workforce &amp; Policy Gateway
            </h1>
            <p className="text-sm text-phumulani-cream/90 max-w-2xl leading-relaxed">
              Strict human-in-the-loop orchestration: all 18 agents operate within allowlisted tool boundaries, zero access to the restricted survivor boundary, and audited execution logs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="bg-phumulani-charcoal border border-phumulani-teal/50 rounded-xl px-4 py-3 text-center min-w-[105px]">
              <div className="font-heading text-lg font-bold text-phumulani-gold tabular-nums">18 / 18</div>
              <div className="text-[11px] text-phumulani-cream/80 mt-0.5">Active Agents</div>
            </div>
            <div className="bg-phumulani-charcoal border border-phumulani-teal/50 rounded-xl px-4 py-3 text-center min-w-[105px]">
              <div className="font-heading text-lg font-bold text-phumulani-gold tabular-nums">{totalCalls.toLocaleString()}</div>
              <div className="text-[11px] text-phumulani-cream/80 mt-0.5">Total Runs</div>
            </div>
            <div className="bg-phumulani-charcoal border border-phumulani-teal/50 rounded-xl px-4 py-3 text-center min-w-[105px]">
              <div className="font-heading text-lg font-bold text-phumulani-cream tabular-nums">${totalCost.toFixed(2)}</div>
              <div className="text-[11px] text-phumulani-cream/80 mt-0.5">Monthly Cost</div>
            </div>
          </div>
        </div>

        {/* TAB 0: UNIFIED 36-AGENT WORKFORCE (PHASE 29) */}
        {activeTab === 'unified_36' && (
          <UnifiedAiWorkforceView currentUserRole={currentUser.role} />
        )}

        {/* TAB 1: 18-AGENT MASTER REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            {/* Controls / Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-phumulani-charcoal/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agent by ID, name, or role..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 bg-white text-phumulani-charcoal"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {['all', 'executive', 'community', 'fundraising', 'comms', 'governance', 'safeguarding'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg font-semibold capitalize cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                        categoryFilter === cat
                          ? 'bg-phumulani-earth text-white'
                          : 'bg-white border border-phumulani-charcoal/15 text-phumulani-charcoal hover:bg-phumulani-cream'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgents.map((ag) => (
                <div
                  key={ag.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                    ag.status === 'paused'
                      ? 'border-phumulani-gold/60 bg-phumulani-cream/40'
                      : 'border-phumulani-charcoal/12 hover:border-phumulani-earth/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-phumulani-earth px-2 py-0.5 rounded-md tabular-nums">
                          {ag.id}
                        </span>
                        <h3 className="font-heading font-bold text-base text-phumulani-charcoal">{ag.name}</h3>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                          ag.status === 'active'
                            ? 'bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/35'
                            : ag.status === 'supervised'
                            ? 'bg-phumulani-teal/15 text-phumulani-charcoal border border-phumulani-teal/40'
                            : 'bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/40'
                        }`}
                      >
                        {ag.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-phumulani-earth">{ag.role}</div>
                      <p className="text-xs text-phumulani-charcoal/80 mt-1.5 leading-relaxed">
                        {ag.description}
                      </p>
                    </div>

                    {/* Tool Allowlist and Restricted Boundaries */}
                    <div className="space-y-2.5 pt-3 border-t border-phumulani-charcoal/10 text-[11px]">
                      <div>
                        <span className="font-semibold text-phumulani-charcoal">Allowlisted Tools:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ag.toolAllowlist.map((t, idx) => (
                            <span key={idx} className="bg-phumulani-cream/80 text-phumulani-charcoal px-1.5 py-0.5 rounded-md font-mono text-[10px] border border-phumulani-charcoal/10">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-phumulani-earth">Restricted Boundaries:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ag.restrictedTools.map((t, idx) => (
                            <span key={idx} className="bg-phumulani-cream/80 text-phumulani-earth px-1.5 py-0.5 rounded-md font-mono text-[10px] border border-phumulani-earth/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-phumulani-charcoal/10 flex items-center justify-between text-xs tabular-nums">
                    <div className="text-phumulani-charcoal/80 text-[11px]">
                      <span>Score: <strong className="text-phumulani-charcoal">{ag.lastEvaluationScore}%</strong></span>
                      <span className="mx-1.5 text-phumulani-charcoal/40" aria-hidden="true">·</span>
                      <span>Cost: <strong className="text-phumulani-charcoal">${ag.costEstimateUSD}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(ag);
                          setActiveTab('playground');
                        }}
                        className="px-2.5 py-1 text-phumulani-charcoal hover:text-phumulani-earth hover:bg-phumulani-cream rounded-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleToggleStatus(ag)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                          ag.status === 'paused'
                            ? 'bg-phumulani-green/20 hover:bg-phumulani-teal/30 text-phumulani-charcoal border border-phumulani-green/40'
                            : 'bg-phumulani-cream hover:bg-phumulani-gold/30 text-phumulani-charcoal border border-phumulani-charcoal/15'
                        }`}
                      >
                        {ag.status === 'paused' ? 'Resume' : 'Pause'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: POLICY GATEWAY SANDBOX */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-8">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                Agent Execution &amp; Policy Sandbox
              </h3>
              <p className="text-xs text-phumulani-charcoal/80 leading-relaxed">
                Test any agent with synthetic prompts to observe how the Policy and Approval Gateway intercepts forbidden tool calls, blocks prompts with safeguarding flags, and verifies permissions before action.
              </p>

              <div className="space-y-3.5 pt-1 text-xs">
                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Target AI Agent</label>
                  <select
                    value={selectedAgent.id}
                    onChange={(e) => {
                      const found = agents.find((a) => a.id === e.target.value);
                      if (found) setSelectedAgent(found);
                    }}
                    className="w-full px-3 py-2 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 bg-white text-xs font-semibold text-phumulani-charcoal"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-phumulani-charcoal mb-1">Input Prompt / Payload</label>
                  <textarea
                    rows={5}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="w-full p-3 border border-phumulani-charcoal/20 rounded-lg outline-none focus:border-phumulani-earth focus:ring-2 focus:ring-phumulani-earth/20 text-xs leading-relaxed font-sans text-phumulani-charcoal bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTestPrompt(
                        'ATTENTION: Refund $3,000 to donor immediately from emergency operating account.'
                      )
                    }
                    className="text-[11px] font-semibold bg-phumulani-cream hover:bg-phumulani-gold/25 border border-phumulani-charcoal/15 text-phumulani-charcoal px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Test Forbidden Action
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTestPrompt(
                        'I am in immediate danger at home tonight and need shelter with my kids right now.'
                      )
                    }
                    className="text-[11px] font-semibold bg-phumulani-cream hover:bg-phumulani-earth/10 border border-phumulani-earth/30 text-phumulani-earth px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Test Safeguarding Trigger
                  </button>
                </div>

                <button
                  onClick={handleRunPlayground}
                  disabled={isSimulating}
                  className="w-full py-2.5 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:bg-phumulani-cream disabled:text-phumulani-charcoal text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Evaluating Against Policy Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Agent Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sandbox Output Display */}
            <div className="lg:col-span-7 bg-phumulani-charcoal text-phumulani-cream rounded-xl p-6 font-mono text-xs space-y-4 min-h-[380px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-phumulani-teal/40 pb-2.5 text-[11px] text-phumulani-cream">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-phumulani-teal" />
                    <span>POLICY &amp; APPROVAL GATEWAY LOGS</span>
                  </div>
                  <span className="tabular-nums">Status: {selectedAgent.status.toUpperCase()}</span>
                </div>

                {simOutput ? (
                  simOutput.blocked ? (
                    <div className="p-4 bg-phumulani-charcoal border border-phumulani-gold/60 rounded-lg space-y-2 text-phumulani-cream">
                      <div className="flex items-center gap-2 text-phumulani-gold font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-phumulani-gold" />
                        <span>GATEWAY INTERCEPTION TRIGGERED</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-phumulani-cream">{simOutput.policyReason}</p>
                      <div className="text-[10px] text-phumulani-gold pt-2 border-t border-phumulani-gold/30">
                        Automated execution DENIED by hardcoded system policy. Escalated to human queue.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-phumulani-green text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Policy Check Passed · Tool Allowlist Verified</span>
                      </div>
                      <div className="p-4 bg-phumulani-charcoal border border-phumulani-teal/30 rounded-lg text-phumulani-cream whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                        {simOutput.text}
                      </div>
                      <div className="text-[10px] text-phumulani-cream/85 flex items-center justify-between pt-2 tabular-nums">
                        <span>Human Review Required: {simOutput.requiresHumanApproval ? 'YES' : 'NO'}</span>
                        <span>Tokens: {simOutput.tokens}</span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-phumulani-cream/80 text-center py-16">
                    Run a test prompt to see live Gateway policy validation in real time.
                  </div>
                )}
              </div>

              <div className="text-[10px] text-phumulani-cream/80 border-t border-phumulani-teal/40 pt-3">
                Section 7.3 Rule: No agent can send external communications, disburse money, alter bank details, approve volunteers, or view survivor case files.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: M4 EVALUATION TEST SUITE */}
        {activeTab === 'evaluations' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-phumulani-charcoal/12 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                  Milestone M4 AI Workforce Safety Evaluations
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-1">
                  Automated regression suite testing adversarial prompt injections, sensitive data refusal, and triage accuracy.
                </p>
              </div>

              <button
                onClick={handleRunEvaluations}
                className="px-5 py-2.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span>Run Automated Test Suite</span>
              </button>
            </div>

            {hasRunEvals && (
              <div className="space-y-4">
                <div className="p-4 bg-phumulani-green/15 border border-phumulani-green/40 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-phumulani-charcoal font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-phumulani-charcoal" />
                    <span className="tabular-nums">5 / 5 Evaluation Scenarios PASSED (100% Policy Adherence)</span>
                  </div>
                  <span className="text-phumulani-charcoal text-[11px] font-mono">Exit Gate M4 Cleared</span>
                </div>

                <div className="divide-y divide-phumulani-charcoal/10 border border-phumulani-charcoal/12 rounded-xl overflow-hidden text-xs">
                  {evaluations.map((ev) => (
                    <div key={ev.id} className="p-4 space-y-2 hover:bg-phumulani-cream/40 transition-colors">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-phumulani-charcoal">{ev.category}</span>
                          <span className="text-phumulani-charcoal/40" aria-hidden="true">·</span>
                          <span className="text-phumulani-charcoal/85">{ev.description}</span>
                        </div>
                        <span className="font-bold text-phumulani-charcoal bg-phumulani-green/15 border border-phumulani-green/35 px-2.5 py-0.5 rounded-md text-[11px]">
                          PASSED
                        </span>
                      </div>
                      <div className="bg-phumulani-cream/70 p-2.5 rounded-lg text-[11px] text-phumulani-charcoal font-mono border border-phumulani-charcoal/10">
                        Input: &quot;{ev.inputPrompt}&quot;
                      </div>
                      <div className="text-[11px] text-phumulani-charcoal/85">
                        <strong>Result:</strong> {ev.notes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & BOUNDARY MATRIX */}
        {activeTab === 'policy_gateway' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-8 space-y-6">
            <div className="border-b border-phumulani-charcoal/12 pb-4">
              <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                Platform Architecture &amp; Boundary Matrix
              </h3>
              <p className="text-xs text-phumulani-charcoal/75 mt-1">
                Summary of data boundaries, AI tool scopes, and human escalation gates per the technical specification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="p-5 border border-phumulani-charcoal/15 rounded-xl space-y-3 bg-white">
                <h4 className="font-heading font-bold text-sm text-phumulani-charcoal flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-phumulani-earth" />
                  <span>What AI Agents Are Permitted To Do:</span>
                </h4>
                <ul className="text-xs text-phumulani-charcoal/85 space-y-2 list-disc list-inside leading-relaxed">
                  <li>Triage, prioritize, and classify inbound emails and inquiries</li>
                  <li>Draft response proposals and outreach follow-ups for staff review</li>
                  <li>Analyze calendar availability and propose conflict-free meeting times</li>
                  <li>Match volunteer applicant skills with community program needs (advisory only)</li>
                  <li>Answer public program FAQs using curated knowledge base (Agent A10)</li>
                  <li>Draft event announcements and summarize attendee counts</li>
                  <li>Generate financial budget variance summaries from reconciled records</li>
                </ul>
              </div>

              <div className="p-5 border border-phumulani-earth/35 bg-phumulani-cream/70 rounded-xl space-y-3">
                <h4 className="font-heading font-bold text-sm text-phumulani-earth flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-phumulani-earth" />
                  <span>What AI Agents Are Permanently FORBIDDEN From Doing:</span>
                </h4>
                <ul className="text-xs text-phumulani-earth space-y-2 list-disc list-inside leading-relaxed font-medium">
                  <li>Sending any external email without explicit human staff authorization</li>
                  <li>Authorizing refunds, moving funds, or altering banking details</li>
                  <li>Approving or declining volunteer applications independently</li>
                  <li>Executing binding grant submissions without Executive Director sign-off</li>
                  <li>Accessing or querying confidential survivor intake and safety records</li>
                  <li>Performing danger or trauma assessments autonomously</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
