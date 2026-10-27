/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.02 Community Resource Directory Tab
 */

import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, Clock, AlertTriangle, Shield, Search, Globe, Phone, MapPin } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { CommunityResource, ResourceCategory } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const CommunityResourceDirectoryTab: React.FC<Props> = ({ currentUser }) => {
  const [resources, setResources] = useState<CommunityResource[]>(phase34Service.getCommunityResources());
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('FOOD_ASSISTANCE');
  const [serviceDescription, setServiceDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [languages, setLanguages] = useState('English, Somali');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reload = () => {
    setResources(phase34Service.getCommunityResources({
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      search: searchQuery || undefined,
    }));
  };

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      phase34Service.submitCommunityResource(
        {
          title,
          organizationName,
          category,
          serviceDescription,
          publicContact: { phone, website, publicAddress },
          geographicServiceAreas: ['Hennepin County', 'Twin Cities Metro'],
          eligibilityRequirements: eligibility,
          accessibilityFeatures: ['Transit Accessible', 'ADA Compliant'],
          languagesSupported: languages.split(',').map((l) => l.trim()),
          verificationStatus: 'PENDING_REVERIFICATION',
        },
        currentUser.name
      );

      setSubmitSuccess('Resource submitted for staff review and publication.');
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setTitle('');
        setOrganizationName('');
        setServiceDescription('');
        setSubmitSuccess(null);
        reload();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error');
    }
  };

  const handleApprove = (id: string) => {
    phase34Service.reviewCommunityResource(id, 'APPROVE_PUBLISH', currentUser.name, 'Verified active non-confidential community partner.');
    reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                M34.02
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Community Resource Directory
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">
              Verified community partner organizations, public contact details, eligibility criteria, and multilingual service descriptions.
            </p>
          </div>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Resource</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setResources(phase34Service.getCommunityResources({
                  category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
                  search: e.target.value,
                }));
              }}
              placeholder="Search resource name, organization, or language..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setResources(phase34Service.getCommunityResources({
                category: e.target.value !== 'ALL' ? e.target.value : undefined,
                search: searchQuery,
              }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="FOOD_ASSISTANCE">Food Assistance</option>
            <option value="IMMIGRATION_LEGAL">Immigration & Legal</option>
            <option value="EMERGENCY_HOUSING">Emergency Housing Navigation</option>
            <option value="EMPLOYMENT_TRAINING">Workforce & Employment</option>
            <option value="FINANCIAL_COACHING">Financial Coaching</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((res) => (
          <div key={res.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                  {res.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  res.approvalStatus === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {res.approvalStatus}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{res.title}</h3>
                <p className="text-xs font-semibold text-teal-700">{res.organizationName}</p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3">{res.serviceDescription}</p>

              {/* Contact Info */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                {res.publicContact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.publicContact.phone}</span>
                  </div>
                )}
                {res.publicContact.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <a href={res.publicContact.website} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                      {res.publicContact.website}
                    </a>
                  </div>
                )}
                {res.publicContact.publicAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{res.publicContact.publicAddress}</span>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="flex flex-wrap gap-1 pt-1">
                {res.languagesSupported.map((l) => (
                  <span key={l} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Approval Footer for privileged staff */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Reviewed: {res.lastReviewedDate}</span>
              {res.approvalStatus !== 'PUBLISHED' && (
                <button
                  onClick={() => handleApprove(res.id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Approve & Publish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900">Submit Verified Community Resource</h3>
            <p className="text-xs text-slate-600">
              Only public, verified organizational services may be listed. Confidential shelter locations are strictly prohibited.
            </p>

            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs font-medium">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-medium">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitResource} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Immigrant Legal Clinic"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Minnesota Immigrant Law Center"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-800"
                  >
                    <option value="FOOD_ASSISTANCE">Food Assistance</option>
                    <option value="IMMIGRATION_LEGAL">Immigration Legal</option>
                    <option value="EMERGENCY_HOUSING">Emergency Housing Navigation</option>
                    <option value="EMPLOYMENT_TRAINING">Workforce Training</option>
                    <option value="FINANCIAL_COACHING">Financial Coaching</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Public Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(612) 555-0100"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Service Description *</label>
                <textarea
                  required
                  rows={2}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Describe services provided..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
