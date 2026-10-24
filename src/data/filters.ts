/**
 * Pure filter functions for 311 request records.
 *
 * All functions are pure: same inputs → same outputs, no I/O, no mutation,
 * no randomness, no side effects.
 */

import type { Request311, FilterState } from '../types/index';

// ---------------------------------------------------------------------------
// Default filter state
// ---------------------------------------------------------------------------

export const DEFAULT_FILTER_STATE: FilterState = {
  neighborhoods: [],
  serviceTopics: [],
  departments: [],
  caseStatus: 'all',
  startDate: null,
  endDate: null,
};

// ---------------------------------------------------------------------------
// Core filter functions
// ---------------------------------------------------------------------------

/**
 * Returns true if a single record satisfies all active filter criteria.
 *
 * Rules:
 * - Non-empty `neighborhoods` array: record.neighborhood must be in the array
 * - Non-empty `serviceTopics` array: record.serviceTopic must be in the array
 * - Non-empty `departments` array: record.department must be in the array
 * - `caseStatus === 'open'`: record.status must be 'open'
 * - `caseStatus === 'closed'`: record.status must be 'closed'
 * - `caseStatus === 'all'`: no restriction
 * - `startDate` set: record.submittedDate >= startDate
 * - `endDate` set: record.submittedDate <= endDate
 * - Empty arrays and null values mean "no restriction"
 */
export function matchesFilter(record: Request311, filters: FilterState): boolean {
  if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(record.neighborhood)) {
    return false;
  }

  if (filters.serviceTopics.length > 0 && !filters.serviceTopics.includes(record.serviceTopic)) {
    return false;
  }

  if (filters.departments.length > 0 && !filters.departments.includes(record.department)) {
    return false;
  }

  if (filters.caseStatus === 'open' && record.status !== 'open') {
    return false;
  }

  if (filters.caseStatus === 'closed' && record.status !== 'closed') {
    return false;
  }

  if (filters.startDate !== null && record.submittedDate < filters.startDate) {
    return false;
  }

  if (filters.endDate !== null && record.submittedDate > filters.endDate) {
    return false;
  }

  return true;
}

/**
 * Filters an array of 311 records according to the provided filter state.
 *
 * Returns a new array — does not mutate the input.
 */
export function applyFilters(records: Request311[], filters: FilterState): Request311[] {
  return records.filter((record) => matchesFilter(record, filters));
}
