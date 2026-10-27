/**
 * TestSet Domain Model
 * 
 * Represents an individual question set displayed on the practice dashboard.
 */

export type TestSetIconType = 'book-open' | 'layers' | 'file-text' | 'compass' | string;

export interface TestSet {
  id: string;
  title: string;
  description: string;
  icon?: TestSetIconType;
  file?: string;
  status?: 'published' | 'draft';
}

/**
 * Supported practice modes for test-set cards.
 */
export type QuizMode = 'custom-subject' | 'mix-questions';

export interface ModeDetails {
  id: QuizMode;
  label: string;
  shortDescription: string;
}
