import React from 'react';
import { Sliders, CheckSquare, Square, ArrowRight } from 'lucide-react';
import type { Subject, QuestionSet } from '../../types/questionSet';
import { Button } from '../../components/ui/Button';
import { getSubjectSummaries } from '../../data/subjectMapper';

export interface SubjectSelectionProps {
  questionSet: QuestionSet;
  selectedSubjectIds: string[];
  onToggleSubject: (subjectId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onGenerateQuiz: () => void;
}

/**
 * SubjectSelection Component
 * 
 * Allows students to choose one or more subjects to include in a Custom Subject practice quiz.
 * Displays question counts per subject and generates the quiz.
 * Strictly presents NO questions, options, or answer keys.
 */
export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  questionSet,
  selectedSubjectIds,
  onToggleSubject,
  onSelectAll,
  onClearAll,
  onGenerateQuiz,
}) => {
  const summaries = getSubjectSummaries(questionSet);

  // Compute total questions for selected subjects
  const selectedQuestionCount = summaries
    .filter((s) => selectedSubjectIds.includes(s.id))
    .reduce((sum, s) => sum + s.eligibleQuestions, 0);

  const allSelected = selectedSubjectIds.length === questionSet.subjects.length;
  const canGenerate = selectedSubjectIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Test Set Title Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#172554] font-medium text-sm mb-3">
          <Sliders className="w-4 h-4 text-[#2563EB]" />
          <span>Mode: Custom Subject</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#172554] tracking-tight mb-2">
          {questionSet.title}
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl">
          Select one or more subjects below to configure your tailored test. Questions will be drawn exclusively from your selected subjects.
        </p>
      </div>

      {/* Subject Selection Surface */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-semibold text-[#172554]">
              Available Subjects
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Choose at least one subject to generate your test session.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={allSelected ? onClearAll : onSelectAll}
              className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1.5 py-0.5"
            >
              {allSelected ? 'Deselect All' : 'Select All Subjects'}
            </button>
          </div>
        </div>

        {/* 4 Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {questionSet.subjects.map((sub: Subject) => {
            const isChecked = selectedSubjectIds.includes(sub.id);
            const summary = summaries.find((s) => s.id === sub.id);
            const questionCount = summary?.eligibleQuestions || 0;

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onToggleSubject(sub.id)}
                aria-pressed={isChecked}
                className={`p-5 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${isChecked
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#172554] shadow-sm ring-1 ring-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
              >
                <div>
                  <h3 className="font-semibold text-base text-[#172554] mb-0.5">
                    {sub.name}
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {questionCount} questions available
                  </span>
                </div>

                <div className="flex-shrink-0 ml-4">
                  {isChecked ? (
                    <CheckSquare className="w-6 h-6 text-[#2563EB]" />
                  ) : (
                    <Square className="w-6 h-6 text-[#94A3B8]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate Quiz Action Bar */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#334155]">
            <span className="font-semibold text-[#172554]">
              {selectedSubjectIds.length} {selectedSubjectIds.length === 1 ? 'subject' : 'subjects'} selected:
            </span>{' '}
            <span className="text-[#2563EB] font-medium">
              {selectedQuestionCount} total questions
            </span>
          </div>

          <Button
            variant="primary"
            onClick={onGenerateQuiz}
            disabled={!canGenerate}
            className="w-full sm:w-auto inline-flex items-center gap-2 px-8 min-h-[48px]"
          >
            <span>Generate Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

