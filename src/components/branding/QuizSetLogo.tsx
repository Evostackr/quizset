import React from 'react';
import { Link } from 'react-router-dom';

export interface QuizSetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  asLink?: boolean;
  className?: string;
}

/**
 * QuizSet Brand Logo Component
 * 
 * Renders the compact blue checkmark & quiz motif mark alongside
 * the refined QuizSet wordmark.
 */
export const QuizSetLogo: React.FC<QuizSetLogoProps> = ({
  size = 'md',
  showWordmark = true,
  asLink = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textDimensions = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <svg
        className={`${iconDimensions[size]} flex-shrink-0 transition-transform duration-150`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#2563EB" />
        {/* Subtle quiz card backdrop */}
        <rect x="7" y="6" width="18" height="20" rx="3" fill="#FFFFFF" fillOpacity="0.18" />
        {/* Clean checkmark representing focused practice & correct answers */}
        <path
          d="M10 16.5L14 20.5L22 12"
          stroke="#FFFFFF"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className={`font-semibold tracking-tight ${textDimensions[size]}`}>
          <span className="text-[#172554]">Quiz</span>
          <span className="text-[#2563EB]">Set</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg p-0.5"
        aria-label="QuizSet Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};

