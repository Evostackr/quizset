# QuizSet — Distraction-Free MCQ Practice Platform

> **Tagline:** Focused practice. Better preparation.

QuizSet is a clean, minimal, distraction-free MCQ practice website designed for students who want a simple, direct way to practice question sets.

This phase implements the **JSON Question-Set Data Architecture**, establishing the file format, validation engine, central catalogue, loading service, and subject mapping engine.

---

## Technology Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) + PostCSS
- **Testing:** [Vitest 5](https://vitest.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Prerequisites

- **Node.js:** v18.0.0 or later (v22 LTS recommended)
- **npm:** v9.0.0 or later

---

## Getting Started

### 1. Installation

```bash
cd quizset
npm install
```

### 2. Local Development

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application runs at `http://localhost:5173`.

### 3. Running Automated Tests

Run the full Vitest automated test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### 4. Production Build & Linting

```bash
# Type check and build optimized production bundle
npm run build

# Run linter
npm run lint

# Preview production build locally
npm run preview
```

---

## Question Set Architecture

QuizSet uses a static, catalogue-driven JSON structure under `public/data/`:

```text
public/data/
├── test-sets.json             # Central catalogue manifest
└── test-sets/                 # Individual question set JSON files
    ├── set-001.json
    └── set-002.json
```

### Central Catalogue Format (`test-sets.json`)

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

- `version`: Must be `1`.
- `status`: `'published'` or `'draft'`. Only published sets appear on the homepage.
- `file`: Path relative to public root; must reside inside `data/test-sets/` and end with `.json`.

### Individual Question Set Format (`set-001.json`)

```json
{
  "schemaVersion": 1,
  "id": "set-001",
  "title": "NEET Biology — Genetics",
  "description": "50 high-yield questions on Mendelian genetics.",
  "subjects": [
    { "id": "genetics", "name": "Genetics & Inheritance" }
  ],
  "questions": [
    {
      "id": "q001",
      "subjectId": "genetics",
      "question": "Which of the following traits in Pisum sativum was recessive?",
      "options": [
        "Round seed shape",
        "Yellow pod colour",
        "Green seed colour",
        "Terminal flower position"
      ],
      "correctAnswer": 1,
      "answerStatus": "verified",
      "explanation": "Yellow pod colour is recessive; green pod colour is dominant.",
      "source": { "page": 4 }
    }
  ]
}
```

- `schemaVersion`: Must be `1`.
- `correctAnswer`: Zero-based integer index (`0` for first option, `1` for second, `2` for third, `3` for fourth).
- `options`: Exactly 4 non-empty strings.
- `answerStatus`: `'verified'` or `'needs_review'`. Questions marked `needs_review` are excluded from scored quiz attempts.

---

## How to Add a New Test Set

1. **Extract Questions with ChatGPT:**
   - Provide your question screenshots to ChatGPT.
   - Instruct ChatGPT to extract the questions, 4 options, subject assignments, and 0-indexed answer keys formatted to QuizSet Schema v1.
2. **Review & Verify Answer Keys:**
   - Verify that all correct answer indices are accurate and set `"answerStatus": "verified"`.
3. **Save Question Set JSON:**
   - Save the formatted JSON into `public/data/test-sets/<set-id>.json`.
4. **Register in Catalogue:**
   - Add a new entry to `public/data/test-sets.json` with `"status": "published"`.
5. **Verify:**
   - Run `npm test` or open `http://localhost:5173/` in your browser. The new card will automatically render on the homepage without needing any code changes.

---

## Project Structure

```text
quizset/
├── public/
│   ├── favicon.svg                    # Brand SVG favicon
│   └── data/
│       ├── test-sets.json             # Central catalogue manifest
│       └── test-sets/                 # Individual question set files
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root App component
│   │   └── router.tsx                 # Client route configuration
│   ├── components/
│   │   ├── branding/
│   │   │   └── QuizSetLogo.tsx        # QuizSet logo & wordmark
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Global application header
│   │   │   └── Footer.tsx             # Global minimal footer
│   │   ├── test-sets/
│   │   │   ├── TestSetCard.tsx        # Reusable test set card
│   │   │   └── TestSetGrid.tsx        # Responsive grid with empty state
│   │   └── ui/
│   │       └── Button.tsx             # Accessible 44px min-height button
│   ├── data/
│   │   ├── questionValidator.ts       # Structural & security validator
│   │   ├── subjectMapper.ts           # Pure functions for subject & mode filtering
│   │   ├── testSetLoader.ts           # Asynchronous catalogue/set loading service
│   │   └── sampleTestSets.ts          # Placeholder registry
│   ├── pages/
│   │   ├── HomePage.tsx               # Catalogue-driven practice dashboard
│   │   └── ModePlaceholderPage.tsx    # Validated mode placeholder destination
│   ├── styles/
│   │   └── globals.css                # Design tokens & CSS variables
│   ├── types/
│   │   ├── questionSet.ts             # Domain models, schema interfaces
│   │   └── testSet.ts                 # Presentation-layer types
│   └── main.tsx                       # React DOM entry point
├── tests/
│   ├── fixtures.ts                    # Reusable mock datasets
│   ├── questionValidator.test.ts      # Validator unit tests
│   ├── subjectMapper.test.ts          # Subject mapper unit tests
│   └── testSetLoader.test.ts          # Loader unit tests
├── ARCHITECTURE.md                    # Engineering architecture documentation
├── DESIGN.md                          # Design system & visual specification
├── package.json                       # Dependencies & scripts
└── tailwind.config.js                 # Tailwind design token configuration
```

---

## Documentation Links

- **[ARCHITECTURE.md](./ARCHITECTURE.md):** In-depth technical breakdown of the static JSON architecture, schema validation, asynchronous loading service, and subject filtering algorithms.
- **[DESIGN.md](./DESIGN.md):** Complete visual specification covering Focus Blue design system, exact color hex tokens, typography scale, spacing conventions, and accessibility rules.
