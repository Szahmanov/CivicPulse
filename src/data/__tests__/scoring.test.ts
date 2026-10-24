/**
 * Unit tests for src/data/scoring.ts
 *
 * These are example-based tests covering specific inputs and edge cases.
 * Property-based tests (Property 3) are in Task 3.5.
 */

import { describe, it, expect } from 'vitest';
import {
  clamp,
  normalizeScoreInputs,
  computePriorityScore,
  generatePlainExplanation,
  WEIGHT_OPEN,
  WEIGHT_REPEATED,
  WEIGHT_ONTIME,
  WEIGHT_OUTREACH,
} from '../scoring';

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------

describe('clamp', () => {
  it('returns min when value is below the range', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('returns max when value is above the range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('passes through a value within the range unchanged', () => {
    expect(clamp(42, 0, 100)).toBe(42);
  });

  it('returns min when value equals min (boundary)', () => {
    expect(clamp(0, 0, 1)).toBe(0);
  });

  it('returns max when value equals max (boundary)', () => {
    expect(clamp(1, 0, 1)).toBe(1);
  });

  it('works with fractional bounds', () => {
    expect(clamp(0.75, 0, 1)).toBe(0.75);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-0.1, 0, 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// normalizeScoreInputs
// ---------------------------------------------------------------------------

describe('normalizeScoreInputs', () => {
  it('produces zero pressures when maxima are zero (no division by zero)', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 0, closedCount: 0, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 0, maxGroupCount: 0 }
    );
    expect(result.openCasePressure).toBe(0);
    expect(result.repeatedPressure).toBe(0);
    expect(result.onTimePressure).toBe(0);
    expect(result.outreachContextFlag).toBe(0);
  });

  it('normalises openCasePressure correctly against a non-zero maximum', () => {
    const result = normalizeScoreInputs(
      { openCount: 5, groupCount: 10, closedCount: 0, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 20 }
    );
    expect(result.openCasePressure).toBeCloseTo(0.5);
    expect(result.repeatedPressure).toBeCloseTo(0.5);
  });

  it('sets onTimePressure to 0 when closedCount is zero (absence of evidence)', () => {
    const result = normalizeScoreInputs(
      { openCount: 3, groupCount: 3, closedCount: 0, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 10 }
    );
    expect(result.onTimePressure).toBe(0);
  });

  it('computes onTimePressure as 1 - onTimeRate when closedCount > 0', () => {
    // 3 out of 4 closed on time → onTimePressure = 1 - 3/4 = 0.25
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 4, closedCount: 4, onTimeClosedCount: 3, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 10 }
    );
    expect(result.onTimePressure).toBeCloseTo(0.25);
  });

  it('sets onTimePressure to 0 when all closed cases were on time', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 5, closedCount: 5, onTimeClosedCount: 5, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 10 }
    );
    expect(result.onTimePressure).toBe(0);
  });

  it('sets onTimePressure to 1 when no closed cases were on time', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 5, closedCount: 5, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 10 }
    );
    expect(result.onTimePressure).toBe(1);
  });

  it('sets outreachContextFlag to 1 when hasOutreachFlag is true', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 0, closedCount: 0, onTimeClosedCount: 0, hasOutreachFlag: true },
      { maxOpenCount: 1, maxGroupCount: 1 }
    );
    expect(result.outreachContextFlag).toBe(1);
  });

  it('sets outreachContextFlag to 0 when hasOutreachFlag is false', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 0, closedCount: 0, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 1, maxGroupCount: 1 }
    );
    expect(result.outreachContextFlag).toBe(0);
  });

  it('clamps all outputs to [0, 1]', () => {
    // Provide counts that exceed maxima (should not happen in practice but must clamp)
    const result = normalizeScoreInputs(
      { openCount: 20, groupCount: 30, closedCount: 5, onTimeClosedCount: 0, hasOutreachFlag: false },
      { maxOpenCount: 10, maxGroupCount: 10 }
    );
    expect(result.openCasePressure).toBe(1);
    expect(result.repeatedPressure).toBe(1);
    expect(result.onTimePressure).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computePriorityScore
// ---------------------------------------------------------------------------

describe('computePriorityScore', () => {
  const allZero: import('../scoring').ScoreInputs = {
    openCasePressure: 0,
    repeatedPressure: 0,
    onTimePressure: 0,
    outreachContextFlag: 0,
  };

  const allOne: import('../scoring').ScoreInputs = {
    openCasePressure: 1,
    repeatedPressure: 1,
    onTimePressure: 1,
    outreachContextFlag: 1,
  };

  it('returns a score of 0 for all-zero inputs', () => {
    expect(computePriorityScore(allZero).score).toBe(0);
  });

  it('returns a score of 100 for all-maximum inputs', () => {
    // WEIGHT_OPEN + WEIGHT_REPEATED + WEIGHT_ONTIME + WEIGHT_OUTREACH = 100
    expect(WEIGHT_OPEN + WEIGHT_REPEATED + WEIGHT_ONTIME + WEIGHT_OUTREACH).toBe(100);
    expect(computePriorityScore(allOne).score).toBe(100);
  });

  it('is deterministic — same inputs always produce the same score', () => {
    const inputs: import('../scoring').ScoreInputs = {
      openCasePressure: 0.6,
      repeatedPressure: 0.4,
      onTimePressure: 0.8,
      outreachContextFlag: 1,
    };
    const first = computePriorityScore(inputs).score;
    const second = computePriorityScore(inputs).score;
    expect(first).toBe(second);
  });

  it('score is in [0, 100]', () => {
    const inputs: import('../scoring').ScoreInputs = {
      openCasePressure: 0.5,
      repeatedPressure: 0.5,
      onTimePressure: 0.5,
      outreachContextFlag: 0,
    };
    const { score } = computePriorityScore(inputs);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('outreachContextFlag=1 adds exactly 10 points over outreachContextFlag=0', () => {
    const base: import('../scoring').ScoreInputs = {
      openCasePressure: 0.5,
      repeatedPressure: 0.4,
      onTimePressure: 0.6,
      outreachContextFlag: 0,
    };
    const withFlag: import('../scoring').ScoreInputs = { ...base, outreachContextFlag: 1 };
    const diff = computePriorityScore(withFlag).score - computePriorityScore(base).score;
    expect(diff).toBeCloseTo(WEIGHT_OUTREACH);
  });

  it('result includes the original inputs reference', () => {
    const inputs: import('../scoring').ScoreInputs = {
      openCasePressure: 0.3,
      repeatedPressure: 0.3,
      onTimePressure: 0.3,
      outreachContextFlag: 0,
    };
    const result = computePriorityScore(inputs);
    expect(result.inputs).toBe(inputs);
    expect(result.normalizedInputs).toBe(inputs);
  });

  it('score is rounded to at most 2 decimal places', () => {
    const inputs: import('../scoring').ScoreInputs = {
      openCasePressure: 1 / 3,
      repeatedPressure: 1 / 3,
      onTimePressure: 1 / 3,
      outreachContextFlag: 0,
    };
    const { score } = computePriorityScore(inputs);
    // Must not have more than 2 decimal digits of precision
    const decimalPart = score.toString().split('.')[1] ?? '';
    expect(decimalPart.length).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// generatePlainExplanation
// ---------------------------------------------------------------------------

describe('generatePlainExplanation', () => {
  const baseInputs: import('../scoring').ScoreInputs = {
    openCasePressure: 0.5,
    repeatedPressure: 0.5,
    onTimePressure: 0.5,
    outreachContextFlag: 0,
  };

  const baseRaw: import('../scoring').RawScoreInputs = {
    openCount: 5,
    groupCount: 20,
    closedCount: 10,
    onTimeClosedCount: 5,
    hasOutreachFlag: false,
  };

  it('returns a non-empty string', () => {
    const explanation = generatePlainExplanation(baseInputs, baseRaw, 'Dorchester', 'Pothole');
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(0);
  });

  it('contains the neighborhood name', () => {
    const explanation = generatePlainExplanation(baseInputs, baseRaw, 'South Boston', 'Pothole');
    expect(explanation).toContain('South Boston');
  });

  it('contains the service topic', () => {
    const explanation = generatePlainExplanation(baseInputs, baseRaw, 'Dorchester', 'Graffiti');
    expect(explanation).toContain('Graffiti');
  });

  it('contains "outreach" or "environmental" when hasOutreachFlag is true', () => {
    const flaggedInputs: import('../scoring').ScoreInputs = { ...baseInputs, outreachContextFlag: 1 };
    const flaggedRaw: import('../scoring').RawScoreInputs = { ...baseRaw, hasOutreachFlag: true };
    const explanation = generatePlainExplanation(flaggedInputs, flaggedRaw, 'Roxbury', 'Trash');
    const lower = explanation.toLowerCase();
    expect(lower.includes('outreach') || lower.includes('environmental')).toBe(true);
  });

  it('does NOT contain "profile individual" when hasOutreachFlag is false', () => {
    const explanation = generatePlainExplanation(baseInputs, baseRaw, 'Dorchester', 'Pothole');
    expect(explanation).not.toContain('profile individual');
  });

  it('mentions the outreach caveat about individual residents when flag is set', () => {
    const flaggedInputs: import('../scoring').ScoreInputs = { ...baseInputs, outreachContextFlag: 1 };
    const flaggedRaw: import('../scoring').RawScoreInputs = { ...baseRaw, hasOutreachFlag: true };
    const explanation = generatePlainExplanation(flaggedInputs, flaggedRaw, 'Roxbury', 'Noise');
    // Should include aggregate caveat
    expect(explanation.toLowerCase()).toContain('individual');
  });
});
