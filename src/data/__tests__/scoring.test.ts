/**
 * Example-based tests for the transparent, three-factor priority score.
 */
import { describe, expect, it } from 'vitest';
import {
  WEIGHT_OPEN,
  WEIGHT_ONTIME,
  WEIGHT_REPEATED,
  clamp,
  computePriorityScore,
  generatePlainExplanation,
  normalizeScoreInputs,
  type RawScoreInputs,
} from '../scoring';
import type { ScoreInputs } from '../../types/index';

const raw: RawScoreInputs = {
  openCount: 5,
  groupCount: 20,
  closedCount: 10,
  onTimeClosedCount: 5,
};

describe('clamp', () => {
  it('keeps values within inclusive bounds', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(2, 0, 1)).toBe(1);
  });
});

describe('normalizeScoreInputs', () => {
  it('normalizes each evidence-based factor', () => {
    const result = normalizeScoreInputs(raw, { maxOpenCount: 10, maxGroupCount: 40 });
    expect(result).toEqual({
      openCasePressure: 0.5,
      repeatedPressure: 0.5,
      onTimePressure: 0.5,
    });
  });

  it('avoids division by zero and treats no closed cases as no timing evidence', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 0, closedCount: 0, onTimeClosedCount: 0 },
      { maxOpenCount: 0, maxGroupCount: 0 },
    );
    expect(result).toEqual({
      openCasePressure: 0,
      repeatedPressure: 0,
      onTimePressure: 0,
    });
  });

  it('clamps abnormal inputs safely', () => {
    const result = normalizeScoreInputs(
      { openCount: 20, groupCount: 30, closedCount: 5, onTimeClosedCount: 0 },
      { maxOpenCount: 10, maxGroupCount: 10 },
    );
    expect(result.openCasePressure).toBe(1);
    expect(result.repeatedPressure).toBe(1);
    expect(result.onTimePressure).toBe(1);
  });
});

describe('computePriorityScore', () => {
  const allZero: ScoreInputs = {
    openCasePressure: 0,
    repeatedPressure: 0,
    onTimePressure: 0,
  };
  const allOne: ScoreInputs = {
    openCasePressure: 1,
    repeatedPressure: 1,
    onTimePressure: 1,
  };

  it('uses three documented weights that total 100', () => {
    expect(WEIGHT_OPEN + WEIGHT_REPEATED + WEIGHT_ONTIME).toBe(100);
  });

  it('scores the two bounds correctly', () => {
    expect(computePriorityScore(allZero).score).toBe(0);
    expect(computePriorityScore(allOne).score).toBe(100);
  });

  it('is deterministic and rounded to two decimal places', () => {
    const inputs: ScoreInputs = {
      openCasePressure: 1 / 3,
      repeatedPressure: 1 / 3,
      onTimePressure: 1 / 3,
    };
    const first = computePriorityScore(inputs).score;
    expect(computePriorityScore(inputs).score).toBe(first);
    expect(first).toBe(33.33);
  });
});

describe('generatePlainExplanation', () => {
  const inputs: ScoreInputs = {
    openCasePressure: 0.5,
    repeatedPressure: 0.5,
    onTimePressure: 0.5,
  };

  it('uses the real group counts in a plain-language explanation', () => {
    const explanation = generatePlainExplanation(inputs, raw, 'Roxbury', 'Pothole');
    expect(explanation).toContain('Roxbury');
    expect(explanation).toContain('Pothole');
    expect(explanation).toContain('5 open');
    expect(explanation).toContain('20 times');
    expect(explanation).toContain('50%');
  });

  it('does not imply a timing problem when no closed cases exist', () => {
    const explanation = generatePlainExplanation(
      inputs,
      { openCount: 2, groupCount: 2, closedCount: 0, onTimeClosedCount: 0 },
      'Allston',
      'Street Light Outage',
    );
    expect(explanation).toContain('no closed cases');
  });
});
