import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Shuffle, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import type { QuestionSet, Question } from '../types/questionSet';
import { Button } from '../components/ui/Button';
import { loadQuestionSet, type LoaderError } from '../data/testSetLoader';
import {
  filterQuestionsBySubjects,
  getMixQuestions,
  getSubjectSummaries,
} from '../data/subjectMapper';
import { SubjectSelection } from '../features/quiz/SubjectSelection';
import { QuizRunner } from '../features/quiz/QuizRunner';
import { QuizResults } from '../features/quiz/QuizResults';
import type {
  QuizFlowStep,
  QuizAttemptQuestion,
  UserSelectedAnswers,
  EvaluatedQuestionReview,
  QuizScoreSummary,
} from '../features/quiz/types';

/**
 * ModePlaceholderPage
 * 
 * Orchestrates the full QuizSet examination flow:
 * 1. Selection / Configuration (No questions or answer keys exposed)
 * 2. Active Test Attempt (One question at a time, neutral choices, zero feedback)
 * 3. Submission Confirmation & Score Evaluation
 * 4. Post-Submission Review (Answers and keys visible only here)
 */
export const ModePlaceholderPage: React.FC = () => {
  const { setId, mode } = useParams<{ setId: string; mode: string }>();
  const navigate = useNavigate();

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(setId));
  const [loadError, setLoadError] = useState<LoaderError | null>(null);

  // Flow step: 'selection' -> 'taking' -> 'results'
  const [flowStep, setFlowStep] = useState<QuizFlowStep>('selection');

  // Selected subjects for Custom Subject mode
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // User responses dictionary
  const [userAnswers, setUserAnswers] = useState<UserSelectedAnswers>({});

  // Active session questions with answer keys (retained in parent state for scoring)
  const [sessionFullQuestions, setSessionFullQuestions] = useState<Question[]>([]);

  // Computed results after submission
  const [scoreSummary, setScoreSummary] = useState<QuizScoreSummary | null>(null);
  const [reviewItems, setReviewItems] = useState<EvaluatedQuestionReview[]>([]);

  const isCustomMode = mode === 'custom-subject';
  const modeLabel = isCustomMode ? 'Custom Subject' : 'Mix Questions';

  useEffect(() => {
    if (!setId) return;

    let isMounted = true;
    loadQuestionSet(setId)
      .then((result) => {
        if (!isMounted) return;
        if (result.success) {
          setQuestionSet(result.data);
          // By default, pre-select all subjects for Custom Subject mode
          setSelectedSubjectIds(result.data.subjects.map((s) => s.id));
        } else {
          setLoadError(result.error);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError({
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Failed to load test set',
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setId]);

  // Strip answers for active attempt questions
  const attemptQuestions: QuizAttemptQuestion[] = useMemo(() => {
    return sessionFullQuestions.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      question: q.question,
      options: q.options,
      questionNumber: q.questionNumber,
    }));
  }, [sessionFullQuestions]);

  // Handle subject toggling in Custom Subject mode
  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    );
  };

  const handleSelectAll = () => {
    if (!questionSet) return;
    setSelectedSubjectIds(questionSet.subjects.map((s) => s.id));
  };

  const handleClearAll = () => {
    setSelectedSubjectIds([]);
  };

  // Launch Quiz Attempt
  const handleStartQuiz = () => {
    if (!questionSet) return;

    let targetQuestions: Question[] = [];
    if (isCustomMode) {
      targetQuestions = filterQuestionsBySubjects(questionSet, selectedSubjectIds, {
        verifiedOnly: true,
      });
    } else {
      targetQuestions = getMixQuestions(questionSet, {
        verifiedOnly: true,
        shuffle: false,
      });
    }

    if (targetQuestions.length === 0) return;

    setSessionFullQuestions(targetQuestions);
    setUserAnswers({});
    setFlowStep('taking');
  };

  // Update answer selection during quiz
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleClearAnswer = (questionId: string) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // Final submission & score evaluation
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    let incorrectCount = 0;

    const evaluatedReviews: EvaluatedQuestionReview[] = sessionFullQuestions.map((q) => {
      const userSelected = userAnswers[q.id];
      const isAttempted = typeof userSelected === 'number';
      const isCorrect = isAttempted && userSelected === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
      } else if (isAttempted) {
        incorrectCount++;
      }

      return {
        question: q,
        userSelectedIndex: isAttempted ? userSelected : null,
        correctIndex: q.correctAnswer,
        isCorrect,
        isAttempted,
      };
    });

    const totalQuestions = sessionFullQuestions.length;
    const attemptedCount = correctCount + incorrectCount;
    const unattemptedCount = totalQuestions - attemptedCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    setScoreSummary({
      totalQuestions,
      attemptedCount,
      unattemptedCount,
      unansweredCount: unattemptedCount,
      correctCount,
      incorrectCount,
      scorePercentage,
    });
    setReviewItems(evaluatedReviews);
    setFlowStep('results');
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlowStep('taking');
  };

  const handleNewConfig = () => {
    setUserAnswers({});
    setFlowStep('selection');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb (Visible when not actively taking test) */}
        {flowStep !== 'taking' && (
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#172554] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md px-1 py-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Available test sets
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-8 text-center max-w-2xl shadow-sm">
            <div className="inline-block w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#64748B]">Loading test set...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && loadError && (
          <div className="bg-white border border-[#FECACA] rounded-[16px] p-6 sm:p-10 shadow-sm max-w-2xl">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-semibold text-[#172554] tracking-tight mb-2">
              Test set unavailable
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6">
              {loadError.message}
            </p>

            <Link to="/">
              <Button variant="primary">Return to Available test sets</Button>
            </Link>
          </div>
        )}

        {/* Flow Views */}
        {!isLoading && !loadError && questionSet && (
          <>
            {/* Step 1: Selection Screen */}
            {flowStep === 'selection' && (
              <>
                {isCustomMode ? (
                  <SubjectSelection
                    questionSet={questionSet}
                    selectedSubjectIds={selectedSubjectIds}
                    onToggleSubject={handleToggleSubject}
                    onSelectAll={handleSelectAll}
                    onClearAll={handleClearAll}
                    onGenerateQuiz={handleStartQuiz}
                  />
                ) : (
                  /* Mix Questions Launch Screen */
                  <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 sm:p-10 shadow-sm max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#DBEAFE] text-[#172554] font-medium text-sm mb-3">
                      <Shuffle className="w-4 h-4 text-[#2563EB]" />
                      <span>Mode: Mix Questions</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-semibold text-[#172554] tracking-tight mb-2">
                      {questionSet.title}
                    </h1>

                    <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6">
                      Practice questions mixed across all four subjects. All questions are loaded directly from the verified examination repository.
                    </p>

                    {/* Subject Pills */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {getSubjectSummaries(questionSet).map((s) => (
                        <div
                          key={s.id}
                          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-center"
                        >
                          <span className="text-xs text-[#64748B] block mb-1">{s.name}</span>
                          <span className="text-base font-semibold text-[#172554]">
                            {s.eligibleQuestions} questions
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleStartQuiz}
                      className="w-full sm:w-auto inline-flex items-center gap-2 px-8 min-h-[48px]"
                    >
                      <span>Start Mix Questions Quiz (160 Questions)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Active Test Taking Screen */}
            {flowStep === 'taking' && (
              <QuizRunner
                questions={attemptQuestions}
                userAnswers={userAnswers}
                onSelectAnswer={handleSelectAnswer}
                onClearAnswer={handleClearAnswer}
                onSubmitQuiz={handleSubmitQuiz}
                onExitQuiz={() => setFlowStep('selection')}
                modeLabel={modeLabel}
              />
            )}

            {/* Step 3: Result & Post-Submission Review Screen */}
            {flowStep === 'results' && scoreSummary && (
              <QuizResults
                summary={scoreSummary}
                reviews={reviewItems}
                testSetTitle={questionSet.title}
                modeLabel={modeLabel}
                onRetake={handleRetake}
                onNewConfig={handleNewConfig}
                onBackToSets={() => navigate('/')}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
