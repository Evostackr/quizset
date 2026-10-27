import React from 'react';
import type { TestSet, QuizMode } from '../../types/testSet';
import { TestSetCard } from './TestSetCard';
import { Inbox } from 'lucide-react';

export interface TestSetGridProps {
  testSets: TestSet[];
  onSelectMode?: (setId: string, mode: QuizMode) => void;
}

/**
 * TestSetGrid component
 * 
 * Renders a responsive grid of test sets with graceful fallback handling
 * when the dataset is empty.
 */
export const TestSetGrid: React.FC<TestSetGridProps> = ({ testSets, onSelectMode }) => {
  if (testSets.length === 0) {
    return (
      <div className="w-full bg-white border border-[#E2E8F0] rounded-[16px] p-8 sm:p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#172554] mb-1">
          No test sets available yet.
        </h3>
        <p className="text-sm text-[#64748B] max-w-sm mx-auto">
          Question sets will appear here once configured and uploaded to the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testSets.map((testSet) => (
        <TestSetCard
          key={testSet.id}
          testSet={testSet}
          onSelectMode={onSelectMode}
        />
      ))}
    </div>
  );
};
