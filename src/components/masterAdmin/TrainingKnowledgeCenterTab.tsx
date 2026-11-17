/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Training & Knowledge Center Tab (M33.10)
 * Staff and volunteer onboarding modules, safeguarding certifications, and SOP knowledge articles.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  FileCheck2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Lock,
  Award,
} from 'lucide-react';
import {
  trainingKnowledgeService,
} from '../../services/trainingKnowledgeService';
import {
  TrainingModuleRecord,
  TrainingAssignmentRecord,
  KnowledgeArticleRecord,
} from '../../types/phase33';
import { User } from '../../types';

interface TrainingKnowledgeCenterTabProps {
  currentUser: User;
}

export const TrainingKnowledgeCenterTab: React.FC<TrainingKnowledgeCenterTabProps> = ({
  currentUser,
}) => {
  const [modules, setModules] = useState<TrainingModuleRecord[]>(
    trainingKnowledgeService.getModules()
  );
  const [assignments, setAssignments] = useState<TrainingAssignmentRecord[]>(
    trainingKnowledgeService.getAssignments()
  );
  const [articles, setArticles] = useState<KnowledgeArticleRecord[]>(
    trainingKnowledgeService.getArticles()
  );
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'assignments' | 'articles'>('modules');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.articleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-gold bg-phumulani-charcoal px-3 py-0.5 rounded-full border border-phumulani-teal mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-phumulani-gold" />
            <span>TRAINING & ORGANIZATIONAL KNOWLEDGE</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Training & Knowledge Center</h2>
          <p className="text-xs text-phumulani-cream max-w-2xl mt-1">
            Standard operating procedures, mandatory safeguarding compliance tracks, trauma-informed care modules, and human-verified completion certifications.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('modules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'modules' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Modules ({modules.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assignments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'assignments' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Certifications ({assignments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('articles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'articles' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            SOPs & Policies ({articles.length})
          </button>
        </div>
      </div>

      {/* MODULES */}
      {activeSubTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                      {mod.id}
                    </span>
                    <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                      {mod.track}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-phumulani-charcoal mt-1">{mod.title}</h4>
                </div>

                {mod.isMandatoryForClearance && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-phumulani-cream text-phumulani-earth border border-phumulani-earth">
                    Mandatory
                  </span>
                )}
              </div>

              <p className="text-xs text-phumulani-charcoal">{mod.description}</p>

              <div className="pt-3 border-t border-phumulani-cream flex justify-between items-center text-xs text-phumulani-charcoal">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-phumulani-charcoal" />
                  <span>{mod.durationMinutes} mins</span>
                </span>
                <span>Passing Threshold: <strong>{mod.passingScorePercent}%</strong></span>
                <span>Lead: {mod.authorStaffName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGNMENTS & CERTIFICATIONS */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-phumulani-charcoal">Training Completion & Certification Ledger</h3>
              <p className="text-xs text-phumulani-charcoal">Human supervisor verified training completions for statutory safeguarding compliance.</p>
            </div>
            <span className="text-[10px] text-phumulani-charcoal bg-phumulani-cream border border-phumulani-gold px-2.5 py-1 rounded-full font-semibold">
              Certified by Human Supervisor (No AI Certification)
            </span>
          </div>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div key={asg.id} className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-phumulani-earth">{asg.id}</span>
                    <span className="text-xs font-bold text-phumulani-charcoal">{asg.userName}</span>
                    <span className="text-[10px] bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded uppercase">{asg.userRole}</span>
                  </div>
                  <div className="text-xs text-phumulani-charcoal font-medium">{asg.moduleTitle}</div>
                  {asg.certificateNumber && (
                    <div className="text-[11px] font-mono text-phumulani-charcoal flex items-center gap-1">
                      <Award className="w-3 h-3 text-phumulani-earth" />
                      <span>{asg.certificateNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-phumulani-charcoal">Score: {asg.scoreAchieved}%</div>
                    <div className="text-[10px] text-phumulani-charcoal">
                      {asg.completedAt ? new Date(asg.completedAt).toLocaleDateString() : 'In Progress'}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      asg.status === 'COMPLETED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                        : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                    }`}
                  >
                    {asg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLES & SOPS */}
      {activeSubTab === 'articles' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-phumulani-charcoal absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search standard operating procedures, policies, and guidelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-phumulani-cream rounded-xl focus:outline-hidden focus:ring-1 focus:ring-phumulani-earth"
            />
          </div>

          <div className="space-y-3">
            {filteredArticles.map((art) => (
              <div key={art.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                        {art.articleCode}
                      </span>
                      <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                        Category: {art.category}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-phumulani-charcoal mt-1">{art.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-phumulani-charcoal">Version {art.version}.0</span>
                </div>

                <p className="text-xs text-phumulani-charcoal font-medium">{art.summary}</p>
                <div className="text-xs text-phumulani-charcoal bg-phumulani-cream p-3 rounded-lg border border-phumulani-cream whitespace-pre-line font-mono text-[11px]">
                  {art.content}
                </div>

                <div className="pt-2 border-t border-phumulani-cream flex justify-between items-center text-[11px] text-phumulani-charcoal">
                  <span>Authorized for: {art.targetRoleAccess.join(', ')}</span>
                  <span>Approved by Executive Director: {art.approvedByDirector ? 'Yes' : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
