/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrimaryButton — Brand-Consistent Accessible Button Component
 * Palette: Ubuntu Orange (#F05A28), Unity Teal (#006D6F), Heritage Red (#C62828)
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-5 py-2.5 text-xs sm:text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-sm sm:text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#F05A28] hover:bg-[#d94819] text-white font-heading font-bold shadow-xs hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F05A28]',
    secondary:
      'bg-[#006D6F] hover:bg-[#004A4C] text-white font-heading font-bold shadow-xs hover:shadow transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006D6F]',
    outline:
      'bg-white hover:bg-[#FFF7E6] text-[#006D6F] border-2 border-[#006D6F] font-heading font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#006D6F]',
    danger:
      'bg-[#C62828] hover:bg-[#a51d1d] text-white font-heading font-bold shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C62828]',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 font-heading font-medium transition-colors',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer select-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default PrimaryButton;
