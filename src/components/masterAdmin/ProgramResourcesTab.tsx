/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 25 Program Resource Management
 * M25.08: Resource Allocation, Materials, Facilities & Executive Approval Controls
 */

import React, { useState, useEffect } from 'react';
import { ProgramResourceRequest, ResourceCategory, ResourceStatus } from '../../types/communityPrograms';
import { CommunityProgramsService } from '../../services/communityProgramsService';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Box,
  Truck,
  Building,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  currentUserRole: string;
  currentUserName: string;
}

export const ProgramResourcesTab: React.FC<Props> = ({ currentUserRole, currentUserName }) => {
  const commService = CommunityProgramsService.getInstance();
  const [resources, setResources] = useState<ProgramResourceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programName, setProgramName] = useState('Immigrant Women Career Pathways & Workforce Development');
  const [category, setCategory] = useState<ResourceCategory>('EQUIPMENT');
  const [resourceName, setResourceName] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [unitOfMeasure, setUnitOfMeasure] = useState('Units');
  const [requiredByDate, setRequiredByDate] = useState('2026-11-15');
  const [costUSD, setCostUSD] = useState(500);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setResources(commService.getResourceRequests());
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) {
      setFeedbackNotice({ type: 'error', message: 'Resource name is required.' });
      return;
    }

    const res = commService.createResourceRequest(
      {
        programId: 'PROG-001',
        programName,
        resourceCategory: category,
        resourceName: resourceName.trim(),
        quantityRequested: Number(quantity),
        unitOfMeasure: unitOfMeasure.trim() || 'Units',
        requiredByDate,
        requestOwnerId: 'STF-002',
        requestOwnerName: currentUserName,
        estimatedCostUSD: Number(costUSD) || 0,
      },
      currentUserName,
      currentUserRole
    );

    if (res.success && res.request) {
      setFeedbackNotice({
        type: 'success',
        message: `Resource request for "${res.request.resourceName}" submitted for executive approval.`,
      });
      setIsModalOpen(false);
      setResourceName('');
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Failed to submit resource request.' });
    }
  };

  const handleReviewResource = (id: string, approved: boolean) => {
    const res = commService.reviewResourceRequest(id, approved, currentUserRole, currentUserName);
    if (res.success) {
      setFeedbackNotice({
        type: 'success',
        message: approved ? 'Resource allocation authorized.' : 'Resource request returned.',
      });
      refreshData();
    } else {
      setFeedbackNotice({ type: 'error', message: res.error || 'Review action failed.' });
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestOwnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (cat: ResourceCategory) => {
    switch (cat) {
      case 'EQUIPMENT':
        return <Box className="w-4 h-4 text-phumulani-earth" />;
      case 'TRANSPORTATION':
        return <Truck className="w-4 h-4 text-phumulani-earth" />;
      case 'FACILITIES':
        return <Building className="w-4 h-4 text-phumulani-earth" />;
      default:
        return <Layers className="w-4 h-4 text-phumulani-earth" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-phumulani-cream shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2.5 py-0.5 rounded-full border border-phumulani-teal uppercase">
            M25.08 · OPERATIONAL RESOURCE ALLOCATION
          </span>
          <h2 className="text-xl font-bold font-serif text-phumulani-charcoal mt-1">Program Resource Management</h2>
          <p className="text-phumulani-charcoal text-xs mt-0.5">
            Track equipment, dry pantry transport, community facilities, and materials with separation of duties and executive sign-off.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Request Program Resource</span>
        </button>
      </div>

      {/* FEEDBACK NOTICE */}
      {feedbackNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackNotice.type === 'success'
              ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
              : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-phumulani-charcoal font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-phumulani-cream shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-phumulani-charcoal" />
          <input
            type="text"
            placeholder="Search resource, program, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-phumulani-cream bg-phumulani-cream focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-phumulani-earth"
          />
        </div>
        <button onClick={refreshData} className="p-1.5 rounded-lg border border-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* RESOURCES TABLE */}
      <div className="bg-white rounded-2xl border border-phumulani-cream shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-phumulani-cream border-b border-phumulani-cream text-[10px] uppercase font-bold text-phumulani-charcoal">
              <tr>
                <th className="py-3 px-4">Resource Ref</th>
                <th className="py-3 px-4">Category & Item</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Quantity & Est. Cost</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-phumulani-cream text-phumulani-charcoal">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-phumulani-cream transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-phumulani-charcoal">{res.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(res.resourceCategory)}
                      <span className="font-bold text-phumulani-charcoal">{res.resourceName}</span>
                    </div>
                    <div className="text-[10px] text-phumulani-charcoal mt-0.5">{res.resourceCategory}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-phumulani-earth line-clamp-1">{res.programName}</span>
                    <span className="text-[10px] text-phumulani-charcoal">Owner: {res.requestOwnerName}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-phumulani-charcoal">
                      {res.quantityRequested} {res.unitOfMeasure}
                    </span>
                    <div className="text-[10px] text-phumulani-earth font-semibold">
                      ${res.estimatedCostUSD?.toLocaleString() || 0} USD
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-phumulani-charcoal">{res.requiredByDate}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {res.status === 'ALLOCATED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">
                        <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" />
                        <span>Allocated</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReviewResource(res.id, true)}
                          className="px-2.5 py-1 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewResource(res.id, false)}
                          className="px-2.5 py-1 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth border border-phumulani-earth rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST RESOURCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-phumulani-charcoal/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-phumulani-cream max-w-lg w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-phumulani-cream pb-3">
              <div>
                <span className="text-[10px] font-mono text-phumulani-earth font-bold uppercase">Resource Request</span>
                <h3 className="text-base font-bold text-phumulani-charcoal">Request Program Resource</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-phumulani-charcoal hover:text-phumulani-earth font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Refurbished Laptops for Youth STEM Circle"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Resource Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="w-full px-2.5 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream font-medium"
                  >
                    <option value="EQUIPMENT">Equipment & Hardware</option>
                    <option value="TRANSPORTATION">Transportation / Vehicle</option>
                    <option value="FACILITIES">Facilities / Space Reservation</option>
                    <option value="PROGRAM_MATERIALS">Program Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Target Program</label>
                  <select
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream font-medium truncate"
                  >
                    <option value="Immigrant Women Career Pathways & Workforce Development">Workforce Development</option>
                    <option value="Youth STEM Mentorship & Sisterhood Tutoring Circle">Youth Mentorship Circle</option>
                    <option value="Community Food Security & Cultural Nutrition Pantry">Cultural Nutrition Pantry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Unit</label>
                  <input
                    type="text"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Est. Cost ($)</label>
                  <input
                    type="number"
                    value={costUSD}
                    onChange={(e) => setCostUSD(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-phumulani-charcoal mb-1">Required By Date</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream bg-phumulani-cream"
                />
              </div>

              <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-xl text-phumulani-earth text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-phumulani-earth shrink-0 mt-0.5" />
                <span>
                  Resource allocations require executive or finance director approval before expenditure or inventory assignment.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-phumulani-cream">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-phumulani-cream text-phumulani-charcoal font-semibold rounded-xl hover:bg-phumulani-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-phumulani-charcoal hover:bg-phumulani-earth text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
