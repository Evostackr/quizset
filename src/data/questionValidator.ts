import type {
  TestSetManifest,
  QuestionSet,
  Subject,
  Question,
  ValidationResult,
  ValidationIssue,
  AnswerStatus,
  TestSetPublicationStatus,
} from '../types/questionSet';

const VALID_STATUSES: TestSetPublicationStatus[] = ['published', 'draft'];
const VALID_ANSWER_STATUSES: AnswerStatus[] = ['verified', 'needs_review'];

export interface FallbackSetMetadata {
  title?: string;
  description?: string;
}

/**
 * Validates a central test-sets catalogue manifest.
 */
export function validateManifest(raw: unknown): ValidationResult<TestSetManifest> {
  const issues: ValidationIssue[] = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {
      success: false,
      errors: [{ path: '', message: 'Manifest root must be an object', field: 'root' }],
    };
  }

  const candidate = raw as Record<string, unknown>;

  // Check version
  if (candidate.version !== 1) {
    issues.push({
      path: 'version',
      field: 'version',
      message: `Unsupported manifest version: expected 1, received ${String(candidate.version)}`,
    });
  }

  // Check testSets array
  if (!Array.isArray(candidate.testSets)) {
    issues.push({
      path: 'testSets',
      field: 'testSets',
      message: 'Property "testSets" must be an array',
    });
    return { success: false, errors: issues };
  }

  const seenIds = new Set<string>();

  candidate.testSets.forEach((item, index) => {
    const entryPath = `testSets[${index}]`;

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      issues.push({
        path: entryPath,
        message: 'Manifest entry must be a non-null object',
      });
      return;
    }

    const entry = item as Record<string, unknown>;

    // ID validation
    if (typeof entry.id !== 'string' || entry.id.trim() === '') {
      issues.push({
        path: `${entryPath}.id`,
        field: 'id',
        message: 'Test set ID must be a non-empty string',
      });
    } else {
      if (seenIds.has(entry.id)) {
        issues.push({
          path: `${entryPath}.id`,
          field: 'id',
          setId: entry.id,
          message: `Duplicate test set ID: "${entry.id}"`,
        });
      }
      seenIds.add(entry.id);
    }

    // Title validation
    if (typeof entry.title !== 'string' || entry.title.trim() === '') {
      issues.push({
        path: `${entryPath}.title`,
        field: 'title',
        message: 'Title must be a non-empty string',
      });
    }

    // Description validation
    if (typeof entry.description !== 'string') {
      issues.push({
        path: `${entryPath}.description`,
        field: 'description',
        message: 'Description must be a string',
      });
    }

    // Status validation
    if (typeof entry.status !== 'string' || !VALID_STATUSES.includes(entry.status as TestSetPublicationStatus)) {
      issues.push({
        path: `${entryPath}.status`,
        field: 'status',
        message: `Unsupported status: "${String(entry.status)}" (expected "published" or "draft")`,
      });
    }

    // File path & security validation
    if (typeof entry.file !== 'string' || entry.file.trim() === '') {
      issues.push({
        path: `${entryPath}.file`,
        field: 'file',
        message: 'File path must be a non-empty string',
      });
    } else {
      const filePath = entry.file.trim();

      // Prevent path traversal
      if (filePath.includes('..')) {
        issues.push({
          path: `${entryPath}.file`,
          field: 'file',
          message: `Path traversal disallowed in file path: "${filePath}"`,
        });
      }

      // Prevent external / dangerous protocols
      const lower = filePath.toLowerCase();
      if (
        lower.startsWith('http:') ||
        lower.startsWith('https:') ||
        lower.startsWith('//') ||
        lower.startsWith('file:') ||
        lower.startsWith('data:')
      ) {
        issues.push({
          path: `${entryPath}.file`,
          field: 'file',
          message: `External URLs or absolute protocol links are disallowed: "${filePath}"`,
        });
      }

      // Must be a JSON file
      if (!lower.endsWith('.json')) {
        issues.push({
          path: `${entryPath}.file`,
          field: 'file',
          message: `File path must reference a .json file: "${filePath}"`,
        });
      }

      // Must stay within the data directory
      const normalized = filePath.replace(/^\/+/, '');
      if (!normalized.startsWith('data/test-sets/')) {
        issues.push({
          path: `${entryPath}.file`,
          field: 'file',
          message: `File path must reside within "data/test-sets/": "${filePath}"`,
        });
      }
    }
  });

  if (issues.length > 0) {
    return { success: false, errors: issues };
  }

  return { success: true, data: raw as TestSetManifest };
}

