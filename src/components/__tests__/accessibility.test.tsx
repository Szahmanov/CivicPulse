/**
 * Accessibility tests — Task 8.3
 *
 * Verifies structural ARIA accessibility of isolated components.
 * Uses manual structural assertions (role, aria-* attributes, semantic HTML)
 * rather than axe-core, which is incompatible with jsdom's missing canvas API.
 *
 * Components tested:
 *   - SummaryCards
 *   - NeighborhoodTable
 *   - ActionBriefPanel
 *   - FemaDeclarationList
 *   - DataError
 *   - LoadingSpinner
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

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
// Test fixtures
// ---------------------------------------------------------------------------

const MOCK_AGGREGATES: NeighborhoodAggregate[] = [
  {
    neighborhood: 'Allston',
    totalCount: 42,
    openCount: 12,
    topServiceTopic: 'Pothole',
  },
  {
    neighborhood: 'Back Bay',
    totalCount: 18,
    openCount: 4,
    topServiceTopic: 'Graffiti',
  },
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

// ---------------------------------------------------------------------------
// SummaryCards
// ---------------------------------------------------------------------------

describe('SummaryCards — accessibility', () => {
  it('has aria-label on each metric card article', () => {
    render(
      <SummaryCards
        totalCount={10}
        openCount={3}
        neighborhoodCount={5}
        serviceTopicCount={4}
      />
    );
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(4);
    articles.forEach((article) => {
      expect(article).toHaveAttribute('aria-label');
      expect(article.getAttribute('aria-label')).not.toBe('');
    });
  });

  it('displays numeric values for screen readers', () => {
    render(
      <SummaryCards
        totalCount={10}
        openCount={3}
        neighborhoodCount={5}
        serviceTopicCount={4}
      />
    );
    // aria-hidden="true" is on the visual numbers; labels carry the accessible name
    const articles = screen.getAllByRole('article');
    const labels = articles.map((a) => a.getAttribute('aria-label') ?? '');
    expect(labels.some((l) => l.includes('10'))).toBe(true);
    expect(labels.some((l) => l.includes('3'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NeighborhoodTable
// ---------------------------------------------------------------------------

describe('NeighborhoodTable — accessibility', () => {
  it('has scope="col" on all header cells', () => {
    const { container } = render(
      <NeighborhoodTable
        aggregates={MOCK_AGGREGATES}
        snapshotDate="2024-01-15"
        sourceLabel="Boston 311 Open Data (synthetic demo)"
      />
    );
    const ths = container.querySelectorAll('thead th');
    expect(ths.length).toBeGreaterThan(0);
    ths.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('has a sr-only <caption> with source metadata', () => {
    const { container } = render(
      <NeighborhoodTable
        aggregates={MOCK_AGGREGATES}
        snapshotDate="2024-01-15"
        sourceLabel="Boston 311 Open Data (synthetic demo)"
      />
    );
    const caption = container.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toMatch(/311 Requests by Neighborhood/i);
    expect(caption!.textContent).toMatch(/2024-01-15/);
  });

  it('wraps table in overflow-x-auto container', () => {
    const { container } = render(
      <NeighborhoodTable
        aggregates={MOCK_AGGREGATES}
        snapshotDate="2024-01-15"
        sourceLabel="Boston 311 Open Data (synthetic demo)"
      />
    );
    const wrapper = container.querySelector('.overflow-x-auto');
    expect(wrapper).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ActionBriefPanel
// ---------------------------------------------------------------------------

describe('ActionBriefPanel — accessibility', () => {
  it('has a <dl> definition list with dt/dd pairs', () => {
    const { container } = render(
      <ActionBriefPanel card={MOCK_CARD} snapshotDate="2024-01-15" />
    );
    expect(container.querySelector('dl')).not.toBeNull();
    expect(container.querySelectorAll('dt').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('dd').length).toBeGreaterThan(0);
  });

  it('has a heading for the Action Brief', () => {
    render(<ActionBriefPanel card={MOCK_CARD} snapshotDate="2024-01-15" />);
    expect(screen.getByRole('heading', { name: /Action Brief/i })).toBeInTheDocument();
  });

  it('dt count equals dd count (paired definition terms)', () => {
    const { container } = render(
      <ActionBriefPanel card={MOCK_CARD} snapshotDate="2024-01-15" />
    );
    const dts = container.querySelectorAll('dt');
    const dds = container.querySelectorAll('dd');
    expect(dts.length).toBe(dds.length);
  });
});

// ---------------------------------------------------------------------------
// FemaDeclarationList
// ---------------------------------------------------------------------------

describe('FemaDeclarationList — accessibility', () => {
  it('has scope="col" on all header cells', () => {
    const { container } = render(
      <FemaDeclarationList
        records={MOCK_FEMA_RECORDS}
        snapshotDate="2024-01-15"
      />
    );
    const ths = container.querySelectorAll('thead th');
    expect(ths.length).toBeGreaterThan(0);
    ths.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('has a sr-only <caption> with source metadata', () => {
    const { container } = render(
      <FemaDeclarationList
        records={MOCK_FEMA_RECORDS}
        snapshotDate="2024-01-15"
      />
    );
    const caption = container.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption!.textContent).toMatch(/FEMA/i);
    expect(caption!.textContent).toMatch(/2024-01-15/);
  });

  it('renders a row for each record', () => {
    const { container } = render(
      <FemaDeclarationList
        records={MOCK_FEMA_RECORDS}
        snapshotDate="2024-01-15"
      />
    );
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(MOCK_FEMA_RECORDS.length);
  });
});

// ---------------------------------------------------------------------------
// DataError
// ---------------------------------------------------------------------------

describe('DataError — accessibility', () => {
  it('has role="alert"', () => {
    render(<DataError message="Test error message" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(<DataError message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays the default title when none provided', () => {
    render(<DataError message="Some error" />);
    expect(screen.getByText('Data could not be loaded')).toBeInTheDocument();
  });

  it('accepts a custom title', () => {
    render(<DataError title="Custom Error Title" message="Some error" />);
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('displays the recovery hint', () => {
    render(<DataError message="Some error" />);
    expect(
      screen.getByText(/CivicPulse uses local sample data only/i)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LoadingSpinner
// ---------------------------------------------------------------------------

describe('LoadingSpinner — accessibility', () => {
  it('has role="status"', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-busy="true"', () => {
    render(<LoadingSpinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-label matching the label prop', () => {
    render(<LoadingSpinner label="Loading chart..." />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading chart...');
  });

  it('renders visible label text', () => {
    render(<LoadingSpinner label="Loading chart..." />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('SVG spinner has aria-hidden="true" (decorative)', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses default label "Loading..." when no prop given', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
