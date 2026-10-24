/**
 * Accessibility tests — Task 8.3
 *
 * Runs real axe-core audits (via vitest-axe) against isolated DOM-only
 * components and asserts zero violations using the globally-registered
 * `toHaveNoViolations` matcher (see src/test/setup.ts).
 *
 * Chart SVG rendering (Recharts) is not exercised here because jsdom does
 * not implement the canvas/layout APIs those libraries need; the chart's
 * accessibility is covered by structural assertions in AccessibleChart's
 * own test and by the sr-only data table it renders.
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';

import SummaryCards from '../SummaryCards';
import NeighborhoodTable from '../NeighborhoodTable';
import ActionBriefPanel from '../ActionBriefPanel';
import FemaDeclarationList from '../FemaDeclarationList';
import DataError from '../DataError';
import LoadingSpinner from '../LoadingSpinner';
import type {
  NeighborhoodAggregate,
  PriorityCardData,
  FemaDeclaration,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_AGGREGATES: NeighborhoodAggregate[] = [
  { neighborhood: 'Allston', totalCount: 42, openCount: 12, topServiceTopic: 'Pothole' },
  { neighborhood: 'Back Bay', totalCount: 18, openCount: 4, topServiceTopic: 'Graffiti' },
];

const MOCK_CARD: PriorityCardData = {
  neighborhood: 'Allston',
  serviceTopic: 'Pothole',
  score: 72,
  openPressure: 0.6,
  repeatedPressure: 0.4,
  onTimePressure: 0.3,
  outreachFlag: false,
  plainExplanation: 'High volume of pothole cases with delayed resolutions.',
  openCount: 12,
  totalCount: 42,
  closedCount: 30,
  onTimeCount: 20,
};

const MOCK_FEMA_RECORDS: FemaDeclaration[] = [
  {
    declarationNumber: 'DR-1234',
    disasterType: 'Flood',
    declarationDate: '2022-06-01',
    state: 'MA',
    county: 'Suffolk',
    programsActivated: ['IHP', 'PA'],
  },
  {
    declarationNumber: 'DR-5678',
    disasterType: 'Severe Storm',
    declarationDate: '2020-03-15',
    state: 'MA',
    county: null,
    programsActivated: ['PA'],
  },
];

// Tables need to live inside a landmark-free, valid document fragment. jsdom's
// default <body> is sufficient; axe runs against the rendered container.

describe('axe-core: zero violations', () => {
  it('SummaryCards has no violations', async () => {
    const { container } = render(
      <SummaryCards totalCount={10} openCount={3} neighborhoodCount={5} serviceTopicCount={4} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('NeighborhoodTable has no violations', async () => {
    const { container } = render(
      <NeighborhoodTable
        aggregates={MOCK_AGGREGATES}
        snapshotDate="2024-01-15"
        sourceLabel="Boston 311 Open Data (synthetic demo)"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ActionBriefPanel has no violations', async () => {
    const { container } = render(
      <ActionBriefPanel card={MOCK_CARD} snapshotDate="2024-01-15" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('FemaDeclarationList has no violations', async () => {
    const { container } = render(
      <FemaDeclarationList records={MOCK_FEMA_RECORDS} snapshotDate="2024-01-15" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('DataError has no violations', async () => {
    const { container } = render(<DataError message="Sample data failed validation." />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LoadingSpinner has no violations', async () => {
    const { container } = render(<LoadingSpinner label="Loading chart..." />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
