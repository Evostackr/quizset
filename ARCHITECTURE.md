# QuizSet Architecture & Engineering Documentation

**Document Status:** Complete (Phase 2 — JSON Question Set Architecture)  
**Release Target:** Question Data Layer & Validation Engine  
**Tech Stack:** React 19 + TypeScript 7 + Vite 8 + Tailwind CSS 3.4 + React Router 7 + Vitest 5 + Lucide React

---

## Part 1: Current Implementation Architecture

### 1. Architectural Overview & Content Pipeline

QuizSet employs a **static, catalogue-driven JSON architecture** designed to consume externally prepared question sets:

```
[ ChatGPT / External Content Preparation ]
  ├── User provides raw question screenshots
  ├── ChatGPT extracts questions, options, subjects, and answer keys
  └── Validates and formats data into Schema v1 JSON
         │
         ▼
[ Static Data Storage in QuizSet ]
  ├── public/data/test-sets.json         (Central Catalogue Manifest)
  └── public/data/test-sets/<set-id>.json (Per-set Question Data)
         │
         ▼
[ Client-Side Question Data Layer ]
  ├── testSetLoader.ts       (Async fetch, caching, request deduplication, HTTP/JSON error handling)
  ├── questionValidator.ts   (Strict schema v1 validation, security checks, structural enforcement)
  └── subjectMapper.ts       (Pure subject derivation, eligibility gating, mode filtering)
         │
         ▼
[ Presentation & Route Integration ]
  ├── HomePage.tsx           (Dynamically renders published test sets from catalogue)
  ├── TestSetGrid.tsx        (Responsive card grid with minimal empty state)
  └── ModePlaceholderPage.tsx (Validates set existence & displays subject breakdown)
```

**Key Boundary:** The website itself contains *no OCR, no screenshot processing, and no automated AI extraction*. It purely acts as a deterministic consumer of validated, structured JSON files.

---

### 2. Project Directory Structure

```text
quizset/
├── public/
│   ├── favicon.svg                    # Brand favicon (Focus Blue checkmark badge)
│   └── data/
│       ├── test-sets.json             # Central catalogue manifest
│       └── test-sets/                 # Directory holding per-set JSON files
│           └── .gitkeep
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root application component binding router
│   │   └── router.tsx                 # Client-side route declarations
│   ├── components/
│   │   ├── branding/
│   │   │   └── QuizSetLogo.tsx        # Brand mark (SVG icon + Inter wordmark)
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Responsive global navigation bar
│   │   │   └── Footer.tsx             # Distraction-free global footer
│   │   ├── test-sets/
│   │   │   ├── TestSetCard.tsx        # Reusable test set surface card
│   │   │   └── TestSetGrid.tsx        # Responsive grid layout with empty fallback
│   │   └── ui/
│   │       └── Button.tsx             # Standardized accessible 44px button component
│   ├── data/
│   │   ├── questionValidator.ts       # Structural and security validation engine
│   │   ├── subjectMapper.ts           # Pure functions for subject & mode filtering
│   │   └── testSetLoader.ts           # Asynchronous catalogue and set loader service
│   ├── pages/
│   │   ├── HomePage.tsx               # Primary view (Catalogue-driven grid + states)
│   │   └── ModePlaceholderPage.tsx    # Validated mode destination view
│   ├── styles/
│   │   └── globals.css                # CSS variables, typography imports, resets
│   ├── types/
│   │   ├── questionSet.ts             # Domain models, schema interfaces, validation types
│   │   └── testSet.ts                 # Presentation-layer test set & mode types
│   └── main.tsx                       # React application DOM entrypoint
├── tests/
│   ├── fixtures.ts                    # Reusable mock datasets for automated tests
│   ├── questionValidator.test.ts      # Unit tests for manifest and question validation
│   ├── subjectMapper.test.ts          # Unit tests for subject mapping & filtering
│   └── testSetLoader.test.ts          # Unit tests for async loader & error states
├── ARCHITECTURE.md                    # Technical architecture & roadmap document
├── DESIGN.md                          # Visual specification & design tokens
├── index.html                         # HTML shell with Google Fonts & metadata
├── package.json                       # Package metadata, run & test scripts
├── postcss.config.js                  # PostCSS pipeline for Tailwind processing
├── README.md                          # Quickstart developer onboarding guide
├── tailwind.config.js                 # Theme extension tokens and responsive rules
├── tsconfig.json                      # TypeScript root compiler configuration
└── vite.config.ts                     # Vite build configuration
```

---

### 3. JSON Data Formats & Schemas (Schema Version 1)

#### 3.1 Central Catalogue Manifest (`public/data/test-sets.json`)
The catalogue maintains a registry of all available test sets:

