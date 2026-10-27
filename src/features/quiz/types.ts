import type { Question } from '../../types/questionSet';

export type QuizFlowStep = 'selection' | 'taking' | 'results';

/**
 * Stripped question representation for active test taking.
 * Completely excludes correct answer indices, keys, or status to prevent client inspection.
 */
export interface QuizAttemptQuestion {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  questionNumber?: number;
}

/**
 * User answers dictionary mapping questionId -> selected option index (0..4)
 */
export type UserSelectedAnswers = Record<string, number>;

/**
 * Complete evaluated question item for post-submission review.
 */
export interface EvaluatedQuestionReview {
  question: Question;
  userSelectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  isAttempted: boolean;
}

/**
 * Final evaluated score summary.
 */
export interface QuizScoreSummary {
  totalQuestions: number;
  attemptedCount: number;
  unattemptedCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
}

