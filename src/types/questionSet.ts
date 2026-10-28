/**
 * Question Set Domain Models & Validation Types
 * 
 * Defines schemas for central test set catalogue and per-set question collections.
 * Schema Version: 1
 */

export type AnswerStatus = 'verified' | 'needs_review';

export type TestSetPublicationStatus = 'published' | 'draft';

/**
 * Manifest entry in central catalogue (public/data/test-sets.json)
 */
export interface TestSetManifestEntry {
  id: string;
  title: string;
  description: string;
  file: string;
  status: TestSetPublicationStatus;
  icon?: string;
  totalQuestions?: number;
  subjectCounts?: Record<string, number>;
}

/**
 * Central catalogue manifest schema
 */
export interface TestSetManifest {
  version: 1;
  testSets: TestSetManifestEntry[];
}

/**
 * Subject definition within a question set
 */
export interface Subject {
  id: string;
  name: string;
}

/**
 * Source metadata for questions extracted from source materials (e.g., screenshots)
 */
export interface QuestionSource {
  page?: number;
  questionNumber?: number;
}

/**
 * Individual MCQ Question definition
 * Supports both standard 4-option questions and 5-option exam formats (e.g., BPSC TRE).
 */
export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  optionsMap?: Record<string, string>; // Original { "A": "...", "B": "...", ... }
  correctAnswer: number; // 0-indexed integer (0 for A, 1 for B, 2 for C, 3 for D, 4 for E)
  originalAnswer?: string; // Original letter answer ("A", "B", "C", "D", "E")
  answerStatus: AnswerStatus;
  explanation?: string | null;
  source?: QuestionSource;
  questionNumber?: number; // Original question number from examination paper
}

/**
 * Complete Question Set schema
 */
export interface QuestionSet {
  schemaVersion: 1;
  id: string;
  title: string;
  description: string;
  subjects: Subject[];
  questions: Question[];
}

/**
 * Raw BPSC TRE Question structure
 */
export interface RawBpscQuestion {
  question_number: number;
  question: string;
  options: Record<string, string>;
  answer: string;
}

/**
 * Raw BPSC TRE Subject structure
 */
export interface RawBpscSubject {
  subject: string;
  questions: RawBpscQuestion[];
}

/**
 * Raw BPSC TRE Test Set file structure
 */
export interface RawBpscTestSet {
  test_series: string;
  set: string;
  part?: string;
  subjects: RawBpscSubject[];
}

/**
 * Raw BPSC TRE Set 02 Test Set file structure
 */
export interface RawBpscTestSet02 {
  social_science_set_02: {
    itihas?: RawBpscQuestion[];
    bhugol?: RawBpscQuestion[];
    rajvyavastha?: RawBpscQuestion[];
    arthashastra?: RawBpscQuestion[];
    [subjectKey: string]: RawBpscQuestion[] | undefined;
  };
}

/**
 * Structured validation issue details
 */
export interface ValidationIssue {
  path: string;
  message: string;
  field?: string;
  setId?: string;
  questionId?: string;
}

/**
 * Strongly typed validation result
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors?: never }
  | { success: false; errors: ValidationIssue[]; data?: never };
