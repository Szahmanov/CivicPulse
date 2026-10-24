/**
 * NeighborhoodTable — server-safe component rendering a 311 request table by neighborhood.
 *
 * Features:
 *   - Caption with source and snapshot metadata
 *   - Zebra striping via Tailwind
 *   - Horizontal scroll wrapper for small screens
 *   - Zero-count rows included (one row per neighborhood)
 */

import type { NeighborhoodAggregate } from '@/types/index';

export interface NeighborhoodTableProps {
  aggregates: NeighborhoodAggregate[];
  snapshotDate: string;
  sourceLabel: string;
}

export default function NeighborhoodTable({
  aggregates,
  snapshotDate,
  sourceLabel,
}: NeighborhoodTableProps) {
  return (
    <section aria-label="311 requests by neighborhood" className="mb-8">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 bg-white">
          <caption className="sr-only">
            311 Requests by Neighborhood — Source: {sourceLabel} — Snapshot: {snapshotDate}
          </caption>
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Neighborhood
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Total Requests
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">
                Open Cases
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Top Service Topic
              </th>
            </tr>
          </thead>
          <tbody>
            {aggregates.map((agg, idx) => (
              <tr
                key={agg.neighborhood}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {agg.neighborhood}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {agg.totalCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {agg.openCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {agg.topServiceTopic ?? (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Visible caption below the table for sighted users */}
      <p className="mt-1.5 text-xs text-gray-500">
        Source: {sourceLabel} — Snapshot: {snapshotDate}
      </p>
    </section>
  );
}