```json
{
  "version": 1,
  "testSets": [
    {
      "id": "bpsc-tre-set01-social-science",
      "title": "BPSC TRE Set 01 – Social Science",
      "description": "BPSC TRE Middle School Teachers (Class 6 to 8) - Social Science. 160 questions across History, Geography, Polity, and Economics.",
      "file": "data/test-sets/quizset_bpsc_tre_set01_social_science.json",
      "status": "published",
      "icon": "book-open",
      "totalQuestions": 160,
      "subjectCounts": { "history": 40, "geography": 40, "polity": 40, "economics": 40 }
    },
    {
      "id": "bpsc-tre-set02-social-science",
      "title": "BPSC TRE Set 02 – Social Science",
      "description": "BPSC TRE Middle School Teachers (Class 6 to 8) - Social Science. 160 questions across History, Geography, Polity, and Economics.",
      "file": "data/test-sets/set2.json",
      "status": "published",
      "icon": "layers",
      "totalQuestions": 160,
      "subjectCounts": { "history": 40, "geography": 40, "polity": 40, "economics": 40 }
    }
  ]
}
```

**Manifest Rules:**
- `version`: Strictly integer `1`.
- `id`: Unique, stable string across all entries.
- `title` & `description`: Non-empty strings.
- `file`: Relative path residing within `data/test-sets/` ending in `.json`.
- `status`: Must be `'published'` or `'draft'`. Only `published` sets are rendered on the homepage or permitted into quiz practice.

#### 3.2 Individual Question Set (`public/data/test-sets/<set-id>.json`)
Each question set encapsulates its own metadata, subject taxonomy, and question bank:

```json
{
  "schemaVersion": 1,
  "id": "set-001",
  "title": "NEET Biology — Genetics & Evolution",
  "description": "50 high-yield questions on Mendelian genetics and molecular basis of inheritance.",
  "subjects": [
    { "id": "principles-of-inheritance", "name": "Principles of Inheritance" },
    { "id": "molecular-basis", "name": "Molecular Basis of Inheritance" }
  ],
  "questions": [
    {
      "id": "q001",
      "subjectId": "principles-of-inheritance",
      "question": "Which of the following traits in Pisum sativum studied by Mendel was recessive?",
      "options": [
        "Round seed shape",
        "Yellow pod colour",
        "Green seed colour",
        "Terminal flower position"
      ],
      "correctAnswer": 1,
      "answerStatus": "verified",
      "explanation": "Yellow pod colour is a recessive trait; green pod colour is dominant.",
      "source": { "page": 4 }
    }
  ]
}
```

**Question Set Rules:**
- `schemaVersion`: Strictly integer `1`. Unsupported schema versions are rejected with explicit errors.
- `id`: Must match the identifier defined in the central catalogue manifest.
- `subjects`: Array of unique subject definitions (`{ id: string, name: string }`). Subject names must not be empty.
- `questions`: Array of question objects with unique `id`s within the set.
  - `subjectId`: Must map to an existing subject in the same question set's `subjects` array.
  - `question`: Non-empty question string.
  - `options`: Exactly 4 non-empty string choices.
  - `correctAnswer`: Integer index (`0`, `1`, `2`, or `3`).
  - `answerStatus`: `'verified'` or `'needs_review'`.
  - `explanation`: Optional string or `null`.
  - `source`: Optional object with `page?: number` (positive integer).

---

### 4. Validation Engine (`src/data/questionValidator.ts`)

The validation engine guarantees data integrity and prevents corrupt or malformed files from entering runtime state:

1. **Manifest Validation (`validateManifest`):**
   - Verifies manifest version `1`.
   - Rejects duplicate test-set IDs.
   - Enforces valid status values (`published` | `draft`).
   - **Path Traversal Security:** Rejects file paths containing `..` or protocol prefixes (`http:`, `https:`, `//`, `file:`, `data:`).
   - Validates that paths reside within `data/test-sets/` and end with `.json`.

2. **Question Set Validation (`validateQuestionSet`):**
   - Verifies `schemaVersion === 1`.
   - Cross-checks internal `id` against catalogue entry `id` to catch mismatched files.
   - Ensures subject IDs are unique within the set.
   - Enforces question ID uniqueness within the set.
   - Verifies every question's `subjectId` belongs to the set's declared `subjects`.
   - Enforces exactly 4 non-empty options per question.
   - Enforces `0 <= correctAnswer <= 3` (integer).
   - Enforces `answerStatus` is `'verified'` or `'needs_review'`.
   - Rejects negative or non-integer source page references.

---

### 5. Asynchronous Data Loader (`src/data/testSetLoader.ts`)

The loading service handles data fetching without introducing heavyweight external state libraries:

