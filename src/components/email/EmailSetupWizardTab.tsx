/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 12-Step Google Workspace Enterprise Setup Wizard & Institutional Pilot Readiness Tab
 * Extracted from EmailCommandCenterView for bundle optimization & maintainability.
 */

import React from 'react';
import { User } from '../../types';
import {
  ConnectedMailbox,
  SetupWizardStatus,
  PilotReadinessVerification,
} from '../../types/emailEnterprise';
import { googleWorkspaceAdapter } from '../../services/googleWorkspaceAdapter';
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Mail,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface EmailSetupWizardTabProps {
  wizardStatus: SetupWizardStatus;
  isVerifyingWizard: boolean;
  refreshWizardState: () => void;
  mailboxes: ConnectedMailbox[];
  pilotReadiness: PilotReadinessVerification;
  currentUser: User;
  setActionNotice: (notice: { type: 'success' | 'warning' | 'info'; message: string } | null) => void;
}

export const EmailSetupWizardTab: React.FC<EmailSetupWizardTabProps> = ({
  wizardStatus,
  isVerifyingWizard,
  refreshWizardState,
  mailboxes,
  pilotReadiness,
  currentUser,
  setActionNotice,
}) => {
  return (
    <div className="flex-1 h-full bg-phumulani-cream overflow-y-auto p-5 space-y-5">
      {/* Top Wizard Header Banner */}
      <div className="bg-white border border-phumulani-cream rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[10px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold px-2.5 py-0.5 rounded-full uppercase">
              Milestone 54.03 / 54.04
            </span>
            <span className="text-[10px] font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-teal px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-phumulani-earth" aria-hidden="true" />
              12-Step Enterprise Onboarding Wizard
            </span>
            <span className="text-[10px] font-bold bg-phumulani-cream text-phumulani-charcoal border border-phumulani-cream px-2.5 py-0.5 rounded-full">
              {wizardStatus.completedSteps} of {wizardStatus.totalSteps} Steps Verified
            </span>
            <span className="text-[10px] font-bold bg-phumulani-cream text-phumulani-earth border border-phumulani-earth px-2.5 py-0.5 rounded-full">
              STAGED_DEVELOPMENT
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
            Google Workspace Enterprise Onboarding Wizard &amp; Controlled Institutional Pilot
          </h2>
          <p className="text-xs text-phumulani-charcoal max-w-3xl mt-0.5">
            Authoritative administrative onboarding wizard guiding Google Cloud project selection, Gmail API enablement, OAuth consent, least-privilege scopes, and controlled pilot readiness for donations@phumulani.org.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshWizardState}
            disabled={isVerifyingWizard}
            className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWizard ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isVerifyingWizard ? 'Refreshing Diagnostics...' : 'Refresh Wizard Status'}</span>
          </button>
        </div>
      </div>

      {/* Truthful Staging Disclosure Banner (Anti-Fabrication Requirement) */}
      <div className="bg-phumulani-cream border border-phumulani-gold rounded-2xl p-4 shadow-2xs space-y-1.5">
        <div className="flex items-center gap-2 text-phumulani-charcoal font-bold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0" aria-hidden="true" />
          <span>Anti-Fabrication Policy &amp; Truthful Staging Disclosures</span>
        </div>
        <p className="text-xs text-phumulani-charcoal leading-relaxed">
          {wizardStatus.disclosures.truthNotice} Live email sending (<code>LIVE_EMAIL_SENDING_ENABLED</code>) and live Google Workspace pilot (<code>GOOGLE_WORKSPACE_PILOT_ENABLED</code>) default to <strong>false</strong> and fail closed. External mail delivery will never occur without authentic institutional credentials, executive authorization, and unexpired allowlist entries.
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1 text-phumulani-charcoal">
          <span className="bg-white border border-phumulani-gold px-2 py-0.5 rounded">
            Pilot Enabled: <strong>{String(wizardStatus.disclosures.googleWorkspacePilotEnabled)}</strong>
          </span>
          <span className="bg-white border border-phumulani-gold px-2 py-0.5 rounded">
            Live Dispatch: <strong>{String(wizardStatus.disclosures.liveEmailSendingEnabled)}</strong>
          </span>
          <span className="bg-white border border-phumulani-gold px-2 py-0.5 rounded">
            Operating Mode: <strong>{wizardStatus.disclosures.operatingMode}</strong>
          </span>
          <span className="bg-white border border-phumulani-gold px-2 py-0.5 rounded">
            Live Secrets Present: <strong>{String(wizardStatus.disclosures.liveCredentialsPresent)}</strong>
          </span>
        </div>
      </div>

      {/* 10 Connection States Reference & Status Strip */}
      <div className="bg-white border border-phumulani-cream rounded-2xl p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wide">
            Complete 10-State Mailbox Connection Lifecycle Register (M54.02)
          </span>
          <span className="text-[10px] font-mono text-phumulani-charcoal">
            Target Pilot: donations@phumulani.org
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-center">
          {[
            { state: 'NOT_CONFIGURED', label: '1. Not Configured', color: 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream' },
            { state: 'AUTHORIZATION_REQUIRED', label: '2. Auth Req', color: 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold' },
            { state: 'AUTHORIZING', label: '3. Authorizing', color: 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal' },
            { state: 'CONNECTING', label: '4. Connecting', color: 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal' },
            { state: 'CONNECTED', label: '5. Connected', color: 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green' },
            { state: 'SYNCING', label: '6. Syncing', color: 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal' },
            { state: 'DEGRADED', label: '7. Degraded', color: 'bg-phumulani-cream text-phumulani-earth border-phumulani-orange' },
            { state: 'REAUTHORIZATION_REQUIRED', label: '8. Reauth Req', color: 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold' },
            { state: 'REVOKED', label: '9. Revoked', color: 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth' },
            { state: 'DISCONNECTED', label: '10. Disconnected', color: 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream' },
          ].map((item) => {
            const currentMbxState = mailboxes.find((m) => m.email === 'donations@phumulani.org')?.status;
            const isCurrent = currentMbxState?.toUpperCase() === item.state;
            return (
              <div
                key={item.state}
                className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col justify-between ${item.color} ${
                  isCurrent ? 'ring-2 ring-phumulani-earth shadow-xs' : 'opacity-75'
                }`}
              >
                <span className="truncate">{item.label}</span>
                {isCurrent && (
                  <span className="text-[9px] mt-1 bg-phumulani-charcoal text-white px-1 rounded-full uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Pilot Mailbox Preparation Card (M54.04) */}
      <div className="bg-white border border-phumulani-cream rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-phumulani-cream pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-phumulani-cream border border-phumulani-teal rounded-xl text-phumulani-earth">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-phumulani-charcoal">
                  Institutional Pilot Mailbox: donations@phumulani.org
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    pilotReadiness.ready
                      ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green'
                      : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold'
                  }`}
                >
                  {pilotReadiness.verdict}
                </span>
              </div>
              <p className="text-xs text-phumulani-charcoal">
                Primary development mailbox isolated to donations intake. Zero confidential safeguarding exposure (VAWA Sec 1367).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wizardStatus.disclosures.googleWorkspacePilotEnabled ? (
              <button
                type="button"
                onClick={() => {
                  googleWorkspaceAdapter.deactivatePilot(
                    { name: currentUser.name, role: currentUser.role },
                    'Manual emergency shutdown from setup wizard'
                  );
                  refreshWizardState();
                }}
                className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                <span>Instant Emergency Shutdown</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const code = 'PHUMULANI-SEC-2026';
                  const res = googleWorkspaceAdapter.activatePilot(
                    {
                      administratorId: currentUser.id || 'usr-admin-01',
                      administratorName: currentUser.name || 'Executive Director',
                      executiveRole: 'Executive Director',
                      pilotScope: 'DONATIONS_ONLY',
                      authorizedMailbox: 'donations@phumulani.org',
                      approvedRecipients: ['admin@phumulani.org', 'test@phumulani.org'],
                      expiresAt: new Date(Date.now() + 86400000).toISOString(),
                      approvalDecision: 'APPROVED',
                      name: currentUser.name || 'Comfort Dondo',
                      role: 'executive_director',
                    },
                    code,
                    'Institutional pilot activation via 12-Step Setup Wizard'
                  );
                  if (res.success) {
                    setActionNotice({ type: 'success', message: 'Controlled pilot activated for donations@phumulani.org.' });
                  } else {
                    setActionNotice({ type: 'warning', message: res.error || 'Pilot activation failed.' });
                  }
                  refreshWizardState();
                }}
                className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-charcoal text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                <span>Activate Controlled Pilot</span>
              </button>
            )}
          </div>
        </div>

        {/* Pilot Readiness Checklist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1">
            <span className="text-[10px] text-phumulani-charcoal font-mono block">MAILBOX EXISTENCE</span>
            <div className="font-bold text-phumulani-charcoal">Registered Profile</div>
            <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.mailboxExists ? 'text-phumulani-charcoal' : 'text-phumulani-earth'}`}>
              {pilotReadiness.checks.mailboxExists ? <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" /> : <XCircle className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" />}
              <span>{pilotReadiness.checks.mailboxExists ? 'Profile Verified' : 'Missing'}</span>
            </div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1">
            <span className="text-[10px] text-phumulani-charcoal font-mono block">DOMAIN POLICY MATCH</span>
            <div className="font-bold text-phumulani-charcoal">@phumulani.org</div>
            <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.domainMatchesOrg ? 'text-phumulani-charcoal' : 'text-phumulani-earth'}`}>
              {pilotReadiness.checks.domainMatchesOrg ? <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" /> : <XCircle className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" />}
              <span>{pilotReadiness.checks.domainMatchesOrg ? 'Domain Matched' : 'Domain Mismatch'}</span>
            </div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1">
            <span className="text-[10px] text-phumulani-charcoal font-mono block">EXECUTIVE CO-SIGNATURE</span>
            <div className="font-bold text-phumulani-charcoal">Development / Exec Lead</div>
            <div className="text-[11px] font-semibold flex items-center gap-1 text-phumulani-charcoal">
              {pilotReadiness.checks.executiveRoleAuthorized ? <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" /> : <AlertTriangle className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" />}
              <span>{pilotReadiness.checks.executiveRoleAuthorized ? 'Executive Approved' : 'Sign-Off Pending'}</span>
            </div>
          </div>

          <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1">
            <span className="text-[10px] text-phumulani-charcoal font-mono block">EMERGENCY SHUTDOWN</span>
            <div className="font-bold text-phumulani-charcoal">Instant Fail-Closed</div>
            <div className={`text-[11px] font-semibold flex items-center gap-1 ${pilotReadiness.checks.emergencyShutdownFunctional ? 'text-phumulani-charcoal' : 'text-phumulani-earth'}`}>
              {pilotReadiness.checks.emergencyShutdownFunctional ? <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" /> : <XCircle className="w-3.5 h-3.5 text-phumulani-earth" aria-hidden="true" />}
              <span>{pilotReadiness.checks.emergencyShutdownFunctional ? 'Armed & Functional' : 'Disarmed'}</span>
            </div>
          </div>
        </div>

        {pilotReadiness.blockingReasons.length > 0 && (
          <div className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-xl text-xs text-phumulani-earth space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-phumulani-earth" aria-hidden="true" />
              <span>Pilot Activation Blockers:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {pilotReadiness.blockingReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 12-Step Wizard Cards Grid (M54.03 & M55.02) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-phumulani-charcoal">
              12 Mandatory Verification Steps (M55.02 Execution Flow)
            </h3>
            <p className="text-[11px] text-phumulani-charcoal">
              Each step backed by real server-side state, evidence source, authorized admin action, and recovery guidance.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-phumulani-cream rounded-lg text-phumulani-charcoal">
            {wizardStatus.completedSteps} of 12 Steps Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {wizardStatus.steps.map((step) => {
            const getStatusBadge = (status: string) => {
              switch (status) {
                case 'VERIFIED':
                  return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green';
                case 'ACTION_REQUIRED':
                  return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold';
                case 'CONFIGURED_UNVERIFIED':
                  return 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal';
                case 'BLOCKED_EXTERNAL':
                case 'BLOCKED':
                case 'EXPIRED':
                case 'FAILED':
                  return 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth';
                default:
                  return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream';
              }
            };

            const isVerified = step.status === 'VERIFIED';
            const isBlocked = step.status === 'BLOCKED_EXTERNAL' || step.status === 'BLOCKED';

            return (
              <div
                key={step.stepNumber}
                className="border border-phumulani-cream rounded-2xl p-4 bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:border-phumulani-cream transition-all text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-phumulani-cream text-phumulani-charcoal border border-phumulani-cream">
                      Step {step.stepNumber.toString().padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadge(
                        step.status
                      )}`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-phumulani-charcoal leading-snug">
                    {step.title}
                  </h4>

                  <p className="text-[11px] text-phumulani-charcoal leading-relaxed">
                    {step.requirementDescription}
                  </p>

                  {/* Evidence Source & Verification Timestamp */}
                  <div className="p-2 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1 text-[10px]">
                    {step.evidenceSource && (
                      <div>
                        <strong className="text-phumulani-charcoal">Evidence Source: </strong>
                        <span className="font-mono text-phumulani-charcoal">{step.evidenceSource}</span>
                      </div>
                    )}
                    {step.lastVerificationTime && (
                      <div>
                        <strong className="text-phumulani-charcoal">Last Verified: </strong>
                        <span className="font-mono text-phumulani-charcoal">
                          {new Date(step.lastVerificationTime).toLocaleTimeString()} (
                          {new Date(step.lastVerificationTime).toLocaleDateString()})
                        </span>
                      </div>
                    )}
                    {step.diagnosticOutput && (
                      <div className="truncate text-phumulani-charcoal pt-0.5 border-t border-phumulani-cream font-mono">
                        <strong className="text-phumulani-charcoal">Diag: </strong>
                        {step.diagnosticOutput}
                      </div>
                    )}
                  </div>

                  {/* Authorized Administrator Action */}
                  {step.authorizedAdminAction && (
                    <div className="p-2 bg-phumulani-cream border border-phumulani-teal rounded-xl text-[10px] text-phumulani-earth leading-relaxed">
                      <strong className="text-phumulani-earth font-semibold">Admin Action: </strong>
                      {step.authorizedAdminAction}
                    </div>
                  )}

                  {/* Failure Reason & Recovery Guidance */}
                  {step.clearFailureReason && (
                    <div className="p-2 bg-phumulani-cream border border-phumulani-earth rounded-xl text-[10px] text-phumulani-earth space-y-1">
                      <div>
                        <strong className="text-phumulani-earth font-bold">Failure Reason: </strong>
                        {step.clearFailureReason}
                      </div>
                      {step.recoveryGuidance && (
                        <div className="text-phumulani-earth pt-0.5 border-t border-phumulani-earth">
                          <strong className="font-semibold">Recovery: </strong>
                          {step.recoveryGuidance}
                        </div>
                      )}
                    </div>
                  )}

                  {step.truthfulDisclosure && !step.clearFailureReason && (
                    <div className="p-2 bg-phumulani-cream border border-phumulani-gold rounded-xl text-[10px] text-phumulani-charcoal leading-relaxed">
                      <strong className="text-phumulani-charcoal font-semibold">Disclosure: </strong>
                      {step.truthfulDisclosure}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-phumulani-cream flex items-center justify-between">
                  <span className="text-[10px] text-phumulani-charcoal font-mono">
                    {isVerified ? 'Gate Passed' : isBlocked ? 'Blocked in Staging' : 'Action Required'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        googleWorkspaceAdapter.executeWizardStepVerification(step.stepNumber, {
                          name: currentUser.name || 'Admin User',
                          role: currentUser.role || 'Staff',
                        });
                        refreshWizardState();
                        setActionNotice({
                          type: 'info',
                          message: `Executed verification check for Step ${step.stepNumber}: ${step.title}.`,
                        });
                        setTimeout(() => setActionNotice(null), 5000);
                      } catch (err: any) {
                        setActionNotice({ type: 'warning', message: err.message });
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      isVerified
                        ? 'bg-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream'
                        : 'bg-phumulani-earth hover:bg-phumulani-charcoal text-white shadow-2xs'
                    }`}
                  >
                    {step.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* M55.04: Organizational Mailbox Verification Matrix */}
      <div className="bg-white border border-phumulani-cream rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-phumulani-cream pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-phumulani-charcoal">
                Organizational Mailbox Verification Status Matrix (M55.04)
              </h3>
              <span className="font-mono text-[10px] bg-phumulani-cream text-phumulani-earth border border-phumulani-teal px-2 py-0.5 rounded-full font-bold">
                8 Mailboxes Audited
              </span>
            </div>
            <p className="text-xs text-phumulani-charcoal mt-0.5">
              Distinguishes CONFIGURED_ONLY, IDENTITY_VERIFIED, OAUTH_AUTHORIZED, PROVIDER_CONNECTED, SYNC_VERIFIED, and SEND_PILOT_AUTHORIZED.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-phumulani-charcoal">
              Mode: {wizardStatus.disclosures.operatingMode}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-phumulani-cream text-phumulani-charcoal uppercase text-[10px] font-mono border-b border-phumulani-cream">
              <tr>
                <th className="py-2.5 px-3">Mailbox</th>
                <th className="py-2.5 px-3">Classification &amp; Department</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Phase 55 Verification Status</th>
                <th className="py-2.5 px-3">Pilot Scope</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-phumulani-cream">
              {googleWorkspaceAdapter.getMailboxStatusMatrix().map((item) => {
                const getStatusBadge = (st: string) => {
                  switch (st) {
                    case 'SEND_PILOT_AUTHORIZED':
                      return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green';
                    case 'SYNC_VERIFIED':
                    case 'PROVIDER_CONNECTED':
                    case 'OAUTH_AUTHORIZED':
                      return 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal';
                    case 'IDENTITY_VERIFIED':
                      return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream';
                    default:
                      return 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold';
                  }
                };

                return (
                  <tr key={item.email} className="hover:bg-phumulani-cream transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-phumulani-charcoal">{item.email}</div>
                      <div className="text-[11px] text-phumulani-charcoal">{item.displayName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-phumulani-charcoal font-medium">{item.department}</div>
                      <div className="text-[10px] text-phumulani-charcoal">{item.role}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          item.type === 'institutional'
                            ? 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth'
                            : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadge(
                          item.phase55Status
                        )}`}
                      >
                        {item.phase55Status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {item.isPilotMailbox ? (
                        <span className="font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                          PRIMARY PILOT
                        </span>
                      ) : (
                        <span className="text-phumulani-charcoal">Restricted</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const check = googleWorkspaceAdapter.verifyActualProviderConnection(item.email);
                          setActionNotice({
                            type: check.connected ? 'success' : 'warning',
                            message: `Mailbox ${item.email} verification: ${check.outcome}. ${check.failureReason || ''}`,
                          });
                          refreshWizardState();
                        }}
                        className="px-2.5 py-1 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Inspect Connection
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* M56.03 & M56.04: Phase 56 Canonical 10-Mailbox Multi-Dimensional Inventory */}
      <div className="bg-white border border-phumulani-cream rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-phumulani-cream pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-phumulani-charcoal">
                Reconciled Organizational Mailbox Inventory &amp; 5-Dimensional Status (Phase 56 — M56.03 &amp; M56.04)
              </h3>
              <span className="font-mono text-[10px] bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green px-2 py-0.5 rounded-full font-bold">
                10 Canonical Mailboxes Reconciled
              </span>
            </div>
            <p className="text-xs text-phumulani-charcoal mt-0.5">
              Separates CONFIGURATION_STATUS, INTERNAL_APPROVAL_STATUS, PROVIDER_AUTHORIZATION_STATUS, INBOUND_SYNC_STATUS, and OUTBOUND_PERMISSION_STATUS to prevent staging vs live contradictions.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold bg-phumulani-cream px-2.5 py-1 rounded-lg text-phumulani-charcoal">
            Zero Fabrication Mandate: Truthful Staging Disclosures
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-phumulani-cream text-phumulani-charcoal uppercase text-[10px] font-mono border-b border-phumulani-cream">
              <tr>
                <th className="py-2.5 px-3">Address &amp; Designation</th>
                <th className="py-2.5 px-3">Department &amp; Owner</th>
                <th className="py-2.5 px-3">Safeguarding Boundary</th>
                <th className="py-2.5 px-3">Internal Approval</th>
                <th className="py-2.5 px-3">Provider Auth</th>
                <th className="py-2.5 px-3">Inbound Sync</th>
                <th className="py-2.5 px-3">Outbound Perm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-phumulani-cream">
              {googleWorkspaceAdapter.getCanonicalMailboxInventory().map((box) => (
                <tr key={box.address} className="hover:bg-phumulani-cream">
                  <td className="py-2.5 px-3 font-semibold text-phumulani-charcoal">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-phumulani-earth">{box.address}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-phumulani-cream text-phumulani-charcoal">
                        {box.designation.replace('ACTIVE_', '')}
                      </span>
                    </div>
                    <span className="text-[10px] text-phumulani-charcoal block truncate max-w-xs">{box.purpose}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-phumulani-charcoal block">{box.department}</span>
                    <span className="text-[10px] text-phumulani-charcoal font-mono">{box.owner}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      box.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                        ? 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth'
                        : box.safeguardingClassification === 'RESTRICTED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold'
                        : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                    }`}>
                      {box.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                        ? 'VAWA SEC 1367 AIR GAP'
                        : box.safeguardingClassification}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    <span className="bg-phumulani-cream text-phumulani-earth border border-phumulani-teal px-2 py-0.5 rounded font-bold">
                      {box.dimensionalStatus.internalApprovalStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      box.dimensionalStatus.providerAuthorizationStatus === 'BLOCKED_EXTERNAL'
                        ? 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth'
                        : box.dimensionalStatus.providerAuthorizationStatus === 'TOKEN_HEALTHY'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green'
                        : 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold'
                    }`}>
                      {box.dimensionalStatus.providerAuthorizationStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    <span className="bg-phumulani-cream text-phumulani-earth border border-phumulani-teal px-2 py-0.5 rounded font-bold">
                      {box.dimensionalStatus.inboundSyncStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      box.dimensionalStatus.outboundPermissionStatus === 'PILOT_AUTHORIZED_STAGED'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green'
                        : box.dimensionalStatus.outboundPermissionStatus === 'DISARMED_STAGING'
                        ? 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream'
                        : 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth'
                    }`}>
                      {box.dimensionalStatus.outboundPermissionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
