/**
 * Example-based tests for the transparent, three-factor priority score.
 */
import { describe, expect, it } from 'vitest';
import {
  WEIGHT_OPEN,
  WEIGHT_OVERDUE,
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
  overdueCount: 10,
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
      overduePressure: 0.5,
    });
  });

  it('avoids division by zero', () => {
    const result = normalizeScoreInputs(
      { openCount: 0, groupCount: 0, overdueCount: 0 },
      { maxOpenCount: 0, maxGroupCount: 0 },
    );
    expect(result).toEqual({
      openCasePressure: 0,
      repeatedPressure: 0,
      overduePressure: 0,
    });
  });

  it('clamps abnormal inputs safely', () => {
    const result = normalizeScoreInputs(
      { openCount: 20, groupCount: 30, overdueCount: 30 },
      { maxOpenCount: 10, maxGroupCount: 10 },
    );
    expect(result.openCasePressure).toBe(1);
    expect(result.repeatedPressure).toBe(1);
    expect(result.overduePressure).toBe(1);
  });
});

describe('computePriorityScore', () => {
  const allZero: ScoreInputs = {
    openCasePressure: 0,
    repeatedPressure: 0,
    overduePressure: 0,
  };
  const allOne: ScoreInputs = {
    openCasePressure: 1,
    repeatedPressure: 1,
    overduePressure: 1,
  };

  it('uses three documented weights that total 100', () => {
    expect(WEIGHT_OPEN + WEIGHT_REPEATED + WEIGHT_OVERDUE).toBe(100);
  });

  it('scores the two bounds correctly', () => {
    expect(computePriorityScore(allZero).score).toBe(0);
    expect(computePriorityScore(allOne).score).toBe(100);
  });

  it('is deterministic and rounded to two decimal places', () => {
    const inputs: ScoreInputs = {
      openCasePressure: 1 / 3,
      repeatedPressure: 1 / 3,
      overduePressure: 1 / 3,
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
    overduePressure: 0.5,
  };

  it('uses the real group counts in a plain-language explanation', () => {
    const explanation = generatePlainExplanation(inputs, raw, 'Roxbury', 'Pothole');
    expect(explanation).toContain('Roxbury');
    expect(explanation).toContain('Pothole');
    expect(explanation).toContain('5 open');
    expect(explanation).toContain('20 times');
    expect(explanation).toContain('50%');
  });

  it('uses the singular case wording and reports closed groups accurately', () => {
    const explanation = generatePlainExplanation(
      inputs,
      { openCount: 1, groupCount: 2, overdueCount: 1 },
      'Allston',
      'Street Light Outage',
    );
    expect(explanation).toContain("1 open Street Light Outage case that hasn't been resolved");

    const closed = generatePlainExplanation(
      inputs,
      { openCount: 0, groupCount: 2, overdueCount: 0 },
      'Allston',
      'Street Light Outage',
    );
    expect(closed).toContain('All 2 requests in this group are closed.');
  });

  it('only describes a group as repeated when it meets the minimum group size', () => {
    const smallGroup = generatePlainExplanation(
      inputs,
      { openCount: 2, groupCount: 4, overdueCount: 1 },
      'Allston',
      'Pothole',
    );
    expect(smallGroup).not.toContain('suggesting a repeated pattern');
    expect(generatePlainExplanation(inputs, raw, 'Roxbury', 'Pothole')).toContain('suggesting a repeated pattern');
  });
});
