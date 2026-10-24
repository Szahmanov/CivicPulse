'use client';

/**
 * Dashboard page — Boston 311 Service Pattern Dashboard.
 *
 * Wraps the entire page in FilterProvider so all child components share
 * the same filter state. Derives filtered data, aggregations, and priority
 * cards via useMemo for efficient re-computation on filter changes.
 */

import { useEffect, useMemo, useState, Suspense } from 'react';

import {
  ALL_311_RECORDS,
  ALL_NEIGHBORHOODS,
  DATA_SNAPSHOT_DATE,
} from '@/data/loaders';
import { applyFilters } from '@/data/filters';
import {
  aggregateByNeighborhood,
  buildPriorityCards,
  MIN_GROUP_SIZE,
  sortByScore,
} from '@/data/aggregations';

import { FilterProvider, useFilterContext } from '@/components/FilterContext';
import FilterBar from '@/components/FilterBar';
import SummaryCards from '@/components/SummaryCards';
import NeighborhoodTable from '@/components/NeighborhoodTable';
import PriorityCard from '@/components/PriorityCard';
import AccessibleChart from '@/components/AccessibleChart';
import LoadingSpinner from '@/components/LoadingSpinner';

// ---------------------------------------------------------------------------
// Static derived data (never changes — computed once at module load)
// ---------------------------------------------------------------------------

const ALL_SERVICE_TOPICS: string[] = [
  ...new Set(ALL_311_RECORDS.map((r) => r.serviceTopic)),
].sort();

const ALL_DEPARTMENTS: string[] = [
  ...new Set(ALL_311_RECORDS.map((r) => r.department)),
].sort();

const CARDS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// Inner component (needs access to context)
// ---------------------------------------------------------------------------

function DashboardContent() {
  const { filters } = useFilterContext();
  const [visibleCardCount, setVisibleCardCount] = useState(CARDS_PER_PAGE);

  const filtered = useMemo(
    () => applyFilters(ALL_311_RECORDS, filters),
    [filters]
  );

  const aggregates = useMemo(
    () => aggregateByNeighborhood(filtered, ALL_NEIGHBORHOODS),
    [filtered]
  );

  const cards = useMemo(
    () => sortByScore(buildPriorityCards(filtered)),
    [filtered]
  );

  useEffect(() => {
    setVisibleCardCount(CARDS_PER_PAGE);
  }, [filters]);

  const visibleCards = cards.slice(0, visibleCardCount);
  const remainingCardCount = cards.length - visibleCards.length;

  // Derived summary stats from filtered records
  const totalCount = filtered.length;
  const openCount = filtered.filter((r) => r.status === 'open').length;
  const neighborhoodCount = new Set(filtered.map((r) => r.neighborhood)).size;
  const serviceTopicCount = new Set(filtered.map((r) => r.serviceTopic)).size;

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Boston 311 Service Pattern Dashboard
      </h1>

      {/* Source / snapshot notice */}
      <p className="text-xs text-gray-500 mb-6">
        Data: de-identified Boston 311 starter-kit extract — Snapshot: {DATA_SNAPSHOT_DATE} — Not
        an official City of Boston service
      </p>

      {/* Filter bar */}
      <FilterBar
        neighborhoods={ALL_NEIGHBORHOODS}
        serviceTopics={ALL_SERVICE_TOPICS}
        departments={ALL_DEPARTMENTS}
      />

      {/* Summary cards */}
      <SummaryCards
        totalCount={totalCount}
        openCount={openCount}
        neighborhoodCount={neighborhoodCount}
        serviceTopicCount={serviceTopicCount}
      />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mb-6 border border-yellow-300 bg-yellow-50 rounded-lg px-4 py-3 text-sm text-yellow-800">
          No 311 requests match the current filters. Try adjusting your filter criteria.
        </div>
      )}

      {/* Neighborhood table */}
      <NeighborhoodTable
        aggregates={aggregates}
        snapshotDate={DATA_SNAPSHOT_DATE}
        sourceLabel="Boston 311 starter-kit extract (de-identified)"
      />

      {/* 311 Requests by Neighborhood chart */}
      <Suspense fallback={<LoadingSpinner label="Loading chart..." />}>
        <AccessibleChart
          title="311 Requests by Neighborhood"
          data={aggregates.slice(0, 10).map((a) => ({
            label: a.neighborhood,
            value: a.totalCount,
          }))}
          sourceLabel="Boston 311 starter-kit extract (de-identified)"
          snapshotDate={DATA_SNAPSHOT_DATE}
          limitations="Saved 2026-10-18 extract, not a live feed. Not an official City of Boston service."
        />
      </Suspense>

      {/* Priority Review Cards section */}
      <section aria-label="Priority review cards">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Priority Review Cards</h2>
        <p className="text-xs text-gray-500 mb-4">
          Cards are ranked by a combination of open-case pressure, repeat patterns, and the city
          on-time field. Scores use raw counts, so larger neighborhoods may rank higher.
        </p>

        <p className="text-xs text-gray-600 mb-2">
          Groups with fewer than {MIN_GROUP_SIZE} requests in this window are not ranked.
        </p>
        <p className="text-xs text-gray-600 mb-4">
          This score is not an official city decision.
        </p>

        {cards.length === 0 && filtered.length > 0 && (
          <p className="text-sm text-gray-600">
            No priority groupings to display for the current filters.
          </p>
        )}

        {cards.length > 0 && (
          <div id="priority-review-card-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleCards.map((card) => (
              <PriorityCard
                key={`${card.neighborhood}__${card.serviceTopic}`}
                card={card}
                snapshotDate={DATA_SNAPSHOT_DATE}
              />
            ))}
          </div>
        )}

        {remainingCardCount > 0 && (
          <button
            type="button"
            aria-controls="priority-review-card-list"
            onClick={() => setVisibleCardCount((count) => count + CARDS_PER_PAGE)}
            className="mt-4 rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Show more ({Math.min(CARDS_PER_PAGE, remainingCardCount)} more)
          </button>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page (provides context wrapper)
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <FilterProvider>
      <DashboardContent />
    </FilterProvider>
  );
}
