import { describe, it, expect } from 'vitest';
import { validateQuestionSet, validateManifest } from '../src/data/questionValidator';
import { mockValidQuestionSet, mockValidManifest } from './fixtures';

describe('questionValidator - validateQuestionSet', () => {
  it('validates a well-formed QuestionSet', () => {
    const result = validateQuestionSet(mockValidQuestionSet, 'set-test-01');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('set-test-01');
      expect(result.data.questions).toHaveLength(4);
    }
  });

  it('fails when root is not an object', () => {
    const result = validateQuestionSet('invalid string');
    expect(result.success).toBe(false);
    expect(result.errors?.[0].message).toContain('must be an object');
  });

  it('rejects unsupported schemaVersion', () => {
    const invalid = { ...mockValidQuestionSet, schemaVersion: 2 };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'schemaVersion')).toBe(true);
  });

  it('rejects mismatched expectedSetId', () => {
    const result = validateQuestionSet(mockValidQuestionSet, 'different-id');
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Mismatched set ID'))).toBe(true);
  });

  it('detects duplicate question IDs within the set', () => {
    const invalid = {
      ...mockValidQuestionSet,
      questions: [
        ...mockValidQuestionSet.questions,
        {
          id: 'q1', // Duplicate ID
          subjectId: 'physics',
          question: 'Another question with dup ID',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          answerStatus: 'verified',
        },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Duplicate question ID'))).toBe(true);
  });

  it('detects duplicate subject IDs within the set', () => {
    const invalid = {
      ...mockValidQuestionSet,
      subjects: [
        { id: 'physics', name: 'Physics' },
        { id: 'physics', name: 'Physics Duplicate' },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Duplicate subject ID'))).toBe(true);
  });

  it('rejects questions with fewer or more than 4 options', () => {
    const invalid = {
      ...mockValidQuestionSet,
      questions: [
        {
          id: 'q_3_opt',
          subjectId: 'physics',
          question: 'Has 3 options?',
          options: ['A', 'B', 'C'],
          correctAnswer: 0,
          answerStatus: 'verified',
        },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('must contain exactly 4 or 5 options'))).toBe(true);
  });

  it('rejects questions with empty option strings', () => {
    const invalid = {
      ...mockValidQuestionSet,
      questions: [
        {
          id: 'q_empty_opt',
          subjectId: 'physics',
          question: 'Has empty option?',
          options: ['A', '', 'C', 'D'],
          correctAnswer: 0,
          answerStatus: 'verified',
        },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Option 2 cannot be empty'))).toBe(true);
  });

  it('rejects out-of-range correctAnswer index', () => {
    const invalidUnder = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          correctAnswer: -1,
        },
      ],
    };
    expect(validateQuestionSet(invalidUnder).success).toBe(false);

    const invalidOver = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          correctAnswer: 4,
        },
      ],
    };
    expect(validateQuestionSet(invalidOver).success).toBe(false);

    const invalidFloat = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          correctAnswer: 1.5,
        },
      ],
    };
    expect(validateQuestionSet(invalidFloat).success).toBe(false);
  });

  it('rejects unknown subject references in questions', () => {
    const invalid = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          subjectId: 'astronomy', // Does not exist in subjects!
        },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Unknown subject reference'))).toBe(true);
  });

  it('rejects invalid answerStatus values', () => {
    const invalid = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          answerStatus: 'auto_generated', // Invalid status
        },
      ],
    };
    const result = validateQuestionSet(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'answerStatus')).toBe(true);
  });

  it('validates optional source.page as positive integer', () => {
    const invalidSource = {
      ...mockValidQuestionSet,
      questions: [
        {
          ...mockValidQuestionSet.questions[0],
          source: { page: -5 },
        },
      ],
    };
    const result = validateQuestionSet(invalidSource);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'source.page')).toBe(true);
  });

  it('successfully validates and normalizes BPSC TRE examination format', () => {
    const rawBpscMock = {
      test_series: 'BPSC TRE Middle School Teachers (Class 6 to 8) - Social Science',
      set: 'SET 01',
      subjects: [
        {
          subject: 'इतिहास (History)',
          questions: [
            {
              question_number: 71,
              question: 'Sample question?',
              options: {
                A: 'Opt A',
                B: 'Opt B',
                C: 'Opt C',
                D: 'Opt D',
                E: 'Opt E',
              },
              answer: 'D',
            },
          ],
        },
      ],
    };

    const result = validateQuestionSet(rawBpscMock, 'bpsc-tre-set01-social-science');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subjects[0].id).toBe('history');
      expect(result.data.subjects[0].name).toBe('History');
      expect(result.data.questions[0].correctAnswer).toBe(3);
      expect(result.data.questions[0].originalAnswer).toBe('D');
      expect(result.data.questions[0].options).toHaveLength(5);
    }
  });
});

describe('questionValidator - validateManifest', () => {
  it('validates a well-formed TestSetManifest', () => {
    const result = validateManifest(mockValidManifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.testSets).toHaveLength(2);
    }
  });

  it('validates an empty catalogue manifest', () => {
    const emptyManifest = { version: 1, testSets: [] };
    const result = validateManifest(emptyManifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.testSets).toEqual([]);
    }
  });

  it('rejects unsupported manifest version', () => {
    const invalid = { version: 2, testSets: [] };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'version')).toBe(true);
  });

  it('detects duplicate test set IDs in catalogue', () => {
    const invalid = {
      version: 1,
      testSets: [
        {
          id: 'set-dup',
          title: 'Set 1',
          description: 'Desc',
          file: 'data/test-sets/set-1.json',
          status: 'published',
        },
        {
          id: 'set-dup', // Duplicate!
          title: 'Set 2',
          description: 'Desc',
          file: 'data/test-sets/set-2.json',
          status: 'published',
        },
      ],
    };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Duplicate test set ID'))).toBe(true);
  });

  it('rejects unsupported publication statuses', () => {
    const invalid = {
      version: 1,
      testSets: [
        {
          id: 'set-1',
          title: 'Set 1',
          description: 'Desc',
          file: 'data/test-sets/set-1.json',
          status: 'archived', // Unsupported!
        },
      ],
    };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'status')).toBe(true);
  });

  it('prevents path traversal in test set file path', () => {
    const invalid = {
      version: 1,
      testSets: [
        {
          id: 'set-1',
          title: 'Set 1',
          description: 'Desc',
          file: 'data/test-sets/../../secret.json',
          status: 'published',
        },
      ],
    };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('Path traversal disallowed'))).toBe(true);
  });

  it('rejects external URLs or protocols in file path', () => {
    const invalid = {
      version: 1,
      testSets: [
        {
          id: 'set-1',
          title: 'Set 1',
          description: 'Desc',
          file: 'https://evil.com/test.json',
          status: 'published',
        },
      ],
    };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.includes('External URLs'))).toBe(true);
  });

  it('requires file path to end with .json and reside in data/test-sets/', () => {
    const invalid = {
      version: 1,
      testSets: [
        {
          id: 'set-1',
          title: 'Set 1',
          description: 'Desc',
          file: 'data/other-folder/set-1.txt',
          status: 'published',
        },
      ],
    };
    const result = validateManifest(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'file')).toBe(true);
  });
});

