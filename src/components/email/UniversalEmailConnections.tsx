/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Universal Email Connections Dashboard & Wizard
 * Phase 61 Production-Grade Provider Lifecycle, Evidence Tracking & Governance
 * Grounded in Master Development Directive Phase 61 & Live Email Command Center Directive
 */

import React, { useState, useEffect } from 'react';
import {
  EmailConnectionRecord,
  EmailProviderType,
  AuthMethodType,
  ProviderDiscoveryResult,
  ConnectionHealth,
  ProviderCapabilities,
  ProviderEvidenceRecord,
  NormalizedEmailFolder,
  ConnectorSendingPermission,
} from '../../types/emailConnectors';
import { PROVIDER_DESCRIPTORS } from '../../services/connectors/providerCapabilities';
import { authFetch } from '../../services/sessionTokenStore';
import { phumulaniApiClient } from '../../api/phumulaniApiClient';
import { db } from '../../services/db';

const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type MailboxUIState =
  | 'Not connected'
  | 'Connecting'
  | 'Authorization required'
  | 'Initial synchronization'
  | 'Connected'
  | 'Synchronizing'
  | 'Sync paused'
  | 'Connection error'
  | 'Disconnected';

export function getMailboxUIState(conn: EmailConnectionRecord): MailboxUIState {
  if (conn.authStatus === 'DISCONNECTED' || conn.connectionHealth === 'DISCONNECTED') {
    return 'Disconnected';
  }
  if (conn.syncStatus === ('SYNC_PAUSED' as any) || (conn as any).metadata?.paused) {
    return 'Sync paused';
  }
  if (
    conn.authStatus === 'ERROR' ||
    conn.authStatus === 'AUTHENTICATION_FAILED' ||
    conn.authStatus === 'BLOCKED_EXTERNAL' ||
    conn.authStatus === 'REVOKED' ||
    conn.connectionHealth === 'ERROR' ||
    (conn.syncFailureCount !== undefined && conn.syncFailureCount > 3)
  ) {
    return 'Connection error';
  }
  if (
    conn.authStatus === 'AUTHORIZATION_REQUIRED' ||
    conn.authStatus === 'TOKEN_EXPIRED'
  ) {
    return 'Authorization required';
  }
  if (conn.syncStatus === 'SYNCING') {
    return 'Synchronizing';
  }
  if (
    (conn.syncStatus as any) === 'INITIAL_SYNC' ||
    (!conn.syncCursor && conn.incomingMessageCount === 0 && (conn.authStatus === 'CONNECTED' || conn.authStatus === 'AUTHORIZED'))
  ) {
    return 'Initial synchronization';
  }
  if (conn.authStatus === 'OAUTH_PENDING' || (conn.authStatus as any) === 'CONNECTING') {
    return 'Connecting';
  }
  if (conn.authStatus === 'CONNECTED' || conn.authStatus === 'AUTHORIZED' || conn.authStatus === 'OAUTH_AUTHORIZED') {
    return 'Connected';
  }
  return 'Not connected';
}

interface UniversalEmailConnectionsProps {
  selectedMailboxId?: string;
  onSelectActiveMailbox?: (mailboxEmail: string, mailboxId: string) => void;
  onClose?: () => void;
  openWizardSignal?: number;
  onConnectionsUpdated?: (connections: EmailConnectionRecord[]) => void;
}

