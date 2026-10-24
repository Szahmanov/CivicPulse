# Implementation Plan: CivicPulse

## Overview

CivicPulse is a static, offline-capable civic dashboard built with Next.js App Router and TypeScript. Implementation proceeds in ten sequential tasks: project bootstrap, data layer, pure logic functions with property tests, shared layout, dashboard UI, action brief panel, secondary pages, accessibility and error handling, full test suite, and a final quality gate.

## Tasks

- [x] 1. Bootstrap the Next.js TypeScript and Tailwind project
  - Initialize Next.js App Router project with TypeScript and Tailwind CSS v3
  - Configure `next.config.ts` with `output: 'export'` to enable fully static builds
  - Verify `npm run build` produces a static `/out` directory with zero errors
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 2. Add local sample-data files and TypeScript data models
  - [x] 2.1 Create sample data JSON files
    - Create `data/311-requests.json` with ~500 synthetic records and a `meta` object (`snapshotDate`, `source`, `officialUrl`, `limitations`)
    - Create `data/ej-outreach-context.json` with ~25 neighborhood-level records and a `meta` object
    - Create `data/fema-declarations.json` with ~50 historical MA FEMA declaration records and a `meta` object
    - _Requirements: 1.2, 6.2, 8.1_
  - [x] 2.2 Define TypeScript interfaces and loaders
    - Define interfaces `Request311`, `EJOutreachContext`, `FemaDeclaration`, `DataFileMeta` in `src/types/index.ts`
    - Implement typed static imports (no `fetch()`) in `src/data/loaders.ts`
    - Add Zod schemas for runtime validation of each data file; export validated data from loaders
    - _Requirements: 1.2, 8.2, 9.1_

- [x] 3. Implement and test the pure priority-score functions
  - [x] 3.1 Implement `normalizeScoreInputs` and `computePriorityScore` in `src/data/scoring.ts`
    - `normalizeScoreInputs(raw, maxima): ScoreInputs` — pure, no side effects
    - `computePriorityScore(inputs: ScoreInputs): ScoreResult` — weights: open-case pressure 35, repeated 30, on-time 25, outreach flag 10; result clamped to [0, 100]
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 3.7_
  - [x] 3.2 Implement aggregation, filter, and sort functions
    - `aggregateByNeighborhood(records, allNeighborhoods): NeighborhoodAggregate[]` in `src/data/aggregations.ts`
    - `applyFilters(records, filters): Request311[]` in `src/data/filters.ts`
    - `sortByScore(cards): PriorityCardProps[]` in `src/data/aggregations.ts`
    - All functions must be pure with no I/O or mutation
    - _Requirements: 1.1, 1.3, 1.4, 2.6, 2.7, 3.3_
  - [x]* 3.3 Write property-based test for Property 1 — Aggregation Correctness
    - Install `fast-check`; configure Vitest; write test in `src/data/__tests__/aggregations.test.ts`
    - **Property 1: Aggregation Correctness** — every distinct neighborhood appears in the result, and the sum of counts equals `records.length`; filtered-out neighborhoods appear with count zero
    - Use `fc.array(arbRequest311, { minLength: 1 })`, minimum 100 runs
    - **Validates: Requirements 1.1, 1.3, 1.4**
  - [x]* 3.4 Write property-based test for Property 2 — Filter Completeness
    - Write test in `src/data/__tests__/aggregations.test.ts`
    - **Property 2: Filter Completeness** — every returned record satisfies all active criteria; no matching record is excluded; default filters return all records unchanged
    - Use `fc.array(arbRequest311)` and `arbFilterState`, minimum 100 runs
    - **Validates: Requirements 2.6, 2.7**
  - [x]* 3.5 Write property-based test for Property 3 — Score Determinism and Boundedness
    - Write test in `src/data/__tests__/scoring.test.ts`
    - **Property 3: Score Determinism and Boundedness** — score is always in [0, 100]; same inputs always produce the same score; `outreachContextFlag = 1` adds exactly 10 points over `outreachContextFlag = 0`
    - Use `arbScoreInputs`, minimum 100 runs
    - **Validates: Requirements 3.2, 3.4, 3.5, 3.6, 3.7**
  - [x]* 3.6 Write property-based test for Property 4 — Priority Card Sort Order
    - Write test in `src/data/__tests__/aggregations.test.ts`
    - **Property 4: Priority Card Sort Order** — for every adjacent pair `(cards[i], cards[i+1])` in the sorted result, `cards[i].score >= cards[i+1].score`
    - Use `fc.array(arbPriorityCardData, { minLength: 2 })`, minimum 100 runs
    - **Validates: Requirements 3.3**

