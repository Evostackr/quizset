# QuizSet Design System & Visual Specification

**Product Name:** QuizSet  
**Tagline:** Focused practice. Better preparation.  
**Version:** 1.0.0 (Foundation Phase)

---

## 1. Brand Positioning & Principles

QuizSet is an academic, distraction-free MCQ practice platform engineered for students seeking a simple, direct way to access and complete question-set tests.

### Core Design Principles
1. **Academic Clarity:** Clean lines, deliberate hierarchy, and legible typography that promote cognitive focus without feeling sterile or antiquated.
2. **Distraction-Free Practice:** Elimination of intrusive animations, gamification badges, advertisements, social counters, and dashboard clutter.
3. **Calm Predictability:** Standardized button placements, unmistakable interactive states, and consistent spacing across all viewports.
4. **Accessible by Default:** High-contrast text pairings, prominent keyboard navigation focus rings, min 44px touch targets, and full respect for reduced-motion system preferences.

---

## 2. Logo Direction & Usage

The QuizSet identity combines a modern sans-serif wordmark with a compact blue icon featuring a checkmark and a subtle quiz document motif.

### Icon Design
- **Mark:** An 8px rounded container rendered in Focus Blue (`#2563EB`) with a translucent white document layer (`fillOpacity="0.18"`) and a 2.75px crisp white stroke checkmark.
- **Scalability:** Renders crisply at small dimensions (16px favicon, 32px header icon, 40px prominent displays).
- **Favicon:** Stored as an SVG at `public/favicon.svg`.
- **Wordmark:** Typeset in Inter SemiBold with `Quiz` in Deep Navy (`#172554`) and `Set` in Focus Blue (`#2563EB`).

### Permitted Variations
- **Header:** Full mark (icon + wordmark) linked to the homepage root (`/`).
- **Footer:** Compact wordmark with static (non-linking) display.
- **Icon Only:** Reserved for mobile viewports, favicons, or constrained application sidebars.

---

## 3. Colour Palette & Tokens

The application strictly implements the specified 9-color palette without arbitrary one-off values.

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| **Primary / Focus Blue** | `#2563EB` | Primary buttons, active states, brand accent, and interactive elements |
| **Deep Navy** | `#172554` | Primary page headings, brand wordmark, high-emphasis text |
| **Page Background** | `#F8FAFC` | Global page backdrop (calm slate off-white) |
| **Surface** | `#FFFFFF` | Card backgrounds, header/footer backgrounds, dialog surfaces |
| **Body Text** | `#334155` | Primary body text, descriptions, general interface labels |
| **Secondary Text** | `#64748B` | Subtitles, supporting details, breadcrumbs, metadata |
| **Border** | `#E2E8F0` | Dividers, card boundaries, subtle container outlines |
| **Success** | `#16A34A` | Reserved for future correct-answer feedback and positive validation |
| **Error** | `#DC2626` | Reserved for future incorrect-answer feedback and error states |

### Interactive State Variations
- `Focus Blue Hover`: `#1D4ED8`
- `Focus Blue Active`: `#1E40AF`
- `Focus Blue Subtle Background`: `#EFF6FF` (border: `#DBEAFE`)
- `Border Hover`: `#CBD5E1`
- `Surface Hover`: `#F8FAFC`

### CSS Variable Mapping
```css
:root {
  --color-primary-blue: #2563EB;
  --color-primary-blue-hover: #1D4ED8;
  --color-primary-blue-subtle: #EFF6FF;
  --color-deep-navy: #172554;
  --color-page-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-body-text: #334155;
  --color-secondary-text: #64748B;
  --color-border: #E2E8F0;
  --color-success: #16A34A;
  --color-error: #DC2626;
}
```

---

## 4. Typography Scale

The primary typeface is **Inter**, backed by a reliable system sans-serif fallback stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).

| Element | Size Range | Weight | Tailwind Class | Color |
|---|---|---|---|---|
| **Eyebrow / Category** | 12–14px | SemiBold (600) | `text-xs sm:text-sm uppercase tracking-wider` | Focus Blue (`#2563EB`) |
| **Main Page Heading (H1)** | 28–36px | SemiBold (600) | `text-3xl sm:text-4xl tracking-tight` | Deep Navy (`#172554`) |
| **Section Heading (H2)** | 20–24px | SemiBold (600) | `text-xl sm:text-2xl tracking-tight` | Deep Navy (`#172554`) |
| **Card Heading (H3)** | 18–20px | SemiBold (600) | `text-lg sm:text-xl font-semibold` | Deep Navy (`#172554`) |
| **Hero Description** | 16–18px | Regular (400) | `text-base sm:text-lg leading-relaxed` | Secondary Text (`#64748B`) |
| **Body Text** | 14–16px | Regular (400) | `text-sm sm:text-base leading-relaxed` | Body Text (`#334155`) |
| **Supporting / Meta Labels** | 12–14px | Regular/Medium | `text-xs sm:text-sm` | Secondary Text (`#64748B`) |

