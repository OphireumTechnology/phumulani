/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PublicHeader — Standardized Reusable Public Website Header
 * Re-exports and binds the canonical Header with brand tokens
 */

import React from 'react';
import { Header } from '../Header';
import { User } from '../../types';

export interface PublicHeaderProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = (props) => {
  return <Header {...props} />;
};

export default PublicHeader;
