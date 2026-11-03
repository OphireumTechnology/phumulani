/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Connector Factory (Phase 62)
 */

import { EmailConnector } from './EmailConnector';
import { GmailConnector } from './GmailConnector';
import { Microsoft365Connector } from './Microsoft365Connector';
import { ImapSmtpConnector } from './ImapSmtpConnector';
import { EmailProviderType, ImapSmtpConfiguration } from '../types';

export class ConnectorFactory {
  public static createConnector(
    provider: EmailProviderType,
    connectionIdOrConfig?: string | Partial<ImapSmtpConfiguration>,
    emailAddressParam?: string,
    customConfigParam?: Partial<ImapSmtpConfiguration>
  ): EmailConnector {
    let connectionId = 'conn-default';
    let emailAddress = 'donations@phumulani.org';
    let customConfig = customConfigParam;

    if (typeof connectionIdOrConfig === 'string') {
      connectionId = connectionIdOrConfig;
      emailAddress = emailAddressParam || emailAddress;
    } else if (connectionIdOrConfig && typeof connectionIdOrConfig === 'object') {
      customConfig = connectionIdOrConfig;
      emailAddress = (customConfig as any).emailAddress || (customConfig as any).username || emailAddress;
      connectionId = (customConfig as any).connectionId || connectionId;
    }

    switch (provider) {
      case 'GOOGLE':
        return new GmailConnector(connectionId, emailAddress);

      case 'MICROSOFT':
        return new Microsoft365Connector(connectionId, emailAddress);

      case 'YAHOO':
        return new ImapSmtpConnector(
          connectionId,
          {
            emailAddress,
            imapHost: 'imap.mail.yahoo.com',
            imapPort: 993,
            imapSecurity: 'TLS',
            smtpHost: 'smtp.mail.yahoo.com',
            smtpPort: 465,
            smtpSecurity: 'TLS',
            authentication: 'APP_PASSWORD',
            ...customConfig,
          },
          'YAHOO'
        );

      case 'ZOHO':
        return new ImapSmtpConnector(
          connectionId,
          {
            emailAddress,
            imapHost: 'imappro.zoho.com',
            imapPort: 993,
            imapSecurity: 'TLS',
            smtpHost: 'smtppro.zoho.com',
            smtpPort: 465,
            smtpSecurity: 'TLS',
            authentication: 'APP_PASSWORD',
            ...customConfig,
          },
          'ZOHO'
        );

      case 'ICLOUD':
        return new ImapSmtpConnector(
          connectionId,
          {
            emailAddress,
            imapHost: 'imap.mail.me.com',
            imapPort: 993,
            imapSecurity: 'TLS',
            smtpHost: 'smtp.mail.me.com',
            smtpPort: 587,
            smtpSecurity: 'STARTTLS',
            authentication: 'APP_PASSWORD',
            ...customConfig,
          },
          'ICLOUD'
        );

      case 'IMAP_SMTP':
      case 'CUSTOM':
      default:
        return new ImapSmtpConnector(connectionId, customConfig, provider);
    }
  }
}
