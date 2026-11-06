/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PublicFooter — Standardized Reusable Public Website Footer
 * Re-exports and binds the canonical Footer with brand tokens
 */

import React from 'react';
import { Footer } from '../Footer';

export interface PublicFooterProps {
  onViewChange?: (view: string) => void;
  onOpenReceipt?: () => void;
  onOpenMediaRegistry?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onViewChange = () => {},
  onOpenMediaRegistry,
}) => {
  return <Footer onViewChange={onViewChange} onOpenMediaRegistry={onOpenMediaRegistry} />;
};

export default PublicFooter;
