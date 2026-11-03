# Phase 62: Google Workspace Provider Integration Guide

## 1. Provider Overview
The Google Workspace connector provides deep integration with Google Cloud Platform, Google Workspace Admin, and Gmail REST API v1. It supports delegated OAuth 2.0 PKCE authentication and incremental synchronization via `GMAIL_HISTORY_ID`.

## 2. OAuth 2.0 PKCE Security Configuration
To eliminate client secret exposure in client-side or distributed environments, authentication uses Proof Key for Code Exchange (RFC 7636) with SHA-256 code challenge generation (`code_challenge_method=S256`).

- **OAuth Endpoints:**
  - Authorization: `https://accounts.google.com/o/oauth2/v2/auth`
  - Token Exchange: `https://oauth2.googleapis.com/token`
  - UserInfo: `https://openidconnect.googleapis.com/v1/userinfo`
- **Authorized Scopes:**
  - `openid email profile`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.modify`
- **Redirect URIs:**
  - Local Dev / Preview: `http://localhost:3000/api/admin/email/oauth/google/callback`
  - Production: `https://phumulani.org/api/admin/email/oauth/google/callback`

## 3. Incremental Synchronization via `GMAIL_HISTORY_ID`
Unlike full polling, the connector uses `history.list` tracking:
1. Initial synchronization records the starting `historyId`.
2. Subsequent sync cycles query `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId={cursor}`.
3. Only added, modified, or labeled messages are retrieved and ingested.
4. If a history cursor expires (HTTP 404 / 410 HISTORY_EXPIRED), the connector automatically triggers an incremental fallback sync to the last verified checkpoint.

## 4. Operational Classification
- Code Implementation: 100% COMPLETE (`GmailConnector.ts`, `OAuthService.ts`).
- Verification Mode: Dual-Mode (`STAGED_DEVELOPMENT` fixture verification passing 100%; `CONTROLLED_LIVE_PILOT` activated for `donations@phumulani.org` with real GCP credentials via environment variables `GOOGLE_WORKSPACE_CLIENT_ID` and `GOOGLE_WORKSPACE_CLIENT_SECRET`).