---

## 5. Spacing, Sizing & Grid Layout

- **Maximum Page Container Width:** `1200px` (`max-w-[1200px] mx-auto`).
- **Horizontal Page Margins:**
  - Mobile (<640px): `16px` (`px-4`).
  - Desktop (≥640px): `32px` (`sm:px-8`).
- **Vertical Section Spacing:**
  - Hero to Section Gap: `40px–56px` (`mb-10 sm:mb-14`).
  - Card internal padding: `20px` on mobile, `24px` on desktop (`p-5 sm:p-6`).
  - Grid Gap: `24px` (`gap-6`).

---

## 6. Radii, Borders & Elevation

- **Card Border Radius:** `16px` (`rounded-[16px]`).
- **Button Border Radius:** `12px` (`rounded-xl`).
- **Badge / Icon Container Radius:** `12px` (`rounded-xl`).
- **Borders:** `1px solid #E2E8F0` with subtle hover enhancement to `#CBD5E1`.
- **Restrained Shadows:**
  - Resting Card: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
  - Hover Card: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
  - No dramatic floating elevations, glow effects, or glassmorphism.

---

## 7. Button Anatomy & Interactive States

Buttons are standardized interactive controls guaranteeing a minimum 44px tap target.

### Primary Button (`variant="primary"`)
- **Background:** `#2563EB`
- **Text:** `#FFFFFF`, medium weight (500)
- **Hover:** `#1D4ED8`
- **Active:** `#1E40AF`
- **Focus Ring:** 2px solid `#2563EB` with 2px offset
- **Usage:** Primary action on cards (`Custom Subject`), primary confirmation triggers.

### Secondary Button (`variant="secondary"`)
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E2E8F0`
- **Text:** `#172554`, medium weight (500)
- **Hover:** Background `#F8FAFC`, Border `#CBD5E1`
- **Active:** Background `#F1F5F9`
- **Focus Ring:** 2px solid `#2563EB` with 2px offset
- **Usage:** Secondary action on cards (`Mix Questions`), navigation returns.

---

## 8. Test-Set Card Anatomy

Every test-set card follows an invariant four-part structure:
```
+-------------------------------------------------------------+
|  [ [Icon Badge] (48x48px, #EFF6FF background, Blue Icon) ]  |
|                                                             |
|  Test Set Title (18-20px Semibold, Deep Navy #172554)       |
|  Short Placeholder Description (14px, #64748B)              |
|                                                             |
|  +---------------------------+ +--------------------------+ |
|  | [Custom Subject] (Primary)| | [Mix Questions] (Sec.)   | |
|  +---------------------------+ +--------------------------+ |
+-------------------------------------------------------------+
```
- **Strict Scope Guard:** No completion badges, percentage rings, questions counts, or star ratings are displayed during this phase.
- **Empty State Behavior:** When zero test sets are registered, the grid renders a minimal, calm container stating *"No test sets available yet."* rather than populating placeholder or simulated cards.
- **Loading State Behavior:** Renders a clean 16px-radius surface with a 24px Focus Blue (`#2563EB`) spinner and muted caption.
- **Error State Behavior:** Displays an error surface bounded by `#FECACA` border, `#FEF2F2` circular badge with `#DC2626` alert icon, and a standard secondary `Retry` button.

---

## 9. Responsive Layout Rules

- **Mobile (< 768px):**
  - Single column card stack (`grid-cols-1`).
  - Action buttons stack or split into equal columns with 44px minimum tap target.
  - Page padding is 16px.
- **Tablet (768px – 1023px):**
  - Two column card grid (`md:grid-cols-2`).
- **Desktop (≥ 1024px):**
  - Three column card grid (`lg:grid-cols-3`) when 3+ sets are present.
  - Page container capped at 1200px and horizontally centered.

---

## 10. Accessibility & Motion

- **Keyboard Focus:** Visible outline (`:focus-visible`) styled with `outline: 2px solid #2563EB; outline-offset: 2px;`.
- **Target Sizes:** All interactive touchpoints adhere to WCAG AAA minimum bounding areas (≥44x44px).
- **Color Contrast:** All body text meets WCAG AA standards (minimum 4.5:1 on `#FFFFFF` and `#F8FAFC`).
- **Reduced Motion:** All transitions use `transition-all duration-200` coupled with `motion-reduce:transition-none`.

---

## 11. Extension Guidelines for Future Pages

When adding future pages (Subject Selector, Question Runner, Score Review):
1. Import and reuse existing atomic components (`Button`, `Header`, `Footer`, `QuizSetLogo`).
2. Consume tokens through Tailwind utility classes (`text-[#172554]`, `bg-[#2563EB]`, `border-[#E2E8F0]`) or CSS variables.
3. Reserve `#16A34A` and `#DC2626` strictly for question answer states (correct / incorrect).
4. Do not invent new accent colors, shadows, or rounded corners outside the established design token scale.

