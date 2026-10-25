-- ============================================================================
-- PHUMULANI AI-NATIVE COMMUNITY PLATFORM
-- PRODUCTION ENTERPRISE DATABASE SCHEMA (POSTGRESQL 15+)
-- VAWA & CJIS Compliant Architecture with Immutable Audit Trail
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ACCESS CONTROL, USERS, ROLES & PERMISSIONS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'visitor',
    'volunteer',
    'donor',
    'sponsor',
    'staff',
    'volunteer_coordinator',
    'finance_officer',
    'communications_officer',
    'executive_director',
    'board_member',
    'safeguarding_officer',
    'super_admin',
    'PLATFORM_SUPER_ADMIN',
    'governance_officer',
    'program_manager',
    'community_advocate',
    'community_member',
    'DEVELOPMENT_ADMIN',
    'DEVELOPER',
    'CLIENT_PROJECT_ADMIN',
    'CLIENT_PROJECT_VIEWER',
    'CLIENT_APPROVER'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'visitor',
    title VARCHAR(150),
    department VARCHAR(100),
    avatar_url TEXT,
    mfa_enabled BOOLEAN NOT NULL DEFAULT true,
    mfa_secret_encrypted TEXT,
    phone_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_permission UNIQUE (user_id, permission_key)
);

-- ============================================================================
-- 2. VOLUNTEER LIFECYCLE MANAGEMENT
-- ============================================================================

CREATE TYPE screening_status AS ENUM (
    'submitted',
    'screening_review',
    'background_check',
    'orientation_scheduled',
    'training_completed',
    'approved_active',
    'declined',
    'inactive'
);

CREATE TABLE volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    program_id VARCHAR(100) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    commitment_hours VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    languages_needed TEXT[] NOT NULL DEFAULT '{}',
    open_slots INT NOT NULL DEFAULT 5,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(50) NOT NULL DEFAULT 'English',
    opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE RESTRICT,
    opportunity_title VARCHAR(255) NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    availability TEXT[] NOT NULL DEFAULT '{}',
    motivation TEXT NOT NULL,
    status screening_status NOT NULL DEFAULT 'submitted',
    ai_suggested_match_notes TEXT,
    safeguarding_acknowledged BOOLEAN NOT NULL DEFAULT false,
    reviewed_by_user_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    staff_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_volunteer_applications_tracking ON volunteer_applications(tracking_id);
CREATE INDEX idx_volunteer_applications_status ON volunteer_applications(status);

CREATE TABLE volunteer_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    volunteer_name VARCHAR(255) NOT NULL,
    opportunity_title VARCHAR(255) NOT NULL,
    service_date DATE NOT NULL,
    hours NUMERIC(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    activity_description TEXT NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_by_user_id UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_volunteer_hours_volunteer ON volunteer_hours(volunteer_id);
CREATE INDEX idx_volunteer_hours_verified ON volunteer_hours(verified);

-- ============================================================================
-- 3. DONATIONS, FUNDRAISING CAMPAIGNS & 501(C)(3) RECONCILIATION
-- ============================================================================

CREATE TYPE payment_frequency AS ENUM ('one_time', 'monthly', 'annual');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL,
    raised_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    donor_count INT NOT NULL DEFAULT 0,
    deadline DATE NOT NULL,
    description TEXT NOT NULL,
    impact_metric VARCHAR(255) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    organization_name VARCHAR(255),
    lifetime_giving NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    donation_count INT NOT NULL DEFAULT 0,
    donor_tier VARCHAR(50) NOT NULL DEFAULT 'Supporter',
    is_anonymous_preference BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_donation_at TIMESTAMPTZ
);

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    frequency payment_frequency NOT NULL DEFAULT 'one_time',
    campaign_id UUID REFERENCES campaigns(id) ON DELETE RESTRICT,
    campaign_title VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    reconciled BOOLEAN NOT NULL DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    reconciled_by UUID REFERENCES users(id),
    provider_fee NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(10,2) GENERATED ALWAYS AS (amount - provider_fee) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donations_txn ON donations(transaction_id);
CREATE INDEX idx_donations_receipt ON donations(receipt_number);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);

-- ============================================================================
-- 4. EVENTS & CAPACITY ENFORCEMENT
-- ============================================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_virtual BOOLEAN NOT NULL DEFAULT false,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registered_count INT NOT NULL DEFAULT 0 CHECK (registered_count <= capacity),
    waitlist_count INT NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    accessibility_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    special_needs TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'checked_in', 'cancelled')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_email ON event_registrations(attendee_email);