- **On-Demand Loading:** The homepage loads *only* the central catalogue manifest (`test-sets.json`). Individual question-set files are fetched only when the user selects a set.
- **Request Deduplication & Caching:** Concurrent calls for the same resource share an active in-flight `Promise`. Validated manifests and question sets are cached in memory.
- **Structured Error Handling:** Returns a discriminated union `LoaderResult<T>`:
  ```typescript
  export type LoaderResult<T> =
    | { success: true; data: T }
    | { success: false; error: LoaderError };
  ```
  Error codes include:
  - `NOT_FOUND`: HTTP 404 for missing manifest or set file.
  - `NETWORK_ERROR`: Connectivity or network failures.
  - `INVALID_JSON`: Malformed JSON syntax in data files.
  - `INVALID_CATALOGUE`: Structural or security validation errors in manifest.
  - `SET_NOT_IN_CATALOGUE`: Set ID not present in manifest.
  - `SET_NOT_PUBLISHED`: Set exists but is marked `'draft'`.
  - `INVALID_QUESTION_SET`: Schema violations or mismatched internal ID.
  - `SCHEMA_VERSION_MISMATCH`: File has an unsupported `schemaVersion`.

---

### 6. Subject Mapping Engine (`src/data/subjectMapper.ts`)

All filtering and subject discovery logic is isolated into pure, testable functions independent of React components:

1. **Answer Eligibility Gating:**
   - `isQuestionEligible(question)`: Returns `true` if and only if `question.answerStatus === 'verified'`.
   - *Rule:* Questions marked `'needs_review'` are excluded from scored quizzes to prevent inaccurate grading.

2. **Dynamic Subject Derivation (`getAvailableSubjects`):**
   - Subjects are derived directly from the loaded question set—no hardcoded subject names exist in application code.
   - Excludes subjects with zero eligible questions by default.

3. **Custom Subject Mode Filtering (`filterQuestionsBySubjects`):**
   - Filters questions strictly to one or more selected `subjectIds` within the target set.
   - Defaults to verified questions only (`verifiedOnly: true`).

4. **Mix Questions Mode Filtering (`getMixQuestions`):**
   - Gathers all verified questions across all subjects in the set.
   - Supports pure Fisher-Yates shuffling with an injectable `randomFn` for deterministic testing.

5. **Cross-Set Isolation:**
   - Every operation requires a specific `QuestionSet` instance. Question IDs and objects are strictly scoped to their container set; questions cannot leak across sets.

---

### 7. Security Boundaries & Limitations

1. **Client-Side Data Accessibility:**
   - All files under `public/data/` are static assets fetched over HTTP. Users can inspect the network tab and discover questions, options, and `correctAnswer` indices.
   - *Security Rule:* Do not place confidential test questions, private user data, or sensitive keys in client-accessible JSON files.
   - Client-side validation ensures structural correctness; it cannot provide cryptographic answer secrecy.
2. **Path Traversal Mitigation:**
   - Manifest file paths are strictly sanitized against directory climbing (`..`) and arbitrary protocol targets.

---

### 8. Automated Test Suite

QuizSet includes 50 automated unit tests built on **Vitest**:
- `tests/questionValidator.test.ts`: Verifies structural integrity, schema version enforcement, option counting, out-of-range keys, duplicate IDs, path traversal security, and normalizes both BPSC TRE Set 01 (array) and Set 02 (map) formats.
- `tests/subjectMapper.test.ts`: Tests single subject filtering, multiple subject combination, Mix Questions aggregation, zero-question subject exclusion, and cross-set isolation.
- `tests/testSetLoader.test.ts`: Tests manifest loading, draft filtering, 404 handling, malformed JSON recovery, and ID mismatch detection.

Run test suite:
```bash
npm test
```

---

## Part 2: Future Architecture (Documentation Only)

The question data layer implemented in Phase 2 feeds directly into the upcoming interactive features:

```
[ Validated QuestionSet ]
         │
         ├───► [ Custom Subject Selection Screen ] (Phase 3)
         │       - User selects 1+ subjects using getAvailableSubjects()
         │       - Displays question counts using getSubjectSummaries()
         │
         └───► [ Mix Questions Launch ] (Phase 3)
                 - Directly invokes getMixQuestions({ shuffle: true })
                 │
                 ▼
       [ Shared Quiz Runner ] (Phase 4)
       - Distraction-free single question view
       - Instant or review-based answer feedback
       - Visual feedback using #16A34A (Success) and #DC2626 (Error)
                 │
                 ▼
       [ Results & Review Flow ] (Phase 4)
       - Score calculation on verified questions
       - Review incorrect answers and explanations
```

> **Future Server Migration Note:** If answer secrecy is required in a future release, the question data structures and validation schemas established here can be moved behind an authenticated API (such as the Parrot OS PocketBase server) without changing client presentation contracts.
