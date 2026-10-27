import { describe, it, expect } from 'vitest';
import {
  getAvailableSubjects,
  filterQuestionsBySubjects,
  getMixQuestions,
  getSubjectSummaries,
  isQuestionEligible,
} from '../src/data/subjectMapper';
import { mockValidQuestionSet, mockSecondQuestionSet } from './fixtures';

describe('subjectMapper', () => {
  describe('isQuestionEligible', () => {
    it('returns true only for verified questions', () => {
      expect(isQuestionEligible(mockValidQuestionSet.questions[0])).toBe(true);
      expect(isQuestionEligible(mockValidQuestionSet.questions[3])).toBe(false); // needs_review
    });
  });

  describe('getAvailableSubjects', () => {
    it('excludes subjects that have no eligible questions by default', () => {
      // biology has 0 questions
      const subjects = getAvailableSubjects(mockValidQuestionSet);
      expect(subjects.map((s) => s.id)).toEqual(['physics', 'chemistry']);
      expect(subjects.some((s) => s.id === 'biology')).toBe(false);
    });

    it('includes all subjects when onlyEligible is false', () => {
      const allSubjects = getAvailableSubjects(mockValidQuestionSet, { onlyEligible: false });
      expect(allSubjects.map((s) => s.id)).toEqual(['physics', 'chemistry', 'biology']);
    });
  });

  describe('filterQuestionsBySubjects (Custom Subject Mode)', () => {
    it('filters questions for a single subject and excludes unverified questions', () => {
      const physicsQuestions = filterQuestionsBySubjects(mockValidQuestionSet, ['physics']);
      expect(physicsQuestions).toHaveLength(2);
      expect(physicsQuestions.every((q) => q.subjectId === 'physics')).toBe(true);
      expect(physicsQuestions.every((q) => q.answerStatus === 'verified')).toBe(true);
    });

    it('filters questions across multiple selected subjects', () => {
      const questions = filterQuestionsBySubjects(mockValidQuestionSet, ['physics', 'chemistry']);
      // 2 physics + 1 verified chemistry (q4 is unverified so excluded)
      expect(questions).toHaveLength(3);
      expect(questions.some((q) => q.id === 'q4')).toBe(false);
    });

    it('returns empty array when selecting a subject with zero questions', () => {
      const emptySubjectQuestions = filterQuestionsBySubjects(mockValidQuestionSet, ['biology']);
      expect(emptySubjectQuestions).toHaveLength(0);
    });

    it('allows including unverified questions when verifiedOnly is explicitly false', () => {
      const chemistryAll = filterQuestionsBySubjects(mockValidQuestionSet, ['chemistry'], {
        verifiedOnly: false,
      });
      expect(chemistryAll).toHaveLength(2);
      expect(chemistryAll.some((q) => q.id === 'q4')).toBe(true);
    });
  });

  describe('getMixQuestions (Mix Questions Mode)', () => {
    it('returns all eligible questions across all subjects in the set', () => {
      const mix = getMixQuestions(mockValidQuestionSet);
      expect(mix).toHaveLength(3); // q1, q2, q3 (q4 is needs_review)
      expect(mix.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
    });

    it('can shuffle questions deterministically with custom randomFn without mutating original', () => {
      const originalIds = mockValidQuestionSet.questions.map((q) => q.id);
      const shuffled = getMixQuestions(mockValidQuestionSet, {
        shuffle: true,
        randomFn: () => 0.1,
      });
      expect(shuffled).toHaveLength(3);
      // Original remains untouched
      expect(mockValidQuestionSet.questions.map((q) => q.id)).toEqual(originalIds);
    });
  });

  describe('Strict Scoping & Cross-Set Leakage Prevention', () => {
    it('never leaks questions across distinct question sets', () => {
      // Querying set 1 for 'math' (which only exists in set 2) returns 0 questions
      const set1Math = filterQuestionsBySubjects(mockValidQuestionSet, ['math']);
      expect(set1Math).toHaveLength(0);

      // Querying set 2 for 'physics' (which only exists in set 1) returns 0 questions
      const set2Physics = filterQuestionsBySubjects(mockSecondQuestionSet, ['physics']);
      expect(set2Physics).toHaveLength(0);

      // Mix questions for set 2 contains only set 2 questions
      const set2Mix = getMixQuestions(mockSecondQuestionSet);
      expect(set2Mix).toHaveLength(1);
      expect(set2Mix[0].id).toBe('q_math_1');
    });

    it('preserves question record identity and original IDs', () => {
      const filtered = filterQuestionsBySubjects(mockValidQuestionSet, ['physics']);
      expect(filtered[0]).toBe(mockValidQuestionSet.questions[0]);
    });
  });

  describe('getSubjectSummaries', () => {
    it('accurately tallies total and eligible questions per subject', () => {
      const summaries = getSubjectSummaries(mockValidQuestionSet);
      expect(summaries).toEqual([
        { id: 'physics', name: 'Physics', totalQuestions: 2, eligibleQuestions: 2 },
        { id: 'chemistry', name: 'Chemistry', totalQuestions: 2, eligibleQuestions: 1 },
        { id: 'biology', name: 'Biology', totalQuestions: 0, eligibleQuestions: 0 },
      ]);
    });
  });
});

