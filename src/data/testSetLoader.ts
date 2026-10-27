import type {
  TestSetManifest,
  TestSetManifestEntry,
  QuestionSet,
} from '../types/questionSet';
import { validateManifest, validateQuestionSet } from './questionValidator';

export type LoaderErrorCode =
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'INVALID_JSON'
  | 'INVALID_CATALOGUE'
  | 'SET_NOT_IN_CATALOGUE'
  | 'SET_NOT_PUBLISHED'
  | 'INVALID_QUESTION_SET'
  | 'SCHEMA_VERSION_MISMATCH';

export interface LoaderError {
  code: LoaderErrorCode;
  message: string;
  details?: unknown;
  status?: number;
}

export type LoaderResult<T> =
  | { success: true; data: T }
  | { success: false; error: LoaderError };

// In-memory cache & concurrent request deduplication
let manifestCache: TestSetManifest | null = null;
let manifestPromise: Promise<LoaderResult<TestSetManifest>> | null = null;

const questionSetCache = new Map<string, QuestionSet>();
const questionSetPromises = new Map<string, Promise<LoaderResult<QuestionSet>>>();

/**
 * Clears loader caches. Useful for tests or manual refreshes.
 */
export function clearLoaderCache(): void {
  manifestCache = null;
  manifestPromise = null;
  questionSetCache.clear();
  questionSetPromises.clear();
}

/**
 * Loads and validates the central catalogue manifest.
 */
export async function loadCatalogue(
  manifestUrl = '/data/test-sets.json',
): Promise<LoaderResult<TestSetManifest>> {
  if (manifestCache) {
    return { success: true, data: manifestCache };
  }

  if (manifestPromise) {
    return manifestPromise;
  }

  manifestPromise = (async (): Promise<LoaderResult<TestSetManifest>> => {
    try {
      const response = await fetch(manifestUrl);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status === 404 ? 'NOT_FOUND' : 'NETWORK_ERROR',
            status: response.status,
            message: `Failed to load catalogue manifest from "${manifestUrl}" (HTTP ${response.status})`,
          },
        };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch (jsonErr) {
        return {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: `Catalogue manifest contains malformed JSON: ${String(jsonErr)}`,
            details: jsonErr,
          },
        };
      }

      const validation = validateManifest(parsed);
      if (!validation.success) {
        return {
          success: false,
          error: {
            code: 'INVALID_CATALOGUE',
            message: 'Catalogue manifest validation failed',
            details: validation.errors,
          },
        };
      }

      manifestCache = validation.data;
      return { success: true, data: validation.data };
    } catch (netErr) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Network error loading catalogue manifest: ${String(netErr)}`,
          details: netErr,
        },
      };
    } finally {
      manifestPromise = null;
    }
  })();

  return manifestPromise;
}

/**
 * Returns only published test set entries from the validated catalogue.
 */
export async function getPublishedTestSets(
  manifestUrl = '/data/test-sets.json',
): Promise<LoaderResult<TestSetManifestEntry[]>> {
  const result = await loadCatalogue(manifestUrl);

  if (!result.success) {
    return result;
  }

  const published = result.data.testSets.filter((entry) => entry.status === 'published');
  return { success: true, data: published };
}

/**
 * Loads an individual question set by stable ID.
 * 
 * Verifies catalogue existence, publication status, file loading,
 * schema validation, and ID consistency.
 */
export async function loadQuestionSet(
  setId: string,
  manifestUrl = '/data/test-sets.json',
): Promise<LoaderResult<QuestionSet>> {
  if (questionSetCache.has(setId)) {
    return { success: true, data: questionSetCache.get(setId)! };
  }

  if (questionSetPromises.has(setId)) {
    return questionSetPromises.get(setId)!;
  }

  const requestPromise = (async (): Promise<LoaderResult<QuestionSet>> => {
    // 1. Load catalogue first
    const catalogueResult = await loadCatalogue(manifestUrl);
    if (!catalogueResult.success) {
      return catalogueResult;
    }

    // 2. Resolve matching entry
    const entry = catalogueResult.data.testSets.find((s) => s.id === setId);
    if (!entry) {
      return {
        success: false,
        error: {
          code: 'SET_NOT_IN_CATALOGUE',
          message: `Test set "${setId}" is not listed in the catalogue`,
        },
      };
    }

    // 3. Ensure set is published
    if (entry.status !== 'published') {
      return {
        success: false,
        error: {
          code: 'SET_NOT_PUBLISHED',
          message: `Test set "${setId}" is currently in draft status`,
        },
      };
    }

    // 4. Fetch the set file
    const resolvedPath = entry.file.startsWith('/') ? entry.file : `/${entry.file}`;

    try {
      const response = await fetch(resolvedPath);

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status === 404 ? 'NOT_FOUND' : 'NETWORK_ERROR',
            status: response.status,
            message: `Question set file not found at "${resolvedPath}" (HTTP ${response.status})`,
          },
        };
      }

      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch (jsonErr) {
        return {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: `Question set file "${resolvedPath}" contains malformed JSON`,
            details: jsonErr,
          },
        };
      }

      // 5. Validate question set structure and verify internal ID matches catalogue
      const validation = validateQuestionSet(parsed, entry.id, {
        title: entry.title,
        description: entry.description,
      });
      if (!validation.success) {
        const isVersionMismatch = validation.errors.some((e) => e.field === 'schemaVersion');
        return {
          success: false,
          error: {
            code: isVersionMismatch ? 'SCHEMA_VERSION_MISMATCH' : 'INVALID_QUESTION_SET',
            message: `Validation failed for test set "${setId}"`,
            details: validation.errors,
          },
        };
      }

      questionSetCache.set(setId, validation.data);
      return { success: true, data: validation.data };
    } catch (netErr) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Network error loading question set "${setId}": ${String(netErr)}`,
          details: netErr,
        },
      };
    } finally {
      questionSetPromises.delete(setId);
    }
  })();

  questionSetPromises.set(setId, requestPromise);
  return requestPromise;
}

