/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BrandLogo — Official Reusable Phumulani Logo Component
 * Source of Truth: /public/assets/aistudio/Phumulani_Mosaic_USA_Logo_3269971f.png
 * Brand Identity Guide: /public/assets/aistudio/Phumulani_Brand_Identity_Guide_23b89f10.png
 */

import React from 'react';
import { PhumulaniLogo, PhumulaniLogoProps } from '../branding/PhumulaniLogo';

export interface BrandLogoProps extends PhumulaniLogoProps {
  showWordmark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = (props) => {
  return <PhumulaniLogo {...props} />;
};

export default BrandLogo;
