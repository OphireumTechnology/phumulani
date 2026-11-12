/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform Main Application Entry
 */

import React, { useState, useEffect, Suspense } from 'react';
import { db } from './services/db';
import { Donation, UserRole } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { WebsiteConciergeModal } from './components/WebsiteConciergeModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MediaLibraryModal } from './components/MediaLibraryModal';
import { PublicWebsiteView } from './views/PublicWebsiteView';

const CommunityPortalView = React.lazy(() =>
  import('./views/CommunityPortalView').then((m) => ({ default: m.CommunityPortalView }))
);
const DonorPortalView = React.lazy(() =>
  import('./views/DonorPortalView').then((m) => ({ default: m.DonorPortalView }))
);
const StaffCommandCenterView = React.lazy(() =>
  import('./views/StaffCommandCenterView').then((m) => ({ default: m.StaffCommandCenterView }))
);
const GovernancePortalView = React.lazy(() =>
  import('./views/GovernancePortalView').then((m) => ({ default: m.GovernancePortalView }))
);
const AIWorkforceView = React.lazy(() =>
  import('./views/AIWorkforceView').then((m) => ({ default: m.AIWorkforceView }))
);
const ReadinessChecklistView = React.lazy(() =>
  import('./views/ReadinessChecklistView').then((m) => ({ default: m.ReadinessChecklistView }))
);
const MasterAdministratorView = React.lazy(() =>
  import('./views/MasterAdministratorView').then((m) => ({ default: m.MasterAdministratorView }))
);
const ClientDevelopmentPortalView = React.lazy(() =>
  import('./views/ClientDevelopmentPortalView').then((m) => ({ default: m.ClientDevelopmentPortalView }))
);

const PRIVILEGED_ADMIN_VIEWS = new Set([
  'staff',
  'governance',
  'ai-workforce',
  'readiness',
  'master-admin',
  'production-status',
  'email-command',
  'fundraising',
  'development-ops',
  'client-development',
  'operations',
  'notifications',
]);

function isRoleAuthorizedForView(role: UserRole, view: string): boolean {
  if (view === 'public') return true;
  if (role === 'visitor' || role === 'PUBLIC_VISITOR') {
    return false;
  }
  if (view === 'community' || view === 'donor') {
    return true;
  }
  if (PRIVILEGED_ADMIN_VIEWS.has(view)) {
    return ![
      'community_member',
      'COMMUNITY_MEMBER',
      'volunteer',
      'VOLUNTEER_APPLICANT',
      'APPROVED_VOLUNTEER',
      'donor',
      'DONOR',
      'sponsor',
    ].includes(role);
  }
  return true;
}

export default function App() {
  const [dbState, setDbState] = useState(db.getState());
  const [activeView, setActiveView] = useState<string>('public');
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeReceiptDonation, setActiveReceiptDonation] = useState<Donation | null>(null);
  const [isMediaRegistryOpen, setIsMediaRegistryOpen] = useState(false);

  // Subscribe to reactive database changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setDbState({ ...db.getState() });
    });
    return () => unsubscribe();
  }, []);

  const hasViewAccess = isRoleAuthorizedForView(dbState.currentUser.role, activeView);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#14213D] selection:bg-teal-100 selection:text-teal-900">
      {/* 0. ACCESSIBILITY: SKIP TO MAIN CONTENT ANCHOR (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#104F57] focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300 font-semibold text-xs"
      >
        Skip to Main Content
      </a>

      {/* 1. DEMO & ROLE SWITCHER TOOLBAR */}
      <RoleSwitcherBar
        currentUser={dbState.currentUser}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. GLOBAL PUBLIC HEADER (when viewing public website) */}
      {activeView === 'public' && (
        <Header
          currentUser={dbState.currentUser}
          activeView={activeView}
          onViewChange={(v) => {
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentLang={currentLang}
          onLangChange={setCurrentLang}
        />
      )}

      {/* 3. ACTIVE APPLICATION PORTAL VIEW */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {!hasViewAccess ? (
          <div className="max-w-xl mx-auto my-20 p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#104F57]">Portal Access Restricted</h2>
            <p className="text-sm text-slate-600">
              Your active session role ({dbState.currentUser.role}) is not authorized to access this internal portal.
            </p>
            <button
              onClick={() => setActiveView('public')}
              className="px-5 py-2.5 bg-[#104F57] text-white rounded-lg text-xs font-bold hover:bg-[#0d3f46] cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24 text-sm font-medium text-slate-500">
                Loading portal workspace...
              </div>
            }
          >
            {activeView === 'public' && (
              <PublicWebsiteView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                onOpenReceipt={(donation) => setActiveReceiptDonation(donation)}
                onOpenMediaRegistry={() => setIsMediaRegistryOpen(true)}
              />
            )}

            {activeView === 'community' && (
              <CommunityPortalView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
              />
            )}

            {activeView === 'donor' && (
              <DonorPortalView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                onOpenReceipt={(donation) => setActiveReceiptDonation(donation)}
              />
            )}

            {activeView === 'staff' && (
              <StaffCommandCenterView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                onOpenReceipt={(donation) => setActiveReceiptDonation(donation)}
                onOpenMediaRegistry={() => setIsMediaRegistryOpen(true)}
              />
            )}

            {activeView === 'governance' && (
              <GovernancePortalView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
              />
            )}

            {activeView === 'ai-workforce' && (
              <AIWorkforceView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
              />
            )}

            {activeView === 'readiness' && (
              <ReadinessChecklistView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
              />
            )}

            {activeView === 'master-admin' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="overview"
              />
            )}

            {activeView === 'production-status' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="production_status"
              />
            )}

            {activeView === 'email-command' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="email_command_center"
              />
            )}

            {activeView === 'fundraising' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="fundraising_command_center"
              />
            )}

            {activeView === 'development-ops' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="development_operations"
              />
            )}

            {activeView === 'client-development' && (
              <ClientDevelopmentPortalView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
              />
            )}

            {activeView === 'operations' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="operations_command"
              />
            )}

            {activeView === 'notifications' && (
              <MasterAdministratorView
                currentUser={dbState.currentUser}
                onViewChange={setActiveView}
                initialTab="internal_notifications"
              />
            )}
          </Suspense>
        )}
      </main>

      {/* 4. INTERACTIVE WEBSITE CONCIERGE (AGENT A10) */}
      <WebsiteConciergeModal />

      {/* 5. OFFICIAL 501(C)(3) TAX RECEIPT PRINT/VIEW MODAL */}
      <ReceiptModal
        donation={activeReceiptDonation}
        onClose={() => setActiveReceiptDonation(null)}
      />

      {/* 5.5 AUTHENTIC MEDIA PRESERVATION & SAFEGUARDING REGISTRY MODAL */}
      <MediaLibraryModal
        isOpen={isMediaRegistryOpen}
        onClose={() => setIsMediaRegistryOpen(false)}
      />

      {/* 6. GLOBAL FOOTER (on public view) */}
      {activeView === 'public' && (
        <Footer
          onViewChange={setActiveView}
          onOpenMediaRegistry={() => setIsMediaRegistryOpen(true)}
        />
      )}
    </div>
  );
}
