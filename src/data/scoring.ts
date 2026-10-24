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
  closedCount: number;       // raw count of closed cases in this group
  onTimeClosedCount: number; // raw count of closed cases resolved on time
  hasOutreachFlag: boolean;  // from EJOutreachContext
}

export interface Maxima {
  maxOpenCount: number;   // max openCount across all groups in the current view
  maxGroupCount: number;  // max groupCount across all groups
}

// ---------------------------------------------------------------------------
// Weight constants
// ---------------------------------------------------------------------------

export const WEIGHT_OPEN = 35;
export const WEIGHT_REPEATED = 30;
export const WEIGHT_ONTIME = 25;
export const WEIGHT_OUTREACH = 10;

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
 *  - onTimePressure     = 1 − (raw.onTimeClosedCount / max(raw.closedCount, 1))
 *                         but 0 when raw.closedCount === 0 (absence of evidence
 *                         is not evidence of failure)
 *  - outreachContextFlag = raw.hasOutreachFlag ? 1 : 0
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

  const onTimePressure =
    raw.closedCount === 0
      ? 0
      : clamp(
          1 - raw.onTimeClosedCount / Math.max(raw.closedCount, 1),
          0,
          1
        );

  const outreachContextFlag: 0 | 1 = raw.hasOutreachFlag ? 1 : 0;

  return {
    openCasePressure,
    repeatedPressure,
    onTimePressure,
    outreachContextFlag,
  };
}

/**
 * Computes a priority score from pre-normalised ScoreInputs.
 *
 * Formula:
 *   rawScore = openCasePressure * 35
 *            + repeatedPressure * 30
 *            + onTimePressure   * 25
 *            + outreachContextFlag * 10
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
    inputs.onTimePressure * WEIGHT_ONTIME +
    inputs.outreachContextFlag * WEIGHT_OUTREACH;

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
  const onTimeRate =
    raw.closedCount > 0
      ? Math.round(
          (raw.onTimeClosedCount / raw.closedCount) * 100
        )
      : null;

  const latePercent = onTimeRate !== null ? 100 - onTimeRate : null;

  const parts: string[] = [];

  // Open cases sentence
  parts.push(
    `In ${neighborhood}, there are ${raw.openCount} open ${serviceTopic} ` +
      `case${raw.openCount !== 1 ? 's' : ''} that haven't been resolved yet.`
  );

  // Repeated pattern sentence
  if (raw.groupCount > 1) {
    parts.push(
      `This type of request has come up ${raw.groupCount} times in this area, ` +
        `suggesting a repeated pattern.`
    );
  }

  // On-time resolution sentence
  if (latePercent !== null && latePercent > 0) {
    parts.push(
      `Of the cases that were closed, ${latePercent}% were resolved later than expected.`
    );
  } else if (raw.closedCount === 0) {
    parts.push(`There are no closed cases to evaluate resolution timing.`);
  } else {
    parts.push(`All closed cases in this area were resolved on time.`);
  }

  // Outreach flag caveat
  if (inputs.outreachContextFlag === 1) {
    parts.push(
      `This neighborhood is also associated with aggregate environmental justice ` +
        `outreach context — this reflects neighborhood-level data only and does not ` +
        `profile any individual resident.`
    );
  }

  return parts.join(' ');
}
