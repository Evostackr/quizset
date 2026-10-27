import React, { useState, useMemo } from 'react';
import { RotateCcw, Sliders, Check, X } from 'lucide-react';
import type { EvaluatedQuestionReview, QuizScoreSummary } from './types';
import { Button } from '../../components/ui/Button';

export interface QuizResultsProps {
  summary: QuizScoreSummary;
  reviews: EvaluatedQuestionReview[];
  testSetTitle: string;
  modeLabel: string;
  onRetake: () => void;
  onNewConfig: () => void;
  onBackToSets: () => void;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unanswered';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * QuizResults Component
 * 
 * Rendered strictly post-submission:
 * - Displays accurate score, percentage, attempted/unattempted breakdown
 * - Detailed question review showing user answer vs correct answer key
 */
export const QuizResults: React.FC<QuizResultsProps> = ({
  summary,
  reviews,
  testSetTitle,
  modeLabel,
  onRetake,
  onNewConfig,
  onBackToSets,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredReviews = useMemo(() => {
    switch (activeFilter) {
      case 'correct':
        return reviews.filter((r) => r.isCorrect);
      case 'incorrect':
        return reviews.filter((r) => r.isAttempted && !r.isCorrect);
      case 'unanswered':
        return reviews.filter((r) => !r.isAttempted);
      case 'all':
      default:
        return reviews;
    }
  }, [reviews, activeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Score Summary Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#DBEAFE]">
            {modeLabel} &bull; Results
          </span>
          <span className="text-xs text-[#64748B]">{testSetTitle}</span>
        </div>

        <div className="text-center py-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#172554] tracking-tight mb-2">
            {summary.scorePercentage}%
          </h1>
          <p className="text-sm sm:text-base text-[#64748B]">
            You scored <strong className="text-[#172554]">{summary.correctCount}</strong> out of{' '}
            <strong className="text-[#172554]">{summary.totalQuestions}</strong> questions
          </p>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E2E8F0]">
          {/* Attempted */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-center">
            <span className="text-xs text-[#64748B] block mb-1">Attempted</span>
            <span className="text-xl font-bold text-[#172554]">{summary.attemptedCount}</span>
            <span className="text-xs text-[#64748B] block mt-0.5">
              of {summary.totalQuestions}
            </span>
          </div>

          {/* Correct */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-4 text-center">
            <span className="text-xs text-[#16A34A] font-medium block mb-1">Correct</span>
            <span className="text-xl font-bold text-[#16A34A]">{summary.correctCount}</span>
            <span className="text-xs text-[#16A34A] block mt-0.5">answers</span>
          </div>

          {/* Incorrect */}
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-4 text-center">
            <span className="text-xs text-[#DC2626] font-medium block mb-1">Incorrect</span>
            <span className="text-xl font-bold text-[#DC2626]">{summary.incorrectCount}</span>
            <span className="text-xs text-[#DC2626] block mt-0.5">answers</span>
          </div>

          {/* Unanswered */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-center">
            <span className="text-xs text-[#64748B] block mb-1">Unanswered</span>
            <span className="text-xl font-bold text-[#64748B]">{summary.unansweredCount}</span>
            <span className="text-xs text-[#64748B] block mt-0.5">skipped</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-6 border-t border-[#E2E8F0]">
          <Button
            variant="primary"
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-6"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>

          <Button
            variant="secondary"
            onClick={onNewConfig}
            className="inline-flex items-center gap-2 px-6"
          >
            <Sliders className="w-4 h-4" />
            Select Other Subjects
          </Button>

          <button
            type="button"
            onClick={onBackToSets}
            className="text-sm font-medium text-[#64748B] hover:text-[#172554] px-4 py-2 cursor-pointer"
          >
            Back to Available test sets
          </button>
        </div>
      </div>

      {/* Post-Submission Question Review Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-semibold text-[#172554]">
              Question Review
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Review your answers alongside official examination answer keys.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            {(
              [
                { id: 'all', label: `All (${reviews.length})` },
                { id: 'correct', label: `Correct (${summary.correctCount})` },
                { id: 'incorrect', label: `Incorrect (${summary.incorrectCount})` },
                { id: 'unanswered', label: `Unanswered (${summary.unansweredCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-white text-[#172554] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172554]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <p className="text-center py-8 text-sm text-[#64748B]">
              No questions found under the selected filter.
            </p>
          ) : (
            filteredReviews.map(({ question: q, userSelectedIndex, isCorrect, isAttempted }, index) => {
              return (
                <article
                  key={q.id}
                  className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172554] bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-md">
                        #{index + 1} {q.questionNumber ? `(Q${q.questionNumber})` : ''}
                      </span>
                      <span className="text-xs font-semibold text-[#64748B] capitalize">
                        {q.subjectId}
                      </span>
                    </div>

                    {/* Result Badge for this Question */}
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : isAttempted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FEE2E2] px-2.5 py-0.5 rounded-full">
                        <X className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
                        Unanswered
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="text-base text-[#172554] font-medium leading-relaxed my-3">
                    {q.question}
                  </h3>

                  {/* Options with Answer Highlight */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((optText, optIdx) => {
                      const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                      const isOptionCorrect = optIdx === q.correctAnswer;
                      const isOptionUserSelected = optIdx === userSelectedIndex;

                      let style = 'bg-white border-[#E2E8F0] text-[#334155]';
                      let badge = null;

                      if (isOptionCorrect) {
                        style = 'bg-[#F0FDF4] border-[#86EFAC] text-[#14532D] font-medium';
                        badge = (
                          <span className="text-xs font-bold text-[#16A34A] ml-auto">
                            Official Answer Key [{letter}]
                          </span>
                        );
                      } else if (isOptionUserSelected && !isOptionCorrect) {
                        style = 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]';
                        badge = (
                          <span className="text-xs font-semibold text-[#DC2626] ml-auto">
                            Your Selection [{letter}]
                          </span>
                        );
                      }

                      return (
                        <div
                          key={letter}
                          className={`flex items-start gap-2.5 p-3 rounded-lg text-sm border ${style}`}
                        >
                          <span
                            className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                              isOptionCorrect
                                ? 'bg-[#16A34A] text-white'
                                : isOptionUserSelected
                                ? 'bg-[#DC2626] text-white'
                                : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-snug pt-0.5">{optText}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