- [x] 4. Build the shared layout, navigation, disclaimer, and source footer
  - [x] 4.1 Implement `SitewideLayout` component in `src/components/SitewideLayout.tsx`
    - Sticky top banner: "CivicPulse is not an official City of Boston service."
    - Navigation links to Dashboard (`/`), Preparedness (`/preparedness`), Data & Limitations (`/data-limitations`)
    - Per-page disclaimer slot prop: "CivicPulse does not make enforcement, benefit, emergency, or eligibility decisions."
    - Footer with MA 211 link (mass211.org), official 311 and FEMA data source links, snapshot date from `DataFileMeta`
    - All external links: `target="_blank"`, `rel="noopener noreferrer"`, descriptive `aria-label`
    - Keyboard navigable; all text meets WCAG 2.1 AA contrast ratios via Tailwind palette
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.3, 10.1_
  - [x]* 4.2 Write unit tests for `SitewideLayout`
    - Verify banner text, disclaimer text, and footer links are present in the rendered output
    - Verify all external links have `target="_blank"`, `rel="noopener noreferrer"`, and descriptive text
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.3, 10.1_

- [x] 5. Build the Dashboard filters, summary cards, neighborhood table, and priority cards
  - [x] 5.1 Implement `FilterContext` and `FilterBar` in `src/components/FilterBar.tsx`
    - `FilterState` interface: `neighborhoods`, `serviceTopics`, `departments`, `caseStatus`, `startDate`, `endDate`
    - Multi-select `<select>` dropdowns for neighborhoods, service topics, departments — each with explicit `<label>`
    - Radio group for `caseStatus` (open / closed / all)
    - Date `<input>` pair for time period with explicit `<label>`
    - "Clear all filters" button resets to default `FilterState`
    - On change, updates `FilterContext`; all downstream components re-derive from new filter state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 5.2 Implement `SummaryCards` in `src/components/SummaryCards.tsx`
    - Displays: total 311 requests, open cases, unique neighborhoods, unique service topics
    - Each card is an `<article>` with `aria-label`
    - _Requirements: 1.3_
  - [x] 5.3 Implement `NeighborhoodTable` in `src/components/NeighborhoodTable.tsx`
    - `<table>` listing every known neighborhood with filtered count (showing zero when no records match)
    - Columns: Neighborhood, Total Requests, Open Cases, Top Service Topic
    - `<caption>` includes source attribution and snapshot date
    - Column header `<button>` elements enable keyboard-accessible sorting
    - _Requirements: 1.1, 1.3, 1.4, 9.1, 9.2_
  - [x] 5.4 Implement `PriorityCard` in `src/components/PriorityCard.tsx`
    - Displays `score` prominently with a color-blind-safe scale (pattern + text in addition to color)
    - Displays all four score component values as labeled progress bars with numeric annotations
    - Outreach flag row always includes: "Aggregate outreach context — this flag represents neighborhood-level data and does not profile individual residents."
    - Expandable ActionBrief section controlled by a toggle button with `aria-expanded`
    - _Requirements: 3.1, 3.2, 3.3, 3.8, 4.1, 4.2, 4.3, 4.4, 9.4, 10.4_
  - [x] 5.5 Wire `FilterContext` into the Dashboard page
    - In `src/app/page.tsx`, compose `FilterBar`, `SummaryCards`, `NeighborhoodTable`, and `PriorityCard` list
    - Pass filtered data through aggregation and scoring functions; render Priority_Cards in descending score order
    - Display empty-state message when filters produce no matching records
    - _Requirements: 2.6, 2.8, 3.3_
  - [x]* 5.6 Write unit tests for Dashboard components
    - Filter controls render with correct `<label>` associations
    - `PriorityCard` renders all four score component values and outreach flag label
    - Empty-state message appears when filter produces zero results
    - _Requirements: 2.8, 3.8, 4.3_