-- ============================================================================
-- 5. CRM & STAKEHOLDER MANAGEMENT
-- ============================================================================

CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization_name VARCHAR(255),
    stakeholder_type VARCHAR(50) NOT NULL DEFAULT 'community_partner',
    engagement_score INT NOT NULL DEFAULT 50,
    tags TEXT[] NOT NULL DEFAULT '{}',
    assigned_staff_id UUID REFERENCES users(id),
    last_contact_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    conducted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. GRANTS & GOVERNANCE
-- ============================================================================

CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funder_name VARCHAR(255) NOT NULL,
    opportunity_title VARCHAR(255) NOT NULL,
    amount_requested NUMERIC(12,2) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'research',
    deadline DATE NOT NULL,
    program_target VARCHAR(100) NOT NULL,
    executive_approved BOOLEAN NOT NULL DEFAULT false,
    executive_approved_by UUID REFERENCES users(id),
    executive_approved_at TIMESTAMPTZ,
    ai_assistance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    meeting_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'proposed',
    summary TEXT NOT NULL,
    voting_result VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    mitigation TEXT NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    last_reviewed_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================================
-- 7. EMAIL AUTOMATION & INBOX TRIAGE
-- ============================================================================

CREATE TABLE inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'normal',
    is_safeguarding_alert BOOLEAN NOT NULL DEFAULT false,
    assigned_staff_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'unread',
    ai_draft_reply TEXT,
    ai_reasoning TEXT,
    approved_by_user_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ
);

CREATE INDEX idx_inbox_safeguarding ON inbox_messages(is_safeguarding_alert);
CREATE INDEX idx_inbox_status ON inbox_messages(status);

-- ============================================================================
-- 8. AI WORKFORCE ORCHESTRATION & HUMAN APPROVAL QUEUE
-- ============================================================================

CREATE TABLE ai_agents (
    id VARCHAR(10) PRIMARY KEY, -- e.g., 'A01' through 'A18'
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'supervised', 'shadow', 'paused')),
    version VARCHAR(20) NOT NULL DEFAULT '2.4.0',
    system_prompt_summary TEXT NOT NULL,
    tool_allowlist TEXT[] NOT NULL DEFAULT '{}',
    restricted_tools TEXT[] NOT NULL DEFAULT '{}',
    requires_human_approval BOOLEAN NOT NULL DEFAULT true,
    calls_this_month INT NOT NULL DEFAULT 0,
    token_usage BIGINT NOT NULL DEFAULT 0,
    cost_estimate_usd NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
    last_evaluation_score NUMERIC(5,2) NOT NULL DEFAULT 98.50,
    escalation_officer VARCHAR(150) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_approval_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(10) NOT NULL REFERENCES ai_agents(id),
    agent_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    proposed_content TEXT NOT NULL,
    context_summary TEXT NOT NULL,
    risk_score VARCHAR(20) NOT NULL DEFAULT 'low',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revised')),
    reviewed_by_user_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. RESTRICTED SURVIVOR SERVICES (VAWA / CJIS SEPARATE BOUNDARY)
-- Zero exposure to standard volunteer or public APIs
-- ============================================================================

CREATE TABLE restricted_intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_code VARCHAR(50) UNIQUE NOT NULL,
    urgency_level VARCHAR(50) NOT NULL,
    preferred_contact_method VARCHAR(50) NOT NULL,
    language_needed VARCHAR(50) NOT NULL DEFAULT 'English',
    safe_time_to_contact VARCHAR(100) NOT NULL,
    assigned_specialist VARCHAR(255) NOT NULL DEFAULT 'Sister Miriam K. (Safeguarding Lead)',
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    notes_encrypted_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Row-Level Security on Restricted Boundary
ALTER TABLE restricted_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY restricted_intakes_safeguarding_only ON restricted_intakes
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) IN ('safeguarding_officer', 'executive_director')
    );

-- ============================================================================
-- 10. AUTHENTIC MEDIA VAULT & PRESERVATION REGISTRY
-- Zero AI substitution for real survivors / community members
-- ============================================================================