export const UniversalEmailConnections: React.FC<UniversalEmailConnectionsProps> = ({
  selectedMailboxId,
  onSelectActiveMailbox,
  onClose,
  openWizardSignal = 0,
  onConnectionsUpdated,
}) => {
  const [connections, setConnections] = useState<EmailConnectionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardEmail, setWizardEmail] = useState<string>('');
  const [discoveryResult, setDiscoveryResult] = useState<ProviderDiscoveryResult | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderType>('GOOGLE');
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethodType>('OAUTH2');
  const [password, setPassword] = useState<string>('');
  const [appPassword, setAppPassword] = useState<string>('');
  const [imapHost, setImapHost] = useState<string>('');
  const [imapPort, setImapPort] = useState<number>(993);
  const [smtpHost, setSmtpHost] = useState<string>('');
  const [smtpPort, setSmtpPort] = useState<number>(587);
  const [department, setDepartment] = useState<string>('General Administration');
  const [accountOwner, setAccountOwner] = useState<string>('Designated Administrator');
  const [safeguardingClassification, setSafeguardingClassification] = useState<
    'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
  >('GENERAL');
  const [sendingPermission, setSendingPermission] = useState<ConnectorSendingPermission>('AUTHORIZED_PILOT');
  const [verificationHealth, setVerificationHealth] = useState<ConnectionHealth | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Live OAuth Initiation in Wizard
  const [oauthData, setOauthData] = useState<{
    authUrl: string;
    stateId: string;
    redirectUri: string;
    clientId: string;
    scopes: string[];
  } | null>(null);
  const [oauthAuthCodeInput, setOauthAuthCodeInput] = useState<string>('');
  const [oauthVerified, setOauthVerified] = useState<boolean>(false);
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState<boolean>(false);
  const [isExchangingCode, setIsExchangingCode] = useState<boolean>(false);
  const [oauthConfigError, setOauthConfigError] = useState<{
    message: string;
    code?: string;
    missingEnvVars?: string[];
  } | null>(null);

  // Admin Safe Demo Data Cleanup State (Block 76.2) & Complete Reset State (Phase 79.1)
  const [showCleanupPanel, setShowCleanupPanel] = useState<boolean>(false);
  const [cleanupDryRun, setCleanupDryRun] = useState<any | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState<boolean>(false);
  const [cleanupApprovalChecked, setCleanupApprovalChecked] = useState<boolean>(false);
  const [cleanupExecuting, setCleanupExecuting] = useState<boolean>(false);
  const [cleanupResult, setCleanupResult] = useState<any | null>(null);

  const [completeResetDryRun, setCompleteResetDryRun] = useState<any | null>(null);
  const [completeResetLoading, setCompleteResetLoading] = useState<boolean>(false);
  const [completeResetApprovalChecked, setCompleteResetApprovalChecked] = useState<boolean>(false);
  const [completeResetExecuting, setCompleteResetExecuting] = useState<boolean>(false);
  const [completeResetResult, setCompleteResetResult] = useState<any | null>(null);

  // Edit Permissions Modal
  const [editingPermissionsConn, setEditingPermissionsConn] = useState<EmailConnectionRecord | null>(null);
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editOwner, setEditOwner] = useState<string>('');
  const [editPermission, setEditPermission] = useState<ConnectorSendingPermission>('AUTHORIZED_PILOT');
  const [editSafeguarding, setEditSafeguarding] = useState<'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'>('GENERAL');
  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);

  // Reauthorize Modal
  const [reauthorizingConn, setReauthorizingConn] = useState<EmailConnectionRecord | null>(null);
  const [reauthData, setReauthData] = useState<{ authUrl: string; stateId: string; redirectUri: string } | null>(null);
  const [reauthCodeInput, setReauthCodeInput] = useState<string>('');
  const [isReauthorizing, setIsReauthorizing] = useState<boolean>(false);

  // Sync History & Errors Modal
  const [inspectSyncHistory, setInspectSyncHistory] = useState<EmailConnectionRecord | null>(null);

  // Inspection Drawers & Modals
  const [inspectCapabilities, setInspectCapabilities] = useState<{
    provider: EmailProviderType;
    capabilities: ProviderCapabilities;
  } | null>(null);

  const [inspectEvidence, setInspectEvidence] = useState<{
    mailboxEmail: string;
    evidenceHistory: ProviderEvidenceRecord[];
  } | null>(null);

  const [inspectFolders, setInspectFolders] = useState<{
    mailboxEmail: string;
    folders: NormalizedEmailFolder[];
  } | null>(null);

  // AI Triage Drawer
  const [triageModal, setTriageModal] = useState<{
    connectionId: string;
    mailboxEmail: string;
    result?: {
      category: string;
      priority: string;
      isSafeguarding: boolean;
      suggestedDepartment: string;
      aiDraftSuggestion?: string;
    };
  } | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/email/connectors');
      const data = await res.json();
      if (data.success) {
        const list = data.connections || [];
        setConnections(list);
        onConnectionsUpdated?.(list);
      } else {
        setError(data.error || 'Failed to fetch email connections');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error fetching connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (openWizardSignal > 0) {
      resetWizard();
      setIsWizardOpen(true);
    }
  }, [openWizardSignal]);

  useEffect(() => {
    const handleOAuthPopupMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || payload.type !== 'PHUMULANI_OAUTH_CALLBACK') return;
      if (payload.success) {
        setOauthVerified(true);
        setOauthConfigError(null);
        setReauthorizingConn(null);
        setReauthData(null);
        showToast(payload.message || 'OAuth provider authorization verified and tokens vaulted.', 'success');
        void fetchConnections();
      } else {
        showToast(payload.error || 'Provider authorization was not completed.', 'error');
      }
    };
    window.addEventListener('message', handleOAuthPopupMessage);
    return () => window.removeEventListener('message', handleOAuthPopupMessage);
  }, []);

  const handleDiscover = async (email: string) => {
    setWizardEmail(email);
    setOauthConfigError(null);
    if (!email || !EMAIL_FORMAT_REGEX.test(email.trim())) {
      setDiscoveryResult(null);
      return;
    }

    try {
      const res = await authFetch('/api/admin/email/connectors/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: email.trim() }),
      });
      const data = await res.json();
      if (data.success && data.discovery) {
        setDiscoveryResult(data.discovery);
        setSelectedProvider(data.discovery.detectedProvider);
        setSelectedAuthMethod(data.discovery.suggestedAuthMethod);
        if (data.discovery.suggestedSettings) {
          setImapHost(data.discovery.suggestedSettings.imapHost || '');
          setImapPort(data.discovery.suggestedSettings.imapPort || 993);
          setSmtpHost(data.discovery.suggestedSettings.smtpHost || '');
          setSmtpPort(data.discovery.suggestedSettings.smtpPort || 587);
        }
        if (email.toLowerCase().includes('safeguarding')) {
          setSafeguardingClassification('CONFIDENTIAL_SAFEGUARDING_AIR_GAP');
        }
      }
    } catch (err) {
      console.warn('Provider discovery failed:', err);
    }
  };

  const handleRunCleanupDryRun = async () => {
    setCleanupLoading(true);
    setCleanupResult(null);
    setCleanupApprovalChecked(false);
    try {
      const res = await phumulaniApiClient.dryRunDemoEmailCleanup();
      if (res.success && res.report) {
        setCleanupDryRun(res.report);
        showToast('Safe demo cleanup dry-run inspection & timestamped backup created.', 'info');
      } else {
        showToast('Dry-run cleanup returned no report.', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Dry-run cleanup failed', 'error');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleExecuteSafeCleanup = async () => {
    if (!cleanupDryRun?.approvalToken || !cleanupApprovalChecked) return;
    setCleanupExecuting(true);
    try {
      const res = await phumulaniApiClient.executeDemoEmailCleanup({
        approvalToken: cleanupDryRun.approvalToken,
        adminApproved: true,
      });
      db.purgeConfirmedDemoEmailData();
      setCleanupResult(res);
      setCleanupDryRun(null);
      setCleanupApprovalChecked(false);
      await fetchConnections();
      showToast(
        `Demo cleanup complete: ${res.deletedCount} confirmed demo records removed, ${res.genuinePreservedCount} genuine & ${res.uncertainPreservedCount} uncertain records preserved.`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cleanup execution failed', 'error');
    } finally {
      setCleanupExecuting(false);
    }
  };

  const handleRunCompleteResetDryRun = async () => {
    setCompleteResetLoading(true);
    setCompleteResetResult(null);
    setCompleteResetApprovalChecked(false);
    try {
      const res = await phumulaniApiClient.dryRunCompleteEmailReset();
      if (res.success && res.report) {
        setCompleteResetDryRun(res.report);
        showToast('Complete email reset dry-run & SHA-256 verified backup created.', 'info');
      } else {
        showToast('Complete reset dry-run returned no report.', 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Complete reset dry-run failed', 'error');
    } finally {
      setCompleteResetLoading(false);
    }
  };

  const handleExecuteCompleteReset = async () => {
    if (!completeResetDryRun?.approvalToken || !completeResetApprovalChecked) return;
    setCompleteResetExecuting(true);
    try {
      const res = await phumulaniApiClient.executeCompleteEmailReset({
        approvalToken: completeResetDryRun.approvalToken,
        adminApproved: true,
        attemptProviderRevocation: true,
      });
      db.executeClientCompleteEmailReset();
      setCompleteResetResult(res);
      setCompleteResetDryRun(null);
      setCompleteResetApprovalChecked(false);
      await fetchConnections();
      showToast(
        `Complete email reset finished: ${res.totalDeleted} records removed and ${res.vaultEntriesPurged} vaulted credentials purged.`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Complete email reset failed', 'error');
    } finally {
      setCompleteResetExecuting(false);
    }
  };

  const handleInitiateOAuthInWizard = async () => {
    setIsInitiatingOAuth(true);
    setOauthConfigError(null);
    try {
      const endpoint = selectedProvider === 'MICROSOFT'
        ? '/api/admin/email/oauth/microsoft/start'
        : '/api/admin/email/oauth/google/start';
      const res = await authFetch(`${endpoint}?email=${encodeURIComponent(wizardEmail.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOauthData({
          authUrl: data.authUrl,
          stateId: data.stateId,
          redirectUri: data.redirectUri,
          clientId: data.clientId,
          scopes: data.scopes || [],
        });
        showToast('OAuth 2.0 PKCE challenge generated. Click "Open Provider Consent Screen" to authenticate.', 'info');
      } else {
        const missingVars =
          selectedProvider === 'MICROSOFT'
            ? ['MICROSOFT_GRAPH_CLIENT_ID', 'MICROSOFT_GRAPH_CLIENT_SECRET', 'MICROSOFT_TENANT_ID']
            : ['GOOGLE_WORKSPACE_CLIENT_ID', 'GOOGLE_WORKSPACE_CLIENT_SECRET'];
        if (res.status === 503 || data.code === 'OAUTH_CREDENTIALS_MISSING') {
          setOauthConfigError({
            message: data.error || `${selectedProvider} OAuth credentials are not configured on the server.`,
            code: 'BLOCKED_BY_CONFIGURATION',
            missingEnvVars: missingVars,
          });
        }
        showToast(data.error || 'Failed to initiate OAuth', 'error');
      }
    } catch (err) {
      showToast('Error initiating OAuth: ' + String(err), 'error');
    } finally {
      setIsInitiatingOAuth(false);
    }
  };

  const handleExchangeOAuthCode = async () => {
    if (!oauthData || !oauthAuthCodeInput.trim()) {
      showToast('Please enter the authorization code returned by provider.', 'error');
      return;
    }
    setIsExchangingCode(true);
    try {
      const res = await authFetch('/api/admin/email/oauth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: oauthData.stateId,
          code: oauthAuthCodeInput.trim(),
          provider: selectedProvider,
          mailboxEmail: wizardEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOauthVerified(true);
        showToast('Provider authorization verified and tokens securely vaulted!', 'success');
      } else {
        showToast(data.error || 'Failed to exchange authorization code', 'error');
      }
    } catch (err) {
      showToast('OAuth exchange failed: ' + String(err), 'error');
    } finally {
      setIsExchangingCode(false);
    }
  };

  const handleTestVerify = async () => {
    setIsVerifying(true);
    const t0 = Date.now();
    try {
      const res = await authFetch('/api/admin/email/connectors/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: wizardEmail }),
      });
      const data = await res.json();
      const roundTripLatencyMs = Math.max(1, Date.now() - t0);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Provider discovery request failed');
      }

      const hasNonOAuthCreds = Boolean(password.trim() || appPassword.trim());
      const isAuthorized = selectedAuthMethod === 'OAUTH2' ? oauthVerified : hasNonOAuthCreds;
      const discoveredProvider = data.discovery?.provider || selectedProvider;

      setVerificationHealth({
        connectionId: 'conn-verify-preview',
        provider: discoveredProvider,
        mailboxEmail: wizardEmail,
        healthy: selectedAuthMethod === 'OAUTH2' ? oauthVerified : false,
        status: isAuthorized ? (selectedAuthMethod === 'OAUTH2' ? 'HEALTHY' : 'UNTESTED') : 'UNTESTED',
        roundTripLatencyMs,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution:
          data.discovery?.dnsStatus === 'RESOLVED_OK'
            ? 'RESOLVED_OK'
            : data.discovery?.dnsStatus === 'NO_MX' ||
              data.discovery?.dnsStatus === 'NXDOMAIN' ||
              data.discovery?.dnsStatus === 'TIMEOUT' ||
              data.discovery?.dnsStatus === 'DNS_ERROR'
            ? 'DNS_ERROR'
            : data.discovery?.supported
            ? 'RESOLVED_OK'
            : 'DNS_ERROR',
        diagnosticsDetail:
          selectedAuthMethod === 'OAUTH2'
            ? isAuthorized
              ? `Provider discovered (${discoveredProvider}) and OAuth 2.0 authorization verified (${roundTripLatencyMs}ms).`
              : `Provider discovered (${discoveredProvider}), but OAuth 2.0 authorization has not yet been completed.`
            : hasNonOAuthCreds
            ? `Provider discovered (${discoveredProvider}). Save & authenticate to verify real IMAP/SMTP credentials against the mail server.`
            : `Provider discovered (${discoveredProvider}), but IMAP/SMTP password or app password is required before authentication.`,
      });
    } catch (err: unknown) {
      setVerificationHealth({
        connectionId: 'conn-verify-err',
        provider: selectedProvider,
        mailboxEmail: wizardEmail,
        healthy: false,
        status: 'ERROR',
        roundTripLatencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'DNS_ERROR',
        error: err instanceof Error ? err.message : 'Connection verification failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConnection = async () => {
    if (selectedAuthMethod === 'OAUTH2' && !oauthVerified) {
      showToast('Provider authorization required before marking account connected.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch('/api/admin/email/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddress: wizardEmail,
          provider: selectedProvider,
          displayName: `${PROVIDER_DESCRIPTORS[selectedProvider]?.name || selectedProvider} (${wizardEmail})`,
          accountOwner,
          department,
          authMethod: selectedAuthMethod,
          safeguardingClassification,
          sendingPermission,
          credentials: {
            authMethod: selectedAuthMethod,
            password: password || undefined,
            appPassword: appPassword || undefined,
            imapHost: imapHost || undefined,
            imapPort,
            smtpHost: smtpHost || undefined,
            smtpPort,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchConnections();
        setIsWizardOpen(false);
        resetWizard();
        showToast('Connection successfully registered, verified, and vaulted.', 'success');
      } else {
        showToast(data.error || 'Failed to save connection', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving connection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardEmail('');
    setDiscoveryResult(null);
    setSelectedProvider('GOOGLE');
    setSelectedAuthMethod('OAUTH2');
    setPassword('');
    setAppPassword('');
    setVerificationHealth(null);
    setOauthData(null);
    setOauthAuthCodeInput('');
    setOauthVerified(false);
    setOauthConfigError(null);
  };

  const handleSync = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Synchronization completed successfully.', 'success');
        fetchConnections();
      } else {
        showToast(`Sync Notice: ${data.error || 'Sync could not complete'}`, 'info');
      }
    } catch (err: unknown) {
      showToast(`Sync error: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const handleTogglePauseSync = async (conn: EmailConnectionRecord) => {
    const isPaused = conn.syncStatus === ('SYNC_PAUSED' as any) || (conn as any).metadata?.paused;
    const action = isPaused ? 'resume' : 'pause';
    try {
      const res = await authFetch(`/api/admin/email/connections/${conn.id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Sync ${action}d for ${conn.emailAddress}`, 'info');
        fetchConnections();
      } else {
        showToast(data.error || `Failed to ${action} sync`, 'error');
      }
    } catch (err) {
      showToast(`Failed to toggle sync: ${String(err)}`, 'error');
    }
  };

  const handleVerifyHealth = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${id}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.health) {
        showToast(`Health Check: ${data.health.status} (${data.health.roundTripLatencyMs}ms) - ${data.health.tlsVersion}`, 'info');
        fetchConnections();
      }
    } catch (err: unknown) {
      showToast(`Health check failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const handleOpenEditPermissions = (conn: EmailConnectionRecord) => {
    setEditingPermissionsConn(conn);
    setEditDepartment(conn.department || 'General Administration');
    setEditOwner(conn.accountOwner || 'Designated Administrator');
    setEditPermission(conn.sendingPermission || 'AUTHORIZED_PILOT');
    setEditSafeguarding(conn.safeguardingClassification || 'GENERAL');
  };

  const handleSavePermissions = async () => {
    if (!editingPermissionsConn) return;
    setIsSavingPermissions(true);
    try {
      const res = await authFetch(`/api/admin/email/connectors/${editingPermissionsConn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: editDepartment,
          accountOwner: editOwner,
          sendingPermission: editPermission,
          safeguardingClassification: editSafeguarding,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Mailbox permissions and governance settings updated.', 'success');
        setEditingPermissionsConn(null);
        fetchConnections();
      } else {
        showToast(data.error || 'Failed to update permissions', 'error');
      }
    } catch (err) {
      showToast('Error updating permissions: ' + String(err), 'error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleOpenReauthorize = async (conn: EmailConnectionRecord) => {
    setReauthorizingConn(conn);
    setReauthCodeInput('');
    setIsReauthorizing(true);
    try {
      const res = await authFetch(`/api/admin/email/connections/${conn.id}/reauthorize`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.oauth) {
        setReauthData(data.oauth);
      }
    } catch (err) {
      showToast('Failed to initiate reauthorization: ' + String(err), 'error');
    } finally {
      setIsReauthorizing(false);
    }
  };

  const handleCompleteReauthorize = async () => {
    if (!reauthorizingConn || !reauthData || !reauthCodeInput.trim()) {
      showToast('Please enter the authorization code.', 'error');
      return;
    }
    setIsReauthorizing(true);
    try {
      const res = await authFetch('/api/admin/email/oauth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: reauthData.stateId,
          code: reauthCodeInput.trim(),
          provider: reauthorizingConn.provider,
          mailboxEmail: reauthorizingConn.emailAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Account successfully reauthorized and tokens renewed!', 'success');
        setReauthorizingConn(null);
        setReauthData(null);
        fetchConnections();
      } else {
        showToast(data.error || 'Failed to complete reauthorization', 'error');
      }
    } catch (err) {
      showToast('Reauthorization failed: ' + String(err), 'error');
    } finally {
      setIsReauthorizing(false);
    }
  };

  const handleRefreshToken = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${id}/refresh-token`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('OAuth access token refreshed and re-encrypted in vault.', 'success');
        fetchConnections();
      } else {
        showToast(data.error || 'Token refresh could not be completed. Reauthorization may be required.', 'error');
      }
    } catch (err) {
      showToast('Failed to refresh token: ' + String(err), 'error');
    }
  };

  const handleRevokeToken = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${id}/revoke`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Credentials revoked and vault purged.', 'info');
        fetchConnections();
      }
    } catch (err) {
      showToast('Revocation error: ' + String(err), 'error');
    }
  };

  const handleInspectFolders = async (conn: EmailConnectionRecord) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${conn.id}/folders`);
      const data = await res.json();
      if (data.success && data.folders) {
        setInspectFolders({
          mailboxEmail: conn.emailAddress,
          folders: data.folders,
        });
      }
    } catch (err) {
      showToast('Failed to inspect folders: ' + String(err), 'error');
    }
  };

  const handleInspectEvidence = async (conn: EmailConnectionRecord) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${conn.id}/evidence`);
      const data = await res.json();
      if (data.success) {
        setInspectEvidence({
          mailboxEmail: conn.emailAddress,
          evidenceHistory: data.evidenceHistory || [],
        });
      }
    } catch (err) {
      showToast('Failed to load evidence: ' + String(err), 'error');
    }
  };

  const handleRunAiTriage = async (conn: EmailConnectionRecord) => {
    try {
      const res = await authFetch(`/api/admin/email/connectors/${conn.id}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Inquiry regarding community empowerment program',
          body: 'Hello Phumulani team, I would like to volunteer and support your educational programs in Pretoria.',
          senderEmail: 'volunteer.partner@pretoria.org',
        }),
      });
      const data = await res.json();
      if (data.success && data.triage) {
        setTriageModal({
          connectionId: conn.id,
          mailboxEmail: conn.emailAddress,
          result: data.triage,
        });
      }
    } catch (err) {
      showToast('AI triage failed: ' + String(err), 'error');
    }
  };

  const handleToggleDisconnect = async (conn: EmailConnectionRecord) => {
    const isDisconnected = conn.authStatus === 'DISCONNECTED';
    const action = isDisconnected ? 'reconnect' : 'disconnect';
    try {
      const res = await authFetch(`/api/admin/email/connectors/${conn.id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Mailbox ${conn.emailAddress} is now ${isDisconnected ? 'connected' : 'disconnected'}.`, 'info');
        fetchConnections();
      }
    } catch (err: unknown) {
      showToast(`Error toggling connection state: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      const res = await authFetch(`/api/admin/email/connectors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Connection successfully removed.', 'info');
        fetchConnections();
      }
    } catch (err: unknown) {
      showToast(`Delete error: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const totalAccounts = connections.length;
  const healthyAccounts = connections.filter((c) => c.connectionHealth === 'HEALTHY').length;
  const totalMessagesIn = connections.reduce((acc, c) => acc + c.incomingMessageCount, 0);
  const totalMessagesOut = connections.reduce((acc, c) => acc + (c.outgoingMessageCount || 0), 0);
  const airGappedAccounts = connections.filter(
    (c) => c.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border animate-bounce ${
            toast.type === 'success'
              ? 'bg-phumulani-charcoal text-phumulani-cream border-phumulani-green'
              : toast.type === 'error'
              ? 'bg-phumulani-charcoal text-phumulani-cream border-phumulani-earth'
              : 'bg-phumulani-charcoal text-phumulani-cream border-phumulani-teal'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Primary Actions */}
      <div className="bg-phumulani-charcoal p-6 rounded-2xl border border-phumulani-cream text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-phumulani-teal text-phumulani-charcoal border border-phumulani-cream mb-2">
              <span className="w-2 h-2 rounded-full bg-phumulani-teal animate-pulse"></span>
              Universal Email Connector Framework (Stage 1 Real Mailbox Management)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Enterprise Connected Mailboxes & Provider Manager</h2>
            <p className="text-phumulani-cream text-sm mt-1 max-w-2xl">
              Connect Gmail, Google Workspace, Outlook, and Microsoft 365 through official OAuth 2.0 PKCE.
              Select active mailboxes, enforce Quad-Action human approvals, monitor sync health, and protect survivor correspondence via VAWA Section 1367 air-gap isolation.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowCleanupPanel(!showCleanupPanel)}
              className="px-4 py-2.5 bg-phumulani-charcoal hover:bg-phumulani-orange text-phumulani-gold font-medium text-xs rounded-xl border border-phumulani-gold transition-colors flex items-center gap-1.5"
            >
              {showCleanupPanel ? 'Hide Demo Cleanup' : 'Safe Demo Cleanup'}
            </button>
            <button
              onClick={() => setShowConfigGuide(!showConfigGuide)}
              className="px-4 py-2.5 bg-phumulani-charcoal hover:bg-phumulani-orange text-phumulani-cream font-medium text-xs rounded-xl border border-phumulani-teal transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-phumulani-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showConfigGuide ? 'Hide Setup Guide' : 'Provider OAuth Guide'}
            </button>
            <button
              onClick={() => {
                resetWizard();
                setIsWizardOpen(true);
              }}
              className="px-5 py-2.5 bg-phumulani-teal hover:bg-phumulani-gold text-phumulani-charcoal font-medium text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Connect Email Account
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-phumulani-charcoal hover:bg-phumulani-orange text-phumulani-cream text-xs font-semibold rounded-xl border border-phumulani-teal"
              >
                Back to Inbox
              </button>
            )}
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-phumulani-teal">
          <div className="bg-phumulani-charcoal rounded-xl p-3 border border-phumulani-teal">
            <div className="text-xs text-phumulani-cream uppercase font-semibold">Configured Accounts</div>
            <div className="text-2xl font-bold text-white mt-1">{totalAccounts}</div>
            <div className="text-xs text-phumulani-teal mt-0.5">Canonical & Custom</div>
          </div>
          <div className="bg-phumulani-charcoal rounded-xl p-3 border border-phumulani-teal">
            <div className="text-xs text-phumulani-cream uppercase font-semibold">Connection Health</div>
            <div className="text-2xl font-bold text-phumulani-green mt-1">{healthyAccounts} / {totalAccounts}</div>
            <div className="text-xs text-phumulani-cream mt-0.5">TLS Handshake Verified</div>
          </div>
          <div className="bg-phumulani-charcoal rounded-xl p-3 border border-phumulani-teal">
            <div className="text-xs text-phumulani-cream uppercase font-semibold">Ingested Inbound</div>
            <div className="text-2xl font-bold text-phumulani-teal mt-1">{totalMessagesIn}</div>
            <div className="text-xs text-phumulani-cream mt-0.5">Durable Cursor Synced</div>
          </div>
          <div className="bg-phumulani-charcoal rounded-xl p-3 border border-phumulani-teal">
            <div className="text-xs text-phumulani-cream uppercase font-semibold">Approved Outbound</div>
            <div className="text-2xl font-bold text-phumulani-gold mt-1">{totalMessagesOut}</div>
            <div className="text-xs text-phumulani-cream mt-0.5">Quad-Action Gated</div>
          </div>
          <div className="bg-phumulani-charcoal rounded-xl p-3 border border-phumulani-teal">
            <div className="text-xs text-phumulani-cream uppercase font-semibold">Air-Gapped Mailboxes</div>
            <div className="text-2xl font-bold text-phumulani-gold mt-1">{airGappedAccounts}</div>
            <div className="text-xs text-phumulani-gold mt-0.5">VAWA 1367 Compliant</div>
          </div>
        </div>
      </div>

      {/* Collapsible Provider Setup & OAuth Configuration Guide */}
      {showConfigGuide && (
        <div className="bg-phumulani-charcoal border border-phumulani-teal rounded-2xl p-6 text-phumulani-cream text-xs space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-phumulani-earth pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-phumulani-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Provider Setup & OAuth 2.0 PKCE Production Guide
            </h3>
            <button
              onClick={() => setShowConfigGuide(false)}
              className="text-phumulani-cream hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Workspace Setup */}
            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-phumulani-teal space-y-2">
              <div className="text-phumulani-gold font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-phumulani-teal"></span>
                1. Google Workspace & Gmail Configuration
              </div>
              <p className="text-phumulani-cream">
                Register an OAuth 2.0 Web Application in <strong>Google Cloud Console</strong> for organization <code className="bg-phumulani-charcoal px-1 py-0.5 rounded text-phumulani-teal">phumulani.org</code>.
              </p>
              <div className="space-y-1 font-mono text-[11px] bg-phumulani-charcoal p-2.5 rounded-lg border border-phumulani-teal">
                <div><strong>Authorized Redirect URI:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/admin/email/oauth/google/callback</div>
                <div><strong>Scopes:</strong> openid, email, profile, gmail.readonly, gmail.send, gmail.modify</div>
                <div><strong>Env Var:</strong> GOOGLE_WORKSPACE_CLIENT_ID</div>
              </div>
              <div className="text-phumulani-cream text-[11px]">
                Requires Google Workspace Super Admin consent for domain-wide delegated mailboxes.
              </div>
            </div>

            {/* Microsoft 365 Setup */}
            <div className="bg-phumulani-charcoal p-4 rounded-xl border border-phumulani-teal space-y-2">
              <div className="text-phumulani-gold font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-phumulani-teal"></span>
                2. Microsoft Outlook & M365 Configuration
              </div>
              <p className="text-phumulani-cream">
                Register an App in <strong>Microsoft Entra ID (Azure AD)</strong> under the organization directory.
              </p>
              <div className="space-y-1 font-mono text-[11px] bg-phumulani-charcoal p-2.5 rounded-lg border border-phumulani-teal">
                <div><strong>Authorized Redirect URI:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/admin/email/oauth/microsoft/callback</div>
                <div><strong>Graph Scopes:</strong> openid, profile, offline_access, Mail.Read, Mail.ReadWrite, Mail.Send</div>
                <div><strong>Env Vars:</strong> MICROSOFT_GRAPH_CLIENT_ID, MICROSOFT_TENANT_ID</div>
              </div>
              <div className="text-phumulani-cream text-[11px]">
                Tokens are stored using AES-256 server-side encryption. Refresh tokens are automatically rotated upon expiry.
              </div>
            </div>
          </div>

          <div className="bg-phumulani-charcoal p-3.5 rounded-xl border border-phumulani-teal text-phumulani-teal text-xs">
            <strong>VAWA Section 1367 Safeguarding Air-Gap Policy:</strong> Accounts classified as <code className="bg-phumulani-charcoal px-1 py-0.5 rounded text-white">CONFIDENTIAL_SAFEGUARDING_AIR_GAP</code> (e.g. safeguarding@phumulani.org) strictly prohibit AI automated dispatch, suppress donor CRM syncing, and air-gap sensitive survivor PII.
          </div>
        </div>
      )}

      {/* Admin Safe Demonstration Data Cleanup Panel (Block 76.2) */}
      {showCleanupPanel && (
        <div className="bg-white border border-phumulani-gold rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-phumulani-cream pb-3">
            <div>
              <h3 className="text-sm font-bold text-phumulani-charcoal">Safe Demonstration Email Data Cleanup</h3>
              <p className="text-phumulani-charcoal mt-0.5">
                Inspects email stores only after creating a timestamped backup. Donor records, grant pipelines, payments, audit logs, and any uncertain records are strictly preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunCleanupDryRun}
              disabled={cleanupLoading}
              className="px-3.5 py-2 bg-phumulani-charcoal hover:bg-phumulani-orange text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {cleanupLoading ? 'Inspecting...' : 'Run Dry-Run & Create Backup'}
            </button>
          </div>

          {cleanupDryRun && (
            <div className="bg-phumulani-cream border border-phumulani-gold rounded-xl p-4 space-y-3">
              <div className="font-bold text-phumulani-charcoal">Dry-Run Inspection Report (Approval Required)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-lg border border-phumulani-gold">
                  <div className="text-phumulani-charcoal">Confirmed Demo Records</div>
                  <div className="text-lg font-bold text-phumulani-earth">{cleanupDryRun.confirmedDemoCount}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-phumulani-green">
                  <div className="text-phumulani-charcoal">Genuine Records Preserved</div>
                  <div className="text-lg font-bold text-phumulani-earth">{cleanupDryRun.genuinePreservedCount}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-phumulani-cream">
                  <div className="text-phumulani-charcoal">Uncertain Preserved</div>
                  <div className="text-lg font-bold text-phumulani-charcoal">{cleanupDryRun.uncertainPreservedCount}</div>
                </div>
              </div>
              <div className="font-mono text-[11px] text-phumulani-charcoal break-all">
                <strong>Backup Created:</strong> {cleanupDryRun.backupFilePath} (SHA-256: {String(cleanupDryRun.backupChecksum || '').slice(0, 16)}…)
              </div>
              <label className="flex items-center gap-2 text-phumulani-charcoal font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cleanupApprovalChecked}
                  onChange={(e) => setCleanupApprovalChecked(e.target.checked)}
                  className="rounded border-phumulani-cream"
                />
                <span>I confirm deletion of ONLY confirmed demonstration email records listed in this dry-run.</span>
              </label>
              <button
                type="button"
                onClick={handleExecuteSafeCleanup}
                disabled={!cleanupApprovalChecked || cleanupExecuting}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl font-bold disabled:opacity-50"
              >
                {cleanupExecuting ? 'Executing Cleanup...' : 'Approve & Execute Confirmed Cleanup'}
              </button>
            </div>
          )}

          {cleanupResult && (
            <div className="bg-phumulani-cream border border-phumulani-green rounded-xl p-3 text-phumulani-charcoal space-y-1">
              <div className="font-bold">Cleanup Audit Entry Recorded</div>
              <div>Deleted confirmed demo records: {cleanupResult.deletedCount} | Genuine preserved: {cleanupResult.genuinePreservedCount} | Uncertain preserved: {cleanupResult.uncertainPreservedCount}</div>
              <div className="font-mono text-[11px]">Audit Ledger ID: {cleanupResult.auditLedgerId}</div>
            </div>
          )}

          {/* Phase 79.1 Complete Email Data Reset & Clean Installation */}
          <div className="pt-4 mt-4 border-t border-phumulani-cream space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-phumulani-charcoal">Complete Email Data Reset & Clean Installation</h4>
                <p className="text-phumulani-charcoal mt-0.5">
                  Removes all email messages, threads, drafts, approvals, mailbox connections, and vaulted OAuth credentials after SHA-256 backup verification. Unrelated donor CRM, grants, safeguarding, and audit ledger records are untouched.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunCompleteResetDryRun}
                disabled={completeResetLoading}
                className="px-3.5 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl font-semibold disabled:opacity-50 shrink-0"
              >
                {completeResetLoading ? 'Preparing Backup...' : 'Run Complete Reset Dry-Run'}
              </button>
            </div>

            {completeResetDryRun && (
              <div className="bg-phumulani-cream border border-phumulani-earth rounded-xl p-4 space-y-3">
                <div className="font-bold text-phumulani-charcoal">Complete Email Reset Dry-Run (Explicit Admin Confirmation Required)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-phumulani-earth">
                    <div className="text-phumulani-charcoal">Operational Email Items</div>
                    <div className="text-lg font-bold text-phumulani-earth">{completeResetDryRun.totalOperationalItemsFound}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-phumulani-earth">
                    <div className="text-phumulani-charcoal">Mailbox Connections</div>
                    <div className="text-lg font-bold text-phumulani-earth">{completeResetDryRun.mailboxConnectionsToRemove?.length || 0}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-phumulani-green">
                    <div className="text-phumulani-charcoal">Legal Holds Preserved</div>
                    <div className="text-lg font-bold text-phumulani-earth">{completeResetDryRun.legalHoldPreservedCount || 0}</div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-phumulani-charcoal break-all">
                  <strong>SHA-256 Verified Backup:</strong> {completeResetDryRun.backupFilePath} ({String(completeResetDryRun.backupChecksum || '').slice(0, 16)}…)
                </div>
                <label className="flex items-center gap-2 text-phumulani-charcoal font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completeResetApprovalChecked}
                    onChange={(e) => setCompleteResetApprovalChecked(e.target.checked)}
                    className="rounded border-phumulani-cream"
                  />
                  <span>I confirm permanent removal of all persisted operational email data and vaulted mailbox credentials after backup verification.</span>
                </label>
                <button
                  type="button"
                  onClick={handleExecuteCompleteReset}
                  disabled={!completeResetApprovalChecked || completeResetExecuting}
                  className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {completeResetExecuting ? 'Resetting Email System...' : 'Confirm & Execute Complete Email Reset'}
                </button>
              </div>
            )}

            {completeResetResult && (
              <div className="bg-phumulani-cream border border-phumulani-green rounded-xl p-3 text-phumulani-charcoal space-y-1">
                <div className="font-bold">Complete Email Reset Executed ({completeResetResult.resetMarkerVersion})</div>
                <div>Deleted records: {completeResetResult.totalDeleted} | Vault entries purged: {completeResetResult.vaultEntriesPurged} | Legal holds preserved: {completeResetResult.legalHoldPreservedCount}</div>
                <div className="font-mono text-[11px]">Audit Ledger ID: {completeResetResult.auditLedgerId}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Account Inventory List */}
      <div className="bg-white rounded-2xl shadow-sm border border-phumulani-cream overflow-hidden">
        <div className="p-5 border-b border-phumulani-cream flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-phumulani-charcoal">Configured Email Connections</h3>
            <p className="text-xs text-phumulani-charcoal mt-0.5">
              Provider adapters normalize data across REST APIs and RFC protocols into unified inbox pipelines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchConnections}
              className="text-xs font-medium text-phumulani-earth hover:text-phumulani-earth px-3 py-1.5 rounded-lg border border-phumulani-teal hover:bg-phumulani-cream flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Connections
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-phumulani-charcoal text-sm">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-phumulani-cream border-t-transparent rounded-full mb-2"></div>
            <div>Loading universal email connections...</div>
          </div>
        ) : connections.length === 0 ? (
          <div className="p-12 text-center text-phumulani-charcoal text-sm space-y-3">
            <div className="font-semibold text-phumulani-charcoal text-base">
              No Email Accounts Connected
            </div>
            <p className="text-xs text-phumulani-charcoal max-w-md mx-auto leading-relaxed">
              Your Email Command Center is ready. Connect and authorize your organizational email accounts to begin receiving and managing messages.
            </p>
            <button
              onClick={() => {
                resetWizard();
                setIsWizardOpen(true);
              }}
              className="px-4 py-2 bg-phumulani-earth text-white rounded-xl text-xs font-semibold shadow hover:bg-phumulani-orange cursor-pointer"
            >
              Connect Email Account
            </button>
          </div>
        ) : (
          <div className="divide-y divide-phumulani-cream">
            {connections.map((conn) => {
              const descriptor = PROVIDER_DESCRIPTORS[conn.provider];
              const isAirGapped = conn.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
              const uiState = getMailboxUIState(conn);
              const isActive = selectedMailboxId === conn.id || selectedMailboxId === conn.emailAddress;
              const isSyncPaused = conn.syncStatus === ('SYNC_PAUSED' as any) || (conn as any).metadata?.paused;

              // Compute Badge Styling for the 9 required interface states
              let stateBadgeClass = 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream';
              let stateDotColor = 'bg-phumulani-charcoal';

              switch (uiState) {
                case 'Connected':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-green font-semibold';
                  stateDotColor = 'bg-phumulani-green animate-pulse';
                  break;
                case 'Synchronizing':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal font-semibold';
                  stateDotColor = 'bg-phumulani-teal animate-spin';
                  break;
                case 'Initial synchronization':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal font-semibold';
                  stateDotColor = 'bg-phumulani-charcoal';
                  break;
                case 'Connecting':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-earth border-phumulani-teal font-semibold';
                  stateDotColor = 'bg-phumulani-teal animate-ping';
                  break;
                case 'Sync paused':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-gold font-semibold';
                  stateDotColor = 'bg-phumulani-gold';
                  break;
                case 'Authorization required':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-earth border-phumulani-orange font-bold';
                  stateDotColor = 'bg-phumulani-orange animate-bounce';
                  break;
                case 'Connection error':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-earth border-phumulani-earth font-bold';
                  stateDotColor = 'bg-phumulani-orange';
                  break;
                case 'Disconnected':
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream';
                  stateDotColor = 'bg-phumulani-charcoal';
                  break;
                case 'Not connected':
                default:
                  stateBadgeClass = 'bg-phumulani-cream text-phumulani-charcoal border-phumulani-cream';
                  stateDotColor = 'bg-phumulani-charcoal';
                  break;
              }

              return (
                <div
                  key={conn.id}
                  className={`p-5 transition-colors ${
                    isActive ? 'bg-phumulani-cream border-l-4 border-phumulani-earth' : 'hover:bg-phumulani-cream'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${descriptor?.badgeColor || 'bg-phumulani-cream text-phumulani-charcoal'}`}>
                          {descriptor?.name || conn.provider}
                        </span>

                        <h4 className="font-semibold text-phumulani-charcoal text-base">{conn.displayName}</h4>

                        {isActive && (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-phumulani-earth text-white shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            ACTIVE MAILBOX
                          </span>
                        )}

                        {/* Exact 9-State Status Badge + Canonical 8-State Lifecycle Pill */}
                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-full border flex items-center gap-1.5 ${stateBadgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${stateDotColor}`}></span>
                          {uiState}
                        </span>

                        {(conn as any).lifecycleState && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-phumulani-cream text-phumulani-charcoal border border-phumulani-cream">
                            {(conn as any).lifecycleState}
                          </span>
                        )}

                        {isAirGapped && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-phumulani-cream text-phumulani-earth border border-phumulani-earth flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-phumulani-orange"></span>
                            AIR-GAPPED SAFEGUARDING
                          </span>
                        )}

                        {conn.credentialWarning && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-phumulani-cream text-phumulani-earth border border-phumulani-gold">
                            Token Expiring Soon
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-phumulani-charcoal flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>Email:</strong> {conn.emailAddress}</span>
                        <span><strong>Owner:</strong> {conn.accountOwner}</span>
                        <span><strong>Department:</strong> {conn.department}</span>
                        <span><strong>Permission:</strong> {conn.sendingPermission || 'AUTHORIZED_PILOT'}</span>
                        <span><strong>Inbound/Outbound:</strong> {conn.incomingMessageCount} / {conn.outgoingMessageCount || 0}</span>
                        <span><strong>Cursor:</strong> {conn.syncCursor || 'Initial'} ({conn.cursorType || 'N/A'})</span>
                        {conn.lastSyncAt && (
                          <span><strong>Last Sync:</strong> {new Date(conn.lastSyncAt).toLocaleString()}</span>
                        )}
                        {conn.lastError && (
                          <span className="text-phumulani-earth font-semibold truncate max-w-xs" title={conn.lastError}>
                            Err: {conn.lastError}
                          </span>
                        )}
                        {((conn as any).configurationStatus === 'BLOCKED_BY_CONFIGURATION' ||
                          (!(conn as any).credentialsConfigured && uiState === 'Not connected')) && (
                          <span className="px-2 py-0.5 rounded bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold font-semibold">
                            BLOCKED_BY_CONFIGURATION — Live OAuth / provider credentials not configured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Set Active Mailbox */}
                      {onSelectActiveMailbox && (
                        <button
                          onClick={() => onSelectActiveMailbox(conn.emailAddress, conn.id)}
                          disabled={isActive}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            isActive
                              ? 'bg-phumulani-cream text-phumulani-earth cursor-default opacity-80'
                              : 'bg-phumulani-earth hover:bg-phumulani-orange text-white shadow-sm'
                          }`}
                        >
                          {isActive ? 'Active' : 'Set Active'}
                        </button>
                      )}

                      {/* Manual Sync */}
                      <button
                        onClick={() => handleSync(conn.id)}
                        disabled={isSyncPaused}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                        title="Synchronize Mailbox"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync
                      </button>

                      {/* Pause / Resume Sync */}
                      <button
                        onClick={() => handleTogglePauseSync(conn)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                          isSyncPaused
                            ? 'bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal'
                            : 'bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-charcoal'
                        }`}
                        title={isSyncPaused ? 'Resume Background Sync' : 'Pause Background Sync'}
                      >
                        {isSyncPaused ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Resume
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pause
                          </>
                        )}
                      </button>

                      {/* Reauthorize (prominently shown when needed) */}
                      {(uiState === 'Authorization required' || uiState === 'Connection error' || conn.authMethod === 'OAUTH2') && (
                        <button
                          onClick={() => handleOpenReauthorize(conn)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth rounded-lg transition-colors flex items-center gap-1 border border-phumulani-orange"
                        >
                          <svg className="w-3.5 h-3.5 text-phumulani-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Reauthorize
                        </button>
                      )}

                      {/* Edit Mailbox Permissions */}
                      <button
                        onClick={() => handleOpenEditPermissions(conn)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg transition-colors flex items-center gap-1"
                        title="Edit Permissions & Governance"
                      >
                        <svg className="w-3.5 h-3.5 text-phumulani-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Permissions
                      </button>

                      {/* Test TLS / Connectivity */}
                      <button
                        onClick={() => handleVerifyHealth(conn.id)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-teal text-phumulani-earth rounded-lg transition-colors"
                        title="Test TLS & DNS Handshake"
                      >
                        Test TLS
                      </button>

                      {/* Sync History & Diagnostics */}
                      <button
                        onClick={() => setInspectSyncHistory(conn)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth rounded-lg transition-colors"
                        title="Review Errors & Sync History"
                      >
                        History
                      </button>

                      {/* Folders */}
                      <button
                        onClick={() => handleInspectFolders(conn)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth rounded-lg transition-colors"
                      >
                        Folders
                      </button>

                      {/* Evidence */}
                      <button
                        onClick={() => handleInspectEvidence(conn)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth rounded-lg transition-colors"
                      >
                        Evidence
                      </button>

                      {/* AI Triage */}
                      <button
                        onClick={() => handleRunAiTriage(conn)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-charcoal rounded-lg transition-colors"
                      >
                        AI Triage
                      </button>

                      {/* Refresh Token */}
                      {conn.authMethod === 'OAUTH2' && (
                        <button
                          onClick={() => handleRefreshToken(conn.id)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg transition-colors"
                        >
                          Refresh
                        </button>
                      )}

                      {/* Revoke */}
                      <button
                        onClick={() => handleRevokeToken(conn.id)}
                        className="px-2.5 py-1.5 text-xs font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-earth rounded-lg transition-colors"
                      >
                        Revoke
                      </button>

                      {/* Disconnect / Reconnect */}
                      <button
                        onClick={() => handleToggleDisconnect(conn)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          conn.authStatus === 'DISCONNECTED'
                            ? 'bg-phumulani-cream hover:bg-phumulani-gold text-phumulani-charcoal'
                            : 'bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal'
                        }`}
                      >
                        {conn.authStatus === 'DISCONNECTED' ? 'Reconnect' : 'Disconnect'}
                      </button>

                      {/* Delete */}
                      {confirmDeleteId === conn.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(conn.id)}
                            className="px-2 py-1 text-[11px] font-bold bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-lg cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[11px] font-medium bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(conn.id)}
                          className="p-1.5 text-phumulani-charcoal hover:text-phumulani-earth rounded-lg hover:bg-phumulani-cream transition-colors"
                          title="Delete Connection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6-STEP CONNECT EMAIL ACCOUNT WIZARD MODAL (REAL OAUTH INTEGRATION)       */}
      {/* ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-phumulani-cream overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="bg-phumulani-charcoal px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-lg">Connect Email Account</h3>
                <p className="text-xs text-phumulani-cream">Step {wizardStep} of 6 — Universal Connector Provisioning</p>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-phumulani-cream hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="bg-phumulani-cream px-6 py-2.5 flex items-center justify-between border-b border-phumulani-cream text-xs shrink-0">
              {['Email & Discovery', 'Provider', 'Auth Credentials', 'TLS Verification', 'Permissions', 'Review'].map(
                (title, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = wizardStep === stepNum;
                  const isPast = wizardStep > stepNum;
                  return (
                    <div
                      key={title}
                      className={`flex items-center gap-1 font-medium ${
                        isCurrent
                          ? 'text-phumulani-earth font-bold'
                          : isPast
                          ? 'text-phumulani-charcoal'
                          : 'text-phumulani-charcoal'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isCurrent
                            ? 'bg-phumulani-earth text-white'
                            : isPast
                            ? 'bg-phumulani-cream text-phumulani-charcoal'
                            : 'bg-phumulani-cream text-phumulani-charcoal'
                        }`}
                      >
                        {stepNum}
                      </span>
                      <span className="hidden sm:inline">{title}</span>
                    </div>
                  );
                }
              )}
            </div>

            {/* Wizard Body */}
            <div className="p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
              {/* STEP 1: Email Address & Autodiscovery */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Enter Email Address</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    The autodiscovery engine will automatically detect the email provider, recommended protocol, and security settings.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Email Address</label>
                    <input
                      type="email"
                      value={wizardEmail}
                      onChange={(e) => handleDiscover(e.target.value)}
                      placeholder="e.g. info@phumulani.org, partner@outlook.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-phumulani-cream focus:outline-none focus:ring-2 focus:ring-phumulani-cream"
                    />
                    {wizardEmail.trim().length > 0 && !EMAIL_FORMAT_REGEX.test(wizardEmail.trim()) && (
                      <p className="text-[11px] text-phumulani-earth mt-1">
                        Enter a valid email address with domain (e.g. info@phumulani.org).
                      </p>
                    )}
                  </div>

                  {discoveryResult && (
                    <div className="p-4 rounded-xl bg-phumulani-cream border border-phumulani-teal text-xs text-phumulani-earth space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-phumulani-earth">
                        <svg className="w-4 h-4 text-phumulani-earth" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Detected Provider: {PROVIDER_DESCRIPTORS[discoveryResult.detectedProvider]?.name || discoveryResult.detectedProvider} ({Math.round(discoveryResult.confidenceScore * 100)}% match)
                      </div>
                      <div>{discoveryResult.detectionReason}</div>
                      <div>
                        <strong>Suggested Auth:</strong> {discoveryResult.suggestedAuthMethod}
                        {discoveryResult.dnsStatus && (
                          <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-white border border-phumulani-teal">
                            DNS: {discoveryResult.dnsStatus}
                          </span>
                        )}
                      </div>
                      {discoveryResult.mxRecords && discoveryResult.mxRecords.length > 0 && (
                        <div className="pt-1">
                          <strong>MX Records:</strong>
                          <ul className="mt-1 space-y-0.5 font-mono text-[11px]">
                            {discoveryResult.mxRecords.slice(0, 4).map((mx) => (
                              <li key={`${mx.priority}-${mx.exchange}`}>
                                [{mx.priority}] {mx.exchange}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-[11px] text-phumulani-charcoal bg-phumulani-cream border border-phumulani-gold rounded-lg p-2 mt-1">
                        MX records identify mail routing only. Account ownership and authorization require OAuth 2.0 or credential verification before this mailbox can connect.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Provider Selection */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Select Provider & Protocol</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    Choose the provider adapter that corresponds to this email mailbox service.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                    {Object.values(PROVIDER_DESCRIPTORS).map((desc) => {
                      const isSelected = selectedProvider === desc.id;
                      return (
                        <div
                          key={desc.id}
                          onClick={() => {
                            setSelectedProvider(desc.id);
                            setSelectedAuthMethod(desc.recommendedAuthMethod);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-phumulani-cream bg-phumulani-cream shadow-sm'
                              : 'border-phumulani-cream hover:border-phumulani-cream'
                          }`}
                        >
                          <div className="font-semibold text-xs text-phumulani-charcoal">{desc.name}</div>
                          <div className="text-[11px] text-phumulani-charcoal mt-0.5 line-clamp-2">{desc.description}</div>
                          <div className="text-[10px] text-phumulani-earth font-medium mt-1">Recommended: {desc.recommendedAuthMethod}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Authentication & Security Credentials */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Official Provider Authorization</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    Initiate official authorization. Account will NOT be marked connected until the provider validates authorization.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Authentication Method</label>
                    <select
                      value={selectedAuthMethod}
                      onChange={(e) => setSelectedAuthMethod(e.target.value as AuthMethodType)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream focus:outline-none focus:ring-2 focus:ring-phumulani-cream"
                    >
                      <option value="OAUTH2">OAuth 2.0 PKCE Authorization Code (Gmail & Outlook)</option>
                      <option value="APP_PASSWORD">App-Specific Password (Yahoo, iCloud, Zoho)</option>
                      <option value="PASSWORD">Standard Server Password (TLS IMAP/SMTP)</option>
                      <option value="TOKEN">Bearer API Token (Custom Gateway)</option>
                    </select>
                  </div>

                  {/* REAL OAUTH 2.0 PKCE SECTION */}
                  {selectedAuthMethod === 'OAUTH2' && (
                    <div className="space-y-3 p-4 rounded-xl bg-phumulani-cream border border-phumulani-cream">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xs text-phumulani-charcoal">
                            {selectedProvider === 'MICROSOFT' ? 'Microsoft Entra ID' : 'Google Workspace'} OAuth 2.0 PKCE Flow
                          </div>
                          <div className="text-[11px] text-phumulani-charcoal">
                            Server generates cryptographic PKCE verifier, challenge, and CSRF state token.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleInitiateOAuthInWizard}
                          disabled={isInitiatingOAuth}
                          className="px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-lg text-xs font-semibold shadow transition-colors"
                        >
                          {isInitiatingOAuth ? 'Generating...' : 'Initiate Authorization'}
                        </button>
                      </div>

                      {oauthConfigError && (
                        <div className="p-3 rounded-lg bg-phumulani-cream border border-phumulani-gold text-phumulani-charcoal text-xs space-y-1">
                          <div className="font-bold">
                            {oauthConfigError.code || 'BLOCKED_BY_CONFIGURATION'}: Provider OAuth Credentials Missing
                          </div>
                          <div>{oauthConfigError.message}</div>
                          {oauthConfigError.missingEnvVars && (
                            <div className="font-mono text-[11px]">
                              Required server env vars: {oauthConfigError.missingEnvVars.join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {oauthData && (
                        <div className="space-y-3 pt-3 border-t border-phumulani-cream text-xs">
                          <div className="bg-white p-3 rounded-lg border border-phumulani-cream space-y-1.5">
                            <div className="text-phumulani-earth font-bold flex items-center justify-between">
                              <span>Authorization Challenge Generated</span>
                              <span className="text-[10px] text-phumulani-charcoal font-mono">TTL: 10m</span>
                            </div>
                            <div className="text-[11px] text-phumulani-charcoal font-mono break-all">
                              <strong>Client ID:</strong> {oauthData.clientId}
                            </div>
                            <div className="text-[11px] text-phumulani-charcoal font-mono break-all">
                              <strong>Redirect URI:</strong> {oauthData.redirectUri}
                            </div>
                            <div className="text-[11px] text-phumulani-charcoal">
                              <strong>Requested Scopes:</strong> {oauthData.scopes.join(', ')}
                            </div>
                            <div className="pt-2">
                              <a
                                href={oauthData.authUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-lg text-xs font-semibold shadow transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open Provider Consent Screen
                              </a>
                            </div>
                          </div>

                          {/* Code Exchange Verification */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-semibold text-phumulani-charcoal">
                              Verify Authorization Code
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={oauthAuthCodeInput}
                                onChange={(e) => setOauthAuthCodeInput(e.target.value)}
                                placeholder="Paste authorization code returned from provider callback"
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-phumulani-cream font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleExchangeOAuthCode}
                                disabled={isExchangingCode || !oauthAuthCodeInput.trim()}
                                className="px-3.5 py-1.5 bg-phumulani-green hover:bg-phumulani-teal text-phumulani-charcoal rounded-lg text-xs font-semibold disabled:opacity-50"
                              >
                                {isExchangingCode ? 'Exchanging...' : 'Exchange & Verify'}
                              </button>
                            </div>
                            {oauthVerified && (
                              <div className="text-phumulani-earth text-[11px] font-bold flex items-center gap-1">
                                <svg className="w-4 h-4 text-phumulani-earth" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Provider authorization validated and tokens successfully vaulted!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedAuthMethod === 'PASSWORD' || selectedAuthMethod === 'APP_PASSWORD') && (
                    <div>
                      <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">
                        {selectedAuthMethod === 'APP_PASSWORD' ? 'App-Specific Password' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={selectedAuthMethod === 'APP_PASSWORD' ? appPassword : password}
                        onChange={(e) =>
                          selectedAuthMethod === 'APP_PASSWORD'
                            ? setAppPassword(e.target.value)
                            : setPassword(e.target.value)
                        }
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-phumulani-cream focus:outline-none focus:ring-2 focus:ring-phumulani-cream"
                      />
                    </div>
                  )}

                  {selectedProvider === 'IMAP_SMTP' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-phumulani-charcoal mb-0.5">IMAP Host</label>
                        <input
                          type="text"
                          value={imapHost}
                          onChange={(e) => setImapHost(e.target.value)}
                          placeholder="imap.domain.org"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-phumulani-cream"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-phumulani-charcoal mb-0.5">IMAP Port (TLS)</label>
                        <input
                          type="number"
                          value={imapPort}
                          onChange={(e) => setImapPort(parseInt(e.target.value, 10))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-phumulani-cream"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-phumulani-charcoal mb-0.5">SMTP Host</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          placeholder="smtp.domain.org"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-phumulani-cream"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-phumulani-charcoal mb-0.5">SMTP Port (STARTTLS)</label>
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(parseInt(e.target.value, 10))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-phumulani-cream"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: TLS Handshake & Verification */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Test Connection & TLS Handshake</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    Verify connectivity to provider endpoints, cipher negotiation, and DNS resolution before finalizing.
                  </p>

                  <button
                    onClick={handleTestVerify}
                    disabled={isVerifying}
                    className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl text-xs font-semibold shadow transition-colors"
                  >
                    {isVerifying ? 'Verifying TLS...' : 'Execute Connection Test'}
                  </button>

                  {verificationHealth && (
                    <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      verificationHealth.healthy
                        ? 'bg-phumulani-cream border-phumulani-green text-phumulani-charcoal'
                        : 'bg-phumulani-cream border-phumulani-earth text-phumulani-earth'
                    }`}>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${verificationHealth.healthy ? 'bg-phumulani-green' : 'bg-phumulani-orange'}`}></span>
                        Status: {verificationHealth.status} ({verificationHealth.roundTripLatencyMs}ms)
                      </div>
                      <div><strong>TLS Protocol:</strong> {verificationHealth.tlsVersion}</div>
                      <div><strong>Cipher Suite:</strong> {verificationHealth.cipherSuite}</div>
                      <div><strong>DNS Resolution:</strong> {verificationHealth.dnsResolution}</div>
                      <div>{verificationHealth.diagnosticsDetail}</div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Permissions & Safeguarding */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Governance & Safeguarding Settings</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    Configure institutional ownership and data isolation classification.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Account Owner</label>
                    <input
                      type="text"
                      value={accountOwner}
                      onChange={(e) => setAccountOwner(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Sending Permission Level</label>
                    <select
                      value={sendingPermission}
                      onChange={(e) => setSendingPermission(e.target.value as ConnectorSendingPermission)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream font-semibold"
                    >
                      <option value="AUTHORIZED_PILOT">Authorized Pilot (Requires Human Approval Gate)</option>
                      <option value="LIVE_AUTHORIZED">Live Authorized (Human Approval Enforced)</option>
                      <option value="DISARMED_STAGING">Disarmed Staging (Dry-run only)</option>
                      <option value="DISABLED">Disabled (Inbound Only / Read Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-phumulani-charcoal mb-1">Safeguarding Air-Gap Classification</label>
                    <select
                      value={safeguardingClassification}
                      onChange={(e) =>
                        setSafeguardingClassification(
                          e.target.value as 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream font-semibold"
                    >
                      <option value="GENERAL">General Operational Communications</option>
                      <option value="RESTRICTED">Restricted Executive / Casework Communications</option>
                      <option value="CONFIDENTIAL_SAFEGUARDING_AIR_GAP">
                        CONFIDENTIAL AIR-GAP: Category 01 GBV/VAWA (No AI auto-reply, strict air-gap)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 6: Confirmation & Review */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-phumulani-charcoal">Review & Complete Registration</h4>
                  <p className="text-xs text-phumulani-charcoal">
                    Confirm configuration parameters before registering this mailbox into the universal connector registry.
                  </p>
                  <div className="bg-phumulani-cream rounded-xl p-4 border border-phumulani-cream text-xs space-y-2">
                    <div><strong>Mailbox Email:</strong> {wizardEmail}</div>
                    <div><strong>Provider:</strong> {PROVIDER_DESCRIPTORS[selectedProvider]?.name || selectedProvider}</div>
                    <div><strong>Authentication:</strong> {selectedAuthMethod} {oauthVerified && '(Verified via PKCE)'}</div>
                    <div><strong>Owner / Department:</strong> {accountOwner} ({department})</div>
                    <div><strong>Permission:</strong> {sendingPermission}</div>
                    <div>
                      <strong>Safeguarding:</strong>{' '}
                      <span className={safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP' ? 'text-phumulani-earth font-bold' : 'text-phumulani-charcoal'}>
                        {safeguardingClassification}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-phumulani-cream px-6 py-4 border-t border-phumulani-cream flex items-center justify-between shrink-0">
              <button
                onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                disabled={wizardStep === 1}
                className="px-4 py-2 text-xs font-semibold text-phumulani-charcoal hover:text-phumulani-earth disabled:opacity-40 transition-colors"
              >
                Back
              </button>
              {wizardStep < 6 ? (
                <button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  disabled={!EMAIL_FORMAT_REGEX.test(wizardEmail.trim())}
                  className="px-5 py-2 text-xs font-semibold bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl shadow disabled:opacity-50 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSaveConnection}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold bg-phumulani-green hover:bg-phumulani-teal text-phumulani-charcoal rounded-xl shadow transition-colors"
                >
                  {isSaving ? 'Registering...' : 'Confirm & Save Connection'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PERMISSIONS MODAL                                                    */}
      {/* ========================================================================= */}
      {editingPermissionsConn && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">Mailbox Permissions & Policy</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{editingPermissionsConn.emailAddress}</p>
              </div>
              <button
                onClick={() => setEditingPermissionsConn(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-phumulani-charcoal font-semibold mb-1">Account Owner</label>
                <input
                  type="text"
                  value={editOwner}
                  onChange={(e) => setEditOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream"
                />
              </div>

              <div>
                <label className="block text-phumulani-charcoal font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream"
                />
              </div>

              <div>
                <label className="block text-phumulani-charcoal font-semibold mb-1">Sending Permission</label>
                <select
                  value={editPermission}
                  onChange={(e) => setEditPermission(e.target.value as ConnectorSendingPermission)}
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream font-semibold"
                >
                  <option value="AUTHORIZED_PILOT">AUTHORIZED_PILOT (Standard Human Approval Gating)</option>
                  <option value="LIVE_AUTHORIZED">LIVE_AUTHORIZED (Strict Human Approval Gating)</option>
                  <option value="DISARMED_STAGING">DISARMED_STAGING (Dispatches Held in Staging)</option>
                  <option value="DISABLED">DISABLED (Read-Only / Inbound Synced)</option>
                </select>
              </div>

              <div>
                <label className="block text-phumulani-charcoal font-semibold mb-1">Safeguarding Air-Gap Classification</label>
                <select
                  value={editSafeguarding}
                  onChange={(e) =>
                    setEditSafeguarding(
                      e.target.value as 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-phumulani-cream font-semibold"
                >
                  <option value="GENERAL">GENERAL — Standard Communications</option>
                  <option value="RESTRICTED">RESTRICTED — Executive / Casework</option>
                  <option value="CONFIDENTIAL_SAFEGUARDING_AIR_GAP">
                    CONFIDENTIAL_SAFEGUARDING_AIR_GAP — VAWA 1367 Survivor Air-Gap
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setEditingPermissionsConn(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl text-xs font-semibold shadow"
              >
                {isSavingPermissions ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAUTHORIZATION MODAL                                                    */}
      {/* ========================================================================= */}
      {reauthorizingConn && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">Reauthorize Account Connection</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{reauthorizingConn.emailAddress}</p>
              </div>
              <button
                onClick={() => setReauthorizingConn(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-phumulani-charcoal">
              Re-authenticate with the provider to refresh tokens, renew API access, and resume automatic background synchronization.
            </p>

            {reauthData && (
              <div className="space-y-3">
                <a
                  href={reauthData.authUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white text-xs font-semibold rounded-xl shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open {reauthorizingConn.provider} Login Screen
                </a>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-phumulani-charcoal">Enter Authorization Code</label>
                  <input
                    type="text"
                    value={reauthCodeInput}
                    onChange={(e) => setReauthCodeInput(e.target.value)}
                    placeholder="Enter code from provider redirect..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-phumulani-cream font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setReauthorizingConn(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteReauthorize}
                disabled={isReauthorizing || !reauthCodeInput.trim()}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-xl text-xs font-semibold shadow disabled:opacity-50"
              >
                {isReauthorizing ? 'Exchanging...' : 'Complete Reauthorization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SYNC HISTORY & DIAGNOSTICS MODAL                                          */}
      {/* ========================================================================= */}
      {inspectSyncHistory && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">Synchronization History & Error Log</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{inspectSyncHistory.emailAddress}</p>
              </div>
              <button
                onClick={() => setInspectSyncHistory(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-cream space-y-1.5">
                <div className="font-bold text-phumulani-charcoal">Mailbox Checkpoint Metadata</div>
                <div><strong>Current State:</strong> {getMailboxUIState(inspectSyncHistory)}</div>
                <div><strong>Sync Cursor:</strong> {inspectSyncHistory.syncCursor || 'Initial checkpoint'}</div>
                <div><strong>Cursor Type:</strong> {inspectSyncHistory.cursorType || 'N/A'}</div>
                <div><strong>Last Successful Sync:</strong> {inspectSyncHistory.lastSuccessfulSyncAt ? new Date(inspectSyncHistory.lastSuccessfulSyncAt).toLocaleString() : 'Never'}</div>
                <div><strong>Sync Failure Count:</strong> {inspectSyncHistory.syncFailureCount || 0}</div>
              </div>

              {inspectSyncHistory.lastError ? (
                <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-earth text-phumulani-earth space-y-1">
                  <div className="font-bold">Recent Connection Error:</div>
                  <div className="font-mono text-[11px] break-all">{inspectSyncHistory.lastError}</div>
                </div>
              ) : (
                <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-green text-phumulani-charcoal">
                  No active connection errors reported. Provider session is operating normally.
                </div>
              )}

              {inspectSyncHistory.currentEvidence && (
                <div className="p-3 bg-phumulani-cream rounded-xl border border-phumulani-cream space-y-1">
                  <div className="font-bold text-phumulani-charcoal">Latest TLS Handshake Diagnostic</div>
                  <div><strong>Round-Trip Latency:</strong> {inspectSyncHistory.currentEvidence.roundTripLatencyMs}ms</div>
                  <div><strong>TLS Protocol:</strong> {inspectSyncHistory.currentEvidence.tlsVersion}</div>
                  <div><strong>Cipher Suite:</strong> {inspectSyncHistory.currentEvidence.cipherSuite}</div>
                  <div><strong>DNS Resolution:</strong> {inspectSyncHistory.currentEvidence.dnsResolution}</div>
                  <div className="text-phumulani-charcoal">{inspectSyncHistory.currentEvidence.diagnosticsDetail}</div>
                </div>
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setInspectSyncHistory(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capability Inspection Modal */}
      {inspectCapabilities && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-phumulani-charcoal text-base">
                Capability Matrix — {PROVIDER_DESCRIPTORS[inspectCapabilities.provider]?.name || inspectCapabilities.provider}
              </h4>
              <button
                onClick={() => setInspectCapabilities(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(inspectCapabilities.capabilities).map(([key, val]) => (
                <div key={key} className="p-2 rounded-lg bg-phumulani-cream border border-phumulani-cream flex items-center justify-between">
                  <span className="text-phumulani-charcoal">{key.replace(/^supports/, '')}:</span>
                  <span className={`font-semibold ${typeof val === 'boolean' ? (val ? 'text-phumulani-earth' : 'text-phumulani-charcoal') : 'text-phumulani-charcoal'}`}>
                    {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : Array.isArray(val) ? val.join(', ') : String(val)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setInspectCapabilities(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence History Inspection Modal */}
      {inspectEvidence && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">Provider Verification Evidence</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{inspectEvidence.mailboxEmail}</p>
              </div>
              <button
                onClick={() => setInspectEvidence(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {inspectEvidence.evidenceHistory.length === 0 ? (
                <div className="p-4 text-center text-phumulani-charcoal">No evidence recorded yet.</div>
              ) : (
                inspectEvidence.evidenceHistory.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-phumulani-cream border border-phumulani-cream space-y-1">
                    <div className="flex items-center justify-between font-bold text-phumulani-charcoal">
                      <span>Status: {ev.state}</span>
                      <span className="text-[10px] text-phumulani-charcoal font-mono">{new Date(ev.timestamp).toLocaleString()}</span>
                    </div>
                    <div><strong>Latency:</strong> {ev.roundTripLatencyMs}ms · <strong>TLS:</strong> {ev.tlsVersion} ({ev.cipherSuite})</div>
                    <div><strong>DNS:</strong> {ev.dnsResolution}</div>
                    <div className="text-phumulani-charcoal">{ev.diagnosticsDetail}</div>
                  </div>
                ))
              )}
            </div>
            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setInspectEvidence(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Inspection Modal */}
      {inspectFolders && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">Folder Inspection</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{inspectFolders.mailboxEmail}</p>
              </div>
              <button
                onClick={() => setInspectFolders(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
              {inspectFolders.folders.map((f) => (
                <div key={f.id} className="p-2.5 rounded-xl bg-phumulani-cream border border-phumulani-cream flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-phumulani-charcoal">{f.name}</span>
                    <span className="text-[10px] text-phumulani-charcoal ml-2 font-mono">({f.type})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-phumulani-charcoal">{f.totalMessageCount} msgs</span>
                    {f.unreadMessageCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-phumulani-cream text-phumulani-earth font-bold">
                        {f.unreadMessageCount} new
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setInspectFolders(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Triage & Recommendation Modal */}
      {triageModal && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-phumulani-cream p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-phumulani-charcoal text-base">AI Governed Triage Inspection</h4>
                <p className="text-xs text-phumulani-charcoal font-mono">{triageModal.mailboxEmail}</p>
              </div>
              <button
                onClick={() => setTriageModal(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {triageModal.result && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-xl space-y-1">
                  <div><strong>Classified Category:</strong> {triageModal.result.category}</div>
                  <div><strong>Assigned Priority:</strong> {triageModal.result.priority}</div>
                  <div><strong>Recommended Department:</strong> {triageModal.result.suggestedDepartment}</div>
                  <div>
                    <strong>Safeguarding Air-Gap:</strong>{' '}
                    <span className={triageModal.result.isSafeguarding ? 'text-phumulani-earth font-bold' : 'text-phumulani-charcoal'}>
                      {triageModal.result.isSafeguarding ? 'ENFORCED (Category 01 Isolated)' : 'Standard Pipeline'}
                    </span>
                  </div>
                </div>
                {triageModal.result.aiDraftSuggestion && (
                  <div className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-xl space-y-1">
                    <div className="font-bold text-phumulani-charcoal">AI Suggested Draft (Subject to Human Approval):</div>
                    <div className="text-phumulani-charcoal font-mono whitespace-pre-line text-[11px]">
                      {triageModal.result.aiDraftSuggestion}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setTriageModal(null)}
                className="px-4 py-2 bg-phumulani-cream hover:bg-phumulani-cream text-phumulani-charcoal rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