- [x] 6. Build the Action Brief panel with safe-language validation
  - [x] 6.1 Implement `ActionBrief` component in `src/components/ActionBrief.tsx`
    - Renders all five fields: `whatDataShows`, `whyReviewWarranted`, `dataSource`, `snapshotDate`, `limitations`
    - `limitations` always includes: "Sample data is for demonstration purposes only. CivicPulse is not an official City of Boston service and does not make enforcement, benefit, emergency, or eligibility decisions."
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 10.2_
  - [x] 6.2 Add forbidden-phrase validation utility in `src/utils/validateActionBrief.ts`
    - Export `validateWhyReviewWarranted(text: string): void` that throws (or logs a build-time warning) if `text` matches any phrase in a forbidden-phrases list (enforcement, benefit, eligibility directives)
    - Call this utility when constructing `ActionBrief` data, so violations surface at build time
    - _Requirements: 5.6, 10.2_
  - [x]* 6.3 Write unit tests for `ActionBrief`
    - Disclaimer text is present in rendered output
    - `whyReviewWarranted` field does not contain forbidden enforcement/eligibility phrases
    - All required fields are rendered
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 10.2_

- [x] 7. Build the Preparedness page and Data & Limitations page
  - [x] 7.1 Implement `FemaDeclarationList` and the Preparedness page in `src/app/preparedness/page.tsx`
    - `FemaDeclarationList`: `<table>` of historical MA FEMA declarations with `<caption>` including source citation and snapshot date
    - Prominent `<aside role="note">` at page top: "FEMA data shown here is historical context only. This is not a live emergency alert or current risk assessment."
    - Data loaded from `data/fema-declarations.json` via static import — no network requests
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1_
  - [x] 7.2 Implement the Data & Limitations page in `src/app/data-limitations/page.tsx`
    - Static content documenting what each sample data file contains and does not contain
    - Snapshot date and provenance for each data set
    - Links to Boston 311 official source, FEMA official source, and MA 211 — all with descriptive text and `target="_blank"`
    - Explanation of outreach context flag and what it does and does not represent
    - _Requirements: 7.2, 9.1, 9.4_
  - [x]* 7.3 Write unit tests for Preparedness and Data & Limitations pages
    - Preparedness page renders the historical-context-only `<aside>` notice
    - FEMA table renders source citation and snapshot date
    - Data & Limitations page renders all three external links with descriptive text
    - _Requirements: 6.3, 6.4, 7.2, 7.4_

