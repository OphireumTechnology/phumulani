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
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
              M34.03
            </span>
            <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
              Community Service Request Lifecycle
            </h2>
          </div>
          <p className="text-sm text-phumulani-charcoal max-w-2xl">
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
            className="px-3 py-2 bg-phumulani-cream border border-phumulani-cream rounded-lg text-sm text-phumulani-charcoal font-medium focus:outline-hidden"
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
              className={`p-5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all hover:border-phumulani-earth ${
                selectedRequest?.id === req.id ? 'ring-2 ring-phumulani-earth border-phumulani-earth' : 'border-phumulani-cream'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                      {req.trackingNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'ESCALATED' ? 'bg-phumulani-cream text-phumulani-earth' :
                      req.status === 'RESOLVED' ? 'bg-phumulani-cream text-phumulani-charcoal' :
                      'bg-phumulani-cream text-phumulani-charcoal'
                    }`}>
                      {req.status}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      req.priority === 'URGENT' ? 'bg-phumulani-cream text-phumulani-earth' : 'bg-phumulani-cream text-phumulani-charcoal'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-phumulani-charcoal text-base">{req.title}</h3>
                  <p className="text-xs text-phumulani-charcoal line-clamp-2">{req.description}</p>
                </div>

                {/* SLA Indicator */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-phumulani-charcoal justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.slaElapsedHours}/{req.slaTargetHours}h SLA</span>
                  </div>
                  <span className="text-[10px] text-phumulani-earth font-medium block mt-1">
                    {req.assignedStaffName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status Action Quick Bar */}
              <div className="mt-4 pt-3 border-t border-phumulani-cream flex items-center justify-between text-xs">
                <span className="text-phumulani-charcoal">Created: {req.createdAt.split('T')[0]}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {req.status === 'TRIAGED' && (
                    <button
                      onClick={() => handleStatusTransition(req.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Begin Progress
                    </button>
                  )}
                  {req.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusTransition(req.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-phumulani-green hover:bg-phumulani-teal text-phumulani-charcoal rounded text-xs font-semibold cursor-pointer"
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
        <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs space-y-5 h-fit">
          {selectedRequest ? (
            <>
              <div>
                <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                  {selectedRequest.trackingNumber}
                </span>
                <h3 className="font-bold text-phumulani-charcoal text-lg mt-2">{selectedRequest.title}</h3>
                <p className="text-xs text-phumulani-charcoal mt-1">Category: {selectedRequest.category}</p>
              </div>

              <div className="p-3 bg-phumulani-cream rounded-lg text-xs space-y-1.5 border border-phumulani-cream">
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Status:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedRequest.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Priority:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedRequest.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">Assigned:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedRequest.assignedStaffName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-phumulani-charcoal">SLA Progress:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedRequest.slaElapsedHours} of {selectedRequest.slaTargetHours} hours</span>
                </div>
              </div>

              {/* Follow-up Tasks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal mb-2">Follow-up Tasks</h4>
                <div className="space-y-2">
                  {selectedRequest.followUpTasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-phumulani-charcoal bg-phumulani-cream p-2 rounded">
                      <CheckSquare className={`w-4 h-4 ${t.completed ? 'text-phumulani-earth' : 'text-phumulani-charcoal'}`} />
                      <span className={t.completed ? 'line-through text-phumulani-charcoal' : ''}>{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-phumulani-cream space-y-2">
                <button
                  onClick={() => setIsEscalateOpen(true)}
                  className="w-full py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth border border-phumulani-earth rounded-lg text-xs font-bold cursor-pointer"
                >
                  Escalate to Human Supervisor
                </button>
              </div>

              {/* Audit History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-phumulani-charcoal mb-2">Audit History</h4>
                <div className="space-y-2 text-[11px] text-phumulani-charcoal max-h-48 overflow-y-auto">
                  {selectedRequest.history.map((h: any) => (
                    <div key={h.id} className="p-2 border-l-2 border-phumulani-earth bg-phumulani-cream rounded-r">
                      <div className="flex justify-between font-bold text-phumulani-charcoal">
                        <span>{h.actor}</span>
                        <span>{h.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="mt-0.5 text-phumulani-charcoal">{h.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-phumulani-charcoal">
              <Shield className="w-10 h-10 mx-auto text-phumulani-charcoal mb-2" />
              <p className="text-xs font-medium">Select a service request from the list to view lifecycle details and execute transitions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Modal */}
      {isEscalateOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-phumulani-cream space-y-4">
            <h3 className="text-base font-bold text-phumulani-charcoal">Escalate Service Request</h3>
            <p className="text-xs text-phumulani-charcoal">
              Escalating flags this request as URGENT and notifies departmental leadership for immediate intervention.
            </p>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="State reason for supervisor escalation..."
              className="w-full p-2.5 border border-phumulani-cream rounded text-sm text-phumulani-charcoal"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEscalateOpen(false)}
                className="px-3 py-1.5 border border-phumulani-cream rounded text-xs font-semibold text-phumulani-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalationReason.trim()}
                className="px-4 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded text-xs font-semibold disabled:opacity-50"
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
