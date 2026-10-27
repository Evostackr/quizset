import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, FileText, Compass, type LucideIcon } from 'lucide-react';
import type { TestSet, QuizMode } from '../../types/testSet';
import { Button } from '../ui/Button';

export interface TestSetCardProps {
  testSet: TestSet;
  onSelectMode?: (setId: string, mode: QuizMode) => void;
}

const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  layers: Layers,
  'file-text': FileText,
  compass: Compass,
};

/**
 * Reusable TestSetCard component
 * 
 * Displays an individual test set surface with:
 * - Distinct set icon badge
 * - Title and descriptive placeholder text
 * - Primary action: "Custom Subject"
 * - Secondary action: "Mix Questions"
 * 
 * Excludes speculative counters, stats, or difficulty indicators.
 */
export const TestSetCard: React.FC<TestSetCardProps> = ({ testSet, onSelectMode }) => {
  const navigate = useNavigate();
  const IconComponent = (testSet.icon && iconMap[testSet.icon]) || BookOpen;

  const handleAction = (mode: QuizMode) => {
    if (onSelectMode) {
      onSelectMode(testSet.id, mode);
    } else {
      navigate(`/practice/${testSet.id}/${mode}`);
    }
  };

  return (
    <article
      className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 motion-reduce:transition-none focus-within:border-[#2563EB]"
      aria-labelledby={`test-set-title-${testSet.id}`}
    >
      <div>
        {/* Consistent Set Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-4">
          <IconComponent className="w-6 h-6" aria-hidden="true" />
        </div>

        {/* Set Title */}
        <h3
          id={`test-set-title-${testSet.id}`}
          className="text-lg sm:text-xl font-semibold text-[#172554] tracking-tight mb-2"
        >
          {testSet.title}
        </h3>

        {/* Placeholder Description */}
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">
          {testSet.description}
        </p>
      </div>

      {/* Mode Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Button
          variant="primary"
          onClick={() => handleAction('custom-subject')}
          aria-label={`Practice ${testSet.title} with Custom Subject`}
        >
          Custom Subject
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleAction('mix-questions')}
          aria-label={`Practice ${testSet.title} with Mix Questions`}
        >
          Mix Questions
        </Button>
      </div>
    </article>
  );
};

