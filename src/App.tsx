/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform Main Application Entry
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Donation } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { WebsiteConciergeModal } from './components/WebsiteConciergeModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MediaLibraryModal } from './components/MediaLibraryModal';
import { PublicWebsiteView } from './views/PublicWebsiteView';
import { CommunityPortalView } from './views/CommunityPortalView';
import { DonorPortalView } from './views/DonorPortalView';
import { StaffCommandCenterView } from './views/StaffCommandCenterView';
import { GovernancePortalView } from './views/GovernancePortalView';
import { AIWorkforceView } from './views/AIWorkforceView';
import { ReadinessChecklistView } from './views/ReadinessChecklistView';
import { MasterAdministratorView } from './views/MasterAdministratorView';
import { ClientDevelopmentPortalView } from './views/ClientDevelopmentPortalView';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FA] text-[#263238] selection:bg-teal-100 selection:text-teal-900">
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
      <main className="flex-1">
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
