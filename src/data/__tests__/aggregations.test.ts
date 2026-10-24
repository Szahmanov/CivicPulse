/**
 * Example-based unit tests for aggregation, filter, and sort functions.
 * (Property-based tests are covered in Tasks 3.3–3.6.)
 */

import { describe, it, expect } from 'vitest';
import type { Request311, FilterState } from '../../types/index';
import { DEFAULT_FILTER_STATE, matchesFilter, applyFilters } from '../filters';
import { aggregateByNeighborhood, sortByScore } from '../aggregations';
import type { PriorityCardData } from '../../types/index';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeRecord(overrides: Partial<Request311> = {}): Request311 {
  return {
    caseId: 'A001',
    serviceTopic: 'Pothole',
    neighborhood: 'Roxbury',
    department: 'Public Works',
    status: 'open',
    submittedDate: '2024-03-15',
    closedDate: null,
    onTimeResolution: null,
    ...overrides,
  };
}

const RECORDS: Request311[] = [
  makeRecord({ caseId: 'A001', neighborhood: 'Roxbury', serviceTopic: 'Pothole', department: 'Public Works', status: 'open', submittedDate: '2024-03-10' }),
  makeRecord({ caseId: 'A002', neighborhood: 'Roxbury', serviceTopic: 'Pothole', department: 'Public Works', status: 'closed', submittedDate: '2024-04-01', closedDate: '2024-04-10', onTimeResolution: true }),
  makeRecord({ caseId: 'A003', neighborhood: 'Dorchester', serviceTopic: 'Rodent Activity', department: 'Inspectional Services', status: 'open', submittedDate: '2024-02-20' }),
  makeRecord({ caseId: 'A004', neighborhood: 'Dorchester', serviceTopic: 'Pothole', department: 'Public Works', status: 'closed', submittedDate: '2024-01-05', closedDate: '2024-01-15', onTimeResolution: false }),
  makeRecord({ caseId: 'A005', neighborhood: 'South End', serviceTopic: 'Graffiti', department: 'Public Works', status: 'open', submittedDate: '2024-05-01' }),
];

// ---------------------------------------------------------------------------
// matchesFilter / applyFilters tests
// ---------------------------------------------------------------------------

describe('matchesFilter', () => {
  it('returns true for a record against the default (empty) filter state', () => {
    expect(matchesFilter(RECORDS[0], DEFAULT_FILTER_STATE)).toBe(true);
  });

  it('returns false when neighborhood filter excludes the record', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, neighborhoods: ['Dorchester'] };
    expect(matchesFilter(RECORDS[0], filters)).toBe(false); // Roxbury
    expect(matchesFilter(RECORDS[2], filters)).toBe(true);  // Dorchester
  });

  it('returns false when serviceTopic filter excludes the record', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, serviceTopics: ['Rodent Activity'] };
    expect(matchesFilter(RECORDS[0], filters)).toBe(false); // Pothole
    expect(matchesFilter(RECORDS[2], filters)).toBe(true);  // Rodent Activity
  });

  it('returns false when department filter excludes the record', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, departments: ['Inspectional Services'] };
    expect(matchesFilter(RECORDS[0], filters)).toBe(false); // Public Works
    expect(matchesFilter(RECORDS[2], filters)).toBe(true);  // Inspectional Services
  });

  it('returns false for a closed record when caseStatus is "open"', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, caseStatus: 'open' };
    expect(matchesFilter(RECORDS[1], filters)).toBe(false); // closed
    expect(matchesFilter(RECORDS[0], filters)).toBe(true);  // open
  });

  it('returns false for an open record when caseStatus is "closed"', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, caseStatus: 'closed' };
    expect(matchesFilter(RECORDS[0], filters)).toBe(false); // open
    expect(matchesFilter(RECORDS[1], filters)).toBe(true);  // closed
  });

  it('excludes records submitted before startDate', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, startDate: '2024-03-01' };
    expect(matchesFilter(RECORDS[3], filters)).toBe(false); // 2024-01-05
    expect(matchesFilter(RECORDS[0], filters)).toBe(true);  // 2024-03-10
  });

  it('excludes records submitted after endDate', () => {
    const filters: FilterState = { ...DEFAULT_FILTER_STATE, endDate: '2024-03-31' };
    expect(matchesFilter(RECORDS[4], filters)).toBe(false); // 2024-05-01
    expect(matchesFilter(RECORDS[0], filters)).toBe(true);  // 2024-03-10
  });

  it('applies all criteria together (AND logic)', () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      neighborhoods: ['Roxbury'],
      caseStatus: 'open',
      startDate: '2024-03-01',
    };
    // A001: Roxbury, open, 2024-03-10 — passes all
    expect(matchesFilter(RECORDS[0], filters)).toBe(true);
    // A002: Roxbury, closed, 2024-04-01 — fails caseStatus
    expect(matchesFilter(RECORDS[1], filters)).toBe(false);
    // A003: Dorchester, open, 2024-02-20 — fails neighborhood and startDate
    expect(matchesFilter(RECORDS[2], filters)).toBe(false);
  });

  it('excludes records that partially match filter criteria', () => {
    // Two filters: neighborhood AND serviceTopic
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      neighborhoods: ['Roxbury'],
      serviceTopics: ['Rodent Activity'],
    };
    // RECORDS[0]: Roxbury + Pothole — fails serviceTopic
    expect(matchesFilter(RECORDS[0], filters)).toBe(false);
    // RECORDS[2]: Dorchester + Rodent Activity — fails neighborhood
    expect(matchesFilter(RECORDS[2], filters)).toBe(false);
  });
});