/**
 * Validates and normalizes a BPSC TRE format question set.
 */
function validateAndNormalizeBpsc(
  candidate: Record<string, unknown>,
  expectedSetId?: string,
  fallbackMeta?: FallbackSetMetadata,
): ValidationResult<QuestionSet> {
  const issues: ValidationIssue[] = [];

  const subjectsRaw = candidate.subjects;
  if (!Array.isArray(subjectsRaw) || subjectsRaw.length === 0) {
    return {
      success: false,
      errors: [
        {
          path: 'subjects',
          message: 'BPSC test set must contain a non-empty "subjects" array',
        },
      ],
    };
  }

  const subjects: Subject[] = [];
  const questions: Question[] = [];
  const seenQuestionIds = new Set<string>();

  const subjectIdMap: Record<string, { id: string; name: string }> = {
    history: { id: 'history', name: 'History' },
    geography: { id: 'geography', name: 'Geography' },
    polity: { id: 'polity', name: 'Polity' },
    economics: { id: 'economics', name: 'Economics' },
  };

  subjectsRaw.forEach((subjRaw, sIndex) => {
    const sPath = `subjects[${sIndex}]`;
    if (typeof subjRaw !== 'object' || subjRaw === null) {
      issues.push({ path: sPath, message: 'Subject must be an object' });
      return;
    }

    const sObj = subjRaw as Record<string, unknown>;
    const subjectNameStr = typeof sObj.subject === 'string' ? sObj.subject : `Subject ${sIndex + 1}`;

    // Map to canonical subject id
    let canonicalSubjectId = `subject-${sIndex + 1}`;
    let canonicalSubjectName = subjectNameStr;

    const lower = subjectNameStr.toLowerCase();
    if (lower.includes('history') || lower.includes('इतिहास')) {
      canonicalSubjectId = subjectIdMap.history.id;
      canonicalSubjectName = subjectIdMap.history.name;
    } else if (lower.includes('geography') || lower.includes('भूगोल')) {
      canonicalSubjectId = subjectIdMap.geography.id;
      canonicalSubjectName = subjectIdMap.geography.name;
    } else if (lower.includes('polity') || lower.includes('राजव्यवस्था') || lower.includes('political')) {
      canonicalSubjectId = subjectIdMap.polity.id;
      canonicalSubjectName = subjectIdMap.polity.name;
    } else if (lower.includes('economics') || lower.includes('अर्थशास्त्र')) {
      canonicalSubjectId = subjectIdMap.economics.id;
      canonicalSubjectName = subjectIdMap.economics.name;
    }

    subjects.push({
      id: canonicalSubjectId,
      name: canonicalSubjectName,
    });

    const questionsRaw = sObj.questions;
    if (!Array.isArray(questionsRaw)) {
      issues.push({ path: `${sPath}.questions`, message: 'Subject "questions" must be an array' });
      return;
    }

    questionsRaw.forEach((qRaw, qIndex) => {
      const qPath = `${sPath}.questions[${qIndex}]`;
      if (typeof qRaw !== 'object' || qRaw === null) {
        issues.push({ path: qPath, message: 'Question must be an object' });
        return;
      }

      const q = qRaw as Record<string, unknown>;
      const qNum = typeof q.question_number === 'number' ? q.question_number : qIndex + 1;
      const questionId = `${canonicalSubjectId}-${qNum}`;

      if (seenQuestionIds.has(questionId)) {
        issues.push({
          path: `${qPath}.question_number`,
          questionId,
          message: `Duplicate question ID: "${questionId}"`,
        });
      }
      seenQuestionIds.add(questionId);

      // Question text
      if (typeof q.question !== 'string' || q.question.trim() === '') {
        issues.push({
          path: `${qPath}.question`,
          questionId,
          message: `Question text for Q${qNum} cannot be empty`,
        });
      }

      // Options
      const optionsArr: string[] = [];
      const optionsMap: Record<string, string> = {};

      if (typeof q.options === 'object' && q.options !== null && !Array.isArray(q.options)) {
        const optObj = q.options as Record<string, unknown>;
        const keys = ['A', 'B', 'C', 'D', 'E'];
        keys.forEach((key) => {
          const val = optObj[key];
          if (typeof val !== 'string' || val.trim() === '') {
            issues.push({
              path: `${qPath}.options.${key}`,
              questionId,
              message: `Option ${key} in Q${qNum} is empty or missing`,
            });
          } else {
            optionsArr.push(val);
            optionsMap[key] = val;
          }
        });
      } else if (Array.isArray(q.options)) {
        q.options.forEach((opt, optIdx) => {
          if (typeof opt !== 'string' || opt.trim() === '') {
            issues.push({
              path: `${qPath}.options[${optIdx}]`,
              questionId,
              message: `Option ${optIdx + 1} in Q${qNum} is empty`,
            });
          } else {
            optionsArr.push(opt);
          }
        });
      } else {
        issues.push({
          path: `${qPath}.options`,
          questionId,
          message: `Options for Q${qNum} must be an object or array`,
        });
      }

      // Answer index
      const answerLetter = typeof q.answer === 'string' ? q.answer.trim().toUpperCase() : '';
      const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

      let correctIndex = -1;
      if (answerLetter in letterToIndex) {
        correctIndex = letterToIndex[answerLetter];
      } else if (typeof q.correctAnswer === 'number' && Number.isInteger(q.correctAnswer)) {
        correctIndex = q.correctAnswer;
      }

      if (correctIndex < 0 || correctIndex >= optionsArr.length) {
        issues.push({
          path: `${qPath}.answer`,
          questionId,
          message: `Invalid answer "${String(q.answer)}" for Q${qNum}`,
        });
      }

      questions.push({
        id: questionId,
        subjectId: canonicalSubjectId,
        question: typeof q.question === 'string' ? q.question : '',
        options: optionsArr,
        optionsMap,
        correctAnswer: correctIndex,
        originalAnswer: answerLetter,
        answerStatus: 'verified',
        questionNumber: qNum,
        source: {
          page: qNum,
          questionNumber: qNum,
        },
      });
    });
  });

  if (issues.length > 0) {
    return { success: false, errors: issues };
  }

  const normalizedSet: QuestionSet = {
    schemaVersion: 1,
    id: expectedSetId || 'bpsc-tre-set-01-social-science',
    title: fallbackMeta?.title || 'BPSC TRE Set 01 – Social Science',
    description:
      fallbackMeta?.description ||
      (typeof candidate.test_series === 'string'
        ? `${candidate.test_series} (${questions.length} Questions)`
        : 'BPSC TRE Middle School Teachers (Class 6 to 8) - Social Science'),
    subjects,
    questions,
  };

  return { success: true, data: normalizedSet };
}

