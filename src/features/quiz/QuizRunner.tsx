import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  LayoutGrid,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { QuizAttemptQuestion, UserSelectedAnswers } from './types';
import { Button } from '../../components/ui/Button';

export interface QuizRunnerProps {
  questions: QuizAttemptQuestion[];
  userAnswers: UserSelectedAnswers;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onClearAnswer: (questionId: string) => void;
  onSubmitQuiz: () => void;
  onExitQuiz: () => void;
  modeLabel: string;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * QuizRunner Component
 * 
 * Clean, distraction-free quiz session interface:
 * - One question at a time
 * - Zero correct-answer leakage or feedback highlights
 * - Full navigation & answer change capability
 * - Confirmation modal before final submission
 */
export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  userAnswers,
  onSelectAnswer,
  onClearAnswer,
  onSubmitQuiz,
  onExitQuiz,
  modeLabel,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
    setShowPalette(false);
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Tracker */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#DBEAFE]">
              {modeLabel}
            </span>
            <span className="text-sm font-semibold text-[#172554]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowPalette(!showPalette)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-[#2563EB]" />
              <span>Question Palette ({answeredCount}/{totalQuestions})</span>
            </button>

            <button
              type="button"
              onClick={onExitQuiz}
              className="text-xs sm:text-sm text-[#64748B] hover:text-[#DC2626] cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-[#2563EB] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Jump Palette Drawer (Collapsible) */}
      {showPalette && (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#172554]">
              Jump to Question
            </span>
            <button
              type="button"
              onClick={() => setShowPalette(false)}
              className="text-[#64748B] hover:text-[#172554] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-16 gap-2 max-h-60 overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const isAnswered = typeof userAnswers[q.id] === 'number';
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-[#2563EB] bg-[#2563EB] text-white'
                      : isAnswered
                      ? 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Question Surface */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold text-[#172554] uppercase tracking-wider bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-md">
            Subject: {currentQuestion.subjectId}
          </span>
          {currentQuestion.questionNumber && (
            <span className="text-xs text-[#64748B]">
              Exam Ref: Q{currentQuestion.questionNumber}
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-medium text-[#172554] leading-relaxed mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options List (Neutral Selection State Only - Zero Answer Leakage) */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((optText, optIdx) => {
            const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
            const isSelected = currentAnswer === optIdx;

            return (
              <button
                key={letter}
                type="button"
                onClick={() => onSelectAnswer(currentQuestion.id, optIdx)}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3 select-none ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#172554] shadow-sm ring-1 ring-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                {/* Neutral Option Letter Badge */}
                <span
                  className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {letter}
                </span>

                <span className="text-sm sm:text-base leading-snug pt-0.5">
                  {optText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 sm:flex-initial inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 sm:flex-initial inline-flex items-center gap-1.5"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>

            {typeof currentAnswer === 'number' && (
              <button
                type="button"
                onClick={() => onClearAnswer(currentQuestion.id)}
                className="text-xs text-[#64748B] hover:text-[#DC2626] ml-2 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Submit Quiz Trigger */}
          <Button
            variant="primary"
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6"
          >
            <Send className="w-4 h-4" />
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 sm:p-8 max-w-md w-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#2563EB]" />
            </div>

            <h3 className="text-xl font-semibold text-[#172554] text-center mb-2">
              Submit Practice Quiz?
            </h3>

            <p className="text-sm text-[#64748B] text-center mb-6 leading-relaxed">
              You have answered <strong className="text-[#172554]">{answeredCount}</strong> of{' '}
              <strong className="text-[#172554]">{totalQuestions}</strong> questions.
              {unansweredCount > 0 && (
                <span className="block mt-1 text-[#DC2626]">
                  {unansweredCount} question{unansweredCount === 1 ? '' : 's'} remain unanswered.
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                className="w-full"
              >
                Continue Quiz
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmitQuiz();
                }}
                className="w-full"
              >
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

