/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrimaryButton — Brand-Consistent Accessible Button Component
 * Palette: Deep Earth (#B3340F), Peace Orange (#EF5C2C), Healing Teal (#62C4B4), Charcoal (#333333)
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
      'bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-heading font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth',
    secondary:
      'bg-phumulani-teal hover:bg-phumulani-cream text-phumulani-charcoal font-heading font-bold shadow-xs border border-phumulani-charcoal/20 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth',
    outline:
      'bg-white hover:bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/40 font-heading font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth',
    danger:
      'bg-phumulani-earth hover:bg-phumulani-charcoal text-white font-heading font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-phumulani-earth',
    ghost:
      'bg-transparent hover:bg-phumulani-cream text-phumulani-charcoal font-heading font-medium transition-colors',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer select-none whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
