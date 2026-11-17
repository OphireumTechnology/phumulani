/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Unified Community Operations Center (M33.01)
 * Centralizes operations, tasks, approvals, service requests, and notifications across all departments.
 */

import React, { useState } from 'react';
import {
  Layers,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Send,
  Building2,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  FileCheck2,
  Search,
} from 'lucide-react';
import {
  unifiedCommunityOperationsService,
} from '../../../services/unifiedCommunityOperationsService';
import {
  OperationalPriority,
  OperationItemStatus,
  OperationItemType,
  UnifiedOperationRecord,
} from '../../../types/phase33';
import { User } from '../../../types';

interface UnifiedCommunityOperationsCenterProps {
  currentUser: User;
  onOpenSourceRecord?: (sourceRef: string) => void;
}

export const UnifiedCommunityOperationsCenter: React.FC<UnifiedCommunityOperationsCenterProps> = ({
  currentUser,
  onOpenSourceRecord,
}) => {
  const [operations, setOperations] = useState<UnifiedOperationRecord[]>(
    unifiedCommunityOperationsService.getOperations()
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOp, setSelectedOp] = useState<UnifiedOperationRecord | null>(null);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  const kpis = unifiedCommunityOperationsService.getOperationalKPIs();

  const handleRefresh = () => {
    setOperations(
      unifiedCommunityOperationsService.getOperations({
        status: statusFilter !== 'ALL' ? (statusFilter as OperationItemStatus) : undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as OperationalPriority) : undefined,
        departmentId: deptFilter !== 'ALL' ? deptFilter : undefined,
      })
    );
  };

  const filteredOps = operations.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.canonicalSourceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || op.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || op.priority === priorityFilter;
    const matchesDept = deptFilter === 'ALL' || op.departmentId === deptFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  const handleStatusChange = (id: string, newStatus: OperationItemStatus) => {
    const updated = unifiedCommunityOperationsService.updateOperationStatus(
      id,
      newStatus,
      currentUser.name
    );
    setOperations([...unifiedCommunityOperationsService.getOperations()]);
    if (selectedOp && selectedOp.id === id) {
      setSelectedOp(updated);
    }
  };

  const handleEscalateConfirm = () => {
    if (!selectedOp || !escalateReason.trim()) return;
    const updated = unifiedCommunityOperationsService.escalateOperation(
      selectedOp.id,
      escalateReason.trim(),
      currentUser.name
    );
    setOperations([...unifiedCommunityOperationsService.getOperations()]);
    setSelectedOp(updated);
    setIsEscalateModalOpen(false);
    setEscalateReason('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-teal bg-phumulani-charcoal px-3 py-0.5 rounded-full border border-phumulani-teal mb-2">
            <Layers className="w-3.5 h-3.5 text-phumulani-teal" />
            <span>CENTRAL OPERATIONS HUB</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Unified Community Operations Center</h2>
          <p className="text-xs text-phumulani-cream max-w-2xl mt-1">
            Real-time cross-departmental coordination: monitors community service requests, volunteer deployments, program activities, and executive approval gates with canonical record linking.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-phumulani-earth hover:bg-phumulani-charcoal px-4 py-2 rounded-xl text-xs font-semibold border border-phumulani-cream transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Operations</span>
        </button>
      </div>

      {/* OPERATIONAL KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">Active Operations</div>
          <div className="text-2xl font-bold font-serif text-phumulani-charcoal mt-1">{kpis.totalActiveOperations}</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">Across 6 divisions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">Pending Approvals</div>
          <div className="text-2xl font-bold font-serif text-phumulani-earth mt-1">{kpis.pendingApprovalCount}</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">Human gate active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">In Progress</div>
          <div className="text-2xl font-bold font-serif text-phumulani-earth mt-1">{kpis.inProgressCount}</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">Executing tasks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">Completed</div>
          <div className="text-2xl font-bold font-serif text-phumulani-earth mt-1">{kpis.completedCount}</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">Verified logged</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">Critical / Urgent</div>
          <div className="text-2xl font-bold font-serif text-phumulani-earth mt-1">{kpis.criticalUrgentCount}</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">&lt; 96h deadlines</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
          <div className="text-[11px] font-medium text-phumulani-charcoal">On-Time SLA Rate</div>
          <div className="text-2xl font-bold font-serif text-phumulani-charcoal mt-1">{kpis.onTimeCompletionRate}%</div>
          <div className="text-[10px] text-phumulani-earth mt-0.5">Operational benchmark</div>
        </div>
      </div>

      {/* CONTROLS & FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-phumulani-charcoal absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search operations by title, department, or ref (e.g. SRV-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-phumulani-cream border border-phumulani-cream rounded-lg focus:outline-hidden focus:ring-1 focus:ring-phumulani-earth"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-phumulani-cream border border-phumulani-cream rounded-lg px-2.5 py-1.5 text-phumulani-charcoal"
          >
            <option value="ALL">All Priorities</option>
            <option value="ROUTINE">Routine</option>
            <option value="ELEVATED">Elevated</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL_URGENT">Critical / Urgent</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-phumulani-cream border border-phumulani-cream rounded-lg px-2.5 py-1.5 text-phumulani-charcoal"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-phumulani-cream border border-phumulani-cream rounded-lg px-2.5 py-1.5 text-phumulani-charcoal"
          >
            <option value="ALL">All Departments</option>
            <option value="DEPT-COMM">Community Outreach</option>
            <option value="DEPT-VOL">Volunteer Operations</option>
            <option value="DEPT-FUND">Development & Grants</option>
            <option value="DEPT-EXEC">Executive & Governance</option>
          </select>
        </div>
      </div>

      {/* OPERATIONS LIST & DETAIL DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOps.map((op) => (
            <div
              key={op.id}
              onClick={() => setSelectedOp(op)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs ${
                selectedOp?.id === op.id ? 'border-phumulani-earth ring-2 ring-phumulani-earth' : 'border-phumulani-cream hover:border-phumulani-cream'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                      {op.id}
                    </span>
                    <span className="font-mono text-[10px] text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                      Ref: {op.canonicalSourceRef}
                    </span>
                    {op.isEscalated && (
                      <span className="text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded-full border border-phumulani-earth flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>ESCALATED</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-phumulani-charcoal">{op.title}</h4>
                  <p className="text-xs text-phumulani-charcoal line-clamp-1">{op.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      op.priority === 'CRITICAL_URGENT'
                        ? 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
                        : op.priority === 'HIGH'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                        : 'bg-phumulani-cream text-phumulani-charcoal'
                    }`}
                  >
                    {op.priority}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      op.status === 'COMPLETED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal'
                        : op.status === 'IN_PROGRESS'
                        ? 'bg-phumulani-cream text-phumulani-earth'
                        : 'bg-phumulani-cream text-phumulani-charcoal'
                    }`}
                  >
                    {op.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-phumulani-cream flex items-center justify-between text-[11px] text-phumulani-charcoal">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-phumulani-charcoal" />
                  <span>{op.departmentName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Assigned: <strong>{op.assignedStaffName || 'Unassigned'}</strong></span>
                  {op.deadline && (
                    <span className="flex items-center gap-1 text-phumulani-charcoal">
                      <Clock className="w-3 h-3 text-phumulani-charcoal" />
                      <span>{new Date(op.deadline).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredOps.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-phumulani-cream text-phumulani-charcoal text-xs">
              No operational records match current filters.
            </div>
          )}
        </div>

        {/* DETAIL DRAWER */}
        <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-4">
          {selectedOp ? (
            <>
              <div className="border-b border-phumulani-cream pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-phumulani-earth">{selectedOp.id}</span>
                  <span className="text-[10px] text-phumulani-charcoal">{new Date(selectedOp.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="font-serif font-bold text-base text-phumulani-charcoal mt-1">{selectedOp.title}</h3>
                <div className="text-xs text-phumulani-charcoal mt-2">{selectedOp.description}</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-phumulani-cream">
                  <span className="text-phumulani-charcoal">Canonical Record:</span>
                  <span className="font-mono font-semibold text-phumulani-earth">{selectedOp.canonicalSourceRef}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-phumulani-cream">
                  <span className="text-phumulani-charcoal">Department:</span>
                  <span className="font-semibold text-phumulani-charcoal">{selectedOp.departmentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-phumulani-cream">
                  <span className="text-phumulani-charcoal">Assigned Lead:</span>
                  <span className="font-semibold text-phumulani-charcoal">{selectedOp.assignedStaffName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-phumulani-cream">
                  <span className="text-phumulani-charcoal">Priority:</span>
                  <span className="font-bold text-phumulani-charcoal">{selectedOp.priority}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-phumulani-cream">
                  <span className="text-phumulani-charcoal">Current Status:</span>
                  <span className="font-bold text-phumulani-earth">{selectedOp.status}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-phumulani-charcoal uppercase tracking-wider">Update Operational Status</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOp.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 text-xs bg-phumulani-cream text-phumulani-earth hover:bg-phumulani-cream font-semibold rounded-lg border border-phumulani-teal transition-colors"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOp.id, 'COMPLETED')}
                    className="px-3 py-1.5 text-xs bg-phumulani-cream text-phumulani-earth hover:bg-phumulani-cream font-semibold rounded-lg border border-phumulani-green transition-colors"
                  >
                    Mark Completed
                  </button>
                </div>

                {!selectedOp.isEscalated && (
                  <button
                    onClick={() => setIsEscalateModalOpen(true)}
                    className="w-full px-3 py-1.5 text-xs bg-phumulani-cream text-phumulani-earth hover:bg-phumulani-cream font-semibold rounded-lg border border-phumulani-earth transition-colors mt-2"
                  >
                    Escalate to Executive Lead
                  </button>
                )}
              </div>

              {/* WORKFLOW HISTORY */}
              <div className="pt-3 border-t border-phumulani-cream space-y-2">
                <div className="text-[11px] font-bold text-phumulani-charcoal uppercase tracking-wider">Audit & Workflow History</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOp.workflowHistory.map((step) => (
                    <div key={step.id} className="text-[11px] bg-phumulani-cream p-2 rounded-lg border border-phumulani-cream">
                      <div className="flex justify-between font-semibold text-phumulani-charcoal">
                        <span>{step.actor}</span>
                        <span className="text-[9px] text-phumulani-charcoal">{new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-phumulani-earth text-[10px] font-medium">{step.action}</div>
                      {step.notes && <div className="text-phumulani-charcoal text-[10px] mt-0.5">{step.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-phumulani-charcoal text-xs">
              Select an operational record from the left to view detailed history and manage workflow transitions.
            </div>
          )}
        </div>
      </div>

      {/* ESCALATION MODAL */}
      {isEscalateModalOpen && selectedOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-base text-phumulani-earth flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-phumulani-earth" />
              <span>Escalate Operation {selectedOp.id}</span>
            </h3>
            <p className="text-xs text-phumulani-charcoal">
              Escalating flags this operation as <strong>CRITICAL_URGENT</strong> and triggers notifications to Executive Director Comfort Dondo and relevant Department Leads.
            </p>
            <textarea
              rows={3}
              placeholder="State the escalation reason or SLA breach risk..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-phumulani-cream rounded-lg focus:outline-hidden focus:ring-1 focus:ring-phumulani-earth"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-phumulani-charcoal hover:bg-phumulani-cream rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                disabled={!escalateReason.trim()}
                className="px-4 py-1.5 text-xs bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-semibold rounded-lg disabled:opacity-50"
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
