/**
 * Pure aggregation functions for CivicPulse.
 *
 * All functions are pure: same inputs → same outputs, no I/O, no mutation,
 * no randomness, no side effects.
 */

import type { Request311, NeighborhoodAggregate, PriorityCardData } from '../types/index';
import {
  computePriorityScore,
  generatePlainExplanation,
  normalizeScoreInputs,
  type RawScoreInputs,
  type Maxima,
} from './scoring';

/** Minimum requests a neighborhood-and-topic group needs before it is ranked. */
export const MIN_GROUP_SIZE = 5;

// ---------------------------------------------------------------------------
// Neighborhood aggregation
// ---------------------------------------------------------------------------

/**
 * Aggregates 311 records by neighborhood.
 *
 * Always returns one entry per neighborhood in `allNeighborhoods`, even if
 * no records exist for that neighborhood (count will be zero).
 *
 * - `totalCount`: records in `records` for this neighborhood
 * - `openCount`: records with `status === 'open'`
 * - `topServiceTopic`: most frequent serviceTopic; alphabetical tie-break; null if no records
 */
export function aggregateByNeighborhood(
  records: Request311[],
  allNeighborhoods: string[]
): NeighborhoodAggregate[] {
  return allNeighborhoods.map((neighborhood) => {
    const neighborhoodRecords = records.filter((r) => r.neighborhood === neighborhood);

    const totalCount = neighborhoodRecords.length;
    const openCount = neighborhoodRecords.filter((r) => r.status === 'open').length;

    let topServiceTopic: string | null = null;
    if (totalCount > 0) {
      // Count frequency of each serviceTopic
      const topicCounts = new Map<string, number>();
      for (const r of neighborhoodRecords) {
        topicCounts.set(r.serviceTopic, (topicCounts.get(r.serviceTopic) ?? 0) + 1);
      }

      // Find the max frequency, then pick alphabetically first among ties
      let maxCount = 0;
      for (const count of topicCounts.values()) {
        if (count > maxCount) maxCount = count;
      }

      const topTopics = [...topicCounts.entries()]
        .filter(([, count]) => count === maxCount)
        .map(([topic]) => topic)
        .sort();

      topServiceTopic = topTopics[0];
    }

    return { neighborhood, totalCount, openCount, topServiceTopic };
  });
}

// ---------------------------------------------------------------------------
// Group statistics
// ---------------------------------------------------------------------------

/**
 * Computes raw counts for a specific neighborhood + serviceTopic group.
 * Used by the scoring pipeline.
 */
export function computeGroupStats(
  records: Request311[],
  neighborhood: string,
  serviceTopic: string
): {
  totalCount: number;
  openCount: number;
  overdueCount: number;
} {
  const groupRecords = records.filter(
    (r) => r.neighborhood === neighborhood && r.serviceTopic === serviceTopic
  );

  const totalCount = groupRecords.length;
  const openCount = groupRecords.filter((r) => r.status === 'open').length;
  const overdueCount = groupRecords.filter((r) => r.onTimeResolution === false).length;

  return { totalCount, openCount, overdueCount };
}

// ---------------------------------------------------------------------------
// Priority card pipeline
// ---------------------------------------------------------------------------

/**
 * Builds the full array of PriorityCardData from raw records.
 *
 * Pipeline:
 * 1. Find all distinct neighborhood + serviceTopic pairs with at least MIN_GROUP_SIZE records
 * 2. Compute maxima across all pairs (maxOpenCount, maxGroupCount)
 * 3. For each pair: compute stats → normalize → score → generate explanation
 * 4. Return PriorityCardData objects
 */
export function buildPriorityCards(records: Request311[]): PriorityCardData[] {
  // Step 1: find all distinct pairs with at least one record
  const pairSet = new Set<string>();
  for (const r of records) {
    pairSet.add(`${r.neighborhood}\0${r.serviceTopic}`);
  }

  const pairs = [...pairSet].map((key) => {
    const [neighborhood, serviceTopic] = key.split('\0');
    return { neighborhood, serviceTopic };
  }).filter(({ neighborhood, serviceTopic }) =>
    computeGroupStats(records, neighborhood, serviceTopic).totalCount >= MIN_GROUP_SIZE,
  );

  if (pairs.length === 0) return [];

  // Step 2: compute maxima
  let maxOpenCount = 0;
  let maxGroupCount = 0;
  const statsCache = new Map<string, ReturnType<typeof computeGroupStats>>();

  for (const { neighborhood, serviceTopic } of pairs) {
    const key = `${neighborhood}\0${serviceTopic}`;
    const stats = computeGroupStats(records, neighborhood, serviceTopic);
    statsCache.set(key, stats);
    if (stats.openCount > maxOpenCount) maxOpenCount = stats.openCount;
    if (stats.totalCount > maxGroupCount) maxGroupCount = stats.totalCount;
  }

  const maxima: Maxima = { maxOpenCount, maxGroupCount };

  // Step 3: build PriorityCardData for each pair
  const cards: PriorityCardData[] = [];

  for (const { neighborhood, serviceTopic } of pairs) {
    const key = `${neighborhood}\0${serviceTopic}`;
    const stats = statsCache.get(key)!;

    const raw: RawScoreInputs = {
      openCount: stats.openCount,
      groupCount: stats.totalCount,
      overdueCount: stats.overdueCount,
    };

    const normalizedInputs = normalizeScoreInputs(raw, maxima);
    const scoreResult = computePriorityScore(normalizedInputs);
    const plainExplanation = generatePlainExplanation(
      normalizedInputs,
      raw,
      neighborhood,
      serviceTopic
    );

    cards.push({
      neighborhood,
      serviceTopic,
      score: scoreResult.score,
      openPressure: normalizedInputs.openCasePressure,
      repeatedPressure: normalizedInputs.repeatedPressure,
      overduePressure: normalizedInputs.overduePressure,
      plainExplanation,
      openCount: stats.openCount,
      totalCount: stats.totalCount,
      overdueCount: stats.overdueCount,
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

/**
 * Returns a new array of PriorityCardData sorted in descending order by score.
 * Tie-break: alphabetically by neighborhood, then serviceTopic.
 * Does NOT mutate the input array.
 */
export function sortByScore(cards: PriorityCardData[]): PriorityCardData[] {
  return [...cards].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.neighborhood !== b.neighborhood) return a.neighborhood.localeCompare(b.neighborhood);
    return a.serviceTopic.localeCompare(b.serviceTopic);
  });
}
