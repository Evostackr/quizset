import React from 'react';
import { QuizSetLogo } from '../branding/QuizSetLogo';

/**
 * Header Component
 * 
 * Clean, lightweight, responsive navigation header displaying
 * the brand logo and a minimal contextual tag.
 */
export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <QuizSetLogo size="md" />
        
        {/* Simple, lightweight practice tag affordance - no auth or unnecessary menus */}
        <div className="flex items-center">
          <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full">
            MCQ Practice
          </span>
        </div>
      </div>
    </header>
  );
};

