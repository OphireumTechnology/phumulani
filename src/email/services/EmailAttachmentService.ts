/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email Attachment & Malware Quarantine Service (Phase 62)
 * Grounded in Section 14 of Phase 62 Directive
 */

import { NormalizedEmailAttachment } from '../types';

export class EmailAttachmentService {
  private static instance: EmailAttachmentService;
  private readonly MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  private readonly DANGEROUS_EXTENSIONS = new Set([
    '.exe',
    '.vbs',
    '.bat',
    '.cmd',
    '.scr',
    '.pif',
    '.ps1',
    '.jar',
    '.com',
    '.msi',
    '.cpl',
    '.hta',
    '.reg',
    '.wsf',
  ]);

  private constructor() {}

  public static getInstance(): EmailAttachmentService {
    if (!EmailAttachmentService.instance) {
      EmailAttachmentService.instance = new EmailAttachmentService();
    }
    return EmailAttachmentService.instance;
  }

  /**
   * Inspect and sanitize an attachment, quarantining dangerous executable formats
   */
  public inspectAttachment(attachment: {
    filename: string;
    sizeBytes: number;
    mimeType: string;
    contentBase64?: string;
  }): NormalizedEmailAttachment {
    const ext = this.getFileExtension(attachment.filename);
    const isDangerous = this.DANGEROUS_EXTENSIONS.has(ext);

    if (isDangerous) {
      return {
        id: `att-quarantine-${Date.now()}`,
        filename: attachment.filename,
        sizeBytes: attachment.sizeBytes,
        mimeType: attachment.mimeType,
        isQuarantined: true,
        quarantineReason: `MALICIOUS_EXTENSION_QUARANTINE: Disallowed executable extension ${ext} blocked under Phumulani Security Policy.`,
      };
    }

    if (attachment.sizeBytes > this.MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        id: `att-quarantine-${Date.now()}`,
        filename: attachment.filename,
        sizeBytes: attachment.sizeBytes,
        mimeType: attachment.mimeType,
        isQuarantined: true,
        quarantineReason: `SIZE_LIMIT_EXCEEDED: Attachment size exceeds the 25MB ceiling.`,
      };
    }

    return {
      id: `att-${Date.now()}`,
      filename: attachment.filename,
      sizeBytes: attachment.sizeBytes,
      mimeType: attachment.mimeType,
      isQuarantined: false,
      contentBase64: attachment.contentBase64,
    };
  }

  /**
   * Quick inspection of file name and size for quarantine checking
   */
  public inspectFile(filename: string, sizeBytes: number): { isAllowed: boolean; reason?: string } {
    const ext = this.getFileExtension(filename);
    if (this.DANGEROUS_EXTENSIONS.has(ext)) {
      return {
        isAllowed: false,
        reason: `MALICIOUS_EXTENSION_QUARANTINE: Disallowed executable extension ${ext} blocked under Phumulani Security Policy.`,
      };
    }
    if (sizeBytes > this.MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        isAllowed: false,
        reason: 'SIZE_LIMIT_EXCEEDED: Attachment size exceeds the 25MB ceiling.',
      };
    }
    return { isAllowed: true };
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot).toLowerCase();
  }
}

export const emailAttachmentService = EmailAttachmentService.getInstance();
