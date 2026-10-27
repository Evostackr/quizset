import React from 'react';
import { QuizSetLogo } from '../branding/QuizSetLogo';

/**
 * Footer Component
 * 
 * Minimal footer containing QuizSet wordmark and simple copyright placeholder.
 * Strictly adheres to scope without extraneous company links.
 */
export const Footer: React.FC = () => {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-white border-t border-[#E2E8F0] mt-auto py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <QuizSetLogo size="sm" asLink={false} />
        
        <p className="text-xs sm:text-sm text-[#64748B]">
          &copy; {currentYear} QuizSet. Focused practice. Better preparation.
        </p>
      </div>
    </footer>
  );
};

