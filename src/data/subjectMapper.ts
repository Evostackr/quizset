import type { QuestionSet, Subject, Question } from '../types/questionSet';

/**
 * Checks whether a question is eligible for a scored quiz.
 * 
 * Strict Content Rule: Only questions with answerStatus === 'verified'
 * are eligible for scored quiz practice. Questions marked 'needs_review'
 * are excluded.
 */
export function isQuestionEligible(question: Question): boolean {
  return question.answerStatus === 'verified';
}

export interface GetSubjectsOptions {
  /**
   * If true (default), only returns subjects having at least one verified question.
   */
  onlyEligible?: boolean;
}

/**
 * Returns available subjects from a question set.
 * Excludes subjects with zero eligible questions when onlyEligible is true.
 */
export function getAvailableSubjects(
  questionSet: QuestionSet,
  options: GetSubjectsOptions = { onlyEligible: true },
): Subject[] {
  const { onlyEligible = true } = options;

  if (!onlyEligible) {
    return [...questionSet.subjects];
  }

  // Count eligible questions per subject within this set
  const eligibleCounts = new Map<string, number>();
  for (const q of questionSet.questions) {
    if (isQuestionEligible(q)) {
      eligibleCounts.set(q.subjectId, (eligibleCounts.get(q.subjectId) || 0) + 1);
    }
  }

  return questionSet.subjects.filter((subject) => (eligibleCounts.get(subject.id) || 0) > 0);
}

export interface FilterQuestionsOptions {
  /**
   * Filter only verified questions. Default: true.
   */
  verifiedOnly?: boolean;
}

/**
 * Filters questions for "Custom Subject" mode.
 * 
 * Strictly scoped to the provided questionSet.
 * Preserves original question records and their IDs.
 */
export function filterQuestionsBySubjects(
  questionSet: QuestionSet,
  subjectIds: string[],
  options: FilterQuestionsOptions = { verifiedOnly: true },
): Question[] {
  const { verifiedOnly = true } = options;
  const targetSubjectSet = new Set(subjectIds);

  return questionSet.questions.filter((q) => {
    if (!targetSubjectSet.has(q.subjectId)) {
      return false;
    }
    return verifiedOnly ? isQuestionEligible(q) : true;
  });
}

export interface MixQuestionsOptions {
  /**
   * Filter only verified questions. Default: true.
   */
  verifiedOnly?: boolean;
  /**
   * Optionally shuffle question order without mutating original array. Default: false.
   */
  shuffle?: boolean;
  /**
   * Injectable random function for deterministic testing.
   */
  randomFn?: () => number;
}

/**
 * Returns all eligible questions from all subjects for "Mix Questions" mode.
 * 
 * Strictly scoped to the provided questionSet.
 * Preserves original question records and IDs.
 */
export function getMixQuestions(
  questionSet: QuestionSet,
  options: MixQuestionsOptions = { verifiedOnly: true, shuffle: false },
): Question[] {
  const { verifiedOnly = true, shuffle = false, randomFn = Math.random } = options;

  const eligibleQuestions = questionSet.questions.filter((q) =>
    verifiedOnly ? isQuestionEligible(q) : true,
  );

  if (!shuffle) {
    return [...eligibleQuestions];
  }

  // Pure Fisher-Yates shuffle on a copy
  const shuffled = [...eligibleQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}

export interface SubjectSummary {
  id: string;
  name: string;
  totalQuestions: number;
  eligibleQuestions: number;
}

/**
 * Computes question distribution breakdown per subject for a set.
 */
export function getSubjectSummaries(questionSet: QuestionSet): SubjectSummary[] {
  const totalMap = new Map<string, number>();
  const eligibleMap = new Map<string, number>();

  for (const q of questionSet.questions) {
    totalMap.set(q.subjectId, (totalMap.get(q.subjectId) || 0) + 1);
    if (isQuestionEligible(q)) {
      eligibleMap.set(q.subjectId, (eligibleMap.get(q.subjectId) || 0) + 1);
    }
  }

  return questionSet.subjects.map((sub) => ({
    id: sub.id,
    name: sub.name,
    totalQuestions: totalMap.get(sub.id) || 0,
    eligibleQuestions: eligibleMap.get(sub.id) || 0,
  }));
}

