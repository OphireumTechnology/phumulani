/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Workflow Automation Engine Tab (M33.11)
 * Multi-step approval state machines, SLA monitoring, escalations, and idempotency key locking.
 */

import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  workflowAutomationEngine,
} from '../../services/workflowAutomationEngine';
import {
  WorkflowDefinition,
  WorkflowInstance,
} from '../../types/phase33';
import { User } from '../../types';

interface WorkflowAutomationEngineTabProps {
  currentUser: User;
}

export const WorkflowAutomationEngineTab: React.FC<WorkflowAutomationEngineTabProps> = ({
  currentUser,
}) => {
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>(
    workflowAutomationEngine.getDefinitions()
  );
  const [instances, setInstances] = useState<WorkflowInstance[]>(
    workflowAutomationEngine.getInstances()
  );
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(
    instances[0] || null
  );

  const handleAdvance = (instId: string, decision: 'APPROVED' | 'REJECTED') => {
    const updated = workflowAutomationEngine.advanceStep(
      instId,
      currentUser.name,
      decision,
      `Step decision by ${currentUser.name} (${currentUser.role})`
    );
    setInstances([...workflowAutomationEngine.getInstances()]);
    setSelectedInstance(updated);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-[#104F57] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-amber-300" />
            <span>WORKFLOW AUTOMATION ENGINE</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Advanced Workflow Automation Engine</h2>
          <p className="text-xs text-teal-100 max-w-2xl mt-1">
            Reusable organizational state machines: enforces human approval gates, SLAs, role-based escalation policies, and strict idempotency keys to prevent duplicate execution.
          </p>
        </div>
      </div>

      {/* DEFINITIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {definitions.map((def) => (
          <div key={def.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {def.id}
                </span>
                <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">{def.name}</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                v{def.version}.0 Active
              </span>
            </div>

            <div className="text-[11px] text-slate-500">
              Trigger: <strong className="text-slate-800">{def.triggerType}</strong>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configured Steps</div>
              {def.steps.map((st) => (
                <div key={st.stepIndex} className="text-xs flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                  <span className="font-medium text-slate-800">{st.stepIndex + 1}. {st.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{st.slaHours}h SLA</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE INSTANCES & AUDIT TRAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
            <h3 className="font-serif font-bold text-sm text-slate-900">Active Workflow Instances</h3>
            <span className="text-xs text-slate-500">{instances.length} Active Runs</span>
          </div>

          {instances.map((inst) => (
            <div
              key={inst.id}
              onClick={() => setSelectedInstance(inst)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs ${
                selectedInstance?.id === inst.id ? 'border-teal-700 ring-2 ring-teal-600/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800">{inst.id}</span>
                    <span className="text-[10px] font-mono text-slate-400">Ref: {inst.sourceEntityId}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-0.5">{inst.definitionName}</h4>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    inst.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : inst.status === 'AWAITING_APPROVAL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {inst.status}
                </span>
              </div>

              <div className="mt-3 flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Idempotency: <strong className="font-mono text-[10px]">{inst.idempotencyKey}</strong></span>
                <span>Current Step: <strong>Index {inst.currentStepIndex}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* INSTANCE DETAIL */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          {selectedInstance ? (
            <>
              <div className="border-b border-slate-200 pb-3">
                <span className="font-mono text-xs font-bold text-teal-800">{selectedInstance.id}</span>
                <h3 className="font-serif font-bold text-base text-slate-900 mt-1">{selectedInstance.definitionName}</h3>
                <div className="text-xs text-slate-500 mt-1">Source Entity: <strong>{selectedInstance.sourceEntityId}</strong></div>
              </div>

              {selectedInstance.status === 'AWAITING_APPROVAL' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Human Approval Gate Active</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    This step requires human confirmation before state transition is executed.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleAdvance(selectedInstance.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Approve & Advance
                    </button>
                    <button
                      onClick={() => handleAdvance(selectedInstance.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Reject / Halt
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step Audit Log</div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedInstance.auditTrail.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>Step {log.stepIndex}: {log.actor}</span>
                        <span className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{log.result}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select an instance from the left to inspect its state machine and approve steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