CREATE TABLE media_registry (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    dimensions VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    depicted_subject VARCHAR(255) NOT NULL,
    safeguarding_review_status VARCHAR(50) NOT NULL DEFAULT 'cleared_for_public_web',
    publication_status VARCHAR(50) NOT NULL DEFAULT 'published',
    consent_status VARCHAR(50) NOT NULL DEFAULT 'approved',
    consent_recorded_date DATE NOT NULL,
    is_founder_media BOOLEAN NOT NULL DEFAULT false,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    copyright_credit VARCHAR(255) NOT NULL,
    local_backup_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. IMMUTABLE AUDIT TRAIL (APPEND-ONLY)
-- ============================================================================

CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'flagged', 'denied')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_timestamp ON audit_events(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_events(actor_email);
CREATE INDEX idx_audit_action ON audit_events(action);

-- Protect Audit Log from modification or deletion
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log is append-only and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update_delete
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- ============================================================================
-- 10. SYSTEM SETTINGS & OPERATIONAL POLICIES
-- ============================================================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    value JSONB NOT NULL,
    requires_reauth BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_system_settings_category ON system_settings(category);

-- ============================================================================
-- 11. PHASE 13: DEVELOPMENT TRANSPARENCY, GIT SYNC & CLIENT COLLABORATION
-- ============================================================================

CREATE TYPE milestone_dev_status AS ENUM (
    'NOT_STARTED',
    'IN_DEVELOPMENT',
    'IMPLEMENTED_UNVERIFIED',
    'TESTING',
    'BLOCKED',
    'READY_FOR_CLIENT_REVIEW',
    'CLIENT_APPROVED',
    'PRODUCTION_VERIFIED',
    'FAILED'
);

CREATE TABLE development_milestones (
    id VARCHAR(50) PRIMARY KEY,
    phase INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    dependencies TEXT[] NOT NULL DEFAULT '{}',
    assigned_owner VARCHAR(150) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    target_date TIMESTAMPTZ NOT NULL,
    actual_completion_date TIMESTAMPTZ,
    development_status milestone_dev_status NOT NULL DEFAULT 'NOT_STARTED',
    testing_status VARCHAR(50) NOT NULL DEFAULT 'UNTESTED',
    client_acceptance_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    evidence TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE development_features (
    id VARCHAR(50) PRIMARY KEY,
    milestone_id VARCHAR(50) REFERENCES development_milestones(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    assigned_owner VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'BACKLOG',
    acceptance_criteria TEXT[] NOT NULL DEFAULT '{}',
    evidence_sha VARCHAR(100),
    client_feedback_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE local_sync_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    local_path TEXT NOT NULL,
    controller_path TEXT NOT NULL,
    local_commit VARCHAR(100) NOT NULL,
    remote_commit VARCHAR(100) NOT NULL,
    ahead INT NOT NULL DEFAULT 0,
    behind INT NOT NULL DEFAULT 0,
    uncommitted_changes INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL,
    reported_by VARCHAR(150) NOT NULL,
    is_stale BOOLEAN NOT NULL DEFAULT false,
    sanitized_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    feedback_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    submitted_by VARCHAR(150) NOT NULL,
    submitter_email VARCHAR(255) NOT NULL,
    submitter_role VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    related_feature_id VARCHAR(50),
    assigned_developer VARCHAR(150),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE change_requests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    requested_by VARCHAR(150) NOT NULL,
    estimated_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
    budget_impact_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
    schedule_impact_days INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
    approved_by VARCHAR(150),
    approval_date TIMESTAMPTZ,
    implementation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE milestone_approvals (
    id VARCHAR(50) PRIMARY KEY,
    milestone_id VARCHAR(50) REFERENCES development_milestones(id),
    approver_id UUID REFERENCES users(id),
    approver_name VARCHAR(150) NOT NULL,
    approver_role VARCHAR(100) NOT NULL,
    decision VARCHAR(50) NOT NULL,
    approved_artifact_version VARCHAR(100) NOT NULL,
    comments TEXT NOT NULL,
    audit_reference VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weekly_development_reports (
    id VARCHAR(50) PRIMARY KEY,
    reporting_period VARCHAR(150) NOT NULL,
    executive_summary TEXT NOT NULL,
    completed_milestones TEXT[] NOT NULL DEFAULT '{}',
    active_milestones TEXT[] NOT NULL DEFAULT '{}',
    new_features_delivered TEXT[] NOT NULL DEFAULT '{}',
    tests_completed_count INT NOT NULL DEFAULT 0,
    tests_passed_count INT NOT NULL DEFAULT 0,
    github_activity_summary TEXT NOT NULL,
    deployment_status_summary TEXT NOT NULL,
    client_feedback_summary TEXT NOT NULL,
    pending_approvals TEXT[] NOT NULL DEFAULT '{}',
    risks_and_blockers TEXT[] NOT NULL DEFAULT '{}',
    next_development_priorities TEXT[] NOT NULL DEFAULT '{}',
    generated_by VARCHAR(150) NOT NULL,
    verified_by VARCHAR(150) NOT NULL,
    is_approved_for_distribution BOOLEAN NOT NULL DEFAULT true,
    published_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. PHASE 14: ENTERPRISE AI EMAIL MANAGER & SYNCHRONIZATION INFRASTRUCTURE
-- ============================================================================

CREATE TYPE mailbox_conn_status AS ENUM (
    'NOT_CONFIGURED',
    'AUTHORIZATION_REQUIRED',
    'CONNECTING',
    'CONNECTED',
    'SYNCING',
    'DEGRADED',
    'DISCONNECTED',
    'AUTHENTICATION_FAILED',
    'RATE_LIMITED',
    'ERROR'
);

CREATE TABLE enterprise_connected_mailboxes (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL DEFAULT 'Google Workspace',
    connection_state mailbox_conn_status NOT NULL DEFAULT 'CONNECTED',
    mailbox_type VARCHAR(50) NOT NULL DEFAULT 'primary',
    provider_account_id VARCHAR(150),
    auth_status VARCHAR(50) NOT NULL DEFAULT 'authorized',
    permission_scopes TEXT[] NOT NULL DEFAULT '{"gmail.readonly", "gmail.send", "gmail.modify"}',
    reauth_required BOOLEAN NOT NULL DEFAULT false,
    two_way_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    historical_import_status VARCHAR(50) NOT NULL DEFAULT 'completed',
    historical_import_progress NUMERIC(5,2) NOT NULL DEFAULT 100.0,
    historical_discovered INT NOT NULL DEFAULT 0,
    total_imported_messages INT NOT NULL DEFAULT 0,
    historical_remaining INT NOT NULL DEFAULT 0,
    sync_lag_seconds INT NOT NULL DEFAULT 15,
    sent_messages_reconciled INT NOT NULL DEFAULT 0,
    duplicates_prevented INT NOT NULL DEFAULT 0,
    auth_failures INT NOT NULL DEFAULT 0,
    rate_limit_events INT NOT NULL DEFAULT 0,
    attachment_sync_failures INT NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_scheduled_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enterprise_historical_import_jobs (
    id VARCHAR(50) PRIMARY KEY,
    mailbox_id VARCHAR(50) REFERENCES enterprise_connected_mailboxes(id),
    mailbox_email VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'idle',
    stage VARCHAR(50) NOT NULL DEFAULT 'completed',
    scope VARCHAR(50) NOT NULL DEFAULT 'all_history',
    total_found INT NOT NULL DEFAULT 0,
    imported_count INT NOT NULL DEFAULT 0,
    duplicates_skipped INT NOT NULL DEFAULT 0,
    safeguarding_quarantined INT NOT NULL DEFAULT 0,
    errors_count INT NOT NULL DEFAULT 0,
    cursor VARCHAR(150) NOT NULL,
    batch_size INT NOT NULL DEFAULT 50,
    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    is_resumable BOOLEAN NOT NULL DEFAULT true,
    last_checkpoint_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    audit_evidence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enterprise_mailbox_checkpoints (
    mailbox_id VARCHAR(50) PRIMARY KEY REFERENCES enterprise_connected_mailboxes(id),
    email VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    history_id VARCHAR(100) NOT NULL,
    delta_token VARCHAR(150) NOT NULL,
    last_successful_sync_at TIMESTAMPTZ NOT NULL,
    last_checkpoint_at TIMESTAMPTZ NOT NULL,
    new_messages_count INT NOT NULL DEFAULT 0,
    sent_messages_count INT NOT NULL DEFAULT 0,
    rate_limit_backoff_ms INT NOT NULL DEFAULT 0,
    backoff_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enterprise_email_threads (
    id VARCHAR(50) PRIMARY KEY,
    mailbox_id VARCHAR(50) REFERENCES enterprise_connected_mailboxes(id),
    mailbox_email VARCHAR(255) NOT NULL,
    thread_subject VARCHAR(500) NOT NULL,
    participant_emails TEXT[] NOT NULL DEFAULT '{}',
    message_count INT NOT NULL DEFAULT 1,
    last_message_at TIMESTAMPTZ NOT NULL,
    classification VARCHAR(50) NOT NULL DEFAULT '23_general_inquiries',
    priority VARCHAR(10) NOT NULL DEFAULT 'P3',
    status VARCHAR(50) NOT NULL DEFAULT 'unread',
    assigned_staff_name VARCHAR(150),
    sla_deadline TIMESTAMPTZ NOT NULL,
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    folder VARCHAR(50) NOT NULL DEFAULT 'INBOX',
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_historical BOOLEAN NOT NULL DEFAULT false,
    crm_entity_type VARCHAR(50),
    crm_entity_id VARCHAR(100),
    crm_entity_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_threads_mailbox ON enterprise_email_threads(mailbox_email);
CREATE INDEX idx_threads_classification ON enterprise_email_threads(classification);
CREATE INDEX idx_threads_priority ON enterprise_email_threads(priority);
CREATE INDEX idx_threads_status ON enterprise_email_threads(status);

CREATE TABLE enterprise_email_messages (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) REFERENCES enterprise_email_threads(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_text TEXT NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'inbound',
    provider_message_id VARCHAR(150),
    rfc_message_id VARCHAR(255),
    folder VARCHAR(50) NOT NULL DEFAULT 'INBOX',
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_historical BOOLEAN NOT NULL DEFAULT false,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_thread ON enterprise_email_messages(thread_id);
CREATE INDEX idx_messages_provider_id ON enterprise_email_messages(provider_message_id);
CREATE INDEX idx_messages_rfc_id ON enterprise_email_messages(rfc_message_id);

CREATE TABLE enterprise_outbound_authorizations (
    id VARCHAR(50) PRIMARY KEY,
    draft_id VARCHAR(50) NOT NULL,
    thread_id VARCHAR(50) REFERENCES enterprise_email_threads(id),
    sender_mailbox VARCHAR(255) NOT NULL,
    recipient_emails TEXT[] NOT NULL DEFAULT '{}',
    subject VARCHAR(500) NOT NULL,
    body_text TEXT NOT NULL,
    approved_by_user_id UUID REFERENCES users(id),
    approved_by_name VARCHAR(150) NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL,
    idempotency_key VARCHAR(150) UNIQUE NOT NULL,
    provider_submission_id VARCHAR(150),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'delivered',
    reconciled_in_sent_folder BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbound_auth_idempotency ON enterprise_outbound_authorizations(idempotency_key);

-- ============================================================================
-- 13. ENTERPRISE AI FUNDRAISING CRM, DONOR INTELLIGENCE & AI WORKFORCE (18 AGENTS)
-- ============================================================================

CREATE TABLE fundraising_donors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255),
    contact_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    giving_tier VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_channel VARCHAR(50) NOT NULL DEFAULT 'EMAIL',
    relationship_owner VARCHAR(150) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'PROSPECTING',
    lifetime_giving NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    largest_gift NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    gift_count INT NOT NULL DEFAULT 0,
    last_gift_date TIMESTAMPTZ,
    last_gift_amount NUMERIC(12,2),
    estimated_capacity NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    readiness_to_give VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    program_interests TEXT[] NOT NULL DEFAULT '{}',
    consent_status VARCHAR(50) NOT NULL DEFAULT 'OPTED_IN',
    consent_evidence TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fundraising_donors_stage ON fundraising_donors(stage);
CREATE INDEX idx_fundraising_donors_tier ON fundraising_donors(giving_tier);
CREATE INDEX idx_fundraising_donors_category ON fundraising_donors(category);

CREATE TABLE fundraising_ai_agents (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IDLE',
    assigned_tools TEXT[] NOT NULL DEFAULT '{}',
    restricted_tools TEXT[] NOT NULL DEFAULT '{}',
    requires_human_approval BOOLEAN NOT NULL DEFAULT true,
    escalation_officer VARCHAR(150) NOT NULL,
    completed_tasks_count INT NOT NULL DEFAULT 0,
    failed_tasks_count INT NOT NULL DEFAULT 0,
    pending_approvals_count INT NOT NULL DEFAULT 0,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 95.0,
    input_schema_summary TEXT NOT NULL,
    output_schema_summary TEXT NOT NULL,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fundraising_agents_category ON fundraising_ai_agents(category);
CREATE INDEX idx_fundraising_agents_status ON fundraising_ai_agents(status);

CREATE TABLE fundraising_agent_tasks (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) REFERENCES fundraising_ai_agents(id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    input_payload JSONB NOT NULL DEFAULT '{}',
    output_result TEXT,
    structured_output JSONB,
    duration_ms INT NOT NULL DEFAULT 0,
    requires_human_approval BOOLEAN NOT NULL DEFAULT false,
    approval_status VARCHAR(50) DEFAULT 'APPROVED',
    approved_by VARCHAR(150),
    error_message TEXT,
    audit_log_id VARCHAR(100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_tasks_agent_id ON fundraising_agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_status ON fundraising_agent_tasks(status);


