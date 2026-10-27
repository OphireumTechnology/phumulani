/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.03 Service Request Lifecycle Optimization Tab
 */

import React, { useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, ArrowRight, UserCheck, MessageSquare, ListFilter, CheckSquare } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { OptimizedServiceRequest, ServiceRequestLifecycleStatus } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const ServiceRequestOptimizationTab: React.FC<Props> = ({ currentUser }) => {
  const [requests, setRequests] = useState<OptimizedServiceRequest[]>(phase34Service.getOptimizedServiceRequests());
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<OptimizedServiceRequest | null>(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);

  const reload = () => {
    setRequests([...phase34Service.getOptimizedServiceRequests(selectedStatus !== 'ALL' ? (selectedStatus as ServiceRequestLifecycleStatus) : undefined)]);
  };

  const handleStatusTransition = (id: string, newStatus: ServiceRequestLifecycleStatus) => {
    phase34Service.transitionServiceRequestStatus(id, newStatus, currentUser.name, `Transitioned to ${newStatus} by ${currentUser.name}`);
    reload();
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(phase34Service.getServiceRequestById(id) || null);
    }
  };

  const handleEscalate = () => {
    if (!selectedRequest || !escalationReason.trim()) return;
    phase34Service.escalateServiceRequest(selectedRequest.id, escalationReason, currentUser.name);
    setIsEscalateOpen(false);
    setEscalationReason('');
    reload();
    setSelectedRequest(phase34Service.getServiceRequestById(selectedRequest.id) || null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              M34.03
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Community Service Request Lifecycle
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Intake-to-resolution tracking with deterministic SLA target monitoring, follow-up checklists, and supervisor escalation gates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setRequests(phase34Service.getOptimizedServiceRequests(e.target.value !== 'ALL' ? (e.target.value as ServiceRequestLifecycleStatus) : undefined));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="INTAKE">Intake</option>
            <option value="TRIAGED">Triaged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className={`p-5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:border-teal-700/50 ${
                selectedRequest?.id === req.id ? 'ring-2 ring-teal-700 border-teal-700' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {req.trackingNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'ESCALATED' ? 'bg-rose-100 text-rose-800' :
                      req.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.status}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      req.priority === 'URGENT' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{req.description}</p>
                </div>

                {/* SLA Indicator */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.slaElapsedHours}/{req.slaTargetHours}h SLA</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-medium block mt-1">
                    {req.assignedStaffName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status Action Quick Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Created: {req.createdAt.split('T')[0]}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {req.status === 'TRIAGED' && (
                    <button
                      onClick={() => handleStatusTransition(req.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Begin Progress
                    </button>
                  )}
                  {req.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusTransition(req.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Request Detail Panel (Right col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 h-fit">
          {selectedRequest ? (
            <>
              <div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {selectedRequest.trackingNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2">{selectedRequest.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Category: {selectedRequest.category}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.assignedStaffName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SLA Progress:</span>
                  <span className="font-bold text-slate-800">{selectedRequest.slaElapsedHours} of {selectedRequest.slaTargetHours} hours</span>
                </div>
              </div>

              {/* Follow-up Tasks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Follow-up Tasks</h4>
                <div className="space-y-2">
                  {selectedRequest.followUpTasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded">
                      <CheckSquare className={`w-4 h-4 ${t.completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className={t.completed ? 'line-through text-slate-400' : ''}>{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setIsEscalateOpen(true)}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Escalate to Human Supervisor
                </button>
              </div>

              {/* Audit History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Audit History</h4>
                <div className="space-y-2 text-[11px] text-slate-600 max-h-48 overflow-y-auto">
                  {selectedRequest.history.map((h: any) => (
                    <div key={h.id} className="p-2 border-l-2 border-teal-700 bg-slate-50 rounded-r">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{h.actor}</span>
                        <span>{h.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Select a service request from the list to view lifecycle details and execute transitions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Modal */}
      {isEscalateOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Escalate Service Request</h3>
            <p className="text-xs text-slate-600">
              Escalating flags this request as URGENT and notifies departmental leadership for immediate intervention.
            </p>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="State reason for supervisor escalation..."
              className="w-full p-2.5 border border-slate-300 rounded text-sm text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEscalateOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalationReason.trim()}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
