/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Administrator — Organizational Task Management (M24.06)
 */

import React, { useState } from 'react';
import { masterAdminService } from '../../services/masterAdminService';
import { OrganizationalTask, OrgTaskStatus, OrgTaskPriority } from '../../types/masterAdmin';
import { User } from '../../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  XCircle,
  Send,
  UserCheck,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface TaskManagementTabProps {
  currentUser: User;
}

export const TaskManagementTab: React.FC<TaskManagementTabProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<OrganizationalTask[]>(masterAdminService.getTasks());
  const [selectedTask, setSelectedTask] = useState<OrganizationalTask | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Task Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeptId, setNewDeptId] = useState('DEPT-GRANTS');
  const [newStaffId, setNewStaffId] = useState('STF-003');
  const [newPriority, setNewPriority] = useState<OrgTaskPriority>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('2026-11-15');
  const [newApprovalRequired, setNewApprovalRequired] = useState(false);

  // Comment Input
  const [commentText, setCommentText] = useState('');

  const departments = masterAdminService.getDepartments();
  const staffMembers = masterAdminService.getStaffMembers();

  const reloadTasks = () => {
    setTasks(masterAdminService.getTasks());
    if (selectedTask) {
      const refreshed = masterAdminService.getTasks().find((t) => t.id === selectedTask.id);
      setSelectedTask(refreshed || null);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const res = masterAdminService.createTask(
      {
        title: newTitle,
        description: newDescription,
        departmentId: newDeptId,
        assignedStaffId: newStaffId,
        priority: newPriority,
        dueDate: newDueDate,
        approvalRequired: newApprovalRequired,
      },
      currentUser.role,
      currentUser.name
    );

    if (res.success) {
      setActionNotice({ type: 'success', message: `Task '${newTitle}' created successfully.` });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      reloadTasks();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to create task.' });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: OrgTaskStatus) => {
    const res = masterAdminService.updateTaskStatus(taskId, newStatus, currentUser.role, currentUser.name);
    if (res.success) {
      setActionNotice({ type: 'success', message: `Task status updated to ${newStatus}.` });
      reloadTasks();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to update task status.' });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    const res = masterAdminService.addTaskComment(
      selectedTask.id,
      currentUser.id || 'STF-001',
      currentUser.name,
      currentUser.role,
      commentText
    );

    if (res.success) {
      setCommentText('');
      reloadTasks();
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to add comment.' });
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedStaffName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || t.departmentId === deptFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-800" />
            <h2 className="text-lg font-bold text-slate-900">Organizational Task Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cross-departmental task assignment, progress tracking, internal staff notes, and leadership review gates
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-800 text-white rounded-lg text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Department Task</span>
        </button>
      </div>

      {actionNotice && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks by title, description, or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Content: Tasks List + Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Cards Column */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              No organizational tasks matching current filter criteria.
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isSelected = selectedTask?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className={`p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'border-teal-700 shadow-sm ring-1 ring-teal-700' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          t.priority === 'CRITICAL' || t.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{t.title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'REVIEW_REQUIRED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{t.description}</p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span>Dept: <strong className="text-slate-700">{t.departmentName}</strong></span>
                      <span>Assigned: <strong className="text-slate-700">{t.assignedStaffName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Due {t.dueDate}
                      </span>
                      {t.internalComments.length > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-teal-800">
                          <MessageSquare className="w-3 h-3" /> {t.internalComments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Task Details & Comments Sidebar */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{selectedTask.id}</span>
                  <span>Created {selectedTask.createdAt.split('T')[0]}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedTask.description}</p>
              </div>

              {/* Status Switcher Buttons */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Update Workflow Status
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => handleStatusChange(selectedTask.id, 'IN_PROGRESS')}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-medium border border-blue-200"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTask.id, 'REVIEW_REQUIRED')}
                    className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded font-medium border border-purple-200"
                  >
                    Request Review
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTask.id, 'COMPLETED')}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-medium border border-emerald-200 col-span-2"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>

              {/* Internal Comments Thread */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-teal-800" />
                    Internal Staff Notes ({selectedTask.internalComments.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTask.internalComments.length === 0 ? (
                    <div className="text-[11px] text-slate-400 italic">No notes logged yet.</div>
                  ) : (
                    selectedTask.internalComments.map((c) => (
                      <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span className="font-bold text-slate-700">{c.authorName}</span>
                          <span>{c.timestamp.split('T')[0]}</span>
                        </div>
                        <p className="text-slate-800 text-[11px]">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-1.5 pt-2">
                  <input
                    type="text"
                    placeholder="Log internal note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 p-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a task to review details, update workflow status, or log internal comments.
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-800" />
                Create New Organizational Task
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prepare Q4 Financial Stewardship Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed instructions and deliverables..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assign Staff</label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.staffId}>
                        {s.name} ({s.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as OrgTaskPriority)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqAppr"
                  checked={newApprovalRequired}
                  onChange={(e) => setNewApprovalRequired(e.target.checked)}
                  className="rounded text-teal-800"
                />
                <label htmlFor="reqAppr" className="text-slate-700 font-medium">
                  Requires Leadership Approval to Complete
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
