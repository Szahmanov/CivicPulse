/**
 * Priority-score functions for CivicPulse.
 *
 * All functions are pure: same inputs → same outputs, no I/O, no mutation,
 * no randomness, no side effects.
 */

import type { ScoreInputs, ScoreResult } from '../types/index';

// ---------------------------------------------------------------------------
// Raw input and maxima interfaces
// ---------------------------------------------------------------------------

export interface RawScoreInputs {
  openCount: number;         // raw count of open cases in this group
  groupCount: number;        // raw count of all requests in this group (for repeat pressure)
  overdueCount: number;      // all requests marked overdue by the city on-time field
}

export interface Maxima {
  maxOpenCount: number;   // max openCount across all groups in the current view
  maxGroupCount: number;  // max groupCount across all groups
}

// ---------------------------------------------------------------------------
// Weight constants
// ---------------------------------------------------------------------------

export const WEIGHT_OPEN = 40;
export const WEIGHT_REPEATED = 35;
export const WEIGHT_OVERDUE = 25;

/** Rounds a normalised value to the whole percentage displayed in the UI. */
export function toWholePercent(value: number): number {
  return Math.round(value * 100);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Clamps `value` to the inclusive range [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Core scoring functions
// ---------------------------------------------------------------------------

/**
 * Converts raw counts into normalised ScoreInputs (all values in [0, 1]).
 *
 * Rules:
 *  - openCasePressure   = raw.openCount  / max(maxima.maxOpenCount, 1)
 *  - repeatedPressure   = raw.groupCount / max(maxima.maxGroupCount, 1)
 *  - overduePressure    = raw.overdueCount / max(raw.groupCount, 1)
 *                         using every request in the group whose city on-time
 *                         field is explicitly `false`
 *
 * All outputs are clamped to [0, 1].
 */
export function normalizeScoreInputs(
  raw: RawScoreInputs,
  maxima: Maxima
): ScoreInputs {
  const openCasePressure = clamp(
    raw.openCount / Math.max(maxima.maxOpenCount, 1),
    0,
    1
  );

  const repeatedPressure = clamp(
    raw.groupCount / Math.max(maxima.maxGroupCount, 1),
    0,
    1
  );

  const overduePressure = clamp(
    raw.overdueCount / Math.max(raw.groupCount, 1),
    0,
    1,
  );

  return {
    openCasePressure,
    repeatedPressure,
    overduePressure,
  };
}

/**
 * Computes a priority score from pre-normalised ScoreInputs.
 *
 * Formula:
 *   rawScore = openCasePressure * 40
 *            + repeatedPressure * 35
 *            + overduePressure  * 25
 *   score = clamp(rawScore, 0, 100), rounded to 2 decimal places
 *
 * The `inputs` and `normalizedInputs` fields of the returned ScoreResult
 * both reference the same object — the caller is responsible for normalisation
 * before calling this function.
 */
export function computePriorityScore(inputs: ScoreInputs): ScoreResult {
  const rawScore =
    inputs.openCasePressure * WEIGHT_OPEN +
    inputs.repeatedPressure * WEIGHT_REPEATED +
    inputs.overduePressure * WEIGHT_OVERDUE;

  const score = Math.round(clamp(rawScore, 0, 100) * 100) / 100;

  return {
    score,
    inputs,
    normalizedInputs: inputs,
  };
}

// ---------------------------------------------------------------------------
// Plain-language explanation
// ---------------------------------------------------------------------------

/**
 * Generates a human-readable, jargon-free explanation for a Priority Card.
 *
 * Uses raw counts for concrete numbers and the ScoreInputs to determine
 * which components are worth highlighting.
 */
export function generatePlainExplanation(
  inputs: ScoreInputs,
  raw: RawScoreInputs,
  neighborhood: string,
  serviceTopic: string
): string {
  const overduePercent = toWholePercent(
    raw.overdueCount / Math.max(raw.groupCount, 1),
  );

  const parts: string[] = [];

  // Open cases sentence
  if (raw.openCount === 0) {
    parts.push(`All ${raw.groupCount} requests in this group are closed.`);
  } else if (raw.openCount === 1) {
    parts.push(
      `In ${neighborhood}, there is 1 open ${serviceTopic} case that hasn't been resolved yet.`,
    );
  } else {
    parts.push(
      `In ${neighborhood}, there are ${raw.openCount} open ${serviceTopic} cases that haven't been resolved yet.`,
    );
  }

  // Repeated pattern sentence
  if (raw.groupCount >= 5) {
    parts.push(
      `This type of request has come up ${raw.groupCount} times in this area, ` +
        `suggesting a repeated pattern.`
    );
  }

  // Overdue city on-time-field sentence
  if (raw.overdueCount > 0) {
    parts.push(
      `${raw.overdueCount} of ${raw.groupCount} requests (${overduePercent}%) are marked overdue by the city on-time field.`,
    );
  } else {
    parts.push(`No requests in this group are marked overdue by the city on-time field.`);
  }

  return parts.join(' ');
}