- [x] 8. Add accessibility, responsive behavior, empty states, and error states
  - [x] 8.1 Implement `AccessibleChart` wrapper in `src/components/AccessibleChart.tsx`
    - Wraps Recharts `BarChart` or `LineChart` in a `<figure>` with `<figcaption>` containing source label and limitations note
    - Visually hidden `<table class="sr-only">` as text alternative containing the same data as the chart
    - `role="img"` and `aria-label` on the SVG container
    - Pattern fills (not color-only) via SVG `<defs>` so bars are distinguishable without color
    - Explicit empty state: chart replaced by a text notice when there are no data points; `<figure>` retains `<figcaption>`
    - _Requirements: 9.1, 11.1, 11.4_
  - [x] 8.2 Apply responsive layout and implement remaining empty/error states
    - Verify responsive layout renders correctly from 320 px to 1920 px without horizontal scroll using Tailwind responsive utilities
    - Implement `DataError` component displayed when Zod validation fails — human-readable message, no crash
    - Add React Suspense boundaries with `LoadingSpinner` (`aria-busy="true"`, visible label) around heavy chart components
    - Ensure empty states are in place for `NeighborhoodTable`, `PriorityCard` list, `FemaDeclarationList`, and `AccessibleChart`
    - _Requirements: 2.8, 8.4, 11.2_
  - [x]* 8.3 Run axe-core accessibility audit on all pages
    - Integrate `vitest-axe` and run automated axe-core checks against Dashboard, Preparedness, and Data & Limitations pages
    - Resolve all violations until axe-core reports zero violations on every page
    - _Requirements: 11.1, 11.3, 11.5_

- [ ] 9. Add full unit test suite, confirm property tests, build verification, and README
  - [ ] 9.1 Complete unit test coverage in `src/components/__tests__/` and `src/app/__tests__/`
    - Filter controls render with correct `<label>` associations
    - `PriorityCard` renders all four score component values
    - `ActionBrief` renders all required fields (source, date, limitations, no-decision statement)
    - External links across all pages have `target="_blank"`, `rel="noopener noreferrer"`, and descriptive text
    - Charts render SR-only `<table>`, `role="img"`, `aria-label`, and `<figcaption>`
    - Preparedness page renders historical-context-only disclaimer
    - Empty-state messages display correctly for each component
    - _Requirements: 4.1, 5.1, 5.3, 5.4, 5.5, 7.3, 7.4, 11.1_
  - [ ] 9.2 Confirm all property-based tests pass and build succeeds
    - Run `npx vitest run` — all property tests from Task 3 and all unit tests from Tasks 4–8 must pass with zero failures
    - Run `npm run build` — must complete with zero TypeScript errors and produce `/out`
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 9.3 Write README.md
    - Project overview and purpose
    - Local dev setup instructions (`npm install`, `npm run dev`)
    - Build and static serve instructions (`npm run build`, `npx serve out`)
    - Data source attributions for 311, FEMA, and EJ outreach data
    - Hackathon disclaimer: CivicPulse is not an official City of Boston service
    - _Requirements: 9.3_

- [ ] 10. Final quality checks
  - Verify `npm run build` passes with zero TypeScript errors and zero warnings
  - Verify `npx vitest run` passes with 100% of tests green
  - Verify axe-core reports zero violations on Dashboard, Preparedness, and Data & Limitations pages
  - Confirm all sitewide disclaimers present on every page: "not an official City of Boston service" + "no enforcement/benefit/emergency/eligibility decisions"
  - Confirm all external links open in new tabs with descriptive text
  - Confirm all charts display source label, limitations note, and snapshot date
  - Confirm outreach context flag is accompanied by aggregate-data label on every occurrence
  - Confirm Preparedness page shows historical-context-only notice
  - Verify responsive layout at 320 px and 1280 px viewport widths (no horizontal scroll)
  - _Requirements: 1.1–1.4, 2.1–2.8, 3.1–3.8, 4.1–4.4, 5.1–5.6, 6.1–6.6, 7.1–7.4, 8.1–8.4, 9.1–9.4, 10.1–10.4, 11.1–11.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with a minimum of 100 iterations per property
- Unit tests use Vitest and React Testing Library
- All data loading uses static `import` — no `fetch()` calls anywhere in the codebase

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "4.2"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "3.5", "3.6"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "7.1", "7.2"] },
    { "id": 6, "tasks": ["5.5", "5.6", "7.3"] },
    { "id": 7, "tasks": ["6.1", "6.2"] },
    { "id": 8, "tasks": ["6.3", "8.1", "8.2"] },
    { "id": 9, "tasks": ["8.3", "9.1"] },
    { "id": 10, "tasks": ["9.2", "9.3"] }
  ]
}
```