/**
 * Validates an individual QuestionSet JSON structure.
 * Supports both QuizSet Schema v1 and raw BPSC examination format.
 * 
 * @param raw - Candidate object to validate
 * @param expectedSetId - Optional set ID expected from the catalogue manifest
 * @param fallbackMeta - Optional display title and description from catalogue
 */
export function validateQuestionSet(
  raw: unknown,
  expectedSetId?: string,
  fallbackMeta?: FallbackSetMetadata,
): ValidationResult<QuestionSet> {
  const issues: ValidationIssue[] = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {
      success: false,
      errors: [{ path: '', message: 'Question set root must be an object', field: 'root' }],
    };
  }

  const candidate = raw as Record<string, unknown>;

  // Check if raw input is in BPSC TRE format
  const isBpsc =
    typeof candidate.test_series === 'string' &&
    Array.isArray(candidate.subjects) &&
    candidate.subjects.length > 0 &&
    typeof (candidate.subjects[0] as Record<string, unknown>)?.questions !== 'undefined';

  if (isBpsc) {
    return validateAndNormalizeBpsc(candidate, expectedSetId, fallbackMeta);
  }

  // Schema v1 validation
  if (candidate.schemaVersion !== 1) {
    issues.push({
      path: 'schemaVersion',
      field: 'schemaVersion',
      message: `Unsupported schemaVersion: expected 1, received ${String(candidate.schemaVersion)}`,
    });
  }

  // Check ID
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    issues.push({
      path: 'id',
      field: 'id',
      message: 'Question set "id" must be a non-empty string',
    });
  } else if (expectedSetId && candidate.id !== expectedSetId) {
    issues.push({
      path: 'id',
      field: 'id',
      setId: candidate.id,
      message: `Mismatched set ID: expected "${expectedSetId}" from catalogue, found "${candidate.id}" in file`,
    });
  }

  const setId = typeof candidate.id === 'string' ? candidate.id : undefined;

  // Title validation
  if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
    issues.push({
      path: 'title',
      field: 'title',
      setId,
      message: 'Question set "title" must be a non-empty string',
    });
  }

  // Description validation
  if (typeof candidate.description !== 'string') {
    issues.push({
      path: 'description',
      field: 'description',
      setId,
      message: 'Question set "description" must be a string',
    });
  }

  // Validate Subjects
  const validSubjectIds = new Set<string>();
  if (!Array.isArray(candidate.subjects)) {
    issues.push({
      path: 'subjects',
      field: 'subjects',
      setId,
      message: 'Property "subjects" must be an array',
    });
  } else {
    candidate.subjects.forEach((sub, sIndex) => {
      const subPath = `subjects[${sIndex}]`;
      if (typeof sub !== 'object' || sub === null || Array.isArray(sub)) {
        issues.push({
          path: subPath,
          setId,
          message: 'Subject item must be a non-null object',
        });
        return;
      }

      const subjectObj = sub as Record<string, unknown>;

      if (typeof subjectObj.id !== 'string' || subjectObj.id.trim() === '') {
        issues.push({
          path: `${subPath}.id`,
          field: 'id',
          setId,
          message: 'Subject "id" must be a non-empty string',
        });
      } else {
        if (validSubjectIds.has(subjectObj.id)) {
          issues.push({
            path: `${subPath}.id`,
            field: 'id',
            setId,
            message: `Duplicate subject ID: "${subjectObj.id}"`,
          });
        }
        validSubjectIds.add(subjectObj.id);
      }

      if (typeof subjectObj.name !== 'string' || subjectObj.name.trim() === '') {
        issues.push({
          path: `${subPath}.name`,
          field: 'name',
          setId,
          message: 'Subject "name" must be a non-empty string',
        });
      }
    });
  }

  // Validate Questions
  const seenQuestionIds = new Set<string>();
  if (!Array.isArray(candidate.questions)) {
    issues.push({
      path: 'questions',
      field: 'questions',
      setId,
      message: 'Property "questions" must be an array',
    });
  } else {
    candidate.questions.forEach((q, qIndex) => {
      const qPath = `questions[${qIndex}]`;

      if (typeof q !== 'object' || q === null || Array.isArray(q)) {
        issues.push({
          path: qPath,
          setId,
          message: 'Question item must be a non-null object',
        });
        return;
      }

      const qObj = q as Record<string, unknown>;
      const questionId = typeof qObj.id === 'string' ? qObj.id : undefined;

      // Question ID
      if (typeof qObj.id !== 'string' || qObj.id.trim() === '') {
        issues.push({
          path: `${qPath}.id`,
          field: 'id',
          setId,
          message: 'Question "id" must be a non-empty string',
        });
      } else {
        if (seenQuestionIds.has(qObj.id)) {
          issues.push({
            path: `${qPath}.id`,
            field: 'id',
            setId,
            questionId: qObj.id,
            message: `Duplicate question ID within set: "${qObj.id}"`,
          });
        }
        seenQuestionIds.add(qObj.id);
      }

      // Subject ID reference
      if (typeof qObj.subjectId !== 'string' || qObj.subjectId.trim() === '') {
        issues.push({
          path: `${qPath}.subjectId`,
          field: 'subjectId',
          setId,
          questionId,
          message: 'Question "subjectId" must be a non-empty string',
        });
      } else if (!validSubjectIds.has(qObj.subjectId)) {
        issues.push({
          path: `${qPath}.subjectId`,
          field: 'subjectId',
          setId,
          questionId,
          message: `Unknown subject reference: "${qObj.subjectId}" is not defined in subjects list`,
        });
      }

      // Question text
      if (typeof qObj.question !== 'string' || qObj.question.trim() === '') {
        issues.push({
          path: `${qPath}.question`,
          field: 'question',
          setId,
          questionId,
          message: 'Question text must be a non-empty string',
        });
      }

      // Options array (supports 4 or 5 choices)
      if (!Array.isArray(qObj.options)) {
        issues.push({
          path: `${qPath}.options`,
          field: 'options',
          setId,
          questionId,
          message: 'Question "options" must be an array of choices',
        });
      } else {
        if (qObj.options.length !== 4 && qObj.options.length !== 5) {
          issues.push({
            path: `${qPath}.options`,
            field: 'options',
            setId,
            questionId,
            message: `Question must contain exactly 4 or 5 options (found ${qObj.options.length})`,
          });
        }

        qObj.options.forEach((opt, optIndex) => {
          if (typeof opt !== 'string' || opt.trim() === '') {
            issues.push({
              path: `${qPath}.options[${optIndex}]`,
              field: 'options',
              setId,
              questionId,
              message: `Option ${optIndex + 1} cannot be empty`,
            });
          }
        });
      }

      // Correct answer index (between 0 and options.length - 1)
      const optionsCount = Array.isArray(qObj.options) ? qObj.options.length : 4;
      if (
        typeof qObj.correctAnswer !== 'number' ||
        !Number.isInteger(qObj.correctAnswer) ||
        qObj.correctAnswer < 0 ||
        qObj.correctAnswer >= optionsCount
      ) {
        issues.push({
          path: `${qPath}.correctAnswer`,
          field: 'correctAnswer',
          setId,
          questionId,
          message: `correctAnswer must be an integer between 0 and ${optionsCount - 1} (received ${String(qObj.correctAnswer)})`,
        });
      }

      // Answer status
      if (
        typeof qObj.answerStatus !== 'string' ||
        !VALID_ANSWER_STATUSES.includes(qObj.answerStatus as AnswerStatus)
      ) {
        issues.push({
          path: `${qPath}.answerStatus`,
          field: 'answerStatus',
          setId,
          questionId,
          message: `answerStatus must be "verified" or "needs_review" (received "${String(qObj.answerStatus)}")`,
        });
      }

      // Optional explanation
      if (
        qObj.explanation !== undefined &&
        qObj.explanation !== null &&
        typeof qObj.explanation !== 'string'
      ) {
        issues.push({
          path: `${qPath}.explanation`,
          field: 'explanation',
          setId,
          questionId,
          message: 'Question explanation must be a string or null',
        });
      }

      // Optional source object
      if (qObj.source !== undefined && qObj.source !== null) {
        if (typeof qObj.source !== 'object' || Array.isArray(qObj.source)) {
          issues.push({
            path: `${qPath}.source`,
            field: 'source',
            setId,
            questionId,
            message: 'Question source must be an object',
          });
        } else {
          const srcObj = qObj.source as Record<string, unknown>;
          if (srcObj.page !== undefined) {
            if (
              typeof srcObj.page !== 'number' ||
              !Number.isInteger(srcObj.page) ||
              srcObj.page <= 0
            ) {
              issues.push({
                path: `${qPath}.source.page`,
                field: 'source.page',
                setId,
                questionId,
                message: `Source page must be a positive integer (received ${String(srcObj.page)})`,
              });
            }
          }
        }
      }
    });
  }

  if (issues.length > 0) {
    return { success: false, errors: issues };
  }

  return { success: true, data: raw as QuestionSet };
}