describe('applyFilters', () => {
  it('returns all records when filter state is default (empty)', () => {
    const result = applyFilters(RECORDS, DEFAULT_FILTER_STATE);
    expect(result).toHaveLength(RECORDS.length);
    expect(result).toEqual(RECORDS);
  });

  it('does not mutate the input array', () => {
    const original = [...RECORDS];
    applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, caseStatus: 'open' });
    expect(RECORDS).toEqual(original);
  });

  it('returns only open records when caseStatus is "open"', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, caseStatus: 'open' });
    expect(result.every((r) => r.status === 'open')).toBe(true);
    expect(result.some((r) => r.status === 'closed')).toBe(false);
  });

  it('returns only closed records when caseStatus is "closed"', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, caseStatus: 'closed' });
    expect(result.every((r) => r.status === 'closed')).toBe(true);
  });

  it('filters by neighborhood correctly', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, neighborhoods: ['Dorchester'] });
    expect(result.every((r) => r.neighborhood === 'Dorchester')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('filters by serviceTopic correctly', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, serviceTopics: ['Pothole'] });
    expect(result.every((r) => r.serviceTopic === 'Pothole')).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('filters by department correctly', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, departments: ['Inspectional Services'] });
    expect(result.every((r) => r.department === 'Inspectional Services')).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('excludes records before startDate', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, startDate: '2024-04-01' });
    expect(result.every((r) => r.submittedDate >= '2024-04-01')).toBe(true);
  });

  it('excludes records after endDate', () => {
    const result = applyFilters(RECORDS, { ...DEFAULT_FILTER_STATE, endDate: '2024-03-31' });
    expect(result.every((r) => r.submittedDate <= '2024-03-31')).toBe(true);
  });

  it('applies combined filters with AND logic', () => {
    const result = applyFilters(RECORDS, {
      ...DEFAULT_FILTER_STATE,
      neighborhoods: ['Roxbury'],
      caseStatus: 'open',
    });
    expect(result).toHaveLength(1);
    expect(result[0].caseId).toBe('A001');
  });

  it('returns an empty array when no records match', () => {
    const result = applyFilters(RECORDS, {
      ...DEFAULT_FILTER_STATE,
      neighborhoods: ['Jamaica Plain'],
    });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// aggregateByNeighborhood tests
// ---------------------------------------------------------------------------

describe('aggregateByNeighborhood', () => {
  const ALL_NEIGHBORHOODS = ['Dorchester', 'Jamaica Plain', 'Roxbury', 'South End'];

  it('returns one entry per neighborhood in allNeighborhoods', () => {
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const names = result.map((r) => r.neighborhood);
    for (const n of ALL_NEIGHBORHOODS) {
      expect(names).toContain(n);
    }
    expect(result).toHaveLength(ALL_NEIGHBORHOODS.length);
  });

  it('includes neighborhoods with zero records', () => {
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const jp = result.find((r) => r.neighborhood === 'Jamaica Plain');
    expect(jp).toBeDefined();
    expect(jp!.totalCount).toBe(0);
    expect(jp!.openCount).toBe(0);
    expect(jp!.topServiceTopic).toBeNull();
  });

  it('computes correct counts for a known neighborhood', () => {
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const roxbury = result.find((r) => r.neighborhood === 'Roxbury');
    expect(roxbury!.totalCount).toBe(2);
    expect(roxbury!.openCount).toBe(1);
  });

  it('returns the most frequent topServiceTopic', () => {
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const roxbury = result.find((r) => r.neighborhood === 'Roxbury');
    // Both records in Roxbury have 'Pothole'
    expect(roxbury!.topServiceTopic).toBe('Pothole');
  });

  it('returns null topServiceTopic when no records exist', () => {
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const jp = result.find((r) => r.neighborhood === 'Jamaica Plain');
    expect(jp!.topServiceTopic).toBeNull();
  });

  it('uses alphabetical tie-break for topServiceTopic', () => {
    // Dorchester has 1 Rodent Activity + 1 Pothole — tie; 'Pothole' < 'Rodent Activity' alphabetically
    const result = aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    const dorchester = result.find((r) => r.neighborhood === 'Dorchester');
    expect(dorchester!.topServiceTopic).toBe('Pothole');
  });

  it('does not mutate the input records array', () => {
    const original = [...RECORDS];
    aggregateByNeighborhood(RECORDS, ALL_NEIGHBORHOODS);
    expect(RECORDS).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// sortByScore tests
// ---------------------------------------------------------------------------

function makePriorityCard(overrides: Partial<PriorityCardData> = {}): PriorityCardData {
  return {
    neighborhood: 'Roxbury',
    serviceTopic: 'Pothole',
    score: 50,
    openPressure: 0.5,
    repeatedPressure: 0.5,
    onTimePressure: 0.5,
    plainExplanation: '',
    openCount: 5,
    totalCount: 10,
    closedCount: 5,
    onTimeCount: 3,
    ...overrides,
  };
}

describe('sortByScore', () => {
  it('returns cards in descending score order', () => {
    const cards = [
      makePriorityCard({ score: 40, neighborhood: 'B' }),
      makePriorityCard({ score: 90, neighborhood: 'A' }),
      makePriorityCard({ score: 60, neighborhood: 'C' }),
    ];
    const sorted = sortByScore(cards);
    expect(sorted[0].score).toBe(90);
    expect(sorted[1].score).toBe(60);
    expect(sorted[2].score).toBe(40);
  });

  it('does not mutate the original array', () => {
    const cards = [
      makePriorityCard({ score: 30 }),
      makePriorityCard({ score: 80 }),
    ];
    const originalFirst = cards[0];
    const sorted = sortByScore(cards);
    // Original array order is unchanged
    expect(cards[0]).toBe(originalFirst);
    // Sorted array is a different reference
    expect(sorted).not.toBe(cards);
  });

  it('applies alphabetical tie-break by neighborhood when scores are equal', () => {
    const cards = [
      makePriorityCard({ score: 75, neighborhood: 'Roxbury', serviceTopic: 'Pothole' }),
      makePriorityCard({ score: 75, neighborhood: 'Allston', serviceTopic: 'Graffiti' }),
      makePriorityCard({ score: 75, neighborhood: 'Dorchester', serviceTopic: 'Rodent Activity' }),
    ];
    const sorted = sortByScore(cards);
    expect(sorted[0].neighborhood).toBe('Allston');
    expect(sorted[1].neighborhood).toBe('Dorchester');
    expect(sorted[2].neighborhood).toBe('Roxbury');
  });

  it('applies alphabetical tie-break by serviceTopic when neighborhood is also equal', () => {
    const cards = [
      makePriorityCard({ score: 75, neighborhood: 'Roxbury', serviceTopic: 'Pothole' }),
      makePriorityCard({ score: 75, neighborhood: 'Roxbury', serviceTopic: 'Graffiti' }),
    ];
    const sorted = sortByScore(cards);
    expect(sorted[0].serviceTopic).toBe('Graffiti');
    expect(sorted[1].serviceTopic).toBe('Pothole');
  });

  it('handles an empty array', () => {
    expect(sortByScore([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    const cards = [makePriorityCard({ score: 55 })];
    const sorted = sortByScore(cards);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].score).toBe(55);
  });
});
