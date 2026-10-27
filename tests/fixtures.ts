import type { QuestionSet, TestSetManifest } from '../src/types/questionSet';

export const mockValidQuestionSet: QuestionSet = {
  schemaVersion: 1,
  id: 'set-test-01',
  title: 'Sample Science Set',
  description: 'A test set for unit testing',
  subjects: [
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' }, // Will have 0 questions to test empty subject handling
  ],
  questions: [
    {
      id: 'q1',
      subjectId: 'physics',
      question: 'What is the speed of light?',
      options: ['3x10^8 m/s', '3x10^6 m/s', '1.5x10^8 m/s', '3x10^5 km/h'],
      correctAnswer: 0,
      answerStatus: 'verified',
      explanation: 'Constant c in vacuum',
      source: { page: 12 },
    },
    {
      id: 'q2',
      subjectId: 'physics',
      question: 'Unit of force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: 1,
      answerStatus: 'verified',
    },
    {
      id: 'q3',
      subjectId: 'chemistry',
      question: 'Chemical formula of water?',
      options: ['CO2', 'NaCl', 'H2O', 'CH4'],
      correctAnswer: 2,
      answerStatus: 'verified',
    },
    {
      id: 'q4',
      subjectId: 'chemistry',
      question: 'Unverified chemistry question?',
      options: ['Opt A', 'Opt B', 'Opt C', 'Opt D'],
      correctAnswer: 0,
      answerStatus: 'needs_review', // Unverified! Must be excluded from scored quizzes
    },
  ],
};

export const mockSecondQuestionSet: QuestionSet = {
  schemaVersion: 1,
  id: 'set-test-02',
  title: 'Another Subject Set',
  description: 'Second set to verify no leakage',
  subjects: [{ id: 'math', name: 'Mathematics' }],
  questions: [
    {
      id: 'q_math_1',
      subjectId: 'math',
      question: '2 + 2 = ?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 3,
      answerStatus: 'verified',
    },
  ],
};

export const mockValidManifest: TestSetManifest = {
  version: 1,
  testSets: [
    {
      id: 'set-test-01',
      title: 'Sample Science Set',
      description: 'A test set for unit testing',
      file: 'data/test-sets/set-01.json',
      status: 'published',
    },
    {
      id: 'set-test-02',
      title: 'Draft Mathematics Set',
      description: 'Draft set not published yet',
      file: 'data/test-sets/set-02.json',
      status: 'draft',
    },
  ],
};

