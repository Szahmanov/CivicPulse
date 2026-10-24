/**
 * Property-based tests for the deterministic CivicPulse data pipeline.
 *
 * These tests generate 100+ input variations per property. They complement
 * example-based tests by checking invariants that must hold for any valid
 * collection of service requests, filters, score inputs, or review cards.
 */

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { FilterState, PriorityCardData, Request311, ScoreInputs } from '../../types/index';
import { aggregateByNeighborhood, sortByScore } from '../aggregations';
import { applyFilters, matchesFilter } from '../filters';
import { computePriorityScore, normalizeScoreInputs, type RawScoreInputs } from '../scoring';

const neighborhoods = ['Allston', 'Dorchester', 'Roxbury', 'South End'];
const topics = ['Graffiti Removal', 'Pothole', 'Rodent Activity'];
const departments = ['Inspectional Services', 'Public Works'];

const dateArbitrary = fc
  .tuple(fc.integer({ min: 1, max: 12 }), fc.integer({ min: 1, max: 28 }))
  .map(([month, day]) => `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

const requestArbitrary: fc.Arbitrary<Request311> = fc.record({
  caseId: fc.uuid(),
  serviceTopic: fc.constantFrom(...topics),
  neighborhood: fc.constantFrom(...neighborhoods),
  department: fc.constantFrom(...departments),
  status: fc.constantFrom<'open' | 'closed'>('open', 'closed'),
  submittedDate: dateArbitrary,
  closedDate: fc.constant(null),
  onTimeResolution: fc.constantFrom<boolean | null>(true, false, null),
});

const scoreInputsArbitrary: fc.Arbitrary<ScoreInputs> = fc.record({
  openCasePressure: fc.double({ min: 0, max: 1, noNaN: true }),
  repeatedPressure: fc.double({ min: 0, max: 1, noNaN: true }),
  overduePressure: fc.double({ min: 0, max: 1, noNaN: true }),
});

const rawScoreInputsArbitrary: fc.Arbitrary<RawScoreInputs> = fc.record({
  openCount: fc.integer({ min: 0, max: 1_000 }),
  groupCount: fc.integer({ min: 0, max: 1_000 }),
  overdueCount: fc.integer({ min: 0, max: 1_000 }),
});

const priorityCardArbitrary: fc.Arbitrary<PriorityCardData> = fc.record({
  neighborhood: fc.constantFrom(...neighborhoods),
  serviceTopic: fc.constantFrom(...topics),
  score: fc.integer({ min: -100, max: 200 }),
  openPressure: fc.double({ min: 0, max: 1, noNaN: true }),
  repeatedPressure: fc.double({ min: 0, max: 1, noNaN: true }),
  overduePressure: fc.double({ min: 0, max: 1, noNaN: true }),
  plainExplanation: fc.string(),
  openCount: fc.integer({ min: 0, max: 100 }),
  totalCount: fc.integer({ min: 0, max: 100 }),
  overdueCount: fc.integer({ min: 0, max: 100 }),
});

function filtersFor(records: Request311[], choices: boolean[]): FilterState {
  const first = records[0];

  return {
    neighborhoods: choices[0] && first ? [first.neighborhood] : [],
    serviceTopics: choices[1] && first ? [first.serviceTopic] : [],
    departments: choices[2] && first ? [first.department] : [],
    caseStatus: choices[3] ? 'open' : 'all',
    startDate: choices[4] && first ? first.submittedDate : null,
    endDate: choices[5] && first ? first.submittedDate : null,
  };
}

describe('property-based invariants', () => {
  // Feature: civicpulse, Property 1: aggregation correctness
  it('keeps every input record accounted for and preserves zero-count neighborhoods', () => {
    fc.assert(
      fc.property(fc.array(requestArbitrary, { minLength: 1, maxLength: 60 }), (records) => {
        const allNeighborhoods = [...new Set(records.map((record) => record.neighborhood)), 'Unused Neighborhood'];
        const result = aggregateByNeighborhood(records, allNeighborhoods);

        expect(result.map((entry) => entry.neighborhood)).toEqual(allNeighborhoods);
        expect(result.reduce((sum, entry) => sum + entry.totalCount, 0)).toBe(records.length);

        for (const entry of result) {
          const matching = records.filter((record) => record.neighborhood === entry.neighborhood);
          expect(entry.totalCount).toBe(matching.length);
          expect(entry.openCount).toBe(matching.filter((record) => record.status === 'open').length);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: civicpulse, Property 2: filter completeness
  it('returns every and only record that matches all active filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(requestArbitrary, { minLength: 0, maxLength: 60 }),
        fc.array(fc.boolean(), { minLength: 6, maxLength: 6 }),
        (records, choices) => {
          const filters = filtersFor(records, choices);
          const result = applyFilters(records, filters);
          const expected = records.filter((record) => matchesFilter(record, filters));

          expect(result).toEqual(expected);
          expect(result.every((record) => matchesFilter(record, filters))).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: civicpulse, Property 3: score determinism and boundedness
  it('always normalizes safely and produces the same bounded score for the same inputs', () => {
    fc.assert(
      fc.property(
        rawScoreInputsArbitrary,
        fc.integer({ min: 0, max: 1_000 }),
        fc.integer({ min: 0, max: 1_000 }),
        scoreInputsArbitrary,
        (raw, maxOpenCount, maxGroupCount, inputs) => {
          const normalized = normalizeScoreInputs(raw, { maxOpenCount, maxGroupCount });
          expect(normalized.openCasePressure).toBeGreaterThanOrEqual(0);
          expect(normalized.openCasePressure).toBeLessThanOrEqual(1);
          expect(normalized.repeatedPressure).toBeGreaterThanOrEqual(0);
          expect(normalized.repeatedPressure).toBeLessThanOrEqual(1);
          expect(normalized.overduePressure).toBeGreaterThanOrEqual(0);
          expect(normalized.overduePressure).toBeLessThanOrEqual(1);

          const first = computePriorityScore(inputs).score;
          const second = computePriorityScore(inputs).score;
          expect(first).toBe(second);
          expect(first).toBeGreaterThanOrEqual(0);
          expect(first).toBeLessThanOrEqual(100);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: civicpulse, Property 4: priority-card sort order
  it('sorts cards by non-increasing score without mutating the input array', () => {
    fc.assert(
      fc.property(fc.array(priorityCardArbitrary, { minLength: 0, maxLength: 60 }), (cards) => {
        const original = [...cards];
        const sorted = sortByScore(cards);

        expect(cards).toEqual(original);
        expect(sorted).toHaveLength(cards.length);
        expect(sorted.every((card, index) => index === 0 || sorted[index - 1].score >= card.score)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
