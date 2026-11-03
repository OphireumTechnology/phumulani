# Phase 62: Microsoft 365 & Entra ID Integration Guide

## 1. Provider Overview
The Microsoft 365 connector integrates with Microsoft Entra ID (formerly Azure Active Directory) and Microsoft Graph API v1.0. It provides delegated mailbox access for regional outreach and corporate partnerships.

## 2. Microsoft Entra ID App Registration
- **Identity Platform:** Microsoft Graph REST API v1.0 (`https://graph.microsoft.com/v1.0/`).
- **OAuth Endpoints:**
  - Authorization: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize`
  - Token Exchange: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token`
- **Delegated Permissions:**
  - `openid profile offline_access`
  - `Mail.Read`
  - `Mail.ReadWrite`
  - `Mail.Send`
- **Redirect URIs:**
  - Local Dev / Preview: `http://localhost:3000/api/admin/email/oauth/microsoft/callback`
  - Production: `https://phumulani.org/api/admin/email/oauth/microsoft/callback`

## 3. Delta Token Synchronization (`MS_GRAPH_DELTA_TOKEN`)
Inbound messages are synchronized using Microsoft Graph Delta Query:
1. Initial sync queries `GET /v1.0/me/mailFolders('inbox')/messages/delta?$top=50`.
2. Follows `@odata.nextLink` until all pages are retrieved.
3. Caches `@odata.deltaLink` containing the durable delta token in `email_sync_cursors`.
4. Subsequent cycles query using the delta token to fetch only additions, edits, or removals.

## 4. Environment Variables
- `MICROSOFT_GRAPH_CLIENT_ID`: Entra ID Application (client) ID.
- `MICROSOFT_TENANT_ID`: Entra ID Directory (tenant) ID (or `common` / `organizations`).
- `MICROSOFT_GRAPH_CLIENT_SECRET`: Optional server-side secret if configured for confidential client flow.
