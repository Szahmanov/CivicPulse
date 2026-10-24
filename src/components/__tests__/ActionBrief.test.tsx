import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActionBriefPanel from '../ActionBriefPanel';
import {
  validateWhyReviewWarranted,
  containsForbiddenPhrase,
} from '@/utils/validateActionBrief';
import type { PriorityCardData } from '@/types/index';

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
const mockCard: PriorityCardData = {
  neighborhood: 'Roxbury',
  serviceTopic: 'Pothole',
  score: 72,
  openPressure: 0.8,
  repeatedPressure: 0.7,
  overduePressure: 0.6,
  plainExplanation: 'In Roxbury, there are 5 open Pothole cases.',
  openCount: 5,
  totalCount: 20,
  overdueCount: 5,
};

// ---------------------------------------------------------------------------
// Group 1: validateWhyReviewWarranted
// ---------------------------------------------------------------------------
describe('validateWhyReviewWarranted', () => {
  it('does not throw for safe review text', () => {
    expect(() =>
      validateWhyReviewWarranted(
        'Human review can help verify whether the pattern is ongoing'
      )
    ).not.toThrow();
  });

  it('throws for text containing "enforcement"', () => {
    expect(() =>
      validateWhyReviewWarranted('This requires enforcement action')
    ).toThrow();
  });

  it('throws for text containing "eligibility"', () => {
    expect(() =>
      validateWhyReviewWarranted('Determine eligibility for services')
    ).toThrow();
  });

  it('throws for text containing "benefit"', () => {
    expect(() =>
      validateWhyReviewWarranted('Grant benefit to residents')
    ).toThrow();
  });

  it('throws for text containing "emergency response"', () => {
    expect(() =>
      validateWhyReviewWarranted('Trigger emergency response now')
    ).toThrow();
  });

  it('is case-insensitive', () => {
    expect(() =>
      validateWhyReviewWarranted('ENFORCEMENT required')
    ).toThrow();
  });

  it('containsForbiddenPhrase returns true for forbidden text', () => {
    expect(containsForbiddenPhrase('This requires legal action')).toBe(true);
  });

  it('containsForbiddenPhrase returns false for safe text', () => {
    expect(
      containsForbiddenPhrase('Human review can help verify the pattern')
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Group 2: ActionBriefPanel rendering
// ---------------------------------------------------------------------------
describe('ActionBriefPanel rendering', () => {
  const snapshotDate = '2024-03-15';

  it('renders "What the data shows" field', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(
      screen.getByText('In Roxbury, there are 5 open Pothole cases.')
    ).toBeInTheDocument();
  });

  it('renders "Why review this" field', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    const dt = screen.getByText('Why review this');
    expect(dt).toBeInTheDocument();
    // The sibling dd should be non-empty
    const dd = dt.closest('div')?.querySelector('dd');
    expect(dd?.textContent?.trim()).not.toBe('');
  });

  it('renders data source field', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(screen.getByText(/Boston 311 starter-kit extract/i)).toBeInTheDocument();
  });

  it('renders snapshot date', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(screen.getByText(snapshotDate)).toBeInTheDocument();
  });

  it('renders limitations disclaimer', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(
      screen.getByText(/not an official City of Boston service/i)
    ).toBeInTheDocument();
  });

  it('limitations text contains "enforcement, benefit, emergency, or eligibility"', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(
      screen.getByText(
        /enforcement, benefit, emergency, or eligibility decisions/i
      )
    ).toBeInTheDocument();
  });

  it('whyReviewWarranted does not contain "enforce"', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    const dt = screen.getByText('Why review this');
    const dd = dt.closest('div')?.querySelector('dd');
    expect(dd?.textContent).not.toMatch(/\benforce/i);
  });

  it('whyReviewWarranted does not contain "eligib"', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    const dt = screen.getByText('Why review this');
    const dd = dt.closest('div')?.querySelector('dd');
    expect(dd?.textContent).not.toMatch(/eligib/i);
  });

  it('renders Action Brief heading', () => {
    render(<ActionBriefPanel card={mockCard} snapshotDate={snapshotDate} />);
    expect(
      screen.getByRole('heading', { name: 'Action Brief' })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Group 3: validateWhyReviewWarranted on the generated string used in ActionBriefPanel
// ---------------------------------------------------------------------------
describe('generated reviewRationale passes validation', () => {
  it('generated reviewRationale passes validation', () => {
    const reviewRationale = `This combination of Roxbury + Pothole has a score of 72/100. Human review can help verify whether the pattern is ongoing and whether resources are being directed appropriately.`;
    expect(() => validateWhyReviewWarranted(reviewRationale)).not.toThrow();
  });
});
