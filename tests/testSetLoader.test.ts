import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadCatalogue,
  getPublishedTestSets,
  loadQuestionSet,
  clearLoaderCache,
} from '../src/data/testSetLoader';
import { mockValidManifest, mockValidQuestionSet } from './fixtures';

describe('testSetLoader', () => {
  beforeEach(() => {
    clearLoaderCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearLoaderCache();
    vi.restoreAllMocks();
  });

  describe('loadCatalogue', () => {
    it('successfully loads and validates the central catalogue manifest', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockValidManifest,
      } as Response);

      const result = await loadCatalogue('/data/test-sets.json');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.testSets).toHaveLength(2);
      }
    });

    it('returns empty list for an empty manifest catalogue', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ version: 1, testSets: [] }),
      } as Response);

      const result = await loadCatalogue('/data/test-sets.json');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.testSets).toEqual([]);
      }
    });

    it('returns NOT_FOUND error when catalogue file is missing (HTTP 404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadCatalogue('/data/missing.json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('returns INVALID_JSON when catalogue JSON is malformed', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as Response);

      const result = await loadCatalogue('/data/test-sets.json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_JSON');
      }
    });

    it('returns INVALID_CATALOGUE when schema validation fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ version: 99, testSets: [] }), // Unsupported version
      } as Response);

      const result = await loadCatalogue('/data/test-sets.json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_CATALOGUE');
      }
    });
  });

  describe('getPublishedTestSets', () => {
    it('filters out draft sets and returns only published sets', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockValidManifest,
      } as Response);

      const result = await getPublishedTestSets();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('set-test-01');
        expect(result.data[0].status).toBe('published');
      }
    });
  });

  describe('loadQuestionSet', () => {
    it('successfully loads a published question set', async () => {
      // 1st fetch: catalogue
      // 2nd fetch: set JSON file
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidManifest,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidQuestionSet,
        } as Response);

      const result = await loadQuestionSet('set-test-01');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('set-test-01');
        expect(result.data.title).toBe('Sample Science Set');
      }
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('returns SET_NOT_IN_CATALOGUE if requested set ID is missing from manifest', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockValidManifest,
      } as Response);

      const result = await loadQuestionSet('unknown-set-id');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SET_NOT_IN_CATALOGUE');
      }
    });

    it('returns SET_NOT_PUBLISHED if requested set is in draft status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockValidManifest,
      } as Response);

      const result = await loadQuestionSet('set-test-02'); // draft
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SET_NOT_PUBLISHED');
      }
    });

    it('returns NOT_FOUND when question-set file does not exist (HTTP 404)', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidManifest,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response);

      const result = await loadQuestionSet('set-test-01');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('returns INVALID_QUESTION_SET if the internal ID does not match catalogue entry', async () => {
      const mismatchedSet = {
        ...mockValidQuestionSet,
        id: 'different-internal-id',
      };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidManifest,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mismatchedSet,
        } as Response);

      const result = await loadQuestionSet('set-test-01');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_QUESTION_SET');
      }
    });

    it('returns SCHEMA_VERSION_MISMATCH when question set has an unknown schema version', async () => {
      const wrongVersionSet = {
        ...mockValidQuestionSet,
        schemaVersion: 2,
      };

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockValidManifest,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => wrongVersionSet,
        } as Response);

      const result = await loadQuestionSet('set-test-01');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('SCHEMA_VERSION_MISMATCH');
      }
    });
  });
});

