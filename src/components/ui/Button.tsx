import React from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Reusable Button component conforming to the QuizSet Design System.
 *
 * Guarantees a minimum 44px touch target, accessible contrast,
 * standard 150-200ms transitions, and motion-reduce compatibility.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = [
    'inline-flex items-center justify-center font-medium text-sm sm:text-base',
    'min-h-[44px] px-4 py-2.5 rounded-xl',
    'transition-all duration-200 motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer',
  ].join(' ');

  const variantStyles = {
    primary: [
      'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]',
      'focus-visible:ring-[#2563EB] shadow-sm',
    ].join(' '),
    secondary: [
      'bg-white text-[#172554] border border-[#E2E8F0]',
      'hover:bg-[#F8FAFC] hover:border-[#CBD5E1] active:bg-[#F1F5F9]',
      'focus-visible:ring-[#2563EB] shadow-sm',
    ].join(' '),
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

