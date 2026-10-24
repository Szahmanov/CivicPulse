/**
 * Preparedness page — Server Component.
 *
 * Shows historical FEMA Major Disaster Declarations for Massachusetts with
 * a prominent historical-context notice. Does NOT issue emergency alerts and
 * is NOT a live risk assessment.
 */

import { ALL_FEMA_RECORDS, DATA_SNAPSHOT_DATE } from '@/data/loaders';
import FemaDeclarationList from '@/components/FemaDeclarationList';
import DataError from '@/components/DataError';

export const metadata = {
  title: 'Preparedness — CivicPulse',
  description:
    'Historical FEMA Major Disaster Declarations for Massachusetts — civic context only.',
};

export default function PreparednessPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ------------------------------------------------------------------ */}
      {/* Historical-context notice — MUST be first visible element           */}
      {/* ------------------------------------------------------------------ */}
      <aside
        role="note"
        className="bg-amber-50 border-l-4 border-amber-400 text-amber-900 rounded-r px-4 py-3 mb-6"
      >
        <strong>Historical context only.</strong> FEMA data shown here is
        historical context only. This is{' '}
        <strong>not a live emergency alert</strong> and is not a current risk
        assessment. For current emergency information, visit{' '}
        <a
          href="https://www.mass.gov/emergency-management"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Massachusetts Emergency Management Agency website (opens in new tab)"
          className="underline underline-offset-2 font-medium hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded"
        >
          Massachusetts Emergency Management Agency
        </a>
        .
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Page heading                                                        */}
      {/* ------------------------------------------------------------------ */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Massachusetts Disaster Preparedness — Historical Context
      </h1>

      {/* ------------------------------------------------------------------ */}
      {/* Introductory paragraph                                              */}
      {/* ------------------------------------------------------------------ */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        The table below shows historical FEMA Major Disaster Declarations for
        Massachusetts, drawn from publicly available federal data. This
        information is provided as civic context for community preparedness
        planning. It does not reflect current hazard conditions and is not a
        government recommendation.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* Source and snapshot attribution                                     */}
      {/* ------------------------------------------------------------------ */}
      <p className="text-xs text-gray-500 mb-6">
        Source: OpenFEMA Disaster Declarations Summaries (v2), Massachusetts —
        Hackachusetts starter-kit extract — Snapshot:{' '}
        {DATA_SNAPSHOT_DATE}.{' '}
        <a
          href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View official FEMA OpenFEMA data (opens in new tab)"
          className="underline underline-offset-2 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          View official FEMA OpenFEMA data (opens in new tab)
        </a>
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* FEMA declarations table                                             */}
      {/* ------------------------------------------------------------------ */}
      {ALL_FEMA_RECORDS.length === 0 ? (
        <DataError message="No FEMA declaration records found in sample data." />
      ) : (
        <FemaDeclarationList
          records={ALL_FEMA_RECORDS}
          snapshotDate={DATA_SNAPSHOT_DATE}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Limitations note                                                    */}
      {/* ------------------------------------------------------------------ */}
      <p className="mt-4 text-xs text-gray-500">
        This is a saved historical extract, not a live feed. One disaster can
        appear more than once because FEMA provides one row per designated area.
        CivicPulse is not an official City of Boston service and does not issue
        emergency alerts.
      </p>
    </div>
  );
}
